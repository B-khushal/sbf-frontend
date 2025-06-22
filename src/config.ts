// API Configuration - Using direct backend URL for Render deployment
//export const API_URL = import.meta.env.VITE_API_URL || 'https://sbf-backend.onrender.com/api';
export const API_URL = import.meta.env.VITE_API_URL || 'https://sbf-backend.onrender.com/api';
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'https://sbf-backend.onrender.com';

// Utility function to construct proper image URLs
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }
  
  // If it's already a full URL (like Cloudinary URLs), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // For backward compatibility with local uploads
  // The upload route returns paths like "/uploads/image-123456.jpg"
  // We need to construct the full URL with the backend domain
  let finalUrl: string;
  if (imagePath.startsWith('/uploads/')) {
    finalUrl = `${UPLOADS_URL}${imagePath}`;
  } else if (imagePath.startsWith('/')) {
    finalUrl = `${UPLOADS_URL}${imagePath}`;
  } else {
    // If no leading slash, assume it's just the filename and add /uploads/
    finalUrl = `${UPLOADS_URL}/uploads/${imagePath}`;
  }
  
  return finalUrl;
};

// Other configuration constants can be added here
export const ITEMS_PER_PAGE = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']; 