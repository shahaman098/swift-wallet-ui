import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS as string;
  if (!contractAddress) {
    throw new Error("Missing CONTRACT_ADDRESS");
  }

  const contract = await ethers.getContractAt("SmartPayScheduler", contractAddress);
  const [eligible, reason] = await contract.canExecute();
  if (!eligible) {
    console.log("Cannot execute:", reason);
    return;
  }

  const tx = await contract.executeDistribution();
  console.log("executeDistribution tx sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Executed. Gas used:", receipt?.gasUsed?.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


