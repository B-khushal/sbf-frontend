import api from './api';

export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  discount?: number;
  category?: string;
  description?: string;
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  wishlist: WishlistItem[];
  itemCount: number;
  message?: string;
}

// Get user's wishlist
export const getWishlist = async (): Promise<WishlistResponse> => {
  try {
    console.log('getWishlist API call started');
    const response = await api.get('/wishlist');
    console.log('getWishlist API response:', response);
    
    // Ensure response has the expected structure
    if (response.data && typeof response.data === 'object') {
      const result = {
        success: response.data.success || true,
        wishlist: response.data.wishlist || [],
        itemCount: response.data.itemCount || 0,
        message: response.data.message
      };
      console.log('getWishlist processed result:', result);
      return result;
    }
    
    throw new Error('Invalid response format from server');
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view your wishlist');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch wishlist');
  }
};

// Add item to wishlist
export const addToWishlist = async (productId: string): Promise<WishlistResponse> => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    const response = await api.post('/wishlist', { productId });
    
    // Ensure response has the expected structure
    if (response.data && typeof response.data === 'object') {
      return {
        success: response.data.success || true,
        wishlist: response.data.wishlist || [],
        itemCount: response.data.itemCount || 0,
        message: response.data.message
      };
    }
    
    throw new Error('Invalid response format from server');
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to add items to wishlist');
    }
    
    if (error.response?.status === 400) {
      const message = error.response?.data?.message || '';
      if (message.includes('already in wishlist')) {
        throw new Error('Product already in wishlist');
      }
      if (message.includes('Product ID is required')) {
        throw new Error('Product ID is required');
      }
      if (message.includes('Product not found')) {
        throw new Error('Product not found');
      }
      throw new Error(message || 'Invalid request');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Product not found');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to add to wishlist');
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (productId: string): Promise<WishlistResponse> => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    const response = await api.delete(`/wishlist/${productId}`);
    
    // Ensure response has the expected structure
    if (response.data && typeof response.data === 'object') {
      return {
        success: response.data.success || true,
        wishlist: response.data.wishlist || [],
        itemCount: response.data.itemCount || 0,
        message: response.data.message
      };
    }
    
    throw new Error('Invalid response format from server');
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to manage your wishlist');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Product not found in wishlist');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to remove from wishlist');
  }
};

// Clear wishlist
export const clearWishlist = async (): Promise<WishlistResponse> => {
  try {
    const response = await api.delete('/wishlist');
    
    // Ensure response has the expected structure
    if (response.data && typeof response.data === 'object') {
      return {
        success: response.data.success || true,
        wishlist: response.data.wishlist || [],
        itemCount: response.data.itemCount || 0,
        message: response.data.message
      };
    }
    
    throw new Error('Invalid response format from server');
  } catch (error: any) {
    console.error('Error clearing wishlist:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to manage your wishlist');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to clear wishlist');
  }
}; 