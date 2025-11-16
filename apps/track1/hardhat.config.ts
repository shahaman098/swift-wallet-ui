import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

dotenv.config({ path: __dirname + "/.env" });

const ARC_RPC_URL = process.env.ARC_RPC_URL || "";
const ARC_PRIVATE_KEY = process.env.ARC_PRIVATE_KEY || "";
const ARC_CHAIN_ID = Number(process.env.ARC_CHAIN_ID || "70700");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    arc: {
      url: ARC_RPC_URL,
      chainId: ARC_CHAIN_ID,
      accounts: ARC_PRIVATE_KEY ? [ARC_PRIVATE_KEY] : []
    }
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  }
};

export default config;


