"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeMint = exports.pollAttestation = exports.executeBurn = exports.createIntent = void 0;
const User_1 = require("../models/User");
const circle_1 = require("../config/circle");
const SOURCE_CHAIN = "ethereum";
const DESTINATION_CHAIN = "arc-testnet";
const USD_CURRENCY = "USD";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getUserFromRequest = async (req) => {
    if (!req.userId) {
        throw new Error("Unauthorized");
    }
    const user = await User_1.User.findById(req.userId);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
const createIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" });
        }
        const formattedAmount = typeof amount === "string" ? amount : amount.toString();
        const intentResponse = await (0, circle_1.createTransferIntent)({
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
    }
    catch (error) {
        console.error("CCTP intent error:", error);
        return res.status(500).json({ message: "Failed to create transfer intent" });
    }
};
exports.createIntent = createIntent;
const executeBurn = async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        const { intentId } = req.body;
        if (!intentId) {
            return res.status(400).json({ message: "intentId is required" });
        }
        const burnResponse = await (0, circle_1.submitTransaction)({
            intentId,
            walletId: user.walletId,
            entitySecret: user.entitySecret,
        });
        const burnData = burnResponse?.data?.data ?? burnResponse?.data;
        return res.json({
            burnTxHash: burnData?.transactionHash ?? burnData?.txHash ?? burnData?.id ?? burnData?.hash,
            messageId: burnData?.messageId ??
                burnData?.cctpData?.messageId ??
                burnData?.transfer?.messageId,
        });
    }
    catch (error) {
        console.error("CCTP burn error:", error);
        return res.status(500).json({ message: "Failed to submit burn transaction" });
    }
};
exports.executeBurn = executeBurn;
const pollAttestation = async (req, res) => {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            return res.status(400).json({ message: "messageId is required" });
        }
        const maxAttempts = 20;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const response = await (0, circle_1.getAttestation)(messageId);
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
    }
    catch (error) {
        console.error("Attestation poll error:", error);
        return res.status(500).json({ message: "Failed to fetch attestation" });
    }
};
exports.pollAttestation = pollAttestation;
const executeMint = async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        const { messageId, attestation } = req.body;
        if (!messageId || !attestation) {
            return res.status(400).json({ message: "messageId and attestation are required" });
        }
        const mintResponse = await (0, circle_1.completeTransfer)({
            messageId,
            attestation,
            walletId: user.walletId,
            entitySecret: user.entitySecret,
        });
        const receipt = mintResponse?.data?.data ?? mintResponse?.data;
        const mintTxHash = receipt?.transactionHash ?? receipt?.txHash ?? receipt?.id ?? receipt?.hash;
        const amountMinted = receipt?.amount?.amount ?? receipt?.amount ?? receipt?.transfer?.amount ?? "0";
        const balances = await (0, circle_1.getWalletBalances)(user.walletId);
        const balanceEntry = balances?.data?.balances?.find((balance) => balance.currency === USD_CURRENCY && balance.chain === DESTINATION_CHAIN);
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
    }
    catch (error) {
        console.error("CCTP mint error:", error);
        return res.status(500).json({ message: "Failed to mint on Arc" });
    }
};
exports.executeMint = executeMint;
