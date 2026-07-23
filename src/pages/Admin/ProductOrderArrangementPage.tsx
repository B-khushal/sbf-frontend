import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/config";
import productService, { ProductData } from "@/services/productService";
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  MoreVertical,
  Truck,
  Sparkles,
  Star,
  CheckCircle,
  GripVertical,
  ChevronDown,
  RotateCcw,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

const SECTION_OPTIONS = [
  { value: "none", label: "✨ Standard Products List" },
  { value: "featured", label: "⭐ Featured Products" },
  { value: "shop", label: "🛒 Shop Page" },
  { value: "newArrivals", label: "🆕 New Arrivals" },
  { value: "recommended", label: "💡 Recommended Products" },
  { value: "valentine", label: "❤️ Valentine's Day" },
  { value: "mothersDay", label: "🤱 Mother's Day" },
  { value: "fathersDay", label: "👨 Father's Day" },
  { value: "friendshipDay", label: "🤝 Friendship Day" },
  { value: "rakhi", label: "🪔 Rakhi / Raksha Bandhan" },
  { value: "diwali", label: "🪔 Diwali" },
  { value: "christmas", label: "🎄 Christmas" },
  { value: "new-year", label: "🎆 New Year" },
];

export const ProductOrderArrangementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState("none");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [sortSectionProducts, setSortSectionProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [newFilter, setNewFilter] = useState("all");

  // Dynamic Categories list
  const [categories, setCategories] = useState<string[]>([]);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // When activeSection changes, load sorting section products
  useEffect(() => {
    loadSectionData(activeSection);
  }, [activeSection]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();
      const allProds = Array.isArray(res) ? res : res.products || [];
      setProducts(allProds);

      // Extract unique categories
      const catSet = new Set<string>();
      allProds.forEach((p) => {
        if (p.category) catSet.add(p.category);
      });
      setCategories(Array.from(catSet));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Products",
        description: error.message || "Failed to load product catalog.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSectionData = async (section: string) => {
    try {
      setLoading(true);
      if (section === "none") {
        const res = await productService.getAllProducts();
        const allProds = Array.isArray(res) ? res : res.products || [];
        setSortSectionProducts(allProds);
      } else {
        const data = await productService.getSectionProductsForSorting(section);
        setSortSectionProducts(data.products || []);
      }
      setIsChanged(false);
      setSelectedIds([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Section Order",
        description: error.message || "Failed to load products for section.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtered sorting products
  const visibleProducts = useMemo(() => {
    return sortSectionProducts.filter((p) => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesSku = p.sku ? p.sku.toLowerCase().includes(term) : false;
        const matchesCat = p.category ? p.category.toLowerCase().includes(term) : false;
        if (!matchesTitle && !matchesSku && !matchesCat) return false;
      }

      // Category filter
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;

      // Stock filter
      if (stockFilter === "in_stock" && (p.countInStock || 0) <= 0) return false;
      if (stockFilter === "low_stock" && ((p.countInStock || 0) <= 0 || (p.countInStock || 0) > 5)) return false;
      if (stockFilter === "out_of_stock" && (p.countInStock || 0) > 0) return false;

      // Status / Visibility filter
      if (statusFilter === "published" && (p.hidden || p.status === "hidden")) return false;
      if (statusFilter === "hidden" && !p.hidden) return false;

      // Featured filter
      if (featuredFilter === "featured" && !p.isFeatured) return false;
      if (featuredFilter === "not_featured" && p.isFeatured) return false;

      // New filter
      if (newFilter === "new" && !(p.isNew || p.isNewArrival)) return false;
      if (newFilter === "not_new" && (p.isNew || p.isNewArrival)) return false;

      return true;
    });
  }, [sortSectionProducts, searchTerm, categoryFilter, stockFilter, statusFilter, featuredFilter, newFilter]);

  // Handle manual input of sequence number
  const handleOrderInputChange = (productId: string, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 1) return;
    const targetIdx = sortSectionProducts.findIndex((p) => p._id === productId);
    if (targetIdx === -1) return;

    const list = [...sortSectionProducts];
    const [movedItem] = list.splice(targetIdx, 1);

    // Insert at new position (1-indexed to 0-indexed)
    const insertIdx = Math.min(Math.max(0, newOrder - 1), list.length);
    list.splice(insertIdx, 0, movedItem);

    setSortSectionProducts(list);
    setIsChanged(true);
  };

  // Move product position up or down by 1
  const handleMove = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sortSectionProducts.length) return;

    const list = [...sortSectionProducts];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    setSortSectionProducts(list);
    setIsChanged(true);
  };

  // Drag & drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;

    const list = [...sortSectionProducts];
    const [draggedItem] = list.splice(draggedIndex, 1);
    list.splice(targetIdx, 0, draggedItem);

    setDraggedIndex(targetIdx);
    setSortSectionProducts(list);
    setIsChanged(true);
  };

  // Save sequence to backend
  const saveSectionOrder = async () => {
    try {
      setIsSaving(true);
      const displayOrders: Record<string, number> = {};
      sortSectionProducts.forEach((p, idx) => {
        if (p._id) displayOrders[p._id] = idx + 1;
      });

      await productService.updateSectionProductsOrder(activeSection, displayOrders);
      toast({
        title: "Display Order Saved",
        description: `Product sequence successfully saved for section: ${activeSection}`,
      });
      setIsChanged(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save section product display order.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset order to default
  const resetSectionOrder = async () => {
    try {
      setLoading(true);
      await productService.resetSectionProductsOrder(activeSection);
      toast({
        title: "Order Reset",
        description: `Order sequence reset to default for section: ${activeSection}`,
      });
      loadSectionData(activeSection);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message || "Failed to reset section order.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Select all / Select one for Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(visibleProducts.map((p) => p._id!));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Bulk action handler
  const handleBulkAction = async (action: string, targetIds?: string[]) => {
    const ids = targetIds || selectedIds;
    if (!ids || ids.length === 0) return;
    try {
      await productService.executeBulkAction(action, ids);
      toast({
        title: "Action Complete",
        description: `Successfully applied '${action}' on ${ids.length} products.`,
      });
      setSelectedIds([]);
      loadSectionData(activeSection);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message || "Error performing action.",
      });
    }
  };

  // Single toggle switches
  const handleToggleVisibility = async (product: ProductData) => {
    try {
      await productService.toggleVisibility(product._id!);
      toast({
        title: "Visibility Updated",
        description: `${product.title} is now ${product.hidden ? "visible" : "hidden"}.`,
      });
      loadSectionData(activeSection);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const handleToggleNew = async (product: ProductData) => {
    try {
      const nextVal = !(product.isNew || product.isNewArrival);
      await productService.updateProduct(product._id!, {
        ...product,
        isNew: nextVal,
        isNewArrival: nextVal,
      });
      toast({
        title: "New Status Updated",
        description: `${product.title} is now ${nextVal ? "marked as New" : "unmarked"}.`,
      });
      loadSectionData(activeSection);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const handleToggleSameDay = async (product: ProductData) => {
    try {
      const nextVal = !(product.sameDay !== false);
      await productService.updateProduct(product._id!, {
        ...product,
        sameDay: nextVal,
      });
      toast({
        title: "Same Day Updated",
        description: `${product.title} Same Day delivery is now ${nextVal ? "enabled" : "disabled"}.`,
      });
      loadSectionData(activeSection);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const activeSectionLabel =
    SECTION_OPTIONS.find((s) => s.value === activeSection)?.label ||
    (activeSection.startsWith("category:") ? `📂 Category: ${activeSection.replace("category:", "")}` : activeSection);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Products Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage product order arrangement, display sequences, and bulk status updates for all sections.
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button className="bg-[#ec4899] hover:bg-[#db2777] text-white font-medium text-xs shadow-sm gap-1.5 rounded-xl">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      {/* Control Box: Manage Order For Dropdown */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
          <span className="font-bold text-sm text-slate-700 dark:text-slate-300 shrink-0">
            Manage Order For:
          </span>

          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="w-full md:w-[320px] h-10 text-xs font-semibold bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <SelectValue placeholder="Select section to manage order" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Standard Sections
              </div>
              {SECTION_OPTIONS.map((sec) => (
                <SelectItem key={sec.value} value={sec.value} className="text-xs font-medium">
                  {sec.label}
                </SelectItem>
              ))}

              <DropdownMenuSeparator className="my-1" />
              <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Product Categories
              </div>
              {categories.map((cat) => (
                <SelectItem key={`category:${cat}`} value={`category:${cat}`} className="text-xs font-medium capitalize">
                  📁 Category: {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isChanged && (
            <Badge className="bg-amber-500 text-white text-[11px] animate-pulse py-1 px-2.5 rounded-lg ml-auto">
              ⚠️ Unsaved Order Changes
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Smart Filters Bar */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 md:flex-initial">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products by title, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock (≤5)</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Featured Filter */}
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Featured</SelectItem>
                <SelectItem value="featured">⭐ Featured Only</SelectItem>
                <SelectItem value="not_featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            {/* New Status Filter */}
            <Select value={newFilter} onValueChange={setNewFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="New Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="new">🆕 New Products</SelectItem>
                <SelectItem value="not_new">Regular Products</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-900">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`h-8 px-2.5 text-xs gap-1 rounded-lg ${viewMode === "table" ? "bg-emerald-600 text-white" : ""}`}
              >
                <List className="h-3.5 w-3.5" /> Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-2.5 text-xs gap-1 rounded-lg ${viewMode === "grid" ? "bg-emerald-600 text-white" : ""}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid Cards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-30 bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Badge className="bg-emerald-500 text-slate-950 font-bold">{selectedIds.length}</Badge>
            <span>Products Selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={() => handleBulkAction("publish")}>
              Publish
            </Button>
            <Button size="sm" variant="secondary" className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0" onClick={() => handleBulkAction("hide")}>
              Hide
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0 gap-1">
                  <Truck className="h-3 w-3" /> Same Day <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("sameday_enable")}>Enable Same Day</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("sameday_disable")}>Disable Same Day</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white border-0 gap-1">
                  <Star className="h-3 w-3 fill-current" /> Featured <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("featured_enable")}>Mark Featured</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("featured_disable")}>Remove Featured</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white border-0 gap-1">
                  <Sparkles className="h-3 w-3" /> New Badge <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("new_enable")}>Mark New</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("new_disable")}>Remove New</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="secondary" className="h-8 text-xs bg-slate-700 hover:bg-slate-600 text-white border-0" onClick={() => handleBulkAction("duplicate")}>
              Duplicate
            </Button>
            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleBulkAction("delete")}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Main Sorting Section Card */}
      <Card className="shadow-lg border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              📂 Sorting: <span className="text-[#ec4899] font-bold">{activeSectionLabel}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag handle (⋮⋮) or edit order numbers to change sequence. Recalculates automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={resetSectionOrder}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 h-9 text-xs font-semibold rounded-xl gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Order Numbers
            </Button>
            <Button
              size="sm"
              onClick={saveSectionOrder}
              disabled={isSaving || !isChanged}
              className="bg-[#ec4899] hover:bg-[#db2777] text-white font-bold h-9 text-xs rounded-xl gap-1.5 shadow-sm"
            >
              <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving Order..." : "Save Display Order"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing <strong>{visibleProducts.length}</strong> of <strong>{sortSectionProducts.length}</strong> products in this section
            </span>
            <span>
              Categories: <strong>{categories.length}</strong>
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              Loading products for section...
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No products found matching the filter criteria in this section.
            </div>
          ) : viewMode === "table" ? (
            /* Table Mode for Section Reordering */
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                  <TableRow>
                    <TableHead className="w-[45px]">
                      <Checkbox
                        checked={visibleProducts.length > 0 && selectedIds.length === visibleProducts.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="w-[80px]">Order #</TableHead>
                    <TableHead className="w-[70px]">Thumb</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Placement Badges</TableHead>
                    <TableHead className="w-[110px]">Edit Order</TableHead>
                    <TableHead className="w-[100px] text-right">Price</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.map((product, index) => {
                    const isSelected = selectedIds.includes(product._id!);
                    const orderNum = index + 1;

                    return (
                      <TableRow
                        key={product._id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        className={`transition-colors ${
                          isSelected ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectOne(product._id!, Boolean(checked))}
                          />
                        </TableCell>
                        <TableCell className="cursor-grab active:cursor-grabbing text-slate-400">
                          <GripVertical className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            {orderNum}
                          </span>
                        </TableCell>
                        <TableCell>
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p
                              onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                              className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-pink-600 cursor-pointer line-clamp-1"
                            >
                              {product.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {product.sku || product._id?.slice(-8)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {product.isFeatured && (
                              <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 border border-amber-300 text-[10px] font-semibold gap-1 py-0.5">
                                ⭐ Featured
                              </Badge>
                            )}
                            <Badge
                              className={
                                product.hidden
                                  ? "bg-slate-100 text-slate-600 border border-slate-300 text-[10px]"
                                  : "bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] gap-1"
                              }
                            >
                              {product.hidden ? "🙈 Hidden" : "👁️ Visible"}
                            </Badge>
                            {Boolean(product.isNew || product.isNewArrival) && (
                              <Badge className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] gap-1">
                                🆕 New
                              </Badge>
                            )}
                            {product.sameDay !== false && (
                              <Badge className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] gap-1">
                                ⚡ Same Day
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] capitalize bg-purple-50 text-purple-900 border-purple-200">
                              📁 {product.category || product.catalogType || "flowers"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            max={sortSectionProducts.length}
                            value={orderNum}
                            onChange={(e) => handleOrderInputChange(product._id!, parseInt(e.target.value))}
                            className="h-8 w-16 text-center text-xs font-bold rounded-lg"
                          />
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs text-pink-600">
                          ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={index === 0}
                              onClick={() => handleMove(index, "up")}
                              className="h-7 w-7 text-slate-500 hover:text-slate-900"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={index === visibleProducts.length - 1}
                              onClick={() => handleMove(index, "down")}
                              className="h-7 w-7 text-slate-500 hover:text-slate-900"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Grid Mode for Section Reordering */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleProducts.map((product, index) => {
                const isSelected = selectedIds.includes(product._id!);
                const orderNum = index + 1;

                return (
                  <Card
                    key={product._id}
                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                    className={`group relative cursor-pointer overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl ${
                      isSelected ? "ring-2 ring-emerald-500 bg-emerald-50/10" : ""
                    }`}
                  >
                    {/* Image Header */}
                    <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* NEW Pill Badge */}
                      {Boolean(product.isNew || product.isNewArrival) && (
                        <span className="absolute top-2.5 left-2.5 z-10 bg-[#3b82f6] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                          NEW
                        </span>
                      )}

                      {/* Order Position Badge */}
                      <span className="absolute top-2.5 left-14 z-10 bg-pink-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                        #{orderNum}
                      </span>

                      {/* Checkbox */}
                      <div
                        className="absolute top-2.5 right-2.5 z-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(product._id!, Boolean(checked))}
                          className="h-4 w-4 border-slate-400"
                        />
                      </div>

                      {/* Up / Down Move Controls */}
                      <div
                        className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={index === 0}
                          onClick={() => handleMove(index, "up")}
                          className="h-6 w-6 text-white hover:bg-slate-700 rounded disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={index === visibleProducts.length - 1}
                          onClick={() => handleMove(index, "down")}
                          className="h-6 w-6 text-white hover:bg-slate-700 rounded disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="bg-[#c084fc] text-purple-950 font-bold text-[11px] capitalize px-3 py-0.5 rounded-full">
                            {product.category || product.catalogType || "flowers"}
                          </span>
                          <span className="bg-[#dcfce7] text-[#166534] font-bold text-[11px] px-3 py-0.5 rounded-full">
                            {product.countInStock}
                          </span>
                        </div>

                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                          {product.title}
                        </h3>

                        <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />

                        <p className="font-bold text-base text-[#d946ef]">
                          ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>

                        <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />

                        {/* Inline Switches */}
                        <div
                          className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">New Status:</span>
                            <Switch
                              checked={Boolean(product.isNew || product.isNewArrival)}
                              onCheckedChange={() => handleToggleNew(product)}
                              className="data-[state=checked]:bg-[#2563eb]"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Same Day:</span>
                            <Switch
                              checked={product.sameDay !== false}
                              onCheckedChange={() => handleToggleSameDay(product)}
                              className="data-[state=checked]:bg-[#2563eb]"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Visibility:</span>
                            <Switch
                              checked={!product.hidden}
                              onCheckedChange={() => handleToggleVisibility(product)}
                              className="data-[state=checked]:bg-[#16a34a]"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    {/* Footer */}
                    <div className="bg-[#f8fafc] dark:bg-slate-800/50 px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around text-xs font-semibold rounded-b-2xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/products/edit/${product._id}`);
                        }}
                        className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors"
                      >
                        <Edit className="h-4 w-4 text-slate-500" /> Edit
                      </button>
                      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkAction("delete", [product._id]);
                        }}
                        className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" /> Delete
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductOrderArrangementPage;
