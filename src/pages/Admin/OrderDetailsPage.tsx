import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Order } from '@/services/orderService';
import Invoice from '@/components/Invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';
import { 
  Download, Camera, Hash, MessageSquare, Flower2, Gift, Mail, Phone,
  ArrowLeft, Clock, User, MapPin, CreditCard, Calendar, ChevronRight,
  ExternalLink, Copy, Check, CheckCircle2, AlertCircle, ShoppingBag, 
  HelpCircle, ChevronDown, Plus, Heart, Trash2, Truck
} from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; glow: string; icon: React.ReactNode }> = {
  order_placed: {
    label: 'Order Placed',
    bg: 'bg-blue-50/70 dark:bg-blue-950/20 backdrop-blur-sm',
    border: 'border-blue-200/60 dark:border-blue-900/40',
    text: 'text-blue-700 dark:text-blue-400',
    glow: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
  },
  received: {
    label: 'Received',
    bg: 'bg-purple-50/70 dark:bg-purple-950/20 backdrop-blur-sm',
    border: 'border-purple-200/60 dark:border-purple-900/40',
    text: 'text-purple-700 dark:text-purple-400',
    glow: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
  },
  being_made: {
    label: 'Being Made',
    bg: 'bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-sm',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    text: 'text-amber-700 dark:text-amber-400',
    glow: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    bg: 'bg-indigo-50/70 dark:bg-indigo-950/20 backdrop-blur-sm',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
    text: 'text-indigo-700 dark:text-indigo-400',
    glow: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-bounce" />
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 backdrop-blur-sm',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    glow: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50/70 dark:bg-rose-950/20 backdrop-blur-sm',
    border: 'border-rose-200/60 dark:border-rose-900/40',
    text: 'text-rose-700 dark:text-rose-400',
    glow: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
  },
  pending: {
    label: 'Pending',
    bg: 'bg-slate-50/70 dark:bg-slate-900/20 backdrop-blur-sm',
    border: 'border-slate-200/60 dark:border-slate-800/40',
    text: 'text-slate-700 dark:text-slate-400',
    glow: 'bg-slate-500',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
  },
  processing: {
    label: 'Processing',
    bg: 'bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-sm',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    text: 'text-amber-700 dark:text-amber-400',
    glow: 'bg-amber-500',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 backdrop-blur-sm',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    glow: 'bg-emerald-500',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
  }
};

const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
};

const formatTimeSlot = (slot: string) => {
  if (!slot) return 'N/A';
  
  const lower = slot.toLowerCase().trim();
  if (lower === 'same_day') return '9:00 AM – 9:00 PM';
  if (lower === 'morning') return '9:00 AM – 12:00 PM';
  if (lower === 'afternoon') return '12:00 PM – 3:00 PM';
  if (lower === 'late_afternoon') return '3:00 PM – 6:00 PM';
  if (lower === 'evening') return '6:00 PM – 9:00 PM';
  if (lower === 'midnight') return '12:00 AM – 6:00 AM';
  
  // slot_H_H patterns e.g., slot_16_18
  const slotMatch = slot.match(/slot_(\d+)_(\d+)/i);
  if (slotMatch) {
    const start = parseInt(slotMatch[1], 10);
    const end = parseInt(slotMatch[2], 10);
    const formatHour = (h: number) => {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      return `${displayHour}:00 ${suffix}`;
    };
    return `${formatHour(start)} – ${formatHour(end)}`;
  }
  
  // standard hour range e.g., 4-6, 16-18
  const rangeMatch = slot.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    
    const formatHourGuess = (h: number) => {
      let finalHour = h;
      let suffix = 'AM';
      if (h >= 12) {
        suffix = 'PM';
        finalHour = h > 12 ? h - 12 : 12;
      } else {
        if (h >= 1 && h <= 8) {
          suffix = 'PM';
        }
      }
      return `${finalHour}:00 ${suffix}`;
    };
    return `${formatHourGuess(start)} – ${formatHourGuess(end)}`;
  }
  
  return slot.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const { formatPrice, convertPrice, currency } = useCurrency();
  const { toast } = useToast();
  const orderRef = useRef<HTMLDivElement>(null);

  // Helper function to format price with specific currency
  const formatPriceWithCurrency = (amount: number, targetCurrency: string) => {
    return new Intl.NumberFormat(targetCurrency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to handle currency display based on order's original currency
  const displayOrderPrice = (amount: number, orderCurrency?: string, orderRate?: number) => {
    let finalAmount = amount;
    
    if (orderCurrency && orderCurrency !== currency) {
      if (orderCurrency === 'INR' && currency !== 'INR') {
        finalAmount = convertPrice(amount);
      } else if (orderCurrency !== 'INR' && currency === 'INR') {
        if (orderRate) {
          finalAmount = amount / orderRate;
        } else {
          finalAmount = amount / 0.01199; // Fallback
        }
      } else if (orderCurrency !== 'INR' && currency !== 'INR') {
        if (orderRate) {
          const amountInINR = amount / orderRate;
          finalAmount = convertPrice(amountInINR);
        }
      }
    } else if (!orderCurrency) {
      finalAmount = convertPrice(amount);
    }
    
    return formatPriceWithCurrency(finalAmount, currency);
  };

  const fetchAssignment = async (orderNumber: string) => {
    try {
      const res = await api.get(`/delivery/track/${orderNumber}`);
      if (res.data.success) {
        setAssignment(res.data.assignment);
      }
    } catch (err) {
      console.log('Error fetching assignment:', err);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartnerId || !order) return;
    setAssigning(true);
    try {
      const res = await api.post('/delivery/admin/assign', {
        orderId: order._id,
        partnerId: selectedPartnerId
      });
      if (res.data.success) {
        toast({ title: 'Success', description: 'Partner assigned successfully!' });
        fetchAssignment(order.orderNumber);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to assign partner' });
    } finally {
      setAssigning(false);
    }
  };

  const handleForceComplete = async () => {
    if (!assignment || !order) return;
    try {
      const res = await api.post(`/delivery/admin/orders/${assignment._id || assignment.id || 'current'}/force-complete`);
      if (res.data.success) {
        toast({ title: 'Success', description: 'Delivery marked as completed.' });
        fetchAssignment(order.orderNumber);
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to force complete delivery' });
    }
  };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await api.get('/delivery/admin/partners?status=online');
        if (res.data.success) {
          setPartners(res.data.partners);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchPartners();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
        if (response.data && response.data.orderNumber) {
          fetchAssignment(response.data.orderNumber);
        }
      } catch (error) {
        setOrder(null);
        toast({
          title: "Error",
          description: "Could not fetch order details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleDownloadImage = (url: string, title: string) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${title.replace(/\s+/g, '_')}.jpg`;
        link.click();
        toast({
          title: "Download Started",
          description: `Downloading custom design image for "${title}"`,
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to download image. Try right-clicking it.",
          variant: "destructive",
        });
      });
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('clean-invoice-pdf');
    if (element) {
      const invoiceHeight = element.scrollHeight;
      console.log('Invoice Height:', invoiceHeight);
      
      toast({
        title: "Exporting PDF",
        description: `Generating high-quality invoice for order #${order?.orderNumber}`,
      });
      
      const options = {
        margin: [10, 10, 10, 10],
        filename: `invoice-${order?.orderNumber}.pdf`,
        image: {
          type: 'jpeg',
          quality: 1
        },
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
          logging: false,
          windowWidth: 1200,
          windowHeight: 1600
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      };
      
      html2pdf().from(element).set(options).save();
    } else if (orderRef.current) {
      const fallbackElement = document.getElementById('order-details-pdf') || orderRef.current;
      const invoiceHeight = fallbackElement.scrollHeight;
      console.log('Fallback Invoice Height:', invoiceHeight);
      
      toast({
        title: "Exporting PDF (Fallback)",
        description: `Generating invoice for order #${order?.orderNumber}`,
      });
      
      const options = {
        margin: [10, 10, 10, 10],
        filename: `invoice-${order?.orderNumber}.pdf`,
        image: {
          type: 'jpeg',
          quality: 1
        },
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
          logging: false,
          windowWidth: 1200,
          windowHeight: 1600
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      };
      
      html2pdf().from(fallbackElement).set(options).save();
    }
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return;
    try {
      const response = await api.put(`/orders/${order._id}/status`, { status: newStatus });
      if (response.data) {
        setOrder({ ...order, status: newStatus });
        toast({
          title: "Success",
          description: `Order status updated to "${getStatusConfig(newStatus).label}" successfully.`,
        });
        if (newStatus === 'delivered') {
          toast({
            title: "🎉 Order Delivered!",
            description: "Email notification with invoice has been sent to the customer.",
          });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const testDeliveryEmail = async () => {
    if (!order) return;

    try {
      toast({
        title: "Testing Email",
        description: `Testing delivery email for order ${order.orderNumber}...`,
      });

      const response = await api.post('/orders/test-delivery-email', { 
        orderId: order._id 
      });

      if (response.data.success) {
        toast({
          title: "✅ Email Test Successful",
          description: `Test email sent to ${response.data.customerEmail}`,
        });
      } else {
        toast({
          title: "❌ Email Test Failed",
          description: response.data.message || "Failed to send test email",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error testing delivery email:', error);
      toast({
        title: "❌ Email Test Failed",
        description: error.response?.data?.message || "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  const copyOrderIdToClipboard = () => {
    if (!order) return;
    navigator.clipboard.writeText(order._id);
    setCopiedId(true);
    toast({
      title: "Copied!",
      description: "Database Order ID copied to clipboard.",
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getWhatsAppLink = (phone: string, name: string, orderNumber: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCC = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Hello ${name}, this is Spring Blossoms Florist. We are reaching out regarding your order #${orderNumber}.`);
    return `https://wa.me/${phoneWithCC}?text=${message}`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-96 md:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl mt-12 shadow-sm">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Not Found</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">The order ID does not exist or may have been deleted.</p>
        <Button variant="outline" onClick={() => navigate('/admin/orders')} className="mt-5 border-slate-200 dark:border-slate-800 rounded-xl">
          Back to Orders
        </Button>
      </div>
    );
  }

  const statusCfg = getStatusConfig(order.status);
  const isGift = !!(order.giftDetails && order.giftDetails.recipientName && order.giftDetails.recipientName.trim() !== '');

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {order.isTestOrder && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3.5 text-amber-850 dark:text-amber-350 shadow-sm animate-in slide-in-from-top duration-300">
          <AlertCircle className="h-5.5 w-5.5 text-amber-600 dark:text-amber-500 animate-pulse shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold tracking-wide uppercase">🧪 Internal Test Order</h4>
            <p className="text-xs mt-1 leading-relaxed opacity-85">This order is flagged as a placeholder/testing transaction. All customer-facing notifications (emails, invoices, review requests, WhatsApp, and SMS alerts) are skipped. Automatic delivery partner routing and live updates remain fully active.</p>
          </div>
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <button 
            onClick={() => navigate('/admin/orders')} 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 uppercase tracking-wider transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to orders
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Order #{order.orderNumber}</h1>
            
            {/* Database ID Copy pill */}
            <button 
              onClick={copyOrderIdToClipboard}
              className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              title="Copy Database ID"
            >
              <span>ID: {order._id.substring(0, 8)}...</span>
              {copiedId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy • h:mm a')}
          </p>
        </div>

        {/* Global Details Actions & Status Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick status dropdown switcher */}
          <Select
            value={order.status}
            onValueChange={(value) => handleStatusUpdate(value as Order['status'])}
          >
            <SelectTrigger className="border-0 p-0 h-auto w-auto bg-transparent focus:ring-0 focus:ring-offset-0">
              <div className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02]",
                statusCfg.bg,
                statusCfg.border,
                statusCfg.text
              )}>
                {statusCfg.icon}
                <span>{statusCfg.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-0.5" />
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectItem value="order_placed" className="text-xs font-medium">Order Placed</SelectItem>
              <SelectItem value="received" className="text-xs font-medium">Received</SelectItem>
              <SelectItem value="being_made" className="text-xs font-medium">Being Made</SelectItem>
              <SelectItem value="out_for_delivery" className="text-xs font-medium">Out for Delivery</SelectItem>
              <SelectItem value="delivered" className="text-xs font-medium">Delivered</SelectItem>
              <SelectItem value="cancelled" className="text-xs font-medium">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadPDF} 
            className="h-9 gap-1.5 text-xs border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300"
          >
            <Download className="h-4 w-4" /> Invoice PDF
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={testDeliveryEmail}
            className="h-9 gap-1.5 text-xs border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300"
          >
            <Mail className="h-4 w-4 text-blue-500" /> Test Email
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" ref={orderRef} id="order-details-pdf">
        
        {/* Brand Invoice Header */}
        <div className="col-span-1 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-emerald-100 dark:border-emerald-900/30">
              🌸
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Spring Blossoms Florist</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">A Reason to Express</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam, Hyderabad | GSTIN: 36AABFS1234Z1Z5</p>
            </div>
          </div>
          <div className="text-left sm:text-right border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Invoice</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">INV-{order.orderNumber}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">Date: {format(new Date(order.createdAt), 'dd/MM/yyyy')}</span>
          </div>
        </div>

        {/* Left Column: Order Items, Customizations, Timeline (Takes 2/3 space) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Product Items */}
          <Card className="border-slate-100 dark:border-slate-850 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-500" />
                Items Ordered
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100 dark:divide-slate-850/60">
                {order.items.map((item, idx) => (
                  <li key={idx} className="p-5 flex flex-col sm:flex-row gap-4 sm:items-start group transition-colors hover:bg-slate-50/20">
                    
                    {/* Item Thumbnail */}
                    <div className="relative shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <div className="relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 h-24 w-24">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                          <button
                            onClick={() => handleDownloadImage(item.product!.images[0], item.product!.title)}
                            className="absolute bottom-1 right-1 h-6 w-6 rounded-md bg-white/90 hover:bg-white text-slate-600 dark:text-slate-800 hover:text-blue-600 shadow-sm flex items-center justify-center transition-colors border border-slate-200/50"
                            title="Download Image"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-24 w-24 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl flex items-center justify-center">
                          <Flower2 className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Item Metadata */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.product?.title || item.title || 'Florist Arrangement'}</h4>
                          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">PID: {item.product?._id || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs.5 font-extrabold text-slate-900 dark:text-white">
                            {displayOrderPrice(item.finalPrice, order.currency, order.currencyRate)}
                          </div>
                          {item.finalPrice !== item.price && (
                            <div className="text-[10px] text-slate-400 font-semibold line-through">
                              {displayOrderPrice(item.price, order.currency, order.currencyRate)}
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Qty: {item.quantity}</span>
                        </div>
                      </div>

                      {/* Customizations Section */}
                      <div className="pt-2">
                        {item.customizations ? (
                          <div className="grid grid-cols-1 gap-2.5 mt-1 text-xs">
                            
                            {/* Message Card */}
                            {item.customizations.messageCard && (
                              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 p-3 rounded-xl space-y-1">
                                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>Written Card Message</span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium">
                                  "{item.customizations.messageCard}"
                                </p>
                              </div>
                            )}

                            {/* Photo Upload */}
                            {item.customizations.photo && (
                              <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/40 dark:border-blue-900/20 p-2.5 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  <span className="text-xs font-semibold text-blue-800 dark:text-blue-400">Attached Custom Image</span>
                                </div>
                                <a 
                                  href={item.customizations.photo} 
                                  download 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline px-2.5 py-1 rounded bg-blue-100/40 dark:bg-blue-950/30"
                                >
                                  <span>View Image</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}

                            {/* Custom Number */}
                            {item.customizations.number && (
                              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 px-2.5 py-1.5 rounded-xl flex items-center gap-2">
                                <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">🔢 Number</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{item.customizations.number}</span>
                              </div>
                            )}

                            {/* Flower Addons */}
                            {item.customizations.selectedFlowers && item.customizations.selectedFlowers.length > 0 && (
                              <div className="bg-pink-50/50 dark:bg-pink-950/10 border border-pink-200/40 dark:border-pink-900/20 p-2.5 rounded-xl">
                                <div className="flex items-center gap-1.5 text-pink-700 dark:text-pink-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                                  <Heart className="h-3.5 w-3.5" />
                                  <span>Flower Add-ons ({item.customizations.selectedFlowers.reduce((tot: number, f: any) => tot + (f.quantity || 1), 0)})</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {item.customizations.selectedFlowers.map((f: any, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] bg-white/70 dark:bg-slate-900 border-pink-100 dark:border-pink-950 text-pink-700 dark:text-pink-400 font-semibold rounded-lg py-0.5 px-2">
                                      🌸 {f.name} (x{f.quantity || 1})
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Chocolate Addons */}
                            {item.customizations.selectedChocolates && item.customizations.selectedChocolates.length > 0 && (
                              <div className="bg-amber-900/[0.04] dark:bg-amber-950/10 border border-amber-800/20 dark:border-amber-900/20 p-2.5 rounded-xl">
                                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                                  <span>🍫</span>
                                  <span>Chocolate Add-ons ({item.customizations.selectedChocolates.reduce((tot: number, c: any) => tot + (c.quantity || 1), 0)})</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {item.customizations.selectedChocolates.map((c: any, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] bg-white/70 dark:bg-slate-900 border-amber-100 dark:border-amber-950 text-amber-800 dark:text-amber-400 font-semibold rounded-lg py-0.5 px-2">
                                      🍫 {c.name} (x{c.quantity || 1})
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Gift Builder Bundle */}
                            {item.customizations.isGiftBundle && item.customizations.giftComponents && (
                              <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/40 dark:border-rose-900/20 p-2.5 rounded-xl">
                                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                                  <span>🎁</span>
                                  <span>Gift Box Components ({item.customizations.giftComponents.length})</span>
                                </div>
                                <div className="space-y-1">
                                  {item.customizations.giftComponents.map((comp: any, idx: number) => (
                                    <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pl-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                      <span className="capitalize font-semibold text-rose-500/90">{comp.category.replace('_', ' ')}:</span>
                                      <span>{comp.name}</span>
                                    </div>
                                  ))}
                                </div>
                                {item.customizations.customMessage && (
                                  <div className="mt-2 pt-2 border-t border-rose-200/40">
                                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block mb-0.5">Greeting Card Message</span>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium">
                                      "{item.customizations.customMessage}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic font-semibold mt-1">No customizations configured.</div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Tracking History Timeline */}
          {order.trackingHistory && order.trackingHistory.length > 0 && (
            <Card className="border-slate-100 dark:border-slate-850 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 pb-4">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Activity & Tracking Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative border-l border-slate-150 dark:border-slate-800 ml-3.5 space-y-6">
                  {order.trackingHistory.map((track, idx) => {
                    const trackCfg = getStatusConfig(track.status);
                    return (
                      <div key={idx} className="relative pl-7 group">
                        {/* Timeline Circle checkpoint */}
                        <div className={cn(
                          "absolute -left-2.5 top-0.5 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center h-5 w-5",
                          trackCfg.glow
                        )} />

                        {/* Timeline Entry Body */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border",
                              trackCfg.bg,
                              trackCfg.border,
                              trackCfg.text
                            )}>
                              {trackCfg.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {format(new Date(track.timestamp), 'MMM d, yyyy • h:mm a')}
                            </span>
                          </div>
                          {track.message && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {track.message}
                            </p>
                          )}
                          {track.updatedBy && (
                            <p className="text-[10px] text-slate-400 font-semibold italic">
                              Changed by: {track.updatedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Customer Details, Schedule & Financial Summary (Takes 1/3 space) */}
        <div className="space-y-6">

          {/* Card 1: Delivery Schedule & Address Info */}
          <Card className="border-slate-100 dark:border-slate-850 shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* Delivery schedule (Time slot display) */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150/40 dark:border-slate-850 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100/50 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Delivery Schedule</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {order.shippingDetails.deliveryDate ? format(new Date(order.shippingDetails.deliveryDate), 'MMMM d, yyyy') : 'Date not set'}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-950/25 border border-indigo-200/20 px-2 py-0.5 rounded-md mt-1">
                    {formatTimeSlot(order.shippingDetails.timeSlot)}
                  </span>
                </div>
              </div>

              {/* Sender / Customer Profile */}
              <div className="space-y-2 border-t border-slate-50 dark:border-slate-850/50 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isGift ? 'Sender Details' : 'Customer Details'}
                  </span>
                  <Badge variant="outline" className="text-[9px] bg-slate-50/50 border-slate-200 dark:border-slate-800 uppercase tracking-wider px-1.5">
                    {isGift ? '🎁 Gift Delivery' : '📦 Self Delivery'}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.shippingDetails.fullName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {order.shippingDetails.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {order.shippingDetails.phone}
                  </p>
                </div>

                {/* Direct Call / WhatsApp Quick Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a 
                    href={`tel:${order.shippingDetails.phone}`}
                    className="flex items-center justify-center gap-2 h-9 text-xs font-bold rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 shadow-sm"
                  >
                    <Phone className="h-3.5 w-3.5" /> {isGift ? 'Call Sender' : 'Call Customer'}
                  </a>
                  <a 
                    href={getWhatsAppLink(order.shippingDetails.phone, order.shippingDetails.fullName, order.orderNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-9 text-xs font-bold rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all duration-200 hover:scale-[1.01]"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> {isGift ? 'WhatsApp Sender' : 'WhatsApp'}
                  </a>
                </div>
              </div>

              {/* Delivery / Gift Details */}
              {isGift ? (
                <div className="space-y-3 border-t border-slate-50 dark:border-slate-850/50 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gift Delivery Details</span>
                    <Badge className="text-[9px] font-bold bg-emerald-500 text-white border-transparent">
                      🎁 Gift Delivery
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.giftDetails?.recipientName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {order.giftDetails?.recipientPhone}
                    </p>
                    {order.giftDetails?.recipientEmail && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {order.giftDetails.recipientEmail}
                      </p>
                    )}
                  </div>

                  {/* Direct Call / WhatsApp Quick Actions for Recipient */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a 
                      href={`tel:${order.giftDetails?.recipientPhone}`}
                      className="flex items-center justify-center gap-2 h-9 text-xs font-bold rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 shadow-sm"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call Recipient
                    </a>
                    <a 
                      href={getWhatsAppLink(order.giftDetails?.recipientPhone || '', order.giftDetails?.recipientName || '', order.orderNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 h-9 text-xs font-bold rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all duration-200 hover:scale-[1.01]"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Recipient
                    </a>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient Address</span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                      {order.giftDetails?.recipientAddress}
                      {order.giftDetails?.recipientApartment && <span className="block mt-0.5 text-slate-500 dark:text-slate-400">Apt: {order.giftDetails.recipientApartment}</span>}
                      <span className="block mt-0.5 text-slate-600 dark:text-slate-400 font-bold">{order.giftDetails?.recipientCity}, {order.giftDetails?.recipientState} {order.giftDetails?.recipientZipCode}</span>
                    </p>
                  </div>

                  {/* Gift Message */}
                  {order.giftDetails?.message && (
                    <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-250 bg-rose-50/20 dark:border-rose-800/30 p-3 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold text-rose-700 dark:text-rose-450 uppercase tracking-wider block flex items-center gap-1">💌 Gift Message</span>
                      <p className="text-xs text-slate-700 dark:text-slate-350 italic font-bold leading-relaxed">
                        "{order.giftDetails.message}"
                      </p>
                    </div>
                  )}

                  {/* Greeting Card */}
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-250 p-2.5 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-[10px] uppercase tracking-wider">🎴 Greeting Card</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {order.giftDetails?.greetingCard && order.giftDetails.greetingCard !== 'none' ? order.giftDetails.greetingCard : 'None'}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150/40 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Surprise Delivery:</span>
                      <Badge className={order.giftDetails?.surpriseDelivery ? "bg-indigo-650 text-white font-bold" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}>
                        {order.giftDetails?.surpriseDelivery ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-slate-500 font-semibold">Anonymous Gift:</span>
                      <Badge className={order.giftDetails?.anonymousGift ? "bg-indigo-650 text-white font-bold" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}>
                        {order.giftDetails?.anonymousGift ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 border-t border-slate-50 dark:border-slate-850/50 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Details</span>
                    <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-850 uppercase tracking-wider px-1.5 font-bold">
                      Not a Gift
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    This order will be delivered to the customer.
                  </p>

                  {/* Customer Shipping Address */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Address</span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                      {order.shippingDetails.address}
                      {order.shippingDetails.apartment && <span className="block mt-0.5 text-slate-500 dark:text-slate-400">Apt: {order.shippingDetails.apartment}</span>}
                      <span className="block mt-0.5 text-slate-600 dark:text-slate-400 font-bold">{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</span>
                    </p>
                  </div>

                  {/* Card Message Section for guest checkout or fallback */}
                  {(order.shippingDetails.cardMessage || order.shippingDetails.giftMessage) && (
                    <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-250 bg-rose-50/20 dark:border-rose-800/30 p-3 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold text-rose-700 dark:text-rose-450 uppercase tracking-wider block flex items-center gap-1">💌 Greeting Card Message</span>
                      <p className="text-xs text-slate-700 dark:text-slate-355 italic font-bold leading-relaxed">
                        "{order.shippingDetails.cardMessage || order.shippingDetails.giftMessage}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Special Instructions */}
              {(order.shippingDetails.deliverySpecialInstructions || order.shippingDetails.notes) && (
                <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-250 bg-blue-50/20 dark:border-blue-800/30 p-3 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-blue-700 dark:text-blue-450 uppercase tracking-wider block">🚚 Delivery Special Instructions</span>
                  <p className="text-xs text-slate-700 dark:text-slate-350 italic font-medium leading-relaxed">
                    "{order.shippingDetails.deliverySpecialInstructions || order.shippingDetails.notes}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Financial Summary & Payments */}
          <Card className="border-slate-100 dark:border-slate-850 shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-500" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* Core numbers breakdown */}
              <div className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="text-slate-900 dark:text-white">
                    {displayOrderPrice(order.subtotal || order.items.reduce((sum: number, item: any) => sum + (item.finalPrice || item.price) * item.quantity, 0), order.currency, order.currencyRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="text-slate-900 dark:text-white font-semibold text-right">
                    {order.isFirstOrderFreeDelivery ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap animate-pulse">
                        FREE (waived)
                      </span>
                    ) : (
                      displayOrderPrice(order.deliveryCharge ?? 150, order.currency, order.currencyRate)
                    )}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Promo Discount</span>
                    <span className="font-bold">
                      -{displayOrderPrice(order.discount, order.currency, order.currencyRate)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-50 dark:border-slate-850/40 pt-2.5 text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Grand Total</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {displayOrderPrice(order.totalAmount, order.currency, order.currencyRate)}
                  </span>
                </div>
                {order.currency && order.currency !== currency && (
                  <div className="text-[10px] text-slate-400 font-semibold text-right italic pt-0.5">
                    Original placement amount: {formatPriceWithCurrency(order.totalAmount, order.currency)}
                  </div>
                )}
              </div>

              {/* Payment details */}
              <div className="border-t border-slate-50 dark:border-slate-850/50 pt-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Details</span>
                
                <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex justify-between">
                    <span>Method</span>
                    <span className="font-bold text-slate-800 dark:text-slate-250 uppercase">{order.paymentDetails.method || 'Online'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Payment Status</span>
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold capitalize py-0.5 shadow-sm">
                      Completed
                    </Badge>
                  </div>
                  
                  {order.paymentDetails.razorpayPaymentId && (
                    <div className="flex flex-col pt-1.5 gap-0.5 border-t border-slate-50 dark:border-slate-850/30 mt-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                      <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all select-all font-semibold">{order.paymentDetails.razorpayPaymentId}</span>
                    </div>
                  )}

                  {order.paymentDetails.razorpayOrderId && (
                    <div className="flex flex-col pt-1 gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Razorpay Order ID</span>
                      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all select-all">{order.paymentDetails.razorpayOrderId}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Dispatch Logistics Card */}
          <Card className="border-emerald-100 dark:border-emerald-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100/50 pb-4">
              <CardTitle className="text-sm font-bold text-emerald-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-700" />
                Delivery Partner Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {assignment ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Live Courier Status:</span>
                    <Badge className="bg-emerald-700 text-white font-bold capitalize">
                      {assignment.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {assignment.partner ? (
                    <div className="p-3 bg-emerald-50/20 border border-emerald-100 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Courier Name</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{assignment.partner.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Vehicle</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{assignment.partner.vehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Live ETA</span>
                        <span className="font-semibold text-emerald-700">{assignment.eta} mins ({assignment.distance} km)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Verification OTP</span>
                        <span className="font-mono font-bold text-emerald-800 tracking-wider text-sm">{assignment.customerOtp || '****'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50/20 border border-amber-100 rounded-xl text-xs text-amber-800">
                      Auto Assign Searching...
                    </div>
                  )}

                  {/* Admin overrides */}
                  <div className="pt-3 border-t border-emerald-100 space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="courier-assign" className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assign Manual Partner</Label>
                      <div className="flex gap-2">
                        <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                          <SelectTrigger className="text-xs h-9 border-emerald-250 bg-white">
                            <SelectValue placeholder="Select online courier" />
                          </SelectTrigger>
                          <SelectContent>
                            {partners.map(p => (
                              <SelectItem key={p._id} value={p._id}>{p.name} ({p.vehicleType})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleAssignPartner}
                          disabled={assigning}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-semibold"
                        >
                          Assign
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleForceComplete}
                      variant="outline"
                      className="w-full text-xs font-semibold text-emerald-800 border-emerald-200 hover:bg-emerald-50 h-9 justify-center"
                    >
                      Force Complete Delivery
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">No active assignments exist for this order. Trigger manual assign below:</p>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="courier-assign" className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assign Partner</Label>
                    <div className="flex gap-2">
                      <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                        <SelectTrigger className="text-xs h-9 border-emerald-250 bg-white">
                          <SelectValue placeholder="Select online courier" />
                        </SelectTrigger>
                        <SelectContent>
                          {partners.map(p => (
                            <SelectItem key={p._id} value={p._id}>{p.name} ({p.vehicleType})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignPartner}
                        disabled={assigning}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-semibold"
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Offscreen print-ready invoice */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div id="clean-invoice-pdf" className="bg-white">
          <Invoice order={order} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;