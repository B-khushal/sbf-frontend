import React from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CurrentLocationButtonProps {
  onClick: () => void;
  isLoading: boolean;
  className?: string;
}

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onClick,
  isLoading,
  className,
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/70 hover:bg-white/90 dark:bg-slate-900/70 dark:hover:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur-md shadow-md transition-all duration-300 font-medium active:scale-95 disabled:opacity-80",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
      ) : (
        <Navigation className="h-4 w-4 text-emerald-500 fill-emerald-500/25" />
      )}
      <span className="text-sm font-semibold tracking-wide">
        {isLoading ? 'Locating...' : 'Use Current Location'}
      </span>
    </Button>
  );
};

export default CurrentLocationButton;
