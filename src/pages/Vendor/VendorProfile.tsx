import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Store,
    Phone,
    Mail,
    MapPin,
    Edit,
    Save,
    X,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Building2,
    Globe,
    RefreshCw,
} from 'lucide-react';
import { getVendorProfile, updateVendorProfile, VendorProfile as VendorProfileType } from '@/services/vendorService';
import { useToast } from '@/hooks/use-toast';

const VendorProfile: React.FC = () => {
    const [profile, setProfile] = useState<VendorProfileType | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Editable form state
    const [formData, setFormData] = useState({
        storeName: '',
        storeDescription: '',
        contactPhone: '',
        contactEmail: '',
        contactWebsite: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getVendorProfile();
            const vendor = data.vendor;
            setProfile(vendor);
            setFormData({
                storeName: vendor.storeName || '',
                storeDescription: vendor.storeDescription || '',
                contactPhone: vendor.contactInfo?.phone || '',
                contactEmail: vendor.contactInfo?.email || '',
                contactWebsite: vendor.contactInfo?.website || '',
                street: vendor.storeAddress?.street || '',
                city: vendor.storeAddress?.city || '',
                state: vendor.storeAddress?.state || '',
                zipCode: vendor.storeAddress?.zipCode || '',
                country: vendor.storeAddress?.country || '',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to load vendor profile.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateVendorProfile({
                storeName: formData.storeName,
                storeDescription: formData.storeDescription,
                contactInfo: {
                    phone: formData.contactPhone,
                    email: formData.contactEmail,
                    website: formData.contactWebsite,
                },
                storeAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                },
            });
            toast({
                title: 'Profile Updated',
                description: 'Your vendor profile has been updated successfully.',
            });
            setEditing(false);
            fetchProfile(); // Refresh data
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error?.message || 'Could not update your profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                storeName: profile.storeName || '',
                storeDescription: profile.storeDescription || '',
                contactPhone: profile.contactInfo?.phone || '',
                contactEmail: profile.contactInfo?.email || '',
                contactWebsite: profile.contactInfo?.website || '',
                street: profile.storeAddress?.street || '',
                city: profile.storeAddress?.city || '',
                state: profile.storeAddress?.state || '',
                zipCode: profile.storeAddress?.zipCode || '',
                country: profile.storeAddress?.country || '',
            });
        }
        setEditing(false);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return { icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' };
            case 'pending':
                return { icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' };
            case 'suspended':
                return { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200', label: 'Suspended' };
            case 'rejected':
                return { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' };
            default:
                return { icon: AlertTriangle, className: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No vendor profile found.</p>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(profile.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendor Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your store information and contact details</p>
                </div>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel} disabled={saving}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setEditing(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className={statusConfig.className}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {statusConfig.label}
                        </Badge>
                        {profile.verification?.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verified
                            </Badge>
                        )}
                        <Badge variant="outline">
                            {profile.subscription?.plan || 'Free'} Plan
                        </Badge>
                        <span className="text-sm text-gray-500">
                            Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Store Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Store Information
                    </CardTitle>
                    <CardDescription>Your public store identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="storeName">Store Name</Label>
                        {editing ? (
                            <Input
                                id="storeName"
                                value={formData.storeName}
                                onChange={(e) => handleInputChange('storeName', e.target.value)}
                            />
                        ) : (
                            <p className="text-gray-900 font-medium">{profile.storeName}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="storeDescription">Store Description</Label>
                        {editing ? (
                            <Textarea
                                id="storeDescription"
                                value={formData.storeDescription}
                                onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                                rows={3}
                            />
                        ) : (
                            <p className="text-gray-700">{profile.storeDescription || 'No description provided'}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contact Information
                    </CardTitle>
                    <CardDescription>How customers and the platform can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">
                                <Phone className="h-3 w-3 inline mr-1" />
                                Phone
                            </Label>
                            {editing ? (
                                <Input
                                    id="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.contactInfo?.phone || 'Not provided'}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">
                                <Mail className="h-3 w-3 inline mr-1" />
                                Email
                            </Label>
                            {editing ? (
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                />
                            ) : (
                                <p className="text-gray-900">{profile.contactInfo?.email || 'Not provided'}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactWebsite">
                            <Globe className="h-3 w-3 inline mr-1" />
                            Website
                        </Label>
                        {editing ? (
                            <Input
                                id="contactWebsite"
                                value={formData.contactWebsite}
                                onChange={(e) => handleInputChange('contactWebsite', e.target.value)}
                                placeholder="https://..."
                            />
                        ) : (
                            <p className="text-gray-900">{profile.contactInfo?.website || 'Not provided'}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Store Address
                    </CardTitle>
                    <CardDescription>Your physical store location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {editing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="street">Street Address</Label>
                                <Input
                                    id="street"
                                    value={formData.street}
                                    onChange={(e) => handleInputChange('street', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-900">
                            {profile.storeAddress ? (
                                <div className="space-y-1">
                                    {profile.storeAddress.street && <p>{profile.storeAddress.street}</p>}
                                    <p>
                                        {[
                                            profile.storeAddress.city,
                                            profile.storeAddress.state,
                                            profile.storeAddress.zipCode,
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                    {profile.storeAddress.country && <p>{profile.storeAddress.country}</p>}
                                </div>
                            ) : (
                                <p className="text-gray-500">No address provided</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Business Information (Read-only) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Business Information
                    </CardTitle>
                    <CardDescription>Your business registration details (contact support to update)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Business Type</p>
                            <p className="font-medium capitalize">{profile.businessInfo?.businessType || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Registration Number</p>
                            <p className="font-medium">{profile.businessInfo?.registrationNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tax ID</p>
                            <p className="font-medium">{profile.businessInfo?.taxId || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Commission Rate</p>
                            <p className="font-medium">{profile.commission?.rate || 0}% ({profile.commission?.type || 'percentage'})</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Summary (Read-only) */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-700">{profile.analytics?.totalProducts || 0}</p>
                            <p className="text-sm text-blue-600">Products</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-700">{profile.analytics?.totalOrders || 0}</p>
                            <p className="text-sm text-green-600">Orders</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-700">₹{(profile.analytics?.totalRevenue || 0).toLocaleString()}</p>
                            <p className="text-sm text-purple-600">Revenue</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-700">₹{(profile.analytics?.totalCommissionPaid || 0).toLocaleString()}</p>
                            <p className="text-sm text-orange-600">Commission Paid</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VendorProfile;
