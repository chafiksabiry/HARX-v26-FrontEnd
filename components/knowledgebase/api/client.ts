import axios from 'axios';

// Create an axios instance with the base URL from the environment variable
// Use backend URL from environment or fallback to Netlify backend
// In Next.js, use process.env.NEXT_PUBLIC_* for client-side variables
const getBaseURL = () => {
  // Try Next.js environment variable first
  if (typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_BACKEND_API || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL)) {
    const url = process.env.NEXT_PUBLIC_BACKEND_API || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    return url?.endsWith('/api') ? url : `${url}/api`;
  }
  // Fallback to Netlify backend
  return 'https://harxv26back.netlify.app/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  validateStatus: (status) => {
    return status >= 200 && status < 500; // Don't reject if status is 4xx to handle it in service
  },
});

export default apiClient;

