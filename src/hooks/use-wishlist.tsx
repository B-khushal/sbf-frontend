import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { wishlistService } from '@/services/cartService';

export type WishlistItem = {
  id: string;
  title: string;
  image: string;
  price: number;
};

const useWishlist = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Update localStorage when wishlist changes or user changes (for non-authenticated users)
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(items));
        console.log('Wishlist saved to localStorage:', items);
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }, [items, user?.id]); // Added user?.id as dependency
  
  // Update items when user changes
  useEffect(() => {
    if (user) {
      // Load from API for authenticated users
      loadWishlistFromAPI();
    } else {
      // Load from localStorage for non-authenticated users
      try {
        const savedWishlist = localStorage.getItem(getStorageKey());
        setItems(savedWishlist ? JSON.parse(savedWishlist) : []);
      } catch (error) {
        console.error('Error loading wishlist after user change:', error);
        setItems([]);
      }
    }
  }, [user?.id]);

  // Load wishlist from API for authenticated users
  const loadWishlistFromAPI = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const apiWishlist = await wishlistService.getWishlist();
      
      // Transform API wishlist format to frontend format
      const transformedItems = apiWishlist.map(product => ({
        id: product._id,
        title: product.title,
        image: product.images?.[0] || '/images/placeholder.svg',
        price: product.price
      }));
      
      setItems(transformedItems);
      console.log('Wishlist loaded from API:', transformedItems);
    } catch (error) {
      console.error('Error loading wishlist from API:', error);
      // Fallback to localStorage if API fails
      try {
        const savedWishlist = localStorage.getItem(getStorageKey());
        setItems(savedWishlist ? JSON.parse(savedWishlist) : []);
      } catch (localError) {
        console.error('Error loading wishlist from localStorage:', localError);
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const addItem = async (item: WishlistItem) => {
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
    
    if (user) {
      // Use API for authenticated users
      try {
        setIsLoading(true);
        await wishlistService.addToWishlist(item.id);
        
        // Reload wishlist from API
        await loadWishlistFromAPI();
        
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist",
        });
      } catch (error) {
        console.error('Error adding to wishlist via API:', error);
        toast({
          title: "Error",
          description: "Failed to add item to wishlist",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use localStorage for non-authenticated users
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
    }
  };
  
  const removeItem = async (id: string) => {
    if (user) {
      // Use API for authenticated users
      try {
        setIsLoading(true);
        await wishlistService.removeFromWishlist(id);
        
        // Reload wishlist from API
        await loadWishlistFromAPI();
        
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        });
      } catch (error) {
        console.error('Error removing from wishlist via API:', error);
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use localStorage for non-authenticated users
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
    }
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
    isLoading,
    refreshWishlist: loadWishlistFromAPI
  };
};

export default useWishlist; 