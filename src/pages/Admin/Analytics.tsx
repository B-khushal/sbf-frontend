import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Line, 
  LineChart, 
  Area, 
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Zap,
  RefreshCw,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Heart,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Gift,
  MapPin,
  Tag,
  Eye,
  Percent,
  Sliders,
  TrendingUp as SparklineIcon
} from 'lucide-react';
import api from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Curated Sleek Dark/Light Harmony Theme colors
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e'];
const SUCCESS_COLOR = '#10b981';
const WARNING_COLOR = '#f59e0b';
const ERROR_COLOR = '#ef4444';
const PRIMARY_COLOR = '#6366f1';
const SECONDARY_COLOR = '#3b82f6';

interface InsightItem {
  text: string;
  type: 'success' | 'warning' | 'info';
  metric: string;
}

interface AnalyticsData {
  revenue: {
    total: number;
    grossSales: number;
    netRevenue: number;
    averageOrderValue: number;
    growth: number;
    revenueToday: number;
    revenueYesterday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    revenueThisYear: number;
    pendingRevenue: number;
    refundedRevenue: number;
    cancelledOrderValue: number;
    deliveredOrderRevenue: number;
    daily: Array<{ date: string; amount: number; orders: number }>;
    monthly: Array<{ month: string; amount: number; orders: number }>;
    breakdown: Array<{ category: string; amount: number; percentage: number }>;
    comparisons: {
      today: { current: number; previous: number; growth: number };
      week: { current: number; previous: number; growth: number };
      month: { current: number; previous: number; growth: number };
      year: { current: number; previous: number; growth: number };
    };
  };
  sales: {
    total: number;
    growth: number;
    conversion: number;
    averageOrderValue: number;
    todayOrders: number;
    pendingOrders: number;
    processingOrders: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    failedPayments: number;
    orderSuccessRate: number;
    cancellationRate: number;
    refundRate: number;
    averageProcessingTime: number;
    averageDeliveryTime: number;
    ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
    ordersByHour: Array<{ hour: string; orders: number; revenue: number }>;
    weekdaySales: Array<{ day: string; orders: number; revenue: number }>;
    paymentBreakdown: Array<{ method: string; transactions: number; revenue: number; successRate: number; failureRate: number }>;
    couponStats: {
      couponsUsed: number;
      totalDiscountGiven: number;
      mostUsedCoupon: string;
      couponConversionRate: number;
    };
  };
  products: {
    total: number;
    sold: number;
    active: number;
    outOfStock: number;
    lowStock: number;
    hidden: number;
    draft: number;
    topSelling: Array<{ id: string; name: string; sold: number; revenue: number; category: string }>;
    leastSelling: Array<{ id: string; name: string; sold: number; revenue: number; category: string }>;
    mostViewed: Array<{ id: string; name: string; views: number; sold: number; conversion: number }>;
    mostWishlisted: Array<{ id: string; name: string; wishlisted: number }>;
    mostAddedToCart: Array<{ id: string; name: string; carted: number }>;
    highestRevenueProduct: string;
    bestPerformingCategory: string;
    lowestPerformingCategory: string;
    categories: Array<{ name: string; products: number; revenue: number; orders: number; percentage: number }>;
    inventoryStats: {
      stockValue: number;
      lowStockCount: number;
      outOfStockCount: number;
      fastMoving: Array<any>;
      slowMoving: Array<any>;
    };
  };
  users: {
    total: number;
    active: number;
    newUsers: number;
    newUsersToday: number;
    returning: number;
    guestCustomers: number;
    registeredCustomers: number;
    retention: number;
    repeatPurchaseRate: number;
    clv: number;
    ordersPerCustomer: number;
    topSpending: Array<{ name: string; email: string; totalSpent: number; orderCount: number }>;
    demographics: Array<{ location: string; users: number; percentage: number }>;
    activity: Array<{ date: string; users: number; sessions: number }>;
    geographicDetails: Array<{ city: string; state: string; orders: number; revenue: number; customers: number }>;
  };
  performance: {
    pageViews: number;
    bounceRate: number;
    averageSessionTime: number;
    conversionRate: number;
    topPages: Array<{ page: string; views: number; time: number }>;
    devices: Array<{ device: string; users: number; percentage: number }>;
    insights: Array<InsightItem>;
    giftAnalytics: {
      giftOrders: number;
      selfOrders: number;
      anonymousGifts: number;
      surpriseDeliveries: number;
      greetingCardUsage: number;
      occasions: Array<{ occasion: string; count: number }>;
    };
  };
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('0'); // 0 = disabled
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalyticsData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      
      let queryParams = `?period=${dateRange}`;
      if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please specify both Start Date and End Date for custom filters."
          });
          setRefreshing(false);
          return;
        }
        queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const [
        revenueRes,
        salesRes,
        productsRes,
        usersRes,
        performanceRes
      ] = await Promise.all([
        api.get(`/analytics/revenue${queryParams}`),
        api.get(`/analytics/sales${queryParams}`),
        api.get(`/analytics/products${queryParams}`),
        api.get(`/analytics/users${queryParams}`),
        api.get(`/analytics/performance${queryParams}`)
      ]);

      setAnalyticsData({
        revenue: revenueRes.data,
        sales: salesRes.data,
        products: productsRes.data,
        users: usersRes.data,
        performance: performanceRes.data
      });

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());

      if (showToast) {
        toast({
          title: "Dashboard Synchronized",
          description: `Analytics updated successfully at ${now.toLocaleTimeString()}`,
        });
      }
    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      toast({
        variant: "destructive",
        title: "Synchronization Failed",
        description: error.response?.data?.message || "Failed to establish database analytics data connection.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, customStartDate, customEndDate, toast]);

  // Handle Polling Auto Refresh
  useEffect(() => {
    fetchAnalyticsData();

    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    const intervalVal = parseInt(autoRefreshInterval);
    if (intervalVal > 0) {
      refreshTimerRef.current = setInterval(() => {
        fetchAnalyticsData(false);
      }, intervalVal * 1000);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchAnalyticsData, autoRefreshInterval]);

  // Export handlers
  const handleCSVExport = () => {
    if (!analyticsData) return;
    
    // Format tabular data
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Admin Business Intelligence Report\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Period: ${dateRange === 'custom' ? `${customStartDate} to ${customEndDate}` : dateRange}\n\n`;

    // Section 1: Financial Overview
    csvContent += "FINANCIAL SUMMARY\n";
    csvContent += `Total Revenue (INR),${analyticsData.revenue.total}\n`;
    csvContent += `Gross Sales (INR),${analyticsData.revenue.grossSales}\n`;
    csvContent += `Net Revenue (INR),${analyticsData.revenue.netRevenue}\n`;
    csvContent += `Average Order Value (INR),${analyticsData.revenue.averageOrderValue}\n`;
    csvContent += `Pending Orders Revenue,${analyticsData.revenue.pendingRevenue}\n`;
    csvContent += `Cancelled Orders Value,${analyticsData.revenue.cancelledOrderValue}\n\n`;

    // Section 2: Best Selling Products
    csvContent += "TOP PERFORMING PRODUCTS\n";
    csvContent += "Rank,Product Name,Sold Count,Revenue,Category\n";
    analyticsData.products.topSelling.forEach((p, idx) => {
      csvContent += `${idx+1},"${p.name.replace(/"/g, '""')}",${p.sold},${p.revenue},${p.category}\n`;
    });
    csvContent += "\n";

    // Section 3: Geographic Distribution
    csvContent += "GEOGRAPHIC SALES\n";
    csvContent += "City,State,Orders Count,Revenue\n";
    analyticsData.users.geographicDetails.forEach(g => {
      csvContent += `"${g.city}","${g.state}",${g.orders},${g.revenue}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SBF_Analytics_Report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Complete", description: "CSV report downloaded successfully." });
  };

  const handleExcelExport = () => {
    if (!analyticsData) return;

    let excelHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /><style>table { border-collapse: collapse; } td, th { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; font-weight: bold; }</style></head>
      <body>
        <h2>SBF Florist eCommerce Analytics Report</h2>
        <p><strong>Time Filter:</strong> ${dateRange.toUpperCase()}</p>
        <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>
        
        <h3>1. Key Performance Indicators</h3>
        <table>
          <tr><th>Metric</th><th>Calculated Value</th></tr>
          <tr><td>Total Lifetime Revenue</td><td>₹${analyticsData.revenue.total.toFixed(2)}</td></tr>
          <tr><td>Gross Sales</td><td>₹${analyticsData.revenue.grossSales.toFixed(2)}</td></tr>
          <tr><td>Net Sales (Period)</td><td>₹${analyticsData.revenue.netRevenue.toFixed(2)}</td></tr>
          <tr><td>Average Order Value (AOV)</td><td>₹${analyticsData.revenue.averageOrderValue.toFixed(2)}</td></tr>
          <tr><td>Total Orders (Period)</td><td>${analyticsData.sales.total}</td></tr>
          <tr><td>Order Success Rate</td><td>${analyticsData.sales.orderSuccessRate}%</td></tr>
        </table>
        
        <h3>2. Top Selling Products</h3>
        <table>
          <tr><th>Rank</th><th>Product Name</th><th>Category</th><th>Sold Quantity</th><th>Revenue</th></tr>
    `;

    analyticsData.products.topSelling.forEach((p, idx) => {
      excelHTML += `<tr><td>${idx+1}</td><td>${p.name}</td><td>${p.category}</td><td>${p.sold}</td><td>₹${p.revenue.toFixed(2)}</td></tr>`;
    });

    excelHTML += `
        </table>
        <h3>3. Payment Gateways Performance</h3>
        <table>
          <tr><th>Method</th><th>Transactions</th><th>Revenue</th><th>Success Rate</th><th>Failure Rate</th></tr>
    `;

    analyticsData.sales.paymentBreakdown.forEach(p => {
      excelHTML += `<tr><td>${p.method}</td><td>${p.transactions}</td><td>₹${p.revenue.toFixed(2)}</td><td>${p.successRate}%</td><td>${p.failureRate}%</td></tr>`;
    });

    excelHTML += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SBF_Analytics_Report_${dateRange}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Complete", description: "Excel report compiled and downloaded." });
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-2" />
        <span className="text-slate-600 font-medium">Crunching database records...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 text-center max-w-md mx-auto my-12 bg-white rounded-2xl shadow-xl border">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Aggregation Failed</h3>
        <p className="text-muted-foreground mb-6">Unable to synchronize analytics calculations from Mongo DB tables.</p>
        <Button onClick={() => fetchAnalyticsData()} className="bg-indigo-600 hover:bg-indigo-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto transition-all duration-300 print:p-0">
      
      {/* Header bar */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 tracking-tight text-slate-800">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            Admin BI Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Real-time, data-driven analytics audited directly from database collections.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Configurable Auto-Refresh */}
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <Select value={autoRefreshInterval} onValueChange={setAutoRefreshInterval}>
              <SelectTrigger className="w-[120px] text-xs h-9 bg-white border border-slate-200 shadow-sm">
                <SelectValue placeholder="Auto Refresh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Manual Refresh</SelectItem>
                <SelectItem value="15">Auto (15s)</SelectItem>
                <SelectItem value="30">Auto (30s)</SelectItem>
                <SelectItem value="60">Auto (60s)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Filters */}
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <Select value={dateRange} onValueChange={(val) => {
              setDateRange(val);
              if (val !== 'custom') {
                setTimeout(() => fetchAnalyticsData(true), 50);
              }
            }}>
              <SelectTrigger className="w-[140px] text-xs h-9 bg-white border border-slate-200 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <Select onValueChange={(val) => {
              if (val === 'csv') handleCSVExport();
              else if (val === 'xls') handleExcelExport();
              else if (val === 'pdf') handlePrintPDF();
            }}>
              <SelectTrigger className="w-[100px] text-xs h-9 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1 text-slate-700">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV File</SelectItem>
                <SelectItem value="xls">Excel Sheet</SelectItem>
                <SelectItem value="pdf">Print / PDF</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => fetchAnalyticsData(true)} 
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="h-9 px-3 border-slate-200 hover:bg-slate-50 shadow-sm bg-white"
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Custom range input picker panel */}
      {dateRange === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white/70 backdrop-blur border border-slate-200/80 rounded-xl shadow-sm animate-in slide-in-from-top-1 print:hidden">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">From:</span>
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs border rounded-lg bg-white border-slate-200 shadow-inner focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">To:</span>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs border rounded-lg bg-white border-slate-200 shadow-inner focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <Button 
            size="sm" 
            onClick={() => fetchAnalyticsData(true)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 h-8 text-white px-4"
            disabled={!customStartDate || !customEndDate}
          >
            Apply Date Filter
          </Button>
        </div>
      )}

      {/* Sync details */}
      <div className="text-right text-[10px] text-slate-400 font-mono pr-1 print:hidden">
        {lastUpdated ? `Database Synchronized: ${lastUpdated}` : "Connecting..."}
      </div>

      {/* Glassmorphic KPI Overview Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Revenue */}
        <Card className="border border-slate-200/60 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
          <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Net revenue</CardTitle>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{formatPrice(analyticsData.revenue.netRevenue)}</div>
            <div className="flex items-center mt-1 text-xs">
              {analyticsData.revenue.growth >= 0 ? (
                <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analyticsData.revenue.growth.toFixed(1)}%
                </span>
              ) : (
                <span className="flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md font-bold">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {analyticsData.revenue.growth.toFixed(1)}%
                </span>
              )}
              <span className="text-slate-400 ml-1.5 text-[10px]">vs previous filter</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Orders */}
        <Card className="border border-slate-200/60 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Total Orders</CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{analyticsData.sales.total.toLocaleString()}</div>
            <div className="flex items-center mt-1 text-xs">
              {analyticsData.sales.growth >= 0 ? (
                <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analyticsData.sales.growth.toFixed(1)}%
                </span>
              ) : (
                <span className="flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md font-bold">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {analyticsData.sales.growth.toFixed(1)}%
                </span>
              )}
              <span className="text-slate-400 ml-1.5 text-[10px]">vs previous filter</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: New Users */}
        <Card className="border border-slate-200/60 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-slate-500 tracking-wider uppercase">New Customers</CardTitle>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{analyticsData.users.newUsers.toLocaleString()}</div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
              <SparklineIcon className="h-3 w-3 text-amber-500" />
              <span>Today: <strong>{analyticsData.users.newUsersToday}</strong> registrations</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Repeat Rate */}
        <Card className="border border-slate-200/60 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-pink-500" />
          <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Repeat Purchase Rate</CardTitle>
            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{analyticsData.users.repeatPurchaseRate.toFixed(1)}%</div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <Percent className="h-3 w-3 text-pink-500" />
              <span>CLV average: <strong>{formatPrice(analyticsData.users.clv)}</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BI Subtabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 print:space-y-0">
        <TabsList className="flex flex-wrap w-full bg-slate-100/80 backdrop-blur rounded-xl p-1 gap-1 h-auto print:hidden shadow-inner">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 rounded-lg transition-all duration-200">
            <BarChart3 className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 rounded-lg transition-all duration-200">
            <DollarSign className="h-3.5 w-3.5" /> Revenue
          </TabsTrigger>
          <TabsTrigger value="sales" className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 rounded-lg transition-all duration-200">
            <ShoppingCart className="h-3.5 w-3.5" /> Orders & Payments
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 rounded-lg transition-all duration-200">
            <Package className="h-3.5 w-3.5" /> Products & Inventory
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 rounded-lg transition-all duration-200">
            <Users className="h-3.5 w-3.5" /> Customers
          </TabsTrigger>
          <TabsTrigger value="gifts" className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 rounded-lg transition-all duration-200">
            <Gift className="h-3.5 w-3.5" /> Gifting & Coupons
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            
            {/* Charts (Revenue/Orders Area) */}
            <Card className="lg:col-span-2 border border-slate-200 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription className="text-xs">Dynamic performance over the selected time range</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={analyticsData.revenue.daily}>
                      <defs>
                        <linearGradient id="overviewRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.45}/>
                          <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                        stroke="#e2e8f0"
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                        stroke="#e2e8f0"
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        formatter={(val) => [formatPrice(val as number), 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke={PRIMARY_COLOR}
                        fillOpacity={1} 
                        fill="url(#overviewRevenue)" 
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI Business Insights Panel */}
            <Card className="border border-slate-200 shadow-md flex flex-col">
              <CardHeader className="pb-2 border-b bg-slate-50/50">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600 animate-pulse" />
                  AI Business Insights
                </CardTitle>
                <CardDescription className="text-xs">Dynamic intelligence compiled directly from active variables</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-4 overflow-y-auto max-h-[320px] space-y-3">
                {analyticsData.performance.insights && analyticsData.performance.insights.length > 0 ? (
                  analyticsData.performance.insights.map((insight, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-all duration-200 hover:translate-x-1 ${
                        insight.type === 'success' ? 'bg-emerald-50/45 border-emerald-100/80 text-emerald-800' :
                        insight.type === 'warning' ? 'bg-amber-50/45 border-amber-100/80 text-amber-800' :
                        'bg-slate-50/70 border-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        {insight.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                        {insight.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                        {insight.type === 'info' && <Zap className="h-4 w-4 text-indigo-500" />}
                      </div>
                      <div>
                        <div className="font-bold mb-0.5 uppercase text-[9px] tracking-wider text-slate-400">{insight.metric}</div>
                        <p className="leading-normal">{insight.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-12">No significant analytical anomalies discovered in this period.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            
            {/* Order Status Breakdown */}
            <Card className="border border-slate-200 shadow-md">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <PieChartIcon className="h-4 w-4 text-indigo-600" />
                  Order Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={analyticsData.sales.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={55}
                        innerRadius={35}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {analyticsData.sales.ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 w-full text-xs">
                    {analyticsData.sales.ordersByStatus.map((st, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="capitalize text-slate-600 truncate">{st.status.replace('_', ' ')}:</span>
                        <strong className="text-slate-800">{st.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top 3 Bestsellers */}
            <Card className="border border-slate-200 shadow-md">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-indigo-600" />
                  Bestselling Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="space-y-2.5">
                  {analyticsData.products.topSelling.slice(0, 3).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{p.category}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-xs text-slate-700">{p.sold} sold</p>
                        <p className="text-[9px] text-slate-400">{formatPrice(p.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card className="border border-slate-200 shadow-md">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  Speed & Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Order Success Rate:</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50 font-bold">
                    {analyticsData.sales.orderSuccessRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Cancellation Rate:</span>
                  <Badge className="bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-50 font-bold">
                    {analyticsData.sales.cancellationRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Avg Arrangement Prep Time:</span>
                  <span className="font-bold text-slate-700">{analyticsData.sales.averageProcessingTime} hrs</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Avg Delivery Fulfillment:</span>
                  <span className="font-bold text-slate-700">{analyticsData.sales.averageDeliveryTime} hrs</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* 2. REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gross Sales</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatPrice(analyticsData.revenue.grossSales)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-4">Total subtotal of paid transactions in filter</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Sales</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatPrice(analyticsData.revenue.netRevenue)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-4">Gross sales + delivery charges - coupons applied</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AOV (Average Order Value)</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatPrice(analyticsData.revenue.averageOrderValue)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-4">Net sales divided by checkout count</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Delivered Order Revenue</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatPrice(analyticsData.revenue.deliveredOrderRevenue)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-4">Calculated from strictly finalized deliveries</p>
            </Card>
          </div>

          {/* Revenue Compare Ranges */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-bold">Revenue Timeline Comparisons</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x">
                {['today', 'week', 'month', 'year'].map((term) => {
                  const comparison = analyticsData.revenue.comparisons[term as 'today'|'week'|'month'|'year'];
                  return (
                    <div key={term} className="p-4 flex flex-col justify-between min-h-[100px]">
                      <div>
                        <span className="text-xs capitalize font-semibold text-slate-500">Revenue {term}</span>
                        <h4 className="text-xl font-bold text-slate-800 mt-1">{formatPrice(comparison.current)}</h4>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-slate-400 text-[10px]">Prev: {formatPrice(comparison.previous)}</span>
                        {comparison.growth >= 0 ? (
                          <span className="text-emerald-600 font-bold flex items-center bg-emerald-50 px-1 py-0.5 rounded">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" /> +{comparison.growth.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold flex items-center bg-rose-50 px-1 py-0.5 rounded">
                            <ArrowDownRight className="h-3 w-3 mr-0.5" /> {comparison.growth.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Revenue charts (Bar and Breakdown) */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            
            {/* Monthly Bar Chart */}
            <Card className="lg:col-span-2 border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-bold">Monthly Sales Progression (12 Months)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analyticsData.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val) => [formatPrice(val as number), 'Sales']} />
                    <Bar dataKey="amount" fill={SECONDARY_COLOR} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Category list */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-bold">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {analyticsData.revenue.breakdown.length > 0 ? (
                  analyticsData.revenue.breakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 capitalize">{item.category}</span>
                        <span className="text-slate-500 font-medium">{formatPrice(item.amount)} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-16">No sales reported for categories in this filter.</p>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* 3. ORDERS & PAYMENTS TAB */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            
            {/* Weekday sales distribution */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  Weekday Sales Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analyticsData.sales.weekdaySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#e2e8f0" />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#e2e8f0" />
                    <Tooltip formatter={(v, name) => name === 'revenue' ? [formatPrice(v as number), 'Revenue'] : [v, 'Orders']} />
                    <Bar dataKey="orders" fill={PRIMARY_COLOR} radius={[3, 3, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly sales activity line chart */}
            <Card className="lg:col-span-2 border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  Hourly Activity Heatmap (24h)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={analyticsData.sales.ordersByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#e2e8f0" />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#e2e8f0" />
                    <Tooltip formatter={(v, name) => name === 'revenue' ? [formatPrice(v as number), 'Revenue'] : [v, 'Orders']} />
                    <Line type="monotone" dataKey="orders" stroke={PRIMARY_COLOR} strokeWidth={2} dot={false} name="Orders" />
                    <Line type="monotone" dataKey="revenue" stroke={SECONDARY_COLOR} strokeWidth={1.5} dot={false} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>

          {/* Payment Gateway Breakdown */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                Payment Gateways Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Transactions</th>
                    <th className="p-3">Revenue (INR)</th>
                    <th className="p-3">Success Rate</th>
                    <th className="p-3">Failure Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analyticsData.sales.paymentBreakdown.length > 0 ? (
                    analyticsData.sales.paymentBreakdown.map((pm, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-semibold text-slate-700 capitalize">{pm.method}</td>
                        <td className="p-3 text-slate-600 font-mono">{pm.transactions}</td>
                        <td className="p-3 text-slate-700 font-bold">{formatPrice(pm.revenue)}</td>
                        <td className="p-3 text-emerald-600 font-bold">{pm.successRate}%</td>
                        <td className="p-3 text-rose-500 font-semibold">{pm.failureRate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No transaction data recorded in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. PRODUCTS TAB */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-6 print:grid-cols-3">
            <Card className="p-3 border shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Products</span>
              <p className="text-xl font-black text-slate-800 mt-1">{analyticsData.products.total}</p>
            </Card>
            <Card className="p-3 border shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Active Products</span>
              <p className="text-xl font-black text-slate-800 mt-1 text-emerald-600">{analyticsData.products.active}</p>
            </Card>
            <Card className="p-3 border shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Low Stock</span>
              <p className="text-xl font-black text-slate-800 mt-1 text-amber-500">{analyticsData.products.lowStock}</p>
            </Card>
            <Card className="p-3 border shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Out of Stock</span>
              <p className="text-xl font-black text-slate-800 mt-1 text-rose-500">{analyticsData.products.outOfStock}</p>
            </Card>
            <Card className="p-3 border shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Draft Products</span>
              <p className="text-xl font-black text-slate-800 mt-1 text-slate-500">{analyticsData.products.draft}</p>
            </Card>
            <Card className="p-3 border shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Stock Value</span>
              <p className="text-xl font-black text-slate-800 mt-1 text-indigo-600 truncate">{formatPrice(analyticsData.products.inventoryStats.stockValue)}</p>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            
            {/* Top Sellers */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-bold">Top Performing Products (Revenue/Volume)</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Sold Qty</th>
                      <th className="p-3">Revenue</th>
                      <th className="p-3">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyticsData.products.topSelling.length > 0 ? (
                      analyticsData.products.topSelling.slice(0, 5).map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-indigo-600 font-bold">#{idx+1}</td>
                          <td className="p-3 font-semibold text-slate-700 truncate max-w-[200px]">{p.name}</td>
                          <td className="p-3 text-slate-600 font-mono font-bold">{p.sold}</td>
                          <td className="p-3 text-slate-700 font-bold">{formatPrice(p.revenue)}</td>
                          <td className="p-3 text-slate-500 capitalize">{p.category}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">No sales reported for products in this filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Product Engagement Leaders */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-bold">Product Funnel & Interest Leaders</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                      <th className="p-3">Product Name</th>
                      <th className="p-3 flex items-center gap-1"><Eye className="h-3 w-3" /> Views</th>
                      <th className="p-3"><Heart className="h-3 w-3 inline mr-1" />Wishlist</th>
                      <th className="p-3"><ShoppingBag className="h-3.5 w-3.5 inline mr-1" />Carted</th>
                      <th className="p-3">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyticsData.products.mostViewed.slice(0, 5).map((p) => {
                      const wish = analyticsData.products.mostWishlisted.find(w => w.id === p.id)?.wishlisted || 0;
                      const cart = analyticsData.products.mostAddedToCart.find(c => c.id === p.id)?.carted || 0;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-semibold text-slate-700 truncate max-w-[180px]">{p.name}</td>
                          <td className="p-3 font-mono text-slate-600">{p.views}</td>
                          <td className="p-3 font-mono text-slate-500">{wish}</td>
                          <td className="p-3 font-mono text-slate-500">{cart}</td>
                          <td className="p-3 font-bold text-emerald-600">{p.conversion.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* 5. CUSTOMERS TAB */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Customer Lifetime Value</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatPrice(analyticsData.users.clv)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Average cumulative revenue per buyer</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Purchase Frequency</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{analyticsData.users.ordersPerCustomer.toFixed(2)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Average orders count per customer</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Guest vs Registered Checkout</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">
                  {analyticsData.users.guestCustomers} Guest / {analyticsData.users.registeredCustomers} Registered
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Distribution of checkout account sessions</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Customer Retention Rate</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{analyticsData.users.retention.toFixed(1)}%</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Repeat purchase rate metrics for filter</p>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            
            {/* Leaderboard Customers */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Star className="h-4.5 w-4.5 text-amber-500" />
                  Top Spending Customers Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Customer Details</th>
                      <th className="p-3">Orders Count</th>
                      <th className="p-3">Total Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyticsData.users.topSpending.length > 0 ? (
                      analyticsData.users.topSpending.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-bold text-indigo-600">#{idx+1}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-700">{c.name}</div>
                            <div className="text-[10px] text-slate-400">{c.email}</div>
                          </td>
                          <td className="p-3 text-slate-600 font-mono">{c.orderCount}</td>
                          <td className="p-3 text-slate-800 font-bold">{formatPrice(c.totalSpent)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">No buyers recorded in this period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Geographic rankings */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <MapPin className="h-4.5 w-4.5 text-indigo-600" />
                  Regional & Geographic Sales Splits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                      <th className="p-3">City / Region</th>
                      <th className="p-3">State</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyticsData.users.geographicDetails.length > 0 ? (
                      analyticsData.users.geographicDetails.slice(0, 6).map((g, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-semibold text-slate-700 capitalize">{g.city}</td>
                          <td className="p-3 text-slate-500 capitalize">{g.state}</td>
                          <td className="p-3 font-mono text-slate-600">{g.orders}</td>
                          <td className="p-3 font-bold text-slate-800">{formatPrice(g.revenue)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">No geographic logs compiled in this period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* 6. GIFTS & COUPONS TAB */}
        <TabsContent value="gifts" className="space-y-6">
          
          {/* Metrics */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Gifting Orders</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{analyticsData.performance.giftAnalytics.giftOrders}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Recipient addresses, message card orders</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Surprise / Anonymous Splits</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">
                  {analyticsData.performance.giftAnalytics.surpriseDeliveries} Surprise / {analyticsData.performance.giftAnalytics.anonymousGifts} Anonymous
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Privacy preference variables in checkout</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Coupons Applied (Period)</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{analyticsData.sales.couponStats.couponsUsed}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Total promo codes used by customers</p>
            </Card>
            <Card className="p-4 border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Discounts Given</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatPrice(analyticsData.sales.couponStats.totalDiscountGiven)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Gross price cuts applied from coupons</p>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            
            {/* Occasion Distribution */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Gift className="h-4.5 w-4.5 text-indigo-600" />
                  Gifting Occasions text-mining metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analyticsData.performance.giftAnalytics.occasions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="occasion" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS[3]} radius={[4, 4, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Coupons detail list */}
            <Card className="border shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Tag className="h-4.5 w-4.5 text-indigo-600" />
                  Coupon Performance & Conversions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-5">
                <div className="p-4 bg-slate-50/70 border rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] tracking-wider">Most Popular Coupon Code</span>
                    <h5 className="font-extrabold text-slate-800 text-sm mt-1">{analyticsData.sales.couponStats.mostUsedCoupon}</h5>
                  </div>
                  <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-100 font-bold px-2 py-1">
                    Leader Code
                  </Badge>
                </div>
                <div className="p-4 bg-slate-50/70 border rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] tracking-wider">Coupons Conversion Rate</span>
                    <h5 className="font-extrabold text-slate-800 text-sm mt-1">{analyticsData.sales.couponStats.couponConversionRate}%</h5>
                  </div>
                  <span className="text-slate-400 text-[11px]">of total sales used coupons</span>
                </div>
                <div className="p-4 bg-slate-50/70 border rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] tracking-wider">Greeting Card Usage Ratio</span>
                    <h5 className="font-extrabold text-slate-800 text-sm mt-1">
                      {analyticsData.performance.giftAnalytics.giftOrders > 0
                        ? `${((analyticsData.performance.giftAnalytics.greetingCardUsage / analyticsData.performance.giftAnalytics.giftOrders) * 100).toFixed(0)}%`
                        : "0%"}
                    </h5>
                  </div>
                  <span className="text-slate-400 text-[11px]">of gifts requested card messages</span>
                </div>
              </CardContent>
            </Card>

          </div>

        </TabsContent>

      </Tabs>
      
    </div>
  );
};

export default Analytics;