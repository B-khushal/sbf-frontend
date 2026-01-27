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
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw new Error('Failed to fetch wishlist');
  }
};

// Add item to wishlist
export const addToWishlist = async (productId: string): Promise<WishlistResponse> => {
  try {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    if (error.response?.status === 401) {
      throw new Error('Please log in to add items to wishlist');
    }
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already in wishlist')) {
      throw new Error('Product already in wishlist');
    }
    throw new Error(error.response?.data?.message || 'Failed to add to wishlist');
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (productId: string): Promise<WishlistResponse> => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove from wishlist');
  }
};

// Clear wishlist
export const clearWishlist = async (): Promise<WishlistResponse> => {
  try {
    const response = await api.delete('/wishlist');
    return response.data;
  } catch (error: any) {
    console.error('Error clearing wishlist:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear wishlist');
  }
}; 