import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as wishlistService from '@/services/wishlistService';

export type WishlistItem = {
  id: string;
  title: string;
  image: string;
  price: number;
};

const useWishlist = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // Load wishlist from backend or localStorage
  const loadWishlist = async () => {
    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        // Load from backend for authenticated users
        const response = await wishlistService.getWishlist();
        const transformedItems = response.wishlist.map(item => ({
          id: item.id,
          title: item.title,
          image: item.image,
          price: item.price
        }));
        setItems(transformedItems);
        
        // Also save to localStorage as backup
        localStorage.setItem('wishlist', JSON.stringify(transformedItems));
      } else {
        // Load from localStorage for non-authenticated users
        try {
          let wishlist = [];
          const wishlistData = localStorage.getItem("wishlist");
          
          if (wishlistData && wishlistData !== "null" && wishlistData !== "undefined") {
            try {
              const parsed = JSON.parse(wishlistData);
              if (Array.isArray(parsed)) {
                wishlist = parsed.filter(item => 
                  item && 
                  typeof item === 'object' && 
                  item.id && 
                  item.title && 
                  typeof item.price === 'number'
                );
              }
            } catch (e) {
              console.error("Error parsing wishlist:", e);
              wishlist = [];
              localStorage.removeItem("wishlist");
            }
          }
          
          setItems(wishlist);
        } catch (error) {
          console.error("Error loading wishlist:", error);
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Fallback to localStorage
      try {
        const wishlistData = localStorage.getItem("wishlist");
        if (wishlistData) {
          const parsed = JSON.parse(wishlistData);
          if (Array.isArray(parsed)) {
            const validItems = parsed.filter(item => 
              item && 
              typeof item === 'object' && 
              item.id && 
              item.title && 
              typeof item.price === 'number'
            );
            setItems(validItems);
          }
        }
      } catch (fallbackError) {
        console.error('Error in fallback wishlist loading:', fallbackError);
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load wishlist on mount and when authentication status changes
  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated]);
  
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
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to wishlist",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        // Add to backend
        const response = await wishlistService.addToWishlist(item.id);
        const transformedItems = response.wishlist.map(wishlistItem => ({
          id: wishlistItem.id,
          title: wishlistItem.title,
          image: wishlistItem.image,
          price: wishlistItem.price
        }));
        setItems(transformedItems);
        
        // Also save to localStorage as backup
        localStorage.setItem('wishlist', JSON.stringify(transformedItems));
        
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist",
        });
      } else {
        // Fallback to localStorage for non-authenticated users
        setItems(prevItems => {
          const exists = prevItems.some(existingItem => existingItem.id === item.id);
          
          if (exists) {
            toast({
              title: "Already in wishlist",
              description: "This item is already in your wishlist",
            });
            return prevItems;
          }
          
          const newItems = [...prevItems, item];
          localStorage.setItem('wishlist', JSON.stringify(newItems));
          
          toast({
            title: "Added to wishlist",
            description: "Item has been added to your wishlist",
          });
          
          return newItems;
        });
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      
      if (error.message.includes('already in wishlist')) {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist",
        });
      } else if (error.message.includes('log in')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to wishlist",
          variant: "destructive",
          duration: 4000,
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add to wishlist",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeItem = async (id: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to manage your wishlist",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        // Remove from backend
        const response = await wishlistService.removeFromWishlist(id);
        const transformedItems = response.wishlist.map(wishlistItem => ({
          id: wishlistItem.id,
          title: wishlistItem.title,
          image: wishlistItem.image,
          price: wishlistItem.price
        }));
        setItems(transformedItems);
        
        // Also save to localStorage as backup
        localStorage.setItem('wishlist', JSON.stringify(transformedItems));
        
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        });
      } else {
        // Fallback to localStorage for non-authenticated users
        setItems(prevItems => {
          const newItems = prevItems.filter(item => item.id !== id);
          localStorage.setItem('wishlist', JSON.stringify(newItems));
          
          toast({
            title: "Removed from wishlist",
            description: "Item has been removed from your wishlist",
          });
          
          return newItems;
        });
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove from wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to manage your wishlist",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        // Clear from backend
        await wishlistService.clearWishlist();
        setItems([]);
        localStorage.setItem('wishlist', JSON.stringify([]));
        
        toast({
          title: "Wishlist cleared",
          description: "Your wishlist has been cleared",
        });
      } else {
        // Fallback to localStorage for non-authenticated users
        setItems([]);
        localStorage.setItem('wishlist', JSON.stringify([]));
        
        toast({
          title: "Wishlist cleared",
          description: "Your wishlist has been cleared",
        });
      }
    } catch (error: any) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    items,
    itemCount: items.length,
    isLoading,
    addItem,
    removeItem,
    clearWishlist,
    loadWishlist
  };
};

export default useWishlist; 