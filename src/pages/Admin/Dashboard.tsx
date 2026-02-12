import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, Area, AreaChart } from 'recharts';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  Bell, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Plus,
  Calendar,
  Clock,
  Activity,
  Settings,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';
import api from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { testNotificationSound } from '@/utils/notificationSound';
import DeliveryCalendar from '@/components/DeliveryCalendar';
import NotificationHistoryModal from '@/components/NotificationHistoryModal';
import { getSessionId, createNewSession, isNewSession } from '@/utils/sessionManager';
import { showNotificationsOnLogin, clearReadNotifications } from '@/services/notificationService';

interface DashboardData {
  revenue: {
    total: number;
    percentChange: number;
  };
  sales: {
    total: number;
    percentChange: number;
    pending: number;
  };
  activeUsers: {
    total: number;
    percentChange: number;
  };
  inventory: {
    total: number;
    lowStock: number;
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  items: number;
  paymentMethod: string;
}

interface ProductData {
  id: string;
  name: string;
  sold: number;
  price: number;
  inStock: number;
  image: string;
  category: string;
}

interface SalesData {
  name: string;
  total: number;
  orders: number;
  average: number;
}

interface UserActivity {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

const AdminDashboardHome: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    revenue: { total: 0, percentChange: 0 },
    sales: { total: 0, percentChange: 0, pending: 0 },
    activeUsers: { total: 0, percentChange: 0 },
    inventory: { total: 0, lowStock: 0 },
  });
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const { formatPrice, convertPrice, currency, setCurrency } = useCurrency();
  const { notifications, unreadCount, markAllAsRead, clearReadNotifications, isConnected, enableSounds, toggleSounds, addNotification } = useNotification();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Session management and notification handling on component mount
  useEffect(() => {
    const initializeSession = async () => {
      const currentSessionId = getSessionId();
      setSessionId(currentSessionId);
      
      // Check if this is a new session (login)
      if (isNewSession()) {
        console.log('New session detected, creating fresh session...');
        const newSessionId = createNewSession();
        setSessionId(newSessionId);
        
        // Show notifications that were hidden in previous sessions
        try {
          await showNotificationsOnLogin(newSessionId);
          console.log('Notifications reset for new session');
        } catch (error) {
          console.error('Error resetting notifications for new session:', error);
        }
      }
    };
    
    initializeSession();
  }, []);

  // Debug logging for currency conversion
  useEffect(() => {
    if (dashboardData.revenue.total > 0) {
      console.log('=== CURRENCY CONVERSION DEBUG ===');
      console.log('Current currency:', currency);
      console.log('Raw revenue from backend (INR):', dashboardData.revenue.total);
      console.log('Converted revenue:', convertPrice(dashboardData.revenue.total));
      console.log('Formatted revenue:', formatPrice(convertPrice(dashboardData.revenue.total)));
      
      // Test specific values
      const testValue = 2150; // ₹2,150
      console.log('Test: ₹2,150 →', formatPrice(convertPrice(testValue)));
      
      if (currency === 'USD') {
        console.log('Expected: $25.00 (2150 × 0.01162 ≈ 25)');
      }
      console.log('=================================');
    }
  }, [dashboardData.revenue.total, currency, convertPrice, formatPrice]);

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      if (!dashboardData.revenue.total) setLoading(true);
      setError(null);
      
      // Fetch all data in parallel with real-time calculations
      const [statsRes, ordersRes, productsRes, salesRes, activityRes, lowStockRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/dashboard/recent-orders'),
        api.get('/dashboard/top-products'),
        api.get('/dashboard/sales-data'),
        api.get('/dashboard/user-activity'),
        api.get('/products/admin/low-stock?threshold=10')
      ]);

      // Calculate real-time metrics
      const currentTime = new Date();
      const todayStart = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
      
      // Enhanced data with real-time calculations
      const enhancedStats = {
        ...statsRes.data,
        lastUpdated: currentTime.toISOString(),
        todayMetrics: {
          orders: ordersRes.data.filter(order => new Date(order.date) >= todayStart).length,
          revenue: ordersRes.data
            .filter(order => new Date(order.date) >= todayStart)
            .reduce((sum, order) => sum + order.amount, 0)
        }
      };

      setDashboardData(enhancedStats);
      setRecentOrders(ordersRes.data);
      setTopProducts(productsRes.data);
      setSalesData(salesRes.data);
      setUserActivity(activityRes.data.recentUsers);
      setLowStockProducts(lowStockRes.data.products || []);
      setLastUpdated(currentTime);

      // Show success toast only when explicitly requested
      if (showToast) {
        toast({
          title: "Data Refreshed",
          description: `Dashboard updated at ${currentTime.toLocaleTimeString()}`,
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Refresh Failed",
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast, dashboardData.revenue.total]);

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Set up polling for real-time updates
  useEffect(() => {
    fetchDashboardData();
    
    // Poll every 15 seconds if auto-refresh is enabled
    const interval = autoRefresh ? setInterval(() => fetchDashboardData(false), 15000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchDashboardData, autoRefresh]);

  // Quick action handlers
  const quickActions = {
    viewOrders: () => navigate('/admin/orders'),
    manageProducts: () => navigate('/admin/products'),
    manageUsers: () => navigate('/admin/users'),
    viewSettings: () => navigate('/admin/settings'),
    addProduct: () => navigate('/admin/products/new'),
    viewAnalytics: () => navigate('/admin/analytics'),
  };

  const handleClearReadNotifications = async () => {
    try {
      // Use the context function instead of direct API call
      if (clearReadNotifications) {
        await clearReadNotifications();
      }
      
      // Refresh notifications to reflect the changes
      fetchDashboardData();
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      toast({
        title: "Error",
        description: "Failed to clear read notifications",
        variant: "destructive"
      });
    }
  };

  // Calculate real-time metrics
  const todayRevenue = dashboardData.todayMetrics?.revenue || 0;
  const todayOrders = dashboardData.todayMetrics?.orders || 0;
  const pendingOrdersCount = recentOrders.filter(order => order.status === 'pending').length;
  const completedOrdersToday = recentOrders.filter(order => 
    order.status === 'completed' && 
    new Date(order.date).toDateString() === new Date().toDateString()
  ).length;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !dashboardData.revenue.total) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={fetchDashboardData}
        >
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header Section - Mobile Responsive */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Live Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            {autoRefresh && (
              <span className="text-green-600">• Auto-refresh enabled</span>
            )}
            {/* Connection Status */}
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-600">
                <Wifi className="h-3 w-3" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-3 w-3" />
                Disconnected
              </span>
            )}
          </div>
        </div>
        
        {/* Controls - Mobile Responsive */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Currency switcher */}
          <Button 
            onClick={() => {
              const newCurrency = currency === 'INR' ? 'USD' : 'INR';
              console.log('Switching currency from', currency, 'to', newCurrency);
              setCurrency(newCurrency);
            }}
            variant="outline"
            size="sm"
            className="gap-1 text-xs sm:text-sm"
          >
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{currency} ({currency === 'INR' ? '₹' : '$'})</span>
            <span className="sm:hidden">{currency}</span>
          </Button>

          {/* Sound toggle */}
          <Button 
            onClick={toggleSounds}
            variant={enableSounds ? "default" : "outline"}
            size="sm"
            className="gap-1"
            title={enableSounds ? 'Sound On' : 'Sound Off'}
          >
            {enableSounds ? <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden lg:inline">{enableSounds ? 'Sound On' : 'Sound Off'}</span>
          </Button>

          {/* Auto-refresh toggle */}
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            className="gap-1"
            title={autoRefresh ? 'Live Mode' : 'Manual Mode'}
          >
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">{autoRefresh ? 'Live' : 'Manual'}</span>
          </Button>

          {/* Manual refresh */}
          <Button 
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={refreshing}
            title="Refresh Data"
          >
            {refreshing ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden lg:inline">Refresh</span>
          </Button>

          {/* Quick actions - Mobile responsive */}
          <div className="flex gap-1">
            <Button 
              onClick={quickActions.addProduct}
              size="sm"
              className="gap-1"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
            
            <Button 
              onClick={quickActions.viewSettings}
              variant="outline"
              size="sm"
              title="Settings"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          {/* Notifications */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="relative">
              <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs animate-pulse">
                {unreadCount}
              </Badge>
              <Button 
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="gap-1"
                title="Notifications"
              >
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Notifications</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Cards - Mobile Responsive Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={quickActions.viewOrders}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold truncate">{formatPrice(dashboardData.revenue.total)}</div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardData.revenue.percentChange > 0 ? (
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-red-500" />
                )}
                <span className={dashboardData.revenue.percentChange > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(dashboardData.revenue.percentChange).toFixed(1)}%
                </span>
                <span className="ml-1 hidden sm:inline">vs last month</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Today: {formatPrice(todayRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={quickActions.viewOrders}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Sales</CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{dashboardData.sales.total}</div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardData.sales.percentChange > 0 ? (
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-red-500" />
                )}
                <span className={dashboardData.sales.percentChange > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(dashboardData.sales.percentChange).toFixed(1)}%
                </span>
                <span className="ml-1 hidden sm:inline">vs last month</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="text-blue-600">Today: {todayOrders}</span>
              <span className="text-green-600">Done: {completedOrdersToday}</span>
              {pendingOrdersCount > 0 && (
                <span className="text-yellow-600">Pending: {pendingOrdersCount}</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={quickActions.manageUsers}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{dashboardData.activeUsers.total}</div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardData.activeUsers.percentChange > 0 ? (
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-red-500" />
                )}
                <span className={dashboardData.activeUsers.percentChange > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(dashboardData.activeUsers.percentChange).toFixed(1)}%
                </span>
                <span className="ml-1 hidden sm:inline">vs last month</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Last 30 days activity</span>
              <span className="sm:hidden">30d activity</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={quickActions.manageProducts}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Inventory</CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{dashboardData.inventory.total}</div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardData.inventory.lowStock > 0 ? (
                  <div className="flex items-center">
                    <AlertTriangle className="h-3 w-3 text-amber-500 mr-1 animate-pulse" />
                    <span className="text-amber-500">{dashboardData.inventory.lowStock} low stock</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Target className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">All in stock</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Click to manage inventory</span>
              <span className="sm:hidden">Manage stock</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Stock Alert - Mobile Optimized */}
      {lowStockProducts.length > 0 && (
        <Alert className="border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-yellow-600 animate-bounce" />
          <AlertTitle className="text-yellow-800 flex flex-wrap items-center gap-2">
            🚨 Critical Stock Alert
            <Badge variant="destructive" className="animate-pulse text-xs">
              {lowStockProducts.length} items
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <span className="text-sm">
                <strong>{lowStockProducts.length} products</strong> need immediate restocking.
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/products')}
                  className="gap-1 hover:bg-yellow-100 text-xs sm:text-sm"
                >
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  Manage Stock
                </Button>
                <Button
                  size="sm"
                  onClick={quickActions.addProduct}
                  className="gap-1 text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  Add Products
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStockProducts.slice(0, 6).map((product) => (
                <Card 
                  key={product._id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 bg-white border-l-4 border-l-yellow-400"
                  onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(convertPrice(product.price))}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={product.countInStock === 0 ? "destructive" : "outline"}
                          className={`${
                            product.countInStock === 0 
                              ? "animate-pulse" 
                              : product.countInStock <= 5 
                                ? "border-red-500 text-red-600" 
                                : "border-yellow-500 text-yellow-600"
                          }`}
                        >
                          {product.countInStock === 0 ? 'Out' : `${product.countInStock}`}
                        </Badge>
                        <Edit className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {lowStockProducts.length > 6 && (
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 bg-muted/30"
                  onClick={() => navigate('/admin/products')}
                >
                  <CardContent className="p-3 flex items-center justify-center text-center">
                    <div>
                      <p className="text-sm font-medium">+{lowStockProducts.length - 6} more</p>
                      <p className="text-xs text-muted-foreground">View all products</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Charts Section - Mobile Responsive */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Live Sales Analytics
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">Real-time performance tracking</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={quickActions.viewAnalytics}
                className="gap-1 text-xs sm:text-sm"
              >
                <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Full Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                title="Refresh Chart"
              >
                {refreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6">
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-base sm:text-lg font-bold text-blue-600">{todayOrders}</p>
                <p className="text-xs text-blue-500">Today's Orders</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-lg text-center">
                <p className="text-base sm:text-lg font-bold text-green-600 truncate">{formatPrice(todayRevenue)}</p>
                <p className="text-xs text-green-500">Today's Revenue</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-base sm:text-lg font-bold text-purple-600 truncate">
                  {todayOrders > 0 ? formatPrice(todayRevenue / todayOrders) : formatPrice(0)}
                </p>
                <p className="text-xs text-purple-500">Avg Order Value</p>
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }} 
                  interval="preserveStartEnd"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    return currency === 'INR' 
                      ? `₹${(value / 1000)}k`
                      : `$${(value / 1000).toFixed(1)}k`;
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'total') return [formatPrice(value as number), 'Revenue'];
                    if (name === 'orders') return [value, 'Orders'];
                    if (name === 'average') return [formatPrice(value as number), 'Average Order'];
                    return [value, name];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#82ca9d" 
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                  strokeWidth={2}
                  name="Orders"
                />
              </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications Panel - Mobile Responsive */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <CardTitle className="text-base sm:text-lg">
              <div className="flex items-center flex-wrap gap-2">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span>Live Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="animate-pulse text-xs">{unreadCount}</Badge>
                )}
              </div>
            </CardTitle>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Button 
                onClick={() => setShowHistoryModal(true)}
                variant="outline" 
                size="sm"
                className="gap-1 text-xs sm:text-sm"
                title="View notification history"
              >
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">History</span>
              </Button>
              <Button 
                onClick={markAllAsRead} 
                variant="ghost" 
                size="sm"
                className="gap-1 text-xs sm:text-sm"
                disabled={unreadCount === 0}
                title="Mark all as read"
              >
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
              <Button 
                onClick={handleClearReadNotifications}
                variant="ghost" 
                size="sm"
                className="gap-1 text-xs sm:text-sm text-destructive hover:text-destructive"
                disabled={notifications.filter(n => n.isRead).length === 0}
                title="Clear read notifications"
              >
                <X className="h-3 w-3" />
                <span className="hidden sm:inline">Clear read</span>
              </Button>
              <Button 
                onClick={testNotificationSound}
                variant="ghost" 
                size="sm"
                className="gap-1 text-xs sm:text-sm"
                title="Test notification sound"
              >
                🔔 <span className="hidden sm:inline">Test</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                title="Refresh notifications"
              >
                {refreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6">
            {notifications.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Bell className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
                <div className="space-y-3">
                  {notifications.slice(0, 10).map((notification, index) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                        notification.isRead 
                          ? 'bg-muted/20 border-muted' 
                          : 'bg-blue-50 border-blue-200 animate-in slide-in-from-right duration-300'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                          <h4 className="text-sm font-medium">
                            {notification.title}
                          </h4>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              // markAsRead functionality would go here
                            }}
                          >
                            Mark as read
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Recent Orders
                <Badge variant="secondary" className="ml-2">
                  {recentOrders.length}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Latest customer orders</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={quickActions.viewOrders}
                className="gap-1"
              >
                <Eye className="h-3 w-3" />
                View All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No recent orders</p>
                  <p className="text-xs">Orders will appear here</p>
                </div>
              ) : (
                recentOrders.slice(0, 6).map((order, index) => (
                  <Card 
                    key={order.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-400 animate-in slide-in-from-left duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{order.orderNumber}</p>
                            <Badge 
                              className={`${getStatusColor(order.status)} text-xs`}
                              variant={order.status === 'completed' ? 'default' : 'secondary'}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{order.customer}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>{order.items} items</span>
                            <span>•</span>
                            <span>{order.paymentMethod}</span>
                            <span>•</span>
                            <span>{new Date(order.date).toLocaleDateString()}</span>
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="text-sm font-bold text-primary">
                              {formatPrice(convertPrice(order.amount))}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {recentOrders.length > 6 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={quickActions.viewOrders}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View {recentOrders.length - 6} more orders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Top Products
                <Badge variant="secondary" className="ml-2">
                  {topProducts.length}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Best selling items</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={quickActions.manageProducts}
                className="gap-1"
              >
                <Eye className="h-3 w-3" />
                View All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No products data</p>
                  <p className="text-xs">Product analytics will appear here</p>
                </div>
              ) : (
                topProducts.map((product, index) => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-green-400 animate-in slide-in-from-right duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="h-12 w-12 rounded-md object-cover ring-2 ring-green-100"
                            />
                          )}
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-green-600 font-medium">
                                🔥 {product.sold} sold
                              </span>
                              <span className={`${product.inStock < 10 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}>
                                📦 {product.inStock} in stock
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-bold text-sm text-primary">
                              {formatPrice(convertPrice(product.price))}
                            </p>
                            <div className="flex items-center justify-end gap-1">
                              <div className="text-xs text-muted-foreground">#{index + 1}</div>
                              {product.inStock < 10 && (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {topProducts.length > 0 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={quickActions.manageProducts}
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  Manage All Products
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Notification History Modal */}
      <NotificationHistoryModal 
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
      />
    </div>
  );
};

export default AdminDashboardHome;