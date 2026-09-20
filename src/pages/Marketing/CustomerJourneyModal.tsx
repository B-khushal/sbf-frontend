import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { marketingService } from '@/services/marketingService';
import {
  Eye,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Search,
  ArrowRight,
  Clock,
  Compass,
  Sparkles,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerJourneyModalProps {
  visitorId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerJourneyModal: React.FC<CustomerJourneyModalProps> = ({
  visitorId,
  isOpen,
  onClose
}) => {
  const [journey, setJourney] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && visitorId) {
      setLoading(true);
      marketingService
        .getCustomerJourney(visitorId)
        .then((res) => {
          if (res?.success) {
            setJourney(res.timeline || []);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, visitorId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view':
      case 'landing_page':
        return <Compass className="w-4 h-4 text-blue-400" />;
      case 'product_view':
      case 'product_image_view':
        return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'search':
      case 'zero_result_search':
        return <Search className="w-4 h-4 text-amber-400" />;
      case 'add_to_cart':
        return <ShoppingCart className="w-4 h-4 text-pink-400" />;
      case 'checkout_started':
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      case 'purchase':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatEventTitle = (ev: any) => {
    switch (ev.eventType) {
      case 'page_view':
        return `Visited Page: ${ev.path || '/'}`;
      case 'product_view':
        return `Viewed Product: "${ev.productTitle || 'Floral Arrangement'}"`;
      case 'product_image_view':
        return `Browsed Gallery Image for "${ev.productTitle || 'Product'}"`;
      case 'scroll_depth':
        return `Scrolled ${ev.metadata?.percent || ev.metadata?.milestone || 50}% of Page`;
      case 'search':
        return `Searched for "${ev.searchQuery}"`;
      case 'zero_result_search':
        return `Zero Result Search: "${ev.searchQuery}"`;
      case 'add_to_cart':
        return `Added "${ev.productTitle || 'Product'}" to Cart (₹${ev.productPrice || ev.cartValue || 0})`;
      case 'checkout_started':
        return `Started Checkout (Cart Total: ₹${ev.cartValue || 0})`;
      case 'purchase':
        return `Completed Purchase #${ev.orderNumber || 'SBF'} (₹${ev.revenue || 0})`;
      default:
        return `${ev.eventType.replace('_', ' ')}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] bg-slate-900 border-slate-800 text-slate-100 flex flex-col p-4 sm:p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-slate-800/80 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-400" />
                Customer Journey Timeline
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Chronological interactions for <span className="font-mono text-rose-300">{visitorId}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Timeline */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading customer journey events...
            </div>
          ) : journey.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No recorded journey events for this session
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {journey.map((ev, idx) => (
                <div key={ev.id || idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center group-hover:border-rose-500 transition-colors">
                    {getEventIcon(ev.eventType)}
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-200">
                        {formatEventTitle(ev)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {ev.eventType}
                      </span>
                      {ev.path && <span className="truncate">Path: {ev.path}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Total Journey Events: {journey.length}</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs text-slate-300 hover:text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerJourneyModal;
