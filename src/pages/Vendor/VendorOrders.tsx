import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, RefreshCw, Search, ShoppingCart, Package, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getVendorOrders } from '@/services/vendorService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

interface Order {
  _id: string;
  orderNumber: string;
  user?: {
    name: string;
    email: string;
  };
  items: any[];
  createdAt: string;
  totalAmount: number;
  vendorTotal?: number;
  status: 'order_placed' | 'received' | 'being_made' | 'out_for_delivery' | 'delivered' | 'cancelled';
}

const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const data = await getVendorOrders(params.toString());
      setOrders(data.orders || []);
    } catch (error) {
      toast({
        title: 'Error fetching orders',
        description: 'Could not load your orders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'order_placed':
        return <Badge variant="secondary">Order Placed</Badge>;
      case 'received':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Received</Badge>;
      case 'being_made':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Being Made</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const viewOrderDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'order_placed' || o.status === 'received').length,
    processingOrders: orders.filter(o => o.status === 'being_made').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track your product orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order number or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="order_placed">Order Placed</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="being_made">Being Made</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
                        Loading orders...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.user?.email || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.items?.length || 0} items</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.vendorTotal || order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order._id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No orders found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOrders; 