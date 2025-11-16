import { randomUUID } from "crypto";
import { createWallet } from "../src/config/circle";

const run = async () => {
  try {
    const userId = `test-${randomUUID()}`;
    const wallet = await createWallet(userId);
    console.log("✅ Test wallet created:", {
      userId,
      walletId: wallet.walletId,
      entitySecret: wallet.entitySecret,
    });
  } catch (error) {
    console.error("❌ Failed to create test wallet:", error);
    process.exitCode = 1;
  }
};

run();

