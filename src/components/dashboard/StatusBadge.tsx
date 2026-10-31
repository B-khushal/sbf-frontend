import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, Truck, Package, XCircle, AlertTriangle } from 'lucide-react';

export type StatusType = 
  | 'placed' 
  | 'approved' 
  | 'dispatched' 
  | 'delivered' 
  | 'cancelled' 
  | 'pending'
  | 'active'
  | 'inactive'
  | 'low_stock'
  | 'out_of_stock'
  | 'live';

export interface StatusBadgeProps {
  status: string | StatusType;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  pulse = false,
  size = 'md',
  className,
}) => {
  const norm = String(status || '').toLowerCase().replace(/[\s-]/g, '_');

  const config: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; defaultLabel: string }> = {
    placed: {
      bg: 'bg-blue-50/80 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200/60 dark:border-blue-800/40',
      icon: <Clock className="w-3 h-3" />,
      defaultLabel: 'Placed',
    },
    approved: {
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200/60 dark:border-indigo-800/40',
      icon: <CheckCircle2 className="w-3 h-3" />,
      defaultLabel: 'Approved',
    },
    dispatched: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/60 dark:border-amber-800/40',
      icon: <Truck className="w-3 h-3" />,
      defaultLabel: 'Dispatched',
    },
    delivered: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/60 dark:border-emerald-800/40',
      icon: <CheckCircle2 className="w-3 h-3" />,
      defaultLabel: 'Delivered',
    },
    cancelled: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200/60 dark:border-rose-900/40',
      icon: <XCircle className="w-3 h-3" />,
      defaultLabel: 'Cancelled',
    },
    pending: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/60 dark:border-amber-800/40',
      icon: <Clock className="w-3 h-3" />,
      defaultLabel: 'Pending',
    },
    active: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/60 dark:border-emerald-800/40',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />,
      defaultLabel: 'Active',
    },
    inactive: {
      bg: 'bg-slate-100/80 dark:bg-slate-800/50',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />,
      defaultLabel: 'Inactive',
    },
    low_stock: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/60 dark:border-amber-800/40',
      icon: <AlertTriangle className="w-3 h-3" />,
      defaultLabel: 'Low Stock',
    },
    out_of_stock: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200/60 dark:border-rose-900/40',
      icon: <XCircle className="w-3 h-3" />,
      defaultLabel: 'Out of Stock',
    },
    live: {
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/50',
      text: 'text-emerald-700 dark:text-emerald-300 font-black',
      border: 'border-emerald-300/80 dark:border-emerald-700/60',
      icon: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />,
      defaultLabel: 'LIVE',
    },
  };

  const item = config[norm] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    icon: <Package className="w-3 h-3" />,
    defaultLabel: norm.replace(/_/g, ' '),
  };

  return (
    <span
      className={cn(
        'sbf-neumo-pill inline-flex items-center gap-1.5 font-bold uppercase tracking-wider select-none shrink-0 border transition-all duration-200',
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]',
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />}
      {!pulse && item.icon}
      <span>{label || item.defaultLabel}</span>
    </span>
  );
};

export default StatusBadge;
