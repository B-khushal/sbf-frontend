import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ShoppingBag, Truck, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useCart from '@/hooks/use-cart';
import { TimeSlot } from '@/components/TimeSlotSelector';
import { useCurrency } from '@/contexts/CurrencyContext';
import Invoice from '@/components/Invoice';
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { Order, InvoiceOrder } from '@/types/invoice';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { useNotification } from '@/contexts/NotificationContext';
import api from '@/services/api';

const DEFAULT_TIME_SLOTS: { [key: string]: TimeSlot } = {
  'morning': {
    id: 'morning',
    label: 'Morning',
    time: '9:00 AM - 12:00 PM',
    available: true
  },
  'afternoon': {
    id: 'afternoon',
    label: 'Afternoon',
    time: '1:00 PM - 4:00 PM',
    available: true
  },
  'evening': {
    id: 'evening',
    label: 'Evening',
    time: '5:00 PM - 8:00 PM',
    available: true
  }
};

const CheckoutConfirmationPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
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
  const displayPrice = (amount: number, orderCurrency?: string, orderRate?: number) => {
    // If order has currency information and it's different from current currency
    if (orderCurrency && orderRate && orderCurrency !== currency) {
      // Convert from order currency to current currency
      if (orderCurrency === 'INR') {
        // Order was in INR, convert to current currency
        const convertedAmount = convertPrice(amount);
        return formatPriceWithCurrency(convertedAmount, currency);
      } else {
        // Order was in non-INR, first convert back to INR, then to current currency
        const amountInINR = amount / orderRate;
        const convertedAmount = convertPrice(amountInINR);
        return formatPriceWithCurrency(convertedAmount, currency);
      }
    } else if (orderCurrency && orderCurrency === currency) {
      // Order currency matches current currency, no conversion needed
      return formatPriceWithCurrency(amount, orderCurrency);
    } else if (orderCurrency) {
      // Order has currency info, use that currency for display
      return formatPriceWithCurrency(amount, orderCurrency);
    } else {
      // No order currency info, treat as INR and convert to current currency
      const convertedAmount = convertPrice(amount);
      return formatPriceWithCurrency(convertedAmount, currency);
    }
  };
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  
  const [isOrderDataFetched, setIsOrderDataFetched] = useState(false);
  
  const { user } = useAuth();
  
  // Reference to track redirect attempts
  const redirectAttempted = useRef<boolean>(false);
  
  const [fromPayment, setFromPayment] = useState<boolean>(false);
  
  const [notificationSent, setNotificationSent] = useState(false);
  const { addNotification } = useNotification();
  
  // First useEffect for authentication and order processing
  useEffect(() => {
    console.log('CheckoutConfirmationPage: Initializing...');
    
    // Check if coming from payment page
    const fromPaymentFlag = sessionStorage.getItem("from_payment");
    setFromPayment(fromPaymentFlag === "true");
    
    // Set confirmation visited flag
    sessionStorage.setItem("confirmation_visited", "true");
    
    // Auth restoration logic
    try {
      // Check for auth_data in sessionStorage
      const authDataString = sessionStorage.getItem('auth_data');
      
      if (authDataString) {
        console.log('CheckoutConfirmationPage: Found auth_data in sessionStorage');
        const authData = JSON.parse(authDataString);
        
        // Restore token if present
        if (authData.t) {
          localStorage.setItem('token', authData.t);
          console.log('CheckoutConfirmationPage: Token restored');
        }
        
        // Restore user data if present
        if (authData.u) {
          try {
            const decodedUser = decodeURIComponent(atob(authData.u));
            localStorage.setItem('user', decodedUser);
            console.log('CheckoutConfirmationPage: User data restored');
          } catch (e) {
            console.error('CheckoutConfirmationPage: Error decoding user data:', e);
          }
        }
        
        // Restore auth flag if present
        if (authData.a) {
          localStorage.setItem('isAuthenticated', authData.a);
          console.log('CheckoutConfirmationPage: Auth flag restored');
        }
        
        // Clean up
        sessionStorage.removeItem('auth_data');
        
        // Dispatch event to update auth context
        window.dispatchEvent(new Event('storageUpdate'));
      }
      
      // Check authentication status
      const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const storedUser = localStorage.getItem('user');
      
      setIsAuthenticated(!!storedIsAuthenticated && !!storedUser);
      console.log('CheckoutConfirmationPage: Auth check result:', !!storedIsAuthenticated && !!storedUser);
    } catch (error) {
      console.error('CheckoutConfirmationPage: Error during auth check:', error);
      setIsAuthenticated(false);
    } finally {
      setIsAuthChecking(false);
    }
    
    // Process order data
    if (!isOrderDataFetched) {
      console.log('CheckoutConfirmationPage: Processing order data...');
      
      // Check if the URL has order query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const hasOrderParam = urlParams.get('order') === 'true';
      
      // Check if we've already been through this flow in this session
      const hasVisitedFlag = sessionStorage.getItem('confirmation_visited');
      
    // Get order from localStorage
      let savedOrder = localStorage.getItem('lastOrder');
      
      // If no order in localStorage, check sessionStorage backup
      if (!savedOrder) {
        console.log('CheckoutConfirmationPage: No order in localStorage, checking backup in sessionStorage');
        const backupOrder = sessionStorage.getItem('backup_order');
        
        if (backupOrder) {
          console.log('CheckoutConfirmationPage: Found backup order in sessionStorage');
          // Copy backup to a local variable
          savedOrder = backupOrder;
          
          // Store in localStorage immediately to prevent future lookups
          localStorage.setItem('lastOrder', backupOrder);
          
          // Keep the backup for a short while as a safeguard
          setTimeout(() => {
            sessionStorage.removeItem('backup_order');
          }, 5000);
        }
      }
      
    if (savedOrder) {
        console.log('CheckoutConfirmationPage: Found order data, displaying confirmation');
        try {
          // Parse order immediately
          const orderData = JSON.parse(savedOrder);
          
          // Set the order state
          setOrder(orderData);
          
          // Clear cart after successful order but keep order data in localStorage for a few seconds
      clearCart();
          
          // Mark the order data as fetched to prevent re-processing
          setIsOrderDataFetched(true);
          console.log('CheckoutConfirmationPage: Order data processed successfully');
          
          // Set a timeout to clear the order data after a few seconds
          setTimeout(() => {
      localStorage.removeItem('lastOrder');
          }, 5000);
        } catch (e) {
          console.error('CheckoutConfirmationPage: Error parsing order data:', e);
          if (!redirectAttempted.current && !order) {
            redirectAttempted.current = true;
            navigate('/cart');
          }
        }
      } else if (hasOrderParam && !hasVisitedFlag && !redirectAttempted.current && !order) {
        // If URL indicates payment completion but no order, try refreshing once
        console.log('CheckoutConfirmationPage: Order param present but no order data found, refreshing');
        redirectAttempted.current = true;
        sessionStorage.setItem('confirmation_visited', 'true'); // Set flag to prevent further refreshes
        window.location.reload();
      } else if ((!isAuthenticated || isAuthChecking) && !redirectAttempted.current && !order) {
        // If no order and not authenticated, redirect to login
        console.log('CheckoutConfirmationPage: No order found and not authenticated, redirecting to login');
        redirectAttempted.current = true;
        navigate('/login', { state: { redirect: '/checkout/confirmation' } });
      } else if (!redirectAttempted.current && !order) {
        // If authenticated but no order, redirect to cart
        console.log('CheckoutConfirmationPage: No order found, redirecting to cart');
        redirectAttempted.current = true;
      navigate('/cart');
      }
    }
    
    // Cleanup function
    return () => {
      sessionStorage.removeItem("confirmation_visited");
    };
  }, [navigate, clearCart, isOrderDataFetched, isAuthenticated, isAuthChecking, order]);
  
  // Second useEffect for notification handling
  useEffect(() => {
    // Send notification to admin dashboard when order is confirmed
    if (order && !notificationSent && addNotification) {
      try {
        console.log('CheckoutConfirmationPage: Sending order notification to admin dashboard');
        
        // Create a notification message with order details
        const notificationMessage = {
          type: 'order' as 'order' | 'system',
          title: 'New Order Received',
          message: `Order #${order.orderNumber} has been placed for ${displayPrice(order.total, order.currency, order.currencyRate)}`,
          createdAt: new Date().toISOString(),
          isRead: false,
          id: `order-${order.orderNumber}-${Date.now()}`
        };
        
        // Add notification through context for real-time update
        addNotification(notificationMessage);
        
        // Store notification in localStorage for persistence until backend is ready
        try {
          // Get existing notifications or initialize empty array
          const storedNotifications = localStorage.getItem('admin_notifications');
          const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
          
          // Add the new notification
          notifications.push(notificationMessage);
          
          // Save back to localStorage
          localStorage.setItem('admin_notifications', JSON.stringify(notifications));
          
          console.log('CheckoutConfirmationPage: Notification saved to localStorage');
        } catch (storageError) {
          console.error('CheckoutConfirmationPage: Error storing notification in localStorage:', storageError);
        }
        
        // Mark as sent to prevent duplicate notifications
        setNotificationSent(true);
        
        console.log('CheckoutConfirmationPage: Order notification sent successfully');
      } catch (error) {
        console.error('CheckoutConfirmationPage: Error sending order notification:', error);
        
        // Even if there's an error, mark as sent to prevent infinite retries
        setNotificationSent(true);
      }
    }
  }, [order, notificationSent, addNotification, formatPrice, convertPrice]);
  
  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const transformOrderForInvoice = (order: Order): InvoiceOrder => {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.date,
      createdAt: order.createdAt || order.date || new Date().toISOString(),
      shippingDetails: {
        firstName: order.shipping.firstName,
        lastName: order.shipping.lastName,
        email: order.shipping.email,
        phone: order.shipping.phone,
        address: order.shipping.address,
        apartment: order.shipping.apartment || '',
        city: order.shipping.city,
        state: order.shipping.state,
        zipCode: order.shipping.zipCode,
        notes: order.shipping.notes || '',
        deliveryOption: order.shipping.deliveryOption || 'self',
        timeSlot: order.shipping.timeSlot,
        deliveryDate: order.shipping.deliveryDate || new Date().toISOString(),
        giftMessage: order.shipping.giftMessage || '',
        receiverFirstName: order.shipping.receiverFirstName || '',
        receiverLastName: order.shipping.receiverLastName || '',
        receiverEmail: order.shipping.receiverEmail || '',
        receiverPhone: order.shipping.receiverPhone || '',
        receiverAddress: order.shipping.receiverAddress || '',
        receiverApartment: order.shipping.receiverApartment || '',
        receiverCity: order.shipping.receiverCity || '',
        receiverState: order.shipping.receiverState || '',
        receiverZipCode: order.shipping.receiverZipCode || ''
      },
      items: order.items.map(item => ({
        product: {
          id: item.id,
          name: item.title,
          price: item.price,
          image: item.image,
          images: [item.image || ''],
          discount: item.product?.discount
        },
        quantity: item.quantity,
        price: item.price,
        finalPrice: item.price * item.quantity
      })),
      totalAmount: order.total,
      shippingFee: order.deliveryFee,
      status: order.status || 'completed',
      paymentDetails: {
        method: order.payment.method,
        status: order.payment.status || 'completed',
        transactionId: order.payment.paymentId
      }
    };
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current || !order) return;

    // Ensure the order has valid dates before generating invoice
    try {
      const invoiceOrder = transformOrderForInvoice(order);
      const success = await generatePDF(
        invoiceRef.current,
        `invoice-${order.orderNumber}.pdf`
      );

      if (success) {
        toast({
          title: "Success",
          description: "Invoice downloaded successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to download invoice. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (!order) {
    console.log('CheckoutConfirmationPage: Order data not available yet, showing loading screen');
    return <div className="h-screen flex items-center justify-center">Loading confirmation data...</div>;
  }


  
  console.log('CheckoutConfirmationPage: Rendering order confirmation page for order #', order.orderNumber);
  
  const getTimeSlot = (slotId: string) => {
    return DEFAULT_TIME_SLOTS[slotId] || { 
      id: slotId, 
      label: "Unknown", 
      time: "Unknown", 
      available: true 
    };
  };

  // ✅ Helper to format image URLs
  const formatImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/images/placeholder.jpg';
    
    return imagePath.startsWith("/")
      ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}${imagePath}`
      : imagePath;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartItemCount={0} />
    
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Order Confirmation</h1>
            
            {/* Checkout Steps */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  <Check size={14} />
                </div>
                <span className="ml-2 font-medium">Cart</span>
              </div>
              
              <div className="h-px w-8 bg-primary" />
              
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  <Check size={14} />
                </div>
                <span className="ml-2 font-medium">Shipping</span>
              </div>
              
              <div className="h-px w-8 bg-primary" />
              
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  <Check size={14} />
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
              
              <div className="h-px w-8 bg-primary" />
              
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  <Check size={14} />
                </div>
                <span className="ml-2 font-medium">Confirmation</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You for Your Order!</h2>
            <p className="text-muted-foreground">Order #{order.orderNumber}</p>
            <p className="mt-2">
              A confirmation email has been sent to {order.shipping.email}
            </p>
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              className="mt-4 gap-2"
            >
              <Download size={16} />
              Download Invoice
            </Button>
          </div>

          {/* Hidden invoice for PDF generation */}
          <div className="hidden">
            <div ref={invoiceRef}>
              <Invoice order={transformOrderForInvoice(order)} />
            </div>
          </div>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={18} />
                <h3 className="text-lg font-medium">Delivery Information</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                  <div className="text-sm">
                    <p>
                      {order.shipping.firstName} {order.shipping.lastName}
                    </p>
                    <p>{order.shipping.address}</p>
                    {order.shipping.apartment && <p>{order.shipping.apartment}</p>}
                    <p>
                      {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
                    </p>
                    <p>{order.shipping.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Delivery Details</h4>
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-muted-foreground" />
                      <p>
                        {getTimeSlot(order.shipping.timeSlot).label} Delivery:
                        {" "}{getTimeSlot(order.shipping.timeSlot).time}
                      </p>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      Estimated delivery: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                    {order.shipping.notes && (
                      <div className="mt-2 p-2 bg-secondary/20 rounded text-muted-foreground">
                        <p className="text-xs font-medium">Delivery Notes:</p>
                        <p className="text-xs">{order.shipping.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={18} />
                <h3 className="text-lg font-medium">Order Summary</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-16 w-16 bg-secondary/20 rounded-md relative overflow-hidden flex-shrink-0">
                      <img 
                        src={formatImageUrl(item.image)} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 right-0 h-5 w-5 bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center rounded-full -mt-1 -mr-1">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{item.title}</h4>
                      <div className="text-muted-foreground text-xs">
                        {displayPrice(item.price, order.currency, order.currencyRate)} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {displayPrice(item.price * item.quantity, order.currency, order.currencyRate)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{displayPrice(order.subtotal, order.currency, order.currencyRate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.deliveryFee > 0 ? displayPrice(order.deliveryFee, order.currency, order.currencyRate) : 'Free'}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>{displayPrice(order.subtotal + (order.deliveryFee || 0), order.currency, order.currencyRate)}</span>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Payment Method</h4>
                <p className="text-sm">
                  {order.payment.method === 'credit-card' && (
                    <span>Credit Card</span>
                  )}
                  {order.payment.method === 'paypal' && (
                    <span>PayPal</span>
                  )}
                  {order.payment.method === 'cash' && (
                    <span>Cash on Delivery</span>
                  )}
                  {order.payment.method === 'razorpay' && (
                    <span>Razorpay (Payment ID: {order.payment.paymentId})</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/profile')}
              variant="outline"
              className="gap-2"
            >
              Track Your Order
              <ArrowRight size={16} />
            </Button>
            
            <Button 
              onClick={handleContinueShopping}
              className="gap-2"
            >
              Continue Shopping
              <ShoppingBag size={16} />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutConfirmationPage;
