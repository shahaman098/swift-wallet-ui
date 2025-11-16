import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import {
  completeTransfer as receiveTransfer,
  createTransferIntent,
  getAttestation,
  getWalletBalances,
  submitTransaction,
} from "../config/circle";

const SOURCE_CHAIN = "ethereum";
const DESTINATION_CHAIN = "arc-testnet";
const USD_CURRENCY = "USD";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getUserFromRequest = async (req: AuthenticatedRequest) => {
  if (!req.userId) {
    throw new Error("Unauthorized");
  }

  const user = await User.findById(req.userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const createIntent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount } = req.body as { amount?: string | number };
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const formattedAmount = typeof amount === "string" ? amount : amount.toString();

    const intentResponse = await createTransferIntent({
      amount: formattedAmount,
      sourceChain: SOURCE_CHAIN,
      destinationChain: DESTINATION_CHAIN,
    });

    const intent = intentResponse?.data?.data ?? intentResponse?.data;

    return res.status(201).json({
      intentId: intent?.id ?? intent?.intentId,
      clientToken: intent?.clientToken ?? null,
      sourceChain: intent?.sourceChain ?? SOURCE_CHAIN,
      destinationChain: intent?.destinationChain ?? DESTINATION_CHAIN,
      formattedAmount: intent?.amount?.amount ?? formattedAmount,
    });
  } catch (error) {
    console.error("CCTP intent error:", error);
    return res.status(500).json({ message: "Failed to create transfer intent" });
  }
};

export const executeBurn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    const { intentId } = req.body as { intentId?: string };

    if (!intentId) {
      return res.status(400).json({ message: "intentId is required" });
    }

    const burnResponse = await submitTransaction({
      intentId,
      walletId: user.walletId,
      entitySecret: user.entitySecret,
    });

    const burnData = burnResponse?.data?.data ?? burnResponse?.data;

    return res.json({
      burnTxHash:
        burnData?.transactionHash ?? burnData?.txHash ?? burnData?.id ?? burnData?.hash,
      messageId:
        burnData?.messageId ??
        burnData?.cctpData?.messageId ??
        burnData?.transfer?.messageId,
    });
  } catch (error) {
    console.error("CCTP burn error:", error);
    return res.status(500).json({ message: "Failed to submit burn transaction" });
  }
};

export const pollAttestation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageId } = req.body as { messageId?: string };
    if (!messageId) {
      return res.status(400).json({ message: "messageId is required" });
    }

    const maxAttempts = 20;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await getAttestation(messageId);
      const payload = response?.data?.data ?? response?.data;
      const status = payload?.status ?? response?.data?.status ?? "pending";
      if (status === "complete" && (payload?.attestation || response?.data?.attestation)) {
        return res.json({
          status: "complete",
          messageId,
          attestation: payload?.attestation ?? response?.data?.attestation,
        });
      }
      await sleep(3000);
    }

    return res.status(202).json({ status: "pending", messageId });
  } catch (error) {
    console.error("Attestation poll error:", error);
    return res.status(500).json({ message: "Failed to fetch attestation" });
  }
};

export const executeMint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    const { messageId, attestation } = req.body as {
      messageId?: string;
      attestation?: string;
    };

    if (!messageId || !attestation) {
      return res.status(400).json({ message: "messageId and attestation are required" });
    }

    const mintResponse = await receiveTransfer({
      messageId,
      attestation,
      walletId: user.walletId,
      entitySecret: user.entitySecret,
    });

    const receipt = mintResponse?.data?.data ?? mintResponse?.data;
    const mintTxHash =
      receipt?.transactionHash ?? receipt?.txHash ?? receipt?.id ?? receipt?.hash;
    const amountMinted =
      receipt?.amount?.amount ?? receipt?.amount ?? receipt?.transfer?.amount ?? "0";

    const balances = await getWalletBalances(user.walletId);
    const balanceEntry = balances?.data?.balances?.find(
      (balance: Record<string, string>) =>
        balance.currency === USD_CURRENCY && balance.chain === DESTINATION_CHAIN,
    );

    user.activity.push({
      type: "deposit",
      amount: Number(amountMinted),
      status: "completed",
      txHash: mintTxHash,
      from: SOURCE_CHAIN,
      to: DESTINATION_CHAIN,
      timestamp: new Date(),
    });
    await user.save();

    return res.json({
      status: receipt?.status ?? "minted",
      mintTxHash,
      amountMinted,
      finalBalance: balanceEntry?.amount ?? "0",
    });
  } catch (error) {
    console.error("CCTP mint error:", error);
    return res.status(500).json({ message: "Failed to mint on Arc" });
  }
};

