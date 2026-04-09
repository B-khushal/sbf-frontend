import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useCart from '@/hooks/use-cart';

const CartLoader = () => {
  const { user } = useAuth();
  const loadCart = useCart((state) => state.loadCart);
  const userId = user?.id;
  
  useEffect(() => {
    // Load cart for current user (or anonymous if no user)
    loadCart(userId);
  }, [loadCart, userId]);

  // This component doesn't render anything
  return null;
};

export default CartLoader; 