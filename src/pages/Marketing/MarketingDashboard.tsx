import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Eye,
  ShoppingCart,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Percent,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Radio,
  Search,
  Megaphone,
  AlertTriangle,
  Lightbulb,
  Clock,
  Filter,
  RefreshCw,
  ShoppingBag,
  Flame,
  ChevronRight,
  Package,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { marketingService, DashboardOverviewResponse } from '@/services/marketingService';
import { toast } from 'sonner';

const COLORS = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#64748b'];

export const MarketingDashboard: React.FC = () => {
  // Default to 'all' (All Time) so all authoritative store orders, revenue (₹20,595), and carts are instantly visible
  const [timeframe, setTimeframe] = useState<string>('all');
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [trafficFilter, setTrafficFilter] = useState<string>('all');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getDashboardOverview({ timeframe });
      if (res?.success) {
        setData(res);
      }
    } catch (err: any) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [timeframe]);

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none w-full lg:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">Period:</span>
          {['all', '30d', '90d', '7d', 'today', 'yesterday'].map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-2.5 sm:px-3 h-8 rounded-lg font-medium transition-all shrink-0 ${
                timeframe === tf
                  ? 'bg-rose-600 text-white font-bold shadow-xs hover:bg-rose-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tf === 'all'
                ? 'All Time'
                : tf === '30d'
                ? 'Last 30 Days'
                : tf === '90d'
                ? 'Last 90 Days'
                : tf === '7d'
                ? 'Last 7 Days'
                : tf === 'today'
                ? 'Today'
                : 'Yesterday'}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="flex-1 sm:flex-none h-8 bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 outline-none focus:border-rose-500 shadow-xs min-w-[110px]"
          >
            <option value="all">All Devices</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
          </select>

          <select
            value={trafficFilter}
            onChange={(e) => setTrafficFilter(e.target.value)}
            className="flex-1 sm:flex-none h-8 bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 outline-none focus:border-rose-500 shadow-xs min-w-[130px]"
          >
            <option value="all">All Traffic Sources</option>
            <option value="instagram">Instagram</option>
            <option value="google">Google Search</option>
            <option value="direct">Direct</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchDashboard}
            disabled={loading}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg shrink-0"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Row 1: Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* Completed Authoritative Revenue */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-emerald-300 transition-all border-l-4 border-l-emerald-500">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 truncate">Store Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono truncate">
              {loading ? '—' : `₹${(kpis?.revenue || 0).toLocaleString()}`}
            </div>
            <p className="text-[10px] text-emerald-600 font-medium truncate">
              {loading ? '...' : `${kpis?.purchases || 0} completed orders`}
            </p>
          </CardContent>
        </Card>

        {/* Active Shopping Cart Pipeline */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-rose-300 transition-all border-l-4 border-l-rose-500">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-700 truncate">Cart Pipeline</span>
              <ShoppingCart className="w-4 h-4 text-rose-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-600 font-mono truncate">
              {loading ? '—' : `₹${(kpis?.activeCartPipelineValue || 0).toLocaleString()}`}
            </div>
            <p className="text-[10px] text-rose-600 font-medium truncate">
              {loading ? '...' : `${kpis?.activeCartPipelineCount || 0} active carts loaded`}
            </p>
          </CardContent>
        </Card>

        {/* Total Pipeline Value */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-indigo-300 transition-all border-l-4 border-l-indigo-500">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-700 truncate">Total Pipeline</span>
              <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-indigo-700 font-mono truncate">
              {loading ? '—' : `₹${((kpis?.revenue || 0) + (kpis?.activeCartPipelineValue || 0)).toLocaleString()}`}
            </div>
            <p className="text-[10px] text-indigo-600 font-medium truncate">
              Orders + Active Pipeline
            </p>
          </CardContent>
        </Card>

        {/* Total Visitors */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Total Visitors</span>
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono truncate">
              {loading ? '—' : (kpis?.totalVisitors || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 truncate">Storefront sessions</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Conversion Rate</span>
              <Percent className="w-4 h-4 text-rose-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-600 font-mono truncate">
              {loading ? '—' : kpis?.conversionRate || '0.00%'}
            </div>
            <p className="text-[10px] text-slate-500 truncate">Purchases / Visitors</p>
          </CardContent>
        </Card>

        {/* Average Order Value (AOV) */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">AOV</span>
              <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono truncate">
              {loading ? '—' : `₹${(kpis?.aov || 0).toLocaleString()}`}
            </div>
            <p className="text-[10px] text-slate-500 truncate">Revenue / Orders</p>
          </CardContent>
        </Card>

        {/* Product Views */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Product Views</span>
              <Eye className="w-4 h-4 text-cyan-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono truncate">
              {loading ? '—' : (kpis?.productViews || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 truncate">Catalog detail views</p>
          </CardContent>
        </Card>

        {/* Added To Cart */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Added To Cart</span>
              <ShoppingCart className="w-4 h-4 text-pink-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-pink-600 font-mono truncate">
              {loading ? '—' : (kpis?.addToCart || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 truncate">Cart additions</p>
          </CardContent>
        </Card>

        {/* Checkout Started */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Checkouts</span>
              <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-600 font-mono truncate">
              {loading ? '—' : (kpis?.checkoutStarted || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 truncate">Started checkout</p>
          </CardContent>
        </Card>

        {/* Purchases */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-emerald-700 truncate">Purchases</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono truncate">
              {loading ? '—' : (kpis?.purchases || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 truncate">Authoritative orders</p>
          </CardContent>
        </Card>

        {/* Cart Abandonment */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Abandonment</span>
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-600 font-mono truncate">
              {loading ? '—' : kpis?.cartAbandonment || '0%'}
            </div>
            <p className="text-[10px] text-slate-500 truncate">Carts not converted</p>
          </CardContent>
        </Card>

        {/* Returning Visitors */}
        <Card className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Returning</span>
              <RotateCcw className="w-4 h-4 text-teal-600 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-teal-700 font-mono truncate">
              {loading ? '—' : (kpis?.returningVisitors || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 truncate">&gt;1 session</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue & Visitors Daily Trend (Area Chart) */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-900 font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                  Revenue & Traffic Trend
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Daily reconciled store revenue against visitor sessions
                </CardDescription>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {timeframe === 'all' ? 'ALL TIME' : timeframe.toUpperCase()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] sm:h-[300px] w-full">
              {data?.dailyTrend && data.dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="visitorsGradLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={(val) => {
                        try {
                          const d = new Date(val);
                          return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                        } catch {
                          return val.slice(5);
                        }
                      }}
                    />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        color: '#0f172a',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'revenue' ? `₹${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                        name === 'revenue' ? 'Revenue' : 'Store Visitors'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGradLight)"
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#visitorsGradLight)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No trend data available for this range
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources Breakdown */}
        <Card className="bg-white border-slate-200 shadow-xs flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-900 font-bold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-600" />
              Traffic Sources
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Acquisition channels driving customer visits
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-2">
            <div className="space-y-3">
              {data?.trafficSources && data.trafficSources.length > 0 ? (
                data.trafficSources.map((item, idx) => (
                  <div key={item.source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-medium flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        {item.source}
                      </span>
                      <span className="font-mono text-slate-600 font-semibold">
                        {item.sessions} sessions ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-8">
                  Collecting source attribution data...
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Attribution Model:</span>
              <span className="font-semibold text-rose-600">Last Touch</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Conversion Funnel & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 6-Stage Conversion Funnel Summary */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-900 font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-600" />
                  Conversion Funnel &amp; Drop-Off
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Customer progression from initial storefront visit to completed purchase
                </CardDescription>
              </div>
              <Link
                to="/marketing/funnel"
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                Detailed Funnel <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {data?.funnel.map((step, idx) => (
                <div
                  key={step.stage}
                  className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between text-center relative overflow-hidden group hover:border-slate-300 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 uppercase tracking-wide truncate">
                    {step.stage}
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900 font-mono my-1">
                    {step.count.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {idx === 0 ? 'Baseline' : `Drop: ${step.dropOffRate}`}
                  </div>

                  {idx < (data?.funnel?.length || 0) - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400 font-bold">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marketing Opportunities Engine */}
        <Card className="bg-white border-slate-200 shadow-xs flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-900 font-bold flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Opportunities
              </CardTitle>
              <Link
                to="/marketing/opportunities"
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Data-backed conversion &amp; catalog growth opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 flex-1 pt-2">
            {data?.opportunities && data.opportunities.length > 0 ? (
              data.opportunities.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:border-amber-300 transition-all space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {opp.title}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0 border border-amber-200">
                      {opp.impact} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                No active anomalies detected
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Top Products, Top Searches & Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Viewed Products (Authoritative Catalog Names) */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-rose-600" />
                Top Viewed Products
              </CardTitle>
              <Link to="/marketing/products" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-all text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-500 font-medium">₹{Number(p.price).toLocaleString()}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900">{p.views} views</div>
                    <div className="text-[10px] text-pink-600 font-semibold">{p.cartAdds} added to cart</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">No product view events recorded yet</div>
            )}
          </CardContent>
        </Card>

        {/* Top Searches */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-600" />
                High-Intent Searches
              </CardTitle>
              <Link to="/marketing/search" className="text-xs text-cyan-700 hover:text-cyan-800 font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {data?.topSearches && data.topSearches.length > 0 ? (
              data.topSearches.map((s) => (
                <div
                  key={s.query}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-all text-xs"
                >
                  <div className="font-semibold text-slate-800 truncate pr-2">"{s.query}"</div>
                  <div className="text-right shrink-0 font-mono text-slate-600">
                    <span className="font-bold text-cyan-700">{s.searches}</span> searches
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">No search queries recorded yet</div>
            )}
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                Active Campaigns
              </CardTitle>
              <Link to="/marketing/campaigns" className="text-xs text-indigo-700 hover:text-indigo-800 font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {data?.topCampaigns && data.topCampaigns.length > 0 ? (
              data.topCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-all text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{c.platform}</div>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <div className="font-bold text-emerald-700">₹{Number(c.revenue).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">{c.sessions} sessions</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">No active campaigns configured</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketingDashboard;
