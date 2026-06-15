import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Eye, Download, Calendar, Clock, AlertTriangle, Filter, X, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, Check, 
  Phone, MessageSquare, List, Grid, ChevronDown, Sparkles, AlertCircle, 
  ArrowUpDown, ExternalLink, Mail, ShieldAlert, Truck, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import api from '@/services/api';
import { Order } from '@/services/orderService';
import { sendOrderReviewEmail } from '@/services/reviewService';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ExtendedOrder extends Order {
  deliveryHighlight?: {
    type: 'today' | 'tomorrow' | 'soon' | 'upcoming' | 'overdue';
    urgency: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    color: string;
    bgColor: string;
    textColor: string;
  };
  priority?: 'critical' | 'high' | 'medium' | 'low';
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

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; glow: string; icon: React.ReactNode }> = {
  order_placed: {
    label: 'Order Placed',
    bg: 'bg-blue-50/70 dark:bg-blue-950/20 backdrop-blur-sm',
    border: 'border-blue-200/60 dark:border-blue-900/40',
    text: 'text-blue-700 dark:text-blue-400',
    glow: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
  },
  received: {
    label: 'Received',
    bg: 'bg-purple-50/70 dark:bg-purple-950/20 backdrop-blur-sm',
    border: 'border-purple-200/60 dark:border-purple-900/40',
    text: 'text-purple-700 dark:text-purple-400',
    glow: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
  },
  being_made: {
    label: 'Being Made',
    bg: 'bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-sm',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    text: 'text-amber-700 dark:text-amber-400',
    glow: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    bg: 'bg-indigo-50/70 dark:bg-indigo-950/20 backdrop-blur-sm',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
    text: 'text-indigo-700 dark:text-indigo-400',
    glow: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-bounce" />
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 backdrop-blur-sm',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    glow: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50/70 dark:bg-rose-950/20 backdrop-blur-sm',
    border: 'border-rose-200/60 dark:border-rose-900/40',
    text: 'text-rose-700 dark:text-rose-400',
    glow: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
  },
  pending: {
    label: 'Pending',
    bg: 'bg-slate-50/70 dark:bg-slate-900/20 backdrop-blur-sm',
    border: 'border-slate-200/60 dark:border-slate-800/40',
    text: 'text-slate-700 dark:text-slate-400',
    glow: 'bg-slate-500',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
  },
  processing: {
    label: 'Processing',
    bg: 'bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-sm',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    text: 'text-amber-700 dark:text-amber-400',
    glow: 'bg-amber-500',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 backdrop-blur-sm',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    glow: 'bg-emerald-500',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
  }
};

const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
};

// Formats messy raw database slot strings beautifully
const formatTimeSlot = (slot: string) => {
  if (!slot) return 'N/A';
  
  const lower = slot.toLowerCase().trim();
  if (lower === 'morning') return '9:00 AM – 12:00 PM';
  if (lower === 'afternoon') return '12:00 PM – 4:00 PM';
  if (lower === 'evening') return '4:00 PM – 8:00 PM';
  if (lower === 'midnight') return '12:00 AM – 6:00 AM';
  
  // slot_H_H patterns e.g., slot_16_18
  const slotMatch = slot.match(/slot_(\d+)_(\d+)/i);
  if (slotMatch) {
    const start = parseInt(slotMatch[1], 10);
    const end = parseInt(slotMatch[2], 10);
    const formatHour = (h: number) => {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      return `${displayHour}:00 ${suffix}`;
    };
    return `${formatHour(start)} – ${formatHour(end)}`;
  }
  
  // standard hour range e.g., 4-6, 16-18
  const rangeMatch = slot.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    
    const formatHourGuess = (h: number) => {
      let finalHour = h;
      let suffix = 'AM';
      if (h >= 12) {
        suffix = 'PM';
        finalHour = h > 12 ? h - 12 : 12;
      } else {
        if (h >= 1 && h <= 8) {
          suffix = 'PM';
        }
      }
      return `${finalHour}:00 ${suffix}`;
    };
    return `${formatHourGuess(start)} – ${formatHourGuess(end)}`;
  }
  
  return slot.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [highlight3Days, setHighlight3Days] = useState(true);
  const [firstOrderFilter, setFirstOrderFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);

  // View state: 'table' or 'cards' (defaults to stored choice or 'table')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    return (localStorage.getItem('sbf_orders_view_mode') as 'table' | 'cards') || 'table';
  });

  // Keep track of which cards are expanded for item previews
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Copied tracking
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [emailSendingOrderId, setEmailSendingOrderId] = useState<string | null>(null);

  const { toast } = useToast();
  const {
    formatPrice, convertPrice, currency, setCurrency
  } = useCurrency();

  // Enhanced date filtering states
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  const [deliveryDateRange, setDeliveryDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const navigate = useNavigate();

  // Save view mode in storage
  const handleViewModeChange = (mode: 'table' | 'cards') => {
    setViewMode(mode);
    localStorage.setItem('sbf_orders_view_mode', mode);
  };

  const handleCopyId = (id: string, orderNo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    toast({
      title: "Copied!",
      description: `Order ID for ${orderNo} copied to clipboard.`,
    });
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const toggleExpandCard = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCards(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Helper function to format price with specific currency
  const formatPriceWithCurrency = (amount: number, targetCurrency: string) => {
    return new Intl.NumberFormat(targetCurrency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to handle currency display based on order's original currency
  const displayOrderPrice = (amount: number, orderCurrency?: string, orderRate?: number) => {
    let finalAmount = amount;
    
    if (orderCurrency && orderCurrency !== currency) {
      if (orderCurrency === 'INR' && currency !== 'INR') {
        finalAmount = convertPrice(amount);
      } else if (orderCurrency !== 'INR' && currency === 'INR') {
        if (orderRate) {
          finalAmount = amount / orderRate;
        } else {
          finalAmount = amount / 0.01199; // Fallback
        }
      } else if (orderCurrency !== 'INR' && currency !== 'INR') {
        if (orderRate) {
          const amountInINR = amount / orderRate;
          finalAmount = convertPrice(amountInINR);
        }
      }
    } else if (!orderCurrency) {
      finalAmount = convertPrice(amount);
    }
    
    return formatPriceWithCurrency(finalAmount, currency);
  };

  const currencies = [
    { code: 'INR', symbol: '₹' },
    { code: 'USD', symbol: '$' },
    { code: 'AED', symbol: 'AED' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
  ];

  // Force refresh when currency changes to update displayed prices
  useEffect(() => {
    if (orders.length > 0) {
      setOrders(prev => [...prev]);
    }
  }, [currency]);

  useEffect(() => {
    fetchOrders();
    fetchUpcomingDeliveries();
  }, [selectedStatus, dateRange, deliveryDateRange, searchTerm, highlight3Days, currentPage, pageSize, firstOrderFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedStatus, dateRange, deliveryDateRange, searchTerm]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);
      if (dateRange.from) params.append('dateFrom', dateRange.from.toISOString());
      if (dateRange.to) params.append('dateTo', dateRange.to.toISOString());
      if (deliveryDateRange.from) params.append('deliveryDateFrom', deliveryDateRange.from.toISOString());
      if (deliveryDateRange.to) params.append('deliveryDateTo', deliveryDateRange.to.toISOString());
      if (highlight3Days) params.append('highlight3Days', 'true');
      if (firstOrderFilter === 'applied') params.append('firstOrderFreeDelivery', 'true');
      if (firstOrderFilter === 'standard') params.append('firstOrderFreeDelivery', 'false');

      const response = await api.get(`/orders?${params.toString()}`);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setPaginationInfo(response.data.pagination);
      } else {
        setOrders(response.data || []);
        setPaginationInfo(null);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingDeliveries = async () => {
    try {
      const response = await api.get('/orders/upcoming-deliveries?days=7');
      if (response.data.success) {
        setUpcomingDeliveries(response.data);
      }
    } catch (error) {
      console.error('Error fetching upcoming deliveries:', error);
    }
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleSendReviewEmail = async (orderId: string, orderNumber: string) => {
    try {
      setEmailSendingOrderId(orderId);
      const response = await sendOrderReviewEmail(orderId);

      toast({
        title: "Review Email Sent",
        description:
          response.summary?.productCount
            ? `Sent review request for ${response.summary.productCount} product${response.summary.productCount > 1 ? 's' : ''} in order ${orderNumber}.`
            : `Review request email sent for order ${orderNumber}.`,
      });
    } catch (error: any) {
      console.error('Error sending review request email:', error);
      toast({
        title: "Email Failed",
        description: error.response?.data?.message || "Could not send the review request email.",
        variant: "destructive",
      });
    } finally {
      setEmailSendingOrderId(null);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      if (response.data) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        
        toast({
          title: "Success",
          description: `Order status updated to "${getStatusConfig(newStatus).label}" successfully.`,
        });
        
        if (newStatus === 'delivered') {
          toast({
            title: "🎉 Order Delivered!",
            description: "Delivery confirmation email with invoice has been sent to the customer.",
          });
        }
        
        fetchUpcomingDeliveries();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const testDeliveryEmail = async () => {
    if (!orders.length) {
      toast({
        title: "No Orders",
        description: "No orders available to test email.",
        variant: "destructive",
      });
      return;
    }

    const firstOrder = orders[0];
    try {
      toast({
        title: "Testing Email",
        description: `Testing delivery email for order ${firstOrder.orderNumber}...`,
      });

      const response = await api.post('/orders/test-delivery-email', { 
        orderId: firstOrder._id 
      });

      if (response.data.success) {
        toast({
          title: "✅ Email Test Successful",
          description: `Test email sent to ${response.data.customerEmail}`,
        });
      } else {
        toast({
          title: "❌ Email Test Failed",
          description: response.data.message || "Failed to send test email",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error testing delivery email:', error);
      toast({
        title: "❌ Email Test Failed",
        description: error.response?.data?.message || "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setDeliveryDateRange({ from: undefined, to: undefined });
    setSearchTerm('');
    setSelectedStatus('all');
    setFirstOrderFilter('all');
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    if (!paginationInfo) return [];
    
    const { currentPage, totalPages } = paginationInfo;
    const pages = [];
    const showPages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Order Number', 'Order Date', 'Customer Name', 'Email', 'Phone',
        'Address', 'City', 'State', 'Zip Code', 'Delivery Date', 'Time Slot',
        'Product Name', 'Quantity', 'Price', 'Final Price', 'Total Amount', 
        'Status', 'Payment Method', 'Priority'
      ];

      const rows = [headers];
      orders.forEach(order => {
        order.items.forEach(item => {
          rows.push([
            order.orderNumber,
            formatDate(order.createdAt),
            order.shippingDetails.fullName,
            order.shippingDetails.email,
            order.shippingDetails.phone,
            order.shippingDetails.address,
            order.shippingDetails.city,
            order.shippingDetails.state,
            order.shippingDetails.zipCode,
            order.shippingDetails.deliveryDate ? formatDate(order.shippingDetails.deliveryDate) : '',
            order.shippingDetails.timeSlot || '',
            item.product?.title || item.title || 'N/A',
            item.quantity.toString(),
            displayOrderPrice(item.price, order.currency, order.currencyRate),
            displayOrderPrice(item.finalPrice, order.currency, order.currencyRate),
            displayOrderPrice(order.totalAmount, order.currency, order.currencyRate),
            order.status,
            order.paymentDetails.method,
            order.priority || 'normal'
          ]);
        });
      });

      const csvContent = rows
        .map(row =>
          row.map(cell => {
            const cellStr = String(cell);
            return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
              ? `"${cellStr.replace(/"/g, '""')}"`
              : cellStr;
          }).join(',')
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Orders exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        title: "Error",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'critical': 
        return (
          <div className="flex items-center gap-1 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider animate-pulse">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Urgent</span>
          </div>
        );
      case 'high': 
        return (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" />
            <span>High</span>
          </div>
        );
      case 'medium': 
        return (
          <div className="flex items-center gap-1 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            <span>Medium</span>
          </div>
        );
      default: 
        return null;
    }
  };

  const getWhatsAppLink = (phone: string, name: string, orderNumber: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCC = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Hello ${name}, this is Spring Blossoms Florist. We are reaching out regarding your order #${orderNumber}.`);
    return `https://wa.me/${phoneWithCC}?text=${message}`;
  };

  const renderUpcomingDeliveries = () => {
    if (!upcomingDeliveries) return null;

    const { stats } = upcomingDeliveries;

    const statItems = [
      { 
        label: 'Today', 
        value: stats.today, 
        desc: 'Urgent deliveries', 
        border: 'border-l-rose-500', 
        text: 'text-rose-600 dark:text-rose-400',
        bg: 'from-rose-50/20 to-transparent dark:from-rose-950/10',
        icon: <AlertTriangle className="h-6 w-6 text-rose-500" />
      },
      { 
        label: 'Tomorrow', 
        value: stats.tomorrow, 
        desc: 'High priority schedule', 
        border: 'border-l-amber-500', 
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'from-amber-50/20 to-transparent dark:from-amber-950/10',
        icon: <Clock className="h-6 w-6 text-amber-500" />
      },
      { 
        label: 'Next 3 Days', 
        value: stats.next3Days, 
        desc: 'Mid priority pipeline', 
        border: 'border-l-sky-500', 
        text: 'text-sky-600 dark:text-sky-400',
        bg: 'from-sky-50/20 to-transparent dark:from-sky-950/10',
        icon: <Calendar className="h-6 w-6 text-sky-500" />
      },
      { 
        label: 'This Week', 
        value: stats.total, 
        desc: 'Total active load', 
        border: 'border-l-emerald-500', 
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'from-emerald-50/20 to-transparent dark:from-emerald-950/10',
        icon: <Sparkles className="h-6 w-6 text-emerald-500" />
      }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statItems.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={cn(
              "bg-white dark:bg-slate-900 border-l-4 border-y border-r border-slate-100 dark:border-slate-800/80 rounded-xl p-4 shadow-sm flex items-center justify-between bg-gradient-to-br",
              item.border,
              item.bg
            )}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</span>
                <span className="text-xs text-slate-400">orders</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/40">
              {item.icon}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderActiveFilters = () => {
    const hasSearch = searchTerm !== '';
    const hasStatus = selectedStatus !== 'all';
    const hasOrderDate = dateRange.from !== undefined;
    const hasDeliveryDate = deliveryDateRange.from !== undefined;
    const hasFirstOrder = firstOrderFilter !== 'all';

    if (!hasSearch && !hasStatus && !hasOrderDate && !hasDeliveryDate && !hasFirstOrder) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Active Filters:</span>
        
        {hasSearch && (
          <Badge variant="secondary" className="gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1 pl-2.5 pr-1.5 border border-slate-100 dark:border-slate-700/55 rounded-lg">
            <span className="font-semibold">Search:</span> "{searchTerm}"
            <Button size="icon" variant="ghost" className="h-4 w-4 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" onClick={() => setSearchTerm('')}>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {hasStatus && (
          <Badge variant="secondary" className="gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1 pl-2.5 pr-1.5 border border-slate-100 dark:border-slate-700/55 rounded-lg">
            <span className="font-semibold">Status:</span> {getStatusConfig(selectedStatus).label}
            <Button size="icon" variant="ghost" className="h-4 w-4 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" onClick={() => setSelectedStatus('all')}>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {hasOrderDate && (
          <Badge variant="secondary" className="gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1 pl-2.5 pr-1.5 border border-slate-100 dark:border-slate-700/55 rounded-lg">
            <span className="font-semibold">Order Placed:</span> {format(dateRange.from!, "MMM d")} - {dateRange.to ? format(dateRange.to, "MMM d") : '...' }
            <Button size="icon" variant="ghost" className="h-4 w-4 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" onClick={() => setDateRange({ from: undefined, to: undefined })}>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {hasDeliveryDate && (
          <Badge variant="secondary" className="gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1 pl-2.5 pr-1.5 border border-slate-100 dark:border-slate-700/55 rounded-lg">
            <span className="font-semibold">Delivery Date:</span> {format(deliveryDateRange.from!, "MMM d")} - {deliveryDateRange.to ? format(deliveryDateRange.to, "MMM d") : '...' }
            <Button size="icon" variant="ghost" className="h-4 w-4 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" onClick={() => setDeliveryDateRange({ from: undefined, to: undefined })}>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {hasFirstOrder && (
          <Badge variant="secondary" className="gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1 pl-2.5 pr-1.5 border border-slate-100 dark:border-slate-700/55 rounded-lg">
            <span className="font-semibold">Delivery Charge:</span> {firstOrderFilter === 'applied' ? 'First Order Free' : 'Standard Charge'}
            <Button size="icon" variant="ghost" className="h-4 w-4 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" onClick={() => setFirstOrderFilter('all')}>
              <X className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </Badge>
        )}

        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2.5 text-xs text-rose-500 hover:text-rose-600 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg">
          Clear all filters
        </Button>
      </div>
    );
  };

  const renderPaginationControls = () => {
    if (!paginationInfo) return null;

    const {
      currentPage: current,
      totalPages,
      hasNextPage,
      hasPrevPage,
      startIndex,
      endIndex,
      totalItems
    } = paginationInfo;

    const pageNumbers = generatePageNumbers();

    return (
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mt-6 px-4 py-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startIndex}-{endIndex}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> orders
          </div>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-full sm:w-36 h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-center lg:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={!hasPrevPage}
            className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current - 1)}
            disabled={!hasPrevPage}
            className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === current ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={cn(
                "h-8 w-8 p-0 rounded-lg text-xs font-semibold",
                pageNum === current 
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent" 
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {pageNum}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current + 1)}
            disabled={!hasNextPage}
            className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={!hasNextPage}
            className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStatusDropdown = (orderId: string, currentStatus: string) => {
    const statusCfg = getStatusConfig(currentStatus);
    return (
      <Select
        value={currentStatus}
        onValueChange={(value) => handleStatusUpdate(orderId, value as Order['status'])}
      >
        <SelectTrigger className="border-0 p-0 h-auto w-auto bg-transparent focus:ring-0 focus:ring-offset-0">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.03]",
            statusCfg.bg,
            statusCfg.border,
            statusCfg.text
          )}>
            {statusCfg.icon}
            <span>{statusCfg.label}</span>
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
          <SelectItem value="order_placed" className="text-xs">Order Placed</SelectItem>
          <SelectItem value="received" className="text-xs">Received</SelectItem>
          <SelectItem value="being_made" className="text-xs">Being Made</SelectItem>
          <SelectItem value="out_for_delivery" className="text-xs">Out for Delivery</SelectItem>
          <SelectItem value="delivered" className="text-xs">Delivered</SelectItem>
          <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const pageSizeOptions = [
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>💐</span> Order Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your boutique floral orders, track schedules, and handle customer communication.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Switcher */}
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-24 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code} className="text-xs">
                  {curr.code} ({curr.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={exportToCSV} variant="outline" size="sm" className="h-9 gap-2 text-xs border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button 
            onClick={testDeliveryEmail} 
            variant="outline"
            size="sm"
            className="h-9 gap-2 text-xs border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300"
            disabled={!orders.length}
          >
            <Mail className="h-4 w-4 text-blue-500" />
            Test Email
          </Button>
        </div>
      </div>

      {/* Upcoming Deliveries Dashboard */}
      {renderUpcomingDeliveries()}

      {/* Control Card (Filters & Toggles) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Filters Top Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search by ID, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-700"
            />
            {searchTerm && (
              <Button size="icon" variant="ghost" className="absolute right-1 top-1.5 h-6.5 w-6.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={() => setSearchTerm('')}>
                <X className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Filter className="h-3.5 w-3.5 opacity-60" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="order_placed" className="text-xs">Order Placed</SelectItem>
              <SelectItem value="received" className="text-xs">Received</SelectItem>
              <SelectItem value="being_made" className="text-xs">Being Made</SelectItem>
              <SelectItem value="out_for_delivery" className="text-xs">Out for Delivery</SelectItem>
              <SelectItem value="delivered" className="text-xs">Delivered</SelectItem>
              <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Order Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 justify-start text-left font-normal text-xs bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl w-full",
                  !dateRange.from && !dateRange.to && "text-slate-400 dark:text-slate-500"
                )}
              >
                <Calendar className="mr-2 h-3.5 w-3.5 opacity-60 text-slate-600 dark:text-slate-300" />
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "MM/dd")} - ${format(dateRange.to, "MM/dd")}`
                  : "Order Placed Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-auto p-0 border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 shadow-xl z-dropdown">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ 
                  from: range?.from, 
                  to: range?.to 
                })}
                numberOfMonths={2}
                className="p-3"
              />
            </PopoverContent>
          </Popover>

          {/* Delivery Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 justify-start text-left font-normal text-xs bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl w-full",
                  !deliveryDateRange.from && !deliveryDateRange.to && "text-slate-400 dark:text-slate-500"
                )}
              >
                <Calendar className="mr-2 h-3.5 w-3.5 opacity-60 text-slate-600 dark:text-slate-300" />
                {deliveryDateRange.from && deliveryDateRange.to
                  ? `${format(deliveryDateRange.from, "MM/dd")} - ${format(deliveryDateRange.to, "MM/dd")}`
                  : "Delivery Schedule Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-auto p-0 border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 shadow-xl z-dropdown">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={deliveryDateRange.from}
                selected={{ from: deliveryDateRange.from, to: deliveryDateRange.to }}
                onSelect={(range) => setDeliveryDateRange({ 
                  from: range?.from, 
                  to: range?.to 
                })}
                numberOfMonths={2}
                className="p-3"
              />
            </PopoverContent>
          </Popover>

          {/* First Order Free Filter */}
          <Select value={firstOrderFilter} onValueChange={setFirstOrderFilter}>
            <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Truck className="h-3.5 w-3.5 opacity-60" />
                <SelectValue placeholder="Delivery Fee" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectItem value="all" className="text-xs">All Delivery Fees</SelectItem>
              <SelectItem value="applied" className="text-xs">First Order Free</SelectItem>
              <SelectItem value="standard" className="text-xs">Standard Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters Action Row & View Toggles */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
          <div className="flex items-center gap-3">
            <Button
              variant={highlight3Days ? "default" : "outline"}
              size="sm"
              onClick={() => setHighlight3Days(!highlight3Days)}
              className={cn(
                "h-8 gap-2 text-xs font-semibold rounded-lg",
                highlight3Days 
                  ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 border-transparent shadow-sm" 
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              )}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>3-Day Highlighting</span>
            </Button>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <div className="text-xs text-slate-500 font-medium">
              {paginationInfo ? (
                <span>
                  Page <span className="font-semibold text-slate-700 dark:text-slate-200">{paginationInfo.currentPage}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{paginationInfo.totalPages}</span>
                </span>
              ) : (
                <span>{orders.length} orders</span>
              )}
            </div>

            {/* Layout Toggle */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl flex items-center border border-slate-200/40 dark:border-slate-800/40">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewModeChange('table')}
                className={cn(
                  "h-7 w-7 rounded-lg p-0 hover:bg-transparent",
                  viewMode === 'table' 
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                )}
                title="Table List View"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewModeChange('cards')}
                className={cn(
                  "h-7 w-7 rounded-lg p-0 hover:bg-transparent",
                  viewMode === 'cards' 
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                )}
                title="Detailed Cards Grid View"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active tags */}
        {renderActiveFilters()}
      </div>

      {/* Main Content Display */}
      <div>
        {isLoading ? (
          /* Loading skeletons */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                  <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                    <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                    <div className="h-4 w-44 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                    <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm"
          >
            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No orders found</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              There are no orders that match your current search query or filter tags. Try resetting your filters.
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 border-slate-200 dark:border-slate-800 rounded-xl">
              Reset Filters
            </Button>
          </motion.div>
        ) : viewMode === 'table' ? (
          /* Premium Table View with desktop focus, responsive wrapper */
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[65rem]">
                <TableHeader className="bg-slate-50/75 dark:bg-slate-900/50">
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                     <TableHead className="w-40 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider h-11">Order</TableHead>
                    <TableHead className="w-56 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider h-11">Customer</TableHead>
                    <TableHead className="w-44 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider h-11">Order Placed</TableHead>
                    <TableHead className="w-60 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider h-11">Delivery Schedule</TableHead>
                    <TableHead className="w-40 text-right font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider h-11">Delivery Fee</TableHead>
                    <TableHead className="w-44 text-right font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider h-11">Amount</TableHead>
                    <TableHead className="w-44 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider h-11">Status</TableHead>
                    <TableHead className="w-28 text-right font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider h-11">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {orders.map((order) => (
                      <motion.tr
                        key={order._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "group border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors",
                          order.deliveryHighlight?.bgColor
                        )}
                      >
                        {/* Order ID & Priority */}
                        <TableCell className="align-middle font-medium py-3.5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">{order.orderNumber}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                onClick={(e) => handleCopyId(order._id, order.orderNumber, e)}
                                title="Copy Database ID"
                              >
                                {copiedOrderId === order._id ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {getPriorityIcon(order.priority)}
                              {order.deliveryHighlight && (
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-[10px] py-0 px-1.5 h-4.5 font-semibold leading-normal capitalize bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/60 shadow-sm", order.deliveryHighlight.textColor)}
                                >
                                  {order.deliveryHighlight.message}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="align-middle py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{order.shippingDetails.fullName}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate max-w-[13.5rem] mt-0.5">{order.shippingDetails.email}</span>
                            <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a 
                                href={`tel:${order.shippingDetails.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850"
                                title="Call Customer"
                              >
                                <Phone className="h-3 w-3" />
                              </a>
                              <a 
                                href={getWhatsAppLink(order.shippingDetails.phone, order.shippingDetails.fullName, order.orderNumber)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/20 text-green-600 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-100/40 dark:hover:bg-green-900/30"
                                title="WhatsApp Customer"
                              >
                                <MessageSquare className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </TableCell>

                        {/* Order Placed */}
                        <TableCell className="align-middle py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(order.createdAt)}
                        </TableCell>

                        {/* Delivery Schedule */}
                        <TableCell className="align-middle py-3.5">
                          <div className="flex flex-col space-y-0.5">
                            {order.shippingDetails.deliveryDate ? (
                              <>
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs.5 flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  {format(new Date(order.shippingDetails.deliveryDate), 'MMMM d, yyyy')}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-max mt-1">
                                  {formatTimeSlot(order.shippingDetails.timeSlot)}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Not scheduled</span>
                            )}
                          </div>
                        </TableCell>

                         {/* Delivery Charge */}
                        <TableCell className="align-middle text-right py-3.5">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {order.isFirstOrderFreeDelivery ? (
                                <span className="text-emerald-600 font-extrabold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/40 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap animate-pulse">
                                  FREE
                                </span>
                              ) : (
                                displayOrderPrice(order.deliveryCharge ?? 150, order.currency, order.currencyRate)
                              )}
                            </span>
                            {order.isFirstOrderFreeDelivery && (
                              <Badge className="text-[9px] py-0 px-1 font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 border-transparent shadow-none scale-90 origin-right whitespace-nowrap">
                                First Order Free
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Total Amount */}
                        <TableCell className="align-middle text-right py-3.5">
                          <div className="flex flex-col items-end">
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {displayOrderPrice(order.totalAmount, order.currency, order.currencyRate)}
                            </span>
                            {order.currency && order.currency !== currency && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Orig: {formatPriceWithCurrency(order.totalAmount, order.currency)}
                              </span>
                            )}
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider py-0 px-1 font-semibold border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50/50 mt-1 leading-normal h-4">
                              {order.paymentDetails.method === 'razorpay' ? 'Online' : order.paymentDetails.method || 'COD'}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Status Dropdown */}
                        <TableCell className="align-middle py-3.5">
                          {renderStatusDropdown(order._id, order.status)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="align-middle text-right py-3.5">
                          <div className="flex justify-end gap-2">
                            {order.status === 'delivered' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendReviewEmail(order._id, order.orderNumber)}
                                disabled={emailSendingOrderId === order._id}
                                className="h-8 gap-1.5 text-xs text-rose-700 hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200/70 dark:border-rose-900/30 bg-white dark:bg-slate-900 font-semibold"
                              >
                                {emailSendingOrderId === order._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Mail className="h-3.5 w-3.5 text-rose-500" />
                                )}
                                Review Email
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order._id)}
                              className="h-8 gap-1.5 text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {renderPaginationControls()}
          </div>
        ) : (
          /* Premium Cards Grid View (extremely responsive, default on mobile/tablet) */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {orders.map((order, idx) => {
                  const isExpanded = expandedCards[order._id] || false;
                  const totalItemsQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const statusCfg = getStatusConfig(order.status);

                  return (
                    <motion.div
                      key={order._id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25, delay: idx * 0.02 }}
                      className={cn(
                        "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shadow-sm hover:shadow-md rounded-2xl p-5 flex flex-col relative overflow-hidden transition-all duration-300 hover:border-slate-200/80 dark:hover:border-slate-800/80",
                        order.deliveryHighlight?.bgColor
                      )}
                    >
                      {/* Left vertical visual marker */}
                      <div className={cn("absolute left-0 top-0 bottom-0 w-1", statusCfg.glow)} />

                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-950 dark:text-white text-base tracking-tight">{order.orderNumber}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                              onClick={(e) => handleCopyId(order._id, order.orderNumber, e)}
                              title="Copy Database ID"
                            >
                              {copiedOrderId === order._id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Placed {formatDate(order.createdAt)}</p>
                        </div>
                        {/* Status Select Badge */}
                        {renderStatusDropdown(order._id, order.status)}
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {getPriorityIcon(order.priority)}
                        {order.deliveryHighlight && (
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] py-0.5 px-2 font-semibold shadow-xs bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800", order.deliveryHighlight.textColor)}
                          >
                            {order.deliveryHighlight.message}
                          </Badge>
                        )}
                      </div>

                      {/* Middle Body split info */}
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                        {/* Customer */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</span>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{order.shippingDetails.fullName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{order.shippingDetails.email}</p>
                          
                          {/* Quick call/WhatsApp */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <a 
                              href={`tel:${order.shippingDetails.phone}`}
                              className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800"
                              title="Call customer"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                            <a 
                              href={getWhatsAppLink(order.shippingDetails.phone, order.shippingDetails.fullName, order.orderNumber)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-green-200 dark:border-green-900/20 bg-green-50/50 dark:bg-green-950/10 text-green-600 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-100/40 dark:hover:bg-green-900/20"
                              title="WhatsApp message"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </a>
                          </div>
                        </div>

                        {/* Delivery date & slot */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Schedule</span>
                          {order.shippingDetails.deliveryDate ? (
                            <>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {format(new Date(order.shippingDetails.deliveryDate), 'MMM d, yyyy')}
                              </p>
                              <span className="inline-block text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1.5">
                                {formatTimeSlot(order.shippingDetails.timeSlot)}
                              </span>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Not set</p>
                          )}
                        </div>
                      </div>

                      {/* Products preview (Collapsible) */}
                      <div className="py-3.5 border-b border-slate-100 dark:border-slate-800/50">
                        <button 
                          onClick={(e) => toggleExpandCard(order._id, e)}
                          className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          <span>Products summary ({totalItemsQty} {totalItemsQty === 1 ? 'item' : 'items'})</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] normal-case font-semibold text-slate-500 dark:text-slate-400">{isExpanded ? 'Hide details' : 'Show details'}</span>
                            <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isExpanded && "transform rotate-180")} />
                          </div>
                        </button>
                        
                        <div className="space-y-1.5 mt-2">
                          {!isExpanded ? (
                            // Compact Preview
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                              {order.items.map(item => `${item.product?.title || item.title || 'Product'} (x${item.quantity})`).join(', ')}
                            </div>
                          ) : (
                            // Expanded list with images, customizations, prices
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-3 pt-1 overflow-hidden"
                            >
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-2.5 items-start bg-slate-50/50 dark:bg-slate-950/40 p-2 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                                  {/* Product Thumbnail */}
                                  {item.product?.images && item.product.images.length > 0 ? (
                                    <img 
                                      src={item.product.images[0]} 
                                      alt={item.product.title} 
                                      className="h-10 w-10 object-cover rounded-lg border border-slate-200/60 dark:border-slate-800"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200/40">
                                      <Package className="h-5 w-5 text-slate-400" />
                                    </div>
                                  )}

                                  {/* Item metadata */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.product?.title || item.title || 'Floral Arrangement'}</p>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mt-0.5">
                                      <span>Qty: {item.quantity}</span>
                                      <span>{displayOrderPrice(item.finalPrice || item.price, order.currency, order.currencyRate)}</span>
                                    </div>

                                    {/* Customizations summary */}
                                    {item.customizations && (
                                      <div className="mt-1.5 space-y-1 border-t border-slate-200/30 dark:border-slate-800/30 pt-1">
                                        {item.customizations.messageCard && (
                                          <div className="text-[9px] text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/15 p-1 rounded font-medium">
                                            💌 msg: "{item.customizations.messageCard}"
                                          </div>
                                        )}
                                        {item.customizations.photo && (
                                          <div className="text-[9px] text-blue-700 dark:text-blue-400 font-medium">
                                            📸 Photo Customization Attached
                                          </div>
                                        )}
                                        {(item.customizations.selectedFlowers?.length > 0 || item.customizations.selectedChocolates?.length > 0) && (
                                          <div className="text-[9px] text-pink-700 dark:text-pink-400 font-medium">
                                            🌸 Includes floral/chocolate add-ons
                                          </div>
                                        )}
                                        {item.customizations.isGiftBundle && (
                                          <div className="text-[9px] text-rose-700 dark:text-rose-400 font-medium bg-rose-50/50 dark:bg-rose-950/20 p-1 rounded">
                                            🎁 Custom Valentine Gift Box ({item.customizations.giftComponents?.length || 0} items)
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer actions */}
                      <div className="flex justify-between items-center pt-4 mt-auto">
                        <div className="flex items-center gap-4 text-left">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Fee</span>
                            <span className="text-xs font-semibold text-slate-850 dark:text-slate-200">
                              {order.isFirstOrderFreeDelivery ? (
                                <span className="text-emerald-600 font-extrabold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/40 px-1 py-0.5 rounded text-[9px] whitespace-nowrap">
                                  FREE
                                </span>
                              ) : (
                                displayOrderPrice(order.deliveryCharge ?? 150, order.currency, order.currencyRate)
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                            <span className="text-base font-extrabold text-slate-950 dark:text-white">
                              {displayOrderPrice(order.totalAmount, order.currency, order.currencyRate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {order.status === 'delivered' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendReviewEmail(order._id, order.orderNumber)}
                              disabled={emailSendingOrderId === order._id}
                              className="h-8 gap-1.5 text-xs text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200/50 dark:border-rose-900/30 bg-white dark:bg-slate-900 font-bold px-3.5 shadow-sm"
                            >
                              {emailSendingOrderId === order._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Mail className="h-3.5 w-3.5 text-rose-500" />
                              )}
                              Review Email
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(order._id)}
                            className="h-8 gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold px-3.5 shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {/* Pagination */}
            {renderPaginationControls()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
