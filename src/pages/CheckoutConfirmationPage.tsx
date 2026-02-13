import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ShoppingBag, Truck, Clock, MapPin, User, Gift, Phone, Mail, Package, Download, Star, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useCart from '@/hooks/use-cart';
import { TimeSlot } from '@/components/TimeSlotSelector';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types/invoice';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/contexts/NotificationContext';
import api from '@/services/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const successVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: 0.5
    }
  }
};

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
  },
  'midnight': {
    id: 'midnight',
    label: 'Midnight',
    time: '12:00 AM - 3:00 AM',
    available: true
  }
};

const CheckoutConfirmationPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const { formatPrice, convertPrice, currency, rate } = useCurrency();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isOrderDataFetched, setIsOrderDataFetched] = useState(false);
  const [fromPayment, setFromPayment] = useState<boolean>(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const redirectAttempted = useRef<boolean>(false);
  const initialized = useRef<boolean>(false);

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
    if (orderCurrency && orderRate && orderCurrency !== currency) {
      if (orderCurrency === 'INR') {
        const convertedAmount = convertPrice(amount);
        return formatPriceWithCurrency(convertedAmount, currency);
      } else {
        const amountInINR = amount / orderRate;
        const convertedAmount = convertPrice(amountInINR);
        return formatPriceWithCurrency(convertedAmount, currency);
      }
    } else if (orderCurrency && orderCurrency === currency) {
      return formatPriceWithCurrency(amount, orderCurrency);
    } else if (orderCurrency) {
      return formatPriceWithCurrency(amount, orderCurrency);
    } else {
      const convertedAmount = convertPrice(amount);
      return formatPriceWithCurrency(convertedAmount, currency);
    }
  };
  
  // First useEffect for authentication and order processing
  useEffect(() => {
    // Only run once - prevent re-initialization
    if (initialized.current) {
      console.log('CheckoutConfirmationPage: Already initialized, skipping...');
      return;
    }
    
    initialized.current = true;
    
    // Wrap everything in a try-catch to prevent any errors from blocking the page
    const initializeConfirmationPage = async () => {
      try {
        console.log('CheckoutConfirmationPage: Initializing...');
        console.log('Full URL:', window.location.href);
        
        // Check if coming from payment page
        const fromPaymentFlag = sessionStorage.getItem("from_payment");
        const hasOrderParam = new URLSearchParams(window.location.search).get('order') === 'true';
        
        console.log('Navigation context:', {
          fromPayment: fromPaymentFlag === "true",
          hasOrderParam,
          currentPath: window.location.pathname,
          search: window.location.search
        });
        
        setFromPayment(fromPaymentFlag === "true");
        
        // Get order data with detailed logging
        const savedOrder = localStorage.getItem('lastOrder');
        const backupOrder = sessionStorage.getItem('backup_order');
        
        console.log('Storage check:', {
          lastOrder: savedOrder ? `Found (${savedOrder.length} chars)` : 'NULL',
          backupOrder: backupOrder ? `Found (${backupOrder.length} chars)` : 'NULL',
          allLocalStorageKeys: Object.keys(localStorage),
          allSessionStorageKeys: Object.keys(sessionStorage)
        });
        
        // Try backup if main is missing
        const orderData = savedOrder || backupOrder;
        
        if (!orderData && !redirectAttempted.current) {
          console.error('❌ NO ORDER DATA FOUND - Redirecting to cart');
          console.error('This means payment handler did not store order data properly');
          redirectAttempted.current = true;
          
          toast({
            title: "Order Not Found",
            description: "Redirecting to cart. If you completed payment, please contact support.",
            variant: "destructive",
          });
          
          setTimeout(() => navigate('/cart'), 2000);
          return;
        }
        
        if (orderData) {
          try {
            console.log('📦 Parsing order data...');
            let parsedOrder = JSON.parse(orderData);
            console.log('✅ Order parsed successfully:', {
              orderId: parsedOrder._id,
              orderNumber: parsedOrder.orderNumber,
              itemCount: parsedOrder.items?.length,
              total: parsedOrder.total
            });
            
            // --- Normalization logic ---
            // If backend uses shippingDetails, map to shipping
            if (parsedOrder.shippingDetails && !parsedOrder.shipping) {
              parsedOrder.shipping = parsedOrder.shippingDetails;
            }
            // If backend uses items with product subfield, flatten for display
            if (parsedOrder.items && parsedOrder.items.length > 0 && parsedOrder.items[0].product) {
              parsedOrder.items = parsedOrder.items.map((item: any) => ({
                id: item.product._id || item.product.id || item.productId || item._id || '',
                title: item.product.title || item.product.name || item.title || '',
                image: (item.product.images && item.product.images[0]) || item.image || '',
                price: item.finalPrice || item.price || (item.product.price ?? 0),
                quantity: item.quantity || 1,
                customizations: item.customizations || null,
                // fallback for legacy
                product: item.product
              }));
            }
            // Fallback for subtotal/total
            if (typeof parsedOrder.subtotal === 'undefined') {
              parsedOrder.subtotal = Array.isArray(parsedOrder.items)
                ? parsedOrder.items.reduce((sum: number, item: any) => {
                    const discountedPrice = item.discount && item.discount > 0 
                      ? item.price - (item.price * item.discount / 100)
                      : item.price;
                    return sum + ((discountedPrice || 0) * (item.quantity || 1));
                  }, 0)
                : 0;
            }
            if (typeof parsedOrder.total === 'undefined') {
              parsedOrder.total = parsedOrder.subtotal + (parsedOrder.deliveryFee || 0);
            }
            // Fallback for payment
            if (!parsedOrder.payment && parsedOrder.paymentDetails) {
              parsedOrder.payment = parsedOrder.paymentDetails;
            }
            
            setOrder(parsedOrder);
            setIsOrderDataFetched(true);
            console.log('✅ Order state updated successfully');
            
            // Save to backup if not already there
            if (!backupOrder) {
              sessionStorage.setItem('backup_order', orderData);
            }
            
            // Clear the payment flag after successful load
            sessionStorage.removeItem("from_payment");
            
          } catch (error) {
            console.error('❌ Error parsing order data:', error);
            console.error('Raw order data:', orderData?.substring(0, 200));
            
            if (!redirectAttempted.current) {
              redirectAttempted.current = true;
              toast({
                title: "Error Loading Order",
                description: "There was an error loading your order details. Redirecting to cart.",
                variant: "destructive",
          });
          setTimeout(() => navigate('/cart'), 2000);
        }
      }
    }
    
    // Set confirmation visited flag
    sessionStorage.setItem("confirmation_visited", "true");
    
    // Auth restoration logic
    try {
      const authDataString = sessionStorage.getItem('auth_data');
      
      if (authDataString) {
        console.log('CheckoutConfirmationPage: Found auth_data in sessionStorage');
        const authData = JSON.parse(authDataString);
        
        if (authData.t) {
          localStorage.setItem('token', authData.t);
          console.log('CheckoutConfirmationPage: Token restored');
        }
        
        if (authData.u) {
          try {
            const decodedUser = decodeURIComponent(atob(authData.u));
            localStorage.setItem('user', decodedUser);
            console.log('CheckoutConfirmationPage: User data restored');
          } catch (e) {
            console.error('CheckoutConfirmationPage: Error decoding user data:', e);
          }
        }
        
        if (authData.a) {
          localStorage.setItem('isAuthenticated', authData.a);
          console.log('CheckoutConfirmationPage: Auth flag restored');
        }
        
        sessionStorage.removeItem('auth_data');
        window.dispatchEvent(new Event('storageUpdate'));
      }
      
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
      } catch (globalError) {
        // Catch any unexpected errors to prevent page crash
        console.error('CheckoutConfirmationPage: Unexpected error during initialization:', globalError);
        setIsAuthChecking(false);
        
        // Try to load from localStorage as fallback
        try {
          const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
          const storedUser = localStorage.getItem('user');
          setIsAuthenticated(!!storedIsAuthenticated && !!storedUser);
        } catch (e) {
          setIsAuthenticated(false);
        }
      }
    };
    
    // Execute the initialization
    initializeConfirmationPage();
  }, []); // Empty dependency array - only run once on mount
  
  const handleContinueShopping = () => {
    // Clear any remaining order data
    localStorage.removeItem('lastOrder');
    sessionStorage.removeItem('backup_order');
    sessionStorage.removeItem('from_payment');
    sessionStorage.removeItem('confirmation_visited');
    
    // Navigate to shop
    navigate('/shop');
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    try {
      const response = await api.get(`/orders/${order.id}/invoice`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download invoice. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const getTimeSlot = (slotId: string) => {
    return DEFAULT_TIME_SLOTS[slotId] || { 
      id: slotId, 
      label: slotId,
      time: slotId,
      available: true 
    };
  };

  const formatImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/api/placeholder/400/300';
    if (imagePath.startsWith('http')) return imagePath;
    return `/uploads/${imagePath}`;
  };

  if (isAuthChecking || !isOrderDataFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your order confirmation...</p>
          </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your order details. Please check your email for the confirmation.</p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <Navigation />
      
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-10"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  ease: "linear",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Success Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div 
            variants={successVariants}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-4">
            Order <span className="text-green-600">Confirmed!</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-2">
            Thank you for your order, {order.shipping?.firstName}!
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Order Number:</span>
            <Badge variant="outline" className="font-mono text-base px-3 py-1">
              #{order.orderNumber}
            </Badge>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={formatImageUrl(item.image)}
                              alt={item.title || 'Product Image'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.title || 'Unnamed Product'}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity ?? 'N/A'}</p>
                          <p className="text-sm text-gray-600">
                            {displayPrice(Number(item.price) || 0, order.currency, order.currencyRate)} × {item.quantity ?? 'N/A'}
                          </p>
                          {/* Customization Details Block */}
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
                        <div className="text-right">
                          <p className="font-semibold">
                            {displayPrice(((item.discount && item.discount > 0 
                              ? Number(item.price) - (Number(item.price) * item.discount / 100)
                              : Number(item.price)) || 0) * (item.quantity || 1), order.currency, order.currencyRate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delivery Information */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Delivery Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">Delivery Address</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium">{order.shipping?.firstName || 'N/A'} {order.shipping?.lastName || ''}</p>
                        <p>{order.shipping?.address || 'N/A'}</p>
                        {order.shipping?.apartment && <p>{order.shipping.apartment}</p>}
                        <p>{order.shipping?.city || ''}{order.shipping?.state ? `, ${order.shipping.state}` : ''}{order.shipping?.zipCode || ''}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">Contact Information</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span>{order.shipping?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span>{order.shipping?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />

                  {/* Delivery Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">Delivery Time</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{getTimeSlot(order.shipping?.timeSlot || '').time}</p>
                        {order.shipping?.timeSlot === 'midnight' && (
                          <Badge variant="secondary" className="mt-1">
                            Midnight Delivery
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">Order Date</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {order.shipping?.notes && (
                    <>
                      <Separator />
                      <div>
                        <span className="font-medium text-sm">Special Instructions:</span>
                        <p className="text-sm text-gray-600 mt-1 italic">"{order.shipping.notes}"</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* What's Next */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    What's Next?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Order Confirmation</p>
                        <p className="text-sm text-gray-600">You'll receive an email confirmation shortly with your order details.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Order Preparation</p>
                        <p className="text-sm text-gray-600">Our team will carefully prepare your beautiful floral arrangement.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Delivery</p>
                        <p className="text-sm text-gray-600">Your order will be delivered during your selected time slot.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Right Column - Order Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                  <span>{isNaN(order.subtotal) ? 'N/A' : displayPrice(order.subtotal, order.currency, order.currencyRate)}</span>
                </div>
                  
                  {order.deliveryFee && order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>{displayPrice(order.deliveryFee, order.currency, order.currencyRate)}</span>
                </div>
                  )}
                  
                  {order.promoCode && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({order.promoCode.code})</span>
                      <span>-{displayPrice(order.promoCode.discount, order.currency, order.currencyRate)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{isNaN(order.total) ? 'N/A' : displayPrice(order.total, order.currency, order.currencyRate)}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Payment Method: {order.payment?.method || 'Razorpay'}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          
            {/* Actions */}
            <motion.div variants={itemVariants} className="space-y-3">
            <Button 
                onClick={handleDownloadInvoice}
              variant="outline"
                className="w-full"
            >
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
            </Button>
            
            <Button 
              onClick={handleContinueShopping}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
                <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
              </Button>
            </motion.div>

            {/* Support Information */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    If you have any questions about your order, feel free to contact us.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/contact')}
                    className="w-full"
                  >
                    Contact Support
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default CheckoutConfirmationPage;
