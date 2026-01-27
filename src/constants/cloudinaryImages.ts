/**
 * Cloudinary Image URLs
 * All static images are hosted on Cloudinary for reliable production delivery
 * 
 * DO NOT use local /images/ paths - they will not work in production
 */

// Logo
export const LOGO_IMAGE_URL = "https://res.cloudinary.com/djtrhfqan/image/upload/v1769532776/sbflorist/assets/logosbf.jpg";

// Hero/Banner Images
export const HERO_IMAGE_1_URL = "https://res.cloudinary.com/djtrhfqan/image/upload/v1769532719/sbflorist/assets/1.jpg";

// About/Delivery Images
export const DELIVERY_IMAGE_URL = "https://res.cloudinary.com/djtrhfqan/image/upload/v1769532722/sbflorist/assets/d3.jpg";
export const SERVICE_IMAGE_URL = "https://res.cloudinary.com/djtrhfqan/image/upload/v1769532724/sbflorist/assets/s1.jpg";

// Placeholder Images
export const PLACEHOLDER_IMAGE_URL = "https://res.cloudinary.com/djtrhfqan/image/upload/v1769532810/sbflorist/assets/placeholder.jpg";
export const PLACEHOLDER_SVG_URL = "https://res.cloudinary.com/djtrhfqan/image/upload/v1769532810/sbflorist/assets/placeholder.jpg"; // Using JPG as fallback

/**
 * Get optimized image URL with transformations
 * @param baseUrl - Base Cloudinary URL
 * @param width - Target width in pixels
 * @param quality - Quality (auto, good, best, low)
 */
export function getOptimizedImageUrl(baseUrl: string, width?: number, quality: string = 'auto'): string {
  if (!baseUrl.includes('cloudinary.com')) {
    return baseUrl; // Not a Cloudinary URL, return as-is
  }
  
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  transformations.push(`q_${quality}`);
  transformations.push('f_auto'); // Auto format (WebP, AVIF, etc.)
  
  const transformation = transformations.join(',');
  
  // Insert transformation before /upload/
  return baseUrl.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Get responsive srcset for an image
 */
export function getResponsiveSrcSet(baseUrl: string): string {
  if (!baseUrl.includes('cloudinary.com')) {
    return ''; // Not a Cloudinary URL
  }
  
  const widths = [320, 640, 768, 1024, 1280, 1920];
  return widths
    .map(w => `${getOptimizedImageUrl(baseUrl, w)} ${w}w`)
    .join(', ');
}
