import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import Database from 'better-sqlite3'

const DEFAULT_DB_PATH = path.resolve(process.cwd(), 'data/app.db')

const dbPath = process.env.SQLITE_DB_PATH ? path.resolve(process.cwd(), process.env.SQLITE_DB_PATH) : DEFAULT_DB_PATH
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

export const ensureSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      wallet_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bridge_jobs (
      id TEXT PRIMARY KEY,
      user_source_address TEXT NOT NULL,
      user_dest_address TEXT NOT NULL,
      amount TEXT NOT NULL,
      from_chain TEXT NOT NULL,
      to_chain TEXT NOT NULL,
      status TEXT NOT NULL,
      deposit_tx_hash TEXT,
      approve_tx_hash TEXT,
      burn_tx_hash TEXT,
      attestation TEXT,
      mint_tx_hash TEXT,
      payout_tx_hash TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bridge_job_events (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES bridge_jobs(id)
    );
  `)
}

ensureSchema()

export type UserRow = {
  id: string
  username: string
  password_hash: string
  wallet_id: string | null
}

export type User = {
  id: string
  username: string
  passwordHash: string
  walletId: string | null
}

const toUser = (row: UserRow | undefined): User | undefined => {
  if (!row) return undefined
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    walletId: row.wallet_id,
  }
}

const insertUserStmt = db.prepare(
  'INSERT INTO users (id, username, password_hash, wallet_id, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
)

const selectUserStmt = db.prepare('SELECT * FROM users WHERE username = ?')
const listUsersStmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC')
const updateWalletStmt = db.prepare(
  'UPDATE users SET wallet_id = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?'
)

export function createUser(username: string, passwordHash: string): User {
  const id = crypto.randomUUID()
  insertUserStmt.run(id, username, passwordHash, null)
  return { id, username, passwordHash, walletId: null }
}

export function getUserByUsername(username: string): User | undefined {
  const row = selectUserStmt.get(username) as UserRow | undefined
  return toUser(row)
}

export function updateUserWallet(username: string, walletId: string | null): User | undefined {
  updateWalletStmt.run(walletId, username)
  return getUserByUsername(username)
}

export function listUsers(): User[] {
  return (listUsersStmt.all() as UserRow[]).map((row) => toUser(row)!)
}

export type BridgeJobRow = {
  id: string
  user_source_address: string
  user_dest_address: string
  amount: string
  from_chain: string
  to_chain: string
  status: string
  deposit_tx_hash: string | null
  approve_tx_hash: string | null
  burn_tx_hash: string | null
  attestation: string | null
  mint_tx_hash: string | null
  payout_tx_hash: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export type BridgeJob = {
  id: string
  userSourceAddress: string
  userDestAddress: string
  amount: string
  fromChain: string
  toChain: string
  status: string
  depositTxHash: string | null
  approveTxHash: string | null
  burnTxHash: string | null
  attestation: string | null
  mintTxHash: string | null
  payoutTxHash: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

const toBridgeJob = (row: BridgeJobRow | undefined): BridgeJob | undefined => {
  if (!row) return undefined
  return {
    id: row.id,
    userSourceAddress: row.user_source_address,
    userDestAddress: row.user_dest_address,
    amount: row.amount,
    fromChain: row.from_chain,
    toChain: row.to_chain,
    status: row.status,
    depositTxHash: row.deposit_tx_hash,
    approveTxHash: row.approve_tx_hash,
    burnTxHash: row.burn_tx_hash,
    attestation: row.attestation,
    mintTxHash: row.mint_tx_hash,
    payoutTxHash: row.payout_tx_hash,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const insertBridgeJobStmt = db.prepare(`
  INSERT INTO bridge_jobs (
    id, user_source_address, user_dest_address, amount, from_chain, to_chain, status,
    deposit_tx_hash, approve_tx_hash, burn_tx_hash, attestation, mint_tx_hash, payout_tx_hash,
    error_message, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`)

const selectBridgeJobStmt = db.prepare('SELECT * FROM bridge_jobs WHERE id = ?')
const updateBridgeJobStmt = db.prepare(`
  UPDATE bridge_jobs SET
    status = ?,
    deposit_tx_hash = ?,
    approve_tx_hash = ?,
    burn_tx_hash = ?,
    attestation = ?,
    mint_tx_hash = ?,
    payout_tx_hash = ?,
    error_message = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`)

export function createBridgeJob(params: {
  id: string
  userSourceAddress: string
  userDestAddress: string
  amount: string
  fromChain: string
  toChain: string
}): BridgeJob {
  insertBridgeJobStmt.run(
    params.id,
    params.userSourceAddress,
    params.userDestAddress,
    params.amount,
    params.fromChain,
    params.toChain,
    'pending',
    null,
    null,
    null,
    null,
    null,
    null,
    null
  )
  return getBridgeJob(params.id)!
}

export function getBridgeJob(id: string): BridgeJob | undefined {
  const row = selectBridgeJobStmt.get(id) as BridgeJobRow | undefined
  return toBridgeJob(row)
}

export function updateBridgeJob(id: string, updates: Partial<BridgeJob>): BridgeJob | undefined {
  const current = getBridgeJob(id)
  if (!current) return undefined

  updateBridgeJobStmt.run(
    updates.status ?? current.status,
    updates.depositTxHash ?? current.depositTxHash,
    updates.approveTxHash ?? current.approveTxHash,
    updates.burnTxHash ?? current.burnTxHash,
    updates.attestation ?? current.attestation,
    updates.mintTxHash ?? current.mintTxHash,
    updates.payoutTxHash ?? current.payoutTxHash,
    updates.errorMessage ?? current.errorMessage,
    id
  )
  return getBridgeJob(id)
}

export { db, dbPath }
