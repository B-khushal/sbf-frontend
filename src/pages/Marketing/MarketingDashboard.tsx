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
  Search,
  Megaphone,
  AlertTriangle,
  Lightbulb,
  Clock,
  Filter,
  RefreshCw,
  ShoppingBag,
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
import { marketingService, DashboardOverviewResponse } from '@/services/marketingService';
import { toast } from 'sonner';
import {
  NeumorphicCard,
  StatCard,
  SoftButton,
  PageHeader
} from '@/components/dashboard';

const COLORS = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#64748b'];

export const MarketingDashboard: React.FC = () => {
  // Default to 'all' (All Time) so all authoritative store orders, revenue, and carts are instantly visible
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
      toast.error('Failed to load marketing dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [timeframe]);

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 max-w-[1600px] 2xl:max-w-9xl mx-auto">
      {/* Header & Filter Controls */}
      <PageHeader
        title="Marketing & Growth Intelligence"
        subtitle="Omnichannel customer acquisition, storefront conversions & live revenue attribution"
        badge={
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-sm">
            <Sparkles className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>Growth Engine</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="h-9 bg-[var(--sbf-card)] text-xs text-slate-800 rounded-xl px-3 outline-none sbf-neumo-inset-sm font-medium border-none"
            >
              <option value="all">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>

            <select
              value={trafficFilter}
              onChange={(e) => setTrafficFilter(e.target.value)}
              className="h-9 bg-[var(--sbf-card)] text-xs text-slate-800 rounded-xl px-3 outline-none sbf-neumo-inset-sm font-medium border-none"
            >
              <option value="all">All Traffic Sources</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google Search</option>
              <option value="direct">Direct</option>
              <option value="whatsapp">WhatsApp</option>
            </select>

            <SoftButton
              variant="raised"
              size="icon"
              onClick={fetchDashboard}
              disabled={loading}
              title="Refresh marketing analytics"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin text-rose-600' : ''}`} />
            </SoftButton>
          </div>
        }
      />

      {/* Timeframe Filter Inset Capsule */}
      <div className="p-2 rounded-2xl sbf-neumo-inset-sm bg-[var(--sbf-card)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2.5 shrink-0">
          Period:
        </span>
        {[
          { key: 'all', label: 'All Time' },
          { key: '30d', label: 'Last 30 Days' },
          { key: '90d', label: 'Last 90 Days' },
          { key: '7d', label: 'Last 7 Days' },
          { key: 'today', label: 'Today' },
          { key: 'yesterday', label: 'Yesterday' }
        ].map((tf) => {
          const isActive = timeframe === tf.key;
          return (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                isActive
                  ? 'sbf-neumo-btn-primary font-bold shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {tf.label}
            </button>
          );
        })}
      </div>

      {/* Row 1: Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Completed Authoritative Revenue */}
        <StatCard
          title="Store Revenue"
          value={loading ? '—' : `₹${(kpis?.revenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          comparison={loading ? '...' : `${kpis?.purchases || 0} completed orders`}
        />

        {/* Active Shopping Cart Pipeline */}
        <StatCard
          title="Cart Pipeline"
          value={loading ? '—' : `₹${(kpis?.activeCartPipelineValue || 0).toLocaleString()}`}
          icon={ShoppingCart}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          comparison={loading ? '...' : `${kpis?.activeCartPipelineCount || 0} active carts`}
        />

        {/* Total Pipeline Value */}
        <StatCard
          title="Total Pipeline"
          value={loading ? '—' : `₹${((kpis?.revenue || 0) + (kpis?.activeCartPipelineValue || 0)).toLocaleString()}`}
          icon={Layers}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          comparison="Orders + Active Pipeline"
        />

        {/* Total Visitors */}
        <StatCard
          title="Store Visitors"
          value={loading ? '—' : (kpis?.totalVisitors || 0).toLocaleString()}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          comparison="Storefront sessions"
        />

        {/* Conversion Rate */}
        <StatCard
          title="Conversion Rate"
          value={loading ? '—' : kpis?.conversionRate || '0.00%'}
          icon={Percent}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          comparison="Purchases / Visitors"
        />

        {/* Average Order Value (AOV) */}
        <StatCard
          title="Average Order"
          value={loading ? '—' : `₹${(kpis?.aov || 0).toLocaleString()}`}
          icon={ShoppingBag}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          comparison="Revenue / Orders"
        />

        {/* Product Views */}
        <StatCard
          title="Product Views"
          value={loading ? '—' : (kpis?.productViews || 0).toLocaleString()}
          icon={Eye}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
          comparison="Catalog detail views"
        />

        {/* Added To Cart */}
        <StatCard
          title="Added To Cart"
          value={loading ? '—' : (kpis?.addToCart || 0).toLocaleString()}
          icon={ShoppingCart}
          iconColor="text-pink-600"
          iconBg="bg-pink-50"
          comparison="Cart additions"
        />

        {/* Checkout Started */}
        <StatCard
          title="Checkouts Started"
          value={loading ? '—' : (kpis?.checkoutStarted || 0).toLocaleString()}
          icon={CreditCard}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          comparison="Checkout iniciations"
        />

        {/* Purchases */}
        <StatCard
          title="Purchases"
          value={loading ? '—' : (kpis?.purchases || 0).toLocaleString()}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          comparison="Authoritative orders"
        />

        {/* Cart Abandonment */}
        <StatCard
          title="Abandonment"
          value={loading ? '—' : kpis?.cartAbandonment || '0%'}
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          comparison="Carts not converted"
        />

        {/* Returning Visitors */}
        <StatCard
          title="Returning Users"
          value={loading ? '—' : (kpis?.returningVisitors || 0).toLocaleString()}
          icon={RotateCcw}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          comparison=">1 session active"
        />
      </div>

      {/* Row 2: Charts & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue & Visitors Daily Trend (Area Chart) */}
        <NeumorphicCard
          className="lg:col-span-2"
          title="Revenue & Traffic Progression"
          description="Daily reconciled store revenue charted alongside storefront visitor sessions"
          headerIcon={TrendingUp}
          headerActions={
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl sbf-neumo-inset-sm text-slate-700 bg-[var(--sbf-card)]">
              {timeframe === 'all' ? 'ALL TIME' : timeframe.toUpperCase()}
            </span>
          }
          variant="raised"
        >
          <div className="h-[280px] sm:h-[320px] w-full pt-2">
            {data?.dailyTrend && data.dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="marketingRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="marketingVisitorsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(val) => {
                      try {
                        const d = new Date(val);
                        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                      } catch {
                        return val.slice(5);
                      }
                    }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `₹${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                      name === 'revenue' ? 'Revenue' : 'Store Visitors'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#marketingRevenueGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#marketingVisitorsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No trend data available for this range
              </div>
            )}
          </div>
        </NeumorphicCard>

        {/* Traffic Sources Breakdown */}
        <NeumorphicCard
          title="Acquisition Channels"
          description="Traffic sources driving visits & conversions"
          headerIcon={Megaphone}
          variant="raised"
        >
          <div className="flex-1 flex flex-col justify-between pt-1">
            <div className="space-y-3.5">
              {data?.trafficSources && data.trafficSources.length > 0 ? (
                data.trafficSources.map((item, idx) => (
                  <div key={item.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-semibold flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        {item.source}
                      </span>
                      <span className="font-mono text-slate-600 font-bold">
                        {item.sessions} sessions ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full sbf-neumo-inset-sm bg-[var(--sbf-card)] p-0.5 overflow-hidden">
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

            <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Attribution Model:</span>
              <span className="font-bold text-rose-600">Last Touch Attribution</span>
            </div>
          </div>
        </NeumorphicCard>
      </div>

      {/* Row 3: Conversion Funnel & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 6-Stage Conversion Funnel Summary */}
        <NeumorphicCard
          className="lg:col-span-2"
          title="6-Stage Conversion Funnel"
          description="Progression from storefront view to completed order"
          headerIcon={Filter}
          headerActions={
            <Link
              to="/marketing/funnel"
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              Detailed Funnel <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
          variant="raised"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
            {data?.funnel.map((step, idx) => (
              <div
                key={step.stage}
                className="p-3 rounded-2xl sbf-neumo-inset-sm bg-[var(--sbf-card)] flex flex-col justify-between text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wide truncate">
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
        </NeumorphicCard>

        {/* Marketing Opportunities Engine */}
        <NeumorphicCard
          title="Growth Opportunities"
          description="AI recommendations for improving conversion"
          headerIcon={Lightbulb}
          headerActions={
            <Link
              to="/marketing/opportunities"
              className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
            >
              All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
          variant="raised"
        >
          <div className="space-y-2.5 pt-1">
            {data?.opportunities && data.opportunities.length > 0 ? (
              data.opportunities.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  className="p-3 rounded-2xl sbf-neumo-inset-sm bg-[var(--sbf-card)] space-y-1 border border-amber-200/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {opp.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0 border border-amber-200">
                      {opp.impact}
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
          </div>
        </NeumorphicCard>
      </div>

      {/* Row 4: Top Products, Top Searches & Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Viewed Products */}
        <NeumorphicCard
          title="Top Viewed Catalog"
          description="Most engaged bouquets & gifts"
          headerIcon={Package}
          headerActions={
            <Link to="/marketing/products" className="text-xs text-rose-600 hover:text-rose-700 font-bold">
              View All
            </Link>
          }
          variant="raised"
        >
          <div className="space-y-2 pt-1">
            {data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between p-2.5 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono">₹{Number(p.price).toLocaleString()}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900">{p.views} views</div>
                    <div className="text-[10px] text-pink-600 font-bold">{p.cartAdds} added to cart</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">No product view events recorded yet</div>
            )}
          </div>
        </NeumorphicCard>

        {/* Top Searches */}
        <NeumorphicCard
          title="High-Intent Queries"
          description="Customer search phrases on storefront"
          headerIcon={Search}
          headerActions={
            <Link to="/marketing/search" className="text-xs text-cyan-700 hover:text-cyan-800 font-bold">
              View All
            </Link>
          }
          variant="raised"
        >
          <div className="space-y-2 pt-1">
            {data?.topSearches && data.topSearches.length > 0 ? (
              data.topSearches.map((s) => (
                <div
                  key={s.query}
                  className="flex items-center justify-between p-2.5 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] text-xs"
                >
                  <div className="font-bold text-slate-800 truncate pr-2">"{s.query}"</div>
                  <div className="text-right shrink-0 font-mono text-slate-600">
                    <span className="font-bold text-cyan-700">{s.searches}</span> searches
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">No search queries recorded yet</div>
            )}
          </div>
        </NeumorphicCard>

        {/* Top Campaigns */}
        <NeumorphicCard
          title="Active Campaigns"
          description="Attributed marketing promotions"
          headerIcon={Megaphone}
          headerActions={
            <Link to="/marketing/campaigns" className="text-xs text-indigo-700 hover:text-indigo-800 font-bold">
              View All
            </Link>
          }
          variant="raised"
        >
          <div className="space-y-2 pt-1">
            {data?.topCampaigns && data.topCampaigns.length > 0 ? (
              data.topCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 truncate">{c.name}</div>
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
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};

export default MarketingDashboard;
