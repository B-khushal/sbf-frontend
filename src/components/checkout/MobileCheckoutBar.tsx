import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface PriceBreakdownLine {
  label: string;
  amount: number;
  isDiscount?: boolean;
  isFree?: boolean;
  strikeAmount?: number;
}

export interface MobileCheckoutBarProps {
  totalAmount: number;
  ctaLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  breakdownLines: PriceBreakdownLine[];
  onPlaceOrder: () => void;
}

export const MobileCheckoutBar: React.FC<MobileCheckoutBarProps> = ({
  totalAmount,
  ctaLabel = 'PLACE ORDER',
  isLoading = false,
  disabled = false,
  breakdownLines,
  onPlaceOrder,
}) => {
  const { formatPrice, convertPrice } = useCurrency();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Backdrop when price breakdown sheet is expanded */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-[#1E1B18]/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-[#EDE5DD] bg-white/98 shadow-[0_-8px_30px_rgba(30,27,24,0.08)] backdrop-blur-md lg:hidden">
        {/* Expandable Price Breakdown Drawer */}
        {expanded && (
          <div className="border-b border-[#F3ECE5] bg-[#FAF8F5] px-4 py-3.5 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#EDE5DD]">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#7A7168]">
                Price Breakdown
              </span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-xs font-semibold text-[#BE185D]"
              >
                Close
              </button>
            </div>
            {breakdownLines.map((line, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#5D544C]">{line.label}</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    line.isDiscount || line.isFree ? 'text-[#2E573A]' : 'text-[#1E1B18]'
                  )}
                >
                  {line.isFree ? (
                    <span className="inline-flex items-center gap-1.5">
                      {line.strikeAmount && line.strikeAmount > 0 && (
                        <span className="text-[11px] font-normal text-[#9A9086] line-through">
                          {formatPrice(convertPrice(line.strikeAmount))}
                        </span>
                      )}
                      <span>FREE</span>
                    </span>
                  ) : line.isDiscount ? (
                    `-${formatPrice(convertPrice(Math.abs(line.amount)))}`
                  ) : (
                    formatPrice(convertPrice(line.amount))
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sticky Main Bar */}
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {/* Left: Total + Expandable Price Breakdown Trigger */}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="flex flex-col items-start text-left min-w-0 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D] rounded-lg"
          >
            <span className="text-lg font-bold leading-tight text-[#1E1B18] tabular-nums">
              {formatPrice(convertPrice(Math.max(0, totalAmount)))}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#BE185D]">
              <span>View Price Details</span>
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </span>
          </button>

          {/* Right: Prominent PLACE ORDER CTA */}
          <Button
            type="button"
            disabled={disabled || isLoading}
            onClick={onPlaceOrder}
            className="h-12 min-w-[164px] flex-1 max-w-[230px] rounded-xl bg-[#BE185D] px-5 text-sm font-bold tracking-wide text-white shadow-[0_6px_18px_-6px_rgba(190,24,93,0.5)] transition-all hover:bg-[#9D174D] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                {ctaLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileCheckoutBar;
