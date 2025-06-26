import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Store, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { getAllVendors, updateVendorStatus } from '@/services/vendorService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Vendor {
  _id: string;
  storeName: string;
  storeDescription: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  storeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  verification: {
    isVerified: boolean;
  };
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
  };
}

const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await getAllVendors();
      setVendors(response.vendors);
      setFilteredVendors(response.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    let filtered = vendors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contactInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }

    setFilteredVendors(filtered);
  }, [vendors, searchTerm, statusFilter]);

  const handleStatusUpdate = async (vendorId: string, newStatus: string) => {
    try {
      setUpdating(vendorId);
      await updateVendorStatus(vendorId, newStatus);
      
      // Update local state
      setVendors(prev => prev.map(vendor => 
        vendor._id === vendorId 
          ? { ...vendor, status: newStatus as any }
          : vendor
      ));

      toast({
        title: "Status Updated",
        description: `Vendor status has been updated to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error('Error updating vendor status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update vendor status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      case 'suspended':
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const VendorDetailsModal = ({ vendor }: { vendor: Vendor }) => (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {vendor.storeName}
        </DialogTitle>
        <DialogDescription>
          Vendor details and management
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(vendor.status)}>
                {getStatusIcon(vendor.status)}
                <span className="ml-1 capitalize">{vendor.status}</span>
              </Badge>
              {vendor.verification.isVerified && (
                <Badge variant="secondary">Verified</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {vendor.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(vendor._id, 'approved')}
                    disabled={updating === vendor._id}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(vendor._id, 'rejected')}
                    disabled={updating === vendor._id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              {vendor.status === 'approved' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate(vendor._id, 'suspended')}
                  disabled={updating === vendor._id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Suspend
                </Button>
              )}
              {vendor.status === 'suspended' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(vendor._id, 'approved')}
                  disabled={updating === vendor._id}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Reactivate
                </Button>
              )}
            </div>
          </div>

          {/* Store Information */}
          <div>
            <h3 className="font-semibold mb-3">Store Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Description:</strong> {vendor.storeDescription}</p>
              <p><strong>Registered:</strong> {new Date(vendor.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Owner Information */}
          <div>
            <h3 className="font-semibold mb-3">Owner Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{vendor.user.name} ({vendor.user.email})</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{vendor.contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{vendor.contactInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-semibold mb-3">Store Address</h3>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <p>{vendor.storeAddress.street}</p>
                <p>{vendor.storeAddress.city}, {vendor.storeAddress.state} {vendor.storeAddress.zipCode}</p>
                <p>{vendor.storeAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="font-semibold mb-3">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border text-center">
                <p className="text-2xl font-bold">{vendor.stats.totalProducts}</p>
                <p className="text-sm text-gray-500">Products</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <p className="text-2xl font-bold">{vendor.stats.totalOrders}</p>
                <p className="text-sm text-gray-500">Orders</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-gray-600">Manage vendor applications and accounts</p>
        </div>
        <Button onClick={fetchVendors} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {vendors.filter(v => v.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending Approval</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {vendors.filter(v => v.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-500">Active Vendors</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {vendors.filter(v => v.status === 'suspended').length}
              </div>
              <div className="text-sm text-gray-500">Suspended</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {vendors.length}
              </div>
              <div className="text-sm text-gray-500">Total Vendors</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vendor.storeName}</div>
                      <div className="text-sm text-gray-500 truncate max-w-48">
                        {vendor.storeDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vendor.user.name}</div>
                      <div className="text-sm text-gray-500">{vendor.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{vendor.contactInfo.phone}</div>
                      <div className="text-gray-500">{vendor.contactInfo.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(vendor.status)}>
                      {getStatusIcon(vendor.status)}
                      <span className="ml-1 capitalize">{vendor.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{vendor.stats.totalProducts}</TableCell>
                  <TableCell>{vendor.stats.totalOrders}</TableCell>
                  <TableCell>
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      {selectedVendor && selectedVendor._id === vendor._id && (
                        <VendorDetailsModal vendor={selectedVendor} />
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredVendors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No vendors found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorManagement; 