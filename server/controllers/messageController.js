// import User from "../models/User.js";
// import Message from "../models/Message.js";
// import cloudinary from "../lib/cloudinary.js";
// import { io, userSocketMap } from "../server.js" 

// //get all users except the looged in user
// export const getUsersForSidebar = async (req, res) => {
//   try{
//     const userId = req.user._id; // Assuming user ID is stored in req.user
//     const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

//     //count no. of msgs not seen
//     const unseenMessages ={};
//     const promises = filteredUsers.map(async (user) => {
//       const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false});
//       if(messages.length > 0) {
//         unseenMessages[user._id] = messages.length;
//       }
//     })
//     await Promise.all(promises);
//     res.json({ success: true, users: filteredUsers, unseenMessages });

//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// }

// //get all messages between two users
// export const getMessages = async (req, res) => {
//   try {
//     const { id: selectedUserId } = req.params; // Assuming selectedUserId is passed as a URL parameter
//     const myId = req.user._id; // Assuming user ID is stored in req.user

//     const messages = await Message.find({
//       $or: [
//         { senderId: myId, receiverId: selectedUserId },
//         { senderId: selectedUserId, receiverId: myId }
//       ]
//     })
//     await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

//     res.json({ success: true, messages });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// }


// //api to mark all messages between two users as seen
// export const markMessagesAsSeen = async (req, res) => {
//   try {
//     const { id } = req.params; 

//     await Message.findByIdAndUpdate(id, { seen: true });

//     res.json({ success: true });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// }

// //api to send message
// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image }  = req.body;
//     const receiverId = req.params.id; // Assuming receiverId is passed as a URL parameter
//     const senderId = req.user._id;

//     let imageUrl;
//     if (image) {
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }
//     const newMessage = await Message.create({
//       text,
//       image: imageUrl,
//       senderId,
//       receiverId,
//     });

//     //emit the new msg to the reciever's socket
//     const receiverSocketId = userSocketMap[receiverId];
//     if(receiverSocketId){
//       io.to(receiverSocketId).emit("newMessage", newMessage)
//     }

//     res.json({ success: true, newMessage });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// }

import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// ✅ Get all users except logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessages = {};
    await Promise.all(
      filteredUsers.map(async (user) => {
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

// ✅ Get messages between two users
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

// ✅ Mark all messages as seen from one user
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany({ senderId, receiverId, seen: false }, { seen: true });

    res.status(200).json({ success: true, message: "Messages marked as seen" });
  } catch (error) {
    console.error("markMessagesAsSeen error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// ✅ Send a message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, { folder: "chat_app" });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      text,
      image: imageUrl,
      senderId,
      receiverId
    });

    // 🔥 Emit socket event to receiver if online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};
