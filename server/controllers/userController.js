import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

// SignUp a new user
export const signup = async (req, res) => {
  const { email, fullName, password, bio } = req.body;

  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists. Please login." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      fullName,
      password: hashedPassword,
      bio: bio || "Hi Everyone, I am Using PingMe",
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      userData: newUser,
      token,
      message: "User created successfully"
    });

  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(401).json({ success: false, message: "Invalid credentials: email not registered" });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials: incorrect password" });
    }

    const token = generateToken(userData._id);

    return res.status(200).json({
      success: true,
      userData,
      token,
      message: "Login Successfully"
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// Check if user is authenticated
export const isAuthenticated = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePicture } = req.body;
    const userId = req.user._id;

    let updatedUser;
    if (!profilePicture) {
      updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });
    } else {
      let finalPicUrl = profilePicture;
      if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const upload = await cloudinary.uploader.upload(profilePicture, { folder: "profile_pics" });
          finalPicUrl = upload.secure_url;
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed, using direct picture data:", uploadErr.message);
        }
      }
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePicture: finalPicUrl, fullName, bio },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      userData: updatedUser,
      user: updatedUser
    });

  } catch (error) {
    console.error("Update Profile error:", error.message);
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};
