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
  const [items, setItems] = useState<CartItem[]>([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalProduct, setContactModalProduct] = useState<string>('');
  
  // Debug logging for cart state changes
  useEffect(() => {
    const calculatedItemCount = items.reduce((total, item) => total + item.quantity, 0);
    console.log('Cart state changed:', {
      isCartOpen,
      itemsArrayLength: items.length,
      itemsArray: items,
      calculatedItemCount: calculatedItemCount,
      user: user ? { id: user.id, name: user.name } : null
    });
  }, [isCartOpen, items, user]);
  
  // Update localStorage when cart changes or user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
    }
  }, [items, user]);
  
  // Load cart from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      setItems(savedCart ? JSON.parse(savedCart) : []);
    } else {
      setItems([]);
    }
  }, [user]);
  
  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    console.log('Adding item to cart:', { item, quantity, user: user ? user.id : null });
    
    if (!user) {
      console.log('User not logged in, cannot add to cart');
      toast({
        title: "Please login first",
        description: "You need to be logged in to add items to your cart",
        variant: "destructive",
        duration: 3000,
      });
      return false;
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
      let updatedItems;
      if (existingItem) {
        // Update quantity of existing item
        updatedItems = prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: newTotalQuantity } 
            : i
        );
        console.log('Updated existing item quantity:', { itemId: item.id, newQuantity: newTotalQuantity });
      } else {
        // Add new item
        updatedItems = [...prevItems, { 
          ...item, 
          quantity,
          productId: item.id // Store the MongoDB ID
        }];
        console.log('Added new item to cart:', { itemId: item.id, quantity });
      }
      console.log('Cart items after update:', updatedItems);
      return updatedItems;
    });
    
    toast({
      title: "Added to cart!",
      description: `${item.title} has been added to your cart`,
      duration: 2000,
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
    console.log('toggleCart called - current state:', isCartOpen);
    console.log('User:', user);
    console.log('Items in cart:', items.length);
    const newState = !isCartOpen;
    console.log('Setting cart state to:', newState);
    setIsCartOpen(newState);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactModalProduct('');
  };
  
  // Force recalculation of item count to ensure updates
  const [forceUpdate, setForceUpdate] = useState(0);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );
  
  // Force update when items change
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
    console.log('🔄 Force updating cart count - itemCount:', itemCount, 'items:', items.length);
  }, [items, itemCount]);

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
    forceUpdate, // For debugging
  };
};

export default useCart;
