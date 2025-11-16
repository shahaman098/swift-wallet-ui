import dotenv from 'dotenv'
dotenv.config()

// MUST be imported before any viem or Bridge Kit usage
import './viemRpcOverride'

import { BridgeKit, Blockchain } from '@circle-fin/bridge-kit'
import { createAdapterFromPrivateKey } from '@circle-fin/adapter-viem-v2'
import { createPublicClient, createWalletClient, http, padHex, type Chain, parseUnits, type Hash } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygonAmoy } from 'viem/chains'
import { createBridgeJob, updateBridgeJob, getBridgeJob, type BridgeJob } from '../db'
import crypto from 'node:crypto'

const ARC_RPC_URL = process.env.ARC_RPC_URL!
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL!
const MANAGED_BRIDGE_SERVICE_PK = process.env.MANAGED_BRIDGE_SERVICE_PK!

if (!ARC_RPC_URL || !POLYGON_RPC_URL || !MANAGED_BRIDGE_SERVICE_PK) {
  throw new Error('ARC_RPC_URL, POLYGON_RPC_URL, and MANAGED_BRIDGE_SERVICE_PK must be set')
}

const RPC_OVERRIDES: Record<number, string | undefined> = {
  5042002: ARC_RPC_URL,
  80002: POLYGON_RPC_URL,
}

// USDC contract addresses
const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  5042002: '0x3600000000000000000000000000000000000000', // Arc Testnet
  80002: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582', // Polygon Amoy
}

// Service wallet address (derived from MANAGED_BRIDGE_SERVICE_PK)
const SERVICE_WALLET_ADDRESS = privateKeyToAccount(MANAGED_BRIDGE_SERVICE_PK as `0x${string}`).address

type WaitForDepositParams = {
  fromAddress: string
  amount: string
  chain: Blockchain
}

type DepositWaiter = {
  params: WaitForDepositParams
  resolve: (txHash: Hash) => void
  reject: (error: Error) => void
  timeoutId: NodeJS.Timeout
}

const depositWaiters = new Map<string, DepositWaiter>()

const ERC20_TRANSFER_EVENT = {
  type: 'event',
  name: 'Transfer',
  inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'value', type: 'uint256', indexed: false },
  ],
} as const

const kit = new BridgeKit()

export async function submitManagedBridge(params: {
  userSourceAddress: string
  userDestAddress: string
  amount: string
  fromChain: string
  toChain: string
}): Promise<BridgeJob> {
  const jobId = crypto.randomUUID()

  const job = createBridgeJob({
    id: jobId,
    userSourceAddress: params.userSourceAddress,
    userDestAddress: params.userDestAddress,
    amount: params.amount,
    fromChain: params.fromChain,
    toChain: params.toChain,
  })

  processBridgeJob(jobId).catch((error) => {
    console.error(`[managed-bridge] Job ${jobId} failed:`, error)
    updateBridgeJob(jobId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    })
  })

  return job
}

async function processBridgeJob(jobId: string) {
  const job = getBridgeJob(jobId)
  if (!job) {
    throw new Error(`Job ${jobId} not found`)
  }

  updateBridgeJob(jobId, { status: 'awaiting_deposit' })

  // Step 1: Wait for user to deposit USDC to service wallet
  console.log(`[managed-bridge] Waiting for deposit from ${job.userSourceAddress} to ${SERVICE_WALLET_ADDRESS}`)
  const depositTxHash = await waitForDeposit({
    fromAddress: job.userSourceAddress,
    amount: job.amount,
    chain: job.fromChain as Blockchain,
  })

  console.log(`[managed-bridge] Deposit received: ${depositTxHash}`)
  updateBridgeJob(jobId, { 
    status: 'processing',
    depositTxHash,
  })

  const adapter = createAdapterFromPrivateKey({
    privateKey: MANAGED_BRIDGE_SERVICE_PK as `0x${string}`,
    getPublicClient: ({ chain }) => {
      const override = RPC_OVERRIDES[chain.id]
      const url = override ?? chain.rpcUrls?.default?.http?.[0]
      if (!url) {
        throw new Error(`No RPC endpoint configured for chain ${String(chain.id)}`)
      }
      
      // Override the chain's RPC endpoints to force Bridge Kit to use our custom RPC
      const patchedChain: Chain = {
        ...chain,
        rpcUrls: {
          default: { http: [url] },
          public: { http: [url] },
        },
      }
      
      return createPublicClient({
        chain: patchedChain,
        transport: http(url),
      })
    },
  })

  const fromChain = job.fromChain as Blockchain
  const toChain = job.toChain as Blockchain

  console.log(`[managed-bridge] Starting bridge for job ${jobId}`)
  console.log(`[managed-bridge] From: ${fromChain}, To: ${toChain}, Amount: ${job.amount}`)

  try {
    const result = await kit.bridge({
      from: { adapter, chain: fromChain },
      to: { adapter, chain: toChain },
      amount: job.amount,
    })

    console.log(`[managed-bridge] Bridge result for job ${jobId}:`, JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2))

    // Extract transaction hashes from steps
    const approveStep = result.steps.find((s: any) => s.name === 'approve')
    const burnStep = result.steps.find((s: any) => s.name === 'burn')
    const mintStep = result.steps.find((s: any) => s.name === 'mint')
    const attestationStep = result.steps.find((s: any) => s.name === 'fetchAttestation')

    // Check if the bridge actually succeeded
    if (result.state === 'error') {
      const failedStep = result.steps.find((s: any) => s.state === 'error')
      throw new Error(`Bridge failed at ${failedStep?.name || 'unknown'} step: ${failedStep?.errorMessage || 'Unknown error'}`)
    }

    console.log(`[managed-bridge] Bridge complete for job ${jobId}, now sending payout to user`)

    // Step 3: Send the bridged USDC to the user's destination address
    const payoutTxHash = await sendPayoutToUser({
      toAddress: job.userDestAddress,
      amount: job.amount,
      chain: toChain,
    })

    console.log(`[managed-bridge] Payout complete for job ${jobId}: ${payoutTxHash}`)

    updateBridgeJob(jobId, {
      status: 'completed',
      depositTxHash,
      approveTxHash: approveStep?.txHash || null,
      burnTxHash: burnStep?.txHash || null,
      mintTxHash: mintStep?.txHash || null,
      attestation: (attestationStep?.data as any)?.attestation || null,
      payoutTxHash,
    })
  } catch (error: any) {
    console.error(`[managed-bridge] Job ${jobId} failed:`, error)
    console.error(`[managed-bridge] Error details:`, error.message, error.stack)
    
    updateBridgeJob(jobId, {
      status: 'failed',
      errorMessage: error.message || String(error),
    })
  }
}

async function waitForDeposit(params: {
  fromAddress: string
  amount: string
  chain: Blockchain
}): Promise<Hash> {
  const chainId = getChainId(params.chain)
  const usdcAddress = USDC_ADDRESSES[chainId]
  const rpcUrl = RPC_OVERRIDES[chainId]

  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for chain ${params.chain}`)
  }

  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  })

  const expectedAmount = parseUnits(params.amount, 6) // USDC has 6 decimals

  console.log(`[waitForDeposit] Waiting for ${params.amount} USDC deposit from ${params.fromAddress}`)

  let lastCheckedBlock = (await publicClient.getBlockNumber()) - 1n
  if (lastCheckedBlock < 0n) lastCheckedBlock = 0n

  const maxAttempts = 120 // ~10 minutes (120 * 5s)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const currentBlock = await publicClient.getBlockNumber()

      if (currentBlock > lastCheckedBlock) {
        for (let block = lastCheckedBlock + 1n; block <= currentBlock; block++) {
          const logs = await publicClient.getLogs({
            address: usdcAddress,
            event: ERC20_TRANSFER_EVENT,
            args: {
              from: params.fromAddress as `0x${string}`,
              to: SERVICE_WALLET_ADDRESS,
            },
            fromBlock: block,
            toBlock: block,
          })

          for (const log of logs) {
            const value = log.args?.value as bigint | undefined
            if (value && value >= expectedAmount) {
              console.log(`[waitForDeposit] Deposit detected in tx ${log.transactionHash} (block ${block.toString()})`)
              return log.transactionHash as Hash
            }
          }
        }

        lastCheckedBlock = currentBlock
      }

      console.log(`[waitForDeposit] Attempt ${attempt + 1}/${maxAttempts}: no deposit yet, waiting...`)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
      console.error('[waitForDeposit] Error while polling for deposit:', error)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }

  throw new Error('Deposit timeout: user did not send USDC in time')
}

async function sendPayoutToUser(params: {
  toAddress: string
  amount: string
  chain: Blockchain
}): Promise<Hash> {
  const chainId = getChainId(params.chain)
  const usdcAddress = USDC_ADDRESSES[chainId]
  const rpcUrl = RPC_OVERRIDES[chainId]!
  
  const account = privateKeyToAccount(MANAGED_BRIDGE_SERVICE_PK as `0x${string}`)
  const chain = getViemChain(params.chain)

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  })

  const amount = parseUnits(params.amount, 6) // USDC has 6 decimals

  console.log(`[sendPayout] Sending ${params.amount} USDC to ${params.toAddress}`)

  // ERC20 transfer function signature
  const txHash = await walletClient.writeContract({
    address: usdcAddress,
    abi: [{
      type: 'function',
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ type: 'bool' }],
      stateMutability: 'nonpayable',
    }],
    functionName: 'transfer',
    args: [params.toAddress as `0x${string}`, amount],
  })

  console.log(`[sendPayout] Payout transaction sent: ${txHash}`)
  return txHash
}

function getChainId(blockchain: Blockchain): number {
  switch (blockchain) {
    case 'Arc_Testnet':
      return 5042002
    case 'Polygon_Amoy_Testnet':
      return 80002
    default:
      throw new Error(`Unsupported blockchain: ${blockchain}`)
  }
}

function getViemChain(blockchain: Blockchain): Chain {
  switch (blockchain) {
    case 'Arc_Testnet':
      return {
        id: 5042002,
        name: 'Arc Testnet',
        nativeCurrency: { name: 'Arc', symbol: 'Arc', decimals: 18 },
        rpcUrls: {
          default: { http: [ARC_RPC_URL] },
          public: { http: [ARC_RPC_URL] },
        },
      }
    case 'Polygon_Amoy_Testnet':
      return {
        ...polygonAmoy,
        rpcUrls: {
          default: { http: [POLYGON_RPC_URL] },
          public: { http: [POLYGON_RPC_URL] },
        },
      }
    default:
      throw new Error(`Unsupported blockchain: ${blockchain}`)
  }
}

export function getManagedBridgeStatus(jobId: string): BridgeJob | undefined {
  return getBridgeJob(jobId)
}

export function getServiceWalletAddress(): string {
  return SERVICE_WALLET_ADDRESS
}
