import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

async function main() {
  const USDC = process.env.ARC_USDC_ADDRESS;
  const INTERVAL = process.env.DISTRIBUTION_INTERVAL ? Number(process.env.DISTRIBUTION_INTERVAL) : 3600;
  const THRESHOLD = process.env.MIN_THRESHOLD ? BigInt(process.env.MIN_THRESHOLD) : BigInt(1_000_000); // 1 USDC with 6 decimals

  if (!USDC) {
    throw new Error("Missing ARC_USDC_ADDRESS in .env");
  }

  const factory = await ethers.getContractFactory("SmartPayScheduler");
  const contract = await factory.deploy(USDC, INTERVAL, THRESHOLD);
  await contract.waitForDeployment();
  console.log("SmartPayScheduler deployed at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


