const hre = require("hardhat");

async function main() {
  const USDC_ADDRESS = process.env.USDC_ADDRESS;
  const ORACLE = process.env.ORACLE_ADDRESS;
  const UNLOCK = Math.floor(Date.now() / 1000) + 300; // unlock in 5 minutes for testing

  if (!USDC_ADDRESS) {
    throw new Error("Missing env: USDC_ADDRESS");
  }
  if (!ORACLE) {
    throw new Error("Missing env: ORACLE_ADDRESS");
  }

  const Splitter = await hre.ethers.getContractFactory("ConditionalTreasurySplitter");
  const splitter = await Splitter.deploy(USDC_ADDRESS, ORACLE, UNLOCK);

  await splitter.deployed();
  console.log("ConditionalTreasurySplitter deployed at:", splitter.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


