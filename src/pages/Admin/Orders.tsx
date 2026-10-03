import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, Filter, Calendar, RefreshCw, Phone, MessageSquare,
  Eye, Download, CheckCircle2, Clock, AlertTriangle, Truck,
  Package, ChevronRight, X, Copy, ExternalLink, Sparkles,
  MapPin, Check, Ban, FileText, ChevronDown, User, Heart,
  ArrowRight, ShieldCheck, Mail, AlertCircle, ChefHat, CheckCheck, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import api from '@/services/api';
import { Order } from '@/services/orderService';
import { sendOrderReviewEmail } from '@/services/reviewService';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Period Tab Types
type PeriodTab = 'today' | 'tomorrow' | 'upcoming' | 'past' | 'custom';

// Upcoming Scope Options for Future Scheduled Orders
type UpcomingScopeType = 'all' | '7d' | '14d' | '30d' | 'beyond_tomorrow';

// Status Types for Operational Filter Bar
type StatusFilterType = 'all' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface StatusCounts {
  total: number;
  preparing: number;
  ready: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  startIndex: number;
  endIndex: number;
  remainingItems: number;
}

// Operational Status Display Configuration (WCAG Conscious)
const STATUS_CONFIG: Record<string, {
  label: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  dotColor: string;
  icon: React.ReactNode;
  category: 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
}> = {
  // Preparing states
  order_placed: {
    label: 'Order Placed',
    pillBg: 'bg-amber-50 dark:bg-amber-950/40',
    pillBorder: 'border-amber-200 dark:border-amber-800/60',
    pillText: 'text-amber-800 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    category: 'preparing'
  },
  received: {
    label: 'Order Received',
    pillBg: 'bg-amber-50 dark:bg-amber-950/40',
    pillBorder: 'border-amber-200 dark:border-amber-800/60',
    pillText: 'text-amber-800 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
    category: 'preparing'
  },
  being_made: {
    label: 'Preparing',
    pillBg: 'bg-amber-50 dark:bg-amber-950/40',
    pillBorder: 'border-amber-200 dark:border-amber-800/60',
    pillText: 'text-amber-800 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    icon: <ChefHat className="w-3.5 h-3.5 text-amber-600" />,
    category: 'preparing'
  },
  pending: {
    label: 'Preparing',
    pillBg: 'bg-amber-50 dark:bg-amber-950/40',
    pillBorder: 'border-amber-200 dark:border-amber-800/60',
    pillText: 'text-amber-800 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    category: 'preparing'
  },
  processing: {
    label: 'Preparing',
    pillBg: 'bg-amber-50 dark:bg-amber-950/40',
    pillBorder: 'border-amber-200 dark:border-amber-800/60',
    pillText: 'text-amber-800 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    icon: <ChefHat className="w-3.5 h-3.5 text-amber-600" />,
    category: 'preparing'
  },
  // Ready states
  ready: {
    label: 'Ready for Delivery',
    pillBg: 'bg-blue-50 dark:bg-blue-950/40',
    pillBorder: 'border-blue-200 dark:border-blue-800/60',
    pillText: 'text-blue-800 dark:text-blue-300',
    dotColor: 'bg-blue-600',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />,
    category: 'ready'
  },
  // Out for Delivery
  out_for_delivery: {
    label: 'Out for Delivery',
    pillBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    pillBorder: 'border-indigo-200 dark:border-indigo-800/60',
    pillText: 'text-indigo-800 dark:text-indigo-300',
    dotColor: 'bg-indigo-600',
    icon: <Truck className="w-3.5 h-3.5 text-indigo-600" />,
    category: 'out_for_delivery'
  },
  // Delivered states
  delivered: {
    label: 'Delivered',
    pillBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    pillBorder: 'border-emerald-200 dark:border-emerald-800/60',
    pillText: 'text-emerald-800 dark:text-emerald-300',
    dotColor: 'bg-emerald-600',
    icon: <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />,
    category: 'delivered'
  },
  completed: {
    label: 'Delivered',
    pillBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    pillBorder: 'border-emerald-200 dark:border-emerald-800/60',
    pillText: 'text-emerald-800 dark:text-emerald-300',
    dotColor: 'bg-emerald-600',
    icon: <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />,
    category: 'delivered'
  },
  // Cancelled states
  cancelled: {
    label: 'Cancelled',
    pillBg: 'bg-rose-50 dark:bg-rose-950/40',
    pillBorder: 'border-rose-200 dark:border-rose-800/60',
    pillText: 'text-rose-800 dark:text-rose-300',
    dotColor: 'bg-rose-600',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
    category: 'cancelled'
  }
};

const getStatusConfig = (status: string) => {
  const s = (status || '').toLowerCase().trim();
  return STATUS_CONFIG[s] || {
    label: status ? status.replace(/_/g, ' ') : 'Pending',
    pillBg: 'bg-slate-100 dark:bg-slate-800',
    pillBorder: 'border-slate-200 dark:border-slate-700',
    pillText: 'text-slate-800 dark:text-slate-200',
    dotColor: 'bg-slate-500',
    icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
    category: 'preparing' as const
  };
};

// Formats messy raw database slot strings beautifully
const formatTimeSlot = (slot?: string | null) => {
  if (!slot) return 'Flexible Delivery';
  const lower = slot.toLowerCase().trim();
  if (lower === 'same_day' || lower === 'sameday') return 'Same-Day Delivery';
  if (lower === 'morning') return 'Morning (9:00 AM – 12:00 PM)';
  if (lower === 'afternoon') return 'Afternoon (12:00 PM – 4:00 PM)';
  if (lower === 'evening') return 'Evening (4:00 PM – 8:00 PM)';
  if (lower === 'midnight') return 'Midnight (11:30 PM – 12:30 AM)';
  
  // slot_H_H patterns e.g., slot_16_18
  const slotMatch = slot.match(/slot_(\d+)_(\d+)/i);
  if (slotMatch) {
    const start = parseInt(slotMatch[1], 10);
    const end = parseInt(slotMatch[2], 10);
    const formatH = (h: number) => {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const dh = h % 12 === 0 ? 12 : h % 12;
      return `${dh}:00 ${suffix}`;
    };
    return `${formatH(start)} – ${formatH(end)}`;
  }
  return slot.replace(/_/g, ' ');
};

// Format delivery date with human-readable relative context
const formatDeliveryDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Not scheduled';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (isToday(d)) return `Today, ${format(d, 'hh:mm a')}`;
    if (isTomorrow(d)) return `Tomorrow, ${format(d, 'hh:mm a')}`;
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch (e) {
    return dateStr;
  }
};

// Quick safe phone cleaner for tel: and WhatsApp
const cleanPhoneNumber = (phone?: string | null) => {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

export const AdminOrders: React.FC = () => {
  const { toast } = useToast();
  const { formatPrice, convertPrice, currency } = useCurrency();

  // Navigation Period Tab
  const [activePeriod, setActivePeriod] = useState<PeriodTab>('today');

  // Upcoming Scope Filter State (for advance orders)
  const [upcomingScope, setUpcomingScope] = useState<UpcomingScopeType>('all');
  const [upcomingCount, setUpcomingCount] = useState<number>(0);
  
  // Secondary Status Filter
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterType>('all');
  
  // Search state with debouncing
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Orders data and loading
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    total: 0,
    preparing: 0,
    ready: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Pagination
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);

  // Custom Date Range Modal state
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [appliedCustomRange, setAppliedCustomRange] = useState<{ start: string; end: string } | null>(null);

  // Filter Drawer / Popover state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDeliveryType, setFilterDeliveryType] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');

  // Order Details Drawer state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Order update pending state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Dynamic Dates for Navigation Tabs
  const now = new Date();
  const todayFormatted = format(now, 'dd MMM yyyy');
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowFormatted = format(tomorrowDate, 'dd MMM yyyy');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch orders when period, status, search, or custom range changes
  useEffect(() => {
    fetchOrdersData();
  }, [activePeriod, selectedStatus, debouncedSearch, appliedCustomRange, filterDeliveryType, filterPaymentStatus, upcomingScope]);

  const fetchOrdersData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const params = new URLSearchParams();
      params.append('period', activePeriod);

      if (activePeriod === 'upcoming') {
        params.append('upcomingScope', upcomingScope);
      }

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (activePeriod === 'custom' && appliedCustomRange) {
        if (appliedCustomRange.start) params.append('dateFrom', appliedCustomRange.start);
        if (appliedCustomRange.end) params.append('dateTo', appliedCustomRange.end);
      }

      const response = await api.get(`/orders?${params.toString()}`);

      if (response.data?.success) {
        let fetchedOrders = response.data.orders || [];

        // Apply secondary client filters if set
        if (filterDeliveryType !== 'all') {
          fetchedOrders = fetchedOrders.filter((o: Order) => {
            const slot = (o.deliverySlot || o.shippingDetails?.timeSlot || '').toLowerCase();
            return slot.includes(filterDeliveryType.toLowerCase());
          });
        }

        if (filterPaymentStatus !== 'all') {
          fetchedOrders = fetchedOrders.filter((o: Order) => {
            const pStatus = (o.paymentStatus || o.paymentDetails?.status || '').toLowerCase();
            return pStatus === filterPaymentStatus.toLowerCase();
          });
        }

        if (filterMinAmount) {
          const min = parseFloat(filterMinAmount);
          if (!isNaN(min)) {
            fetchedOrders = fetchedOrders.filter((o: Order) => (o.totalAmount || o.finalTotal || 0) >= min);
          }
        }

        if (filterMaxAmount) {
          const max = parseFloat(filterMaxAmount);
          if (!isNaN(max)) {
            fetchedOrders = fetchedOrders.filter((o: Order) => (o.totalAmount || o.finalTotal || 0) <= max);
          }
        }

        setOrders(fetchedOrders);
        if (response.data.statusCounts) {
          setStatusCounts(response.data.statusCounts);
        }
        if (typeof response.data.upcomingCount === 'number') {
          setUpcomingCount(response.data.upcomingCount);
        }
        setPaginationInfo(response.data.pagination || null);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: 'Error loading orders',
        description: 'Could not connect to the orders service. Please retry.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 1-Click Status Advance Handler
  const handleUpdateStatus = async (orderId: string, nextStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingOrderId(orderId);
      const res = await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      if (res.data) {
        // Optimistic UI update
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: nextStatus as any, orderStatus: nextStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => (prev ? { ...prev, status: nextStatus as any, orderStatus: nextStatus } : null));
        }

        const config = getStatusConfig(nextStatus);
        toast({
          title: `Status Updated`,
          description: `Order successfully marked as "${config.label}".`
        });

        // Refresh counts in background
        fetchOrdersData();
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast({
        title: 'Update failed',
        description: err.response?.data?.message || 'Could not update order status.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Copy Order ID with Feedback
  const handleCopyOrderId = (orderNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrderId(orderNumber);
    toast({
      title: 'Copied to clipboard',
      description: `Order #${orderNumber} copied.`
    });
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Open Details Drawer
  const handleOpenDrawer = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Download Invoice
  const handleDownloadInvoice = (orderId: string, orderNumber: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(`/api/orders/${orderId}/invoice`, '_blank');
    toast({
      title: 'Downloading Invoice',
      description: `Invoice for order #${orderNumber} is opening.`
    });
  };

  // Apply Custom Date Range
  const handleApplyCustomRange = () => {
    if (!customStartDate) {
      toast({
        title: 'Start date required',
        description: 'Please select a starting date.',
        variant: 'destructive'
      });
      return;
    }
    setAppliedCustomRange({
      start: customStartDate,
      end: customEndDate || customStartDate
    });
    setActivePeriod('custom');
    setIsCustomRangeOpen(false);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterDeliveryType('all');
    setFilterPaymentStatus('all');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setIsFilterOpen(false);
  };

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterDeliveryType !== 'all') count++;
    if (filterPaymentStatus !== 'all') count++;
    if (filterMinAmount || filterMaxAmount) count++;
    return count;
  }, [filterDeliveryType, filterPaymentStatus, filterMinAmount, filterMaxAmount]);

  // Group Past Orders by Date for Requirement 13
  const pastOrdersGrouped = useMemo(() => {
    if (activePeriod !== 'past') return null;
    const groups: Record<string, Order[]> = {};
    orders.forEach(order => {
      const d = order.deliveryDate ? new Date(order.deliveryDate) : new Date(order.createdAt);
      const dateKey = !isNaN(d.getTime()) ? format(d, 'dd MMMM yyyy') : 'Earlier Deliveries';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(order);
    });
    return groups;
  }, [orders, activePeriod]);

  // Group Upcoming Orders chronologically by scheduled delivery date
  const upcomingOrdersGrouped = useMemo(() => {
    if (activePeriod !== 'upcoming') return null;
    const groups: { dateKey: string; dateObj: Date; orders: Order[]; relativeLabel: string }[] = [];
    const groupMap: Record<string, { dateKey: string; dateObj: Date; orders: Order[]; relativeLabel: string }> = {};

    orders.forEach(order => {
      const d = order.deliveryDate ? new Date(order.deliveryDate) : null;
      let dateKey = 'Advance Delivery';
      let relativeLabel = 'Advance Booking';

      if (d && !isNaN(d.getTime())) {
        dateKey = format(d, 'EEEE, dd MMMM yyyy');

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) relativeLabel = 'Today';
        else if (diffDays === 1) relativeLabel = 'Tomorrow';
        else if (diffDays === 2) relativeLabel = 'In 2 days';
        else if (diffDays === 3) relativeLabel = 'In 3 days';
        else if (diffDays > 3) relativeLabel = `In ${diffDays} days`;
        else relativeLabel = 'Past Date';
      }

      if (!groupMap[dateKey]) {
        groupMap[dateKey] = {
          dateKey,
          dateObj: d && !isNaN(d.getTime()) ? d : new Date(),
          orders: [],
          relativeLabel
        };
        groups.push(groupMap[dateKey]);
      }
      groupMap[dateKey].orders.push(order);
    });

    return groups;
  }, [orders, activePeriod]);

  // Determine Primary Context-Aware Action for Order Card
  const renderCardAction = (order: Order) => {
    const rawStatus = (order.status || (order as any).orderStatus || 'pending').toLowerCase();
    const config = getStatusConfig(rawStatus);
    const isBusy = updatingOrderId === order._id;

    if (config.category === 'preparing') {
      return (
        <Button
          size="sm"
          disabled={isBusy}
          onClick={(e) => handleUpdateStatus(order._id, 'ready', e)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8 px-3 rounded-lg shadow-sm transition-all"
        >
          {isBusy ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
          Mark Ready
        </Button>
      );
    }

    if (config.category === 'ready') {
      return (
        <Button
          size="sm"
          disabled={isBusy}
          onClick={(e) => handleUpdateStatus(order._id, 'out_for_delivery', e)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-8 px-3 rounded-lg shadow-sm transition-all"
        >
          {isBusy ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Truck className="w-3.5 h-3.5 mr-1" />}
          Out for Delivery
        </Button>
      );
    }

    if (config.category === 'out_for_delivery') {
      return (
        <Button
          size="sm"
          disabled={isBusy}
          onClick={(e) => handleUpdateStatus(order._id, 'delivered', e)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 px-3 rounded-lg shadow-sm transition-all"
        >
          {isBusy ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <CheckCheck className="w-3.5 h-3.5 mr-1" />}
          Mark Delivered
        </Button>
      );
    }

    if (config.category === 'delivered') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => handleDownloadInvoice(order._id, order.orderNumber, e)}
          className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs h-8 px-3 rounded-lg"
        >
          <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
          Invoice
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => handleOpenDrawer(order, e)}
        className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs h-8 px-3 rounded-lg"
      >
        <AlertCircle className="w-3.5 h-3.5 mr-1" />
        View Reason
      </Button>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
        
        {/* ========================================================
            1. PAGE HEADER (Clean, Compact, Operations-Focused)
           ======================================================== */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Left Title & Subtitle */}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    Orders
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Live Operations
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage deliveries, fulfillment, and order status
                </p>
              </div>

              {/* Right Action Controls: Search, Filters, Date Range, Refresh */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* Search Bar */}
                <div className="relative min-w-[200px] sm:min-w-[260px] flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by ID, customer, product..."
                    className="pl-9 pr-8 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-500"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Popover Button */}
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-9 px-3 text-xs rounded-xl border-slate-200 dark:border-slate-700 relative font-medium",
                        activeFilterCount > 0 && "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/30"
                      )}
                    >
                      <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="ml-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-4 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="font-semibold text-sm">Filter Orders</span>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={handleResetFilters}
                            className="text-xs text-rose-600 hover:underline font-medium"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Delivery Slot Filter */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Delivery Type</label>
                        <select
                          value={filterDeliveryType}
                          onChange={(e) => setFilterDeliveryType(e.target.value)}
                          className="w-full text-xs h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <option value="all">All Delivery Slots</option>
                          <option value="same_day">Same-Day Delivery</option>
                          <option value="midnight">Midnight Delivery</option>
                          <option value="morning">Morning Delivery</option>
                          <option value="evening">Evening Delivery</option>
                        </select>
                      </div>

                      {/* Payment Status Filter */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Payment Status</label>
                        <select
                          value={filterPaymentStatus}
                          onChange={(e) => setFilterPaymentStatus(e.target.value)}
                          className="w-full text-xs h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <option value="all">All Payment Statuses</option>
                          <option value="completed">Completed / Paid</option>
                          <option value="pending">Pending</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      {/* Amount Range */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Order Value (₹)</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filterMinAmount}
                            onChange={(e) => setFilterMinAmount(e.target.value)}
                            className="h-8 text-xs rounded-lg"
                          />
                          <span className="text-slate-400 text-xs">–</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filterMaxAmount}
                            onChange={(e) => setFilterMaxAmount(e.target.value)}
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleResetFilters}
                          className="w-1/2 text-xs h-8 rounded-lg"
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsFilterOpen(false)}
                          className="w-1/2 text-xs h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Custom Date Range Picker Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomRangeOpen(true)}
                  className={cn(
                    "h-9 px-3 text-xs rounded-xl border-slate-200 dark:border-slate-700 font-medium",
                    activePeriod === 'custom' && "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/30"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  {activePeriod === 'custom' && appliedCustomRange
                    ? `${format(new Date(appliedCustomRange.start), 'dd MMM')} – ${format(new Date(appliedCustomRange.end), 'dd MMM')}`
                    : 'Date Range'}
                </Button>

                {/* Refresh Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchOrdersData(true)}
                      disabled={isRefreshing}
                      className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-700"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5 text-slate-600 dark:text-slate-300", isRefreshing && "animate-spin")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh live orders</TooltipContent>
                </Tooltip>
              </div>

            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 space-y-5">

          {/* ========================================================
              2. DATE / ORDER PERIOD NAVIGATION (Segmented Bar)
             ======================================================== */}
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth" aria-label="Order Period Tabs">
              
              {/* Tab 1: Today's Orders */}
              <button
                onClick={() => {
                  setActivePeriod('today');
                  setSelectedStatus('all');
                }}
                className={cn(
                  "flex-1 min-w-[170px] sm:min-w-[190px] py-2.5 px-4 rounded-xl text-left transition-all relative flex flex-col justify-center",
                  activePeriod === 'today'
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs border border-emerald-200/80 dark:border-emerald-800/60"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Today's Orders
                  </span>
                  {activePeriod === 'today' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {todayFormatted}
                </span>
              </button>

              {/* Tab 2: Tomorrow's Orders */}
              <button
                onClick={() => {
                  setActivePeriod('tomorrow');
                  setSelectedStatus('all');
                }}
                className={cn(
                  "flex-1 min-w-[170px] sm:min-w-[190px] py-2.5 px-4 rounded-xl text-left transition-all relative flex flex-col justify-center",
                  activePeriod === 'tomorrow'
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-xs border border-blue-200/80 dark:border-blue-800/60"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Tomorrow
                  </span>
                  {activePeriod === 'tomorrow' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {tomorrowFormatted}
                </span>
              </button>

              {/* Tab 3: Upcoming Orders (Advance Bookings) */}
              <button
                onClick={() => {
                  setActivePeriod('upcoming');
                  setSelectedStatus('all');
                }}
                className={cn(
                  "flex-1 min-w-[170px] sm:min-w-[190px] py-2.5 px-4 rounded-xl text-left transition-all relative flex flex-col justify-center",
                  activePeriod === 'upcoming'
                    ? "bg-violet-50 dark:bg-violet-950/40 text-violet-950 dark:text-violet-100 shadow-xs border border-violet-200/80 dark:border-violet-800/60"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                    Upcoming
                    {upcomingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
                        {upcomingCount}
                      </span>
                    )}
                  </span>
                  {activePeriod === 'upcoming' && (
                    <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  Advance Bookings
                </span>
              </button>

              {/* Tab 4: Past Orders */}
              <button
                onClick={() => {
                  setActivePeriod('past');
                  setSelectedStatus('all');
                }}
                className={cn(
                  "flex-1 min-w-[170px] sm:min-w-[190px] py-2.5 px-4 rounded-xl text-left transition-all relative flex flex-col justify-center",
                  activePeriod === 'past'
                    ? "bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 shadow-xs border border-purple-200/80 dark:border-purple-800/60"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    Past Orders
                  </span>
                  {activePeriod === 'past' && (
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  Previous deliveries
                </span>
              </button>

              {/* Tab 5: Custom Range */}
              <button
                onClick={() => setIsCustomRangeOpen(true)}
                className={cn(
                  "flex-1 min-w-[170px] sm:min-w-[190px] py-2.5 px-4 rounded-xl text-left transition-all relative flex flex-col justify-center",
                  activePeriod === 'custom'
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 shadow-xs border border-amber-200/80 dark:border-amber-800/60"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Custom Range
                  </span>
                  {activePeriod === 'custom' && (
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                  {appliedCustomRange ? `${appliedCustomRange.start} → ${appliedCustomRange.end}` : 'Select dates...'}
                </span>
              </button>

            </nav>
          </div>

          {/* ========================================================
              UPCOMING ADVANCE BOOKINGS SCOPE SELECTOR (When activePeriod === 'upcoming')
             ======================================================== */}
          {activePeriod === 'upcoming' && (
            <div className="bg-gradient-to-r from-violet-50/90 via-purple-50/60 to-indigo-50/90 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-indigo-950/40 border border-violet-200/80 dark:border-violet-800/60 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-600 text-white shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Upcoming Advance Deliveries
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
                        {statusCounts.total} scheduled
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sorted by nearest delivery date for floral sourcing and advance kitchen preparation
                    </p>
                  </div>
                </div>

                {/* Scope Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: 'All Upcoming' },
                    { id: '7d', label: 'Next 7 Days' },
                    { id: '14d', label: 'Next 14 Days' },
                    { id: '30d', label: 'Next 30 Days' },
                    { id: 'beyond_tomorrow', label: 'Beyond Tomorrow' },
                  ].map((scope) => (
                    <button
                      key={scope.id}
                      onClick={() => setUpcomingScope(scope.id as UpcomingScopeType)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                        upcomingScope === scope.id
                          ? "bg-violet-600 text-white shadow-xs"
                          : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                      )}
                    >
                      {scope.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              3. ORDER SUMMARY STATISTICS CARDS (Compact, High-Contrast)
             ======================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* Total Orders Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Orders</span>
                <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Package className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {statusCounts.total}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">100%</span>
              </div>
            </div>

            {/* Preparing Card */}
            <div className="bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Preparing</span>
                <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                  <ChefHat className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-amber-900 dark:text-amber-200">
                  {statusCounts.preparing}
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
            </div>

            {/* Ready Card */}
            <div className="bg-white dark:bg-slate-900 border border-blue-200/70 dark:border-blue-900/40 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Ready</span>
                <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-200">
                  {statusCounts.ready}
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
            </div>

            {/* Out for Delivery Card */}
            <div className="bg-white dark:bg-slate-900 border border-indigo-200/70 dark:border-indigo-900/40 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-indigo-800 dark:text-indigo-300">Out for Delivery</span>
                <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                  <Truck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-indigo-900 dark:text-indigo-200">
                  {statusCounts.out_for_delivery}
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              </div>
            </div>

            {/* Delivered Card */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-200/70 dark:border-emerald-900/40 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Delivered</span>
                <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <CheckCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-200">
                  {statusCounts.delivered}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
            </div>

            {/* Cancelled Card */}
            <div className="bg-white dark:bg-slate-900 border border-rose-200/70 dark:border-rose-900/40 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-rose-800 dark:text-rose-300">Cancelled</span>
                <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                  <XCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-rose-900 dark:text-rose-200">
                  {statusCounts.cancelled}
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-600" />
              </div>
            </div>

          </div>

          {/* ========================================================
              4. ORDER STATUS FILTERS (Secondary Filter Bar with Counts)
             ======================================================== */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            
            <button
              onClick={() => setSelectedStatus('all')}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                selectedStatus === 'all'
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              )}
            >
              All Orders
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", selectedStatus === 'all' ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                {statusCounts.total}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatus('preparing')}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                selectedStatus === 'preparing'
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-50"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Preparing
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", selectedStatus === 'preparing' ? "bg-white/20 text-white" : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300")}>
                {statusCounts.preparing}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatus('ready')}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                selectedStatus === 'ready'
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-50"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Ready
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", selectedStatus === 'ready' ? "bg-white/20 text-white" : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300")}>
                {statusCounts.ready}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatus('out_for_delivery')}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                selectedStatus === 'out_for_delivery'
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Out for Delivery
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", selectedStatus === 'out_for_delivery' ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300")}>
                {statusCounts.out_for_delivery}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatus('delivered')}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                selectedStatus === 'delivered'
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-50"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Delivered
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", selectedStatus === 'delivered' ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300")}>
                {statusCounts.delivered}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatus('cancelled')}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                selectedStatus === 'cancelled'
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-50"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Cancelled
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", selectedStatus === 'cancelled' ? "bg-white/20 text-white" : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300")}>
                {statusCounts.cancelled}
              </span>
            </button>

          </div>

          {/* ========================================================
              5. MAIN ORDER LAYOUT / GRID & CARDS
             ======================================================== */}
          {isLoading ? (
            /* 17. SKELETON LOADING STATE */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs animate-pulse">
                  <div className="w-full h-44 bg-slate-200 dark:bg-slate-800" />
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                    <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-lg pt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            /* 16. BEAUTIFUL EMPTY STATES */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs my-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                {activePeriod === 'today' ? <Sparkles className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {activePeriod === 'today'
                  ? "No orders for today"
                  : activePeriod === 'tomorrow'
                  ? "No orders for tomorrow yet"
                  : activePeriod === 'upcoming'
                  ? "No upcoming scheduled orders"
                  : "No orders found"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {activePeriod === 'today'
                  ? "You're all caught up. New orders will appear here automatically."
                  : activePeriod === 'tomorrow'
                  ? "Tomorrow's scheduled deliveries will appear here as customers place orders."
                  : activePeriod === 'upcoming'
                  ? "Advance bookings scheduled for future dates will appear here chronologically."
                  : "Try clearing search filters or selecting a different date range."}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                {activePeriod === 'today' && (
                  <Button
                    size="sm"
                    onClick={() => setActivePeriod('tomorrow')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl shadow-xs"
                  >
                    View Tomorrow's Orders
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}
                {activePeriod !== 'today' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActivePeriod('today');
                      setSelectedStatus('all');
                      setSearchInput('');
                    }}
                    className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700"
                  >
                    Back to Today's Orders
                  </Button>
                )}
              </div>
            </div>
          ) : activePeriod === 'past' && pastOrdersGrouped ? (
            /* 13. PAST ORDERS WITH DATE GROUPING */
            <div className="space-y-8">
              {Object.entries(pastOrdersGrouped).map(([dateLabel, groupOrders]) => (
                <section key={dateLabel} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-200/70 dark:border-slate-800 pb-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                      {dateLabel}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {groupOrders.length} {groupOrders.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {groupOrders.map(order => renderOrderCard(order))}
                  </div>
                </section>
              ))}
            </div>
          ) : activePeriod === 'upcoming' && upcomingOrdersGrouped ? (
            /* UPCOMING ADVANCE ORDERS WITH CHRONOLOGICAL DATE GROUPING & COUNTDOWN BADGES */
            <div className="space-y-8">
              {upcomingOrdersGrouped.map(group => (
                <section key={group.dateKey} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-200/80 dark:border-violet-900/60 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {group.dateKey}
                      </h2>
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs",
                        group.relativeLabel === 'Tomorrow'
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                          : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800"
                      )}>
                        {group.relativeLabel}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {group.orders.length} {group.orders.length === 1 ? 'delivery' : 'deliveries'} scheduled
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {group.orders.map(order => renderOrderCard(order))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* NORMAL RESPONSIVE GRID (Today, Tomorrow, Custom) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {orders.map(order => renderOrderCard(order))}
            </div>
          )}

        </main>

        {/* ========================================================
            10. ORDER DETAILS DRAWER / FULL-SCREEN MODAL
           ======================================================== */}
        <AnimatePresence>
          {isDrawerOpen && selectedOrder && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
              />

              {/* Drawer Container (Desktop slide from right, Mobile full-screen) */}
              <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full overflow-hidden border-l border-slate-200 dark:border-slate-800"
                >
                  
                  {/* Drawer Header */}
                  <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                          Order #{selectedOrder.orderNumber}
                        </span>
                        <button
                          onClick={(e) => handleCopyOrderId(selectedOrder.orderNumber, e)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label="Copy Order Number"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Placed on {format(new Date(selectedOrder.createdAt), 'dd MMMM yyyy, hh:mm a')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      {(() => {
                        const rawStatus = (selectedOrder.status || (selectedOrder as any).orderStatus || 'pending').toLowerCase();
                        const config = getStatusConfig(rawStatus);
                        return (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                            config.pillBg, config.pillBorder, config.pillText
                          )}>
                            <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                            {config.label}
                          </span>
                        );
                      })()}

                      <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Drawer Scrollable Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Operational Order Status Progression Steps */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Fulfillment Timeline
                      </h3>
                      <div className="flex items-center justify-between text-xs relative">
                        {[
                          { key: 'order_placed', label: 'Placed' },
                          { key: 'being_made', label: 'Preparing' },
                          { key: 'ready', label: 'Ready' },
                          { key: 'out_for_delivery', label: 'Out' },
                          { key: 'delivered', label: 'Delivered' }
                        ].map((step, idx) => {
                          const currentStatus = (selectedOrder.status || (selectedOrder as any).orderStatus || '').toLowerCase();
                          const stepOrder = ['order_placed', 'being_made', 'ready', 'out_for_delivery', 'delivered'];
                          const currentIdx = stepOrder.indexOf(currentStatus === 'received' || currentStatus === 'pending' ? 'being_made' : currentStatus);
                          const isDone = currentIdx >= idx;
                          const isCurrent = currentIdx === idx;

                          return (
                            <div key={step.key} className="flex flex-col items-center flex-1 text-center relative z-10">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                                isCurrent
                                  ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950"
                                  : isDone
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                              )}>
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span className={cn(
                                "text-[11px] font-medium mt-1.5",
                                isCurrent ? "text-emerald-700 dark:text-emerald-400 font-bold" : isDone ? "text-slate-800 dark:text-slate-200" : "text-slate-400"
                              )}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Customer & Recipient Communication Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Customer Box */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                          <User className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold uppercase tracking-wider">Ordered By</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {selectedOrder.shippingDetails?.fullName || selectedOrder.customerName || 'Customer'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedOrder.shippingDetails?.phone || selectedOrder.customerPhone || 'No phone'}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {selectedOrder.shippingDetails?.email || selectedOrder.customerEmail || 'No email'}
                        </p>
                      </div>

                      {/* Recipient Box with Quick Call & WhatsApp */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">Recipient</span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {selectedOrder.giftDetails?.recipientName || selectedOrder.shippingDetails?.fullName || selectedOrder.customerName || 'Recipient'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedOrder.giftDetails?.recipientPhone || selectedOrder.shippingDetails?.phone || selectedOrder.customerPhone || 'N/A'}
                        </p>

                        {/* Direct Communication Buttons */}
                        {(() => {
                          const phone = selectedOrder.giftDetails?.recipientPhone || selectedOrder.shippingDetails?.phone || selectedOrder.customerPhone;
                          const cleanPhone = cleanPhoneNumber(phone);
                          const recipientName = selectedOrder.giftDetails?.recipientName || selectedOrder.shippingDetails?.fullName || 'Customer';
                          const waText = encodeURIComponent(`Hello ${recipientName}, this is Spring Blossoms regarding your flower delivery order #${selectedOrder.orderNumber}.`);

                          return (
                            <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <a
                                href={`tel:${phone}`}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                Call
                              </a>
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${waText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                            </div>
                          );
                        })()}
                      </div>

                    </div>

                    {/* Delivery Address & Map Navigation */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold uppercase tracking-wider">Delivery Details</span>
                        </div>
                        <Badge variant="secondary" className="text-[11px] font-medium">
                          {formatTimeSlot(selectedOrder.deliverySlot || selectedOrder.shippingDetails?.timeSlot)}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {selectedOrder.shippingDetails?.address || selectedOrder.shippingAddress?.address || 'Address provided at booking'}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span>City: <strong className="text-slate-700 dark:text-slate-300">{selectedOrder.shippingDetails?.city || 'Hyderabad'}</strong></span>
                        <span>Pincode: <strong className="text-slate-700 dark:text-slate-300">{selectedOrder.shippingDetails?.zipCode || selectedOrder.shippingAddress?.zipCode || '500001'}</strong></span>
                      </div>

                      {/* Map Links */}
                      {(() => {
                        const lat = selectedOrder.shippingDetails?.latitude || selectedOrder.giftDetails?.latitude || 17.3912;
                        const lng = selectedOrder.shippingDetails?.longitude || selectedOrder.giftDetails?.longitude || 78.4326;
                        return (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Navigation:</span>
                            <a
                              href={`https://mappls.com/@${lat},${lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                            >
                              Mappls <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-slate-300">|</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                            >
                              Google Maps <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Greeting Card Message (Styled Note Card) */}
                    {(selectedOrder.cardMessage || selectedOrder.giftDetails?.message || selectedOrder.shippingDetails?.cardMessage) && (
                      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 relative">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                          <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          Florist Card Message
                        </div>
                        <p className="text-xs italic text-amber-950 dark:text-amber-100 font-serif leading-relaxed">
                          "{selectedOrder.cardMessage || selectedOrder.giftDetails?.message || selectedOrder.shippingDetails?.cardMessage}"
                        </p>
                      </div>
                    )}

                    {/* Products Ordered List */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Products ({selectedOrder.items?.length || 0})
                      </h3>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedOrder.items?.map((item: any, idx: number) => {
                          const img = item.image || item.images?.[0] || item.product?.images?.[0] || 'https://res.cloudinary.com/djtrhfqan/image/upload/v1781883113/sbf-products/migrated-67e91164b949d92932897253-0-1781883111484.jpg';
                          const name = item.productName || item.title || item.product?.name || item.product?.title || 'Floral Bouquet';
                          const unitPrice = parseFloat(item.price || item.unitPrice || 0);
                          const qty = parseInt(item.quantity || item.qty || 1, 10);
                          const total = unitPrice * qty;

                          return (
                            <div key={idx} className="py-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={img}
                                  alt={name}
                                  className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/djtrhfqan/image/upload/v1781883113/sbf-products/migrated-67e91164b949d92932897253-0-1781883111484.jpg';
                                  }}
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Qty: <strong>{qty}</strong> × {formatPrice(unitPrice)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {formatPrice(total)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment & Billing Breakdown */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>{formatPrice(parseFloat(String(selectedOrder.subtotal || selectedOrder.totalAmount || 0)))}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Delivery Fee</span>
                        <span>{formatPrice(parseFloat(String(selectedOrder.deliveryCharge || selectedOrder.shippingFee || 0)))}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Payment Method</span>
                        <span className="font-semibold uppercase text-slate-700 dark:text-slate-300">
                          {selectedOrder.paymentMethod || selectedOrder.paymentDetails?.method || 'Razorpay'}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                        <span>Total Paid</span>
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {formatPrice(parseFloat(String(selectedOrder.totalAmount || selectedOrder.finalTotal || 0)))}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDownloadInvoice(selectedOrder._id, selectedOrder.orderNumber, e)}
                      className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Invoice PDF
                    </Button>

                    <div className="flex items-center gap-2">
                      {renderCardAction(selectedOrder)}
                    </div>
                  </div>

                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================
            12. CUSTOM DATE RANGE PICKER MODAL
           ======================================================== */}
        <Dialog open={isCustomRangeOpen} onOpenChange={setIsCustomRangeOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Select Custom Date Range
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Choose start and end dates to view historical delivery operations.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Start Date</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">End Date</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    const end = format(d, 'yyyy-MM-dd');
                    d.setDate(d.getDate() - 7);
                    setCustomStartDate(format(d, 'yyyy-MM-dd'));
                    setCustomEndDate(end);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    const end = format(d, 'yyyy-MM-dd');
                    d.setDate(d.getDate() - 30);
                    setCustomStartDate(format(d, 'yyyy-MM-dd'));
                    setCustomEndDate(end);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    const end = format(d, 'yyyy-MM-dd');
                    const start = format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
                    setCustomStartDate(start);
                    setCustomEndDate(end);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  This Month
                </button>
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCustomRangeOpen(false)}
                className="text-xs h-9 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyCustomRange}
                className="text-xs h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Apply Range
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );

  // Helper Renderer for Single Order Card (Requirements 5, 6, 7, 8, 9, 20)
  function renderOrderCard(order: Order) {
    const rawStatus = (order.status || (order as any).orderStatus || 'pending').toLowerCase();
    const config = getStatusConfig(rawStatus);

    // Primary Bouquet Product Image
    const firstItem = order.items?.[0];
    const bouquetImg = firstItem?.image || firstItem?.images?.[0] || firstItem?.product?.images?.[0] || 'https://res.cloudinary.com/djtrhfqan/image/upload/v1781883113/sbf-products/migrated-67e91164b949d92932897253-0-1781883111484.jpg';
    const bouquetTitle = firstItem?.productName || firstItem?.title || firstItem?.product?.name || firstItem?.product?.title || 'Florist Special Bouquet';
    const totalItemsCount = order.items?.reduce((sum, it) => sum + parseInt(it.quantity as any || 1, 10), 0) || 1;

    // Recipient & Customer Info
    const recipientName = order.giftDetails?.recipientName || order.shippingDetails?.fullName || order.customerName || 'Customer';
    const purchaserName = order.customerName || order.shippingDetails?.fullName || 'Customer';
    const isGiftOrder = !!(order.giftDetails?.recipientName && order.giftDetails.recipientName !== purchaserName);
    const phone = order.giftDetails?.recipientPhone || order.shippingDetails?.phone || order.customerPhone || '';
    const cleanPhone = cleanPhoneNumber(phone);
    const city = order.shippingDetails?.city || order.shippingAddress?.city || 'Hyderabad';
    const landmark = order.shippingDetails?.landmark || order.shippingDetails?.apartment || '';
    const locationSnippet = landmark ? `${city} • ${landmark}` : city;

    // Delivery Slot & Time
    const slotFormatted = formatTimeSlot(order.deliverySlot || order.shippingDetails?.timeSlot);
    const deliveryDateFormatted = formatDeliveryDate(order.deliveryDate || order.shippingDetails?.deliveryDate || order.createdAt);

    // Calculate upcoming countdown if delivery is scheduled in future
    let upcomingBadge: { text: string; bg: string; textCol: string } | null = null;
    const rawDeliveryDate = order.deliveryDate || order.shippingDetails?.deliveryDate;
    if (rawDeliveryDate) {
      const d = new Date(rawDeliveryDate);
      if (!isNaN(d.getTime())) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          upcomingBadge = {
            text: 'Tomorrow',
            bg: 'bg-blue-600/90 text-white',
            textCol: 'text-blue-700 dark:text-blue-300'
          };
        } else if (diffDays === 2) {
          upcomingBadge = {
            text: 'In 2 days',
            bg: 'bg-violet-600/90 text-white',
            textCol: 'text-violet-700 dark:text-violet-300'
          };
        } else if (diffDays > 2) {
          upcomingBadge = {
            text: `In ${diffDays} days`,
            bg: 'bg-indigo-600/90 text-white',
            textCol: 'text-indigo-700 dark:text-indigo-300'
          };
        }
      }
    }

    // WhatsApp Message
    const waText = encodeURIComponent(`Hello ${recipientName}, this is Spring Blossoms regarding your flower delivery order #${order.orderNumber}.`);

    return (
      <div
        key={order._id}
        onClick={() => handleOpenDrawer(order)}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between cursor-pointer"
      >
        {/* ================= CARD TOP: Product Bouquet Image & Badges ================= */}
        <div>
          <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <img
              src={bouquetImg}
              alt={bouquetTitle}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/djtrhfqan/image/upload/v1781883113/sbf-products/migrated-67e91164b949d92932897253-0-1781883111484.jpg';
              }}
            />

            {/* Top-Right: WCAG Status Badge with Accessible Dot */}
            <div className="absolute top-2.5 right-2.5">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs border",
                config.pillBg, config.pillBorder, config.pillText
              )}>
                <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                {config.label}
              </span>
            </div>

            {/* Top-Left: Delivery Slot Pill & Countdown Badge */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/70 text-white backdrop-blur-xs">
                {slotFormatted}
              </span>
              {upcomingBadge && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs backdrop-blur-xs border border-white/20",
                  upcomingBadge.bg
                )}>
                  <Clock className="w-3 h-3" />
                  {upcomingBadge.text}
                </span>
              )}
            </div>
          </div>

          {/* ================= CARD BODY: Order Details & Delivery Info ================= */}
          <div className="p-4 space-y-3">
            
            {/* Order # and 1-Click Copy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  #{order.orderNumber}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => handleCopyOrderId(order.orderNumber, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                      aria-label="Copy order number"
                    >
                      {copiedOrderId === order.orderNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Copy Order Number</TooltipContent>
                </Tooltip>
              </div>

              {/* Price */}
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {formatPrice(parseFloat(String(order.totalAmount || order.finalTotal || 0)))}
              </span>
            </div>

            {/* Customer & Recipient */}
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50 line-clamp-1">
                {recipientName}
              </p>
              {isGiftOrder && (
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  From: {purchaserName}
                </p>
              )}
            </div>

            {/* Product Title and Quantity */}
            <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{bouquetTitle}</span>
              {totalItemsCount > 1 && (
                <span className="ml-1 text-[11px] text-slate-500 font-medium">
                  (+{totalItemsCount - 1} more)
                </span>
              )}
            </div>

            {/* ================= 7. HIGHLY VISIBLE DELIVERY INFO ================= */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              
              {/* Delivery Date & Time */}
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 truncate">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">
                    {deliveryDateFormatted}
                  </span>
                </div>
                {upcomingBadge && (
                  <span className={cn(
                    "shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50",
                    upcomingBadge.textCol
                  )}>
                    {upcomingBadge.text}
                  </span>
                )}
              </div>

              {/* Delivery Location */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {locationSnippet}
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* ================= 9. CARD ACTION BUTTONS ================= */}
        <div className="p-3 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          
          {/* Context-Aware Primary Action */}
          <div className="flex items-center gap-1.5">
            {renderCardAction(order)}

            {/* View Order Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => handleOpenDrawer(order, e)}
              className="text-xs h-8 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              View
            </Button>
          </div>

          {/* Quick Communication Actions (Compact Icon Buttons with Tooltips) */}
          <div className="flex items-center gap-1">
            {phone && (
              <>
                {/* Direct Call Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`tel:${phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 transition shadow-2xs"
                      aria-label="Call Recipient"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Call: {phone}</TooltipContent>
                </Tooltip>

                {/* WhatsApp Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition shadow-2xs"
                      aria-label="Message on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Chat on WhatsApp</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

        </div>

      </div>
    );
  }
};

export default AdminOrders;
