import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Save, ArrowLeft } from 'lucide-react';
import { fixEmailTypo } from '@/utils/emailUtils';

const UserEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', role: '', status: '' });
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
        setForm({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          status: response.data.status,
        });
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

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
      await api.put(`/users/${userId}`, cleanForm);
      toast({
        title: "Success",
        description: "Customer account updated successfully.",
      });
      navigate('/admin/users');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer account.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${userId}`);
      toast({
        title: "Success",
        description: "Customer deleted successfully.",
      });
      navigate('/admin/users');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center rounded-2xl bg-[#edf1f7] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] mt-12">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">User Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">The requested customer could not be found.</p>
        <SoftButton variant="primary" onClick={() => navigate('/admin/users')} className="mt-5">
          Back to Customers
        </SoftButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Edit: ${user.name || 'Customer'}`}
        subtitle="Modify profile identity, update role authorizations, or update account active status."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Customers', href: '/admin/users' },
          { label: 'Edit' },
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-200/50 dark:border-slate-800/50">
            <SoftButton 
              variant="danger" 
              type="button" 
              icon={Trash2}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Customer
            </SoftButton>
            
            <div className="flex items-center gap-3">
              <SoftButton variant="secondary" type="button" onClick={() => navigate('/admin/users')}>
                Cancel
              </SoftButton>
              <SoftButton variant="primary" icon={Save} type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </SoftButton>
            </div>
          </div>
        </form>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[10px_10px_30px_rgba(0,0,0,0.25)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer account and revoke access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserEditPage;
