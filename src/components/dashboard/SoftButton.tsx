import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'raised' | 'inset' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(
  ({ variant = 'raised', size = 'md', loading = false, icon, children, className, disabled, ...props }, ref) => {
    const variantStyles = {
      primary: 'sbf-neumo-btn-primary',
      raised: 'sbf-neumo-btn text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white',
      inset: 'sbf-neumo-inset-sm text-slate-800 dark:text-slate-100 font-bold',
      ghost: 'bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded-xl transition-colors',
      danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 rounded-xl shadow-xs',
      icon: 'sbf-neumo-btn p-0 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400',
    }[variant];

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-xs sm:text-sm gap-2',
      lg: 'h-12 px-6 text-sm sm:text-base gap-2.5 font-bold',
      icon: 'w-10 h-10 rounded-2xl',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles,
          sizeStyles,
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

SoftButton.displayName = 'SoftButton';

export default SoftButton;

