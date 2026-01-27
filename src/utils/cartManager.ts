// Cart management utilities for user-specific cart storage

export interface CartItem {
  _id: string;
  id?: string;
  productId?: string;
  title: string;
  price: number;
  image?: string;
  images: string[];
  quantity: number;
  discount?: number;
  category?: string;
  description?: string;
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

// Get current user ID from localStorage
export const getCurrentUserId = (): string | null => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || user.id || null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get cart key for a specific user
export const getCartKey = (userId?: string): string => {
  if (!userId) {
    userId = getCurrentUserId();
  }
  return userId ? `cart_${userId}` : 'cart';
};

// Load cart for a specific user
export const loadUserCart = (userId?: string): CartItem[] => {
  try {
    const cartKey = getCartKey(userId);
    const cartData = localStorage.getItem(cartKey);
    
    if (cartData) {
      const parsedCart = JSON.parse(cartData);
      if (Array.isArray(parsedCart)) {
        const validItems = parsedCart.filter(item => 
          item && item._id && item.title && typeof item.price === 'number' && typeof item.quantity === 'number'
        );
        console.log(`🛒 Loaded cart for user: ${userId || 'anonymous'}, items: ${validItems.length}`);
        return validItems;
      }
    }
  } catch (error) {
    console.error('Error loading user cart:', error);
  }
  
  return [];
};

// Save cart for a specific user
export const saveUserCart = (cart: CartItem[], userId?: string): void => {
  try {
    const cartKey = getCartKey(userId);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    console.log(`💾 Saved cart for user: ${userId || 'anonymous'}, items: ${cart.length}`);
  } catch (error) {
    console.error('Error saving user cart:', error);
  }
};

// Clear cart for a specific user
export const clearUserCart = (userId?: string): void => {
  try {
    const cartKey = getCartKey(userId);
    localStorage.removeItem(cartKey);
    console.log(`🧹 Cleared cart for user: ${userId || 'anonymous'}`);
  } catch (error) {
    console.error('Error clearing user cart:', error);
  }
};

// Migrate old cart data to user-specific storage
export const migrateOldCartData = (userId: string): CartItem[] => {
  try {
    const oldCartData = localStorage.getItem('cart');
    if (oldCartData) {
      const parsedCart = JSON.parse(oldCartData);
      if (Array.isArray(parsedCart) && parsedCart.length > 0) {
        // Validate and migrate cart items
        const validItems = parsedCart.filter(item => 
          item && item._id && item.title && typeof item.price === 'number' && typeof item.quantity === 'number'
        );
        
        if (validItems.length > 0) {
          // Save to new user-specific location
          saveUserCart(validItems, userId);
          // Remove old cart data
          localStorage.removeItem('cart');
          console.log(`🔄 Migrated ${validItems.length} items from old cart to user-specific cart for user: ${userId}`);
          return validItems;
        }
      }
    }
  } catch (error) {
    console.error('Error migrating old cart data:', error);
  }
  return [];
};

// Handle user login - migrate any existing cart data
export const handleUserLogin = (userId: string): CartItem[] => {
  // First try to load existing user-specific cart
  let cartItems = loadUserCart(userId);
  
  // If no user-specific cart exists, try to migrate old cart data
  if (cartItems.length === 0) {
    cartItems = migrateOldCartData(userId);
  }
  
  return cartItems;
};

// Handle user logout - clear user-specific cart
export const handleUserLogout = (userId: string): void => {
  clearUserCart(userId);
};

// Get all cart keys in localStorage (for debugging)
export const getAllCartKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cart_')) {
      keys.push(key);
    }
  }
  return keys;
};

// Clean up orphaned cart data (for maintenance)
export const cleanupOrphanedCarts = (): void => {
  try {
    const cartKeys = getAllCartKeys();
    const currentUserId = getCurrentUserId();
    
    cartKeys.forEach(key => {
      const userId = key.replace('cart_', '');
      // Keep current user's cart and generic cart
      if (userId !== currentUserId && key !== 'cart') {
        localStorage.removeItem(key);
        console.log(`🧹 Cleaned up orphaned cart: ${key}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up orphaned carts:', error);
  }
}; 