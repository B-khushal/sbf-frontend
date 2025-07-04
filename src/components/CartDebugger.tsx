import React from 'react';
import useCart from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';

const CartDebugger = () => {
  const { user } = useAuth();
  const cartHook = useCart();
  const { items, isCartOpen, openCart, closeCart, addToCart, removeItem, loadCart } = cartHook;

  const handleAddTestItem = () => {
    console.log("Adding test item to cart");
    const testProduct = {
      _id: 'test-product-1',
      title: 'Test Product',
      price: 999,
      images: ['/images/placeholder.svg'],
      quantity: 1,
      category: 'test',
      discount: 0,
      description: 'Test product for debugging'
    };
    addToCart(testProduct);
  };

  const handleToggleCart = () => {
    if (isCartOpen) {
      closeCart();
    } else {
      openCart();
    }
  };

  const handleReloadCart = () => {
    console.log("Reloading cart from localStorage");
    loadCart();
  };

  const handleClearCart = () => {
    console.log("Clearing cart");
    localStorage.removeItem('cart');
    loadCart();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-xs">
      <h3 className="text-sm font-bold mb-2">Cart Debugger</h3>
      <div className="text-xs space-y-1 mb-2">
        <div>Items: {items.length}</div>
        <div>Open: {isCartOpen ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.name : 'None'}</div>
        <div>LocalStorage: {localStorage.getItem('cart') ? 'Has Data' : 'Empty'}</div>
      </div>
      <div className="space-y-2">
        <button
          onClick={handleAddTestItem}
          className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
          disabled={!user}
        >
          {user ? 'Add Test Item' : 'Login Required'}
        </button>
        <button
          onClick={handleToggleCart}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
        >
          Toggle Cart
        </button>
        <button
          onClick={handleReloadCart}
          className="w-full bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
        >
          Reload Cart
        </button>
        <button
          onClick={handleClearCart}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
        >
          Clear Cart
        </button>
        {items.length > 0 && (
          <button
            onClick={() => removeItem(items[0]._id)}
            className="w-full bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
          >
            Remove First Item
          </button>
        )}
      </div>
      {items.length > 0 && (
        <div className="mt-2 text-xs">
          <div className="font-bold">Cart Items:</div>
          {items.map((item, index) => (
            <div key={index} className="text-gray-600">
              {item.title} (Qty: {item.quantity})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartDebugger; 