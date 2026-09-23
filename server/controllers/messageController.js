import User from "../models/User.js";
import Message from "../models/message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { isDBConnected } from "../lib/db.js";

// Get all users except logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessages = {};
    await Promise.all(
      (filteredUsers || []).map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false
        });
        if (count > 0) unseenMessages[user._id] = count;
      })
    );

    res.status(200).json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.error("getUsersForSidebar error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// Mark all messages as seen from one user
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      {
        $or: [
          { senderId: id, receiverId, seen: false },
          { _id: id, receiverId, seen: false },
          { _id: id, seen: false }
        ]
      },
      { seen: true }
    );

    res.status(200).json({ success: true, message: "Messages marked as seen" });
  } catch (error) {
    console.error("markMessagesAsSeen error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = null;
    if (image) {
      if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(image, { folder: "chat_app" });
          imageUrl = uploadResponse.secure_url;
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed, using direct image data:", uploadErr.message);
          imageUrl = image;
        }
      } else {
        imageUrl = image;
      }
    }

    const newMessage = await Message.create({
      text,
      image: imageUrl,
      senderId,
      receiverId,
      seen: false
    });

    // Emit socket event to receiver if online
    if (io) {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    // In demo mode (DB offline), if chatting with a dummy user, simulate a quick reply
    if (!isDBConnected()) {
      const dummyIds = [
        "680f50aaf10f3cd28382ecf2",
        "680f50e4f10f3cd28382ecf9",
        "680f510af10f3cd28382ed01",
        "680f5137f10f3cd28382ed10",
        "680f516cf10f3cd28382ed11"
      ];
      if (dummyIds.includes(String(receiverId))) {
        setTimeout(async () => {
          const botReplies = [
            "Hey! Thanks for pinging me, got your message!",
            "Great to hear from you! PingMe is working smoothly.",
            "Awesome! Everything is looking good here.",
            "Hello! Let's catch up more later.",
            "Received! Let me know if you need any help."
          ];
          const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
          const replyMsg = await Message.create({
            text: randomReply,
            image: null,
            senderId: receiverId,
            receiverId: senderId,
            seen: false
          });
          if (io) {
            const senderSocketId = userSocketMap[senderId];
            if (senderSocketId) {
              io.to(senderSocketId).emit("newMessage", replyMsg);
            }
          }
        }, 1200);
      }
    }

    res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};
