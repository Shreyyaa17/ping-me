// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import {generateToken} from '../lib/utils.js';
// import cloudinary from '../lib/cloudinary.js';


// //SignUp a new user
// export const signup = async (req, res) => {
//   const {email, fullName, password, bio} = req.body;

//   try {
//     // Check if user already exists
//     if(!email || !fullName || !password || !bio) {
//       return res.json({success: false, message: "All fields are required"});
//     }
//     const user = await User.findOne({email});
//     if(user) {
//       return res.json({success: false, message: "User already exists"});
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = await User.create({
//       email,
//       fullName,
//       password: hashedPassword,
//       bio
//     });

//     const token = generateToken(newUser._id);

//     req.json({success: true, userData: newUser, token, message: "User created successfully"});
//   } catch (error) {
//     console.log(error.message);
//     req.json({success: false, message: error.message});
//   }
// }

// //Login a user
// export const login = async (req, res) => {
//   try{
//     const {email, password} = req.body;
//     const userData = await User.findOne({email});

//     const isPasswordValid = await bcrypt.compare(password, userData.password);
//     if(!isPasswordValid) {
//       res.json({success: false, message: "Invalid credentials"});
//     }

//     const token = generateToken(userData._id);

//     req.json({success: true, userData, token, message: "Login Successfully"});
//   } catch (error) {
//     console.log(error.message);
//     req.json({success: false, message: error.message});
//   }
// }


// //check if user is authenticated
// export const isAuthenticated = (req, res) => {
//   res.json({
//     success: true,
//     user: req.user,
//   });
// }


// //Update user profile
// export const updateProfile = async (req, res) => {
//   try{
//     const {fullName, bio, profilePicture} = req.body;
//     const userId = req.user._id;

//     let updatedUser;
//     if(!profilePicture){
//       updatedUser = await User.findByIdAndUpdate(userId, {fullName, bio}, {new: true});
//     } else{
//       const upload = await cloudinary.uploader.upload(profilePicture);

//       updatedUser = await User.findByIdAndUpdate(userId, {profilePicture: upload.secure_url, fullName, bio}, {new: true});
//     }

//     res.json({success: true, userData: updatedUser});
//   } catch (error) {
//     console.log(error.message);
//     res.json({success: false, message: error.message});
//   }
// }


import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

// ✅ SignUp a new user
export const signup = async (req, res) => {
  const { email, fullName, password, bio } = req.body;

  try {
    if (!email || !fullName || !password || !bio) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      fullName,
      password: hashedPassword,
      bio
    });

    const token = generateToken(newUser._id);

    return res.json({
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

// ✅ Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
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

// ✅ Check if user is authenticated
export const isAuthenticated = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// ✅ Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePicture } = req.body;
    const userId = req.user._id;

    let updatedUser;
    if (!profilePicture) {
      updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });
    } else {
      const upload = await cloudinary.uploader.upload(profilePicture, { folder: "profile_pics" });
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePicture: upload.secure_url, fullName, bio },
        { new: true }
      );
    }

    return res.status(200).json({ success: true, userData: updatedUser });

  } catch (error) {
    console.error("Update Profile error:", error.message);
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};
