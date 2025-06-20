import React from 'react';
import { format } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';

interface InvoiceProps {
  order: {
    id?: string;
    orderNumber: string;
    createdAt?: string;
    date?: string;
    shippingDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      apartment?: string;
      city: string;
      state: string;
      zipCode: string;
      notes?: string;
      deliveryOption?: 'self' | 'gift';
      giftMessage?: string;
      receiverFirstName?: string;
      receiverLastName?: string;
      receiverEmail?: string;
      receiverPhone?: string;
      receiverAddress?: string;
      receiverApartment?: string;
      receiverCity?: string;
      receiverState?: string;
      receiverZipCode?: string;
      timeSlot: string;
      deliveryDate?: string;
    };
    items: Array<{
      product: {
        id?: string;
        name: string;
        images?: string[];
        image?: string;
        price: number;
        discount?: number;
      };
      quantity: number;
      price: number;
      finalPrice: number;
    }>;
    totalAmount: number;

    shippingFee?: number;
    status: string;
    paymentDetails: {
      method: string;
      status: string;
      transactionId?: string;
    };
    currency?: string;
    currencyRate?: number;
    originalCurrency?: string;
  };
  isAdmin?: boolean;
}

const Invoice: React.FC<InvoiceProps> = ({ order, isAdmin = false }) => {
  const { formatPrice, convertPrice, currency, rate } = useCurrency();

  // Helper function to format price with specific currency
  const formatPriceWithCurrency = (amount: number, targetCurrency: string) => {
    return new Intl.NumberFormat(targetCurrency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to handle currency display based on order's original currency
  const displayPrice = (amount: number) => {
    // If order has currency information and it's different from current currency
    if (order.currency && order.currencyRate && order.currency !== currency) {
      // Convert from order currency to current currency
      if (order.currency === 'INR') {
        // Order was in INR, convert to current currency
        const convertedAmount = convertPrice(amount);
        return formatPriceWithCurrency(convertedAmount, currency);
      } else {
        // Order was in non-INR, first convert back to INR, then to current currency
        const amountInINR = amount / order.currencyRate;
        const convertedAmount = convertPrice(amountInINR);
        return formatPriceWithCurrency(convertedAmount, currency);
      }
    } else if (order.currency && order.currency === currency) {
      // Order currency matches current currency, no conversion needed
      return formatPriceWithCurrency(amount, order.currency);
    } else if (order.currency) {
      // Order has currency info, use that currency for display
      return formatPriceWithCurrency(amount, order.currency);
    } else {
      // No order currency info, treat as INR and convert to current currency
      const convertedAmount = convertPrice(amount);
      return formatPriceWithCurrency(convertedAmount, currency);
    }
  };

  const calculateSubtotal = () => {
    return order.items.reduce((sum, item) => sum + item.finalPrice, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (order.shippingFee || 0);
  };

  // Safe date formatting helper
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Spring Blossoms Florist</h1>
          <p className="text-muted-foreground">Door No. 12-2-786/A & B, Najam Centre,
          Pillar No. 32,Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">Invoice</h2>
          <p className="text-muted-foreground">#{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Bill To</h3>
          <div className="text-sm">
            <p>{order.shippingDetails.firstName} {order.shippingDetails.lastName}</p>
            <p>{order.shippingDetails.email}</p>
            <p>{order.shippingDetails.phone}</p>
            <p>{order.shippingDetails.address}</p>
            {order.shippingDetails.apartment && <p>{order.shippingDetails.apartment}</p>}
            <p>
              {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}
            </p>
          </div>
        </div>

        {order.shippingDetails.deliveryOption === 'gift' && (
          <div>
            <h3 className="font-semibold mb-2">Deliver To</h3>
            <div className="text-sm">
              <p>{order.shippingDetails.receiverFirstName} {order.shippingDetails.receiverLastName}</p>
              <p>{order.shippingDetails.receiverEmail}</p>
              <p>{order.shippingDetails.receiverPhone}</p>
              <p>{order.shippingDetails.receiverAddress}</p>
              {order.shippingDetails.receiverApartment && <p>{order.shippingDetails.receiverApartment}</p>}
              <p>
                {order.shippingDetails.receiverCity}, {order.shippingDetails.receiverState} {order.shippingDetails.receiverZipCode}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => {
              // Get the first image or use a placeholder
              const imageUrl = Array.isArray(item.product.images) && item.product.images.length > 0
                ? item.product.images[0]
                : item.product.image || '/images/placeholder.jpg';
              
              return (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span>{item.product.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-2">{displayPrice(item.price)}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">{displayPrice(item.finalPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Delivery Information</h3>
          <div className="text-sm">
            <p>Delivery Date: {formatDate(order.shippingDetails.deliveryDate)}</p>
            <p>Time Slot: {order.shippingDetails.timeSlot}</p>
            {order.shippingDetails.notes && <p>Notes: {order.shippingDetails.notes}</p>}
            {order.shippingDetails.giftMessage && <p>Gift Message: {order.shippingDetails.giftMessage}</p>}
          </div>
        </div>

        <div className="text-right">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{displayPrice(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingFee ? displayPrice(order.shippingFee) : 'Free'}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{displayPrice(calculateTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mt-8 pt-8 border-t">
        <h3 className="font-semibold mb-2">Payment Information</h3>
        <div className="text-sm">
          <p>Method: {order.paymentDetails.method}</p>
          <p>Status: {order.paymentDetails.status}</p>
          {order.paymentDetails.transactionId && (
            <p>Transaction ID: {order.paymentDetails.transactionId}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
        <p>For any questions, please contact us at support@springblossoms.com</p>
      </div>
    </div>
  );
};

export default Invoice; 