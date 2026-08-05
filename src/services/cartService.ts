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
  productModel?: string;
  selectedVariant?: {
    label: string;
    price: number;
    stock: number;
  };
  personalizationEnabled?: boolean;
  personalizationType?: string;
  fieldLabel?: string;
  placeholder?: string;
  minCharacters?: number;
  maxCharacters?: number;
  allowedCharacters?: {
    alphabets: boolean;
    numbers: boolean;
    spaces: boolean;
    hyphen: boolean;
    ampersand: boolean;
    period: boolean;
    emoji: boolean;
  };
  personalizationRequired?: boolean;
  textTransform?: string;
  helperText?: string;
  pricePerCharacter?: number;
  baseIncludedCharacters?: number;
  maxExtraPrice?: number;
  sameDay?: boolean;
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
  },
  productModel?: string
): Promise<CartResponse> => {
  try {
    const response = await api.post('/cart', { productId, quantity, customizations, customPrice, selectedVariant, productModel });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to add items to cart');
    }
    const message = error.response?.data?.message || 'Failed to add to cart';
    const err = new Error(message);
    (err as any).response = error.response;
    (err as any).status = error.response?.status;
    throw err;
  }
};

// Update cart item details
export const updateCartItem = async (
  productId: string,
  quantity?: number,
  customizations?: any,
  customPrice?: number
): Promise<CartResponse> => {
  try {
    const response = await api.put(`/cart/${productId}`, { quantity, customizations, customPrice });
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