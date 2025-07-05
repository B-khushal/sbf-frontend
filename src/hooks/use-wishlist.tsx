import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getCurrentUserId, 
  loadUserWishlist, 
  saveUserWishlist, 
  addToUserWishlist as addToUserWishlistUtil,
  removeFromUserWishlist as removeFromUserWishlistUtil,
  isInUserWishlist as isInUserWishlistUtil,
  migrateOldWishlistData,
  type WishlistItem 
} from '@/utils/wishlistManager';

const useWishlist = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load wishlist for current user
  const loadWishlist = (userId?: string) => {
    setIsLoading(true);
    try {
      // If no userId provided, try to get from localStorage
      if (!userId) {
        userId = getCurrentUserId();
      }
      
      // Load user-specific wishlist
      let wishlistItems = loadUserWishlist(userId);
      
      // If no user-specific wishlist exists and user is authenticated, try to migrate old data
      if (wishlistItems.length === 0 && userId) {
        wishlistItems = migrateOldWishlistData(userId);
      }
      
      setItems(wishlistItems);
      console.log(`💖 Loaded wishlist for user: ${userId || 'anonymous'}, items: ${wishlistItems.length}`);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, []);
  
  const addItem = (item: WishlistItem) => {
    console.log('Adding item to wishlist:', item);
    
    if (!item.id || !item.title || typeof item.price !== 'number') {
      console.error('Invalid item format for wishlist:', item);
      toast({
        title: "Error",
        description: "Could not add item to wishlist - invalid format",
        variant: "destructive"
      });
      return false;
    }
    
    const userId = getCurrentUserId();
    const success = addToUserWishlistUtil(item, userId);
    
    if (success) {
      // Update local state
      setItems(prevItems => [...prevItems, { ...item, dateAdded: new Date().toISOString() }]);
      
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist",
      });
    } else {
      toast({
        title: "Already in wishlist",
        description: "This item is already in your wishlist",
      });
    }
    
    return success;
  };
  
  const removeItem = (id: string) => {
    const userId = getCurrentUserId();
    const success = removeFromUserWishlistUtil(id, userId);
    
    if (success) {
      // Update local state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
    }
    
    return success;
  };
  
  const clearWishlist = () => {
    const userId = getCurrentUserId();
    setItems([]);
    saveUserWishlist([], userId);
    
    toast({
      title: "Wishlist cleared",
      description: "Your wishlist has been cleared",
    });
  };
  
  const isInWishlist = (itemId: string): boolean => {
    const userId = getCurrentUserId();
    return isInUserWishlistUtil(itemId, userId);
  };
  
  const refreshWishlist = () => {
    loadWishlist();
  };
  
  return {
    items,
    itemCount: items.length,
    isLoading,
    addItem,
    removeItem,
    clearWishlist,
    isInWishlist,
    refreshWishlist,
    loadWishlist,
  };
};

export default useWishlist; 