import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type WishlistItem = {
  id: string;
  title: string;
  image: string;
  price: number;
};

const useWishlist = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get the storage key based on user ID
  const getStorageKey = () => {
    return user ? `wishlist_${user.id}` : 'wishlist_guest';
  };

  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const savedWishlist = localStorage.getItem(getStorageKey());
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      return [];
    }
  });
  
  // Update localStorage when wishlist changes or user changes
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
      console.log('Wishlist saved to localStorage:', items);
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [items, user?.id]); // Added user?.id as dependency
  
  // Update items when user changes
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(getStorageKey());
      setItems(savedWishlist ? JSON.parse(savedWishlist) : []);
    } catch (error) {
      console.error('Error loading wishlist after user change:', error);
      setItems([]);
    }
  }, [user?.id]); // Re-run when user ID changes
  
  const addItem = (item: WishlistItem) => {
    console.log('Adding item to wishlist:', item);
    
    if (!item.id || !item.title || typeof item.price !== 'number') {
      console.error('Invalid item format for wishlist:', item);
      toast({
        title: "Error",
        description: "Could not add item to wishlist - invalid format",
        variant: "destructive"
      });
      return;
    }
    
    setItems(prevItems => {
      // Check if item already exists in wishlist
      const exists = prevItems.some(existingItem => existingItem.id === item.id);
      
      if (exists) {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist",
        });
        return prevItems;
      }
      
      // Add the new item
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist",
      });
      return [...prevItems, item];
    });
  };
  
  const removeItem = (id: string) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== id);
      
      if (newItems.length !== prevItems.length) {
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        });
      }
      
      return newItems;
    });
  };
  
  const clearWishlist = () => {
    setItems([]);
    toast({
      title: "Wishlist cleared",
      description: "Your wishlist has been cleared",
    });
  };
  
  return {
    items,
    itemCount: items.length,
    addItem,
    removeItem,
    clearWishlist,
  };
};

export default useWishlist; 