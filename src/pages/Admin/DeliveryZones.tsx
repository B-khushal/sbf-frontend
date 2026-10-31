import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { Map, Plus, Trash2, MapPin, IndianRupee, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';

interface Zone {
  _id: string;
  name: string;
  city: string;
  baseDeliveryCharge: number;
  isActive: boolean;
}

const DeliveryZones: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState('');
  const [baseCharge, setBaseCharge] = useState(150);
  const [city, setCity] = useState('Hyderabad');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchZones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/zones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setZones(res.data.zones || []);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch zones'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/delivery/admin/zones`, {
        name: name.trim(),
        city: city.trim(),
        baseDeliveryCharge: baseCharge,
        coordinates: [
          [78.4200, 17.3850],
          [78.4500, 17.3850],
          [78.4500, 17.4050],
          [78.4200, 17.4050],
          [78.4200, 17.3850]
        ]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast({ title: 'Success', description: 'Delivery zone created successfully!' });
        setName('');
        setBaseCharge(150);
        fetchZones();
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create delivery zone'
      });
    }
  };

  const handleDeleteZone = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/delivery/admin/zones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Zone Deleted', description: 'Successfully removed operational delivery zone.' });
      fetchZones();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete zone'
      });
    }
  };

  const stats = useMemo(() => {
    const avgFee = zones.length
      ? Math.round(zones.reduce((sum, z) => sum + (z.baseDeliveryCharge || 0), 0) / zones.length)
      : 150;
    return {
      total: zones.length,
      avgFee,
    };
  }, [zones]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Logistics', href: '/admin/delivery/analytics' },
          { label: 'Delivery Zones' },
        ]}
        title="City Delivery Zones & Shipping Tiers"
        description="Define regional pin-code boundaries across Hyderabad / Secunderabad, shipping tariffs, and partner payout splits."
        liveStatus={{ label: `${zones.length} Zones Defined`, ping: true }}
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Operational Zones"
          value={stats.total}
          icon={Map}
          color="blue"
          subtitle="Regional service bounds"
        />
        <StatCard
          title="Base Delivery Fee"
          value={`₹${stats.avgFee}`}
          icon={IndianRupee}
          color="emerald"
          subtitle="Citywide median shipping"
        />
        <StatCard
          title="Primary Coverage"
          value="Hyderabad / Secunderabad"
          icon={MapPin}
          color="rose"
          subtitle="Twin cities service radius"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="sbf-card rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="h-4 w-4 text-rose-600" /> Create Delivery Zone
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add an operational polygon or radius tier.
              </p>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Zone Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jubilee Hills & Madhapur Core"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  City
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Hyderabad"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Base Delivery Charge (₹)
                </label>
                <input
                  type="number"
                  value={baseCharge}
                  onChange={(e) => setBaseCharge(Number(e.target.value))}
                  min="0"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <SoftButton
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center mt-2"
                icon={Plus}
              >
                Add Delivery Zone
              </SoftButton>
            </form>
          </div>
        </div>

        {/* Zones List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden transition-all">
            <div className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 p-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Map className="h-4 w-4 text-rose-600" /> Active Operational Zones
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Configured delivery corridors and flat dispatch rates.
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
                Loading delivery zones...
              </div>
            ) : zones.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                No active operational zones created yet. Use the form to add one.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {zones.map((z) => (
                  <div
                    key={z._id}
                    className="p-4 flex items-center justify-between hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {z.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {z.city} • Base Fee: <strong className="text-emerald-600 font-semibold">₹{z.baseDeliveryCharge}</strong>
                      </div>
                    </div>
                    <SoftButton
                      onClick={() => handleDeleteZone(z._id)}
                      variant="danger"
                      size="icon"
                      className="h-8 w-8 text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </SoftButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryZones;
