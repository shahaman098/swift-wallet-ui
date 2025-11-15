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

export default apiClient;
