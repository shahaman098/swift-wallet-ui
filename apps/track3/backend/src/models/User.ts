import mongoose, { Document, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  walletId: string;
  entitySecret: string;
  activity: Array<{
    type: string;
    amount: number;
    status: string;
    txHash?: string | null;
    from?: string;
    to?: string;
    timestamp: Date;
  }>;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    walletId: {
      type: String,
      required: true,
    },
    entitySecret: {
      type: String,
      required: true,
    },
    activity: {
      type: [
        {
          type: {
            type: String,
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
          status: {
            type: String,
            required: true,
          },
          txHash: String,
          from: String,
          to: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

