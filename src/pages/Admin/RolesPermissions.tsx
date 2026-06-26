import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { 
  Shield, 
  ShieldAlert, 
  Plus, 
  Check, 
  Save, 
  Info, 
  Users, 
  Lock, 
  HelpCircle,
  AlertTriangle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Role {
  _id: string;
  name: string;
  code: string;
  permissions: string[];
  isCustom: boolean;
}

interface Permission {
  code: string;
  name: string;
  module: string;
}

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom role creation state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [templateRoleCode, setTemplateRoleCode] = useState<string>('store_manager');
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const isPlatformAdminOrStoreOwner = user?.role === 'platform_admin' || user?.role === 'store_owner';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permRes] = await Promise.all([
        api.get('/staff/roles'),
        api.get('/staff/permissions')
      ]);
      
      setRoles(rolesRes.data);
      setPermissions(permRes.data);
      
      // Select the first role by default if none selected yet
      if (rolesRes.data.length > 0) {
        const defaultRole = rolesRes.data[0];
        setSelectedRole(defaultRole);
        setRolePermissions(defaultRole.permissions);
      }
    } catch (error) {
      console.error('Fetch roles & permissions error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch roles or permissions matrix.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions);
  };

  const handlePermissionToggle = (permCode: string) => {
    if (!isPlatformAdminOrStoreOwner) return;
    
    setRolePermissions(prev => {
      if (prev.includes('*') && permCode !== '*') {
        // If they have full access (*), toggling off a permission means removing '*' and adding all others except this one
        const allCodes = permissions.map(p => p.code).filter(c => c !== permCode);
        return allCodes;
      }
      
      if (prev.includes(permCode)) {
        return prev.filter(code => code !== permCode);
      } else {
        return [...prev, permCode];
      }
    });
  };

  const handleToggleAllInModule = (moduleName: string, checked: boolean) => {
    if (!isPlatformAdminOrStoreOwner) return;

    const modulePerms = permissions.filter(p => p.module === moduleName).map(p => p.code);
    
    setRolePermissions(prev => {
      let filtered = prev.filter(code => !modulePerms.includes(code) && code !== '*');
      if (checked) {
        return [...filtered, ...modulePerms];
      }
      return filtered;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || !isPlatformAdminOrStoreOwner) return;
    
    setIsSaving(true);
    try {
      await api.put(`/staff/roles/${selectedRole._id}`, {
        permissions: rolePermissions
      });
      
      toast({
        title: 'Success',
        description: `Permissions for "${selectedRole.name}" updated successfully.`
      });
      
      // Update local state
      setRoles(prev => prev.map(r => r._id === selectedRole._id ? { ...r, permissions: rolePermissions } : r));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save role permissions.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsCreatingRole(true);
    try {
      // Find template role permissions
      const templateRole = roles.find(r => r.code === templateRoleCode);
      const initialPermissions = templateRole ? templateRole.permissions : [];

      const res = await api.post('/staff/roles', {
        name: newRoleName.trim(),
        permissions: initialPermissions
      });

      toast({
        title: 'Success',
        description: `Custom role "${newRoleName}" created successfully.`
      });

      // Add to list and select it
      const createdRole = res.data;
      setRoles(prev => [...prev, createdRole]);
      setSelectedRole(createdRole);
      setRolePermissions(createdRole.permissions);
      
      // Reset form
      setNewRoleName('');
      setIsCreateOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create custom role.'
      });
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading access matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-bloom-dark">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Configure system capabilities and access levels for administrative staff, managers, and partners.
          </p>
        </div>
        {isPlatformAdminOrStoreOwner && (
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create Custom Role
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Roles list */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="subtle-shadow border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Roles Directory
              </CardTitle>
              <CardDescription>Select a role to configure or view its permission policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-3">
              {roles.map((role) => {
                const isSelected = selectedRole?._id === role._id;
                const isFullAccess = role.permissions.includes('*');
                return (
                  <button
                    key={role._id}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-bloom-dark flex items-center gap-2">
                        {role.name}
                        {role.isCustom && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Custom
                          </Badge>
                        )}
                        {!role.isCustom && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1 text-gray-500 bg-gray-50">
                            System
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {role.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                        {isFullAccess ? 'All' : role.permissions.length} perms
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Permission Matrix */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <Card className="subtle-shadow border-gray-100">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {selectedRole.name} Permissions Policy
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    Role Code: <code className="bg-slate-100 px-1 rounded font-mono text-xs">{selectedRole.code}</code>
                  </CardDescription>
                </div>
                
                {isPlatformAdminOrStoreOwner ? (
                  <Button 
                    onClick={handleSavePermissions}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Policy'}
                  </Button>
                ) : (
                  <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> View Only
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-6 space-y-6 max-h-[600px] overflow-y-auto">
                {selectedRole.code === 'platform_admin' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Superuser Administration Access</p>
                      <p className="text-sm text-emerald-700 mt-0.5">
                        Platform Admins hold full wildcard (`*`) access across all modules. These permissions are hardcoded on the backend and cannot be restricted.
                      </p>
                    </div>
                  </div>
                )}

                {!isPlatformAdminOrStoreOwner && (
                  <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-3 flex items-start gap-2 text-sm">
                    <Info className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                    <p>
                      You are in view-only mode. Modifying permissions requires Platform Admin or Store Owner privileges.
                    </p>
                  </div>
                )}

                {selectedRole.code !== 'platform_admin' && Object.entries(permissionsByModule).map(([moduleName, modulePerms]) => {
                  const activeInModule = modulePerms.filter(p => rolePermissions.includes(p.code) || rolePermissions.includes('*'));
                  const isAllChecked = activeInModule.length === modulePerms.length;
                  const isSomeChecked = activeInModule.length > 0 && activeInModule.length < modulePerms.length;

                  return (
                    <div key={moduleName} className="border rounded-lg overflow-hidden border-gray-100">
                      <div className="bg-gray-50/70 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-bloom-dark">{moduleName} Module</h3>
                        
                        {isPlatformAdminOrStoreOwner && (
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`all-${moduleName}`}
                              checked={isAllChecked}
                              ref={(el) => {
                                if (el) {
                                  // @ts-ignore
                                  el.indeterminate = isSomeChecked;
                                }
                              }}
                              onCheckedChange={(checked) => handleToggleAllInModule(moduleName, !!checked)}
                            />
                            <Label htmlFor={`all-${moduleName}`} className="text-xs text-muted-foreground cursor-pointer select-none">
                              Select All
                            </Label>
                          </div>
                        )}
                      </div>
                      <div className="divide-y divide-gray-50 px-4">
                        {modulePerms.map((perm) => {
                          const isChecked = rolePermissions.includes(perm.code) || rolePermissions.includes('*');
                          return (
                            <div key={perm.code} className="py-3 flex items-start justify-between gap-4">
                              <div className="space-y-0.5">
                                <div className="text-sm font-medium text-bloom-dark flex items-center gap-2">
                                  {perm.name}
                                  <code className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-1 rounded">
                                    {perm.code}
                                  </code>
                                </div>
                              </div>
                              <div className="pt-0.5">
                                <Checkbox 
                                  checked={isChecked}
                                  disabled={!isPlatformAdminOrStoreOwner || selectedRole.code === 'platform_admin'}
                                  onCheckedChange={() => handlePermissionToggle(perm.code)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-8 bg-slate-50 border border-dashed rounded-lg">
              <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Select a role from the list to display details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Custom Role Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateRole}>
            <DialogHeader>
              <DialogTitle>Create Custom Staff Role</DialogTitle>
              <DialogDescription>
                Name a custom role and choose a starting template role. Its initial permission policy will match the template.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input 
                  id="roleName" 
                  placeholder="e.g. Night Manager, Dispatch Supervisor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template">Cloning Base Template</Label>
                <Select value={templateRoleCode} onValueChange={setTemplateRoleCode}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select template role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreatingRole}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreatingRole || !newRoleName.trim()}
                className="bg-primary text-white hover:bg-primary/95"
              >
                {isCreatingRole ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPermissions;
