import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from './CurrencyContext';
import { useAuth } from '@/hooks/use-auth';

// Types
export type CartItem = {
  id: string;
  productId: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  options?: Record<string, string>;
  currency?: string;
  currencyRate?: number;
};

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => boolean;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  showContactModal: boolean;
  contactModalProduct: string;
  closeContactModal: () => void;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Export the context
export { CartContext };

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currency, rate } = useCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalProduct, setContactModalProduct] = useState('');

  // Load cart from localStorage when user changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        if (user) {
          const savedCart = localStorage.getItem(`cart_${user.id}`);
          console.log('🔍 Raw localStorage data for', `cart_${user.id}:`, savedCart);
          const cartItems = savedCart ? JSON.parse(savedCart) : [];
          setItems(cartItems);
          console.log('🛒 Loaded cart for user:', user.id, 'items:', cartItems.length);
        } else {
          // Don't clear cart immediately during auth check
          const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
          if (!isAuthenticated) {
            console.log('🧹 Clearing cart - user logged out');
            setItems([]);
          } else {
            console.log('⏳ User temporarily null during auth check - keeping cart');
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                const userId = userData._id || userData.id;
                if (userId) {
                  const savedCart = localStorage.getItem(`cart_${userId}`);
                  if (savedCart) {
                    const cartItems = JSON.parse(savedCart);
                    setItems(cartItems);
                    console.log('🔄 Loaded cart using stored user ID:', userId, 'items:', cartItems.length);
                  }
                }
              } catch (error) {
                console.error('Error loading cart with stored user data:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast({
          title: "Error",
          description: "Failed to load your cart",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading && user) {
      try {
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
        console.log('💾 Saved cart to localStorage for user:', user.id, 'items:', items.length);
      } catch (error) {
        console.error('Error saving cart:', error);
        toast({
          title: "Error",
          description: "Failed to save your cart",
          variant: "destructive",
        });
      }
    }
  }, [items, user, isLoading]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!user && !isAuthenticated) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to add items to your cart",
        variant: "destructive",
      });
      return false;
    }

    // Check for temporary auth state
    if (!user && isAuthenticated) {
      toast({
        title: "Please wait",
        description: "Loading your account, please try again in a moment",
      });
      return false;
    }

    const existingItem = items.find(i => i.id === item.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;

    // Check quantity limit
    if (newTotalQuantity > 5) {
      setContactModalProduct(item.title);
      setShowContactModal(true);
      toast({
        title: "Quantity Limit Reached",
        description: "Maximum 5 items allowed per product. Contact us for bulk orders.",
        variant: "destructive",
      });
      return false;
    }

    setItems(prevItems => {
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: newTotalQuantity }
            : i
        );
      } else {
        return [...prevItems, {
          ...item,
          quantity,
          currency,
          currencyRate: rate,
        }];
      }
    });

    toast({
      title: "Added to cart!",
      description: `${item.title} has been added to your cart`,
    });

    return true;
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity > 5) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        setContactModalProduct(item.title);
        setShowContactModal(true);
        toast({
          title: "Quantity Limit Reached",
          description: "Maximum 5 items allowed per product. Contact us for bulk orders.",
          variant: "destructive",
        });
      }
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);
  const closeContactModal = () => {
    setShowContactModal(false);
    setContactModalProduct('');
  };

  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        showContactModal,
        contactModalProduct,
        closeContactModal,
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
