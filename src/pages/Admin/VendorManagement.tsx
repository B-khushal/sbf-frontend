import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Store, Eye, Check, X, Pause, Play, Filter, Download, RefreshCw, Users, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  EnhancedContextualDialog, 
  EnhancedContextualDialogContent, 
  EnhancedContextualDialogHeader, 
  EnhancedContextualDialogTitle, 
  EnhancedContextualDialogFooter, 
  EnhancedContextualDialogDescription 
} from '@/components/ui/enhanced-contextual-dialog';
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
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    upiId?: string;
  };
    stats?: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  commission?: {
    type: 'percentage' | 'fixed';
    rate: number;
  };
  subscription?: {
    plan: 'basic' | 'premium' | 'enterprise';
    expiresAt?: string;
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const { formatPrice } = useCurrency();

  // Trigger refs for contextual positioning
  const vendorDetailButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const statusButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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
  const handleViewDetails = (vendorId: string) => {
    if (vendorDetailButtonRefs.current[vendorId]) {
      vendorDetailButtonRefs.current[vendorId]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    const vendor = vendors.find((v) => v._id === vendorId);
    if (vendor) {
      setSelectedVendor(vendor);
      setIsDetailsModalOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Could not find vendor details.",
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
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      vendor.storeName.toLowerCase().includes(lowerSearchTerm) ||
      vendor.user.name.toLowerCase().includes(lowerSearchTerm) ||
      vendor.user.email.toLowerCase().includes(lowerSearchTerm) ||
      (vendor.businessType && vendor.businessType.toLowerCase().includes(lowerSearchTerm));
    
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && vendor.verification.isVerified) ||
      (verificationFilter === 'unverified' && !vendor.verification.isVerified);
    const matchesSubscription = subscriptionFilter === 'all' || (vendor.subscription && vendor.subscription.plan === subscriptionFilter);
    
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
    totalRevenue: vendors.reduce((sum, v) => sum + (v.stats?.totalRevenue || 0), 0),
    totalProducts: vendors.reduce((sum, v) => sum + (v.stats?.totalProducts || 0), 0),
    totalOrders: vendors.reduce((sum, v) => sum + (v.stats?.totalOrders || 0), 0),
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
        vendor.stats?.totalProducts,
        vendor.stats?.totalOrders,
        vendor.stats?.totalRevenue,
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
      case 'suspended': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            Vendor Management
          </h1>
          <p className="text-muted-foreground">Manage vendor applications, approvals, and store operations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportVendorsData}
            disabled={filteredVendors.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={fetchVendors} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Vendors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Active Vendors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.verified}</div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{formatPrice(stats.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            {(statusFilter !== 'all' || verificationFilter !== 'all' || subscriptionFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusFilter('all');
                  setVerificationFilter('all');
                  setSubscriptionFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={vendor.verification.isVerified ? "default" : "outline"}>
                      {vendor.verification.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSubscriptionColor(vendor.subscription?.plan || 'basic')}>
                      {vendor.subscription?.plan || 'Basic'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{(vendor.commission?.rate ?? 0).toFixed(2)}%</div>
                    <div className="text-sm text-muted-foreground capitalize">{vendor.commission?.type || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>-</span>
                    </div>
                    
                  </TableCell>
                  <TableCell>{new Date(vendor.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        ref={(el) => vendorDetailButtonRefs.current[vendor._id] = el}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(vendor._id)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {vendor.status === 'pending' && (
                        <>
                          <Button
                            ref={(el) => statusButtonRefs.current[`${vendor._id}-approve`] = el}
                            variant="ghost"
                            size="sm"
                            onClick={() => openStatusDialog(vendor, 'approved')}
                            disabled={updatingVendor === vendor._id}
                            title="Approve"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            ref={(el) => statusButtonRefs.current[`${vendor._id}-reject`] = el}
                            variant="ghost"
                            size="sm"
                            onClick={() => openStatusDialog(vendor, 'rejected')}
                            disabled={updatingVendor === vendor._id}
                            title="Reject"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {vendor.status === 'approved' && (
                        <Button
                          ref={(el) => statusButtonRefs.current[`${vendor._id}-suspend`] = el}
                          variant="ghost"
                          size="sm"
                          onClick={() => openStatusDialog(vendor, 'suspended')}
                          disabled={updatingVendor === vendor._id}
                          title="Suspend"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {vendor.status === 'suspended' && (
                        <Button
                          ref={(el) => statusButtonRefs.current[`${vendor._id}-reactivate`] = el}
                          variant="ghost"
                          size="sm"
                          onClick={() => openStatusDialog(vendor, 'approved')}
                          disabled={updatingVendor === vendor._id}
                          title="Reactivate"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No vendors found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Detail Dialog */}
      <EnhancedContextualDialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <EnhancedContextualDialogContent 
          className="max-w-4xl max-w-[90vw] max-h-[80vh] overflow-y-auto"
          triggerRef={selectedVendor ? vendorDetailButtonRefs.current[selectedVendor._id] : undefined}
          useContextualPositioning={true}
          margin={16}
        >
          <EnhancedContextualDialogHeader>
            <EnhancedContextualDialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {selectedVendor?.storeName}
            </EnhancedContextualDialogTitle>
            <EnhancedContextualDialogDescription>
              Comprehensive vendor information and management
            </EnhancedContextualDialogDescription>
          </EnhancedContextualDialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              {/* Status and Quick Actions */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(selectedVendor.status)}>
                    {selectedVendor.status}
                  </Badge>
                  {selectedVendor.verification.isVerified && (
                    <Badge variant="default">Verified</Badge>
                  )}
                  <Badge className={getSubscriptionColor(selectedVendor.subscription?.plan || 'basic')}>
                    {selectedVendor.subscription?.plan || 'Basic'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {selectedVendor.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => openStatusDialog(selectedVendor, 'approved')}
                        disabled={updatingVendor === selectedVendor._id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openStatusDialog(selectedVendor, 'rejected')}
                        disabled={updatingVendor === selectedVendor._id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedVendor.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openStatusDialog(selectedVendor, 'suspended')}
                      disabled={updatingVendor === selectedVendor._id}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  )}
                  {selectedVendor.status === 'suspended' && (
                    <Button
                      size="sm"
                      onClick={() => openStatusDialog(selectedVendor, 'approved')}
                      disabled={updatingVendor === selectedVendor._id}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>

              {/* Store Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Store Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1 text-muted-foreground">{selectedVendor.storeDescription}</p>
                    </div>
                    <div>
                      <strong>Business Type:</strong> {selectedVendor.businessType}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedVendor.phone || 'N/A'}
                    </div>
                    <div>
                      <strong>Address:</strong>
                      <p className="text-sm">
                        {selectedVendor.address ? (
                          <>
                            {selectedVendor.address.street}, {selectedVendor.address.city}<br />
                            {selectedVendor.address.state} {selectedVendor.address.zipCode}<br />
                            {selectedVendor.address.country}
                          </>
                        ) : 'No address provided'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Owner Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedVendor.user.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedVendor.user.email}
                    </div>
                    <div>
                      <strong>Last Login:</strong> {selectedVendor.user.lastLogin || 'Never'}
                    </div>
                    <div>
                      <strong>Joined:</strong> {new Date(selectedVendor.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 rounded-lg border">
                      <div className="text-2xl font-bold">{selectedVendor.stats?.totalProducts || 0}</div>
                      <div className="text-sm text-muted-foreground">Products</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border">
                      <div className="text-2xl font-bold">{selectedVendor.stats?.totalOrders || 0}</div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border">
                      <div className="text-2xl font-bold">{formatPrice(selectedVendor.stats?.totalRevenue || 0)}</div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border">
                                      <div className="text-2xl font-bold">-</div>
                <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border">
                      <div className="text-2xl font-bold">{selectedVendor.stats?.totalReviews || 0}</div>
                      <div className="text-sm text-muted-foreground">Reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Banking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Account Holder:</strong> {selectedVendor.bankDetails?.accountHolderName || 'N/A'}
                  </div>
                  <div>
                    <strong>Bank Name:</strong> {selectedVendor.bankDetails?.bankName || 'N/A'}
                  </div>
                  <div>
                    <strong>Account Number:</strong> **** **** {selectedVendor.bankDetails?.accountNumber?.slice(-4) || 'N/A'}
                  </div>
                  <div>
                    <strong>IFSC Code:</strong> {selectedVendor.bankDetails?.ifscCode || 'N/A'}
                  </div>
                  {selectedVendor.bankDetails?.upiId && (
                    <div>
                      <strong>UPI ID:</strong> {selectedVendor.bankDetails.upiId}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Commission Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Commission Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Type:</strong> {selectedVendor.commission?.type || 'N/A'}
                  </div>
                  <div>
                    <strong>Rate:</strong> {selectedVendor.commission?.type === 'percentage' ? `${selectedVendor.commission.rate}%` : formatPrice(selectedVendor.commission.rate || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <EnhancedContextualDialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
          </EnhancedContextualDialogFooter>
        </EnhancedContextualDialogContent>
      </EnhancedContextualDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of "{selectedVendor?.storeName}" to "{newStatus}"?
              {newStatus === 'approved' && " This will allow the vendor to start selling."}
              {newStatus === 'rejected' && " This will permanently reject the vendor application."}
              {newStatus === 'suspended' && " This will temporarily suspend the vendor's operations."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingVendor !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusUpdate}
              disabled={updatingVendor !== null}
            >
              {updatingVendor ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVendorManagement; 