import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { Badge } from '@/components/ui/badge';
import { Edit, User, Mail, ShieldCheck, Activity, Calendar, ArrowLeft } from 'lucide-react';

const UserViewPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

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
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Customer Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">The requested customer profile could not be located.</p>
        <SoftButton variant="primary" onClick={() => navigate('/admin/users')} className="mt-5">
          Back to Customers
        </SoftButton>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={user.name || 'Customer Profile'}
        subtitle="Detailed account identity, platform permissions, and authentication audit records."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Customers', href: '/admin/users' },
          { label: user.name || 'Profile' },
        ]}
        statusBadge={{
          label: user.status === 'active' ? 'Active Account' : 'Inactive',
          variant: user.status === 'active' ? 'success' : 'neutral',
        }}
        actions={
          <div className="flex items-center gap-3">
            <SoftButton
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/admin/users')}
            >
              Back
            </SoftButton>
            <SoftButton
              variant="primary"
              icon={Edit}
              onClick={() => navigate(`/admin/users/edit/${user._id || userId}`)}
            >
              Edit Profile
            </SoftButton>
          </div>
        }
      />

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)] p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md">
            {(user.name || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user.name || 'Valued Customer'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <Badge 
                className={
                  user.role === 'admin' ? 'bg-emerald-600 text-white' :
                  user.role === 'marketing_head' ? 'bg-purple-600 text-white' :
                  user.role === 'marketing_team' ? 'bg-indigo-600 text-white' :
                  user.role === 'marketing' ? 'bg-violet-600 text-white' :
                  user.role === 'vendor' ? 'bg-amber-600 text-white' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                }
              >
                {user.role === 'marketing_head' ? 'Marketing Head' :
                 user.role === 'marketing_team' ? 'Marketing Team' :
                 user.role === 'marketing' ? 'Marketing' :
                 user.role === 'admin' ? 'Admin' :
                 user.role === 'vendor' ? 'Vendor' :
                 user.role === 'user' ? 'Customer' : user.role}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {user.status || 'active'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Attribute Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#edf1f7] dark:bg-slate-800/50 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-slate-200/40 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <User className="h-4 w-4 text-rose-500" />
              Full Name
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">{user.name || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#edf1f7] dark:bg-slate-800/50 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-slate-200/40 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <Mail className="h-4 w-4 text-indigo-500" />
              Email Address
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">{user.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#edf1f7] dark:bg-slate-800/50 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-slate-200/40 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Platform Role
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">{user.role || 'user'}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#edf1f7] dark:bg-slate-800/50 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-slate-200/40 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <Activity className="h-4 w-4 text-amber-500" />
              Last Session Activity
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : 'No recorded login'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewPage;
