import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import api from '@/services/api'; // Ensure this import is present
import { Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      if (!response.data?._id) {
        throw new Error('Invalid order data');
      }
      setOrder(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "Could not load order details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Refresh the order data after status update
      await fetchOrder();
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      {order ? (
        <OrderDetailsModal
          isOpen={true}
          onClose={() => navigate('/admin/orders')}
          order={order}
          onStatusUpdate={handleStatusUpdate}
        />
      ) : (
        <p className="text-red-600">Order not found.</p>
      )}
    </div>
  );
};

export default OrderDetailsPage;