import { create } from 'zustand';

interface CartItem {
  _id: string;
  title: string;
  price: number;
  images: string[];
  quantity: number;
  discount?: number;
  category?: string;
  description?: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  loadCart: () => void;
  saveCart: (cart: CartItem[]) => void;
  showContactModal: boolean;
  contactModalProduct: string;
  closeContactModal: () => void;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,
  showContactModal: false,
  contactModalProduct: '',

  addToCart: (item) => {
    const { items } = get();
    
    // Validate item has required fields
    if (!item._id || !item.title || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      console.error('Invalid cart item:', item);
      return;
    }
    
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
    get().saveCart(updatedCart);
  },

  removeFromCart: (productId) => {
    const updatedCart = get().items.filter((item) => item._id !== productId);
    set({ items: updatedCart });
    get().saveCart(updatedCart);
  },

  removeItem: (itemId) => {
    const updatedCart = get().items.filter((item) => item._id !== itemId);
    set({ items: updatedCart });
    get().saveCart(updatedCart);
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
    get().saveCart(updatedCart);
  },

  clearCart: () => {
    set({ items: [] });
    get().saveCart([]);
  },

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  closeContactModal: () => set({ showContactModal: false, contactModalProduct: '' }),

  loadCart: () => {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        // Validate cart data structure
        if (Array.isArray(parsedCart)) {
          const validItems = parsedCart.filter(item => 
            item && item._id && item.title && typeof item.price === 'number' && typeof item.quantity === 'number'
          );
          set({ items: validItems });
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Clear invalid cart data
      localStorage.removeItem('cart');
    }
  },

  saveCart: (cart) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
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
