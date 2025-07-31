import express from 'express';
import { signup, login, updateProfile, isAuthenticated } from '../controllers/userController.js';
import {protectRoute} from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, isAuthenticated);

export default userRouter;