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
      <Button variant="outline" onClick={() => navigate('/admin/users')} className="mb-4">&larr; Back to Users</Button>
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Role:</strong> <Badge variant="outline">{user.role}</Badge>
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