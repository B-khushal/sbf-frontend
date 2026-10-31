import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: number; // e.g. 12.5 for +12.5%
  trendLabel?: string; // e.g. "vs yesterday" or "vs last month"
  subtitle?: string;
  badge?: React.ReactNode;
  variant?: 'rose' | 'emerald' | 'amber' | 'blue' | 'indigo' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel = 'vs last period',
  subtitle,
  badge,
  variant = 'rose',
  onClick,
  className,
}) => {
  const iconColors = {
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/50 dark:border-rose-900/30',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-900/30',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/50 dark:border-amber-900/30',
    blue: 'text-sky-600 dark:text-sky-400 bg-sky-50/80 dark:bg-sky-950/40 border-sky-200/50 dark:border-sky-900/30',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/50 dark:border-indigo-900/30',
    neutral: 'text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/40',
  }[variant];

  const hasTrend = trend !== undefined && trend !== null;
  const isPositive = (trend ?? 0) > 0;
  const isZero = (trend ?? 0) === 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'sbf-neumo-raised sbf-neumo-raised-hover p-4 sm:p-5 flex flex-col justify-between select-none',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Top Row: Icon Container & Title + Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                'sbf-neumo-raised-sm w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105',
                iconColors
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </p>
            {subtitle && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Main Metric Value */}
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight font-sans">
          {value}
        </div>

        {/* Trend Pill */}
        {hasTrend && (
          <div
            className={cn(
              'sbf-neumo-inset-sm flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0',
              isZero
                ? 'text-slate-500 bg-slate-100/50 dark:bg-slate-800/50'
                : isPositive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
                : 'text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30'
            )}
          >
            {isZero ? (
              <Minus className="w-3 h-3 stroke-[2.5]" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-3 h-3 stroke-[2.5]" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {Math.abs(trend ?? 0).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Optional Footnote / Sub-context */}
      {hasTrend && trendLabel && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
          {trendLabel}
        </p>
      )}
    </div>
  );
};

export default StatCard;
