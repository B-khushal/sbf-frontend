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
  Clock,
  Calendar,
  Truck,
} from 'lucide-react';
import { getImageUrl as getImageUrlFromConfig } from '@/config';
import OrderTracking from './OrderTracking';
import { cn } from '@/lib/utils';
import { buildProductReviewUrl } from '@/utils/reviewUrls';

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');
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

  const isOrderUpcoming = (order: Order) => {
    const rawDelivery = order.deliveryDate || (order as any).shippingDetails?.deliveryDate;
    if (!rawDelivery) return false;
    const d = new Date(rawDelivery);
    if (isNaN(d.getTime())) return false;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const isFuture = targetStart.getTime() > todayStart.getTime();
    const isNotFinished = !['delivered', 'cancelled'].includes((order.status || '').toLowerCase());
    return isFuture && isNotFinished;
  };

  const getUpcomingCountdown = (order: Order) => {
    const rawDelivery = order.deliveryDate || (order as any).shippingDetails?.deliveryDate;
    if (!rawDelivery) return null;
    const d = new Date(rawDelivery);
    if (isNaN(d.getTime())) return null;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === 2) return 'In 2 days';
    if (diffDays > 2) return `In ${diffDays} days`;
    return null;
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

  const upcomingCount = orders.filter(isOrderUpcoming).length;
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'upcoming') return isOrderUpcoming(order);
    if (activeTab === 'past') return !isOrderUpcoming(order);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Customer Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'all'
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white/70 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
          )}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === 'upcoming'
              ? "bg-violet-600 text-white shadow-xs"
              : "bg-white/70 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          Upcoming Deliveries
          {upcomingCount > 0 && (
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-xs font-bold",
              activeTab === 'upcoming' ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"
            )}>
              {upcomingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'past'
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white/70 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
          )}
        >
          Past Orders
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 bg-white/60 rounded-2xl border border-dashed border-gray-300 p-8">
          <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No {activeTab} orders found</p>
          <p className="text-xs text-gray-500 mt-1">
            {activeTab === 'upcoming'
              ? "You don't have any advance deliveries scheduled right now."
              : "No orders match this tab."}
          </p>
        </div>
      ) : (
        filteredOrders.map((order) => {
          const isExpanded = expandedOrders.has(order._id);
          const isDelivered = order.status === 'delivered';
          const countdown = getUpcomingCountdown(order);

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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={cn('text-lg font-bold', isDelivered ? 'text-green-800' : 'text-gray-800')}>
                        Order #{order.orderNumber}
                        {isDelivered ? <span className="ml-2 text-green-600">✓</span> : null}
                      </h3>
                      {countdown && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                          <Clock className="w-3 h-3" />
                          Delivery {countdown}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')} at{' '}
                      {format(new Date(order.createdAt), 'h:mm a')}
                    </p>
                    {order.deliveryDate && (
                      <p className="text-xs text-violet-700 font-medium mt-1 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        Scheduled Delivery: {format(new Date(order.deliveryDate), 'EEEE, dd MMM yyyy')}
                      </p>
                    )}
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

                        {/* Cake & Customization Details */}
                        {item.customizations && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                            {(item.customizations.isCombo || item.customizations.isGiftBundle || item.customizations.giftComponents) && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase">
                                🎁 Duo Combo
                              </span>
                            )}
                            {(item.customizations.cakeFlavor || item.customizations.flavor) && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium capitalize">
                                🍰 {item.customizations.cakeFlavor || item.customizations.flavor}
                              </span>
                            )}
                            {(item.customizations.cakeWeight || item.customizations.weight) && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-bold">
                                {item.customizations.cakeWeight || item.customizations.weight}
                              </span>
                            )}
                            {(item.customizations.cakeShape || item.customizations.shape) && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-50 text-stone-700 text-[10px] capitalize">
                                {item.customizations.cakeShape || item.customizations.shape}
                              </span>
                            )}
                            {item.customizations.eggless !== undefined && (
                              <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-semibold",
                                item.customizations.eggless ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                              )}>
                                {item.customizations.eggless ? '🍃 100% Eggless' : '🥚 Contains Egg'}
                              </span>
                            )}
                            {item.customizations.cakeMessage && (
                              <div className="w-full text-xs text-stone-600 italic mt-0.5">
                                ✍ "{item.customizations.cakeMessage}"
                              </div>
                            )}
                            {item.customizations.addons && item.customizations.addons.length > 0 && (
                              <div className="w-full text-xs text-amber-800 dark:text-amber-300 font-medium mt-0.5">
                                ✨ Add-ons: {item.customizations.addons.map((a: any) => a.name || a.title).join(', ')}
                              </div>
                            )}
                            {item.customizations.giftComponents && (
                              <div className="w-full text-xs text-rose-700 bg-rose-50/70 border border-rose-100 rounded-lg p-2 mt-1 space-y-0.5">
                                <span className="font-semibold block text-[11px]">🎁 Package Contents:</span>
                                {item.customizations.giftComponents.map((comp: any, cIdx: number) => (
                                  <div key={cIdx} className="text-[11px] text-gray-600 pl-1">
                                    • <strong className="text-rose-600 capitalize">{comp.category ? `${comp.category}: ` : ''}</strong>{comp.name}
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.customizations.messageCard && (
                              <div className="w-full text-xs text-gray-600 italic mt-0.5">
                                💌 Message Card: "{item.customizations.messageCard}"
                              </div>
                            )}
                          </div>
                        )}
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
                  {(() => {
                    const isGift = !!(order.giftDetails && order.giftDetails.recipientName && order.giftDetails.recipientName.trim() !== '');
                    return (
                      <div className="space-y-2 text-sm max-w-md">
                        <p className="font-bold text-gray-800 uppercase tracking-wide text-xs">
                          {isGift ? '🎁 Gift Recipient Details' : '📦 Shipping Address'}
                        </p>
                        {isGift ? (
                          <>
                            <p className="text-gray-700 font-semibold">{order.giftDetails?.recipientName}</p>
                            <p className="text-gray-600">
                              {order.giftDetails?.houseNo ? `Flat/House No: ${order.giftDetails.houseNo}, ` : ''}
                              {order.giftDetails?.floor ? `Floor: ${order.giftDetails.floor}, ` : ''}
                              {order.giftDetails?.recipientAddress}
                            </p>
                            {(order.giftDetails?.recipientApartment || order.giftDetails?.landmark) ? (
                              <p className="text-gray-500 text-xs">
                                {order.giftDetails.recipientApartment ? `Apt/Bldg: ${order.giftDetails.recipientApartment}` : ''}
                                {order.giftDetails.recipientApartment && order.giftDetails.landmark ? ' | ' : ''}
                                {order.giftDetails.landmark ? `Landmark: ${order.giftDetails.landmark}` : ''}
                              </p>
                            ) : null}
                            <p className="text-gray-600">
                              {order.giftDetails?.recipientCity}, {order.giftDetails?.recipientState}{' '}
                              {order.giftDetails?.recipientZipCode}
                            </p>
                            {order.giftDetails?.recipientPhone ? (
                              <p className="text-gray-500 text-xs font-semibold">Phone: {order.giftDetails.recipientPhone}</p>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <p className="text-gray-700 font-semibold">{order.shippingDetails.fullName}</p>
                            <p className="text-gray-600">
                              {(order.shippingDetails.houseNo || order.giftDetails?.houseNo) ? `Flat/House No: ${order.shippingDetails.houseNo || order.giftDetails?.houseNo}, ` : ''}
                              {(order.shippingDetails.floor || order.giftDetails?.floor) ? `Floor: ${order.shippingDetails.floor || order.giftDetails?.floor}, ` : ''}
                              {order.shippingDetails.address}
                            </p>
                            {(order.shippingDetails.apartment || order.shippingDetails.landmark || order.giftDetails?.landmark) ? (
                              <p className="text-gray-500 text-xs">
                                {order.shippingDetails.apartment ? `Apt/Bldg: ${order.shippingDetails.apartment}` : ''}
                                {order.shippingDetails.apartment && (order.shippingDetails.landmark || order.giftDetails?.landmark) ? ' | ' : ''}
                                {(order.shippingDetails.landmark || order.giftDetails?.landmark) ? `Landmark: ${order.shippingDetails.landmark || order.giftDetails?.landmark}` : ''}
                              </p>
                            ) : null}
                            <p className="text-gray-600">
                              {order.shippingDetails.city}, {order.shippingDetails.state}{' '}
                              {order.shippingDetails.zipCode}
                            </p>
                          </>
                        )}
                        
                        {order.shippingDetails.deliveryDate ? (
                          <p className="font-semibold text-xs text-gray-700 bg-slate-105/90 dark:bg-slate-800 px-2.5 py-1 rounded-lg inline-block mt-1 border border-slate-200/50">
                            Scheduled: {format(new Date(order.shippingDetails.deliveryDate), 'MMM d, yyyy')}
                            {order.shippingDetails.timeSlot ? ` • ${order.shippingDetails.timeSlot}` : ''}
                          </p>
                        ) : null}

                        {/* Greeting Card Message Callout */}
                        {(order.giftDetails?.message || order.shippingDetails.cardMessage || order.shippingDetails.giftMessage) ? (
                          <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200/60 rounded-xl text-xs text-rose-800 max-w-sm">
                            <span className="font-bold block mb-0.5">💌 Greeting Card Message:</span>
                            <span className="italic">"{order.giftDetails?.message || order.shippingDetails.cardMessage || order.shippingDetails.giftMessage}"</span>
                          </div>
                        ) : null}

                        {/* Delivery Instructions Callout */}
                        {(order.giftDetails?.deliveryInstructions || order.shippingDetails.deliveryInstructions || order.shippingDetails.deliverySpecialInstructions || order.shippingDetails.notes) ? (
                          <div className="mt-2.5 p-3 bg-blue-50 border border-blue-200/60 rounded-xl text-xs text-blue-800 max-w-sm">
                            <span className="font-bold block mb-0.5">🚚 Delivery Instructions:</span>
                            <span className="italic">"{order.giftDetails?.deliveryInstructions || order.shippingDetails.deliveryInstructions || order.shippingDetails.deliverySpecialInstructions || order.shippingDetails.notes}"</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}
                  <div className="space-y-1 text-right">
                    <p className={cn('text-lg font-bold', isDelivered ? 'text-green-800' : 'text-gray-800')}>
                      Total: {displayOrderPrice(order.totalAmount, order.currency, order.currencyRate)}
                    </p>
                    <p className="text-xs capitalize text-gray-500">
                      {((order.paymentDetails?.method && order.paymentDetails.method.toLowerCase() !== 'cod') ? (order.paymentDetails.method.toLowerCase() === 'razorpay' ? 'Online Payment' : order.paymentDetails.method) : 'Online Payment')} • {((order.paymentDetails as any)?.status || 'Paid')}
                    </p>
                    <div className="text-xs text-gray-400">Showing in {currency}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }))}
    </div>
  );
};

export default OrderHistory;
