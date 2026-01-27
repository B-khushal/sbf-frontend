import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  className?: string;
  onRatingClick?: (rating: number) => void;
  onRatingHover?: (rating: number) => void;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  className,
  onRatingClick,
  onRatingHover,
  readonly = false
}) => {
  const handleStarClick = (starValue: number) => {
    if (interactive && !readonly && onRatingClick) {
      onRatingClick(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (interactive && !readonly && onRatingHover) {
      onRatingHover(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive && !readonly && onRatingHover) {
      onRatingHover(0);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= rating;
        
        return (
          <Star
            key={starValue}
            size={size}
            className={cn(
              "transition-all duration-200",
              interactive && !readonly && "cursor-pointer hover:scale-110",
              isActive 
                ? "fill-yellow-400 text-yellow-400" 
                : "fill-gray-200 text-gray-300",
              interactive && !readonly && "hover:fill-yellow-300 hover:text-yellow-300"
            )}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
};

export default StarRating; 