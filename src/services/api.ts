import axios from 'axios';
import { toast } from '../hooks/use-toast';

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sbf-backend.onrender.com/api',
  timeout: 15000, // Reduced from 30s to 15s for better UX
  maxRedirects: 0, // Prevent redirect issues
  maxContentLength: 1000000, // Increase max payload size
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request deduplication interceptor
api.interceptors.request.use(
  (config) => {
    // Create request key for deduplication
    const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
    
    // Check if same request is already pending
    if (pendingRequests.has(requestKey)) {
      // Return the existing promise
      return pendingRequests.get(requestKey);
    }
    
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
          // Silent error handling for better performance
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
          // Silent error handling for better performance
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors and cleanup
api.interceptors.response.use(
  (response) => {
    // Cleanup pending request
    const requestKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}`;
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    // Cleanup pending request
    if (error.config) {
      const requestKey = `${error.config.method}:${error.config.url}:${JSON.stringify(error.config.params)}`;
      pendingRequests.delete(requestKey);
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      toast({
        variant: "destructive",
        title: "Connection Timeout",
        description: "Please check your internet connection",
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
    
    // Only show toast for critical errors, not for every 404 or network issue
    if (error.response?.status >= 500) {
      const message = error.response?.data?.message || 'Server error occurred';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API methods with caching and deduplication
const apiWithCache = {
  ...api,
  
  // GET with caching support
  getCached: async (url: string, options: { cache?: boolean, cacheTime?: number, params?: any } = {}) => {
    const { cache = false, cacheTime = 5 * 60 * 1000, params } = options;
    
    if (cache) {
      const cacheKey = `api_cache_${url}_${JSON.stringify(params)}`;
      const cached = sessionStorage.getItem(cacheKey);
      const cacheTimeKey = `${cacheKey}_time`;
      const cachedTime = sessionStorage.getItem(cacheTimeKey);
      
      if (cached && cachedTime && (Date.now() - parseInt(cachedTime)) < cacheTime) {
        return { data: JSON.parse(cached) };
      }
    }
    
    const response = await api.get(url, { params });
    
    if (cache) {
      const cacheKey = `api_cache_${url}_${JSON.stringify(params)}`;
      const cacheTimeKey = `${cacheKey}_time`;
      sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      sessionStorage.setItem(cacheTimeKey, Date.now().toString());
    }
    
    return response;
  },
  
  // Batch requests
  batch: async (requests: Array<{ method: string, url: string, params?: any }>) => {
    const promises = requests.map(req => {
      switch (req.method.toLowerCase()) {
        case 'get':
          return api.get(req.url, { params: req.params });
        case 'post':
          return api.post(req.url, req.params);
        case 'put':
          return api.put(req.url, req.params);
        case 'delete':
          return api.delete(req.url, { params: req.params });
        default:
          throw new Error(`Unsupported method: ${req.method}`);
      }
    });
    
    return Promise.allSettled(promises);
  }
};

export default apiWithCache;
