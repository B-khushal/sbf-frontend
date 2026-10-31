import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import {
  Sliders,
  Save,
  RefreshCw,
  Send,
  PlusCircle,
  Activity,
  Smartphone,
  CheckCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';

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
    { key: 'bottom_sheet_displayed', label: 'Bottom Sheet Displayed' },
  ];

  const handleCreateTestOrder = async () => {
    setLoadingTest(true);
    setStatusDetails(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/testing/create-test-order`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setTestOrderId(res.data.order._id);
        setTestPartnerId(res.data.environment.partnerId);

        const logsMap: any = {
          order_created: {
            timestamp: res.data.order.createdAt,
            remarks: `Order #${res.data.order.orderNumber} successfully generated.`,
          },
        };
        setTestLogs(logsMap);

        toast({
          title: 'Test Order Created',
          description: `Generated order #${res.data.order.orderNumber} for live telemetry.`,
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create test order',
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
      const res = await axios.post(
        `${API_BASE_URL}/api/testing/trigger-assignment/${testOrderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        toast({
          title: 'Assignment Engine Dispatched',
          description: 'Calculated route scores and matched candidate partner.',
        });
        mapHistoryToLogs(res.data.assignment?.orderId, res.data.assignment);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Assignment trigger failed',
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
      const res = await axios.post(
        `${API_BASE_URL}/api/testing/send-test-fcm/${testPartnerId}`,
        { orderId: testOrderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: 'Notification Dispatched',
        description: res.data.message || 'Push sent to mobile courier token.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to send notification',
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
      const res = await axios.get(
        `${API_BASE_URL}/api/testing/fcm-status/${testPartnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatusDetails(res.data);
      toast({
        title: 'FCM Status Verified',
        description: `Found ${res.data.activeTokens?.length || 0} active device tokens.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch FCM status',
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
      const res = await axios.get(
        `${API_BASE_URL}/api/testing/assignment-status/${testOrderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatusDetails(res.data);
      if (res.data.assignment) {
        mapHistoryToLogs(res.data.assignment.orderId, res.data.assignment);
      }
      toast({
        title: 'Assignment Details Fetched',
        description: `Current status is: ${res.data.assignmentStatus || 'No assignment'}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch assignment status',
      });
    } finally {
      setLoadingTest(false);
    }
  };

  const pollStatus = async () => {
    if (!testOrderId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE_URL}/api/testing/assignment-status/${testOrderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
        remarks: `Order #${orderData.orderNumber} successfully generated.`,
      };
    }
    if (assignmentData) {
      const started = assignmentData.history?.find(
        (h: any) => h.status === 'pending_assignment'
      );
      if (started) {
        logsMap['assignment_started'] = {
          timestamp: started.timestamp,
          remarks: started.remarks || 'Searching for nearest online courier...',
        };
      }

      const assigned = assignmentData.history?.find(
        (h: any) => h.status === 'assigned'
      );
      if (assigned) {
        logsMap['partner_selected'] = {
          timestamp: assigned.timestamp,
          remarks: `Partner "${assignmentData.partnerId?.name || 'Rahul Sharma'}" selected.`,
        };
        logsMap['assignment_saved'] = {
          timestamp: assigned.timestamp,
          remarks: `Assignment record successfully saved in database.`,
        };
      }

      const fcmSent = assignmentData.history?.find(
        (h: any) => h.status === 'fcm_sent'
      );
      if (fcmSent) {
        logsMap['fcm_sent'] = {
          timestamp: fcmSent.timestamp,
          remarks: fcmSent.remarks,
        };
      }

      const fcmDelivered = assignmentData.history?.find(
        (h: any) => h.status === 'notification_delivered'
      );
      if (fcmDelivered) {
        logsMap['notification_delivered'] = {
          timestamp: fcmDelivered.timestamp,
          remarks: fcmDelivered.remarks,
        };
      }

      const appOpened = assignmentData.history?.find(
        (h: any) => h.status === 'app_opened'
      );
      if (appOpened) {
        logsMap['app_opened'] = {
          timestamp: appOpened.timestamp,
          remarks: appOpened.remarks,
        };
      }

      const displayed = assignmentData.history?.find(
        (h: any) => h.status === 'bottom_sheet_displayed'
      );
      if (displayed) {
        logsMap['bottom_sheet_displayed'] = {
          timestamp: displayed.timestamp,
          remarks: displayed.remarks,
        };
      }
    }
    setTestLogs(logsMap);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        setAutoAssign(s.autoAssign ?? true);
        setRadius(s.assignmentRadius || 10);
        setMaxOrders(s.maxOrdersPerPartner || 3);
        setTimeoutVal(s.reassignmentTimeout || 60);
        setBaseEarning(s.baseDeliveryEarning || 80);
        setEarningPerKm(s.earningPerKm || 15);
        setPeakMultiplier(s.peakHourMultiplier || 1.0);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load delivery settings',
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
      await axios.put(
        `${API_BASE_URL}/api/delivery/admin/settings`,
        {
          autoAssign,
          assignmentRadius: radius,
          maxOrdersPerPartner: maxOrders,
          reassignmentTimeout: timeout,
          baseDeliveryEarning: baseEarning,
          earningPerKm,
          peakHourMultiplier: peakMultiplier,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: 'Settings Saved',
        description: 'System parameters updated successfully.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings',
      });
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Logistics', href: '/admin/delivery/analytics' },
          { label: 'Settings' },
        ]}
        title="Fleet Logistics & Dispatch Settings"
        description="Configure automated dispatch radius thresholds, courier timeouts, payout formulas, and live testing sandboxes."
        liveStatus={{ label: autoAssign ? 'Auto-Dispatch Enabled' : 'Manual Dispatch Only', ping: autoAssign }}
        actions={
          <SoftButton
            variant="default"
            size="sm"
            icon={RefreshCw}
            onClick={fetchSettings}
          >
            Refresh Settings
          </SoftButton>
        }
      />

      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground animate-pulse font-medium">
          Loading system parameters...
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-rose-600" /> Operational Rules & Tariffs
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Core parameters controlling dispatch automation and driver earnings.
              </p>
            </div>

            {/* Auto Assign Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#edf1f7] dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)]">
              <div>
                <Label
                  htmlFor="auto-assign"
                  className="text-xs font-bold text-slate-900 dark:text-slate-100 block"
                >
                  Automated Assignment Engine
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Allow algorithm to auto-match new orders to active fleet drivers.
                </span>
              </div>
              <input
                id="auto-assign"
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Max Search Radius (km)
                </label>
                <input
                  id="radius"
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Max Orders Per Partner
                </label>
                <input
                  id="max-orders"
                  type="number"
                  value={maxOrders}
                  onChange={(e) => setMaxOrders(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Acceptance Timeout (seconds)
                </label>
                <input
                  id="timeout"
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeoutVal(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Base Delivery Payout (₹)
                </label>
                <input
                  id="base-earning"
                  type="number"
                  value={baseEarning}
                  onChange={(e) => setBaseEarning(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Payout Per Km (₹)
                </label>
                <input
                  id="earning-km"
                  type="number"
                  value={earningPerKm}
                  onChange={(e) => setEarningPerKm(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Peak Pricing Multiplier
                </label>
                <input
                  id="peak"
                  type="number"
                  step="0.1"
                  value={peakMultiplier}
                  onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>
            </div>

            <SoftButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center mt-3"
              icon={Save}
            >
              Save Delivery Parameters
            </SoftButton>
          </div>
        </form>
      )}

      {/* Delivery & FCM Testing Console */}
      <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600 animate-pulse" /> Delivery & FCM Testing Console
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulate dispatch assignment triggers and audit end-to-end telemetry.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            DEV MODE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions Panel */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              E2E Flow Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SoftButton
                type="button"
                variant="default"
                size="sm"
                onClick={handleCreateTestOrder}
                disabled={loadingTest}
                className="justify-center"
                icon={PlusCircle}
              >
                Create Test Order
              </SoftButton>

              <SoftButton
                type="button"
                variant="default"
                size="sm"
                onClick={handleTriggerAssignment}
                disabled={loadingTest || !testOrderId}
                className="justify-center"
                icon={Activity}
              >
                Trigger Assignment
              </SoftButton>

              <SoftButton
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSendTestNotification}
                disabled={loadingTest || !testPartnerId}
                className="col-span-1 sm:col-span-2 justify-center"
                icon={Send}
              >
                Send Test Push (FCM)
              </SoftButton>
            </div>

            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Diagnostic Auditing
              </h4>
              <div className="flex gap-2">
                <SoftButton
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleVerifyPartnerStatus}
                  disabled={loadingTest || !testPartnerId}
                  className="flex-1 justify-center"
                  icon={Smartphone}
                >
                  Verify FCM Token
                </SoftButton>
                <SoftButton
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleVerifyAssignmentStatus}
                  disabled={loadingTest || !testOrderId}
                  className="flex-1 justify-center"
                  icon={RefreshCw}
                >
                  Verify Assignment
                </SoftButton>
              </div>
            </div>

            {/* Status Details Box */}
            {statusDetails && (
              <div className="bg-[#edf1f7] dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-3 rounded-xl text-xs space-y-1 font-mono text-slate-800 dark:text-slate-200 overflow-auto max-h-[160px] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06)]">
                <div className="font-bold text-[11px] text-rose-600 border-b border-slate-200/80 pb-1 mb-1">
                  Audit Telemetry:
                </div>
                <pre className="whitespace-pre-wrap text-[11px]">
                  {JSON.stringify(statusDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Live Log Console */}
          <div className="border-t md:border-t-0 md:border-l border-slate-200/60 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Pipeline Logs
              </h3>
              {testOrderId && (
                <SoftButton
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={pollStatus}
                  icon={RefreshCw}
                >
                  Poll Status
                </SoftButton>
              )}
            </div>

            <div className="space-y-2.5">
              {pipelineMilestones.map((milestone) => {
                const isLogged = testLogs[milestone.key];
                return (
                  <div
                    key={milestone.key}
                    className="flex items-start gap-2.5 text-xs"
                  >
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isLogged
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-semibold ${
                            isLogged
                              ? 'text-slate-900 dark:text-slate-100'
                              : 'text-slate-400'
                          }`}
                        >
                          {milestone.label}
                        </span>
                        {isLogged && (
                          <span className="text-[10px] text-emerald-600 font-mono">
                            {new Date(isLogged.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {isLogged && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {isLogged.remarks || 'Success'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySettingsPage;
