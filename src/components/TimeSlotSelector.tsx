import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar as CalendarIcon, Info } from 'lucide-react';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import * as Popover from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import { format, addDays, isBefore, startOfDay, isValid, isSameDay, getDay } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import holidayService, { Holiday } from '@/services/holidayService';

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
  // Set default date to today or provided selectedDate
  const [date, setDate] = useState<Date | null>(selectedDate || new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true);
  const { formatPrice, convertPrice } = useCurrency();
  
  // Create a minimum date for the calendar (today)
  const today = startOfDay(new Date());

  // Create a maximum date for the calendar (December 31st of current year)
  const endOfYear = new Date(today.getFullYear(), 11, 31); // December is month 11

  // Fetch holidays for the current year
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoadingHolidays(true);
        const currentYear = today.getFullYear();
        const response = await holidayService.getHolidaysForYear(currentYear);
        
        if (response.success && response.data.length > 0) {
          setHolidays(response.data);
        } else {
          // Fallback to hardcoded holidays if API returns empty or fails
          const fallbackHolidays = calculateFallbackHolidays(currentYear);
          setHolidays(fallbackHolidays);
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
        // Fallback to hardcoded holidays on error
        const currentYear = today.getFullYear();
        const fallbackHolidays = calculateFallbackHolidays(currentYear);
        setHolidays(fallbackHolidays);
      } finally {
        setIsLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, [today.getFullYear()]);

  // Function to check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    // Check if date is before today
    if (isBefore(date, today)) {
      return true;
    }
    
    // Check if date is after December 31st of current year
    if (date > endOfYear) {
      return true;
    }
    
    // Check if date is a holiday
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, date) && holiday.isActive;
    });
  };

  // Function to get the reason why a date is disabled
  const getDisabledDateReason = (date: Date): string | null => {
    // Check if date is before today
    if (isBefore(date, today)) {
      return "Cannot select past dates";
    }
    
    // Check if date is after December 31st of current year
    if (date > endOfYear) {
      return "Delivery not available beyond December 31st";
    }
    
    // Check if date is a holiday
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      return isSameDay(holidayDate, date) && h.isActive;
    });
    
    if (holiday) {
      return holiday.reason;
    }
    
    return null;
  };

  // Function to check if a date is a holiday
  const isHoliday = (date: Date): Holiday | null => {
    return holidays.find(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, date) && holiday.isActive;
    }) || null;
  };
  
  // Sync date state with selectedDate prop
  useEffect(() => {
    if (selectedDate && isValid(selectedDate)) {
      setDate(selectedDate);
    }
  }, [selectedDate]);
  
  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && isValid(newDate) && !isDateDisabled(newDate) && onSelectDate) {
      setDate(newDate);
      onSelectDate(newDate);
      setIsCalendarOpen(false);
    }
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date || !isValid(date)) return "Pick a delivery date";
    return format(date, 'EEEE, MMMM do, yyyy');
  };
  
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
    <div className={cn('space-y-4', className)}>
      {/* Delivery Date Picker as Popover */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="font-medium text-base">Select Delivery Date</span>
        </div>
        <Popover.Root open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <Popover.Trigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal py-2 px-4"
              type="button"
              onClick={() => setIsCalendarOpen((open) => !open)}
            >
              {date && isValid(date) ? (
                <span>{formatDisplayDate(date)}</span>
              ) : (
                <span className="text-muted-foreground">Pick a delivery date</span>
              )}
            </Button>
          </Popover.Trigger>
          <Popover.Content side="bottom" align="start" className="z-[9999] bg-white rounded-lg shadow-lg p-2 mt-2">
            <div className="space-y-2">
              <Calendar
                mode="single"
                selected={date || undefined}
                onSelect={handleDateSelect}
                fromDate={today}
                toDate={endOfYear}
                disabled={isDateDisabled}
                initialFocus
                classNames={{
                  day: "relative w-9 h-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
                  day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                }}
              />
              
              {/* Holiday Legend */}
              {holidays.length > 0 && !isLoadingHolidays && (
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-600 mb-1">Holidays & Non-Delivery Dates:</p>
                  <div className="flex flex-wrap gap-1">
                    {holidays.slice(0, 3).map((holiday, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">{holiday.name}</span>
                      </div>
                    ))}
                    {holidays.length > 3 && (
                      <span className="text-xs text-gray-500">+{holidays.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
              
              {isLoadingHolidays && (
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-500">Loading holiday information...</p>
                </div>
              )}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
      
      {/* Delivery Time Slots */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-medium text-base">Select Delivery Time</span>
        </div>
        
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
