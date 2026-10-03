import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Radio,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  Eye,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  GitFork,
  Search,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Volume2,
  VolumeX,
  MessageCircle,
  User,
  Copy,
  Check,
  Grid,
  List,
  ArrowUpRight,
  Activity,
  Zap,
  Filter,
  ChevronDown,
  Compass
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  marketingService,
  LiveVisitor,
  LiveVisitorsSummary,
  LiveActivityFeedItem
} from '@/services/marketingService';
import CustomerJourneyModal from './CustomerJourneyModal';
import { toast } from 'sonner';

export const LiveVisitorsPage: React.FC = () => {
  // Data state
  const [visitors, setVisitors] = useState<LiveVisitor[]>([]);
  const [summary, setSummary] = useState<LiveVisitorsSummary | null>(null);
  const [activityFeed, setActivityFeed] = useState<LiveActivityFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('2h');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCustomerType, setSelectedCustomerType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'cart' | 'interest' | 'duration' | 'views'>('recent');

  // View & UI states
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(8000); // 8s
  const [soundAlerts, setSoundAlerts] = useState<boolean>(false);
  const [showLiveFeed, setShowLiveFeed] = useState<boolean>(true);
  const [selectedVisitor, setSelectedVisitor] = useState<LiveVisitor | null>(null);
  const [isJourneyOpen, setIsJourneyOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Prev count tracking for sound alert trigger
  const prevHighIntentCount = useRef<number>(0);

  // Synthesize soft pleasant POS sound alert using Web Audio API
  const playSoundAlert = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Fetch Live Visitors from Customer-Only API
  const fetchLiveVisitors = async (isManual = false) => {
    try {
      if (isManual) setLoading(true);
      const res = await marketingService.getLiveVisitors({
        timeframe: selectedTimeframe,
        stage: selectedStage !== 'all' ? selectedStage : undefined,
        device: selectedDevice !== 'all' ? selectedDevice : undefined,
        source: selectedSource !== 'all' ? selectedSource : undefined,
        customerType: selectedCustomerType !== 'all' ? selectedCustomerType : undefined,
        limit: 100
      });

      if (res?.success) {
        setVisitors(res.visitors || []);
        setSummary(res.summary || null);
        setActivityFeed(res.recentActivityFeed || []);
        setLastUpdated(new Date());

        // Play chime if new cart/checkout visitor entered
        const currentHighIntent = (res.summary?.cartCount || 0) + (res.summary?.checkoutCount || 0);
        if (soundAlerts && currentHighIntent > prevHighIntentCount.current && prevHighIntentCount.current > 0) {
          playSoundAlert();
        }
        prevHighIntentCount.current = currentHighIntent;
      }
    } catch (err) {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  // Initial and reactive fetch
  useEffect(() => {
    fetchLiveVisitors(true);
  }, [selectedTimeframe, selectedStage, selectedDevice, selectedSource, selectedCustomerType]);

  // Periodic polling interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveVisitors(false);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedTimeframe, selectedStage, selectedDevice, selectedSource, selectedCustomerType]);

  // Copy helper
  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // WhatsApp Cart Rescue Assist
  const handleWhatsAppAssist = (visitor: LiveVisitor) => {
    if (!visitor.customerPhone) {
      toast.error('No customer phone number available for this guest');
      return;
    }
    const cleanPhone = visitor.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const name = visitor.customerName || 'there';
    const productTitle = visitor.cart?.items?.[0]?.title || 'our flower collection';
    const message = encodeURIComponent(
      `Hello ${name}! 👋 Greetings from Spring Blossoms Florist. We noticed you were looking at "${productTitle}" on sbflorist.in. May we help you with same-day delivery, custom flower arrangements, or order placement?`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  const handleOpenJourney = (visitor: LiveVisitor) => {
    setSelectedVisitor(visitor);
    setIsJourneyOpen(true);
  };

  // Client-side filtering & sorting
  const filteredVisitors = useMemo(() => {
    let list = [...visitors];

    // Local instant search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.displayName?.toLowerCase().includes(q) ||
          v.customerName?.toLowerCase().includes(q) ||
          v.customerEmail?.toLowerCase().includes(q) ||
          v.customerPhone?.toLowerCase().includes(q) ||
          v.city?.toLowerCase().includes(q) ||
          v.currentPage?.toLowerCase().includes(q) ||
          v.campaign?.toLowerCase().includes(q) ||
          v.source?.toLowerCase().includes(q) ||
          v.visitorId?.toLowerCase().includes(q) ||
          v.sessionId?.toLowerCase().includes(q)
      );
    }

    // Sort order
    list.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
      }
      if (sortBy === 'cart') {
        return (b.cart?.totalValue || 0) - (a.cart?.totalValue || 0);
      }
      if (sortBy === 'interest') {
        return (b.interestScore || 0) - (a.interestScore || 0);
      }
      if (sortBy === 'duration') {
        return (b.durationSeconds || 0) - (a.durationSeconds || 0);
      }
      if (sortBy === 'views') {
        return (b.pageViewsCount || 1) - (a.pageViewsCount || 1);
      }
      return 0;
    });

    return list;
  }, [visitors, searchQuery, sortBy]);

  // Helpers
  const getDeviceIcon = (device: string) => {
    const d = (device || '').toLowerCase();
    if (d === 'mobile') return <Smartphone className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
    if (d === 'tablet') return <Tablet className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    return <Monitor className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Active</span>
        </span>
      );
    }
    if (status === 'Idle') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Idle</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        <span>Recent</span>
      </span>
    );
  };

  const getStageBadge = (stage: string, hasCart?: boolean, isCheckout?: boolean) => {
    const s = (stage || '').toLowerCase();
    if (isCheckout || s.includes('checkout')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <CreditCard className="w-3 h-3 text-purple-400" />
          <span>In Checkout</span>
        </span>
      );
    }
    if (hasCart || s.includes('cart')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/30">
          <ShoppingCart className="w-3 h-3 text-pink-400" />
          <span>In Cart</span>
        </span>
      );
    }
    if (s.includes('purchased') || s.includes('order')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Purchased</span>
        </span>
      );
    }
    if (s.includes('product') || s.includes('viewing')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
          <Eye className="w-3 h-3 text-blue-400" />
          <span>Viewing Product</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
        <Compass className="w-3 h-3 text-slate-400" />
        <span>Browsing</span>
      </span>
    );
  };

  const getSourceIcon = (src: string) => {
    const s = (src || '').toLowerCase();
    if (s.includes('instagram') || s.includes('ig')) {
      return <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />;
    }
    if (s.includes('facebook') || s.includes('fb')) {
      return <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />;
    }
    if (s.includes('google')) {
      return <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />;
    }
    if (s.includes('whatsapp')) {
      return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />;
    }
    return <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Banner: Verification & Anti-Admin Guard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span>Live Customer Monitor</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer-Only Feed (Admins Excluded)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time shopping sessions across sbflorist.in • High-intent live cart peek & journey intelligence
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound alert switch */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = !soundAlerts;
              setSoundAlerts(next);
              if (next) {
                playSoundAlert();
                toast.success('Sound alerts enabled for new checkout & cart additions');
              } else {
                toast.info('Sound alerts muted');
              }
            }}
            title={soundAlerts ? 'Mute sound alerts' : 'Enable audio chime for cart/checkout events'}
            className={`h-8 text-xs font-semibold rounded-xl border transition-all ${
              soundAlerts
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {soundAlerts ? <Volume2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" /> : <VolumeX className="w-3.5 h-3.5 mr-1.5" />}
            <span>Sound {soundAlerts ? 'ON' : 'OFF'}</span>
          </Button>

          {/* Refresh interval dropdown */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs">
            <span className="text-slate-500 mr-1.5 font-medium">Interval:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              className="bg-transparent text-slate-800 font-mono focus:outline-none cursor-pointer"
            >
              <option value={5000} className="bg-white">5s</option>
              <option value={8000} className="bg-white">8s</option>
              <option value={15000} className="bg-white">15s</option>
              <option value={30000} className="bg-white">30s</option>
            </select>
          </div>

          {/* Auto refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`h-8 text-xs font-semibold rounded-xl border transition-all ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Radio className={`w-3 h-3 mr-1.5 ${autoRefresh ? 'animate-pulse text-emerald-600' : 'text-slate-400'}`} />
            <span>Auto {autoRefresh ? 'ON' : 'OFF'}</span>
          </Button>

          {/* Manual refresh button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchLiveVisitors(true)}
            disabled={loading}
            className="h-8 w-8 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shrink-0 hover:bg-slate-50"
            title="Refresh live data now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-600' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 6 Executive Real-Time Pulse Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Active Right Now */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Now</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {summary?.activeCount || 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              <span>Browsing &lt; 3 mins</span>
            </p>
          </CardContent>
        </Card>

        {/* 2. Idle (Recent 15m) */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Idle Shoppers</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {summary?.idleCount || 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              <span>Active 3-15m ago</span>
            </p>
          </CardContent>
        </Card>

        {/* 3. In Funnel / High Intent */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">In Funnel</span>
              <ShoppingCart className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono tracking-tight">
              {(summary?.cartCount || 0) + (summary?.checkoutCount || 0)}
            </div>
            <p className="text-[10px] text-purple-400/80 mt-1">
              <span>{summary?.checkoutCount || 0} Checkout · {summary?.cartCount || 0} Cart</span>
            </p>
          </CardContent>
        </Card>

        {/* 4. Live Open Cart Value */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">Active Cart ₹</span>
              <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono tracking-tight truncate">
              ₹{(summary?.totalCartValue || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              <span>Potential live checkout value</span>
            </p>
          </CardContent>
        </Card>

        {/* 5. Top Channel / Campaign */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">Top Channel</span>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 truncate tracking-tight">
              {summary?.topSource || 'Direct'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              <span>{summary?.topCities?.[0]?.city || 'Mumbai'} top city</span>
            </p>
          </CardContent>
        </Card>

        {/* 6. Device Split */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Mobile Share</span>
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono tracking-tight">
              {summary?.totalTracked
                ? `${Math.round(((summary.deviceBreakdown?.mobile || 0) / summary.totalTracked) * 100)}%`
                : '100%'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              <span>{summary?.deviceBreakdown?.mobile || 0} mob · {summary?.deviceBreakdown?.desktop || 0} desk</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Live Activity Ticker (Collapsible live event stream) */}
      {activityFeed.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-800/80 shadow-md overflow-hidden">
          <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="font-bold text-slate-200">Real-Time Customer Stream</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[11px]">Latest actions occurring across the store</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLiveFeed(!showLiveFeed)}
              className="h-6 px-2 text-[11px] text-slate-400 hover:text-slate-200"
            >
              {showLiveFeed ? 'Hide Stream' : `Show (${activityFeed.length} events)`}
            </Button>
          </div>

          {showLiveFeed && (
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs max-h-36 overflow-y-auto custom-scrollbar">
              {activityFeed.slice(0, 9).map((ev) => (
                <div
                  key={ev.id}
                  className="p-2 rounded-lg bg-slate-800/30 border border-slate-800 flex items-center justify-between gap-2 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="p-1 rounded bg-slate-800 text-rose-400 shrink-0">
                      {ev.eventType === 'add_to_cart' ? (
                        <ShoppingCart className="w-3 h-3 text-pink-400" />
                      ) : ev.eventType === 'checkout_started' ? (
                        <CreditCard className="w-3 h-3 text-purple-400" />
                      ) : (
                        <Eye className="w-3 h-3 text-blue-400" />
                      )}
                    </span>
                    <div className="truncate">
                      <p className="font-medium text-slate-200 truncate">
                        {ev.productTitle || ev.path || 'Storefront Browsing'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {ev.actorName} ({ev.city || 'Mumbai'}) • {ev.device}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {ev.timeAgo || 'Just now'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Search, Timeframe & Multi-Filters Toolbar */}
      <Card className="bg-slate-900/70 border-slate-800/90 shadow-xl p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by customer name, email, phone, city, page URL, campaign, or visitor ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 text-xs bg-slate-950/60 border-slate-700/80 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 shrink-0">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Window:</span>
            </span>
            {[
              { id: '30m', label: 'Active (< 30m)' },
              { id: '1h', label: 'Last 1h' },
              { id: '2h', label: 'Last 2h' },
              { id: '24h', label: 'Today (24h)' },
              { id: 'all', label: 'Past 7 Days' }
            ].map((tf) => (
              <Button
                key={tf.id}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTimeframe(tf.id)}
                className={`h-8 px-2.5 text-xs font-semibold rounded-xl border transition-all ${
                  selectedTimeframe === tf.id
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {tf.label}
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0 self-end lg:self-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('cards')}
              className={`h-7 px-2.5 rounded-lg text-xs font-semibold ${
                viewMode === 'cards'
                  ? 'bg-slate-800 text-rose-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5 mr-1" />
              <span>Cards</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={`h-7 px-2.5 rounded-lg text-xs font-semibold ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-rose-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5 mr-1" />
              <span>Table</span>
            </Button>
          </div>
        </div>

        {/* Secondary Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          {/* Stage filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px] font-medium mr-1">Stage:</span>
            {[
              { id: 'all', label: 'All Stages' },
              { id: 'checkout', label: 'In Checkout' },
              { id: 'cart', label: 'In Cart' },
              { id: 'product', label: 'Viewing Product' },
              { id: 'browsing', label: 'Browsing' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStage(st.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all ${
                  selectedStage === st.id
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <span className="text-slate-700">|</span>

          {/* Customer Type filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px] font-medium mr-1">Customer:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'registered', label: 'Registered Only' },
              { id: 'guest', label: 'Guests Only' }
            ].map((ct) => (
              <button
                key={ct.id}
                onClick={() => setSelectedCustomerType(ct.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all ${
                  selectedCustomerType === ct.id
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>

          <span className="text-slate-700">|</span>

          {/* Sort selector */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-slate-500 text-[11px] font-medium mr-1">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="recent">Most Recently Active</option>
              <option value="cart">Highest Cart Value</option>
              <option value="interest">Highest Interest Score</option>
              <option value="duration">Longest Duration</option>
              <option value="views">Most Page Views</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Results Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              Showing {filteredVisitors.length} live customer sessions
            </span>
            {searchQuery && (
              <span className="text-rose-400">
                (filtered from {visitors.length} total)
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Synced: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Empty State */}
        {filteredVisitors.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-800 py-16 text-center">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Compass className="w-6 h-6 text-rose-400/60" />
              </div>
              <h3 className="text-base font-bold text-slate-200">No active customer sessions match filters</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No real shoppers are matching your current search query or window. Try broadening the timeframe to &quot;Today (24h)&quot; or clearing your search term.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStage('all');
                    setSelectedTimeframe('24h');
                    setSelectedCustomerType('all');
                  }}
                  className="text-xs rounded-xl border-slate-700"
                >
                  Reset All Filters
                </Button>
                <Button
                  size="sm"
                  onClick={() => fetchLiveVisitors(true)}
                  className="text-xs bg-rose-600 hover:bg-rose-700 rounded-xl"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Refresh Feed
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVisitors.map((v) => (
              <Card
                key={v.sessionId}
                className="bg-slate-900/70 border-slate-800/80 hover:border-slate-700 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Customer ID & Live Status */}
                  <div className="p-3.5 border-b border-slate-800/70 bg-slate-950/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 flex items-center justify-center text-xs font-bold text-rose-300 shrink-0">
                        {v.customerName
                          ? v.customerName.charAt(0).toUpperCase()
                          : v.shortId?.slice(0, 2) || 'G'}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-100 truncate" title={v.displayName}>
                            {v.displayName}
                          </span>
                          {v.isRegisteredCustomer && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                              Registered
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <span>{v.visitorId}</span>
                          <button
                            onClick={() => handleCopy(v.visitorId, v.visitorId, 'Visitor ID')}
                            className="text-slate-500 hover:text-slate-300"
                            title="Copy Visitor ID"
                          >
                            {copiedId === v.visitorId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">{getStatusBadge(v.status)}</div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 text-xs">
                    {/* Customer Contact info if available */}
                    {(v.customerEmail || v.customerPhone) && (
                      <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                        {v.customerEmail && (
                          <span className="text-slate-300 font-mono truncate" title={v.customerEmail}>
                            ✉️ {v.customerEmail}
                          </span>
                        )}
                        {v.customerPhone && (
                          <span className="text-emerald-400 font-mono font-medium">
                            📞 {v.customerPhone}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Current Page & Activity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Current Activity</span>
                        <span className="text-slate-500 font-mono">{v.pageViewsCount || 1} views</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2">
                        <a
                          href={v.currentPage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-rose-300/90 truncate hover:underline hover:text-rose-200 flex items-center gap-1.5"
                          title={v.displayPage || v.currentPage}
                        >
                          {v.resolvedProduct ? (
                            <span className="truncate font-semibold text-rose-300">
                              🌸 {v.displayPage}
                            </span>
                          ) : (
                            <span className="truncate">{v.displayPage || v.currentPage || '/'}</span>
                          )}
                          <ArrowUpRight className="w-3 h-3 shrink-0 opacity-60" />
                        </a>
                        <div className="shrink-0">
                          {getStageBadge(v.activity, v.cart?.hasCart, v.cart?.checkoutStarted)}
                        </div>
                      </div>
                    </div>

                    {/* Traffic Source & Location Pills */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block">Traffic Source</span>
                        <div className="flex items-center gap-1.5 font-medium text-slate-200 truncate">
                          {getSourceIcon(v.source)}
                          <span className="truncate font-semibold">{v.source}</span>
                        </div>
                        {v.campaign && (
                          <span className="text-[9px] font-mono text-slate-400 truncate block">
                            {v.campaign}
                          </span>
                        )}
                      </div>

                      <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block">Location & Tech</span>
                        <div className="flex items-center gap-1 text-slate-200 font-medium truncate">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate font-semibold">{v.city || 'Hyderabad'}, {v.region || 'TS'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-300 truncate font-mono">
                          {getDeviceIcon(v.device)}
                          <span>{v.os || v.device}</span>
                          {v.browser && <span className="text-slate-400 truncate">• {v.browser}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Active Cart Peek if present */}
                    {v.cart && v.cart.hasCart && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Active Cart ({v.cart.itemCount} item{v.cart.itemCount > 1 ? 's' : ''})</span>
                          </span>
                          <span className="font-mono font-bold text-xs text-rose-300">
                            ₹{v.cart.totalValue.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {v.cart.items && v.cart.items.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-rose-500/20 max-h-24 overflow-y-auto custom-scrollbar">
                            {v.cart.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[10px] text-slate-300">
                                <span className="truncate max-w-[190px]">{item.title} × {item.quantity}</span>
                                <span className="font-mono text-slate-400 shrink-0">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interest Score & Duration Progress */}
                    <div className="pt-2 border-t border-slate-800/70 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Interest Score: <strong className="text-rose-400 font-mono">{v.interestScore || 5}</strong> ({v.interestLevel || 'Low'})</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          ⏱️ {v.duration}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            (v.interestScore || 0) >= 60
                              ? 'bg-gradient-to-r from-purple-500 to-rose-500'
                              : (v.interestScore || 0) >= 30
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, v.interestScore || 10))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 border-t border-slate-800/70 bg-slate-950/30 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Active: {v.lastActiveAgo || 'Just now'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp Assist if customer has phone */}
                    {v.customerPhone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWhatsAppAssist(v)}
                        className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg flex items-center gap-1"
                        title="Assist customer with cart via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Assist</span>
                      </Button>
                    )}

                    {/* Timeline Journey Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenJourney(v)}
                      className="h-7 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 font-semibold"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Table Pro View */
          <Card className="bg-slate-900/80 border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Visitor / Customer</th>
                    <th className="py-3.5 px-4">Device & Tech</th>
                    <th className="py-3.5 px-4">Traffic Source</th>
                    <th className="py-3.5 px-4">Current Page</th>
                    <th className="py-3.5 px-4">Cart Total</th>
                    <th className="py-3.5 px-4">Stage</th>
                    <th className="py-3.5 px-4">Interest</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredVisitors.map((v) => (
                    <tr
                      key={v.sessionId}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Customer / Visitor */}
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-[11px] font-bold text-rose-300 shrink-0">
                            {v.customerName
                              ? v.customerName.charAt(0).toUpperCase()
                              : v.shortId?.slice(0, 2) || 'G'}
                          </div>
                          <div className="truncate max-w-[160px]">
                            <div className="font-semibold text-slate-200 truncate flex items-center gap-1">
                              <span>{v.displayName}</span>
                              {v.isRegisteredCustomer && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Registered Customer" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate font-mono">
                              {v.customerEmail || (v.isRegisteredCustomer ? 'Registered Shopper' : `ID: ${v.visitorId.slice(-6)}`)}
                            </div>
                            {v.customerPhone && (
                              <div className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                                <span>📞 {v.customerPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Device & Location */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          {getDeviceIcon(v.device)}
                          <span>{v.os || v.device}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                          <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="font-semibold text-slate-300">{v.city || 'Hyderabad'}</span>
                          {v.browser && <span className="text-slate-500">• {v.browser}</span>}
                        </div>
                      </td>

                      {/* Traffic Source */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {getSourceIcon(v.source)}
                          <span className="font-semibold text-slate-200">{v.source}</span>
                        </div>
                        {v.campaign && (
                          <span className="text-[9px] font-mono text-slate-400 truncate block max-w-[120px]" title={v.campaign}>
                            {v.campaign}
                          </span>
                        )}
                      </td>

                      {/* Current Page */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <a
                          href={v.currentPage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-rose-300 truncate block hover:underline hover:text-rose-200"
                          title={v.displayPage || v.currentPage}
                        >
                          {v.resolvedProduct ? (
                            <span className="font-semibold text-rose-300">
                              🌸 {v.displayPage}
                            </span>
                          ) : (
                            <span>{v.displayPage || v.currentPage || '/'}</span>
                          )}
                        </a>
                        <span className="text-[10px] text-slate-400">
                          {v.pageViewsCount || 1} views in session
                        </span>
                      </td>

                      {/* Cart Total */}
                      <td className="py-3.5 px-4 font-mono">
                        {v.cart?.hasCart ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-rose-400">
                              ₹{v.cart.totalValue.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {v.cart.itemCount} item{v.cart.itemCount > 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4">
                        {getStageBadge(v.activity, v.cart?.hasCart, v.cart?.checkoutStarted)}
                      </td>

                      {/* Interest */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-rose-400">
                            {v.interestScore || 5}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({v.interestLevel || 'Low'})
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div>{v.duration}</div>
                        <div className="text-[10px] text-slate-400">{v.lastActiveAgo || 'Recently'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(v.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.customerPhone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWhatsAppAssist(v)}
                              className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg flex items-center gap-1"
                              title="Assist via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Assist</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenJourney(v)}
                            className="h-7 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 font-semibold"
                          >
                            <GitFork className="w-3.5 h-3.5" />
                            <span>Timeline</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Customer Journey Modal with Visitor Profile Header */}
      <CustomerJourneyModal
        visitorId={selectedVisitor?.visitorId || null}
        visitorData={selectedVisitor}
        isOpen={isJourneyOpen}
        onClose={() => {
          setIsJourneyOpen(false);
          setSelectedVisitor(null);
        }}
      />
    </div>
  );
};

export default LiveVisitorsPage;
