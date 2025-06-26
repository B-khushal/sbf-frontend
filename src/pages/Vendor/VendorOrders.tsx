import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getVendorOrders } from '@/services/vendorService';
import { DataTable } from '@/components/ui/table';
import { Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [status, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      const params = {
        status: status !== 'all' ? status : undefined,
        startDate,
        endDate,
      };
      const response = await getVendorOrders(params);
      setOrders(response.orders);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Order Number',
      accessorKey: 'orderNumber',
    },
    {
      header: 'Customer',
      accessorKey: 'customer.name',
    },
    {
      header: 'Amount',
      accessorKey: 'totalAmount',
      cell: ({ row }: any) => `₹${row.original.totalAmount.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.original.status === 'processing' ? 'bg-blue-100 text-blue-800' :
          row.original.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus',
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.original.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ row }: any) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
    },
    {
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewOrder(row.original._id)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateStatus(row.original._id)}
          >
            Update Status
          </Button>
        </div>
      ),
    },
  ];

  const handleViewOrder = (orderId: string) => {
    // Implement view order details
  };

  const handleUpdateStatus = (orderId: string) => {
    // Implement status update
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[180px]"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOrders; 