import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Tag, Upload, X, Image as ImageIcon } from 'lucide-react';
import { 
  getAllPromoCodes, 
  createPromoCode, 
  updatePromoCode,
  deletePromoCode,
  type PromoCode
} from '@/services/promoCodeService';
import { uploadImage } from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';

const PromoCodesPage: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minimumOrderAmount: 0,
    validUntil: '',
    image: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await getAllPromoCodes({ limit: 50 });
      setPromoCodes(response.data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch promo codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);

      const response = await uploadImage(uploadFormData);
      
      if (response.success && response.data?.url) {
        return response.data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const clearImageSelection = () => {
    setSelectedFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumOrderAmount: 0,
      validUntil: '',
      image: ''
    });
    clearImageSelection();
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (selectedFile) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const promoCodeData = {
        ...formData,
        image: imageUrl
      };

      const response = await createPromoCode(promoCodeData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Promo code created successfully"
        });
        
        setShowCreateForm(false);
        resetForm();
        fetchPromoCodes();
      }
    } catch (error: any) {
      console.error('Error creating promo code:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to create promo code',
        variant: "destructive"
      });
    }
  };

  const handleEditPromoCode = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      minimumOrderAmount: promoCode.minimumOrderAmount || 0,
      validUntil: new Date(promoCode.validUntil).toISOString().split('T')[0],
      image: (promoCode as any).image || ''
    });
    
    // Set image preview if exists
    if ((promoCode as any).image) {
      setImagePreview((promoCode as any).image);
    }
    
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  const handleUpdatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPromoCode) return;
    
    try {
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (selectedFile) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const promoCodeData = {
        ...formData,
        image: imageUrl
      };

      const response = await updatePromoCode(editingPromoCode._id, promoCodeData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Promo code updated successfully"
        });
        
        setShowEditForm(false);
        setEditingPromoCode(null);
        resetForm();
        fetchPromoCodes();
      }
    } catch (error: any) {
      console.error('Error updating promo code:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to update promo code',
        variant: "destructive"
      });
    }
  };

  const handleDeletePromoCode = async (promoCode: PromoCode) => {
    if (!confirm(`Are you sure you want to delete promo code "${promoCode.code}"?`)) {
      return;
    }

    try {
      await deletePromoCode(promoCode._id);
      
      toast({
        title: "Success",
        description: "Promo code deleted successfully"
      });
      
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error deleting promo code:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to delete promo code',
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (promoCode: PromoCode) => {
    const now = new Date();
    const validUntil = new Date(promoCode.validUntil);
    
    if (!promoCode.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  const formatDiscount = (promoCode: PromoCode) => {
    if (promoCode.discountType === 'percentage') {
      return `${promoCode.discountValue}% OFF`;
    } else {
      return `₹${promoCode.discountValue} OFF`;
    }
  };

  const ImageUploadSection = () => (
    <div>
      <label className="block text-sm font-medium mb-2">Promo Code Image</label>
      <div className="space-y-4">
        {/* Image Preview */}
        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Promo code preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={clearImageSelection}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* File Input */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </>
            )}
          </Button>
          {selectedFile && (
            <span className="text-sm text-gray-600">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF. Max size: 5MB. Recommended size: 400x200px
        </p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground">Manage promotional codes and discounts</p>
        </div>
        
        <Button 
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setShowEditForm(false);
            setEditingPromoCode(null);
            resetForm();
          }}
          disabled={showEditForm}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Promo Code
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Promo Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePromoCode} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Promo Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., SAVE20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type *</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value as 'percentage' | 'fixed'})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this promo code..."
                  required
                />
              </div>

              {/* Image Upload Section */}
              <ImageUploadSection />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                    min="0"
                    max={formData.discountType === 'percentage' ? "100" : undefined}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Order Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({...formData, minimumOrderAmount: parseFloat(e.target.value) || 0})}
                    min="0"
                    placeholder="0 = No minimum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valid Until *</label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Creating...' : 'Create Promo Code'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {showEditForm && editingPromoCode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Promo Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePromoCode} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Promo Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., SAVE20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type *</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value as 'percentage' | 'fixed'})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this promo code..."
                  required
                />
              </div>

              {/* Image Upload Section */}
              <ImageUploadSection />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                    min="0"
                    max={formData.discountType === 'percentage' ? "100" : undefined}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Order Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({...formData, minimumOrderAmount: parseFloat(e.target.value) || 0})}
                    min="0"
                    placeholder="0 = No minimum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valid Until *</label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Updating...' : 'Update Promo Code'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPromoCode(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promo Codes List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading promo codes...</div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No promo codes found. Create your first promo code!
          </div>
        ) : (
          promoCodes.map((promoCode) => (
            <Card key={promoCode._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      {/* Promo Code Image */}
                      {(promoCode as any).image && (
                        <div className="flex-shrink-0">
                          <img
                            src={(promoCode as any).image}
                            alt={`${promoCode.code} promo`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{promoCode.code}</h3>
                          {getStatusBadge(promoCode)}
                          <Badge variant="outline">
                            {formatDiscount(promoCode)}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{promoCode.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Used</p>
                        <p className="font-medium">
                          {promoCode.usedCount}
                          {promoCode.usageLimit && ` / ${promoCode.usageLimit}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min Order</p>
                        <p className="font-medium">
                          {promoCode.minimumOrderAmount > 0 ? `₹${promoCode.minimumOrderAmount}` : 'None'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valid Until</p>
                        <p className="font-medium">
                          {new Date(promoCode.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {new Date(promoCode.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPromoCode(promoCode)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePromoCode(promoCode)}
                      disabled={promoCode.usedCount > 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PromoCodesPage; 