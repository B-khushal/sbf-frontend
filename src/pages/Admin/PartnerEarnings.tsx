import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { DollarSign, IndianRupee, RefreshCw, UserCheck, ShieldCheck, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

interface EarningPartner {
  _id: string;
  name: string;
  email: string;
  vehicleType: string;
  todayEarnings: number;
  totalEarnings: number;
}

const PartnerEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEarnings(res.data.partners || []);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch partner earnings'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const stats = useMemo(() => {
    const totalPayout = earnings.reduce((sum, item) => sum + (item.totalEarnings || 0), 0);
    const todayPayout = earnings.reduce((sum, item) => sum + (item.todayEarnings || 0), 0);
    return {
      totalPayout,
      todayPayout,
      courierCount: earnings.length,
    };
  }, [earnings]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Logistics', href: '/admin/delivery/analytics' },
          { label: 'Partner Earnings' },
        ]}
        title="Partner Earnings & Settlements"
        description="Monitor courier payment balances, daily tip/fare disbursements, and direct bank account settlement records."
        liveStatus={{ label: `${earnings.length} Active Couriers`, ping: true }}
        actions={
          <SoftButton
            variant="default"
            size="sm"
            icon={RefreshCw}
            onClick={fetchEarnings}
          >
            Refresh Ledger
          </SoftButton>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Payouts Distributed"
          value={`₹${stats.totalPayout.toLocaleString()}`}
          icon={IndianRupee}
          color="emerald"
          subtitle="Cumulative courier ledger"
        />
        <StatCard
          title="Today's Active Earnings"
          value={`₹${stats.todayPayout.toLocaleString()}`}
          icon={Wallet}
          color="blue"
          subtitle="Earned on today's shifts"
        />
        <StatCard
          title="Registered Couriers"
          value={stats.courierCount}
          icon={UserCheck}
          color="purple"
          subtitle="Direct delivery partners"
        />
      </div>

      {/* Earnings Table */}
      <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden transition-all">
        <div className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" /> Payout Summary Ledger
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live compensation tracking by delivery partner.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
            Loading earnings ledger...
          </div>
        ) : earnings.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No courier earnings recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#edf1f7]/60 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="p-4">Courier Partner</th>
                  <th className="p-4">Vehicle Type</th>
                  <th className="p-4 text-right">Today's Earnings</th>
                  <th className="p-4 text-right">Total Lifetime Earnings</th>
                  <th className="p-4 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-800 dark:text-slate-200">
                {earnings.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4 flex items-center gap-2.5 font-bold">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700">
                        <UserCheck className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-normal">{p.email}</p>
                      </div>
                    </td>
                    <td className="p-4 capitalize">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.vehicleType || 'Bike'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      ₹{p.todayEarnings?.toLocaleString() || 0}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">
                      ₹{p.totalEarnings?.toLocaleString() || 0}
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status="settled" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerEarnings;
