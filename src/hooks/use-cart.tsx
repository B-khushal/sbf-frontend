import { create } from 'zustand';
import { 
  getCurrentUserId, 
  loadUserCart, 
  saveUserCart, 
  migrateOldCartData,
  type CartItem 
} from '@/utils/cartManager';
import * as cartService from '@/services/cartService';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: (userId?: string) => Promise<void>;
  saveCart: (cart: CartItem[], userId?: string) => void;
  showContactModal: boolean;
  contactModalProduct: string;
  closeContactModal: () => void;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  showContactModal: false,
  contactModalProduct: '',

  addToCart: async (item) => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!item._id || !item.title || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      console.error('Invalid cart item:', item);
      throw new Error('Invalid cart item');
    }
    set({ isLoading: true });
    try {
      if (isAuthenticated) {
        // Add to backend with customizations and custom price
        const response = await cartService.addToCart(
          item._id,
          item.quantity,
          item.customizations,
          item.price, // customPrice
          item.selectedVariant
        );
        // Update local state with backend response
        const transformedItems = response.cart.map(cartItem => ({
          _id: cartItem._id,
          id: cartItem._id,
          productId: cartItem.productId,
          title: cartItem.title,
          price: cartItem.price,
          image: cartItem.images?.[0] || '',
          images: cartItem.images,
          quantity: cartItem.quantity,
          category: cartItem.category,
          discount: cartItem.discount,
          description: cartItem.description,
          careInstructions: cartItem.careInstructions ?? [],
          isNewArrival: cartItem.isNewArrival ?? false,
          isFeatured: cartItem.isFeatured ?? false,
          customizations: cartItem.customizations ?? undefined,
          selectedVariant: cartItem.selectedVariant ?? undefined,
        }));
        set({ items: transformedItems });
        const userId = getCurrentUserId();
        saveUserCart(transformedItems, userId);
      } else {
        // Guest: Add to local cart
        const currentItems = get().items;
        // If same product+customizations exists, increase quantity
        const matchIndex = currentItems.findIndex(
          i => i._id === item._id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
        );
        let newItems;
        if (matchIndex > -1) {
          newItems = [...currentItems];
          newItems[matchIndex].quantity += item.quantity;
        } else {
          newItems = [...currentItems, item];
        }
        set({ items: newItems });
        const userId = getCurrentUserId();
        saveUserCart(newItems, userId);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (productId) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      throw new Error('Please log in to manage your cart');
    }

    set({ isLoading: true });
    
    try {
      const response = await cartService.removeFromCart(productId);
      
      const transformedItems = response.cart.map(cartItem => ({
        _id: cartItem._id,
        id: cartItem._id,
        productId: cartItem.productId,
        title: cartItem.title,
        price: cartItem.price,
        image: cartItem.images?.[0] || '',
        images: cartItem.images,
        quantity: cartItem.quantity,
        category: cartItem.category,
        discount: cartItem.discount,
        description: cartItem.description,
        careInstructions: [],
        isNewArrival: false,
        isFeatured: false
      }));
      
      set({ items: transformedItems });
      
      const userId = getCurrentUserId();
      saveUserCart(transformedItems, userId);
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    await get().removeFromCart(itemId);
  },

  updateItemQuantity: async (itemId, quantity) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      throw new Error('Please log in to manage your cart');
    }

    if (quantity <= 0) {
      await get().removeItem(itemId);
      return;
    }

    set({ isLoading: true });
    
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      
      const transformedItems = response.cart.map(cartItem => ({
        _id: cartItem._id,
        id: cartItem._id,
        productId: cartItem.productId,
        title: cartItem.title,
        price: cartItem.price,
        image: cartItem.images?.[0] || '',
        images: cartItem.images,
        quantity: cartItem.quantity,
        category: cartItem.category,
        discount: cartItem.discount,
        description: cartItem.description,
        careInstructions: [],
        isNewArrival: false,
        isFeatured: false
      }));
      
      set({ items: transformedItems });
      
      const userId = getCurrentUserId();
      saveUserCart(transformedItems, userId);
      
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      throw new Error('Please log in to manage your cart');
    }

    set({ isLoading: true });
    
    try {
      await cartService.clearCart();
      set({ items: [] });
      
      const userId = getCurrentUserId();
      saveUserCart([], userId);
      
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  closeContactModal: () => set({ showContactModal: false, contactModalProduct: '' }),

  loadCart: async (userId) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
      // For non-authenticated users, load from localStorage
      try {
        if (!userId) {
          userId = getCurrentUserId();
        }
        
        const cartKey = userId ? `cart_${userId}` : 'cart';
        const cartData = localStorage.getItem(cartKey);
        
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          if (Array.isArray(parsedCart)) {
            const validItems = parsedCart.filter(item => 
              item && item._id && item.title && typeof item.price === 'number' && typeof item.quantity === 'number'
            );
            set({ items: validItems });
            console.log(`🛒 Loaded cart for user: ${userId || 'anonymous'}, items: ${validItems.length}`);
          }
        } else if (userId) {
          const migratedItems = migrateOldCartData(userId);
          if (migratedItems.length > 0) {
            set({ items: migratedItems });
            console.log(`🔄 Loaded migrated cart for user: ${userId}, items: ${migratedItems.length}`);
          } else {
            set({ items: [] });
            console.log(`🧹 Cleared cart for user: ${userId}`);
          }
        } else {
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
        const cartKey = userId ? `cart_${userId}` : 'cart';
        localStorage.removeItem(cartKey);
      }
      return;
    }

    // For authenticated users, load from backend
    set({ isLoading: true });
    
    try {
      const response = await cartService.getCart();
      
      const transformedItems = response.cart.map(cartItem => ({
        _id: cartItem._id,
        id: cartItem._id,
        productId: cartItem.productId,
        title: cartItem.title,
        price: cartItem.price,
        image: cartItem.images?.[0] || '',
        images: cartItem.images,
        quantity: cartItem.quantity,
        category: cartItem.category,
        discount: cartItem.discount,
        description: cartItem.description,
        careInstructions: cartItem.careInstructions ?? [],
        isNewArrival: cartItem.isNewArrival ?? false,
        isFeatured: cartItem.isFeatured ?? false,
        customizations: cartItem.customizations ?? undefined,
        selectedVariant: cartItem.selectedVariant ?? undefined,
      }));
      
      set({ items: transformedItems });
      
      // Also save to localStorage as backup
      const currentUserId = getCurrentUserId();
      saveUserCart(transformedItems, currentUserId);
      
      console.log(`🛒 Loaded cart from backend for user: ${currentUserId}, items: ${transformedItems.length}`);
      
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      // Fallback to localStorage
      try {
        const currentUserId = getCurrentUserId();
        const cartData = localStorage.getItem(`cart_${currentUserId}`);
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          if (Array.isArray(parsedCart)) {
            const validItems = parsedCart.filter(item => 
              item && item._id && item.title && typeof item.price === 'number' && typeof item.quantity === 'number'
            );
            set({ items: validItems });
            console.log(`🛒 Fallback: Loaded cart from localStorage for user: ${currentUserId}, items: ${validItems.length}`);
          }
        }
      } catch (fallbackError) {
        console.error('Error in fallback cart loading:', fallbackError);
        set({ items: [] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  saveCart: (cart, userId) => {
    try {
      if (!userId) {
        userId = getCurrentUserId();
      }
      
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
    subtotal: items.reduce((total, item) => {
      // Always use item.price as the final price (already includes customizations/discounts)
      return total + (item.price || 0) * (item.quantity || 0);
    }, 0),
  };
};

export default useCart;
