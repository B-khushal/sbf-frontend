import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { Sliders, Save, RefreshCw, Send, PlusCircle, Activity, Smartphone, CheckCircle } from 'lucide-react';

const DeliverySettingsPage: React.FC = () => {
  const [autoAssign, setAutoAssign] = useState(true);
  const [radius, setRadius] = useState(10);
  const [maxOrders, setMaxOrders] = useState(3);
  const [timeout, setTimeoutVal] = useState(60);
  const [baseEarning, setBaseEarning] = useState(80);
  const [earningPerKm, setEarningPerKm] = useState(15);
  const [peakMultiplier, setPeakMultiplier] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Developer Testing States
  const [testOrderId, setTestOrderId] = useState<string>('');
  const [testPartnerId, setTestPartnerId] = useState<string>('');
  const [testLogs, setTestLogs] = useState<any>({});
  const [statusDetails, setStatusDetails] = useState<any>(null);
  const [loadingTest, setLoadingTest] = useState<boolean>(false);

  const pipelineMilestones = [
    { key: 'order_created', label: 'Order Created' },
    { key: 'assignment_started', label: 'Assignment Started' },
    { key: 'partner_selected', label: 'Partner Selected' },
    { key: 'assignment_saved', label: 'Assignment Saved' },
    { key: 'fcm_sent', label: 'FCM Sent' },
    { key: 'notification_delivered', label: 'Notification Delivered' },
    { key: 'app_opened', label: 'App Opened' },
    { key: 'bottom_sheet_displayed', label: 'Bottom Sheet Displayed' }
  ];

  const handleCreateTestOrder = async () => {
    setLoadingTest(true);
    setStatusDetails(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/testing/create-test-order`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTestOrderId(res.data.order._id);
        setTestPartnerId(res.data.environment.partnerId);
        
        const logsMap: any = {
          'order_created': {
            timestamp: res.data.order.createdAt,
            remarks: `Order #${res.data.order.orderNumber} successfully generated.`
          }
        };
        setTestLogs(logsMap);
        
        toast({
          title: 'Test Order Created',
          description: `Order #${res.data.order.orderNumber} placed for Rahul Sharma.`
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create test order'
      });
    } finally {
      setLoadingTest(false);
    }
  };

  const handleTriggerAssignment = async () => {
    if (!testOrderId) return;
    setLoadingTest(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/testing/send-test-assignment`, {
        orderId: testOrderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast({
          title: 'Assignment Triggered',
          description: res.data.message
        });
        pollStatus();
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to trigger assignment'
      });
    } finally {
      setLoadingTest(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!testPartnerId) return;
    setLoadingTest(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/testing/send-test-fcm`, {
        partnerId: testPartnerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast({
          title: 'FCM Notification Dispatched',
          description: 'Test payload successfully pushed to driver token.'
        });
        pollStatus();
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to dispatch notification'
      });
    } finally {
      setLoadingTest(false);
    }
  };

  const handleVerifyPartnerStatus = async () => {
    if (!testPartnerId) return;
    setLoadingTest(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/testing/fcm-status/${testPartnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatusDetails(res.data);
      toast({
        title: 'FCM Status Verified',
        description: `Found ${res.data.activeTokens?.length || 0} active device tokens.`
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch FCM status'
      });
    } finally {
      setLoadingTest(false);
    }
  };

  const handleVerifyAssignmentStatus = async () => {
    if (!testOrderId) return;
    setLoadingTest(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/testing/assignment-status/${testOrderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatusDetails(res.data);
      if (res.data.assignment) {
        mapHistoryToLogs(res.data.assignment.orderId, res.data.assignment);
      }
      toast({
        title: 'Assignment Details Fetched',
        description: `Current status is: ${res.data.assignmentStatus || 'No assignment'}`
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch assignment status'
      });
    } finally {
      setLoadingTest(false);
    }
  };

  const pollStatus = async () => {
    if (!testOrderId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/testing/assignment-status/${testOrderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.assignment) {
        mapHistoryToLogs(res.data.assignment.orderId, res.data.assignment);
      }
    } catch (err) {
      console.error('Failed to poll assignment status:', err);
    }
  };

  const mapHistoryToLogs = (orderData: any, assignmentData: any) => {
    const logsMap: any = {};
    if (orderData) {
      logsMap['order_created'] = {
        timestamp: orderData.createdAt,
        remarks: `Order #${orderData.orderNumber} successfully generated.`
      };
    }
    if (assignmentData) {
      const started = assignmentData.history.find((h: any) => h.status === 'pending_assignment');
      if (started) {
        logsMap['assignment_started'] = {
          timestamp: started.timestamp,
          remarks: started.remarks || 'Searching for nearest online driver...'
        };
      }
      
      const assigned = assignmentData.history.find((h: any) => h.status === 'assigned');
      if (assigned) {
        logsMap['partner_selected'] = {
          timestamp: assigned.timestamp,
          remarks: `Partner "${assignmentData.partnerId?.name || 'Rahul Sharma'}" selected.`
        };
        logsMap['assignment_saved'] = {
          timestamp: assigned.timestamp,
          remarks: `Assignment record successfully saved in database.`
        };
      }

      const fcmSent = assignmentData.history.find((h: any) => h.status === 'fcm_sent');
      if (fcmSent) {
        logsMap['fcm_sent'] = {
          timestamp: fcmSent.timestamp,
          remarks: fcmSent.remarks
        };
      }

      const fcmDelivered = assignmentData.history.find((h: any) => h.status === 'notification_delivered');
      if (fcmDelivered) {
        logsMap['notification_delivered'] = {
          timestamp: fcmDelivered.timestamp,
          remarks: fcmDelivered.remarks
        };
      }

      const appOpened = assignmentData.history.find((h: any) => h.status === 'app_opened');
      if (appOpened) {
        logsMap['app_opened'] = {
          timestamp: appOpened.timestamp,
          remarks: appOpened.remarks
        };
      }

      const sheetDisp = assignmentData.history.find((h: any) => h.status === 'bottom_sheet_displayed');
      if (sheetDisp) {
        logsMap['bottom_sheet_displayed'] = {
          timestamp: sheetDisp.timestamp,
          remarks: sheetDisp.remarks
        };
      }
    }
    setTestLogs(logsMap);
  };

  useEffect(() => {
    let interval: any;
    if (testOrderId && !testLogs['bottom_sheet_displayed']) {
      interval = setInterval(() => {
        pollStatus();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [testOrderId, testLogs]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        setAutoAssign(s.autoAssign);
        setRadius(s.assignmentRadius);
        setMaxOrders(s.maxOrdersPerPartner);
        setTimeoutVal(s.reassignmentTimeout);
        setBaseEarning(s.baseDeliveryEarning);
        setEarningPerKm(s.earningPerKm);
        setPeakMultiplier(s.peakHourMultiplier);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch settings'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/delivery/admin/settings`, {
        autoAssign,
        assignmentRadius: radius,
        maxOrdersPerPartner: maxOrders,
        reassignmentTimeout: timeout,
        baseDeliveryEarning: baseEarning,
        earningPerKm,
        peakHourMultiplier: peakMultiplier
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Settings Saved', description: 'System parameters updated successfully.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings' });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Delivery Settings</h1>
          <p className="text-muted-foreground">Adjust automated routing thresholds, dispatch timeouts, and driver base earnings.</p>
        </div>
        <Button onClick={fetchSettings} variant="outline" className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave}>
          <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-emerald-50/55 border-b border-emerald-100">
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-emerald-700" /> Operational Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Auto Assign Toggle */}
              <div className="flex items-center justify-between p-4 bg-emerald-50/20 border border-emerald-100 rounded-lg">
                <div>
                  <Label htmlFor="auto-assign" className="text-emerald-950 font-bold block">Auto Assignment Engine</Label>
                  <span className="text-xs text-muted-foreground">Toggle automated dispatch calculations for placing orders.</span>
                </div>
                <input
                  id="auto-assign"
                  type="checkbox"
                  checked={autoAssign}
                  onChange={(e) => setAutoAssign(e.target.checked)}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="radius" className="text-emerald-950 font-semibold">Max Search Radius (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="max-orders" className="text-emerald-950 font-semibold">Max Orders Per Partner</Label>
                  <Input
                    id="max-orders"
                    type="number"
                    value={maxOrders}
                    onChange={(e) => setMaxOrders(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="timeout" className="text-emerald-950 font-semibold">Acceptance Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={timeout}
                    onChange={(e) => setTimeoutVal(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="base-earning" className="text-emerald-950 font-semibold">Base Delivery Payout (₹)</Label>
                  <Input
                    id="base-earning"
                    type="number"
                    value={baseEarning}
                    onChange={(e) => setBaseEarning(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="earning-km" className="text-emerald-950 font-semibold">Payout Per Km (₹)</Label>
                  <Input
                    id="earning-km"
                    type="number"
                    value={earningPerKm}
                    onChange={(e) => setEarningPerKm(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="peak" className="text-emerald-950 font-semibold">Peak Pricing Multiplier</Label>
                  <Input
                    id="peak"
                    type="number"
                    step="0.1"
                    value={peakMultiplier}
                    onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-2 mt-4">
                <Save className="h-4 w-4" /> Save Configurations
              </Button>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Delivery & FCM Testing Console */}
      <Card className="border-emerald-100 shadow-md bg-white overflow-hidden mt-8">
        <CardHeader className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white border-b border-emerald-900">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                <Activity className="h-5 w-5 text-emerald-300 animate-pulse" /> 🌸 Delivery & FCM Testing Console
              </CardTitle>
              <CardDescription className="text-emerald-105/90 text-xs mt-1">
                Trigger end-to-end routing calculations, dispatch testing FCM notifications, and audit real-time tracking logs.
              </CardDescription>
            </div>
            <span className="text-xs bg-emerald-700/80 border border-emerald-600 px-2.5 py-1 rounded-full font-medium tracking-wide">
              DEV MODE
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions Panel */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">E2E Flow Actions</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  type="button"
                  onClick={handleCreateTestOrder} 
                  disabled={loadingTest}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center justify-center gap-2 py-5 font-semibold text-xs transition-all duration-200"
                >
                  <PlusCircle className="h-4 w-4 text-emerald-700" /> Create Test Order
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleTriggerAssignment} 
                  disabled={loadingTest || !testOrderId}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center justify-center gap-2 py-5 font-semibold text-xs transition-all duration-200"
                >
                  <Activity className="h-4 w-4 text-emerald-700" /> Trigger Assignment
                </Button>

                <Button 
                  type="button"
                  onClick={handleSendTestNotification} 
                  disabled={loadingTest || !testPartnerId}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center justify-center gap-2 py-5 font-semibold text-xs transition-all duration-200 col-span-1 sm:col-span-2"
                >
                  <Send className="h-4 w-4 text-emerald-700" /> Send Test Notification (FCM)
                </Button>
              </div>

              <div className="border-t border-emerald-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-emerald-800">Diagnostic Auditing</h4>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleVerifyPartnerStatus} 
                    disabled={loadingTest || !testPartnerId}
                    className="flex-1 border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold py-2"
                  >
                    <Smartphone className="h-3.5 w-3.5 mr-1.5" /> Verify FCM Status
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleVerifyAssignmentStatus} 
                    disabled={loadingTest || !testOrderId}
                    className="flex-1 border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold py-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Verify Assignment
                  </Button>
                </div>
              </div>

              {/* Status Details Box */}
              {statusDetails && (
                <div className="bg-emerald-50/30 border border-emerald-100/70 p-4 rounded-lg text-xs space-y-2 font-mono text-emerald-950 overflow-auto max-h-[160px]">
                  <div className="font-bold text-emerald-900 border-b border-emerald-100 pb-1 mb-1">Audit Output:</div>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(statusDetails, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Live Log Console */}
            <div className="border-l border-emerald-150 pl-0 md:pl-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Live Pipeline Logs</h3>
                {testOrderId && (
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={pollStatus} 
                    className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Poll Status
                  </Button>
                )}
              </div>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-100">
                {pipelineMilestones.map((milestone, idx) => {
                  const isLogged = testLogs[milestone.key];
                  return (
                    <div key={milestone.key} className="flex items-start gap-3 relative pl-1">
                      <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm ${
                        isLogged 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'bg-white border-emerald-200 text-emerald-350'
                      }`}>
                        <CheckCircle className={`h-3.5 w-3.5 ${isLogged ? 'text-white' : 'text-emerald-250'}`} />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex justify-between items-center">
                          <p className={`text-xs font-semibold ${isLogged ? 'text-emerald-950' : 'text-emerald-450'}`}>
                            {milestone.label}
                          </p>
                          {isLogged && (
                            <span className="text-[10px] text-emerald-750 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                              {new Date(isLogged.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        {isLogged && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed font-normal">
                            {isLogged.remarks || 'Completed successfully.'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverySettingsPage;
