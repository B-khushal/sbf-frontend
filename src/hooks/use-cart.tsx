import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (!user) return [];
    
    const savedCart = localStorage.getItem(`cart_${user.id}`);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalProduct, setContactModalProduct] = useState<string>('');
  
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
    
    const existingItem = items.find(i => i.id === item.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;
    
    // Check if adding this quantity would exceed the limit of 5
    if (newTotalQuantity > 5) {
      setContactModalProduct(item.title);
      setShowContactModal(true);
      toast({
        title: "Quantity Limit Reached",
        description: `Maximum 5 items allowed per product. Contact us for bulk orders.`,
        variant: "destructive",
        duration: 4000,
      });
      return false; // Return failure indicator
    }
    
    setItems(prevItems => {
      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: newTotalQuantity } 
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
    
    // Check if the new quantity exceeds the limit of 5
    if (quantity > 5) {
      const item = items.find(i => i.id === id);
      if (item) {
        setContactModalProduct(item.title);
        setShowContactModal(true);
        toast({
          title: "Quantity Limit Reached",
          description: `Maximum 5 items allowed per product. Contact us for bulk orders.`,
          variant: "destructive",
          duration: 4000,
        });
      }
      return;
    }
    
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

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactModalProduct('');
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
    showContactModal,
    contactModalProduct,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    closeContactModal,
  };
};

export default useCart;
