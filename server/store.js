import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

async function readDataFile() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        transactions: Array.isArray(parsed.transactions)
          ? parsed.transactions
          : [],
      };
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return { users: [], transactions: [] };
}

async function writeDataFile(state) {
  await writeFile(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

export class DataStore {
  constructor() {
    this.state = { users: [], transactions: [] };
    this.loaded = false;
  }

  async load() {
    if (!this.loaded) {
      this.state = await readDataFile();
      this.loaded = true;
    }
    return this.state;
  }

  async save() {
    await writeDataFile(this.state);
  }

  async reset() {
    this.state = { users: [], transactions: [] };
    this.loaded = true;
    await this.save();
  }

  async createUser({ name, email, passwordHash }) {
    await this.load();
    const timestamp = new Date().toISOString();
    const user = {
      id: randomUUID(),
      name,
      email,
      passwordHash,
      balance: 0, // Legacy field for backward compatibility
      balances: {}, // Multi-chain balances: { 'ETH-SEPOLIA': 100, 'AVAX-FUJI': 50 }
      circleWalletId: null,
      arcAccountId: null,
      smartContractWallets: [], // Array of { type: 'treasury'|'safe', address, chain, deployedAt }
      treasuryAutomation: [], // Array of automation rules
      policies: [], // Array of policy configurations
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.state.users.push(user);
    await this.save();

    return { ...user };
  }

  async updateUserCircleWallet(id, circleWalletId) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const updatedAt = new Date().toISOString();
    const updatedUser = {
      ...this.state.users[index],
      circleWalletId,
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return { ...updatedUser };
  }

  async updateUserArcAccount(id, arcAccountId) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const updatedAt = new Date().toISOString();
    const updatedUser = {
      ...this.state.users[index],
      arcAccountId,
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return { ...updatedUser };
  }

  async findUserByEmail(email) {
    await this.load();
    const user = this.state.users.find((item) => item.email === email);
    return user ? { ...user } : null;
  }

  async getUserById(id) {
    await this.load();
    const user = this.state.users.find((item) => item.id === id);
    return user ? { ...user } : null;
  }

  async updateUserBalance(id, newBalance) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const updatedAt = new Date().toISOString();
    const updatedUser = {
      ...this.state.users[index],
      balance: newBalance,
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return { ...updatedUser };
  }

  async updateChainBalance(id, chainKey, amount) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const user = this.state.users[index];
    const balances = user.balances || {};
    const currentBalance = balances[chainKey] || 0;
    const newBalance = Math.max(0, currentBalance + amount);

    const updatedAt = new Date().toISOString();
    const updatedUser = {
      ...user,
      balances: {
        ...balances,
        [chainKey]: newBalance,
      },
      // Update legacy balance as sum of all chains
      balance: Object.values({ ...balances, [chainKey]: newBalance }).reduce((sum, b) => sum + (b || 0), 0),
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return { ...updatedUser };
  }

  async getChainBalance(id, chainKey) {
    await this.load();
    const user = this.state.users.find((item) => item.id === id);
    if (!user) {
      return null;
    }

    const balances = user.balances || {};
    return balances[chainKey] || 0;
  }

  async getAllChainBalances(id) {
    await this.load();
    const user = this.state.users.find((item) => item.id === id);
    if (!user) {
      return {};
    }

    return user.balances || {};
  }

  async addTransaction({ 
    userId, 
    type, 
    amount, 
    balanceAfter, 
    recipient, 
    note,
    chainKey,
    sourceChain,
    destinationChain,
    settlementState,
    cctpTransferId,
    burnTxHash,
    mintTxHash,
    attestation,
  }) {
    await this.load();
    const transaction = {
      id: randomUUID(),
      userId,
      type,
      amount,
      balanceAfter,
      recipient: recipient ? String(recipient) : undefined,
      note: note ? String(note) : undefined,
      chainKey: chainKey || undefined,
      sourceChain: sourceChain || undefined,
      destinationChain: destinationChain || undefined,
      settlementState: settlementState || (type === 'send' && sourceChain !== destinationChain ? 'pending' : 'completed'),
      cctpTransferId: cctpTransferId || undefined,
      burnTxHash: burnTxHash || undefined,
      mintTxHash: mintTxHash || undefined,
      attestation: attestation || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.transactions.push(transaction);
    await this.save();

    return { ...transaction };
  }

  async updateTransactionSettlement(id, settlementState, updates = {}) {
    await this.load();
    const index = this.state.transactions.findIndex((tx) => tx.id === id);
    if (index === -1) {
      return null;
    }

    const updatedAt = new Date().toISOString();
    const updatedTransaction = {
      ...this.state.transactions[index],
      settlementState,
      updatedAt,
      ...updates,
    };

    this.state.transactions[index] = updatedTransaction;
    await this.save();

    return { ...updatedTransaction };
  }

  async getTransactionsForUser(userId, limit = 20) {
    await this.load();
    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 20, 100));

    const transactions = this.state.transactions
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, normalizedLimit)
      .map((transaction) => ({ ...transaction }));

    return transactions;
  }

  async addSmartContractWallet(userId, walletData) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === userId);
    if (index === -1) {
      return null;
    }

    const user = this.state.users[index];
    const wallets = user.smartContractWallets || [];
    
    const wallet = {
      id: randomUUID(),
      ...walletData,
      createdAt: new Date().toISOString(),
    };
    
    wallets.push(wallet);

    const updatedAt = new Date().toISOString();
    const updatedUser = {
      ...user,
      smartContractWallets: wallets,
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return wallet;
  }

  async getSmartContractWallets(userId) {
    await this.load();
    const user = this.state.users.find((item) => item.id === userId);
    if (!user) {
      return [];
    }

    return user.smartContractWallets || [];
  }

  async addTreasuryAutomation(userId, automationData) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === userId);
    if (index === -1) {
      return null;
    }

    const user = this.state.users[index];
    const automations = user.treasuryAutomation || [];
    
    const automation = {
      id: randomUUID(),
      ...automationData,
      active: automationData.active !== false,
      createdAt: new Date().toISOString(),
    };
    
    automations.push(automation);

    const updatedAt = new Date().toISOString();
    const updatedUser = {
      ...user,
      treasuryAutomation: automations,
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return automation;
  }

  async getTreasuryAutomations(userId) {
    await this.load();
    const user = this.state.users.find((item) => item.id === userId);
    if (!user) {
      return [];
    }

    return user.treasuryAutomation || [];
  }

  async updateTreasuryAutomation(userId, automationId, updates) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === userId);
    if (index === -1) {
      return null;
    }

    const user = this.state.users[index];
    const automations = user.treasuryAutomation || [];
    const automationIndex = automations.findIndex(a => a.id === automationId);
    
    if (automationIndex === -1) {
      return null;
    }

    const updatedAt = new Date().toISOString();
    automations[automationIndex] = {
      ...automations[automationIndex],
      ...updates,
      updatedAt,
    };

    const updatedUser = {
      ...user,
      treasuryAutomation: automations,
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return automations[automationIndex];
  }

  async addPolicy(userId, policyData) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === userId);
    if (index === -1) {
      return null;
    }

    const user = this.state.users[index];
    const policies = user.policies || [];
    
    const policy = {
      id: randomUUID(),
      ...policyData,
      createdAt: new Date().toISOString(),
    };
    
    policies.push(policy);

    const updatedAt = new Date().toISOString();
    const updatedUser = {
      ...user,
      policies: policies,
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return policy;
  }

  async getPolicies(userId) {
    await this.load();
    const user = this.state.users.find((item) => item.id === userId);
    if (!user) {
      return [];
    }

    return user.policies || [];
  }

  async updatePolicy(userId, policyId, updates) {
    await this.load();
    const index = this.state.users.findIndex((item) => item.id === userId);
    if (index === -1) {
      return null;
    }

    const user = this.state.users[index];
    const policies = user.policies || [];
    const policyIndex = policies.findIndex(p => p.id === policyId);
    
    if (policyIndex === -1) {
      return null;
    }

    const updatedAt = new Date().toISOString();
    policies[policyIndex] = {
      ...policies[policyIndex],
      ...updates,
      updatedAt,
    };

    const updatedUser = {
      ...user,
      policies: policies,
      updatedAt,
    };

    this.state.users[index] = updatedUser;
    await this.save();

    return policies[policyIndex];
  }
}
