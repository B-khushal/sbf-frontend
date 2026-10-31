import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, TrendingUp, ShoppingBag, DollarSign, BarChart3, Users, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import type { ValentineAnalytics } from '@/types/valentine';

const ValentineAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ValentineAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/valentine/analytics?year=${year}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  }, [year, toast]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading || !analytics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 text-rose-400 mx-auto mb-3 animate-pulse" />
          <p className="text-muted-foreground">Loading Valentine Analytics...</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Total Orders', value: analytics.summary.totalOrders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Total Revenue', value: `₹${analytics.summary.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Avg. Order Value', value: `₹${analytics.summary.averageOrderValue}`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Conversion Rate', value: `${analytics.summary.conversionRate}%`, icon: Users, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  const maxRevenue = Math.max(...analytics.dailyData.map(d => d.revenue), 1);
  const maxOrders = Math.max(...analytics.dailyData.map(d => d.orders), 1);

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      <PageHeader
        title="Valentine Campaign Analytics"
        subtitle={`Feb 8 – Feb 15, ${year} | Real-time seasonal revenue, conversion rates, and day-by-day performance`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Marketing', href: '/marketing' },
          { label: 'Valentine Management', href: '/admin/valentine' },
          { label: 'Analytics' },
        ]}
        statusBadge={{ label: `Year ${year}`, variant: 'rose' }}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.25),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
              <span className="text-xs text-slate-500 font-medium">Year:</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-16 bg-transparent font-bold text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                min={2020}
                max={2030}
              />
            </div>
            <SoftButton variant="primary" onClick={fetchAnalytics}>
              Refresh Data
            </SoftButton>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={analytics.summary.totalOrders}
          icon={ShoppingBag}
          colorPalette="rose"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${analytics.summary.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          colorPalette="emerald"
        />
        <StatCard
          title="Avg. Order Value"
          value={`₹${analytics.summary.averageOrderValue}`}
          icon={TrendingUp}
          colorPalette="purple"
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.summary.conversionRate}%`}
          icon={Users}
          colorPalette="amber"
        />
      </div>

      {/* Daily Breakdown Chart */}
      <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)]">
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
          <CardDescription>Orders and revenue for each day of Valentine Week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.dailyData.map((day) => (
              <div key={day.date} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span className="font-medium">{day.date}</span>
                    <span className="text-xs text-muted-foreground">({day.name})</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span>{day.orders} orders</span>
                    <span className="font-semibold">₹{day.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Orders bar */}
                  <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                      style={{ width: `${(day.orders / maxOrders) * 100}%` }}
                    />
                  </div>
                  {/* Revenue bar */}
                  <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Orders</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Revenue</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)]">
          <CardHeader>
            <CardTitle className="text-base">Valentine Products</CardTitle>
            <CardDescription>Products tagged for Valentine's</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No valentine products assigned yet</p>
            ) : (
              <div className="space-y-2">
                {analytics.topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{product.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                        {product.valentineDate || product.valentineCategory || 'general'}
                      </span>
                      <span className="text-sm font-medium">₹{product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offers Usage */}
        <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)]">
          <CardHeader>
            <CardTitle className="text-base">Offers Performance</CardTitle>
            <CardDescription>{analytics.activeOffers} active offers during Valentine week</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.offersUsage.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No offers data available</p>
            ) : (
              <div className="space-y-2">
                {analytics.offersUsage.map((offer, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm truncate">{offer.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted">{offer.type}</span>
                    </div>
                    <span className="text-sm font-medium">{offer.usageCount} uses</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValentineAnalyticsDashboard;
