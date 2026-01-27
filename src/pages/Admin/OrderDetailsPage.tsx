import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Order } from '@/services/orderService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';
import { Download, Camera, Hash, MessageSquare, Flower2, Gift } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useToast } from '@/hooks/use-toast';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice, convertPrice, currency } = useCurrency();

  // Helper function to format price with specific currency
  const formatPriceWithCurrency = (amount: number, targetCurrency: string) => {
    return new Intl.NumberFormat(targetCurrency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to handle currency display based on order's original currency
  const displayOrderPrice = (amount: number, orderCurrency?: string, orderRate?: number) => {
    // Always convert and display in the current selected currency
    let finalAmount = amount;
    
    if (orderCurrency && orderCurrency !== currency) {
      // Order is in different currency, need to convert
      if (orderCurrency === 'INR' && currency !== 'INR') {
        // Convert from INR to selected currency (e.g., INR 1000 → USD 11.62)
        finalAmount = convertPrice(amount);
      } else if (orderCurrency !== 'INR' && currency === 'INR') {
        // Convert from foreign currency to INR (e.g., USD 32 → INR 2770.415)
        if (orderRate) {
          // orderRate is the rate when the order was placed (e.g., USD rate = 0.01162)
          // To convert USD to INR: USD amount ÷ USD rate = INR amount
          finalAmount = amount / orderRate;
        } else {
          // Fallback: use current USD to INR rate
          finalAmount = amount / 0.01162; // USD to INR
        }
      } else if (orderCurrency !== 'INR' && currency !== 'INR') {
        // Convert from one foreign currency to another via INR
        if (orderRate) {
          const amountInINR = amount / orderRate;
          finalAmount = convertPrice(amountInINR);
        }
      }
    } else if (!orderCurrency) {
      // No order currency specified, assume INR and convert
      finalAmount = convertPrice(amount);
    }
    
    // Format in the current selected currency
    return formatPriceWithCurrency(finalAmount, currency);
  };
  const orderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleDownloadImage = (url: string, title: string) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${title.replace(/\s+/g, '_')}.jpg`;
        link.click();
      });
  };

  const handleDownloadPDF = () => {
    if (orderRef.current) {
      html2pdf().from(orderRef.current).set({
        margin: 0.5,
        filename: `order-${order?.orderNumber}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).save();
    }
  };

  const testDeliveryEmail = async () => {
    if (!order) return;

    try {
      toast({
        title: "Testing Email",
        description: `Testing delivery email for order ${order.orderNumber}...`,
      });

      const response = await api.post('/orders/test-delivery-email', { 
        orderId: order._id 
      });

      if (response.data.success) {
        toast({
          title: "✅ Email Test Successful",
          description: `Test email sent to ${response.data.customerEmail}`,
        });
      } else {
        toast({
          title: "❌ Email Test Failed",
          description: response.data.message || "Failed to send test email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing delivery email:', error);
      toast({
        title: "❌ Email Test Failed",
        description: error.response?.data?.message || "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Button variant="outline" onClick={() => navigate('/admin/orders')} className="mb-4">&larr; Back to Orders</Button>
      <div className="flex justify-end mb-4 gap-2">
        <Button variant="secondary" onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" /> Download Order as PDF
        </Button>
        <Button 
          variant="outline" 
          onClick={testDeliveryEmail}
          className="gap-2"
        >
          📧 Test Delivery Email
        </Button>
      </div>
      <Card ref={orderRef} id="order-details-pdf">
        <CardHeader>
          <CardTitle>Order #{order.orderNumber}</CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{order.status}</Badge>
            <span className="text-xs text-gray-500">Placed: {format(new Date(order.createdAt), 'PPpp')}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Delivery Address</h3>
            <div className="bg-gray-50 p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {order.shippingDetails.notes?.toLowerCase().includes('gift') ? '🎁 Gift Delivery' : '📦 Deliver to Myself'}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div><strong>Recipient:</strong> {order.shippingDetails.fullName}</div>
                <div><strong>Email:</strong> {order.shippingDetails.email}</div>
                <div><strong>Phone:</strong> {order.shippingDetails.phone}</div>
                <div><strong>Address:</strong></div>
                <div className="ml-4">
                  {order.shippingDetails.address}
                  {order.shippingDetails.apartment && <div>{order.shippingDetails.apartment}</div>}
                  <div>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</div>
                </div>
                {order.shippingDetails.notes && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <strong>Notes:</strong> {order.shippingDetails.notes}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-600">
                  <div><strong>Delivery Date:</strong> {format(new Date(order.shippingDetails.deliveryDate), 'PPP')}</div>
                  <div><strong>Time Slot:</strong> {order.shippingDetails.timeSlot}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <ul className="space-y-4">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex gap-4 items-center border-b pb-4">
                  <div className="relative">
                    {item.product.images && item.product.images.length > 0 && (
                      <>
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 bg-white/80 hover:bg-white"
                          onClick={() => handleDownloadImage(item.product.images[0], item.product.title)}
                          title="Download Image"
                        >
                          <Download className="h-4 w-4 text-blue-600" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-lg">{item.product.title}</div>
                    <div className="text-xs text-gray-500">Product ID: {item.product._id}</div>
                    <div className="text-sm">Qty: {item.quantity}</div>
                    <div className="text-sm">
                      Price: {displayOrderPrice(item.price, order?.currency, order?.currencyRate)}
                      {item.finalPrice !== item.price && (
                        <span className="ml-2 text-green-600">Final: {displayOrderPrice(item.finalPrice, order?.currency, order?.currencyRate)}</span>
                      )}
                    </div>
                    {/* Customizations */}
                    <div className="mt-2">
                      <div className="font-semibold text-purple-700 flex items-center gap-2">
                        🎨 Customization Details
                      </div>
                      {item.customizations ? (
                        <div className="space-y-1 mt-1 text-xs">
                          {item.customizations.photo && (
                            <div className="flex items-center gap-2 text-blue-700">
                              📸 <span>Photo uploaded</span>
                              <a href={item.customizations.photo} download className="underline ml-2" target="_blank" rel="noopener noreferrer">Download</a>
                            </div>
                          )}
                          {item.customizations.number && (
                            <div className="flex items-center gap-2 text-green-700">
                              🔢 <span>Number: {item.customizations.number}</span>
                            </div>
                          )}
                          {item.customizations.messageCard && (
                            <div className="flex items-center gap-2 text-yellow-700">
                              ✍ <span>Message: {item.customizations.messageCard}</span>
                            </div>
                          )}
                          {item.customizations.selectedFlowers && item.customizations.selectedFlowers.length > 0 && (
                            <div className="flex items-center gap-2 text-pink-700">
                              🌸 <span>
                                {item.customizations.selectedFlowers.reduce((total: number, f: any) => total + (f.quantity || 1), 0)} flower add-on(s):
                                {item.customizations.selectedFlowers.map((f: any) => `${f.name}${(f.quantity || 1) > 1 ? `×${f.quantity || 1}` : ''}`).join(', ')}
                              </span>
                            </div>
                          )}
                          {item.customizations.selectedChocolates && item.customizations.selectedChocolates.length > 0 && (
                            <div className="flex items-center gap-2 text-orange-700">
                              🍫 <span>
                                {item.customizations.selectedChocolates.reduce((total: number, c: any) => total + (c.quantity || 1), 0)} chocolate add-on(s):
                                {item.customizations.selectedChocolates.map((c: any) => `${c.name}${(c.quantity || 1) > 1 ? `×${c.quantity || 1}` : ''}`).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-1">No customization applied for this order.</div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Total</h3>
            <div className="text-lg font-bold">{displayOrderPrice(order.totalAmount, order?.currency, order?.currencyRate)}</div>
            {order.currency && order.currency !== currency && (
              <div className="text-xs text-gray-500">
                Originally {formatPriceWithCurrency(order.totalAmount, order.currency)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Payment</h3>
            <div>Method: {order.paymentDetails.method}</div>
            {order.paymentDetails.razorpayOrderId && (
              <div>Razorpay Order ID: {order.paymentDetails.razorpayOrderId}</div>
            )}
            {order.paymentDetails.razorpayPaymentId && (
              <div>Razorpay Payment ID: {order.paymentDetails.razorpayPaymentId}</div>
            )}
            {order.paymentDetails.razorpaySignature && (
              <div>Razorpay Signature: {order.paymentDetails.razorpaySignature}</div>
            )}
          </div>
          {/* Delivery Info Section */}
          {order.trackingHistory && order.trackingHistory.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Delivery & Tracking History</h3>
              <ul className="space-y-2">
                {order.trackingHistory.map((track, idx) => (
                  <li key={idx} className="border rounded p-2 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{track.status.replace(/_/g, ' ')}</Badge>
                      <span className="text-xs text-gray-500">{format(new Date(track.timestamp), 'PPpp')}</span>
                    </div>
                    {track.message && <div className="text-sm mt-1">{track.message}</div>}
                    {track.updatedBy && <div className="text-xs text-gray-400">Updated by: {track.updatedBy}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;