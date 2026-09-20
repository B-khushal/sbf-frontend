import React, { useState, useEffect } from 'react';
import {
  Radio,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  Eye,
  ShoppingCart,
  Compass,
  CreditCard,
  CheckCircle2,
  GitFork
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService, LiveVisitor } from '@/services/marketingService';
import CustomerJourneyModal from './CustomerJourneyModal';
import { toast } from 'sonner';

export const LiveVisitorsPage: React.FC = () => {
  const [visitors, setVisitors] = useState<LiveVisitor[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [idleCount, setIdleCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [isJourneyOpen, setIsJourneyOpen] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchLiveVisitors = async () => {
    try {
      const res = await marketingService.getLiveVisitors();
      if (res?.success) {
        setVisitors(res.visitors || []);
        setActiveCount(res.activeCount || 0);
        setIdleCount(res.idleCount || 0);
      }
    } catch (err) {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveVisitors();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLiveVisitors, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleOpenJourney = (visitorId: string) => {
    setSelectedVisitorId(visitorId);
    setIsJourneyOpen(true);
  };

  const getDeviceIcon = (device: string) => {
    const d = (device || '').toLowerCase();
    if (d === 'mobile') return <Smartphone className="w-3.5 h-3.5 text-pink-400" />;
    if (d === 'tablet') return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
    return <Monitor className="w-3.5 h-3.5 text-blue-400" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      );
    }
    if (status === 'Idle') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Idle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Left
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
            <span>Live Visitors Monitor</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time active sessions browsing sbflorist.in right now
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-emerald-400 font-bold">{activeCount}</span> Active
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">{idleCount}</span> Idle
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`h-8 text-xs font-semibold rounded-xl border ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchLiveVisitors}
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-xl shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Live Visitors Container */}
      <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-200">Active Browsing Sessions</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Pseudonymized visitor sessions with real-time stage tracking
              </CardDescription>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {visitors.length} tracked
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-0">
          {/* Mobile Card Feed (Visible on phones < md) */}
          <div className="block md:hidden space-y-3">
            {visitors.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                {loading ? 'Detecting active live visitors...' : 'No active visitors currently browsing'}
              </div>
            ) : (
              visitors.map((v) => (
                <div
                  key={v.sessionId}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-rose-300 font-bold text-xs">
                        {v.displayName}
                      </span>
                      <span className="capitalize text-[11px] text-slate-400 flex items-center gap-1">
                        {getDeviceIcon(v.device)}
                        <span>{v.device}</span>
                      </span>
                    </div>
                    <div>{getStatusBadge(v.status)}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]" title={v.currentPage}>
                      {v.currentPage || '/'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-medium shrink-0">
                      {v.source}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span>Duration: <strong className="text-slate-200 font-mono">{v.duration}</strong></span>
                      <span>Score: <strong className="text-rose-400 font-mono">{v.interestScore || 5}</strong></span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenJourney(v.visitorId)}
                      className="h-7 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-1"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop & Tablet Table (Hidden on phones < md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Visitor</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Traffic Source</th>
                  <th className="py-3 px-4">Current Page</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Journey</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visitors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500 text-xs">
                      {loading ? 'Detecting active live visitors...' : 'No active visitors currently browsing'}
                    </td>
                  </tr>
                ) : (
                  visitors.map((v) => (
                    <tr
                      key={v.sessionId}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3 px-4 font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-rose-300 font-semibold">
                            {v.displayName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5 capitalize">
                          {getDeviceIcon(v.device)}
                          <span>{v.device}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                          {v.source}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-300 font-mono text-[11px]">
                        {v.currentPage || '/'}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        {v.duration}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">
                          {v.activity || 'Browsing'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-rose-400">
                            {v.interestScore || 5}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({v.interestLevel || 'Low'})
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(v.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenJourney(v.visitorId)}
                          className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 ml-auto"
                        >
                          <GitFork className="w-3.5 h-3.5" />
                          <span>Timeline</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Journey Modal */}
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

export default LiveVisitorsPage;
