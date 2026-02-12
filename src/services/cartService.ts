import api from './api';

export interface CartItem {
  _id: string;
  productId: string;
  title: string;
  price: number;
  images: string[];
  discount?: number;
  category?: string;
  description?: string;
  quantity: number;
  addedAt: string;
  careInstructions?: string[];
  isNewArrival?: boolean;
  isFeatured?: boolean;
  customizations?: any;
  selectedVariant?: {
    label: string;
    price: number;
    stock: number;
  };
}

export interface CartResponse {
  success: boolean;
  cart: CartItem[];
  itemCount: number;
  message?: string;
}

// Get user's cart
export const getCart = async (): Promise<CartResponse> => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw new Error('Failed to fetch cart');
  }
};

// Add item to cart
export const addToCart = async (
  productId: string,
  quantity: number = 1,
  customizations?: any,
  customPrice?: number,
  selectedVariant?: {
    label: string;
    price: number;
    stock: number;
  }
): Promise<CartResponse> => {
  try {
    const response = await api.post('/cart', { productId, quantity, customizations, customPrice, selectedVariant });
    return response.data;
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    if (error.response?.status === 401) {
      throw new Error('Please log in to add items to cart');
    }
    throw new Error(error.response?.data?.message || 'Failed to add to cart');
  }
};

// Update cart item quantity
export const updateCartItem = async (productId: string, quantity: number): Promise<CartResponse> => {
  try {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    throw new Error(error.response?.data?.message || 'Failed to update cart item');
  }
};

// Remove item from cart
export const removeFromCart = async (productId: string): Promise<CartResponse> => {
  try {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove from cart');
  }
};

// Clear cart
export const clearCart = async (): Promise<CartResponse> => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
}; 