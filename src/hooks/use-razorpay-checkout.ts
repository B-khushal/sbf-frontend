import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/services/api';
import { RAZORPAY_CONFIG } from '@/config/razorpay';
import { useToast } from '@/hooks/use-toast';
import { useNotification } from '@/contexts/NotificationContext';
import useCart from '@/hooks/use-cart';
import usePendingReviewStore from '@/hooks/use-pending-review';

export type PaymentMethodPreference = 'all' | 'upi' | 'card' | 'netbanking' | 'wallet';

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureEvent {
  error?: {
    description?: string;
    reason?: string;
  };
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  method?: {
    upi: boolean;
    card: boolean;
    netbanking: boolean;
    wallet: boolean;
  };
  modal: {
    confirm_close: boolean;
    ondismiss: () => void;
  };
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
}

interface RazorpayInstance {
  on: (event: string, callback: (payload: RazorpayFailureEvent) => void) => void;
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

interface WindowWithRazorpay extends Window {
  Razorpay?: RazorpayConstructor;
}

const getRazorpayConstructor = (): RazorpayConstructor | undefined => {
  if (typeof window === 'undefined') return undefined;
  return (window as WindowWithRazorpay).Razorpay;
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const axiosLike = error as { response?: { data?: { message?: string } }; message?: string };
    if (axiosLike.response?.data?.message) return axiosLike.response.data.message;
    if (axiosLike.message) return axiosLike.message;
  }
  return fallback;
};

export interface InitiateRazorpayParams {
  orderTotal: number;
  orderData: Record<string, unknown>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  preferredMethod?: PaymentMethodPreference;
}

export const useRazorpayCheckout = () => {
  const { toast } = useToast();
  const { addNotification } = useNotification();
  const { clearCart } = useCart();

  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState<boolean>(
    () => Boolean(getRazorpayConstructor())
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const submissionLockRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (getRazorpayConstructor()) {
      setIsRazorpayLoaded(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      const handleLoad = () => setIsRazorpayLoaded(true);
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => {
      setPaymentError('Unable to load payment gateway. Please check your internet connection and try again.');
    };
    document.body.appendChild(script);
  }, []);

  const releaseLocks = useCallback(() => {
    submissionLockRef.current = false;
    setIsProcessing(false);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  const initiatePayment = useCallback(
    async ({ orderTotal, orderData, prefill, preferredMethod = 'all' }: InitiateRazorpayParams) => {
      // Prevent duplicate concurrent payment submissions
      if (submissionLockRef.current || isProcessing) {
        return;
      }

      if (usePendingReviewStore.getState().hasPendingReview) {
        usePendingReviewStore.getState().openDrawer(
          'Review Required: Please review your delivered bouquet first before completing payment!'
        );
        toast({
          title: 'Review Required Before Purchase',
          description: 'Please share your review on your previous delivered bouquet to proceed.',
          variant: 'destructive',
        });
        return;
      }

      const RazorpayCtor = getRazorpayConstructor();
      if (!isRazorpayLoaded || !RazorpayCtor) {
        toast({
          title: 'Payment Gateway Loading',
          description: 'Please wait a second while our secure payment gateway finishes loading.',
          variant: 'destructive',
        });
        return;
      }

      if (!orderTotal || orderTotal <= 0) {
        toast({
          title: 'Invalid Order Total',
          description: 'Please review your cart items before placing an order.',
          variant: 'destructive',
        });
        return;
      }

      submissionLockRef.current = true;
      setIsProcessing(true);
      setPaymentError(null);

      try {
        const orderResponse = await api.post('/orders/create-razorpay-order', {
          amount: Math.round(orderTotal * 100),
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          orderData,
        });

        const { order_id, amount, currency: orderCurrency, key } = orderResponse.data || {};
        if (!order_id || !amount || !orderCurrency) {
          throw new Error('Could not initialize payment order. Please try again.');
        }

        const methodConfig =
          preferredMethod === 'all'
            ? undefined
            : {
                upi: preferredMethod === 'upi',
                card: preferredMethod === 'card',
                netbanking: preferredMethod === 'netbanking',
                wallet: preferredMethod === 'wallet',
              };

        const options: RazorpayCheckoutOptions = {
          key: key || RAZORPAY_CONFIG.keyId,
          amount,
          currency: orderCurrency,
          name: 'Spring Blossoms Florist',
          description: 'Fresh Flowers & Handcrafted Gifts',
          order_id,
          prefill: {
            name: prefill.name || 'Customer',
            email: prefill.email || '',
            contact: prefill.contact || '',
          },
          theme: {
            color: '#BE185D',
          },
          ...(methodConfig ? { method: methodConfig } : {}),
          modal: {
            confirm_close: true,
            ondismiss: () => {
              releaseLocks();
              toast({
                title: 'Payment Cancelled',
                description: 'No amount was charged. You can complete your order whenever ready.',
              });
            },
          },
          handler: async (response: RazorpayPaymentResponse) => {
            try {
              if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
                throw new Error('Incomplete payment confirmation received from gateway.');
              }

              // Strictly verify payment server-side before confirming order
              const verificationResponse = await api.post('/orders/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData,
              });

              if (!verificationResponse.data?.success || !verificationResponse.data?.order) {
                throw new Error(verificationResponse.data?.message || 'Payment verification failed on server.');
              }

              const confirmedOrder = verificationResponse.data.order;
              const orderJSON = JSON.stringify(confirmedOrder);
              localStorage.setItem('lastOrder', orderJSON);
              sessionStorage.setItem('lastOrder', orderJSON);
              sessionStorage.setItem('from_payment', 'true');
              sessionStorage.setItem('backup_order', orderJSON);
              localStorage.removeItem('appliedPromoCode');
              localStorage.removeItem('shippingInfo');

              try {
                await clearCart();
              } catch (cartErr) {
                console.warn('Non-blocking cart clear warning:', cartErr);
              }

              addNotification({
                type: 'order',
                title: 'Order Confirmed!',
                message: `Your order #${confirmedOrder.orderNumber} has been confirmed.`,
              });

              releaseLocks();

              const confirmationUrl = `${window.location.origin}/checkout/confirmation`;
              window.setTimeout(() => {
                window.location.replace(confirmationUrl);
              }, 200);
            } catch (verifyErr: unknown) {
              const message = extractErrorMessage(
                verifyErr,
                'Payment verification failed. Please contact support if money was deducted.'
              );
              setPaymentError(message);
              releaseLocks();
              toast({
                title: 'Payment Verification Failed',
                description: message,
                variant: 'destructive',
              });
            }
          },
        };

        const rzp = new RazorpayCtor(options);
        rzp.on('payment.failed', (failure: RazorpayFailureEvent) => {
          const desc =
            failure?.error?.description ||
            'Your payment could not be processed. Please try another payment method or retry.';
          setPaymentError(desc);
          releaseLocks();
          toast({
            title: 'Payment Failed',
            description: desc,
            variant: 'destructive',
          });
        });

        rzp.open();
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          'Unable to start payment. Please check your details and try again.'
        );
        setPaymentError(message);
        releaseLocks();
        toast({
          title: 'Could Not Start Payment',
          description: message,
          variant: 'destructive',
        });
      }
    },
    [addNotification, clearCart, isProcessing, isRazorpayLoaded, releaseLocks, toast]
  );

  return {
    isRazorpayLoaded,
    isProcessing,
    paymentError,
    clearPaymentError: () => setPaymentError(null),
    initiatePayment,
  };
};
