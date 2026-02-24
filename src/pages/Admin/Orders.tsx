import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Eye, Download, Calendar, Clock, AlertTriangle, Filter, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import api from '@/services/api';
import { Order } from '@/services/orderService';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const AdminOrders = () => {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [highlight3Days, setHighlight3Days] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);

  const { toast } = useToast();
  const {
    formatPrice, convertPrice, currency, setCurrency, rate, setRate
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

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' },
  ];

  const navigate = useNavigate();

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
    // Always convert and display in the current selected currency
    let finalAmount = amount;
    
    console.log('DisplayOrderPrice:', { amount, orderCurrency, orderRate, currentCurrency: currency });
    
    if (orderCurrency && orderCurrency !== currency) {
      // Order is in different currency, need to convert
      if (orderCurrency === 'INR' && currency !== 'INR') {
        // Convert from INR to selected currency (e.g., INR 1000 → USD 11.62)
        finalAmount = convertPrice(amount);
      } else if (orderCurrency !== 'INR' && currency === 'INR') {
        // Convert from foreign currency to INR (e.g., USD 32 → INR 2770.415)
        if (orderRate) {
          // orderRate is the rate when the order was placed (e.g., USD rate = 0.01162)
          // To convert USD to INR: USD amount ÷ USD rate = INR amount
          // So $32 ÷ 0.01162 = ₹2753.44
          finalAmount = amount / orderRate;
        } else {
          // Fallback: use current USD to INR rate
          finalAmount = amount / 0.01162; // USD to INR
        }
      } else if (orderCurrency !== 'INR' && currency !== 'INR') {
        // Convert from one foreign currency to another via INR
        if (orderRate) {
          const amountInINR = amount / orderRate;
          finalAmount = convertPrice(amountInINR);
        }
      }
    } else if (!orderCurrency) {
      // No order currency specified, assume INR and convert
      finalAmount = convertPrice(amount);
    }
    
    console.log('Final amount after conversion:', finalAmount);
    
    // Format in the current selected currency with correct symbol
    return formatPriceWithCurrency(finalAmount, currency);
  };

  const currencies = [
    { code: 'INR', symbol: '₹', rate: 1 },
    { code: 'USD', symbol: '$', rate: 0.01162 },
    { code: 'EUR', symbol: '€', rate: 0.011 },
    { code: 'GBP', symbol: '£', rate: 0.0096 },
  ];

  // Force refresh when currency changes to update displayed prices
  useEffect(() => {
    // Only refresh if we have orders and currency is changing
    if (orders.length > 0) {
      console.log('Currency changed to:', currency, 'forcing re-render');
      // Force component re-render by updating a dummy state or triggering a refresh
      setOrders(prev => [...prev]); // This forces a re-render
    }
  }, [currency]);

  useEffect(() => {
    fetchOrders();
    fetchUpcomingDeliveries();
  }, [selectedStatus, dateRange, deliveryDateRange, searchTerm, highlight3Days, currentPage, pageSize]);

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

      console.log('Fetching orders with params:', params.toString());

      const response = await api.get(`/orders?${params.toString()}`);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setPaginationInfo(response.data.pagination);
        console.log('Pagination info:', response.data.pagination);
      } else {
        // Fallback for old API response format
        setOrders(response.data);
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

  const handleViewDetails = (order: Order) => {
    navigate(`/admin/orders/${order._id}`);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      if (response.data) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        
        // Show success message
        toast({
          title: "Success",
          description: `Order status updated to ${getStatusDisplayName(newStatus)} successfully.`,
        });
        
        // If status is delivered, show special notification
        if (newStatus === 'delivered') {
          toast({
            title: "🎉 Order Delivered!",
            description: "Delivery confirmation email with invoice has been sent to the customer.",
            variant: "default",
          });
        }
        
        // Refresh upcoming deliveries
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
    } catch (error) {
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
    setCurrentPage(1);
    setActiveFilters([]);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    if (!paginationInfo) return [];
    
    const { currentPage, totalPages } = paginationInfo;
    const pages = [];
    const showPages = 5; // Show 5 page numbers at a time
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    // Adjust if we're near the end
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
            item.product.name || item.product.title,
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'order_placed': return 'outline';
      case 'received': return 'secondary';
      case 'being_made': return 'default';
      case 'out_for_delivery': return 'secondary';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      // Legacy status support
      case 'pending': return 'outline';
      case 'processing': return 'default';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'order_placed': return 'Order Placed';
      case 'received': return 'Received';
      case 'being_made': return 'Being Made';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      // Legacy status support
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_placed': return 'text-blue-600 bg-blue-50';
      case 'received': return 'text-purple-600 bg-purple-50';
      case 'being_made': return 'text-orange-600 bg-orange-50';
      case 'out_for_delivery': return 'text-indigo-600 bg-indigo-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Calendar className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const renderUpcomingDeliveries = () => {
    if (!upcomingDeliveries) return null;

    const { stats, groupedOrders } = upcomingDeliveries;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Today</p>
              <p className="text-2xl font-bold text-red-800">{stats.today}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-xs text-red-600 mt-1">Urgent deliveries</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Tomorrow</p>
              <p className="text-2xl font-bold text-orange-800">{stats.tomorrow}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-1">High priority</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Next 3 Days</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.next3Days}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xs text-yellow-600 mt-1">Medium priority</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">This Week</p>
              <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-1">Total upcoming</p>
        </motion.div>
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mt-6 px-3 sm:px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex}-{endIndex} of {totalItems} orders
            </div>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={!hasPrevPage}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current - 1)}
            disabled={!hasPrevPage}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === current ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className="h-8 w-8 p-0"
            >
              {pageNum}
            </Button>
          ))}

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current + 1)}
            disabled={!hasNextPage}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={!hasNextPage}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Deliveries Dashboard */}
      {renderUpcomingDeliveries()}

      <Card>
        <CardHeader className="pb-4">
          <div className="responsive-toolbar">
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Order Management
            </CardTitle>
            <div className="flex w-full md:w-auto flex-wrap items-center gap-2">
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full sm:w-24">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToCSV} variant="outline" className="gap-2 touch-action-btn">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                onClick={testDeliveryEmail} 
                variant="outline" 
                className="gap-2 touch-action-btn"
                disabled={!orders.length}
              >
                📧 Test Email
              </Button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="responsive-filter-grid mt-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="order_placed">Order Placed</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="being_made">Being Made</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Order Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "MM/dd")} - ${format(dateRange.to, "MM/dd")}`
                    : "Order Date Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" sideOffset={8} className="w-auto max-w-[92vw] p-0">
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
                />
              </PopoverContent>
            </Popover>

            {/* Delivery Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !deliveryDateRange.from && !deliveryDateRange.to && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {deliveryDateRange.from && deliveryDateRange.to
                    ? `${format(deliveryDateRange.from, "MM/dd")} - ${format(deliveryDateRange.to, "MM/dd")}`
                    : "Delivery Date Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" sideOffset={8} className="w-auto max-w-[92vw] p-0">
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={highlight3Days ? "default" : "outline"}
                size="sm"
                onClick={() => setHighlight3Days(!highlight3Days)}
                className="gap-2 touch-action-btn"
              >
                <AlertTriangle className="h-4 w-4" />
                3-Day Highlighting
              </Button>
              {(dateRange.from || deliveryDateRange.from || searchTerm || selectedStatus !== 'all') && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 touch-action-btn">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {paginationInfo ? (
                <span>
                  Page {paginationInfo.currentPage} of {paginationInfo.totalPages} 
                  ({paginationInfo.totalItems} total orders)
                </span>
              ) : (
                <span>Showing {orders.length} orders</span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="responsive-table-wrap">
                <Table key={currency}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Total ({currency})</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {orders.map((order) => (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "group hover:bg-gray-50 transition-colors",
                            order.deliveryHighlight?.bgColor
                          )}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(order.priority)}
                              <div>
                                <p className="font-semibold">{order.orderNumber}</p>
                                {order.deliveryHighlight && (
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs", order.deliveryHighlight.textColor)}
                                  >
                                    {order.deliveryHighlight.message}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.shippingDetails.fullName}</p>
                              <p className="text-sm text-gray-500">{order.shippingDetails.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div>
                              {order.shippingDetails.deliveryDate ? (
                                <>
                                  <p className="font-medium">
                                    {formatDate(order.shippingDetails.deliveryDate)}
                                  </p>
                                  {order.shippingDetails.timeSlot && (
                                    <p className="text-sm text-gray-500">
                                      {order.shippingDetails.timeSlot}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400">Not set</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-right">
                              <div className="font-semibold">
                                {displayOrderPrice(order.totalAmount, order.currency, order.currencyRate)}
                              </div>
                              {order.currency && order.currency !== currency && (
                                <div className="text-xs text-gray-500">
                                  Originally {formatPriceWithCurrency(order.totalAmount, order.currency)}
                                </div>
                              )}
                              <div className="text-xs text-gray-400">
                                Showing in {currency}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusUpdate(order._id, value as Order['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                  {getStatusDisplayName(order.status)}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="order_placed">Order Placed</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="being_made">Being Made</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {renderPaginationControls()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
