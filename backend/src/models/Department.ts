import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  cap: number;
  balance: number;
  active: boolean;
  orgId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    cap: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true, default: 0 },
    active: { type: Boolean, default: true },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

