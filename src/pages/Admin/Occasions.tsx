import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Loader2,
  Check,
  AlertTriangle,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  PartyPopper,
  Home,
  CheckCircle2,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import productService, { OccasionData } from '@/services/productService';
import api from '@/services/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

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
      const res = await productService.getOccasions();
      setOccasions(res || []);
    } catch (err: any) {
      console.error('Error fetching occasions:', err);
      toast({
        variant: 'destructive',
        title: 'Error Loading Occasions',
        description: err.response?.data?.message || 'Failed to fetch occasions list',
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
        (o) =>
          o.name.toLowerCase().includes(term) ||
          (o.slug && o.slug.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    setFilteredOccasions(result);
  };

  const handleOpenAdd = () => {
    setEditingOccasion(null);
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
    setIsFormOpen(true);
  };

  const handleOpenEdit = (occ: OccasionData) => {
    setEditingOccasion(occ);
    setFormName(occ.name);
    setFormSlug(occ.slug || '');
    setFormIcon(occ.icon || 'Gift');
    setFormBanner(occ.banner || '');
    setFormThumbnail(occ.thumbnail || '');
    setFormAccentColor(occ.accentColor || '#D4AF37');
    setFormDisplayOrder(occ.displayOrder || 0);
    setFormStatus(occ.status || 'active');
    setFormFeatured(Boolean(occ.featured));
    setFormVisibleOnHomepage(occ.visibleOnHomepage !== false);
    setFormSeoTitle(occ.seoTitle || '');
    setFormSeoDescription(occ.seoDescription || '');
    setIsFormOpen(true);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'banner' | 'thumbnail'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      if (target === 'banner') setIsUploadingBanner(true);
      if (target === 'thumbnail') setIsUploadingThumbnail(true);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = response.data.url || response.data.imageUrl;
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
      seoDescription: formSeoDescription,
    };

    try {
      if (editingOccasion) {
        await productService.updateOccasion(
          editingOccasion._id || editingOccasion.id || '',
          payload
        );
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
        status: newStatus,
      });
      toast({
        title: 'Status Updated',
        description: `"${occasion.name}" is now ${newStatus}`,
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

  const handleUpdateDisplayOrder = async (
    occasion: OccasionData,
    newOrder: number
  ) => {
    try {
      await productService.updateOccasion(occasion._id || occasion.id || '', {
        displayOrder: newOrder,
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

  const stats = useMemo(() => {
    const active = occasions.filter((o) => o.status === 'active').length;
    const homepage = occasions.filter((o) => o.visibleOnHomepage !== false).length;
    const featured = occasions.filter((o) => Boolean(o.featured)).length;
    return {
      total: occasions.length,
      active,
      homepage,
      featured,
    };
  }, [occasions]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Catalog', href: '/admin/products' },
          { label: 'Occasions' },
        ]}
        title="Occasions & Celebrations"
        description="Configure gifting occasion categories (Birthday, Anniversary, Sympathy, Congratulations) with custom icons, accent themes, and banners."
        liveStatus={{ label: `${stats.active} Occasions Active`, ping: true }}
        actions={
          <SoftButton
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Occasion
          </SoftButton>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Occasions"
          value={stats.total}
          icon={PartyPopper}
          color="purple"
          subtitle="All celebration themes"
        />
        <StatCard
          title="Active Live"
          value={stats.active}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Shopper selectable"
        />
        <StatCard
          title="Homepage Grid"
          value={stats.homepage}
          icon={Home}
          color="blue"
          subtitle="Shown on storefront"
        />
        <StatCard
          title="Featured Highlights"
          value={stats.featured}
          icon={Sparkles}
          color="amber"
          subtitle="Hero promotional placement"
        />
      </div>

      {/* Search & Filters Bar */}
      <div className="sbf-card p-4 rounded-2xl border border-white/70 dark:border-slate-800 shadow-[5px_5px_15px_rgba(163,177,198,0.22),-5px_-5px_15px_rgba(255,255,255,0.75)] bg-[#f4f7fb] dark:bg-slate-900/90 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search occasions by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 h-9 text-xs rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-9 px-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Occasions Neumorphic Table */}
      <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden transition-all">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            <span className="text-xs text-muted-foreground font-medium">
              Loading occasions catalog...
            </span>
          </div>
        ) : filteredOccasions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center p-6">
            <AlertTriangle className="h-10 w-10 text-amber-500 opacity-60" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No Occasions Found
            </h3>
            <p className="text-muted-foreground text-xs max-w-sm">
              Try resetting your search query or status filter to locate occasions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                <TableRow>
                  <TableHead className="w-16 text-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Order
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Occasion Name
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Slug
                  </TableHead>
                  <TableHead className="w-20 text-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Icon
                  </TableHead>
                  <TableHead className="w-32 text-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Color Accent
                  </TableHead>
                  <TableHead className="w-32 text-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Homepage
                  </TableHead>
                  <TableHead className="w-28 text-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Featured
                  </TableHead>
                  <TableHead className="w-28 text-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Status
                  </TableHead>
                  <TableHead className="w-24 text-right pr-6 font-semibold text-xs text-slate-700 dark:text-slate-300">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOccasions.map((occ) => (
                  <TableRow
                    key={occ._id || occ.id}
                    className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/50"
                  >
                    <TableCell className="text-center font-semibold">
                      <input
                        type="number"
                        defaultValue={occ.displayOrder}
                        onBlur={(e) =>
                          handleUpdateDisplayOrder(occ, Number(e.target.value))
                        }
                        className="w-12 h-7 text-center rounded-lg border border-slate-200/80 bg-white dark:bg-slate-950 text-xs shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06)] focus:outline-none"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {occ.thumbnail && (
                          <img
                            src={occ.thumbnail}
                            alt={occ.name}
                            className="w-8 h-8 rounded-lg object-cover border border-white shadow-xs"
                          />
                        )}
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {occ.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {occ.slug || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex p-2 rounded-xl bg-white dark:bg-slate-800 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)] text-rose-600">
                        <OccasionIcon
                          name={occ.icon || 'Gift'}
                          className="h-4 w-4"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/60 shadow-xs">
                        <span
                          className="w-3 h-3 rounded-full shadow-xs"
                          style={{
                            backgroundColor: occ.accentColor || '#D4AF37',
                          }}
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {occ.accentColor || '#D4AF37'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          occ.visibleOnHomepage !== false
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                            : 'bg-slate-200/70 text-slate-500'
                        }`}
                      >
                        {occ.visibleOnHomepage !== false ? 'Shown' : 'Hidden'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          occ.featured
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            : 'bg-slate-200/70 text-slate-500'
                        }`}
                      >
                        {occ.featured ? 'Featured' : 'Standard'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(occ)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <StatusBadge status={occ.status || 'active'} />
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1.5">
                        <SoftButton
                          variant="default"
                          size="icon"
                          className="h-8 w-8 text-sky-600"
                          onClick={() => handleOpenEdit(occ)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </SoftButton>
                        <SoftButton
                          variant="danger"
                          size="icon"
                          className="h-8 w-8 text-rose-600"
                          onClick={() => {
                            setDeleteId(occ._id || occ.id || null);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </SoftButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/80 dark:border-slate-800 shadow-[8px_8px_24px_rgba(163,177,198,0.3)] bg-[#f4f7fb] dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingOccasion ? 'Edit Occasion' : 'Add New Occasion'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure celebration theme title, icon, color accent, uploads, and SEO settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Occasion Name *
                </Label>
                <input
                  type="text"
                  placeholder="e.g. Anniversary"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  URL Slug
                </Label>
                <input
                  type="text"
                  placeholder="e.g. wedding-anniversary"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Lucide Icon *
                </Label>
                <select
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200/70 dark:border-slate-800 rounded-xl bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2)] focus:outline-none"
                >
                  {AVAILABLE_ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Accent Color
                </Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formAccentColor}
                    onChange={(e) => setFormAccentColor(e.target.value)}
                    className="w-10 h-9 p-0.5 cursor-pointer border border-slate-200/70 rounded-xl bg-white"
                  />
                  <input
                    type="text"
                    value={formAccentColor}
                    onChange={(e) => setFormAccentColor(e.target.value)}
                    placeholder="#D4AF37"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Display Order
                </Label>
                <input
                  type="number"
                  value={formDisplayOrder}
                  onChange={(e) =>
                    setFormDisplayOrder(Number(e.target.value))
                  }
                  min="0"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </Label>
                <select
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as 'active' | 'inactive')
                  }
                  className="w-full h-9 px-3 border border-slate-200/70 dark:border-slate-800 rounded-xl bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2)] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Toggle Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3 bg-[#edf1f7] dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)]">
                <Switch
                  checked={formFeatured}
                  onCheckedChange={setFormFeatured}
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Mark as Featured
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    Highlight in landing page selectors.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#edf1f7] dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)]">
                <Switch
                  checked={formVisibleOnHomepage}
                  onCheckedChange={setFormVisibleOnHomepage}
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Show on Homepage
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    Display tab inside homepage section.
                  </p>
                </div>
              </div>
            </div>

            {/* Media Uploaders */}
            <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Media Files
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Thumbnail Image
                  </Label>
                  <input
                    type="file"
                    id="upload-thumbnail"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'thumbnail')}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('upload-thumbnail')?.click()
                      }
                      disabled={isUploadingThumbnail}
                      className="w-full h-8 text-xs font-semibold rounded-xl border border-slate-200/80 bg-white shadow-xs hover:bg-slate-50 flex items-center justify-center gap-1.5"
                    >
                      {isUploadingThumbnail ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Choose Thumbnail'
                      )}
                    </button>
                  </div>
                  {formThumbnail && (
                    <div className="relative mt-1 w-full h-20 rounded-xl overflow-hidden border border-white shadow-xs">
                      <img
                        src={formThumbnail}
                        alt="Thumbnail"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => setFormThumbnail('')}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-sm hover:bg-rose-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Banner Image
                  </Label>
                  <input
                    type="file"
                    id="upload-banner"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('upload-banner')?.click()
                      }
                      disabled={isUploadingBanner}
                      className="w-full h-8 text-xs font-semibold rounded-xl border border-slate-200/80 bg-white shadow-xs hover:bg-slate-50 flex items-center justify-center gap-1.5"
                    >
                      {isUploadingBanner ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Choose Banner'
                      )}
                    </button>
                  </div>
                  {formBanner && (
                    <div className="relative mt-1 w-full h-20 rounded-xl overflow-hidden border border-white shadow-xs">
                      <img
                        src={formBanner}
                        alt="Banner"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => setFormBanner('')}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-sm hover:bg-rose-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                SEO & Meta Fields
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="SEO Title: e.g. Luxury Birthday Flowers Delivery Hyderabad | SBFlorist"
                  value={formSeoTitle}
                  onChange={(e) => setFormSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="SEO Meta Description..."
                  value={formSeoDescription}
                  onChange={(e) => setFormSeoDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <SoftButton
                variant="default"
                size="sm"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </SoftButton>
              <SoftButton
                variant="primary"
                size="sm"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Occasion'}
              </SoftButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-white/80 dark:border-slate-800 shadow-[8px_8px_24px_rgba(163,177,198,0.3)] bg-[#f4f7fb] dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertTriangle className="h-5 w-5" />
              Delete Occasion
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Are you sure you want to delete this occasion? All categorized product references will remain intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <SoftButton
              variant="default"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </SoftButton>
            <SoftButton
              variant="danger"
              size="sm"
              onClick={handleDeleteSubmit}
            >
              Confirm Delete
            </SoftButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOccasions;
