import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Flame,
  Search,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

export const MarketingOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getOpportunities();
      if (res?.success) {
        setOpportunities(res.opportunities || []);
      }
    } catch (e) {
      toast.error('Failed to load marketing opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Marketing Opportunity Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real data-backed observations, conversion bottlenecks, and growth opportunities
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={fetchOpportunities}
          disabled={loading}
          className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </Button>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Analyzing telemetry for growth opportunities...
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No actionable bottlenecks detected. Storefront conversion flow is performing smoothly.
          </div>
        ) : (
          opportunities.map((opp) => (
            <Card
              key={opp.id}
              className="bg-slate-900/70 border-slate-800/80 shadow-md hover:border-slate-700 transition-all"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {opp.category}
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {opp.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-medium">
                    <span>Recommended Action:</span>
                    <span className="text-slate-300 font-normal">{opp.action}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-6 gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Underlying Metric</div>
                    <div className="font-mono text-xs font-bold text-rose-300">
                      {opp.metric}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {opp.impact} Impact
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MarketingOpportunitiesPage;
