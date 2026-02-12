import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  sizes = '100vw',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  loading = 'lazy',
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate WebP and fallback URLs
  const generateOptimizedSrcs = (originalSrc: string) => {
    if (originalSrc.includes('cloudinary.com')) {
      // For Cloudinary images, add format optimization
      const webpSrc = originalSrc.includes('/f_auto/') 
        ? originalSrc 
        : originalSrc.replace('/upload/', '/upload/f_webp,q_auto/');
      
      return {
        webp: webpSrc,
        fallback: originalSrc.replace('/f_webp/', '/f_auto/').replace('/f_auto/', '/f_jpg/'),
      };
    }
    
    return {
      webp: originalSrc,
      fallback: originalSrc,
    };
  };

  // Progressive image loading
  useEffect(() => {
    if (!src) return;

    const { webp, fallback } = generateOptimizedSrcs(src);
    
    // Try WebP first, fallback to original format
    const testWebP = new Image();
    testWebP.onload = () => setCurrentSrc(webp);
    testWebP.onerror = () => setCurrentSrc(fallback);
    testWebP.src = webp;
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    // Fallback to placeholder
    if (imgRef.current && !imgRef.current.src.includes('placeholder')) {
      imgRef.current.src = '/images/placeholder.svg';
    }
    onError?.();
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current && currentSrc) {
            imgRef.current.src = currentSrc;
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [currentSrc, priority, loading]);

  // Generate blur placeholder
  const blurPlaceholder = blurDataURL || 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && !isError && (
        <img
          src={blurPlaceholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full transition-opacity duration-300',
            `object-${objectFit}`,
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !isError && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={priority || loading === 'eager' ? currentSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'transition-opacity duration-300',
          `object-${objectFit}`,
          isLoaded ? 'opacity-100' : 'opacity-0',
          isError && 'opacity-50'
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

// Utility hook for responsive image sizes
export const useResponsiveImageSizes = () => {
  return {
    thumbnail: '(max-width: 640px) 150px, (max-width: 768px) 200px, 250px',
    card: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    hero: '100vw',
    product: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw',
  };
};

export default OptimizedImage; 