import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, ShoppingBag, Trash2, Wand2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import AuthCheck from './AuthCheck';

type AddonOption = {
  name: string;
  price: number;
  type: 'flower' | 'chocolate';
};

type CustomizationData = {
  photo?: string;
  number?: string;
  messageCard?: string;
  selectedFlowers: AddonOption[];
  selectedChocolates: AddonOption[];
};

type CartItem = {
  _id: string;
  title: string;
  price: number;
  images: string[];
  quantity: number;
  discount?: number;
  category?: string;
  description?: string;
  customizations?: CustomizationData;
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
    (total, item) => total + (item.price || 0) * (item.quantity || 0), 
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
      <SheetContent className="flex flex-col w-full sm:w-96">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ShoppingBag size={20} />
            <span>Shopping Cart</span>
            {items.length > 0 && (
              <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 px-6">
          <AuthCheck 
            action="cart" 
            fallback={
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Please Login</h3>
                <p className="text-gray-500 mb-8 max-w-xs">
                  You need to be logged in to view and manage your cart items.
                </p>
                <Button 
                  onClick={() => {
                    onClose();
                    navigate('/login', { state: { redirect: '/cart' } });
                  }}
                  className="bg-gradient-to-r from-primary to-secondary text-white"
                >
                  Login Now
                </Button>
              </div>
            }
            showPrompt={false}
          >
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h3>
                <p className="text-gray-500 mb-8 max-w-xs">
                  Add some items to your cart to get started with your shopping.
                </p>
                <Button 
                  onClick={() => {
                    onClose();
                    navigate('/shop');
                  }}
                  className="bg-gradient-to-r from-primary to-secondary text-white"
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.images?.[0] || '/images/placeholder.svg'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item._id, Math.max(0, (item.quantity || 1) - 1))}
                        className="w-8 h-8 p-0"
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item._id, (item.quantity || 1) + 1)}
                        className="w-8 h-8 p-0"
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AuthCheck>
        </div>
        
        {user && items.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Subtotal:</span>
              <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
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
  
  // Calculate original price if discount exists
  const originalPrice = item.discount && item.discount > 0 
    ? Math.round(item.price / (1 - item.discount / 100))
    : item.price;

  // Calculate total add-ons price
  const addonsPrice = item.customizations ? (
    (item.customizations.selectedFlowers?.reduce((sum, flower) => sum + flower.price, 0) || 0) +
    (item.customizations.selectedChocolates?.reduce((sum, chocolate) => sum + chocolate.price, 0) || 0)
  ) : 0;
  
  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-100 relative overflow-hidden rounded-lg flex-shrink-0">
          {item.customizations?.photo ? (
            <img 
              src={item.customizations.photo} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={item.images && item.images.length > 0 ? item.images[0] : '/api/placeholder/64/64'} 
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/64/64';
              }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h4>
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Price Section */}
          <div className="text-sm text-gray-500 mt-1">
            {item.discount && item.discount > 0 && (
              <span className="line-through mr-2 text-gray-400">
                {formatPrice(convertPrice(originalPrice))}
              </span>
            )}
            <span className="font-medium text-primary">
              {formatPrice(convertPrice(item.price))}
            </span>
            {addonsPrice > 0 && (
              <span className="ml-1 text-gray-500">
                + {formatPrice(convertPrice(addonsPrice))} add-ons
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center mt-2">
            <select 
              value={item.quantity}
              onChange={(e) => onUpdateQuantity(item._id, parseInt(e.target.value))}
              className="text-sm h-8 px-2 border border-gray-200 rounded-md bg-white focus:border-primary focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customizations Section */}
      {item.customizations && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Wand2 className="h-3 w-3" />
            <span className="font-medium">Customizations:</span>
          </div>
          
          <div className="space-y-1.5 text-sm">
            {item.customizations.number && (
              <div className="text-gray-600">
                Number: {item.customizations.number}
              </div>
            )}
            
            {item.customizations.messageCard && (
              <div className="text-gray-600">
                Message: "{item.customizations.messageCard}"
              </div>
            )}
            
            {item.customizations.selectedFlowers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.customizations.selectedFlowers.map((flower, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {flower.name} (+{formatPrice(convertPrice(flower.price))})
                  </Badge>
                ))}
              </div>
            )}
            
            {item.customizations.selectedChocolates.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.customizations.selectedChocolates.map((chocolate, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {chocolate.name} (+{formatPrice(convertPrice(chocolate.price))})
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
