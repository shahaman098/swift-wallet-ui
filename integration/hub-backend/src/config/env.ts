import dotenv from "dotenv";
import { validateEnv } from "../utils/validateEnv";

dotenv.config();

export const env = {
  circleApiKey: validateEnv("CIRCLE_API_KEY")!,
  entitySecretOverride: validateEnv("CIRCLE_WALLET_ENTITY_SECRET", undefined, {
    optional: true,
  }),
  circleApiBase: validateEnv("CIRCLE_API_BASE", "https://api.circle.com/v1")!,
  circleWebhookSecret: validateEnv("CIRCLE_WEBHOOK_SECRET")!,
  arcRpcUrl: validateEnv("ARC_RPC_URL")!,
  arcChainId: validateEnv("ARC_CHAIN_ID", "arc-testnet")!,
  mongoUri: validateEnv("MONGODB_URI")!,
  jwtSecret: validateEnv("JWT_SECRET")!,
  port: validateEnv("PORT", "5000")!,
  frontendUrl: validateEnv("FRONTEND_URL", "http://localhost:5173")!,
  nodeEnv: process.env.NODE_ENV ?? "development",
  // Optional dev flag to bypass Mongo connection (useful for quick demos)
  skipDb: process.env.SKIP_DB ?? "false",
  demoMode:
    process.env.DEMO_MODE ??
    (process.env.NODE_ENV !== "production" ? "true" : "false"),
};

