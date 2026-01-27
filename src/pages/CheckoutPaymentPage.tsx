import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, ArrowRight, AlertTriangle, Shield, Lock, Smartphone, Wallet, Building2, ChevronDown, ChevronUp, Package, MapPin, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useCart, { useCartSelectors } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/hooks/use-auth';
import PromoCodeInput from '@/components/PromoCodeInput';
import type { PromoCodeValidationResult } from '@/services/promoCodeService';
import { RAZORPAY_CONFIG } from '@/config/razorpay';
import { cn } from '@/lib/utils';

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

// Razorpay types
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
  config?: {
    display: {
      blocks: {
        utib: {
          name: string;
          instruments: Array<{
            method: string;
          }>;
        };
        other: {
          name: string;
          instruments: Array<{
            method: string;
          }>;
        };
      };
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
  method?: {
    upi: boolean;
    card: boolean;
    netbanking: boolean;
    wallet: boolean;
  };
  modal?: {
    confirm_close: boolean;
    ondismiss: () => void;
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
        on: (event: string, handler: (response: any) => void) => void;
      };
    };
  }
}

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

const CheckoutPaymentPage = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { subtotal } = useCartSelectors();
  const { toast } = useToast();
  const { formatPrice, convertPrice, currency, rate } = useCurrency();
  const { addNotification } = useNotification();
  const { user } = useAuth();
  
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showShippingDetails, setShowShippingDetails] = useState(false);
  
  // State for promo code functionality
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
  } | null>(null);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  
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
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
      document.body.removeChild(script);
      }
    };
  }, [toast]);
  
  useEffect(() => {
    const savedShippingInfo = localStorage.getItem('shippingInfo');
    if (savedShippingInfo) {
      const parsedInfo = JSON.parse(savedShippingInfo);
      
      // Ensure deliveryFee is set correctly
      if (parsedInfo.timeSlot === 'midnight' && (!parsedInfo.deliveryFee || parsedInfo.deliveryFee !== 300)) {
        parsedInfo.deliveryFee = 300;
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
        discount: validationResult.data.discount.amount,
        finalAmount: validationResult.data.order.finalAmount
      };
      setAppliedPromoCode(promoData);
      localStorage.setItem('appliedPromoCode', JSON.stringify(promoData));
    }
  };

  const handlePromoCodeRemoved = () => {
    setAppliedPromoCode(null);
    localStorage.removeItem('appliedPromoCode');
  };

  // Calculate totals
  const deliveryFee = shippingInfo?.deliveryFee || 0;
  const promoDiscount = appliedPromoCode ? appliedPromoCode.discount : 0;
  const orderTotal = subtotal + deliveryFee - promoDiscount;
  
  const handlePayment = async () => {
      if (!isRazorpayLoaded) {
        toast({
        title: "Payment gateway not ready",
        description: "Please wait a moment and try again.",
          variant: "destructive",
        });
        return;
      }

    if (!shippingInfo) {
      toast({
        title: "Missing shipping information",
        description: "Please go back and complete your shipping details.",
        variant: "destructive",
      });
      return;
    }

    // Scroll to top of page before opening payment popup
    // Handle mobile vs desktop differently
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // For mobile, scroll to top and ensure viewport is properly positioned
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // On mobile, also ensure the viewport is not zoomed and properly positioned
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    } else {
      // For desktop, smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Small delay to ensure scroll completes before popup opens
    // Longer delay on mobile to account for slower rendering
    const delay = isMobile ? 500 : 300;
    await new Promise(resolve => setTimeout(resolve, delay));

    setIsProcessing(true);

    try {
      // Create Razorpay order
      console.log('Creating order with amount:', orderTotal);
      
      const orderResponse = await api.post('/orders/create-razorpay-order', {
        amount: Math.round(orderTotal * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`
      });
      
      console.log('Server response:', orderResponse.data);

            const { order_id, amount, currency: orderCurrency, key } = orderResponse.data;
      
      if (!order_id || !amount || !orderCurrency) {
        throw new Error('Invalid order response from server');
      }
      
      console.log('Razorpay order created:', {
        order_id,
        amount,
        currency: orderCurrency
      });

             // Prepare order data in correct backend format
       const orderData = {
         items: items.map(item => ({
           product: item._id,           // ✅ Correct field name for backend
           quantity: item.quantity,
           price: item.price,
           finalPrice: item.price, // Always use the total price after customizations
           customizations: item.customizations || null,  // ✅ Include customizations
           images: item.images || []  // ✅ Include product images
         })),
         shippingDetails: {             // ✅ Correct field name for backend
           fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
           email: shippingInfo.email,
           phone: shippingInfo.phone,
           address: shippingInfo.address,
           apartment: shippingInfo.apartment || '',
           city: shippingInfo.city,
           state: shippingInfo.state,
           zipCode: shippingInfo.zipCode,
           notes: shippingInfo.notes || '',
           deliveryDate: shippingInfo.selectedDate ? new Date(shippingInfo.selectedDate) : new Date(),
           timeSlot: shippingInfo.timeSlot
         },
         totalAmount: orderTotal,       // ✅ Correct field name for backend
         currency: 'INR',
         currencyRate: rate || 1,       // ✅ Correct field name for backend
         originalCurrency: 'INR'
       };
       
               // Add gift details if present
        if (shippingInfo.giftMessage || shippingInfo.receiverFirstName) {
          (orderData as any).giftDetails = {
            message: shippingInfo.giftMessage || '',
            recipientName: shippingInfo.receiverFirstName && shippingInfo.receiverLastName 
              ? `${shippingInfo.receiverFirstName} ${shippingInfo.receiverLastName}`.trim()
              : '',
            recipientEmail: shippingInfo.receiverEmail || '',
            recipientPhone: shippingInfo.receiverPhone || '',
            recipientAddress: shippingInfo.receiverAddress || '',
            recipientApartment: shippingInfo.receiverApartment || '',
            recipientCity: shippingInfo.receiverCity || '',
            recipientState: shippingInfo.receiverState || '',
            recipientZipCode: shippingInfo.receiverZipCode || ''
          };
        }

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: key || RAZORPAY_CONFIG.keyId, // Use server-provided key or fallback
        amount: amount,
        currency: orderCurrency,
        name: "Spring Blossoms Florist",
        description: "Flower Delivery Service",
        order_id: order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Debug: Log the complete Razorpay response
            console.log('🔍 Complete Razorpay Response:', response);
            console.log('🔍 Razorpay Response Keys:', Object.keys(response));
            
            // Validate required Razorpay response data
            if (!response.razorpay_order_id) {
              console.error('❌ Missing razorpay_order_id in response');
              throw new Error('Payment response missing order ID');
            }
            
            if (!response.razorpay_payment_id) {
              console.error('❌ Missing razorpay_payment_id in response');
              throw new Error('Payment response missing payment ID');
            }
            
            if (!response.razorpay_signature) {
              console.error('❌ Missing razorpay_signature in response');
              throw new Error('Payment response missing signature');
            }
            
            console.log('✅ All Razorpay response data present:', {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature ? 'present' : 'missing'
            });
            
            // Verify payment
            const verificationResponse = await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData
            });

            if (verificationResponse.data.success) {
              console.log('✅ Payment verification successful, preparing for redirection');
              
              // Store order data for confirmation page
              const orderData = verificationResponse.data.order;
              localStorage.setItem('lastOrder', JSON.stringify(orderData));
              console.log('💾 Order data stored in localStorage');
              
              // Set a flag in sessionStorage to indicate successful payment
              sessionStorage.setItem('from_payment', 'true');
              
              // Clear cart and related data
              clearCart();
              localStorage.removeItem('appliedPromoCode');
              localStorage.removeItem('shippingInfo');
              console.log('🧹 Cart and related data cleared');
              
              // Add notification
              addNotification({
                type: 'order',
                title: 'Payment Successful!',
                message: `Your order #${orderData.orderNumber} has been confirmed.`
              });
              console.log('🔔 Success notification added');

              // Ensure we're in the correct context for navigation
              setTimeout(() => {
                console.log('🚀 Navigating to confirmation page');
                navigate('/checkout/confirmation?order=true', { replace: true });
              }, 100);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment verification failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone
        },
        theme: {
          color: "#3B82F6"
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            console.log('🚫 Payment dialog closed by user');
            setIsProcessing(false);
            toast({
              title: "Payment cancelled",
              description: "Payment was cancelled. You can try again.",
              variant: "default",
            });
          }
        }
      };

      // Initialize and open Razorpay with error handling
      try {
        console.log('🔄 Initializing Razorpay with options:', {
          ...options,
          key: options.key ? 'VALID_KEY_PRESENT' : 'MISSING_KEY',
          amount: options.amount,
          currency: options.currency,
          order_id: options.order_id
        });
        
        const rzp = new window.Razorpay(options);
        
        // Add error event handler
        rzp.on('payment.failed', function (response: any) {
          console.error('💳 Payment failed:', response.error);
          toast({
            title: "Payment Failed",
            description: response.error.description || "Your payment could not be processed. Please try again.",
            variant: "destructive",
          });
        });
        
        // Add event handler for when modal opens to scroll to it
        rzp.on('modal.opened', function () {
          console.log('🔍 Razorpay modal opened, scrolling to payment popup');
          
          // Function to scroll to payment popup
          const scrollToPaymentPopup = () => {
            const isMobile = window.innerWidth <= 768;
            
            // First scroll to top to ensure popup is visible
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
            
            // Look for Razorpay modal elements and scroll to them
            setTimeout(() => {
              // Try multiple selectors for Razorpay modal
              const selectors = [
                '.razorpay-container',
                '.razorpay-checkout-frame',
                '[data-razorpay]',
                '.razorpay-modal',
                'iframe[src*="razorpay"]'
              ];
              
              let modalFound = false;
              for (const selector of selectors) {
                const modalElement = document.querySelector(selector);
                if (modalElement) {
                  console.log('🎯 Found Razorpay modal element:', selector);
                  
                  // Different scroll behavior for mobile vs desktop
                  if (isMobile) {
                    // On mobile, scroll to center and ensure it's fully visible
                    modalElement.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });
                    
                    // Additional mobile-specific adjustments
                    setTimeout(() => {
                      // Ensure the modal is not cut off by mobile browser UI
                      const modalRect = modalElement.getBoundingClientRect();
                      const viewportHeight = window.innerHeight;
                      const mobileOffset = 60; // Account for mobile browser UI
                      
                      if (modalRect.top < mobileOffset) {
                        window.scrollBy({
                          top: mobileOffset - modalRect.top,
                          behavior: 'smooth'
                        });
                      }
                    }, 100);
                  } else {
                    // Desktop behavior
                    modalElement.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }
                  
                  modalFound = true;
                  break;
                }
              }
              
              // If no specific modal found, scroll to any iframe (Razorpay uses iframe)
              if (!modalFound) {
                const iframes = document.querySelectorAll('iframe');
                if (iframes.length > 0) {
                  console.log('🎯 Found iframe, scrolling to it');
                  const lastIframe = iframes[iframes.length - 1];
                  
                  if (isMobile) {
                    // Mobile-specific iframe handling
                    lastIframe.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });
                    
                    // Ensure iframe is properly positioned on mobile
                    setTimeout(() => {
                      const iframeRect = lastIframe.getBoundingClientRect();
                      const viewportHeight = window.innerHeight;
                      const mobileOffset = 60;
                      
                      if (iframeRect.top < mobileOffset) {
                        window.scrollBy({
                          top: mobileOffset - iframeRect.top,
                          behavior: 'smooth'
                        });
                      }
                    }, 100);
                  } else {
                    lastIframe.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }
                }
              }
            }, isMobile ? 300 : 200); // Longer delay on mobile
          };
          
          // Execute scroll function
          scrollToPaymentPopup();
          
          // Also try again after a longer delay to ensure modal is fully rendered
          // Longer delay on mobile to account for slower rendering
          setTimeout(scrollToPaymentPopup, isMobile ? 800 : 500);
        });
        
        // Set up a MutationObserver to detect when Razorpay popup appears
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  // Check if this is a Razorpay-related element
                  if (
                    element.classList.contains('razorpay-container') ||
                    element.classList.contains('razorpay-checkout-frame') ||
                    element.getAttribute('data-razorpay') ||
                    (element.tagName === 'IFRAME' && element.getAttribute('src')?.includes('razorpay'))
                  ) {
                    console.log('🎯 Razorpay popup detected in DOM, scrolling to it');
                    const isMobile = window.innerWidth <= 768;
                    
                    setTimeout(() => {
                      if (isMobile) {
                        // Mobile-specific scroll behavior
                        element.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center'
                        });
                        
                        // Additional mobile adjustments
                        setTimeout(() => {
                          const elementRect = element.getBoundingClientRect();
                          const mobileOffset = 60; // Account for mobile browser UI
                          
                          if (elementRect.top < mobileOffset) {
                            window.scrollBy({
                              top: mobileOffset - elementRect.top,
                              behavior: 'smooth'
                            });
                          }
                        }, 150);
                      } else {
                        // Desktop behavior
                        element.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center'
                        });
                      }
                    }, isMobile ? 200 : 100); // Longer delay on mobile
                  }
                }
              });
            }
          });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // Clean up observer after 10 seconds
        setTimeout(() => {
          observer.disconnect();
        }, 10000);
        
        rzp.open();
      } catch (rzpError) {
        console.error('💥 Razorpay initialization error:', rzpError);
        toast({
          title: "Payment System Error",
          description: "Could not initialize payment system. Please try again later.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment failed",
        description: error.response?.data?.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const formatTimeSlot = (timeSlot: string) => {
    const timeSlots: { [key: string]: string } = {
      'morning': '9:00 AM - 12:00 PM',
      'afternoon': '1:00 PM - 4:00 PM',
      'evening': '5:00 PM - 8:00 PM',
      'midnight': '12:00 AM - 3:00 AM'
    };
    return timeSlots[timeSlot] || timeSlot;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Progress Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                <Check className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Shipping</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500"></div>
              <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-primary">Payment</span>
                </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">Confirmation</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Methods */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Security Notice */}
                    <Alert className="border-green-200 bg-green-50">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        Your payment is secured with 256-bit SSL encryption. We don't store your card details.
                      </AlertDescription>
                    </Alert>

                    {/* Payment Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <CreditCard className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-center">Cards</p>
                        <p className="text-xs text-gray-600 text-center">Visa, Mastercard, etc.</p>
          </div>
          
                      <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Smartphone className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-center">UPI</p>
                        <p className="text-xs text-gray-600 text-center">GPay, PhonePe, etc.</p>
                      </div>
                      
                      <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Building2 className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-center">Net Banking</p>
                        <p className="text-xs text-gray-600 text-center">All major banks</p>
                  </div>
                  
                      <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-center">Wallets</p>
                        <p className="text-xs text-gray-600 text-center">Paytm, Amazon Pay</p>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing || !isRazorpayLoaded}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 text-lg"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          Pay {formatPrice(convertPrice(orderTotal))} Securely
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-600 text-center">
                      By clicking "Pay Securely", you agree to our terms and conditions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Promo Code Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                              <PromoCodeInput
                                orderAmount={convertPrice(orderTotal)}
                                orderItems={items}
                                userId={user?.id}
                                onPromoCodeApplied={handlePromoCodeApplied}
                                onPromoCodeRemoved={handlePromoCodeRemoved}
                                appliedPromoCode={appliedPromoCode}
                              />
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Details */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle 
                    className="flex items-center justify-between cursor-pointer lg:cursor-default"
                    onClick={() => setShowShippingDetails(!showShippingDetails)}
                  >
                    <span className="flex items-center gap-2 text-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                      Shipping Details
                    </span>
                    <div className="lg:hidden">
                      {showShippingDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <AnimatePresence>
                  <motion.div
                    initial={{ height: showShippingDetails ? 'auto' : 0 }}
                    animate={{ height: showShippingDetails || window.innerWidth >= 1024 ? 'auto' : 0 }}
                    className="lg:!h-auto overflow-hidden"
                  >
                    <CardContent className="space-y-4">
                      {shippingInfo && (
                        <>
                          {/* Customer Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Customer</p>
                              <p className="text-sm">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                              <p className="text-sm text-gray-600">{shippingInfo.email}</p>
                              <p className="text-sm text-gray-600">{shippingInfo.phone}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                              {shippingInfo.deliveryOption === 'gift' ? (
                                <div>
                                  <p className="text-sm">{shippingInfo.receiverFirstName} {shippingInfo.receiverLastName}</p>
                                  <p className="text-sm text-gray-600">{shippingInfo.receiverAddress}</p>
                                  <p className="text-sm text-gray-600">{shippingInfo.receiverCity}, {shippingInfo.receiverState} - {shippingInfo.receiverZipCode}</p>
                                  <p className="text-sm text-gray-600">{shippingInfo.receiverPhone}</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-gray-600">{shippingInfo.address}</p>
                                  {shippingInfo.apartment && <p className="text-sm text-gray-600">{shippingInfo.apartment}</p>}
                                  <p className="text-sm text-gray-600">{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.zipCode}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Delivery Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Delivery Time</p>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <p className="text-sm">{formatTimeSlot(shippingInfo.timeSlot)}</p>
                              </div>
                              {shippingInfo.timeSlot === 'midnight' && (
                                <Badge variant="secondary" className="mt-1">
                                  Midnight Delivery (+₹300)
                                </Badge>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-700">Delivery Type</p>
                              <div className="flex items-center gap-2">
                                {shippingInfo.deliveryOption === 'gift' ? (
                                  <>
                                    <User className="w-4 h-4 text-primary" />
                                    <p className="text-sm">Gift Delivery</p>
                                  </>
                                ) : (
                                  <>
                                    <User className="w-4 h-4 text-primary" />
                                    <p className="text-sm">Self Delivery</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Gift Message */}
                          {shippingInfo.deliveryOption === 'gift' && shippingInfo.giftMessage && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Gift Message</p>
                                <p className="text-sm text-gray-600 italic">"{shippingInfo.giftMessage}"</p>
                              </div>
                            </>
                          )}

                          {/* Edit Button */}
                          <div className="pt-2">
                  <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/checkout/shipping')}
                            >
                              Edit Details
                  </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </motion.div>
            </div>
            
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div variants={itemVariants} className="sticky top-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="lg:hidden">
                  <CardTitle 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowOrderSummary(!showOrderSummary)}
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Order Summary
                    </span>
                    {showOrderSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CardTitle>
                </CardHeader>
                
                <div className="hidden lg:block">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                </div>

                <AnimatePresence>
                  <motion.div
                    initial={{ height: showOrderSummary ? 'auto' : 0 }}
                    animate={{ height: showOrderSummary || window.innerWidth >= 1024 ? 'auto' : 0 }}
                    className="lg:!h-auto overflow-hidden"
                  >
                    <CardContent className="space-y-4">
                                             {/* Order Items */}
                       <div className="space-y-3">
                         {items.map((item) => (
                           <div key={item._id} className="space-y-2">
                             <div className="flex items-center space-x-3">
                               <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                 <img 
                                   src={item.images && item.images.length > 0 ? item.images[0] : '/api/placeholder/64/64'} 
                                   alt={item.title}
                                   className="w-full h-full object-cover"
                                   onError={(e) => {
                                     e.currentTarget.src = '/api/placeholder/64/64';
                                   }}
                                 />
                               </div>
                               <div className="flex-1">
                                 <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                   {item.title}
                                 </h4>
                                 <p className="text-sm text-gray-600">
                                   Qty: {item.quantity}
                                 </p>
                               </div>
                               <div className="text-sm font-medium">
                                 <span className={cn(
  item.discount > 0 ? "text-red-600" : "text-black",
  "font-bold"
)}>
  {formatPrice(convertPrice(item.price * item.quantity))}
</span>
                               </div>
                             </div>
                             
                             {/* Customization Details */}
                             {item.customizations && (
                               <div className="ml-15 pl-3 border-l-2 border-purple-200 space-y-1">
                                 {item.customizations.number && (
                                   <div className="text-xs text-gray-600">
                                     Number: {item.customizations.number}
                                   </div>
                                 )}
                                 {item.customizations.messageCard && (
                                   <div className="text-xs text-gray-600">
                                     Message: "{item.customizations.messageCard}"
                                   </div>
                                 )}
                                 {item.customizations.selectedFlowers && item.customizations.selectedFlowers.length > 0 && (
                                   <div className="text-xs text-pink-600">
                                     🌸 {item.customizations.selectedFlowers.map((f: any) => `${f.name}${(f.quantity || 1) > 1 ? `×${f.quantity || 1}` : ''}`).join(', ')}
                                   </div>
                                 )}
                                 {item.customizations.selectedChocolates && item.customizations.selectedChocolates.length > 0 && (
                                   <div className="text-xs text-orange-600">
                                     🍫 {item.customizations.selectedChocolates.map((c: any) => `${c.name}${(c.quantity || 1) > 1 ? `×${c.quantity || 1}` : ''}`).join(', ')}
                                   </div>
                                 )}
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                  
                      <Separator />

                      {/* Order Totals */}
                      <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{formatPrice(convertPrice(subtotal))}</span>
                    </div>

                        {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                            <span>Midnight Delivery Fee</span>
                            <span>{formatPrice(convertPrice(deliveryFee))}</span>
                    </div>
                        )}
                        
                        {appliedPromoCode && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Promo Discount ({appliedPromoCode.code})</span>
                            <span>-{formatPrice(convertPrice(promoDiscount))}</span>
                    </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(convertPrice(orderTotal))}</span>
                    </div>
                  </div>

                      {/* Security Badge */}
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                          <Shield className="w-4 h-4" />
                          Secure Payment
                        </div>
                        <p className="text-green-600 text-xs">
                          Protected by 256-bit SSL encryption
                        </p>
                  </div>
                </CardContent>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPaymentPage;
