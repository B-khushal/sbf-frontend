import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, getOrders } from '@/services/orderService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';
import { ImageIcon, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getImageUrl as getImageUrlFromConfig } from '@/config';
import OrderTracking from './OrderTracking';
import { cn } from '@/lib/utils';

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

    fetchOrders();
  }, []);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Helper function to format price with currency conversion
  const displayOrderPrice = (amount: number, orderCurrency?: string, orderRate?: number) => {
    // If order has stored currency data and it's different from current currency
    if (orderCurrency && orderRate && orderCurrency !== currency) {
      if (orderCurrency === 'INR') {
        // Order was in INR, convert to current currency
        const convertedAmount = convertPrice(amount);
        return formatPrice(convertedAmount);
      } else {
        // Order was in non-INR, first convert back to INR, then to current currency
        const amountInINR = amount / orderRate;
        const convertedAmount = convertPrice(amountInINR);
        return formatPrice(convertedAmount);
      }
    } else if (orderCurrency && orderCurrency === currency) {
      // Order currency matches current currency, no conversion needed
      return formatPrice(amount);
    } else {
      // No order currency info or currency is same, treat as INR and convert to current currency
      const convertedAmount = convertPrice(amount);
      return formatPrice(convertedAmount);
    }
  };

  // Use the centralized image URL utility function
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
      // Legacy status support
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCardStyling = (status: Order['status']) => {
    if (status === 'delivered') {
      return 'bg-green-100 backdrop-blur-sm border-green-300 shadow-lg hover:shadow-xl';
    }
    return 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl';
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
      // Legacy status support
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">No Orders Yet</h3>
          <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
          <Button 
            onClick={() => navigate('/shop')}
            className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl"
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
              getCardStyling(order.status),
              "transition-all duration-300"
            )}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={cn(
                    "font-bold text-lg",
                    isDelivered ? "text-green-800" : "text-gray-800"
                  )}>
                    Order #{order.orderNumber}
                    {isDelivered && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')} at {format(new Date(order.createdAt), 'h:mm a')}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusDisplayName(order.status)}
                </Badge>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => {
                  const imageUrl = getImageUrl(item.product.images?.[0]);

                  return (
                    <div key={item.product._id} className={cn(
                      "flex items-center gap-4 rounded-xl p-4",
                      isDelivered ? "bg-green-50" : "bg-white/50"
                    )}>
                      <div className="h-16 w-16 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={imageUrl}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/placeholder.jpg";
                          }}
                        />
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold flex items-center justify-center rounded-full">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">{item.product.title}</h4>
                        <div className="text-gray-600 text-sm">
                          {displayOrderPrice(item.price, order.currency, order.currencyRate)} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          {displayOrderPrice(item.finalPrice * item.quantity, order.currency, order.currencyRate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {currency}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Track Order Dropdown Button - Available on ALL screen sizes */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => toggleOrderExpansion(order._id)}
                  className={cn(
                    "w-full flex items-center justify-between",
                    isDelivered && "border-green-400 text-green-700 hover:bg-green-50 bg-green-50"
                  )}
                >
                  <span>Track Order</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Order Tracking - Collapsible on ALL screen sizes */}
              {isExpanded && (
                <div className="mt-6">
                  <OrderTracking 
                    currentStatus={order.status}
                    trackingHistory={order.trackingHistory}
                    className={cn(
                      "backdrop-blur-sm",
                      isDelivered ? "bg-green-50" : "bg-white/30"
                    )}
                  />
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-gray-700">Shipping Address</p>
                    <p className="text-gray-600">{order.shippingDetails.fullName}</p>
                    <p className="text-gray-600">{order.shippingDetails.address}</p>
                    {order.shippingDetails.apartment && (
                      <p className="text-gray-600">{order.shippingDetails.apartment}</p>
                    )}
                    <p className="text-gray-600">
                      {order.shippingDetails.city}, {order.shippingDetails.state}{' '}
                      {order.shippingDetails.zipCode}
                    </p>
                    {order.shippingDetails.deliveryDate && (
                      <p className="text-gray-600 font-medium">
                        Delivery: {format(new Date(order.shippingDetails.deliveryDate), 'MMM d, yyyy')}
                        {order.shippingDetails.timeSlot && ` • ${order.shippingDetails.timeSlot}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className={cn(
                      "text-lg font-bold",
                      isDelivered ? "text-green-800" : "text-gray-800"
                    )}>
                      Total: {displayOrderPrice(order.totalAmount, order.currency, order.currencyRate)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {order.paymentDetails.method} • {order.paymentDetails.status || 'Paid'}
                    </p>
                    <div className="text-xs text-gray-400">
                      Showing in {currency}
                    </div>
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