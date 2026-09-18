import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/config";
import productService, { ProductData, OccasionData } from "@/services/productService";
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Truck,
  Sparkles,
  Star,
  GripVertical,
  ChevronDown,
  RotateCcw,
  Save,
  Undo,
  Redo,
  History,
  Move,
  CheckSquare,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
  Clock,
  PartyPopper,
} from "lucide-react";

const STANDARD_STOREFRONT_SECTIONS = [
  { value: "shop", label: "🛒 Shop Page (Global Catalog)" },
  { value: "featured", label: "⭐ Featured Products" },
  { value: "newArrivals", label: "🆕 New Arrivals" },
  { value: "recommended", label: "💡 Recommended Products" },
  { value: "none", label: "✨ Standard Products List" },
];

export const ProductOrderArrangementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState("shop");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [sortSectionProducts, setSortSectionProducts] = useState<ProductData[]>([]);
  const [initialProducts, setInitialProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // History stack for Undo / Redo
  const [undoStack, setUndoStack] = useState<ProductData[][]>([]);
  const [redoStack, setRedoStack] = useState<ProductData[][]>([]);

  // Drag & drop state (supports multi-selection drag)
  const [draggedProductIds, setDraggedProductIds] = useState<string[] | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [newFilter, setNewFilter] = useState("all");

  // Dynamic Categories and Occasions lists
  const [categories, setCategories] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<OccasionData[]>([]);

  // Bulk Move Modal State
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetMovePosition, setTargetMovePosition] = useState<number>(1);
  const [movePlacementMode, setMovePlacementMode] = useState<"custom" | "top" | "bottom">("custom");

  // Safety Confirmation Modal State
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Audit History Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  // Fetch initial catalog data and occasions list
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
      const res: any = await productService.getAllProducts();
      const allProds: ProductData[] = Array.isArray(res) ? res : res?.products || [];
      setProducts(allProds);

      // Extract unique categories
      const catSet = new Set<string>();
      allProds.forEach((p) => {
        if (p.category) catSet.add(p.category);
      });
      setCategories(Array.from(catSet));

      // Fetch dynamic occasions for Shop By Occasion ordering
      try {
        const occData = await productService.getAdminOccasions();
        if (Array.isArray(occData) && occData.length > 0) {
          setOccasions(occData.filter((o: any) => o.isActive !== false && o.status !== "inactive"));
        } else {
          const publicOccs = await productService.getOccasions();
          setOccasions(Array.isArray(publicOccs) ? publicOccs : []);
        }
      } catch (occErr) {
        console.warn("Could not load admin occasions, trying public:", occErr);
        try {
          const publicOccs = await productService.getOccasions();
          setOccasions(Array.isArray(publicOccs) ? publicOccs : []);
        } catch (e) {}
      }
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
      let loadedProds: ProductData[] = [];
      if (section === "none") {
        const res: any = await productService.getAllProducts();
        loadedProds = Array.isArray(res) ? res : res?.products || [];
      } else {
        const data = await productService.getSectionProductsForSorting(section);
        loadedProds = data.products || [];
      }

      setSortSectionProducts(loadedProds);
      setInitialProducts([...loadedProds]);
      setIsChanged(false);
      setSelectedIds([]);
      setUndoStack([]);
      setRedoStack([]);
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

  // Map of original product index (1-based)
  const initialPosMap = useMemo(() => {
    const map = new Map<string, number>();
    initialProducts.forEach((p, idx) => {
      if (p._id) map.set(p._id, idx + 1);
    });
    return map;
  }, [initialProducts]);

  // Push new state to history for Undo
  const pushState = useCallback(
    (newList: ProductData[]) => {
      setUndoStack((prev) => [...prev.slice(-29), sortSectionProducts]);
      setRedoStack([]);
      setSortSectionProducts(newList);
      setIsChanged(true);
    },
    [sortSectionProducts]
  );

  // Undo action
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, sortSectionProducts]);
    setSortSectionProducts(previousState);
    setIsChanged(true);
    toast({
      title: "Action Undone (Ctrl+Z)",
      description: "Restored previous sequence state.",
    });
  }, [undoStack, sortSectionProducts, toast]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, sortSectionProducts]);
    setSortSectionProducts(nextState);
    setIsChanged(true);
    toast({
      title: "Action Redone (Ctrl+Y)",
      description: "Re-applied sequence state.",
    });
  }, [redoStack, sortSectionProducts, toast]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Escape") {
        if (selectedIds.length > 0) {
          setSelectedIds([]);
          toast({ description: "Selection cleared." });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, selectedIds, toast]);

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

  // Compute products that have moved compared to initial state
  const changedItemsSummary = useMemo(() => {
    return sortSectionProducts
      .map((p, currentIndex) => {
        const initialPos = initialPosMap.get(p._id!) || currentIndex + 1;
        const currentPos = currentIndex + 1;
        const diff = currentPos - initialPos;
        return {
          product: p,
          initialPos,
          currentPos,
          diff,
        };
      })
      .filter((item) => item.diff !== 0);
  }, [sortSectionProducts, initialPosMap]);

  // Manual input of sequence number
  const handleOrderInputChange = (productId: string, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 1) return;
    const targetIdx = sortSectionProducts.findIndex((p) => p._id === productId);
    if (targetIdx === -1) return;

    const list = [...sortSectionProducts];
    const [movedItem] = list.splice(targetIdx, 1);

    // Insert at new position (1-indexed to 0-indexed)
    const insertIdx = Math.min(Math.max(0, newOrder - 1), list.length);
    list.splice(insertIdx, 0, movedItem);

    pushState(list);
  };

  // Move single product up or down by 1
  const handleMove = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sortSectionProducts.length) return;

    const list = [...sortSectionProducts];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    pushState(list);
  };

  // Drag & Drop handlers (Multi-product aware)
  const handleDragStart = (product: ProductData) => {
    if (selectedIds.includes(product._id!)) {
      setDraggedProductIds(selectedIds);
    } else {
      setDraggedProductIds([product._id!]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedProductIds || draggedProductIds.length === 0) return;

    const draggedSet = new Set(draggedProductIds);
    const draggedItems = sortSectionProducts.filter((p) => draggedSet.has(p._id!));
    const remainingItems = sortSectionProducts.filter((p) => !draggedSet.has(p._id!));

    const insertIndex = Math.min(Math.max(0, targetIndex), remainingItems.length);

    const nextList = [
      ...remainingItems.slice(0, insertIndex),
      ...draggedItems,
      ...remainingItems.slice(insertIndex),
    ];

    pushState(nextList);
    setDraggedProductIds(null);
  };

  // Bulk Move Execution
  const executeBulkMove = () => {
    if (selectedIds.length === 0) return;

    let target1Indexed = targetMovePosition;
    if (movePlacementMode === "top") {
      target1Indexed = 1;
    } else if (movePlacementMode === "bottom") {
      target1Indexed = sortSectionProducts.length;
    }

    const selectedSet = new Set(selectedIds);
    const selectedItems = sortSectionProducts.filter((p) => selectedSet.has(p._id!));
    const remainingItems = sortSectionProducts.filter((p) => !selectedSet.has(p._id!));

    const insertIndex = Math.max(0, Math.min(target1Indexed - 1, remainingItems.length));
    const nextList = [
      ...remainingItems.slice(0, insertIndex),
      ...selectedItems,
      ...remainingItems.slice(insertIndex),
    ];

    pushState(nextList);
    setIsMoveModalOpen(false);
    toast({
      title: "Bulk Move Complete",
      description: `Moved ${selectedItems.length} products to position #${insertIndex + 1}.`,
    });
  };

  // Quick Selection Helpers
  const handleQuickSelect = (count: number | "all" | "visible" | "invert" | "none") => {
    if (count === "none") {
      setSelectedIds([]);
    } else if (count === "visible") {
      setSelectedIds(visibleProducts.map((p) => p._id!));
    } else if (count === "all") {
      setSelectedIds(sortSectionProducts.map((p) => p._id!));
    } else if (count === "invert") {
      const currentSet = new Set(selectedIds);
      const inverted = visibleProducts.filter((p) => !currentSet.has(p._id!)).map((p) => p._id!);
      setSelectedIds(inverted);
    } else if (typeof count === "number") {
      const slice = visibleProducts.slice(0, count).map((p) => p._id!);
      setSelectedIds(slice);
    }
  };

  const handleSelectAllVisible = (checked: boolean) => {
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

  // Save sequence to backend via atomic batch endpoint with audit logging
  const handleConfirmSave = async () => {
    try {
      setIsSaving(true);
      const displayOrders: Record<string, number> = {};
      sortSectionProducts.forEach((p, idx) => {
        if (p._id) displayOrders[p._id] = idx + 1;
      });

      const initialPositionsMap: Record<string, number> = {};
      initialProducts.forEach((p, idx) => {
        if (p._id) initialPositionsMap[p._id] = idx + 1;
      });

      const auditMetadata = {
        section: activeSection,
        totalProducts: sortSectionProducts.length,
        movedCount: changedItemsSummary.length,
        previousPositions: initialPositionsMap,
        newPositions: displayOrders,
        timestamp: new Date().toISOString(),
        topChanges: changedItemsSummary.slice(0, 10).map((c) => ({
          id: c.product._id,
          title: c.product.title,
          old: c.initialPos,
          new: c.currentPos,
        })),
      };

      await productService.bulkReorderProducts(activeSection, displayOrders, undefined, undefined, auditMetadata);

      toast({
        title: "Display Order Saved (Transaction-Safe)",
        description: `Successfully persisted sequence for ${sortSectionProducts.length} products in section '${activeSectionLabel}'.`,
      });

      setInitialProducts([...sortSectionProducts]);
      setIsChanged(false);
      setIsSafetyModalOpen(false);
      setUndoStack([]);
      setRedoStack([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to commit order changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch audit logs for current section
  const openAuditLogsModal = async () => {
    try {
      setIsAuditModalOpen(true);
      setIsAuditLoading(true);
      const res = await productService.getOrderAuditLogs(activeSection, 20);
      setAuditLogs(res.logs || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Logs",
        description: error.message || "Failed to load arrangement audit trail.",
      });
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Rollback order arrangement
  const handleRollback = async (auditLogId: string) => {
    try {
      setIsRollingBack(true);
      await productService.rollbackOrderChanges(auditLogId);
      toast({
        title: "Rollback Successful",
        description: "Restored product sequence from historical snapshot.",
      });
      setIsAuditModalOpen(false);
      loadSectionData(activeSection);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Rollback Failed",
        description: error.message || "Could not rollback to selected version.",
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  // Reset order to default
  const resetSectionOrder = async () => {
    try {
      setLoading(true);
      await productService.resetSectionProductsOrder(activeSection);
      toast({
        title: "Order Reset",
        description: `Order sequence reset to default for section: ${activeSectionLabel}`,
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

  // Standard Bulk actions handler (publish, hide, etc.)
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

  // Single product toggle handlers
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

  const activeSectionLabel = useMemo(() => {
    if (activeSection.startsWith("occasion:")) {
      const slug = activeSection.replace("occasion:", "");
      const found = occasions.find((o) => o.slug === slug);
      return found ? `🎉 Occasion: ${found.name}` : `🎉 Occasion: ${slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`;
    }
    if (activeSection.startsWith("category:")) {
      return `📁 Category: ${activeSection.replace("category:", "")}`;
    }
    return (
      STANDARD_STOREFRONT_SECTIONS.find((s) => s.value === activeSection)?.label ||
      activeSection
    );
  }, [activeSection, occasions]);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Layers className="h-6 w-6 text-[#ec4899]" />
              Smart Order Manager
            </h1>
            <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Enterprise
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Visual merchandising suite for Storefront Sections, Categories, and <strong>Shop by Occasion</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audit History & Rollback Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={openAuditLogsModal}
            className="h-9 text-xs font-semibold rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 shadow-sm"
          >
            <History className="h-4 w-4 text-purple-600" />
            Audit History
          </Button>

          <Link to="/admin/products/new">
            <Button className="bg-[#ec4899] hover:bg-[#db2777] text-white font-medium text-xs shadow-sm gap-1.5 rounded-xl h-9">
              <Plus className="h-4 w-4" /> Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Scope Control Box & Undo/Redo Bar */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
        <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Scope:
            </span>

            <Select value={activeSection} onValueChange={setActiveSection}>
              <SelectTrigger className="w-full sm:w-[340px] h-10 text-xs font-semibold bg-pink-50/60 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-200 rounded-xl focus:ring-pink-500">
                <SelectValue placeholder="Select section to manage order" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Storefront Sections
                </div>
                {STANDARD_STOREFRONT_SECTIONS.map((sec) => (
                  <SelectItem key={sec.value} value={sec.value} className="text-xs font-medium">
                    {sec.label}
                  </SelectItem>
                ))}

                <DropdownMenuSeparator className="my-1" />
                <div className="px-2 py-1.5 text-[10px] font-bold text-pink-600 uppercase tracking-wider flex items-center justify-between">
                  <span>🎉 Shop By Occasion</span>
                  <span className="font-mono text-[9px] bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded-full">
                    {occasions.length}
                  </span>
                </div>
                {occasions.map((occ) => (
                  <SelectItem
                    key={`occasion:${occ.slug}`}
                    value={`occasion:${occ.slug}`}
                    className="text-xs font-medium"
                  >
                    🎁 {occ.name}
                  </SelectItem>
                ))}

                <DropdownMenuSeparator className="my-1" />
                <div className="px-2 py-1.5 text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center justify-between">
                  <span>📁 Product Categories</span>
                  <span className="font-mono text-[9px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
                    {categories.length}
                  </span>
                </div>
                {categories.map((cat) => (
                  <SelectItem key={`category:${cat}`} value={`category:${cat}`} className="text-xs font-medium capitalize">
                    📁 Category: {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isChanged && (
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[11px] font-bold py-1 px-3 rounded-lg flex items-center gap-1.5 animate-pulse shadow-sm">
                <AlertTriangle className="h-3.5 w-3.5" />
                {changedItemsSummary.length} Unsaved Order Shifts
              </Badge>
            )}
          </div>

          {/* Quick Undo / Redo & Save Controls */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="h-9 px-3 text-xs font-semibold rounded-xl gap-1.5 border-slate-200 dark:border-slate-800"
              title="Undo last move (Ctrl+Z)"
            >
              <Undo className="h-3.5 w-3.5 text-slate-600" />
              Undo
              {undoStack.length > 0 && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-mono">
                  {undoStack.length}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="h-9 px-3 text-xs font-semibold rounded-xl gap-1.5 border-slate-200 dark:border-slate-800"
              title="Redo move (Ctrl+Y)"
            >
              <Redo className="h-3.5 w-3.5 text-slate-600" />
              Redo
            </Button>

            <Button
              size="sm"
              onClick={() => setIsSafetyModalOpen(true)}
              disabled={isSaving || !isChanged}
              className="bg-[#ec4899] hover:bg-[#db2777] text-white font-bold h-9 px-4 text-xs rounded-xl gap-1.5 shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : `Save Order (${changedItemsSummary.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Smart Filters Bar & Quick Select Controls */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 md:flex-initial">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filter by title, SKU..."
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
              <SelectTrigger className="w-[125px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock (≤5)</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Featured Filter */}
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-[120px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Featured</SelectItem>
                <SelectItem value="featured">⭐ Featured</SelectItem>
                <SelectItem value="not_featured">Regular</SelectItem>
              </SelectContent>
            </Select>

            {/* New Filter */}
            <Select value={newFilter} onValueChange={setNewFilter}>
              <SelectTrigger className="w-[110px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="New Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All New</SelectItem>
                <SelectItem value="new">🆕 New</SelectItem>
                <SelectItem value="not_new">Standard</SelectItem>
              </SelectContent>
            </Select>

            {/* Quick Select Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs font-semibold rounded-xl gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-pink-600" />
                  Select Range
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400">
                  Quick Select
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleQuickSelect(10)}>Top 10 Products</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickSelect(25)}>Top 25 Products</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickSelect(50)}>Top 50 Products</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickSelect(100)}>Top 100 Products</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleQuickSelect("visible")}>
                  All Visible ({visibleProducts.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickSelect("all")}>
                  All in Section ({sortSectionProducts.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickSelect("invert")}>Invert Selection</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleQuickSelect("none")} className="text-rose-600">
                  Clear Selection (Esc)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-900">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`h-8 px-2.5 text-xs gap-1 rounded-lg ${viewMode === "table" ? "bg-[#ec4899] text-white" : ""}`}
              >
                <List className="h-3.5 w-3.5" /> Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-2.5 text-xs gap-1 rounded-lg ${viewMode === "grid" ? "bg-[#ec4899] text-white" : ""}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-40 bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <Badge className="bg-[#ec4899] text-white text-xs px-2.5 py-1 rounded-lg shadow-sm">
              {selectedIds.length}
            </Badge>
            <span>Products Selected</span>
            <span className="text-slate-400 font-normal">| Drag any selected card to move cluster together</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* BULK MOVE POPUP TRIGGER */}
            <Button
              size="sm"
              onClick={() => {
                setTargetMovePosition(1);
                setIsMoveModalOpen(true);
              }}
              className="h-8 text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl gap-1.5 shadow-md"
            >
              <Move className="h-3.5 w-3.5" />
              Bulk Move Position ({selectedIds.length})
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-xl"
              onClick={() => handleBulkAction("publish")}
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0 rounded-xl"
              onClick={() => handleBulkAction("hide")}
            >
              Hide
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0 gap-1 rounded-xl">
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
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white border-0 gap-1 rounded-xl">
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
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white border-0 gap-1 rounded-xl">
                  <Sparkles className="h-3 w-3" /> New Badge <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("new_enable")}>Mark New</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("new_disable")}>Remove New</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs bg-slate-800 hover:bg-slate-700 text-white border-0 rounded-xl"
              onClick={() => handleBulkAction("duplicate")}
            >
              Duplicate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs rounded-xl"
              onClick={() => handleBulkAction("delete")}
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-slate-300 hover:text-white rounded-xl"
              onClick={() => setSelectedIds([])}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Sorting Section Card */}
      <Card className="shadow-lg border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              📂 Scope: <span className="text-[#ec4899] font-black">{activeSectionLabel}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag grab handle (⋮⋮) or edit sequence numbers. Sequence recalculates automatically without gaps or duplicates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={resetSectionOrder}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30 h-9 text-xs font-semibold rounded-xl gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Order
            </Button>

            <Button
              size="sm"
              onClick={() => setIsSafetyModalOpen(true)}
              disabled={isSaving || !isChanged}
              className="bg-[#ec4899] hover:bg-[#db2777] text-white font-bold h-9 text-xs rounded-xl gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save Display Order"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Results Summary & Diff Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground px-1 gap-2">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong>{visibleProducts.length}</strong> of <strong>{sortSectionProducts.length}</strong> products in sequence
              </span>
              {changedItemsSummary.length > 0 && (
                <Badge variant="outline" className="text-[11px] border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold">
                  ⚡ {changedItemsSummary.length} positions modified
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Shortcuts: <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Ctrl+Z</kbd> Undo | <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Ctrl+Y</kbd> Redo
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500 text-xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-2"></div>
              <p>Loading products for {activeSectionLabel}...</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs">
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
                        onCheckedChange={handleSelectAllVisible}
                      />
                    </TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="w-[100px]">Order #</TableHead>
                    <TableHead className="w-[70px]">Thumb</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Badges & Status</TableHead>
                    <TableHead className="w-[110px]">Edit Order</TableHead>
                    <TableHead className="w-[100px] text-right">Price</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.map((product, index) => {
                    const isSelected = selectedIds.includes(product._id!);
                    const orderNum = index + 1;
                    const initialPos = initialPosMap.get(product._id!) || orderNum;
                    const diff = orderNum - initialPos;

                    return (
                      <TableRow
                        key={product._id}
                        draggable
                        onDragStart={() => handleDragStart(product)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-pink-50/60 dark:bg-pink-950/20"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectOne(product._id!, Boolean(checked))}
                          />
                        </TableCell>
                        <TableCell className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                          <GripVertical className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 min-w-[32px] text-center">
                              #{orderNum}
                            </span>
                            {diff !== 0 && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  diff < 0
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                }`}
                                title={`Original position: #${initialPos}`}
                              >
                                {diff < 0 ? `▲${Math.abs(diff)}` : `▼${diff}`}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
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
                            className="h-8 w-16 text-center text-xs font-bold rounded-lg focus:ring-pink-500"
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
                const initialPos = initialPosMap.get(product._id!) || orderNum;
                const diff = orderNum - initialPos;

                return (
                  <Card
                    key={product._id}
                    draggable
                    onDragStart={() => handleDragStart(product)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                    className={`group relative cursor-pointer overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl ${
                      isSelected ? "ring-2 ring-[#ec4899] bg-pink-50/10" : ""
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

                      {/* Order Position Badge with Diff */}
                      <div className="absolute top-2.5 left-14 z-10 flex items-center gap-1">
                        <span className="bg-[#ec4899] text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
                          #{orderNum}
                        </span>
                        {diff !== 0 && (
                          <span
                            className={`font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow-sm ${
                              diff < 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                            }`}
                          >
                            {diff < 0 ? `▲${Math.abs(diff)}` : `▼${diff}`}
                          </span>
                        )}
                      </div>

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
                        className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-md"
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

                        <p className="font-bold text-base text-[#ec4899]">
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
                        className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-pink-600 transition-colors"
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

      {/* BULK MOVE POPUP MODAL */}
      <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Move className="h-5 w-5 text-pink-600" />
              Bulk Move Selected Products
            </DialogTitle>
            <DialogDescription className="text-xs">
              Reposition <strong>{selectedIds.length}</strong> selected products simultaneously.
              All other products shift naturally with zero duplicated sequence numbers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Scope:</span>
                <span className="font-bold">{activeSectionLabel}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Selected Products:</span>
                <span className="font-bold text-pink-600">{selectedIds.length} items</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Total in Sequence:</span>
                <span className="font-bold">{sortSectionProducts.length} items</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Placement Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={movePlacementMode === "top" ? "default" : "outline"}
                  onClick={() => setMovePlacementMode("top")}
                  className={`h-9 text-xs rounded-xl ${movePlacementMode === "top" ? "bg-pink-600 text-white" : ""}`}
                >
                  Top (#1)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={movePlacementMode === "custom" ? "default" : "outline"}
                  onClick={() => setMovePlacementMode("custom")}
                  className={`h-9 text-xs rounded-xl ${movePlacementMode === "custom" ? "bg-pink-600 text-white" : ""}`}
                >
                  Specific Position
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={movePlacementMode === "bottom" ? "default" : "outline"}
                  onClick={() => setMovePlacementMode("bottom")}
                  className={`h-9 text-xs rounded-xl ${movePlacementMode === "bottom" ? "bg-pink-600 text-white" : ""}`}
                >
                  Bottom (Last)
                </Button>
              </div>
            </div>

            {movePlacementMode === "custom" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Starting Position (1 to {sortSectionProducts.length}):
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={sortSectionProducts.length}
                    value={targetMovePosition}
                    onChange={(e) => setTargetMovePosition(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 text-base font-black text-center w-28 rounded-xl"
                  />
                  <span className="text-xs text-muted-foreground">
                    Selected products will take slots #{targetMovePosition} to #{Math.min(sortSectionProducts.length, targetMovePosition + selectedIds.length - 1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsMoveModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={executeBulkMove}
              className="bg-[#ec4899] hover:bg-[#db2777] text-white font-bold rounded-xl gap-1.5"
            >
              <Check className="h-4 w-4" />
              Apply Movement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SAFETY CONFIRMATION MODAL BEFORE SAVING */}
      <Dialog open={isSafetyModalOpen} onOpenChange={setIsSafetyModalOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Confirm Sequence Commit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review affected products before persisting changes to the live catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 flex-1 overflow-hidden flex flex-col py-1">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-800 dark:text-emerald-300 font-semibold">Scope: </span>
                <span className="font-black text-emerald-950 dark:text-emerald-100">{activeSectionLabel}</span>
              </div>
              <Badge className="bg-emerald-600 text-white font-bold">
                {changedItemsSummary.length} Modified Positions
              </Badge>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 overflow-y-auto max-h-[320px]">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[45px]">Thumb</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead className="w-[120px] text-center">Position Shift</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changedItemsSummary.map((item) => (
                    <TableRow key={item.product._id} className="text-xs">
                      <TableCell>
                        <img
                          src={getImageUrl(item.product.images?.[0])}
                          alt={item.product.title}
                          className="w-8 h-8 rounded object-cover border"
                        />
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.product.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {item.product.sku || item.product._id?.slice(-8)}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5 font-bold">
                          <span className="text-slate-400">#{item.initialPos}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className="text-pink-600">#{item.currentPos}</span>
                          <Badge
                            className={`text-[9px] px-1 py-0 ${
                              item.diff < 0
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {item.diff < 0 ? `▲${Math.abs(item.diff)}` : `▼${item.diff}`}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsSafetyModalOpen(false)} className="rounded-xl">
              Keep Editing
            </Button>
            <Button
              size="sm"
              disabled={isSaving}
              onClick={handleConfirmSave}
              className="bg-[#ec4899] hover:bg-[#db2777] text-white font-bold rounded-xl gap-1.5 shadow-md"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Persisting Batch..." : `Confirm & Save (${changedItemsSummary.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AUDIT LOGS & ONE-CLICK ROLLBACK MODAL */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="sm:max-w-[650px] rounded-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-slate-100">
              <History className="h-5 w-5 text-purple-600" />
              Arrangement Audit Trail & Rollback
            </DialogTitle>
            <DialogDescription className="text-xs">
              Every save is permanently audited. You can revert sequence changes with one click.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 flex-1 overflow-hidden flex flex-col py-1">
            {isAuditLoading ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
                <p>Loading audit logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No past audit records found for section '{activeSectionLabel}'.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 overflow-y-auto max-h-[360px]">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-[140px]">Date & Time</TableHead>
                      <TableHead className="w-[120px]">Admin</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead className="w-[100px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log: any) => {
                      const dateStr = new Date(log.createdAt || log.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      });
                      const details = log.details || {};
                      const movedCount = details.movedCount ?? details.affectedCount ?? "-";

                      return (
                        <TableRow key={log.id || log._id} className="text-xs">
                          <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {dateStr}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.user?.name || log.userEmail || "Admin Staff"}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-purple-700 dark:text-purple-300">
                              {log.description || `Reordered section ${log.entityId || activeSection}`}
                            </span>
                            {movedCount !== "-" && (
                              <Badge variant="outline" className="ml-2 text-[10px]">
                                {movedCount} shifted
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isRollingBack}
                              onClick={() => handleRollback(log.id || log._id)}
                              className="h-7 px-2.5 text-[11px] font-bold text-purple-600 border-purple-200 hover:bg-purple-50 dark:border-purple-900 dark:hover:bg-purple-950/30 rounded-lg gap-1"
                            >
                              <RotateCcw className="h-3 w-3" /> Rollback
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsAuditModalOpen(false)} className="rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductOrderArrangementPage;
