import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export type CartItem = {
  id: string;
  productId: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
};

const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (!user) return [];
    
    const savedCart = localStorage.getItem(`cart_${user.id}`);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Update localStorage when cart changes or user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
    }
  }, [items, user]);
  
  // Clear cart when user logs out
  useEffect(() => {
    if (!user) {
      setItems([]);
    }
  }, [user]);
  
  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    if (!user) {
      throw new Error('Please log in to add items to cart');
    }
    
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + quantity } 
            : i
        );
      } else {
        // Add new item
        return [...prevItems, { 
          ...item, 
          quantity,
          productId: item.id // Store the MongoDB ID
        }];
      }
    });
    
    return true; // Return success indicator
  };
  
  const updateItemQuantity = (id: string, quantity: number) => {
    if (!user) return;
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const removeItem = (id: string) => {
    if (!user) return;
    
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const clearCart = () => {
    if (!user) return;
    setItems([]);
  };
  
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  return {
    items,
    itemCount,
    subtotal,
    isCartOpen,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
  };
};

export default useCart;
