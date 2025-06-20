
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from './CurrencyContext';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: Record<string, string>;
  currency?: string;
  currencyRate?: number;
  originalPrice?: number; // Price in INR (base currency)
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currency, rate, convertPrice } = useCurrency();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      // Check if item already exists in cart with same currency
      const existingItemIndex = prevItems.findIndex(i => 
        i.id === item.id && i.currency === currency
      );
      
      // Create item with current currency information
      const itemWithCurrency = {
        ...item,
        currency: currency,
        currencyRate: rate,
        originalPrice: item.originalPrice || (currency === 'INR' ? item.price : item.price / rate)
      };
      
      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        
        toast({
          title: "Cart updated",
          description: `Updated quantity of ${item.name} in your cart.`,
        });
        
        return updatedItems;
      } else {
        // Add new item with currency info
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart.`,
        });
        
        return [...prevItems, itemWithCurrency];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === itemId);
      
      if (itemToRemove) {
        toast({
          title: "Removed from cart",
          description: `${itemToRemove.name} has been removed from your cart.`,
        });
      }
      
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  // Calculate total number of items
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
