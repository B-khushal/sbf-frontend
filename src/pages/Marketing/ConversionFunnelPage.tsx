import React, { useState, useEffect } from 'react';
import {
  Filter,
  ArrowDown,
  TrendingDown,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

export const ConversionFunnelPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [stages, setStages] = useState<any[]>([]);
  const [overallRate, setOverallRate] = useState<string>('0%');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFunnel = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getConversionFunnel({ timeframe });
      if (res?.success) {
        setStages(res.stages || []);
        setOverallRate(res.overallConversionRate || '0%');
      }
    } catch (e) {
      toast.error('Failed to load conversion funnel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnel();
  }, [timeframe]);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-400" />
            Conversion &amp; Abandonment Funnel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify exact drop-off points throughout the buyer journey
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['today', '7d', '30d', '90d'].map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-3 h-8 rounded-lg font-medium shrink-0 ${
                timeframe === tf
                  ? 'bg-purple-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tf.toUpperCase()}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchFunnel}
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top-Of-Funnel Visitors</div>
            <div className="text-2xl font-bold text-slate-100 font-mono">
              {stages[0]?.count.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-slate-500">Initial storefront entries</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Purchases</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {stages[stages.length - 1]?.count.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-slate-500">Authoritative orders reconciled</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Conversion Rate</div>
            <div className="text-2xl font-bold text-rose-400 font-mono">
              {overallRate}
            </div>
            <p className="text-[11px] text-slate-500">Visitor to paying customer ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visual Progression */}
      <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-slate-200">Full 6-Stage Conversion Funnel</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Stage volume and sequential drop-off percentages
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          {stages.map((stage, idx) => {
            const baseCount = stages[0]?.count || 1;
            const widthPercent = Math.max(12, Math.round((stage.count / baseCount) * 100));

            return (
              <div key={stage.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-purple-400">
                      {idx + 1}
                    </span>
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
                    <span className="font-bold text-slate-100">{stage.count.toLocaleString()}</span>
                    {idx > 0 && (
                      <span className="text-amber-400 text-[11px]">
                        Drop: {stage.dropOff}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-6 sm:h-8 bg-slate-800/60 rounded-xl overflow-hidden p-0.5 sm:p-1 flex items-center">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 transition-all duration-700 flex items-center px-1.5 sm:px-3 min-w-[40px]"
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-[9px] sm:text-[10px] font-bold text-white font-mono whitespace-nowrap">
                      {widthPercent}%
                    </span>
                  </div>
                </div>

                {/* Drop-off transition arrow */}
                {idx < stages.length - 1 && (
                  <div className="flex items-center justify-center py-0.5 text-slate-600 text-xs">
                    <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionFunnelPage;
