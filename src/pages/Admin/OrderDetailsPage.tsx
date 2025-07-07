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
            <h3 className="font-semibold mb-2">Delivery Address</h3>
            <div className="bg-gray-50 p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {order.shippingDetails.notes?.toLowerCase().includes('gift') ? '🎁 Gift Delivery' : '📦 Deliver to Myself'}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div><strong>Recipient:</strong> {order.shippingDetails.fullName}</div>
                <div><strong>Email:</strong> {order.shippingDetails.email}</div>
                <div><strong>Phone:</strong> {order.shippingDetails.phone}</div>
                <div><strong>Address:</strong></div>
                <div className="ml-4">
                  {order.shippingDetails.address}
                  {order.shippingDetails.apartment && <div>{order.shippingDetails.apartment}</div>}
                  <div>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</div>
                </div>
                {order.shippingDetails.notes && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <strong>Notes:</strong> {order.shippingDetails.notes}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-600">
                  <div><strong>Delivery Date:</strong> {format(new Date(order.shippingDetails.deliveryDate), 'PPP')}</div>
                  <div><strong>Time Slot:</strong> {order.shippingDetails.timeSlot}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <ul className="space-y-4">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex gap-4 items-center border-b pb-4">
                  {item.product.images && item.product.images.length > 0 && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-lg">{item.product.title}</div>
                    <div className="text-xs text-gray-500">Product ID: {item.product._id}</div>
                    <div className="text-sm">Qty: {item.quantity}</div>
                    <div className="text-sm">
                      Price: {formatPrice(item.price)}
                      {item.finalPrice !== item.price && (
                        <span className="ml-2 text-green-600">Final: {formatPrice(item.finalPrice)}</span>
                      )}
                    </div>
                  </div>
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
            {order.paymentDetails.razorpayOrderId && (
              <div>Razorpay Order ID: {order.paymentDetails.razorpayOrderId}</div>
            )}
            {order.paymentDetails.razorpayPaymentId && (
              <div>Razorpay Payment ID: {order.paymentDetails.razorpayPaymentId}</div>
            )}
            {order.paymentDetails.razorpaySignature && (
              <div>Razorpay Signature: {order.paymentDetails.razorpaySignature}</div>
            )}
          </div>
          {/* Delivery Info Section */}
          {order.trackingHistory && order.trackingHistory.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Delivery & Tracking History</h3>
              <ul className="space-y-2">
                {order.trackingHistory.map((track, idx) => (
                  <li key={idx} className="border rounded p-2 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{track.status.replace(/_/g, ' ')}</Badge>
                      <span className="text-xs text-gray-500">{format(new Date(track.timestamp), 'PPpp')}</span>
                    </div>
                    {track.message && <div className="text-sm mt-1">{track.message}</div>}
                    {track.updatedBy && <div className="text-xs text-gray-400">Updated by: {track.updatedBy}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;