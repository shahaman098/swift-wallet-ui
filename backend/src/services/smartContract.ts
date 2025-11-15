import { ethers } from 'ethers';
import { Vault } from '../contracts/Vault';
import { RuleEngine } from '../contracts/RuleEngine';
import { OrgRegistry } from '../contracts/OrgRegistry';

// Contract ABIs (simplified - in production, import from compiled contracts)
const VAULT_ABI = [
  'function depositOrg(uint64 orgId, uint256 amount) external',
  'function withdrawOrg(uint64 orgId, uint256 amount, address to) external',
  'function getOrgBalance(uint64 orgId) external view returns (uint256)',
  'function getDeptBalance(uint64 orgId, uint64 deptId) external view returns (uint256)',
];

const RULE_ENGINE_ABI = [
  'function executeAllocation(uint64 orgId, uint64 ruleId) external',
  'function executeDistributions(uint64 orgId, uint64[] memory ruleIds, bytes memory zkProof) external',
];

const ORG_REGISTRY_ABI = [
  'function createOrg(address smartAccount, bytes32 configHash) external returns (uint64)',
  'function getOrg(uint64 orgId) external view returns (uint64 id, address smartAccount, bytes32 configHash, bool active)',
];

export class SmartContractService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private vaultContract: ethers.Contract | null = null;
  private ruleEngineContract: ethers.Contract | null = null;
  private orgRegistryContract: ethers.Contract | null = null;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error('Missing RPC_URL environment variable');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    }
  }

  async initializeContracts() {
    const vaultAddress = process.env.VAULT_CONTRACT_ADDRESS;
    const ruleEngineAddress = process.env.RULE_ENGINE_CONTRACT_ADDRESS;
    const orgRegistryAddress = process.env.ORG_REGISTRY_CONTRACT_ADDRESS;

    if (!vaultAddress || !ruleEngineAddress || !orgRegistryAddress) {
      throw new Error('Missing contract address configuration. Set VAULT_CONTRACT_ADDRESS, RULE_ENGINE_CONTRACT_ADDRESS, and ORG_REGISTRY_CONTRACT_ADDRESS.');
    }

    const runner = this.signer ?? this.provider;

    this.vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, runner);
    this.ruleEngineContract = new ethers.Contract(ruleEngineAddress, RULE_ENGINE_ABI, runner);
    this.orgRegistryContract = new ethers.Contract(orgRegistryAddress, ORG_REGISTRY_ABI, runner);
  }

  async depositToVault(orgId: number, amount: string): Promise<string> {
    if (!this.vaultContract) {
      throw new Error('Vault contract not initialized');
    }
    if (!this.signer) {
      throw new Error('Missing PRIVATE_KEY environment variable for contract interactions');
    }

    const amountWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals
    const tx = await this.vaultContract.depositOrg(orgId, amountWei);
    await tx.wait();
    return tx.hash;
  }

  async getOrgBalance(orgId: number): Promise<string> {
    if (!this.vaultContract) {
      throw new Error('Vault contract not initialized');
    }

    const balance = await this.vaultContract.getOrgBalance(orgId);
    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  }

  async getDeptBalance(orgId: number, deptId: number): Promise<string> {
    if (!this.vaultContract) {
      throw new Error('Vault contract not initialized');
    }

    const balance = await this.vaultContract.getDeptBalance(orgId, deptId);
    return ethers.formatUnits(balance, 6);
  }

  async executeAllocation(orgId: number, ruleId: number): Promise<string> {
    if (!this.ruleEngineContract) {
      throw new Error('RuleEngine contract not initialized');
    }
    if (!this.signer) {
      throw new Error('Missing PRIVATE_KEY environment variable for contract interactions');
    }

    const tx = await this.ruleEngineContract.executeAllocation(orgId, ruleId);
    await tx.wait();
    return tx.hash;
  }

  async executeDistributions(orgId: number, ruleIds: number[], zkProof: string): Promise<string> {
    if (!this.ruleEngineContract) {
      throw new Error('RuleEngine contract not initialized');
    }
    if (!this.signer) {
      throw new Error('Missing PRIVATE_KEY environment variable for contract interactions');
    }

    const tx = await this.ruleEngineContract.executeDistributions(orgId, ruleIds, zkProof);
    await tx.wait();
    return tx.hash;
  }
}

export const smartContractService = new SmartContractService();

