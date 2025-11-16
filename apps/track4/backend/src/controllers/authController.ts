import { Request, Response } from "express";
import { User } from "../models/User";
import { createWallet } from "../config/circle";
import { generateToken } from "../utils/generateToken";

const validateCredentials = (payload: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    if (!payload[field] || typeof payload[field] !== "string") {
      throw new Error(`Invalid field: ${field}`);
    }
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    console.log("Signup request received:", { name, email });
    
    validateCredentials(req.body, ["name", "email", "password"]);

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("Email already exists:", email);
      return res.status(409).json({ message: "Email already registered" });
    }

    console.log("Creating new user...");
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      walletId: "",
      entitySecret: "",
    });

    const userId = user._id.toString();
    console.log("Creating Circle wallet for user:", userId);
    
    const { walletId, entitySecret } = await createWallet(userId);
    console.log("Circle wallet created:", { walletId });
    
    user.walletId = walletId;
    user.entitySecret = entitySecret;
    await user.save();
    console.log("User saved to MongoDB");

    const token = generateToken(userId);
    console.log("JWT token generated");

    return res.status(201).json({
      token,
      userId,
      walletId: user.walletId,
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Unable to sign up",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    validateCredentials(req.body, ["email", "password"]);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userId = user._id.toString();
    const token = generateToken(userId);

    return res.json({
      token,
      userId,
      walletId: user.walletId,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Unable to login",
    });
  }
};

