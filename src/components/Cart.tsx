import { Sheet, SheetContent } from './ui/sheet';

const Cart = (props: any) => {
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent className="w-full sm:w-96 flex flex-col h-full">
        <div className="p-4 bg-yellow-100 text-yellow-800 font-bold">
          DEBUG: cartItems={JSON.stringify(props.cartItems)}, cartTotal={props.cartTotal}
        </div>
        {/* Cart Header */}
        <div className="bg-purple-100 text-purple-600 font-bold p-4 border-b-2 border-purple-600 text-center text-xl">
          Your Cart
        </div>
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
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

export default Cart;