import React, { useState, useEffect } from 'react';
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageIcon } from 'lucide-react';
import api from '@/services/api';
import { getImageUrl as getImageUrlFromConfig } from '@/config';
import OrderTracking from './OrderTracking';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  sku?: string;
  discount?: number;
  title: string;
}

interface GiftDetails {
  message: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientApartment: string;
  recipientCity: string;
  recipientState: string;
  recipientZipCode: string;
}

interface ShippingDetails {
  fullName:string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  deliveryOption: 'self' | 'gift';
  giftDetails?: GiftDetails;
  timeSlot: string;
  deliveryDate: string;
}

interface PaymentDetails {
  method: string;
  status: 'paid' | 'unpaid';
  transactionId?: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  finalPrice: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  shippingDetails: ShippingDetails;
  items: OrderItem[];
  totalAmount: number;
  shippingFee?: number;
  status: 'order_placed' | 'received' | 'being_made' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentDetails: PaymentDetails;
  createdAt: string;
  notes?: string;
  giftDetails?: GiftDetails;
  currency?: string;
  currencyRate?: number;
  originalCurrency?: string;
  trackingHistory?: {
    status: 'order_placed' | 'received' | 'being_made' | 'out_for_delivery' | 'delivered' | 'cancelled';
    timestamp: string;
    message?: string;
    updatedBy?: string;
  }[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => Promise<void>;
}

export default function OrderDetailsModal({ isOpen, onClose, order, onStatusUpdate }: OrderDetailsModalProps) {
  const { formatPrice, convertPrice, currency, rate } = useCurrency();

  // Helper function to format price with specific currency
  const formatPriceWithCurrency = (amount: number, targetCurrency: string) => {
    return new Intl.NumberFormat(targetCurrency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Display order price with proper currency handling
  const displayOrderPrice = (amount: number, orderCurrency?: string, orderRate?: number) => {
    // Always display in the current selected currency
    // Convert order amount to current currency if needed
    
    if (!orderCurrency) {
      // Legacy order - assume it's in INR
      if (currency === 'INR') {
        return formatPriceWithCurrency(amount, 'INR');
      } else {
        // Convert from INR to current currency
        const converted = convertPrice(amount);
        return formatPriceWithCurrency(converted, currency);
      }
    }
    
    if (orderCurrency === currency) {
      // Same currency - no conversion needed
      return formatPriceWithCurrency(amount, currency);
    }
    
    // Different currencies - need conversion
    if (orderCurrency === 'INR') {
      // Order in INR, convert to current currency
      const converted = convertPrice(amount);
      return formatPriceWithCurrency(converted, currency);
    } else if (currency === 'INR') {
      // Order in foreign currency, convert to INR
      const rateToUse = orderRate || 0.01162;
      const converted = amount / rateToUse;
      return formatPriceWithCurrency(converted, 'INR');
    } else {
      // Both foreign currencies - convert via INR
      const rateToUse = orderRate || 0.01162;
      const inINR = amount / rateToUse;
      const converted = convertPrice(inINR);
      return formatPriceWithCurrency(converted, currency);
    }
  };
  const [localOrder, setLocalOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (order?._id) {
        try {
          const response = await api.get(`/orders/${order._id}`);
          console.log('Fetched order details:', response.data); // Debug log
          setLocalOrder(response.data);
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      }
    };

    if (order) {
      fetchOrderDetails();
    }
  }, [order]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setLocalOrder((prevOrder) => prevOrder ? { ...prevOrder, status: newStatus } : null);
      await onStatusUpdate(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (!localOrder) return null;

  // Use the centralized image URL utility function
  const getImageUrl = getImageUrlFromConfig;

  const orderStatuses = [
    { value: 'order_placed', label: 'Order Placed' },
    { value: 'received', label: 'Received' },
    { value: 'being_made', label: 'Being Made' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'order_placed':
        return 'outline';
      case 'received':
        return 'secondary';
      case 'being_made':
        return 'default';
      case 'out_for_delivery':
        return 'secondary';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      // Legacy status support
      case 'completed':
        return 'success';
      case 'processing':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateSubtotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => {
      const originalPrice = item.product.price;
      const finalPrice = item.product.discount
        ? originalPrice * (1 - item.product.discount / 100)
        : originalPrice;
      return sum + (finalPrice * item.quantity);
    }, 0);
  };

  console.log('Order received:', order);
  console.log('Local order data:', localOrder);
  console.log('Order items:', localOrder?.items);
  console.log('Order details:', {
    deliveryOption: localOrder.shippingDetails.deliveryOption,
    giftDetails: localOrder.giftDetails,
    fullOrder: localOrder
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Order #{localOrder.orderNumber}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8">
                    <Badge variant={getStatusBadgeVariant(localOrder.status)}>
                      {localOrder.status.toUpperCase()}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {orderStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => handleStatusUpdate(localOrder._id, status.value as Order['status'])}
                    >
                      <Badge variant={getStatusBadgeVariant(status.value as Order['status'])}>
                        {status.label}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Customer Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Sender Information */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">
                {localOrder?.giftDetails ? 'Sender Information' : 'Customer Information'}
              </h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {localOrder?.shippingDetails?.fullName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {localOrder?.shippingDetails?.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {localOrder?.shippingDetails?.phone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Delivery Option:</span>{' '}
                  <Badge variant="outline">
                    {localOrder?.giftDetails ? 'Send as a gift' : 'Delivery for myself'}
                  </Badge>
                </p>
              </div>
            </Card>

            {/* Recipient/Shipping Information */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">
                {localOrder?.giftDetails ? 'Recipient Information' : 'Shipping Address'}
              </h3>
              <div className="space-y-1">
                {localOrder?.giftDetails ? (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {localOrder.giftDetails.recipientName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {localOrder.giftDetails.recipientPhone}
                    </p>
                    {localOrder.giftDetails.recipientEmail && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {localOrder.giftDetails.recipientEmail}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Address:</span> {localOrder.giftDetails.recipientAddress}
                    </p>
                    {localOrder.giftDetails.recipientApartment && (
                      <p className="text-sm">
                        <span className="font-medium">Apartment:</span> {localOrder.giftDetails.recipientApartment}
                      </p>
                    )}
                    <p className="text-sm">
                      {localOrder.giftDetails.recipientCity}, {' '}
                      {localOrder.giftDetails.recipientState} {' '}
                      {localOrder.giftDetails.recipientZipCode}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">{localOrder?.shippingDetails?.address}</p>
                    {localOrder?.shippingDetails?.apartment && (
                      <p className="text-sm">{localOrder.shippingDetails.apartment}</p>
                    )}
                    <p className="text-sm">
                      {localOrder?.shippingDetails?.city}, {localOrder?.shippingDetails?.state} {localOrder?.shippingDetails?.zipCode}
                    </p>
                  </>
                )}
                <p className="text-sm">
                  <span className="font-medium">Delivery Date:</span>{' '}
                  {localOrder?.shippingDetails?.deliveryDate && 
                    new Date(localOrder.shippingDetails.deliveryDate).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Time Slot:</span> {localOrder?.shippingDetails?.timeSlot}
                </p>
              </div>
            </Card>

            {/* Gift Message */}
            {localOrder?.giftDetails?.message && (
              <Card className="p-4 col-span-2">
                <h3 className="font-semibold mb-2">Gift Message</h3>
                <div className="space-y-1">
                  <p className="text-sm italic">"{localOrder.giftDetails.message}"</p>
                </div>
              </Card>
            )}
          </div>

          {/* Order Tracking */}
          <OrderTracking 
            currentStatus={localOrder.status}
            trackingHistory={localOrder.trackingHistory}
            className="mb-6"
          />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price ({currency})</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Final Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localOrder.items.map((item, index) => {
                  // Use the actual prices charged when order was placed, not current product prices
                  const originalPrice = item.price; // Actual price charged
                  const finalPrice = item.finalPrice; // Final price after discount when charged
                  const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                            <img
                              src={getImageUrl(item.product.images?.[0])}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/placeholder.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{item.product.title}</div>
                            {item.product.sku && (
                              <div className="text-sm text-muted-foreground">
                                SKU: {item.product.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {displayOrderPrice(originalPrice, localOrder.currency, localOrder.currencyRate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {discountPercent > 0 ? `${discountPercent}%` : "0%"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {displayOrderPrice(finalPrice, localOrder.currency, localOrder.currencyRate)}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {displayOrderPrice(finalPrice * item.quantity, localOrder.currency, localOrder.currencyRate)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Order Summary */}
          <div className="space-y-2">
            <Separator />
            
            {/* Subtotal (calculated from items) */}
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>
                {displayOrderPrice(
                  localOrder.items.reduce((sum, item) => {
                    // Use the actual final price charged when order was placed
                    return sum + (item.finalPrice * item.quantity);
                  }, 0),
                  localOrder.currency,
                  localOrder.currencyRate
                )}
              </span>
            </div>
            
            {/* Shipping Fee */}
            {localOrder.shippingFee && localOrder.shippingFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>{displayOrderPrice(localOrder.shippingFee, localOrder.currency, localOrder.currencyRate)}</span>
              </div>
            )}
            

            
            <Separator />
            
            {/* Total Amount - use the stored total amount */}
            <div className="flex justify-between font-medium text-lg">
              <span>Total Amount ({currency}):</span>
              <span className="font-bold">
                {displayOrderPrice(localOrder.totalAmount, localOrder.currency, localOrder.currencyRate)}
              </span>
            </div>
            
            {/* Show calculation breakdown if totals don't match */}
            {(() => {
              const calculatedSubtotal = localOrder.items.reduce((sum, item) => {
                // Use the actual final price charged when order was placed
                return sum + (item.finalPrice * item.quantity);
              }, 0);
              
              const calculatedTotal = calculatedSubtotal + (localOrder.shippingFee || 0);
              const difference = Math.abs(calculatedTotal - localOrder.totalAmount);
              
              if (difference > 0.01) {
                return (
                  <div className="text-xs text-muted-foreground italic">
                    * Total shown is the amount actually charged
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold mb-2">Payment Information</h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Method:</span> {localOrder.paymentDetails.method}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span>{' '}
                <Badge variant={localOrder.paymentDetails.status === 'paid' ? 'success' : 'destructive'}>
                  {localOrder.paymentDetails.status}
                </Badge>
              </p>
              {localOrder.paymentDetails.transactionId && (
                <p className="text-sm">
                  <span className="font-medium">Transaction ID:</span> {localOrder.paymentDetails.transactionId}
                </p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <p className="text-sm text-muted-foreground">
              Order placed on {formatDate(localOrder.createdAt)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 