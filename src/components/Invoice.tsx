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
        title: string;
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
    return getINRAmount(order.shippingFee || 0);
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
      return format(date, 'dd/MM/yyyy');
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
    <div className="bg-white max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Professional Header with Business Information */}
      <div className="border-b-4 border-emerald-600 p-8">
        <div className="flex justify-between items-start">
          {/* Company Information */}
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-lg flex items-center justify-center border-2 border-emerald-200">
              <span className="text-3xl">🌸</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Spring Blossoms Florist</h1>
              <p className="text-lg text-gray-600 mb-3">Premium Floral Arrangements & Gift Services</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Address:</strong> Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32</p>
                <p>Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
                <p><strong>GSTIN:</strong> 36AABFS1234Z1Z5</p>
                <p><strong>Phone:</strong> +91 9849589710 | <strong>Email:</strong> 2006sbf@gmail.com</p>
                <p><strong>Website:</strong> www.sbflorist.com</p>
              </div>
            </div>
          </div>
          
          {/* Invoice Details */}
          <div className="text-right">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">INVOICE</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Invoice No:</strong> INV-{order.orderNumber}</p>
                <p><strong>Invoice Date:</strong> {formatDate(order.createdAt || order.date)}</p>
                <p><strong>Order ID:</strong> {order.orderNumber}</p>
                <p><strong>Due Date:</strong> {formatDate(order.createdAt || order.date)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-8">
        {/* Customer and Delivery Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bill To */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Bill To
            </h3>
            <div className="space-y-3">
              <p className="text-lg font-semibold text-gray-800">
                {order.shippingDetails.firstName} {order.shippingDetails.lastName}
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> {order.shippingDetails.email}</p>
                <p><strong>Phone:</strong> {order.shippingDetails.phone}</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="font-semibold text-gray-700 mb-2">Billing Address</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.shippingDetails.address}</p>
                  {order.shippingDetails.apartment && <p>{order.shippingDetails.apartment}</p>}
                  <p>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ship To */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Ship To
            </h3>
            <div className="space-y-3">
              {order.shippingDetails.deliveryOption === 'gift' && order.shippingDetails.receiverFirstName ? (
                <>
                  <p className="text-lg font-semibold text-gray-800">
                    {order.shippingDetails.receiverFirstName} {order.shippingDetails.receiverLastName || ''}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Phone:</strong> {order.shippingDetails.receiverPhone}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="font-semibold text-gray-700 mb-2">Delivery Address</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.shippingDetails.receiverAddress}</p>
                      {order.shippingDetails.receiverApartment && <p>{order.shippingDetails.receiverApartment}</p>}
                      <p>{order.shippingDetails.receiverCity}, {order.shippingDetails.receiverState} {order.shippingDetails.receiverZipCode}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-800">
                    {order.shippingDetails.firstName} {order.shippingDetails.lastName}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Phone:</strong> {order.shippingDetails.phone}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="font-semibold text-gray-700 mb-2">Delivery Address</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.shippingDetails.address}</p>
                      {order.shippingDetails.apartment && <p>{order.shippingDetails.apartment}</p>}
                      <p>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order and Delivery Information */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Order & Delivery Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1"><strong>Order Date</strong></p>
              <p className="font-semibold text-gray-800">{formatDate(order.createdAt || order.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1"><strong>Delivery Date</strong></p>
              <p className="font-semibold text-gray-800">{formatDate(order.shippingDetails.deliveryDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1"><strong>Time Slot</strong></p>
              <p className="font-semibold text-gray-800">{formatTimeSlot(order.shippingDetails.timeSlot)}</p>
            </div>
          </div>
          {(order.shippingDetails.notes || order.shippingDetails.giftMessage) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {order.shippingDetails.notes && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1"><strong>Delivery Notes</strong></p>
                  <p className="text-sm text-gray-800 italic">"{order.shippingDetails.notes}"</p>
                </div>
              )}
              {order.shippingDetails.giftMessage && (
                <div>
                  <p className="text-sm text-gray-600 mb-1"><strong>Gift Message</strong></p>
                  <p className="text-sm text-gray-800 italic">"{order.shippingDetails.giftMessage}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Details Table */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Order Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-4 py-3 text-left font-semibold border border-gray-600">S.No</th>
                  <th className="px-4 py-3 text-left font-semibold border border-gray-600">Item Description</th>
                  <th className="px-4 py-3 text-right font-semibold border border-gray-600">Unit Price (₹)</th>
                  <th className="px-4 py-3 text-center font-semibold border border-gray-600">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold border border-gray-600">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 border border-gray-300 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 border border-gray-300">
                      <div>
                        <p className="font-semibold text-gray-800">{item.product.title}</p>
                        <p className="text-xs text-gray-600">Premium Floral Arrangement</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-right font-semibold">
                      {new Intl.NumberFormat('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(getINRAmount(item.price))}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-right font-bold text-emerald-600">
                      {new Intl.NumberFormat('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(getINRAmount(item.finalPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-96">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3">
                <h3 className="font-bold text-lg">Payment Summary</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ₹{new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">CGST (2.5%)</span>
                  <span className="font-semibold">
                    ₹{new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(cgst)}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">SGST (2.5%)</span>
                  <span className="font-semibold">
                    ₹{new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(sgst)}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="font-semibold">
                      ₹{new Intl.NumberFormat('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(shipping)}
                    </span>
                  </div>
                )}
                
                <div className="bg-emerald-600 text-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL AMOUNT</span>
                    <span className="text-2xl font-bold">
                      ₹{new Intl.NumberFormat('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(grandTotal)}
                    </span>
                  </div>
                  <p className="text-emerald-100 text-sm mt-1">All charges inclusive</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-blue-200 pb-2">
            Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1"><strong>Payment Method</strong></p>
              <p className="font-semibold text-gray-800">{getPaymentMethod()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1"><strong>Payment Status</strong></p>
              <p className="font-semibold text-green-600">
                {order.paymentDetails.status === 'completed' ? '✅ Completed' : order.paymentDetails.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1"><strong>Transaction ID</strong></p>
              <p className="font-mono text-sm text-gray-700">{getTransactionId()}</p>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="border-t-4 border-emerald-600 p-8 bg-gray-50 rounded-lg">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Business!</h3>
            <p className="text-gray-600">We appreciate your trust in Spring Blossoms Florist</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-3">🏪 Visit Our Store</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Door No. 12-2-786/A & B, Najam Centre</p>
                <p>Pillar No. 32, Rethi Bowli, Mehdipatnam</p>
                <p>Hyderabad, Telangana 500028</p>
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-3">📞 Contact Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Phone:</strong> +91 9849589710</p>
                <p><strong>Email:</strong> 2006sbf@gmail.com</p>
                <p><strong>Website:</strong> www.sbflorist.com</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-4 text-center">
            <p className="text-gray-600 text-sm mb-2">
              <strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST
            </p>
            <p className="text-gray-500 text-xs">
              Terms and conditions apply. For returns and refunds, please contact us within 24 hours of delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice; 