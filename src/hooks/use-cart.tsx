import { create } from 'zustand';
import { 
  getCurrentUserId, 
  loadUserCart, 
  saveUserCart, 
  migrateOldCartData,
  type CartItem 
} from '@/utils/cartManager';
import { cartService } from '@/services/cartService';
import { useAuth } from '@/hooks/use-auth';

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
  isLoading: boolean;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  showContactModal: false,
  contactModalProduct: '',
  isLoading: false,

  addToCart: async (item) => {
    const { items } = get();
    
    // Validate item has required fields
    if (!item._id || !item.title || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      console.error('Invalid cart item:', item);
      return;
    }

    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (user._id && token) {
      // Use backend API for authenticated users
      try {
        set({ isLoading: true });
        const updatedCart = await cartService.addToCart(item._id, item.quantity);
        
        // Transform backend cart format to frontend format
        const transformedItems = updatedCart.map(cartItem => {
          // Ensure product data exists
          if (!cartItem.product) {
            console.error('Missing product data for cart item:', cartItem);
            return null;
          }
          
          return {
            _id: cartItem.productId,
            id: cartItem.productId,
            productId: cartItem.productId,
            title: cartItem.product.title || '',
            price: cartItem.product.price || 0,
            images: cartItem.product.images || [],
            quantity: cartItem.quantity,
            category: cartItem.product.category || '',
            discount: cartItem.product.discount || 0,
            description: cartItem.product.description || '',
            addedAt: cartItem.addedAt
          };
        }).filter(Boolean); // Remove null items

        set({ items: transformedItems, isLoading: false });
      } catch (error) {
        console.error('Error adding to cart via API:', error);
        set({ isLoading: false });
        
        // Fallback to localStorage if API fails
        const existingItem = items.find((i) => i._id === item._id);
        let updatedCart;
        if (existingItem) {
          updatedCart = items.map((i) =>
            i._id === item._id
              ? { ...i, quantity: (i.quantity || 0) + (item.quantity || 1) }
              : i
          );
        } else {
          updatedCart = [...items, { ...item, quantity: item.quantity || 1 }];
        }
        set({ items: updatedCart });
        
        // Get current user ID for saving
        const userId = getCurrentUserId();
        saveUserCart(updatedCart, userId);
      }
    } else {
      // Use localStorage for non-authenticated users
      const existingItem = items.find((i) => i._id === item._id);

      let updatedCart;
      if (existingItem) {
        updatedCart = items.map((i) =>
          i._id === item._id
            ? { ...i, quantity: (i.quantity || 0) + (item.quantity || 1) }
            : i
        );
      } else {
        updatedCart = [...items, { ...item, quantity: item.quantity || 1 }];
      }
      set({ items: updatedCart });
      
      // Get current user ID for saving
      const userId = getCurrentUserId();
      saveUserCart(updatedCart, userId);
    }
  },

  removeFromCart: async (productId) => {
    const { items } = get();
    
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (user._id && token) {
      // Use backend API for authenticated users
      try {
        set({ isLoading: true });
        const updatedCart = await cartService.removeFromCart(productId);
        
        // Transform backend cart format to frontend format
        const transformedItems = updatedCart.map(cartItem => {
          // Ensure product data exists
          if (!cartItem.product) {
            console.error('Missing product data for cart item:', cartItem);
            return null;
          }
          
          return {
            _id: cartItem.productId,
            id: cartItem.productId,
            productId: cartItem.productId,
            title: cartItem.product.title || '',
            price: cartItem.product.price || 0,
            images: cartItem.product.images || [],
            quantity: cartItem.quantity,
            category: cartItem.product.category || '',
            discount: cartItem.product.discount || 0,
            description: cartItem.product.description || '',
            addedAt: cartItem.addedAt
          };
        }).filter(Boolean); // Remove null items

        set({ items: transformedItems, isLoading: false });
      } catch (error) {
        console.error('Error removing from cart via API:', error);
        set({ isLoading: false });
        
        // Fallback to localStorage if API fails
        const updatedCart = items.filter((item) => item._id !== productId);
        set({ items: updatedCart });
        
        // Get current user ID for saving
        const userId = getCurrentUserId();
        saveUserCart(updatedCart, userId);
      }
    } else {
      // Use localStorage for non-authenticated users
      const updatedCart = items.filter((item) => item._id !== productId);
      set({ items: updatedCart });
      
      // Get current user ID for saving
      const userId = getCurrentUserId();
      saveUserCart(updatedCart, userId);
    }
  },

  removeItem: async (itemId) => {
    await get().removeFromCart(itemId);
  },

  updateItemQuantity: async (itemId, quantity) => {
    const { items } = get();
    
    if (quantity <= 0) {
      await get().removeItem(itemId);
      return;
    }
    
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (user._id && token) {
      // Use backend API for authenticated users
      try {
        set({ isLoading: true });
        const updatedCart = await cartService.updateCartQuantity(itemId, quantity);
        
        // Transform backend cart format to frontend format
        const transformedItems = updatedCart.map(cartItem => {
          // Ensure product data exists
          if (!cartItem.product) {
            console.error('Missing product data for cart item:', cartItem);
            return null;
          }
          
          return {
            _id: cartItem.productId,
            id: cartItem.productId,
            productId: cartItem.productId,
            title: cartItem.product.title || '',
            price: cartItem.product.price || 0,
            images: cartItem.product.images || [],
            quantity: cartItem.quantity,
            category: cartItem.product.category || '',
            discount: cartItem.product.discount || 0,
            description: cartItem.product.description || '',
            addedAt: cartItem.addedAt
          };
        }).filter(Boolean); // Remove null items

        set({ items: transformedItems, isLoading: false });
      } catch (error) {
        console.error('Error updating cart quantity via API:', error);
        set({ isLoading: false });
        
        // Fallback to localStorage if API fails
        const updatedCart = items.map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        );
        set({ items: updatedCart });
        
        // Get current user ID for saving
        const userId = getCurrentUserId();
        saveUserCart(updatedCart, userId);
      }
    } else {
      // Use localStorage for non-authenticated users
      const updatedCart = items.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      );
      set({ items: updatedCart });
      
      // Get current user ID for saving
      const userId = getCurrentUserId();
      saveUserCart(updatedCart, userId);
    }
  },

  clearCart: async () => {
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (user._id && token) {
      // Use backend API for authenticated users
      try {
        set({ isLoading: true });
        await cartService.clearCart();
        set({ items: [], isLoading: false });
      } catch (error) {
        console.error('Error clearing cart via API:', error);
        set({ isLoading: false });
        
        // Fallback to localStorage if API fails
        set({ items: [] });
        
        // Get current user ID for saving
        const userId = getCurrentUserId();
        saveUserCart([], userId);
      }
    } else {
      // Use localStorage for non-authenticated users
      set({ items: [] });
      
      // Get current user ID for saving
      const userId = getCurrentUserId();
      saveUserCart([], userId);
    }
  },

  closeContactModal: () => set({ showContactModal: false, contactModalProduct: '' }),

  loadCart: async (userId) => {
    try {
      // If no userId provided, try to get from localStorage
      if (!userId) {
        userId = getCurrentUserId();
      }
      
      // Check if user is authenticated
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      if (user._id && token) {
        // Use backend API for authenticated users
        try {
          set({ isLoading: true });
          const cartData = await cartService.getCart();
          
          // Transform backend cart format to frontend format
          const transformedItems = cartData.map(cartItem => {
            // Ensure product data exists
            if (!cartItem.product) {
              console.error('Missing product data for cart item:', cartItem);
              return null;
            }
            
            return {
              _id: cartItem.productId,
              id: cartItem.productId,
              productId: cartItem.productId,
              title: cartItem.product.title || '',
              price: cartItem.product.price || 0,
              images: cartItem.product.images || [],
              quantity: cartItem.quantity,
              category: cartItem.product.category || '',
              discount: cartItem.product.discount || 0,
              description: cartItem.product.description || '',
              addedAt: cartItem.addedAt
            };
          }).filter(Boolean); // Remove null items

          set({ items: transformedItems, isLoading: false });
          console.log(`🛒 Loaded cart from API for user: ${userId}, items: ${transformedItems.length}`);
        } catch (error) {
          console.error('Error loading cart from API:', error);
          set({ isLoading: false });
          
          // Fallback to localStorage if API fails
          const cartItems = loadUserCart(userId);
          set({ items: cartItems });
          console.log(`🛒 Fallback: Loaded cart from localStorage for user: ${userId}, items: ${cartItems.length}`);
        }
      } else {
        // Use localStorage for non-authenticated users
        const cartItems = loadUserCart(userId);
        set({ items: cartItems });
        console.log(`🛒 Loaded cart from localStorage for user: ${userId || 'anonymous'}, items: ${cartItems.length}`);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      set({ items: [], isLoading: false });
    }
  },

  saveCart: (cart, userId) => {
    try {
      // If no userId provided, try to get from localStorage
      if (!userId) {
        userId = getCurrentUserId();
      }
      
      // For now, only save to localStorage as API calls are handled in individual functions
      saveUserCart(cart, userId);
      console.log(`💾 Saved cart to localStorage for user: ${userId || 'anonymous'}, items: ${cart.length}`);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }
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
