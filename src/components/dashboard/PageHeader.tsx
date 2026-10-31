import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  statusBadge?: { label?: string; variant?: string; status?: string } | React.ReactNode;
  actions?: React.ReactNode;
  searchSlot?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  badge,
  statusBadge,
  actions,
  searchSlot,
  className,
}) => {
  const renderBadge = () => {
    if (React.isValidElement(badge)) return badge;
    if (typeof badge === 'string' || typeof badge === 'number') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          {badge}
        </span>
      );
    }

    const sb: any = statusBadge || (typeof badge === 'object' && badge !== null && 'label' in badge ? badge : null);
    if (!sb) return null;

    if (React.isValidElement(sb)) return sb;

    if (typeof sb === 'object' && sb.label) {
      const variant = sb.variant || 'default';
      const variantClasses: Record<string, string> = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
        danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
        rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
        default: 'bg-slate-100 text-slate-700 border-slate-200/60',
      };
      const cls = variantClasses[variant] || variantClasses.default;
      return (
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-xs', cls)}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 shrink-0" />
          {sb.label}
        </span>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        'sbf-neumo-raised p-5 sm:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none',
        className
      )}
    >
      <div className="space-y-1">
        {/* Breadcrumb row */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
                {b.href ? (
                  <Link
                    to={b.href}
                    className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">
                    {b.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title + Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            {title}
          </h1>
          {renderBadge()}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Actions & Search */}
      {(actions || searchSlot) && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {searchSlot}
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
