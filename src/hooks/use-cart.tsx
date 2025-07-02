import { create } from 'zustand';
import { Product } from '@/types/product'; // Assuming you have a Product type
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from './use-auth';

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

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const { user } = useAuth();

  const { addToCart, removeFromCart, clearCart, openCart, closeCart, loadCart, saveCart } = create<CartState>((set, get) => ({
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

  return { items, isCartOpen, itemCount, addToCart, removeFromCart, clearCart, openCart, closeCart, loadCart, saveCart };
};

export default useCart;
