import axios from 'axios';
import { randomUUID } from 'node:crypto';

const CIRCLE_API_BASE = process.env.CIRCLE_API_BASE || 'https://api.circle.com/v1';
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;

// Validate Circle API key on module load
if (!CIRCLE_API_KEY) {
  console.error('❌ CIRCLE_API_KEY is not set in environment variables');
  console.error('   Please add CIRCLE_API_KEY to your .env file');
  console.error('   Get your API key from: https://console.circle.com/');
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// Create Circle API client with interceptors
const circleClient = axios.create({
  baseURL: CIRCLE_API_BASE,
  headers: {
    'Authorization': `Bearer ${CIRCLE_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Request interceptor for logging
circleClient.interceptors.request.use(
  (config) => {
    console.log(`[Circle API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Circle API] Request error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
circleClient.interceptors.response.use(
  (response) => {
    console.log(`[Circle API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[Circle API] ${error.response.status} ${error.config?.url}`, error.response.data);
    } else {
      console.error('[Circle API] Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry(fn, context = 'operation') {
  let lastError;
  let delay = RETRY_CONFIG.initialDelay;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        console.error(`[Circle] Client error (${error.response.status}) - not retrying:`, error.response.data);
        throw error;
      }

      if (attempt < RETRY_CONFIG.maxRetries) {
        console.log(`[Circle] ${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
      }
    }
  }

  console.error(`[Circle] ${context} failed after ${RETRY_CONFIG.maxRetries + 1} attempts`);
  throw lastError;
}

/**
 * Check if Circle API is configured and accessible
 */
export async function checkCircleConnection() {
  if (!CIRCLE_API_KEY) {
    throw new Error('Circle API key not configured. Please set CIRCLE_API_KEY in your .env file.');
  }

  try {
    // Try to get configuration to verify API key
    const response = await circleClient.get('/configuration');
    if (response.status === 200) {
      console.log('✅ Circle API connection verified');
      return true;
    } else if (response.status === 401) {
      throw new Error('Invalid Circle API key. Please check your CIRCLE_API_KEY in .env file.');
    } else {
      throw new Error(`Circle API returned status ${response.status}`);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid Circle API key. Please check your CIRCLE_API_KEY in .env file.');
    }
    throw new Error(`Failed to connect to Circle API: ${error.message}`);
  }
}

/**
 * Create or get a Circle wallet for a user
 */
export async function getOrCreateWallet(userId, userEmail) {
  if (!CIRCLE_API_KEY) {
    throw new Error('Circle API not configured. Please set CIRCLE_API_KEY in your .env file.');
  }

  return withRetry(async () => {
    const idempotencyKey = `wallet-${userId}-${randomUUID()}`;
    
    const response = await circleClient.post('/w3s/developer/wallets', {
      idempotencyKey,
      entitySecretCiphertext: 'encrypted-secret', // In production, use proper encryption
      blockchains: ['ETH-SEPOLIA', 'AVAX-FUJI', 'MATIC-AMOY', 'ARB-SEPOLIA'],
      accountType: 'SCA',
      metadata: [
        { key: 'userId', value: userId },
        { key: 'email', value: userEmail },
        { key: 'createdAt', value: new Date().toISOString() },
      ],
    });

    if (response.status !== 200 && response.status !== 201) {
      const errorMsg = response.data?.message || 'Unknown error';
      throw new Error(`Circle API error (${response.status}): ${errorMsg}`);
    }

    const data = response.data.data;
    
    return {
      walletId: data.walletId || data.id,
      address: data.address,
      blockchain: data.blockchain,
      accountType: data.accountType,
      state: data.state,
    };
  }, 'Create wallet');
}

/**
 * Get wallet balance for a specific chain
 */
export async function getWalletBalance(walletId, chainKey = null) {
  if (!CIRCLE_API_KEY) {
    throw new Error('Circle API not configured');
  }

  return withRetry(async () => {
    const response = await circleClient.get(`/w3s/wallets/${walletId}/balances`);
    
    if (response.status !== 200) {
      const errorMsg = response.data?.message || 'Unknown error';
      throw new Error(`Circle API error (${response.status}): ${errorMsg}`);
    }

    const data = response.data.data;
    
    if (!data || !data.tokenBalances) {
      return chainKey ? { [chainKey]: 0 } : {};
    }

    // Group balances by chain
    const balancesByChain = {};
    
    for (const balance of data.tokenBalances) {
      if (balance.token && balance.token.symbol === 'USDC') {
        const chain = balance.token.blockchain || balance.chain || 'ETH-SEPOLIA';
        const amount = parseFloat(balance.amount || '0') / 1000000; // USDC has 6 decimals
        
        if (!balancesByChain[chain]) {
          balancesByChain[chain] = 0;
        }
        balancesByChain[chain] += amount;
      }
    }
    
    // If specific chain requested, return just that
    if (chainKey) {
      return { [chainKey]: balancesByChain[chainKey] || 0 };
    }
    
    return balancesByChain;
  }, `Get balance for wallet ${walletId}`);
}

/**
 * Create a deposit address for a wallet
 */
export async function createDepositAddress(walletId, blockchain) {
  try {
    const response = await circleClient.post(`/w3s/wallets/${walletId}/addresses`, {
      idempotencyKey: `deposit-${walletId}-${Date.now()}`,
      blockchain: blockchain || 'ETH-SEPOLIA',
      accountType: 'SCA',
    });

    return {
      address: response.data.data.address,
      blockchain: response.data.data.blockchain,
    };
  } catch (error) {
    console.error('Circle deposit address error:', error.response?.data || error.message);
    throw new Error(`Failed to create deposit address: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Create a transfer (send payment)
 */
export async function createTransfer(walletId, destinationAddress, amount, blockchain, tokenId = 'USDC') {
  if (!CIRCLE_API_KEY) {
    throw new Error('Circle API not configured');
  }

  return withRetry(async () => {
    // Amount needs to be in smallest unit (6 decimals for USDC)
    const amountInSmallestUnit = Math.floor(parseFloat(amount) * 1000000).toString();
    const idempotencyKey = `transfer-${walletId}-${randomUUID()}`;
    
    const requestData = {
      idempotencyKey,
      source: {
        type: 'wallet',
        id: walletId,
      },
      destination: {
        type: 'blockchain',
        address: destinationAddress,
        chain: blockchain || 'ETH-SEPOLIA',
      },
      amount: {
        amount: amountInSmallestUnit,
        currency: tokenId,
      },
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM',
        },
      },
    };

    console.log('[Circle] Creating transfer:', {
      amount: `${amount} ${tokenId}`,
      from: walletId,
      to: destinationAddress,
      chain: blockchain,
    });

    const response = await circleClient.post('/w3s/developer/transactions/transfer', requestData);

    if (response.status !== 200 && response.status !== 201 && response.status !== 202) {
      const errorMsg = response.data?.message || response.data?.error || 'Unknown error';
      throw new Error(`Circle API error (${response.status}): ${errorMsg}`);
    }

    const data = response.data.data;

    return {
      transferId: data.id || data.challengeId,
      status: data.state || data.status || 'pending',
      transactionHash: data.txHash || data.transactionHash || null,
      blockchain: blockchain,
      state: data.state,
      createDate: data.createDate,
      updateDate: data.updateDate,
      errorReason: data.errorReason || null,
    };
  }, `Create transfer to ${destinationAddress}`);
}

/**
 * Get transfer status
 */
export async function getTransferStatus(transferId) {
  if (!CIRCLE_API_KEY) {
    throw new Error('Circle API not configured');
  }

  return withRetry(async () => {
    const response = await circleClient.get(`/w3s/developer/transactions/${transferId}`);
    
    if (response.status !== 200) {
      const errorMsg = response.data?.message || 'Unknown error';
      throw new Error(`Circle API error (${response.status}): ${errorMsg}`);
    }

    const data = response.data.data;

    return {
      transferId: data.id,
      status: data.state || data.status || 'unknown',
      transactionHash: data.txHash || data.transactionHash || null,
      blockchain: data.blockchain,
      state: data.state,
      createDate: data.createDate,
      updateDate: data.updateDate,
      errorReason: data.errorReason || null,
      amounts: data.amounts || [],
    };
  }, `Get transfer status ${transferId}`);
}

/**
 * Initiate CCTP (Cross-Chain Transfer Protocol) transfer with burn/mint tracking
 */
export async function initiateCCTPTransfer(
  walletId,
  destinationAddress,
  amount,
  sourceChain,
  destinationChain
) {
  if (!CIRCLE_API_KEY) {
    throw new Error('Circle API not configured');
  }

  return withRetry(async () => {
    const amountInSmallestUnit = Math.floor(parseFloat(amount) * 1000000).toString();
    const idempotencyKey = `cctp-${walletId}-${randomUUID()}`;
    
    const requestData = {
      idempotencyKey,
      source: {
        type: 'wallet',
        id: walletId,
        chain: sourceChain,
      },
      destination: {
        type: 'blockchain',
        address: destinationAddress,
        chain: destinationChain,
      },
      amount: {
        amount: amountInSmallestUnit,
        currency: 'USDC',
      },
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM',
        },
      },
    };

    console.log('[Circle CCTP] Initiating cross-chain transfer:', {
      amount: `${amount} USDC`,
      from: `${walletId} (${sourceChain})`,
      to: `${destinationAddress} (${destinationChain})`,
    });

    const response = await circleClient.post('/w3s/developer/transactions/transfer', requestData);

    if (response.status !== 200 && response.status !== 201 && response.status !== 202) {
      const errorMsg = response.data?.message || response.data?.error || 'Unknown error';
      throw new Error(`Circle CCTP API error (${response.status}): ${errorMsg}`);
    }

    const data = response.data.data;

    // Determine initial settlement state
    let settlementState = 'initiated';
    if (data.state === 'PENDING_RISK_SCREENING') {
      settlementState = 'validating';
    } else if (data.state === 'INITIATED' || data.state === 'PENDING') {
      settlementState = 'burning';
    } else if (data.state === 'CONFIRMED') {
      settlementState = 'confirmed';
    } else if (data.state === 'COMPLETE') {
      settlementState = 'completed';
    } else if (data.state === 'FAILED') {
      settlementState = 'failed';
    }

    return {
      transferId: data.id || data.challengeId,
      status: data.state || data.status || 'pending',
      sourceChain,
      destinationChain,
      burnTxHash: data.txHash || data.transactionHash || null,
      mintTxHash: null, // Will be updated when minting completes
      settlementState,
      state: data.state,
      createDate: data.createDate,
      updateDate: data.updateDate,
      errorReason: data.errorReason || null,
    };
  }, `Initiate CCTP transfer ${sourceChain} -> ${destinationChain}`);
}

/**
 * Get CCTP transfer status with settlement state
 */
export async function getCCTPTransferStatus(transferId) {
  if (!CIRCLE_API_KEY) {
    throw new Error('Circle API not configured');
  }

  return withRetry(async () => {
    const response = await circleClient.get(`/w3s/developer/transactions/${transferId}`);
    
    if (response.status !== 200) {
      const errorMsg = response.data?.message || 'Unknown error';
      throw new Error(`Circle API error (${response.status}): ${errorMsg}`);
    }

    const data = response.data.data;

    // Determine settlement state based on Circle state
    let settlementState = 'pending';
    const state = data.state || data.status || 'unknown';
    
    if (state === 'PENDING_RISK_SCREENING') {
      settlementState = 'validating';
    } else if (state === 'INITIATED' || state === 'PENDING') {
      settlementState = 'burning';
    } else if (state === 'CONFIRMED') {
      settlementState = 'confirmed';
    } else if (state === 'QUEUED') {
      settlementState = 'pending';
    } else if (state === 'SENT') {
      settlementState = 'settling';
    } else if (state === 'COMPLETE' || state === 'COMPLETED') {
      settlementState = 'completed';
    } else if (state === 'FAILED' || state === 'DENIED' || state === 'CANCELLED') {
      settlementState = 'failed';
    }

    return {
      transferId: data.id,
      status: state,
      settlementState,
      burnTxHash: data.txHash || data.transactionHash || null,
      mintTxHash: data.destinationTxHash || null,
      sourceChain: data.sourceChain || data.blockchain || null,
      destinationChain: data.destinationChain || null,
      attestation: data.attestation || null,
      state: data.state,
      createDate: data.createDate,
      updateDate: data.updateDate,
      errorReason: data.errorReason || null,
      amounts: data.amounts || [],
    };
  }, `Get CCTP status ${transferId}`);
}

/**
 * Request CCTP attestation (for manual attestation flow if needed)
 */
export async function requestCCTPAttestation(messageHash) {
  try {
    const response = await circleClient.post('/cctp/attestations', {
      messageHash,
    });

    return {
      attestation: response.data.data.attestation,
      status: response.data.data.status,
    };
  } catch (error) {
    console.error('Circle CCTP attestation error:', error.response?.data || error.message);
    throw new Error(`Failed to request CCTP attestation: ${error.response?.data?.message || error.message}`);
  }
}

