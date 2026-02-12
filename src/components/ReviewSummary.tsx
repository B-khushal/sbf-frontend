import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  totalReviews,
  showText = true,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: { star: 12, text: 'text-xs' },
    md: { star: 14, text: 'text-sm' },
    lg: { star: 16, text: 'text-base' }
  };

  const { star: starSize, text: textSize } = sizeClasses[size];

  // Don't render if no reviews
  if (totalReviews === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Stars */}
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSize}
            className={cn(
              "transition-colors",
              star <= Math.round(averageRating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-300"
            )}
          />
        ))}
      </div>

      {/* Rating text */}
      {showText && (
        <>
          <span className={cn("font-medium text-gray-700", textSize)}>
            {averageRating.toFixed(1)}
          </span>
          <span className={cn("text-gray-500", textSize)}>
            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </>
      )}
    </div>
  );
};

export default ReviewSummary; 