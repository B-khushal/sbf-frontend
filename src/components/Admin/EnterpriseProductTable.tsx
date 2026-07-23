import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/config";
import productService, { ProductData } from "@/services/productService";
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  CheckCircle,
  AlertTriangle,
  Star,
  Plus,
  LayoutGrid,
  List,
  Zap,
  Sparkles,
  Truck,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  MoveUp,
  MoveDown
} from "lucide-react";

interface EnterpriseProductTableProps {
  products: ProductData[];
  loading?: boolean;
  catalogTypeFilter?: string;
  onRefresh?: () => void;
  onEditProduct?: (product: ProductData) => void;
}

export const EnterpriseProductTable: React.FC<EnterpriseProductTableProps> = ({
  products,
  loading = false,
  catalogTypeFilter = "all",
  onRefresh,
  onEditProduct,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedProducts, setOrderedProducts] = useState<ProductData[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"title" | "price" | "stock" | "rating" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Extract unique categories for filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Catalog type filter
        if (catalogTypeFilter !== "all") {
          const cat = (p.category || "").toLowerCase();
          const cType = (p.catalogType || "").toLowerCase();

          if (catalogTypeFilter === "cake") {
            if (cType !== "cake" && !cat.includes("cake")) return false;
          } else if (catalogTypeFilter === "plant") {
            if (cType !== "plant" && !cat.includes("plant")) return false;
          } else if (catalogTypeFilter === "chocolate") {
            const subcat = (p.subcategory || "").toLowerCase();
            const title = (p.title || "").toLowerCase();
            if (cType === "bouquet" || cat.includes("bouquet") || subcat.includes("bouquet") || title.includes("bouquet")) return false;
            if (cType !== "chocolate" && !cat.includes("chocolate") && !cat.includes("confectionery") && !cat.includes("sweets")) return false;
          } else if (catalogTypeFilter === "hamper") {
            if (cType !== "hamper" && !cat.includes("hamper") && !cat.includes("basket")) return false;
          } else if (catalogTypeFilter === "combo") {
            if (cType !== "combo" && !cat.includes("combo")) return false;
          } else if (catalogTypeFilter === "addon") {
            if (cType !== "addon" && !cat.includes("addon") && !cat.includes("add-on")) return false;
          } else if (catalogTypeFilter === "bouquet") {
            const subcat = (p.subcategory || "").toLowerCase();
            const title = (p.title || "").toLowerCase();
            const isBouquetItem = cat.includes("bouquet") || subcat.includes("bouquet") || title.includes("bouquet");
            if (cType === "cake" || cat.includes("cake")) return false;
            if (cType === "plant" || cat.includes("plant")) return false;
            if ((cType === "chocolate" || cat.includes("chocolate") || cat.includes("confectionery")) && !isBouquetItem) return false;
            if (cType === "hamper" || (cat.includes("hamper") && !cat.includes("basket") && !isBouquetItem)) return false;
            if (cType === "combo" || (cat.includes("combo") && !isBouquetItem)) return false;
            if (cType === "addon" || cat.includes("addon") || cat.includes("add-on")) return false;
            if (cType && cType !== "bouquet" && !isBouquetItem) return false;
          } else {
            if (cType !== catalogTypeFilter) return false;
          }
        }

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

        // Status filter
        if (statusFilter === "published" && (p.hidden || p.status === "hidden" || p.status === "draft")) return false;
        if (statusFilter === "hidden" && !p.hidden && p.status !== "hidden") return false;
        if (statusFilter === "draft" && p.status !== "draft") return false;

        return true;
      })
      .sort((a, b) => {
        let compA: any = a.createdAt || "";
        let compB: any = b.createdAt || "";

        if (sortField === "title") {
          compA = a.title.toLowerCase();
          compB = b.title.toLowerCase();
        } else if (sortField === "price") {
          compA = a.price || 0;
          compB = b.price || 0;
        } else if (sortField === "stock") {
          compA = a.countInStock || 0;
          compB = b.countInStock || 0;
        } else if (sortField === "rating") {
          compA = a.rating || 0;
          compB = b.rating || 0;
        }

        if (compA < compB) return sortOrder === "asc" ? -1 : 1;
        if (compA > compB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [products, catalogTypeFilter, searchTerm, categoryFilter, stockFilter, statusFilter, sortField, sortOrder]);

  // Keep orderedProducts in sync with filteredProducts
  React.useEffect(() => {
    setOrderedProducts(filteredProducts);
  }, [filteredProducts]);

  // Move product sequence position up/down
  const handleMoveItem = (index: number, direction: "up" | "down", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= orderedProducts.length) return;
    const updated = [...orderedProducts];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setOrderedProducts(updated);
  };

  // Save product sequence order to backend
  const handleSaveOrderSequence = async () => {
    setIsSavingOrder(true);
    try {
      const sectionName = categoryFilter !== "all" 
        ? `category:${categoryFilter}` 
        : catalogTypeFilter !== "all" 
          ? `category:${catalogTypeFilter}` 
          : "shop";
      
      const displayOrders: Record<string, number> = {};
      orderedProducts.forEach((p, idx) => {
        if (p._id) displayOrders[p._id] = idx + 1;
      });

      await productService.updateSectionProductsOrder(sectionName, displayOrders);
      toast({
        title: "Sequence Order Saved",
        description: `Product display sequence saved for section: ${sectionName}`,
      });
      setIsReorderMode(false);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Save Sequence",
        description: error.message || "Could not save section product order sequence.",
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  const productsToDisplay = isReorderMode ? orderedProducts : filteredProducts;

  // Bulk Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map((p) => p._id!).filter(Boolean));
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

  // Bulk Action Execution (supports single card action targetIds or selectedIds)
  const handleBulkAction = async (action: string, targetIdsOrPayload?: any) => {
    const ids = Array.isArray(targetIdsOrPayload) && targetIdsOrPayload.length > 0 && typeof targetIdsOrPayload[0] === "string"
      ? targetIdsOrPayload
      : selectedIds;

    if (!ids || ids.length === 0) {
      toast({
        variant: "destructive",
        title: "No Products Selected",
        description: "Please select products to perform this action.",
      });
      return;
    }

    try {
      await productService.executeBulkAction(action, ids);
      toast({
        title: "Action Complete",
        description: `Successfully executed '${action}' on ${ids.length} product(s).`,
      });
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message || "An error occurred during operation.",
      });
    }
  };

  // Toggle Visibility for single product
  const handleToggleVisibility = async (product: ProductData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await productService.toggleVisibility(product._id!);
      toast({
        title: "Visibility Updated",
        description: `${product.title} is now ${product.hidden ? "visible" : "hidden"}.`,
      });
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    }
  };

  // Toggle New Status
  const handleToggleNew = async (product: ProductData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update new status.",
      });
    }
  };

  // Toggle Same Day Status
  const handleToggleSameDay = async (product: ProductData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const nextVal = !(product.sameDay !== false);
      await productService.updateProduct(product._id!, {
        ...product,
        sameDay: nextVal,
      });
      toast({
        title: "Same Day Status Updated",
        description: `${product.title} Same Day delivery is now ${nextVal ? "enabled" : "disabled"}.`,
      });
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update same day status.",
      });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Title", "SKU", "CatalogType", "Category", "Price", "Discount", "Stock", "Status", "Rating"];
    const rows = filteredProducts.map((p) => [
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.sku || ""}"`,
      `"${p.catalogType || "bouquet"}"`,
      `"${p.category || ""}"`,
      p.price,
      p.discount || 0,
      p.countInStock,
      p.hidden ? "Hidden" : "Published",
      p.rating || 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `catalog_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Smart Filters Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products by title, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock (≤5)</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant={isReorderMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsReorderMode((prev) => !prev)}
              className={`h-9 text-xs gap-1.5 font-medium ${
                isReorderMode
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-sm"
                  : "text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              }`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {isReorderMode ? "Exit Reorder" : "Reorder Products"}
            </Button>
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-2.5 text-xs gap-1 ${viewMode === "grid" ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`h-8 px-2.5 text-xs gap-1 ${viewMode === "table" ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
              >
                <List className="h-3.5 w-3.5" /> Table
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-20 bg-slate-900 text-white p-3 rounded-xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
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
            {/* Same Day Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0 gap-1">
                  <Truck className="h-3 w-3" /> Same Day <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("sameday_enable")}>
                  Enable Same-Day Delivery
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("sameday_disable")}>
                  Disable Same-Day Delivery
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Featured Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white border-0 gap-1">
                  <Star className="h-3 w-3 fill-current" /> Featured <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("featured_enable")}>
                  Mark as Featured
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("featured_disable")}>
                  Remove Featured
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Arrival Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white border-0 gap-1">
                  <Sparkles className="h-3 w-3" /> New Badge <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("new_enable")}>
                  Mark as New Arrival
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("new_disable")}>
                  Remove New Badge
                </DropdownMenuItem>
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

      {/* Reorder Mode Banner */}
      {isReorderMode && (
        <div className="sticky top-2 z-20 bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-3.5 rounded-xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-400 text-purple-950 font-bold px-2 py-0.5">Reorder Mode Active</Badge>
            <span className="text-xs font-medium text-purple-200 hidden sm:inline">
              Use Move Up/Down buttons on cards to adjust sequence position, then save.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={isSavingOrder}
              onClick={handleSaveOrderSequence}
              className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold border-0 gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isSavingOrder ? "Saving Sequence..." : "Save Sequence"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsReorderMode(false)}
              className="h-8 text-xs text-white border-purple-400/50 hover:bg-purple-800/50"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Products Display (Grid or Table) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-500">
              Loading product catalog...
            </div>
          ) : productsToDisplay.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-500">
              No products found matching the criteria.
            </div>
          ) : (
            productsToDisplay.map((product, index) => {
              const isSelected = selectedIds.includes(product._id!);

              return (
                <Card
                  key={product._id}
                  onClick={() => {
                    if (onEditProduct) {
                      onEditProduct(product);
                    } else {
                      navigate(`/admin/products/edit/${product._id}`);
                    }
                  }}
                  className={`group relative cursor-pointer overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl ${
                    isSelected ? "ring-2 ring-emerald-500 bg-emerald-50/10" : ""
                  }`}
                >
                  {/* Card Image Header */}
                  <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* NEW Pill Badge (Top Left) */}
                    {Boolean(product.isNew || product.isNewArrival) && (
                      <span className="absolute top-2.5 left-2.5 z-10 bg-[#3b82f6] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                        NEW
                      </span>
                    )}

                    {/* Sequence Rank Badge in Reorder Mode */}
                    {isReorderMode && (
                      <span className="absolute top-2.5 left-14 z-10 bg-purple-900/90 text-purple-200 font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm border border-purple-400/40">
                        #{index + 1}
                      </span>
                    )}

                    {/* Checkbox Box (Top Right) */}
                    <div
                      className="absolute top-2.5 right-2.5 z-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1 shadow-sm flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectOne(product._id!, Boolean(checked))}
                        className="h-4 w-4 border-slate-400"
                      />
                    </div>

                    {/* Reorder Up/Down Floating Controls */}
                    {isReorderMode && (
                      <div
                        className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={index === 0}
                          onClick={(e) => handleMoveItem(index, "up", e)}
                          className="h-6 w-6 text-white hover:bg-slate-700 rounded disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={index === productsToDisplay.length - 1}
                          onClick={(e) => handleMoveItem(index, "down", e)}
                          className="h-6 w-6 text-white hover:bg-slate-700 rounded disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Card Content Section */}
                  <CardContent className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category Pill & Stock Pill Row */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="bg-[#c084fc] text-purple-950 font-bold text-[11px] capitalize px-3 py-0.5 rounded-full">
                          {product.category || product.catalogType || "flowers"}
                        </span>
                        <span className="bg-[#dcfce7] text-[#166534] font-bold text-[11px] px-3 py-0.5 rounded-full">
                          {product.countInStock}
                        </span>
                      </div>

                      {/* Product Title */}
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        {product.title}
                      </h3>

                      <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />

                      {/* Formatted Price */}
                      <p className="font-bold text-base text-[#d946ef]">
                        ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>

                      <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />

                      {/* Switch Toggles List */}
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

                  {/* Card Action Footer Bar */}
                  <div className="bg-[#f8fafc] dark:bg-slate-800/50 px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around text-xs font-semibold rounded-b-2xl">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEditProduct) {
                          onEditProduct(product);
                        } else {
                          navigate(`/admin/products/edit/${product._id}`);
                        }
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
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead className="min-w-[200px]">
                <button
                  className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 font-semibold text-xs"
                  onClick={() => {
                    setSortField("title");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  Product Title & SKU <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-slate-900 font-semibold text-xs"
                  onClick={() => {
                    setSortField("price");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  Price <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-slate-900 font-semibold text-xs"
                  onClick={() => {
                    setSortField("stock");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  Stock <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-slate-500 text-xs">
                  Loading product catalog...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-slate-500 text-xs">
                  No products found matching the criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedIds.includes(product._id!);
                const isLowStock = (product.countInStock || 0) > 0 && (product.countInStock || 0) <= 5;
                const isOutOfStock = (product.countInStock || 0) <= 0;

                return (
                  <TableRow
                    key={product._id}
                    className={isSelected ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectOne(product._id!, Boolean(checked))}
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                          {product.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {product.sku || product._id?.slice(-8)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px] font-medium">
                        {product.catalogType || "bouquet"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {product.category || "General"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-bold text-xs">₹{product.price}</span>
                        {product.discount ? (
                          <span className="text-[10px] text-emerald-600 block">-{product.discount}% OFF</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isOutOfStock ? "destructive" : isLowStock ? "outline" : "secondary"}
                        className={`text-[10px] font-semibold ${
                          isLowStock ? "border-orange-500 text-orange-600 bg-orange-50" : ""
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : `${product.countInStock} Left`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge
                          variant={product.hidden ? "outline" : "default"}
                          className={`text-[10px] ${
                            product.hidden ? "text-slate-500" : "bg-emerald-600 text-white"
                          }`}
                        >
                          {product.hidden ? "Hidden" : "Published"}
                        </Badge>
                        {product.sameDay !== false && (
                          <Badge className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5">
                            ⚡ Same Day
                          </Badge>
                        )}
                        {product.isFeatured && (
                          <Badge className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5">
                            ⭐ Featured
                          </Badge>
                        )}
                        {(product.isNew || product.isNewArrival) && (
                          <Badge className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5">
                            NEW
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-xs">Product Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEditProduct && onEditProduct(product)}>
                            <Edit className="h-3.5 w-3.5 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleVisibility(product)}>
                            {product.hidden ? <Eye className="h-3.5 w-3.5 mr-2" /> : <EyeOff className="h-3.5 w-3.5 mr-2" />}
                            {product.hidden ? "Publish Product" : "Hide Product"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600"
                            onClick={() => handleBulkAction("delete", [product._id])}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      )}
    </div>
  );
};
