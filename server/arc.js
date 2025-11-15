import axios from 'axios';

const ARC_API_BASE = process.env.ARC_API_BASE || 'https://api.arc.network/v1';
const ARC_API_KEY = process.env.ARC_API_KEY || '';

// Create Arc API client
const arcClient = axios.create({
  baseURL: ARC_API_BASE,
  headers: {
    'Authorization': `Bearer ${ARC_API_KEY}`,
    'Content-Type': 'application/json',
    'X-API-Version': '1.0',
  },
  timeout: 30000,
});

/**
 * Link an Arc account to a user
 */
export async function linkArcAccount(userId, userEmail, walletAddress) {
  try {
    const response = await arcClient.post('/accounts/link', {
      userId,
      email: userEmail,
      walletAddress,
      metadata: {
        linkedAt: new Date().toISOString(),
        source: 'swift-wallet',
      },
    });

    return {
      arcAccountId: response.data.data.accountId,
      linkedWallet: response.data.data.walletAddress,
      status: response.data.data.status,
    };
  } catch (error) {
    console.error('Arc account linkage error:', error.response?.data || error.message);
    throw new Error(`Failed to link Arc account: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get Arc account details
 */
export async function getArcAccount(arcAccountId) {
  try {
    const response = await arcClient.get(`/accounts/${arcAccountId}`);
    
    return {
      accountId: response.data.data.accountId,
      walletAddress: response.data.data.walletAddress,
      status: response.data.data.status,
      linkedAt: response.data.data.linkedAt,
      balance: response.data.data.balance || 0,
    };
  } catch (error) {
    console.error('Arc account fetch error:', error.response?.data || error.message);
    throw new Error(`Failed to get Arc account: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get Arc analytics for a user
 */
export async function getArcAnalytics(arcAccountId, timeframe = '30d') {
  try {
    const response = await arcClient.get(`/analytics/${arcAccountId}`, {
      params: {
        timeframe,
        metrics: ['transactions', 'volume', 'frequency', 'trends'],
      },
    });

    return {
      timeframe: response.data.data.timeframe,
      transactions: {
        total: response.data.data.transactions?.total || 0,
        count: response.data.data.transactions?.count || 0,
        average: response.data.data.transactions?.average || 0,
      },
      volume: {
        total: response.data.data.volume?.total || 0,
        incoming: response.data.data.volume?.incoming || 0,
        outgoing: response.data.data.volume?.outgoing || 0,
      },
      trends: response.data.data.trends || [],
      insights: response.data.data.insights || [],
    };
  } catch (error) {
    console.error('Arc analytics error:', error.response?.data || error.message);
    throw new Error(`Failed to get Arc analytics: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Track an event for analytics
 */
export async function trackEvent(arcAccountId, eventType, eventData) {
  try {
    const response = await arcClient.post('/analytics/events', {
      accountId: arcAccountId,
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
    });

    return {
      eventId: response.data.data.eventId,
      tracked: response.data.data.tracked,
    };
  } catch (error) {
    console.error('Arc event tracking error:', error.response?.data || error.message);
    // Don't throw - analytics failures shouldn't break the app
    return { tracked: false, error: error.message };
  }
}

/**
 * Get transaction history from Arc
 */
export async function getArcTransactions(arcAccountId, limit = 50, offset = 0) {
  try {
    const response = await arcClient.get(`/accounts/${arcAccountId}/transactions`, {
      params: {
        limit,
        offset,
        sort: 'desc',
      },
    });

    return {
      transactions: response.data.data.transactions || [],
      total: response.data.data.total || 0,
      hasMore: response.data.data.hasMore || false,
    };
  } catch (error) {
    console.error('Arc transactions error:', error.response?.data || error.message);
    throw new Error(`Failed to get Arc transactions: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Create a payment via Arc
 */
export async function createArcPayment(arcAccountId, recipientAddress, amount, blockchain, note) {
  try {
    const response = await arcClient.post('/payments/create', {
      accountId: arcAccountId,
      recipientAddress,
      amount: parseFloat(amount).toFixed(6),
      currency: 'USDC',
      blockchain: blockchain || 'ETH-SEPOLIA',
      note,
      idempotencyKey: `payment-${arcAccountId}-${Date.now()}`,
    });

    return {
      paymentId: response.data.data.paymentId,
      status: response.data.data.status,
      transactionHash: response.data.data.transactionHash,
      estimatedCompletion: response.data.data.estimatedCompletion,
    };
  } catch (error) {
    console.error('Arc payment error:', error.response?.data || error.message);
    throw new Error(`Failed to create Arc payment: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId) {
  try {
    const response = await arcClient.get(`/payments/${paymentId}`);
    
    return {
      paymentId: response.data.data.paymentId,
      status: response.data.data.status,
      transactionHash: response.data.data.transactionHash,
      confirmed: response.data.data.confirmed || false,
    };
  } catch (error) {
    console.error('Arc payment status error:', error.response?.data || error.message);
    throw new Error(`Failed to get payment status: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get account insights and recommendations
 */
export async function getAccountInsights(arcAccountId) {
  try {
    const response = await arcClient.get(`/accounts/${arcAccountId}/insights`);
    
    return {
      recommendations: response.data.data.recommendations || [],
      riskScore: response.data.data.riskScore || 0,
      activityScore: response.data.data.activityScore || 0,
      trends: response.data.data.trends || [],
    };
  } catch (error) {
    console.error('Arc insights error:', error.response?.data || error.message);
    throw new Error(`Failed to get account insights: ${error.response?.data?.message || error.message}`);
  }
}

