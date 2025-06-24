import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';

type CartItem = {
  id: string;
  productId: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  discount?: number;
};

type CartProps = {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
};

const Cart = ({ 
  items, 
  isOpen, 
  onClose, 
  onUpdateQuantity, 
  onRemoveItem 
}: CartProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const { formatPrice, convertPrice } = useCurrency();
  
  // Calculate the raw subtotal in base currency (INR)
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const handleRemoveItem = (id: string) => {
    onRemoveItem(id);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
      duration: 3000,
    });
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login or signup to proceed with checkout",
        duration: 3000,
      });
      onClose();
      navigate('/login', { state: { redirect: '/checkout/shipping' } });
      return;
    }

    navigate('/checkout/shipping');
    onClose();
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-background shadow-lg z-[9999] flex flex-col transition-transform duration-500 ease-out-expo",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="py-4 px-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <ShoppingBag size={18} />
            <span>Shopping Cart</span>
            {items.length > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({items.length})
              </span>
            )}
          </h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {!user ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag size={32} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Please Login</h3>
              <p className="text-muted-foreground mb-8">
                You need to be logged in to view your cart.
              </p>
              <button 
                onClick={() => {
                  onClose();
                  navigate('/login', { state: { redirect: '/cart' } });
                }}
                className="bg-primary text-primary-foreground px-6 py-2 hover-lift subtle-shadow"
              >
                Login
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag size={32} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground">
                Looks like you haven't added any products to your cart yet.
              </p>
              <button 
                onClick={onClose}
                className="mt-6 bg-primary text-primary-foreground px-6 py-2 hover-lift subtle-shadow"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onUpdateQuantity={onUpdateQuantity} 
                  onRemove={() => handleRemoveItem(item.id)} 
                />
              ))}
            </ul>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="border-t py-4 px-6">
            <div className="flex justify-between font-medium pt-2 border-t mt-2">
              <span>Total</span>
              <span>{formatPrice(convertPrice(subtotal))}</span>
            </div>
            
            {/* Promo Code Reminder */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium">Have a promo code?</span>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="text-blue-600 text-xs underline mt-1 hover:text-blue-800"
              >
                Go to cart to apply promo code
              </button>
            </div>
            
            <button 
              className="w-full h-12 bg-primary text-primary-foreground flex items-center justify-center hover-lift subtle-shadow mt-3"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const CartItem = ({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: { 
  item: CartItem; 
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: () => void;
}) => {
  const { formatPrice, convertPrice } = useCurrency();
  
  return (
    <li className="flex items-start gap-4 animate-fade-in">
      <div className="w-20 h-20 bg-secondary/20 relative overflow-hidden flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{item.title}</h4>
        <div className="text-muted-foreground text-sm mt-1">
          {item.originalPrice !== item.price && (
            <span className="line-through mr-2">
              {formatPrice(convertPrice(item.originalPrice))}
            </span>
          )}
          {formatPrice(convertPrice(item.price))}
        </div>
        <div className="flex items-center mt-2">
          <select 
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
            className="text-sm h-8 px-2 border rounded-md bg-background mr-3"
          >
            {[1,2,3,4,5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <button 
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive transition-colors duration-200"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="text-sm font-medium">
        {formatPrice(convertPrice(item.price * item.quantity))}
      </div>
    </li>
  );
};

export default Cart;
