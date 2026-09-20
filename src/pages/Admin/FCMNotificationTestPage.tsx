import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BellRing,
  Smartphone,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Volume2,
  Shield,
  User,
  Search,
  Filter,
  Layers,
  Sparkles,
  Server,
  Trash2,
  Sliders,
  ExternalLink,
  Laptop,
  Apple,
  Info,
  Zap,
  Radio,
  Clock,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  getAdminDevices,
  getFCMStatus,
  sendTestNotificationToAll,
  sendTestNotificationToDevice,
  deactivateDeviceToken,
  cleanupOldTokens,
  AdminDevice,
  FCMStatus,
  TestNotificationResponse,
  DeliveryRecipientResult
} from '@/services/fcmAdminService';

interface NotificationPreset {
  id: string;
  name: string;
  badge: string;
  title: string;
  body: string;
  orderNumber: string;
  customerName: string;
  amount: string;
  type: string;
  icon: string;
}

const PRESETS: NotificationPreset[] = [
  {
    id: 'new_order',
    name: 'New Order Received',
    badge: 'Popular',
    title: '🎉 New Order Received!',
    body: 'Order #SBF-9482 received for ₹1,499 from Ananya Sharma',
    orderNumber: 'SBF-9482',
    customerName: 'Ananya Sharma',
    amount: '1499',
    type: 'NEW_ORDER',
    icon: '🛍️'
  },
  {
    id: 'express_order',
    name: 'Express Midnight Delivery',
    badge: 'High Priority',
    title: '⚡ Midnight Delivery Alert!',
    body: 'Order #SBF-9510 (Midnight Slot 11:30 PM) requires immediate bouquet prep',
    orderNumber: 'SBF-9510',
    customerName: 'Vikram Mehta',
    amount: '2899',
    type: 'NEW_ORDER',
    icon: '🌙'
  },
  {
    id: 'delivery_dispatched',
    name: 'Out for Delivery',
    badge: 'Dispatch',
    title: '🚚 Delivery Dispatched',
    body: 'Order #SBF-9482 has been picked up by Partner Ramesh (KA-04-E-2910)',
    orderNumber: 'SBF-9482',
    customerName: 'Ananya Sharma',
    amount: '1499',
    type: 'ORDER_DISPATCHED',
    icon: '🛵'
  },
  {
    id: 'custom_alert',
    name: 'Custom Admin Notice',
    badge: 'Broadcast',
    title: '📢 Admin System Broadcast',
    body: 'Scheduled catalog sync completed. Check inventory dashboard for stock updates.',
    orderNumber: 'SYS-001',
    customerName: 'System Operations',
    amount: '0',
    type: 'GENERAL',
    icon: '📣'
  }
];

export const FCMNotificationTestPage: React.FC = () => {
  const { toast } = useToast();

  // State
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [fcmStatus, setFcmStatus] = useState<FCMStatus | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'android' | 'ios' | 'web'>('all');

  // Dispatch Form
  const [activePreset, setActivePreset] = useState<string>('new_order');
  const [title, setTitle] = useState('🎉 New Order Received!');
  const [body, setBody] = useState('Order #SBF-9482 received for ₹1,499 from Ananya Sharma');
  const [orderNumber, setOrderNumber] = useState('SBF-9482');
  const [customerName, setCustomerName] = useState('Ananya Sharma');
  const [amount, setAmount] = useState('1499');
  const [notifType, setNotifType] = useState('NEW_ORDER');

  // Target mode
  const [targetMode, setTargetMode] = useState<'all' | 'single'>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Results & History
  const [lastResult, setLastResult] = useState<TestNotificationResponse | null>(null);
  const [showResultReport, setShowResultReport] = useState(false);

  // Audio preview ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load initial data
  const fetchStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const res = await getFCMStatus();
      if (res?.fcm) {
        setFcmStatus(res.fcm);
      }
    } catch (err: any) {
      console.error('Error fetching FCM status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const fetchDevices = async () => {
    try {
      setIsLoadingDevices(true);
      const list = await getAdminDevices();
      setDevices(list);
      if (list.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(list[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching admin devices:', err);
      toast({
        variant: 'destructive',
        title: 'Error Loading Devices',
        description: err.response?.data?.message || 'Could not fetch admin devices.'
      });
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchDevices();
  }, []);

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    const p = PRESETS.find(item => item.id === presetId);
    if (p) {
      setTitle(p.title);
      setBody(p.body);
      setOrderNumber(p.orderNumber);
      setCustomerName(p.customerName);
      setAmount(p.amount);
      setNotifType(p.type);
    }
  };

  // Play audio chime preview
  const handlePlaySound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/notification.mp3');
      }
      setIsPlayingAudio(true);
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setTimeout(() => setIsPlayingAudio(false), 2500);
      }).catch(err => {
        console.warn('Audio play error:', err);
        setIsPlayingAudio(false);
        toast({
          title: 'Audio Preview',
          description: 'Click anywhere on the page first if browser restricts autoplay.'
        });
      });
    } catch (e) {
      setIsPlayingAudio(false);
    }
  };

  // Copy token to clipboard
  const handleCopyToken = (id: string, tokenPreview: string) => {
    navigator.clipboard.writeText(tokenPreview);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
    toast({
      title: 'Token Copied',
      description: 'Device token snippet copied to clipboard.'
    });
  };

  // Clean stale tokens
  const handleCleanup = async () => {
    try {
      setIsCleaning(true);
      const res = await cleanupOldTokens();
      toast({
        title: 'Cleanup Complete',
        description: res.message || `Removed ${res.data?.deletedCount || 0} expired tokens.`
      });
      fetchDevices();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Cleanup Failed',
        description: err.response?.data?.message || 'Could not clean tokens.'
      });
    } finally {
      setIsCleaning(false);
    }
  };

  // Send Test Notification
  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please provide both a notification title and body message.'
      });
      return;
    }

    const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const payload = {
      title,
      body,
      orderId: generatedOrderId,
      orderNumber,
      customerName,
      amount,
      type: notifType,
      data: {
        orderId: generatedOrderId,
        orderNumber,
        customerName,
        amount,
        type: notifType,
        source: 'admin_test_panel',
        timestamp: new Date().toISOString()
      }
    };

    setIsSending(true);
    setLastResult(null);

    try {
      let res: TestNotificationResponse;
      if (targetMode === 'all') {
        res = await sendTestNotificationToAll(payload);
      } else {
        if (!selectedDeviceId) {
          toast({
            variant: 'destructive',
            title: 'No Device Selected',
            description: 'Please pick a specific device from the list.'
          });
          setIsSending(false);
          return;
        }
        res = await sendTestNotificationToDevice(selectedDeviceId, payload);
      }

      setLastResult(res);
      setShowResultReport(true);

      // Also play in-browser chime to simulate receipt
      handlePlaySound();

      if (res.success) {
        toast({
          title: 'Push Notification Dispatched! 🚀',
          description: res.message || 'Notification broadcast completed successfully.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Delivery Issues Detected',
          description: res.message || 'Some or all devices could not receive the push notification.'
        });
      }

      // Refresh list to update lastUsed timestamps
      fetchDevices();
    } catch (err: any) {
      console.error('Failed to dispatch test notification:', err);
      toast({
        variant: 'destructive',
        title: 'Dispatch Failed',
        description: err.response?.data?.message || err.message || 'Could not send test push notification.'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Single Device Quick Test Trigger from Row
  const handleQuickDeviceTest = async (device: AdminDevice) => {
    const quickOrderId = `PING-${Date.now().toString().slice(-6)}`;
    const payload = {
      title: `🌸 Test Ping: ${device.user?.name || 'Admin'}`,
      body: `Direct high-priority alert to your ${device.deviceType.toUpperCase()} device from Admin Panel`,
      orderId: quickOrderId,
      orderNumber: quickOrderId,
      customerName: device.user?.name || 'Administrator',
      amount: '999',
      type: 'NEW_ORDER',
      data: {
        source: 'admin_device_quick_test',
        deviceId: device.id,
        orderId: quickOrderId,
        orderNumber: quickOrderId,
        customerName: device.user?.name || 'Administrator',
        amount: '999',
        type: 'NEW_ORDER',
        timestamp: new Date().toISOString()
      }
    };

    try {
      toast({
        title: 'Sending Ping...',
        description: `Dispatching alert to ${device.user?.name || 'Device'} (${device.deviceType}).`
      });
      const res = await sendTestNotificationToDevice(device.id, payload);
      setLastResult(res);
      setShowResultReport(true);
      handlePlaySound();
      toast({
        title: 'Ping Sent! 🔔',
        description: `Notification dispatched to ${device.user?.name || 'Device'}.`
      });
      fetchDevices();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Ping Failed',
        description: err.response?.data?.message || 'Could not send ping to this device.'
      });
    }
  };

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch =
        (d.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.user?.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.deviceType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.tokenPreview || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform =
        platformFilter === 'all' || d.deviceType.toLowerCase() === platformFilter;

      return matchesSearch && matchesPlatform;
    });
  }, [devices, searchQuery, platformFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = devices.length;
    const android = devices.filter(d => d.deviceType.toLowerCase() === 'android').length;
    const ios = devices.filter(d => d.deviceType.toLowerCase() === 'ios').length;
    const web = devices.filter(d => d.deviceType.toLowerCase() === 'web').length;
    const active = devices.filter(d => d.isActive).length;

    // Distinct admin user accounts
    const distinctUsers = new Set(
      devices.map(d => d.user?.email || d.user?.id).filter(Boolean)
    ).size;

    return { total, android, ios, web, active, distinctUsers };
  }, [devices]);

  // Format relative date
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Never';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                <BellRing className="h-6 w-6 animate-pulse" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                FCM Push Notifications & Dispatcher
              </h1>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold">
                ● Live Dispatcher
              </Badge>
            </div>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Verify all admin recipients, test high-priority audio & vibration alerts for new orders, preview notifications on live mobile frames, and monitor device health.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlaySound}
              className={`bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-100 transition-all ${
                isPlayingAudio ? 'ring-2 ring-emerald-400 bg-emerald-950/60' : ''
              }`}
            >
              <Volume2 className={`h-4 w-4 mr-2 ${isPlayingAudio ? 'animate-bounce text-emerald-400' : 'text-slate-400'}`} />
              {isPlayingAudio ? 'Playing Chime...' : 'Test Alarm Chime'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchDevices();
                fetchStatus();
                toast({ title: 'Refreshed', description: 'Device tokens and FCM status reloaded.' });
              }}
              disabled={isLoadingDevices || isLoadingStatus}
              className="bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDevices ? 'animate-spin' : ''}`} />
              Sync Devices
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              disabled={isCleaning}
              className="bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-100"
            >
              <Trash2 className="h-4 w-4 mr-2 text-rose-400" />
              {isCleaning ? 'Cleaning...' : 'Prune Stale Tokens'}
            </Button>
          </div>
        </div>

        {/* Diagnostic Status Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${fcmStatus?.initialized ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
            <span className="text-slate-400">Firebase SDK:</span>
            <span className="font-semibold text-slate-100">
              {isLoadingStatus ? 'Checking...' : fcmStatus?.initialized ? 'Operational' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Server className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">Project:</span>
            <span className="font-semibold text-slate-100 truncate max-w-[140px]" title={fcmStatus?.projectId}>
              {fcmStatus?.projectId || 'Configured'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Sound Channel:</span>
            <span className="font-semibold text-emerald-300 font-mono">orders_channel</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Priority:</span>
            <span className="font-semibold text-amber-300">High (3-Ring Alarm)</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Admin Devices</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.active}</h3>
              <p className="text-xs text-muted-foreground mt-1">Across {stats.distinctUsers} admin accounts</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Smartphone className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Android Devices</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.android}</h3>
              <p className="text-xs text-muted-foreground mt-1">SBF Florist Admin App</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Smartphone className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">iOS & Web Devices</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.ios + stats.web}</h3>
              <p className="text-xs text-muted-foreground mt-1">{stats.ios} iOS • {stats.web} Web browsers</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
              <Laptop className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service Health</p>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-foreground">Ready to Dispatch</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">FCM credentials valid</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Zap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column Layout: Left = Dispatcher & Preview, Right = Admin Recipients Directory */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols on XL): Presets, Payload Composer, Live Mobile Preview */}
        <div className="xl:col-span-7 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    Test Notification Composer
                  </CardTitle>
                  <CardDescription>
                    Choose a quick business scenario preset or customize your push payload.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
                  <button
                    onClick={() => setTargetMode('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      targetMode === 'all'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    📢 Broadcast to ALL ({stats.active})
                  </button>
                  <button
                    onClick={() => setTargetMode('single')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      targetMode === 'single'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🎯 Single Device
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Notification Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESETS.map(p => {
                    const isSelected = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        className={`p-3 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="text-xl">{p.icon}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {p.badge}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground leading-snug">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.orderNumber}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Selector if Single Device mode */}
              {targetMode === 'single' && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <TargetDeviceIcon /> Target Recipient Device:
                    </label>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                      {devices.length} registered
                    </span>
                  </div>
                  {devices.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No devices found. Open the mobile app to register.</p>
                  ) : (
                    <select
                      value={selectedDeviceId}
                      onChange={e => setSelectedDeviceId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-amber-300 dark:border-amber-800 bg-background focus:ring-2 focus:ring-amber-500"
                    >
                      {devices.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.user?.name || 'Admin'} ({d.user?.role || 'admin'}) • {d.deviceType.toUpperCase()} • Token {d.tokenPreview}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Notification Title</label>
                    <span className="text-[11px] text-muted-foreground">{title.length} chars</span>
                  </div>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. 🎉 New Order Received!"
                    className="font-medium"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Message Body</label>
                    <span className="text-[11px] text-muted-foreground">{body.length} chars</span>
                  </div>
                  <Textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={2}
                    placeholder="e.g. Order #123 - ₹500 from Customer"
                    className="font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Order Number</label>
                  <Input
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    placeholder="SBF-9482"
                    className="text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Total Amount (₹)</label>
                  <Input
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="1499"
                    type="number"
                    className="text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Customer Name</label>
                  <Input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Payload Type</label>
                  <select
                    value={notifType}
                    onChange={e => setNotifType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="NEW_ORDER">NEW_ORDER</option>
                    <option value="ORDER_DISPATCHED">ORDER_DISPATCHED</option>
                    <option value="ORDER_DELIVERED">ORDER_DELIVERED</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>
              </div>

              {/* Simulated Mobile Device Preview Card */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-indigo-500" />
                    Live Phone Lockscreen Banner Preview
                  </label>
                  <span className="text-[11px] text-muted-foreground">Real-time simulation</span>
                </div>

                <div className="mx-auto max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-xl border border-slate-800 text-white">
                  {/* Status bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 px-1">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex items-center gap-1.5">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Notification card on device */}
                  <div className="rounded-xl bg-slate-800/90 border border-slate-700/80 p-3.5 shadow-2xl backdrop-blur-md transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-md bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-[10px] font-bold text-white shadow">
                          🌸
                        </div>
                        <span className="text-xs font-bold text-slate-200 tracking-tight">SBF FLORIST ADMIN</span>
                        <span className="text-[10px] text-slate-400">• now</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1 leading-snug">{title || 'Notification Title'}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                      {body || 'Notification message body preview will appear here...'}
                    </p>

                    {/* Quick action simulation */}
                    <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-end gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-700/80 text-slate-300">Dismiss</span>
                      <span className="px-2.5 py-0.5 rounded bg-indigo-600 text-white font-semibold flex items-center gap-1">
                        View Order <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Recipient Notice Banner */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2.5">
                <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">
                    {targetMode === 'all'
                      ? `Broadcasting to ${stats.active} Active Admin Devices`
                      : 'Sending to 1 Targeted Admin Device'}
                  </p>
                  <p className="text-muted-foreground">
                    {targetMode === 'all'
                      ? `Push notification will trigger high-priority chime & vibration on all registered Android, iOS, and Web devices.`
                      : `Selected device will receive this test message immediately.`}
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span>Ready to fire via Firebase Admin</span>
              </div>

              <Button
                onClick={handleSendNotification}
                disabled={isSending || devices.length === 0}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/20 px-6"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Dispatching Push...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {targetMode === 'all' ? `Send to All Admins (${stats.active})` : 'Send Test Notification'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Delivery Results Card (shown after dispatch) */}
          {showResultReport && lastResult && (
            <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-lg overflow-hidden animate-in fade-in duration-300">
              <CardHeader className="pb-3 border-b border-emerald-200/50 dark:border-emerald-900/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Dispatch Result & Delivery Report
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResultReport(false)}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm">
                    <p className="text-[11px] font-semibold text-muted-foreground">Total Devices</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">
                      {lastResult.data?.total ?? (lastResult.data?.recipients?.length || 1)}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Delivered</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {lastResult.data?.sent ?? (lastResult.success ? 1 : 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm">
                    <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Failed</p>
                    <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      {lastResult.data?.failed ?? (lastResult.success ? 0 : 1)}
                    </p>
                  </div>
                </div>

                {/* Per-recipient breakdown */}
                {lastResult.data?.recipients && lastResult.data.recipients.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Recipient Delivery Breakdown
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {lastResult.data.recipients.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {rec.success ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                            )}
                            <div>
                              <p className="font-semibold text-foreground">
                                {rec.userName} <span className="text-muted-foreground font-normal">({rec.userRole})</span>
                              </p>
                              <p className="text-[10px] text-muted-foreground">{rec.userEmail || rec.tokenPreview}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={
                                rec.success
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 text-[10px]'
                              }
                            >
                              {rec.success ? 'Delivered' : 'Failed'}
                            </Badge>
                            {rec.messageId && (
                              <p className="text-[9px] text-muted-foreground font-mono mt-0.5 truncate max-w-[120px]" title={rec.messageId}>
                                {rec.messageId.split('/').pop()}
                              </p>
                            )}
                            {rec.error && (
                              <p className="text-[9px] text-rose-500 mt-0.5 truncate max-w-[140px]" title={rec.error}>
                                {rec.error}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Single device dispatch response */}
                {lastResult.data?.messageId && !lastResult.data?.recipients && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Recipient: {lastResult.data?.recipient || 'Device'}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">FCM ID: {lastResult.data?.messageId}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Delivered</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (5 cols on XL): Active Admin Recipients Directory */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" />
                    Recipient Admins Directory
                  </CardTitle>
                  <CardDescription>
                    All admin accounts and registered devices receiving notifications.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {filteredDevices.length} / {devices.length}
                </Badge>
              </div>

              {/* Search & Platform Filter */}
              <div className="mt-3 flex flex-col sm:flex-row gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search admin name, email, or role..."
                    className="pl-8 text-xs h-8"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0">
                  <button
                    onClick={() => setPlatformFilter('all')}
                    className={`px-2 py-1 text-[11px] rounded ${
                      platformFilter === 'all' ? 'bg-white dark:bg-slate-900 font-semibold shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setPlatformFilter('android')}
                    className={`px-2 py-1 text-[11px] rounded ${
                      platformFilter === 'android' ? 'bg-white dark:bg-slate-900 font-semibold shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Android
                  </button>
                  <button
                    onClick={() => setPlatformFilter('ios')}
                    className={`px-2 py-1 text-[11px] rounded ${
                      platformFilter === 'ios' ? 'bg-white dark:bg-slate-900 font-semibold shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    iOS
                  </button>
                  <button
                    onClick={() => setPlatformFilter('web')}
                    className={`px-2 py-1 text-[11px] rounded ${
                      platformFilter === 'web' ? 'bg-white dark:bg-slate-900 font-semibold shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Web
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {isLoadingDevices ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-500 mx-auto" />
                  <p className="text-xs text-muted-foreground">Loading registered admin devices...</p>
                </div>
              ) : filteredDevices.length === 0 ? (
                <div className="py-12 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                  <Smartphone className="h-8 w-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-semibold text-foreground">No Admin Devices Found</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {devices.length === 0
                      ? 'No devices are registered to receive push notifications yet. Log into the mobile app as admin to register.'
                      : 'No devices match your search or filter.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                  {filteredDevices.map(device => {
                    const isCopied = copiedTokenId === device.id;
                    const isSelected = selectedDeviceId === device.id && targetMode === 'single';

                    return (
                      <div
                        key={device.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-card'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Admin avatar & details */}
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                              {device.user?.name
                                ? device.user.name.slice(0, 2).toUpperCase()
                                : 'AD'}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-foreground truncate">
                                  {device.user?.name || 'Administrator'}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 font-medium capitalize bg-slate-50 dark:bg-slate-800"
                                >
                                  {device.user?.role?.replace('_', ' ') || 'admin'}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate">{device.user?.email || 'admin@sbflorist.com'}</p>
                            </div>
                          </div>

                          {/* Platform badge */}
                          <Badge
                            variant="secondary"
                            className="text-[10px] shrink-0 font-semibold flex items-center gap-1 uppercase"
                          >
                            <PlatformIcon platform={device.deviceType} />
                            {device.deviceType}
                          </Badge>
                        </div>

                        {/* Token and Device Info Strip */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                              {device.tokenPreview}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyToken(device.id, device.tokenPreview)}
                              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                              title="Copy token preview"
                            >
                              {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 text-[10px]">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{formatTimeAgo(device.lastUsed)}</span>
                          </div>
                        </div>

                        {/* Quick Test Action Button for this Device */}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Active & Ready
                          </span>

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTargetMode('single');
                                setSelectedDeviceId(device.id);
                              }}
                              className="h-7 text-xs px-2"
                            >
                              Select Target
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickDeviceTest(device)}
                              className="h-7 text-xs px-2.5 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Ping Device
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  const p = (platform || '').toLowerCase();
  if (p === 'android') {
    return <Smartphone className="h-3 w-3 text-emerald-500" />;
  }
  if (p === 'ios') {
    return <Apple className="h-3 w-3 text-slate-700 dark:text-slate-300" />;
  }
  return <Laptop className="h-3 w-3 text-indigo-500" />;
};

const TargetDeviceIcon: React.FC = () => {
  return <Smartphone className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 inline mr-1" />;
};

export default FCMNotificationTestPage;
