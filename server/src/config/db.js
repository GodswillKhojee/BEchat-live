import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectDB(uri = env.MONGODB_URI) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    mongoose.connection.on("connected", () => {
      isConnected = true;
      console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.name}`);
    });

    mongoose.connection.on("error", (err) => {
      console.error("[Database] MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      console.warn("[Database] MongoDB disconnected.");
    });

    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    return mongoose.connection;
  } catch (err) {
    console.error(`[Database] Initial MongoDB connection failed: ${err.message}`);
    throw err;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("[Database] MongoDB disconnected cleanly.");
  }
}
