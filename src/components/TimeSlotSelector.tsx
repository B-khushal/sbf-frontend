import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Calendar as CalendarIcon, ChevronRight, Info, X } from 'lucide-react';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { addDays, format, isBefore, isSameDay, isValid, startOfDay } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';
import holidayService, { Holiday } from '@/services/holidayService';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';

export type TimeSlot = {
  id: string;
  label: string;
  time: string;
  available: boolean;
  price?: number;
};

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  {
    id: 'morning',
    label: 'Morning',
    time: '9:00 AM - 12:00 PM',
    available: true
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    time: '1:00 PM - 4:00 PM',
    available: true
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '5:00 PM - 8:00 PM',
    available: true
  },
  {
    id: 'midnight',
    label: 'Midnight Express',
    time: '10:00 PM - 12:00 AM',
    available: true,
    price: 300.00
  }
];

// Function to calculate Indian festival dates (simplified calculations)
// These are fallback holidays in case the API is not available
const calculateFallbackHolidays = (year: number): Holiday[] => {
  const holidays: Holiday[] = [];
  
  // Fixed holidays
  holidays.push({
    _id: `new-year-${year}`,
    name: "New Year's Eve",
    date: new Date(year, 11, 31).toISOString(), // December 31st
    reason: "Store closed for New Year's Eve celebrations",
    type: 'fixed',
    category: 'other',
    isActive: true,
    year,
    month: 12,
    day: 31,
    recurring: false,
    recurringYears: [],
    createdBy: { _id: 'system', name: 'System', email: 'system@sbf.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Republic Day (January 26)
  holidays.push({
    _id: `republic-day-${year}`,
    name: "Republic Day",
    date: new Date(year, 0, 26).toISOString(),
    reason: "National holiday - Republic Day",
    type: 'fixed',
    category: 'national',
    isActive: true,
    year,
    month: 1,
    day: 26,
    recurring: false,
    recurringYears: [],
    createdBy: { _id: 'system', name: 'System', email: 'system@sbf.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Independence Day (August 15)
  holidays.push({
    _id: `independence-day-${year}`,
    name: "Independence Day",
    date: new Date(year, 7, 15).toISOString(),
    reason: "National holiday - Independence Day",
    type: 'fixed',
    category: 'national',
    isActive: true,
    year,
    month: 8,
    day: 15,
    recurring: false,
    recurringYears: [],
    createdBy: { _id: 'system', name: 'System', email: 'system@sbf.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Gandhi Jayanti (October 2)
  holidays.push({
    _id: `gandhi-jayanti-${year}`,
    name: "Gandhi Jayanti",
    date: new Date(year, 9, 2).toISOString(),
    reason: "National holiday - Gandhi Jayanti",
    type: 'fixed',
    category: 'national',
    isActive: true,
    year,
    month: 10,
    day: 2,
    recurring: false,
    recurringYears: [],
    createdBy: { _id: 'system', name: 'System', email: 'system@sbf.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Christmas (December 25)
  holidays.push({
    _id: `christmas-${year}`,
    name: "Christmas",
    date: new Date(year, 11, 25).toISOString(),
    reason: "Christmas Day - Store closed",
    type: 'fixed',
    category: 'religious',
    isActive: true,
    year,
    month: 12,
    day: 25,
    recurring: false,
    recurringYears: [],
    createdBy: { _id: 'system', name: 'System', email: 'system@sbf.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Simplified Diwali calculation (usually October/November)
  const diwaliDate = new Date(year, 9, 15); // Approximate - October 15th
  holidays.push({
    _id: `diwali-${year}`,
    name: "Diwali",
    date: diwaliDate.toISOString(),
    reason: "Diwali - Festival of Lights - Limited delivery availability",
    type: 'dynamic',
    category: 'religious',
    isActive: true,
    year,
    month: 10,
    day: 15,
    recurring: false,
    recurringYears: [],
    createdBy: { _id: 'system', name: 'System', email: 'system@sbf.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Simplified Holi calculation (usually March)
  const holiDate = new Date(year, 2, 15); // Approximate - March 15th
  holidays.push({
    _id: `holi-${year}`,
    name: "Holi",
    date: holiDate.toISOString(),
    reason: "Holi - Festival of Colors - Limited delivery availability",
    type: 'dynamic',
    category: 'religious',
    isActive: true,
    year,
    month: 3,
    day: 15,
    recurring: false,
    recurringYears: [],
    createdBy: { _id: 'system', name: 'System', email: 'system@sbf.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  return holidays;
};

type TimeSlotSelectorProps = {
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  timeSlots?: TimeSlot[];
  className?: string;
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
};

const TimeSlotSelector = ({
  selectedSlot,
  onSelectSlot,
  timeSlots = DEFAULT_TIME_SLOTS,
  className,
  selectedDate,
  onSelectDate
}: TimeSlotSelectorProps) => {
  const normalizeDate = (value: Date) => startOfDay(value);
  const toDateInputValue = (value: Date) => format(value, 'yyyy-MM-dd');

  // Set default date to today or provided selectedDate
  const [date, setDate] = useState<Date | null>(
    selectedDate && isValid(selectedDate) ? normalizeDate(selectedDate) : normalizeDate(new Date())
  );
  const [draftDate, setDraftDate] = useState<Date | null>(
    selectedDate && isValid(selectedDate) ? normalizeDate(selectedDate) : normalizeDate(new Date())
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true);
  const { formatPrice, convertPrice } = useCurrency();
  
  // Keep the delivery window stable for this component instance.
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDeliveryDate = useMemo(() => addDays(today, 90), [today]);
  const yearsToFetch = useMemo(() => {
    return Array.from(new Set<number>([today.getFullYear(), maxDeliveryDate.getFullYear()]));
  }, [today, maxDeliveryDate]);

  // Fetch holidays for the current year
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoadingHolidays(true);
        const responses = await Promise.all(
          yearsToFetch.map(async (year) => {
            try {
              const response = await holidayService.getHolidaysForYear(year);
              if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                return response.data;
              }

              return calculateFallbackHolidays(year);
            } catch {
              return calculateFallbackHolidays(year);
            }
          })
        );

        setHolidays(responses.flat());
      } catch (error) {
        console.error('Error fetching holidays:', error);

        const fallbackHolidays = yearsToFetch.flatMap((year) => calculateFallbackHolidays(year));
        setHolidays(fallbackHolidays);
      } finally {
        setIsLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, [yearsToFetch]);

  // Function to check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    const normalizedDate = normalizeDate(date);

    // Check if date is before today
    if (isBefore(normalizedDate, today)) {
      return true;
    }
    
    // Check if date is beyond delivery window
    if (normalizedDate > maxDeliveryDate) {
      return true;
    }
    
    // Check if date is a holiday
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, normalizedDate) && holiday.isActive;
    });
  };

  // Function to check if a date is a holiday
  const isHoliday = (date: Date): Holiday | null => {
    const normalizedDate = normalizeDate(date);

    return holidays.find(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, normalizedDate) && holiday.isActive;
    }) || null;
  };

  const findNextAvailableDate = (startDate: Date): Date | null => {
    let cursor = normalizeDate(startDate);

    while (cursor <= maxDeliveryDate) {
      if (!isDateDisabled(cursor)) {
        return cursor;
      }

      cursor = addDays(cursor, 1);
    }

    return null;
  };
  
  // Sync date state with selectedDate prop
  useEffect(() => {
    if (selectedDate && isValid(selectedDate)) {
      const normalizedSelectedDate = normalizeDate(selectedDate);
      if (!isDateDisabled(normalizedSelectedDate)) {
        setDate(normalizedSelectedDate);
        setDraftDate(normalizedSelectedDate);
        return;
      }
    }

    const fallbackDate = findNextAvailableDate(today);
    if (fallbackDate) {
      setDate(fallbackDate);
      setDraftDate(fallbackDate);

      if (onSelectDate && (!selectedDate || !isSameDay(selectedDate, fallbackDate))) {
        onSelectDate(fallbackDate);
      }
    }
  }, [selectedDate, holidays]);

  useEffect(() => {
    if (isCalendarOpen) {
      setDraftDate(date);
    }
  }, [isCalendarOpen, date]);

  const handleCalendarOpenChange = (open: boolean) => {
    if (!open) {
      setDraftDate(date);
    }

    setIsCalendarOpen(open);
  };

  const applyDateSelection = (nextDate: Date) => {
    const normalizedDate = normalizeDate(nextDate);

    if (isDateDisabled(normalizedDate)) {
      return;
    }

    setDraftDate(normalizedDate);
    setDate(normalizedDate);
    onSelectDate?.(normalizedDate);
    setIsCalendarOpen(false);
  };
  
  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate || !isValid(newDate)) return;

    const normalizedDate = normalizeDate(newDate);
    if (isDateDisabled(normalizedDate)) return;

    setDraftDate(normalizedDate);

    if (!isMobile) {
      applyDateSelection(normalizedDate);
    }
  };

  const handleNativeDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (!nextValue) {
      return;
    }

    const parsedDate = startOfDay(new Date(`${nextValue}T00:00:00`));

    if (!isValid(parsedDate) || isDateDisabled(parsedDate)) {
      return;
    }

    setDraftDate(parsedDate);
    setDate(parsedDate);
    onSelectDate?.(parsedDate);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date || !isValid(date)) return "Pick a delivery date";
    return format(date, 'EEEE, MMMM do, yyyy');
  };

  const activeHolidays = useMemo(
    () => holidays.filter((holiday) => holiday.isActive),
    [holidays]
  );

  const holidayPreview = useMemo(
    () => activeHolidays.slice(0, isMobile ? 6 : 4),
    [activeHolidays, isMobile]
  );

  const selectedCalendarDate = draftDate && isValid(draftDate) ? draftDate : date;
  const quickDateOptions = useMemo(() => {
    const options = [
      normalizeDate(today),
      addDays(today, 1),
      addDays(today, 2),
    ];

    return options
      .map((optionDate) => normalizeDate(optionDate))
      .filter((optionDate, index, array) => {
        if (isDateDisabled(optionDate)) return false;

        return array.findIndex((candidate) => isSameDay(candidate, optionDate)) === index;
      });
  }, [today, holidays]);

  const datePickerContent = (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/50 p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Delivery Date</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {formatDisplayDate(selectedCalendarDate)}
            </p>
          </div>
          <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            Next 90 days
          </div>
        </div>

        {isMobile && quickDateOptions.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {quickDateOptions.map((optionDate) => {
              const isSelected = Boolean(selectedCalendarDate && isSameDay(optionDate, selectedCalendarDate));

              return (
                <Button
                  key={optionDate.toISOString()}
                  type="button"
                  variant="outline"
                  className={cn(
                    'h-10 rounded-full border-slate-200 bg-white px-4 text-sm font-medium text-slate-700',
                    isSelected && 'border-rose-300 bg-rose-50 text-rose-700'
                  )}
                  onClick={() => setDraftDate(optionDate)}
                >
                  {format(optionDate, 'EEE, MMM d')}
                </Button>
              );
            })}
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <Calendar
            mode="single"
            selected={selectedCalendarDate || undefined}
            onSelect={handleDateSelect}
            fromDate={today}
            toDate={maxDeliveryDate}
            disabled={isDateDisabled}
            modifiers={{
              holiday: (calendarDate) => Boolean(isHoliday(calendarDate)),
            }}
            modifiersClassNames={{
              holiday: 'after:absolute after:bottom-1.5 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-rose-500',
            }}
            className="mx-auto w-fit rounded-2xl bg-white p-3"
            classNames={{
              months: 'flex flex-col space-y-4',
              month: 'space-y-4',
              caption: 'flex items-center justify-between px-1 pt-1',
              caption_label: 'text-sm font-semibold text-slate-900',
              nav_button: 'h-9 w-9 rounded-full border border-slate-200 bg-white p-0 text-slate-700 opacity-100 shadow-sm transition hover:bg-slate-100',
              table: 'w-full border-collapse space-y-1.5',
              head_cell: 'w-11 rounded-md text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400',
              row: 'mt-2 flex w-full justify-between gap-1.5',
              cell: 'relative h-11 w-11 p-0 text-center text-sm',
              day: 'h-11 w-11 rounded-2xl p-0 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 aria-selected:bg-rose-600 aria-selected:text-white aria-selected:shadow-md',
              day_today: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
              day_selected: 'bg-rose-600 text-white hover:bg-rose-600 hover:text-white focus:bg-rose-600 focus:text-white',
              day_disabled: 'cursor-not-allowed text-slate-300 opacity-100 line-through decoration-slate-300',
              day_outside: 'text-slate-300 opacity-40',
            }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
        <p className="text-sm font-semibold text-slate-900">Holidays & Non-Delivery Dates</p>
        <p className="mt-1 text-xs text-slate-500">Disabled dates are unavailable for delivery and marked in the calendar.</p>

        {isLoadingHolidays ? (
          <p className="mt-3 text-sm text-slate-500">Loading holiday information...</p>
        ) : activeHolidays.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {holidayPreview.map((holiday) => (
              <div
                key={holiday._id}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
                <span>{holiday.name}</span>
              </div>
            ))}
            {activeHolidays.length > holidayPreview.length && (
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs text-slate-500 ring-1 ring-slate-200">
                +{activeHolidays.length - holidayPreview.length} more
              </span>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No blocked holiday dates configured right now.</p>
        )}
      </div>
    </div>
  );
  
  // Check if a time slot is available for the selected date
  const isSlotAvailable = (slot: TimeSlot): boolean => {
    // If slot is already marked as unavailable, respect that
    if (!slot.available) {
      return false;
    }

    // If no date is selected, all slots are technically available
    if (!date || !isValid(date)) {
      return true;
    }

    // Check if the selected date is today
    const now = new Date();
    const isToday = (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );

    // If it's today, apply time restrictions based on slot
    if (isToday) {
      const currentHour = now.getHours();
      
      // Parse the start time from the slot.time string
      // Assuming format like "9:00 AM - 12:00 PM"
      const timeRange = slot.time.split(' - ')[0]; // Get "9:00 AM"
      const [hourStr, minuteStr] = timeRange.split(':'); // Get "9" and "00 AM"
      let hour = parseInt(hourStr, 10);
      const isPM = minuteStr.includes('PM') && hour !== 12;
      const isAM = minuteStr.includes('AM') && hour === 12;
      
      // Convert to 24-hour format
      if (isPM) {
        hour += 12;
      } else if (isAM) {
        hour = 0;
      }
      
      // Apply different notice periods based on slot
      if (slot.id === 'morning') {
        // Morning slot needs 5 hours notice
        return (hour - currentHour) >= 5;
      } else if (slot.id === 'midnight') {
        // Midnight slot needs 2 hours notice
        return (hour - currentHour) >= 2;
      } else {
        // Other slots need only 30 minutes notice
        return (hour - currentHour) >= 0.5;
      }
    }

    // For future dates, all slots are available
    return true;
  };
  
  // Get the reason why a slot is unavailable
  const getUnavailableReason = (slot: TimeSlot): string | null => {
    if (!slot.available) {
      return 'Unavailable';
    }
    
    // If no date is selected, we don't show reasons
    if (!date || !isValid(date)) {
      return null;
    }

    // Check if it's today
    const now = new Date();
    const isToday = (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );

    if (isToday) {
      const currentHour = now.getHours();
      
      // Parse the start time
      const timeRange = slot.time.split(' - ')[0];
      const [hourStr, minuteStr] = timeRange.split(':');
      let hour = parseInt(hourStr, 10);
      const isPM = minuteStr.includes('PM') && hour !== 12;
      const isAM = minuteStr.includes('AM') && hour === 12;
      
      // Convert to 24-hour format
      if (isPM) {
        hour += 12;
      } else if (isAM) {
        hour = 0;
      }
      
      if (slot.id === 'morning') {
        if ((hour - currentHour) < 5) {
          return 'Need 5+ hours notice';
        }
      } else if (slot.id === 'midnight') {
        if ((hour - currentHour) < 2) {
          return 'Need 2+ hours notice';
        }
      } else {
        if ((hour - currentHour) < 0.5) {
          return 'Need 30+ minutes notice';
        }
      }
    }
    
    return null;
  };
  
  return (
    <div className={cn('w-full space-y-4 overflow-x-hidden', className)}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="font-medium text-base">Select Delivery Date</span>
        </div>
        {isMobile && (
          <div className="mb-3 w-full">
            <input
              type="date"
              className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base"
              value={date && isValid(date) ? toDateInputValue(date) : ''}
              min={toDateInputValue(today)}
              max={toDateInputValue(maxDeliveryDate)}
              onChange={handleNativeDateChange}
            />
          </div>
        )}
        <Button
          variant="outline"
          className="flex h-auto w-full items-center justify-between rounded-2xl border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          type="button"
          onClick={() => handleCalendarOpenChange(true)}
          aria-expanded={isCalendarOpen}
          aria-haspopup="dialog"
          aria-controls="delivery-date-surface"
        >
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery Date</div>
            <div className="mt-1 truncate text-sm font-medium text-slate-900">
              {date && isValid(date) ? formatDisplayDate(date) : 'Pick a delivery date'}
            </div>
          </div>
          <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <ChevronRight className="h-5 w-5" />
          </div>
        </Button>

        <p className="mt-2 text-sm text-slate-500">
          {isMobile ? 'Choose a date, then confirm it below.' : 'Choose a delivery date without shifting the checkout form.'}
        </p>

        {isMobile ? (
          <Drawer open={isCalendarOpen} onOpenChange={handleCalendarOpenChange}>
            <DrawerContent
              id="delivery-date-surface"
              className="max-h-[88dvh] rounded-t-[28px] border-0 bg-white px-0 pb-0 shadow-2xl"
            >
              <DrawerHeader className="border-b border-slate-200 px-5 pb-4 pt-2 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DrawerTitle className="text-lg font-semibold text-slate-950">Select Delivery Date</DrawerTitle>
                    <DrawerDescription className="mt-1 text-sm text-slate-500">
                      Pick an available date for delivery. Swipe down, tap outside, or press close to dismiss.
                    </DrawerDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => handleCalendarOpenChange(false)}
                    aria-label="Close delivery date selector"
                    className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </DrawerHeader>
              <div className="overflow-y-auto overflow-x-hidden px-5 py-4">
                {datePickerContent}
              </div>
              <DrawerFooter className="border-t border-slate-200 bg-white px-5 pb-5 pt-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">Selected date</p>
                    <p className="text-slate-500">
                      {selectedCalendarDate ? formatDisplayDate(selectedCalendarDate) : 'Pick a delivery date'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    Step 1
                  </Badge>
                </div>
                <Button
                  type="button"
                  className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => {
                    if (selectedCalendarDate) {
                      applyDateSelection(selectedCalendarDate);
                    }
                  }}
                  disabled={!selectedCalendarDate || isDateDisabled(selectedCalendarDate)}
                >
                  Confirm Delivery Date
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isCalendarOpen} onOpenChange={handleCalendarOpenChange}>
            <DialogContent
              id="delivery-date-surface"
              className="max-h-[90vh] max-w-[40rem] overflow-y-auto rounded-[32px] border-0 bg-white p-0 shadow-2xl"
            >
              <DialogHeader className="border-b border-slate-200 px-6 pb-4 pt-6 text-left">
                <DialogTitle className="text-xl font-semibold text-slate-950">Select Delivery Date</DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  Delivery dates open in a fixed modal so the checkout layout stays stable while you choose.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 py-5">
                {datePickerContent}
                <Button
                  type="button"
                  className="mt-4 h-11 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => {
                    if (selectedCalendarDate) {
                      applyDateSelection(selectedCalendarDate);
                    }
                  }}
                  disabled={!selectedCalendarDate || isDateDisabled(selectedCalendarDate)}
                >
                  Confirm Delivery Date
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Delivery Time Slots */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-medium text-base">Select Delivery Time</span>
        </div>

        {isMobile && date && isValid(date) && (
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Delivery date selected:
            <span className="ml-1 font-medium text-slate-900">{formatDisplayDate(date)}</span>
          </div>
        )}
        
        {date && isValid(date) && (() => {
          const now = new Date();
          const isToday = (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
          
          const holiday = isHoliday(date);
          
          return (
            <div className="space-y-2">
              {isToday && (
                <p className="text-sm text-amber-500">
                  Notice required: Morning (5+ hrs), Midnight (2+ hrs), Others (30+ min). Current time: {now.getHours()}:{now.getMinutes().toString().padStart(2, '0')}
                </p>
              )}
              {holiday && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <Info className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{holiday.name}</p>
                    <p className="text-xs text-red-600">{holiday.reason}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {timeSlots.map((slot) => {
            const available = isSlotAvailable(slot);
            const unavailableReason = !available ? getUnavailableReason(slot) : null;
            
            return (
            <Card 
              key={slot.id}
              className={cn(
                  "cursor-pointer transition-all hover:border-primary relative",
                selectedSlot === slot.id && "border-primary ring-1 ring-primary",
                  !available && "opacity-60 cursor-not-allowed"
              )}
                onClick={() => available && onSelectSlot(slot.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{slot.label}</div>
                    <div className="text-sm text-muted-foreground">{slot.time}</div>
                    {slot.price && (
                      <div className="text-sm text-primary font-medium mt-1">
                          +{formatPrice(convertPrice(slot.price))}
                        </div>
                      )}
                      {unavailableReason && (
                        <div className="text-xs text-red-500 mt-1">
                          {unavailableReason}
                      </div>
                    )}
                  </div>
                  <Checkbox 
                    checked={selectedSlot === slot.id} 
                      disabled={!available}
                    className="mt-1"
                      onClick={(e) => {
                        // Prevent the click from reaching the card
                        e.stopPropagation();
                        if (available) onSelectSlot(slot.id);
                      }}
                  />
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
        
        {selectedSlot === 'midnight' && (
          <p className="text-sm text-muted-foreground">
            Midnight Express delivery has an additional fee of {formatPrice(convertPrice(300.00))}
          </p>
        )}
        
        {!date && (
          <p className="text-sm text-amber-500 font-medium">
            Please select a delivery date first
          </p>
        )}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
