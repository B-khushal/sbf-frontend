import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';

interface AnalyticsData {
  averageDeliveryTime: number;
  onTimePercentage: number;
  totalDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  totalEarningSum: number;
}

const DeliveryAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    averageDeliveryTime: 0,
    onTimePercentage: 100,
    totalDeliveries: 0,
    failedDeliveries: 0,
    successRate: 100,
    totalEarningSum: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setData(res.data.analytics || {});
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch delivery analytics',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Logistics', href: '/admin/delivery/analytics' },
          { label: 'Analytics' },
        ]}
        title="Delivery Operations Analytics"
        description="Monitor delivery SLA fulfillment, courier transit speed, on-time percentage, and fulfillment success ratios."
        liveStatus={{ label: `${data.onTimePercentage}% On-Time SLA`, ping: true }}
        actions={
          <SoftButton
            variant="default"
            size="sm"
            icon={RefreshCw}
            onClick={fetchAnalytics}
          >
            Refresh Analytics
          </SoftButton>
        }
      />

      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground animate-pulse font-medium">
          Aggregating logistics telemetry...
        </div>
      ) : (
        <>
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Avg Delivery Time"
              value={`${data.averageDeliveryTime} mins`}
              icon={Clock}
              color="blue"
              subtitle="Hub dispatch to door"
            />
            <StatCard
              title="On-Time Delivery %"
              value={`${data.onTimePercentage}%`}
              icon={TrendingUp}
              color="emerald"
              subtitle="SLA met within slot"
            />
            <StatCard
              title="Successful Deliveries"
              value={data.totalDeliveries}
              icon={CheckCircle2}
              color="purple"
              subtitle={`${data.successRate}% completion rate`}
            />
            <StatCard
              title="Delivery Payouts"
              value={`₹${data.totalEarningSum?.toLocaleString() || 0}`}
              icon={IndianRupee}
              color="amber"
              subtitle="Disbursed courier fees"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Operational Trends Neumorphic Card */}
            <div className="lg:col-span-2 rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-600" /> Operational Trends & Performance
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visual distribution fulfillment ratios and exception tracking.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span>Delivered Successfully</span>
                    <span className="text-emerald-600">{data.totalDeliveries} orders ({data.successRate}%)</span>
                  </div>
                  <div className="w-full bg-[#edf1f7] dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-[inset_1px_1px_3px_rgba(163,177,198,0.3)]">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, data.successRate || 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span>Fulfillment Exceptions / Return to Store</span>
                    <span className="text-rose-600">{data.failedDeliveries} orders</span>
                  </div>
                  <div className="w-full bg-[#edf1f7] dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-[inset_1px_1px_3px_rgba(163,177,198,0.3)]">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          data.totalDeliveries > 0
                            ? (data.failedDeliveries / (data.totalDeliveries + data.failedDeliveries)) * 100
                            : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics Status Sidecard */}
            <div className="lg:col-span-1 rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Logistics Quality SLAs
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Benchmarks for citywide flower & cake handling.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-xs">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    Same-Day Delivery Window
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    2 - 3 Hours Average
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-xs">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    Cake Temperature Protection
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    Insulated Pouch Verified
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-xs">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    Midnight Surprise Delivery SLA
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    11:30 PM - 12:15 AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryAnalytics;
