import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';

interface VendorFormData {
  userId?: string;
  storeName: string;
  storeDescription: string;
  storeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  businessInfo: {
    registrationNumber?: string;
    taxId?: string;
    businessType: 'individual' | 'partnership' | 'llc' | 'corporation';
  };
  bankDetails: {
    accountNumber?: string;
    routingNumber?: string;
    accountHolderName?: string;
    bankName?: string;
    upiId?: string;
  };
  commission?: {
    rate: number;
    type: 'percentage' | 'fixed';
  };
}

interface VendorFormProps {
  vendor?: any;
  onSubmit: (data: VendorFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const VendorForm: React.FC<VendorFormProps> = ({ vendor, onSubmit, onCancel, isEdit = false }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VendorFormData>({
    userId: vendor?.user?._id || '',
    storeName: vendor?.storeName || '',
    storeDescription: vendor?.storeDescription || '',
    storeAddress: {
      street: vendor?.storeAddress?.street || '',
      city: vendor?.storeAddress?.city || '',
      state: vendor?.storeAddress?.state || '',
      zipCode: vendor?.storeAddress?.zipCode || '',
      country: vendor?.storeAddress?.country || 'India',
    },
    contactInfo: {
      phone: vendor?.contactInfo?.phone || '',
      email: vendor?.contactInfo?.email || '',
      website: vendor?.contactInfo?.website || '',
    },
    businessInfo: {
      registrationNumber: vendor?.businessInfo?.registrationNumber || '',
      taxId: vendor?.businessInfo?.taxId || '',
      businessType: vendor?.businessInfo?.businessType || 'individual',
    },
    bankDetails: {
      accountNumber: vendor?.bankDetails?.accountNumber || '',
      routingNumber: vendor?.bankDetails?.routingNumber || '',
      accountHolderName: vendor?.bankDetails?.accountHolderName || '',
      bankName: vendor?.bankDetails?.bankName || '',
      upiId: vendor?.bankDetails?.upiId || '',
    },
    commission: {
      rate: vendor?.commission?.rate || 10,
      type: vendor?.commission?.type || 'percentage',
    },
  });

  const handleChange = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0] as keyof VendorFormData] as any),
          [keys[1]]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.storeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Store name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.storeDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Store description is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.contactInfo.email.trim() || !formData.contactInfo.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Contact email and phone are required",
        variant: "destructive",
      });
      return;
    }

    if (!isEdit && !formData.userId) {
      toast({
        title: "Validation Error",
        description: "User ID is required for creating a new vendor",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      toast({
        title: "Success",
        description: `Vendor ${isEdit ? 'updated' : 'created'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} vendor`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEdit && (
            <div>
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => handleChange('userId', e.target.value)}
                placeholder="Enter user ID"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                The user ID must exist in the system
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              value={formData.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              placeholder="Enter store name"
              required
            />
          </div>

          <div>
            <Label htmlFor="storeDescription">Store Description *</Label>
            <Textarea
              id="storeDescription"
              value={formData.storeDescription}
              onChange={(e) => handleChange('storeDescription', e.target.value)}
              placeholder="Describe the store and its offerings"
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleChange('contactInfo.email', e.target.value)}
                placeholder="vendor@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Phone *</Label>
              <Input
                id="contactPhone"
                value={formData.contactInfo.phone}
                onChange={(e) => handleChange('contactInfo.phone', e.target.value)}
                placeholder="+91 1234567890"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="contactWebsite">Website</Label>
              <Input
                id="contactWebsite"
                value={formData.contactInfo.website}
                onChange={(e) => handleChange('contactInfo.website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Store Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.storeAddress.street}
              onChange={(e) => handleChange('storeAddress.street', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.storeAddress.city}
                onChange={(e) => handleChange('storeAddress.city', e.target.value)}
                placeholder="Mumbai"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.storeAddress.state}
                onChange={(e) => handleChange('storeAddress.state', e.target.value)}
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <Label htmlFor="zipCode">Zip/Postal Code</Label>
              <Input
                id="zipCode"
                value={formData.storeAddress.zipCode}
                onChange={(e) => handleChange('storeAddress.zipCode', e.target.value)}
                placeholder="400001"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.storeAddress.country}
                onChange={(e) => handleChange('storeAddress.country', e.target.value)}
                placeholder="India"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Select 
              value={formData.businessInfo.businessType}
              onValueChange={(value) => handleChange('businessInfo.businessType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="llc">LLC</SelectItem>
                <SelectItem value="corporation">Corporation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.businessInfo.registrationNumber}
                onChange={(e) => handleChange('businessInfo.registrationNumber', e.target.value)}
                placeholder="Business registration number"
              />
            </div>

            <div>
              <Label htmlFor="taxId">Tax ID / GST Number</Label>
              <Input
                id="taxId"
                value={formData.businessInfo.taxId}
                onChange={(e) => handleChange('businessInfo.taxId', e.target.value)}
                placeholder="GST or tax identification number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle>Banking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={(e) => handleChange('bankDetails.accountHolderName', e.target.value)}
                placeholder="Full name as per bank"
              />
            </div>

            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankDetails.bankName}
                onChange={(e) => handleChange('bankDetails.bankName', e.target.value)}
                placeholder="Bank name"
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => handleChange('bankDetails.accountNumber', e.target.value)}
                placeholder="Bank account number"
              />
            </div>

            <div>
              <Label htmlFor="routingNumber">IFSC Code</Label>
              <Input
                id="routingNumber"
                value={formData.bankDetails.routingNumber}
                onChange={(e) => handleChange('bankDetails.routingNumber', e.target.value)}
                placeholder="IFSC code"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                value={formData.bankDetails.upiId}
                onChange={(e) => handleChange('bankDetails.upiId', e.target.value)}
                placeholder="vendor@upi"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Information */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commissionType">Commission Type</Label>
              <Select 
                value={formData.commission?.type}
                onValueChange={(value) => handleChange('commission.type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="commissionRate">
                Commission Rate {formData.commission?.type === 'percentage' ? '(%)' : '(₹)'}
              </Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.commission?.rate}
                onChange={(e) => handleChange('commission.rate', parseFloat(e.target.value))}
                placeholder={formData.commission?.type === 'percentage' ? '10' : '100'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Vendor' : 'Create Vendor'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;
