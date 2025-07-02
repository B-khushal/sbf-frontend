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
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  loadCart: () => void;
  saveCart: (cart: CartItem[]) => void;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,

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

  clearCart: () => {
    set({ items: [] });
    get().saveCart([]);
  },

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

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

export default useCart;
