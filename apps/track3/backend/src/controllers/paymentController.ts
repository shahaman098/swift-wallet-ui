import { Response } from "express";
import axios from "axios";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const sendPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const senderId = req.userId;
    const { recipientEmail, amount } = req.body as {
      recipientEmail?: string;
      amount?: number | string;
    };

    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!recipientEmail || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const sender = await User.findById(senderId);
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });

    if (!sender || !recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    const numericAmount = typeof amount === "string" ? Number(amount) : amount;
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const response = await axios.post(
      `${env.circleApiBase}/wallets/transfers`,
      {
        idempotencyKey: randomUUID(),
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
      },
      {
        headers: {
          Authorization: `Bearer ${env.circleApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

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
  } catch (err: any) {
    console.error("Payment error:", err.response?.data || err);
    return res.status(500).json({
      error: "Payment failed",
      details: err.response?.data ?? err.message,
    });
  }
};

