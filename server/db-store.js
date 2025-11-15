import { getDatabase } from './database.js';
import { randomUUID } from 'node:crypto';

export class DatabaseStore {
  constructor() {
    this.db = getDatabase();
    if (!this.db) {
      throw new Error('Database connection not available. Please check your database configuration.');
    }
  }

  // Helper to parse JSON fields
  _parseJson(value, defaultValue = null) {
    if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }

  // Helper to stringify JSON fields
  _stringifyJson(value) {
    if (value === null || value === undefined) return null;
    return JSON.stringify(value);
  }

  // Helper to get current timestamp
  _now() {
    return new Date().toISOString();
  }

  // User operations
  async createUser({ name, email, passwordHash }) {
    const timestamp = this._now();
    const id = randomUUID();
    
    const stmt = this.db.prepare(`
      INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, name, email, passwordHash, timestamp, timestamp);
    
    return this.getUserById(id);
  }

  async findUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email);
    if (!row) return null;
    return this._formatUser(row);
  }

  async getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatUser(row);
  }

  _formatUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      balance: row.balance || 0,
      balances: this._parseJson(row.balances, {}),
      circleWalletId: row.circle_wallet_id || null,
      arcAccountId: row.arc_account_id || null,
      smartContractWallets: this._parseJson(row.smart_contract_wallets, []),
      treasuryAutomation: this._parseJson(row.treasury_automation, []),
      policies: this._parseJson(row.policies, []),
      kycStatus: row.kyc_status || 'pending',
      kybStatus: row.kyb_status || 'pending',
      kycVerifiedAt: row.kyc_verified_at || null,
      kybVerifiedAt: row.kyb_verified_at || null,
      sanctionsCheckStatus: row.sanctions_check_status || 'pending',
      sanctionsCheckAt: row.sanctions_check_at || null,
      sanctionsCheckResult: this._parseJson(row.sanctions_check_result),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async updateUser(id, updates) {
    const timestamp = this._now();
    const fields = [];
    const values = [];

    const allowedFields = {
      name: 'name',
      circleWalletId: 'circle_wallet_id',
      arcAccountId: 'arc_account_id',
      balance: 'balance',
      balances: 'balances',
      smartContractWallets: 'smart_contract_wallets',
      treasuryAutomation: 'treasury_automation',
      policies: 'policies',
      kycStatus: 'kyc_status',
      kybStatus: 'kyb_status',
      kycVerifiedAt: 'kyc_verified_at',
      kybVerifiedAt: 'kyb_verified_at',
      sanctionsCheckStatus: 'sanctions_check_status',
      sanctionsCheckAt: 'sanctions_check_at',
      sanctionsCheckResult: 'sanctions_check_result',
    };

    for (const [key, dbKey] of Object.entries(allowedFields)) {
      if (key in updates) {
        let value = updates[key];
        if (['balances', 'smartContractWallets', 'treasuryAutomation', 'policies', 'sanctionsCheckResult'].includes(key)) {
          value = this._stringifyJson(value);
        }
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.getUserById(id);

    fields.push('updated_at = ?');
    values.push(timestamp);
    values.push(id);

    const stmt = this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getUserById(id);
  }

  async updateUserCircleWallet(id, circleWalletId) {
    return this.updateUser(id, { circleWalletId });
  }

  async updateUserArcAccount(id, arcAccountId) {
    return this.updateUser(id, { arcAccountId });
  }

  async updateUserBalance(id, newBalance) {
    return this.updateUser(id, { balance: newBalance });
  }

  async updateChainBalance(id, chainKey, amount) {
    const user = await this.getUserById(id);
    if (!user) return null;

    const balances = user.balances || {};
    const currentBalance = balances[chainKey] || 0;
    const newBalance = Math.max(0, currentBalance + amount);
    const updatedBalances = { ...balances, [chainKey]: newBalance };
    const totalBalance = Object.values(updatedBalances).reduce((sum, b) => sum + (b || 0), 0);

    return this.updateUser(id, {
      balances: updatedBalances,
      balance: totalBalance,
    });
  }

  async getChainBalance(id, chainKey) {
    const user = await this.getUserById(id);
    if (!user) return null;
    const balances = user.balances || {};
    return balances[chainKey] || 0;
  }

  async getAllChainBalances(id) {
    const user = await this.getUserById(id);
    if (!user) return {};
    return user.balances || {};
  }

  // Transaction operations
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
    sanctionsScreened = false,
    sanctionsResult = null,
  }) {
    const timestamp = this._now();
    const id = randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO transactions (
        id, user_id, type, amount, balance_after, recipient, note,
        chain_key, source_chain, destination_chain, settlement_state,
        cctp_transfer_id, burn_tx_hash, mint_tx_hash, attestation,
        sanctions_screened, sanctions_result, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, userId, type, amount, balanceAfter, recipient, note,
      chainKey, sourceChain, destinationChain, settlementState || 'completed',
      cctpTransferId, burnTxHash, mintTxHash, attestation,
      sanctionsScreened ? 1 : 0, this._stringifyJson(sanctionsResult),
      timestamp, timestamp
    );

    return this.getTransactionById(id);
  }

  async getTransactionById(id) {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatTransaction(row);
  }

  _formatTransaction(row) {
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: row.amount,
      balanceAfter: row.balance_after || null,
      recipient: row.recipient || null,
      note: row.note || null,
      chainKey: row.chain_key || null,
      sourceChain: row.source_chain || null,
      destinationChain: row.destination_chain || null,
      settlementState: row.settlement_state || 'completed',
      cctpTransferId: row.cctp_transfer_id || null,
      burnTxHash: row.burn_tx_hash || null,
      mintTxHash: row.mint_tx_hash || null,
      attestation: row.attestation || null,
      sanctionsScreened: row.sanctions_screened === 1,
      sanctionsResult: this._parseJson(row.sanctions_result),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async updateTransactionSettlement(id, settlementState, updates = {}) {
    const timestamp = this._now();
    const fields = ['settlement_state = ?', 'updated_at = ?'];
    const values = [settlementState, timestamp];

    if (updates.burnTxHash) {
      fields.push('burn_tx_hash = ?');
      values.push(updates.burnTxHash);
    }
    if (updates.mintTxHash) {
      fields.push('mint_tx_hash = ?');
      values.push(updates.mintTxHash);
    }
    if (updates.attestation) {
      fields.push('attestation = ?');
      values.push(updates.attestation);
    }

    values.push(id);

    const stmt = this.db.prepare(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getTransactionById(id);
  }

  async getTransactionsForUser(userId, limit = 20) {
    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
    
    const stmt = this.db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(userId, normalizedLimit);
    return rows.map(row => this._formatTransaction(row));
  }

  // Smart contract wallets
  async addSmartContractWallet(userId, walletData) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const wallets = user.smartContractWallets || [];
    const wallet = {
      id: randomUUID(),
      ...walletData,
      createdAt: this._now(),
    };
    wallets.push(wallet);

    await this.updateUser(userId, { smartContractWallets: wallets });
    return wallet;
  }

  async getSmartContractWallets(userId) {
    const user = await this.getUserById(userId);
    if (!user) return [];
    return user.smartContractWallets || [];
  }

  // Treasury automation
  async addTreasuryAutomation(userId, automationData) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const automations = user.treasuryAutomation || [];
    const automation = {
      id: randomUUID(),
      ...automationData,
      active: automationData.active !== false,
      createdAt: this._now(),
    };
    automations.push(automation);

    await this.updateUser(userId, { treasuryAutomation: automations });
    return automation;
  }

  async getTreasuryAutomations(userId) {
    const user = await this.getUserById(userId);
    if (!user) return [];
    return user.treasuryAutomation || [];
  }

  async updateTreasuryAutomation(userId, automationId, updates) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const automations = user.treasuryAutomation || [];
    const index = automations.findIndex(a => a.id === automationId);
    if (index === -1) return null;

    automations[index] = {
      ...automations[index],
      ...updates,
      updatedAt: this._now(),
    };

    await this.updateUser(userId, { treasuryAutomation: automations });
    return automations[index];
  }

  // Policies
  async addPolicy(userId, policyData) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const policies = user.policies || [];
    const policy = {
      id: randomUUID(),
      ...policyData,
      createdAt: this._now(),
    };
    policies.push(policy);

    await this.updateUser(userId, { policies });
    return policy;
  }

  async getPolicies(userId) {
    const user = await this.getUserById(userId);
    if (!user) return [];
    return user.policies || [];
  }

  async updatePolicy(userId, policyId, updates) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const policies = user.policies || [];
    const index = policies.findIndex(p => p.id === policyId);
    if (index === -1) return null;

    policies[index] = {
      ...policies[index],
      ...updates,
      updatedAt: this._now(),
    };

    await this.updateUser(userId, { policies });
    return policies[index];
  }

  // KYC/KYB operations
  async createKycKybRecord(userId, recordType, data) {
    const timestamp = this._now();
    const id = randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO kyc_kyb_records (
        id, user_id, record_type, status, document_type, document_number,
        document_data, verification_provider, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      recordType,
      data.status || 'pending',
      data.documentType || null,
      data.documentNumber || null,
      this._stringifyJson(data.documentData),
      data.verificationProvider || null,
      timestamp,
      timestamp
    );

    return this.getKycKybRecordById(id);
  }

  async getKycKybRecordById(id) {
    const stmt = this.db.prepare('SELECT * FROM kyc_kyb_records WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatKycKybRecord(row);
  }

  _formatKycKybRecord(row) {
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      recordType: row.record_type,
      status: row.status,
      documentType: row.document_type,
      documentNumber: row.document_number,
      documentData: this._parseJson(row.document_data),
      verificationProvider: row.verification_provider,
      verificationResult: this._parseJson(row.verification_result),
      verifiedAt: row.verified_at,
      expiresAt: row.expires_at,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async updateKycKybRecord(id, updates) {
    const timestamp = this._now();
    const fields = [];
    const values = [];

    const allowedFields = {
      status: 'status',
      verificationResult: 'verification_result',
      verifiedAt: 'verified_at',
      expiresAt: 'expires_at',
      rejectionReason: 'rejection_reason',
    };

    for (const [key, dbKey] of Object.entries(allowedFields)) {
      if (key in updates) {
        let value = updates[key];
        if (key === 'verificationResult') {
          value = this._stringifyJson(value);
        }
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.getKycKybRecordById(id);

    fields.push('updated_at = ?');
    values.push(timestamp);
    values.push(id);

    const stmt = this.db.prepare(`UPDATE kyc_kyb_records SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    const record = this.getKycKybRecordById(id);
    if (!record) return null;

    // Update user's KYC/KYB status if verified
    if (updates.status === 'verified' && updates.verifiedAt && record) {
      const statusField = record.recordType === 'kyc' ? 'kycStatus' : 'kybStatus';
      const verifiedAtField = record.recordType === 'kyc' ? 'kycVerifiedAt' : 'kybVerifiedAt';
      await this.updateUser(record.userId, {
        [statusField]: 'verified',
        [verifiedAtField]: updates.verifiedAt,
      });
    }

    return record;
  }

  async getKycKybRecordsForUser(userId, recordType = null) {
    let stmt;
    let rows;
    if (recordType) {
      stmt = this.db.prepare(`
        SELECT * FROM kyc_kyb_records 
        WHERE user_id = ? AND record_type = ? 
        ORDER BY created_at DESC
      `);
      rows = stmt.all(userId, recordType);
    } else {
      stmt = this.db.prepare(`
        SELECT * FROM kyc_kyb_records 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `);
      rows = stmt.all(userId);
    }
    return rows.map(row => this._formatKycKybRecord(row));
  }

  // Sanctions screening operations
  async createSanctionsScreening(data) {
    const timestamp = this._now();
    const id = randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO sanctions_screenings (
        id, user_id, transaction_id, entity_type, entity_identifier,
        screening_type, screened_value, provider, result, match_details,
        risk_score, screened_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.userId || null,
      data.transactionId || null,
      data.entityType,
      data.entityIdentifier,
      data.screeningType,
      data.screenedValue,
      data.provider || null,
      data.result || 'pending',
      this._stringifyJson(data.matchDetails),
      data.riskScore || null,
      data.screenedAt || timestamp,
      timestamp
    );

    return this.getSanctionsScreeningById(id);
  }

  async getSanctionsScreeningById(id) {
    const stmt = this.db.prepare('SELECT * FROM sanctions_screenings WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatSanctionsScreening(row);
  }

  _formatSanctionsScreening(row) {
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      transactionId: row.transaction_id,
      entityType: row.entity_type,
      entityIdentifier: row.entity_identifier,
      screeningType: row.screening_type,
      screenedValue: row.screened_value,
      provider: row.provider,
      result: row.result,
      matchDetails: this._parseJson(row.match_details),
      riskScore: row.risk_score,
      screenedAt: row.screened_at,
      createdAt: row.created_at,
    };
  }

  async getSanctionsScreeningsForUser(userId, limit = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM sanctions_screenings 
      WHERE user_id = ? 
      ORDER BY screened_at DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(userId, limit);
    return rows.map(row => this._formatSanctionsScreening(row));
  }

  // Data pipeline operations
  async createPipelineLog(data) {
    const timestamp = this._now();
    const id = randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO data_pipeline_logs (
        id, pipeline_type, entity_type, entity_id, status,
        input_data, output_data, error_message, processing_time_ms,
        created_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.pipelineType,
      data.entityType,
      data.entityId,
      data.status || 'pending',
      this._stringifyJson(data.inputData),
      this._stringifyJson(data.outputData),
      data.errorMessage || null,
      data.processingTimeMs || null,
      timestamp,
      data.completedAt || null
    );

    return this.getPipelineLogById(id);
  }

  async getPipelineLogById(id) {
    const stmt = this.db.prepare('SELECT * FROM data_pipeline_logs WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatPipelineLog(row);
  }

  _formatPipelineLog(row) {
    if (!row) return null;
    return {
      id: row.id,
      pipelineType: row.pipeline_type,
      entityType: row.entity_type,
      entityId: row.entity_id,
      status: row.status,
      inputData: this._parseJson(row.input_data),
      outputData: this._parseJson(row.output_data),
      errorMessage: row.error_message,
      processingTimeMs: row.processing_time_ms,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    };
  }

  async updatePipelineLog(id, updates) {
    const fields = [];
    const values = [];

    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.outputData !== undefined) {
      fields.push('output_data = ?');
      values.push(this._stringifyJson(updates.outputData));
    }
    if (updates.errorMessage !== undefined) {
      fields.push('error_message = ?');
      values.push(updates.errorMessage);
    }
    if (updates.processingTimeMs !== undefined) {
      fields.push('processing_time_ms = ?');
      values.push(updates.processingTimeMs);
    }
    if (updates.completedAt !== undefined) {
      fields.push('completed_at = ?');
      values.push(updates.completedAt);
    }

    if (fields.length === 0) return this.getPipelineLogById(id);

    values.push(id);

    const stmt = this.db.prepare(`UPDATE data_pipeline_logs SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getPipelineLogById(id);
  }

  // Audit log operations
  async createAuditLog(data) {
    const timestamp = this._now();
    const id = randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, action, entity_type, entity_id, changes,
        ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.userId || null,
      data.action,
      data.entityType,
      data.entityId || null,
      this._stringifyJson(data.changes),
      data.ipAddress || null,
      data.userAgent || null,
      timestamp
    );

    return id;
  }

  // Legacy compatibility methods
  async load() {
    return { users: [], transactions: [] };
  }

  async save() {
    // No-op for database store
  }

  async reset() {
    // This would be dangerous in production, so we'll make it a no-op
    throw new Error('Reset not allowed for database store');
  }
}
