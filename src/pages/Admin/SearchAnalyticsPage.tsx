import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import searchService, { SearchAnalyticsResponse } from '@/services/searchService';
import {
  Search,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  BarChart3
} from 'lucide-react';

export const SearchAnalyticsPage: React.FC = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('30days');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SearchAnalyticsResponse | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await searchService.getAnalytics(timeframe);
      setData(res);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load Search Analytics',
        description: err.message || 'Could not fetch search data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const summary = data?.summary || {
    totalSearches: 0,
    uniqueKeywords: 0,
    failedSearchesCount: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalSearchRevenue: 0
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            <Sparkles size={13} /> Enterprise Search Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Search Engine Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time insights into customer search queries, conversion rates, and catalog search gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-primary' : ''} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Searches Card */}
        <Card className="border-sky-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-sky-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-sky-800">
              Total Searches
            </CardTitle>
            <div className="p-2 bg-sky-100/80 rounded-xl text-sky-600">
              <Search size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {summary.totalSearches.toLocaleString()}
            </div>
            <p className="text-xs text-sky-700 mt-1 flex items-center gap-1 font-medium">
              <span>Across</span>
              <span className="font-bold">{summary.uniqueKeywords}</span>
              <span>unique keywords</span>
            </p>
          </CardContent>
        </Card>

        {/* Failed Searches Card */}
        <Card className="border-rose-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-rose-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Zero-Result Searches
            </CardTitle>
            <div className="p-2 bg-rose-100/80 rounded-xl text-rose-600">
              <AlertTriangle size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {summary.failedSearchesCount.toLocaleString()}
            </div>
            <p className="text-xs text-rose-700 mt-1 flex items-center gap-1 font-medium">
              <span>{summary.totalSearches > 0 ? ((summary.failedSearchesCount / summary.totalSearches) * 100).toFixed(1) : 0}% of all searches</span>
            </p>
          </CardContent>
        </Card>

        {/* Search Conversion Rate Card */}
        <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Search Conversion Rate
            </CardTitle>
            <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-600">
              <ShoppingCart size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {summary.conversionRate}%
            </div>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <span>{summary.totalConversions} successful conversions</span>
            </p>
          </CardContent>
        </Card>

        {/* Search Driven Revenue Card */}
        <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Search Revenue
            </CardTitle>
            <div className="p-2 bg-amber-100/80 rounded-xl text-amber-600">
              <DollarSign size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              ₹{summary.totalSearchRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-amber-700 mt-1 flex items-center gap-1 font-medium">
              <span>Generated from converted searches</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Top 20 Searches & Failed Searches */}
      <Tabs defaultValue="top-searches" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-gray-100/80 p-1">
            <TabsTrigger value="top-searches" className="flex items-center gap-2">
              <TrendingUp size={15} />
              <span>Top 20 Searches</span>
            </TabsTrigger>
            <TabsTrigger value="failed-searches" className="flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>Failed Searches ({summary.failedSearchesCount})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Top 20 Searches Tab */}
        <TabsContent value="top-searches">
          <Card className="border-gray-200/80 shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">
                Most Searched Keywords
              </CardTitle>
              <CardDescription>
                High-volume search phrases typed by customers and their conversion metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                  <span className="text-sm">Analyzing search trends...</span>
                </div>
              ) : !data?.topSearches || data.topSearches.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Search size={36} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No search data recorded for this timeframe yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/60">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Search Term</TableHead>
                        <TableHead className="text-center">Search Frequency</TableHead>
                        <TableHead className="text-center">Products Found</TableHead>
                        <TableHead className="text-center">Clicks / Conversions</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Last Searched</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topSearches.map((item, idx) => (
                        <TableRow key={item.term} className="hover:bg-gray-50/80 transition-colors">
                          <TableCell className="text-center font-bold text-gray-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-gray-900 capitalize">
                              {item.term}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-sky-50 text-sky-700 font-bold border-sky-200">
                              {item.count} searches
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm font-medium text-gray-600">
                            {item.resultsCount > 0 ? (
                              <span className="text-emerald-600 font-semibold">{item.resultsCount} items</span>
                            ) : (
                              <span className="text-rose-500 font-semibold">0 items</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            <span className="text-gray-700">{item.clicks} clicks</span>
                            <span className="mx-1 text-gray-300">/</span>
                            <span className="text-emerald-600 font-semibold">{item.conversions} orders</span>
                          </TableCell>
                          <TableCell className="text-right font-bold text-gray-900">
                            ₹{item.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs text-gray-500">
                            {new Date(item.lastSearched).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Searches Tab */}
        <TabsContent value="failed-searches">
          <Card className="border-gray-200/80 shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2 text-rose-700">
                <AlertTriangle size={18} />
                Unmet Demand & Missing Keywords
              </CardTitle>
              <CardDescription>
                Search queries that returned zero products. Use these insights to add new product tags, synonyms, or expand your inventory!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                  <span className="text-sm">Analyzing zero-result queries...</span>
                </div>
              ) : !data?.failedSearches || data.failedSearches.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Sparkles size={36} className="mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-700">Great job! No failed searches recorded in this period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/60">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Keyword Queried</TableHead>
                        <TableHead className="text-center">Times Searched</TableHead>
                        <TableHead>Opportunity Recommendation</TableHead>
                        <TableHead className="text-right">Last Attempted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.failedSearches.map((item, idx) => (
                        <TableRow key={item.term} className="hover:bg-rose-50/30 transition-colors">
                          <TableCell className="text-center font-bold text-gray-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-rose-900 capitalize">
                              "{item.term}"
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="border-rose-300 text-rose-700 font-bold bg-rose-50">
                              {item.count} failed
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            Add product tags or aliases matching <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">{item.term}</code> to relevant products.
                          </TableCell>
                          <TableCell className="text-right text-xs text-gray-500">
                            {new Date(item.lastSearched).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchAnalyticsPage;
