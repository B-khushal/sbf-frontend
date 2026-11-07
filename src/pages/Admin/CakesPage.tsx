import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Cake, Plus, RefreshCw, Sparkles, CheckCircle2, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SoftButton } from "@/components/dashboard/SoftButton";
import { isComboProduct } from "@/utils/comboHelpers";

const CakesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductData[]>([]);

  const fetchCakes = async () => {
    try {
      setLoading(true);
      const res = await productService.getProductsByCatalogType("cake");
      const standaloneCakes = (res.products || []).filter((p: any) => !isComboProduct(p));
      setProducts(standaloneCakes);
    } catch (error: any) {
      console.error("Error fetching cakes:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Cakes",
        description: error.message || "Failed to load cake catalog.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCakes();
  }, []);

  const stats = useMemo(() => {
    let egglessCount = 0;
    let containsEggCount = 0;
    let inStockCount = 0;

    products.forEach((p) => {
      const isEggless =
        p.cakeAttributes?.isEggless ||
        p.isEggless ||
        String(p.title || "").toLowerCase().includes("eggless");
      if (isEggless) egglessCount++;
      else containsEggCount++;

      if ((p.countInStock || 0) > 0 || (p.stock || 0) > 0) inStockCount++;
    });

    return {
      total: products.length,
      egglessCount,
      containsEggCount,
      inStockCount,
    };
  }, [products]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Cakes Catalog" },
        ]}
        title="Cakes Management"
        description="Flavor profiles, weight variants, eggless / contains egg classification, preparation lead times, and sizes."
        liveStatus={{ label: `${products.length} Cakes Active`, ping: true }}
        actions={
          <div className="flex items-center gap-2.5">
            <SoftButton
              variant="default"
              size="sm"
              icon={RefreshCw}
              onClick={fetchCakes}
            >
              Refresh
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate("/admin/products/new?type=cake")}
            >
              Add Cake
            </SoftButton>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Cakes"
          value={stats.total}
          icon={Cake}
          color="amber"
          subtitle="All cataloged cakes"
        />
        <StatCard
          title="100% Eggless"
          value={stats.egglessCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Pure vegetarian recipes"
        />
        <StatCard
          title="Contains Egg"
          value={stats.containsEggCount}
          icon={Layers}
          color="rose"
          subtitle="Classic baking recipes"
        />
        <StatCard
          title="Available in Stock"
          value={stats.inStockCount}
          icon={Sparkles}
          color="purple"
          subtitle="Ready for order"
        />
      </div>

      {/* Enterprise Product Table */}
      <EnterpriseProductTable
        products={products}
        loading={loading}
        catalogTypeFilter="cake"
        onRefresh={fetchCakes}
        onEditProduct={(product) =>
          navigate(`/admin/products/edit/${product._id}`, {
            state: { from: "/admin/products/cakes" },
          })
        }
      />
    </div>
  );
};

export default CakesPage;
