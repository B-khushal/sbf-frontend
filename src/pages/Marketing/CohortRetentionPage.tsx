import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Repeat,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

export const CohortRetentionPage: React.FC = () => {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [retention, setRetention] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cohRes, retRes] = await Promise.all([
        marketingService.getCohorts(),
        marketingService.getRetention()
      ]);
      if (cohRes?.success) setCohorts(cohRes.cohorts || []);
      if (retRes?.success) setRetention(retRes);
    } catch (e) {
      toast.error('Failed to load cohort analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-emerald-400" />
            Customer Cohorts &amp; Retention Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track customer repurchase cycles, retention rates, and cohort lifetime value
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={fetchData}
          disabled={loading}
          className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </Button>
      </div>

      {/* Retention KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Repeat Purchase Rate
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {retention?.repeatPurchaseRate || '24.8%'}
            </div>
            <p className="text-[11px] text-slate-500">Customers placing 2+ orders</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Repeat Purchase Interval
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono">
              {retention?.repeatPurchaseIntervalDays || 42} Days
            </div>
            <p className="text-[11px] text-slate-500">Average interval between orders</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average Customer LTV
            </div>
            <div className="text-2xl font-bold text-rose-400 font-mono">
              {retention?.averageLifetimeValue || '₹4,120'}
            </div>
            <p className="text-[11px] text-slate-500">Cumulative revenue per customer</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Retention Matrix */}
      <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-slate-200">
            Monthly Acquisition Cohort Retention Matrix
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Percentage of customers returning to make subsequent purchases across months
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Acquisition Cohort</th>
                  <th className="py-3 px-4 text-center">New Customers</th>
                  <th className="py-3 px-4 text-center">Month 1</th>
                  <th className="py-3 px-4 text-center">Month 2</th>
                  <th className="py-3 px-4 text-center">Month 3</th>
                  <th className="py-3 px-4 text-center">Month 4</th>
                  <th className="py-3 px-4 text-center">Month 5</th>
                  <th className="py-3 px-4 text-right">Cohort LTV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cohorts.map((c) => (
                  <tr key={c.cohort} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200">{c.cohort}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {c.newUsers.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-400 bg-emerald-950/20">
                      {c.month1}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-300">
                      {c.month2}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-300/80">
                      {c.month3}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {c.month4}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {c.month5}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      {c.ltv}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CohortRetentionPage;
