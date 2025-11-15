import axios from 'axios';

function normalizeBaseUrl(url) {
  if (!url) {
    return undefined;
  }

  return url.replace(/\/$/, '');
}

function resolveBaseUrl() {
  const envBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    const { origin, protocol } = window.location;

    // When the UI is served over HTTPS we must avoid hard-coding an HTTP backend
    // URL because browsers will block the mixed-content request. In this case we
    // default to the current origin so the frontend and backend share the same
    // scheme and host.
    if (protocol === 'https:' || !import.meta.env.DEV) {
      return normalizeBaseUrl(origin);
    }
  }

  // Default development fallback when running the API locally
  return 'http://localhost:3000';
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on 401 for auth endpoints (login/signup) - let the components handle it
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      
      if (!isAuthEndpoint) {
        // Only redirect to login for protected endpoints that require authentication
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => apiClient.post('/api/auth/signup', data),
  login: (data) => apiClient.post('/api/auth/login', data),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => apiClient.get('/api/wallet/balance'),
  deposit: (data) => apiClient.post('/api/wallet/deposit', data),
  send: (data) => apiClient.post('/api/wallet/send', data),
};

// Activity APIs
export const activityAPI = {
  getActivity: (params) => apiClient.get('/api/activity', { params }),
};

// Circle Wallet APIs
export const circleAPI = {
  createWallet: () => apiClient.post('/api/circle/wallet/create'),
  getBalance: (chain) => apiClient.get('/api/circle/wallet/balance', { params: chain ? { chain } : {} }),
  createDepositAddress: (blockchain) => apiClient.post('/api/circle/wallet/deposit-address', { blockchain }),
  deposit: (data) => apiClient.post('/api/circle/wallet/deposit', data),
  send: (data) => apiClient.post('/api/circle/wallet/send', data),
  getTransferStatus: (transferId) => apiClient.get(`/api/circle/transfer/${transferId}`),
};

// Chain APIs
export const chainAPI = {
  getSupportedChains: () => apiClient.get('/api/chains'),
  getBalance: (chain) => apiClient.get('/api/wallet/balance', { params: chain ? { chain } : {} }),
};

// Arc Account & Analytics APIs
export const arcAPI = {
  linkAccount: (walletAddress) => apiClient.post('/api/arc/account/link', { walletAddress }),
  getAccount: () => apiClient.get('/api/arc/account'),
  getAnalytics: (timeframe) => apiClient.get('/api/arc/analytics', { params: { timeframe } }),
  getTransactions: (limit, offset) => apiClient.get('/api/arc/transactions', { params: { limit, offset } }),
  getInsights: () => apiClient.get('/api/arc/insights'),
  createPayment: (data) => apiClient.post('/api/arc/payment', data),
  getPaymentStatus: (paymentId) => apiClient.get(`/api/arc/payment/${paymentId}`),
  trackEvent: (eventType, eventData) => apiClient.post('/api/arc/events/track', { eventType, eventData }),
};

// Smart Contract APIs
export const smartContractAPI = {
  deployWallet: (data) => apiClient.post('/api/smart-contracts/wallet/deploy', data),
  getWallets: () => apiClient.get('/api/smart-contracts/wallets'),
  deployPolicyEngine: (data) => apiClient.post('/api/smart-contracts/policy-engine/deploy', data),
  createPolicy: (data) => apiClient.post('/api/smart-contracts/policy/create', data),
  getPolicies: () => apiClient.get('/api/smart-contracts/policies'),
  allocate: (data) => apiClient.post('/api/smart-contracts/treasury/allocate', data),
  distribute: (data) => apiClient.post('/api/smart-contracts/treasury/distribute', data),
  createAutomation: (data) => apiClient.post('/api/smart-contracts/treasury/automation', data),
  getAutomations: () => apiClient.get('/api/smart-contracts/treasury/automations'),
  triggerAutomation: (automationId) => apiClient.post(`/api/smart-contracts/treasury/automation/${automationId}`, { action: 'trigger' }),
  updateAutomation: (automationId, data) => apiClient.post(`/api/smart-contracts/treasury/automation/${automationId}`, data),
  getTreasuryBalance: (contractAddress, chain) => apiClient.get(`/api/smart-contracts/treasury/balance/${contractAddress}`, { params: { chain } }),
};

export default apiClient;
