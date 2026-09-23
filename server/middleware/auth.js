import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || 'pingme-jwt-dev-secret-3000';

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(200).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(200).json({ success: false, message: "Unauthorized access" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    return res.status(200).json({ success: false, message: error.message });
  }
};
