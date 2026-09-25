import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  ShieldCheck,
  Package,
  ShoppingCart,
  Search,
  Megaphone,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Users,
  Eye,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileJson,
  Printer,
  Sparkles,
  BarChart3,
  CalendarRange,
  Clock,
  Layers,
  Repeat,
  HeartHandshake,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  marketingService,
  ReportResponse,
  ReportColumn
} from '@/services/marketingService';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Executive' | 'Catalog' | 'Sales' | 'Acquisition' | 'Demand' | 'Retention' | 'Occasions' | 'Security';
  icon: React.ElementType;
}

const TEMPLATES: ReportTemplate[] = [
  {
    id: 'daily_summary',
    name: 'Daily Executive Marketing Summary',
    description: 'Day-by-day telemetry matching visitor traffic, cart additions, checkouts, orders, and gross revenue.',
    category: 'Executive',
    icon: Calendar
  },
  {
    id: 'weekly_summary',
    name: 'Weekly Growth & Conversion Report',
    description: '7-day rolling aggregates with conversion velocities, AOV shifts, and visitor growth.',
    category: 'Executive',
    icon: TrendingUp
  },
  {
    id: 'product_performance',
    name: 'Product Catalog Performance Report',
    description: 'Item-level detail on views, cart rate, conversion %, units sold, revenue, and stock health.',
    category: 'Catalog',
    icon: Package
  },
  {
    id: 'abandoned_carts',
    name: 'Abandoned Carts & Recovery Report',
    description: 'Records of unpurchased baskets, drop-off stages, pipeline value, and recoverable customer contacts.',
    category: 'Sales',
    icon: ShoppingCart
  },
  {
    id: 'campaign_attribution',
    name: 'Campaign & Multi-Channel Attribution',
    description: 'UTM campaign performance benchmarking spend against orders, clicks, CPA, and blended ROAS.',
    category: 'Acquisition',
    icon: Megaphone
  },
  {
    id: 'search_demand',
    name: 'Search Intelligence & Zero-Result Report',
    description: 'On-site consumer search demand, query volumes, zero-result misses, and merchandising gaps.',
    category: 'Demand',
    icon: Search
  },
  {
    id: 'customer_retention',
    name: 'Customer Cohorts & Retention Report',
    description: 'Customer order frequency, cumulative lifetime value (LTV), repeat purchase rate, and VIP accounts.',
    category: 'Retention',
    icon: Users
  },
  {
    id: 'occasions_breakdown',
    name: 'Occasions & Seasonal Sales Breakdown',
    description: 'Occasion-based buying behaviors across Valentine, Birthday, Anniversary, and Sympathy events.',
    category: 'Occasions',
    icon: HeartHandshake
  },
  {
    id: 'marketing_audit',
    name: 'Marketing Activity & Audit Log',
    description: 'Immutable security audit trail of staff actions, report exports, campaign updates, and settings.',
    category: 'Security',
    icon: ShieldCheck
  }
];

const TIMEFRAMES = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom Range' }
];

export const MarketingReportsPage: React.FC = () => {
  // Navigation & Filter state
  const [activeReportId, setActiveReportId] = useState<string>('daily_summary');
  const [timeframe, setTimeframe] = useState<string>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // Data fetching state
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Table interactive state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [showChart, setShowChart] = useState<boolean>(true);

  // Fetch report data whenever activeReportId or timeframe changes
  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getReportData({
        reportType: activeReportId,
        timeframe,
        startDate: customStart || undefined,
        endDate: customEnd || undefined
      });
      if (res && res.success) {
        setReportData(res);
        // Default sort key to first date or number column if available
        if (res.columns && res.columns.length > 0) {
          const defaultCol = res.columns.find(c => c.key === 'revenue' || c.key === 'date' || c.key === 'lastActivityAt' || c.key === 'timestamp') || res.columns[0];
          setSortKey(defaultCol.key);
          setSortAsc(false);
        }
        setCurrentPage(1);
      }
    } catch (err: any) {
      toast.error('Failed to load report data from marketing engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReportId, timeframe]);

  // Handle custom date apply
  const handleApplyCustomDates = () => {
    if (!customStart || !customEnd) {
      toast.error('Please specify both start and end dates');
      return;
    }
    setTimeframe('custom');
    fetchReport();
    setShowCustomPicker(false);
  };

  // Download Handler (CSV or JSON)
  const handleDownload = async (reportId: string, format: 'csv' | 'json' = 'csv') => {
    setDownloadingId(`${reportId}_${format}`);
    try {
      await marketingService.downloadReport({
        reportType: reportId,
        timeframe,
        startDate: customStart || undefined,
        endDate: customEnd || undefined,
        format
      });
      toast.success(`${format.toUpperCase()} report exported successfully!`);
    } catch (err: any) {
      toast.error(`Failed to export report: ${err.message || 'Unknown error'}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Copy table rows to clipboard
  const handleCopyTable = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) {
      toast.error('No data available to copy');
      return;
    }
    const headers = reportData.columns.map(c => c.label).join('\t');
    const lines = filteredRows.map(row => {
      return reportData.columns.map(c => {
        const val = row[c.key];
        return val !== undefined && val !== null ? String(val) : '';
      }).join('\t');
    });
    const tsv = [headers, ...lines].join('\n');
    navigator.clipboard.writeText(tsv);
    toast.success(`Copied ${filteredRows.length} rows to clipboard!`);
  };

  // Sort and filter table rows
  const filteredRows = useMemo(() => {
    if (!reportData?.rows) return [];
    let list = [...reportData.rows];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(row => {
        return Object.values(row).some(v =>
          v !== undefined && v !== null && String(v).toLowerCase().includes(q)
        );
      });
    }

    // Sort
    if (sortKey) {
      list.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (typeof valA === 'string' && valA.endsWith('%')) {
          valA = parseFloat(valA);
        }
        if (typeof valB === 'string' && valB.endsWith('%')) {
          valB = parseFloat(valB);
        }

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return list;
  }, [reportData?.rows, searchQuery, sortKey, sortAsc]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const activeTemplate = TEMPLATES.find(t => t.id === activeReportId) || TEMPLATES[0];

  // Helper formatting for cell value
  const renderCellContent = (col: ReportColumn, value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-600 dark:text-slate-500 italic text-[11px]">N/A</span>;
    }

    if (col.type === 'currency') {
      const num = Number(value);
      return (
        <span className="font-semibold text-slate-100">
          ₹{isNaN(num) ? value : num.toLocaleString('en-IN')}
        </span>
      );
    }

    if (col.type === 'badge') {
      const strVal = String(value);
      let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

      if (strVal.includes('%')) {
        const pct = parseFloat(strVal);
        if (pct >= 5) badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        else if (pct > 0) badgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        else badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';
      } else if (['In Stock', 'Active', 'VIP Champion', 'Served', 'delivered'].includes(strVal)) {
        badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      } else if (['Checkout', 'Low Stock', 'Repeat Buyer'].includes(strVal)) {
        badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      } else if (['Cart', 'Out of Stock', 'Zero Hits'].includes(strVal)) {
        badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      }

      return (
        <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${badgeStyle}`}>
          {strVal}
        </Badge>
      );
    }

    if (col.type === 'number') {
      const num = Number(value);
      return (
        <span className="font-mono text-slate-200">
          {isNaN(num) ? value : num.toLocaleString('en-IN')}
        </span>
      );
    }

    return <span className="text-slate-300 truncate max-w-[280px] inline-block">{String(value)}</span>;
  };

  // Render Headline KPIs according to active report summary
  const renderKpiCards = () => {
    if (!reportData?.summary) return null;
    const s = reportData.summary;

    let cards: Array<{ label: string; value: string | number; sub: string; icon: React.ElementType; color: string }> = [];

    switch (activeReportId) {
      case 'daily_summary':
      case 'weekly_summary':
        cards = [
          {
            label: 'Total Reconciled Revenue',
            value: `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`,
            sub: 'From verified customer orders',
            icon: CreditCard,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'Orders Completed',
            value: (s.totalOrders || 0).toLocaleString('en-IN'),
            sub: `AOV: ₹${(s.blendedAov || s.avgWeeklyRevenue || 0).toLocaleString('en-IN')}`,
            icon: ShoppingCart,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          },
          {
            label: 'Total Visitors Monitored',
            value: (s.totalVisitors || 0).toLocaleString('en-IN'),
            sub: `${s.totalPageViews || 0} total page interactions`,
            icon: Users,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          },
          {
            label: 'Avg Conversion Rate',
            value: s.avgConversionRate || '0.00%',
            sub: 'Visitor to paid checkout velocity',
            icon: TrendingUp,
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
          }
        ];
        break;

      case 'product_performance':
        cards = [
          {
            label: 'Total Catalog GMV',
            value: `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`,
            sub: 'Revenue attributed to products',
            icon: CreditCard,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'Units Purchased',
            value: (s.totalUnitsSold || 0).toLocaleString('en-IN'),
            sub: `Across ${s.totalProducts || 0} tracked items`,
            icon: Package,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          },
          {
            label: 'Catalog Views & Interest',
            value: (s.totalViews || 0).toLocaleString('en-IN'),
            sub: `${s.totalCartAdds || 0} items added to carts`,
            icon: Eye,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          },
          {
            label: 'Top Revenue Product',
            value: s.topProduct ? (s.topProduct.length > 20 ? s.topProduct.slice(0, 20) + '...' : s.topProduct) : 'None',
            sub: 'Highest grossing floral item',
            icon: Sparkles,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          }
        ];
        break;

      case 'abandoned_carts':
        cards = [
          {
            label: 'Recoverable Pipeline Value',
            value: `₹${(s.totalAbandonedValue || 0).toLocaleString('en-IN')}`,
            sub: 'Potential unrealized revenue',
            icon: CreditCard,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          },
          {
            label: 'Abandoned Baskets',
            value: (s.totalAbandonedCarts || 0).toLocaleString('en-IN'),
            sub: 'Carts left before payment',
            icon: ShoppingCart,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          },
          {
            label: 'Average Basket Value',
            value: `₹${(s.avgCartValue || 0).toLocaleString('en-IN')}`,
            sub: 'Per abandoned session',
            icon: TrendingUp,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          },
          {
            label: 'Cart vs Checkout Drop-off',
            value: `${s.stageDistribution?.Cart || 0} Cart / ${s.stageDistribution?.Checkout || 0} Chkout`,
            sub: 'Funnel drop-off points',
            icon: Layers,
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
          }
        ];
        break;

      case 'campaign_attribution':
        cards = [
          {
            label: 'Total Marketing Spend',
            value: `₹${(s.totalSpend || 0).toLocaleString('en-IN')}`,
            sub: 'Across all active channels',
            icon: CreditCard,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          },
          {
            label: 'Campaign Attributed Revenue',
            value: `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`,
            sub: `${s.totalPurchases || 0} verified orders placed`,
            icon: ShoppingCart,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'Blended ROAS',
            value: s.blendedRoas || '0.00x',
            sub: 'Return on advertising spend',
            icon: TrendingUp,
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
          },
          {
            label: 'Total Paid Clicks & Traffic',
            value: (s.totalClicks || 0).toLocaleString('en-IN'),
            sub: `Top: ${s.topCampaign || 'N/A'}`,
            icon: Megaphone,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          }
        ];
        break;

      case 'search_demand':
        cards = [
          {
            label: 'Total Store Searches',
            value: (s.totalSearches || 0).toLocaleString('en-IN'),
            sub: 'On-site consumer search events',
            icon: Search,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          },
          {
            label: 'Unique Query Terms',
            value: (s.uniqueKeywords || 0).toLocaleString('en-IN'),
            sub: 'Distinct terms entered',
            icon: Layers,
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
          },
          {
            label: 'Zero-Result Misses',
            value: (s.totalZeroResults || 0).toLocaleString('en-IN'),
            sub: `Miss rate: ${s.zeroResultRate || '0.0%'}`,
            icon: ShieldAlert,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          },
          {
            label: 'Top Demand Keyword',
            value: s.topSearchTerm || 'None',
            sub: 'Most frequent customer search',
            icon: Sparkles,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          }
        ];
        break;

      case 'customer_retention':
        cards = [
          {
            label: 'Analyzed Customers',
            value: (s.totalCustomers || 0).toLocaleString('en-IN'),
            sub: 'Registered purchasers',
            icon: Users,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          },
          {
            label: 'Repeat Purchase Rate',
            value: s.repeatRate || '0.0%',
            sub: `${s.repeatCustomers || 0} repeat customers`,
            icon: Repeat,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'Average Customer LTV',
            value: `₹${(s.avgCustomerLTV || 0).toLocaleString('en-IN')}`,
            sub: 'Historical lifetime value',
            icon: CreditCard,
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
          },
          {
            label: 'Total Customer GMV',
            value: `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`,
            sub: 'Cumulative purchase value',
            icon: TrendingUp,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          }
        ];
        break;

      case 'occasions_breakdown':
        cards = [
          {
            label: 'Occasion GMV',
            value: `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`,
            sub: 'Occasion-attributed sales',
            icon: CreditCard,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'Occasion Purchases',
            value: (s.totalPurchases || 0).toLocaleString('en-IN'),
            sub: `${s.totalViews || 0} event product views`,
            icon: ShoppingCart,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          },
          {
            label: 'Tracked Occasions',
            value: (s.totalOccasions || 0).toLocaleString('en-IN'),
            sub: 'Categories configured',
            icon: Layers,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          },
          {
            label: 'Top Converting Occasion',
            value: s.topOccasion || 'General',
            sub: 'Highest revenue event',
            icon: HeartHandshake,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          }
        ];
        break;

      default:
        cards = [
          {
            label: 'Total Security Audit Logs',
            value: (s.totalLogs || filteredRows.length).toLocaleString('en-IN'),
            sub: 'Immutable records preserved',
            icon: ShieldCheck,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'Authorized Staff Members',
            value: (s.uniqueUsers || 1).toLocaleString('en-IN'),
            sub: 'Unique credentialed actors',
            icon: Users,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          }
        ];
        break;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <Card key={idx} className="bg-slate-900/80 border-slate-800/80 shadow-md backdrop-blur-md">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {c.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                    {c.value}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {c.sub}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live PostgreSQL Analytics Connected
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Marketing Intelligence Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5 tracking-tight">
            <FileSpreadsheet className="w-7 h-7 text-rose-500" />
            Marketing Reports &amp; Data Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate, preview, analyze, and export audit-ready e-commerce datasets from verified orders, customer sessions, and behavioral telemetry.
          </p>
        </div>

        {/* Global Export & Action Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReport}
            disabled={loading}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-semibold h-9 rounded-xl flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(activeReportId, 'json')}
            disabled={downloadingId !== null}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-semibold h-9 rounded-xl flex items-center gap-1.5"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleDownload(activeReportId, 'csv')}
            disabled={downloadingId !== null}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-rose-950/40 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-white" />
            <span>
              {downloadingId === `${activeReportId}_csv` ? 'Generating CSV...' : 'Export CSV Dataset'}
            </span>
          </Button>
        </div>
      </div>

      {/* Timeframe & Date Range Selector */}
      <div className="bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
            Reporting Period:
          </span>
          {TIMEFRAMES.map(tf => {
            const isSelected = timeframe === tf.id;
            return (
              <Button
                key={tf.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (tf.id === 'custom') {
                    setShowCustomPicker(!showCustomPicker);
                  } else {
                    setTimeframe(tf.id);
                    setShowCustomPicker(false);
                  }
                }}
                className={`text-xs px-2.5 sm:px-3 h-8 rounded-lg font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/40 hover:bg-rose-500'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                {tf.label}
              </Button>
            );
          })}
        </div>

        {reportData?.range && (
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {new Date(reportData.range.start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' — '}
              {new Date(reportData.range.end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Custom Date Range Popover */}
      {showCustomPicker && (
        <Card className="bg-slate-900 border-slate-700/80 shadow-xl p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-auto flex-1">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Start Date</label>
              <Input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="bg-slate-950 border-slate-700 text-slate-200 text-xs h-9"
              />
            </div>
            <div className="w-full sm:w-auto flex-1">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">End Date</label>
              <Input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="bg-slate-950 border-slate-700 text-slate-200 text-xs h-9"
              />
            </div>
            <div className="flex items-center gap-2 pt-5 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={handleApplyCustomDates}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-9 px-4 font-bold rounded-xl"
              >
                Apply Range
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomPicker(false)}
                className="text-slate-400 hover:text-slate-200 text-xs h-9"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Report Categories / Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {TEMPLATES.map(tpl => {
          const Icon = tpl.icon;
          const isActive = activeReportId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => setActiveReportId(tpl.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-slate-800 text-white border-rose-500 shadow-md shadow-rose-950/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>{tpl.name.replace(' Report', '').replace(' Summary', '')}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-950/60 text-slate-400 border border-slate-800">
                {tpl.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Headline KPI Metrics Cards */}
      {renderKpiCards()}

      {/* Visual Analytics Chart View (Collapsible) */}
      {reportData?.chartData && reportData.chartData.length > 0 && (
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md backdrop-blur-md">
          <CardHeader className="p-4 sm:p-5 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-400" />
                {reportData.reportTitle} — Trend &amp; Distribution Visualizer
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Dynamic visualization representing data points in the selected timeframe
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChart(!showChart)}
              className="text-slate-400 hover:text-slate-200 text-xs h-7 px-2"
            >
              {showChart ? 'Hide Chart' : 'Show Chart'}
            </Button>
          </CardHeader>

          {showChart && (
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {['daily_summary', 'weekly_summary'].includes(activeReportId) ? (
                    <AreaChart data={reportData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                      <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorVis)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={reportData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="revenue" name="Revenue (₹)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spend" name="Spend (₹)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="count" name="Count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="searches" name="Searches" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Interactive Live Data Table Card */}
      <Card className="bg-slate-900/80 border-slate-800/80 shadow-xl rounded-2xl overflow-hidden backdrop-blur-md">
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <activeTemplate.icon className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{reportData?.reportTitle || activeTemplate.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredRows.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl truncate">
                {reportData?.reportDescription || activeTemplate.description}
              </p>
            </div>
          </div>

          {/* Table Tools: Search, Copy, Download */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <Input
                placeholder="Search rows..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950/80 border-slate-700 text-slate-200 text-xs pl-8 h-8 rounded-xl placeholder:text-slate-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTable}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs h-8 px-2.5 rounded-xl flex items-center gap-1.5"
              title="Copy current table rows to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Copy</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(activeReportId, 'csv')}
              disabled={downloadingId !== null}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700 text-xs h-8 px-3 rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>CSV</span>
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                <th className="py-3 px-4 w-12 text-slate-500">#</th>
                {reportData?.columns.map(col => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        <ArrowUpDown
                          className={`w-3 h-3 transition-opacity ${
                            isSorted ? 'text-rose-400 opacity-100' : 'opacity-30'
                          }`}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={(reportData?.columns.length || 5) + 1} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 text-rose-500 animate-spin" />
                      <span className="text-xs font-medium">Aggregating PostgreSQL telemetry...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={(reportData?.columns.length || 5) + 1} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-7 h-7 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-300">No records found for this period</span>
                      <span className="text-[11px] text-slate-500">
                        Try selecting 'All Time' or a broader date range to inspect historical telemetry.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={row.id || idx}
                      className="hover:bg-slate-800/40 transition-colors text-slate-300"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {rowNumber}
                      </td>
                      {reportData?.columns.map(col => (
                        <td key={col.key} className="py-3 px-4">
                          {renderCellContent(col, row[col.key])}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} records
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[11px] text-slate-500">Rows:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="h-8 px-2.5 bg-slate-800 text-slate-300 border-slate-700 disabled:opacity-40 rounded-lg text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <span className="px-2 text-xs font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 bg-slate-800 text-slate-300 border-slate-700 disabled:opacity-40 rounded-lg text-xs"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Instant Export Hub / Report Catalog Deck */}
      <div className="space-y-3 pt-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-400" />
            Export Center &amp; Report Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quickly trigger auditable CSV datasets or switch the live Studio analysis for any of the 9 intelligence domains
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map(tpl => {
            const Icon = tpl.icon;
            const isCurrent = activeReportId === tpl.id;
            const isDownloadingCsv = downloadingId === `${tpl.id}_csv`;
            const isDownloadingJson = downloadingId === `${tpl.id}_json`;

            return (
              <Card
                key={tpl.id}
                className={`bg-slate-900/70 border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all ${
                  isCurrent ? 'ring-1 ring-rose-500/50 border-rose-500/40' : ''
                }`}
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

                <CardContent className="pt-2 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveReportId(tpl.id)}
                      className={`text-xs font-semibold h-8 rounded-xl border flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isCurrent ? 'Viewing' : 'Inspect'}</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleDownload(tpl.id, 'csv')}
                      disabled={isDownloadingCsv}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold h-8 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isDownloadingCsv ? 'Exporting...' : 'CSV'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Security & Audit Compliance Footer */}
      <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-100">Enterprise Audit Logging:</strong> Every report generation, filter query, and export action is cryptographically signed and logged with timestamp, user role, and client IP in the immutable Marketing Activity Log.
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 border border-slate-800 px-2 py-1 rounded bg-slate-950">
            Authorization Level: Marketing Head / Admin
          </span>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingReportsPage;
