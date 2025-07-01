import axios from 'axios';
import { API_URL } from '@/config';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ||'https://sbf-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ProductReview {
  _id?: string;
  user: string;
  name: string;
  email?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase?: boolean;
  images?: string[];
  pros?: string[];
  cons?: string[];
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  helpfulVotes?: number;
  totalVotes?: number;
  helpfulnessPercentage?: number;
  createdAt: string;
  response?: {
    text: string;
    respondedBy: {
      name: string;
      role: string;
    };
    respondedAt: string;
  };
}

export interface ProductData {
  _id?: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  categories?: string[];
  brand?: string;
  countInStock: number;
  images: string[];
  details?: string[];
  careInstructions?: string[];
  isNewArrival?: boolean;
  isFeatured?: boolean;
  hidden?: boolean;
  rating?: number;
  numReviews?: number;
  reviews?: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
}

// Define backend product type to match backend schema
interface BackendProductData {
  _id?: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  categories?: string[];
  brand?: string;
  countInStock: number;
  images: string[];
  details?: string[];
  careInstructions?: string[];
  isNew?: boolean; // Backend uses isNew
  isFeatured?: boolean;
  hidden?: boolean;
  rating?: number;
  numReviews?: number;
  reviews?: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Allow other properties with unknown type
}

// Helper function to get auth token from storage
const getAuthToken = () => {
  // Try userData first (from our recent changes)
  const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      if (parsed.token) return parsed.token;
    } catch (err) {
      console.error('Error parsing userData:', err);
    }
  }
  
  // Fall back to user (from the existing auth system)
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.token) return parsed.token;
    } catch (err) {
      console.error('Error parsing user data:', err);
    }
  }
  
  // Finally, try direct token storage
  const token = localStorage.getItem('token');
  if (token) return token;
  
  return null;
};

// Helper function to create config with auth header
const createAuthConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    }
  };
};

// Helper function to clean product data for API submission
const prepareProductData = (productData: ProductData): BackendProductData => {
  // Clean empty or null values, ensure boolean fields are sent as booleans
  const cleanData: BackendProductData = { ...productData };
  
  // Map isNewArrival to isNew for the backend
  cleanData.isNew = Boolean(productData.isNewArrival);
  
  // Force boolean fields to be actual booleans
  cleanData.isFeatured = Boolean(productData.isFeatured);
  cleanData.hidden = Boolean(productData.hidden);
  
  // Process details for backend (convert array to format expected by backend)
  if (Array.isArray(productData.details)) {
    // Filter out empty details and send as array
    cleanData.details = productData.details.filter(detail => 
      detail && typeof detail === 'string' && detail.trim().length > 0
    );
  }

  // Process care instructions for backend
  if (Array.isArray(productData.careInstructions)) {
    cleanData.careInstructions = productData.careInstructions.filter(instruction => 
      instruction && typeof instruction === 'string' && instruction.trim().length > 0
    );
  }
  
  // Remove isNewArrival as the backend doesn't use this field name
  delete cleanData.isNewArrival;
  
  console.log('Prepared product data:', {
    original: {
      isNewArrival: productData.isNewArrival,
      isNewArrivalType: typeof productData.isNewArrival,
      isFeatured: productData.isFeatured,
      isFeaturedType: typeof productData.isFeatured
    },
    cleaned: {
      isNew: cleanData.isNew,
      isNewType: typeof cleanData.isNew,
      isFeatured: cleanData.isFeatured,
      isFeaturedType: typeof cleanData.isFeatured
    }
  });
  
  return cleanData;
};

// Helper function to map backend data to frontend model
const mapBackendToFrontend = (data: BackendProductData): ProductData => {
  // Create a copy to avoid modifying the original
  const mappedData: Partial<ProductData> = { ...data };

  // Map isNew to isNewArrival
  if ('isNew' in data) {
    mappedData.isNewArrival = Boolean(data.isNew);
    console.log('Mapping product:', {
      title: data.title,
      backendIsNew: data.isNew,
      mappedIsNewArrival: mappedData.isNewArrival
    });
  } else {
    console.log('Product has no isNew property:', {
      title: data.title,
      keys: Object.keys(data)
    });
  }

  // ✅ Handle details properly (flatten nested arrays from backend)
  if (Array.isArray(data.details)) {
    // Backend sends details as array of arrays, flatten it for frontend
    mappedData.details = data.details.flat().filter(detail => 
      detail && typeof detail === 'string' && detail.trim().length > 0
    );
  } else if (typeof data.details === 'string') {
    // Split by comma or any separator if it's a string
    mappedData.details = data.details.split(/[,•]/).map(str => str.trim()).filter(str => str.length > 0);
  } else {
    mappedData.details = [];
  }

  // ✅ Handle care instructions
  if (Array.isArray(data.careInstructions)) {
    mappedData.careInstructions = data.careInstructions.filter(instruction => 
      instruction && typeof instruction === 'string' && instruction.trim().length > 0
    );
  } else {
    mappedData.careInstructions = [];
  }

  return mappedData as ProductData;
};

class ProductService {
  async getProducts(): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products`);
    // Map each product to our frontend model
    return Array.isArray(response.data) 
      ? response.data.map(mapBackendToFrontend) 
      : [];
  }

  async getProductById(id: string): Promise<ProductData> {
    const config = createAuthConfig();
    const response = await axios.get(`${API_URL}/products/${id}`, config);
    
    // Map the backend data to our frontend model
    return mapBackendToFrontend(response.data);
  }

  async createProduct(productData: ProductData): Promise<ProductData> {
    const config = createAuthConfig();
    console.log('Creating product with data:', productData);
    
    // Process data ensuring proper types for all fields
    const processedData = prepareProductData(productData);
    
    console.log('Using auth config:', config);
    
    const response = await axios.post(`${API_URL}/products`, processedData, config);
    console.log('Create response:', response.data);
    return response.data;
  }

  async updateProduct(id: string, productData: ProductData): Promise<ProductData> {
    const config = createAuthConfig();
    console.log('Updating product ID:', id);
    
    // Process data ensuring proper types for all fields
    const processedData = prepareProductData(productData);
    
    console.log('Using auth config:', config);
    
    const response = await axios.put(`${API_URL}/products/${id}`, processedData, config);
    console.log('Update response:', response.data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    const config = createAuthConfig();
    await axios.delete(`${API_URL}/products/${id}`, config);
  }

  async getProductsByCategory(category: string): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products/category/${category}`);
    return response.data;
  }

  async getNewArrivals(): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products/new-arrivals`);
    console.log('New arrivals response:', response.data);
    
    // Extract products from the response
    const products = response.data.products || response.data;
    
    // Map each product to our frontend model
    return Array.isArray(products) 
      ? products.map(mapBackendToFrontend) 
      : [];
  }

  async getFeaturedProducts(): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products/featured`);
    console.log('Featured products response:', response.data);
    
    // Extract products from the response
    const products = response.data.products || response.data;
    
    // Map each product to our frontend model
    return Array.isArray(products) 
      ? products.map(mapBackendToFrontend) 
      : [];
  }

  async searchProducts(query: string): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products/search?q=${query}`);
    return response.data;
  }
}

export default new ProductService();

// Get all products with pagination and filtering
export const getProducts = async (page = 1, category?: string) => {
  const response = await axios.get<{ products: ProductData[], page: number, pages: number }>(`${API_URL}/products`, {
    params: {
      page,
      category,
    },
  });
  return response.data;
};

// Get top rated products
export const getTopProducts = async () => {
  const response = await axios.get<ProductData[]>(`${API_URL}/products/top`);
  return response.data;
};

// Create product review with enhanced features
export const createProductReview = async (productId: string, review: {
  rating: number;
  title: string;
  comment: string;
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  pros?: string[];
  cons?: string[];
  images?: string[];
}) => {
  const config = createAuthConfig();
  const response = await axios.post<{ 
    message: string;
    review: ProductReview;
    isVerifiedPurchase: boolean;
  }>(`${API_URL}/products/${productId}/reviews`, review, config);
  return response.data;
};

// Get product reviews with filtering
export const getProductReviews = async (productId: string, options?: {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
  rating?: number;
  verified?: boolean;
  withImages?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  
  if (options?.page) queryParams.append('page', options.page.toString());
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.sort) queryParams.append('sort', options.sort);
  if (options?.rating) queryParams.append('rating', options.rating.toString());
  if (options?.verified !== undefined) queryParams.append('verified', options.verified.toString());
  if (options?.withImages !== undefined) queryParams.append('withImages', options.withImages.toString());

  const response = await axios.get<{
    reviews: ProductReview[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    stats: {
      totalReviews: number;
      averageRating: number;
      verifiedPurchases: number;
      verifiedPurchasePercentage: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
      averageQualityRating?: number;
      averageValueRating?: number;
      averageDeliveryRating?: number;
    };
    helpfulReviews: ProductReview[];
  }>(`${API_URL}/products/${productId}/reviews?${queryParams}`);
  
  return response.data;
};

// Vote on review helpfulness
export const voteOnReview = async (reviewId: string, vote: 'helpful' | 'not_helpful') => {
  const config = createAuthConfig();
  const response = await axios.post<{
    message: string;
    helpfulVotes: number;
    totalVotes: number;
    helpfulnessPercentage: number;
    userVote: string | null;
  }>(`${API_URL}/reviews/${reviewId}/vote`, { vote }, config);
  return response.data;
};

// Update review
export const updateReview = async (reviewId: string, reviewData: {
  rating?: number;
  title?: string;  
  comment?: string;
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  pros?: string[];
  cons?: string[];
  images?: string[];
}) => {
  const config = createAuthConfig();
  const response = await axios.put<{
    message: string;
    review: ProductReview;
  }>(`${API_URL}/reviews/${reviewId}`, reviewData, config);
  return response.data;
};

// Delete review
export const deleteReview = async (reviewId: string) => {
  const config = createAuthConfig();
  const response = await axios.delete<{ message: string }>(`${API_URL}/reviews/${reviewId}`, config);
  return response.data;
};

// Get user's reviews
export const getUserReviews = async (page = 1, limit = 10) => {
  const config = createAuthConfig();
  const response = await axios.get<{
    reviews: (ProductReview & {
      product: {
        _id: string;
        title: string;
        images: string[];
        price: number;
      };
    })[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`${API_URL}/reviews/my-reviews?page=${page}&limit=${limit}`, config);
  return response.data;
};

export const productService = {
  // Get all products with optional filters
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get a single product by ID
  getProductById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get new products
  getNewProducts: async () => {
    try {
      const response = await api.get('/products/new');
      return response.data;
    } catch (error) {
      console.error('Error fetching new products:', error);
      throw error;
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string, page = 1) => {
    try {
      const response = await api.get(`/products/category/${category}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Add product to wishlist
  addToWishlist: async (productId: string) => {
    try {
      const response = await api.post(`/products/${productId}/wishlist`);
      return response.data;
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
      throw error;
    }
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string) => {
    try {
      const response = await api.delete(`/products/${productId}/wishlist`);
      return response.data;
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      throw error;
    }
  },

  // Admin: Create a new product
  createProduct: async (productData: any) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Admin: Update a product
  updateProduct: async (id: string, productData: any) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Admin: Delete a product
  deleteProduct: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Admin: Get all products (including hidden)
  getAdminProducts: async (page = 1) => {
    try {
      const response = await api.get('/products/admin/list', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin products:', error);
      throw error;
    }
  },

  // Admin: Toggle product visibility
  toggleProductVisibility: async (productId: string) => {
    try {
      const response = await api.put(`/products/admin/${productId}/toggle-visibility`);
      return response.data;
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      throw error;
    }
  },

  // Admin: Get low stock products
  getLowStockProducts: async () => {
    try {
      const response = await api.get('/products/admin/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  },
};
