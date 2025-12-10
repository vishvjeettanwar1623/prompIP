import axios from 'axios';

// Use environment variable for API URL, fallback to /api for local development with proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// Warn if VITE_API_URL is not set in production
if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL environment variable is not set. API calls may fail.');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add wallet address to requests with error handling
api.interceptors.request.use((config) => {
  try {
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress) {
      config.headers['X-Wallet-Address'] = walletAddress;
    }
  } catch (error) {
    // Silently handle localStorage access errors
    console.warn('Unable to access localStorage for wallet address');
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`API Error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response from server', error.message);
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Prompt API
export const promptAPI = {
  createPrompt: (data: any) => api.post('/api/prompts', data),
  getMarketplace: () => api.get('/api/prompts/marketplace'),
  getPromptById: (id: string) => api.get(`/api/prompts/${id}`),
  registerOnChain: (id: string) => api.post(`/api/prompts/${id}/register`),
  getUserPrompts: () => api.get('/api/prompts/user/prompts'),
  getUserLicenses: () => api.get('/api/prompts/user/licenses'),
  deletePrompt: (id: string) => api.delete(`/api/prompts/${id}`),
  
  // Verification API
  verifyPrompt: (id: string, data: { userId: string; isUseful: boolean; feedback?: string }) =>
    api.post(`/api/prompts/${id}/verify`, data),
  getVerifications: (id: string) => api.get(`/api/prompts/${id}/verifications`),
  
  // Leaderboards API
  getTopCreators: (limit?: number) => api.get('/api/prompts/leaderboards/creators', { params: { limit } }),
  getMostUseful: (limit?: number, minVerifications?: number) => 
    api.get('/api/prompts/leaderboards/useful', { params: { limit, minVerifications } }),
  getMostVerified: (limit?: number) => api.get('/api/prompts/leaderboards/verified', { params: { limit } }),
  
  // Nickname API
  setNickname: (data: { userId: string; nickname: string }) => api.post('/api/prompts/user/nickname', data),
  checkNickname: (nickname: string) => api.get(`/api/prompts/nickname/${nickname}/available`),
};
