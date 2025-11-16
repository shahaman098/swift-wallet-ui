"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentRequest_1 = require("../models/PaymentRequest");
const env_1 = require("../config/env");
const runTest = async () => {
    try {
        await mongoose_1.default.connect(env_1.env.mongoUri);
        console.log("Connected to MongoDB");
        const payload = {
            requestId: `test-${Date.now()}`,
            creatorUserId: "test-user",
            creatorWalletId: "wallet-123",
            amount: "100",
            description: "Test request",
        };
        const created = await PaymentRequest_1.PaymentRequest.create(payload);
        console.log("Created:", created.requestId);
        const fetched = await PaymentRequest_1.PaymentRequest.findOne({ requestId: payload.requestId });
        console.log("Fetched:", fetched?.requestId);
        await PaymentRequest_1.PaymentRequest.updateOne({ requestId: payload.requestId }, { status: "paid" });
        const updated = await PaymentRequest_1.PaymentRequest.findOne({ requestId: payload.requestId });
        console.log("Updated status:", updated?.status);
        await PaymentRequest_1.PaymentRequest.deleteOne({ requestId: payload.requestId });
        const deleted = await PaymentRequest_1.PaymentRequest.findOne({ requestId: payload.requestId });
        console.log("Deleted exists:", !!deleted);
    }
    catch (error) {
        console.error("Test failed:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
};
runTest();
