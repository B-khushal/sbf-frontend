import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { marketingService } from '@/services/marketingService';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export const CampaignAnalyticsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [adIntegrations, setAdIntegrations] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const { user } = useAuth();

  const isHead = user?.role === 'marketing_head' || user?.role === 'platform_admin' || user?.role === 'admin';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Instagram',
    utmCampaign: '',
    utmSource: 'instagram',
    utmMedium: 'social',
    budget: 10000,
    spend: 0
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getCampaigns();
      if (res?.success) {
        setCampaigns(res.campaigns || []);
        if (res.adIntegrations) setAdIntegrations(res.adIntegrations);
      }
    } catch (e) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await marketingService.createCampaign(formData);
      if (res?.success) {
        toast.success('Campaign tracking link created successfully!');
        setIsCreateOpen(false);
        fetchCampaigns();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            Campaign Analytics &amp; Attribution
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor ad spend, ROAS, conversion metrics, and multi-channel acquisition
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isHead && (
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-8 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Campaign Link</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchCampaigns}
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Ad Integration Architecture Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Meta Ads API Integration Architecture
              </CardTitle>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Ready to Connect
              </span>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Direct official Meta Marketing API integration for Instagram &amp; Facebook campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-slate-400 space-y-2">
            <p>
              Supports campaign-level spend, creative tracking, impressions, and ROAS calculations natively without external cookies.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60 font-mono">
              <span>Pixel &amp; CAPI Status: Configured</span>
              <span className="text-blue-400 font-semibold">Instagram / FB Ready</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Google Ads Integration Architecture
              </CardTitle>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Ready to Connect
              </span>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Google Search &amp; Performance Max campaign tracking architecture
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-slate-400 space-y-2">
            <p>
              Tracks keyword impressions, CPC, search conversions, and revenue reconciliation for Delhi &amp; nationwide flower searches.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60 font-mono">
              <span>Google Conversion API: Supported</span>
              <span className="text-amber-400 font-semibold">Search / PMax Ready</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Container */}
      <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-slate-200">
            Campaign Performance Roster
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Performance indicators calculated with reconciled revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-0">
          {/* Mobile Campaign Cards (Visible on phones < md) */}
          <div className="block md:hidden space-y-3">
            {campaigns.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No campaigns tracked yet. Create your first campaign link!
              </div>
            ) : (
              campaigns.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-slate-100">{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[200px]">
                        {c.utmCampaign}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {c.platform}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Spend</div>
                      <div className="font-mono font-bold text-slate-200 mt-0.5">
                        ₹{Number(c.spend || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Revenue</div>
                      <div className="font-mono font-bold text-emerald-400 mt-0.5">
                        ₹{Number(c.revenue || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <div>
                      Clicks/Sessions: <strong className="text-slate-200 font-mono">{c.clicks || 0} / {c.sessions || 0}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Orders: <strong className="text-emerald-400 font-mono">{c.purchases || 0}</strong></span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] border border-rose-500/30">
                        {c.roas || 0}x ROAS
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (Hidden on phones < md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">UTM Campaign</th>
                  <th className="py-3 px-4 text-center">Spend</th>
                  <th className="py-3 px-4 text-center">Clicks / Sessions</th>
                  <th className="py-3 px-4 text-center">Purchases</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-center">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">
                      No campaigns tracked yet. Create your first campaign link!
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {c.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {c.platform}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {c.utmCampaign}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        ₹{Number(c.spend || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {c.clicks || 0} / {c.sessions || 0}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                        {c.purchases || 0}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                        ₹{Number(c.revenue || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-400">
                        {c.roas || 0}x
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 p-4 sm:p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-400" />
              Generate Campaign Tracking Link
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Create a new campaign to track traffic, clicks, and sales from ads
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCampaign} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Summer Flowers Blast 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full h-8 px-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Influencer">Influencer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">UTM Campaign</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. summer_blast_26"
                  value={formData.utmCampaign}
                  onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Spend to Date (₹)</label>
                <input
                  type="number"
                  value={formData.spend}
                  onChange={(e) => setFormData({ ...formData, spend: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800 flex flex-row items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)} className="h-8 text-xs text-slate-400">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                Save Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignAnalyticsPage;
