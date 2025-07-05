// Wishlist management utilities for user-specific wishlist storage

export interface WishlistItem {
  id: string;
  title: string;
  image: string;
  price: number;
  category?: string;
  dateAdded?: string;
}

// Get current user ID from localStorage
export const getCurrentUserId = (): string | null => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || user.id || null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get wishlist key for a specific user
export const getWishlistKey = (userId?: string): string => {
  if (!userId) {
    userId = getCurrentUserId();
  }
  return userId ? `wishlist_${userId}` : 'wishlist';
};

// Load wishlist for a specific user
export const loadUserWishlist = (userId?: string): WishlistItem[] => {
  try {
    const wishlistKey = getWishlistKey(userId);
    const wishlistData = localStorage.getItem(wishlistKey);
    
    if (wishlistData) {
      const parsedWishlist = JSON.parse(wishlistData);
      if (Array.isArray(parsedWishlist)) {
        const validItems = parsedWishlist.filter(item => 
          item && item.id && item.title && typeof item.price === 'number'
        );
        console.log(`💖 Loaded wishlist for user: ${userId || 'anonymous'}, items: ${validItems.length}`);
        return validItems;
      }
    }
  } catch (error) {
    console.error('Error loading user wishlist:', error);
  }
  
  return [];
};

// Save wishlist for a specific user
export const saveUserWishlist = (wishlist: WishlistItem[], userId?: string): void => {
  try {
    const wishlistKey = getWishlistKey(userId);
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    console.log(`💾 Saved wishlist for user: ${userId || 'anonymous'}, items: ${wishlist.length}`);
  } catch (error) {
    console.error('Error saving user wishlist:', error);
  }
};

// Clear wishlist for a specific user
export const clearUserWishlist = (userId?: string): void => {
  try {
    const wishlistKey = getWishlistKey(userId);
    localStorage.removeItem(wishlistKey);
    console.log(`🧹 Cleared wishlist for user: ${userId || 'anonymous'}`);
  } catch (error) {
    console.error('Error clearing user wishlist:', error);
  }
};

// Add item to user's wishlist
export const addToUserWishlist = (item: WishlistItem, userId?: string): boolean => {
  try {
    const wishlist = loadUserWishlist(userId);
    
    // Check if item already exists
    if (wishlist.some(existingItem => existingItem.id === item.id)) {
      console.log(`Item ${item.id} already in wishlist for user: ${userId || 'anonymous'}`);
      return false;
    }
    
    // Add item with timestamp
    const newItem = {
      ...item,
      dateAdded: new Date().toISOString()
    };
    
    const updatedWishlist = [...wishlist, newItem];
    saveUserWishlist(updatedWishlist, userId);
    console.log(`💖 Added item to wishlist for user: ${userId || 'anonymous'}`);
    return true;
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    return false;
  }
};

// Remove item from user's wishlist
export const removeFromUserWishlist = (itemId: string, userId?: string): boolean => {
  try {
    const wishlist = loadUserWishlist(userId);
    const updatedWishlist = wishlist.filter(item => item.id !== itemId);
    
    if (updatedWishlist.length !== wishlist.length) {
      saveUserWishlist(updatedWishlist, userId);
      console.log(`💔 Removed item from wishlist for user: ${userId || 'anonymous'}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    return false;
  }
};

// Check if item is in user's wishlist
export const isInUserWishlist = (itemId: string, userId?: string): boolean => {
  try {
    const wishlist = loadUserWishlist(userId);
    return wishlist.some(item => item.id === itemId);
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }
};

// Get wishlist count for a specific user
export const getUserWishlistCount = (userId?: string): number => {
  try {
    const wishlist = loadUserWishlist(userId);
    return wishlist.length;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return 0;
  }
};

// Migrate old wishlist data to user-specific storage
export const migrateOldWishlistData = (userId: string): WishlistItem[] => {
  try {
    const oldWishlistData = localStorage.getItem('wishlist');
    if (oldWishlistData) {
      const parsedWishlist = JSON.parse(oldWishlistData);
      if (Array.isArray(parsedWishlist) && parsedWishlist.length > 0) {
        // Validate and migrate wishlist items
        const validItems = parsedWishlist.filter(item => 
          item && item.id && item.title && typeof item.price === 'number'
        );
        
        if (validItems.length > 0) {
          // Save to new user-specific location
          saveUserWishlist(validItems, userId);
          // Remove old wishlist data
          localStorage.removeItem('wishlist');
          console.log(`🔄 Migrated ${validItems.length} items from old wishlist to user-specific wishlist for user: ${userId}`);
          return validItems;
        }
      }
    }
  } catch (error) {
    console.error('Error migrating old wishlist data:', error);
  }
  return [];
};

// Handle user login - migrate any existing wishlist data
export const handleUserWishlistLogin = (userId: string): WishlistItem[] => {
  // First try to load existing user-specific wishlist
  let wishlistItems = loadUserWishlist(userId);
  
  // If no user-specific wishlist exists, try to migrate old wishlist data
  if (wishlistItems.length === 0) {
    wishlistItems = migrateOldWishlistData(userId);
  }
  
  return wishlistItems;
};

// Handle user logout - clear user-specific wishlist
export const handleUserWishlistLogout = (userId: string): void => {
  clearUserWishlist(userId);
};

// Get all wishlist keys in localStorage (for debugging)
export const getAllWishlistKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('wishlist_')) {
      keys.push(key);
    }
  }
  return keys;
};

// Clean up orphaned wishlist data (for maintenance)
export const cleanupOrphanedWishlists = (): void => {
  try {
    const wishlistKeys = getAllWishlistKeys();
    const currentUserId = getCurrentUserId();
    
    wishlistKeys.forEach(key => {
      const userId = key.replace('wishlist_', '');
      // Keep current user's wishlist and generic wishlist
      if (userId !== currentUserId && key !== 'wishlist') {
        localStorage.removeItem(key);
        console.log(`🧹 Cleaned up orphaned wishlist: ${key}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up orphaned wishlists:', error);
  }
}; 