// Chain configuration with chain IDs and metadata
export const SUPPORTED_CHAINS = {
  'ETH-SEPOLIA': {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    network: 'testnet',
    nativeCurrency: 'ETH',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io',
    cctpDomain: 0, // CCTP domain ID
  },
  'AVAX-FUJI': {
    chainId: 43113,
    name: 'Avalanche Fuji',
    network: 'testnet',
    nativeCurrency: 'AVAX',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    cctpDomain: 1,
  },
  'MATIC-AMOY': {
    chainId: 80002,
    name: 'Polygon Amoy',
    network: 'testnet',
    nativeCurrency: 'MATIC',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    cctpDomain: 7,
  },
  'BASE-SEPOLIA': {
    chainId: 84532,
    name: 'Base Sepolia',
    network: 'testnet',
    nativeCurrency: 'ETH',
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    cctpDomain: 6,
  },
};

export const SETTLEMENT_STATES = {
  PENDING: 'pending',
  BURNING: 'burning',
  BURNED: 'burned',
  ATTESTING: 'attesting',
  ATTESTED: 'attested',
  MINTING: 'minting',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export function getChainByChainId(chainId) {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.chainId === chainId);
}

export function getChainByDomain(domain) {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.cctpDomain === domain);
}

export function getChainId(chainKey) {
  return SUPPORTED_CHAINS[chainKey]?.chainId || null;
}

export function getChainKey(chainId) {
  const entry = Object.entries(SUPPORTED_CHAINS).find(([_, chain]) => chain.chainId === chainId);
  return entry ? entry[0] : null;
}

