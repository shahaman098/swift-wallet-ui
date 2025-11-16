// MUST be imported first to intercept RPC calls
import './rpcOverride'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Buffer } from 'buffer'
import { BridgeKit, Blockchain, type ChainIdentifier } from '@circle-fin/bridge-kit'
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import { createPublicClient, http } from 'viem'
import type { EIP1193Provider } from 'viem'
import { submitManagedBridge, getManagedBridgeStatus, getServiceWalletAddress, type ManagedBridgeJob } from './api'
import { BridgeStepper } from './components/BridgeStepper'

if (typeof window !== 'undefined') {
  const globalWindow = window as typeof window & { Buffer?: typeof Buffer }
  if (!globalWindow.Buffer) {
    globalWindow.Buffer = Buffer
  }
}

const baseStyles = {
  page: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '1.25rem',
    fontFamily: 'Inter, system-ui, sans-serif',
    display: 'grid',
    gap: '1rem',
  },
  card: {
    borderRadius: '0.9rem',
    border: '1px solid rgba(17, 24, 39, 0.12)',
    padding: '1.1rem',
    background: '#fff',
    boxShadow: '0 20px 35px -30px rgba(15, 23, 42, 0.35)',
  },
  label: {
    display: 'grid',
    gap: '0.35rem',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  input: {
    padding: '0.75rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(15, 23, 42, 0.12)',
    fontSize: '0.95rem',
  },
  button: {
    padding: '0.85rem 1rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: '#111827',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
}

const CHAIN_OPTIONS: { label: string; value: Blockchain }[] = [
  { label: 'Arc Testnet', value: Blockchain.Arc_Testnet },
  { label: 'Base Sepolia', value: Blockchain.Base_Sepolia },
  { label: 'Ethereum Sepolia', value: Blockchain.Ethereum_Sepolia },
  { label: 'Polygon Amoy', value: Blockchain.Polygon_Amoy_Testnet },
]

const ARC_RPC_URL = (import.meta as ImportMeta & { env: { VITE_ARC_RPC_URL?: string } }).env.VITE_ARC_RPC_URL
const POLYGON_RPC_URL = (import.meta as ImportMeta & { env: { VITE_POLYGON_RPC_URL?: string } }).env.VITE_POLYGON_RPC_URL

const RPC_OVERRIDES: Record<number, string | undefined> = {
  5042002: ARC_RPC_URL,
  80002: POLYGON_RPC_URL,
}

const getInjectedProvider = (): EIP1193Provider => {
  if (typeof window === 'undefined') {
    throw new Error('window is not available')
  }

  const provider = (window as unknown as { ethereum?: unknown }).ethereum as EIP1193Provider | undefined
  if (!provider) {
    throw new Error('No injected EVM wallet found')
  }

  return provider
}

export function App() {
  const kit = useMemo(() => new BridgeKit(), [])
  const [mode, setMode] = useState<'self' | 'managed'>('self')
  const [account, setAccount] = useState<string>('')
  const [fromChain, setFromChain] = useState<ChainIdentifier>(Blockchain.Base_Sepolia)
  const [toChain, setToChain] = useState<ChainIdentifier>(Blockchain.Arc_Testnet)
  const [amount, setAmount] = useState<string>('10.00')
  const [status, setStatus] = useState<string>('Idle')
  const [output, setOutput] = useState<string>('')
  const [hasProvider, setHasProvider] = useState<boolean>(false)
  const [managedJob, setManagedJob] = useState<ManagedBridgeJob | null>(null)
  const [serviceWalletAddress, setServiceWalletAddress] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setHasProvider(Boolean((window as unknown as { ethereum?: unknown }).ethereum))
  }, [])

  useEffect(() => {
    getServiceWalletAddress().then(setServiceWalletAddress).catch(console.error)
  }, [])

  const connectWallet = async () => {
    if (!hasProvider) {
      setStatus('No injected EVM wallet found. Install MetaMask or Arc Wallet and reload.')
      return
    }

    const provider = getInjectedProvider()
    const accounts = (await provider.request({
      method: 'eth_requestAccounts',
    })) as string[]
    setAccount(accounts[0] ?? '')
  }

  const handleSelfBridge = async () => {
    if (!hasProvider) {
      setStatus('No injected EVM wallet found. Install MetaMask or Arc Wallet and reload.')
      return
    }
    const provider = getInjectedProvider()
    setStatus('Bridging...')
    setOutput('')

    const adapter = await createAdapterFromProvider({
      provider,
      getPublicClient: ({ chain }) => {
        const override = RPC_OVERRIDES[chain.id]
        const url = override ?? chain.rpcUrls?.default?.http?.[0]
        if (!url) {
          throw new Error(`No RPC endpoint configured for chain ${String(chain.id)}`)
        }
        return createPublicClient({
          chain,
          transport: http(url),
        })
      },
    })
    const result = await kit.bridge({
      from: { adapter, chain: fromChain },
      to: { adapter, chain: toChain },
      amount,
    })

    setStatus('Bridge complete')
    const serialized = JSON.stringify(
      result,
      (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    )
    setOutput(serialized)
  }

  const handleManagedBridge = async () => {
    if (!account) {
      setStatus('Please connect wallet first')
      return
    }
    setStatus('Submitting managed bridge...')
    setOutput('')

    const response = await submitManagedBridge({
      userSourceAddress: account,
      userDestAddress: account,
      amount,
      fromChain: String(fromChain),
      toChain: String(toChain),
    })

    setStatus(`Job submitted: ${response.jobId}. Please send ${amount} USDC to ${serviceWalletAddress}`)
    setManagedJob(response as any)
    pollManagedBridgeStatus(response.jobId)
  }

  const handleSendDepositWithMetaMask = async () => {
    if (!hasProvider || !managedJob) return
    
    const provider = getInjectedProvider()
    const chainId = fromChain === Blockchain.Arc_Testnet ? 5042002 : 80002
    const usdcAddress = fromChain === Blockchain.Arc_Testnet 
      ? '0x3600000000000000000000000000000000000000'
      : '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582'

    try {
      setStatus('Sending deposit with MetaMask...')
      
      // Request to switch to correct chain
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })

      // Send USDC transfer (ERC20 transfer function)
      const amountInSmallestUnit = (parseFloat(amount) * 1_000_000).toString(16)
      const txHash = (await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: usdcAddress,
          data: `0xa9059cbb${serviceWalletAddress.slice(2).padStart(64, '0')}${amountInSmallestUnit.padStart(64, '0')}`,
        }] as any,
      })) as string

      setStatus(`Deposit sent! Transaction: ${txHash}. Waiting for confirmation...`)
    } catch (error: any) {
      setStatus(`Deposit failed: ${error.message}`)
    }
  }

  const pollManagedBridgeStatus = async (jobId: string) => {
    const poll = async () => {
      const job = await getManagedBridgeStatus(jobId)
      setManagedJob(job)
      setStatus(`Status: ${job.status}`)

      if (job.status === 'completed' || job.status === 'failed') {
        setOutput(JSON.stringify(job, null, 2))
        return
      }

      setTimeout(poll, 3000)
    }
    poll()
  }

  const handleBridge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === 'self') {
      await handleSelfBridge()
    } else {
      await handleManagedBridge()
    }
  }

  return (
    <div style={baseStyles.page}>
      <section style={baseStyles.card}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bridge USDC with Arc</h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          Choose your bridge mode: sign transactions yourself or let our backend handle the complexity.
        </p>
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="mode"
              value="self"
              checked={mode === 'self'}
              onChange={(e) => setMode(e.target.value as 'self' | 'managed')}
            />
            <span style={{ fontSize: '0.9rem' }}>Use my wallet (MetaMask)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="mode"
              value="managed"
              checked={mode === 'managed'}
              onChange={(e) => setMode(e.target.value as 'self' | 'managed')}
            />
            <span style={{ fontSize: '0.9rem' }}>Handle the complexity for me</span>
          </label>
        </div>
        <button style={{ ...baseStyles.button, marginTop: '1rem' }} onClick={connectWallet}>
          {account ? `Connected: ${account}` : 'Connect wallet'}
        </button>
      </section>

      <section style={baseStyles.card}>
        <form style={{ display: 'grid', gap: '1rem' }} onSubmit={handleBridge}>
          <label style={baseStyles.label}>
            From network
            <select
              value={String(fromChain)}
              onChange={(event) => setFromChain(event.target.value as ChainIdentifier)}
              style={baseStyles.input as React.CSSProperties}
            >
              {CHAIN_OPTIONS.map((option) => (
                <option key={String(option.value)} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={baseStyles.label}>
            To network
            <select
              value={String(toChain)}
              onChange={(event) => setToChain(event.target.value as ChainIdentifier)}
              style={baseStyles.input as React.CSSProperties}
            >
              {CHAIN_OPTIONS.map((option) => (
                <option key={String(option.value)} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={baseStyles.label}>
            Amount (USDC)
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              style={baseStyles.input}
            />
          </label>

          <button type="submit" style={baseStyles.button} disabled={!account}>
            Bridge USDC
          </button>
        </form>
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.75rem' }}>Status: {status}</div>
        
        {managedJob && managedJob.status === 'awaiting_deposit' && hasProvider && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a2332', borderRadius: '0.75rem' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#e6f1ff' }}>
              Please send <strong>{amount} USDC</strong> to:
            </p>
            <code style={{ fontSize: '0.8rem', background: '#0a0f1c', color: '#4ade80', padding: '0.5rem', borderRadius: '0.5rem', display: 'block', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
              {serviceWalletAddress}
            </code>
            <button 
              style={{ ...baseStyles.button, width: '100%' }} 
              onClick={handleSendDepositWithMetaMask}
            >
              Send with MetaMask
            </button>
          </div>
        )}
      </section>

      {/* Visual, UI-only stepper for judges */}
      <section style={baseStyles.card}>
        <BridgeStepper job={managedJob} status={status} output={output} />
      </section>

      {output && (
        <section style={baseStyles.card}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Bridge response</h2>
          <pre
            style={{
              background: '#0a0f1c',
              color: '#e6f1ff',
              padding: '0.85rem',
              borderRadius: '0.75rem',
              fontSize: '0.75rem',
              overflowX: 'auto',
              marginTop: '0.75rem',
            }}
          >
            {output}
          </pre>
        </section>
      )}
    </div>
  )
}
