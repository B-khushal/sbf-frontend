import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { Sliders, Save, RefreshCw } from 'lucide-react';

const DeliverySettingsPage: React.FC = () => {
  const [autoAssign, setAutoAssign] = useState(true);
  const [radius, setRadius] = useState(10);
  const [maxOrders, setMaxOrders] = useState(3);
  const [timeout, setTimeoutVal] = useState(60);
  const [baseEarning, setBaseEarning] = useState(80);
  const [earningPerKm, setEarningPerKm] = useState(15);
  const [peakMultiplier, setPeakMultiplier] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        setAutoAssign(s.autoAssign);
        setRadius(s.assignmentRadius);
        setMaxOrders(s.maxOrdersPerPartner);
        setTimeoutVal(s.reassignmentTimeout);
        setBaseEarning(s.baseDeliveryEarning);
        setEarningPerKm(s.earningPerKm);
        setPeakMultiplier(s.peakHourMultiplier);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch settings'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/delivery/admin/settings`, {
        autoAssign,
        assignmentRadius: radius,
        maxOrdersPerPartner: maxOrders,
        reassignmentTimeout: timeout,
        baseDeliveryEarning: baseEarning,
        earningPerKm,
        peakHourMultiplier: peakMultiplier
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Settings Saved', description: 'System parameters updated successfully.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings' });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Delivery Settings</h1>
          <p className="text-muted-foreground">Adjust automated routing thresholds, dispatch timeouts, and driver base earnings.</p>
        </div>
        <Button onClick={fetchSettings} variant="outline" className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave}>
          <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-emerald-50/55 border-b border-emerald-100">
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-emerald-700" /> Operational Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Auto Assign Toggle */}
              <div className="flex items-center justify-between p-4 bg-emerald-50/20 border border-emerald-100 rounded-lg">
                <div>
                  <Label htmlFor="auto-assign" className="text-emerald-950 font-bold block">Auto Assignment Engine</Label>
                  <span className="text-xs text-muted-foreground">Toggle automated dispatch calculations for placing orders.</span>
                </div>
                <input
                  id="auto-assign"
                  type="checkbox"
                  checked={autoAssign}
                  onChange={(e) => setAutoAssign(e.target.checked)}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="radius" className="text-emerald-950 font-semibold">Max Search Radius (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="max-orders" className="text-emerald-950 font-semibold">Max Orders Per Partner</Label>
                  <Input
                    id="max-orders"
                    type="number"
                    value={maxOrders}
                    onChange={(e) => setMaxOrders(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="timeout" className="text-emerald-950 font-semibold">Acceptance Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={timeout}
                    onChange={(e) => setTimeoutVal(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="base-earning" className="text-emerald-950 font-semibold">Base Delivery Payout (₹)</Label>
                  <Input
                    id="base-earning"
                    type="number"
                    value={baseEarning}
                    onChange={(e) => setBaseEarning(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="earning-km" className="text-emerald-950 font-semibold">Payout Per Km (₹)</Label>
                  <Input
                    id="earning-km"
                    type="number"
                    value={earningPerKm}
                    onChange={(e) => setEarningPerKm(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="peak" className="text-emerald-950 font-semibold">Peak Pricing Multiplier</Label>
                  <Input
                    id="peak"
                    type="number"
                    step="0.1"
                    value={peakMultiplier}
                    onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-2 mt-4">
                <Save className="h-4 w-4" /> Save Configurations
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
};

export default DeliverySettingsPage;
