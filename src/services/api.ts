import axios, { AxiosInstance } from 'axios';
import { toast } from '../hooks/use-toast';
import { API_URL } from '../config';

export interface CustomAxiosInstance extends AxiosInstance {
  getCached: (url: string, options?: { cache?: boolean, cacheTime?: number, params?: any }) => Promise<any>;
  batch: (requests: Array<{ method: string, url: string, params?: any }>) => Promise<Array<PromiseSettledResult<any>>>;
}

// Create an axios instance with base URL and default headers (120s timeout for slow connections)
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 120s (2 minutes) to accommodate slow 2G/3G connections and cold-start backends
  maxRedirects: 0, // Prevent redirect issues
  maxContentLength: 50000000, // 50MB - allow large payloads like base64 images
  maxBodyLength: 50000000, // 50MB - allow large request bodies
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
}) as CustomAxiosInstance;

if (import.meta.env.DEV && typeof window !== 'undefined') {
  console.log('API URL:', API_URL);
  console.log('Current origin:', window.location.origin);
}

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

// Add a response interceptor to handle errors & automatic retry on slow network
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const isNetworkOrTimeout = error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response;

    // Automatic retry for GET requests on slow/unstable connection
    if (isNetworkOrTimeout && config.method?.toLowerCase() === 'get') {
      config._retryCount = config._retryCount || 0;
      if (config._retryCount < 2) {
        config._retryCount += 1;
        console.warn(`[Network Retry] Slow internet detected. Retrying ${config.url} (Attempt ${config._retryCount}/2)...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return api(config);
      }
    }

    // Handle network timeouts gracefully
    if (error.code === 'ECONNABORTED') {
      console.warn("Connection Timeout - Slow internet detected:", config.url);
      toast({
        variant: "destructive",
        title: "Slow Connection",
        description: "The request is taking longer than expected. Please check your internet connection.",
      });
      return Promise.reject(error);
    }
    
    // Only clear auth on true authentication failures.
    if (error.response?.status === 401) {
      // Ignore 401 on logout requests as user is already exiting session
      if (error.config?.url?.includes('/auth/logout')) {
        return Promise.resolve({ data: {} });
      }
      
      console.error('API Response: Authentication error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      
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
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    }
    
    // Only show toast for critical errors, not for background queries or review requests
    const isReviewRequest = error.config?.url?.includes('/reviews');
    if (error.response?.status >= 500 && !isReviewRequest) {
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

// Enhanced API methods with caching & stale-while-revalidate fallback for fast page loading on slow internet
api.getCached = async (url: string, options: { cache?: boolean, cacheTime?: number, params?: any } = {}) => {
  const { cache = true, cacheTime = 10 * 60 * 1000, params } = options;
  const cacheKey = `api_cache_${url}_${JSON.stringify(params || {})}`;
  const cacheTimeKey = `${cacheKey}_time`;

  const cached = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
  const cachedTime = sessionStorage.getItem(cacheTimeKey) || localStorage.getItem(cacheTimeKey);

  const isFresh = cached && cachedTime && (Date.now() - parseInt(cachedTime, 10)) < cacheTime;

  // If cache is fresh, return immediately so pages open instantly
  if (cache && isFresh) {
    try {
      const parsed = JSON.parse(cached);

      // Silently revalidate in background
      api.get(url, { params }).then(response => {
        if (response?.data) {
          const freshStr = JSON.stringify(response.data);
          sessionStorage.setItem(cacheKey, freshStr);
          localStorage.setItem(cacheKey, freshStr);
          sessionStorage.setItem(cacheTimeKey, Date.now().toString());
          localStorage.setItem(cacheTimeKey, Date.now().toString());
        }
      }).catch(() => {});

      return { data: parsed, isCached: true };
    } catch (e) {
      // Fallback to fetch if parse fails
    }
  }

  try {
    const response = await api.get(url, { params });
    if (cache && response?.data) {
      const freshStr = JSON.stringify(response.data);
      sessionStorage.setItem(cacheKey, freshStr);
      localStorage.setItem(cacheKey, freshStr);
      sessionStorage.setItem(cacheTimeKey, Date.now().toString());
      localStorage.setItem(cacheTimeKey, Date.now().toString());
    }
    return response;
  } catch (error) {
    // Stale cache fallback: if network is slow/failed, return cached data so the page OPENS!
    if (cache && cached) {
      try {
        console.warn(`[API Cache Fallback] Network failed for ${url}, serving cached data so page opens.`);
        return { data: JSON.parse(cached), isStale: true };
      } catch (e) {
        // Ignore parse error
      }
    }
    throw error;
  }
};

// Batch requests method
api.batch = async (requests: Array<{ method: string, url: string, params?: any }>) => {
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
};

export default api;
