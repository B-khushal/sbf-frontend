import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Edit, Trash2, Eye, Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

type Customer = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  status: 'active' | 'inactive' | string;
  lastLogin?: string;
  createdAt?: string;
  phone?: string;
};

const NON_CUSTOMER_ROLES = ['admin', 'vendor', 'marketing', 'marketing_head', 'marketing_team', 'delivery_partner', 'staff'];

const AdminUsers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch customers with filtering to exclude admin/vendor/marketing/staff
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/users?customersOnly=true");
        const rawUsers = Array.isArray(res.data) 
          ? res.data 
          : (res.data?.users || []);
        
        // Filter strictly to customers only
        const customerList: Customer[] = rawUsers
          .filter((u: any) => {
            if (!u) return false;
            const role = (u.role || '').toLowerCase();
            return !NON_CUSTOMER_ROLES.includes(role);
          })
          .map((u: any) => ({
            ...u,
            _id: u._id || u.id
          }));

        setCustomers(customerList);
      } catch (error: any) {
        console.error("Error fetching customers:", error.response || error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch customers",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleEditClick = (customer: Customer) => {
    navigate(`/admin/users/edit/${customer._id}`);
  };

  const handleViewClick = (customer: Customer) => {
    navigate(`/admin/users/view/${customer._id}`);
  };

  const handleDeleteClick = (customerId: string) => {
    const customer = customers.find(u => u._id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    setIsLoading(true);

    try {
      await api.delete(`/users/${selectedCustomer._id}`);
      setCustomers(prev => prev.filter(c => c._id !== selectedCustomer._id));
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting customer:", error.response || error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomerClick = () => {
    navigate('/admin/users/add');
  };

  // Search and Status Filter
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = 
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate customer-specific KPIs
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activeCount = customers.filter(c => c.status === 'active').length;
  const inactiveCount = customers.filter(c => c.status === 'inactive').length;
  const newThisMonthCount = customers.filter(c => c.createdAt && new Date(c.createdAt) >= thirtyDaysAgo).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage customer accounts, verify profiles, and monitor customer activity
          </p>
        </div>
        <Button onClick={handleAddCustomerClick} className="shadow-sm">
          <UserPlus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Customer Specific KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{customers.length}</h3>
            </div>
            <Users className="h-8 w-8 text-blue-400/60 dark:text-blue-500/40" />
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Customers</p>
              <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{activeCount}</h3>
            </div>
            <UserCheck className="h-8 w-8 text-emerald-400/60 dark:text-emerald-500/40" />
          </div>
        </Card>

        <Card className="p-4 bg-violet-50/70 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">New (Last 30 Days)</p>
              <h3 className="text-2xl font-bold text-violet-900 dark:text-violet-200 mt-1">{newThisMonthCount}</h3>
            </div>
            <Calendar className="h-8 w-8 text-violet-400/60 dark:text-violet-500/40" />
          </div>
        </Card>

        <Card className="p-4 bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inactive Accounts</p>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">{inactiveCount}</h3>
            </div>
            <UserX className="h-8 w-8 text-slate-400/60 dark:text-slate-500/40" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg">Customer Directory ({filteredCustomers.length})</CardTitle>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, phone..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="responsive-table-wrap border-0 rounded-none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer Since</TableHead>
                  <TableHead>Last Active / Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {customer.name || 'Valued Customer'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {customer.email}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={customer.status === 'active' ? 'default' : 'secondary'}
                        className={customer.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                      >
                        {customer.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Registered'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex flex-wrap justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClick(customer)}
                          disabled={isLoading}
                          title="View Customer Profile"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(customer)}
                          disabled={isLoading}
                          title="Edit Customer"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(customer._id)}
                          disabled={isLoading}
                          title="Delete Customer"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No customers found matching the criteria.
                    </TableCell>
                  </TableRow>
                )}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer account
              ({selectedCustomer?.name} - {selectedCustomer?.email}) and remove their profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? "Deleting..." : "Delete Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
