const GATEWAY_BASE_URL = 'https://gateway-api-testnet.circle.com/v1'

export type GatewayInfoResponse = {
  domains: Array<{
    chain: string
    network: string
    domain: number
    walletContract?: string
    minterContract?: string
  }>
}

export type GatewayBalanceRequest = {
  token: string
  sources: Array<{
    depositor: string
    domain: number
  }>
}

export type GatewayBalanceResponse = {
  balances: Array<{
    domain: number
    balance: string
  }>
}

export class GatewayClient {
  async info(): Promise<GatewayInfoResponse> {
    return this.get<GatewayInfoResponse>('/info')
  }

  async balances(payload: GatewayBalanceRequest): Promise<GatewayBalanceResponse> {
    return this.post<GatewayBalanceResponse>('/balances', payload)
  }

  async transfer<T>(body: T) {
    return this.post('/transfer', body)
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${GATEWAY_BASE_URL}${path}`)
    if (!response.ok) {
      throw new Error(`Gateway GET ${path} failed: ${response.status}`)
    }
    return response.json() as Promise<T>
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${GATEWAY_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body, (_key, value) => (typeof value === 'bigint' ? value.toString() : value)),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(`Gateway POST ${path} failed: ${message || response.status}`)
    }

    return response.json() as Promise<T>
  }
}
