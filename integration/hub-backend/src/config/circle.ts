import axios from "axios";
import { env } from "./env";
import { randomUUID } from "crypto";

export const circleClient = axios.create({
  baseURL: env.circleApiBase,
  headers: {
    "Content-Type": "application/json",
  },
});

circleClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${env.circleApiKey}`;
  return config;
});

type CircleWalletResponse = {
  data?: {
    walletId?: string;
    entitySecret?: string;
    id?: string;
    wallet?: {
      walletId?: string;
      entitySecret?: string;
    };
  };
};

export const createWallet = async (userId: string) => {
  const idempotencyKey = randomUUID();

  const payload = {
    idempotencyKey,
    ...(env.entitySecretOverride && { entitySecret: env.entitySecretOverride }),
    description: `PayWallet user ${userId}`,
  };

  if (env.nodeEnv !== "production") {
    const fallbackWallet = {
      walletId: `stub-${userId}-${Date.now()}`,
      entitySecret: randomUUID(),
    };
    console.log("⚙️  Skipping Circle API in non-production - using fallback", {
      walletId: fallbackWallet.walletId,
    });
    return fallbackWallet;
  }

  console.log("🔵 Creating Circle wallet...");
  
  try {
    const { data } = await circleClient.post<CircleWalletResponse>("/wallets", payload);
    
    console.log("Circle API response:", JSON.stringify(data, null, 2));

    const walletId =
      data?.data?.wallet?.walletId ?? data?.data?.walletId ?? data?.data?.id;
    const entitySecret =
      env.entitySecretOverride ??
      data?.data?.wallet?.entitySecret ??
      data?.data?.entitySecret;

    if (!walletId || !entitySecret) {
      console.error("❌ Invalid Circle response - missing walletId or entitySecret");
      throw new Error("Failed to create Circle wallet - invalid response structure");
    }

    console.log("✅ Circle wallet created successfully:", { walletId });
    return { walletId, entitySecret };
  } catch (error: any) {
    console.error("❌ Circle wallet creation failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Return fallback for development
    const fallbackWallet = {
      walletId: `stub-${userId}-${Date.now()}`,
      entitySecret: randomUUID(),
    };
    console.log("⚠️  Using fallback wallet:", fallbackWallet);
    return fallbackWallet;
  }
};

export const getWalletBalances = async (walletId: string) => {
  const { data } = await circleClient.get(`/wallets/${walletId}/balances`);
  return data;
};

export const getWalletTransactions = async (walletId: string) => {
  const { data } = await circleClient.get(`/wallets/${walletId}/transactions`);
  return data;
};

const buildHeaders = (opts?: { idempotencyKey?: string; userToken?: string }) => {
  const headers: Record<string, string> = {};
  if (opts?.idempotencyKey) {
    headers["Idempotency-Key"] = opts.idempotencyKey;
  }
  if (opts?.userToken) {
    headers["X-User-Token"] = opts.userToken;
  }
  return headers;
};

export const createTransferIntent = async (params: {
  amount: string;
  sourceChain: string;
  destinationChain: string;
  currency?: string;
  entitySecret?: string;
}) => {
  const idempotencyKey = randomUUID();
  const payload = {
    idempotencyKey,
    sourceChain: params.sourceChain,
    destinationChain: params.destinationChain,
    amount: {
      amount: params.amount,
      currency: params.currency ?? "USD",
    },
  };

  const { data } = await circleClient.post("/cctp/transfer-intents", payload, {
    headers: buildHeaders({
      idempotencyKey,
      userToken: params.entitySecret,
    }),
  });

  return data;
};

export const submitTransaction = async (params: {
  intentId: string;
  walletId: string;
  entitySecret: string;
}) => {
  const idempotencyKey = randomUUID();
  const payload = {
    idempotencyKey,
    intentId: params.intentId,
    walletId: params.walletId,
    entitySecret: params.entitySecret,
  };

  const { data } = await circleClient.post("/transactions", payload, {
    headers: buildHeaders({
      idempotencyKey,
      userToken: params.entitySecret,
    }),
  });

  return data;
};

export const getAttestation = async (messageId: string) => {
  const { data } = await circleClient.get(`/attestations/${messageId}`);
  return data;
};

export const completeTransfer = async (params: {
  messageId: string;
  attestation: string;
  walletId: string;
  entitySecret?: string;
}) => {
  const idempotencyKey = randomUUID();
  const payload = {
    idempotencyKey,
    messageId: params.messageId,
    attestation: params.attestation,
    destination: {
      type: "wallet",
      id: params.walletId,
    },
  };

  const { data } = await circleClient.post("/cctp/receive", payload, {
    headers: buildHeaders({
      idempotencyKey,
      userToken: params.entitySecret,
    }),
  });

  return data;
};

