import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getVendorAnalytics } from '@/services/vendorService';
import { LineChart, BarChart } from '@/components/ui/chart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';

interface Analytics {
  salesTrend: {
    date: string;
    sales: number;
  }[];
  topProducts: {
    name: string;
    sales: number;
    revenue: number;
  }[];
  orderStatusDistribution: {
    status: string;
    count: number;
  }[];
  revenueByCategory: {
    category: string;
    revenue: number;
  }[];
  customerInsights: {
    newCustomers: number;
    repeatCustomers: number;
    averageOrderValue: number;
  };
  performanceMetrics: {
    orderFulfillmentRate: number;
    averageProcessingTime: number;
    returnRate: number;
    customerSatisfaction: number;
  };
}

const VendorAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getVendorAnalytics(period);
      setAnalytics(response);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!analytics) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Order Fulfillment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.performanceMetrics.orderFulfillmentRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.performanceMetrics.averageProcessingTime.toFixed(1)} hours
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.performanceMetrics.returnRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.performanceMetrics.customerSatisfaction.toFixed(1)}/5
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={analytics.salesTrend.map(item => ({
              x: format(new Date(item.date), 'MMM dd'),
              y: item.sales
            }))}
            height={300}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analytics.topProducts.map(product => ({
                x: product.name,
                y: product.sales
              }))}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analytics.revenueByCategory.map(category => ({
                x: category.category,
                y: category.revenue
              }))}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Customer Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold">{analytics.customerInsights.newCustomers}</div>
              <div className="text-sm text-muted-foreground">New Customers</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold">{analytics.customerInsights.repeatCustomers}</div>
              <div className="text-sm text-muted-foreground">Repeat Customers</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold">{formatPrice(analytics.customerInsights.averageOrderValue)}</div>
              <div className="text-sm text-muted-foreground">Average Order Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.orderStatusDistribution.map(status => (
              <div key={status.status} className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold">{status.count}</div>
                <div className="text-sm text-muted-foreground capitalize">{status.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics; 