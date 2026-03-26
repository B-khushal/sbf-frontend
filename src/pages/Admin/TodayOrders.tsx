import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Order, getTodayOrders, updateOrderStatus } from '@/services/orderService';
import { CheckCircle2, ChefHat, Loader2, Minimize2, MonitorUp, RefreshCw } from 'lucide-react';

type BoardColumn = 'pending' | 'preparing' | 'delivered';

type BoardItem = {
  key: string;
  orderId: string;
  orderNumber: string;
  orderStatus: Order['status'];
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  item: Order['items'][number];
  column: BoardColumn;
};

const REFRESH_INTERVAL_MS = 25000;

const columnMeta: Record<BoardColumn, { title: string; wrapperClass: string; badgeClass: string }> = {
  pending: {
    title: 'Pending',
    wrapperClass: 'border-orange-200 bg-gradient-to-b from-orange-50 to-amber-50',
    badgeClass: 'bg-orange-500 text-white'
  },
  preparing: {
    title: 'Preparing',
    wrapperClass: 'border-sky-200 bg-gradient-to-b from-sky-50 to-blue-50',
    badgeClass: 'bg-blue-600 text-white'
  },
  delivered: {
    title: 'Delivered',
    wrapperClass: 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-green-50',
    badgeClass: 'bg-emerald-600 text-white'
  }
};

const getColumnFromStatus = (status: Order['status']): BoardColumn => {
  if (status === 'delivered') return 'delivered';
  if (status === 'being_made' || status === 'out_for_delivery') return 'preparing';
  return 'pending';
};

const getImageUrl = (item: Order['items'][number]) => {
  return item.image || item.images?.[0] || item.product?.images?.[0] || '/placeholder.svg';
};

const getItemName = (item: Order['items'][number]) => {
  return item.title || item.product?.title || 'Unnamed Product';
};

const hasCustomizations = (customizations: unknown) => {
  if (!customizations) return false;
  if (typeof customizations === 'string') return customizations.trim().length > 0;
  if (Array.isArray(customizations)) return customizations.length > 0;
  if (typeof customizations === 'object') return Object.keys(customizations as Record<string, unknown>).length > 0;
  return false;
};

const renderCustomizationRows = (customizations: unknown) => {
  if (!customizations) return null;

  if (typeof customizations === 'string') {
    return <p className="text-sm font-medium text-orange-950">{customizations}</p>;
  }

  if (Array.isArray(customizations)) {
    return (
      <ul className="space-y-1">
        {customizations.map((value, index) => (
          <li key={`${String(value)}-${index}`} className="text-sm font-medium text-orange-950">
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof customizations === 'object') {
    return (
      <div className="space-y-1">
        {Object.entries(customizations as Record<string, unknown>).map(([key, value]) => (
          <p key={key} className="text-sm font-medium text-orange-950">
            <span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </p>
        ))}
      </div>
    );
  }

  return <p className="text-sm font-medium text-orange-950">{String(customizations)}</p>;
};

const formatPrice = (amount: number, currencyCode = 'INR') => {
  return new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

const toBoardItems = (orders: Order[]): BoardItem[] => {
  return orders.flatMap((order) => {
    const deliveryAddress = [
      order.shippingDetails.address,
      order.shippingDetails.apartment,
      order.shippingDetails.city,
      order.shippingDetails.state,
      order.shippingDetails.zipCode
    ].filter(Boolean).join(', ');

    return order.items.map((item, itemIndex) => ({
      key: `${order._id}-${itemIndex}`,
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      createdAt: order.createdAt,
      customerName: order.shippingDetails.fullName || 'Customer',
      customerPhone: order.shippingDetails.phone || 'N/A',
      deliveryAddress,
      paymentMethod: order.paymentDetails?.method || 'N/A',
      item,
      column: getColumnFromStatus(order.status)
    }));
  });
};

const TodayOrders: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BoardItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updatingCardKey, setUpdatingCardKey] = useState<string | null>(null);
  const [newCardKeys, setNewCardKeys] = useState<Set<string>>(new Set());
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  const previousKeysRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);

  const boardItems = useMemo(() => toBoardItems(orders), [orders]);

  const itemsByColumn = useMemo(() => {
    return {
      pending: boardItems.filter((card) => card.column === 'pending'),
      preparing: boardItems.filter((card) => card.column === 'preparing'),
      delivered: boardItems.filter((card) => card.column === 'delivered')
    };
  }, [boardItems]);

  const playNewOrderSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      void audio.play();
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const loadOrders = useCallback(async (showSpinner: boolean) => {
    try {
      if (showSpinner) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const todayOrders = await getTodayOrders('all');
      const incomingKeys = new Set(toBoardItems(todayOrders).map((card) => card.key));

      if (initialLoadDoneRef.current) {
        const addedKeys = Array.from(incomingKeys).filter((key) => !previousKeysRef.current.has(key));
        if (addedKeys.length > 0) {
          setNewCardKeys(new Set(addedKeys));
          playNewOrderSound();
          window.setTimeout(() => {
            setNewCardKeys(new Set());
          }, 10000);
        }
      }

      previousKeysRef.current = incomingKeys;
      initialLoadDoneRef.current = true;
      setOrders(todayOrders);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load today orders:', error);
      toast({
        title: 'Unable to load orders',
        description: 'Please try again in a moment.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadOrders(true);
  }, [loadOrders]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      void loadOrders(false);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadOrders]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreenMode(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isFullScreenMode) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('kitchen-mode-active');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('kitchen-mode-active');
    }

    window.dispatchEvent(new CustomEvent('kitchen-mode-toggle', { detail: { active: isFullScreenMode } }));

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('kitchen-mode-active');
      window.dispatchEvent(new CustomEvent('kitchen-mode-toggle', { detail: { active: false } }));
    };
  }, [isFullScreenMode]);

  const enterFullScreenMode = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullScreenMode(true);
    } catch (error) {
      console.error('Failed to enter full screen:', error);
      toast({
        title: 'Fullscreen unavailable',
        description: 'Your browser blocked fullscreen mode.',
        variant: 'destructive'
      });
    }
  };

  const exitFullScreenMode = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullScreenMode(false);
    } catch (error) {
      console.error('Failed to exit full screen:', error);
      setIsFullScreenMode(false);
    }
  };

  const moveOrder = async (orderId: string, nextStatus: Order['status'], cardKey: string) => {
    try {
      setUpdatingCardKey(cardKey);
      await updateOrderStatus(orderId, nextStatus);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: nextStatus
              }
            : order
        )
      );
      toast({
        title: 'Order updated',
        description: nextStatus === 'being_made' ? 'Moved to Preparing.' : 'Marked as Delivered.'
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update this order status.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingCardKey(null);
    }
  };

  return (
    <div className={isFullScreenMode ? 'kitchen-mode-root space-y-5 p-5' : 'space-y-5'}>
      {!isFullScreenMode && (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-100 px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Today's Production Board</h1>
              <p className="text-sm font-medium text-slate-600">
                {format(new Date(), 'EEEE, dd MMM yyyy')} • Live workflow screen
              </p>
              {lastUpdated && (
                <p className="mt-1 text-xs text-slate-500">Last updated: {format(lastUpdated, 'hh:mm:ss a')}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-black text-white">Auto refresh 25s</Badge>
              <Button variant="outline" onClick={() => void loadOrders(false)} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
              </Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => void enterFullScreenMode()}>
                <MonitorUp className="mr-2 h-4 w-4" />
                Full Screen Mode
              </Button>
            </div>
          </div>
        </div>
      )}

      {isFullScreenMode && (
        <Button
          className="fixed right-6 top-6 z-[130] bg-red-600 text-white shadow-lg hover:bg-red-700"
          onClick={() => void exitFullScreenMode()}
        >
          <Minimize2 className="mr-2 h-4 w-4" />
          Exit Full Screen
        </Button>
      )}

      {isLoading ? (
        <div className={`flex min-h-[300px] items-center justify-center rounded-xl border ${isFullScreenMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <Loader2 className={`h-8 w-8 animate-spin ${isFullScreenMode ? 'text-slate-300' : 'text-slate-500'}`} />
        </div>
      ) : (
        <div className={isFullScreenMode ? 'grid h-[calc(100vh-40px)] grid-cols-3 gap-6' : 'grid grid-cols-1 gap-4 xl:grid-cols-3'}>
          {(['pending', 'preparing', 'delivered'] as BoardColumn[]).map((column) => {
            const cards = itemsByColumn[column];
            const meta = columnMeta[column];

            return (
              <section key={column} className={`rounded-xl border p-3 ${meta.wrapperClass} ${isFullScreenMode ? 'bg-opacity-100' : ''}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className={`font-extrabold tracking-wide ${isFullScreenMode ? 'text-3xl text-slate-900' : 'text-xl text-slate-900'}`}>{meta.title}</h2>
                  <Badge className={meta.badgeClass}>{cards.length}</Badge>
                </div>

                <div className={`${isFullScreenMode ? 'h-[calc(100vh-250px)]' : 'max-h-[72vh]'} space-y-3 overflow-y-auto pr-1`}>
                  {cards.length === 0 ? (
                    <Card className="border-dashed border-slate-300 bg-white/70">
                      <CardContent className="py-8 text-center text-sm font-semibold text-slate-500">No items</CardContent>
                    </Card>
                  ) : (
                    cards.map((card) => {
                      const itemAmount = card.item.finalPrice ?? card.item.price;
                      const isNew = newCardKeys.has(card.key);

                      return (
                        <button
                          type="button"
                          key={card.key}
                          onClick={() => {
                            if (!isFullScreenMode) {
                              setSelectedCard(card);
                            }
                          }}
                          className={`w-full overflow-hidden rounded-xl border bg-white text-left shadow-md transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-500 ${isNew ? 'ring-2 ring-rose-400 animate-pulse' : ''}`}
                        >
                          <div className={`relative w-full overflow-hidden rounded-t-xl bg-slate-100 ${isFullScreenMode ? 'h-64' : 'h-52'}`}>
                            <img
                              src={getImageUrl(card.item)}
                              alt={getItemName(card.item)}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            <div className={`absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-1 font-semibold text-white ${isFullScreenMode ? 'text-sm' : 'text-xs'}`}>
                              #{card.orderNumber} • {format(new Date(card.createdAt), 'hh:mm a')}
                            </div>
                          </div>

                          <div className={`space-y-2 ${isFullScreenMode ? 'p-4' : 'p-3'}`}>
                            <p className={`line-clamp-2 font-extrabold text-slate-900 ${isFullScreenMode ? 'text-2xl' : 'text-lg'}`}>{getItemName(card.item)}</p>
                            <div className={`flex items-center justify-between font-semibold text-slate-700 ${isFullScreenMode ? 'text-xl' : 'text-base'}`}>
                              <span>Qty: {card.item.quantity}</span>
                              <span>{formatPrice(itemAmount, 'INR')}</span>
                            </div>

                            {hasCustomizations(card.item.customizations) && (
                              <div className={`rounded-md border border-orange-400 bg-orange-200 px-2 py-2 ${isFullScreenMode ? 'ring-1 ring-orange-500' : ''}`}>
                                <p className={`mb-1 font-black uppercase tracking-wider text-orange-800 ${isFullScreenMode ? 'text-sm' : 'text-xs'}`}>Customization</p>
                                {renderCustomizationRows(card.item.customizations)}
                              </div>
                            )}

                            {!isFullScreenMode && column !== 'delivered' && (
                              <div className="pt-1">
                                {column === 'pending' ? (
                                  <Button
                                    size="sm"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={updatingCardKey === card.key}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      void moveOrder(card.orderId, 'being_made', card.key);
                                    }}
                                  >
                                    {updatingCardKey === card.key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChefHat className="mr-2 h-4 w-4" />}
                                    Mark as Preparing
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    disabled={updatingCardKey === card.key}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      void moveOrder(card.orderId, 'delivered', card.key);
                                    }}
                                  >
                                    {updatingCardKey === card.key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                    Mark as Delivered
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(selectedCard) && !isFullScreenMode} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold">
                  Order #{selectedCard.orderNumber} • {getItemName(selectedCard.item)}
                </DialogTitle>
                <DialogDescription>
                  Created at {format(new Date(selectedCard.createdAt), 'hh:mm a')} • {selectedCard.customerName}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="overflow-hidden rounded-lg border bg-slate-100">
                  <img
                    src={getImageUrl(selectedCard.item)}
                    alt={getItemName(selectedCard.item)}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-base font-semibold text-slate-900">Qty: {selectedCard.item.quantity}</p>
                  <p className="text-base font-semibold text-slate-900">
                    Price: {formatPrice(selectedCard.item.finalPrice ?? selectedCard.item.price, 'INR')}
                  </p>
                  <p className="text-sm text-slate-700">Phone: {selectedCard.customerPhone}</p>
                  <p className="text-sm text-slate-700">Address: {selectedCard.deliveryAddress || 'N/A'}</p>
                  <p className="text-sm text-slate-700">Payment: {selectedCard.paymentMethod}</p>

                  {hasCustomizations(selectedCard.item.customizations) && (
                    <div className="rounded-md border border-orange-300 bg-orange-100 p-3">
                      <p className="mb-2 text-xs font-black uppercase tracking-wider text-orange-700">Customization Details</p>
                      {renderCustomizationRows(selectedCard.item.customizations)}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodayOrders;
