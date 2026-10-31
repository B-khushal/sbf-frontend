import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  GripVertical,
  AlertTriangle,
  Loader2,
  FolderTree,
  Tag,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import categoryService, { Category } from '@/services/categoryService';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [parentFilter, setParentFilter] = useState<string>('all');

  // Reorder mode
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('null');
  const [productsCount, setProductsCount] = useState<number>(0);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [categories, searchTerm, statusFilter, parentFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load categories',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSorting = () => {
    let result = [...categories];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (parentFilter !== 'all') {
      if (parentFilter === 'parents') {
        result = result.filter((c) => !c.parentId);
      } else if (parentFilter === 'children') {
        result = result.filter((c) => !!c.parentId);
      } else {
        result = result.filter((c) => {
          const pId =
            typeof c.parentId === 'object' && c.parentId !== null
              ? (c.parentId as any)._id || (c.parentId as any).id
              : c.parentId;
          return pId === parentFilter;
        });
      }
    }

    setFilteredCategories(result);
  };

  const openAddForm = () => {
    navigate('/admin/categories/new');
  };

  const openEditForm = (category: Category) => {
    const cid = category._id || category.id;
    navigate(`/admin/categories/edit/${cid}`);
  };

  const openDeleteConfirmation = (category: Category) => {
    setDeleteId(category._id || category.id || null);
    setProductsCount(category.productCount || 0);
    setReassignTargetId('null');
  };

  const handleDeleteSubmit = async () => {
    if (!deleteId) return;

    try {
      await categoryService.deleteCategory(
        deleteId,
        reassignTargetId !== 'null' ? reassignTargetId : undefined
      );
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete category',
      });
    }
  };

  const handleBulkStatus = async (status: 'active' | 'inactive') => {
    try {
      await categoryService.bulkUpdateStatus(selectedIds, status);
      toast({
        title: 'Success',
        description: `Updated status to ${status} for ${selectedIds.length} categories`,
      });
      setSelectedIds([]);
      fetchCategories();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update category status',
      });
    }
  };

  const handleBulkShowInShop = async (showInShop: boolean) => {
    try {
      await categoryService.bulkUpdateVisibility(selectedIds, showInShop);
      toast({
        title: 'Success',
        description: `Updated storefront visibility for ${selectedIds.length} categories`,
      });
      setSelectedIds([]);
      fetchCategories();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update visibility',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories?`))
      return;
    try {
      await categoryService.bulkDelete(selectedIds);
      toast({
        title: 'Success',
        description: `Deleted ${selectedIds.length} categories`,
      });
      setSelectedIds([]);
      fetchCategories();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to bulk delete categories',
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredCategories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFilteredCategories(items);

    const reorderedPayload = items.map((item, index) => ({
      id: item._id || item.id || '',
      sortOrder: index,
    }));

    try {
      await categoryService.reorderCategories(reorderedPayload);
      toast({
        title: 'Order Updated',
        description: 'Category hierarchy reordered successfully',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save reordered categories',
      });
      fetchCategories();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        filteredCategories
          .map((c) => c._id || c.id || '')
          .filter(Boolean)
      );
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const parentCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  const stats = useMemo(() => {
    const primary = categories.filter((c) => !c.parentId).length;
    const subcats = categories.filter((c) => !!c.parentId).length;
    const active = categories.filter((c) => c.status === 'active').length;
    return {
      total: categories.length,
      primary,
      subcats,
      active,
    };
  }, [categories]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Catalog', href: '/admin/products' },
          { label: 'Categories Taxonomy' },
        ]}
        title="Categories Management"
        description="Configure product taxonomy, hierarchy, parent categories, subcategories, SEO paths, and storefront placement."
        liveStatus={{ label: `${stats.active} Active Categories`, ping: true }}
        actions={
          <div className="flex items-center gap-2.5">
            <SoftButton
              variant={isReorderMode ? 'primary' : 'default'}
              size="sm"
              icon={GripVertical}
              onClick={() => setIsReorderMode(!isReorderMode)}
            >
              {isReorderMode ? 'Exit Reorder' : 'Drag Reorder'}
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddForm}
            >
              Add Category
            </SoftButton>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Taxonomies"
          value={stats.total}
          icon={FolderTree}
          color="purple"
          subtitle="All catalog nodes"
        />
        <StatCard
          title="Primary Categories"
          value={stats.primary}
          icon={Layers}
          color="blue"
          subtitle="Top navigation pillars"
        />
        <StatCard
          title="Subcategories"
          value={stats.subcats}
          icon={Tag}
          color="amber"
          subtitle="Nested department filters"
        />
        <StatCard
          title="Active on Store"
          value={stats.active}
          icon={Sparkles}
          color="emerald"
          subtitle="Shopper accessible"
        />
      </div>

      {/* Search & Filters Neumorphic Panel */}
      {!isReorderMode && (
        <div className="sbf-card p-4 rounded-2xl border border-white/70 dark:border-slate-800 shadow-[5px_5px_15px_rgba(163,177,198,0.22),-5px_-5px_15px_rgba(255,255,255,0.75)] bg-[#f4f7fb] dark:bg-slate-900/90 transition-all space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories by name, slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-9 text-xs rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-[#edf1f7] dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={parentFilter} onValueChange={setParentFilter}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-[#edf1f7] dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                <SelectValue placeholder="Parent Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Category Types</SelectItem>
                <SelectItem value="parents">Primary Categories Only</SelectItem>
                <SelectItem value="children">Subcategories Only</SelectItem>
                {parentCategories.map((parent) => (
                  <SelectItem
                    key={parent._id || parent.id}
                    value={parent._id || parent.id || ''}
                  >
                    Under: {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Menu */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
              <span className="text-xs font-semibold text-rose-300">
                {selectedIds.length} categories selected:
              </span>
              <div className="flex items-center gap-2">
                <SoftButton
                  variant="default"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  onClick={() => handleBulkStatus('active')}
                >
                  Activate
                </SoftButton>
                <SoftButton
                  variant="default"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white border-0"
                  onClick={() => handleBulkStatus('inactive')}
                >
                  Deactivate
                </SoftButton>
                <SoftButton
                  variant="default"
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-700 text-white border-0"
                  onClick={() => handleBulkShowInShop(true)}
                >
                  Show in Shop
                </SoftButton>
                <SoftButton
                  variant="default"
                  size="sm"
                  className="bg-slate-700 hover:bg-slate-600 text-white border-0"
                  onClick={() => handleBulkShowInShop(false)}
                >
                  Hide in Shop
                </SoftButton>
                <SoftButton
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={handleBulkDelete}
                >
                  Delete
                </SoftButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Categories Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/80 shadow-[6px_6px_18px_rgba(163,177,198,0.22)] bg-[#f4f7fb]">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-3" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading categories taxonomy...
          </p>
        </div>
      ) : isReorderMode ? (
        <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Reorder Categories
            </h2>
            <p className="text-xs text-muted-foreground">
              Drag and drop categories to reorder them on the website homepage and navigation bars.
            </p>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2.5 max-w-xl"
                >
                  {filteredCategories.map((category, index) => (
                    <Draggable
                      key={category._id || category.id}
                      draggableId={category._id || category.id || ''}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                            snapshot.isDragging
                              ? 'shadow-lg border-rose-500 bg-white ring-2 ring-rose-500/20'
                              : 'border-white/80 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-800 shadow-[3px_3px_8px_rgba(163,177,198,0.2),-3px_-3px_8px_rgba(255,255,255,0.7)]'
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-700 p-1"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-white shadow-xs flex-shrink-0">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-100">
                                No Img
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                              {category.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {category.categoryUrl}
                            </p>
                          </div>
                          <StatusBadge status={category.status} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden transition-all">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <GripVertical className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                No categories found
              </h3>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search query or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredCategories.length &&
                          filteredCategories.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Thumbnail
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Slug
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      URL Path
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Hierarchy
                    </TableHead>
                    <TableHead className="text-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Products
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Status
                    </TableHead>
                    <TableHead className="text-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Show in Shop
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Sort
                    </TableHead>
                    <TableHead className="text-right pr-6 font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => {
                    const id = category._id || category.id || '';
                    return (
                      <TableRow
                        key={id}
                        className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/50"
                      >
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(id)}
                            onChange={() => toggleSelectRow(id)}
                            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white shadow-xs bg-slate-100 flex items-center justify-center">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                None
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {category.slug}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold">
                          {category.categoryUrl}
                        </TableCell>
                        <TableCell>
                          {category.parentId ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {(typeof category.parentId === 'object' &&
                              category.parentId !== null
                                ? (category.parentId as any).name
                                : null) || 'Subcategory'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                              Primary Category
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs text-slate-800 dark:text-slate-200">
                          {category.productCount || 0}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={category.status} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={category.showInShop === true}
                            onCheckedChange={async (checked) => {
                              try {
                                setCategories((prev) =>
                                  prev.map((c) =>
                                    c._id === id || c.id === id
                                      ? {
                                          ...c,
                                          showInShop: checked,
                                          isFeatured: checked,
                                        }
                                      : c
                                  )
                                );
                                await categoryService.updateCategory(id, {
                                  showInShop: checked,
                                });
                                toast({
                                  title: 'Success',
                                  description: 'Shop display updated successfully',
                                });
                                fetchCategories();
                              } catch (err) {
                                setCategories((prev) =>
                                  prev.map((c) =>
                                    c._id === id || c.id === id
                                      ? {
                                          ...c,
                                          showInShop: !checked,
                                          isFeatured: !checked,
                                        }
                                      : c
                                  )
                                );
                                toast({
                                  variant: 'destructive',
                                  title: 'Error',
                                  description: 'Failed to update shop display',
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {category.sortOrder}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            <SoftButton
                              variant="default"
                              size="icon"
                              className="h-8 w-8 text-sky-600"
                              onClick={() => openEditForm(category)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </SoftButton>
                            <SoftButton
                              variant="danger"
                              size="icon"
                              className="h-8 w-8 text-rose-600"
                              onClick={() => openDeleteConfirmation(category)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </SoftButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border border-white/80 dark:border-slate-800 shadow-[8px_8px_24px_rgba(163,177,198,0.3)] bg-[#f4f7fb] dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertTriangle className="h-5 w-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription className="pt-1.5 text-xs">
              Are you sure you want to delete this category? This action is permanent and will delete related URL maps.
            </DialogDescription>
          </DialogHeader>

          {productsCount > 0 && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2 mt-2">
              <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Products Assigned
              </p>
              <p className="text-[11px] text-amber-700">
                There are currently <strong>{productsCount} products</strong> assigned to this category. Select a new category to reassign them, or select Uncategorized.
              </p>
              <div className="space-y-1">
                <Label htmlFor="reassign-select" className="text-[11px] text-amber-900 font-bold">
                  Reassign Products To
                </Label>
                <Select value={reassignTargetId} onValueChange={setReassignTargetId}>
                  <SelectTrigger
                    id="reassign-select"
                    className="border-amber-200 bg-white h-8 text-xs rounded-lg"
                  >
                    <SelectValue placeholder="Select target category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Uncategorized (Default)</SelectItem>
                    {categories
                      .filter((c) => (c._id || c.id) !== deleteId)
                      .map((cat) => (
                        <SelectItem
                          key={cat._id || cat.id}
                          value={cat._id || cat.id || ''}
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <SoftButton variant="default" size="sm" onClick={() => setDeleteId(null)}>
              Cancel
            </SoftButton>
            <SoftButton variant="danger" size="sm" onClick={handleDeleteSubmit}>
              Confirm Delete
            </SoftButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
