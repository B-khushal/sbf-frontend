import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import {
  Flower2,
  Plus,
  RefreshCw,
  FolderTree,
  Tag,
  Layers,
  Sparkles,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const QUICK_FILTER_PRESETS = [
  { id: "all", label: "All Bouquets" },
  { id: "roses", label: "Roses" },
  { id: "lilies", label: "Lilies" },
  { id: "orchids", label: "Orchids" },
  { id: "carnation", label: "Carnations" },
  { id: "tulips", label: "Tulips" },
  { id: "box", label: "Box Arrangements" },
  { id: "hand", label: "Hand Bouquets" },
  { id: "baskets", label: "Flower Baskets" },
];

const BouquetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchBouquets = async () => {
    try {
      setLoading(true);
      const res = await productService.getAdminProducts();
      const allProds = res.products || [];
      const bouquetProducts = allProds.filter((p: any) => {
        const cat = String(p.category || "").toLowerCase();
        const catalogType = String(p.catalogType || "").toLowerCase();
        const isCombo =
          cat === "combos" ||
          cat === "combo products" ||
          catalogType === "combo" ||
          (p.comboItems && p.comboItems.length > 0);
        return (
          !isCombo &&
          (catalogType === "bouquet" ||
            cat.includes("flower") ||
            cat.includes("bouquet") ||
            cat.includes("rose") ||
            cat.includes("lily") ||
            cat.includes("orchid"))
        );
      });
      setProducts(bouquetProducts);
    } catch (error: any) {
      console.error("Error fetching bouquets:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Bouquets",
        description: error.message || "Failed to load bouquet products.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBouquets();
  }, []);

  // Compute category / subcategory statistics
  const stats = useMemo(() => {
    const total = products.length;
    const subcats = new Set<string>();
    let multiCategoryCount = 0;
    let inStockCount = 0;

    products.forEach((p) => {
      if (p.subcategory) subcats.add(p.subcategory.toLowerCase().trim());
      if (Array.isArray(p.categories) && p.categories.length > 1) {
        multiCategoryCount++;
      }
      if ((p.countInStock || 0) > 0) {
        inStockCount++;
      }
    });

    return {
      total,
      subcategoriesCount: subcats.size,
      multiCategoryCount,
      inStockCount,
    };
  }, [products]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    QUICK_FILTER_PRESETS.forEach((preset) => {
      if (preset.id === "all") return;
      const q = preset.id.toLowerCase();
      const count = products.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const subcat = (p.subcategory || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        const cats = Array.isArray(p.categories)
          ? p.categories.map((c) => c.toLowerCase()).join(" ")
          : "";
        return (
          cat.includes(q) ||
          subcat.includes(q) ||
          title.includes(q) ||
          cats.includes(q)
        );
      }).length;
      counts[preset.id] = count;
    });
    return counts;
  }, [products]);

  // Filtered products based on active tab
  const displayedProducts = useMemo(() => {
    if (activeTab === "all") return products;
    const q = activeTab.toLowerCase();
    return products.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const subcat = (p.subcategory || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      const cats = Array.isArray(p.categories)
        ? p.categories.map((c) => c.toLowerCase()).join(" ")
        : "";
      return (
        cat.includes(q) ||
        subcat.includes(q) ||
        title.includes(q) ||
        cats.includes(q)
      );
    });
  }, [products, activeTab]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl text-white shadow-md">
            <Flower2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Bouquets Catalog & Taxonomy
              </h1>
              <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 font-semibold text-[11px] border border-pink-200 dark:border-pink-800">
                {products.length} Products
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage fresh flower bouquets, assign subcategories, and batch update store taxonomy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBouquets}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/admin/products/new?type=bouquet")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add Bouquet
          </Button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg text-purple-600">
            <FolderTree className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Total Bouquets</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg text-amber-600">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Subcategories</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{stats.subcategoriesCount}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg text-indigo-600">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Multi-Category</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{stats.multiCategoryCount}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Ready in Stock</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{stats.inStockCount}</p>
          </div>
        </div>
      </div>

      {/* Quick Category / Subcategory Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
          <Filter className="h-3 w-3" /> Quick Filter:
        </span>
        {QUICK_FILTER_PRESETS.map((preset) => {
          const count = tabCounts[preset.id] || 0;
          const isActive = activeTab === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setActiveTab(preset.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <span>{preset.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Enterprise Product Table with Bulk Taxonomy Support */}
      <EnterpriseProductTable
        products={displayedProducts}
        loading={loading}
        catalogTypeFilter="bouquet"
        onRefresh={fetchBouquets}
        onEditProduct={(product) => navigate(`/admin/products/edit/${product._id}`)}
      />
    </div>
  );
};

export default BouquetsPage;
