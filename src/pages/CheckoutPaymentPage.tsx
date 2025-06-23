import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useCart from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNotification } from '@/contexts/NotificationContext';
import PromoCodeInput from '@/components/PromoCodeInput';
import type { PromoCodeValidationResult } from '@/services/promoCodeService';
import { RAZORPAY_CONFIG } from '@/config/razorpay';

// Add Razorpay script to window
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: {
      new(options: RazorpayOptions): {
        open: () => void;
      };
    };
  }
}

const CheckoutPaymentPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const { formatPrice, convertPrice, currency, rate } = useCurrency();
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  
  // State for promo code functionality
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
  } | null>(null);
  interface ShippingInfo {
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
    timeSlot: string;
    deliveryOption?: string;
    deliveryFee?: number;
    selectedDate?: string;
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
  }

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const { addNotification } = useNotification();
  
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsRazorpayLoaded(true);
    };
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load Razorpay. Please try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);
  
  useEffect(() => {
    const savedShippingInfo = localStorage.getItem('shippingInfo');
    if (savedShippingInfo) {
      const parsedInfo = JSON.parse(savedShippingInfo);
      
      // Ensure deliveryFee is set correctly
      if (parsedInfo.timeSlot === 'midnight' && (!parsedInfo.deliveryFee || parsedInfo.deliveryFee !== 100)) {
        parsedInfo.deliveryFee = 100;
        // Update localStorage
        localStorage.setItem('shippingInfo', JSON.stringify(parsedInfo));
      }
      
      setShippingInfo(parsedInfo);
    } else {
      navigate('/checkout/shipping');
    }

    // Load applied promo code from localStorage
    const savedPromoCode = localStorage.getItem('appliedPromoCode');
    if (savedPromoCode) {
      try {
        setAppliedPromoCode(JSON.parse(savedPromoCode));
      } catch (error) {
        console.error('Error parsing promo code from localStorage:', error);
        localStorage.removeItem('appliedPromoCode');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Promo code handlers
  const handlePromoCodeApplied = (validationResult: PromoCodeValidationResult) => {
    if (validationResult.success && validationResult.data) {
      const promoData = {
        code: validationResult.data.promoCode.code,
        discount: validationResult.data.discount.amount, // INR amount from backend
        finalAmount: validationResult.data.order.finalAmount // INR amount from backend
      };
      setAppliedPromoCode(promoData);
      localStorage.setItem('appliedPromoCode', JSON.stringify(promoData));
    }
  };

  const handlePromoCodeRemoved = () => {
    setAppliedPromoCode(null);
    localStorage.removeItem('appliedPromoCode');
  };
  
  const handlePayment = async () => {
    try {
      if (!isRazorpayLoaded) {
        toast({
          title: "Error",
          description: "Razorpay is not loaded yet. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
      
      // Calculate totals with currency conversion
      const convertedSubtotal = convertPrice(subtotal);
      // Apply delivery fee for midnight delivery
      const deliveryFee = shippingInfo.timeSlot === 'midnight' ? convertPrice(midnightDeliveryFee) : 0;
      // Apply promo code discount if available (discount is already in INR, so convert it)
      const promoDiscount = appliedPromoCode ? convertPrice(appliedPromoCode.discount) : 0;
      // Calculate total with subtotal, delivery fee, and promo discount
      const total = convertedSubtotal + deliveryFee - promoDiscount;

      // For Razorpay payment, convert amount back to INR (base currency)
      // since Razorpay primarily works with INR for Indian merchants
      let razorpayAmount;
      if (currency === 'INR') {
        razorpayAmount = total;
      } else {
        // Convert USD back to INR for Razorpay
        razorpayAmount = total / rate; // Divide by rate to get back to INR
      }

      console.log('Payment calculation:', {
        subtotal: convertedSubtotal,
        deliveryFee,
        total,
        currency,
        rate,
        razorpayAmountINR: razorpayAmount,
        timeSlot: shippingInfo.timeSlot
      });

      // Create order on your backend
      let response;
      try {
        console.log('Sending Razorpay order request with amount (INR):', Math.round(razorpayAmount * 100));
        response = await api.post('/orders/create-razorpay-order', {
          amount: Math.round(razorpayAmount * 100), // Convert to paise (INR)
          currency: 'INR' // Always use INR for Razorpay
        });
        
        console.log('Razorpay order response:', response.data);
        
        if (!response?.data?.success) {
          throw new Error(response?.data?.message || 'Failed to create order');
        }
      } catch (error) {
        console.error('Order creation failed:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Failed to create order'
        );
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      const options = {
        key: RAZORPAY_CONFIG.keyId,
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'SBF Store',
        description: `Purchase from SBF Store${currency !== 'INR' ? ` (Order total: ${formatPrice(total)} in ${currency})` : ''}`,
        order_id: response.data.id,
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone,
        },
        theme: {
          color: '#000000'
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            console.log('Razorpay checkout dismissed');
          }
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string; 
          razorpay_signature: string;
        }) => {
          try {
            // Verify payment on your backend
            const verifyResponse = await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              // Create order in your database
              const orderData = {
                shippingDetails: {
                  fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                  email: shippingInfo.email,
                  phone: shippingInfo.phone,
                  address: shippingInfo.address,
                  apartment: shippingInfo.apartment || '',
                  city: shippingInfo.city,
                  state: shippingInfo.state,
                  zipCode: shippingInfo.zipCode,
                  notes: shippingInfo.notes || '',
                  deliveryDate: shippingInfo.selectedDate,
                  timeSlot: shippingInfo.timeSlot
                },
                items: items.map(item => ({
                  product: item.id,
                  quantity: item.quantity,
                  price: convertPrice(item.price),
                  finalPrice: convertPrice(item.price * item.quantity)
                })),
                paymentDetails: {
                  method: 'razorpay',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                },
                totalAmount: total,
                currency: currency,
                currencyRate: rate,
                originalCurrency: currency,
                subtotal: convertedSubtotal,
                deliveryFee: deliveryFee,
                promoCode: appliedPromoCode ? {
                  code: appliedPromoCode.code,
                  discount: appliedPromoCode.discount // Send INR amount to backend
                } : null,
                deliveryType: shippingInfo.timeSlot === 'midnight' ? 'midnight' : 'standard'
              };

              // Add gift details if it's a gift order
              if (shippingInfo.deliveryOption === 'gift') {
                const giftDetails = {
                  message: shippingInfo.giftMessage || '',
                  recipientName: `${shippingInfo.receiverFirstName} ${shippingInfo.receiverLastName}`,
                  recipientEmail: shippingInfo.receiverEmail || '',
                  recipientPhone: shippingInfo.receiverPhone,
                  recipientAddress: shippingInfo.receiverAddress,
                  recipientApartment: shippingInfo.receiverApartment || '',
                  recipientCity: shippingInfo.receiverCity,
                  recipientState: shippingInfo.receiverState,
                  recipientZipCode: shippingInfo.receiverZipCode
                };
              }

              const orderResponse = await api.post('/orders', orderData);
              
              if (orderResponse.data.success) {
                // Add notification for new order
                addNotification({
                  type: 'order',
                  title: 'New Order Received',
                  message: `Order #${orderResponse.data.order.orderNumber} has been placed. Total amount: ${formatPrice(total)}`,
                });

                // Store order details for confirmation page
                const orderConfirmation = {
                  id: orderResponse.data.order._id,
                  orderNumber: orderResponse.data.order.orderNumber,
                  items: items.map(item => ({
                    ...item,
                    price: convertPrice(item.price)
                  })),
                  shipping: {
                    firstName: shippingInfo.firstName,
                    lastName: shippingInfo.lastName,
                    email: shippingInfo.email,
                    phone: shippingInfo.phone,
                    address: shippingInfo.address,
                    apartment: shippingInfo.apartment,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    zipCode: shippingInfo.zipCode,
                    notes: shippingInfo.notes,
                    timeSlot: shippingInfo.timeSlot,
                    deliveryDate: shippingInfo.selectedDate,
                    deliveryType: shippingInfo.timeSlot === 'midnight' ? 'midnight' : 'standard'
                  },
                  payment: {
                    method: 'razorpay',
                    paymentId: response.razorpay_payment_id,
                    status: 'completed'
                  },
                  subtotal: convertedSubtotal,
                  deliveryFee: deliveryFee,
                  total: total,
                  date: new Date().toISOString(),
                  status: 'completed',
                  createdAt: new Date().toISOString(),
                  // Add currency information for proper display
                  currency: currency,
                  currencyRate: rate,
                  originalCurrency: currency
                };

                // Store order details securely to ensure it's not lost during redirect
                const orderData = JSON.stringify(orderConfirmation);
                try {
                  // Store order in both localStorage and sessionStorage for redundancy
                  localStorage.setItem('lastOrder', orderData);
                  sessionStorage.setItem('backup_order', orderData);
                  console.log('Order data saved to localStorage and sessionStorage');
                } catch (storageError) {
                  console.error('Error saving order data:', storageError);
                }
                
                // Store auth data directly in sessionStorage to preserve it
                try {
                  const token = localStorage.getItem('token');
                  const user = localStorage.getItem('user');
                  const isAuthenticated = localStorage.getItem('isAuthenticated');
                  
                  // Create auth data object - encode user data to prevent corruption
                  const authData = {
                    t: token,
                    u: user ? btoa(encodeURIComponent(user)) : null,
                    a: isAuthenticated
                  };
                  
                  // Store in sessionStorage
                  sessionStorage.setItem('auth_data', JSON.stringify(authData));
                  console.log('Authentication data saved to sessionStorage');
                } catch (authError) {
                  console.error('Error saving auth data:', authError);
                }
                
                // Clear cart before redirect 
                clearCart();
                localStorage.removeItem('shippingInfo');
                
                // Force redirect with both order and auth flags
                console.log('Redirecting to confirmation page...');
                
                try {
                  // Clear any existing confirmation flags
                  sessionStorage.removeItem('confirmation_visited');
                  
                  // Set a flag indicating we're coming from payment
                  sessionStorage.setItem('from_payment', 'true');
                  
                  // Use timeout to ensure storage operations complete
                setTimeout(() => {
                    // Force clear any cache-related issues
                    for (const key of Object.keys(sessionStorage)) {
                      if (key !== 'from_payment' && key !== 'auth_data' && key !== 'backup_order') {
                        sessionStorage.removeItem(key);
                      }
                    }
                    
                    console.log('Checking from_payment flag before redirect:', sessionStorage.getItem('from_payment'));
                    console.log('Checking order data before redirect:', localStorage.getItem('lastOrder') ? 'present' : 'missing');
                    
                    // Use navigate for cleaner routing
                    console.log('Navigating to confirmation page...');
                    navigate('/checkout/confirmation?order=true&from=payment');
                  }, 500);
                } catch (redirectError) {
                  console.error('Error during redirect:', redirectError);
                  // Fallback if the redirect fails
                  alert('Payment successful! Please click OK to continue to the confirmation page.');
                  navigate('/checkout/confirmation');
                }
              }
            }
          } catch (error: unknown) {
            let errorMessage = "Payment verification failed. Please contact support.";
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
              const apiError = error as { response?: { data?: { message?: string } } };
              errorMessage = apiError.response?.data?.message || errorMessage;
            }
            console.error('Error verifying payment:', error);
            toast({
              title: "Payment Verification Failed",
              description: errorMessage,
              variant: "destructive",
            });
          }
        },
      };

      try {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error('Razorpay initialization failed:', error);
        toast({
          title: "Payment Error",
          description: "Failed to initialize payment gateway. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      let errorMessage = "There was an error processing your payment. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        errorMessage = apiError.response?.data?.message || errorMessage;
      }
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  if (items.length === 0 || !shippingInfo) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // Within the CheckoutPaymentPage component, add a constant for the midnight delivery fee
  const midnightDeliveryFee = 100.00; // Same value as in shipping page

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartItemCount={items.length} />
      
      <main className="flex-grow pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Checkout</h1>
            
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
                  <CreditCard size={14} />
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
              
              <div className="h-px w-8 bg-muted" />
              
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm">
                  4
                </div>
                <span className="ml-2 text-muted-foreground">Confirmation</span>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4">Payment</h2>
                  
                  <div className="mt-6 p-4 bg-secondary/20 rounded-md">
                    <p className="text-center">You'll be redirected to Razorpay to complete your payment.</p>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                    <div className="bg-secondary/10 rounded-md p-4">
                      <p>
                        {shippingInfo.firstName} {shippingInfo.lastName}
                      </p>
                      <p>{shippingInfo.address}</p>
                      {shippingInfo.apartment && <p>{shippingInfo.apartment}</p>}
                      <p>
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                      </p>
                      <p>{shippingInfo.phone}</p>
                      <p>{shippingInfo.email}</p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="px-6 py-4 flex justify-between items-center border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate('/checkout/shipping')}
                  >
                    Back to Shipping
                  </Button>
                  
                  <Button 
                    onClick={handlePayment} 
                    className="gap-2"
                    disabled={!isRazorpayLoaded}
                  >
                    Pay Now
                    <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                  
                  <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-16 w-16 bg-secondary/20 rounded-md relative overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 right-0 h-5 w-5 bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center rounded-full -mt-1 -mr-1">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{item.title}</h4>
                          <div className="text-muted-foreground text-xs">
                            {formatPrice(convertPrice(item.price))} × {item.quantity}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(convertPrice(item.price * item.quantity))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(convertPrice(subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>
                        {shippingInfo.timeSlot === 'midnight' ? 
                          formatPrice(convertPrice(midnightDeliveryFee)) : 
                          'Free'}
                      </span>
                    </div>

                    {/* Promo Code Section */}
                    <div className="border-t pt-4 mt-4">
                      <PromoCodeInput
                        orderAmount={subtotal}
                        orderItems={items}
                        onPromoCodeApplied={handlePromoCodeApplied}
                        onPromoCodeRemoved={handlePromoCodeRemoved}
                        appliedPromoCode={appliedPromoCode}
                      />
                    </div>

                    <div className="flex justify-between font-medium pt-2 border-t mt-2">
                      <span>Total</span>
                      <span>
                        {formatPrice(
                          convertPrice(subtotal + (shippingInfo.timeSlot === 'midnight' ? midnightDeliveryFee : 0)) - 
                          (appliedPromoCode ? convertPrice(appliedPromoCode.discount) : 0)
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Testing Mode Badge - Floating */}
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-3 py-2 rounded-lg shadow-lg font-semibold flex items-center gap-2 z-50 text-xs sm:text-sm max-w-xs">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="leading-tight">
          ⚠️ TESTING MODE: Payments are for testing only.
        </span>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPaymentPage;
