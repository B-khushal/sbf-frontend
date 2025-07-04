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
      <SheetContent className="flex flex-col w-full sm:w-96 h-full bg-white border-l">
        {/* Cart Header */}
        <div style={{ color: '#7c3aed', background: '#f3e8ff', fontWeight: 'bold', fontSize: 24, padding: 20, borderBottom: '2px solid #7c3aed', textAlign: 'center', letterSpacing: 1 }}>Your Cart</div>
        {/* Cart Items */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {props.cartItems && props.cartItems.length > 0 ? (
            props.cartItems.map((item: any) => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 12, background: '#fafaff', borderRadius: 8, boxShadow: '0 1px 4px rgba(124,60,237,0.04)' }}>
                <img src={item.images?.[0] || ''} alt={item.name || item.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, marginRight: 16, border: '1px solid #e0e7ff' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#4b2995', fontSize: 18, marginBottom: 4 }}>{item.name || item.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Qty: {item.quantity}</div>
                  <div style={{ color: '#7c3aed', fontWeight: 'bold', fontSize: 16 }}>₹{item.price}</div>
                </div>
                <button onClick={() => props.onRemove(item._id)} style={{ marginLeft: 12, color: '#f43f5e', background: '#fff0f6', border: 'none', fontSize: 24, fontWeight: 'bold', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', transition: 'background 0.2s' }} title="Remove">×</button>
              </div>
            ))
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', marginTop: 48, fontSize: 18 }}>Your cart is empty.</div>
          )}
        </div>
        {/* Cart Footer */}
        <div style={{ padding: 20, borderTop: '1px solid #eee', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
            <span>Total</span>
            <span>₹{props.cartTotal || 0}</span>
          </div>
          <button
            style={{
              width: '100%',
              background: '#7c3aed',
              color: 'white',
              padding: '14px',
              border: 'none',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: 20,
              cursor: props.cartItems && props.cartItems.length > 0 ? 'pointer' : 'not-allowed',
              opacity: !props.cartItems || props.cartItems.length === 0 ? 0.5 : 1,
              boxShadow: '0 2px 8px rgba(124,60,237,0.08)',
              transition: 'background 0.2s',
              marginTop: 4
            }}
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