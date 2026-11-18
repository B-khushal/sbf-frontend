import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Moon,
  Sparkles,
  Sun,
  Sunset,
  Truck,
} from 'lucide-react';
import { addDays, format, isBefore, isSameDay, isValid, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import holidayService, { type Holiday } from '@/services/holidayService';
import type { ServiceabilitySlot } from '@/services/orderService';
import { useCurrency } from '@/contexts/CurrencyContext';
import useCart from '@/hooks/use-cart';
import { useValentine } from '@/contexts/ValentineContext';

export interface DeliveryScheduleCardProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  backendSlots?: ServiceabilitySlot[];
  isFirstOrderFreeDelivery?: boolean;
  surpriseDelivery?: boolean;
  onToggleSurpriseDelivery?: (checked: boolean) => void;
  anonymousGift?: boolean;
  onToggleAnonymousGift?: (checked: boolean) => void;
  valSettings?: {
    sameDayEnabled?: boolean;
    sameDayCharge?: number;
    sameDayCutoff?: string;
    midnightEnabled?: boolean;
    midnightCharge?: number;
    midnightCutoff?: string;
    fixedTimeEnabled?: boolean;
    fixedTimeCharge?: number;
    surpriseEnabled?: boolean;
    surpriseCharge?: number;
    anonymousEnabled?: boolean;
    anonymousCharge?: number;
  };
  estimatedDeliveryText?: string;
  className?: string;
}

interface ResolvedSlot {
  id: string;
  label: string;
  time: string;
  extraCharge: number;
  cutoffHour: number;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

const getIstNow = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
};

export const DeliveryScheduleCard: React.FC<DeliveryScheduleCardProps> = ({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  backendSlots,
  isFirstOrderFreeDelivery = false,
  surpriseDelivery = false,
  onToggleSurpriseDelivery,
  anonymousGift = false,
  onToggleAnonymousGift,
  valSettings,
  estimatedDeliveryText,
  className,
}) => {
  const { items } = useCart();
  const { isValentineEnabled } = useValentine();
  const { formatPrice, convertPrice } = useCurrency();

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const hasValentine = items.some((item) => item.productType === 'valentine' || item.isValentineProduct);
  const valentineItems = items.filter((item) => item.productType === 'valentine' || item.isValentineProduct);
  const hasNoSameDayItem = items.some((item) => item.sameDay === false);

  const commonAvailableDates = useMemo(() => {
    if (valentineItems.length === 0) return null;
    let common = [...(valentineItems[0].availableDates || [])];
    for (let i = 1; i < valentineItems.length; i++) {
      const itemDates = valentineItems[i].availableDates || [];
      common = common.filter((d) => itemDates.includes(d));
    }
    return common.map((d) => d.trim().toLowerCase());
  }, [valentineItems]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDeliveryDate = useMemo(() => addDays(today, 90), [today]);

  useEffect(() => {
    let active = true;
    const years = Array.from(new Set([today.getFullYear(), maxDeliveryDate.getFullYear()]));

    const fetchHolidays = async () => {
      try {
        const lists = await Promise.all(
          years.map(async (yr) => {
            try {
              const res = await holidayService.getHolidaysForYear(yr);
              return res.success && Array.isArray(res.data) ? res.data : [];
            } catch {
              return [];
            }
          })
        );
        if (active) {
          setHolidays(lists.flat().filter((h) => h.isActive));
        }
      } catch {
        if (active) setHolidays([]);
      }
    };

    fetchHolidays();
    return () => {
      active = false;
    };
  }, [today, maxDeliveryDate]);

  const istNow = getIstNow();
  const currentIstHour = istNow.getHours() + istNow.getMinutes() / 60;
  const isAfterSameDayCutoff = currentIstHour >= 18;

  const isHolidayDate = (candidate: Date): Holiday | null => {
    const norm = startOfDay(candidate);
    return holidays.find((h) => h.isActive && isSameDay(new Date(h.date), norm)) || null;
  };

  const isDateDisabled = (candidate: Date): boolean => {
    const norm = startOfDay(candidate);
    if (isBefore(norm, today) || norm > maxDeliveryDate) return true;

    if (isSameDay(norm, today)) {
      if (hasNoSameDayItem) return true;
      // Allow today until midnight cutoff (8 PM) if midnight slot is enabled, else 6 PM
      const midnightAllowed = valSettings?.midnightEnabled !== false;
      const latestTodayCutoff = midnightAllowed ? 20 : 18;
      if (currentIstHour >= latestTodayCutoff) return true;
    }

    const isValWeek = norm.getMonth() === 1 && norm.getDate() >= 8 && norm.getDate() <= 15;
    if (hasValentine) {
      if (!isValWeek) return true;
      if (commonAvailableDates && commonAvailableDates.length > 0) {
        const dayStr = `${norm.getDate()} feb`;
        const fullDayStr = `${norm.getDate()} february`;
        const allowed = commonAvailableDates.some(
          (d) => d === dayStr || d === fullDayStr || d.includes(String(norm.getDate()))
        );
        if (!allowed) return true;
      }
    } else if (isValentineEnabled && isValWeek) {
      return true;
    }

    return Boolean(isHolidayDate(norm));
  };

  // Ensure selectedDate is always valid and available
  useEffect(() => {
    if (!selectedDate || !isValid(selectedDate) || isDateDisabled(selectedDate)) {
      let cursor = today;
      while (cursor <= maxDeliveryDate) {
        if (!isDateDisabled(cursor)) {
          onSelectDate(cursor);
          break;
        }
        cursor = addDays(cursor, 1);
      }
    }
  }, [holidays, hasNoSameDayItem, hasValentine]);

  const horizontalDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, idx) => addDays(today, idx));
  }, [today]);

  const isSelectedDateToday = isValid(selectedDate) && isSameDay(startOfDay(selectedDate), today);

  // Merge backend slot configuration with SBFlorist's flat slot pricing:
  // Same-Day Standard & Fixed-Time (Morning, Afternoon, Evening) = ₹150; Midnight Express = ₹300
  const resolvedSlots: ResolvedSlot[] = useMemo(() => {
    const standardAndFixedFee = valSettings?.fixedTimeCharge ?? 150;
    const midnightFee = valSettings?.midnightCharge ?? 300;

    const baseSlots: ResolvedSlot[] = [
      {
        id: 'same_day',
        label: isSelectedDateToday ? 'Same-Day Standard' : 'Standard Delivery',
        time: '9:00 AM – 9:00 PM',
        extraCharge: standardAndFixedFee,
        cutoffHour: 18,
        description: isSelectedDateToday ? 'Order before 6:00 PM IST' : 'Flexible all-day delivery',
        icon: <Truck className="h-4 w-4" />,
        badge: 'Popular',
      },
      {
        id: 'morning',
        label: 'Morning',
        time: '9:00 AM – 12:00 PM',
        extraCharge: standardAndFixedFee,
        cutoffHour: 9,
        description: 'Fresh morning hand-delivery',
        icon: <Sun className="h-4 w-4" />,
      },
      {
        id: 'afternoon',
        label: 'Afternoon',
        time: '1:00 PM – 4:00 PM',
        extraCharge: standardAndFixedFee,
        cutoffHour: 13,
        description: 'Guaranteed afternoon window',
        icon: <Clock className="h-4 w-4" />,
      },
      {
        id: 'evening',
        label: 'Evening',
        time: '5:00 PM – 8:00 PM',
        extraCharge: standardAndFixedFee,
        cutoffHour: 17,
        description: 'Most-chosen celebration slot',
        icon: <Sunset className="h-4 w-4" />,
      },
      {
        id: 'midnight',
        label: 'Midnight Express',
        time: '10:00 PM – 12:00 AM',
        extraCharge: midnightFee,
        cutoffHour: 20,
        description: 'Surprise doorstep delivery',
        icon: <Moon className="h-4 w-4" />,
        badge: 'Express',
      },
    ];

    if (!backendSlots || backendSlots.length === 0) {
      return baseSlots;
    }

    const enabledIds = new Set(backendSlots.filter((s) => s.enabled !== false).map((s) => s.id));
    return baseSlots
      .filter((slot) => enabledIds.size === 0 || enabledIds.has(slot.id))
      .map((slot) => {
        const match = backendSlots.find((b) => b.id === slot.id);
        const flatFee = slot.id === 'midnight' ? midnightFee : standardAndFixedFee;
        return match
          ? {
              ...slot,
              time: match.time || slot.time,
              extraCharge: flatFee,
              cutoffHour: match.cutoffHour !== undefined ? Number(match.cutoffHour) : slot.cutoffHour,
            }
          : slot;
      });
  }, [backendSlots, isSelectedDateToday, valSettings?.fixedTimeCharge, valSettings?.midnightCharge]);

  const isSlotAvailableForDate = (slot: ResolvedSlot): boolean => {
    if (!isSelectedDateToday) return true;
    return currentIstHour < slot.cutoffHour - 0.25;
  };

  // Only show genuinely available slots (and automatically select first available if current becomes unavailable)
  const availableSlots = useMemo(
    () => resolvedSlots.filter((slot) => isSlotAvailableForDate(slot)),
    [resolvedSlots, isSelectedDateToday, currentIstHour]
  );

  useEffect(() => {
    if (availableSlots.length === 0) return;
    const isCurrentValid = availableSlots.some((s) => s.id === selectedSlot);
    if (!selectedSlot || !isCurrentValid) {
      onSelectSlot(availableSlots[0].id);
    }
  }, [availableSlots, selectedSlot, onSelectSlot]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,27,24,0.04)] space-y-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F3ECE5]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A8076]">
            Delivery Schedule
          </span>
          <h3 className="mt-0.5 font-['Playfair_Display'] text-base sm:text-lg font-semibold text-[#1E1B18]">
            Choose Delivery Date & Time Slot
          </h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCalendarOpen(true)}
          className="h-9 rounded-xl border-[#E5DDD5] bg-[#FAF8F5] px-3 text-xs font-semibold text-[#3C342E] hover:border-[#E2B8C6] hover:bg-[#FFF7F9] hover:text-[#BE185D]"
        >
          <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-[#BE185D]" />
          Full Calendar
        </Button>
      </div>

      {/* Cutoff / Same-day Advisory */}
      {isAfterSameDayCutoff && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#EFE3CE] bg-[#FBF7F0] px-3.5 py-2.5 text-xs text-[#7D581B]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#B8862D]" />
          <p>
            Same-day standard delivery cut-off (6:00 PM IST) has passed. Midnight Express (until 8:00 PM) or next-day slots are available.
          </p>
        </div>
      )}

      {/* Horizontal Scrollable Date Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#3C342E]">
            Delivery Date:{' '}
            <span className="text-[#BE185D]">
              {isValid(selectedDate) ? format(selectedDate, 'EEE, dd MMM yyyy') : 'Select date'}
            </span>
          </span>
          <span className="text-[11px] text-[#8A8076]">Scroll for more dates →</span>
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar snap-x snap-mandatory -mx-1 px-1"
          role="radiogroup"
          aria-label="Select delivery date"
        >
          {horizontalDates.map((day) => {
            const disabled = isDateDisabled(day);
            const selected = isValid(selectedDate) && isSameDay(day, selectedDate);
            const isDayToday = isSameDay(day, today);
            const isTomorrow = isSameDay(day, addDays(today, 1));
            const holiday = isHolidayDate(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => !disabled && onSelectDate(day)}
                className={cn(
                  'snap-start flex min-w-[74px] sm:min-w-[82px] shrink-0 flex-col items-center justify-center rounded-2xl border px-2.5 py-2.5 text-center transition-all',
                  selected
                    ? 'border-[#BE185D] bg-[#BE185D] text-white shadow-[0_6px_16px_-6px_rgba(190,24,93,0.5)]'
                    : disabled
                    ? 'cursor-not-allowed border-[#F0EAE3] bg-[#FAF8F5] text-[#C0B6AC] opacity-65'
                    : 'border-[#EDE5DD] bg-white text-[#2E2824] hover:border-[#E2B8C6] hover:bg-[#FFF7F9]'
                )}
              >
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider',
                    selected ? 'text-white/90' : 'text-[#8A8076]'
                  )}
                >
                  {isDayToday ? 'Today' : isTomorrow ? 'Tmrw' : format(day, 'EEE')}
                </span>
                <span className="mt-0.5 text-base sm:text-lg font-bold leading-none tabular-nums">
                  {format(day, 'dd')}
                </span>
                <span
                  className={cn(
                    'mt-0.5 text-[10px] font-medium',
                    selected ? 'text-white/85' : 'text-[#7A7168]'
                  )}
                >
                  {holiday ? 'Holiday' : format(day, 'MMM')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Time Slot Cards */}
      <div className="space-y-2.5 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#3C342E]">Select Delivery Time Slot</span>
          {estimatedDeliveryText && (
            <span className="text-[11px] font-medium text-[#3F6349]">{estimatedDeliveryText}</span>
          )}
        </div>

        {availableSlots.length === 0 ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            All delivery slots for this date have passed their cut-off time. Please pick the next available date above.
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            role="radiogroup"
            aria-label="Select delivery time slot"
          >
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              const isMidnight = slot.id === 'midnight';
              const chargeDisplay = isFirstOrderFreeDelivery
                ? 'FREE'
                : formatPrice(convertPrice(slot.extraCharge));

              return (
                <button
                  key={slot.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectSlot(slot.id)}
                  className={cn(
                    'relative flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all',
                    isSelected
                      ? 'border-[#BE185D] bg-[#FFF7F9] ring-2 ring-[#BE185D]/15 shadow-[0_4px_14px_-6px_rgba(190,24,93,0.22)]'
                      : 'border-[#EDE5DD] bg-white hover:border-[#D9C9BC] hover:bg-[#FAF8F5]'
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
                    {slot.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#1E1B18] truncate">
                        {slot.label}
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums',
                          isFirstOrderFreeDelivery
                            ? 'bg-[#EDF3EE] text-[#2E573A] border border-[#CBE0D0]'
                            : isSelected
                            ? 'bg-[#BE185D] text-white'
                            : isMidnight
                            ? 'bg-[#FFF0F5] text-[#9D174D] border border-[#F5CBD8]'
                            : 'bg-[#FAF6F1] text-[#5D544C] border border-[#E5DDD5]'
                        )}
                      >
                        {chargeDisplay}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-[#4A423B]">{slot.time}</p>
                    <p className="mt-0.5 text-[11px] text-[#7A7168] line-clamp-1">{slot.description}</p>
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
        )}
      </div>

      {/* Valentine Optional Upgrades (only when Valentine mode is active) */}
      {isValentineEnabled && (onToggleSurpriseDelivery || onToggleAnonymousGift) && (
        <div className="border-t border-[#F3ECE5] pt-4 space-y-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9D174D]">
            <Sparkles className="h-3.5 w-3.5" />
            Special Delivery Upgrades
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {onToggleSurpriseDelivery && (
              <label
                className={cn(
                  'flex items-center justify-between gap-2 rounded-xl border p-3 cursor-pointer transition-colors',
                  surpriseDelivery
                    ? 'border-[#BE185D] bg-[#FFF7F9]'
                    : 'border-[#EDE5DD] bg-[#FAF8F5] hover:bg-white'
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1E1B18]">Surprise Delivery</p>
                  <p className="text-[11px] text-[#7A7168]">
                    Discreet handover (+{formatPrice(convertPrice(valSettings?.surpriseCharge ?? 100))})
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={surpriseDelivery}
                  onChange={(e) => onToggleSurpriseDelivery(e.target.checked)}
                  className="h-4 w-4 accent-[#BE185D] rounded"
                />
              </label>
            )}

            {onToggleAnonymousGift && (
              <label
                className={cn(
                  'flex items-center justify-between gap-2 rounded-xl border p-3 cursor-pointer transition-colors',
                  anonymousGift
                    ? 'border-[#BE185D] bg-[#FFF7F9]'
                    : 'border-[#EDE5DD] bg-[#FAF8F5] hover:bg-white'
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1E1B18]">Anonymous Sender</p>
                  <p className="text-[11px] text-[#7A7168]">
                    Keep sender hidden ({valSettings?.anonymousCharge ? `+${formatPrice(convertPrice(valSettings.anonymousCharge))}` : 'FREE'})
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={anonymousGift}
                  onChange={(e) => onToggleAnonymousGift(e.target.checked)}
                  className="h-4 w-4 accent-[#BE185D] rounded"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Full Calendar Modal for Future Dates up to 90 Days */}
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md rounded-3xl border border-[#EDE5DD] bg-white p-0 shadow-2xl overflow-hidden">
          <DialogHeader className="border-b border-[#F3ECE5] px-5 py-4 text-left">
            <DialogTitle className="font-['Playfair_Display'] text-lg font-semibold text-[#1E1B18]">
              Pick a Delivery Date
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7A7168]">
              Schedule up to 90 days ahead. Holidays and past dates are automatically disabled.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 flex flex-col items-center">
            <Calendar
              mode="single"
              selected={isValid(selectedDate) ? selectedDate : undefined}
              onSelect={(next) => {
                if (next && isValid(next) && !isDateDisabled(next)) {
                  onSelectDate(startOfDay(next));
                  setIsCalendarOpen(false);
                }
              }}
              fromDate={today}
              toDate={maxDeliveryDate}
              disabled={isDateDisabled}
              className="rounded-2xl"
              classNames={{
                day_selected: 'bg-[#BE185D] text-white hover:bg-[#9D174D] hover:text-white',
                day_today: 'bg-[#FFF0F5] text-[#BE185D] font-bold',
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryScheduleCard;
