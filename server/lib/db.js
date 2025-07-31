import mongoose from "mongoose";

//Funcrtion to connect to MongoDB
export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'));

    await mongoose.connect(`${process.env.MONGODB_URI}/ping-me`)
  } catch (error) {
    console.log(error);
  }
}