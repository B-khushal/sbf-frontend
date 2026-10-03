import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { marketingService, LiveVisitor } from '@/services/marketingService';
import {
  Eye,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Search,
  Clock,
  Compass,
  Sparkles,
  MapPin,
  Smartphone,
  Tablet,
  Monitor,
  User,
  ShoppingBag,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerJourneyModalProps {
  visitorId: string | null;
  visitorData?: LiveVisitor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerJourneyModal: React.FC<CustomerJourneyModalProps> = ({
  visitorId,
  visitorData,
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

  const getDeviceIcon = (device?: string) => {
    const d = (device || '').toLowerCase();
    if (d === 'mobile') return <Smartphone className="w-3.5 h-3.5 text-pink-400" />;
    if (d === 'tablet') return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
    return <Monitor className="w-3.5 h-3.5 text-blue-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="marketing-panel-light w-[95vw] sm:max-w-2xl max-h-[88vh] bg-white border-slate-200 text-slate-900 flex flex-col p-4 sm:p-6 rounded-2xl shadow-xl">
        <DialogHeader className="border-b border-slate-200 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-600" />
                <span>Customer Journey Timeline</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Chronological interactions for{' '}
                <span className="font-mono text-rose-600 font-semibold">
                  {visitorData?.displayName || visitorId}
                </span>
              </DialogDescription>
            </div>
            {visitorData?.status && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  visitorData.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : visitorData.status === 'Idle'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {visitorData.status}
              </span>
            )}
          </div>

          {/* Visitor Meta Header Card */}
          {visitorData && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Identity</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="truncate">
                    {visitorData.customerName || (visitorData.isRegisteredCustomer ? 'Customer' : 'Guest Shopper')}
                  </span>
                </span>
                {visitorData.customerEmail && (
                  <span className="text-[10px] text-slate-500 truncate block">
                    {visitorData.customerEmail}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Location & Tech</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span className="truncate">{visitorData.city || 'Mumbai'}</span>
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  {getDeviceIcon(visitorData.device)}
                  <span>{visitorData.device}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Traffic Source</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {visitorData.source}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {visitorData.campaign || 'organic'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Intent & Cart</span>
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span>
                    {visitorData.cart?.hasCart
                      ? `₹${visitorData.cart.totalValue.toLocaleString('en-IN')}`
                      : 'Empty Cart'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Score: <strong className="text-slate-800">{visitorData.interestScore || 5}</strong> (
                  {visitorData.interestLevel || 'Low'})
                </span>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Scrollable Timeline */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mr-2" />
              Loading customer journey events...
            </div>
          ) : journey.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No recorded journey events for this session
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {journey.map((ev, idx) => (
                <div key={ev.id || idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center group-hover:border-rose-500 shadow-2xs transition-colors">
                    {getEventIcon(ev.eventType)}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:bg-slate-100/70 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-900">
                        {formatEventTitle(ev)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(ev.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                        {ev.eventType}
                      </span>
                      {ev.path && (
                        <a
                          href={ev.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-rose-600 hover:underline flex items-center gap-1"
                        >
                          <span>{ev.path}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Total Recorded Events: {journey.length}</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerJourneyModal;
