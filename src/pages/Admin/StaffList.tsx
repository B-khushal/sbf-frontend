import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Edit, Trash2, Eye, Key, Ban, UserCheck, ShieldAlert, Award, FileText, UploadCloud, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  employeeId?: string;
  staffCode?: string;
  status: 'active' | 'inactive' | 'suspended';
  assigned_store?: { _id: string; name: string } | null;
  assigned_zone?: { _id: string; name: string } | null;
  permissions?: string[];
  photoURL?: string;
  lastLogin?: string;
}

interface Zone {
  _id: string;
  name: string;
}

const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [docDetails, setDocDetails] = useState<any>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: '' as 'active' | 'inactive' | 'suspended',
    assigned_store: '',
    assigned_zone: '',
    permissions: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Fetch staff error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to retrieve employee directory'
      });
    }

    try {
      const zonesResponse = await api.get('/delivery/admin/zones');
      // API returns { success, zones: [...] }
      const zonesData = zonesResponse.data?.zones || zonesResponse.data;
      setZones(Array.isArray(zonesData) ? zonesData : []);
    } catch (error) {
      console.error('Fetch zones error:', error);
      setZones([]);
    }

    try {
      const rolesResponse = await api.get('/staff/roles');
      setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
    } catch (error) {
      console.error('Fetch roles error:', error);
      setRoles([]);
    }

    try {
      const storesResponse = await api.get('/staff/stores');
      setStores(Array.isArray(storesResponse.data) ? storesResponse.data : []);
    } catch (error) {
      console.error('Fetch stores error:', error);
      setStores([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleEditSelectChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      await api.put(`/staff/${selectedStaff._id}`, editForm);
      toast({ title: 'Success', description: 'Employee profile updated' });
      setIsEditDialogOpen(false);
      fetchStaffData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update employee'
      });
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    try {
      await api.delete(`/staff/${selectedStaff._id}`);
      toast({ title: 'Success', description: 'Employee profile removed' });
      setIsDeleteDialogOpen(false);
      fetchStaffData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete staff member'
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      // Modify user password directly through backend endpoint
      await api.put(`/staff/${selectedStaff._id}`, { password: newPassword });
      toast({ title: 'Success', description: 'Password reset successfully' });
      setIsPasswordDialogOpen(false);
      setNewPassword('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reset employee password'
      });
    }
  };

  const handleStatusToggle = async (member: StaffMember, newStatus: 'active' | 'suspended') => {
    try {
      await api.put(`/staff/${member._id}`, { status: newStatus });
      toast({ title: 'Success', description: `Employee account is now ${newStatus}` });
      fetchStaffData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update employee status'
      });
    }
  };

  const viewStaffDocs = async (member: StaffMember) => {
    setSelectedStaff(member);
    setIsViewDialogOpen(true);
    if (member.role === 'delivery_partner') {
      setLoadingDocs(true);
      try {
        const response = await api.get(`/staff/delivery-partners/${member._id}/docs`);
        setDocDetails(response.data);
      } catch (error) {
        console.error('Failed to load driver docs:', error);
      } finally {
        setLoadingDocs(false);
      }
    } else {
      setDocDetails(null);
    }
  };

  const handleVerifyDocs = async (status: 'verified' | 'rejected') => {
    if (!selectedStaff || !docDetails) return;
    try {
      await api.put(`/staff/delivery-partners/${selectedStaff._id}/verify-docs`, {
        verificationStatus: status
      });
      toast({ title: 'Success', description: `Driver documents marked as ${status}` });
      setIsViewDialogOpen(false);
      fetchStaffData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to verify driver documentation'
      });
    }
  };

  const openEditDialog = (member: StaffMember) => {
    setSelectedStaff(member);
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      status: member.status,
      assigned_store: member.assigned_store?._id || '',
      assigned_zone: member.assigned_zone?._id || '',
      permissions: member.permissions || []
    });
    setIsEditDialogOpen(true);
  };

  // Filtered staff list
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.employeeId && member.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (member.staffCode && member.staffCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesStore = storeFilter === 'all' || member.assigned_store?._id === storeFilter;
    const matchesZone = zoneFilter === 'all' || member.assigned_zone?._id === zoneFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesStore && matchesZone;
  });

  const getRoleLabel = (role: string) => {
    const roleObj = roles.find(r => r.code === role);
    return roleObj ? roleObj.name : role.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-bloom-dark">Staff Directory</h1>
          <p className="text-muted-foreground">Manage administrative roles, store managers, and delivery partners.</p>
        </div>
        <Button onClick={() => navigate('/admin/staff/add')} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className="subtle-shadow border-gray-100">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff ID, code, name..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(r => (
                  <SelectItem key={r._id} value={r.code}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map(s => (
                  <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Delivery Zones</SelectItem>
                {zones.map(z => (
                  <SelectItem key={z._id} value={z._id}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card className="subtle-shadow border-gray-100 overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Staff Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email/Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Store Hub</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      Loading employee records...
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No staff members match the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map(member => (
                    <TableRow key={member._id} className="hover:bg-gray-50/30">
                      <TableCell className="font-semibold text-gray-700">{member.employeeId || 'N/A'}</TableCell>
                      <TableCell>{member.staffCode || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={member.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60'}
                            alt={member.name}
                            className="h-9 w-9 rounded-full object-cover border border-gray-100"
                          />
                          <span className="font-medium text-gray-900">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-gray-900">{member.email}</p>
                          <p className="text-muted-foreground">{member.phone || 'No phone'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize bg-slate-50 text-slate-700 border-slate-200">
                          {getRoleLabel(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{member.assigned_store?.name || 'Unassigned'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "capitalize font-semibold",
                            member.status === 'active' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                            member.status === 'suspended' ? "bg-rose-500/10 text-rose-700 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-700 border-amber-500/20"
                          )}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never logged in'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => viewStaffDocs(member)} title="View Employee details">
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)} title="Edit settings">
                            <Edit className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedStaff(member); setIsPasswordDialogOpen(true); }} title="Reset Password">
                            <Key className="h-4 w-4 text-amber-600" />
                          </Button>
                          {member.status === 'active' ? (
                            <Button variant="ghost" size="icon" onClick={() => handleStatusToggle(member, 'suspended')} title="Suspend Account">
                              <Ban className="h-4 w-4 text-rose-600" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleStatusToggle(member, 'active')} title="Activate Account">
                              <UserCheck className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedStaff(member); setIsDeleteDialogOpen(true); }} title="Delete Employee">
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>



      {/* EDIT STAFF DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
            <DialogDescription>Modify access role, zone, or store assignments for this staff member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStaff} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="edit-email">Email Address</Label>
              <Input id="edit-email" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} required />
            </div>
            <div>
              <Label>Account Role</Label>
              <Select value={editForm.role} onValueChange={v => handleEditSelectChange('role', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r._id} value={r.code}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned Store</Label>
              <Select value={editForm.assigned_store || 'none'} onValueChange={v => handleEditSelectChange('assigned_store', v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned / Global</SelectItem>
                  {stores.map(s => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned Zone</Label>
              <Select value={editForm.assigned_zone || 'none'} onValueChange={v => handleEditSelectChange('assigned_zone', v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Zone Assignment</SelectItem>
                  {zones.map(z => (
                    <SelectItem key={z._id} value={z._id}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW DETAILS & DOCUMENTS DIALOG */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile Overview</DialogTitle>
            <DialogDescription>Full profile details and document status check.</DialogDescription>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 border-b pb-4">
                <img
                  src={selectedStaff.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                  alt={selectedStaff.name}
                  className="h-16 w-16 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h3>
                  <p className="text-sm text-muted-foreground">{getRoleLabel(selectedStaff.role)} • {selectedStaff.employeeId || 'N/A'}</p>
                  <Badge variant="outline" className="mt-1 capitalize bg-primary/5 text-primary border-primary/20">
                    {selectedStaff.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-500">Email Address</span>
                  <p className="font-medium text-gray-900">{selectedStaff.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Phone Number</span>
                  <p className="font-medium text-gray-900">{selectedStaff.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Assigned Store</span>
                  <p className="font-medium text-gray-900">{selectedStaff.assigned_store?.name || 'Global / Unassigned'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Delivery Zone</span>
                  <p className="font-medium text-gray-900">{selectedStaff.assigned_zone?.name || 'No Zone Assignment'}</p>
                </div>
              </div>

              {selectedStaff.role === 'delivery_partner' && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-bold text-bloom-dark mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Driver Documents Verification
                  </h4>

                  {loadingDocs ? (
                    <p className="text-sm text-center text-muted-foreground py-4">Fetching verification documents...</p>
                  ) : !docDetails ? (
                    <p className="text-sm text-muted-foreground py-2 bg-slate-50 text-center rounded border">No documents uploaded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Aadhaar Identity</p>
                          <p className="text-sm font-medium">{docDetails.aadhaarNumber || 'Not provided'}</p>
                        </div>
                        {docDetails.aadhaarFileUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(docDetails.aadhaarFileUrl, '_blank')}>View File</Button>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Permanent Account Number (PAN)</p>
                          <p className="text-sm font-medium">{docDetails.panNumber || 'Not provided'}</p>
                        </div>
                        {docDetails.panFileUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(docDetails.panFileUrl, '_blank')}>View File</Button>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Driving License</p>
                          <p className="text-sm font-medium">{docDetails.licenseNumber || 'Not provided'}</p>
                        </div>
                        {docDetails.licenseFileUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(docDetails.licenseFileUrl, '_blank')}>View File</Button>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Vehicle RC Number</p>
                          <p className="text-sm font-medium">{docDetails.vehicleRcNumber || 'Not provided'}</p>
                        </div>
                        {docDetails.vehicleRcFileUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(docDetails.vehicleRcFileUrl, '_blank')}>View File</Button>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Bank Details</p>
                          <p className="text-xs text-gray-700">Holder: {docDetails.bankAccountHolder || 'N/A'}</p>
                          <p className="text-sm font-medium">A/C: {docDetails.bankAccountNumber || 'N/A'} • IFSC: {docDetails.bankIfscCode || 'N/A'}</p>
                        </div>
                        {docDetails.bankDetailsFileUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(docDetails.bankDetailsFileUrl, '_blank')}>View File</Button>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">Verification:</span>
                          <Badge className="capitalize">
                            {docDetails.verificationStatus}
                          </Badge>
                        </div>

                        {docDetails.verificationStatus === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="destructive" onClick={() => handleVerifyDocs('rejected')} className="flex items-center gap-1">
                              <X className="h-3 w-3" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => handleVerifyDocs('verified')} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                              <Check className="h-3 w-3" /> Approve & Verify
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <Button onClick={() => setIsViewDialogOpen(false)}>Close Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RESET PASSWORD DIALOG */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Employee Password</DialogTitle>
            <DialogDescription>Input a new default password for this staff member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="new-pass">New Password</Label>
              <Input id="new-pass" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Reset Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this employee account from the system. If they are a delivery partner, their driving documents and earnings logs will also be archived. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-rose-600 text-white hover:bg-rose-700">Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StaffList;
