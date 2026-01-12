import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://harxv26back.netlify.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use(config => {
  // Always get the fresh token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  response => response,
  error => {
    // For 404 errors on profile endpoints, don't log to console
    // This is a normal case when a user hasn't created a profile yet
    if (error.response?.status === 404 && error.config?.url?.includes('/profiles/')) {
      // Silently handle 404 for profiles - return the error but don't log it
      return Promise.reject(error);
    }
    
    // For other errors, log them normally
    return Promise.reject(error);
  }
);

export default api;

