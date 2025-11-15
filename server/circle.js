import axios from 'axios';

const CIRCLE_API_BASE = process.env.CIRCLE_API_BASE || 'https://api.circle.com/v1';
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || '';

// Create Circle API client
const circleClient = axios.create({
  baseURL: CIRCLE_API_BASE,
  headers: {
    'Authorization': `Bearer ${CIRCLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Create or get a Circle wallet for a user
 */
export async function getOrCreateWallet(userId, userEmail) {
  try {
    // Check if user already has a wallet ID stored
    // In production, you'd store this in your database
    // For now, we'll create a new wallet each time (you should cache this)
    
    const response = await circleClient.post('/w3s/wallets', {
      idempotencyKey: `wallet-${userId}-${Date.now()}`,
      blockchains: ['ETH-SEPOLIA', 'AVAX-FUJI'], // Testnet chains
      accountType: 'SCA', // Smart Contract Account
    });

    return {
      walletId: response.data.data.walletId,
      address: response.data.data.address,
    };
  } catch (error) {
    console.error('Circle wallet creation error:', error.response?.data || error.message);
    throw new Error(`Failed to create Circle wallet: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get wallet balance for a specific chain
 */
export async function getWalletBalance(walletId, chainKey = null) {
  try {
    const response = await circleClient.get(`/w3s/wallets/${walletId}/balances`);
    
    if (!response.data.data || !response.data.data.tokenBalances) {
      return chainKey ? { [chainKey]: 0 } : {};
    }

    // Group balances by chain
    const balancesByChain = {};
    
    for (const balance of response.data.data.tokenBalances) {
      if (balance.token && balance.token.symbol === 'USDC') {
        const chain = balance.token.chain || 'ETH-SEPOLIA';
        const amount = parseFloat(balance.amount) / 1000000; // USDC has 6 decimals
        
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
  } catch (error) {
    console.error('Circle balance error:', error.response?.data || error.message);
    throw new Error(`Failed to get wallet balance: ${error.response?.data?.message || error.message}`);
  }
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
  try {
    // Amount needs to be in smallest unit (6 decimals for USDC)
    const amountInSmallestUnit = Math.floor(parseFloat(amount) * 1000000).toString();
    
    const response = await circleClient.post('/w3s/transfers', {
      idempotencyKey: `transfer-${walletId}-${Date.now()}`,
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
    });

    return {
      transferId: response.data.data.id,
      status: response.data.data.status,
      transactionHash: response.data.data.transactionHash,
    };
  } catch (error) {
    console.error('Circle transfer error:', error.response?.data || error.message);
    throw new Error(`Failed to create transfer: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get transfer status
 */
export async function getTransferStatus(transferId) {
  try {
    const response = await circleClient.get(`/w3s/transfers/${transferId}`);
    return {
      status: response.data.data.status,
      transactionHash: response.data.data.transactionHash,
    };
  } catch (error) {
    console.error('Circle transfer status error:', error.response?.data || error.message);
    throw new Error(`Failed to get transfer status: ${error.response?.data?.message || error.message}`);
  }
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
  try {
    const amountInSmallestUnit = Math.floor(parseFloat(amount) * 1000000).toString();
    
    const response = await circleClient.post('/w3s/transfers', {
      idempotencyKey: `cctp-${walletId}-${Date.now()}`,
      source: {
        type: 'wallet',
        id: walletId,
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
      // CCTP-specific parameters
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM',
        },
      },
    });

    const transferData = response.data.data;

    return {
      transferId: transferData.id,
      status: transferData.status,
      sourceChain,
      destinationChain,
      burnTxHash: transferData.source?.transactionHash || null,
      mintTxHash: transferData.destination?.transactionHash || null,
      settlementState: 'burning', // Initial state
    };
  } catch (error) {
    console.error('Circle CCTP transfer error:', error.response?.data || error.message);
    throw new Error(`Failed to initiate CCTP transfer: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get CCTP transfer status with settlement state
 */
export async function getCCTPTransferStatus(transferId) {
  try {
    const response = await circleClient.get(`/w3s/transfers/${transferId}`);
    const transfer = response.data.data;

    // Determine settlement state based on transfer status
    let settlementState = 'pending';
    if (transfer.status === 'pending') {
      settlementState = 'burning';
    } else if (transfer.status === 'complete') {
      settlementState = 'completed';
    } else if (transfer.status === 'failed') {
      settlementState = 'failed';
    }

    return {
      transferId: transfer.id,
      status: transfer.status,
      settlementState,
      burnTxHash: transfer.source?.transactionHash || null,
      mintTxHash: transfer.destination?.transactionHash || null,
      sourceChain: transfer.source?.chain || null,
      destinationChain: transfer.destination?.chain || null,
      attestation: transfer.attestation || null,
    };
  } catch (error) {
    console.error('Circle CCTP status error:', error.response?.data || error.message);
    throw new Error(`Failed to get CCTP transfer status: ${error.response?.data?.message || error.message}`);
  }
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

