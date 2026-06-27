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
    <div className="invoice-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .invoice-container {
          width: 190mm;
          min-height: 277mm;
          margin: 0 auto;
          padding: 0;
          box-sizing: border-box;
          background: white;
          overflow: hidden;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #334155;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .invoice-header {
          height: 35mm;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #064e3b;
          padding-bottom: 4mm;
          margin-bottom: 6mm;
          box-sizing: border-box;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 5mm;
        }

        .header-logo {
          font-size: 38px;
          line-height: 1;
        }

        .company-name {
          font-size: 26px;
          font-weight: 800;
          color: #064e3b;
          line-height: 1.1;
          margin-bottom: 2px;
        }

        .company-tagline {
          font-size: 11px;
          font-weight: 700;
          color: #c5a880;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .company-info {
          font-size: 11px;
          color: #64748b;
          line-height: 1.3;
        }

        .header-right-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          padding: 10px 12px;
          width: 70mm;
          box-sizing: border-box;
        }

        .invoice-title {
          font-size: 28px;
          font-weight: 850;
          color: #064e3b;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid #064e3b;
          padding-bottom: 4px;
          margin-bottom: 6px;
          text-align: right;
        }

        .invoice-meta-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        .invoice-meta-table td {
          padding: 2px 0;
        }

        .invoice-meta-label {
          color: #64748b;
          font-weight: 600;
        }

        .invoice-meta-value {
          font-weight: 700;
          color: #334155;
          text-align: right;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm;
          margin-bottom: 6mm;
        }

        .details-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .card-title {
          font-size: 12px;
          font-weight: 700;
          color: #064e3b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
        }

        .card-content-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .card-content-details {
          font-size: 11px;
          color: #475569;
          line-height: 1.45;
        }

        .product-table-container {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 6mm;
        }

        .product-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }

        .product-table th {
          background-color: #f0fdf4;
          border-bottom: 2px solid #064e3b;
          padding: 10px 12px;
          font-weight: 700;
          color: #064e3b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 11px;
          vertical-align: middle;
        }

        .col-desc { width: 55%; text-align: left; }
        .col-qty { width: 10%; text-align: center; }
        .col-price { width: 15%; text-align: right; }
        .col-total { width: 20%; text-align: right; }

        .product-title {
          font-weight: 700;
          color: #0f172a;
          word-break: break-word;
        }

        .product-variant {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }

        .product-custom {
          font-size: 9px;
          color: #b45309;
          font-weight: 600;
          margin-top: 1px;
        }

        .summary-and-logistics {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8mm;
          margin-bottom: 6mm;
        }

        .logistics-block {
          width: 110mm;
          display: flex;
          flex-direction: column;
          gap: 3mm;
        }

        .logistics-card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f8fafc;
          padding: 10px 12px;
        }

        .summary-block {
          width: 70mm;
          display: flex;
          flex-direction: column;
          font-size: 11px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          color: #64748b;
          font-weight: 500;
        }

        .summary-row-grand {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-top: 2px solid #064e3b;
          font-weight: 700;
          font-size: 14px;
          color: #064e3b;
          margin-top: 4px;
        }

        .invoice-footer {
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          margin-top: auto; /* Push to bottom naturally */
        }

        .footer-thankyou {
          font-weight: 700;
          color: #064e3b;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .footer-text {
          font-size: 8.5px;
          color: #94a3b8;
          line-height: 1.4;
        }
      ` }} />

      {/* Main Container Content */}
      <div className="invoice-header">
        <div className="header-left">
          <div className="header-logo">🌸</div>
          <div>
            <div className="company-name">Spring Blossoms Florist</div>
            <div className="company-tagline">A Reason to Express</div>
            <div className="company-info">
              Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32,<br />
              Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028<br />
              <strong>GSTIN:</strong> 36AABFS1234Z1Z5 | <strong>Ph:</strong> +91 9949683222
            </div>
          </div>
        </div>
        <div className="header-right-card">
          <div className="invoice-title">TAX INVOICE</div>
          <table className="invoice-meta-table">
            <tbody>
              <tr>
                <td className="invoice-meta-label">Invoice No:</td>
                <td className="invoice-meta-value">INV-{order.orderNumber}</td>
              </tr>
              <tr>
                <td className="invoice-meta-label">Order Date:</td>
                <td className="invoice-meta-value">{formatDate(order.createdAt)}</td>
              </tr>
              <tr>
                <td className="invoice-meta-label">Delivery Date:</td>
                <td className="invoice-meta-value">{formatDate(shipping.deliveryDate || order.createdAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card" style={{ borderLeft: '3px solid #064e3b' }}>
          <div className="card-title">Billing Details</div>
          <div className="card-content-title">{order.shippingDetails?.fullName || order.shipping?.fullName || customerName}</div>
          <div className="card-content-details">
            <strong>Email:</strong> {customerEmail}<br />
            <strong>Phone:</strong> {customerPhone}<br />
            <strong>Billing Address:</strong> Same as Shipping Address
          </div>
        </div>
        <div className="details-card" style={{ borderLeft: '3px solid #c5a880' }}>
          <div className="card-title">{isGift ? 'Delivery Recipient (Gift)' : 'Delivery Address'}</div>
          <div className="card-content-title">{recipientName}</div>
          <div className="card-content-details">
            <strong>Phone:</strong> {recipientPhone}<br />
            <strong>Address:</strong> {recipientAddress}{recipientApartment ? `, ${recipientApartment}` : ''}, {recipientCity}{recipientState ? `, ${recipientState}` : ''} {recipientZip}
          </div>
        </div>
      </div>

      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th className="col-desc">Item Description</th>
              <th className="col-qty">Qty</th>
              <th className="col-price">Unit Price</th>
              <th className="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => {
              const title = item.product?.title || item.title || 'Florist Arrangement';
              const variantText = item.selectedVariant?.label ? `Variant: ${item.selectedVariant.label}` : 'Premium Arrangement';
              const customText = item.customizations?.messageCard ? `Message Card Included` : '';
              return (
                <tr key={idx}>
                  <td className="col-desc">
                    <div className="product-title">{title}</div>
                    <div className="product-variant">{variantText}</div>
                    {customText && <div className="product-custom">✨ {customText}</div>}
                    {item.customizations?.isGiftBundle && item.customizations?.giftComponents && (
                      <div style={{ fontSize: '10px', color: '#be123c', marginTop: '6px' }}>
                        <strong>🎁 Included components:</strong>
                        {item.customizations.giftComponents.map((comp: any, cIdx: number) => (
                          <div key={cIdx} style={{ paddingLeft: '6px' }}>• {comp.name}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="col-qty">{item.quantity}</td>
                  <td className="col-price">{formatCurrency(item.finalPrice || item.price)}</td>
                  <td className="col-total" style={{ fontWeight: 700 }}>{formatCurrency((item.finalPrice || item.price) * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="summary-and-logistics">
        <div className="logistics-block">
          <div style={{ display: 'flex', gap: '4mm' }}>
            <div className="logistics-card" style={{ flex: 1, borderLeft: '2px solid #3b82f6' }}>
              <div className="card-title" style={{ fontSize: '10px', color: '#3b82f6', borderBottom: '1px solid #eff6ff', marginBottom: '4px', paddingBottom: '2px' }}>Payment Status</div>
              <div style={{ fontSize: '10px', lineHeight: 1.4 }}>
                <strong>Method:</strong> {paymentMethod}<br />
                <strong>Status:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>● {paymentStatus}</span>
                {transactionId && <div style={{ fontSize: '8.5px', color: '#64748b', wordBreak: 'break-all', marginTop: '4px' }}>TxID: {transactionId}</div>}
              </div>
            </div>
            <div className="logistics-card" style={{ flex: 1, borderLeft: '2px solid #8b5cf6' }}>
              <div className="card-title" style={{ fontSize: '10px', color: '#8b5cf6', borderBottom: '1px solid #f5f3ff', marginBottom: '4px', paddingBottom: '2px' }}>Delivery Logistics</div>
              <div style={{ fontSize: '10px', lineHeight: 1.4 }}>
                <strong>Date:</strong> {formatDate(shipping.deliveryDate)}<br />
                <strong>Slot:</strong> {shipping.timeSlot || 'Standard Delivery'}
              </div>
            </div>
          </div>
          {(shipping.cardMessage || shipping.giftMessage || order.giftDetails?.message) && (
            <div className="logistics-card" style={{ border: '1px dashed #c5a880', background: '#fffdf5' }}>
              <div className="card-title" style={{ fontSize: '10px', color: '#c5a880', borderBottom: '1px dashed #fed7aa', marginBottom: '4px', paddingBottom: '2px' }}>💌 Card Message</div>
              <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#475569', lineHeight: 1.3 }}>
                "{shipping.cardMessage || shipping.giftMessage || order.giftDetails?.message}"
              </div>
            </div>
          )}
        </div>

        <div className="summary-block">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(itemsSubtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee:</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>
              {order.isFirstOrderFreeDelivery ? 'FREE' : (hasDeliveryFee ? formatCurrency(deliveryFee) : 'FREE')}
            </span>
          </div>
          {hasPromo && (
            <div className="summary-row" style={{ color: '#dc2626' }}>
              <span>Promo Discount:</span>
              <span style={{ fontWeight: 600 }}>-{formatCurrency(promoDiscount)}</span>
            </div>
          )}
          <div className="summary-row-grand">
            <span>Grand Total:</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="invoice-footer">
        <div className="footer-thankyou">Thank you for choosing Spring Blossoms Florist.</div>
        <div className="footer-text">
          We design premium floral arrangements and curated gift solutions to make your moments unforgettable.<br />
          For any queries or modifications to your delivery, please contact +91 9949683222 or email contact@sbflorist.in.<br />
          This is a computer-generated tax invoice and requires no signature.
        </div>
      </div>
    </div>
  );
};

export default Invoice;