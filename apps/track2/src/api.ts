import type {
  AuthUser,
  PaymentIntentPayload,
  PaymentIntentResponse,
  TransferRequest,
  WalletPreview,
} from './types'

const AUTH_BASE = '/api/auth'
const CIRCLE_BASE = '/api/circle'

async function parseJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    const message = text || fallbackMessage
    return Promise.reject(new Error(message))
  }

  return response.json() as Promise<T>
}

export function signupRequest(username: string, password: string) {
  return fetch(`${AUTH_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then((response) => parseJson<AuthUser>(response, 'Signup failed'))
}

export function loginRequest(username: string, password: string) {
  return fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then((response) => parseJson<AuthUser>(response, 'Login failed'))
}

export function fetchWallets() {
  return fetch(`${CIRCLE_BASE}/mock-wallets`).then((response) =>
    parseJson<{ wallets: WalletPreview[] }>(response, 'Failed to fetch wallets')
  )
}

export function submitCctpTransfer(payload: TransferRequest) {
  return fetch(`${CIRCLE_BASE}/cctp-transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((response) => parseJson<{ status: string; message: string }>(response, 'Failed to submit CCTP transfer'))
}

export function createPaymentIntent(payload: PaymentIntentPayload) {
  return fetch(`${CIRCLE_BASE}/payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((response) => parseJson<PaymentIntentResponse | { status: string; message: string }>(response, 'Failed to create payment intent'))
}

export type ManagedBridgeSubmitRequest = {
  userSourceAddress: string
  userDestAddress: string
  amount: string
  fromChain: string
  toChain: string
}

export type ManagedBridgeJob = {
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

export function submitManagedBridge(payload: ManagedBridgeSubmitRequest) {
  return fetch('/api/managed-bridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((response) => parseJson<{ jobId: string; status: string }>(response, 'Failed to submit managed bridge'))
}

export async function getManagedBridgeStatus(jobId: string): Promise<ManagedBridgeJob> {
  const res = await fetch(`/api/managed-bridge/${jobId}`)
  if (!res.ok) throw new Error('Failed to get bridge status')
  return res.json()
}

export async function getServiceWalletAddress(): Promise<string> {
  const res = await fetch('/api/managed-bridge/service-wallet')
  if (!res.ok) throw new Error('Failed to get service wallet address')
  const data = await res.json()
  return data.address
}
