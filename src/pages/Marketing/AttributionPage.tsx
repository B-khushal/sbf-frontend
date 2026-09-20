import React, { useState, useEffect } from 'react';
import {
  Split,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

export const AttributionPage: React.FC = () => {
  const [model, setModel] = useState<string>('Last Touch');
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAttribution = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getAttribution(model);
      if (res?.success) {
        setChannels(res.channels || []);
      }
    } catch (e) {
      toast.error('Failed to load attribution data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttribution();
  }, [model]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Split className="w-5 h-5 text-teal-400" />
            Marketing Attribution Modeling
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Credit revenue and conversions across First-Touch, Last-Touch, and Multi-Channel Touchpoints
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['First Touch', 'Last Touch', 'UTM Campaign', 'Direct'].map((m) => (
            <Button
              key={m}
              variant="ghost"
              size="sm"
              onClick={() => setModel(m)}
              className={`text-xs px-3 h-8 rounded-lg font-medium shrink-0 ${
                model === m
                  ? 'bg-teal-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {m}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchAttribution}
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Model Definition Card */}
      <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
        <CardContent className="p-4 flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-100">Active Model: {model}</span>
            <p className="text-slate-400 mt-0.5">
              {model === 'First Touch'
                ? 'Credits 100% of the sale to the initial marketing touchpoint that first introduced the customer to sbflorist.in.'
                : model === 'Last Touch'
                ? 'Credits 100% of the sale to the final channel or ad that directly preceded checkout.'
                : model === 'UTM Campaign'
                ? 'Attributes orders strictly according to captured campaign UTM tags regardless of intermediate visits.'
                : 'Tracks pure direct navigation sessions separately from all paid marketing channels.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Channel Attribution Table */}
      <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-slate-200">
            Attributed Revenue by Channel ({model})
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Reconciled revenue and session volume attributed under the {model} rule
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Channel / Source</th>
                  <th className="py-3 px-4 text-center">Visitors</th>
                  <th className="py-3 px-4 text-center">Sessions</th>
                  <th className="py-3 px-4 text-right">Attributed Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {channels.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500">
                      No channel attribution data available
                    </td>
                  </tr>
                ) : (
                  channels.map((ch) => (
                    <tr key={ch.channel} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {ch.channel}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {ch.visitors}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {ch.sessions}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-400">
                        ₹{Number(ch.revenue || 0).toLocaleString()}
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
  );
};

export default AttributionPage;
