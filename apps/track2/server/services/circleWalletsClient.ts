import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'

const API_KEY = process.env.CIRCLE_API_KEY!
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET!

if (!API_KEY || !ENTITY_SECRET) {
  throw new Error('CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set')
}

export const circleWalletsClient = new CircleDeveloperControlledWalletsClient({
  apiKey: API_KEY,
  entitySecret: ENTITY_SECRET,
})

export async function getWallet(walletId: string) {
  const response = await circleWalletsClient.getWallet({ id: walletId })
  return response.data?.wallet
}

export async function signTransaction(params: {
  walletId: string
  transaction: string
}): Promise<string> {
  const response = await circleWalletsClient.signTransaction({
    walletId: params.walletId,
    transaction: params.transaction,
  })
  return response.data?.signedTransaction ?? ''
}
