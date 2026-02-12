import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getVendorAnalytics } from '@/services/vendorService';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

interface AnalyticsData {
  salesOverTime: { date: string; sales: number }[];
  topProducts: { name: string; totalSold: number }[];
  categoryPerformance: { name: string; sales: number }[];
  keyStats: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalProductsSold: number;
  }
}

const VendorAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getVendorAnalytics(timeframe);
        setAnalyticsData(data);
      } catch (error) {
        toast({
          title: 'Error fetching analytics',
          description: 'Could not load analytics data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, toast]);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="p-6">No analytics data available.</div>;
  }
  
  const { keyStats, salesOverTime, topProducts, categoryPerformance } = analyticsData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatPrice(keyStats.totalRevenue)}</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{keyStats.totalOrders}</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Avg. Order Value</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatPrice(keyStats.averageOrderValue)}</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Products Sold</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{keyStats.totalProductsSold}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesOverTime}>
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatPrice(value, { notation: 'compact' })} />
              <Tooltip formatter={(value: number) => formatPrice(value)} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts} layout="vertical">
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={120} />
                        <Tooltip formatter={(value: number) => [`${value} units`]} />
                        <Bar dataKey="totalSold" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryPerformance}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatPrice(value, { notation: 'compact' })}/>
                        <Tooltip formatter={(value: number) => formatPrice(value)} />
                        <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
      </div>

    </div>
  );
};

export default VendorAnalytics; 