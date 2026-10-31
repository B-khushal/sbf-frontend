import React from 'react';
import { cn } from '@/lib/utils';

export interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'raised' | 'raised-sm' | 'inset' | 'inset-sm' | 'flat';
  hoverEffect?: boolean;
  headerTitle?: React.ReactNode;
  headerDescription?: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  variant = 'raised',
  hoverEffect = false,
  headerTitle,
  headerDescription,
  headerIcon,
  headerAction,
  children,
  className,
  headerClassName,
  contentClassName,
  ...props
}) => {
  const variantClass = {
    raised: 'sbf-neumo-raised',
    'raised-sm': 'sbf-neumo-raised-sm',
    inset: 'sbf-neumo-inset',
    'inset-sm': 'sbf-neumo-inset-sm',
    flat: 'bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl',
  }[variant];

  return (
    <div
      className={cn(
        variantClass,
        hoverEffect && 'sbf-neumo-raised-hover cursor-pointer',
        'p-5 sm:p-6',
        className
      )}
      {...props}
    >
      {(headerTitle || headerAction || headerIcon) && (
        <div className={cn('flex items-start justify-between gap-3 mb-4', headerClassName)}>
          <div className="flex items-center gap-3">
            {headerIcon && (
              <div className="sbf-neumo-raised-sm w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900">
                {headerIcon}
              </div>
            )}
            <div>
              {headerTitle && (
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {headerTitle}
                </h3>
              )}
              {headerDescription && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {headerDescription}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={cn(contentClassName)}>{children}</div>
    </div>
  );
};

export default NeumorphicCard;
