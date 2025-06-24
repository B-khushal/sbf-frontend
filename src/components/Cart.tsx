import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
  const { formatPrice, convertPrice } = useCurrency();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Debug logging
  React.useEffect(() => {
    console.log('Cart component rendered with:', {
      isOpen,
      itemsCount: items.length,
      items,
      user: user ? { id: user.id, name: user.name } : null
    });
  }, [isOpen, items, user]);
  
  // Calculate subtotal
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  const handleRemoveItem = (id: string) => {
    console.log('Removing item with id:', id);
    onRemoveItem(id);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
      duration: 2000,
    });
  };

  const handleCheckout = () => {
    console.log('Checkout clicked with items:', items);
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checkout",
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

  // Always render but control visibility with CSS
  // This ensures the component stays mounted and can track state changes

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] transition-opacity duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-[9999] flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0 visible" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="py-4 px-6 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
            <ShoppingBag size={18} />
            <span>Shopping Cart</span>
            {items.length > 0 && (
              <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {!user ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Please Login</h3>
              <p className="text-gray-500 mb-8 max-w-xs">
                You need to be logged in to view and manage your cart items.
              </p>
              <button 
                onClick={() => {
                  onClose();
                  navigate('/login', { state: { redirect: '/cart' } });
                }}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Login Now
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 mb-8 max-w-xs">
                Discover our beautiful floral arrangements and add them to your cart.
              </p>
              <button 
                onClick={onClose}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onUpdateQuantity={onUpdateQuantity} 
                  onRemove={() => handleRemoveItem(item.id)} 
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-gray-50 py-4 px-6">
            <div className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Subtotal</span>
                <span className="text-primary">{formatPrice(convertPrice(subtotal))}</span>
              </div>
              
              {/* Promo Code Reminder */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="font-medium">Have a promo code?</span>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                  className="text-blue-600 text-xs underline mt-1 hover:text-blue-800 transition-colors"
                >
                  Go to cart page to apply promo codes
                </button>
              </div>
              
              {/* Checkout Button */}
              <button 
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
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
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="w-16 h-16 bg-gray-100 relative overflow-hidden rounded-lg flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/api/placeholder/64/64';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{item.title}</h4>
        <div className="text-sm text-gray-500 mb-2">
          {item.originalPrice !== item.price && (
            <span className="line-through mr-2 text-gray-400">
              {formatPrice(convertPrice(item.originalPrice))}
            </span>
          )}
          <span className="font-medium text-primary">
            {formatPrice(convertPrice(item.price))}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <select 
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
            className="text-sm h-8 px-2 border border-gray-200 rounded-md bg-white focus:border-primary focus:outline-none"
          >
            {[1,2,3,4,5].map((num) => (
              <option key={num} value={num}>
                Qty: {num}
              </option>
            ))}
          </select>
          <button 
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="text-sm font-semibold text-gray-900">
        {formatPrice(convertPrice(item.price * item.quantity))}
      </div>
    </div>
  );
};

export default Cart;
