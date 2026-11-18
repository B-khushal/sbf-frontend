import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Gift,
  Loader2,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PromoCodeInput from '@/components/PromoCodeInput';
import {
  MobileCheckoutBar,
  PaymentMethodCard,
  type PriceBreakdownLine,
} from '@/components/checkout';
import useCart, { useCartSelectors } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  useRazorpayCheckout,
  type PaymentMethodPreference,
} from '@/hooks/use-razorpay-checkout';
import type { PromoCodeValidationResult } from '@/services/promoCodeService';
import { getImageUrl } from '@/config';
import { cn } from '@/lib/utils';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  addressType?: string;
  address: string;
  houseNo?: string;
  apartment?: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode: string;
  pincode?: string;
  notes?: string;
  cardRecipient?: string;
  cardSender?: string;
  cardMessage?: string;
  deliverySpecialInstructions?: string;
  timeSlot: string;
  selectedTimeSlot?: string;
  deliveryType?: string;
  deliveryOption?: string;
  deliveryFee?: number;
  giftPackaging?: boolean;
  giftPackagingFee?: number;
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
  isFirstOrderFreeDelivery?: boolean;
  greetingCard?: string;
  surpriseDelivery?: boolean;
  anonymousGift?: boolean;
  preferredPaymentMethod?: PaymentMethodPreference;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  country?: string;
  floor?: string;
  deliveryInstructions?: string;
}

const SLOT_LABELS: Record<string, string> = {
  same_day: 'Standard Delivery (9:00 AM – 9:00 PM)',
  standard: 'Standard Delivery (9:00 AM – 9:00 PM)',
  morning: 'Morning (9:00 AM – 12:00 PM)',
  afternoon: 'Afternoon (1:00 PM – 4:00 PM)',
  late_afternoon: 'Late Afternoon (3:00 PM – 6:00 PM)',
  evening: 'Evening (5:00 PM – 8:00 PM)',
  midnight: 'Midnight Express (10:00 PM – 12:00 AM)',
};

const CheckoutPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { subtotal, itemCount } = useCartSelectors();
  const { formatPrice, convertPrice, rate } = useCurrency();
  const { user } = useAuth();
  const {
    isRazorpayLoaded,
    isProcessing,
    paymentError,
    clearPaymentError,
    initiatePayment,
  } = useRazorpayCheckout();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodPreference>('upi');
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
    promoCodeId?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shippingInfo');
      if (!saved) {
        navigate('/checkout/shipping', { replace: true });
        return;
      }
      const parsed: ShippingInfo = JSON.parse(saved);
      if (parsed.preferredPaymentMethod) {
        setPaymentMethod(parsed.preferredPaymentMethod);
      }
      setShippingInfo(parsed);
    } catch {
      navigate('/checkout/shipping', { replace: true });
    }

    try {
      const savedPromo = localStorage.getItem('appliedPromoCode');
      if (savedPromo) setAppliedPromoCode(JSON.parse(savedPromo));
    } catch {
      localStorage.removeItem('appliedPromoCode');
    }
  }, [navigate]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  const deliveryFee = Number(shippingInfo?.deliveryFee || 0);
  const promoDiscount = appliedPromoCode ? Number(appliedPromoCode.discount || 0) : 0;
  const orderTotal = Math.max(0, subtotal + deliveryFee - promoDiscount);

  const handlePromoCodeApplied = (result: PromoCodeValidationResult) => {
    if (result.success && result.data) {
      const data = {
        code: result.data.promoCode.code,
        discount: result.data.discount.amount,
        finalAmount: result.data.order.finalAmount,
      };
      setAppliedPromoCode(data);
      localStorage.setItem('appliedPromoCode', JSON.stringify(data));
    }
  };

  const handlePromoCodeRemoved = () => {
    setAppliedPromoCode(null);
    localStorage.removeItem('appliedPromoCode');
  };

  const handlePayNow = async () => {
    clearPaymentError();
    if (!shippingInfo) {
      navigate('/checkout/shipping');
      return;
    }

    const isGift = shippingInfo.deliveryOption === 'gift';
    const fName = isGift
      ? shippingInfo.receiverFirstName || shippingInfo.firstName || 'Customer'
      : shippingInfo.firstName || 'Customer';
    const lName = isGift
      ? shippingInfo.receiverLastName || shippingInfo.lastName || ''
      : shippingInfo.lastName || '';
    const fullCustName = `${fName} ${lName}`.trim() || shippingInfo.fullName || 'Customer';
    const custAddr = isGift
      ? shippingInfo.receiverAddress || shippingInfo.address || ''
      : shippingInfo.address || '';
    const custApt = isGift
      ? shippingInfo.receiverApartment || shippingInfo.apartment || ''
      : shippingInfo.apartment || '';
    const custCity = isGift
      ? shippingInfo.receiverCity || shippingInfo.city || 'Hyderabad'
      : shippingInfo.city || 'Hyderabad';
    const custState = isGift
      ? shippingInfo.receiverState || shippingInfo.state || 'Telangana'
      : shippingInfo.state || 'Telangana';
    const custZip = isGift
      ? shippingInfo.receiverZipCode || shippingInfo.zipCode || shippingInfo.pincode || ''
      : shippingInfo.zipCode || shippingInfo.pincode || '';
    const custPhone =
      (isGift ? shippingInfo.receiverPhone || shippingInfo.phone : shippingInfo.phone) ||
      user?.phone ||
      '';
    const custEmail =
      (isGift ? shippingInfo.receiverEmail || shippingInfo.email : shippingInfo.email) ||
      user?.email ||
      '';

    const orderData: Record<string, unknown> = {
      customerName: isGift
        ? shippingInfo.fullName || `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim() || fullCustName
        : fullCustName,
      customerEmail: shippingInfo.email || custEmail,
      customerPhone: shippingInfo.phone || custPhone,
      items: items.map((item) => ({
        product: item.productId || item._id,
        productModel: item.productModel || 'Product',
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        finalPrice: item.price,
        customizations: item.customizations || null,
        characterCount: item.customizations?.personalization?.characterCount || 0,
        image: item.image || item.images?.[0] || '',
        images: item.images || [],
        selectedVariant: item.selectedVariant || null,
      })),
      shippingDetails: {
        fullName: fullCustName,
        firstName: fName,
        lastName: lName,
        email: shippingInfo.email || custEmail,
        phone: custPhone,
        alternatePhone: shippingInfo.alternatePhone || '',
        addressType: shippingInfo.addressType || 'home',
        address: custAddr,
        apartment: custApt,
        houseNo: shippingInfo.houseNo || '',
        landmark: shippingInfo.landmark || '',
        floor: shippingInfo.floor || '',
        city: custCity,
        state: custState,
        zipCode: custZip,
        pincode: custZip,
        country: shippingInfo.country || 'India',
        formattedAddress: shippingInfo.formattedAddress || custAddr,
        latitude: shippingInfo.latitude,
        longitude: shippingInfo.longitude,
        notes: shippingInfo.deliverySpecialInstructions || shippingInfo.notes || '',
        deliveryInstructions:
          shippingInfo.deliveryInstructions || shippingInfo.deliverySpecialInstructions || '',
        deliverySpecialInstructions:
          shippingInfo.deliverySpecialInstructions || shippingInfo.notes || '',
        cardMessage: shippingInfo.cardMessage || shippingInfo.giftMessage || '',
        cardSender: shippingInfo.cardSender || '',
        cardRecipient: shippingInfo.cardRecipient || '',
        deliveryDate: shippingInfo.selectedDate ? new Date(shippingInfo.selectedDate) : new Date(),
        timeSlot: shippingInfo.selectedTimeSlot || shippingInfo.timeSlot || 'same_day',
        deliveryType: shippingInfo.deliveryType || 'Standard Delivery',
        surpriseDelivery: Boolean(shippingInfo.surpriseDelivery),
        anonymousGift: Boolean(shippingInfo.anonymousGift),
        giftPackaging: false,
        giftPackagingFee: 0,
      },
      totalAmount: orderTotal,
      subtotal,
      deliveryCharge: deliveryFee,
      giftPackaging: false,
      giftPackagingFee: 0,
      discount: promoDiscount,
      finalTotal: orderTotal,
      isFirstOrderFreeDelivery: Boolean(shippingInfo.isFirstOrderFreeDelivery),
      currency: 'INR',
      currencyRate: rate || 1,
      originalCurrency: 'INR',
      promoCode: appliedPromoCode
        ? {
            code: appliedPromoCode.code,
            discountAmount: appliedPromoCode.discount,
            promoCodeId: appliedPromoCode.promoCodeId,
          }
        : undefined,
    };

    if (
      isGift ||
      shippingInfo.giftMessage ||
      shippingInfo.cardMessage ||
      shippingInfo.receiverFirstName ||
      shippingInfo.surpriseDelivery ||
      shippingInfo.anonymousGift
    ) {
      orderData.giftDetails = {
        message: shippingInfo.cardMessage || shippingInfo.giftMessage || '',
        recipientName:
          shippingInfo.cardRecipient ||
          `${shippingInfo.receiverFirstName || ''} ${shippingInfo.receiverLastName || ''}`.trim() ||
          fullCustName,
        senderName:
          shippingInfo.cardSender ||
          shippingInfo.fullName ||
          `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim(),
        senderPhone: shippingInfo.phone || '',
        senderEmail: shippingInfo.email || '',
        recipientEmail: shippingInfo.receiverEmail || '',
        recipientPhone: shippingInfo.receiverPhone || custPhone,
        recipientAlternatePhone: shippingInfo.alternatePhone || '',
        recipientAddress: shippingInfo.receiverAddress || custAddr,
        recipientApartment: shippingInfo.receiverApartment || custApt,
        recipientCity: shippingInfo.receiverCity || custCity,
        recipientState: shippingInfo.receiverState || custState,
        recipientZipCode: shippingInfo.receiverZipCode || custZip,
        giftPackaging: false,
        giftPackagingFee: 0,
        surpriseDelivery: Boolean(shippingInfo.surpriseDelivery),
        anonymousGift: Boolean(shippingInfo.anonymousGift),
        latitude: shippingInfo.latitude,
        longitude: shippingInfo.longitude,
        formattedAddress: shippingInfo.formattedAddress || custAddr,
        country: shippingInfo.country || 'India',
        pincode: custZip,
        landmark: shippingInfo.landmark || '',
        houseNo: shippingInfo.houseNo || '',
        deliveryInstructions:
          shippingInfo.deliveryInstructions || shippingInfo.deliverySpecialInstructions || '',
      };
    }

    await initiatePayment({
      orderTotal,
      orderData,
      prefill: {
        name: shippingInfo.fullName || fullCustName || user?.name || 'Customer',
        email: shippingInfo.email || user?.email || '',
        contact: shippingInfo.phone || user?.phone || '',
      },
      preferredMethod: paymentMethod,
    });
  };

  const priceBreakdownLines: PriceBreakdownLine[] = useMemo(() => {
    const lines: PriceBreakdownLine[] = [
      { label: `Items Subtotal (${itemCount})`, amount: subtotal },
    ];
    if (promoDiscount > 0 && appliedPromoCode) {
      lines.push({
        label: `Coupon (${appliedPromoCode.code})`,
        amount: promoDiscount,
        isDiscount: true,
      });
    }
    const slotKey = shippingInfo?.selectedTimeSlot || shippingInfo?.timeSlot || 'same_day';
    const isMidnight = slotKey === 'midnight';
    const isFixed = ['morning', 'afternoon', 'late_afternoon', 'evening', 'fixed', 'fixed_time'].includes(slotKey);
    const deliveryLabel = isMidnight
      ? 'Midnight Express Delivery'
      : isFixed
      ? 'Fixed-Time Slot Delivery'
      : 'Same-Day Standard Delivery';

    if (shippingInfo?.isFirstOrderFreeDelivery && deliveryFee === 0) {
      lines.push({
        label: deliveryLabel,
        amount: 0,
        isFree: true,
        strikeAmount: isMidnight ? 300 : 150,
      });
    } else if (deliveryFee === 0) {
      lines.push({ label: deliveryLabel, amount: 0, isFree: true });
    } else {
      lines.push({ label: deliveryLabel, amount: deliveryFee });
    }
    return lines;
  }, [itemCount, subtotal, promoDiscount, appliedPromoCode, shippingInfo, deliveryFee]);

  const parsedDeliveryDate = shippingInfo?.selectedDate ? new Date(shippingInfo.selectedDate) : null;
  const displaySlot =
    SLOT_LABELS[shippingInfo?.selectedTimeSlot || shippingInfo?.timeSlot || 'same_day'] ||
    shippingInfo?.deliveryType ||
    'Standard Delivery';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B18] overflow-x-clip">
      <Navigation />

      <main className="mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-36 lg:pb-16">
        {/* Top Back + 3-Step Progress */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/checkout/shipping')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#6F665E] hover:text-[#BE185D]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Edit Shipping Details</span>
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF3EE] px-3 py-1 text-[11px] font-semibold text-[#2E573A] border border-[#CBE0D0]">
              <Lock className="h-3.5 w-3.5" />
              256-Bit Encrypted
            </span>
          </div>

          <nav aria-label="Checkout progress" className="mx-auto max-w-md">
            <ol className="flex items-center justify-between">
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3F6349] text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#3F6349]">Shipping</span>
              </li>
              <li className="h-[2px] flex-1 mx-2 sm:mx-3 rounded-full bg-[#BE185D]" aria-hidden="true" />
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#BE185D] text-xs font-bold text-white shadow-sm">
                  2
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#BE185D]">Payment</span>
              </li>
              <li className="h-[2px] flex-1 mx-2 sm:mx-3 rounded-full bg-[#E5DDD5]" aria-hidden="true" />
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DFD5CA] bg-white text-xs font-semibold text-[#7A7168]">
                  3
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#7A7168]">Confirmed</span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          {/* Left Column */}
          <div className="space-y-5 lg:col-span-7 xl:col-span-8 min-w-0">
            {/* Delivery Summary Review Card */}
            {shippingInfo && (() => {
              const isGiftOrder = shippingInfo.deliveryOption === 'gift';
              const recipientDisplayName = isGiftOrder
                ? `${shippingInfo.receiverFirstName || ''} ${shippingInfo.receiverLastName || ''}`.trim() ||
                  shippingInfo.fullName ||
                  'Recipient'
                : shippingInfo.fullName || `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim();
              const recipientDisplayPhone = isGiftOrder
                ? shippingInfo.receiverPhone || shippingInfo.phone
                : shippingInfo.phone;
              const senderDisplayName =
                shippingInfo.fullName || `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim();

              return (
                <section className="rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,27,24,0.04)] space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#F3ECE5] pb-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]',
                        isGiftOrder ? 'text-[#BE185D]' : 'text-[#8A8076]'
                      )}
                    >
                      {isGiftOrder && <Gift className="h-3.5 w-3.5" />}
                      {isGiftOrder ? 'Gift Delivering To (Receiver)' : 'Delivering To'}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/checkout/shipping')}
                      className="text-xs font-semibold text-[#BE185D] hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF0F5] text-[#BE185D]">
                      {isGiftOrder ? <Gift className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1 text-xs sm:text-sm text-[#5D544C]">
                      <p className="font-semibold text-[#1E1B18]">{recipientDisplayName}</p>
                      <p className="break-words">
                        {shippingInfo.formattedAddress ||
                          [
                            isGiftOrder ? shippingInfo.receiverApartment : shippingInfo.apartment,
                            isGiftOrder ? shippingInfo.receiverAddress : shippingInfo.address,
                            isGiftOrder ? shippingInfo.receiverCity : shippingInfo.city,
                            isGiftOrder ? shippingInfo.receiverState : shippingInfo.state,
                            isGiftOrder ? shippingInfo.receiverZipCode : shippingInfo.zipCode,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                      </p>
                      {recipientDisplayPhone && (
                        <p className="font-medium text-[#2E2824]">+91 {recipientDisplayPhone}</p>
                      )}
                      {isGiftOrder && senderDisplayName && (
                        <p className="pt-1 text-xs text-[#7A7168]">
                          Sender: <span className="font-medium text-[#3C342E]">{senderDisplayName}</span>
                          {shippingInfo.phone ? ` (+91 ${shippingInfo.phone})` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F3ECE5] text-xs">
                    {parsedDeliveryDate && isValid(parsedDeliveryDate) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F5] px-3 py-1 font-medium text-[#3C342E] border border-[#EDE5DD]">
                        <Calendar className="h-3.5 w-3.5 text-[#BE185D]" />
                        {format(parsedDeliveryDate, 'EEE, dd MMM yyyy')}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F5] px-3 py-1 font-medium text-[#3C342E] border border-[#EDE5DD]">
                      <Clock className="h-3.5 w-3.5 text-[#BE185D]" />
                      {displaySlot}
                    </span>
                  </div>
                </section>
              );
            })()}

            {/* Payment Method Selector */}
            <PaymentMethodCard
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />

            {/* Coupon Code */}
            <section className="rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,27,24,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#BE185D]" />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8A8076]">
                  Have a Coupon Code?
                </span>
              </div>
              <PromoCodeInput
                orderAmount={subtotal + deliveryFee}
                orderItems={items}
                userId={user?.id}
                onPromoCodeApplied={handlePromoCodeApplied}
                onPromoCodeRemoved={handlePromoCodeRemoved}
                appliedPromoCode={appliedPromoCode}
                disabled={isProcessing}
              />
            </section>

            {paymentError && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Payment Error</p>
                  <p className="mt-0.5">{paymentError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Order Summary */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[#EDE5DD] bg-white p-5 sm:p-6 shadow-[0_12px_36px_-12px_rgba(30,27,24,0.08)] space-y-5">
              <div className="flex items-center justify-between border-b border-[#F3ECE5] pb-3.5">
                <h2 className="font-['Playfair_Display'] text-lg sm:text-xl font-semibold text-[#1E1B18] flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#BE185D]" />
                  Order Summary
                </h2>
                <span className="rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-xs font-semibold text-[#5D544C] border border-[#EDE5DD]">
                  {itemCount} items
                </span>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => {
                  const rawImg = (Array.isArray(item.images) && item.images[0]) || item.image || '/placeholder.svg';
                  const src = rawImg.startsWith('/') ? rawImg : getImageUrl(rawImg, { width: 140, height: 140, crop: 'fill' });
                  return (
                    <div key={item._id || item.id} className="flex items-center gap-3">
                      <img
                        src={src}
                        alt={item.title}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover bg-[#F5F0EA] border border-[#EDE5DD]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-[#1E1B18] line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#7A7168]">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-[#1E1B18] tabular-nums shrink-0">
                        {formatPrice(convertPrice(item.price * item.quantity))}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Separator className="bg-[#EFE8E0]" />

              <div className="space-y-2.5">
                {priceBreakdownLines.map((line, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-[#5D544C]">{line.label}</span>
                    <span
                      className={cn(
                        'font-semibold tabular-nums',
                        line.isDiscount || line.isFree ? 'text-[#2E573A]' : 'text-[#1E1B18]'
                      )}
                    >
                      {line.isFree
                        ? 'FREE'
                        : line.isDiscount
                        ? `-${formatPrice(convertPrice(Math.abs(line.amount)))}`
                        : formatPrice(convertPrice(line.amount))}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="bg-[#EFE8E0]" />

              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-[#1E1B18]">Total Payable</span>
                <span className="text-2xl font-bold text-[#1E1B18] tabular-nums">
                  {formatPrice(convertPrice(orderTotal))}
                </span>
              </div>

              <Button
                type="button"
                disabled={isProcessing || !isRazorpayLoaded}
                onClick={handlePayNow}
                className="hidden lg:flex h-12 w-full rounded-xl bg-[#BE185D] text-sm font-bold tracking-wide text-white shadow-[0_8px_22px_-8px_rgba(190,24,93,0.55)] hover:bg-[#9D174D]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    PAY {formatPrice(convertPrice(orderTotal))} NOW
                  </>
                )}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A7168]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#3F6349]" />
                Secured & Verified by Razorpay
              </p>
            </div>
          </aside>
        </div>
      </main>

      <MobileCheckoutBar
        totalAmount={orderTotal}
        ctaLabel="PAY & PLACE ORDER"
        isLoading={isProcessing}
        disabled={!isRazorpayLoaded}
        breakdownLines={priceBreakdownLines}
        onPlaceOrder={handlePayNow}
      />

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default CheckoutPaymentPage;
