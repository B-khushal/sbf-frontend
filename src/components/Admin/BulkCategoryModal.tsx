import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/config";
import productService, { ProductData } from "@/services/productService";
import categoryService, { Category } from "@/services/categoryService";
import {
  FolderTree,
  Tag,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Check,
  Search,
  ArrowRight,
  Info,
  CheckCircle2,
  X,
  AlertCircle,
  Flower2,
} from "lucide-react";

interface BulkCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: ProductData[];
  onSuccess: () => void;
  catalogTypeFilter?: string;
}

const DEFAULT_BOUQUET_SUBCATEGORIES = [
  "Hand Bouquets",
  "Box Arrangements",
  "Vase Arrangements",
  "Exotic Stems",
  "Heart Bouquets",
  "Flower Baskets",
  "Luxury Hatbox",
  "Single Stem",
  "Sleeve Bouquets",
  "Forever Roses",
  "Dome Arrangements",
  "Standing Arrangements",
];

const POPULAR_PRIMARY_CATEGORIES = [
  "Bouquets",
  "Roses",
  "Lilies",
  "Orchids",
  "Carnation",
  "Romantic Bouquets",
  "Anniversary",
  "Birthday",
  "Flower Baskets",
  "Premium Roses",
];

export const BulkCategoryModal: React.FC<BulkCategoryModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onSuccess,
  catalogTypeFilter = "bouquet",
}) => {
  const { toast } = useToast();
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Section 1: Primary Category
  const [changePrimary, setChangePrimary] = useState(false);
  const [primaryCategory, setPrimaryCategory] = useState<string>("");

  // Section 2: Subcategory
  const [changeSubcategory, setChangeSubcategory] = useState(false);
  const [subcategoryMode, setSubcategoryMode] = useState<"existing" | "new" | "clear">("existing");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [newSubcategoryName, setNewSubcategoryName] = useState<string>("");

  // Section 3: Additional Categories
  const [changeAdditional, setChangeAdditional] = useState(false);
  const [additionalMode, setAdditionalMode] = useState<"append" | "replace">("append");
  const [selectedAdditionalCats, setSelectedAdditionalCats] = useState<string[]>([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // Fetch categories on mount or open
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getCategories({ status: "active" });
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          const allData = await categoryService.getCategories();
          setCategories(allData || []);
        }
      } catch (err: any) {
        console.error("Failed to load categories:", err);
        try {
          const fallbackData = await categoryService.getCategories();
          setCategories(fallbackData || []);
        } catch (e) {
          // ignore fallback error
        }
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setChangePrimary(false);
      setPrimaryCategory("");
      setChangeSubcategory(false);
      setSubcategoryMode("existing");
      setSelectedSubcategory("");
      setNewSubcategoryName("");
      setChangeAdditional(false);
      setAdditionalMode("append");
      setSelectedAdditionalCats([]);
      setCategorySearchQuery("");
    }
  }, [isOpen]);

  // Comprehensive, deduplicated list of primary categories
  const allPrimaryCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug?: string }>();

    // 1. Add all categories from backend API
    categories.forEach((cat) => {
      const name = (cat.name || "").trim();
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          id: cat.id || cat._id || name,
          name,
          slug: cat.slug,
        });
      }
    });

    // 2. Add standard popular bouquet categories if missing
    POPULAR_PRIMARY_CATEGORIES.forEach((catName) => {
      if (!map.has(catName.toLowerCase())) {
        map.set(catName.toLowerCase(), {
          id: catName.toLowerCase(),
          name: catName,
          slug: catName.toLowerCase().replace(/\s+/g, "-"),
        });
      }
    });

    // 3. Add any categories found directly on the products
    selectedProducts.forEach((p) => {
      if (p.category && typeof p.category === "string" && p.category.trim()) {
        const name = p.category.trim();
        if (!map.has(name.toLowerCase())) {
          map.set(name.toLowerCase(), {
            id: name.toLowerCase(),
            name,
          });
        }
      }
      if (Array.isArray(p.categories)) {
        p.categories.forEach((c) => {
          if (typeof c === "string" && c.trim() && !map.has(c.toLowerCase().trim())) {
            const name = c.trim();
            map.set(name.toLowerCase(), {
              id: name.toLowerCase(),
              name,
            });
          }
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, selectedProducts]);

  // Unified list of subcategories
  const availableSubcategories = useMemo(() => {
    const set = new Set<string>();

    DEFAULT_BOUQUET_SUBCATEGORIES.forEach((s) => set.add(s));

    categories.forEach((c) => {
      if (c.parentId) {
        set.add(c.name);
      }
    });

    selectedProducts.forEach((p) => {
      if (p.subcategory && p.subcategory.trim()) {
        set.add(p.subcategory.trim());
      }
    });

    return Array.from(set).sort();
  }, [categories, selectedProducts]);

  // Filtered categories for secondary picker
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (!categorySearchQuery.trim()) return true;
      const q = categorySearchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    });
  }, [categories, categorySearchQuery]);

  // Toggle selection of secondary category chip
  const toggleAdditionalCategory = (catName: string) => {
    setSelectedAdditionalCats((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  // Check if any change option is active
  const hasChanges = changePrimary || changeSubcategory || changeAdditional;

  // Validation before submission
  const isValid = useMemo(() => {
    if (!hasChanges) return false;
    if (changePrimary && !primaryCategory.trim()) return false;
    if (changeSubcategory) {
      if (subcategoryMode === "existing" && !selectedSubcategory.trim()) return false;
      if (subcategoryMode === "new" && !newSubcategoryName.trim()) return false;
    }
    if (changeAdditional && selectedAdditionalCats.length === 0 && additionalMode === "replace") {
      // In replace mode, user must select at least one additional category or use append
      return true;
    }
    return true;
  }, [
    hasChanges,
    changePrimary,
    primaryCategory,
    changeSubcategory,
    subcategoryMode,
    selectedSubcategory,
    newSubcategoryName,
    changeAdditional,
    selectedAdditionalCats,
    additionalMode,
  ]);

  // Handle Submit
  const handleApplyChanges = async () => {
    if (!isValid || selectedProducts.length === 0) return;

    try {
      setIsSubmitting(true);
      const productIds = selectedProducts.map((p) => p._id!).filter(Boolean);

      const targetSubcategory =
        subcategoryMode === "clear"
          ? ""
          : subcategoryMode === "new"
          ? newSubcategoryName.trim()
          : selectedSubcategory.trim();

      const payload = {
        changePrimaryCategory: changePrimary,
        primaryCategory: changePrimary ? primaryCategory : undefined,
        changeSubcategory: changeSubcategory,
        subcategory: changeSubcategory ? targetSubcategory : undefined,
        clearSubcategory: changeSubcategory && subcategoryMode === "clear",
        isNewSubcategory: changeSubcategory && subcategoryMode === "new",
        changeAdditionalCategories: changeAdditional,
        additionalCategories: changeAdditional ? selectedAdditionalCats : undefined,
        additionalCategoriesMode: additionalMode,
      };

      const res = await productService.bulkUpdateProductTaxonomy(productIds, payload);

      toast({
        title: "Taxonomy Updated",
        description: res.message || `Successfully updated taxonomy on ${productIds.length} products.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Bulk category update error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.response?.data?.message || error.message || "Failed to update categories.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
        {/* Radiant Modal Header */}
        <DialogHeader className="p-5 pb-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-indigo-200 shadow-inner">
                <FolderTree className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold text-white tracking-tight">
                    Bulk Taxonomy & Category Manager
                  </DialogTitle>
                  <Badge className="bg-emerald-400 text-slate-950 font-extrabold text-[11px] px-2 py-0.5">
                    {selectedProducts.length} Selected
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-indigo-200/80 mt-0.5">
                  Update primary category, assign/create subcategories, or attach secondary categories across bouquet products.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Selected Products Carousel Preview Strip */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Selected Items:
          </span>
          {selectedProducts.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg shadow-xs shrink-0 max-w-[210px]"
              title={p.title}
            >
              <img
                src={getImageUrl(p.images?.[0])}
                alt={p.title}
                className="w-6 h-6 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                  {p.title}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold truncate">
                    {p.category || "Unassigned"}
                  </span>
                  {p.subcategory && (
                    <span className="text-[9px] text-slate-400 truncate">
                      • {p.subcategory}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* SECTION 1: Primary Category */}
          <div className={`p-4 rounded-xl border transition-all ${
            changePrimary
              ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80 shadow-xs"
              : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${changePrimary ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                  <FolderTree className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    1. Primary Category
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Assign a new main category for the selected bouquets.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {changePrimary ? "Active" : "Unchanged"}
                </span>
                <Switch
                  checked={changePrimary}
                  onCheckedChange={setChangePrimary}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>

            {changePrimary && (
              <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 space-y-3 animate-in fade-in duration-200">
                {/* Quick Select Popular Pills */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Popular Bouquet Categories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_PRIMARY_CATEGORIES.map((catName) => {
                      const isSelected = primaryCategory.toLowerCase() === catName.toLowerCase();
                      return (
                        <button
                          key={catName}
                          type="button"
                          onClick={() => setPrimaryCategory(catName)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 inline mr-1 stroke-[3]" />}
                          {catName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Choose from All Categories ({allPrimaryCategories.length})
                  </label>
                  <Select value={primaryCategory} onValueChange={setPrimaryCategory}>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-900 h-9 text-xs border-slate-300 dark:border-slate-700">
                      <SelectValue placeholder="Choose a primary category..." />
                    </SelectTrigger>
                    <SelectContent className="z-[200] max-h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                      {allPrimaryCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name} className="text-xs py-2 cursor-pointer">
                          <span className="font-medium">{cat.name}</span>
                          {cat.slug && (
                            <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                              ({cat.slug})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {primaryCategory && (
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                      <span>Primary Category will be set to: <strong>{primaryCategory}</strong></span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimaryCategory("")}
                      className="h-6 px-2 text-[10px] text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: Subcategory Assignment & Creation */}
          <div className={`p-4 rounded-xl border transition-all ${
            changeSubcategory
              ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80 shadow-xs"
              : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${changeSubcategory ? "bg-amber-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    2. Subcategory Assignment & Creation
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Assign an existing subcategory, create a brand-new subcategory, or clear subcategory.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {changeSubcategory ? "Active" : "Unchanged"}
                </span>
                <Switch
                  checked={changeSubcategory}
                  onCheckedChange={setChangeSubcategory}
                  className="data-[state=checked]:bg-amber-600"
                />
              </div>
            </div>

            {changeSubcategory && (
              <div className="pt-2 border-t border-amber-100 dark:border-amber-900/40 space-y-3 animate-in fade-in duration-200">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSubcategoryMode("existing")}
                    className={`py-1.5 px-2 rounded-md transition-all ${
                      subcategoryMode === "existing"
                        ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubcategoryMode("new")}
                    className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1 ${
                      subcategoryMode === "new"
                        ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Plus className="h-3 w-3" /> Create New
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubcategoryMode("clear")}
                    className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1 ${
                      subcategoryMode === "clear"
                        ? "bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>

                {/* Case 1: Select Existing Subcategory */}
                {subcategoryMode === "existing" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Choose Subcategory
                    </label>
                    <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-900 h-9 text-xs">
                        <SelectValue placeholder="Choose a subcategory..." />
                      </SelectTrigger>
                      <SelectContent className="z-[200] max-h-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                        {availableSubcategories.map((sub) => (
                          <SelectItem key={sub} value={sub} className="text-xs py-2 cursor-pointer">
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Case 2: Create Brand-New Subcategory */}
                {subcategoryMode === "new" && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Type New Subcategory Name
                    </label>
                    <Input
                      placeholder="e.g. Velvet Floral Boxes, Mini Hand Tied, Luxury Hydrangeas..."
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      className="bg-white dark:bg-slate-900 h-9 text-xs"
                      autoFocus
                    />
                    {newSubcategoryName.trim() && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Will create & assign: <strong>{newSubcategoryName.trim()}</strong></span>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-900 border-emerald-300">
                          Auto-registered in Catalog
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Case 3: Clear Subcategory */}
                {subcategoryMode === "clear" && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-lg flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300 font-medium">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>
                      Subcategory will be cleared on all {selectedProducts.length} selected products.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: Additional Categories Tagging */}
          <div className={`p-4 rounded-xl border transition-all ${
            changeAdditional
              ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/80 shadow-xs"
              : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${changeAdditional ? "bg-purple-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    3. Secondary & Additional Categories
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Attach bouquet products to multiple relevant store categories (e.g. Anniversary, Luxury, Birthday, Valentine).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {changeAdditional ? "Active" : "Unchanged"}
                </span>
                <Switch
                  checked={changeAdditional}
                  onCheckedChange={setChangeAdditional}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </div>

            {changeAdditional && (
              <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40 space-y-3 animate-in fade-in duration-200">
                {/* Mode Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Category Tagging Mode:
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAdditionalMode("append")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        additionalMode === "append"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Append (Add to existing)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdditionalMode("replace")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        additionalMode === "replace"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Replace Secondary Tags
                    </button>
                  </div>
                </div>

                {/* Search Bar for Category Picker */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search categories (e.g. Roses, Birthday, Luxury, Anniversary)..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-white dark:bg-slate-900"
                  />
                </div>

                {/* Active Selected Tags Strip */}
                {selectedAdditionalCats.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                        Selected Additional Categories ({selectedAdditionalCats.length}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedAdditionalCats([])}
                        className="text-[10px] text-rose-500 hover:underline font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-purple-100/50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800">
                      {selectedAdditionalCats.map((cat) => (
                        <Badge
                          key={cat}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-medium pl-2 pr-1 py-0.5 flex items-center gap-1 shadow-xs"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => toggleAdditionalCategory(cat)}
                            className="hover:bg-purple-800 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Multi-select Chips Grid */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                    Click categories to add/remove:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                    {filteredCategories.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 w-full text-center">
                        No categories found matching "{categorySearchQuery}".
                      </p>
                    ) : (
                      filteredCategories.map((cat) => {
                        const isSelected = selectedAdditionalCats.includes(cat.name);
                        return (
                          <button
                            key={cat.id || cat._id}
                            type="button"
                            onClick={() => toggleAdditionalCategory(cat.name)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                            }`}
                          >
                            {isSelected ? (
                              <Check className="h-3 w-3 stroke-[3]" />
                            ) : (
                              <Plus className="h-3 w-3 text-slate-400" />
                            )}
                            <span>{cat.name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Summary Box */}
          {hasChanges ? (
            <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1.5 border border-slate-800 shadow-md">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>Planned Updates Summary:</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-slate-300 text-[11px]">
                {changePrimary && (
                  <li>
                    Primary Category will be set to:{" "}
                    <strong className="text-white">{primaryCategory || "(None selected)"}</strong>
                  </li>
                )}
                {changeSubcategory && (
                  <li>
                    Subcategory will be{" "}
                    {subcategoryMode === "clear" ? (
                      <strong className="text-rose-400">cleared / removed</strong>
                    ) : (
                      <>
                        set to:{" "}
                        <strong className="text-white">
                          {subcategoryMode === "new" ? newSubcategoryName : selectedSubcategory || "(None selected)"}
                        </strong>
                      </>
                    )}
                  </li>
                )}
                {changeAdditional && (
                  <li>
                    Secondary Categories ({additionalMode} mode):{" "}
                    <strong className="text-white">
                      {selectedAdditionalCats.length > 0
                        ? selectedAdditionalCats.join(", ")
                        : additionalMode === "replace"
                        ? "Cleared (only primary category retained)"
                        : "None specified"}
                    </strong>
                  </li>
                )}
                <li className="text-slate-400">
                  Applies atomically to {selectedProducts.length} bouquet product(s).
                </li>
              </ul>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-center text-xs text-muted-foreground">
              Toggle at least one of the switches above to configure category changes.
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={!isValid || isSubmitting}
            onClick={handleApplyChanges}
            className="text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold gap-1.5 shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Applying Changes...</>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Apply Changes to {selectedProducts.length} Product(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCategoryModal;
