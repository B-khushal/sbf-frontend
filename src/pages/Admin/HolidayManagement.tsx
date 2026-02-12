import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Edit, Trash2, Eye, Filter, Download, Upload, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import holidayService, { Holiday, CreateHolidayData, HolidayStats } from '@/services/holidayService';

const HolidayManagement: React.FC = () => {
  console.log('HolidayManagement: Component initializing');
  
  try {
    const { toast } = useToast();
    const { user, refreshAuth } = useAuth();
    
    // Debug authentication status
    console.log('HolidayManagement: User auth status:', {
      user: user,
      isAuthenticated: !!user,
      role: user?.role,
      token: user?.token ? 'Present' : 'Missing'
    });
    
    // Check localStorage for token
    const storedToken = localStorage.getItem('token');
    console.log('HolidayManagement: Stored token:', storedToken ? 'Present' : 'Missing');
    
    // Check if user is admin
    if (!user) {
      console.error('HolidayManagement: User is not authenticated');
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Holiday Management</h1>
              <p className="text-muted-foreground">
                Manage store holidays and non-delivery dates
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <h3 className="text-lg font-semibold">Authentication Required</h3>
                  <p className="text-sm">You must be logged in to access this page.</p>
                  <Button 
                    onClick={() => window.location.href = '/login'} 
                    className="mt-4"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (user.role !== 'admin') {
      console.error('HolidayManagement: User is not admin, role:', user.role);
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Holiday Management</h1>
              <p className="text-muted-foreground">
                Manage store holidays and non-delivery dates
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <h3 className="text-lg font-semibold">Access Denied</h3>
                  <p className="text-sm">
                    You must be an admin to access this page. Your current role is: {user.role}
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    className="mt-4"
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [stats, setStats] = useState<HolidayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentHoliday, setCurrentHoliday] = useState<CreateHolidayData>({
    name: '',
    date: '',
    reason: '',
    type: 'store',
    category: 'other',
    isActive: true,
    recurring: false,
    recurringYears: []
  });

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    isActive: ''
  });

  useEffect(() => {
    console.log('HolidayManagement: Component mounted');
    
    // Debug authentication and API status
    const debugAuthStatus = async () => {
      console.log('=== HOLIDAY MANAGEMENT DEBUG ===');
      console.log('1. User state:', user);
      console.log('2. LocalStorage token:', localStorage.getItem('token'));
      console.log('3. LocalStorage user:', localStorage.getItem('user'));
      console.log('4. LocalStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));
      
      // Test API call directly
      try {
        console.log('5. Testing API call to /holidays/stats...');
        const response = await fetch('https://www.sbflorist.in/api/holidays/stats?year=2024', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('6. API Response status:', response.status);
        const data = await response.text();
        console.log('7. API Response data:', data);
        
        // Also test the holidays endpoint
        console.log('8. Testing API call to /holidays...');
        const holidaysResponse = await fetch('https://www.sbflorist.in/api/holidays?year=2024', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('9. Holidays API Response status:', holidaysResponse.status);
        const holidaysData = await holidaysResponse.text();
        console.log('10. Holidays API Response data:', holidaysData);
      } catch (error) {
        console.error('8. API call failed:', error);
      }
      console.log('=== END DEBUG ===');
    };
    
    debugAuthStatus();
    fetchHolidays();
    fetchStats();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    try {
      console.log('HolidayManagement: Fetching holidays for year:', selectedYear);
      setLoading(true);
      setError(null);
      
      const response = await holidayService.getAllHolidays({
        year: selectedYear,
        category: filters.category || undefined,
        type: filters.type || undefined,
        isActive: filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined
      });
      
      console.log('HolidayManagement: Holidays response:', response);
      
      if (response.success) {
        setHolidays(response.data || []);
      } else {
        console.error('HolidayManagement: API returned success: false');
        setError('Failed to fetch holidays: API returned error');
      }
    } catch (error) {
      console.error('HolidayManagement: Error fetching holidays:', error);
      setError(`Failed to fetch holidays: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to fetch holidays',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('HolidayManagement: Fetching stats for year:', selectedYear);
      const response = await holidayService.getHolidayStats(selectedYear);
      console.log('HolidayManagement: Stats response:', response);
      
      if (response.success) {
        setStats(response.data);
      } else {
        console.error('HolidayManagement: Stats API returned success: false');
      }
    } catch (error) {
      console.error('HolidayManagement: Error fetching stats:', error);
      // Don't set error for stats as it's not critical
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentHoliday.name || !currentHoliday.date || !currentHoliday.reason) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingHoliday) {
        const response = await holidayService.updateHoliday(editingHoliday._id, currentHoliday);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Holiday updated successfully'
          });
        }
      } else {
        const response = await holidayService.createHoliday(currentHoliday);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Holiday created successfully'
          });
        }
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchHolidays();
      fetchStats();
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast({
        title: 'Error',
        description: 'Failed to save holiday',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setCurrentHoliday({
      name: holiday.name,
      date: holiday.date.split('T')[0],
      reason: holiday.reason,
      type: holiday.type,
      category: holiday.category,
      isActive: holiday.isActive,
      recurring: holiday.recurring,
      recurringYears: holiday.recurringYears
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      const response = await holidayService.deleteHoliday(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Holiday deleted successfully'
        });
        fetchHolidays();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete holiday',
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await holidayService.toggleHolidayStatus(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message
        });
        fetchHolidays();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling holiday status:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle holiday status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setEditingHoliday(null);
    setCurrentHoliday({
      name: '',
      date: '',
      reason: '',
      type: 'store',
      category: 'other',
      isActive: true,
      recurring: false,
      recurringYears: []
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'national': return 'bg-blue-100 text-blue-800';
      case 'religious': return 'bg-purple-100 text-purple-800';
      case 'store': return 'bg-orange-100 text-orange-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fixed': return 'bg-green-100 text-green-800';
      case 'dynamic': return 'bg-yellow-100 text-yellow-800';
      case 'store': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHolidays = holidays.filter(holiday => {
    if (filters.category && holiday.category !== filters.category) return false;
    if (filters.type && holiday.type !== filters.type) return false;
    if (filters.isActive !== '' && holiday.isActive !== (filters.isActive === 'true')) return false;
    return true;
  });

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Holiday Management</h1>
            <p className="text-muted-foreground">
              Manage store holidays and non-delivery dates
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <h3 className="text-lg font-semibold">Error Loading Holidays</h3>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={() => {
                setError(null);
                fetchHolidays();
                fetchStats();
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info - Remove this after fixing the issue */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Information</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <div>User: {user ? `${user.name} (${user.role})` : 'Not logged in'}</div>
                <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
                <div>Authenticated: {localStorage.getItem('isAuthenticated')}</div>
                <div>Loading: {loading ? 'Yes' : 'No'}</div>
                <div>Error: {error ? 'Yes' : 'No'}</div>
                <div>Holidays Count: {holidays.length}</div>
                <div>Stats: {stats ? 'Loaded' : 'Not loaded'}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={refreshAuth} 
                variant="outline" 
                size="sm"
                className="text-yellow-800 border-yellow-600 hover:bg-yellow-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Auth
              </Button>
              <Button 
                onClick={() => {
                  fetchHolidays();
                  fetchStats();
                }} 
                variant="outline" 
                size="sm"
                className="text-yellow-800 border-yellow-600 hover:bg-yellow-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Holiday Management</h1>
          <p className="text-muted-foreground">
            Manage store holidays and non-delivery dates
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Holiday
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Holidays</p>
                  <p className="text-2xl font-bold">{stats.total || 0}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive || 0}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year</p>
                  <p className="text-2xl font-bold">{stats.year || selectedYear}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{(stats.year || selectedYear).toString().slice(-2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="dynamic">Dynamic</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.isActive} onValueChange={(value) => setFilters({ ...filters, isActive: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holidays Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holidays ({filteredHolidays.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.map((holiday) => {
                  // Add safety checks for holiday data
                  if (!holiday || !holiday._id) {
                    console.warn('HolidayManagement: Invalid holiday data:', holiday);
                    return null;
                  }
                  
                  return (
                    <TableRow key={holiday._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{holiday.name || 'Unnamed Holiday'}</div>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {holiday.reason || 'No reason provided'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {holiday.date ? format(new Date(holiday.date), 'MMM dd, yyyy') : 'Invalid Date'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(holiday.category || 'other')}>
                          {holiday.category || 'other'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(holiday.type || 'store')}>
                          {holiday.type || 'store'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={holiday.isActive ? "default" : "secondary"}>
                          {holiday.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{holiday.createdBy?.name || 'Unknown'}</div>
                          <div className="text-muted-foreground">{holiday.createdBy?.email || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(holiday)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(holiday._id)}
                          >
                            {holiday.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(holiday._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingHoliday ? 'Edit Holiday' : 'Create New Holiday'}
            </DialogTitle>
            <DialogDescription>
              {editingHoliday 
                ? 'Update the holiday information below.'
                : 'Add a new holiday or non-delivery date for the store.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Holiday Name *</Label>
                <Input
                  id="name"
                  value={currentHoliday.name}
                  onChange={(e) => setCurrentHoliday({ ...currentHoliday, name: e.target.value })}
                  placeholder="e.g., Christmas, Store Maintenance"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date *</Label>
                <div className="dropdown-container">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !currentHoliday.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentHoliday.date ? format(new Date(currentHoliday.date), 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentHoliday.date ? new Date(currentHoliday.date) : undefined}
                        onSelect={(date) => setCurrentHoliday({ ...currentHoliday, date: date?.toISOString().split('T')[0] || '' })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={currentHoliday.reason}
                onChange={(e) => setCurrentHoliday({ ...currentHoliday, reason: e.target.value })}
                placeholder="Explain why delivery is not available on this date"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={currentHoliday.category} 
                  onValueChange={(value) => setCurrentHoliday({ ...currentHoliday, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="religious">Religious</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={currentHoliday.type} 
                  onValueChange={(value) => setCurrentHoliday({ ...currentHoliday, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={currentHoliday.isActive}
                onCheckedChange={(checked) => setCurrentHoliday({ ...currentHoliday, isActive: checked as boolean })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={currentHoliday.recurring}
                onCheckedChange={(checked) => setCurrentHoliday({ ...currentHoliday, recurring: checked as boolean })}
              />
              <Label htmlFor="recurring">Recurring Holiday</Label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editingHoliday ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
  } catch (error) {
    console.error('HolidayManagement: Unexpected error in component:', error);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Holiday Management</h1>
            <p className="text-muted-foreground">
              Manage store holidays and non-delivery dates
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <h3 className="text-lg font-semibold">Unexpected Error</h3>
                <p className="text-sm">Something went wrong while loading the holiday management page.</p>
                <p className="text-xs text-gray-500 mt-2">
                  Error: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default HolidayManagement; 