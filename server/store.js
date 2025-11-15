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
      balance: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.state.users.push(user);
    await this.save();

    return { ...user };
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

  async addTransaction({ userId, type, amount, balanceAfter, recipient, note }) {
    await this.load();
    const transaction = {
      id: randomUUID(),
      userId,
      type,
      amount,
      balanceAfter,
      recipient: recipient ? String(recipient) : undefined,
      note: note ? String(note) : undefined,
      createdAt: new Date().toISOString(),
    };

    this.state.transactions.push(transaction);
    await this.save();

    return { ...transaction };
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
}
