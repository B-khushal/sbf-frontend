import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Area, 
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Clock,
  Activity,
  BarChart3,
  Zap,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Gift,
  MapPin,
  CreditCard,
  Eye,
  Plus,
  Sliders,
  ChevronDown,
  ChevronUp,
  Pin,
  Printer,
  Grid,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import api from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  NeumorphicCard,
  StatCard,
  SoftButton,
  StatusBadge,
  PageHeader
} from '@/components/dashboard';

const SparklineIcon = TrendingUp;

// SBF Brand Tinted Palette for Charts
const SBF_PALETTE = ['#e11d48', '#059669', '#d97706', '#ec4899', '#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e'];
const PRIMARY_ROSE = '#e11d48';
const EMERALD_ACCENT = '#059669';

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
  const { isConnected, enableSounds, toggleSounds } = useNotification();
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
          description: `All stats updated from database at ${new Date().toLocaleTimeString()}`,
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[var(--sbf-canvas)]">
        <div className="w-16 h-16 rounded-2xl sbf-neumo-raised flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>
        <span className="text-slate-700 font-semibold text-sm">Powering up executive command center...</span>
        <span className="text-slate-400 text-xs mt-1">Fetching live florist business intelligence</span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-8 max-w-md mx-auto my-16 text-center sbf-neumo-raised rounded-3xl bg-[var(--sbf-canvas)]">
        <div className="w-14 h-14 rounded-2xl sbf-neumo-inset flex items-center justify-center mx-auto mb-4 text-rose-500">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1.5">Sync Connection Terminated</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{error}</p>
        <SoftButton onClick={() => fetchDashboardData(true)} variant="primary" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" /> Reconnect Database
        </SoftButton>
      </div>
    );
  }

  // Sorted layout categories
  const pinnedWidgets = layout.filter(w => w.pinned && w.visible);
  const standardWidgets = layout.filter(w => !w.pinned && w.visible);
  const orderedWidgets = [...pinnedWidgets, ...standardWidgets];

  return (
    <div className="space-y-6 max-w-[1600px] 2xl:max-w-9xl mx-auto print:p-0">
      
      {/* Neumorphic Page Header & Live Controls */}
      <PageHeader
        title="Florist Command Center"
        subtitle="Executive business intelligence, real-time orders, inventory & conversion funnels"
        badge={
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-sm">
            <Sparkles className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>Live BI</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Status indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl sbf-neumo-inset-sm text-xs font-mono font-medium text-slate-500 bg-[var(--sbf-card)]">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{lastUpdated.toLocaleTimeString()}</span>
              {isConnected ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold ml-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500 font-bold ml-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Offline
                </span>
              )}
            </div>

            {/* Layout Personalization */}
            <SoftButton
              onClick={() => setShowConfig(!showConfig)}
              variant={showConfig ? 'inset' : 'raised'}
              size="sm"
              className={showConfig ? 'text-rose-600 font-bold' : ''}
              title="Personalize dashboard layout"
            >
              <Grid className="h-3.5 w-3.5 mr-1.5" />
              <span>Personalize</span>
            </SoftButton>

            {/* Sound Toggle */}
            <SoftButton 
              onClick={toggleSounds}
              variant={enableSounds ? 'inset' : 'raised'}
              size="icon"
              title={enableSounds ? 'Audio alerts active' : 'Audio alerts muted'}
            >
              {enableSounds ? <Volume2 className="h-4 w-4 text-rose-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </SoftButton>

            {/* Live Auto refresh mode toggle */}
            <SoftButton 
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'inset' : 'raised'}
              size="sm"
              className={autoRefresh ? 'text-rose-600 font-bold' : ''}
            >
              <Zap className={`h-3.5 w-3.5 mr-1.5 ${autoRefresh ? 'text-amber-500 fill-amber-500 animate-bounce' : 'text-slate-400'}`} />
              <span>{autoRefresh ? 'Live' : 'Manual'}</span>
            </SoftButton>

            {/* Time range selector */}
            <div className="relative">
              <Select
                value={period}
                onValueChange={(val) => {
                  setPeriod(val);
                  if (val !== 'custom') {
                    setTimeout(() => fetchDashboardData(true), 50);
                  }
                }}
              >
                <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl sbf-neumo-inset-sm border-none bg-[var(--sbf-card)] font-medium text-slate-700 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 shadow-xl bg-white text-xs">
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <SoftButton 
              onClick={() => fetchDashboardData(true)}
              variant="raised"
              size="icon"
              disabled={refreshing}
              title="Sync metrics now"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 ${refreshing ? 'animate-spin text-rose-600' : ''}`} />
            </SoftButton>
          </div>
        }
      />

      {/* Custom Date Range selector panel */}
      {period === 'custom' && (
        <NeumorphicCard variant="inset" className="p-4 print:hidden">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-slate-600">Select Custom Period:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">From</span>
              <input 
                type="date" 
                value={customStartDate} 
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] border-none text-slate-700 font-mono focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">To</span>
              <input 
                type="date" 
                value={customEndDate} 
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] border-none text-slate-700 font-mono focus:outline-none"
              />
            </div>
            <SoftButton 
              size="sm" 
              variant="primary"
              onClick={() => fetchDashboardData(true)}
              disabled={!customStartDate || !customEndDate}
            >
              Apply Filter
            </SoftButton>
          </div>
        </NeumorphicCard>
      )}

      {/* Personalization configuration panel */}
      {showConfig && (
        <NeumorphicCard variant="raised" className="p-5 print:hidden animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200/60">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Custom Widget Management</h3>
              <p className="text-xs text-slate-500">Pin, rearrange, or toggle visibility of each dashboard module</p>
            </div>
            <SoftButton size="sm" variant="ghost" onClick={resetLayout} className="text-xs text-rose-600">
              Reset Layout
            </SoftButton>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
            {layout.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl sbf-neumo-raised-sm bg-[var(--sbf-card)] flex flex-col justify-between gap-2 border border-slate-200/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 truncate max-w-[100px]">{item.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      item.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.visible ? 'Show' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <div className="flex gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveWidget(idx, 'up')}
                      className="p-1 rounded-lg hover:bg-slate-200/60 disabled:opacity-30 text-slate-600"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      disabled={idx === layout.length - 1}
                      onClick={() => moveWidget(idx, 'down')}
                      className="p-1 rounded-lg hover:bg-slate-200/60 disabled:opacity-30 text-slate-600"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePinWidget(item.id)}
                      className={`p-1 rounded-lg hover:bg-slate-200/60 ${item.pinned ? 'text-rose-600' : 'text-slate-400'}`}
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => toggleVisibility(item.id)}
                      className={`p-1 rounded-lg hover:bg-slate-200/60 ${item.visible ? 'text-slate-600' : 'text-rose-500'}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NeumorphicCard>
      )}

      {/* Dashboard Rendered Grid */}
      <div className="space-y-6">
        {orderedWidgets.map(widget => {
          
          // ─── 1. AI INSIGHTS WIDGET ───
          if (widget.id === 'insights') {
            return (
              <div key={widget.id} className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-in slide-in-from-top duration-300">
                <NeumorphicCard
                  className="lg:col-span-3 p-5 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 text-white relative overflow-hidden"
                  variant="raised"
                >
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    <Zap className="h-44 w-44" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                      <Zap className="h-4 w-4 text-white animate-bounce" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                      Executive Intelligence Engine
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {stats?.insights && stats.insights.length > 0 ? (
                      stats.insights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white/10 rounded-2xl backdrop-blur-md flex items-start gap-2.5 border border-white/15 hover:bg-white/20 transition-all shadow-inner"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                          <p className="leading-relaxed text-white/95">{insight}</p>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-rose-100">Database analysis in progress... No anomalies detected.</p>
                    )}
                  </div>
                </NeumorphicCard>

                {/* Conversion Funnel Mini Panel */}
                <NeumorphicCard className="p-5 flex flex-col justify-between" variant="raised">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                      Conversion Funnels
                    </span>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-600 font-medium">Cart Additions</span>
                          <strong className="text-slate-800 font-mono">{stats?.conversions.cart}%</strong>
                        </div>
                        <div className="w-full sbf-neumo-inset-sm rounded-full h-2 bg-[var(--sbf-card)] p-0.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(stats?.conversions.cart || 8, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-600 font-medium">Checkout Success</span>
                          <strong className="text-slate-800 font-mono">{stats?.conversions.checkout}%</strong>
                        </div>
                        <div className="w-full sbf-neumo-inset-sm rounded-full h-2 bg-[var(--sbf-card)] p-0.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(stats?.conversions.checkout || 98, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 mt-3 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Performance Health</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Optimal
                    </span>
                  </div>
                </NeumorphicCard>
              </div>
            );
          }

          // ─── 2. KPI CARDS WIDGET ───
          if (widget.id === 'kpis') {
            return (
              <div key={widget.id} className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-300">
                <StatCard
                  title="Today's Revenue"
                  value={formatPrice(stats?.revenue.today || 0)}
                  icon={DollarSign}
                  iconColor="text-rose-600"
                  iconBg="bg-rose-50"
                  trend={{
                    value: `${stats?.revenue.percentChange || 0}%`,
                    isPositive: (stats?.revenue.percentChange || 0) >= 0,
                    label: 'vs yesterday'
                  }}
                  comparison="Real-time synchronized"
                />

                <StatCard
                  title="Today's Orders"
                  value={`${stats?.sales.today || 0} orders`}
                  icon={ShoppingCart}
                  iconColor="text-emerald-600"
                  iconBg="bg-emerald-50"
                  trend={{
                    value: `${stats?.sales.pending || 0} pending`,
                    isPositive: true,
                    label: 'active pipeline'
                  }}
                  comparison="Today's live register"
                />

                <StatCard
                  title="Gift Deliveries"
                  value={`${stats?.giftOrders.total || 0} orders`}
                  icon={Gift}
                  iconColor="text-pink-600"
                  iconBg="bg-pink-50"
                  trend={{
                    value: `${stats?.giftOrders.surprise || 0} surprise`,
                    isPositive: true,
                    label: 'deliveries'
                  }}
                  comparison="Recipient messaging active"
                />

                <StatCard
                  title="Stock Inventory"
                  value={`${stats?.inventory.lowStock || 0} low stock`}
                  icon={Package}
                  iconColor={stats?.inventory.lowStock && stats.inventory.lowStock > 0 ? 'text-amber-600' : 'text-slate-600'}
                  iconBg={stats?.inventory.lowStock && stats.inventory.lowStock > 0 ? 'bg-amber-50' : 'bg-slate-50'}
                  trend={{
                    value: stats?.inventory.lowStock && stats.inventory.lowStock > 0 ? 'Action needed' : 'Healthy',
                    isPositive: !stats?.inventory.lowStock || stats.inventory.lowStock === 0,
                    label: 'inventory status'
                  }}
                  comparison="Threshold < 10 stems"
                />
              </div>
            );
          }

          // ─── 3. REVENUE CHART WIDGET ───
          if (widget.id === 'sales_chart') {
            return (
              <NeumorphicCard
                key={widget.id}
                title="Executive Revenue Timeline"
                description="Timeline of net revenue and volume progression across selected period"
                headerIcon={BarChart3}
                variant="raised"
              >
                <div className="pt-2">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sbfNeumoRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PRIMARY_ROSE} stopOpacity={0.35}/>
                          <stop offset="95%" stopColor={PRIMARY_ROSE} stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                          fontSize: '12px'
                        }}
                        formatter={(val, name) => name === 'total' ? [formatPrice(val as number), 'Revenue'] : [val, name]}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={PRIMARY_ROSE}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#sbfNeumoRevenue)"
                        name="Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </NeumorphicCard>
            );
          }

          // ─── 4. ORDERS STATUS TRACK WIDGET ───
          if (widget.id === 'status_track') {
            return (
              <NeumorphicCard
                key={widget.id}
                title="Fulfillment Status Pipeline"
                description="Live progression of customer flower & gift orders across processing stages"
                variant="raised"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {stats?.ordersByStatus.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl sbf-neumo-inset-sm bg-[var(--sbf-card)] flex flex-col justify-between"
                    >
                      <div>
                        <StatusBadge status={item.status} size="sm" />
                        <h4 className="text-xl font-extrabold text-slate-800 mt-2 font-mono">{item.count}</h4>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-rose-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block font-mono font-medium">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </NeumorphicCard>
            );
          }

          // ─── 5. RECENT ORDERS TABLE WIDGET ───
          if (widget.id === 'recent_orders') {
            return (
              <NeumorphicCard
                key={widget.id}
                title="Live Recent eCommerce Orders"
                description="Real-time order transactions placed across sbflorist.in"
                headerActions={
                  <SoftButton
                    size="sm"
                    variant="ghost"
                    className="text-xs text-rose-600 font-bold"
                    onClick={() => navigate('/admin/orders')}
                  >
                    View All Orders →
                  </SoftButton>
                }
                variant="raised"
              >
                <div className="overflow-x-auto -mx-5 -mb-5">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-slate-200/70 bg-slate-100/40 text-slate-500 font-semibold">
                        <th className="p-3.5 pl-5">Order ID</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Recipient</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Assigned Worker</th>
                        <th className="p-3.5 pr-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {recentOrders.map(order => (
                        <tr key={order.id} className="hover:bg-white/60 transition-colors">
                          <td className="p-3.5 pl-5 font-bold text-slate-800 font-mono flex items-center gap-2 flex-wrap">
                            <span>#{order.orderNumber}</span>
                            {order.isTestOrder && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                TEST
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-700 font-medium">{order.customer}</td>
                          <td className="p-3.5 text-slate-600 capitalize">{order.recipientName}</td>
                          <td className="p-3.5 text-slate-900 font-bold font-mono">{formatPrice(order.amount)}</td>
                          <td className="p-3.5">
                            <Select 
                              value={order.status} 
                              onValueChange={(val) => handleUpdateOrderStatus(order.id, val)}
                            >
                              <SelectTrigger className="w-[125px] text-[11px] h-7 rounded-lg sbf-neumo-inset-sm border-none bg-white font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="text-xs rounded-xl shadow-lg">
                                <SelectItem value="order_placed">Placed</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="being_made">Preparing</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">{order.assignedWorker || 'Unassigned'}</td>
                          <td className="p-3.5 pr-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <SoftButton
                                size="icon"
                                variant="raised"
                                className="h-7 w-7"
                                title="View details"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-600" />
                              </SoftButton>
                              <SoftButton
                                size="icon"
                                variant="raised"
                                className="h-7 w-7"
                                title="Print Invoice"
                                onClick={() => navigate(`/admin/orders/${order.id}?print=true`)}
                              >
                                <Printer className="h-3.5 w-3.5 text-slate-600" />
                              </SoftButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </NeumorphicCard>
            );
          }

          // ─── 6. LOW STOCK WATCHLIST WIDGET ───
          if (widget.id === 'low_stock') {
            return (
              <NeumorphicCard
                key={widget.id}
                title="Critical Inventory Watchlist"
                description="Products running below minimum safety threshold (stems < 10)"
                headerIcon={AlertTriangle}
                variant="raised"
              >
                <div className="divide-y divide-slate-200/50 max-h-[300px] overflow-y-auto -mx-5 -mb-5">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map(p => (
                      <div key={p._id} className="p-3.5 px-5 flex items-center justify-between hover:bg-white/60 transition-colors">
                        <div className="min-w-0 pr-4">
                          <p className="font-bold text-slate-800 truncate text-xs">{p.title}</p>
                          <p className="text-[11px] text-slate-500 capitalize">{p.category} • {formatPrice(p.price)}</p>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
                            {p.countInStock} Left
                          </span>
                          <SoftButton 
                            size="sm" 
                            variant="primary"
                            onClick={() => handleQuickUpdateStock(p._id, p.countInStock)}
                            className="h-7 px-2.5 text-[10px]"
                          >
                            +10 Units
                          </SoftButton>
                          <SoftButton 
                            size="sm" 
                            variant="raised"
                            onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                            className="h-7 px-2.5 text-[10px]"
                          >
                            Edit
                          </SoftButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-6 text-center text-slate-400 text-xs">All catalog stems and products are adequately stocked.</p>
                  )}
                </div>
              </NeumorphicCard>
            );
          }

          // ─── 7. LIVE ACTIVITY TIMELINE WIDGET ───
          if (widget.id === 'timeline') {
            return (
              <NeumorphicCard
                key={widget.id}
                title="Operational Activity Timeline"
                description="Real-time chronological events from warehouse, dispatch, and system logs"
                headerIcon={Activity}
                variant="raised"
              >
                <div className="max-h-[350px] overflow-y-auto space-y-3.5 pr-2">
                  {activityTimeline.length > 0 ? (
                    activityTimeline.map((item, idx) => (
                      <div key={item.id} className="flex gap-3 text-xs relative">
                        {idx !== activityTimeline.length - 1 && (
                          <div className="absolute top-6 left-3 bottom-0 w-0.5 bg-slate-200/70 -mb-3.5" />
                        )}
                        <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center sbf-neumo-raised-sm ${
                          item.type === 'order' ? 'text-rose-600 bg-rose-50' :
                          item.type === 'delivery' ? 'text-emerald-600 bg-emerald-50' :
                          item.type === 'user' ? 'text-amber-600 bg-amber-50' :
                          'text-slate-600 bg-slate-100'
                        }`}>
                          <SparklineIcon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          <p className="text-slate-600 leading-relaxed mt-0.5">{item.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            {new Date(item.timestamp).toLocaleTimeString()} • {item.user}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 text-xs py-12">No operations logged in timeline.</p>
                  )}
                </div>
              </NeumorphicCard>
            );
          }

          // ─── 8. TOP SELLERS PRODUCTS WIDGET ───
          if (widget.id === 'bestsellers') {
            return (
              <NeumorphicCard
                key={widget.id}
                title="Top 10 Selling Arrangements"
                description="Best performing floral bouquets, celebration cakes, and combos"
                headerIcon={TrendingUp}
                headerActions={<span className="text-xs font-semibold text-slate-500 font-mono">{topProducts.length} Items</span>}
                variant="raised"
              >
                {topProducts && topProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {topProducts.slice(0, 10).map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="p-2.5 rounded-2xl sbf-neumo-raised-sm bg-[var(--sbf-card)] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200"
                      >
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center sbf-neumo-inset-sm">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-8 w-8 text-slate-300" />
                          )}
                          <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="mt-2.5 min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate" title={p.name}>{p.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{p.category}</p>
                        </div>
                        <div className="border-t border-slate-200/60 pt-2 mt-2 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-600 font-mono">{p.sold} Sold</span>
                          <span className="text-rose-600 font-black font-mono">{formatPrice(p.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No top selling products recorded yet.
                  </div>
                )}
              </NeumorphicCard>
            );
          }

          // ─── 9. GEOGRAPHICS AND PAYMENTS WIDGET ───
          if (widget.id === 'geographics') {
            return (
              <div key={widget.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Geographic sales breakdown */}
                <NeumorphicCard
                  title="Geographic Sales Distribution"
                  description="Regional order distribution across Hyderabad & Secunderabad"
                  headerIcon={MapPin}
                  variant="raised"
                >
                  <div className="overflow-x-auto -mx-5 -mb-5">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-y border-slate-200/70 bg-slate-100/40 text-slate-500 font-semibold">
                          <th className="p-3 pl-5">Region</th>
                          <th className="p-3">Orders</th>
                          <th className="p-3 pr-5 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50">
                        {stats?.geographicSales && stats.geographicSales.length > 0 ? (
                          stats.geographicSales.slice(0, 5).map((g, idx) => (
                            <tr key={idx} className="hover:bg-white/60">
                              <td className="p-3 pl-5 font-semibold text-slate-800 capitalize">{g.city}</td>
                              <td className="p-3 text-slate-600 font-mono">{g.orders}</td>
                              <td className="p-3 pr-5 text-right font-bold text-slate-900 font-mono">{formatPrice(g.revenue)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-6 text-center text-slate-400">No geo values compiled.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </NeumorphicCard>

                {/* Gateway Breakdown donut chart */}
                <NeumorphicCard
                  title="Payment Method Breakdown"
                  description="Gateway transactions split across Razorpay, UPI & COD"
                  headerIcon={CreditCard}
                  variant="raised"
                >
                  <div className="flex items-center justify-between pt-2">
                    <ResponsiveContainer width="45%" height={170}>
                      <PieChart>
                        <Pie
                          data={stats?.paymentMethods}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          innerRadius={40}
                          paddingAngle={3}
                          dataKey="transactions"
                        >
                          {stats?.paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SBF_PALETTE[index % SBF_PALETTE.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-[50%] space-y-2.5 text-xs pr-2">
                      {stats?.paymentMethods.map((pm, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                              style={{ backgroundColor: SBF_PALETTE[idx % SBF_PALETTE.length] }}
                            />
                            <span className="font-semibold text-slate-700 capitalize truncate">{pm.method}</span>
                          </div>
                          <span className="font-bold text-slate-900 font-mono">{pm.transactions} tx</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </NeumorphicCard>

              </div>
            );
          }

          // ─── 10. GIFT OCCASIONS WIDGET ───
          if (widget.id === 'gifting') {
            return (
              <NeumorphicCard
                key={widget.id}
                title="Gifting Occasions & Addon Analytics"
                description="Occasion breakdown, custom cards, and delivery preference metrics"
                headerIcon={Gift}
                variant="raised"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={stats?.giftOrders.occasions.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="occasion" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="count" fill={PRIMARY_ROSE} radius={[6, 6, 0, 0]} name="Occasion Count" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 text-xs pt-1">
                    <div className="p-3 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Greeting Card Attachment:</span>
                      <strong className="text-slate-900 font-mono font-bold">
                        {stats?.giftOrders.total && stats.giftOrders.total > 0
                          ? `${((stats.giftOrders.greetingCard / stats.giftOrders.total) * 100).toFixed(0)}%`
                          : '0%'}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Anonymous Deliveries:</span>
                      <strong className="text-slate-900 font-mono font-bold">{stats?.giftOrders.anonymous} orders</strong>
                    </div>
                    <div className="p-3 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Surprise Deliveries:</span>
                      <strong className="text-slate-900 font-mono font-bold">{stats?.giftOrders.surprise} orders</strong>
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
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
          <SelectTrigger className="w-13 h-13 rounded-2xl sbf-neumo-btn-primary p-0 flex items-center justify-center border-none shadow-2xl hover:scale-105 transition-transform duration-200 focus:ring-0">
            <Plus className="h-6 w-6 text-white" />
          </SelectTrigger>
          <SelectContent className="text-xs rounded-2xl shadow-2xl border border-slate-200">
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
