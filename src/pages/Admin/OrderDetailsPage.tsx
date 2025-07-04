import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Order } from '@/services/orderService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice, convertPrice, currency } = useCurrency();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) return <div className="p-8 text-center">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Button variant="outline" onClick={() => navigate('/admin/orders')} className="mb-4">&larr; Back to Orders</Button>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.orderNumber}</CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{order.status}</Badge>
            <span className="text-xs text-gray-500">Placed: {format(new Date(order.createdAt), 'PPpp')}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Customer</h3>
            <div>Name: {order.shippingDetails.fullName}</div>
            <div>Email: {order.shippingDetails.email}</div>
            <div>Phone: {order.shippingDetails.phone}</div>
            <div>Address: {order.shippingDetails.address}</div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <ul className="space-y-2">
              {order.items.map((item, idx) => (
                <li key={idx} className="border-b pb-2">
                  <div className="font-medium">{item.product.name}</div>
                  <div>Qty: {item.quantity}</div>
                  <div>Price: {formatPrice(item.finalPrice)}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Total</h3>
            <div className="text-lg font-bold">{formatPrice(order.totalAmount)}</div>
            {order.currency && order.currency !== currency && (
              <div className="text-xs text-gray-500">
                Originally {order.currency} {order.totalAmount}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Payment</h3>
            <div>Method: {order.paymentDetails.method}</div>
            <div>Status: {order.paymentDetails.status}</div>
            {order.paymentDetails.transactionId && (
              <div>Transaction ID: {order.paymentDetails.transactionId}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;