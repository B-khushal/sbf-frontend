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
    <div className="p-0 bg-white max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img 
              src="/images/logosbf.png" 
              alt="Spring Blossoms Florist Logo"
              className="w-24 h-24 object-contain bg-white rounded-full p-2"
            />
            <div>
              <h1 className="text-3xl font-bold mb-2">Spring Blossoms Florist</h1>
              <p className="text-emerald-100 text-lg">Premium Floral Arrangements</p>
            </div>
          </div>
          <div className="text-right text-emerald-100">
            <div className="text-sm leading-relaxed">
              <p className="font-semibold">Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32</p>
              <p>Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
              <p className="mt-2">📞 9849589710</p>
              <p>✉️ 2006sbf@gmail.com</p>
              <p>🌐 www.sbflorist.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-8">

        {/* Invoice Title and Details */}
        <div className="bg-gray-50 border-l-4 border-emerald-600 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h2>
              <p className="text-gray-600">Professional Floral Services</p>
            </div>
            <div className="text-right bg-white p-4 rounded-lg shadow-sm border">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Invoice No:</span> 
                  <span className="text-emerald-600 font-bold ml-2">INV-{order.orderNumber}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Invoice Date:</span> 
                  <span className="ml-2">{formatDate(order.createdAt || order.date)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Order ID:</span> 
                  <span className="ml-2">{order.orderNumber}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-emerald-600 font-bold">👤</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Bill To</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-800 text-lg">{(order.shippingDetails.firstName + ' ' + order.shippingDetails.lastName)}</p>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center"><span className="w-12">✉️</span>{order.shippingDetails.email}</p>
                <p className="flex items-center"><span className="w-12">📞</span>{order.shippingDetails.phone}</p>
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

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold">🚚</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Ship To</h3>
            </div>
            <div className="space-y-3">
              {order.shippingDetails.deliveryOption === 'gift' && order.shippingDetails.receiverFirstName ? (
                <>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{(order.shippingDetails.receiverFirstName + ' ' + (order.shippingDetails.receiverLastName || ''))}</p>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center"><span className="w-12">📞</span>{order.shippingDetails.receiverPhone}</p>
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
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{(order.shippingDetails.firstName + ' ' + order.shippingDetails.lastName)}</p>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center"><span className="w-12">📞</span>{order.shippingDetails.phone}</p>
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

        {/* Delivery Information */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-amber-600 font-bold">🚛</span>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Delivery Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-amber-100">
              <p className="text-amber-600 font-semibold text-sm mb-1">📅 Delivery Date</p>
              <p className="font-bold text-gray-800">{formatDate(order.shippingDetails.deliveryDate)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-100">
              <p className="text-amber-600 font-semibold text-sm mb-1">⏰ Time Slot</p>
              <p className="font-bold text-gray-800">{formatTimeSlot(order.shippingDetails.timeSlot)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-100">
              {order.shippingDetails.notes && (
                <>
                  <p className="text-amber-600 font-semibold text-sm mb-1">📝 Delivery Notes</p>
                  <p className="text-gray-700 text-sm">{order.shippingDetails.notes}</p>
                </>
              )}
              {order.shippingDetails.giftMessage && (
                <>
                  <p className="text-amber-600 font-semibold text-sm mb-1">💝 Gift Message</p>
                  <p className="text-gray-700 text-sm italic">"{order.shippingDetails.giftMessage}"</p>
                </>
              )}
              {!order.shippingDetails.notes && !order.shippingDetails.giftMessage && (
                <>
                  <p className="text-amber-600 font-semibold text-sm mb-1">📋 Status</p>
                  <p className="text-gray-700 text-sm">Standard Delivery</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Details Table */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">📋</span>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Order Details</h3>
          </div>
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Item</th>
                  <th className="px-6 py-4 text-left font-semibold">Description</th>
                  <th className="px-6 py-4 text-right font-semibold">Unit Price</th>
                  <th className="px-6 py-4 text-center font-semibold">Qty</th>
                  <th className="px-6 py-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-emerald-50 transition-colors`}>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-emerald-600 text-lg">🌸</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{item.product.title}</div>
                          <div className="text-xs text-gray-500">Premium Floral Arrangement</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-600">
                      A beautiful arrangement of fresh flowers, elegantly prepared for your special occasion with care and attention to detail.
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-right font-semibold">
                      ₹{new Intl.NumberFormat('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(getINRAmount(item.price))}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-center">
                      <span className="bg-gray-100 px-3 py-1 rounded-full font-semibold">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-right font-bold text-emerald-600">
                      ₹{new Intl.NumberFormat('en-IN', {
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
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">💰</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Payment Summary</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{new Intl.NumberFormat('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(subtotal)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-semibold">₹{new Intl.NumberFormat('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(cgst + sgst)}</span>
                </div>
                
                {shipping > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="font-semibold">₹{new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(shipping)}</span>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL AMOUNT</span>
                    <span className="text-2xl font-bold">₹{new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(grandTotal)}</span>
                  </div>
                  <p className="text-emerald-100 text-sm mt-1">All charges inclusive</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold">💳</span>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Payment Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <p className="text-blue-600 font-semibold text-sm mb-1">Payment Method</p>
              <p className="font-bold text-gray-800">{getPaymentMethod()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <p className="text-blue-600 font-semibold text-sm mb-1">Payment Status</p>
              <p className="font-bold text-green-600">
                {order.paymentDetails.status === 'completed' ? '✅ Completed' : order.paymentDetails.status}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <p className="text-blue-600 font-semibold text-sm mb-1">Transaction ID</p>
              <p className="font-mono text-sm text-gray-700">{getTransactionId()}</p>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-8 rounded-lg text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Thank You for Your Business!</h3>
            <p className="text-gray-300 text-lg">We appreciate your trust in Spring Blossoms Florist</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🏪 Visit Our Store</h4>
              <p className="text-sm text-gray-300">
                Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32<br/>
                Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📞 Contact Us</h4>
              <p className="text-sm text-gray-300">
                Phone: 9849589710<br/>
                Email: 2006sbf@gmail.com<br/>
                Website: www.sbflorist.com
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-600 pt-4">
            <p className="text-gray-400 text-sm">
              Business Hours: Monday - Saturday, 9 AM - 6 PM IST<br/>
              Terms and conditions apply. For returns and refunds, please contact us within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice; 