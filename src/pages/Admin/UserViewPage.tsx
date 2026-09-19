import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  if (loading) return <div className="p-8 text-center">Loading user...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">User not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <Button variant="outline" onClick={() => navigate('/admin/users')} className="mb-4">&larr; Back to Customers</Button>
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div className="flex items-center gap-2">
            <strong>Role:</strong>{' '}
            <Badge 
              className={
                user.role === 'admin' ? 'bg-emerald-600 text-white' :
                user.role === 'marketing_head' ? 'bg-purple-600 text-white' :
                user.role === 'marketing_team' ? 'bg-indigo-600 text-white' :
                user.role === 'marketing' ? 'bg-violet-600 text-white' :
                user.role === 'vendor' ? 'bg-secondary text-secondary-foreground' :
                'border-slate-300'
              }
              variant={user.role === 'vendor' ? 'secondary' : user.role === 'user' ? 'outline' : 'default'}
            >
              {user.role === 'marketing_head' ? 'Marketing Head' :
               user.role === 'marketing_team' ? 'Marketing Team' :
               user.role === 'marketing' ? 'Marketing' :
               user.role === 'admin' ? 'Admin' :
               user.role === 'vendor' ? 'Vendor' :
               user.role === 'user' ? 'Customer' : user.role}
            </Badge>
          </div>
          <div>
            <strong>Status:</strong> <Badge variant="outline">{user.status}</Badge>
          </div>
          {user.lastLogin && (
            <div>
              <strong>Last Login:</strong> {user.lastLogin}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserViewPage; 