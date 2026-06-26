import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { BarChart3, Clock, CheckCircle2, AlertCircle, TrendingUp, IndianRupee } from 'lucide-react';

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
    totalEarningSum: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch delivery analytics'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Delivery Analytics</h1>
        <p className="text-muted-foreground">Monitor performance ratings, average transit duration, and logistics success metrics.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading analytics...</div>
      ) : (
        <>
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-emerald-100 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-emerald-950">Avg Delivery Time</CardTitle>
                <Clock className="w-5 h-5 text-emerald-700" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-950">{data.averageDeliveryTime} mins</div>
                <p className="text-xs text-muted-foreground mt-1">From pick up to customer drop</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-emerald-950">On-Time Delivery %</CardTitle>
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-950">{data.onTimePercentage}%</div>
                <p className="text-xs text-muted-foreground mt-1">Schedules met within ETA</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-emerald-950">Successful Dropoffs</CardTitle>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-950">{data.totalDeliveries}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.successRate}% overall success rate</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-emerald-950">Delivery Payouts</CardTitle>
                <IndianRupee className="w-5 h-5 text-emerald-700" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-950">₹{data.totalEarningSum}</div>
                <p className="text-xs text-muted-foreground mt-1">Total driver payout fees</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Success logs card */}
            <Card className="lg:col-span-2 border-emerald-100 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-700" /> Operational Trends
                </CardTitle>
                <CardDescription>Visual metrics summary for distribution performance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-semibold text-emerald-950 mb-1">
                    <span>Delivered Successfully</span>
                    <span>{data.totalDeliveries}</span>
                  </div>
                  <div className="w-full bg-emerald-50 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${data.successRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold text-emerald-950 mb-1">
                    <span>Delivery Failures</span>
                    <span>{data.failedDeliveries}</span>
                  </div>
                  <div className="w-full bg-emerald-50 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${100 - data.successRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Status Card */}
            <Card className="border-emerald-100 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-emerald-700" /> SLA Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-emerald-950">
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded">
                  <strong className="block text-emerald-900">Premium On-Time Rate: &gt; 92%</strong>
                  Your current SLA stands at <strong className="text-emerald-800">{data.onTimePercentage}%</strong>.
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded text-amber-900">
                  <strong className="block text-amber-950">Average Prep & Dispatch Time</strong>
                  Target preparation time limit is 15 minutes per floral arrangement.
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryAnalytics;
