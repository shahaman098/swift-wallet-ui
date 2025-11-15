import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
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
    // Handle network errors (backend not running, CORS, etc.)
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        error.networkError = true;
        error.message = 'Cannot connect to server. Make sure the backend is running on http://localhost:3000';
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
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

// Transaction APIs
export const transactionAPI = {
  getTransactions: (params) => apiClient.get('/api/transactions', { params }),
  getTransaction: (id) => apiClient.get(`/api/transactions/${id}`),
};

// Treasury APIs
export const treasuryAPI = {
  // Orgs
  getOrgs: () => apiClient.get('/api/treasury/orgs'),
  createOrg: (data) => apiClient.post('/api/treasury/orgs', data),
  getOrg: (orgId) => apiClient.get(`/api/treasury/orgs/${orgId}`),
  
  // Departments
  createDepartment: (orgId, data) => apiClient.post(`/api/treasury/orgs/${orgId}/departments`, data),
  getDepartments: (orgId) => apiClient.get(`/api/treasury/orgs/${orgId}/departments`),
  
  // Allocation Rules
  createAllocationRule: (orgId, data) => apiClient.post(`/api/treasury/orgs/${orgId}/allocation-rules`, data),
  
  // Distribution Rules
  createDistributionRule: (orgId, data) => apiClient.post(`/api/treasury/orgs/${orgId}/distribution-rules`, data),
  
  // Execution
  executeAllocations: (orgId, data) => apiClient.post(`/api/treasury/orgs/${orgId}/execute-allocations`, data),
};

// ML APIs
export const mlAPI = {
  getRecommendations: (orgId) => apiClient.get(`/api/ml/orgs/${orgId}/recommendations`),
  evaluateCycle: (data) => apiClient.post('/api/ml/evaluate-cycle', data),
};

// Gateway APIs
export const gatewayAPI = {
  transfer: (data) => apiClient.post('/api/gateway/transfer', data),
  payout: (data) => apiClient.post('/api/gateway/payout', data),
};

export default apiClient;
