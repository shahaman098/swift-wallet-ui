import mongoose from "mongoose";
import { PaymentRequest } from "../models/PaymentRequest";
import { env } from "../config/env";

const runTest = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB");

    const payload = {
      requestId: `test-${Date.now()}`,
      creatorUserId: "test-user",
      creatorWalletId: "wallet-123",
      amount: "100",
      description: "Test request",
    };

    const created = await PaymentRequest.create(payload);
    console.log("Created:", created.requestId);

    const fetched = await PaymentRequest.findOne({ requestId: payload.requestId });
    console.log("Fetched:", fetched?.requestId);

    await PaymentRequest.updateOne({ requestId: payload.requestId }, { status: "paid" });
    const updated = await PaymentRequest.findOne({ requestId: payload.requestId });
    console.log("Updated status:", updated?.status);

    await PaymentRequest.deleteOne({ requestId: payload.requestId });
    const deleted = await PaymentRequest.findOne({ requestId: payload.requestId });
    console.log("Deleted exists:", !!deleted);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runTest();

