import crypto from "crypto";
import { Request, Response } from "express";
import axios from "axios";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { Payment } from "../models/Payment";

const CIRCLE_WEBHOOK_SECRET = env.circleWebhookSecret;

const extractReferenceId = (transfer: Record<string, any>) =>
  transfer?.id ?? transfer?.transactionId ?? transfer?.externalRefId ?? randomUUID();

const normalizeAmount = (value?: number | string) => {
  if (typeof value === "string") {
    return Number(value);
  }
  if (typeof value === "number") {
    return value;
  }
  return NaN;
};

const verifyCircleSignature = (req: Request) => {
  const signature = req.headers["circle-signature"] as string | undefined;
  if (!signature) {
    return false;
  }

  const rawBody = JSON.stringify(req.body);
  const computed = crypto
    .createHmac("sha256", CIRCLE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return computed === signature;
};

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

    const numericAmount = normalizeAmount(amount);
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

    await Payment.findOneAndUpdate(
      { referenceId },
      {
        referenceId,
        sender: sender.email,
        senderId: sender._id.toString(),
        recipient: recipient.email,
        recipientId: recipient._id.toString(),
        amount: numericAmount,
        status: transfer?.status ?? "pending",
        txHash: transfer?.transactionHash ?? null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

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

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    if (!verifyCircleSignature(req)) {
      console.log("❌ Invalid Circle webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;

    if (event.type === "payment.settled") {
      const paymentId = event.data.id;

      const paymentRecord = await Payment.findOneAndUpdate(
        { referenceId: paymentId },
        { status: "settled" },
        { new: true },
      );

      if (!paymentRecord) {
        console.warn(`⚠️ Payment record not found for webhook: ${paymentId}`);
        return res.status(200).json({ received: true });
      }

      const senderId = paymentRecord.senderId;
      const recipientId = paymentRecord.recipientId;
      const amount = paymentRecord.amount;

      await User.findByIdAndUpdate(senderId, {
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

      await User.findByIdAndUpdate(recipientId, {
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
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Webhook failure" });
  }
};

