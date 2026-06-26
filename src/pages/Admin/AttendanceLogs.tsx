import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { 
  Clock, 
  Calendar, 
  UserCheck, 
  UserX, 
  Search, 
  Store, 
  MapPin, 
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  employeeId?: string;
  staffCode?: string;
  status: string;
  assigned_store?: { _id: string; name: string } | null;
  assigned_zone?: { _id: string; name: string } | null;
  login_history?: any[];
}

interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  day: string;
  shiftType: 'Morning' | 'General' | 'Evening' | 'Night';
  timing: string;
  status: 'Scheduled' | 'On Duty' | 'Absent' | 'Off';
}

const AttendanceLogs: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const { toast } = useToast();

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, sessionsRes] = await Promise.all([
        api.get('/staff'),
        api.get('/staff/login-history')
      ]);
      
      setStaff(staffRes.data);
      setSessions(sessionsRes.data);

      // Generate mock schedules/shifts based on actual staff members
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
      
      const generatedShifts: Shift[] = [];
      const shiftTypes: ('Morning' | 'General' | 'Evening' | 'Night')[] = ['Morning', 'General', 'Evening', 'Night'];
      const timings = {
        Morning: '07:00 AM - 03:00 PM',
        General: '09:00 AM - 06:00 PM',
        Evening: '02:00 PM - 10:00 PM',
        Night: '10:00 PM - 06:00 AM'
      };

      staffRes.data.forEach((member: StaffMember, index: number) => {
        // Assign a default shift pattern
        const shiftType = shiftTypes[index % shiftTypes.length];
        
        // Check if member has active login session today
        const hasSessionToday = sessionsRes.data.some((s: any) => 
          s.userId === member._id && 
          s.status === 'active' &&
          new Date(s.loginTime).toDateString() === new Date().toDateString()
        );

        let status: 'Scheduled' | 'On Duty' | 'Absent' | 'Off' = 'Scheduled';
        if (hasSessionToday) {
          status = 'On Duty';
        } else if (member.status === 'suspended') {
          status = 'Absent';
        } else if (index % 7 === 0) {
          status = 'Off'; // Simulated weekly off
        }

        generatedShifts.push({
          id: `${member._id}-shift`,
          staffId: member._id,
          staffName: member.name,
          role: member.role,
          day: todayName,
          shiftType,
          timing: timings[shiftType],
          status
        });
      });

      setShifts(generatedShifts);
    } catch (error) {
      console.error('Fetch attendance error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to retrieve attendance log data.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

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

  const getShiftBadgeColor = (status: string) => {
    switch (status) {
      case 'On Duty': return 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse';
      case 'Scheduled': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Absent': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Off': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleLabel = (role: string) => {
    return role.replace('_', ' ').toUpperCase();
  };

  // Live on-duty calculations
  const totalStaff = staff.length;
  const onDutyCount = shifts.filter(s => s.status === 'On Duty').length;
  const deliveryOnlineCount = staff.filter(s => s.role === 'delivery_partner' && 
    sessions.some(session => session.userId === s._id && session.status === 'active')
  ).length;

  const attendanceRate = totalStaff > 0 ? Math.round(((onDutyCount) / totalStaff) * 100) : 0;

  // Filtered lists
  const filteredLiveStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.employeeId && member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const filteredShifts = shifts.filter(s => 
    s.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-bloom-dark">Attendance & Schedules</h1>
          <p className="text-muted-foreground">Monitor live check-in states, daily shift allocations, and active schedules.</p>
        </div>
        <Button onClick={fetchAttendanceData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="subtle-shadow border-gray-100 bg-white">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff Directory</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bloom-dark">{totalStaff} Members</div>
            <p className="text-xs text-muted-foreground mt-1">Configured employee accounts</p>
          </CardContent>
        </Card>

        <Card className="subtle-shadow border-gray-100 bg-white">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live On Duty Now</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              {onDutyCount} Active
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently checked-in via session</p>
          </CardContent>
        </Card>

        <Card className="subtle-shadow border-gray-100 bg-white">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online Delivery Drivers</CardTitle>
            <MapPin className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{deliveryOnlineCount} Partners</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for order assignment</p>
          </CardContent>
        </Card>

        <Card className="subtle-shadow border-gray-100 bg-white">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duty Coverage Rate</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{attendanceRate}% Today</div>
            <p className="text-xs text-muted-foreground mt-1">Active vs scheduled staffing ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Card className="subtle-shadow border-gray-100 bg-white">
        <CardHeader className="pb-3 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-slate-100/80 p-1">
              <TabsTrigger value="live" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Live Status Board
              </TabsTrigger>
              <TabsTrigger value="shifts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Daily Schedules
              </TabsTrigger>
              <TabsTrigger value="punches" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Attendance Punch Logs
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee name..."
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
              <p className="text-muted-foreground text-sm">Querying rosters and logs...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Live Status Board */}
              <TabsContent value="live" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-slate-50/30">
                  {filteredLiveStaff.map(member => {
                    // Check if member is online
                    const activeSession = sessions.find(s => s.userId === member._id && s.status === 'active');
                    const isOnline = !!activeSession;
                    
                    return (
                      <div key={member._id} className="bg-white border rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-semibold text-bloom-dark flex items-center gap-2">
                              {member.name}
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            </div>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                            <div className="flex gap-1.5 mt-2">
                              <Badge variant="outline" className={`text-[10px] uppercase font-mono ${getRoleBadgeColor(member.role)}`}>
                                {getRoleLabel(member.role)}
                              </Badge>
                              {member.employeeId && (
                                <Badge variant="secondary" className="text-[10px] font-mono text-slate-500 bg-slate-100">
                                  {member.employeeId}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Badge className={`text-xs ${isOnline ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-50' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'}`}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                          </Badge>
                        </div>
                        
                        <div className="border-t border-dashed mt-4 pt-3 space-y-2 text-xs">
                          <div className="flex items-center text-muted-foreground">
                            <Store className="h-3.5 w-3.5 mr-2 text-slate-400" />
                            <span className="font-medium text-slate-700">Store: </span>
                            <span className="ml-1 text-slate-600">
                              {member.assigned_store?.name || 'All Locations (HQ)'}
                            </span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400" />
                            <span className="font-medium text-slate-700">Delivery Zone: </span>
                            <span className="ml-1 text-slate-600">
                              {member.assigned_zone?.name || 'Global Platform'}
                            </span>
                          </div>
                          {isOnline && activeSession && (
                            <div className="flex items-center text-muted-foreground bg-emerald-50/50 p-2 rounded border border-emerald-100 mt-2">
                              <Clock className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                              <div>
                                <span className="font-semibold text-emerald-800">Checked-in:</span>
                                <p className="text-[10px] text-emerald-700 font-mono">
                                  {new Date(activeSession.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({activeSession.device || 'Admin PC'})
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredLiveStaff.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed">
                      <UserX className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No matching staff members found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Daily Schedules */}
              <TabsContent value="shifts" className="m-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Shift Slot</TableHead>
                      <TableHead>Timings</TableHead>
                      <TableHead>Coverage Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium text-bloom-dark">{shift.staffName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-mono ${getRoleBadgeColor(shift.role)}`}>
                            {getRoleLabel(shift.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">{shift.shiftType}</TableCell>
                        <TableCell className="text-sm text-slate-500 font-mono">{shift.timing}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-semibold ${getShiftBadgeColor(shift.status)}`}>
                            {shift.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredShifts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No matching shifts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Tab 3: Punch Logs */}
              <TabsContent value="punches" className="m-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Device/IP</TableHead>
                      <TableHead>Check-In (Punch In)</TableHead>
                      <TableHead>Check-Out (Punch Out)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((sess: any) => (
                      <TableRow key={sess.sessionId}>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-bloom-dark">{sess.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{sess.employeeId || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-mono ${getRoleBadgeColor(sess.role)}`}>
                            {getRoleLabel(sess.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{sess.device || 'Browser'}</div>
                          <div className="text-muted-foreground font-mono">{sess.ipAddress}</div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {new Date(sess.loginTime).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {sess.logoutTime ? (
                            new Date(sess.logoutTime).toLocaleString()
                          ) : sess.status === 'active' ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active Session
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            sess.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            sess.status === 'revoked' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            'bg-slate-100 text-slate-800 border-slate-200'
                          }>
                            {sess.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No recent punch logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceLogs;
