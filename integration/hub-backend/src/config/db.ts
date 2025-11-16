import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    if (env.skipDb === "true") {
      console.log("SKIP_DB=true - skipping MongoDB connection for development.");
      return;
    }
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

