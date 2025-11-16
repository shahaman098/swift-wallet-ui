"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTransfer = exports.getAttestation = exports.submitTransaction = exports.createTransferIntent = exports.getWalletTransactions = exports.getWalletBalances = exports.createWallet = exports.circleClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("./env");
const crypto_1 = require("crypto");
exports.circleClient = axios_1.default.create({
    baseURL: env_1.env.circleApiBase,
    headers: {
        "Content-Type": "application/json",
    },
});
exports.circleClient.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${env_1.env.circleApiKey}`;
    return config;
});
const createWallet = async (userId) => {
    const idempotencyKey = (0, crypto_1.randomUUID)();
    const payload = {
        idempotencyKey,
        ...(env_1.env.entitySecretOverride && { entitySecret: env_1.env.entitySecretOverride }),
        description: `PayWallet user ${userId}`,
    };
    if (env_1.env.nodeEnv !== "production") {
        const fallbackWallet = {
            walletId: `stub-${userId}-${Date.now()}`,
            entitySecret: (0, crypto_1.randomUUID)(),
        };
        console.log("⚙️  Skipping Circle API in non-production - using fallback", {
            walletId: fallbackWallet.walletId,
        });
        return fallbackWallet;
    }
    console.log("🔵 Creating Circle wallet...");
    try {
        const { data } = await exports.circleClient.post("/wallets", payload);
        console.log("Circle API response:", JSON.stringify(data, null, 2));
        const walletId = data?.data?.wallet?.walletId ?? data?.data?.walletId ?? data?.data?.id;
        const entitySecret = env_1.env.entitySecretOverride ??
            data?.data?.wallet?.entitySecret ??
            data?.data?.entitySecret;
        if (!walletId || !entitySecret) {
            console.error("❌ Invalid Circle response - missing walletId or entitySecret");
            throw new Error("Failed to create Circle wallet - invalid response structure");
        }
        console.log("✅ Circle wallet created successfully:", { walletId });
        return { walletId, entitySecret };
    }
    catch (error) {
        console.error("❌ Circle wallet creation failed:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        // Return fallback for development
        const fallbackWallet = {
            walletId: `stub-${userId}-${Date.now()}`,
            entitySecret: (0, crypto_1.randomUUID)(),
        };
        console.log("⚠️  Using fallback wallet:", fallbackWallet);
        return fallbackWallet;
    }
};
exports.createWallet = createWallet;
const getWalletBalances = async (walletId) => {
    const { data } = await exports.circleClient.get(`/wallets/${walletId}/balances`);
    return data;
};
exports.getWalletBalances = getWalletBalances;
const getWalletTransactions = async (walletId) => {
    const { data } = await exports.circleClient.get(`/wallets/${walletId}/transactions`);
    return data;
};
exports.getWalletTransactions = getWalletTransactions;
const buildHeaders = (opts) => {
    const headers = {};
    if (opts?.idempotencyKey) {
        headers["Idempotency-Key"] = opts.idempotencyKey;
    }
    if (opts?.userToken) {
        headers["X-User-Token"] = opts.userToken;
    }
    return headers;
};
const createTransferIntent = async (params) => {
    const idempotencyKey = (0, crypto_1.randomUUID)();
    const payload = {
        idempotencyKey,
        sourceChain: params.sourceChain,
        destinationChain: params.destinationChain,
        amount: {
            amount: params.amount,
            currency: params.currency ?? "USD",
        },
    };
    const { data } = await exports.circleClient.post("/cctp/transfer-intents", payload, {
        headers: buildHeaders({
            idempotencyKey,
            userToken: params.entitySecret,
        }),
    });
    return data;
};
exports.createTransferIntent = createTransferIntent;
const submitTransaction = async (params) => {
    const idempotencyKey = (0, crypto_1.randomUUID)();
    const payload = {
        idempotencyKey,
        intentId: params.intentId,
        walletId: params.walletId,
        entitySecret: params.entitySecret,
    };
    const { data } = await exports.circleClient.post("/transactions", payload, {
        headers: buildHeaders({
            idempotencyKey,
            userToken: params.entitySecret,
        }),
    });
    return data;
};
exports.submitTransaction = submitTransaction;
const getAttestation = async (messageId) => {
    const { data } = await exports.circleClient.get(`/attestations/${messageId}`);
    return data;
};
exports.getAttestation = getAttestation;
const completeTransfer = async (params) => {
    const idempotencyKey = (0, crypto_1.randomUUID)();
    const payload = {
        idempotencyKey,
        messageId: params.messageId,
        attestation: params.attestation,
        destination: {
            type: "wallet",
            id: params.walletId,
        },
    };
    const { data } = await exports.circleClient.post("/cctp/receive", payload, {
        headers: buildHeaders({
            idempotencyKey,
            userToken: params.entitySecret,
        }),
    });
    return data;
};
exports.completeTransfer = completeTransfer;
