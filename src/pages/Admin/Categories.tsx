import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Filter, X, ArrowUpDown, GripVertical, Check, FolderSync, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import categoryService, { Category } from '@/services/categoryService';
import api from '@/services/api';

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
        c =>
          c.name.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (parentFilter !== 'all') {
      if (parentFilter === 'parents') {
        result = result.filter(c => !c.parentId);
      } else if (parentFilter === 'children') {
        result = result.filter(c => c.parentId);
      } else {
        result = result.filter(c => c.parentId?._id === parentFilter || c.parentId === parentFilter);
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
        reassignTargetId === 'null' ? undefined : reassignTargetId
      );
      toast({ title: 'Success', description: 'Category deleted successfully' });
      setDeleteId(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete category',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      await categoryService.bulkDelete(selectedIds);
      toast({ title: 'Success', description: 'Selected categories deleted' });
      setSelectedIds([]);
      fetchCategories();
    } catch (err: any) {
      console.error('Bulk delete failed:', err);
      toast({
        variant: 'destructive',
        title: 'Bulk Delete Error',
        description: err.response?.data?.message || 'Failed to delete selected categories',
      });
    }
  };

  const handleBulkStatus = async (targetStatus: 'active' | 'inactive') => {
    if (selectedIds.length === 0) return;

    try {
      await categoryService.bulkUpdateStatus(selectedIds, targetStatus);
      toast({ title: 'Success', description: 'Selected categories status updated' });
      setSelectedIds([]);
      fetchCategories();
    } catch (err) {
      console.error('Bulk status update failed:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update category status',
      });
    }
  };

  const handleBulkShowInShop = async (visible: boolean) => {
    if (selectedIds.length === 0) return;

    try {
      await categoryService.bulkUpdateShowInShop(selectedIds, visible);
      toast({ title: 'Success', description: 'Selected categories shop display updated' });
      setSelectedIds([]);
      fetchCategories();
    } catch (err) {
      console.error('Bulk shop visibility update failed:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update shop display',
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredCategories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistically update local state
    const updatedCategories = categories.map(cat => {
      const foundIdx = items.findIndex(item => (item._id || item.id) === (cat._id || cat.id));
      if (foundIdx !== -1) {
        return { ...cat, sortOrder: foundIdx };
      }
      return cat;
    });

    setCategories(updatedCategories.sort((a, b) => a.sortOrder - b.sortOrder));

    try {
      // Persist the new sort order via API updates
      await Promise.all(
        items.map((item, index) =>
          categoryService.updateCategory(item._id || item.id || '', { sortOrder: index })
        )
      );
      toast({ title: 'Success', description: 'Categories reordered successfully' });
    } catch (err) {
      console.error('Reordering failed:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save new order' });
      fetchCategories(); // Rollback to DB state
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map(c => c._id || c.id || '').filter(Boolean));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const parentCategories = categories.filter(c => !c.parentId);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Toolbar */}
      <div className="responsive-toolbar">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categories Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product categories, subcategories, SEO metadata, and custom routes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isReorderMode ? 'default' : 'outline'}
            onClick={() => setIsReorderMode(!isReorderMode)}
            className="flex items-center gap-1.5"
          >
            <GripVertical className="h-4 w-4" />
            {isReorderMode ? 'Exit Reorder Mode' : 'Drag Reorder'}
          </Button>
          <Button onClick={openAddForm} className="bg-primary hover:bg-primary/95">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {!isReorderMode && (
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-50/50 focus:bg-white"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-50/50">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={parentFilter} onValueChange={setParentFilter}>
                <SelectTrigger className="bg-gray-50/50">
                  <SelectValue placeholder="Parent Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Category Types</SelectItem>
                  <SelectItem value="parents">Primary Categories Only</SelectItem>
                  <SelectItem value="children">Subcategories Only</SelectItem>
                  {parentCategories.map(parent => (
                    <SelectItem key={parent._id || parent.id} value={parent._id || parent.id || ''}>
                      Under: {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions Menu */}
            {selectedIds.length > 0 && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-xs font-semibold text-primary">
                  {selectedIds.length} categories selected:
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatus('active')}
                    className="h-8 text-xs border-primary/20 text-primary hover:bg-primary/10"
                  >
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatus('inactive')}
                    className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    Deactivate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkShowInShop(true)}
                    className="h-8 text-xs border-sky-200 text-sky-700 hover:bg-sky-50"
                  >
                    Show in Shop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkShowInShop(false)}
                    className="h-8 text-xs border-gray-250 text-gray-750 hover:bg-gray-50"
                  >
                    Hide in Shop
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-8 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Categories Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground text-sm">Loading categories taxonomy...</p>
        </div>
      ) : isReorderMode ? (
        <Card className="shadow-sm border-gray-100 bg-white">
          <CardHeader>
            <CardTitle>Reorder Categories</CardTitle>
            <CardDescription>
              Drag and drop categories to reorder them on the website homepage and navigation bars.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 max-w-xl"
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
                            className={`flex items-center gap-4 p-3 bg-white border rounded-xl shadow-sm transition-shadow ${
                              snapshot.isDragging ? 'shadow-md border-primary ring-2 ring-primary/10' : 'border-gray-150'
                            }`}
                          >
                            <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-700 p-1">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-50 border flex-shrink-0">
                              {category.image ? (
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-100">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{category.name}</p>
                              <p className="text-xs text-muted-foreground">{category.categoryUrl}</p>
                            </div>
                            <Badge variant={category.status === 'active' ? 'secondary' : 'outline'}>
                              {category.status}
                            </Badge>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border-gray-100 bg-white">
          <CardContent className="p-0">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <GripVertical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-1">No categories found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query or filters.
                </p>
              </div>
            ) : (
              <div className="responsive-table-wrap border-0 rounded-none">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>URL Path</TableHead>
                      <TableHead>Parent Category</TableHead>
                      <TableHead className="text-center">Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Show in Shop</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const id = category._id || category.id || '';
                      return (
                        <TableRow key={id} className={category.status === 'inactive' ? 'opacity-60 bg-gray-50/20' : ''}>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(id)}
                              onChange={() => toggleSelectRow(id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-gray-55 border-gray-100 shadow-sm flex items-center justify-center">
                              {category.image ? (
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-450 bg-gray-50">
                                  Empty
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{category.name}</TableCell>
                          <TableCell className="text-sm font-mono text-muted-foreground">{category.slug}</TableCell>
                          <TableCell className="text-sm font-mono text-[#b53d69] font-medium">{category.categoryUrl}</TableCell>
                          <TableCell>
                            {category.parentId ? (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                                {category.parentId.name || 'Subcategory'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                Primary Category
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-bold text-gray-800">
                            {category.productCount || 0}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={category.status === 'active' ? 'default' : 'outline'}
                              className={category.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-gray-300 text-gray-500'}
                            >
                              {category.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={category.showInShop !== false}
                              onCheckedChange={async (checked) => {
                                try {
                                  await categoryService.updateCategory(id, { showInShop: checked });
                                  toast({ title: 'Success', description: 'Shop display updated successfully' });
                                  fetchCategories();
                                } catch (err) {
                                  toast({ variant: 'destructive', title: 'Error', description: 'Failed to update shop display' });
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-sm font-mono">{category.sortOrder}</TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditForm(category)}
                                className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirmation(category)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {/* Delete Confirmation Dialog with Reassignment Option */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription className="pt-1.5">
              Are you sure you want to delete this category? This action is permanent and will delete related URL maps.
            </DialogDescription>
          </DialogHeader>

          {productsCount > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 mt-2">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Products Assigned
              </p>
              <p className="text-xs text-amber-700">
                There are currently <strong>{productsCount} products</strong> assigned to this category. Select a new category to reassign them, or select Uncategorized.
              </p>
              
              <div className="space-y-1.5">
                <Label htmlFor="reassign-select" className="text-xs text-amber-900 font-bold">
                  Reassign Products To
                </Label>
                <Select value={reassignTargetId} onValueChange={setReassignTargetId}>
                  <SelectTrigger id="reassign-select" className="border-amber-200 bg-white">
                    <SelectValue placeholder="Select target category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Uncategorized (Default)</SelectItem>
                    {categories
                      .filter(c => (c._id || c.id) !== deleteId)
                      .map(cat => (
                        <SelectItem key={cat._id || cat.id} value={cat._id || cat.id || ''}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
