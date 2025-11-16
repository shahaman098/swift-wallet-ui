"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payRequest = exports.getRequest = exports.createRequest = void 0;
const crypto_1 = __importDefault(require("crypto"));
const PaymentRequest_1 = require("../models/PaymentRequest");
const User_1 = require("../models/User");
const circle_1 = require("../config/circle");
const env_1 = require("../config/env");
const createRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const { amount, description } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: "Amount is required" });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const requestId = crypto_1.default.randomUUID();
        await PaymentRequest_1.PaymentRequest.create({
            requestId,
            creatorUserId: userId,
            creatorWalletId: user.walletId,
            amount,
            description,
        });
        const deepLink = `${env_1.env.frontendUrl}/pay/${requestId}`;
        return res.json({ requestId, deepLink });
    }
    catch (error) {
        console.error("Create request error:", error);
        return res.status(500).json({ error: "Failed to create request" });
    }
};
exports.createRequest = createRequest;
const getRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const paymentRequest = await PaymentRequest_1.PaymentRequest.findOne({ requestId });
        if (!paymentRequest) {
            return res.status(404).json({ message: "Invalid request" });
        }
        const creator = await User_1.User.findById(paymentRequest.creatorUserId).select("name email");
        return res.json({
            request: paymentRequest,
            creator,
        });
    }
    catch (error) {
        console.error("Get request error:", error);
        return res.status(500).json({ error: "Failed to fetch request" });
    }
};
exports.getRequest = getRequest;
const payRequest = async (req, res) => {
    try {
        const payerUserId = req.userId;
        const { requestId } = req.params;
        if (!payerUserId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const request = await PaymentRequest_1.PaymentRequest.findOne({ requestId });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (request.status === "paid") {
            return res.status(400).json({ message: "Already paid" });
        }
        const payer = await User_1.User.findById(payerUserId);
        const creator = await User_1.User.findById(request.creatorUserId);
        if (!payer || !creator) {
            return res.status(404).json({ message: "User not found" });
        }
        const transfer = await circle_1.circleClient.post("/wallets/transfers", {
            idempotencyKey: crypto_1.default.randomUUID(),
            source: { type: "wallet", id: payer.walletId },
            destination: { type: "wallet", id: creator.walletId },
            amount: { amount: request.amount, currency: "USD" },
        });
        const txHash = transfer.data?.data?.transactionHash ??
            transfer.data?.data?.txHash ??
            transfer.data?.data?.id;
        request.status = "paid";
        await request.save();
        const numericAmount = Number(request.amount);
        payer.activity.push({
            type: "payment_sent",
            amount: numericAmount,
            status: "completed",
            txHash,
            to: creator.email,
            timestamp: new Date(),
        });
        creator.activity.push({
            type: "payment_received",
            amount: numericAmount,
            status: "completed",
            txHash,
            from: payer.email,
            timestamp: new Date(),
        });
        await payer.save();
        await creator.save();
        return res.json({ message: "Payment completed", txHash });
    }
    catch (error) {
        console.error("Pay request error:", error);
        return res.status(500).json({ error: "Failed to pay request" });
    }
};
exports.payRequest = payRequest;
