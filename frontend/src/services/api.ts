import axios from 'axios';

// Use environment variable for API URL, fallback to /api for local development with proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add wallet address to requests
api.interceptors.request.use((config) => {
  const walletAddress = localStorage.getItem('walletAddress');
  if (walletAddress) {
    config.headers['X-Wallet-Address'] = walletAddress;
  }
  return config;
});

// Prompt API
export const promptAPI = {
  createPrompt: (data: any) => api.post('/prompts', data),
  getMarketplace: () => api.get('/prompts/marketplace'),
  getPromptById: (id: string) => api.get(`/prompts/${id}`),
  registerOnChain: (id: string) => api.post(`/prompts/${id}/register`),
  getUserPrompts: () => api.get('/prompts/user/prompts'),
  getUserLicenses: () => api.get('/prompts/user/licenses'),
  deletePrompt: (id: string) => api.delete(`/prompts/${id}`),
  
  // Verification API
  verifyPrompt: (id: string, data: { userId: string; isUseful: boolean; feedback?: string }) =>
    api.post(`/prompts/${id}/verify`, data),
  getVerifications: (id: string) => api.get(`/prompts/${id}/verifications`),
  
  // Leaderboards API
  getTopCreators: (limit?: number) => api.get('/prompts/leaderboards/creators', { params: { limit } }),
  getMostUseful: (limit?: number, minVerifications?: number) => 
    api.get('/prompts/leaderboards/useful', { params: { limit, minVerifications } }),
  getMostVerified: (limit?: number) => api.get('/prompts/leaderboards/verified', { params: { limit } }),
  
  // Nickname API
  setNickname: (data: { userId: string; nickname: string }) => api.post('/prompts/user/nickname', data),
  checkNickname: (nickname: string) => api.get(`/prompts/nickname/${nickname}/available`),
};
