import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, X, Loader2, Check, AlertTriangle, HelpCircle, Eye, EyeOff } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import productService, { OccasionData } from '@/services/productService';
import api from '@/services/api';

const AVAILABLE_ICONS = [
  'Cake', 'Gift', 'Heart', 'Sparkles', 'PartyPopper', 'HeartHandshake',
  'Activity', 'Baby', 'Home', 'Flame', 'TreePine', 'Smile', 'Leaf',
  'Award', 'Star', 'Trees', 'Crown', 'Flower', 'Moon', 'Sun', 'Calendar'
];

const OccasionIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || HelpCircle;
  return <IconComponent className={className} />;
};

const AdminOccasions: React.FC = () => {
  const [occasions, setOccasions] = useState<OccasionData[]>([]);
  const [filteredOccasions, setFilteredOccasions] = useState<OccasionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<OccasionData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIcon, setFormIcon] = useState('Gift');
  const [formBanner, setFormBanner] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formAccentColor, setFormAccentColor] = useState('#D4AF37');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formVisibleOnHomepage, setFormVisibleOnHomepage] = useState(true);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchOccasions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [occasions, searchTerm, statusFilter]);

  const fetchOccasions = async () => {
    try {
      setLoading(true);
      const data = await productService.getAdminOccasions();
      setOccasions(data);
    } catch (err: any) {
      console.error('Error fetching occasions:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load occasions list',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...occasions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        o =>
          o.name.toLowerCase().includes(term) ||
          o.slug.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    setFilteredOccasions(result);
  };

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormIcon('Gift');
    setFormBanner('');
    setFormThumbnail('');
    setFormAccentColor('#D4AF37');
    setFormDisplayOrder(occasions.length);
    setFormStatus('active');
    setFormFeatured(false);
    setFormVisibleOnHomepage(true);
    setFormSeoTitle('');
    setFormSeoDescription('');
    setEditingOccasion(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (occasion: OccasionData) => {
    setEditingOccasion(occasion);
    setFormName(occasion.name);
    setFormSlug(occasion.slug);
    setFormIcon(occasion.icon);
    setFormBanner(occasion.banner);
    setFormThumbnail(occasion.thumbnail);
    setFormAccentColor(occasion.accentColor || '#D4AF37');
    setFormDisplayOrder(occasion.displayOrder);
    setFormStatus(occasion.status);
    setFormFeatured(occasion.featured);
    setFormVisibleOnHomepage(occasion.visibleOnHomepage);
    setFormSeoTitle(occasion.seoTitle || '');
    setFormSeoDescription(occasion.seoDescription || '');
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'banner' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      if (target === 'banner') setIsUploadingBanner(true);
      if (target === 'thumbnail') setIsUploadingThumbnail(true);

      const response = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { type: 'product' },
        timeout: 30000
      });
      
      const imageUrl = response.data.imageUrl;
      if (target === 'banner') setFormBanner(imageUrl);
      if (target === 'thumbnail') setFormThumbnail(imageUrl);
      
      toast({
        title: 'Success',
        description: `${target === 'banner' ? 'Banner' : 'Thumbnail'} uploaded successfully`,
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to upload image to server',
      });
    } finally {
      setIsUploadingBanner(false);
      setIsUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    setSubmitting(true);
    const payload: Partial<OccasionData> = {
      name: formName,
      slug: formSlug || undefined,
      icon: formIcon,
      banner: formBanner,
      thumbnail: formThumbnail,
      accentColor: formAccentColor,
      displayOrder: Number(formDisplayOrder),
      status: formStatus,
      featured: formFeatured,
      visibleOnHomepage: formVisibleOnHomepage,
      seoTitle: formSeoTitle,
      seoDescription: formSeoDescription
    };

    try {
      if (editingOccasion) {
        await productService.updateOccasion(editingOccasion._id || editingOccasion.id || '', payload);
        toast({ title: 'Success', description: 'Occasion updated successfully' });
      } else {
        await productService.createOccasion(payload);
        toast({ title: 'Success', description: 'Occasion created successfully' });
      }
      setIsFormOpen(false);
      fetchOccasions();
    } catch (err: any) {
      console.error('Error saving occasion:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to save occasion',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (occasion: OccasionData) => {
    const newStatus = occasion.status === 'active' ? 'inactive' : 'active';
    try {
      await productService.updateOccasion(occasion._id || occasion.id || '', {
        status: newStatus
      });
      toast({
        title: 'Status Updated',
        description: `"${occasion.name}" is now ${newStatus}`
      });
      fetchOccasions();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update status',
      });
    }
  };

  const handleUpdateDisplayOrder = async (occasion: OccasionData, newOrder: number) => {
    try {
      await productService.updateOccasion(occasion._id || occasion.id || '', {
        displayOrder: newOrder
      });
      fetchOccasions();
    } catch (err) {
      console.error('Error updating display order:', err);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteId) return;

    try {
      await productService.deleteOccasion(deleteId);
      toast({ title: 'Success', description: 'Occasion deleted successfully' });
      setIsDeleteOpen(false);
      fetchOccasions();
    } catch (err: any) {
      console.error('Error deleting occasion:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete occasion',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Occasions Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure Gifting Occasion Categories, Accent Colors, Icons, and Homepage visibility.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Add Occasion
        </Button>
      </div>

      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Locate specific occasions or filter them by active status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search occasions by name or slug..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 border rounded-md bg-white text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading occasions list...</span>
            </div>
          ) : filteredOccasions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center p-6">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <h3 className="font-semibold text-lg">No Occasions Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Try resetting your search query or status filter to locate occasions.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-16 text-center">Order</TableHead>
                  <TableHead>Occasion Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-20 text-center">Icon</TableHead>
                  <TableHead className="w-32 text-center">Accent Color</TableHead>
                  <TableHead className="w-32 text-center">Homepage</TableHead>
                  <TableHead className="w-28 text-center">Featured</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-24 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOccasions.map(occ => (
                  <TableRow key={occ._id || occ.id}>
                    <TableCell className="text-center font-semibold">
                      <input
                        type="number"
                        defaultValue={occ.displayOrder}
                        onBlur={e => handleUpdateDisplayOrder(occ, Number(e.target.value))}
                        className="w-12 h-8 text-center border rounded"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="font-semibold">{occ.name}</TableCell>
                    <TableCell className="font-mono text-xs">{occ.slug}</TableCell>
                    <TableCell className="text-center">
                      <div className="w-9 h-9 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                        <OccasionIcon name={occ.icon} className="h-4.5 w-4.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                          style={{ backgroundColor: occ.accentColor }}
                        />
                        <span className="text-xs font-mono">{occ.accentColor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {occ.visibleOnHomepage ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                          Hidden
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {occ.featured ? (
                        <Badge className="bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleStatus(occ)}
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                          occ.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                        }`}
                      >
                        {occ.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(occ)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteId(occ._id || occ.id || null);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 w-8 text-red-650 hover:text-red-750"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOccasion ? 'Edit Occasion' : 'Add New Occasion'}</DialogTitle>
            <DialogDescription>
              Provide name, slug, color, icon, banner/thumbnail uploads, homepage setting, and SEO details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Occasion Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Anniversary"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Custom URL Slug (Optional)</Label>
                <Input
                  id="slug"
                  placeholder="e.g. wedding-anniversary"
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}
                />
                <span className="text-[10px] text-muted-foreground">Leaves blank to generate from name</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Lucide Icon *</Label>
                <select
                  id="icon"
                  value={formIcon}
                  onChange={e => setFormIcon(e.target.value)}
                  className="w-full h-10 px-3 border rounded-md bg-white text-sm"
                >
                  {AVAILABLE_ICONS.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="accentColorPicker"
                    value={formAccentColor}
                    onChange={e => setFormAccentColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer border rounded-md"
                  />
                  <Input
                    type="text"
                    id="accentColor"
                    value={formAccentColor}
                    onChange={e => setFormAccentColor(e.target.value)}
                    placeholder="#D4AF37"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order (Sorting Priority)</Label>
                <Input
                  type="number"
                  id="displayOrder"
                  value={formDisplayOrder}
                  onChange={e => setFormDisplayOrder(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full h-10 px-3 border rounded-md bg-white text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-1.5">
                <Label>Featured Option</Label>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border">
                  <Switch
                    checked={formFeatured}
                    onCheckedChange={setFormFeatured}
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold">Mark as Featured</span>
                    <p className="text-[10px] text-muted-foreground">Highlight this occasion in landing selectors.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Homepage settings</Label>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border">
                  <Switch
                    checked={formVisibleOnHomepage}
                    onCheckedChange={setFormVisibleOnHomepage}
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold">Show on Homepage</span>
                    <p className="text-[10px] text-muted-foreground">Display this occasion tab inside home section.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Uploaders */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Occasion Media Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thumbnail Image (Upload)</Label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="upload-thumbnail"
                      accept="image/*"
                      onChange={e => handleImageUpload(e, 'thumbnail')}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('upload-thumbnail')?.click()}
                        disabled={isUploadingThumbnail}
                        className="w-full flex items-center justify-center gap-1.5"
                      >
                        {isUploadingThumbnail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Choose Image'}
                      </Button>
                    </div>
                    {formThumbnail && (
                      <div className="relative mt-1 w-full max-h-24 overflow-hidden rounded border">
                        <img src={formThumbnail} alt="Thumbnail preview" className="object-cover w-full h-24" />
                        <button
                          type="button"
                          onClick={() => setFormThumbnail('')}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Banner Image (Upload)</Label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="upload-banner"
                      accept="image/*"
                      onChange={e => handleImageUpload(e, 'banner')}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('upload-banner')?.click()}
                        disabled={isUploadingBanner}
                        className="w-full flex items-center justify-center gap-1.5"
                      >
                        {isUploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Choose Image'}
                      </Button>
                    </div>
                    {formBanner && (
                      <div className="relative mt-1 w-full max-h-24 overflow-hidden rounded border">
                        <img src={formBanner} alt="Banner preview" className="object-cover w-full h-24" />
                        <button
                          type="button"
                          onClick={() => setFormBanner('')}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold">SEO & Meta Fields</h3>
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Page Title</Label>
                <Input
                  id="seoTitle"
                  placeholder="e.g. Luxury Birthday Flowers Delivery Hyderabad | SBFlorist"
                  value={formSeoTitle}
                  onChange={e => setFormSeoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  placeholder="e.g. Send the finest fresh flowers, bouquets, customized hampers, and cake combos tagged under Birthday for your special ones. Same-day delivery."
                  value={formSeoDescription}
                  onChange={e => setFormSeoDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-primary text-white font-semibold">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Delete Occasion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this occasion category? 
              This will remove its associations from all products. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteSubmit} className="bg-red-600 text-white font-semibold hover:bg-red-750">
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOccasions;
