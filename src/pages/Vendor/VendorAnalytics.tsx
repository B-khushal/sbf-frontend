import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getVendorAnalytics } from '@/services/vendorService';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { TrendingUp, DollarSign, ShoppingCart, Package, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const VendorAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

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

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No analytics data available.</p>
        </div>
      </div>
    );
  }
  
  const { keyStats, salesOverTime, topProducts, categoryPerformance } = analyticsData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your performance and sales insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(keyStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              from {keyStats.totalOrders} orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              completed orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(keyStats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              per order
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyStats.totalProductsSold}</div>
            <p className="text-xs text-muted-foreground mt-1">
              total units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
          <CardDescription>Track your revenue performance over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {salesOverTime && salesOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={salesOverTime}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12}
                  tickFormatter={(value) => formatPrice(value, { notation: 'compact' as const })} 
                />
                <Tooltip 
                  formatter={(value: number) => formatPrice(value)}
                  labelStyle={{ color: '#000' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }} 
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No sales data available for this period
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Top Products and Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Your best-performing products by units sold</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts && topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" stroke="#888888" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={120} stroke="#888888" fontSize={11} />
                  <Tooltip formatter={(value: number) => [`${value} units`, 'Sold']} />
                  <Bar dataKey="totalSold" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryPerformance && categoryPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12}
                    tickFormatter={(value) => formatPrice(value, { notation: 'compact' as const })}
                  />
                  <Tooltip formatter={(value: number) => formatPrice(value)} />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAnalytics; 