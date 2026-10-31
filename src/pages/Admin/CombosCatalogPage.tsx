import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Boxes, Plus, RefreshCw, Sparkles, Layers, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SoftButton } from "@/components/dashboard/SoftButton";

const CombosCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductData[]>([]);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await productService.getAdminProducts();
      const allProds = res.products || [];

      const comboProducts = allProds.filter((p: any) => {
        const cat = String(p.category || "").toLowerCase();
        const catalogType = String(p.catalogType || "").toLowerCase();
        const title = String(p.title || p.name || "").toLowerCase();
        const cats = Array.isArray(p.categories)
          ? p.categories.map((c: string) => String(c).toLowerCase())
          : [];

        // Exclude bouquets or non-combo items explicitly
        const isBouquetItem =
          (catalogType === "bouquet" ||
            title.endsWith("bouquet") ||
            title.includes("luxury bouquet")) &&
          catalogType !== "combo" &&
          cat !== "combos";
        if (isBouquetItem) {
          return false;
        }

        const isComboCat =
          cat === "combos" ||
          cat === "combo products" ||
          cat.includes("combo") ||
          cat.includes("hamper") ||
          cats.some((c) => c === "combos" || c.includes("combo") || c.includes("hamper"));
        const isComboType = catalogType === "combo";
        const hasComboAttributes =
          Array.isArray(p.comboAttributes?.comboProducts) &&
          p.comboAttributes.comboProducts.length > 0;
        const hasHamperItems =
          Array.isArray(p.hamperAttributes?.hamperItems) &&
          p.hamperAttributes.hamperItems.length > 0;
        const hasComboItems =
          Array.isArray(p.comboItems) && p.comboItems.length > 0;

        return (
          isComboCat ||
          isComboType ||
          hasComboAttributes ||
          hasHamperItems ||
          hasComboItems
        );
      });

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
        description="Curated multi-product pairings (Flowers + Cake, Flowers + Chocolates + Teddy) and luxury gift hampers."
        liveStatus={{ label: `${products.length} Combos Active`, ping: true }}
        actions={
          <div className="flex items-center gap-2.5">
            <SoftButton
              variant="default"
              size="sm"
              icon={RefreshCw}
              onClick={fetchCombos}
            >
              Refresh
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
          subtitle="All paired packages"
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

      {/* Enterprise Product Table */}
      <EnterpriseProductTable
        products={products}
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
