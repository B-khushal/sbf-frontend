import React from 'react';
import { format } from 'date-fns';

interface InvoiceProps {
  order: any;
  isAdmin?: boolean;
}

const Invoice: React.FC<InvoiceProps> = ({ order, isAdmin = false }) => {
  if (!order) return null;

  // Resolve shipping / delivery structure
  const shipping = order.shippingDetails || order.shipping || {};
  
  // Resolve customer details
  const customerName = shipping.fullName || shipping.firstName 
    ? `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim()
    : 'Valued Customer';
  
  const customerEmail = shipping.email || order.user?.email || 'N/A';
  const customerPhone = shipping.phone || order.user?.phone || 'N/A';

  // Resolve gift vs standard delivery details
  const isGift = !!(order.giftDetails && order.giftDetails.recipientName && order.giftDetails.recipientName.trim() !== '');
  
  const recipientName = isGift
    ? (order.giftDetails?.recipientName || `${shipping.receiverFirstName || ''} ${shipping.receiverLastName || ''}`.trim() || customerName)
    : customerName;
  
  const recipientPhone = isGift
    ? (order.giftDetails?.recipientPhone || shipping.receiverPhone || 'N/A')
    : customerPhone;
  
  const recipientAddress = isGift
    ? (order.giftDetails?.recipientAddress || shipping.receiverAddress || 'N/A')
    : (shipping.address || 'N/A');
  
  const recipientApartment = isGift
    ? (order.giftDetails?.recipientApartment || shipping.receiverApartment)
    : (shipping.apartment);
  
  const recipientCity = isGift
    ? (order.giftDetails?.recipientCity || shipping.receiverCity || '')
    : (shipping.city || '');
  
  const recipientState = isGift
    ? (order.giftDetails?.recipientState || shipping.receiverState || '')
    : (shipping.state || '');
  
  const recipientZip = isGift
    ? (order.giftDetails?.recipientZipCode || shipping.receiverZipCode || '')
    : (shipping.zipCode || '');

  // Resolve payment details
  const payment = order.paymentDetails || order.payment || {};
  const paymentMethod = payment.method === 'razorpay' 
    ? 'Razorpay (Online Payment)' 
    : (payment.method || 'Online Payment');
  const paymentStatus = payment.status || 'Completed';
  const transactionId = payment.razorpayPaymentId || payment.paymentId || payment.transactionId || '';

  // Resolve items list
  const items = order.items || [];

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    const currencyCode = order.currency || 'INR';
    return new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Safe date formatting helper
  const formatDate = (dateStr: string | undefined | Date) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  // Pricing calculations
  const itemsSubtotal = order.subtotal || items.reduce((sum: number, item: any) => {
    return sum + ((item.finalPrice || item.price || 0) * item.quantity);
  }, 0);

  const deliveryFee = order.deliveryFee || order.shippingFee || shipping.deliveryFee || 0;
  const promoDiscount = order.promoCode?.discount || order.discountAmount || 0;
  const hasDeliveryFee = deliveryFee > 0;
  const hasPromo = promoDiscount > 0;
  const grandTotal = order.totalAmount || order.total || (itemsSubtotal + deliveryFee - promoDiscount);

  return (
    <div className="bg-white text-slate-800 max-w-4xl mx-auto p-8" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Brand Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-3xl shadow-sm">
            🌸
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-800 tracking-tight">Spring Blossoms Florist</h1>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-0.5">Premium Floral Arrangements & Gifts</p>
            <div className="text-[11px] text-slate-500 space-y-0.5 mt-1.5 leading-relaxed">
              <p>Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32</p>
              <p>Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
              <p><strong>GSTIN:</strong> 36AABFS1234Z1Z5 | <strong>Ph:</strong> +91 9949683222</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 inline-block text-left min-w-[200px]">
            <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider border-b-2 border-emerald-800 pb-1.5 mb-2 text-right">TAX INVOICE</h2>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Invoice No:</span>
                <span className="font-bold text-emerald-800">INV-{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Order Date:</span>
                <span className="font-semibold text-slate-700">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Delivery Date:</span>
                <span className="font-semibold text-slate-700">{formatDate(shipping.deliveryDate || order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Border */}
      <div className="h-1 bg-emerald-800 rounded mb-0.5"></div>
      <div className="h-[1px] bg-amber-500 mb-6"></div>

      {/* Billing & Shipping Information Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Bill To */}
        <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-5 border-l-4 border-l-emerald-850">
          <h3 className="text-xs font-bold text-emerald-850 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">
            Customer / Billing Details
          </h3>
          <p className="text-sm font-bold text-slate-800">
            {order.shippingDetails?.fullName || order.shipping?.fullName || customerName}
          </p>
          <div className="text-xs text-slate-600 space-y-1.5 mt-2">
            <p><strong>Email:</strong> {customerEmail}</p>
            <p><strong>Phone:</strong> {customerPhone}</p>
            <p className="text-[10px] text-slate-400 mt-1 italic">Billing Address same as Shipping Address</p>
          </div>
        </div>

        {/* Ship To */}
        <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-5 border-l-4 border-l-amber-500">
          <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">
            {isGift ? 'Gift Recipient Details' : 'Delivery Details (Not a Gift)'}
          </h3>
          <p className="text-sm font-bold text-slate-800">
            {recipientName}
          </p>
          <div className="text-xs text-slate-600 space-y-1 mt-2 leading-relaxed">
            <p><strong>Phone:</strong> {recipientPhone}</p>
            {isGift && order.giftDetails?.recipientEmail && (
              <p><strong>Email:</strong> {order.giftDetails.recipientEmail}</p>
            )}
            <p><strong>Address:</strong> {recipientAddress}{recipientApartment ? `, ${recipientApartment}` : ''}, {recipientCity}{recipientState ? `, ${recipientState}` : ''} {recipientZip}</p>
            {!isGift && (
              <p className="text-[10px] text-slate-400 mt-1 italic">This order will be delivered to the customer.</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-emerald-50 text-emerald-800 border-b-2 border-b-emerald-800 text-left text-xs font-bold uppercase tracking-wider">
              <th className="px-5 py-3">Item Description</th>
              <th className="px-5 py-3 text-center w-20">Qty</th>
              <th className="px-5 py-3 text-right w-32">Unit Price</th>
              <th className="px-5 py-3 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {items.map((item: any, idx: number) => {
              const title = item.product?.title || item.title || 'Florist Arrangement';
              const variantText = item.selectedVariant?.label ? `Variant: ${item.selectedVariant.label}` : 'Premium Arrangement';
              const customText = item.customizations?.messageCard ? `Message Card Included` : '';

              return (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{variantText}</div>
                    {customText && <div className="text-[9px] text-amber-700 font-semibold mt-0.5">✨ {customText}</div>}
                    
                    {item.customizations?.isGiftBundle && item.customizations?.giftComponents && (
                      <div className="text-[10px] text-rose-700 bg-rose-50/40 border border-rose-100 rounded-lg p-2 mt-1.5 space-y-0.5">
                        <div className="font-semibold">🎁 Included components:</div>
                        {item.customizations.giftComponents.map((comp: any, cIdx: number) => (
                          <div key={cIdx} className="pl-1.5 text-slate-600 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                            <span className="capitalize font-semibold text-rose-600">{comp.category.replace('_', ' ')}:</span>
                            <span className="truncate">{comp.name}</span>
                          </div>
                        ))}
                        {item.customizations.customMessage && (
                          <div className="text-[10px] italic text-slate-500 border-t border-rose-100/30 pt-1 mt-1 pl-1.5">
                            Card Message: "{item.customizations.customMessage}"
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{formatCurrency(item.finalPrice || item.price)}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">{formatCurrency((item.finalPrice || item.price) * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Metadata Grid */}
      <div className="grid grid-cols-5 gap-6 items-start">
        {/* Payment & Delivery Logistics */}
        <div className="col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 bg-white rounded-xl p-3 border-l-2 border-l-blue-500">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1 mb-1.5">
                Payment Status
              </h4>
              <div className="text-[11px] text-slate-700 space-y-0.5">
                <p><strong>Method:</strong> {paymentMethod}</p>
                <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">● {paymentStatus}</span></p>
                {transactionId && <p className="text-[9px] text-slate-400 mt-1 truncate"><strong>TxID:</strong> {transactionId}</p>}
              </div>
            </div>

            <div className="border border-slate-200 bg-white rounded-xl p-3 border-l-2 border-l-purple-500">
              <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider border-b border-slate-100 pb-1 mb-1.5">
                Delivery Logistics
              </h4>
              <div className="text-[11px] text-slate-700 space-y-0.5">
                <p><strong>Date:</strong> {formatDate(shipping.deliveryDate)}</p>
                <p><strong>Slot:</strong> {shipping.timeSlot || 'Standard Delivery'}</p>
                {(shipping.deliverySpecialInstructions || shipping.notes) && (
                  <p className="mt-1 text-[10px] text-slate-500 italic">
                    <strong>Instructions:</strong> {shipping.deliverySpecialInstructions || shipping.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {isGift ? (
            <div className="border border-dashed border-emerald-300 bg-emerald-50/10 rounded-xl p-3.5 space-y-2">
              <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider border-b border-emerald-250 pb-1 mb-1.5 flex items-center gap-1">
                🎁 Gift Delivery Options
              </h4>
              <div className="text-xs text-slate-700 space-y-1.5">
                {order.giftDetails?.message && (
                  <p className="italic font-semibold">
                    <strong>Message:</strong> "{order.giftDetails.message}"
                  </p>
                )}
                <p><strong>Greeting Card:</strong> {order.giftDetails?.greetingCard && order.giftDetails.greetingCard !== 'none' ? order.giftDetails.greetingCard : 'None'}</p>
                <p><strong>Surprise Delivery:</strong> {order.giftDetails?.surpriseDelivery ? 'Yes' : 'No'}</p>
                <p><strong>Anonymous Gift:</strong> {order.giftDetails?.anonymousGift ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ) : (shipping.cardMessage || shipping.giftMessage) ? (
            <div className="border border-dashed border-amber-300 bg-amber-50/30 rounded-xl p-3.5">
              <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider border-b border-amber-200/50 pb-1 mb-1.5">
                💌 Card Message
              </h4>
              <p className="text-xs font-medium text-slate-700 italic leading-relaxed">
                "{shipping.cardMessage || shipping.giftMessage}"
              </p>
            </div>
          ) : null}
        </div>

        {/* Pricing Summary */}
        <div className="col-span-2">
          <div className="space-y-2.5 text-xs text-slate-600 pr-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-900">
                {order.isFirstOrderFreeDelivery ? (
                  <span className="text-emerald-700">
                    FREE ({formatCurrency((shipping.timeSlot === 'midnight' ? 300 : 150) * (order.currencyRate || 1))} waived)
                  </span>
                ) : (
                  hasDeliveryFee ? formatCurrency(deliveryFee) : 'FREE'
                )}
              </span>
            </div>
            {hasPromo && (
              <div className="flex justify-between text-red-600">
                <span>Promo Discount {order.promoCode?.code ? `(${order.promoCode.code})` : ''}</span>
                <span className="font-semibold">-{formatCurrency(promoDiscount)}</span>
              </div>
            )}
            <div className="h-[1px] bg-slate-200 my-1"></div>
            <div className="flex justify-between items-center text-sm font-bold text-emerald-800 pt-1 border-t-2 border-emerald-800">
              <span>Grand Total</span>
              <span className="text-base">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Footer */}
      <div className="text-center text-slate-500 border-t border-slate-200 pt-5 mt-8 leading-relaxed">
        <h4 className="text-xs font-bold text-emerald-850">Thank you for choosing Spring Blossoms Florist.</h4>
        <p className="text-[10px] text-slate-400 mt-1.5">
          We design premium floral arrangements and curated gift solutions to make your moments unforgettable.<br />
          For any queries or modifications to your delivery, please contact +91 9949683222 or email contact@sbflorist.in.<br />
          This is a computer-generated tax invoice and requires no signature.
        </p>
      </div>
    </div>
  );
};

export default Invoice;