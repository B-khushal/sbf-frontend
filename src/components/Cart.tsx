import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

// CartItem type for props
// (You can expand this as needed)
type CartItem = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  quantity: number;
};

type CartProps = {
  cartItems: CartItem[];
  cartTotal: number;
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
};

const Cart = (props: any) => {
  // Debug logging
  React.useEffect(() => {
    console.log('Cart component rendered with:', {
      isOpen: props.isOpen,
      cartItems: props.cartItems,
      cartTotal: props.cartTotal,
    });
  }, [props.isOpen, props.cartItems, props.cartTotal]);

  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent className="flex flex-col w-full sm:w-96 bg-white">
        {/* DEBUG HEADER */}
        <div className="p-2 bg-yellow-100 text-yellow-800 text-xs text-center font-bold border-b">
          DEBUG: cartItems={JSON.stringify(props.cartItems)}, cartTotal={props.cartTotal}
        </div>
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span>Your Cart</span>
            {props.cartItems && props.cartItems.length > 0 && (
              <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {props.cartItems.length} {props.cartItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {props.cartItems && props.cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 mb-8 max-w-xs">
                Discover our beautiful floral arrangements and add them to your cart.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {props.cartItems && props.cartItems.map((item: CartItem) => (
                <CartItemRow
                  key={item._id}
                  item={item}
                  onRemove={() => props.onRemove(item._id)}
                />
              ))}
            </div>
          )}
        </div>
        <SheetFooter className="bg-gray-50 px-6 py-4 border-t">
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">₹{props.cartTotal || 0}</span>
            </div>
            <button
              className="w-full bg-purple-600 text-white py-3 rounded font-bold text-lg disabled:opacity-50"
              onClick={props.onCheckout}
              disabled={!props.cartItems || props.cartItems.length === 0}
            >
              Checkout
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const CartItemRow = ({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: () => void;
}) => {
  return (
    <div className="flex items-center mb-4 border-b pb-2">
      <img
        src={item.images && item.images.length > 0 ? item.images[0] : '/api/placeholder/64/64'}
        alt={item.name}
        className="w-16 h-16 object-cover rounded mr-4"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/api/placeholder/64/64';
        }}
      />
      <div className="flex-1">
        <div className="font-bold">{item.name}</div>
        <div className="text-gray-500">Qty: {item.quantity}</div>
        <div className="text-purple-600 font-bold">₹{item.price}</div>
      </div>
      <button
        onClick={onRemove}
        className="ml-2 text-pink-600 text-2xl font-bold"
        aria-label="Remove item"
      >
        &times;
      </button>
    </div>
  );
};

export default Cart;