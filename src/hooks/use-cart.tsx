import { create } from 'zustand';
import { 
  getCurrentUserId, 
  loadUserCart, 
  saveUserCart, 
  migrateOldCartData,
  type CartItem 
} from '@/utils/cartManager';

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: (userId?: string) => void;
  saveCart: (cart: CartItem[], userId?: string) => void;
  showContactModal: boolean;
  contactModalProduct: string;
  closeContactModal: () => void;
}



export const useCart = create<CartState>((set, get) => ({
  items: [],
  showContactModal: false,
  contactModalProduct: '',

  addToCart: (item) => {
    const { items } = get();
    
    // Debug logging
    console.log('🛒 Adding item to cart:', item);
    
    // Validate item has required fields
    if (!item._id || !item.title || typeof item.price !== 'number') {
      console.error('❌ Invalid cart item - missing required fields:', {
        hasId: !!item._id,
        hasTitle: !!item.title,
        priceType: typeof item.price,
        item
      });
      return;
    }
    
    // Ensure quantity is a number
    const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
    
    const existingItem = items.find((i) => i._id === item._id);

    let updatedCart;
    if (existingItem) {
      updatedCart = items.map((i) =>
        i._id === item._id
          ? { ...i, quantity: (i.quantity || 0) + quantity }
          : i
      );
    } else {
      updatedCart = [...items, { ...item, quantity }];
    }
    
    console.log('🛒 Updated cart:', updatedCart);
    set({ items: updatedCart });
    
    // Get current user ID for saving
    const userId = getCurrentUserId();
    console.log('🛒 Saving cart for user:', userId);
    saveUserCart(updatedCart, userId);
  },

  removeFromCart: (productId) => {
    const updatedCart = get().items.filter((item) => item._id !== productId);
    set({ items: updatedCart });
    
    // Get current user ID for saving
    const userId = getCurrentUserId();
    saveUserCart(updatedCart, userId);
  },

  removeItem: (itemId) => {
    const updatedCart = get().items.filter((item) => item._id !== itemId);
    set({ items: updatedCart });
    
    // Get current user ID for saving
    const userId = getCurrentUserId();
    saveUserCart(updatedCart, userId);
  },

  updateItemQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    
    const { items } = get();
    const updatedCart = items.map((item) =>
      item._id === itemId ? { ...item, quantity } : item
    );
    set({ items: updatedCart });
    
    // Get current user ID for saving
    const userId = getCurrentUserId();
    saveUserCart(updatedCart, userId);
  },

  clearCart: () => {
    set({ items: [] });
    
    // Get current user ID for saving
    const userId = getCurrentUserId();
    saveUserCart([], userId);
  },

  closeContactModal: () => set({ showContactModal: false, contactModalProduct: '' }),

  loadCart: (userId) => {
    try {
      // If no userId provided, try to get from localStorage
      if (!userId) {
        userId = getCurrentUserId();
      }
      
      // If still no userId, use generic cart (for non-authenticated users)
      const cartKey = userId ? `cart_${userId}` : 'cart';
      const cartData = localStorage.getItem(cartKey);
      
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        // Validate cart data structure
        if (Array.isArray(parsedCart)) {
          const validItems = parsedCart.filter(item => 
            item && item._id && item.title && typeof item.price === 'number' && typeof item.quantity === 'number'
          );
          set({ items: validItems });
          console.log(`🛒 Loaded cart for user: ${userId || 'anonymous'}, items: ${validItems.length}`);
        }
      } else if (userId) {
        // Try to migrate old cart data for authenticated users
        const migratedItems = migrateOldCartData(userId);
        if (migratedItems.length > 0) {
          set({ items: migratedItems });
          console.log(`🔄 Loaded migrated cart for user: ${userId}, items: ${migratedItems.length}`);
        } else {
          // Clear cart if no data found for this user
          set({ items: [] });
          console.log(`🧹 Cleared cart for user: ${userId}`);
        }
      } else {
        // For anonymous users, try to load from generic cart
        const genericCartData = localStorage.getItem('cart');
        if (genericCartData) {
          const parsedCart = JSON.parse(genericCartData);
          if (Array.isArray(parsedCart)) {
            const validItems = parsedCart.filter(item => 
              item && item._id && item.title && typeof item.price === 'number' && typeof item.quantity === 'number'
            );
            set({ items: validItems });
            console.log(`🛒 Loaded generic cart for anonymous user, items: ${validItems.length}`);
          }
        } else {
          set({ items: [] });
          console.log(`🧹 Cleared cart for anonymous user`);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Clear invalid cart data
      const cartKey = userId ? `cart_${userId}` : 'cart';
      localStorage.removeItem(cartKey);
    }
  },

  saveCart: (cart, userId) => {
    try {
      // If no userId provided, try to get from localStorage
      if (!userId) {
        userId = getCurrentUserId();
      }
      
      // If still no userId, use generic cart (for non-authenticated users)
      const cartKey = userId ? `cart_${userId}` : 'cart';
      localStorage.setItem(cartKey, JSON.stringify(cart));
      console.log(`💾 Saved cart for user: ${userId || 'anonymous'}, items: ${cart.length}`);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },
}));

// Add computed values as selectors
export const useCartSelectors = () => {
  const items = useCart((state) => state.items);
  
  return {
    itemCount: items.reduce((total, item) => total + (item.quantity || 0), 0),
    subtotal: items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0),
  };
};

export default useCart;
