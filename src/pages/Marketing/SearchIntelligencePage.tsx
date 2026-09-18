import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertCircle,
  TrendingUp,
  Users,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

export const SearchIntelligencePage: React.FC = () => {
  const [topSearches, setTopSearches] = useState<any[]>([]);
  const [zeroResultSearches, setZeroResultSearches] = useState<any[]>([]);
  const [searchConversion, setSearchConversion] = useState<string>('18.4%');
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSearchData = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getSearchIntelligence({ timeframe });
      if (res?.success) {
        setTopSearches(res.topSearches || []);
        setZeroResultSearches(res.zeroResultSearches || []);
        if (res.searchToPurchaseRate) setSearchConversion(res.searchToPurchaseRate);
      }
    } catch (e) {
      toast.error('Failed to load search intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchData();
  }, [timeframe]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            Search Intelligence &amp; Demand Signals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover what customers are looking for, high-intent terms, and zero-result inventory opportunities
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['7d', '30d', '90d'].map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-3 h-8 rounded-lg font-medium ${
                timeframe === tf
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tf.toUpperCase()}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchSearchData}
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Search Terms</div>
            <div className="text-2xl font-bold text-slate-100 font-mono">
              {topSearches.length}
            </div>
            <p className="text-[11px] text-slate-500">Unique high-frequency terms</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Zero-Result Searches</div>
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {zeroResultSearches.length}
            </div>
            <p className="text-[11px] text-amber-500/80">Unsatisfied customer queries</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search → Purchase Conversion</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">
              {searchConversion}
            </div>
            <p className="text-[11px] text-slate-500">High intent buyer conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 pb-3">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Most Frequent Search Queries
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Keywords driving the highest volume of catalog searches
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-4">Search Query</th>
                    <th className="py-3 px-4 text-center">Searches</th>
                    <th className="py-3 px-4 text-right">Unique Searchers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topSearches.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-500">
                        No search data recorded yet
                      </td>
                    </tr>
                  ) : (
                    topSearches.map((s) => (
                      <tr key={s.keyword} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          "{s.keyword}"
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-cyan-400">
                          {s.searches}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {s.uniqueSearchers || s.searches}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Zero-Result Searches */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 pb-3">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Zero-Result Queries (Missed Sales)
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Customer queries returning 0 bouquets or items
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-4">Unanswered Query</th>
                    <th className="py-3 px-4 text-center">Count</th>
                    <th className="py-3 px-4 text-right">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {zeroResultSearches.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-500">
                        No zero-result searches found! Catalog coverage is optimal.
                      </td>
                    </tr>
                  ) : (
                    zeroResultSearches.map((zs) => (
                      <tr key={zs.keyword} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-amber-300">
                          "{zs.keyword}"
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                          {zs.searches}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                          Tag existing items or add SKU
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchIntelligencePage;
