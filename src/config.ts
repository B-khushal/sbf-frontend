// API Configuration - Using direct backend URL for Render deployment
//export const API_URL = import.meta.env.VITE_API_URL || 'https://sbf-backend.onrender.com/api';
export const API_URL = import.meta.env.VITE_API_URL || 'https://sbf-backend.onrender.com/api';
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'https://sbf-backend.onrender.com';

// Utility function to construct proper image URLs with Cloudinary optimization
export const getImageUrl = (imagePath: string | undefined, options?: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
}): string => {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }
  
  // If it's already a full Cloudinary URL, apply transformations if needed
  if (imagePath.startsWith('https://res.cloudinary.com')) {
    // Check if transformations are already applied
    if (imagePath.includes('/c_scale,w_1000/') || imagePath.includes('/q_auto/') || imagePath.includes('/f_auto/')) {
      return imagePath; // Already optimized
    }
    
    // Apply transformations to existing Cloudinary URL
    const baseUrl = imagePath.split('/upload/')[0] + '/upload/';
    const imagePart = imagePath.split('/upload/')[1];
    
    const transformations = [];
    if (options?.width || options?.height) {
      const cropType = options?.crop || 'scale';
      let transform = `c_${cropType}`;
      if (options?.width) transform += `,w_${options.width}`;
      if (options?.height) transform += `,h_${options.height}`;
      transformations.push(transform);
    } else {
      transformations.push('c_scale,w_1000'); // Default width scaling
    }
    
    transformations.push('q_' + (options?.quality || 'auto')); // Quality optimization
    transformations.push('f_' + (options?.format || 'auto')); // Format optimization
    
    return `${baseUrl}${transformations.join('/')}/${imagePart}`;
  }
  
  // If it's already a full URL (non-Cloudinary), return as is
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

// Generate thumbnail URLs for product listings
export const getThumbnailUrl = (imagePath: string | undefined, size: number = 300): string => {
  return getImageUrl(imagePath, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

// Generate optimized URLs for product detail pages
export const getProductImageUrl = (imagePath: string | undefined, width: number = 800): string => {
  return getImageUrl(imagePath, {
    width: width,
    crop: 'scale',
    quality: 'auto',
    format: 'auto'
  });
};

// Generate square images with AI generative fill for consistent product grid display
export const getSquareImageUrl = (imagePath: string | undefined, size: number = 400): string => {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }
  
  // If it's already a full Cloudinary URL, apply generative fill transformations
  if (imagePath.startsWith('https://res.cloudinary.com')) {
    const baseUrl = imagePath.split('/upload/')[0] + '/upload/';
    const imagePart = imagePath.split('/upload/')[1];
    
    // Apply generative fill transformations for square aspect ratio
    const transformations = [
      'ar_1:1,g_center,b_gen_fill,c_pad', // Generative fill with 1:1 aspect ratio
      `w_${size},h_${size},c_scale`,       // Scale to desired size
      'q_auto:best',                       // Best quality
      'f_auto'                            // Auto format
    ];
    
    return `${baseUrl}${transformations.join('/')}/${imagePart}`;
  }
  
  // For non-Cloudinary URLs, fall back to regular thumbnail
  return getThumbnailUrl(imagePath, size);
};

// Generate enhanced product images with optional generative fill
export const getEnhancedProductImageUrl = (
  imagePath: string | undefined, 
  options?: {
    width?: number;
    height?: number;
    aspectRatio?: string;
    useGenFill?: boolean;
  }
): string => {
  const {
    width = 800,
    height = 600,
    aspectRatio = '4:3',
    useGenFill = true
  } = options || {};
  
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }
  
  // If it's already a full Cloudinary URL, apply enhanced transformations
  if (imagePath.startsWith('https://res.cloudinary.com')) {
    const baseUrl = imagePath.split('/upload/')[0] + '/upload/';
    const imagePart = imagePath.split('/upload/')[1];
    
    const transformations = [];
    
    // Apply generative fill if requested
    if (useGenFill) {
      transformations.push(`ar_${aspectRatio.replace(':', '_')},g_center,b_gen_fill,c_pad`);
    }
    
    // Scale to target dimensions
    transformations.push(`w_${width},h_${height},c_scale`);
    
    // Optimize quality and format
    transformations.push('q_auto:best');
    transformations.push('f_auto');
    
    return `${baseUrl}${transformations.join('/')}/${imagePart}`;
  }
  
  // For non-Cloudinary URLs, fall back to regular optimization
  return getImageUrl(imagePath, { width, height: height, crop: 'scale' });
};

// Other configuration constants can be added here
export const ITEMS_PER_PAGE = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']; 