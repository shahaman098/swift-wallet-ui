import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  orgId?: mongoose.Types.ObjectId;
  type: 'deposit' | 'send' | 'receive' | 'split' | 'request' | 'allocation' | 'distribution';
  amount: number;
  recipient?: string;
  recipientId?: mongoose.Types.ObjectId;
  sender?: string;
  senderId?: mongoose.Types.ObjectId;
  status: 'completed' | 'pending' | 'failed';
  note?: string;
  txHash?: string; // Blockchain transaction hash
  deptId?: mongoose.Types.ObjectId;
  ruleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    type: {
      type: String,
      enum: ['deposit', 'send', 'receive', 'split', 'request', 'allocation', 'distribution'],
      required: true,
    },
    amount: { type: Number, required: true },
    recipient: { type: String },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    sender: { type: String },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
    note: { type: String },
    txHash: { type: String }, // Blockchain transaction hash
    deptId: { type: Schema.Types.ObjectId, ref: 'Department' },
    ruleId: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ orgId: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

