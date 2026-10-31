import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  Store,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { getVendorDashboard, VendorDashboardData } from '@/services/vendorService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import {
  NeumorphicCard,
  StatCard,
  SoftButton,
  StatusBadge,
  PageHeader
} from '@/components/dashboard';

const VendorDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { formatPrice, convertPrice } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      setRefreshing(true);
      const data = await getVendorDashboard();
      setDashboardData(data);
      
      if (showRefreshToast) {
        toast({
          title: "Dashboard Updated",
          description: "Your vendor dashboard data has been refreshed.",
        });
      }
    } catch (error) {
      console.error('Error fetching vendor dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span className="capitalize">Approved</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span className="capitalize">Pending Review</span>
          </span>
        );
      case 'suspended':
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            <span className="capitalize">{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
            <span className="capitalize">{status}</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[var(--sbf-canvas)]">
        <div className="w-16 h-16 rounded-2xl sbf-neumo-raised flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-600 border-t-transparent" />
        </div>
        <span className="text-slate-700 font-semibold text-sm">Loading vendor command center...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-md mx-auto my-16 text-center sbf-neumo-raised p-8 rounded-3xl bg-[var(--sbf-canvas)]">
        <Store className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800 mb-2">No vendor profile found</h2>
        <p className="text-xs text-slate-500 mb-6">You are not yet registered as an authorized vendor partner.</p>
        <SoftButton variant="primary" onClick={() => navigate('/vendor/register')}>
          Register as Vendor
        </SoftButton>
      </div>
    );
  }

  const { vendor, stats, recentOrders, lowStockProducts, charts } = dashboardData;

  return (
    <div className="space-y-6 max-w-[1600px] 2xl:max-w-9xl mx-auto">
      {/* Header */}
      <PageHeader
        title={vendor.storeName || 'Vendor Dashboard'}
        subtitle={`Partner account: ${vendor.storeName} • Subscription: ${vendor.subscription.plan} Plan`}
        badge={
          <div className="flex items-center gap-2">
            {getStatusBadge(vendor.status)}
            {vendor.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                Verified
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <SoftButton
              variant="raised"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              title="Refresh metrics"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 text-slate-600 ${refreshing ? 'animate-spin text-rose-600' : ''}`} />
              <span>Refresh</span>
            </SoftButton>
            <SoftButton size="sm" variant="primary" onClick={() => navigate('/vendor/profile')}>
              <Edit className="h-4 w-4 mr-1.5" />
              <span>Edit Profile</span>
            </SoftButton>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Store Sales"
          value={formatPrice(convertPrice(stats.totalRevenue))}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          comparison={`Monthly: ${formatPrice(convertPrice(stats.monthlyRevenue))}`}
        />

        <StatCard
          title="Your Net Earnings"
          value={formatPrice(convertPrice(stats.vendorEarnings))}
          icon={TrendingUp}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          comparison={`Monthly: ${formatPrice(convertPrice(stats.monthlyEarnings))}`}
        />

        <StatCard
          title="Total Orders"
          value={`${stats.totalOrders} orders`}
          icon={ShoppingCart}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          comparison={`This month: ${stats.monthlyOrders} orders`}
        />

        <StatCard
          title="Catalog Inventory"
          value={`${stats.totalProducts} items`}
          icon={Package}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          comparison={`Active listings: ${stats.activeProducts}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <NeumorphicCard
          title="Sales Progression"
          description="Revenue trend over recent billing periods"
          headerIcon={TrendingUp}
          variant="raised"
        >
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [formatPrice(convertPrice(val)), 'Sales']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#e11d48" 
                  strokeWidth={2.5}
                  dot={{ fill: '#e11d48', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </NeumorphicCard>

        {/* Top Products */}
        <NeumorphicCard
          title="Best Performing Products"
          description="Top sold arrangements from your catalog"
          headerIcon={BarChart3}
          variant="raised"
        >
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="title" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} units`, 'Total Sold']}
                />
                <Bar dataKey="totalSold" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeumorphicCard>
      </div>

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <NeumorphicCard
          title="Recent Store Orders"
          description="Latest transactions assigned to your store"
          headerIcon={ShoppingCart}
          headerActions={
            <SoftButton size="sm" variant="ghost" onClick={() => navigate('/vendor/orders')} className="text-xs text-rose-600 font-bold">
              View All Orders →
            </SoftButton>
          }
          variant="raised"
        >
          <div className="space-y-3 -mx-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-2xl sbf-neumo-inset-sm bg-[var(--sbf-card)]"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-xs font-mono">#{order.orderNumber}</p>
                    <p className="text-[11px] text-slate-600 font-medium">{order.user?.name || 'Customer'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} size="sm" />
                    <p className="text-xs font-black text-slate-900 font-mono mt-1.5">
                      {formatPrice(convertPrice(order.vendorTotal || order.totalPrice))}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-8 text-xs">No recent orders logged</p>
            )}
          </div>
        </NeumorphicCard>

        {/* Low Stock Alert */}
        <NeumorphicCard
          title="Low Stock Watchlist"
          description="Items requiring immediate inventory replenishment"
          headerIcon={AlertTriangle}
          headerActions={
            <SoftButton size="sm" variant="ghost" onClick={() => navigate('/vendor/products')} className="text-xs text-amber-600 font-bold">
              Manage Catalog →
            </SoftButton>
          }
          variant="raised"
        >
          <div className="space-y-3 -mx-2">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 rounded-2xl sbf-neumo-inset-sm bg-[var(--sbf-card)] border border-amber-200/50"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img 
                      src={product.images?.[0]} 
                      alt={product.title}
                      className="w-11 h-11 rounded-xl object-cover sbf-neumo-raised-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">{product.title}</p>
                      <p className="text-[11px] text-amber-700 font-medium">
                        {product.countInStock} items remaining
                      </p>
                    </div>
                  </div>
                  <SoftButton
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/vendor/products')}
                    className="shrink-0 text-xs h-7"
                  >
                    Restock
                  </SoftButton>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-8 text-xs">All catalog items adequately stocked</p>
            )}
          </div>
        </NeumorphicCard>
      </div>

      {/* Quick Action Tiles */}
      <NeumorphicCard title="Vendor Operations" description="One-click workflows for daily fulfillment" variant="raised">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <button 
            className="p-4 rounded-2xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-2.5 text-center transition-all group"
            onClick={() => navigate('/vendor/products/new')}
          >
            <div className="w-10 h-10 rounded-xl sbf-neumo-inset-sm flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Product</span>
          </button>

          <button 
            className="p-4 rounded-2xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-2.5 text-center transition-all group"
            onClick={() => navigate('/vendor/orders')}
          >
            <div className="w-10 h-10 rounded-xl sbf-neumo-inset-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">View Orders</span>
          </button>

          <button 
            className="p-4 rounded-2xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-2.5 text-center transition-all group"
            onClick={() => navigate('/vendor/analytics')}
          >
            <div className="w-10 h-10 rounded-xl sbf-neumo-inset-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Store Analytics</span>
          </button>

          <button 
            className="p-4 rounded-2xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-2.5 text-center transition-all group"
            onClick={() => navigate('/vendor/payouts')}
          >
            <div className="w-10 h-10 rounded-xl sbf-neumo-inset-sm flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Payout Ledger</span>
          </button>
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default VendorDashboard;
