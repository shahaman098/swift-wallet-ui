import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import { generateBalance, generateTxHash, generateId } from "../utils/generate";

const ARC_CHAIN = "ARC-TESTNET";
const USD_COIN = "USDC";

export const getBalance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const balance = generateBalance();
    const walletId = req.userId ? (await User.findById(req.userId))?.walletId : null;
    
    return res.json({
      balance,
      usdc: balance,
      network: ARC_CHAIN.toLowerCase(),
      walletId: walletId || generateId(),
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return res.json({
      balance: generateBalance(),
      usdc: generateBalance(),
      network: ARC_CHAIN.toLowerCase(),
      walletId: generateId(),
      updatedAt: new Date().toISOString(),
    });
  }
};

const mapTransactionType = (type?: string) => {
  if (!type) return "unknown";
  const normalized = type.toLowerCase();
  if (normalized.includes("deposit")) return "deposit";
  if (normalized.includes("payment") || normalized.includes("transfer")) return "payment";
  if (normalized.includes("bridge")) return "bridge";
  return "unknown";
};

export const getActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.userId ? await User.findById(req.userId) : null;
    const transactions = user?.activity || [];
    
    const formatted = transactions.map((tx: any) => ({
      id: tx.id || generateId(),
      amount: tx.amount || generateBalance(),
      currency: USD_COIN,
      direction: tx.direction || (tx.type === "send" ? "out" : "in"),
      status: "completed",
      type: tx.type || "deposit",
      timestamp: tx.timestamp || new Date().toISOString(),
      txHash: tx.txHash || generateTxHash(),
    }));

    return res.json({ transactions: formatted });
  } catch {
    return res.json({ transactions: [] });
  }
};

