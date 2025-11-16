// This module must be imported BEFORE any Bridge Kit or viem usage
// It monkey-patches global fetch to redirect RPC URLs

const ARC_RPC_URL = (import.meta as ImportMeta & { env: { VITE_ARC_RPC_URL?: string } }).env.VITE_ARC_RPC_URL
const POLYGON_RPC_URL = (import.meta as ImportMeta & { env: { VITE_POLYGON_RPC_URL?: string } }).env.VITE_POLYGON_RPC_URL

const RPC_REDIRECTS: Record<string, string | undefined> = {
  'https://rpc.testnet.arc.network/': ARC_RPC_URL,
  'https://rpc.testnet.arc.network': ARC_RPC_URL,
  'https://rpc-amoy.polygon.technology/': POLYGON_RPC_URL,
  'https://rpc-amoy.polygon.technology': POLYGON_RPC_URL,
}

// Monkey-patch global fetch to intercept and redirect RPC calls
const originalFetch = globalThis.fetch
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  
  if (url) {
    // Normalize URL by removing trailing slash for comparison
    const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url
    const normalizedRedirects: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(RPC_REDIRECTS)) {
      if (value) {
        const normalizedKey = key.endsWith('/') ? key.slice(0, -1) : key
        normalizedRedirects[normalizedKey] = value
      }
    }
    
    const redirectUrl = normalizedRedirects[normalizedUrl]
    if (redirectUrl) {
      console.log(`[viem-rpc-override] Redirecting ${url} -> ${redirectUrl}`)
      const redirectedInput = typeof input === 'string' ? redirectUrl : 
                             input instanceof URL ? new URL(redirectUrl) :
                             new Request(redirectUrl, input)
      return originalFetch(redirectedInput, init)
    }
  }
  
  return originalFetch(input, init)
}) as typeof fetch

console.log('[viem-rpc-override] RPC redirect module loaded (frontend)')
