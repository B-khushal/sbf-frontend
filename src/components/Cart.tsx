import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="space-y-2.5">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({items.length} items)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="relative w-24 h-24 mb-2">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
              <div className="relative flex items-center justify-center w-full h-full bg-primary/20 rounded-full">
                <ShoppingBag className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Your cart is empty</h3>
            <p className="text-sm text-gray-500 max-w-[15rem]">
              Add items to your cart to begin the checkout process
            </p>
            <Button onClick={onClose} className="mt-4">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[65vh] pr-4 -mr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-2 rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-accent/10 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/64/64';
                        }}
                      />
                      {item.discount > 0 && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-bl-md">
                          {item.discount}% Off
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base text-gray-800 truncate">
                            {item.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-sm sm:text-base">
                            {formatPrice(convertPrice(item.price))}
                          </span>
                          {item.discount > 0 && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              {formatPrice(convertPrice(item.originalPrice))}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="border-t mt-4 pt-4 space-y-3">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatPrice(convertPrice(subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-500">Delivery</span>
                <span className="font-medium">₹{delivery}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm sm:text-base text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base sm:text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <Button className="w-full mt-4" size="lg" asChild>
                <Link to="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
