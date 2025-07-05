import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useWishlist from '@/hooks/use-wishlist';

const WishlistLoader = () => {
  const { user } = useAuth();
  const { loadWishlist } = useWishlist();
  
  useEffect(() => {
    // Load wishlist for current user (or anonymous if no user)
    const userId = user?.id;
    loadWishlist(userId);
  }, [loadWishlist, user]);

  // This component doesn't render anything
  return null;
};

export default WishlistLoader; 