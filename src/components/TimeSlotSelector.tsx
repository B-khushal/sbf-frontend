import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import * as Popover from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import { format, addDays, isBefore, startOfDay, isValid } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';

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
    price: 100.00
  }
];

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
  const { formatPrice, convertPrice } = useCurrency();
  
  // Create a minimum date for the calendar (today)
  const today = startOfDay(new Date());
  
  // Create a maximum date for the calendar (30 days from today)
  const maxDate = addDays(today, 30);
  
  // Sync date state with selectedDate prop
  useEffect(() => {
    if (selectedDate && isValid(selectedDate)) {
      setDate(selectedDate);
    }
  }, [selectedDate]);
  
  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && isValid(newDate) && onSelectDate) {
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
          <Popover.Content side="bottom" align="start" className="z-50 bg-white rounded-lg shadow-lg p-2 mt-2">
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={handleDateSelect}
              fromDate={today}
              toDate={maxDate}
              initialFocus
            />
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
          
          return isToday ? (
            <p className="text-sm text-amber-500">
              Notice required: Morning (5+ hrs), Midnight (2+ hrs), Others (30+ min). Current time: {now.getHours()}:{now.getMinutes().toString().padStart(2, '0')}
            </p>
          ) : null;
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
            Midnight Express delivery has an additional fee of {formatPrice(convertPrice(100.00))}
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
