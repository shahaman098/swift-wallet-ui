import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import { getWalletBalances, getWalletTransactions } from "../config/circle";

const ARC_CHAIN = "ARC-TESTNET";
const USD_COIN = "USDC";

export const getBalance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const circleResponse = await getWalletBalances(user.walletId);
    const balances = circleResponse?.data?.balances ?? [];

    const balanceEntry = balances.find(
      (balance: Record<string, string>) =>
        balance.currency === USD_COIN && balance.chain === ARC_CHAIN,
    );

    return res.json({
      balance: balanceEntry?.amount ?? "0",
      network: ARC_CHAIN.toLowerCase(),
      walletId: user.walletId,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    return res.status(500).json({ message: "Unable to fetch balance" });
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
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const circleResponse = await getWalletTransactions(user.walletId);
    const transactions = circleResponse?.data?.transactions ?? [];

    const filtered = transactions
      .filter(
        (tx: Record<string, any>) =>
          tx.currency === USD_COIN &&
          tx.chain === ARC_CHAIN &&
          ["completed", "pending"].includes((tx.status as string)?.toLowerCase()),
      )
      .map((tx: Record<string, any>) => ({
        id: tx.id ?? tx.transactionId ?? "unknown",
        amount: tx.amount ?? "0",
        currency: tx.currency ?? USD_COIN,
        direction: tx.direction ?? "unknown",
        status: tx.status ?? "unknown",
        type: mapTransactionType(tx.type),
        timestamp: tx.createDate || tx.updateDate || new Date().toISOString(),
      }));

    return res.json(filtered);
  } catch (error) {
    console.error("Activity fetch error:", error);
    return res.status(500).json({ message: "Unable to fetch wallet activity" });
  }
};

