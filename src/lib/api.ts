import axios from 'axios';
import { showAlert } from './features/ui/uiSlice';
import { API_BASE_URL } from './config';

// Circular dependency fix: injecting store from provider
let store: any;
export const injectStore = (_store: any) => {
  store = _store;
}

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL || '', // Use Host-Only or empty for relative root
  withCredentials: true, // Enable cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle authentication and path prefixing
api.interceptors.request.use((config) => {
    // 1. Add Bearer token from localStorage for absolute cross-domain requests
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('nbu_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    // 2. We no longer prefix /api here because API_BASE_URL now includes it
    // and we are using absolute URLs which already have the correct path.
    
    return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, the cookie might be expired or invalid
    }
    const message = error?.response?.data?.message || error?.message || 'An error occurred';
    if (message && store) {
      store.dispatch(showAlert({
        type: 'error',
        title: 'Network Protocol Failure',
        message: message
      }));
    }
    return Promise.reject(error);
  }
);

export default api;
