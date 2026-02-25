import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import * as wishlistService from '@/services/wishlistService';

export type WishlistItem = {
  id: string;
  title: string;
  image: string;
  price: number;
};

const useWishlist = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated using auth context
  const isAuthenticated = !!user;

  // Load wishlist from backend or localStorage
  const loadWishlist = useCallback(async () => {
    // Don't block the app if wishlist loading fails
    console.log('loadWishlist called, isAuthenticated:', isAuthenticated);
    setIsLoading(true);

    // Add a timeout to ensure loading state is cleared
    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, clearing loading state');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    try {
      if (isAuthenticated) {
        console.log('Loading wishlist from backend...');
        try {
          // Load from backend for authenticated users
          const response = await wishlistService.getWishlist();
          console.log('Backend response:', response);
          const transformedItems = response.wishlist.map(item => ({
            id: item.id,
            title: item.title,
            image: item.image,
            price: item.price
          }));
          console.log('Transformed items:', transformedItems);
          setItems(transformedItems);

          // Also save to localStorage as backup
          localStorage.setItem('wishlist', JSON.stringify(transformedItems));
        } catch (apiError: any) {
          // Silently fallback to localStorage if API fails
          console.warn('Wishlist API failed, falling back to localStorage:', apiError.message);
          const wishlistData = localStorage.getItem("wishlist");
          if (wishlistData) {
            try {
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
            } catch (e) {
              setItems([]);
            }
          } else {
            setItems([]);
          }
        }
      } else {
        console.log('Loading wishlist from localStorage...');
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

          console.log('LocalStorage items:', wishlist);
          setItems(wishlist);
        } catch (error) {
          console.error("Error loading wishlist:", error);
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading wishlist (outer catch):', error);
      // Final fallback to localStorage
      try {
        console.log('Final fallback to localStorage due to error');
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
            console.log('Fallback items from localStorage:', validItems);
            setItems(validItems);
          }
        } else {
          console.log('No localStorage data available');
          setItems([]);
        }
      } catch (fallbackError) {
        console.error('Error in fallback wishlist loading:', fallbackError);
        setItems([]);
      }
    } finally {
      clearTimeout(timeoutId);
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load wishlist on mount and when authentication status changes
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Also load cached data on mount for better UX
  useEffect(() => {
    // Load cached data immediately for better UX
    const cachedData = localStorage.getItem("wishlist");
    if (cachedData && items.length === 0) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validItems = parsed.filter(item =>
            item &&
            typeof item === 'object' &&
            item.id &&
            item.title &&
            typeof item.price === 'number'
          );
          if (validItems.length > 0) {
            console.log('Loading cached wishlist data for immediate display:', validItems);
            setItems(validItems);
          }
        }
      } catch (error) {
        console.error('Error loading cached wishlist data:', error);
      }
    }
  }, []); // Only run once on mount

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

        // Ensure response has the expected structure
        if (response && response.wishlist) {
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
          throw new Error('Invalid response from server');
        }
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

        // Ensure response has the expected structure
        if (response && response.wishlist) {
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
          throw new Error('Invalid response from server');
        }
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