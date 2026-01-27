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
import { Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getVendorOrders } from '@/services/vendorService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  createdAt: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getVendorOrders();
      setOrders(data.orders);
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
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'Shipped':
        return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case 'Delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // NOTE: For now, viewing order details will navigate to the admin order details page.
  // This could be replaced with a vendor-specific order detail modal or page later.
  const viewOrderDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Button variant="ghost" size="icon" onClick={() => fetchOrders()}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order._id)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No orders found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VendorOrders; 