import React from 'react';
import useCart from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';

const CartDebugger = () => {
  const { items, itemCount, isCartOpen, toggleCart, addItem, removeItem } = useCart();
  const { user } = useAuth();

  const testProduct = {
    id: 'test-product-1',
    productId: 'test-product-1',
    title: 'Test Rose Bouquet',
    price: 599,
    originalPrice: 799,
    image: '/api/placeholder/200/200'
  };

  const handleAddTestItem = () => {
    addItem(testProduct, 1);
  };

  const handleToggleCart = () => {
    console.log('Debug: Toggling cart from debugger');
    toggleCart();
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 border border-gray-300 rounded-lg shadow-lg z-50 min-w-64">
      <h3 className="font-bold text-sm mb-2">Cart Debugger</h3>
      <div className="text-xs space-y-1 mb-3">
        <div>User: {user ? user.name || user.email : 'Not logged in'}</div>
        <div>Cart Open: {isCartOpen ? 'Yes' : 'No'}</div>
        <div>Item Count: {itemCount}</div>
        <div>Items in Cart: {items.length}</div>
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
        {items.length > 0 && (
          <button
            onClick={() => removeItem(items[0].id)}
            className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
          >
            Remove First Item
          </button>
        )}
      </div>
    </div>
  );
};

export default CartDebugger; 