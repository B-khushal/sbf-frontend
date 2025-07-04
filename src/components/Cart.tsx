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
  return (
    <Sheet open={true} onOpenChange={() => {}}>
      <SheetContent className="flex flex-col w-full sm:w-96 bg-white">
        <div className="p-4 bg-red-100 text-red-800 font-bold text-center">
          IF YOU SEE THIS, THE CART COMPONENT IS RENDERING.
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