import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Cookie, Plus, RefreshCw, Sparkles, Tag, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SoftButton } from "@/components/dashboard/SoftButton";

const ChocolatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductData[]>([]);

  const fetchChocolates = async () => {
    try {
      setLoading(true);
      const res = await productService.getProductsByCatalogType("chocolate");
      setProducts(res.products || []);
    } catch (error: any) {
      console.error("Error fetching chocolates:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Chocolates",
        description: error.message || "Failed to load chocolate catalog.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChocolates();
  }, []);

  const stats = useMemo(() => {
    let inStock = 0;
    const brands = new Set<string>();

    products.forEach((p) => {
      if ((p.countInStock || 0) > 0 || (p.stock || 0) > 0) inStock++;
      if (p.subcategory) brands.add(p.subcategory.toLowerCase().trim());
    });

    return {
      total: products.length,
      inStock,
      brandsCount: brands.size,
    };
  }, [products]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Chocolates" },
        ]}
        title="Chocolates & Confectionery"
        description="Artisanal, luxury imported (Cadbury, Ferrero, Lindt), vegetarian confectioneries, and sweet gift boxes."
        liveStatus={{ label: `${products.length} Items Listed`, ping: true }}
        actions={
          <div className="flex items-center gap-2.5">
            <SoftButton
              variant="default"
              size="sm"
              icon={RefreshCw}
              onClick={fetchChocolates}
            >
              Refresh
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate("/admin/products/new?type=chocolate")}
            >
              Add Chocolate
            </SoftButton>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Confectioneries"
          value={stats.total}
          icon={Cookie}
          color="amber"
          subtitle="All boxed chocolates"
        />
        <StatCard
          title="Brands & Varieties"
          value={stats.brandsCount}
          icon={Tag}
          color="purple"
          subtitle="Gourmet brands"
        />
        <StatCard
          title="Ready in Stock"
          value={stats.inStock}
          icon={ShieldCheck}
          color="emerald"
          subtitle="Ready to pack"
        />
      </div>

      {/* Enterprise Product Table */}
      <EnterpriseProductTable
        products={products}
        loading={loading}
        catalogTypeFilter="chocolate"
        onRefresh={fetchChocolates}
        onEditProduct={(product) =>
          navigate(`/admin/products/edit/${product._id}`, {
            state: { from: "/admin/products/chocolates" },
          })
        }
      />
    </div>
  );
};

export default ChocolatesPage;
