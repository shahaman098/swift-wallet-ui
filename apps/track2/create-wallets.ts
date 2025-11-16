import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'
import dotenv from 'dotenv'
import fs from 'node:fs'

dotenv.config()

const client = new CircleDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
})

async function main() {
  console.log('Creating wallet set...')
  const walletSetResponse = await client.createWalletSet({
    name: 'Hackathon Managed Bridge Wallet Set',
  })

  const walletSetId = walletSetResponse.data?.walletSet?.id
  if (!walletSetId) {
    throw new Error('Failed to create wallet set')
  }

  console.log('✅ Wallet set created:', walletSetId)

  console.log('\nCreating wallets on Arc Testnet and Polygon Amoy...')
  const walletsResponse = await client.createWallets({
    accountType: 'EOA',
    blockchains: ['ARC-TESTNET', 'MATIC-AMOY'],
    count: 1,
    walletSetId,
  })

  const wallets = walletsResponse.data?.wallets
  if (!wallets || wallets.length !== 2) {
    throw new Error('Failed to create wallets')
  }

  const arcWallet = wallets.find((w) => w.blockchain === 'ARC-TESTNET')
  const polygonWallet = wallets.find((w) => w.blockchain === 'MATIC-AMOY')

  if (!arcWallet || !polygonWallet) {
    throw new Error('Missing Arc or Polygon wallet')
  }

  console.log('\n✅ Wallets created successfully!')
  console.log('\n📝 Add these to your .env file:')
  console.log(`CIRCLE_WALLET_SET_ID="${walletSetId}"`)
  console.log(`ARC_MANAGED_WALLET_ID="${arcWallet.id}"`)
  console.log(`ARC_MANAGED_WALLET_ADDRESS="${arcWallet.address}"`)
  console.log(`POLYGON_MANAGED_WALLET_ID="${polygonWallet.id}"`)
  console.log(`POLYGON_MANAGED_WALLET_ADDRESS="${polygonWallet.address}"`)

  const envUpdates = `
CIRCLE_WALLET_SET_ID="${walletSetId}"
ARC_MANAGED_WALLET_ID="${arcWallet.id}"
ARC_MANAGED_WALLET_ADDRESS="${arcWallet.address}"
POLYGON_MANAGED_WALLET_ID="${polygonWallet.id}"
POLYGON_MANAGED_WALLET_ADDRESS="${polygonWallet.address}"
`

  fs.appendFileSync('.env.wallet-ids', envUpdates)
  console.log('\n💾 Values also saved to .env.wallet-ids')
}

main().catch(console.error)
