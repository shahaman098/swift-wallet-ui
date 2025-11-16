"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const User_1 = require("../models/User");
const circle_1 = require("../config/circle");
const generateToken_1 = require("../utils/generateToken");
const validateCredentials = (payload, fields) => {
    for (const field of fields) {
        if (!payload[field] || typeof payload[field] !== "string") {
            throw new Error(`Invalid field: ${field}`);
        }
    }
};
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        validateCredentials(req.body, ["name", "email", "password"]);
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const user = new User_1.User({
            name,
            email: email.toLowerCase(),
            passwordHash: password,
            walletId: "",
            entitySecret: "",
        });
        const userId = user._id.toString();
        const { walletId, entitySecret } = await (0, circle_1.createWallet)(userId);
        user.walletId = walletId;
        user.entitySecret = entitySecret;
        await user.save();
        const token = (0, generateToken_1.generateToken)(userId);
        return res.status(201).json({
            token,
            userId,
            walletId: user.walletId,
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            message: error instanceof Error ? error.message : "Unable to sign up",
        });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        validateCredentials(req.body, ["email", "password"]);
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const userId = user._id.toString();
        const token = (0, generateToken_1.generateToken)(userId);
        return res.json({
            token,
            userId,
            walletId: user.walletId,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: error instanceof Error ? error.message : "Unable to login",
        });
    }
};
exports.login = login;
