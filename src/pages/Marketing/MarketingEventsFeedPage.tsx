import React, { useState, useEffect } from 'react';
import {
  Activity,
  Eye,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Search,
  Compass,
  Sparkles,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

const categories = ['All', 'Product', 'Cart', 'Checkout', 'Orders', 'Search', 'Navigation'];

export const MarketingEventsFeedPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getEventsFeed({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        limit: 50
      });
      if (res?.success) {
        setEvents(res.events || []);
      }
    } catch (e) {
      toast.error('Failed to load event feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const getEventIcon = (type: string, category: string) => {
    switch (category) {
      case 'Product':
        return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'Cart':
        return <ShoppingCart className="w-4 h-4 text-pink-400" />;
      case 'Checkout':
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      case 'Orders':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Search':
        return <Search className="w-4 h-4 text-amber-400" />;
      default:
        return <Compass className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" />
            Real-Time Marketing Events Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Live behavioral telemetry stream across the sbflorist.in storefront
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={fetchEvents}
          disabled={loading}
          className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
        </Button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3 h-8 rounded-lg font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 bg-slate-900 border border-slate-800'
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Feed List */}
      <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-200">
              Recent Telemetry Stream
            </CardTitle>
            <span className="text-xs font-mono text-slate-400">{events.length} events loaded</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-800/60">
            {events.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                {loading ? 'Streaming real-time events...' : 'No events logged in this category'}
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      {getEventIcon(ev.eventType, ev.eventCategory)}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {ev.eventType === 'product_view'
                          ? `Viewed product: "${ev.productTitle || 'Floral Bouquet'}"`
                          : ev.eventType === 'add_to_cart'
                          ? `Added "${ev.productTitle || 'Product'}" to cart`
                          : ev.eventType === 'checkout_started'
                          ? `Started checkout (₹${ev.cartValue || 0})`
                          : ev.eventType === 'purchase'
                          ? `Completed Order #${ev.orderNumber || 'SBF'} (₹${ev.revenue || 0})`
                          : ev.eventType === 'search'
                          ? `Search: "${ev.searchQuery}"`
                          : `Navigation: ${ev.path || '/'}`}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-rose-400">{ev.visitorId}</span>
                        <span>•</span>
                        <span>{ev.eventCategory}</span>
                        {ev.path && (
                          <>
                            <span>•</span>
                            <span className="truncate">{ev.path}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[11px] font-mono text-slate-400">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingEventsFeedPage;
