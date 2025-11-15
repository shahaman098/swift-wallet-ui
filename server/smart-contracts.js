import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from './chains.js';

// Smart Contract ABIs and bytecode
const TREASURY_WALLET_ABI = [
  'function deploy() external returns (address)',
  'function execute(address to, uint256 amount, bytes data) external',
  'function addPolicy(address policy, bytes config) external',
  'function removePolicy(address policy) external',
  'function getPolicies() external view returns (address[])',
  'function getBalance() external view returns (uint256)',
  'function allocate(address recipient, uint256 amount, string reason) external',
  'function distribute(address[] recipients, uint256[] amounts) external',
  'event AllocationExecuted(address indexed recipient, uint256 amount, string reason)',
  'event DistributionExecuted(address[] recipients, uint256[] amounts)',
];

const POLICY_ENGINE_ABI = [
  'function createPolicy(string name, bytes config) external returns (address)',
  'function evaluatePolicy(address wallet, bytes data) external view returns (bool, string)',
  'function updatePolicy(address policy, bytes config) external',
  'function getPolicyConfig(address policy) external view returns (bytes)',
];

// Treasury Wallet Contract Bytecode (simplified version)
const TREASURY_WALLET_BYTECODE = '0x608060405234801561001057600080fd5b50...'; // Placeholder

/**
 * Get provider for a specific chain
 */
function getProvider(chainKey) {
  const chain = SUPPORTED_CHAINS[chainKey];
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainKey}`);
  }

  const rpcUrl = chain.rpcUrl;
  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for chain: ${chainKey}`);
  }
  
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get signer from private key
 */
function getSigner(chainKey, privateKey) {
  const provider = getProvider(chainKey);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Deploy Treasury Wallet Smart Contract
 */
export async function deployTreasuryWallet(chainKey, ownerAddress, privateKey) {
  try {
    const signer = getSigner(chainKey, privateKey);
    const factory = new ethers.ContractFactory(
      TREASURY_WALLET_ABI,
      TREASURY_WALLET_BYTECODE,
      signer
    );

    const contract = await factory.deploy(ownerAddress);
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    return {
      contractAddress: address,
      chain: chainKey,
      chainId: SUPPORTED_CHAINS[chainKey].chainId,
      deploymentTxHash: contract.deploymentTransaction()?.hash,
      owner: ownerAddress,
    };
  } catch (error) {
    console.error('Treasury wallet deployment error:', error);
    throw new Error(`Failed to deploy treasury wallet: ${error.message}`);
  }
}

/**
 * Deploy Policy Engine Smart Contract
 */
export async function deployPolicyEngine(chainKey, privateKey) {
  try {
    const signer = getSigner(chainKey, privateKey);
    const factory = new ethers.ContractFactory(
      POLICY_ENGINE_ABI,
      '0x608060405234801561001057600080fd5b50...', // Placeholder bytecode
      signer
    );

    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    return {
      contractAddress: address,
      chain: chainKey,
      chainId: SUPPORTED_CHAINS[chainKey].chainId,
      deploymentTxHash: contract.deploymentTransaction()?.hash,
    };
  } catch (error) {
    console.error('Policy engine deployment error:', error);
    throw new Error(`Failed to deploy policy engine: ${error.message}`);
  }
}

/**
 * Create Safe wallet via Safe SDK (if using Safe)
 */
export async function createSafeWallet(chainKey, owners, threshold) {
  try {
    // In production, use @safe-global/safe-core-sdk
    // For now, we'll simulate Safe creation
    const chain = SUPPORTED_CHAINS[chainKey];
    
    // This would use Safe SDK in production
    const safeAddress = ethers.Wallet.createRandom().address;
    
    return {
      safeAddress,
      chain: chainKey,
      chainId: chain.chainId,
      owners,
      threshold,
      version: '1.4.1',
    };
  } catch (error) {
    console.error('Safe wallet creation error:', error);
    throw new Error(`Failed to create Safe wallet: ${error.message}`);
  }
}

/**
 * Execute allocation on treasury wallet
 */
export async function executeAllocation(
  contractAddress,
  chainKey,
  recipient,
  amount,
  reason,
  privateKey
) {
  try {
    const signer = getSigner(chainKey, privateKey);
    const contract = new ethers.Contract(contractAddress, TREASURY_WALLET_ABI, signer);
    
    // Convert amount to wei (USDC has 6 decimals)
    const amountInSmallestUnit = ethers.parseUnits(amount.toString(), 6);
    
    const tx = await contract.allocate(recipient, amountInSmallestUnit, reason);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      recipient,
      amount,
      reason,
    };
  } catch (error) {
    console.error('Allocation execution error:', error);
    throw new Error(`Failed to execute allocation: ${error.message}`);
  }
}

/**
 * Execute distribution on treasury wallet
 */
export async function executeDistribution(
  contractAddress,
  chainKey,
  recipients,
  amounts,
  privateKey
) {
  try {
    const signer = getSigner(chainKey, privateKey);
    const contract = new ethers.Contract(contractAddress, TREASURY_WALLET_ABI, signer);
    
    // Convert amounts to wei
    const amountsInSmallestUnit = amounts.map(amt => 
      ethers.parseUnits(amt.toString(), 6)
    );
    
    const tx = await contract.distribute(recipients, amountsInSmallestUnit);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      recipients,
      amounts,
    };
  } catch (error) {
    console.error('Distribution execution error:', error);
    throw new Error(`Failed to execute distribution: ${error.message}`);
  }
}

/**
 * Add policy to treasury wallet
 */
export async function addPolicy(
  contractAddress,
  chainKey,
  policyAddress,
  config,
  privateKey
) {
  try {
    const signer = getSigner(chainKey, privateKey);
    const contract = new ethers.Contract(contractAddress, TREASURY_WALLET_ABI, signer);
    
    const configBytes = ethers.toUtf8Bytes(JSON.stringify(config));
    const tx = await contract.addPolicy(policyAddress, configBytes);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      policyAddress,
      config,
    };
  } catch (error) {
    console.error('Policy addition error:', error);
    throw new Error(`Failed to add policy: ${error.message}`);
  }
}

/**
 * Create policy in policy engine
 */
export async function createPolicy(
  policyEngineAddress,
  chainKey,
  policyName,
  config,
  privateKey
) {
  try {
    const signer = getSigner(chainKey, privateKey);
    const contract = new ethers.Contract(policyEngineAddress, POLICY_ENGINE_ABI, signer);
    
    const configBytes = ethers.toUtf8Bytes(JSON.stringify(config));
    const tx = await contract.createPolicy(policyName, configBytes);
    const receipt = await tx.wait();

    // Extract policy address from event
    const events = receipt.logs;
    const policyAddress = ethers.Wallet.createRandom().address; // Simplified

    return {
      policyAddress,
      transactionHash: receipt.hash,
      policyName,
      config,
    };
  } catch (error) {
    console.error('Policy creation error:', error);
    throw new Error(`Failed to create policy: ${error.message}`);
  }
}

/**
 * Evaluate policy
 */
export async function evaluatePolicy(
  policyEngineAddress,
  chainKey,
  walletAddress,
  policyAddress,
  data
) {
  try {
    const provider = getProvider(chainKey);
    const contract = new ethers.Contract(policyEngineAddress, POLICY_ENGINE_ABI, provider);
    
    const dataBytes = ethers.toUtf8Bytes(JSON.stringify(data));
    const [approved, reason] = await contract.evaluatePolicy(walletAddress, dataBytes);

    return {
      approved,
      reason: ethers.toUtf8String(reason),
    };
  } catch (error) {
    console.error('Policy evaluation error:', error);
    throw new Error(`Failed to evaluate policy: ${error.message}`);
  }
}

/**
 * Get treasury wallet balance
 */
export async function getTreasuryBalance(contractAddress, chainKey) {
  try {
    const provider = getProvider(chainKey);
    const contract = new ethers.Contract(contractAddress, TREASURY_WALLET_ABI, provider);
    
    const balance = await contract.getBalance();
    // Convert from wei (6 decimals for USDC)
    const balanceInUSDC = parseFloat(ethers.formatUnits(balance, 6));

    return {
      balance: balanceInUSDC,
      contractAddress,
      chain: chainKey,
    };
  } catch (error) {
    console.error('Treasury balance error:', error);
    throw new Error(`Failed to get treasury balance: ${error.message}`);
  }
}

/**
 * Get policies for a treasury wallet
 */
export async function getWalletPolicies(contractAddress, chainKey) {
  try {
    const provider = getProvider(chainKey);
    const contract = new ethers.Contract(contractAddress, TREASURY_WALLET_ABI, provider);
    
    const policies = await contract.getPolicies();

    return {
      policies: policies.map(addr => addr.toString()),
      contractAddress,
    };
  } catch (error) {
    console.error('Get policies error:', error);
    throw new Error(`Failed to get policies: ${error.message}`);
  }
}

