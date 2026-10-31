import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fixEmailTypo } from '@/utils/emailUtils';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserAddPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', status: 'active' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanForm = { ...form, email: fixEmailTypo(form.email) };
      setForm(cleanForm);
      await api.post('/users', cleanForm);
      toast({
        title: 'Customer Added',
        description: 'New account registered successfully.',
      });
      navigate('/admin/users');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to add customer account.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Register New Customer"
        subtitle="Create a new verified customer profile or staff account with dedicated credentials."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Customers', href: '/admin/users' },
          { label: 'Add New' },
        ]}
        actions={
          <SoftButton
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/users')}
          >
            Back
          </SoftButton>
        }
      />

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)] p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Customer Full Name
            </Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Ananya Sharma"
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
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              onBlur={(e) => setForm(prev => ({ ...prev, email: fixEmailTypo(e.target.value) }))}
              placeholder="e.g. ananya@example.com"
              className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Temporary Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Role Assignment
              </Label>
              <Select value={form.role} onValueChange={v => handleSelectChange('role', v)}>
                <SelectTrigger className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Customer / User</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="marketing_head">Marketing Head</SelectItem>
                  <SelectItem value="marketing_team">Marketing Team</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Account Status
              </Label>
              <Select value={form.status} onValueChange={v => handleSelectChange('status', v)}>
                <SelectTrigger className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <SoftButton variant="secondary" type="button" onClick={() => navigate('/admin/users')}>
              Cancel
            </SoftButton>
            <SoftButton variant="primary" icon={UserPlus} type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Register Customer'}
            </SoftButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddPage;
