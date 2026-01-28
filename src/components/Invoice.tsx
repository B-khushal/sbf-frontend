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

  // --- Helper Functions (Kept original logic) ---

  const formatPriceWithCurrency = (amount: number, targetCurrency: string) => {
    return new Intl.NumberFormat(targetCurrency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getINRAmount = (amount: number) => {
    if (order.currency && order.currency !== 'INR' && order.currencyRate) {
      return amount / order.currencyRate;
    } else if (order.currency === 'INR') {
      return amount;
    } else {
      return amount;
    }
  };

  const calculateSubtotal = () => {
    const subtotal = order.items.reduce((sum, item) => sum + item.finalPrice, 0);
    return getINRAmount(subtotal);
  };

  const calculateCGST = (subtotal: number) => subtotal * 0.025; // 2.5% CGST
  const calculateSGST = (subtotal: number) => subtotal * 0.025; // 2.5% SGST
  const calculateShipping = () => getINRAmount(order.shippingFee || 0);

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const cgst = calculateCGST(subtotal);
    const sgst = calculateSGST(subtotal);
    const shipping = calculateShipping();
    return subtotal + cgst + sgst + shipping;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'dd MMM yyyy'); // Slightly more formal date format
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTimeSlot = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return '9:00 AM - 12:00 PM';
      case 'afternoon': return '12:00 PM - 4:00 PM';
      case 'evening': return '4:00 PM - 8:00 PM';
      case 'midnight': return '12:00 AM - 6:00 AM (Midnight Delivery)';
      default: return timeSlot || '7:00 PM - 9:00 PM';
    }
  };

  const getPaymentMethod = () => {
    if (order.paymentDetails.method === 'razorpay') return 'Razorpay / Online';
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
    <div className="w-full bg-gray-100 p-8 print:p-0 min-h-screen flex justify-center">
      {/* A4 Container: 210mm width is standard A4. 
        'print-color-adjust: exact' forces browsers to print background colors.
      */}
      <div 
        className="bg-white shadow-xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] relative flex flex-col"
        style={{ 
          printColorAdjust: 'exact', 
          WebkitPrintColorAdjust: 'exact',
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" 
        }}
      >
        
        {/* Header Section */}
        <div className="bg-emerald-800 text-white p-12 print:p-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <span className="text-2xl">🌸</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-wide">SPRING BLOSSOMS</h1>
                  <p className="text-emerald-200 text-sm tracking-widest uppercase">Florist</p>
                </div>
              </div>
              <div className="text-emerald-100 text-sm leading-relaxed max-w-xs">
                <p>Door No. 12-2-786/A & B, Najam Centre</p>
                <p>Rethi Bowli, Mehdipatnam, Hyderabad</p>
                <p>Telangana 500028</p>
                <p className="mt-2 text-white font-medium">GSTIN: 36AABFS1234Z1Z5</p>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-4xl font-light tracking-tight mb-2 opacity-90">INVOICE</h2>
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <table className="text-right text-sm">
                  <tbody>
                    <tr>
                      <td className="text-emerald-200 pr-4">Invoice No</td>
                      <td className="font-bold">INV-{order.orderNumber}</td>
                    </tr>
                    <tr>
                      <td className="text-emerald-200 pr-4">Date</td>
                      <td className="font-medium">{formatDate(order.createdAt || order.date)}</td>
                    </tr>
                    <tr>
                      <td className="text-emerald-200 pr-4">Order ID</td>
                      <td className="font-medium">{order.orderNumber}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-12 print:p-8 grid grid-cols-2 gap-12 text-sm text-gray-600">
          
          {/* Bill To */}
          <div>
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b-2 border-emerald-100 pb-2 mb-4">
              Billed To
            </h3>
            <p className="text-lg font-bold text-gray-900 mb-1">
              {order.shippingDetails.firstName} {order.shippingDetails.lastName}
            </p>
            <p>{order.shippingDetails.phone}</p>
            <p className="mb-3">{order.shippingDetails.email}</p>
            
            <p className="text-gray-500 font-medium text-xs uppercase mt-2">Billing Address</p>
            <p className="leading-relaxed">
              {order.shippingDetails.address}
              {order.shippingDetails.apartment && <>, {order.shippingDetails.apartment}</>}
              <br />
              {order.shippingDetails.city}, {order.shippingDetails.state} - {order.shippingDetails.zipCode}
            </p>
          </div>

          {/* Ship To */}
          <div>
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b-2 border-emerald-100 pb-2 mb-4">
              Shipped To
            </h3>
            {order.shippingDetails.deliveryOption === 'gift' && order.shippingDetails.receiverFirstName ? (
              <>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {order.shippingDetails.receiverFirstName} {order.shippingDetails.receiverLastName}
                </p>
                <p className="mb-3">Ph: {order.shippingDetails.receiverPhone}</p>
                <p className="leading-relaxed">
                  {order.shippingDetails.receiverAddress}
                  {order.shippingDetails.receiverApartment && <>, {order.shippingDetails.receiverApartment}</>}
                  <br />
                  {order.shippingDetails.receiverCity}, {order.shippingDetails.receiverState} - {order.shippingDetails.receiverZipCode}
                </p>
              </>
            ) : (
              <p className="text-gray-500 italic">Same as Billing Address</p>
            )}

            {/* Delivery Specifics */}
            <div className="mt-6 bg-gray-50 p-3 rounded border border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Delivery Date</span>
                  <span className="font-semibold text-gray-800">{formatDate(order.shippingDetails.deliveryDate)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Time Slot</span>
                  <span className="font-semibold text-gray-800">{formatTimeSlot(order.shippingDetails.timeSlot)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-12 print:px-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="py-3 px-4 text-left rounded-l-md w-12">#</th>
                <th className="py-3 px-4 text-left">Item Description</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right rounded-r-md">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 px-4 text-gray-400">{index + 1}</td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">{item.product.title}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Premium Floral Arrangement</p>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(getINRAmount(item.price))}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(getINRAmount(item.finalPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Notes Section */}
        <div className="px-12 print:px-8 mt-4 mb-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            
            {/* Left Column: Notes & Payment Info */}
            <div className="flex-1 space-y-6">
              {(order.shippingDetails.notes || order.shippingDetails.giftMessage) && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm">
                   {order.shippingDetails.notes && (
                     <div className="mb-2">
                       <p className="text-amber-800 font-bold text-xs uppercase mb-1">Delivery Instructions</p>
                       <p className="text-gray-700 italic">"{order.shippingDetails.notes}"</p>
                     </div>
                   )}
                   {order.shippingDetails.giftMessage && (
                     <div>
                       <p className="text-amber-800 font-bold text-xs uppercase mb-1">Gift Message</p>
                       <p className="text-gray-700 italic font-serif text-lg">"{order.shippingDetails.giftMessage}"</p>
                     </div>
                   )}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-semibold text-gray-700">Payment Method:</span> {getPaymentMethod()}</p>
                <p><span className="font-semibold text-gray-700">Transaction ID:</span> {getTransactionId()}</p>
                <p><span className="font-semibold text-gray-700">Payment Status:</span> {order.paymentDetails.status}</p>
              </div>
            </div>

            {/* Right Column: Calculation */}
            <div className="w-full md:w-72">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (2.5%)</span>
                  <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%)</span>
                  <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(sgst)}</span>
                </div>
                {shipping > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(shipping)}</span>
                  </div>
                )}
                
                <div className="h-px bg-gray-200 my-4"></div>
                
                <div className="flex justify-between items-end bg-emerald-50 p-3 rounded -mx-3 border border-emerald-100">
                  <span className="font-bold text-emerald-800">Total</span>
                  <span className="font-bold text-xl text-emerald-800">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-8 print:p-6 text-center text-xs text-gray-500 mt-8">
          <p className="font-medium text-gray-700 mb-2">Thank you for choosing Spring Blossoms Florist!</p>
          <p>Questions? Contact us at +91 9849589710 or 2006sbf@gmail.com</p>
          <p>www.sbflorist.com</p>
        </div>
        
        {/* Bottom Decorative Line */}
        <div className="h-2 bg-gradient-to-r from-emerald-600 to-emerald-800"></div>
      </div>
    </div>
  );
};

export default Invoice;