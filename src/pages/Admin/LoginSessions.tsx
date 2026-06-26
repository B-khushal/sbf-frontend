import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  LogOut, 
  Monitor, 
  Smartphone, 
  Globe, 
  MapPin, 
  Calendar, 
  Clock,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Session {
  sessionId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
  loginTime: string;
  logoutTime: string | null;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  status: 'active' | 'expired' | 'revoked';
}

const LoginSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const isPlatformAdminOrStoreOwner = user?.role === 'platform_admin' || user?.role === 'store_owner';

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/staff/login-history');
      setSessions(response.data);
    } catch (error) {
      console.error('Fetch sessions error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to retrieve login session logs.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string, userId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await api.post('/staff/auth/revoke-session', {
        sessionId,
        userId
      });
      
      toast({
        title: 'Session Revoked',
        description: 'The staff member has been logged out and their token revoked.'
      });
      
      // Update local state
      setSessions(prev => prev.map(s => 
        s.sessionId === sessionId 
          ? { ...s, status: 'revoked', logoutTime: new Date().toISOString() } 
          : s
      ));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to revoke session.'
      });
    } finally {
      setRevokingSessionId(null);
    }
  };

  const getRoleLabel = (role: string) => {
    return role.replace('_', ' ').toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'platform_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'store_owner': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'store_manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivery_manager': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'delivery_partner': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Metrics
  const activeCount = sessions.filter(s => s.status === 'active').length;
  const uniqueUsersCount = new Set(sessions.filter(s => s.status === 'active').map(s => s.userId)).size;
  const totalCount = sessions.length;

  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.device.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-bloom-dark">Login Sessions</h1>
          <p className="text-muted-foreground">Monitor real-time active login tokens and session states for all administrative users.</p>
        </div>
        <Button onClick={fetchSessions} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="subtle-shadow border-gray-100 bg-white">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              {activeCount} Active
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tokens currently valid on client devices</p>
          </CardContent>
        </Card>

        <Card className="subtle-shadow border-gray-100 bg-white">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Users Active</CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bloom-dark">{uniqueUsersCount} Staff Members</div>
            <p className="text-xs text-muted-foreground mt-1">Distinct employees logged in right now</p>
          </CardContent>
        </Card>

        <Card className="subtle-shadow border-gray-100 bg-white">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Audit Trail Limit</CardTitle>
            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">{totalCount} Sessions</div>
            <p className="text-xs text-muted-foreground mt-1">Recent logins kept in session log</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="subtle-shadow border-gray-100 bg-white">
        <CardHeader className="pb-3 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-lg">Session Directory & Security Logs</CardTitle>
            <CardDescription>Force logout staff members to revoke token access in case of device loss or termination.</CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user, IP, or browser..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50/50 focus-visible:bg-white"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading security logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Profile</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Device Info</TableHead>
                    <TableHead>Location & IP</TableHead>
                    <TableHead>Login Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Access Controls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const isMobile = /mobile|android|iphone/i.test(session.device || '');
                    
                    return (
                      <TableRow key={session.sessionId} className={session.status === 'active' ? 'bg-emerald-50/10' : ''}>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-bloom-dark">{session.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{session.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-mono uppercase ${getRoleBadgeColor(session.role)}`}>
                            {getRoleLabel(session.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isMobile ? (
                              <Smartphone className="h-4 w-4 text-slate-400 shrink-0" />
                            ) : (
                              <Monitor className="h-4 w-4 text-slate-400 shrink-0" />
                            )}
                            <div className="text-xs">
                              <div>{session.device || 'Web Browser'}</div>
                              <div className="text-muted-foreground font-mono">{session.browser || 'Unknown'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{session.location || 'Unknown location'}</span>
                          </div>
                          <div className="text-muted-foreground font-mono ml-4">{session.ipAddress}</div>
                        </TableCell>
                        <TableCell className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span className="font-mono">{new Date(session.loginTime).toLocaleString()}</span>
                          </div>
                          {session.logoutTime && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="font-mono">{new Date(session.logoutTime).toLocaleString()}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            session.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100' :
                            session.status === 'revoked' ? 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100' :
                            'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100'
                          }>
                            {session.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {session.status === 'active' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  disabled={!isPlatformAdminOrStoreOwner || revokingSessionId === session.sessionId}
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1 ml-auto"
                                >
                                  <LogOut className="h-3.5 w-3.5" /> Force Logout
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Force session logout?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will revoke the login token for <strong>{session.name}</strong> on their <strong>{session.device}</strong> device. The user will be immediately logged out and forced to re-authenticate on their next request.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRevokeSession(session.sessionId, session.userId)}
                                    className="bg-rose-600 text-white hover:bg-rose-700"
                                  >
                                    Force Logout
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredSessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground bg-slate-50/10">
                        <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        No active login sessions found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginSessions;
