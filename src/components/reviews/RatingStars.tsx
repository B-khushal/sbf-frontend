import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  size?: number;
  interactive?: boolean;
  className?: string;
  onChange?: (value: number) => void;
  onHoverChange?: (value: number) => void;
}

const RatingStars = ({
  value,
  size = 18,
  interactive = false,
  className,
  onChange,
  onHoverChange,
}: RatingStarsProps) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={cn(
            interactive
              ? 'rounded-full transition-transform hover:scale-110 active:scale-95'
              : 'cursor-default'
          )}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && onHoverChange?.(star)}
          onMouseLeave={() => interactive && onHoverChange?.(0)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 dark:text-slate-700'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
