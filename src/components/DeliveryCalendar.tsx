import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  orders: any[];
  count: number;
  totalAmount: number;
  statusCounts: {
    pending: number;
    processing: number;
    completed: number;
    delivered: number;
    cancelled: number;
  };
}

interface DeliveryCalendarProps {
  className?: string;
}

const DeliveryCalendar: React.FC<DeliveryCalendarProps> = ({ className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayOrders, setSelectedDayOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await api.get(`/orders/delivery-calendar?month=${month}&year=${year}`);
      
      if (response.data.success) {
        setCalendarData(response.data.calendarData || {});
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = calendarData[dateKey];
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        orders: dayData?.orders || [],
        count: dayData?.count || 0,
        totalAmount: dayData?.totalAmount || 0,
        statusCounts: dayData?.statusCounts || {
          pending: 0,
          processing: 0,
          completed: 0,
          delivered: 0,
          cancelled: 0
        }
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getDayHighlight = (day: CalendarDay) => {
    if (day.count === 0) return null;
    
    const today = new Date();
    const diffInDays = Math.ceil((day.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return {
        type: 'today',
        bgColor: 'bg-red-100 border-red-300',
        textColor: 'text-red-800',
        badgeColor: 'bg-red-500'
      };
    } else if (diffInDays === 1) {
      return {
        type: 'tomorrow',
        bgColor: 'bg-orange-100 border-orange-300',
        textColor: 'text-orange-800',
        badgeColor: 'bg-orange-500'
      };
    } else if (diffInDays <= 3 && diffInDays > 0) {
      return {
        type: 'soon',
        bgColor: 'bg-yellow-100 border-yellow-300',
        textColor: 'text-yellow-800',
        badgeColor: 'bg-yellow-500'
      };
    } else if (diffInDays > 0) {
      return {
        type: 'upcoming',
        bgColor: 'bg-blue-100 border-blue-300',
        textColor: 'text-blue-800',
        badgeColor: 'bg-blue-500'
      };
    } else {
      return {
        type: 'past',
        bgColor: 'bg-gray-100 border-gray-300',
        textColor: 'text-gray-600',
        badgeColor: 'bg-gray-500'
      };
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.count > 0) {
      setSelectedDate(day.date.toISOString().split('T')[0]);
      setSelectedDayOrders(day.orders);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">
              Delivery Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                disabled={isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-600 border-b"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const highlight = getDayHighlight(day);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={cn(
                      "relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      day.isCurrentMonth 
                        ? "bg-white border-gray-200" 
                        : "bg-gray-50 border-gray-100 text-gray-400",
                      highlight?.bgColor,
                      day.count > 0 && "hover:scale-105"
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-sm font-medium",
                        highlight?.textColor || (day.isCurrentMonth ? "text-gray-900" : "text-gray-400")
                      )}>
                        {day.date.getDate()}
                      </span>
                      {day.count > 0 && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs px-1.5 py-0.5 text-white",
                            highlight?.badgeColor || "bg-blue-500"
                          )}
                        >
                          {day.count}
                        </Badge>
                      )}
                    </div>
                    
                    {day.count > 0 && (
                      <div className="mt-1 space-y-1">
                        {day.orders.slice(0, 2).map((order, orderIndex) => (
                          <div
                            key={orderIndex}
                            className="text-xs p-1 bg-white bg-opacity-80 rounded truncate"
                          >
                            {order.orderNumber}
                          </div>
                        ))}
                        {day.count > 2 && (
                          <div className="text-xs text-gray-600">
                            +{day.count - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Details Modal */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Orders for {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DialogTitle>
            <DialogDescription>
              View all orders scheduled for delivery on this date.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDayOrders.map((order) => (
              <Card key={order._id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {order.customerName}
                      </p>
                    </div>
                    <Badge className={getStatusBadgeColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{order.timeSlot || 'No time slot'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>{order.itemCount} item(s)</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-right">
                    <span className="font-semibold">₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryCalendar; 