import api from './api';

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
  product?: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    description: string;
    category: string;
    discount?: number;
  };
}

export interface WishlistItem {
  _id: string;
  title: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  discount?: number;
}

// Cart API functions
export const cartService = {
  // Get user's cart
  getCart: async (): Promise<CartItem[]> => {
    try {
      const response = await api.get('/products/cart');
      return response.data.cart || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId: string, quantity: number = 1): Promise<CartItem[]> => {
    try {
      const response = await api.post('/products/cart', {
        productId,
        quantity
      });
      return response.data.cart || [];
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (productId: string): Promise<CartItem[]> => {
    try {
      const response = await api.delete(`/products/cart/${productId}`);
      return response.data.cart || [];
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartQuantity: async (productId: string, quantity: number): Promise<CartItem[]> => {
    try {
      const response = await api.put(`/products/cart/${productId}`, {
        quantity
      });
      return response.data.cart || [];
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async (): Promise<void> => {
    try {
      await api.delete('/products/cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

// Wishlist API functions
export const wishlistService = {
  // Get user's wishlist
  getWishlist: async (): Promise<WishlistItem[]> => {
    try {
      const response = await api.get('/products/wishlist');
      return response.data.wishlist || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Add item to wishlist
  addToWishlist: async (productId: string): Promise<void> => {
    try {
      await api.post(`/products/${productId}/wishlist`);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId: string): Promise<void> => {
    try {
      await api.delete(`/products/${productId}/wishlist`);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }
}; 