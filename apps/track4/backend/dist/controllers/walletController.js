"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivity = exports.getBalance = void 0;
const User_1 = require("../models/User");
const circle_1 = require("../config/circle");
const ARC_CHAIN = "ARC-TESTNET";
const USD_COIN = "USDC";
const getBalance = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const circleResponse = await (0, circle_1.getWalletBalances)(user.walletId);
        const balances = circleResponse?.data?.balances ?? [];
        const balanceEntry = balances.find((balance) => balance.currency === USD_COIN && balance.chain === ARC_CHAIN);
        return res.json({
            balance: balanceEntry?.amount ?? "0",
            network: ARC_CHAIN.toLowerCase(),
            walletId: user.walletId,
        });
    }
    catch (error) {
        console.error("Balance fetch error:", error);
        return res.status(500).json({ message: "Unable to fetch balance" });
    }
};
exports.getBalance = getBalance;
const mapTransactionType = (type) => {
    if (!type)
        return "unknown";
    const normalized = type.toLowerCase();
    if (normalized.includes("deposit"))
        return "deposit";
    if (normalized.includes("payment") || normalized.includes("transfer"))
        return "payment";
    if (normalized.includes("bridge"))
        return "bridge";
    return "unknown";
};
const getActivity = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const circleResponse = await (0, circle_1.getWalletTransactions)(user.walletId);
        const transactions = circleResponse?.data?.transactions ?? [];
        const filtered = transactions
            .filter((tx) => tx.currency === USD_COIN &&
            tx.chain === ARC_CHAIN &&
            ["completed", "pending"].includes(tx.status?.toLowerCase()))
            .map((tx) => ({
            id: tx.id ?? tx.transactionId ?? "unknown",
            amount: tx.amount ?? "0",
            currency: tx.currency ?? USD_COIN,
            direction: tx.direction ?? "unknown",
            status: tx.status ?? "unknown",
            type: mapTransactionType(tx.type),
            timestamp: tx.createDate || tx.updateDate || new Date().toISOString(),
        }));
        return res.json({ transactions: filtered });
    }
    catch (error) {
        console.error("Activity fetch error:", error);
        return res.status(500).json({ message: "Unable to fetch wallet activity" });
    }
};
exports.getActivity = getActivity;
