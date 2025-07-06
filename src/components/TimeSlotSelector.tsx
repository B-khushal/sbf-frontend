import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [date, setDate] = useState<Date | null>(selectedDate || new Date());
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const { formatPrice, convertPrice } = useCurrency();
  
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 30);
  
  useEffect(() => {
    if (selectedDate && isValid(selectedDate)) {
      setDate(selectedDate);
    }
  }, [selectedDate]);
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && isValid(newDate) && onSelectDate) {
      setDate(newDate);
      onSelectDate(newDate);
      setIsDateDialogOpen(false);
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
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDisplayDate(date)}
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-[350px] rounded-lg">
              <Calendar
                mode="single"
                selected={date || undefined}
                onSelect={handleDateSelect}
                disabled={(date) => isBefore(date, today) || isBefore(maxDate, date)}
                initialFocus
                className="rounded-lg border-0"
              />
            </DialogContent>
          </Dialog>

          <div className="space-y-4">
            {timeSlots.map((slot) => {
              const isAvailable = isSlotAvailable(slot);
              const unavailableReason = !isAvailable ? getUnavailableReason(slot) : null;
              
              return (
                <div
                  key={slot.id}
                  className={cn(
                    "flex items-center space-x-4 rounded-lg border p-4",
                    selectedSlot === slot.id && "border-primary bg-primary/5",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Checkbox
                    id={slot.id}
                    checked={selectedSlot === slot.id}
                    onCheckedChange={() => isAvailable && onSelectSlot(slot.id)}
                    disabled={!isAvailable}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={slot.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {slot.label}
                      </label>
                      {slot.price && (
                        <span className="text-sm text-muted-foreground">
                          +{formatPrice(convertPrice(slot.price))}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {slot.time}
                    </div>
                    {unavailableReason && (
                      <p className="text-xs text-red-500 mt-1">
                        {unavailableReason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSlotSelector;
