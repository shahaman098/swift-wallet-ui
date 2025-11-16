import { Response } from "express";
import crypto from "crypto";
import { PaymentRequest } from "../models/PaymentRequest";
import { User } from "../models/User";
import { circleClient } from "../config/circle";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { env } from "../config/env";

export const createRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { amount, description } = req.body as { amount?: string; description?: string };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestId = crypto.randomUUID();
    await PaymentRequest.create({
      requestId,
      creatorUserId: userId,
      creatorWalletId: user.walletId,
      amount,
      description,
    });

    const deepLink = `${env.frontendUrl}/pay/${requestId}`;
    return res.json({ requestId, deepLink });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({ error: "Failed to create request" });
  }
};

export const getRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const paymentRequest = await PaymentRequest.findOne({ requestId });
    if (!paymentRequest) {
      return res.status(404).json({ message: "Invalid request" });
    }

    const creator = await User.findById(paymentRequest.creatorUserId).select("name email");

    return res.json({
      request: paymentRequest,
      creator,
    });
  } catch (error) {
    console.error("Get request error:", error);
    return res.status(500).json({ error: "Failed to fetch request" });
  }
};

export const payRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payerUserId = req.userId;
    const { requestId } = req.params;

    if (!payerUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const request = await PaymentRequest.findOne({ requestId });
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    const payer = await User.findById(payerUserId);
    const creator = await User.findById(request.creatorUserId);

    if (!payer || !creator) {
      return res.status(404).json({ message: "User not found" });
    }

    const transfer = await circleClient.post("/wallets/transfers", {
      idempotencyKey: crypto.randomUUID(),
      source: { type: "wallet", id: payer.walletId },
      destination: { type: "wallet", id: creator.walletId },
      amount: { amount: request.amount, currency: "USD" },
    });

    const txHash =
      transfer.data?.data?.transactionHash ??
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
  } catch (error) {
    console.error("Pay request error:", error);
    return res.status(500).json({ error: "Failed to pay request" });
  }
};

