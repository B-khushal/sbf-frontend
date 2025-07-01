import axios from 'axios';
import { toast } from '../hooks/use-toast';

// Create an axios instance with base URL and default headers
export const api = axios.create({
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
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token } = response.data;

        localStorage.setItem('token', token);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (error) {
        // If refresh token fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

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
      // Save cart state before clearing auth
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const cartKey = `cart_${userId}`;
      const savedCart = localStorage.getItem(cartKey);
      
      // Clear invalid authentication but preserve cart
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      // Restore cart state if it existed
      if (savedCart && userId) {
        localStorage.setItem(cartKey, savedCart);
      }
      
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
