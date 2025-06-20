import axios from 'axios';
import { toast } from '../hooks/use-toast';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased to 30 seconds
  maxRedirects: 0, // Prevent redirect issues
  maxContentLength: 1000000, // Increase max payload size
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      toast({
        variant: "destructive",
        title: "Connection Timeout",
        description: "The server is taking too long to respond",
      });
      return Promise.reject(error);
    }
    
    // Handle authentication errors (401, 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear invalid authentication
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
    
    return Promise.reject(error);
  }
);

export default api;
