// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Other configuration constants can be added here
export const ITEMS_PER_PAGE = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']; 