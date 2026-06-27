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
    <div 
      className="invoice-container bg-white text-slate-800" 
      style={{ 
        width: '190mm', 
        minHeight: '277mm', 
        margin: '0 auto', 
        padding: '0', 
        boxSizing: 'border-box',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: 'relative',
        background: 'white',
        overflow: 'hidden'
      }}
    >
      {/* Brand Header */}
      <div 
        className="flex justify-between items-start" 
        style={{ 
          height: '35mm', 
          width: '100%', 
          marginBottom: '5mm', 
          borderBottom: '2px solid #064e3b',
          paddingBottom: '3mm'
        }}
      >
        <div className="flex items-start gap-3 h-full">
          <div 
            className="rounded-xl flex items-center justify-center border border-emerald-100 text-3xl shadow-sm bg-emerald-50"
            style={{ width: '15mm', height: '15mm' }}
          >
            🌸
          </div>
          <div>
            <h1 className="font-extrabold text-emerald-800 tracking-tight" style={{ fontSize: '26px', lineHeight: '1.1' }}>
              Spring Blossoms Florist
            </h1>
            <p className="font-bold text-amber-600 uppercase tracking-widest mt-0.5" style={{ fontSize: '10px' }}>
              A Reason to Express
            </p>
            <div className="text-slate-500 space-y-0.5 mt-1 leading-normal" style={{ fontSize: '10px' }}>
              <p>Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32</p>
              <p>Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
              <p><strong>GSTIN:</strong> 36AABFS1234Z1Z5 | <strong>Ph:</strong> +91 9949683222</p>
            </div>
          </div>
        </div>

        <div className="text-right h-full flex flex-col justify-between">
          <div 
            className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60 text-left" 
            style={{ width: '65mm' }}
          >
            <h2 className="font-bold text-emerald-800 uppercase tracking-wider border-b-2 border-emerald-800 pb-1 mb-1.5 text-right" style={{ fontSize: '28px' }}>
              TAX INVOICE
            </h2>
            <div className="space-y-0.5 font-medium" style={{ fontSize: '10px' }}>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Invoice No:</span>
                <span className="font-bold text-emerald-800">INV-{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Order Date:</span>
                <span className="text-slate-700">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Delivery Date:</span>
                <span className="text-slate-700">{formatDate(shipping.deliveryDate || order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Shipping Section */}
      <div 
        className="grid grid-cols-2" 
        style={{ 
          gap: '8mm', 
          marginBottom: '6mm',
          width: '100%'
        }}
      >
        {/* Bill To */}
        <div 
          className="border border-slate-200 bg-slate-50/50 rounded-lg p-3 border-l-4 border-l-emerald-800"
          style={{ width: '91mm' }}
        >
          <h3 className="font-bold text-emerald-800 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2" style={{ fontSize: '12px' }}>
            Billing Details
          </h3>
          <p className="font-bold text-slate-800" style={{ fontSize: '11px' }}>
            {order.shippingDetails?.fullName || order.shipping?.fullName || customerName}
          </p>
          <div className="text-slate-600 space-y-1 mt-1" style={{ fontSize: '10px' }}>
            <p><strong>Email:</strong> {customerEmail}</p>
            <p><strong>Phone:</strong> {customerPhone}</p>
            <p className="text-slate-400 mt-1 italic" style={{ fontSize: '9px' }}>Billing Address same as Shipping Address</p>
          </div>
        </div>

        {/* Ship To */}
        <div 
          className="border border-slate-200 bg-slate-50/50 rounded-lg p-3 border-l-4 border-l-amber-500"
          style={{ width: '91mm' }}
        >
          <h3 className="font-bold text-amber-600 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2" style={{ fontSize: '12px' }}>
            {isGift ? 'Gift Recipient Details' : 'Delivery Details'}
          </h3>
          <p className="font-bold text-slate-800" style={{ fontSize: '11px' }}>
            {recipientName}
          </p>
          <div className="text-slate-600 space-y-1 mt-1 leading-relaxed" style={{ fontSize: '10px' }}>
            <p><strong>Phone:</strong> {recipientPhone}</p>
            {isGift && order.giftDetails?.recipientEmail && (
              <p><strong>Email:</strong> {order.giftDetails.recipientEmail}</p>
            )}
            <p><strong>Address:</strong> {recipientAddress}{recipientApartment ? `, ${recipientApartment}` : ''}, {recipientCity}{recipientState ? `, ${recipientState}` : ''} {recipientZip}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-4" style={{ width: '100%' }}>
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr className="bg-emerald-50 text-emerald-800 border-b-2 border-b-emerald-800 text-left font-bold uppercase tracking-wider">
              <th className="px-3 py-2" style={{ width: '55%', fontSize: '11px' }}>Item Description</th>
              <th className="px-3 py-2 text-center" style={{ width: '10%', fontSize: '11px' }}>Qty</th>
              <th className="px-3 py-2 text-right" style={{ width: '15%', fontSize: '11px' }}>Unit Price</th>
              <th className="px-3 py-2 text-right" style={{ width: '20%', fontSize: '11px' }}>Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200" style={{ fontSize: '10px' }}>
            {items.map((item: any, idx: number) => {
              const title = item.product?.title || item.title || 'Florist Arrangement';
              const variantText = item.selectedVariant?.label ? `Variant: ${item.selectedVariant.label}` : 'Premium Arrangement';
              const customText = item.customizations?.messageCard ? `Message Card Included` : '';

              return (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    <div className="font-bold text-slate-900">{title}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{variantText}</div>
                    {customText && <div className="text-[9px] text-amber-700 font-semibold mt-0.5">✨ {customText}</div>}
                    
                    {item.customizations?.isGiftBundle && item.customizations?.giftComponents && (
                      <div className="text-[9px] text-rose-700 bg-rose-50/40 border border-rose-100 rounded-lg p-1.5 mt-1 space-y-0.5">
                        <div className="font-semibold">🎁 Included components:</div>
                        {item.customizations.giftComponents.map((comp: any, cIdx: number) => (
                          <div key={cIdx} className="pl-1.5 text-slate-600 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                            <span className="capitalize font-semibold text-rose-600">{comp.category.replace('_', ' ')}:</span>
                            <span className="truncate">{comp.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-600" style={{ verticalAlign: 'middle' }}>{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-slate-600" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{formatCurrency(item.finalPrice || item.price)}</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{formatCurrency((item.finalPrice || item.price) * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary & Logistics Grid */}
      <div className="flex justify-between items-start mb-4" style={{ width: '100%' }}>
        {/* Logistics details */}
        <div style={{ width: '110mm' }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 bg-white rounded-lg p-2 border-l-2 border-l-blue-500">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-0.5 mb-1">
                Payment Status
              </h4>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                <p><strong>Method:</strong> {paymentMethod}</p>
                <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">● {paymentStatus}</span></p>
                {transactionId && <p className="text-[9px] text-slate-400 mt-0.5 truncate"><strong>TxID:</strong> {transactionId}</p>}
              </div>
            </div>

            <div className="border border-slate-200 bg-white rounded-lg p-2 border-l-2 border-l-purple-500">
              <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider border-b border-slate-100 pb-0.5 mb-1">
                Delivery Logistics
              </h4>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                <p><strong>Date:</strong> {formatDate(shipping.deliveryDate)}</p>
                <p><strong>Slot:</strong> {shipping.timeSlot || 'Standard Delivery'}</p>
              </div>
            </div>
          </div>

          {isGift ? (
            <div className="border border-dashed border-emerald-300 bg-emerald-50/10 rounded-lg p-2.5 space-y-1">
              <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider border-b border-emerald-250 pb-0.5 mb-1 flex items-center gap-1">
                🎁 Gift Options
              </h4>
              <div className="text-[10px] text-slate-700 space-y-1">
                {order.giftDetails?.message && (
                  <p className="italic font-semibold">
                    <strong>Message:</strong> "{order.giftDetails.message}"
                  </p>
                )}
                <p><strong>Greeting Card:</strong> {order.giftDetails?.greetingCard && order.giftDetails.greetingCard !== 'none' ? order.giftDetails.greetingCard : 'None'}</p>
              </div>
            </div>
          ) : (shipping.cardMessage || shipping.giftMessage) ? (
            <div className="border border-dashed border-amber-300 bg-amber-50/30 rounded-lg p-2.5">
              <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider border-b border-amber-200/50 pb-0.5 mb-1">
                💌 Card Message
              </h4>
              <p className="text-[10px] font-medium text-slate-700 italic leading-relaxed">
                "{shipping.cardMessage || shipping.giftMessage}"
              </p>
            </div>
          ) : null}
        </div>

        {/* Pricing summary */}
        <div style={{ width: '70mm' }}>
          <div className="space-y-1.5 text-slate-600" style={{ fontSize: '10px' }}>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-900">
                {order.isFirstOrderFreeDelivery ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  hasDeliveryFee ? formatCurrency(deliveryFee) : 'FREE'
                )}
              </span>
            </div>
            {hasPromo && (
              <div className="flex justify-between text-red-650">
                <span>Promo Discount</span>
                <span className="font-semibold">-{formatCurrency(promoDiscount)}</span>
              </div>
            )}
            <div className="h-[1px] bg-slate-200 my-1"></div>
            <div className="flex justify-between items-center font-bold text-emerald-800 pt-1 border-t-2 border-emerald-800" style={{ fontSize: '12px' }}>
              <span>Grand Total</span>
              <span style={{ fontSize: '14px' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Footer - Flows naturally below the content */}
      <div 
        className="text-center text-slate-500 border-t border-slate-200 pt-3 mt-4 leading-relaxed" 
        style={{ width: '100%', paddingBottom: '3mm' }}
      >
        <h4 className="font-bold text-emerald-800" style={{ fontSize: '10px' }}>
          Thank you for choosing Spring Blossoms Florist.
        </h4>
        <p className="text-slate-400 mt-1.5" style={{ fontSize: '8.5px' }}>
          We design premium floral arrangements and curated gift solutions to make your moments unforgettable.<br />
          For any queries or modifications to your delivery, please contact +91 9949683222 or email contact@sbflorist.in.<br />
          This is a computer-generated tax invoice and requires no signature.
        </p>
      </div>
    </div>
  );
};

export default Invoice;