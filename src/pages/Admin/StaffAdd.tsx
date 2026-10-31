import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { fixEmailTypo } from '@/utils/emailUtils';

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
    const cleanEmail = fixEmailTypo(newStaff.email);
    setNewStaff(prev => ({ ...prev, email: cleanEmail }));

    try {
      const payload = {
        ...newStaff,
        email: cleanEmail,
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
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Add New Employee"
        subtitle="Setup operational credentials, branch store assignment, and delivery zones for a staff member."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Staff Management', href: '/admin/staff' },
          { label: 'Add Employee' },
        ]}
        actions={
          <SoftButton
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/staff')}
          >
            Back
          </SoftButton>
        }
      />

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)] p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Full Name
            </Label>
            <Input 
              id="name" 
              value={newStaff.name} 
              onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
              placeholder="e.g. Ramesh Kumar"
              className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Email Address
            </Label>
            <Input 
              id="email" 
              type="email" 
              value={newStaff.email} 
              onChange={e => setNewStaff({...newStaff, email: e.target.value})} 
              onBlur={e => setNewStaff(prev => ({ ...prev, email: fixEmailTypo(e.target.value) }))}
              placeholder="ramesh@sbflorist.in"
              className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Phone Number
            </Label>
            <Input 
              id="phone" 
              value={newStaff.phone} 
              onChange={e => setNewStaff({...newStaff, phone: e.target.value})} 
              placeholder="+91 9876543210"
              className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Temporary Login Password
            </Label>
            <Input 
              id="password" 
              type="password" 
              value={newStaff.password} 
              onChange={e => setNewStaff({...newStaff, password: e.target.value})} 
              placeholder="••••••••"
              className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Assigned Organization Role
            </Label>
            <Select value={newStaff.role} onValueChange={v => handleSelectChange('role', v)}>
              <SelectTrigger className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r._id} value={r.code}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Store Hub
              </Label>
              <Select value={newStaff.assigned_store || 'none'} onValueChange={v => handleSelectChange('assigned_store', v)}>
                <SelectTrigger className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none">
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

            <div className="space-y-2">
              <Label htmlFor="zone" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Delivery Zone Assignment
              </Label>
              <Select value={newStaff.assigned_zone || 'none'} onValueChange={v => handleSelectChange('assigned_zone', v)}>
                <SelectTrigger className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none">
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
          </div>

          <div className="flex gap-3 justify-end pt-5 border-t border-slate-200/50 dark:border-slate-800/50">
            <SoftButton type="button" variant="secondary" onClick={() => navigate('/admin/staff')}>
              Cancel
            </SoftButton>
            <SoftButton type="submit" variant="primary" icon={UserPlus} disabled={saving}>
              {saving ? 'Creating...' : 'Create Employee'}
            </SoftButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffAdd;
