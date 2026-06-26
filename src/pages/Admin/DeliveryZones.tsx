import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { Map, Plus, Trash2, Edit2 } from 'lucide-react';

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
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/zones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setZones(res.data.zones);
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
        name,
        city,
        baseDeliveryCharge: baseCharge,
        coordinates: [
          [78.4200, 17.3850],
          [78.4500, 17.3850],
          [78.4500, 17.4050],
          [78.4200, 17.4050],
          [78.4200, 17.3850] // Default polygon shape
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Delivery Zones</h1>
        <p className="text-muted-foreground">Define regional boundaries, shipping fees, and base partner payouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <Card className="border-emerald-100 shadow-sm bg-white">
            <CardHeader className="bg-emerald-50/55 border-b border-emerald-100">
              <CardTitle className="text-emerald-900 text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-700" /> Create New Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateZone} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="zone-name" className="text-emerald-950 font-medium">Zone Name</Label>
                  <Input
                    id="zone-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jubilee Hills Core"
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="zone-city" className="text-emerald-950 font-medium">City</Label>
                  <Input
                    id="zone-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Hyderabad"
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="zone-charge" className="text-emerald-950 font-medium">Base Delivery Fee (₹)</Label>
                  <Input
                    id="zone-charge"
                    type="number"
                    value={baseCharge}
                    onChange={(e) => setBaseCharge(Number(e.target.value))}
                    className="border-emerald-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                  Add Delivery Zone
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Zones List */}
        <div className="lg:col-span-2">
          <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-emerald-50/55 border-b border-emerald-100">
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Map className="h-5 w-5 text-emerald-700" /> Active Zones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">Loading zones...</div>
              ) : zones.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">No active operational zones created.</div>
              ) : (
                <div className="divide-y divide-emerald-50">
                  {zones.map(z => (
                    <div key={z._id} className="p-4 flex items-center justify-between hover:bg-emerald-50/10 transition-colors">
                      <div>
                        <div className="font-semibold text-emerald-950">{z.name}</div>
                        <div className="text-xs text-muted-foreground">{z.city} • Base Fee: ₹{z.baseDeliveryCharge}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeleteZone(z._id)}
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryZones;
