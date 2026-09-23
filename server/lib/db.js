import mongoose from "mongoose";

let isConnected = false;

// Function to connect to MongoDB
export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log("[PingMe] MONGODB_URI not provided — starting with in-memory database store.");
    return false;
  }

  try {
    mongoose.set('bufferCommands', false); // Fail fast, don't hang requests

    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.warn('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'ping-me',
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    return true;
  } catch (error) {
    console.warn("[PingMe] MongoDB connection failed, falling back to in-memory store:", error.message);
    return false;
  }
};

export const isDBConnected = () => isConnected;
