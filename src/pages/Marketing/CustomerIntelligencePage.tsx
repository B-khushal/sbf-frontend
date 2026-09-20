import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ExternalLink,
  GitFork,
  Calendar,
  CreditCard,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import CustomerJourneyModal from './CustomerJourneyModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const CustomerIntelligencePage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isJourneyOpen, setIsJourneyOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'roster' | 'profile'>('roster');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getCustomers({ limit: 40 });
      if (res?.success) {
        setCustomers(res.customers || []);
        if (res.customers?.length > 0) {
          loadProfile(res.customers[0].visitorId, false);
        }
      }
    } catch (err) {
      toast.error('Failed to load customer profiles');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (id: string, switchTabOnMobile: boolean = false) => {
    setSelectedVisitorId(id);
    if (switchTabOnMobile) {
      setMobileTab('profile');
    }
    try {
      const res = await marketingService.getCustomerProfile(id);
      if (res?.success) {
        setSelectedProfile(res.profile);
      }
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const NON_CUSTOMER_ROLES = ['admin', 'vendor', 'marketing', 'marketing_head', 'marketing_team', 'delivery_partner', 'staff'];

  const filteredCustomers = customers.filter((c) => {
    if (c.role && NON_CUSTOMER_ROLES.includes(String(c.role).toLowerCase())) {
      return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.visitorId && c.visitorId.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Customer Intelligence Profiles</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Behavioral history, stitched customer profiles, and intent analysis
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor ID, name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* Mobile Tab View Switcher (Visible on mobile/tablet < lg) */}
      <div className="flex lg:hidden items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setMobileTab('roster')}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center",
            mobileTab === 'roster'
              ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          Profiles List ({filteredCustomers.length})
        </button>
        <button
          onClick={() => setMobileTab('profile')}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5",
            mobileTab === 'profile'
              ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <span>Selected Profile</span>
          {selectedProfile && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          )}
        </button>
      </div>

      {/* Main Grid: Customer List + Selected Customer Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Customer Roster (5 cols on lg) */}
        <div className={cn("lg:col-span-5 space-y-3", mobileTab === 'profile' ? "hidden lg:block" : "block")}>
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Profiles ({filteredCustomers.length})</span>
            <span>Sorted by Last Active</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Loading customer profiles...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No customer profiles match your search
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedVisitorId === c.visitorId;
                return (
                  <div
                    key={c.visitorId}
                    onClick={() => loadProfile(c.visitorId, true)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer",
                      isSelected
                        ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-950/40'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-slate-200 truncate pr-2">
                        {c.name || 'Anonymous Visitor'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 shrink-0">
                        {c.interestLevel || 'Low'} ({c.interestScore || 5})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="truncate pr-2">{c.visitorId.slice(0, 16)}...</span>
                      <span className="text-emerald-400 font-bold shrink-0">
                        ₹{Number(c.totalRevenue || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Sessions: {c.totalSessions || 1}</span>
                      <span>Views: {c.totalProductViews || 0}</span>
                      <span>Orders: {c.totalOrders || 0}</span>
                      <span className="capitalize">{c.device || 'Mobile'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Customer Profile (7 cols on lg) */}
        <div className={cn("lg:col-span-7", mobileTab === 'roster' ? "hidden lg:block" : "block")}>
          {/* Mobile Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileTab('roster')}
            className="lg:hidden text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-800/60 mb-3 -ml-1 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Profiles List</span>
          </Button>

          {selectedProfile ? (
            <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl lg:sticky lg:top-24">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                      <span>{selectedProfile.name}</span>
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedProfile.customerId}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                      Status:{' '}
                      <span className="text-rose-400 font-semibold">
                        {selectedProfile.status}
                      </span>
                      {' • '}
                      Email: {selectedProfile.email}
                    </CardDescription>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setIsJourneyOpen(true)}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold h-8 rounded-xl shadow-md shadow-rose-950/40 flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>View Journey Timeline</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Metrics Summary */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 sm:mb-3">
                    Customer Financial &amp; Activity Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase">Total Revenue</div>
                      <div className="text-base font-bold text-emerald-400 font-mono mt-0.5 truncate">
                        ₹{Number(selectedProfile.totalRevenue).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase">Average Order Value</div>
                      <div className="text-base font-bold text-slate-200 font-mono mt-0.5 truncate">
                        ₹{Number(selectedProfile.aov).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase">Total Orders</div>
                      <div className="text-base font-bold text-slate-200 font-mono mt-0.5 truncate">
                        {selectedProfile.orders}
                      </div>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase">Total Sessions</div>
                      <div className="text-base font-bold text-indigo-400 font-mono mt-0.5 truncate">
                        {selectedProfile.sessions}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Behavioral Patterns */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 sm:mb-3">
                    Observed Storefront Behavior
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                    <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/40 flex items-center justify-between">
                      <span className="text-slate-400">Most Viewed Category:</span>
                      <span className="font-semibold text-slate-200">{selectedProfile.behavior.mostViewedCategory}</span>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/40 flex items-center justify-between">
                      <span className="text-slate-400">Preferred Product:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[150px]">{selectedProfile.behavior.mostViewedProduct}</span>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/40 flex items-center justify-between">
                      <span className="text-slate-400">Preferred Device:</span>
                      <span className="font-semibold text-slate-200 capitalize">{selectedProfile.behavior.preferredDevice}</span>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/40 flex items-center justify-between">
                      <span className="text-slate-400">Traffic Acquisition:</span>
                      <span className="font-semibold text-slate-200 capitalize">{selectedProfile.behavior.trafficSource}</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400 font-mono">
                  <span>First Seen: {new Date(selectedProfile.firstSeen).toLocaleDateString()}</span>
                  <span>Last Active: {new Date(selectedProfile.lastActive).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
              Select a customer profile from the left roster to view behavioral intelligence.
            </div>
          )}
        </div>
      </div>

      {/* Customer Journey Modal */}
      <CustomerJourneyModal
        visitorId={selectedVisitorId}
        isOpen={isJourneyOpen}
        onClose={() => setIsJourneyOpen(false)}
      />
    </div>
  );
};

export default CustomerIntelligencePage;

