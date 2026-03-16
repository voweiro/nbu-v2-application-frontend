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
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookies
  headers: {
    'Content-Type': 'application/json',
  },
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
