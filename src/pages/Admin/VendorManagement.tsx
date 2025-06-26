import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Store, Eye, Check, X, Pause, Play, Filter, Download, RefreshCw, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getAllVendors, updateVendorStatus, getVendorById } from '@/services/vendorService';

type Vendor = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    lastLogin?: string;
  };
  storeName: string;
  storeDescription: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  businessType: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
    documents: {
      businessLicense?: string;
      taxCertificate?: string;
      identityProof?: string;
    };
  };
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    upiId?: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    rating: number;
    totalReviews: number;
  };
  commission: {
    type: 'percentage' | 'fixed';
    rate: number;
  };
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    expiresAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

const AdminVendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const { toast } = useToast();
  
  // Dialog states
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updatingVendor, setUpdatingVendor] = useState<string | null>(null);
  
  const { formatPrice } = useCurrency();

  // Fetch vendors
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await getAllVendors();
      setVendors(response.vendors);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle vendor status update
  const handleStatusUpdate = async () => {
    if (!selectedVendor || !newStatus) return;

    try {
      setUpdatingVendor(selectedVendor._id);
      await updateVendorStatus(selectedVendor._id, newStatus);
      
      // Update local state
      setVendors(prev => prev.map(vendor => 
        vendor._id === selectedVendor._id 
          ? { ...vendor, status: newStatus as any }
          : vendor
      ));

      toast({
        title: "Status Updated",
        description: `Vendor status has been updated to ${newStatus}.`,
      });
      
      setIsStatusDialogOpen(false);
      setSelectedVendor(null);
      setNewStatus('');
    } catch (error: any) {
      console.error('Error updating vendor status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update vendor status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingVendor(null);
    }
  };

  // Handle vendor details view
  const handleViewDetails = async (vendor: Vendor) => {
    try {
      const detailedVendor = await getVendorById(vendor._id);
      setSelectedVendor(detailedVendor);
      setIsDetailDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching vendor details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor details",
        variant: "destructive",
      });
    }
  };

  // Open status change dialog
  const openStatusDialog = (vendor: Vendor, status: string) => {
    setSelectedVendor(vendor);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.businessType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && vendor.verification.isVerified) ||
      (verificationFilter === 'unverified' && !vendor.verification.isVerified);
    const matchesSubscription = subscriptionFilter === 'all' || vendor.subscription.plan === subscriptionFilter;
    
    return matchesSearch && matchesStatus && matchesVerification && matchesSubscription;
  });

  // Calculate statistics
  const stats = {
    total: vendors.length,
    pending: vendors.filter(v => v.status === 'pending').length,
    approved: vendors.filter(v => v.status === 'approved').length,
    suspended: vendors.filter(v => v.status === 'suspended').length,
    rejected: vendors.filter(v => v.status === 'rejected').length,
    verified: vendors.filter(v => v.verification.isVerified).length,
    totalRevenue: vendors.reduce((sum, v) => sum + (v.stats.totalRevenue || 0), 0),
    totalProducts: vendors.reduce((sum, v) => sum + (v.stats.totalProducts || 0), 0),
    totalOrders: vendors.reduce((sum, v) => sum + (v.stats.totalOrders || 0), 0),
  };

  // Export vendors data
  const exportVendorsData = () => {
    const csvContent = [
      ['Store Name', 'Owner', 'Email', 'Status', 'Verified', 'Business Type', 'Products', 'Orders', 'Revenue', 'Created Date'].join(','),
      ...filteredVendors.map(vendor => [
        vendor.storeName,
        vendor.user.name,
        vendor.user.email,
        vendor.status,
        vendor.verification.isVerified ? 'Yes' : 'No',
        vendor.businessType,
        vendor.stats.totalProducts,
        vendor.stats.totalOrders,
        vendor.stats.totalRevenue,
        new Date(vendor.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">
              {stats.verified} verified
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <div className="text-xs text-muted-foreground">
              From {stats.totalOrders} orders
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="secondary">{stats.approved} approved</Badge>
              <Badge variant="secondary">{stats.pending} pending</Badge>
              <Badge variant="secondary">{stats.suspended} suspended</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <div className="text-xs text-muted-foreground">
              Across all vendors
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vendor Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchVendors}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportVendorsData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vendor.storeName}</div>
                        <div className="text-sm text-muted-foreground">{vendor.businessType}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vendor.user.name}</div>
                        <div className="text-sm text-muted-foreground">{vendor.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                      {vendor.verification.isVerified && (
                        <Badge variant="outline" className="ml-2">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{vendor.stats.totalProducts}</div>
                      <div className="text-sm text-muted-foreground">
                        {vendor.stats.totalOrders} orders
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatPrice(vendor.stats.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {vendor.commission.rate}% commission
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSubscriptionColor(vendor.subscription.plan)}>
                        {vendor.subscription.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(vendor)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {vendor.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-800"
                            onClick={() => openStatusDialog(vendor, 'approved')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {vendor.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-yellow-600 hover:text-yellow-800"
                            onClick={() => openStatusDialog(vendor, 'suspended')}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {vendor.status === 'suspended' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-800"
                            onClick={() => openStatusDialog(vendor, 'approved')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Store Information</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedVendor.storeName}</p>
                  <p><span className="font-medium">Type:</span> {selectedVendor.businessType}</p>
                  <p><span className="font-medium">Description:</span> {selectedVendor.storeDescription}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Owner:</span> {selectedVendor.user.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedVendor.user.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedVendor.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <div className="space-y-1">
                  <p>{selectedVendor.address.street}</p>
                  <p>{selectedVendor.address.city}, {selectedVendor.address.state}</p>
                  <p>{selectedVendor.address.zipCode}, {selectedVendor.address.country}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Business Details</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Status:</span> {selectedVendor.status}</p>
                  <p><span className="font-medium">Verified:</span> {selectedVendor.verification.isVerified ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Commission:</span> {selectedVendor.commission.rate}%</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Performance</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Total Products:</span> {selectedVendor.stats.totalProducts}</p>
                  <p><span className="font-medium">Total Orders:</span> {selectedVendor.stats.totalOrders}</p>
                  <p><span className="font-medium">Total Revenue:</span> {formatPrice(selectedVendor.stats.totalRevenue)}</p>
                  <p><span className="font-medium">Rating:</span> {selectedVendor.stats.rating.toFixed(1)} ({selectedVendor.stats.totalReviews} reviews)</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Subscription</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Plan:</span> {selectedVendor.subscription.plan}</p>
                  <p><span className="font-medium">Expires:</span> {new Date(selectedVendor.subscription.expiresAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Member Since:</span> {new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Vendor Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of vendor "{selectedVendor?.storeName}" to {newStatus}?
              This action will affect their ability to manage their store and process orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusUpdate} disabled={!!updatingVendor}>
              {updatingVendor ? 'Updating...' : 'Update Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVendorManagement; 