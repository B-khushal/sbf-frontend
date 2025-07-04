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
  // Ref for scrollable area
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Scroll to top when cart is opened
  React.useEffect(() => {
    if (props.isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [props.isOpen]);

  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent className="flex flex-col w-full sm:w-96 h-full bg-white">
        {/* Cart Header */}
        <div className="bg-purple-100 text-purple-600 font-bold p-4 border-b-2 border-purple-600 text-center text-xl">
          Your Cart
        </div>
        {/* Cart Items */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {props.cartItems && props.cartItems.length > 0 ? (
            props.cartItems.map((item: any) => (
              <div key={item._id} className="flex items-center mb-4 border-b pb-2">
                <img src={item.images?.[0] || ''} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                <div className="flex-1">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-gray-500">Qty: {item.quantity}</div>
                  <div className="text-purple-600 font-bold">₹{item.price}</div>
                </div>
                <button onClick={() => props.onRemove(item._id)} className="ml-2 text-pink-600 text-2xl font-bold">&times;</button>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center mt-8">Your cart is empty.</div>
          )}
        </div>
        {/* Cart Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between font-bold mb-3">
            <span>Total</span>
            <span>₹{props.cartTotal || 0}</span>
          </div>
          <button
            className="w-full bg-purple-600 text-white py-3 rounded font-bold text-lg disabled:opacity-50"
            onClick={props.onCheckout}
            disabled={!props.cartItems || props.cartItems.length === 0}
          >
            Checkout
          </button>
        </div>
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