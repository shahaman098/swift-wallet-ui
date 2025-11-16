import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS as string;
  const usdc = process.env.ARC_USDC_ADDRESS as string;
  const rawAmount = process.env.FUND_AMOUNT || "1.0"; // in USDC

  if (!contractAddress || !usdc) {
    throw new Error("Missing CONTRACT_ADDRESS or ARC_USDC_ADDRESS");
  }

  const [signer] = await ethers.getSigners();
  const token = new ethers.Contract(usdc, ERC20_ABI, signer);
  const decimals: number = await token.decimals();
  const amount = ethers.parseUnits(rawAmount, decimals);

  const bal = await token.balanceOf(await signer.getAddress());
  console.log("Signer USDC balance:", ethers.formatUnits(bal, decimals));

  const tx = await token.transfer(contractAddress, amount);
  console.log("USDC transfer tx:", tx.hash);
  await tx.wait();
  console.log("Funded contract with", rawAmount, "USDC");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


