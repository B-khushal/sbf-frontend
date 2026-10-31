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
  actions?: React.ReactNode;
  searchSlot?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  badge,
  actions,
  searchSlot,
  className,
}) => {
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
          {badge}
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
