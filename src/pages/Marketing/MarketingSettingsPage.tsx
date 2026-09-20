import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Sliders,
  Database,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

export const MarketingSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form states
  const [weights, setWeights] = useState({
    productView: 5,
    repeatProductView: 10,
    longEngagement: 10,
    galleryInteraction: 5,
    scroll75: 5,
    deliveryInfoViewed: 8,
    addToCart: 30,
    checkoutStarted: 50,
    purchase: 100,
    removeFromCart: -10,
    checkoutAbandoned: -20
  });

  const [alerts, setAlerts] = useState({
    highCartAbandonmentThreshold: 75,
    conversionDropThreshold: 30,
    trafficSpikeThreshold: 50,
    zeroResultSearchSpikeThreshold: 15
  });

  const [retention, setRetention] = useState({
    rawEventsDays: 90,
    sessionsDays: 180,
    aggregateYears: 2
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [setRes, logRes] = await Promise.all([
        marketingService.getSettings(),
        marketingService.getActivityLogs()
      ]);
      if (setRes?.success && setRes.settings) {
        setSettings(setRes.settings);
        if (setRes.settings.interestWeights) setWeights(setRes.settings.interestWeights);
        if (setRes.settings.alertThresholds) setAlerts(setRes.settings.alertThresholds);
        if (setRes.settings.retentionPolicies) setRetention(setRes.settings.retentionPolicies);
      }
      if (logRes?.success) {
        setLogs(logRes.logs || []);
      }
    } catch (e) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await marketingService.updateSettings({
        interestWeights: weights,
        alertThresholds: alerts,
        retentionPolicies: retention
      });
      if (res?.success) {
        toast.success('Marketing settings and weights updated successfully!');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-rose-400" />
            Marketing Settings &amp; Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure product interest algorithms, alert thresholds, retention policies, and audit logs
          </p>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs h-8 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-950/40"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </Button>
      </div>

      <Tabs defaultValue="weights" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl w-full overflow-x-auto flex scrollbar-none">
          <TabsTrigger value="weights" className="text-xs font-semibold data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-lg shrink-0">
            Interest Score Weights
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs font-semibold data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-lg shrink-0">
            Alert Thresholds
          </TabsTrigger>
          <TabsTrigger value="retention" className="text-xs font-semibold data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-lg shrink-0">
            Data Retention &amp; Privacy
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs font-semibold data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-lg shrink-0">
            Activity Log ({logs.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Weights */}
        <TabsContent value="weights">
          <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                Configurable Behavioral Weights
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Weights applied to calculate individual Product Interest Scores and Intent Levels
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Product Detail View</label>
                  <input
                    type="number"
                    value={weights.productView}
                    onChange={(e) => setWeights({ ...weights, productView: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Repeat Product View</label>
                  <input
                    type="number"
                    value={weights.repeatProductView}
                    onChange={(e) => setWeights({ ...weights, repeatProductView: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Scroll &gt;75%</label>
                  <input
                    type="number"
                    value={weights.scroll75}
                    onChange={(e) => setWeights({ ...weights, scroll75: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Gallery Interaction</label>
                  <input
                    type="number"
                    value={weights.galleryInteraction}
                    onChange={(e) => setWeights({ ...weights, galleryInteraction: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Add To Cart</label>
                  <input
                    type="number"
                    value={weights.addToCart}
                    onChange={(e) => setWeights({ ...weights, addToCart: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400 font-bold outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Checkout Started</label>
                  <input
                    type="number"
                    value={weights.checkoutStarted}
                    onChange={(e) => setWeights({ ...weights, checkoutStarted: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-purple-400 font-bold outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Completed Purchase</label>
                  <input
                    type="number"
                    value={weights.purchase}
                    onChange={(e) => setWeights({ ...weights, purchase: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400 font-bold outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Remove From Cart</label>
                  <input
                    type="number"
                    value={weights.removeFromCart}
                    onChange={(e) => setWeights({ ...weights, removeFromCart: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-rose-400 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Checkout Abandoned</label>
                  <input
                    type="number"
                    value={weights.checkoutAbandoned}
                    onChange={(e) => setWeights({ ...weights, checkoutAbandoned: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-rose-400 outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Alerts */}
        <TabsContent value="alerts">
          <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Automatic Anomaly Thresholds
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Trigger high-priority alerts in Marketing Panel when metrics cross critical thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    High Cart Abandonment Alert (%)
                  </label>
                  <input
                    type="number"
                    value={alerts.highCartAbandonmentThreshold}
                    onChange={(e) => setAlerts({ ...alerts, highCartAbandonmentThreshold: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Conversion Drop Alert (%)
                  </label>
                  <input
                    type="number"
                    value={alerts.conversionDropThreshold}
                    onChange={(e) => setAlerts({ ...alerts, conversionDropThreshold: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Retention & Privacy */}
        <TabsContent value="retention">
          <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Data Retention &amp; Privacy Policies
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Automated lifecycle pruning to preserve disk space and ensure privacy compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-slate-300 block mb-1">Raw Events Retention (Days)</label>
                  <input
                    type="number"
                    value={retention.rawEventsDays}
                    onChange={(e) => setRetention({ ...retention, rawEventsDays: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-300 block mb-1">Session Logs Retention (Days)</label>
                  <input
                    type="number"
                    value={retention.sessionsDays}
                    onChange={(e) => setRetention({ ...retention, sessionsDays: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-300 block mb-1">Aggregate Summaries (Years)</label>
                  <input
                    type="number"
                    value={retention.aggregateYears}
                    onChange={(e) => setRetention({ ...retention, aggregateYears: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Activity Log */}
        <TabsContent value="logs">
          <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/80 pb-3">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Marketing Panel Audit Trail
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Log of configuration changes, campaign creation, and data export events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-slate-500">
                          No audit entries recorded yet
                        </td>
                      </tr>
                    ) : (
                      logs.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-200">{l.action}</td>
                          <td className="py-3 px-4 text-slate-300">{l.userName || 'Marketing Head'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-rose-300 border border-slate-700">
                              {l.userRole}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                            {new Date(l.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingSettingsPage;
