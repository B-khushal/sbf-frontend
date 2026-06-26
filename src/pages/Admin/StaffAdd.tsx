import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { ChevronLeft, UserPlus } from 'lucide-react';

interface Zone {
  _id: string;
  name: string;
}

interface Role {
  _id: string;
  name: string;
  code: string;
}

const StaffAdd: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'store_manager',
    assigned_store: '',
    assigned_zone: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const zonesResponse = await api.get('/delivery/admin/zones');
        const zonesData = zonesResponse.data?.zones || zonesResponse.data;
        setZones(Array.isArray(zonesData) ? zonesData : []);
      } catch (error) {
        console.error('Fetch zones error:', error);
      }

      try {
        const rolesResponse = await api.get('/staff/roles');
        setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      } catch (error) {
        console.error('Fetch roles error:', error);
      }

      try {
        const storesResponse = await api.get('/staff/stores');
        setStores(Array.isArray(storesResponse.data) ? storesResponse.data : []);
      } catch (error) {
        console.error('Fetch stores error:', error);
        setStores([]);
      }
    };

    fetchMetadata();
  }, []);

  const handleSelectChange = (field: string, value: string) => {
    setNewStaff(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...newStaff,
        assigned_store: newStaff.assigned_store === 'none' ? '' : newStaff.assigned_store,
        assigned_zone: newStaff.assigned_zone === 'none' ? '' : newStaff.assigned_zone,
      };
      
      await api.post('/staff', payload);
      toast({ title: 'Success', description: 'Staff member created successfully' });
      navigate('/admin/staff');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create employee profile'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/admin/staff')} 
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Staff Directory
      </Button>

      <Card className="subtle-shadow border-gray-100">
        <CardHeader className="border-b border-gray-50 pb-6 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-bloom-dark">Add New Employee</CardTitle>
              <CardDescription>Setup credentials and store assignment for a new staff member.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={newStaff.name} 
                onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                placeholder="John Doe"
                required 
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={newStaff.email} 
                onChange={e => setNewStaff({...newStaff, email: e.target.value})} 
                placeholder="johndoe@sbflorist.in"
                required 
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={newStaff.phone} 
                onChange={e => setNewStaff({...newStaff, phone: e.target.value})} 
                placeholder="+91 XXXXXXXXXX"
                required 
              />
            </div>
            <div>
              <Label htmlFor="password">Default Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={newStaff.password} 
                onChange={e => setNewStaff({...newStaff, password: e.target.value})} 
                placeholder="••••••••"
                required 
              />
            </div>
            <div>
              <Label htmlFor="role">Assigned Role</Label>
              <Select value={newStaff.role} onValueChange={v => handleSelectChange('role', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r._id} value={r.code}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="store">Store Hub</Label>
              <Select value={newStaff.assigned_store || 'none'} onValueChange={v => handleSelectChange('assigned_store', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Store Hub" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned / Global</SelectItem>
                  {stores.map(s => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zone">Delivery Zone Assignment</Label>
              <Select value={newStaff.assigned_zone || 'none'} onValueChange={v => handleSelectChange('assigned_zone', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Delivery Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Zone Assignment</SelectItem>
                  {zones.map(z => (
                    <SelectItem key={z._id} value={z._id}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-50">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/staff')}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={saving}>
                {saving ? 'Creating...' : 'Create Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAdd;
