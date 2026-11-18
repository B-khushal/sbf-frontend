import React from 'react';
import {
  Building2,
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentMethodPreference } from '@/hooks/use-razorpay-checkout';

export interface PaymentMethodCardProps {
  selectedMethod: PaymentMethodPreference;
  onSelectMethod: (method: PaymentMethodPreference) => void;
  className?: string;
}

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethodPreference;
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'upi',
    title: 'UPI (GPay, PhonePe, Paytm)',
    subtitle: 'Instant payment via any UPI app or QR',
    badge: 'Fastest',
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    id: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay & Maestro',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'All major Indian banks supported',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    id: 'wallet',
    title: 'Wallets & Other Razorpay Options',
    subtitle: 'Amazon Pay, Mobikwik, Freecharge & more',
    icon: <Wallet className="h-5 w-5" />,
  },
];

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  selectedMethod,
  onSelectMethod,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,27,24,0.04)] space-y-4',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F3ECE5]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A8076]">
            Payment Method
          </span>
          <h3 className="mt-0.5 font-['Playfair_Display'] text-base sm:text-lg font-semibold text-[#1E1B18]">
            Choose How You'd Like to Pay
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF3EE] px-2.5 py-1 text-[11px] font-semibold text-[#2E573A] border border-[#CBE0D0]">
          <Lock className="h-3 w-3" />
          Razorpay Secured
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Payment method">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.id || (selectedMethod === 'all' && option.id === 'upi');
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectMethod(option.id)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
                isSelected
                  ? 'border-[#BE185D] bg-[#FFF7F9] ring-2 ring-[#BE185D]/15'
                  : 'border-[#EDE5DD] bg-white hover:border-[#D7C9BC] hover:bg-[#FAF8F5]'
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                  isSelected
                    ? 'bg-[#BE185D] text-white'
                    : 'bg-[#FAF8F5] text-[#6F665E] border border-[#EDE5DD]'
                )}
              >
                {option.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-semibold text-[#1E1B18]">
                    {option.title}
                  </span>
                  {option.badge && (
                    <span className="rounded-full bg-[#EDF3EE] px-2 py-0.5 text-[10px] font-semibold text-[#2E573A]">
                      {option.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] sm:text-xs text-[#7A7168]">{option.subtitle}</p>
              </div>

              <div
                className={cn(
                  'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                  isSelected
                    ? 'border-[#BE185D] bg-[#BE185D] text-white'
                    : 'border-[#CFC5BA] bg-white'
                )}
              >
                {isSelected && <Check className="h-2.5 w-2.5" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-[#FAF8F5] px-3.5 py-2.5 text-xs text-[#5D544C] border border-[#EDE5DD]">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#3F6349]" />
        <span>
          256-bit SSL encrypted checkout. Orders are confirmed only after server-side payment verification.
        </span>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
