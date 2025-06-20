import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type WishlistItem = {
  id: string;
  title: string;
  image: string;
  price: number;
};

const useWishlist = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      return [];
    }
  });
  
  // Update localStorage when wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
      console.log('Wishlist saved to localStorage:', items);
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [items]);
  
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