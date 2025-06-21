// API Configuration - Using direct backend URL for Render deployment
export const API_URL = import.meta.env.VITE_API_URL || 'https://sbf-backend.onrender.com/api';
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'https://sbf-backend.onrender.com';

// Utility function to construct proper image URLs
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '/images/placeholder.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, construct the full URL
  if (imagePath.startsWith('/')) {
    return `${UPLOADS_URL}${imagePath}`;
  }
  
  // If it doesn't start with /, add it
  return `${UPLOADS_URL}/${imagePath}`;
};

// Other configuration constants can be added here
export const ITEMS_PER_PAGE = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']; 