import React, { useState, useEffect } from 'react';
import {
  Package,
  Eye,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  Flame,
  Search,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { marketingService } from '@/services/marketingService';
import { toast } from 'sonner';

export const ProductAnalyticsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, occRes] = await Promise.all([
        marketingService.getProductAnalytics({ timeframe }),
        marketingService.getOccasionAnalytics({ timeframe })
      ]);
      if (prodRes?.success) setProducts(prodRes.products || []);
      if (occRes?.success) setOccasions(occRes.occasions || []);
    } catch (e) {
      toast.error('Failed to load product analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const filteredProducts = products.filter((p) =>
    searchTerm ? (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-rose-400" />
            Product &amp; Occasion Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify top-interest floral items, demand patterns, and occasion trends
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['7d', '30d', '90d'].map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-3 h-8 rounded-lg font-medium ${
                timeframe === tf
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tf.toUpperCase()}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="products" className="text-xs font-semibold data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-lg">
            Catalog Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="occasions" className="text-xs font-semibold data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-lg">
            Occasions &amp; Collections ({occasions.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Products */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4 text-center">Views</th>
                      <th className="py-3 px-4 text-center">Cart Adds</th>
                      <th className="py-3 px-4 text-center">Cart Rate</th>
                      <th className="py-3 px-4 text-center">Purchases</th>
                      <th className="py-3 px-4 text-center">Conversion</th>
                      <th className="py-3 px-4 text-right">Revenue</th>
                      <th className="py-3 px-4 text-center">Interest Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-slate-500 text-xs">
                          {loading ? 'Analyzing product engagement...' : 'No product data found'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.productId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-200 max-w-[220px] truncate">
                            {p.title}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            ₹{Number(p.price).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-100 font-bold">
                            {p.views}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-pink-400">
                            {p.cartAdds}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            {p.addToCartRate}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                            {p.purchases}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            {p.conversionRate}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                            ₹{Number(p.revenue || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <Flame className="w-3 h-3 text-rose-400" />
                              {p.interestScore}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Occasions */}
        <TabsContent value="occasions">
          <Card className="bg-slate-900/70 border-slate-800/80 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3 px-4">Occasion / Collection</th>
                      <th className="py-3 px-4 text-center">Catalog Views</th>
                      <th className="py-3 px-4 text-center">Added to Cart</th>
                      <th className="py-3 px-4 text-center">Orders</th>
                      <th className="py-3 px-4 text-right">Attributed Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {occasions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                          {loading ? 'Analyzing occasion trends...' : 'No occasion data recorded'}
                        </td>
                      </tr>
                    ) : (
                      occasions.map((occ) => (
                        <tr key={occ.occasion} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-200">
                            {occ.occasion}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-100">
                            {occ.views}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-pink-400">
                            {occ.cartAdds}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                            {occ.orders}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                            ₹{Number(occ.revenue || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductAnalyticsPage;
