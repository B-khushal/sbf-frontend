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
      razorpayPaymentId?: string;
      paymentId?: string;
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
    // Always display in INR for official invoices (GST compliance)
    if (order.currency && order.currency !== 'INR' && order.currencyRate) {
      // Convert from order currency to INR
      const amountInINR = amount / order.currencyRate;
      return formatPriceWithCurrency(amountInINR, 'INR');
    } else if (order.currency === 'INR') {
      return formatPriceWithCurrency(amount, 'INR');
    } else {
      // Fallback: treat as INR
      return formatPriceWithCurrency(amount, 'INR');
    }
  };

  // Helper function to get INR amount for calculations
  const getINRAmount = (amount: number) => {
    if (order.currency && order.currency !== 'INR' && order.currencyRate) {
      return amount / order.currencyRate;
    } else if (order.currency === 'INR') {
      return amount;
    } else {
      return amount; // Fallback: treat as INR
    }
  };

  const calculateSubtotal = () => {
    const subtotal = order.items.reduce((sum, item) => sum + item.finalPrice, 0);
    return getINRAmount(subtotal);
  };

  const calculateCGST = (subtotal: number) => {
    return subtotal * 0.025; // 2.5% CGST
  };

  const calculateSGST = (subtotal: number) => {
    return subtotal * 0.025; // 2.5% SGST
  };

  const calculateShipping = () => {
    return getINRAmount(order.shippingFee || 100); // Default shipping fee in INR
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const cgst = calculateCGST(subtotal);
    const sgst = calculateSGST(subtotal);
    const shipping = calculateShipping();
    return subtotal + cgst + sgst + shipping;
  };

  // Safe date formatting helper
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const formatTimeSlot = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning':
        return '9:00 AM - 12:00 PM';
      case 'afternoon':
        return '12:00 PM - 4:00 PM';
      case 'evening':
        return '4:00 PM - 8:00 PM';
      case 'midnight':
        return '12:00 AM - 6:00 AM (Midnight Delivery)';
      default:
        return timeSlot || '7:00 PM - 9:00 PM';
    }
  };

  const getPaymentMethod = () => {
    if (order.paymentDetails.method === 'razorpay') {
      return 'Razorpay (Online Payment)';
    }
    return order.paymentDetails.method || 'Online Payment';
  };

  const getTransactionId = () => {
    return order.paymentDetails.razorpayPaymentId || 
           order.paymentDetails.paymentId || 
           order.paymentDetails.transactionId || 
           'N/A';
  };

  const subtotal = calculateSubtotal();
  const cgst = calculateCGST(subtotal);
  const sgst = calculateSGST(subtotal);
  const shipping = calculateShipping();
  const grandTotal = calculateGrandTotal();

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header with Logo */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <img 
            src="/images/logosbf.png" 
            alt="Spring Blossoms Florist Logo"
            className="w-20 h-20 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Spring Blossoms Florist</h1>
            <div className="text-sm text-center text-gray-600 space-y-1">
              <p>Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32,</p>
              <p>Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
              <p>GSTIN: 36ABCDE1234F1Z5</p>
              <p>Phone: 9849589710</p>
              <p>Email: 2006sbf@gmail.com</p>
              <p>Website: www.sbflorist.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Title and Details */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">INVOICE</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-left">
            <p className="text-sm"><span className="font-semibold">Invoice No:</span> INV-{order.orderNumber}</p>
            <p className="text-sm"><span className="font-semibold">Invoice Date:</span> {formatDate(order.createdAt || order.date)}</p>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold mb-3 text-gray-800 border-b border-gray-300 pb-2">Bill To:</h3>
          <div className="text-sm space-y-1">
            <p className="font-semibold text-gray-800">{(order.shippingDetails.firstName + ' ' + order.shippingDetails.lastName).toUpperCase()}</p>
            <p>Email: {order.shippingDetails.email}</p>
            <p>Phone: {order.shippingDetails.phone}</p>
            <div className="mt-2">
              <p className="font-semibold">Billing Address:</p>
              <p>{order.shippingDetails.address}</p>
              {order.shippingDetails.apartment && <p>{order.shippingDetails.apartment}</p>}
              <p>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3 text-gray-800 border-b border-gray-300 pb-2">Ship To:</h3>
          <div className="text-sm space-y-1">
            {order.shippingDetails.deliveryOption === 'gift' && order.shippingDetails.receiverFirstName ? (
              <>
                <p className="font-semibold text-gray-800">{(order.shippingDetails.receiverFirstName + ' ' + (order.shippingDetails.receiverLastName || '')).toUpperCase()}</p>
                <p>Phone: {order.shippingDetails.receiverPhone}</p>
                <div className="mt-2">
                  <p className="font-semibold">Delivery Address:</p>
                  <p>{order.shippingDetails.receiverAddress}</p>
                  {order.shippingDetails.receiverApartment && <p>{order.shippingDetails.receiverApartment}</p>}
                  <p>{order.shippingDetails.receiverCity}, {order.shippingDetails.receiverState} {order.shippingDetails.receiverZipCode}</p>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-800">{(order.shippingDetails.firstName + ' ' + order.shippingDetails.lastName).toUpperCase()}</p>
                <p>Phone: {order.shippingDetails.phone}</p>
                <div className="mt-2">
                  <p className="font-semibold">Delivery Address:</p>
                  <p>{order.shippingDetails.address}</p>
                  {order.shippingDetails.apartment && <p>{order.shippingDetails.apartment}</p>}
                  <p>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="mb-8">
        <h3 className="font-bold mb-3 text-gray-800 border-b border-gray-300 pb-2">Delivery Information</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p><span className="font-semibold">Delivery Date:</span> {formatDate(order.shippingDetails.deliveryDate)}</p>
          </div>
          <div>
            <p><span className="font-semibold">Time Slot:</span> {formatTimeSlot(order.shippingDetails.timeSlot)}</p>
          </div>
          <div>
            {order.shippingDetails.notes && (
              <p><span className="font-semibold">Delivery Notes:</span> {order.shippingDetails.notes}</p>
            )}
            {order.shippingDetails.giftMessage && (
              <p><span className="font-semibold">Gift Message:</span> {order.shippingDetails.giftMessage}</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Table */}
      <div className="mb-8">
        <h3 className="font-bold mb-3 text-gray-800 border-b border-gray-300 pb-2">Order Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Item</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Price (₹)</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Quantity</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="font-medium">{item.product.name}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                    A beautiful arrangement of fresh flowers, elegantly prepared for your special occasion.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      minimumFractionDigits: 2,
                    }).format(getINRAmount(item.price)).replace('₹', '')}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      minimumFractionDigits: 2,
                    }).format(getINRAmount(item.finalPrice)).replace('₹', '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mb-8">
        <h3 className="font-bold mb-3 text-gray-800 border-b border-gray-300 pb-2">Payment Summary</h3>
        <div className="flex justify-end">
          <div className="w-80">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold" colSpan={2}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Subtotal</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(subtotal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">CGST (2.5%)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(cgst)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">SGST (2.5%)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(sgst)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Shipping Charges</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(shipping)}
                  </td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-300 px-4 py-2">GRAND TOTAL</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-8">
        <h3 className="font-bold mb-3 text-gray-800 border-b border-gray-300 pb-2">Payment Information:</h3>
        <div className="text-sm space-y-1">
          <p><span className="font-semibold">Method:</span> {getPaymentMethod()}</p>
          <p><span className="font-semibold">Status:</span> {order.paymentDetails.status === 'completed' ? 'Completed' : order.paymentDetails.status}</p>
          <p><span className="font-semibold">Transaction ID:</span> {getTransactionId()}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-6 text-center text-sm text-gray-600 space-y-3">
        <p className="font-semibold text-gray-800">Thank you for your business! We appreciate your order.</p>
        <p>
          For any questions regarding your order or our products, please don't hesitate to contact us via email at{' '}
          <span className="font-semibold">2006sbf@gmail.com</span> or call us at{' '}
          <span className="font-semibold">9849589710</span> during our business hours (Monday - Saturday, 9 AM - 6 PM IST).
        </p>
        <p className="text-xs">
          Terms and conditions apply. For our return and refund policy, please visit www.springblossomsflorist.com/returns.
        </p>
      </div>
    </div>
  );
};

export default Invoice; 