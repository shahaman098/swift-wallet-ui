export type WalletPreview = {
  chain: string
  address: string
  balance: number
}

export type AuthUser = {
  id: string
  username: string
  walletId: string | null
}

export type AuthState = {
  user: AuthUser | null
  isLoading: boolean
}

export type TransferRequest = {
  amount: number
  fromNetwork: string
  toNetwork: string
}

export type PaymentIntentPayload = {
  amount: number
  recipient: string
}

export type PaymentIntentResponse = {
  id: string
  status: 'pending' | 'succeeded' | 'failed'
}
