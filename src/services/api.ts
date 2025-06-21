import axios from 'axios';
import { toast } from '../hooks/use-toast';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sbf-backend.onrender.com/api',
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
    // Try multiple token sources like in ProductForm
    let token = localStorage.getItem('token');
    
    if (!token) {
      // Try userData
      const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed.token) token = parsed.token;
        } catch (err) {
          console.error('Error parsing userData in interceptor:', err);
        }
      }
    }
    
    if (!token) {
      // Try user
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsed = JSON.parse(user);
          if (parsed.token) token = parsed.token;
        } catch (err) {
          console.error('Error parsing user in interceptor:', err);
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Interceptor: Added token to request', config.url);
    } else {
      console.log('API Interceptor: No token found for request', config.url);
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
        // Use programmatic navigation instead of window.location
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
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
