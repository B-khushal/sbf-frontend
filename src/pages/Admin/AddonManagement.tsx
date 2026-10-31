import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Gift,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  Package,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  getAddons,
  updateAddon,
  deleteAddon,
  type AddonProduct,
} from '@/services/addonService';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const ADDON_CATEGORIES = [
  { value: 'greeting-cards', label: 'Greeting Cards' },
  { value: 'chocolates', label: 'Chocolates' },
  { value: 'teddy-bears', label: 'Teddy Bears' },
  { value: 'candles', label: 'Candles' },
  { value: 'cakes', label: 'Cakes' },
  { value: 'perfumes', label: 'Perfumes' },
  { value: 'balloons', label: 'Balloons' },
  { value: 'gift-hampers', label: 'Gift Hampers' },
  { value: 'other', label: 'Other / Custom' },
];

const AddonManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data States
  const [addons, setAddons] = useState<AddonProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<keyof AddonProduct | 'discount'>('sortOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load Initial Data
  const loadData = async () => {
    try {
      setLoading(true);
      const addonRes = await getAddons({ status: 'all' });
      if (addonRes.success) {
        setAddons(addonRes.addons || []);
      }
    } catch (error) {
      console.error('Error fetching admin addon data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to fetch addons list from server.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Inline Status Toggle
  const handleToggleStatus = async (addon: AddonProduct) => {
    try {
      const nextActiveState = !addon.active;
      const res = await updateAddon(addon._id, { active: nextActiveState });
      if (res.success) {
        setAddons((prev) =>
          prev.map((item) =>
            item._id === addon._id ? { ...item, active: nextActiveState } : item
          )
        );
        toast({
          title: 'Status Updated',
          description: `"${addon.name}" is now ${nextActiveState ? 'Visible' : 'Hidden'} in cart upsell.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update status on server.',
        variant: 'destructive',
      });
    }
  };

  // Delete Action
  const handleDeleteAddon = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }
    try {
      const res = await deleteAddon(id);
      if (res.success) {
        setAddons((prev) => prev.filter((item) => item._id !== id));
        toast({
          title: 'Addon Deleted',
          description: `"${name}" removed successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete addon from database.',
        variant: 'destructive',
      });
    }
  };

  // CSV Export Action
  const handleCSVExport = () => {
    if (!addons.length) {
      toast({ title: 'Export Failed', description: 'No addons to export.', variant: 'destructive' });
      return;
    }

    const headers = ['Name', 'SKU', 'Category', 'Price', 'DiscountedPrice', 'Stock', 'Active', 'SortOrder'];
    const rows = addons.map((a) => [
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.SKU || ''}"`,
      `"${a.category}"`,
      a.price,
      a.discountedPrice || a.price,
      a.stock,
      a.active ? 'Yes' : 'No',
      a.sortOrder,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sbf_addons_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort Handlers
  const handleSort = (field: keyof AddonProduct | 'discount') => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filtering & Sorting Logic
  const filteredAndSortedAddons = useMemo(() => {
    let result = [...addons];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (addon) =>
          addon.name.toLowerCase().includes(searchLower) ||
          (addon.SKU && addon.SKU.toLowerCase().includes(searchLower)) ||
          addon.slug.toLowerCase().includes(searchLower) ||
          (addon.description && addon.description.toLowerCase().includes(searchLower))
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((addon) => addon.category === selectedCategory);
    }

    if (selectedStatus && selectedStatus !== 'all') {
      const isActive = selectedStatus === 'active';
      result = result.filter((addon) => addon.active === isActive);
    }

    result.sort((a, b) => {
      let valA: any = a[sortBy as keyof AddonProduct];
      let valB: any = b[sortBy as keyof AddonProduct];

      if (sortBy === 'discount') {
        valA = a.price - (a.discountedPrice || a.price);
        valB = b.price - (b.discountedPrice || b.price);
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
    });

    return result;
  }, [addons, searchTerm, selectedCategory, selectedStatus, sortBy, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedAddons.length / pageSize);
  const paginatedAddons = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredAndSortedAddons.slice(startIdx, startIdx + pageSize);
  }, [filteredAndSortedAddons, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const stats = useMemo(() => {
    const active = addons.filter((a) => a.active).length;
    const lowStock = addons.filter((a) => a.stock < 5).length;
    const withLinks = addons.filter(
      (a) =>
        (a.linkedCategories?.length || 0) +
          (a.linkedOccasions?.length || 0) +
          (a.linkedProducts?.length || 0) >
        0
    ).length;

    return {
      total: addons.length,
      active,
      lowStock,
      withLinks,
    };
  }, [addons]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Catalog', href: '/admin/products' },
          { label: 'Addons & Upsells' },
        ]}
        title="Addon Products & Upsells"
        description="Manage small checkout upsell items such as greeting cards, artisanal chocolates, teddy bears, candles, and bespoke gift hampers."
        liveStatus={{ label: `${stats.active} Addons Active`, ping: true }}
        actions={
          <div className="flex items-center gap-2.5">
            <SoftButton
              variant="default"
              size="sm"
              icon={Download}
              onClick={handleCSVExport}
            >
              Export CSV
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/admin/addons/new')}
            >
              Create Addon
            </SoftButton>
          </div>
        }
      />

      {/* Stats KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Addons"
          value={stats.total}
          icon={Gift}
          color="rose"
          subtitle="All cataloged upsells"
        />
        <StatCard
          title="Active / Visible"
          value={stats.active}
          icon={Check}
          color="emerald"
          subtitle="Displayed in checkout cart"
        />
        <StatCard
          title="Low Stock (< 5)"
          value={stats.lowStock}
          icon={Package}
          color={stats.lowStock > 0 ? 'amber' : 'slate'}
          subtitle="Needs inventory restock"
        />
        <StatCard
          title="Recommendation Rules"
          value={stats.withLinks}
          icon={Layers}
          color="purple"
          subtitle="Smart product pairing links"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="sbf-card p-4 rounded-2xl border border-white/70 dark:border-slate-800 shadow-[5px_5px_15px_rgba(163,177,198,0.22),-5px_-5px_15px_rgba(255,255,255,0.75)] bg-[#f4f7fb] dark:bg-slate-900/90 flex flex-col lg:flex-row gap-3.5 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search addon by name, SKU, slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 h-9 text-xs rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl bg-[#edf1f7] dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ADDON_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl bg-[#edf1f7] dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <SoftButton
              variant="default"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
            >
              Reset
            </SoftButton>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden transition-all">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">
              Loading addon products...
            </p>
          </div>
        ) : paginatedAddons.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Gift className="h-12 w-12 text-slate-300 mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Addon Products Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'No addons match your current filters.'
                : 'Start by creating your first upsell item.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider select-none">
                  <th className="p-3.5 w-16">Image</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-rose-600"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name {sortBy === 'name' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-rose-600"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Category {sortBy === 'category' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-rose-600 text-right"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Price {sortBy === 'price' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-rose-600 text-right"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Stock {sortBy === 'stock' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="p-3.5">Linked Rules</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-rose-600"
                    onClick={() => handleSort('sortOrder')}
                  >
                    <div className="flex items-center gap-1">
                      Sort {sortBy === 'sortOrder' && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                  <th className="p-3.5 w-24">Status</th>
                  <th className="p-3.5 text-right w-24 pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-300 text-xs divide-y divide-slate-100 dark:divide-slate-800/50">
                {paginatedAddons.map((addon) => {
                  const priceDiff =
                    addon.discountedPrice && addon.discountedPrice < addon.price;
                  const linkedCount =
                    (addon.linkedCategories?.length || 0) +
                    (addon.linkedOccasions?.length || 0) +
                    (addon.linkedProducts?.length || 0);

                  return (
                    <tr
                      key={addon._id}
                      className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="h-11 w-11 rounded-xl border border-white shadow-xs overflow-hidden bg-white">
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {addon.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          SKU: {addon.SKU || 'N/A'}
                        </p>
                      </td>
                      <td className="p-3.5 capitalize">
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {addon.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-semibold">
                        {priceDiff ? (
                          <div>
                            <span className="font-bold text-rose-600">
                              ₹{addon.discountedPrice}
                            </span>
                            <span className="text-[10px] text-muted-foreground line-through ml-1">
                              ₹{addon.price}
                            </span>
                          </div>
                        ) : (
                          <span>₹{addon.price}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`font-bold text-xs ${
                            addon.stock < 5
                              ? 'text-rose-600'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {addon.stock}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {linkedCount > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {addon.linkedCategories && addon.linkedCategories.length > 0 && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                {addon.linkedCategories.length} Cats
                              </span>
                            )}
                            {addon.linkedOccasions && addon.linkedOccasions.length > 0 && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                {addon.linkedOccasions.length} Occs
                              </span>
                            )}
                            {addon.linkedProducts && addon.linkedProducts.length > 0 && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                {addon.linkedProducts.length} Prods
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">
                            Universal Upsell
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-xs">
                        {addon.sortOrder}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={addon.active}
                            onCheckedChange={() => handleToggleStatus(addon)}
                          />
                          <span className="text-[10px] font-medium text-slate-500">
                            {addon.active ? 'On' : 'Off'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <SoftButton
                            variant="default"
                            size="icon"
                            className="h-8 w-8 text-sky-600"
                            onClick={() => navigate(`/admin/addons/edit/${addon._id}`)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </SoftButton>
                          <SoftButton
                            variant="danger"
                            size="icon"
                            className="h-8 w-8 text-rose-600"
                            onClick={() => handleDeleteAddon(addon._id, addon.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </SoftButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-[#edf1f7]/50 dark:bg-slate-900">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredAndSortedAddons.length} addons)
            </span>
            <div className="flex items-center gap-1.5">
              <SoftButton
                variant="default"
                size="sm"
                icon={ChevronLeft}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </SoftButton>
              <SoftButton
                variant="default"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </SoftButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddonManagement;
