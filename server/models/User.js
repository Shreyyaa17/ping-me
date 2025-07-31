import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, "Invalid email format"]},
  fullName: {type: String, required: true},
  password: {type: String, required: true, minlength: 8},
  profilePicture: {type: String, default: ""},
  bio: {type: String},
}, {timestamps: true});


const User = mongoose.model("User", userSchema);


export default User;