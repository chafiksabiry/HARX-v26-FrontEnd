import axios from 'axios';
import toast from 'react-hot-toast';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_DASHBOARD_API || process.env.NEXT_PUBLIC_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

const getCallApiUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_CALL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

const apiCall = axios.create({
  baseURL: getCallApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor
api.interceptors.response.use(
  (  response: any) => response,
  (  error: { response: { data: { message: string; }; }; }) => {
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api ;
export { apiCall };