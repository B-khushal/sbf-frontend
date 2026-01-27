import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  RadialBarChart,
  RadialBar,
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
  Eye,
  Star,
  Heart,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
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
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Color schemes for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000'];
const SUCCESS_COLOR = '#22c55e';
const WARNING_COLOR = '#f59e0b';
const ERROR_COLOR = '#ef4444';
const PRIMARY_COLOR = '#3b82f6';

interface AnalyticsData {
  revenue: {
    overview?: {
      total: number;
      growth: number;
      orders: number;
      itemsSold: number;
      avgOrderValue: number;
      avgItemValue: number;
    };
    total?: number;
    growth?: number;
    daily?: Array<{ date: string; amount: number; orders: number; avgOrderValue?: number }>;
    monthly?: Array<{ month: string; amount: number; orders: number; items?: number; avgOrderValue?: number }>;
    breakdown?: Array<{ category: string; amount: number; percentage: number; orders?: number; items?: number; avgOrderValue?: number }>;
    customerSegments?: Array<{ range: string; customers: number; revenue: number; avgOrderCount: number; avgCustomerValue: number }>;
    shipping?: { totalCost: number; ordersWithShipping: number; percentage: number; avgShippingCost: number };
  };
  sales: {
    overview?: {
      total: number;
      completed: number;
      pending: number;
      cancelled: number;
      growth: number;
      completionRate: number;
      cancellationRate: number;
    };
    revenue?: {
      total: number;
      average: number;
      highest: number;
      lowest: number;
    };
    total?: number;
    growth?: number;
    conversion?: number;
    averageOrderValue?: number;
    ordersByStatus?: Array<{ status: string; count: number; percentage: number; revenue?: number; avgOrderValue?: number }>;
    ordersByHour?: Array<{ hour: string; orders: number; revenue: number }>;
    ordersByDay?: Array<{ day: string; orders: number; revenue: number; avgOrderValue: number }>;
    paymentMethods?: Array<{ method: string; count: number; revenue: number; percentage: number }>;
    deliveryTypes?: Array<{ type: string; count: number; revenue: number; percentage: number }>;
  };
  products: {
    overview?: {
      total: number;
      active: number;
      outOfStock: number;
      lowStock: number;
      totalSold: number;
      inventoryValue: number;
      totalInventoryItems: number;
    };
    total?: number;
    sold?: number;
    topSelling?: Array<{ id?: string; name: string; sold: number; revenue: number; category: string; orders?: number; avgPrice?: number; basePrice?: number; currentStock?: number; stockStatus?: string }>;
    categories?: Array<{ name: string; products: number; revenue: number; percentage: number; sold?: number; orders?: number; avgOrderValue?: number }>;
    lowStock?: Array<{ id?: string; name: string; stock: number; category: string; price?: number; sold?: number; urgency?: string; reorderValue?: number }>;
    outOfStock?: Array<{ id?: string; name: string; category: string; price?: number; sold?: number; lostRevenuePotential?: number }>;
    priceDistribution?: Array<{ range: string; count: number }>;
    performance?: Array<{ name: string; views: number; orders: number; conversion: number }>;
  };
  users: {
    overview?: {
      total: number;
      active: number;
      newUsers: number;
      growth: number;
      retentionRate: number;
      repeatCustomerRate: number;
    };
    engagement?: {
      totalCustomers: number;
      avgOrdersPerCustomer: number;
      avgSpendPerCustomer: number;
    };
    total?: number;
    active?: number;
    newUsers?: number;
    retention?: number;
    topCustomers?: Array<{ id: string; name: string; email: string; totalSpent: number; orders: number; avgOrderValue: number; lastOrder: string; customerSince: string }>;
    roleDistribution?: Array<{ role: string; count: number; percentage: number }>;
    repeatCustomers?: Array<{ segment: string; customers: number; percentage: number }>;
    demographics?: Array<{ location: string; users: number; percentage: number }>;
    activity?: Array<{ date: string; users: number; sessions?: number }>;
    acquisition?: Array<{ month: string; users: number }>;
  };
  performance: {
    pageViews: number;
    bounceRate: number;
    averageSessionTime: number;
    conversionRate: number;
    topPages: Array<{ page: string; views: number; time: number }>;
    devices: Array<{ device: string; users: number; percentage: number }>;
  };
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const { formatPrice, currency } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAnalyticsData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      const [
        revenueRes,
        salesRes,
        productsRes,
        usersRes,
        performanceRes
      ] = await Promise.all([
        api.get(`/analytics/revenue?period=${dateRange}`),
        api.get(`/analytics/sales?period=${dateRange}`),
        api.get(`/analytics/products?period=${dateRange}`),
        api.get(`/analytics/users?period=${dateRange}`),
        api.get(`/analytics/performance?period=${dateRange}`)
      ]);

      setAnalyticsData({
        revenue: revenueRes.data,
        sales: salesRes.data,
        products: productsRes.data,
        users: usersRes.data,
        performance: performanceRes.data
      });

      if (showToast) {
        toast({
          title: "Analytics Updated",
          description: "Data refreshed successfully",
        });
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch analytics data",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, toast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleRefresh = () => {
    fetchAnalyticsData(true);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Analytics</h3>
          <p className="text-muted-foreground mb-4">Unable to fetch analytics data</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Helper functions to safely access nested properties
  const getRevenueTotal = () => analyticsData.revenue?.overview?.total ?? analyticsData.revenue?.total ?? 0;
  const getRevenueGrowth = () => analyticsData.revenue?.overview?.growth ?? analyticsData.revenue?.growth ?? 0;
  const getSalesTotal = () => analyticsData.sales?.overview?.total ?? analyticsData.sales?.total ?? 0;
  const getSalesGrowth = () => analyticsData.sales?.overview?.growth ?? analyticsData.sales?.growth ?? 0;
  const getSalesConversion = () => analyticsData.sales?.conversion ?? 0;
  const getSalesAverageOrderValue = () => analyticsData.sales?.averageOrderValue ?? analyticsData.sales?.revenue?.average ?? 0;
  const getProductsTotal = () => analyticsData.products?.overview?.total ?? analyticsData.products?.total ?? 0;
  const getProductsSold = () => analyticsData.products?.overview?.totalSold ?? analyticsData.products?.sold ?? 0;
  const getUsersTotal = () => analyticsData.users?.overview?.total ?? analyticsData.users?.total ?? 0;
  const getUsersActive = () => analyticsData.users?.overview?.active ?? analyticsData.users?.active ?? 0;
  const getUsersNew = () => analyticsData.users?.overview?.newUsers ?? analyticsData.users?.newUsers ?? 0;
  const getUsersRetention = () => analyticsData.users?.overview?.retentionRate ?? analyticsData.users?.retention ?? 0;
  const getPerformanceBounceRate = () => analyticsData.performance?.bounceRate ?? 0;
  const getPerformanceConversionRate = () => analyticsData.performance?.conversionRate ?? 0;
  const getPerformancePageViews = () => analyticsData.performance?.pageViews ?? 0;
  const getPerformanceSessionTime = () => analyticsData.performance?.averageSessionTime ?? 0;

  // Helper functions for arrays
  const getRevenueDaily = () => analyticsData.revenue?.daily ?? [];
  const getRevenueMonthly = () => analyticsData.revenue?.monthly ?? [];
  const getRevenueBreakdown = () => analyticsData.revenue?.breakdown ?? [];
  const getSalesOrdersByStatus = () => analyticsData.sales?.ordersByStatus ?? [];
  const getSalesOrdersByHour = () => analyticsData.sales?.ordersByHour ?? [];
  const getProductsTopSelling = () => analyticsData.products?.topSelling ?? [];
  const getProductsCategories = () => analyticsData.products?.categories ?? [];
  const getProductsLowStock = () => analyticsData.products?.lowStock ?? [];
  const getProductsPerformance = () => analyticsData.products?.performance ?? [];
  const getUsersActivity = () => analyticsData.users?.activity ?? [];
  const getUsersDemographics = () => analyticsData.users?.demographics ?? [];
  const getPerformanceTopPages = () => analyticsData.performance?.topPages ?? [];
  const getPerformanceDevices = () => analyticsData.performance?.devices ?? [];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive business analytics and insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-28 sm:w-[140px] text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            className="gap-1 text-xs sm:text-sm"
            title="Export Data"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="gap-1 text-xs sm:text-sm"
          >
            {refreshing ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview - Mobile Responsive */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold truncate">{formatPrice(getRevenueTotal())}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getRevenueGrowth() > 0 ? (
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-red-500" />
              )}
              <span className={getRevenueGrowth() > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(getRevenueGrowth()).toFixed(1)}%
              </span>
              <span className="ml-1 hidden sm:inline">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{getSalesTotal().toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getSalesGrowth() > 0 ? (
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-red-500" />
              )}
              <span className={getSalesGrowth() > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(getSalesGrowth()).toFixed(1)}%
              </span>
              <span className="ml-1 hidden sm:inline">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{getUsersActive().toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {getUsersNew()} new users
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{getSalesConversion().toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground truncate">
              AOV: {formatPrice(getSalesAverageOrderValue())}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs - Mobile Responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs sm:text-sm py-2">Revenue</TabsTrigger>
          <TabsTrigger value="sales" className="text-xs sm:text-sm py-2">Sales</TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm py-2">Products</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm py-2 col-span-2 sm:col-span-1">Users</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Mobile Responsive */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minWidth={300}>
                    <AreaChart data={getRevenueDaily()}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }} 
                        interval="preserveStartEnd"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip 
                        formatter={(value) => [formatPrice(value as number), 'Revenue']}
                        labelStyle={{ color: '#000' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke={PRIMARY_COLOR}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getSalesOrdersByStatus()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {getSalesOrdersByStatus().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products and Performance Metrics - Mobile Responsive */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getProductsTopSelling().slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.sold} sold</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(product.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Page Views</span>
                    <span className="text-sm">{getPerformancePageViews().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-sm">{getPerformanceBounceRate().toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Session Time</span>
                    <span className="text-sm">{Math.floor(getPerformanceSessionTime() / 60)}m {getPerformanceSessionTime() % 60}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-sm font-bold text-green-600">{getPerformanceConversionRate().toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab - Mobile Responsive */}
        <TabsContent value="revenue" className="space-y-4 sm:space-y-6">
          <div className="grid gap-6">
            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Monthly Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getRevenueMonthly()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatPrice(value)}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'amount') return [formatPrice(value as number), 'Revenue'];
                        if (name === 'orders') return [value, 'Orders'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="amount" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Breakdown - Mobile Responsive */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getRevenueBreakdown().map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm">{formatPrice(item.amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(item.percentage ?? 0).toFixed(1)}% of total revenue
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Growth Trend</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Revenue is growing at {Math.abs(getRevenueGrowth()).toFixed(1)}% compared to the previous period.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Average Order Value</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Current AOV is {formatPrice(getSalesAverageOrderValue())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6">
            {/* Sales by Hour */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Sales Activity by Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getSalesOrdersByHour()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke={PRIMARY_COLOR} 
                      strokeWidth={2}
                      dot={{ fill: PRIMARY_COLOR, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales Metrics */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSalesOrdersByStatus().map((status, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm capitalize">{status.status}</span>
                        </div>
                        <span className="text-sm font-medium">{status.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Page Views</span>
                      <span className="text-sm font-medium">{getPerformancePageViews().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Add to Cart</span>
                      <span className="text-sm font-medium">{Math.floor(getPerformancePageViews() * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Checkout</span>
                      <span className="text-sm font-medium">{Math.floor(getPerformancePageViews() * 0.08).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Orders</span>
                      <span className="text-sm font-medium text-green-600">{getSalesTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Conversion Rate</span>
                      <Badge variant={getSalesConversion() > 2 ? "default" : "destructive"}>
                        {getSalesConversion().toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bounce Rate</span>
                      <Badge variant={getPerformanceBounceRate() < 40 ? "default" : "destructive"}>
                        {getPerformanceBounceRate().toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Return Rate</span>
                      <Badge variant="default">
                        {getUsersRetention().toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6">
            {/* Product Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Product Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getProductsPerformance().map((product, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{product.name}</h4>
                        <Badge variant={product.conversion > 5 ? "default" : "secondary"}>
                          {(product.conversion ?? 0).toFixed(1)}% conversion
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Views</p>
                          <p className="text-lg font-bold">{product.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Orders</p>
                          <p className="text-lg font-bold">{product.orders}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min(product.conversion * 10, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm">{(product.conversion ?? 0).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories and Stock */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Categories Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getProductsCategories()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [formatPrice(value as number), 'Revenue']} />
                      <Bar dataKey="revenue" fill={SUCCESS_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getProductsLowStock().length > 0 ? (
                      getProductsLowStock().map((product, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <Badge variant="destructive">
                            {product.stock} left
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        All products are well stocked!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6">
            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getUsersActivity()}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke={PRIMARY_COLOR}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Demographics and Device Usage */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getUsersDemographics().map((location, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{location.location}</span>
                          <span className="text-sm">{location.users} users</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(location.percentage ?? 0).toFixed(1)}% of total users
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getPerformanceDevices()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, percentage }) => `${device} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="users"
                      >
                        {getPerformanceDevices().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* User Insights */}
            <Card>
              <CardHeader>
                <CardTitle>User Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{getUsersTotal()}</p>
                    <p className="text-sm text-blue-600">Total Users</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{getUsersActive()}</p>
                    <p className="text-sm text-green-600">Active Users</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{getUsersNew()}</p>
                    <p className="text-sm text-purple-600">New Users</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">{getUsersRetention().toFixed(1)}%</p>
                    <p className="text-sm text-orange-600">Retention Rate</p>
                  </div>
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