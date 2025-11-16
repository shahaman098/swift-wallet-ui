import mongoose, { Document, Model } from "mongoose";

export interface IPayment extends Document {
  referenceId: string;
  sender: string;
  senderId: string;
  recipient: string;
  recipientId: string;
  amount: number;
  status: string;
  txHash?: string | null;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    txHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

