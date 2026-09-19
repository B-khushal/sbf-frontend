import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Search,
  Clock,
  ExternalLink,
  Users,
  Compass,
  Eye,
  ShoppingCart,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import CustomerJourneyModal from './CustomerJourneyModal';
import { toast } from 'sonner';

export const CustomerJourneysPage: React.FC = () => {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [isJourneyOpen, setIsJourneyOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getCustomers({ limit: 50 });
      if (res?.success) {
        setVisitors(res.customers || []);
      }
    } catch (e) {
      toast.error('Failed to load journeys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  const NON_CUSTOMER_ROLES = ['admin', 'vendor', 'marketing', 'marketing_head', 'marketing_team', 'delivery_partner', 'staff'];

  const filtered = visitors.filter((v) => {
    if (v.role && NON_CUSTOMER_ROLES.includes(String(v.role).toLowerCase())) {
      return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(term)) ||
      (v.visitorId && v.visitorId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-400" />
            Customer Journey Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect step-by-step visitor journeys from initial landing to final conversion
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search visitor ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchJourneys}
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Journeys Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-slate-900/30 border border-slate-800 rounded-2xl">
            {loading ? 'Loading journeys...' : 'No visitor journeys found'}
          </div>
        ) : (
          filtered.map((v) => (
            <Card
              key={v.visitorId}
              className="bg-slate-900/70 border-slate-800/80 shadow-md hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-200">
                      {v.name || 'Anonymous Visitor'}
                    </CardTitle>
                    <CardDescription className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {v.visitorId}
                    </CardDescription>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-300">
                    {v.interestLevel || 'Low'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-xl bg-slate-800/40 text-[11px]">
                  <div>
                    <div className="text-slate-500 text-[10px]">Sessions</div>
                    <div className="font-bold text-slate-200 font-mono mt-0.5">{v.totalSessions || 1}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Views</div>
                    <div className="font-bold text-slate-200 font-mono mt-0.5">{v.totalProductViews || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Orders</div>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">{v.totalOrders || 0}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Last: {new Date(v.lastSeenAt).toLocaleDateString()}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedVisitorId(v.visitorId);
                      setIsJourneyOpen(true);
                    }}
                    className="h-7 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg flex items-center gap-1.5"
                  >
                    <GitFork className="w-3 h-3" />
                    <span>View Timeline</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CustomerJourneyModal
        visitorId={selectedVisitorId}
        isOpen={isJourneyOpen}
        onClose={() => {
          setIsJourneyOpen(false);
          setSelectedVisitorId(null);
        }}
      />
    </div>
  );
};

export default CustomerJourneysPage;
