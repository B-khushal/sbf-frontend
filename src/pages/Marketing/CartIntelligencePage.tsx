import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  DollarSign,
  Package,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

export const CartIntelligencePage: React.FC = () => {
  const [carts, setCarts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    abandonedCartsCount: 0,
    potentialRecoveryRevenue: 0,
    averageAbandonedValue: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getCartIntelligence();
      if (res?.success) {
        setCarts(res.carts || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (e) {
      toast.error('Failed to load cart intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Abandoned Cart Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor high-intent abandoned carts and discover where buyers leave before purchasing
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={fetchCarts}
          disabled={loading}
          className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Abandoned Carts
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {summary.abandonedCartsCount}
            </div>
            <p className="text-[11px] text-slate-500">Unconverted shopping sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Potential Recovery Revenue
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ₹{Number(summary.potentialRecoveryRevenue).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500">Total pipeline value left in carts</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 shadow-md">
          <CardContent className="p-3.5 sm:p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average Cart Value
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono">
              ₹{Number(summary.averageAbandonedValue).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500">Mean basket size at abandonment</p>
          </CardContent>
        </Card>
      </div>

      {/* Carts Container */}
      <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-slate-200">
            Recent Abandoned Carts
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Real-time abandoned cart records with customer stage detection
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-0">
          {/* Mobile Card Layout (Visible on phones < md) */}
          <div className="block md:hidden space-y-3">
            {carts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                {loading ? 'Analyzing cart sessions...' : 'No abandoned carts recorded'}
              </div>
            ) : (
              carts.map((cart) => (
                <div
                  key={cart.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-xs text-slate-200">
                        {cart.customerName || 'Guest Shopper'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                        {cart.customerEmail || cart.visitorId}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                      {cart.abandonmentStage || 'Cart'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Cart Total:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₹{Number(cart.totalValue).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        {cart.checkoutStarted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        <span className="text-[10px]">Checkout</span>
                      </span>

                      <span className="flex items-center gap-1">
                        {cart.paymentAttempted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        <span className="text-[10px]">Payment</span>
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(cart.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (Hidden on phones < md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Visitor / Customer</th>
                  <th className="py-3 px-4">Cart Value</th>
                  <th className="py-3 px-4">Abandonment Stage</th>
                  <th className="py-3 px-4 text-center">Checkout Started?</th>
                  <th className="py-3 px-4 text-center">Payment Attempted?</th>
                  <th className="py-3 px-4 text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {carts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                      {loading ? 'Analyzing cart sessions...' : 'No abandoned carts recorded'}
                    </td>
                  </tr>
                ) : (
                  carts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-200">
                        <div>
                          <div className="font-semibold text-slate-200">
                            {cart.customerName || 'Guest Shopper'}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {cart.customerEmail || cart.visitorId}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ₹{Number(cart.totalValue).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {cart.abandonmentStage || 'Cart'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {cart.checkoutStarted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {cart.paymentAttempted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(cart.lastActivityAt).toLocaleDateString()}{' '}
                        {new Date(cart.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

export default CartIntelligencePage;
