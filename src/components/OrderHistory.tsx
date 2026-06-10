import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, getOrders } from '@/services/orderService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  ImageIcon,
  PenSquare,
  RefreshCw,
} from 'lucide-react';
import { getImageUrl as getImageUrlFromConfig } from '@/config';
import OrderTracking from './OrderTracking';
import { cn } from '@/lib/utils';
import { buildProductReviewUrl } from '@/utils/reviewUrls';

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { formatPrice, convertPrice, currency } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const displayOrderPrice = (amount: number, orderCurrency?: string, orderRate?: number) => {
    if (orderCurrency && orderRate && orderCurrency !== currency) {
      if (orderCurrency === 'INR') {
        return formatPrice(convertPrice(amount));
      }

      const amountInInr = amount / orderRate;
      return formatPrice(convertPrice(amountInInr));
    }

    if (orderCurrency && orderCurrency === currency) {
      return formatPrice(amount);
    }

    return formatPrice(convertPrice(amount));
  };

  const getImageUrl = getImageUrlFromConfig;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800';
      case 'being_made':
        return 'bg-orange-100 text-orange-800';
      case 'received':
        return 'bg-purple-100 text-purple-800';
      case 'order_placed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusDisplayName = (status: Order['status']) => {
    switch (status) {
      case 'order_placed':
        return 'Order Placed';
      case 'received':
        return 'Received';
      case 'being_made':
        return 'Being Made';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="rounded-2xl border border-white/20 bg-white/50 p-8 backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-500">
            <ImageIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="mb-2 font-bold text-gray-800">No Orders Yet</h3>
          <p className="mb-4 text-gray-600">You haven't placed any orders yet.</p>
          <Button
            onClick={() => navigate('/shop')}
            className="rounded-xl bg-gradient-to-r from-primary to-secondary text-white"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const isExpanded = expandedOrders.has(order._id);
        const isDelivered = order.status === 'delivered';

        return (
          <Card
            key={order._id}
            className={cn(
              'border shadow-lg transition-all duration-300 hover:shadow-xl',
              isDelivered ? 'border-green-300 bg-green-100/90' : 'border-white/20 bg-white/70'
            )}
          >
            <CardContent className="p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className={cn('text-lg font-bold', isDelivered ? 'text-green-800' : 'text-gray-800')}>
                    Order #{order.orderNumber}
                    {isDelivered ? <span className="ml-2 text-green-600">✓</span> : null}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')} at{' '}
                    {format(new Date(order.createdAt), 'h:mm a')}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusDisplayName(order.status)}
                </Badge>
              </div>

              <div className="space-y-4">
                {order.items.map((item, itemIndex) => {
                  const productTitle = item.title || item.product?.title || 'Product';
                  const productImage =
                    item.image || item.images?.[0] || item.product?.images?.[0] || '';
                  const itemKey = item.product?._id || `${order._id}-${itemIndex}`;

                  return (
                    <div
                      key={itemKey}
                      className={cn(
                        'flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center',
                        isDelivered ? 'bg-green-50' : 'bg-white/50'
                      )}
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                        <img
                          src={getImageUrl(productImage)}
                          alt={productTitle}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = '/images/placeholder.jpg';
                          }}
                        />
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white">
                          {item.quantity}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-gray-800">{productTitle}</h4>
                        <div className="text-sm text-gray-600">
                          {displayOrderPrice(item.price, order.currency, order.currencyRate)} ×{' '}
                          {item.quantity}
                        </div>
                        {isDelivered && item.product?._id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(
                                buildProductReviewUrl(item.product!._id, productTitle, {
                                  orderId: order._id,
                                })
                              )
                            }
                            className="mt-2 h-8 rounded-full border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            <PenSquare className="mr-2 h-3.5 w-3.5" />
                            Write a Review
                          </Button>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          {displayOrderPrice(
                            item.finalPrice * item.quantity,
                            order.currency,
                            order.currencyRate
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{currency}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => toggleOrderExpansion(order._id)}
                  className={cn(
                    'w-full justify-between',
                    isDelivered && 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
                  )}
                >
                  <span>Track Order</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {isExpanded ? (
                <div className="mt-6">
                  <OrderTracking
                    currentStatus={order.status}
                    trackingHistory={order.trackingHistory}
                    className={cn(isDelivered ? 'bg-green-50' : 'bg-white/30', 'backdrop-blur-sm')}
                  />
                </div>
              ) : null}

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-gray-700">Shipping Address</p>
                    <p className="text-gray-600">{order.shippingDetails.fullName}</p>
                    <p className="text-gray-600">{order.shippingDetails.address}</p>
                    {order.shippingDetails.apartment ? (
                      <p className="text-gray-600">{order.shippingDetails.apartment}</p>
                    ) : null}
                    <p className="text-gray-600">
                      {order.shippingDetails.city}, {order.shippingDetails.state}{' '}
                      {order.shippingDetails.zipCode}
                    </p>
                    {order.shippingDetails.deliveryDate ? (
                      <p className="font-medium text-gray-600">
                        Delivery: {format(new Date(order.shippingDetails.deliveryDate), 'MMM d, yyyy')}
                        {order.shippingDetails.timeSlot ? ` • ${order.shippingDetails.timeSlot}` : ''}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1 text-right">
                    <p className={cn('text-lg font-bold', isDelivered ? 'text-green-800' : 'text-gray-800')}>
                      Total: {displayOrderPrice(order.totalAmount, order.currency, order.currencyRate)}
                    </p>
                    <p className="text-xs capitalize text-gray-500">
                      {order.paymentDetails.method} • {(order.paymentDetails as any).status || 'Paid'}
                    </p>
                    <div className="text-xs text-gray-400">Showing in {currency}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderHistory;
