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
  Cell
} from 'recharts';
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
  CheckCircle,
  CreditCard,
  Eye,
  Edit,
  Plus,
  Calendar,
  Clock,
  Activity,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Gift,
  MapPin,
  Tag,
  Sliders,
  ChevronDown,
  ChevronUp,
  Pin,
  FileText,
  Printer,
  Grid
} from 'lucide-react';
import api from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SparklineIcon = TrendingUp;

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e'];
const PRIMARY_COLOR = '#6366f1';
const SECONDARY_COLOR = '#3b82f6';

interface DashboardStats {
  revenue: { total: number; today: number; percentChange: number };
  sales: { total: number; today: number; pending: number; delivered: number; percentChange: number };
  customers: { total: number; active: number; percentChange: number };
  inventory: { total: number; lowStock: number };
  giftOrders: {
    total: number;
    selfOrders: number;
    anonymous: number;
    surprise: number;
    greetingCard: number;
    occasions: Array<{ occasion: string; count: number }>;
  };
  conversions: { cart: number; wishlist: number; checkout: number };
  deliveryPerformance: { sameDay: number; scheduled: number; pending: number; failed: number };
  geographicSales: Array<{ city: string; revenue: number; orders: number }>;
  paymentMethods: Array<{ method: string; transactions: number; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
  insights: Array<string>;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  recipientName: string;
  amount: number;
  status: string;
  date: string;
  itemsCount: number;
  paymentMethod: string;
  originalCurrency: string;
  originalAmount: number;
  assignedWorker: string;
  isTestOrder?: boolean;
}

interface TopProduct {
  id: string;
  name: string;
  sold: number;
  revenue: number;
  inStock: number;
  image: string;
  category: string;
  price: number;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'delivery' | 'user' | 'product' | 'admin';
  title: string;
  description: string;
  user: string;
  timestamp: string;
}

interface WidgetLayout {
  id: string;
  title: string;
  visible: boolean;
  pinned: boolean;
  order: number;
}

const DEFAULT_LAYOUT: WidgetLayout[] = [
  { id: 'insights', title: 'AI Business Insights', visible: true, pinned: true, order: 1 },
  { id: 'kpis', title: 'Key Performance Indicators', visible: true, pinned: false, order: 2 },
  { id: 'sales_chart', title: 'Revenue Overview Chart', visible: true, pinned: false, order: 3 },
  { id: 'status_track', title: 'Orders Status Tracking', visible: true, pinned: false, order: 4 },
  { id: 'recent_orders', title: 'Live Recent Orders Table', visible: true, pinned: false, order: 5 },
  { id: 'low_stock', title: 'Low Inventory Watchlist', visible: true, pinned: false, order: 6 },
  { id: 'timeline', title: 'Live Activity Timeline', visible: true, pinned: false, order: 7 },
  { id: 'bestsellers', title: 'Top Selling Bouquets', visible: true, pinned: false, order: 8 },
  { id: 'geographics', title: 'Geographic Sales & Gateway Breakdown', visible: true, pinned: false, order: 9 },
  { id: 'gifting', title: 'Gifting Occasions & Conversion Funnels', visible: true, pinned: false, order: 10 },
];

const AdminDashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityItem[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Controls
  const [period, setPeriod] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  
  // Custom date selector states
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Dashboard customization state
  const [layout, setLayout] = useState<WidgetLayout[]>(() => {
    const saved = localStorage.getItem('sbf_admin_dashboard_layout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  const { formatPrice } = useCurrency();
  const { notifications, unreadCount, markAllAsRead, isConnected, enableSounds, toggleSounds } = useNotification();
  const { toast } = useToast();
  const navigate = useNavigate();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);

      let queryParams = `?period=${period}`;
      if (period === 'custom') {
        if (customStartDate && customEndDate) {
          queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
        }
      }

      const [statsRes, ordersRes, productsRes, chartRes, timelineRes, lowStockRes] = await Promise.all([
        api.get(`/dashboard${queryParams}`),
        api.get('/dashboard/recent-orders'),
        api.get('/dashboard/top-products'),
        api.get(`/dashboard/sales-data${queryParams}`),
        api.get('/dashboard/activity-timeline'),
        api.get('/products/admin/low-stock?threshold=10')
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
      setTopProducts(productsRes.data);
      setSalesChartData(chartRes.data);
      setActivityTimeline(timelineRes.data);
      setLowStockProducts(lowStockRes.data.products || []);
      setLastUpdated(new Date());

      if (showToast) {
        toast({
          title: "Dashboard Synced",
          description: `All stats updated from Mongo database at ${new Date().toLocaleTimeString()}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to sync live business command center metrics.');
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: err.response?.data?.message || "Database connection error."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, customStartDate, customEndDate, toast]);

  // Setup auto polling
  useEffect(() => {
    fetchDashboardData();

    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        fetchDashboardData(false);
      }, 30000); // 30 seconds
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchDashboardData, autoRefresh]);

  // Quick action mutations
  const handleQuickUpdateStock = async (productId: string, currentStock: number) => {
    try {
      const newStock = currentStock + 10;
      await api.put(`/products/admin/${productId}`, { countInStock: newStock });
      toast({ title: "Stock Replenished", description: `Added 10 units of stock successfully.` });
      fetchDashboardData();
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Catalog failed to process mutation." });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast({ title: "Order Processed", description: `Order status shifted to "${newStatus.replace('_', ' ')}"` });
      fetchDashboardData();
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Failed to dispatch order status change." });
    }
  };

  // Personalization actions
  const saveLayout = (newLayout: WidgetLayout[]) => {
    setLayout(newLayout);
    localStorage.setItem('sbf_admin_dashboard_layout', JSON.stringify(newLayout));
  };

  const togglePinWidget = (id: string) => {
    const updated = layout.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w);
    saveLayout(updated);
  };

  const toggleVisibility = (id: string) => {
    const updated = layout.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveLayout(updated);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...layout];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx >= 0 && targetIdx < newLayout.length) {
      const temp = newLayout[index];
      newLayout[index] = newLayout[targetIdx];
      newLayout[targetIdx] = temp;
      saveLayout(newLayout.map((w, idx) => ({ ...w, order: idx + 1 })));
    }
  };

  const resetLayout = () => {
    saveLayout(DEFAULT_LAYOUT);
    toast({ title: "Layout Reset", description: "Dashboard configurations restored to factory settings." });
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-2" />
        <span className="text-slate-600 font-medium">Powering up executive command center...</span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6 max-w-md mx-auto my-12 text-center bg-white border rounded-2xl shadow-xl">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Sync Connection Terminated</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => fetchDashboardData(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <RefreshCw className="h-4 w-4 mr-2" /> Reconnect
        </Button>
      </div>
    );
  }

  // Sorted layout categories
  const pinnedWidgets = layout.filter(w => w.pinned && w.visible);
  const standardWidgets = layout.filter(w => !w.pinned && w.visible);
  const orderedWidgets = [...pinnedWidgets, ...standardWidgets];

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-[1600px] mx-auto print:p-0">
      
      {/* Top Header Command Bar */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600 animate-pulse" />
              SBF Command Center
            </h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">
              Live BI
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Sync Updated: {lastUpdated.toLocaleTimeString()}
            </span>
            {isConnected ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <Wifi className="h-3 w-3 animate-ping" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-500 font-bold">
                <WifiOff className="h-3 w-3" /> Disconnected
              </span>
            )}
          </div>
        </div>

        {/* Dashboard Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Layout personalization configurations */}
          <Button
            onClick={() => setShowConfig(!showConfig)}
            variant="outline"
            size="sm"
            className={`h-9 gap-1.5 ${showConfig ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white'}`}
          >
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">Personalize</span>
          </Button>

          {/* Sound Toggle */}
          <Button 
            onClick={toggleSounds}
            variant={enableSounds ? "default" : "outline"}
            size="sm"
            className="h-9 w-9 p-0"
            title={enableSounds ? 'Sounds Enabled' : 'Sounds Muted'}
          >
            {enableSounds ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {/* Live Auto refresh mode toggle */}
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1.5 font-bold"
          >
            <Zap className={`h-4 w-4 ${autoRefresh ? 'animate-bounce text-yellow-300' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{autoRefresh ? 'Live Mode' : 'Manual'}</span>
          </Button>

          {/* Time range parameters */}
          <Select value={period} onValueChange={(val) => {
            setPeriod(val);
            if (val !== 'custom') {
              setTimeout(() => fetchDashboardData(true), 50);
            }
          }}>
            <SelectTrigger className="w-[130px] text-xs h-9 bg-white border shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={() => fetchDashboardData(true)}
            variant="outline"
            size="sm"
            className="h-9 px-3 bg-white"
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 text-slate-500" />}
          </Button>
        </div>
      </div>

      {/* Custom Date Range selector panel */}
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white border rounded-xl shadow-inner print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">From:</span>
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs border rounded bg-white"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">To:</span>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs border rounded bg-white"
            />
          </div>
          <Button 
            size="sm" 
            onClick={() => fetchDashboardData(true)}
            className="bg-indigo-600 hover:bg-indigo-700 h-8 text-white px-3"
            disabled={!customStartDate || !customEndDate}
          >
            Apply Dates
          </Button>
        </div>
      )}

      {/* Personalization configuration panel */}
      {showConfig && (
        <Card className="border-dashed border-2 border-indigo-200 bg-slate-50/50 print:hidden animate-in fade-in duration-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-indigo-900">Custom Layout Management</CardTitle>
              <Button size="sm" variant="ghost" className="text-xs text-indigo-700 hover:text-indigo-900" onClick={resetLayout}>Reset Factory Order</Button>
            </div>
            <CardDescription className="text-xs">Rearrange, pin, or collapse cards and blocks to customize your command dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              {layout.map((item, idx) => (
                <div key={item.id} className="p-2 border rounded-lg bg-white shadow-sm flex flex-col justify-between gap-1.5 hover:border-indigo-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 truncate max-w-[100px]">{item.title}</span>
                    <Badge variant={item.visible ? "default" : "secondary"} className="text-[9px] px-1 py-0">{item.visible ? 'Show' : 'Hidden'}</Badge>
                  </div>
                  <div className="flex items-center justify-between border-t pt-1.5">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-5 w-5 p-0" disabled={idx === 0} onClick={() => moveWidget(idx, 'up')}><ChevronUp className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-5 w-5 p-0" disabled={idx === layout.length - 1} onClick={() => moveWidget(idx, 'down')}><ChevronDown className="h-3 w-3" /></Button>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className={`h-5 w-5 p-0 ${item.pinned ? 'text-indigo-600' : 'text-slate-400'}`} onClick={() => togglePinWidget(item.id)}><Pin className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className={`h-5 w-5 p-0 ${item.visible ? 'text-slate-600' : 'text-rose-500'}`} onClick={() => toggleVisibility(item.id)}><X className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Rendered Grid */}
      <div className="space-y-6">
        {orderedWidgets.map(widget => {
          
          // ─── 1. AI INSIGHTS WIDGET ───
          if (widget.id === 'insights') {
            return (
              <div key={widget.id} className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-in slide-in-from-top duration-300">
                <Card className="lg:col-span-3 border border-slate-200 shadow-md relative overflow-hidden bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <div className="absolute -right-6 -bottom-6 opacity-10"><Zap className="h-32 w-32" /></div>
                  <CardHeader className="pb-1 pt-4 px-4 sm:px-6">
                    <CardTitle className="text-sm font-bold tracking-wider uppercase opacity-85 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 animate-bounce" /> Executive Insights Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {stats?.insights && stats.insights.length > 0 ? (
                        stats.insights.map((insight, idx) => (
                          <div key={idx} className="p-3 bg-white/10 rounded-xl backdrop-blur-md flex items-start gap-2 border border-white/10 hover:bg-white/15 transition-all">
                            <Check className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                            <p className="leading-snug">{insight}</p>
                          </div>
                        ))
                      ) : (
                        <p className="p-3 text-slate-200">Database analysis in progress... No anomalies detected.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance stats mini panel */}
                <Card className="border border-slate-200 shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-75">Funnel Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 px-4 space-y-3.5 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="opacity-75">Cart Additions Conversion</span>
                        <strong>{stats?.conversions.cart}%</strong>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${stats?.conversions.cart || 8}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="opacity-75">Checkout Session Success</span>
                        <strong>{stats?.conversions.checkout}%</strong>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${stats?.conversions.checkout || 98}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          }

          // ─── 2. KPI CARDS WIDGET ───
          if (widget.id === 'kpis') {
            return (
              <div key={widget.id} className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-300">
                
                {/* KPI Card 1: Today Revenue */}
                <Card className="border hover:shadow-lg transition-all duration-300 bg-white">
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Today's Revenue</span>
                    <DollarSign className="h-4.5 w-4.5 text-indigo-600" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{formatPrice(stats?.revenue.today || 0)}</h3>
                    <div className="text-[10px] text-slate-400 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500 mr-0.5" />
                      <span>Sync values live</span>
                    </div>
                  </CardContent>
                </Card>

                {/* KPI Card 2: Today Orders */}
                <Card className="border hover:shadow-lg transition-all duration-300 bg-white">
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Today's Orders</span>
                    <ShoppingCart className="h-4.5 w-4.5 text-emerald-500" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{stats?.sales.today || 0} orders</h3>
                    <div className="text-[10px] text-slate-400 flex items-center mt-1">
                      <Clock className="h-3 w-3 text-slate-400 mr-0.5" />
                      <span>Today's active log</span>
                    </div>
                  </CardContent>
                </Card>

                {/* KPI Card 3: Gift Orders */}
                <Card className="border hover:shadow-lg transition-all duration-300 bg-white">
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Gift Deliveries</span>
                    <Gift className="h-4.5 w-4.5 text-pink-500" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{stats?.giftOrders.total || 0} orders</h3>
                    <div className="text-[10px] text-slate-400 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 text-pink-500 mr-0.5" />
                      <span>Recipient messaging active</span>
                    </div>
                  </CardContent>
                </Card>

                {/* KPI Card 4: Low stock alert */}
                <Card className={`border hover:shadow-lg transition-all duration-300 ${stats?.inventory.lowStock && stats.inventory.lowStock > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white'}`}>
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Stock Alert</span>
                    <Package className="h-4.5 w-4.5 text-amber-500" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                      {stats?.inventory.lowStock || 0} items low
                    </h3>
                    <div className="text-[10px] text-slate-400 flex items-center mt-1">
                      <AlertTriangle className={`h-3 w-3 mr-0.5 ${stats?.inventory.lowStock && stats.inventory.lowStock > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                      <span>Stock threshold &lt; 10</span>
                    </div>
                  </CardContent>
                </Card>

              </div>
            );
          }

          // ─── 3. REVENUE CHART WIDGET ───
          if (widget.id === 'sales_chart') {
            return (
              <Card key={widget.id} className="border shadow-md">
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                        Executive Revenue Timeline
                      </CardTitle>
                      <CardDescription className="text-xs">Timeline of net sales and order volumes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={salesChartData}>
                      <defs>
                        <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.35}/>
                          <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#cbd5e1" tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(val, name) => name === 'total' ? [formatPrice(val as number), 'Revenue'] : [val, name]} />
                      <Area type="monotone" dataKey="total" stroke={PRIMARY_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#dashboardRevenue)" name="Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          }

          // ─── 4. ORDERS STATUS TRACK WIDGET ───
          if (widget.id === 'status_track') {
            return (
              <Card key={widget.id} className="border shadow-md">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-base font-bold">Fulfillment Status Tracking</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {stats?.ordersByStatus.map((item, idx) => (
                      <div key={idx} className="p-3 border rounded-xl bg-slate-50/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <span className="text-[10px] text-slate-400 capitalize font-bold">{item.status.replace('_', ' ')}</span>
                          <h4 className="text-xl font-extrabold text-slate-800 mt-1">{item.count}</h4>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${item.percentage}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 block font-mono">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }

          // ─── 5. RECENT ORDERS TABLE WIDGET ───
          if (widget.id === 'recent_orders') {
            return (
              <Card key={widget.id} className="border shadow-md">
                <CardHeader className="pb-2 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold">Recent eCommerce Orders</CardTitle>
                  <Button size="sm" variant="ghost" className="text-xs text-indigo-600 font-bold" onClick={() => navigate('/admin/orders')}>View Ledger</Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                        <th className="p-3">Order Number</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Recipient</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Worker Assignment</th>
                        <th className="p-3">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-3 font-semibold text-slate-700 font-mono flex items-center gap-2 flex-wrap">
                            {order.orderNumber}
                            {order.isTestOrder && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                🧪 INTERNAL TEST ORDER
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">{order.customer}</td>
                          <td className="p-3 text-slate-500 capitalize">{order.recipientName}</td>
                          <td className="p-3 text-slate-800 font-bold">{formatPrice(order.amount)}</td>
                          <td className="p-3">
                            <Select 
                              value={order.status} 
                              onValueChange={(val) => handleUpdateOrderStatus(order.id, val)}
                            >
                              <SelectTrigger className="w-[120px] text-[10px] py-0.5 px-2 h-7 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="text-xs">
                                <SelectItem value="order_placed">Placed</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="being_made">Preparing</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3 text-slate-500 font-medium">{order.assignedWorker}</td>
                          <td className="p-3 flex items-center gap-1.5">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" title="View details" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" title="Print Invoice" onClick={() => navigate(`/admin/orders/${order.id}?print=true`)}>
                              <Printer className="h-3 w-3 text-slate-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            );
          }

          // ─── 6. LOW STOCK WATCHLIST WIDGET ───
          if (widget.id === 'low_stock') {
            return (
              <Card key={widget.id} className="border shadow-md border-l-4 border-l-amber-500">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                    <CardTitle className="text-base font-bold text-slate-800">Critical Stock Inventory Replenishment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                  <div className="divide-y text-xs">
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map(p => (
                        <div key={p._id} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700 truncate max-w-[260px]">{p.title}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{p.category} • {formatPrice(p.price)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="destructive" className="font-bold font-mono px-2 py-0.5">
                              {p.countInStock} Left
                            </Badge>
                            <Button 
                              size="sm" 
                              onClick={() => handleQuickUpdateStock(p._id, p.countInStock)}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-7 py-1 px-3 text-[10px]"
                            >
                              +10 Units
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                              className="h-7 text-slate-500 border-slate-200"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-6 text-center text-slate-400">All products are adequately stocked.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }

          // ─── 7. LIVE ACTIVITY TIMELINE WIDGET ───
          if (widget.id === 'timeline') {
            return (
              <Card key={widget.id} className="border shadow-md">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    <Activity className="h-4.5 w-4.5 text-indigo-600" />
                    Live Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 max-h-[350px] overflow-y-auto space-y-4">
                  {activityTimeline.length > 0 ? (
                    activityTimeline.map((item, idx) => (
                      <div key={item.id} className="flex gap-3 text-xs relative">
                        {idx !== activityTimeline.length - 1 && (
                          <div className="absolute top-5 left-2.5 bottom-0 w-0.5 bg-slate-100 -mb-4" />
                        )}
                        <div className={`w-5.5 h-5.5 rounded-full shrink-0 flex items-center justify-center ${
                          item.type === 'order' ? 'bg-indigo-50 text-indigo-600' :
                          item.type === 'delivery' ? 'bg-emerald-50 text-emerald-600' :
                          item.type === 'user' ? 'bg-amber-50 text-amber-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          <SparklineIcon className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          <p className="text-slate-500 leading-relaxed mt-0.5">{item.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            {new Date(item.timestamp).toLocaleTimeString()} • {item.user}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 text-xs py-16">No operations logged in timeline.</p>
                  )}
                </CardContent>
              </Card>
            );
          }

          // ─── 8. TOP SELLERS PRODUCTS WIDGET ───
          if (widget.id === 'bestsellers') {
            return (
              <Card key={widget.id} className="border shadow-md">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-base font-bold">Top 10 Selling Products</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {topProducts.slice(0, 5).map((p, idx) => (
                    <div key={p.id} className="p-2 border rounded-xl bg-white shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="w-full aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-slate-300" />
                        )}
                      </div>
                      <div className="mt-2 min-w-0">
                        <p className="font-bold text-slate-700 text-xs truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{p.category}</p>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between items-center text-xs">
                        <span className="font-black text-slate-800">{p.sold} Sold</span>
                        <span className="text-indigo-600 font-bold">{formatPrice(p.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          }

          // ─── 9. GEOGRAPHICS AND PAYMENTS WIDGET ───
          if (widget.id === 'geographics') {
            return (
              <div key={widget.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Geographic sales breakdown */}
                <Card className="border shadow-md">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                      <MapPin className="h-4.5 w-4.5 text-indigo-600" />
                      Geographic Sales Split
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                          <th className="p-3">City Region</th>
                          <th className="p-3">Orders Count</th>
                          <th className="p-3">Sales (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats?.geographicSales && stats.geographicSales.length > 0 ? (
                          stats.geographicSales.slice(0, 5).map((g, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-700 capitalize">{g.city}</td>
                              <td className="p-3 text-slate-600 font-mono">{g.orders}</td>
                              <td className="p-3 font-bold text-slate-800">{formatPrice(g.revenue)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-6 text-center text-slate-400">No geo values compiled.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Gateway Breakdown donut chart */}
                <Card className="border shadow-md">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                      <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
                      Payment Gateways Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <ResponsiveContainer width="45%" height={160}>
                      <PieChart>
                        <Pie
                          data={stats?.paymentMethods}
                          cx="50%"
                          cy="50%"
                          outerRadius={55}
                          innerRadius={35}
                          paddingAngle={2}
                          dataKey="transactions"
                        >
                          {stats?.paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-[50%] space-y-2 text-xs">
                      {stats?.paymentMethods.map((pm, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="font-semibold text-slate-700 capitalize truncate">{pm.method}</span>
                          </div>
                          <span className="font-bold text-slate-800">{pm.transactions} tx</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>
            );
          }

          // ─── 10. GIFT OCCASIONS WIDGET ───
          if (widget.id === 'gifting') {
            return (
              <Card key={widget.id} className="border shadow-md">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    <Gift className="h-4.5 w-4.5 text-indigo-600" />
                    Gift Occasions Track
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={stats?.giftOrders.occasions.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="occasion" tick={{ fontSize: 9 }} stroke="#cbd5e1" />
                        <YAxis tick={{ fontSize: 9 }} stroke="#cbd5e1" />
                        <Tooltip />
                        <Bar dataKey="count" fill={SECONDARY_COLOR} radius={[4, 4, 0, 0]} name="Occasion Count" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="space-y-3.5 text-xs pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Greeting Card Attachment Ratio:</span>
                        <strong className="text-slate-700">
                          {stats?.giftOrders.total && stats.giftOrders.total > 0
                            ? `${((stats.giftOrders.greetingCard / stats.giftOrders.total) * 100).toFixed(0)}%`
                            : '0%'}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Anonymous Deliveries requested:</span>
                        <strong className="text-slate-700">{stats?.giftOrders.anonymous} orders</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Surprise Deliveries requested:</span>
                        <strong className="text-slate-700">{stats?.giftOrders.surprise} orders</strong>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return null;
        })}
      </div>

      {/* Floating Quick Action Panel */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <Select onValueChange={(val) => {
          if (val === 'prod') navigate('/admin/products/new');
          else if (val === 'cat') navigate('/admin/categories');
          else if (val === 'coupon') navigate('/admin/promocodes');
          else if (val === 'orders') navigate('/admin/orders');
          else if (val === 'analytics') navigate('/admin/analytics');
        }}>
          <SelectTrigger className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl p-0 flex items-center justify-center border-none">
            <Plus className="h-6 w-6 text-white" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="prod">Add Product</SelectItem>
            <SelectItem value="cat">Add Category</SelectItem>
            <SelectItem value="coupon">Create Coupon</SelectItem>
            <SelectItem value="orders">Manage Orders</SelectItem>
            <SelectItem value="analytics">View Analytics</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );
};

export default AdminDashboardHome;
