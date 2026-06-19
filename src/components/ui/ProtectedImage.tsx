import React from 'react';
import { cn } from '@/lib/utils';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export const ProtectedImage = React.forwardRef<HTMLImageElement, ProtectedImageProps>(
  ({ src, alt, className, style, ...props }, ref) => {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("select-none pointer-events-none", className)}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        style={{
          WebkitUserSelect: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          OUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          pointerEvents: 'none', // Prevents mouse click/hover actions on the image element itself
          ...style,
        }}
        {...props}
      />
    );
  }
);

ProtectedImage.displayName = 'ProtectedImage';

export default ProtectedImage;
