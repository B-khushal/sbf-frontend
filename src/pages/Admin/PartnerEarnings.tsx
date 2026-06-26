import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { DollarSign, IndianRupee, RefreshCw, UserCheck } from 'lucide-react';

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
        setEarnings(res.data.partners);
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

  const totalPayout = earnings.reduce((sum, item) => sum + (item.totalEarnings || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Partner Earnings</h1>
          <p className="text-muted-foreground">Manage courier payment balances, cash-outs, and ledger payouts.</p>
        </div>
        <Button onClick={fetchEarnings} className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Ledger
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-emerald-950">Total Payouts Distributed</CardTitle>
            <IndianRupee className="w-5 h-5 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-950">₹{totalPayout.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid directly to courier bank accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Table */}
      <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-emerald-50/55 border-b border-emerald-100">
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-700" /> Earning Summary Ledger
          </CardTitle>
          <CardDescription>Payout tracking details per courier.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Loading earnings ledger...</div>
          ) : earnings.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No earnings recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50/20 text-emerald-900 border-b border-emerald-100 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">Courier Name</th>
                    <th className="p-4">Vehicle Type</th>
                    <th className="p-4 text-right">Today's Earnings</th>
                    <th className="p-4 text-right">Total Earnings</th>
                    <th className="p-4 text-center">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 text-sm text-emerald-950">
                  {earnings.map(p => (
                    <tr key={p._id} className="hover:bg-emerald-50/10">
                      <td className="p-4 flex items-center gap-2 font-medium">
                        <UserCheck className="h-4 w-4 text-emerald-700" />
                        {p.name}
                      </td>
                      <td className="p-4 capitalize">{p.vehicleType}</td>
                      <td className="p-4 text-right font-semibold text-emerald-950">₹{p.todayEarnings}</td>
                      <td className="p-4 text-right font-bold text-emerald-700">₹{p.totalEarnings}</td>
                      <td className="p-4 text-center">
                        <span className="inline-block bg-green-50 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          Settled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerEarnings;
