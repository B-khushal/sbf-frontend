import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Power, Tag, Percent, Calendar, Check, Copy, Sparkles, Layers } from 'lucide-react';
import {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  type PromoCode,
} from '@/services/promoCodeService';
import { uploadImage } from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const gradientOptions = [
  { name: 'Sunrise Rose', value: 'linear-gradient(to right, #ff9966, #ff5e62)' },
  { name: 'Emerald Ocean', value: 'linear-gradient(to right, #43cea2, #185a9d)' },
  { name: 'Grapefruit Glow', value: 'linear-gradient(to right, #ffc0cb, #f3a683)' },
  { name: 'Peachy Floral', value: 'linear-gradient(to right, #ffecd2, #fcb69f)' },
  { name: 'Sky Lavender', value: 'linear-gradient(to right, #a1c4fd, #c2e9fb)' },
  { name: 'Lush Mint', value: 'linear-gradient(to right, #56ab2f, #a8e063)' },
  { name: 'Royal Velvet', value: 'linear-gradient(to right, #8e44ad, #c0392b)' },
  { name: 'Sunset Amber', value: 'linear-gradient(to right, #ff7e5f, #feb47b)' },
  { name: 'Classic Clean', value: '#ffffff' },
];

export const PromoCodes: React.FC = () => {
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
    image: '',
    background: '#ffffff',
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        title: 'Error',
        description: 'Failed to fetch promo codes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
      image: '',
      background: '#ffffff',
      isActive: true,
    });
    setSelectedFile(null);
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image;
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedFile);
        const response = await uploadImage(uploadFormData);
        imageUrl = response.imageUrl;
      }

      const promoCodeData = {
        ...formData,
        image: imageUrl,
        isActive: formData.isActive !== false,
      };

      const response = await createPromoCode(promoCodeData);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Promo code created successfully',
        });
        setShowCreateForm(false);
        resetForm();
        fetchPromoCodes();
      }
    } catch (error: any) {
      console.error('Error creating promo code:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create promo code',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditPromoCode = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      minimumOrderAmount: promoCode.minimumOrderAmount,
      validUntil: promoCode.validUntil
        ? new Date(promoCode.validUntil).toISOString().split('T')[0]
        : '',
      image: (promoCode as any).image || '',
      background: (promoCode as any).background || '#ffffff',
      isActive: promoCode.isActive !== false,
    });
    setSelectedFile(null);
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  const handleUpdatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromoCode) return;
    setUploading(true);

    try {
      let imageUrl = formData.image;
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedFile);
        const response = await uploadImage(uploadFormData);
        imageUrl = response.imageUrl;
      }

      const promoCodeData = {
        ...formData,
        image: imageUrl,
        isActive: formData.isActive !== false,
      };

      const response = await updatePromoCode(
        editingPromoCode._id || (editingPromoCode as any).id,
        promoCodeData
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Promo code updated successfully',
        });
        setShowEditForm(false);
        setEditingPromoCode(null);
        resetForm();
        fetchPromoCodes();
      }
    } catch (error: any) {
      console.error('Error updating promo code:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update promo code',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (promoCode: PromoCode) => {
    try {
      const targetId = promoCode._id || (promoCode as any).id;
      const newStatus = !promoCode.isActive;
      await updatePromoCode(targetId, { isActive: newStatus });
      toast({
        title: 'Success',
        description: `Promo code "${promoCode.code}" is now ${newStatus ? 'Active' : 'Inactive'}`,
      });
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error toggling active status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update active status',
        variant: 'destructive',
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
        title: 'Success',
        description: 'Promo code deleted successfully',
      });
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error deleting promo code:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete promo code',
        variant: 'destructive',
      });
    }
  };

  const stats = useMemo(() => {
    const active = promoCodes.filter((p) => p.isActive).length;
    const totalUses = promoCodes.reduce((sum, p) => sum + (p.usedCount || 0), 0);
    return {
      total: promoCodes.length,
      active,
      totalUses,
    };
  }, [promoCodes]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Marketing', href: '/marketing' },
          { label: 'Promo Codes' },
        ]}
        title="Promotional Discounts & Coupons"
        description="Configure coupon codes, cart percentage/fixed discounts, minimum thresholds, and expiry countdowns."
        liveStatus={{ label: `${stats.active} Coupons Active`, ping: true }}
        actions={
          <SoftButton
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowEditForm(false);
              setEditingPromoCode(null);
              resetForm();
            }}
          >
            {showCreateForm ? 'Cancel Form' : 'Create Promo Code'}
          </SoftButton>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Promo Codes"
          value={stats.total}
          icon={Tag}
          color="purple"
          subtitle="All promotional campaigns"
        />
        <StatCard
          title="Active Live"
          value={stats.active}
          icon={Percent}
          color="emerald"
          subtitle="Redeemable during checkout"
        />
        <StatCard
          title="Total Redemptions"
          value={stats.totalUses}
          icon={Sparkles}
          color="rose"
          subtitle="Orders discounted by coupon"
        />
      </div>

      {/* Create / Edit Form Card */}
      {(showCreateForm || showEditForm) && (
        <div className="sbf-card rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-5 animate-in fade-in slide-in-from-top-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Tag className="h-4 w-4 text-rose-600" />
              {showEditForm ? `Edit Promo Code: ${formData.code}` : 'Create New Promo Code'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set discount value, usage limits, minimum order spend, and visual banner presentation.
            </p>
          </div>

          <form
            onSubmit={showEditForm ? handleUpdatePromoCode : handleCreatePromoCode}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. ROSELOVE20"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500 uppercase font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Discount Type *
                </label>
                <select
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2)] focus:outline-none"
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as 'percentage' | 'fixed',
                    })
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="e.g. Flat 20% off on all Anniversary Flower Bouquets"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
              />
            </div>

            {/* Background & Styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Voucher Palette Theme
                </label>
                <Select
                  value={formData.background}
                  onValueChange={(value) =>
                    setFormData({ ...formData, background: value })
                  }
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-[#edf1f7] dark:bg-slate-950 border-slate-200/70">
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradientOptions.map((option) => (
                      <SelectItem key={option.name} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full border shadow-xs"
                            style={{ background: option.value }}
                          />
                          <span className="text-xs">{option.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.minimumOrderAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumOrderAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  placeholder="0 = No minimum"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Valid Until *
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="formIsActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: Boolean(checked) })
                }
              />
              <label
                htmlFor="formIsActive"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Active (Enable this coupon immediately for checkout redemptions)
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <SoftButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setEditingPromoCode(null);
                  resetForm();
                }}
              >
                Cancel
              </SoftButton>
              <SoftButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={uploading}
              >
                {uploading
                  ? 'Saving...'
                  : showEditForm
                  ? 'Update Promo Code'
                  : 'Create Promo Code'}
              </SoftButton>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-xs text-muted-foreground animate-pulse font-medium">
            Loading promotional discounts...
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22)] bg-[#f4f7fb] dark:bg-slate-900 p-12 text-center text-xs text-muted-foreground">
            No promo codes created yet. Click "Create Promo Code" to launch a campaign.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promoCodes.map((promoCode) => {
              const now = new Date();
              const validUntil = new Date(promoCode.validUntil);
              const isExpired = !isNaN(validUntil.getTime()) && now > validUntil;
              const discountLabel =
                promoCode.discountType === 'percentage'
                  ? `${promoCode.discountValue}% OFF`
                  : `₹${promoCode.discountValue} OFF`;

              return (
                <div
                  key={promoCode._id}
                  className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden flex flex-col justify-between transition-all duration-300"
                >
                  <div
                    className="p-5 relative"
                    style={{ background: (promoCode as any).background || '#ffffff' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-lg text-slate-950 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl shadow-xs border border-slate-200/60">
                            {promoCode.code}
                          </span>
                          <span className="font-bold text-xs px-2.5 py-1 rounded-xl bg-rose-600 text-white shadow-xs">
                            {discountLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium mt-2 line-clamp-2">
                          {promoCode.description}
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          isExpired
                            ? 'expired'
                            : promoCode.isActive
                            ? 'active'
                            : 'inactive'
                        }
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white/70 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 text-[11px] text-muted-foreground">
                      <div>
                        Min Order: <strong className="text-slate-800 dark:text-slate-200">
                          {promoCode.minimumOrderAmount > 0 ? `₹${promoCode.minimumOrderAmount}` : 'None'}
                        </strong>
                      </div>
                      <div>
                        Valid Till: <strong className="text-slate-800 dark:text-slate-200">
                          {!isNaN(validUntil.getTime()) ? validUntil.toLocaleDateString() : 'Ongoing'}
                        </strong>
                      </div>
                      <div>
                        Redemptions: <strong className="text-slate-800 dark:text-slate-200">{promoCode.usedCount || 0} times</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <SoftButton
                        variant={promoCode.isActive ? 'default' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleActive(promoCode)}
                        icon={Power}
                      >
                        {promoCode.isActive ? 'Deactivate' : 'Activate'}
                      </SoftButton>
                      <SoftButton
                        variant="default"
                        size="icon"
                        className="h-8 w-8 text-sky-600"
                        onClick={() => handleEditPromoCode(promoCode)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </SoftButton>
                      <SoftButton
                        variant="danger"
                        size="icon"
                        className="h-8 w-8 text-rose-600"
                        onClick={() => handleDeletePromoCode(promoCode)}
                        disabled={(promoCode.usedCount || 0) > 0}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </SoftButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCodes;
