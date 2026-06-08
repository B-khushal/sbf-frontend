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
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  getAddons, 
  updateAddon, 
  deleteAddon, 
  type AddonProduct 
} from '@/services/addonService';

const ADDON_CATEGORIES = [
  { value: 'greeting-cards', label: 'Greeting Cards' },
  { value: 'chocolates', label: 'Chocolates' },
  { value: 'teddy-bears', label: 'Teddy Bears' },
  { value: 'candles', label: 'Candles' },
  { value: 'cakes', label: 'Cakes' },
  { value: 'perfumes', label: 'Perfumes' },
  { value: 'balloons', label: 'Balloons' },
  { value: 'gift-hampers', label: 'Gift Hampers' },
  { value: 'other', label: 'Other / Custom' }
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
      const addonRes = await getAddons({ status: 'all' }); // fetch all active/inactive for admin
      if (addonRes.success) {
        setAddons(addonRes.addons || []);
      }
    } catch (error) {
      console.error('Error fetching admin addon data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to fetch addons list from server.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Delete Addon
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the addon product "${name}"?`)) {
      return;
    }

    try {
      const response = await deleteAddon(id);
      if (response.success) {
        toast({
          title: 'Deleted',
          description: `Addon "${name}" deleted successfully.`
        });
        loadData();
      }
    } catch (error) {
      console.error('Error deleting addon:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Could not delete the addon product.',
        variant: 'destructive'
      });
    }
  };

  // Quick toggle status action
  const toggleActiveStatus = async (addon: AddonProduct) => {
    const nextActive = !addon.active;
    const nextStatus = nextActive ? 'active' : 'inactive';
    
    try {
      const response = await updateAddon(addon._id, { 
        active: nextActive,
        status: nextStatus 
      });
      
      if (response.success) {
        toast({
          title: 'Status Updated',
          description: `"${addon.name}" is now ${nextActive ? 'Active' : 'Inactive'}.`
        });
        
        // Optimistic UI update
        setAddons(prev => prev.map(item => 
          item._id === addon._id 
            ? { ...item, active: nextActive, status: nextStatus } 
            : item
        ));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle status.',
        variant: 'destructive'
      });
    }
  };

  // CSV Export
  const handleCSVExport = () => {
    const headers = ['Name', 'Slug', 'Category', 'Price', 'DiscountedPrice', 'Stock', 'SKU', 'Status', 'Active', 'SortOrder', 'Badge', 'Tags', 'LinkedCategories', 'LinkedOccasions'];
    const csvRows = addons.map(addon => [
      addon.name,
      addon.slug,
      addon.category,
      addon.price,
      addon.discountedPrice || '',
      addon.stock,
      addon.SKU || '',
      addon.status,
      addon.active ? 'true' : 'false',
      addon.sortOrder,
      addon.badge || '',
      (addon.tags || []).join(';'),
      (addon.linkedCategories || []).join(';'),
      (addon.linkedOccasions || []).join(';')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `addon_products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'CSV Exported',
      description: 'The addon products list was downloaded successfully.'
    });
  };

  // Sort Handlers
  const handleSort = (field: keyof AddonProduct | 'discount') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filtering & Sorting Logic
  const filteredAndSortedAddons = useMemo(() => {
    let result = [...addons];

    // Search query matching (name, SKU, slug, description)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(addon => 
        addon.name.toLowerCase().includes(searchLower) ||
        (addon.SKU && addon.SKU.toLowerCase().includes(searchLower)) ||
        addon.slug.toLowerCase().includes(searchLower) ||
        (addon.description && addon.description.toLowerCase().includes(searchLower))
      );
    }

    // Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(addon => addon.category === selectedCategory);
    }

    // Status Filter
    if (selectedStatus && selectedStatus !== 'all') {
      const isActive = selectedStatus === 'active';
      result = result.filter(addon => addon.active === isActive);
    }

    // Sorting
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
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? valA - valB 
          : valB - valA;
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

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
            <Gift className="h-8 w-8 text-pink-600 animate-pulse" />
            Addon Products System
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage small checkout upsell items such as greeting cards, chocolates, teddy bears, and hampers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleCSVExport}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => navigate('/admin/addons/new')}
            className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold shadow-md shadow-pink-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Addon
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-50/50 border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Addons</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{addons.length}</h3>
            </div>
            <div className="h-10 w-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
              <Gift className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50 border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Active / Visible</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {addons.filter(a => a.active).length}
              </h3>
            </div>
            <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <Check className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50 border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Low Stock (&lt; 5)</p>
              <h3 className={`text-2xl font-black mt-1 ${addons.filter(a => a.stock < 5).length > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
                {addons.filter(a => a.stock < 5).length}
              </h3>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50 border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Recommendation Links</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                {addons.filter(a => (a.linkedCategories?.length || 0) + (a.linkedOccasions?.length || 0) + (a.linkedProducts?.length || 0) > 0).length}
              </h3>
            </div>
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
              <Input
                type="text"
                placeholder="Search addon by name, SKU, slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-slate-200 focus:border-pink-500 bg-white"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <Label htmlFor="category-filter" className="text-xs font-bold text-slate-500 whitespace-nowrap uppercase">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter" className="w-[160px] bg-white border-slate-200 text-xs">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {ADDON_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <Label htmlFor="status-filter" className="text-xs font-bold text-slate-500 whitespace-nowrap uppercase">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-filter" className="w-[130px] bg-white border-slate-200 text-xs">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400 font-semibold">Loading addon products...</p>
            </div>
          ) : paginatedAddons.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Gift className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No Addon Products Found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                  ? 'No addons match your current search queries or filter selectors.' 
                  : 'Start by creating your very first checkout addon upsell product!'}
              </p>
              {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') ? (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }} 
                  className="mt-4 bg-slate-800 text-white font-semibold"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate('/admin/addons/new')} className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold">
                  Create Addon
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                    <th className="p-4 w-20">Image</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100/50" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1.5">
                        Name {sortBy === 'name' && <ArrowUpDown className="h-3.5 w-3.5 text-slate-600" />}
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100/50" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-1.5">
                        Category {sortBy === 'category' && <ArrowUpDown className="h-3.5 w-3.5 text-slate-600" />}
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100/50 text-right" onClick={() => handleSort('price')}>
                      <div className="flex items-center justify-end gap-1.5">
                        Price {sortBy === 'price' && <ArrowUpDown className="h-3.5 w-3.5 text-slate-600" />}
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100/50 text-right" onClick={() => handleSort('stock')}>
                      <div className="flex items-center justify-end gap-1.5">
                        Stock {sortBy === 'stock' && <ArrowUpDown className="h-3.5 w-3.5 text-slate-600" />}
                      </div>
                    </th>
                    <th className="p-4">Linked Rules</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100/50" onClick={() => handleSort('sortOrder')}>
                      <div className="flex items-center gap-1.5">
                        Sort Order {sortBy === 'sortOrder' && <ArrowUpDown className="h-3.5 w-3.5 text-slate-600" />}
                      </div>
                    </th>
                    <th className="p-4">Badge</th>
                    <th className="p-4 w-28">Status</th>
                    <th className="p-4 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 text-sm divide-y divide-slate-100">
                  {paginatedAddons.map((addon) => {
                    const priceDiff = addon.discountedPrice && addon.discountedPrice < addon.price;
                    const linkedCount = 
                      (addon.linkedCategories?.length || 0) + 
                      (addon.linkedOccasions?.length || 0) + 
                      (addon.linkedProducts?.length || 0);

                    return (
                      <tr key={addon._id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="p-4">
                          <div className="h-12 w-12 rounded-lg border border-slate-200 overflow-hidden bg-white">
                            <img
                              src={addon.image}
                              alt={addon.name}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-slate-800 text-base">{addon.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">SKU: {addon.SKU || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="p-4 capitalize">
                          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-0">
                            {addon.category.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          {priceDiff ? (
                            <div>
                              <p className="font-bold text-slate-800">₹{addon.discountedPrice}</p>
                              <p className="text-xs text-slate-400 line-through">₹{addon.price}</p>
                            </div>
                          ) : (
                            <p className="font-bold text-slate-800">₹{addon.price}</p>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-bold ${addon.stock < 5 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded' : 'text-slate-700'}`}>
                            {addon.stock}
                          </span>
                        </td>
                        <td className="p-4">
                          {linkedCount > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {addon.linkedCategories && addon.linkedCategories.length > 0 && (
                                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px]" variant="outline">
                                  {addon.linkedCategories.length} Categories
                                </Badge>
                              )}
                              {addon.linkedOccasions && addon.linkedOccasions.length > 0 && (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[10px]" variant="outline">
                                  {addon.linkedOccasions.length} Occasions
                                </Badge>
                              )}
                              {addon.linkedProducts && addon.linkedProducts.length > 0 && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]" variant="outline">
                                  {addon.linkedProducts.length} Products
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Fallback (Bestseller)</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-mono font-semibold">
                          {addon.sortOrder}
                        </td>
                        <td className="p-4">
                          {addon.badge ? (
                            <Badge className="bg-pink-100 text-pink-700 border-0 text-[10px] font-bold">
                              {addon.badge}
                            </Badge>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={addon.active}
                              onCheckedChange={() => toggleActiveStatus(addon)}
                            />
                            <span className={`text-xs font-bold ${addon.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {addon.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/addons/edit/${addon._id}`)}
                              className="h-8 w-8 text-slate-600 hover:text-slate-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(addon._id, addon.name)}
                              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {!loading && filteredAndSortedAddons.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 select-none">
          <p className="text-xs font-bold text-slate-400 uppercase">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedAddons.length)} of {filteredAndSortedAddons.length} Addons
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="page-size" className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Show</Label>
              <Select 
                value={String(pageSize)} 
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="page-size" className="w-[70px] h-8 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="h-8 w-8 rounded-md text-slate-500 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'secondary' : 'ghost'}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-md text-xs font-bold ${currentPage === page ? 'bg-pink-50 text-pink-600' : 'text-slate-600'}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="h-8 w-8 rounded-md text-slate-500 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonManagement;
