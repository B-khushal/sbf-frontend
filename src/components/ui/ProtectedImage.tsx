import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const ProtectedImage = React.forwardRef<HTMLImageElement, ProtectedImageProps>(
  ({ src, alt, className, style, fallbackSrc = '/images/placeholder.svg', onError, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    React.useEffect(() => {
      setImgSrc(src);
      setHasError(false);
    }, [src]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!hasError) {
        setHasError(true);
        setImgSrc(fallbackSrc);
      }
      if (onError) onError(e);
    };

    return (
      <img
        ref={ref}
        src={imgSrc}
        alt={alt}
        className={cn("select-none pointer-events-none", className)}
        onContextMenu={(e) => e.preventDefault()}
        onError={handleError}
        draggable={false}
        style={{
          WebkitUserSelect: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          OUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          pointerEvents: 'none',
          ...style,
        }}
        {...props}
      />
    );
  }
);

ProtectedImage.displayName = 'ProtectedImage';

export default ProtectedImage;
