import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Sprout, Plus, RefreshCw, Sparkles, ShieldCheck, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SoftButton } from "@/components/dashboard/SoftButton";

const PlantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductData[]>([]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const res = await productService.getProductsByCatalogType("plant");
      setProducts(res.products || []);
    } catch (error: any) {
      console.error("Error fetching plants:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Plants",
        description: error.message || "Failed to load plant catalog.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const stats = useMemo(() => {
    let inStock = 0;
    const types = new Set<string>();

    products.forEach((p) => {
      if ((p.countInStock || 0) > 0 || (p.stock || 0) > 0) inStock++;
      if (p.subcategory) types.add(p.subcategory.toLowerCase().trim());
    });

    return {
      total: products.length,
      inStock,
      varietyCount: types.size,
    };
  }, [products]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Plants" },
        ]}
        title="Plants Catalog"
        description="Indoor, outdoor, air-purifying, and succulent plants with pot specifications and plant care guides."
        liveStatus={{ label: `${products.length} Plants Active`, ping: true }}
        actions={
          <div className="flex items-center gap-2.5">
            <SoftButton
              variant="default"
              size="sm"
              icon={RefreshCw}
              onClick={fetchPlants}
            >
              Refresh
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate("/admin/products/new?type=plant")}
            >
              Add Plant
            </SoftButton>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Plant SKUs"
          value={stats.total}
          icon={Sprout}
          color="emerald"
          subtitle="All potted plants"
        />
        <StatCard
          title="Varieties"
          value={stats.varietyCount}
          icon={Tag}
          color="blue"
          subtitle="Botanical categories"
        />
        <StatCard
          title="Ready in Nursery"
          value={stats.inStock}
          icon={ShieldCheck}
          color="purple"
          subtitle="Available for delivery"
        />
      </div>

      {/* Enterprise Product Table */}
      <EnterpriseProductTable
        products={products}
        loading={loading}
        catalogTypeFilter="plant"
        onRefresh={fetchPlants}
        onEditProduct={(product) =>
          navigate(`/admin/products/edit/${product._id}`, {
            state: { from: "/admin/products/plants" },
          })
        }
      />
    </div>
  );
};

export default PlantsPage;
