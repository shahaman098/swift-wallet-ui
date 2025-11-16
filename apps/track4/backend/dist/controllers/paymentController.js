"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.sendPayment = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const crypto_2 = require("crypto");
const env_1 = require("../config/env");
const User_1 = __importDefault(require("../models/User"));
const Payment_1 = require("../models/Payment");
const CIRCLE_WEBHOOK_SECRET = env_1.env.circleWebhookSecret;
const extractReferenceId = (transfer) => transfer?.id ?? transfer?.transactionId ?? transfer?.externalRefId ?? (0, crypto_2.randomUUID)();
const normalizeAmount = (value) => {
    if (typeof value === "string") {
        return Number(value);
    }
    if (typeof value === "number") {
        return value;
    }
    return NaN;
};
const verifyCircleSignature = (req) => {
    const signature = req.headers["circle-signature"];
    if (!signature) {
        return false;
    }
    const rawBody = JSON.stringify(req.body);
    const computed = crypto_1.default
        .createHmac("sha256", CIRCLE_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");
    return computed === signature;
};
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
        const sender = await User_1.default.findById(senderId);
        const recipient = await User_1.default.findOne({ email: recipientEmail.toLowerCase() });
        if (!sender || !recipient) {
            return res.status(404).json({ error: "User not found" });
        }
        const numericAmount = normalizeAmount(amount);
        if (!numericAmount || numericAmount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }
        const response = await axios_1.default.post(`${env_1.env.circleApiBase}/wallets/transfers`, {
            idempotencyKey: (0, crypto_2.randomUUID)(),
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
        const transfer = response.data?.data ?? response.data;
        const referenceId = extractReferenceId(transfer ?? {});
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
        await Payment_1.Payment.findOneAndUpdate({ referenceId }, {
            referenceId,
            sender: sender.email,
            senderId: sender._id.toString(),
            recipient: recipient.email,
            recipientId: recipient._id.toString(),
            amount: numericAmount,
            status: transfer?.status ?? "pending",
            txHash: transfer?.transactionHash ?? null,
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
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
const handleWebhook = async (req, res) => {
    try {
        if (!verifyCircleSignature(req)) {
            console.log("❌ Invalid Circle webhook signature");
            return res.status(401).json({ error: "Invalid signature" });
        }
        const event = req.body;
        if (event.type === "payment.settled") {
            const paymentId = event.data.id;
            const paymentRecord = await Payment_1.Payment.findOneAndUpdate({ referenceId: paymentId }, { status: "settled" }, { new: true });
            if (!paymentRecord) {
                console.warn(`⚠️ Payment record not found for webhook: ${paymentId}`);
                return res.status(200).json({ received: true });
            }
            const senderId = paymentRecord.senderId;
            const recipientId = paymentRecord.recipientId;
            const amount = paymentRecord.amount;
            await User_1.default.findByIdAndUpdate(senderId, {
                $push: {
                    activity: {
                        type: "payment_sent",
                        amount,
                        status: "settled",
                        timestamp: new Date(),
                        referenceId: paymentId,
                    },
                },
            });
            await User_1.default.findByIdAndUpdate(recipientId, {
                $push: {
                    activity: {
                        type: "payment_received",
                        amount,
                        status: "settled",
                        timestamp: new Date(),
                        referenceId: paymentId,
                    },
                },
            });
            console.log(`✅ Payment ${paymentId} settled — activity feeds updated`);
        }
        return res.status(200).json({ received: true });
    }
    catch (err) {
        console.error("Webhook error:", err);
        return res.status(500).json({ error: "Webhook failure" });
    }
};
exports.handleWebhook = handleWebhook;
