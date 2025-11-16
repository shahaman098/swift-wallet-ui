// This module must be imported BEFORE any Bridge Kit or viem usage
// It monkey-patches global fetch to redirect RPC URLs

const ARC_RPC_URL = process.env.ARC_RPC_URL!
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL!

const RPC_REDIRECTS: Record<string, string> = {
  'https://rpc.testnet.arc.network/': ARC_RPC_URL,
  'https://rpc.testnet.arc.network': ARC_RPC_URL,
  'https://rpc-amoy.polygon.technology/': POLYGON_RPC_URL,
  'https://rpc-amoy.polygon.technology': POLYGON_RPC_URL,
  'https://polygon-amoy.drpc.org/': POLYGON_RPC_URL,
  'https://polygon-amoy.drpc.org': POLYGON_RPC_URL,
}

// Monkey-patch global fetch to intercept and redirect RPC calls
const originalFetch = global.fetch
global.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  
  if (RPC_REDIRECTS[url]) {
    console.log(`[viem-rpc-override] Redirecting ${url} -> ${RPC_REDIRECTS[url]}`)
    const redirectedInput = typeof input === 'string' ? RPC_REDIRECTS[url] : 
                           input instanceof URL ? new URL(RPC_REDIRECTS[url]) :
                           new Request(RPC_REDIRECTS[url], input)
    return originalFetch(redirectedInput, init)
  }
  
  return originalFetch(input, init)
}) as typeof fetch

console.log('[viem-rpc-override] RPC redirect module loaded')
