import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentRequest extends Document {
  requestId: string;
  creatorUserId: string;
  creatorWalletId: string;
  amount: string;
  description?: string;
  status: "pending" | "paid";
  createdAt: Date;
}

const PaymentRequestSchema = new Schema<IPaymentRequest>({
  requestId: { type: String, required: true, unique: true },
  creatorUserId: { type: String, required: true },
  creatorWalletId: { type: String, required: true },
  amount: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const PaymentRequest = mongoose.model<IPaymentRequest>(
  "PaymentRequest",
  PaymentRequestSchema,
);

