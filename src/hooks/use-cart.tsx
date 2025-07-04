import { create } from 'zustand';
import { Product } from '@/types/product'; // Assuming you have a Product type

interface CartItem extends Product {
  quantity: number;
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
    const existingItem = items.find((i) => i._id === item._id);

    let updatedCart;
    if (existingItem) {
      updatedCart = items.map((i) =>
        i._id === item._id
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      updatedCart = [...items, item];
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

  closeContactModal: () => set({ showContactModal: false, contactModalProduct: '' }),

  loadCart: () => {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        set({ items: JSON.parse(cartData) });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
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
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
  };
};

export default useCart;
