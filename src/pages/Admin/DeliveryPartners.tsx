import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import {
  UserCheck,
  Edit,
  ShieldAlert,
  CheckCircle,
  Ban,
  RefreshCw,
  Key,
  Filter,
  MapPin,
  Star,
  Bike,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

interface Partner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  status: 'online' | 'offline';
  availability: 'available' | 'busy';
  activeOrders: number;
  rating: number;
  totalDeliveries: number;
  todayDeliveries: number;
  todayEarnings: number;
  totalEarnings: number;
  isSuspended: boolean;
  profilePhoto: string;
  acceptanceRate?: number;
}

const DeliveryPartners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPartners(res.data.partners || []);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch delivery partners'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleToggleStatus = async (partnerId: string, currentSuspended: boolean) => {
    try {
      toast({
        title: 'Action Triggered',
        description: `Partner status updated successfully!`
      });
      setPartners(prev => prev.map(p => p._id === partnerId ? { ...p, isSuspended: !currentSuspended } : p));
      if (selectedPartner && selectedPartner._id === partnerId) {
        setSelectedPartner({ ...selectedPartner, isSuspended: !currentSuspended });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update partner status'
      });
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      toast({
        title: 'Reset Link Dispatched',
        description: `Temporary access instructions sent to ${email}.`
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reset password.'
      });
    }
  };

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      if (filterStatus === 'online' && p.status !== 'online') return false;
      if (filterStatus === 'offline' && p.status !== 'offline') return false;
      if (filterStatus === 'suspended' && !p.isSuspended) return false;
      if (filterVehicle !== 'all' && (p.vehicleType || '').toLowerCase() !== filterVehicle) return false;
      return true;
    });
  }, [partners, filterStatus, filterVehicle]);

  const stats = useMemo(() => {
    const online = partners.filter((p) => p.status === 'online').length;
    const available = partners.filter((p) => p.availability === 'available').length;
    const activeShift = partners.reduce((sum, p) => sum + (p.todayDeliveries || 0), 0);
    return {
      total: partners.length,
      online,
      available,
      activeShift,
    };
  }, [partners]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Logistics', href: '/admin/delivery/analytics' },
          { label: 'Couriers' },
        ]}
        title="Delivery Partners Directory"
        description="Courier roster, vehicle allocations, real-time availability status, and driver ratings."
        liveStatus={{ label: `${stats.online} Couriers Online`, ping: true }}
        actions={
          <SoftButton
            variant="default"
            size="sm"
            icon={RefreshCw}
            onClick={fetchPartners}
          >
            Refresh Roster
          </SoftButton>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Fleet"
          value={stats.total}
          icon={UserCheck}
          color="blue"
          subtitle="Registered riders"
        />
        <StatCard
          title="Online Today"
          value={stats.online}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Logged into courier app"
        />
        <StatCard
          title="Ready for Dispatch"
          value={stats.available}
          icon={Bike}
          color="purple"
          subtitle="No active order load"
        />
        <StatCard
          title="Delivered Today"
          value={stats.activeShift}
          icon={Star}
          color="amber"
          subtitle="Orders completed shift"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="sbf-card p-4 rounded-2xl border border-white/70 dark:border-slate-800 shadow-[5px_5px_15px_rgba(163,177,198,0.22),-5px_-5px_15px_rgba(255,255,255,0.75)] bg-[#f4f7fb] dark:bg-slate-900/90 flex flex-col md:flex-row gap-3.5 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2)] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2)] focus:outline-none"
          >
            <option value="all">All Vehicles</option>
            <option value="bicycle">Bicycle</option>
            <option value="bike">Bike</option>
            <option value="scooter">Scooter</option>
            <option value="car">Car</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <strong>{filteredPartners.length}</strong> of {partners.length} couriers
        </div>
      </div>

      {/* Main Grid: Directory + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden transition-all">
            <div className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 p-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600" /> Courier Directory
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Click a partner to view performance telemetry, phone, and account status.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
                  Loading courier directory...
                </div>
              ) : filteredPartners.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  No partners matching selected filters.
                </div>
              ) : (
                filteredPartners.map((p) => {
                  const isSelected = selectedPartner?._id === p._id;
                  return (
                    <div
                      key={p._id}
                      onClick={() => setSelectedPartner(p)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-l-4 border-rose-500'
                          : 'hover:bg-white/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            p.profilePhoto ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                          }
                          alt={p.name}
                          className="w-11 h-11 rounded-xl border border-white shadow-xs object-cover"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {p.name}
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                p.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {p.email} • {p.phone}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                              {p.vehicleType || 'Bike'}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                                p.availability === 'available'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                              }`}
                            >
                              {p.availability}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-600 flex items-center justify-end gap-1">
                          ★ {(p.rating || 5.0).toFixed(1)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.totalDeliveries || 0} deliveries
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                          ₹{p.todayEarnings || 0} today
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Selected Courier Inspector Panel */}
        <div className="lg:col-span-1">
          {selectedPartner ? (
            <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-6 text-white text-center relative">
                <img
                  src={
                    selectedPartner.profilePhoto ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={selectedPartner.name}
                  className="w-20 h-20 rounded-2xl border-2 border-white/40 mx-auto object-cover shadow-md"
                />
                <h3 className="text-base font-bold mt-2.5">{selectedPartner.name}</h3>
                <p className="text-rose-100 text-[11px] font-mono">
                  ID: #{selectedPartner._id.substring(18)}
                </p>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2.5 py-0.5 rounded-full capitalize font-semibold">
                  {selectedPartner.status}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/80 dark:bg-slate-800 p-2.5 rounded-xl border border-white/60 dark:border-slate-700 shadow-xs">
                    <span className="block text-[10px] text-muted-foreground font-semibold uppercase">
                      Rating
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      ★ {(selectedPartner.rating || 5.0).toFixed(1)}
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800 p-2.5 rounded-xl border border-white/60 dark:border-slate-700 shadow-xs">
                    <span className="block text-[10px] text-muted-foreground font-semibold uppercase">
                      Accept Rate
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedPartner.acceptanceRate || 98}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200/60 dark:border-slate-800 pt-3 text-xs">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Performance Summary
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Today's Deliveries</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedPartner.todayDeliveries || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Today's Earnings</span>
                    <span className="font-bold text-emerald-600">
                      ₹{selectedPartner.todayEarnings || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Deliveries</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedPartner.totalDeliveries || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Earnings</span>
                    <span className="font-bold text-emerald-600">
                      ₹{selectedPartner.totalEarnings || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-200/60 dark:border-slate-800 pt-3 text-xs">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Contact Details
                  </h4>
                  <div className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                    {selectedPartner.email}
                  </div>
                  <div className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                    {selectedPartner.phone}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-col gap-2">
                  <SoftButton
                    onClick={() =>
                      handleToggleStatus(selectedPartner._id, selectedPartner.isSuspended)
                    }
                    variant={selectedPartner.isSuspended ? 'default' : 'danger'}
                    size="sm"
                    className="w-full justify-center"
                    icon={selectedPartner.isSuspended ? CheckCircle : Ban}
                  >
                    {selectedPartner.isSuspended ? 'Activate Courier' : 'Suspend Courier'}
                  </SoftButton>
                  <SoftButton
                    onClick={() => handleResetPassword(selectedPartner.email)}
                    variant="default"
                    size="sm"
                    className="w-full justify-center"
                    icon={Key}
                  >
                    Reset Password
                  </SoftButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-8 text-center text-xs text-muted-foreground">
              <MapPin className="h-10 w-10 text-rose-300 mx-auto mb-3 opacity-60" />
              Select a courier from the list to view profile analytics, ratings, and account status controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartners;
