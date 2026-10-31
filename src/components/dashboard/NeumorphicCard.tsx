import React from 'react';
import { cn } from '@/lib/utils';

export interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'raised' | 'raised-sm' | 'inset' | 'inset-sm' | 'flat';
  hoverEffect?: boolean;
  title?: React.ReactNode;
  headerTitle?: React.ReactNode;
  description?: React.ReactNode;
  headerDescription?: React.ReactNode;
  headerIcon?: React.ReactNode | React.ElementType;
  headerAction?: React.ReactNode;
  headerActions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  variant = 'raised',
  hoverEffect = false,
  title,
  headerTitle,
  description,
  headerDescription,
  headerIcon,
  headerAction,
  headerActions,
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
    flat: 'bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl',
  }[variant];

  const finalTitle = title || headerTitle;
  const finalDescription = description || headerDescription;
  const finalAction = headerActions || headerAction;

  const renderIcon = (iconInput: any) => {
    if (!iconInput) return null;
    if (React.isValidElement(iconInput)) {
      return iconInput;
    }
    if (
      typeof iconInput === 'function' ||
      (typeof iconInput === 'object' && iconInput !== null && ('render' in iconInput || '$$typeof' in iconInput))
    ) {
      const IconComponent = iconInput;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        variantClass,
        hoverEffect && 'sbf-neumo-raised-hover cursor-pointer',
        'p-5 sm:p-6 rounded-3xl',
        className
      )}
      {...props}
    >
      {(finalTitle || finalAction || headerIcon) && (
        <div className={cn('flex items-start justify-between gap-3 mb-4', headerClassName)}>
          <div className="flex items-center gap-3 min-w-0">
            {headerIcon && (
              <div className="sbf-neumo-raised-sm w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-slate-200/50">
                {renderIcon(headerIcon)}
              </div>
            )}
            <div className="min-w-0">
              {finalTitle && (
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {finalTitle}
                </h3>
              )}
              {finalDescription && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {finalDescription}
                </p>
              )}
            </div>
          </div>
          {finalAction && <div className="shrink-0">{finalAction}</div>}
        </div>
      )}
      <div className={cn(contentClassName)}>{children}</div>
    </div>
  );
};

export default NeumorphicCard;
