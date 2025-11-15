import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'wallet.db');

let db = null;

export function getDatabase() {
  if (!db) {
    try {
      db = new Database(DB_PATH);
      db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
      console.log('✅ Local database initialized at:', DB_PATH);
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
  return db;
}

export async function initializeSchema() {
  const database = getDatabase();
  
  try {
    console.log('Creating database tables...');
    
    // Users table
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        balance REAL DEFAULT 0,
        balances TEXT DEFAULT '{}',
        circle_wallet_id TEXT,
        arc_account_id TEXT,
        smart_contract_wallets TEXT DEFAULT '[]',
        treasury_automation TEXT DEFAULT '[]',
        policies TEXT DEFAULT '[]',
        kyc_status TEXT DEFAULT 'pending',
        kyb_status TEXT DEFAULT 'pending',
        kyc_verified_at TEXT,
        kyb_verified_at TEXT,
        sanctions_check_status TEXT DEFAULT 'pending',
        sanctions_check_at TEXT,
        sanctions_check_result TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
      CREATE INDEX IF NOT EXISTS idx_users_kyb_status ON users(kyb_status);
    `);

    // Transactions table
    database.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        balance_after REAL,
        recipient TEXT,
        note TEXT,
        chain_key TEXT,
        source_chain TEXT,
        destination_chain TEXT,
        settlement_state TEXT DEFAULT 'completed',
        cctp_transfer_id TEXT,
        burn_tx_hash TEXT,
        mint_tx_hash TEXT,
        attestation TEXT,
        sanctions_screened INTEGER DEFAULT 0,
        sanctions_result TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_chain_key ON transactions(chain_key);
    `);

    // KYC/KYB records table
    database.exec(`
      CREATE TABLE IF NOT EXISTS kyc_kyb_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        record_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        document_type TEXT,
        document_number TEXT,
        document_data TEXT,
        verification_provider TEXT,
        verification_result TEXT,
        verified_at TEXT,
        expires_at TEXT,
        rejection_reason TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_kyc_kyb_user_id ON kyc_kyb_records(user_id);
      CREATE INDEX IF NOT EXISTS idx_kyc_kyb_status ON kyc_kyb_records(status);
      CREATE INDEX IF NOT EXISTS idx_kyc_kyb_type ON kyc_kyb_records(record_type);
    `);

    // Sanctions screening records table
    database.exec(`
      CREATE TABLE IF NOT EXISTS sanctions_screenings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        transaction_id TEXT,
        entity_type TEXT NOT NULL,
        entity_identifier TEXT NOT NULL,
        screening_type TEXT NOT NULL,
        screened_value TEXT NOT NULL,
        provider TEXT,
        result TEXT NOT NULL,
        match_details TEXT,
        risk_score REAL,
        screened_at TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_sanctions_user_id ON sanctions_screenings(user_id);
      CREATE INDEX IF NOT EXISTS idx_sanctions_transaction_id ON sanctions_screenings(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_sanctions_result ON sanctions_screenings(result);
      CREATE INDEX IF NOT EXISTS idx_sanctions_screened_at ON sanctions_screenings(screened_at);
    `);

    // Data pipeline logs table
    database.exec(`
      CREATE TABLE IF NOT EXISTS data_pipeline_logs (
        id TEXT PRIMARY KEY,
        pipeline_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        status TEXT NOT NULL,
        input_data TEXT,
        output_data TEXT,
        error_message TEXT,
        processing_time_ms INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_pipeline_type ON data_pipeline_logs(pipeline_type);
      CREATE INDEX IF NOT EXISTS idx_pipeline_status ON data_pipeline_logs(status);
      CREATE INDEX IF NOT EXISTS idx_pipeline_entity ON data_pipeline_logs(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_pipeline_created_at ON data_pipeline_logs(created_at);
    `);

    // Audit log table for compliance
    database.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        changes TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
    `);

    console.log('✅ All database tables created successfully');
  } catch (error) {
    console.error('❌ Schema initialization error:', error.message);
    throw error;
  }
}

export async function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}
