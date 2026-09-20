import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  ShieldCheck,
  Package,
  ShoppingCart,
  Search,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
}

const templates: ReportTemplate[] = [
  {
    id: 'daily_summary',
    name: 'Daily Marketing Executive Report',
    description: 'Day-by-day breakdown of visitors, views, cart additions, orders, and reconciled revenue.',
    category: 'Executive',
    icon: Calendar
  },
  {
    id: 'weekly_summary',
    name: 'Weekly Growth & Conversion Report',
    description: '7-day rolling aggregates with conversion rates, AOV trends, and visitor growth.',
    category: 'Executive',
    icon: Calendar
  },
  {
    id: 'product_performance',
    name: 'Product Catalog Performance Report',
    description: 'Item-level detail on views, cart rate, conversion %, interest scores, and product revenue.',
    category: 'Catalog',
    icon: Package
  },
  {
    id: 'abandoned_carts',
    name: 'Abandoned Carts & Recovery Report',
    description: 'Records of all abandoned baskets, stages, total values, and customer contact info if available.',
    category: 'Sales',
    icon: ShoppingCart
  },
  {
    id: 'campaign_attribution',
    name: 'Campaign & Multi-Channel Attribution Report',
    description: 'UTM campaign performance, spend, impressions, clicks, purchases, CPA, and ROAS.',
    category: 'Acquisition',
    icon: Megaphone
  },
  {
    id: 'search_demand',
    name: 'Search Intelligence & Zero-Result Report',
    description: 'Top queries, frequency, zero-result terms, and conversion rates from search.',
    category: 'Demand',
    icon: Search
  }
];

export const MarketingReportsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (reportId: string) => {
    setDownloadingId(reportId);
    try {
      const url = marketingService.exportReportUrl(reportId, timeframe);
      window.open(url, '_blank');
      toast.success('Report export started! Download will begin shortly.');
    } catch (e) {
      toast.error('Failed to initiate export');
    } finally {
      setTimeout(() => setDownloadingId(null), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-rose-400" />
            Marketing Reports &amp; Exports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Download auditable CSV analytics datasets for leadership review and accounting reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 font-semibold mr-1 shrink-0">Timeframe:</span>
          {['7d', '30d', '90d'].map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-3 h-8 rounded-lg font-medium shrink-0 ${
                timeframe === tf
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tf.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Security Banner */}
      <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-100">Audit Trail Enabled:</strong> Every report generation action is logged in the Marketing Activity Log with timestamp and role credentials.
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
            Marketing Head Authorization Active
          </span>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          const isDownloading = downloadingId === tpl.id;

          return (
            <Card
              key={tpl.id}
              className="bg-slate-900/70 border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-rose-400" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {tpl.category}
                  </span>
                </div>
                <CardTitle className="text-sm font-bold text-slate-200 mt-2">
                  {tpl.name}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tpl.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(tpl.id)}
                  disabled={isDownloading}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold h-8 rounded-xl flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isDownloading ? 'Preparing CSV...' : 'Download CSV Dataset'}</span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MarketingReportsPage;
