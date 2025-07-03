import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Edit, Trash2, Store, Eye, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api'; // ✅ Import API service
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/enhanced-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getAllVendors, updateVendorStatus } from '@/services/vendorService';


type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'vendor';
  status: 'active' | 'inactive';
  lastLogin?: string;
  vendorInfo?: {
    _id: string;
    storeName: string;
    storeDescription: string;
    status: 'pending' | 'approved' | 'suspended' | 'rejected';
    verification: {
      isVerified: boolean;
    };
    stats: {
      totalProducts: number;
      totalOrders: number;
    };
  };
};

const validateEmail = (email: string) => {
  return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVendorDetailDialogOpen, setIsVendorDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    status: ''
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [updatingVendor, setUpdatingVendor] = useState<string | null>(null);
  const { formatPrice, convertPrice } = useCurrency();

  // Fetch users and vendors with better error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await api.get("/users");
        console.log("Fetched users:", usersResponse.data);
        
        // Fetch vendors
        const vendorsResponse = await getAllVendors();
        console.log("Fetched vendors:", vendorsResponse.vendors);
        
        // Merge vendor data with user data
        const usersWithVendorInfo = usersResponse.data.map((user: User) => {
          const vendorInfo = vendorsResponse.vendors.find((vendor: any) => 
            vendor.user._id === user._id || vendor.user === user._id
          );
          
          return {
            ...user,
            vendorInfo: vendorInfo ? {
              _id: vendorInfo._id,
              storeName: vendorInfo.storeName,
              storeDescription: vendorInfo.storeDescription,
              status: vendorInfo.status,
              verification: vendorInfo.verification,
              stats: vendorInfo.stats || { totalProducts: 0, totalOrders: 0 }
            } : undefined
          };
        });
        
        setUsers(usersWithVendorInfo);
        setVendors(vendorsResponse.vendors);
      } catch (error: any) {
        console.error("Error fetching data:", error.response || error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  // Vendor management functions
  const handleVendorStatusUpdate = async (vendorId: string, newStatus: string) => {
    try {
      setUpdatingVendor(vendorId);
      await updateVendorStatus(vendorId, newStatus);
      
      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.vendorInfo?._id === vendorId) {
          return {
            ...user,
            vendorInfo: {
              ...user.vendorInfo,
              status: newStatus as any
            }
          };
        }
        return user;
      }));

      toast({
        title: "Vendor Status Updated",
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
      setUpdatingVendor(null);
    }
  };

  const handleVendorDetailClick = (user: User) => {
    if (user.vendorInfo) {
      setSelectedVendor({
        ...user.vendorInfo,
        user: { name: user.name, email: user.email }
      });
      setIsVendorDetailDialogOpen(true);
    }
  };

  const handleEditClick = (user: User) => {
    console.log("Edit clicked for user:", user);
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    setIsLoading(true);

    try {
      console.log("Updating user:", selectedUser._id, editForm);

      const response = await api.put(`/users/${selectedUser._id}`, editForm);

      console.log("Update response:", response.data);

      setUsers(users.map(user => 
        user._id === selectedUser._id ? response.data : user
      ));

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating user:", error.response || error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setSelectedUserId(userId);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsLoading(true);

    try {
      console.log("Attempting to delete user:", selectedUser._id);

      await api.delete(`/users/${selectedUser._id}`);

      setUsers(users.filter(user => user._id !== selectedUser._id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error.response || error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    // Validation
    if (!newUser.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(newUser.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (newUser.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending new user data:", newUser);

      const response = await api.post('/users', newUser);
      
      console.log("Server response:", response.data);
      
      setUsers([...users, response.data]);
      setIsAddDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active'
      });
      
      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error: any) {
      console.error("Error adding user:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to add user";
      
      // If unauthorized or forbidden, redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Please log in again as admin",
          variant: "destructive",
        });
        // Redirect to login or handle auth error
        return;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Search and Role Filter
  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.vendorInfo?.storeName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesVendorStatus = vendorStatusFilter === 'all' || 
      (user.role === 'vendor' && user.vendorInfo?.status === vendorStatusFilter);
    
    return matchesSearch && matchesRole && matchesVendorStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>All Users & Vendors</CardTitle>
            <div className="flex gap-4 items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="vendor">Vendors</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              {roleFilter === 'vendor' && (
                <Select value={vendorStatusFilter} onValueChange={setVendorStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Vendor Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'user').length}
              </div>
              <div className="text-sm text-blue-600">Users</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'vendor').length}
              </div>
              <div className="text-sm text-purple-600">Vendors</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.role === 'vendor' && u.vendorInfo?.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-600">Pending Approval</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-green-600">Admins</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendor Info</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'admin' ? "default" : 
                      user.role === 'vendor' ? "secondary" : 
                      "outline"
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? "success" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'vendor' && user.vendorInfo ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Store className="h-3 w-3" />
                          <span className="text-sm font-medium">{user.vendorInfo.storeName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              user.vendorInfo.status === 'approved' ? 'default' :
                              user.vendorInfo.status === 'pending' ? 'secondary' :
                              'destructive'
                            }
                            className="text-xs"
                          >
                            {user.vendorInfo.status}
                          </Badge>
                          {user.vendorInfo.verification.isVerified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.vendorInfo.stats.totalProducts} products • {user.vendorInfo.stats.totalOrders} orders
                        </div>
                      </div>
                    ) : user.role === 'vendor' ? (
                      <span className="text-sm text-muted-foreground">No vendor profile</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.lastLogin ? user.lastLogin : "N/A"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {user.role === 'vendor' && user.vendorInfo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVendorDetailClick(user)}
                        disabled={isLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user._id)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent variant="popup">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the specified details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@example.com"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={isLoading || !newUser.name || !newUser.email || !newUser.password}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Adding...</span>
                </>
              ) : (
                'Add User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Detail Dialog */}
      <Dialog open={isVendorDetailDialogOpen} onOpenChange={setIsVendorDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {selectedVendor?.storeName}
            </DialogTitle>
            <DialogDescription>
              Vendor details and management
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              {/* Status and Actions */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={
                    selectedVendor.status === 'approved' ? 'default' :
                    selectedVendor.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {selectedVendor.status}
                  </Badge>
                  {selectedVendor.verification?.isVerified && (
                    <Badge variant="outline">Verified</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedVendor.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVendorStatusUpdate(selectedVendor._id, 'approved')}
                        disabled={updatingVendor === selectedVendor._id}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVendorStatusUpdate(selectedVendor._id, 'rejected')}
                        disabled={updatingVendor === selectedVendor._id}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedVendor.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleVendorStatusUpdate(selectedVendor._id, 'suspended')}
                      disabled={updatingVendor === selectedVendor._id}
                    >
                      Suspend
                    </Button>
                  )}
                  {selectedVendor.status === 'suspended' && (
                    <Button
                      size="sm"
                      onClick={() => handleVendorStatusUpdate(selectedVendor._id, 'approved')}
                      disabled={updatingVendor === selectedVendor._id}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>

              {/* Store Information */}
              <div>
                <h3 className="font-semibold mb-3">Store Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Description:</strong> {selectedVendor.storeDescription}</p>
                  <p><strong>Owner:</strong> {selectedVendor.user?.name} ({selectedVendor.user?.email})</p>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="font-semibold mb-3">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-2xl font-bold">{selectedVendor.stats?.totalProducts || 0}</p>
                    <p className="text-sm text-gray-500">Products</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-2xl font-bold">{selectedVendor.stats?.totalOrders || 0}</p>
                    <p className="text-sm text-gray-500">Orders</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVendorDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
