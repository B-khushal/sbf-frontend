import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
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
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SoftButton } from "@/components/dashboard/SoftButton";
import { isComboProduct } from "@/utils/comboHelpers";

const QUICK_FILTER_PRESETS = [
  { id: "all", label: "All Flower Products" },
  { id: "anniversary", label: "Anniversary" },
  { id: "birthday", label: "Birthday" },
  { id: "baskets", label: "Flower Baskets & Stands" },
  { id: "roses", label: "Roses" },
  { id: "lilies", label: "Lilies" },
  { id: "orchids", label: "Orchids" },
  { id: "carnation", label: "Carnations" },
  { id: "sympathy", label: "Sympathy" },
  { id: "chocolate", label: "Chocolate Bouquets" },
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

      // Filter: Show all flower & bouquet products (including anniversary, birthdays, sympathy, baskets)
      // Exclude only the distinct categories that have their own dedicated admin management pages:
      // Cakes, Plants, standalone Chocolates, Combos, Addons, and standalone Hampers.
      const flowerProducts = allProds.filter((p: any) => {
        const cat = String(p.category || "").toLowerCase();
        const catalogType = String(p.catalogType || "").toLowerCase();
        const subcat = String(p.subcategory || "").toLowerCase();
        const title = String(p.title || p.name || "").toLowerCase();

        // 1. Exclude Cakes (managed under /admin/products/cakes)
        const isCake =
          catalogType === "cake" || cat === "cakes" || cat.includes("cake");
        if (isCake) return false;

        // 2. Exclude Plants (managed under /admin/products/plants)
        const isPlant =
          catalogType === "plant" || cat === "plants" || cat.includes("plant");
        if (isPlant) return false;

        // 3. Exclude standalone Chocolates (keep chocolate bouquets, baskets, and floral gifts)
        const isBouquetOrBasket =
          cat.includes("bouquet") ||
          subcat.includes("bouquet") ||
          title.includes("bouquet") ||
          cat.includes("basket") ||
          subcat.includes("basket") ||
          title.includes("basket") ||
          cat.includes("flower") ||
          subcat.includes("flower") ||
          title.includes("flower");

        const isPureChocolate =
          (catalogType === "chocolate" ||
            cat === "chocolates" ||
            cat.includes("chocolate") ||
            cat.includes("confectionery")) &&
          !isBouquetOrBasket;
        if (isPureChocolate) return false;

        // 4. Exclude Combos & Hampers (managed under /admin/products/combos)
        if (isComboProduct(p)) return false;

        // 5. Exclude Addons (managed under /admin/products/addons)
        const isAddon =
          catalogType === "addon" || cat === "addons" || cat === "add-on";
        if (isAddon) return false;

        // 6. Exclude standalone Hampers (managed under /admin/products/hampers unless floral/basket)
        const isHamper =
          catalogType === "hamper" ||
          (cat.includes("hamper") && !isBouquetOrBasket);
        if (isHamper) return false;

        return true;
      });

      setProducts(flowerProducts);
    } catch (error: any) {
      console.error("Error fetching flower products:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Products",
        description: error.message || "Failed to load flower products.",
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
      if ((p.countInStock || 0) > 0 || (p.stock || 0) > 0) {
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
        const title = (p.title || (p as any).name || "").toLowerCase();
        const cats = Array.isArray(p.categories)
          ? p.categories.map((c: any) => (typeof c === "string" ? c : c?.name || "")).join(" ").toLowerCase()
          : "";
        const occs = Array.isArray((p as any).occasions)
          ? (p as any).occasions.map((o: any) => (typeof o === "string" ? o : o?.name || "")).join(" ").toLowerCase()
          : "";

        if (preset.id === "baskets") {
          return cat.includes("basket") || subcat.includes("basket") || title.includes("basket") || title.includes("stand") || title.includes("wreath");
        }
        if (preset.id === "chocolate") {
          return cat.includes("chocolate") || subcat.includes("chocolate") || title.includes("chocolate") || title.includes("ferrero");
        }
        return (
          cat.includes(q) ||
          subcat.includes(q) ||
          title.includes(q) ||
          cats.includes(q) ||
          occs.includes(q)
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
      const title = (p.title || (p as any).name || "").toLowerCase();
      const cats = Array.isArray(p.categories)
        ? p.categories.map((c: any) => (typeof c === "string" ? c : c?.name || "")).join(" ").toLowerCase()
        : "";
      const occs = Array.isArray((p as any).occasions)
        ? (p as any).occasions.map((o: any) => (typeof o === "string" ? o : o?.name || "")).join(" ").toLowerCase()
        : "";

      if (activeTab === "baskets") {
        return cat.includes("basket") || subcat.includes("basket") || title.includes("basket") || title.includes("stand") || title.includes("wreath");
      }
      if (activeTab === "chocolate") {
        return cat.includes("chocolate") || subcat.includes("chocolate") || title.includes("chocolate") || title.includes("ferrero");
      }
      return (
        cat.includes(q) ||
        subcat.includes(q) ||
        title.includes(q) ||
        cats.includes(q) ||
        occs.includes(q)
      );
    });
  }, [products, activeTab]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Bouquets & Flowers" },
        ]}
        title="Flowers & Bouquets Catalog"
        description="Manage all fresh flowers, bouquets, anniversary, birthday, sympathy, and basket arrangements in one place."
        liveStatus={{ label: `${products.length} Products Active`, ping: true }}
        actions={
          <div className="flex items-center gap-2.5">
            <SoftButton
              variant="default"
              size="sm"
              icon={RefreshCw}
              onClick={fetchBouquets}
            >
              Refresh
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate("/admin/products/new?type=bouquet")}
            >
              Add Bouquet
            </SoftButton>
          </div>
        }
      />

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.total}
          icon={FolderTree}
          color="purple"
          subtitle="Bouquets & floral gifts"
        />
        <StatCard
          title="Subcategories"
          value={stats.subcategoriesCount}
          icon={Tag}
          color="amber"
          subtitle="Distinct arrangements"
        />
        <StatCard
          title="Multi-Category"
          value={stats.multiCategoryCount}
          icon={Layers}
          color="blue"
          subtitle="Cross-listed items"
        />
        <StatCard
          title="Ready in Stock"
          value={stats.inStockCount}
          icon={Sparkles}
          color="emerald"
          subtitle="Available for delivery"
        />
      </div>

      {/* Quick Category / Subcategory Filter Tabs (Neumorphic Inset Surface) */}
      <div className="p-1.5 rounded-2xl bg-[#edf1f7] dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 px-3 flex items-center gap-1 shrink-0">
          <Filter className="h-3 w-3 text-rose-500" /> Presets:
        </span>
        {QUICK_FILTER_PRESETS.map((preset) => {
          const count = tabCounts[preset.id] || 0;
          const isActive = activeTab === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setActiveTab(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.8)]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <span>{preset.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-slate-200/70 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Enterprise Product Table */}
      <EnterpriseProductTable
        products={displayedProducts}
        loading={loading}
        catalogTypeFilter="all"
        onRefresh={fetchBouquets}
        onEditProduct={(product) =>
          navigate(`/admin/products/edit/${product._id}`, {
            state: { from: "/admin/products/bouquets" },
          })
        }
      />
    </div>
  );
};

export default BouquetsPage;
