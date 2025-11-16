import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS as string;
  const wallet = process.env.RECIPIENT_WALLET as string;
  const share = Number(process.env.RECIPIENT_SHARE || "0");

  if (!contractAddress || !wallet || !share) {
    throw new Error("Missing CONTRACT_ADDRESS, RECIPIENT_WALLET, or RECIPIENT_SHARE");
  }

  const contract = await ethers.getContractAt("SmartPayScheduler", contractAddress);
  const tx = await contract.addRecipient(wallet, share);
  console.log("addRecipient tx sent:", tx.hash);
  await tx.wait();
  console.log("Recipient added.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


