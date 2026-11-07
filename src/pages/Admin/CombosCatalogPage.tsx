import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Boxes, Plus, RefreshCw, Sparkles, Layers, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SoftButton } from "@/components/dashboard/SoftButton";
import {
  isComboProduct,
  COMBO_ADMIN_TABS,
  matchesComboCategoryTab,
} from "@/utils/comboHelpers";

const CombosCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("all");

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await productService.getAdminProducts();
      const allProds = res.products || [];

      const comboProducts = allProds.filter((p: any) => isComboProduct(p));

      setProducts(comboProducts);
    } catch (error: any) {
      console.error("Error fetching combos catalog:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Combos",
        description: error.message || "Failed to load combo products catalog.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    COMBO_ADMIN_TABS.forEach((tab) => {
      if (tab.id !== "all") {
        counts[tab.id] = products.filter((p) =>
          matchesComboCategoryTab(p, tab.id)
        ).length;
      }
    });
    return counts;
  }, [products]);

  const filteredByTabProducts = useMemo(() => {
    if (activeCategoryTab === "all") return products;
    return products.filter((p) => matchesComboCategoryTab(p, activeCategoryTab));
  }, [products, activeCategoryTab]);

  const stats = useMemo(() => {
    let multiItemCombos = 0;
    let inStock = 0;

    products.forEach((p) => {
      const itemsCount =
        p.comboAttributes?.comboProducts?.length ||
        p.hamperAttributes?.hamperItems?.length ||
        p.comboItems?.length ||
        0;
      if (itemsCount > 1) multiItemCombos++;
      if ((p.countInStock || 0) > 0 || (p.stock || 0) > 0) inStock++;
    });

    return {
      total: products.length,
      multiItemCombos,
      inStock,
    };
  }, [products]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Combos & Hampers" },
        ]}
        title="Combos & Hampers Catalog"
        description="Curated multi-product pairings (All Combos, Birthday Combos, Anniversary Combos, Romantic Combos, Special Occasion Combos & Gift Hampers)."
        liveStatus={{ label: `${products.length} Combos Active`, ping: true }}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <SoftButton
              variant="default"
              size="sm"
              icon={RefreshCw}
              onClick={fetchCombos}
            >
              Refresh
            </SoftButton>
            <SoftButton
              variant="secondary"
              size="sm"
              icon={PackagePlus}
              onClick={() => navigate("/admin/products/hampers")}
            >
              Combo & Hamper Builder
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate("/admin/products/new?type=combo")}
            >
              Create Combo
            </SoftButton>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Combos"
          value={stats.total}
          icon={Boxes}
          color="blue"
          subtitle="All paired packages & hampers"
        />
        <StatCard
          title="Multi-Component"
          value={stats.multiItemCombos}
          icon={Layers}
          color="purple"
          subtitle="Flowers + Cake + Sweets"
        />
        <StatCard
          title="Ready in Stock"
          value={stats.inStock}
          icon={Sparkles}
          color="emerald"
          subtitle="Instant assemble ready"
        />
      </div>

      {/* Combo Category Quick Filter Pills */}
      <div className="sbf-card p-3 rounded-2xl border border-white/70 dark:border-slate-800 shadow-[5px_5px_15px_rgba(163,177,198,0.22),-5px_-5px_15px_rgba(255,255,255,0.75)] bg-[#f4f7fb] dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center gap-2">
          {COMBO_ADMIN_TABS.map((tab) => {
            const isActive = activeCategoryTab === tab.id;
            const count = categoryCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-[3px_3px_8px_rgba(16,185,129,0.35)]"
                    : "bg-[#edf1f7] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 shadow-[2px_2px_5px_rgba(163,177,198,0.25),-2px_-2px_5px_rgba(255,255,255,0.8)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enterprise Product Table */}
      <EnterpriseProductTable
        products={filteredByTabProducts}
        loading={loading}
        catalogTypeFilter="all"
        onRefresh={fetchCombos}
        onEditProduct={(product) =>
          navigate(`/admin/products/edit/${product._id}`, {
            state: { from: "/admin/products/combos" },
          })
        }
      />
    </div>
  );
};

export default CombosCatalogPage;
