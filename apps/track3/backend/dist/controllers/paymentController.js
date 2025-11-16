"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const sendPayment = async (req, res) => {
    try {
        const senderId = req.userId;
        const { recipientEmail, amount } = req.body;
        if (!senderId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!recipientEmail || !amount) {
            return res.status(400).json({ error: "Missing fields" });
        }
        const sender = await User_1.User.findById(senderId);
        const recipient = await User_1.User.findOne({ email: recipientEmail.toLowerCase() });
        if (!sender || !recipient) {
            return res.status(404).json({ error: "User not found" });
        }
        const numericAmount = typeof amount === "string" ? Number(amount) : amount;
        if (!numericAmount || numericAmount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }
        const response = await axios_1.default.post(`${env_1.env.circleApiBase}/wallets/transfers`, {
            idempotencyKey: (0, crypto_1.randomUUID)(),
            source: {
                type: "wallet",
                id: sender.walletId,
            },
            destination: {
                type: "wallet",
                id: recipient.walletId,
            },
            amount: {
                amount: numericAmount.toString(),
                currency: "USD",
            },
        }, {
            headers: {
                Authorization: `Bearer ${env_1.env.circleApiKey}`,
                "Content-Type": "application/json",
            },
        });
        const transfer = response.data?.data;
        sender.activity.push({
            type: "send",
            amount: numericAmount,
            status: transfer?.status ?? "pending",
            txHash: transfer?.transactionHash ?? null,
            to: recipient.email,
            timestamp: new Date(),
        });
        recipient.activity.push({
            type: "receive",
            amount: numericAmount,
            status: transfer?.status ?? "pending",
            txHash: transfer?.transactionHash ?? null,
            from: sender.email,
            timestamp: new Date(),
        });
        await sender.save();
        await recipient.save();
        return res.json({
            message: "Payment sent",
            transfer,
        });
    }
    catch (err) {
        console.error("Payment error:", err.response?.data || err);
        return res.status(500).json({
            error: "Payment failed",
            details: err.response?.data ?? err.message,
        });
    }
};
exports.sendPayment = sendPayment;
