import React from 'react';
import useCart from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';

const CartDebugger = () => {
  const { user } = useAuth();
  const cartHook = useCart();
  const { items, addToCart, removeItem } = cartHook;

  const handleAddTestItem = () => {
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

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="text-sm font-bold mb-2">Cart Debugger</h3>
      <div className="text-xs space-y-1 mb-2">
        <div>Items: {items.length}</div>
        <div>User: {user ? user.name : 'None'}</div>
      </div>
      <div className="space-y-2">
        <button
          onClick={handleAddTestItem}
          className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
          disabled={!user}
        >
          {user ? 'Add Test Item' : 'Login Required'}
        </button>
        {items.length > 0 && (
          <button
            onClick={() => removeItem(items[0]._id)}
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