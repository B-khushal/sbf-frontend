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
  ArrowDownRight,
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
  Package
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { marketingService, DashboardOverviewResponse } from '@/services/marketingService';
import { toast } from 'sonner';

const COLORS = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#64748b'];

export const MarketingDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('30d');
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none w-full lg:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Period:</span>
          {['today', 'yesterday', '7d', '30d', '90d', 'all'].map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-2.5 sm:px-3 h-8 rounded-lg font-medium transition-all shrink-0 ${
                timeframe === tf
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/40 hover:bg-rose-500'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              {tf === 'today' ? 'Today' : tf === 'yesterday' ? 'Yesterday' : tf === '7d' ? 'Last 7 Days' : tf === '30d' ? 'Last 30 Days' : tf === '90d' ? 'Last 90 Days' : 'All Time'}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="flex-1 sm:flex-none h-8 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 outline-none focus:border-rose-500 min-w-[110px]"
          >
            <option value="all">All Devices</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
          </select>

          <select
            value={trafficFilter}
            onChange={(e) => setTrafficFilter(e.target.value)}
            className="flex-1 sm:flex-none h-8 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 outline-none focus:border-rose-500 min-w-[130px]"
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
            className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800 shrink-0"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Row 1: Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Visitors */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Total Visitors</span>
              <Users className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono truncate">
              {loading ? '—' : kpis?.totalVisitors.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Storefront sessions</p>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Unique Visitors</span>
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono truncate">
              {loading ? '—' : kpis?.uniqueVisitors.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 truncate">
              <ArrowUpRight className="w-3 h-3 inline shrink-0" /> Unique profiles
            </p>
          </CardContent>
        </Card>

        {/* Product Views */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Product Views</span>
              <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono truncate">
              {loading ? '—' : kpis?.productViews.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Catalog detail views</p>
          </CardContent>
        </Card>

        {/* Engaged Visitors */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Engaged Visitors</span>
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono truncate">
              {loading ? '—' : kpis?.engagedVisitors.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">&gt;75% scroll or 60s</p>
          </CardContent>
        </Card>

        {/* Add To Cart */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Added To Cart</span>
              <ShoppingCart className="w-4 h-4 text-pink-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-pink-400 font-mono truncate">
              {loading ? '—' : kpis?.addToCart.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Cart additions</p>
          </CardContent>
        </Card>

        {/* Checkout Started */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Checkouts</span>
              <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-purple-400 font-mono truncate">
              {loading ? '—' : kpis?.checkoutStarted.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Started checkout</p>
          </CardContent>
        </Card>

        {/* Purchases (Authoritative from Orders) */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md border-emerald-500/20">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-emerald-400 truncate">Purchases</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono truncate">
              {loading ? '—' : kpis?.purchases.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Authoritative orders</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Conversion Rate</span>
              <Percent className="w-4 h-4 text-rose-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-rose-400 font-mono truncate">
              {loading ? '—' : kpis?.conversionRate || '0.00%'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Purchases / Visitors</p>
          </CardContent>
        </Card>

        {/* Total Attributed Revenue */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md border-rose-500/20">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-rose-400 truncate">Revenue</span>
              <TrendingUp className="w-4 h-4 text-rose-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono truncate">
              {loading ? '—' : `₹${kpis?.revenue.toLocaleString() || '0'}`}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Authoritative revenue</p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">AOV</span>
              <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono truncate">
              {loading ? '—' : `₹${kpis?.aov.toLocaleString() || '0'}`}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Revenue / Orders</p>
          </CardContent>
        </Card>

        {/* Cart Abandonment */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Abandonment</span>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono truncate">
              {loading ? '—' : kpis?.cartAbandonment || '0%'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">Carts not converted</p>
          </CardContent>
        </Card>

        {/* Returning Visitors */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">Returning Visitors</span>
              <RotateCcw className="w-4 h-4 text-teal-400 shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-teal-400 font-mono truncate">
              {loading ? '—' : kpis?.returningVisitors.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">&gt;1 session</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue & Visitors Daily Trend (Area Chart) */}
        <Card className="lg:col-span-2 bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-100 font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  Revenue & Traffic Trend
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Daily reconciled revenue against store visitor sessions
                </CardDescription>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                {timeframe.toUpperCase()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[240px] sm:h-[280px] w-full">
              {data?.dailyTrend && data.dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Visitors'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#visitorsGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No trend data available for this range
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources Breakdown */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-100 font-bold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              Traffic Sources
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Acquisition channels driving customer visits
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-2">
            <div className="space-y-3">
              {data?.trafficSources && data.trafficSources.length > 0 ? (
                data.trafficSources.map((item, idx) => (
                  <div key={item.source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        {item.source}
                      </span>
                      <span className="font-mono text-slate-400">
                        {item.sessions} sessions ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
                <div className="text-xs text-slate-500 text-center py-8">
                  Collecting source attribution data...
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Attribution Model:</span>
              <span className="font-semibold text-rose-300">Last Touch</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Conversion Funnel & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 6-Stage Conversion Funnel Summary */}
        <Card className="lg:col-span-2 bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-100 font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-400" />
                  Conversion Funnel &amp; Drop-Off
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Customer progression from initial visit to completed purchase
                </CardDescription>
              </div>
              <Link
                to="/marketing/funnel"
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
              >
                Detailed Funnel <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {data?.funnel.map((step, idx) => (
                <div
                  key={step.stage}
                  className="bg-slate-800/50 border border-slate-700/60 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between text-center relative overflow-hidden group hover:border-slate-600 transition-all"
                >
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                    {step.stage}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-100 font-mono my-1">
                    {step.count.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {idx === 0 ? 'Baseline' : `Drop: ${step.dropOffRate}`}
                  </div>

                  {idx < data.funnel.length - 1 && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marketing Opportunities Engine */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-100 font-bold flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Opportunities
              </CardTitle>
              <Link
                to="/marketing/opportunities"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Data-backed conversion &amp; catalog opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 flex-1 pt-2">
            {data?.opportunities && data.opportunities.length > 0 ? (
              data.opportunities.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-amber-500/30 transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {opp.title}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                      {opp.impact} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-6">
                No active anomalies detected
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Top Products, Top Searches & Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Viewed Products */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-100 font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-rose-400" />
                Top Viewed Products
              </CardTitle>
              <Link to="/marketing/products" className="text-xs text-slate-400 hover:text-slate-200">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/40 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-200 truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400">₹{p.price.toLocaleString()}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-100">{p.views} views</div>
                    <div className="text-[10px] text-pink-400">{p.cartAdds} added to cart</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-6">No product view events recorded yet</div>
            )}
          </CardContent>
        </Card>

        {/* Top Searches */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-100 font-bold flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                High-Intent Searches
              </CardTitle>
              <Link to="/marketing/search" className="text-xs text-slate-400 hover:text-slate-200">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {data?.topSearches && data.topSearches.length > 0 ? (
              data.topSearches.map((s) => (
                <div
                  key={s.query}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/40 text-xs"
                >
                  <div className="font-medium text-slate-200 truncate pr-2">"{s.query}"</div>
                  <div className="text-right shrink-0 font-mono text-slate-300">
                    <span className="font-bold text-cyan-400">{s.searches}</span> searches
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-6">No search queries recorded yet</div>
            )}
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-100 font-bold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-400" />
                Active Campaigns
              </CardTitle>
              <Link to="/marketing/campaigns" className="text-xs text-slate-400 hover:text-slate-200">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {data?.topCampaigns && data.topCampaigns.length > 0 ? (
              data.topCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/40 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-200 truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{c.platform}</div>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <div className="font-bold text-emerald-400">₹{Number(c.revenue).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{c.sessions} sessions</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-6">No active campaigns configured</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketingDashboard;
