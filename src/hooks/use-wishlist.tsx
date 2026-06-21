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

// Global state for sharing wishlist data across components
let globalItems: WishlistItem[] = [];
let globalIsLoading = false;
let globalIsLoaded = false;
let globalLastAuthStatus: boolean | null = null;
const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach(listener => listener());
};

const setGlobalItems = (newItems: WishlistItem[]) => {
  globalItems = newItems;
  emitChange();
};

const setGlobalIsLoading = (loading: boolean) => {
  globalIsLoading = loading;
  emitChange();
};

const setGlobalIsLoaded = (loaded: boolean) => {
  globalIsLoaded = loaded;
  emitChange();
};

const useWishlist = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>(globalItems);
  const [isLoading, setIsLoading] = useState(globalIsLoading);

  // Check if user is authenticated using auth context
  const isAuthenticated = !!user;

  // Subscribe to global store updates
  useEffect(() => {
    const handleUpdate = () => {
      setItems(globalItems);
      setIsLoading(globalIsLoading);
    };
    listeners.add(handleUpdate);
    // Initial sync
    handleUpdate();
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  // Load wishlist from backend or localStorage
  const loadWishlist = useCallback(async (force = false) => {
    // Prevent duplicate calls if already loading
    if (globalIsLoading) return;
    
    // Prevent reload if already loaded and not forced
    if (globalIsLoaded && !force) return;

    console.log('loadWishlist called, isAuthenticated:', isAuthenticated);
    setGlobalIsLoading(true);

    // Add a timeout to ensure loading state is cleared
    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, clearing loading state');
      setGlobalIsLoading(false);
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
          setGlobalItems(transformedItems);
          setGlobalIsLoaded(true);

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
                setGlobalItems(validItems);
                setGlobalIsLoaded(true);
              }
            } catch (e) {
              setGlobalItems([]);
            }
          } else {
            setGlobalItems([]);
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
          setGlobalItems(wishlist);
          setGlobalIsLoaded(true);
        } catch (error) {
          console.error("Error loading wishlist:", error);
          setGlobalItems([]);
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
            setGlobalItems(validItems);
            setGlobalIsLoaded(true);
          }
        } else {
          console.log('No localStorage data available');
          setGlobalItems([]);
        }
      } catch (fallbackError) {
        console.error('Error in fallback wishlist loading:', fallbackError);
        setGlobalItems([]);
      }
    } finally {
      clearTimeout(timeoutId);
      console.log('Setting isLoading to false');
      setGlobalIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load wishlist on auth status change and mount
  useEffect(() => {
    // Only fetch if auth status actually changed or has not been checked yet
    if (globalLastAuthStatus !== isAuthenticated) {
      globalLastAuthStatus = isAuthenticated;
      setGlobalIsLoaded(false);
      
      // Defer execution slightly to avoid React batch rendering state updates
      const timer = setTimeout(() => {
        loadWishlist(true);
      }, 50);
      return () => clearTimeout(timer);
    } else if (!globalIsLoaded && !globalIsLoading) {
      // If it hasn't loaded yet at all
      const timer = setTimeout(() => {
        loadWishlist(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loadWishlist]);

  // Load cached data on mount for immediate UI update
  useEffect(() => {
    const cachedData = localStorage.getItem("wishlist");
    if (cachedData && globalItems.length === 0 && !globalIsLoaded) {
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
            console.log('Immediate UI cache update:', validItems);
            setGlobalItems(validItems);
          }
        }
      } catch (error) {
        console.error('Error loading cached wishlist data:', error);
      }
    }
  }, []);

  const addItem = async (item: WishlistItem) => {
    console.log('Adding item to wishlist:', item);

    if (!item.id || !item.title || typeof item.price !== 'number') {
      console.error('Invalid item format for wishlist:', item);
      toast({
        title: "Error",
        description: "Could not add item to wishlist - invalid format",
        type: "error"
      });
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to wishlist",
        type: "login",
        duration: 4000,
      });
      return;
    }

    setGlobalIsLoading(true);

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
          setGlobalItems(transformedItems);

          // Also save to localStorage as backup
          localStorage.setItem('wishlist', JSON.stringify(transformedItems));

          toast({
            title: "Added to wishlist",
            description: "Item has been added to your wishlist",
            type: "wishlist",
            image: item.image,
          });
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        const exists = globalItems.some(existingItem => existingItem.id === item.id);

        if (exists) {
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist",
            type: "info",
          });
          return;
        }

        const newItems = [...globalItems, item];
        setGlobalItems(newItems);
        localStorage.setItem('wishlist', JSON.stringify(newItems));

        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist",
          type: "wishlist",
          image: item.image,
        });
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);

      if (error.message.includes('already in wishlist')) {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist",
          type: "info",
        });
      } else if (error.message.includes('log in')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to wishlist",
          type: "login",
          duration: 4000,
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add to wishlist",
          type: "error"
        });
      }
    } finally {
      setGlobalIsLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to manage your wishlist",
        type: "login",
        duration: 4000,
      });
      return;
    }

    setGlobalIsLoading(true);

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
          setGlobalItems(transformedItems);

          // Also save to localStorage as backup
          localStorage.setItem('wishlist', JSON.stringify(transformedItems));

          toast({
            title: "Removed from wishlist",
            description: "Item has been removed from your wishlist",
            type: "info",
          });
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        const newItems = globalItems.filter(item => item.id !== id);
        setGlobalItems(newItems);
        localStorage.setItem('wishlist', JSON.stringify(newItems));

        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
          type: "info",
        });
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove from wishlist",
        type: "error"
      });
    } finally {
      setGlobalIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to manage your wishlist",
        type: "login",
        duration: 4000,
      });
      return;
    }

    setGlobalIsLoading(true);

    try {
      if (isAuthenticated) {
        // Clear from backend
        await wishlistService.clearWishlist();
        setGlobalItems([]);
        localStorage.setItem('wishlist', JSON.stringify([]));

        toast({
          title: "Wishlist cleared",
          description: "Your wishlist has been cleared",
          type: "info",
        });
      } else {
        // Fallback to localStorage for non-authenticated users
        setGlobalItems([]);
        localStorage.setItem('wishlist', JSON.stringify([]));

        toast({
          title: "Wishlist cleared",
          description: "Your wishlist has been cleared",
          type: "info",
        });
      }
    } catch (error: any) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear wishlist",
        type: "error"
      });
    } finally {
      setGlobalIsLoading(false);
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