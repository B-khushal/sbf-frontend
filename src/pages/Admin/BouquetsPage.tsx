import React, { useEffect, useState } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Flower2, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BouquetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductData[]>([]);

  const fetchBouquets = async () => {
    try {
      setLoading(true);
      const res = await productService.getAdminProducts();
      const allProds = res.products || [];
      const bouquetProducts = allProds.filter((p: any) => {
        const cat = String(p.category || '').toLowerCase();
        const catalogType = String(p.catalogType || '').toLowerCase();
        const isCombo = cat === 'combos' || cat === 'combo products' || catalogType === 'combo' || (p.comboItems && p.comboItems.length > 0);
        return !isCombo && (catalogType === 'bouquet' || cat.includes('flower') || cat.includes('bouquet'));
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-100 dark:bg-pink-950/40 rounded-xl text-pink-600">
            <Flower2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Bouquets Catalog
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage fresh flower bouquets, luxury floral boxes, and stem arrangements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBouquets} className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/admin/products/new?type=bouquet")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Bouquet
          </Button>
        </div>
      </div>

      <EnterpriseProductTable
        products={products}
        loading={loading}
        catalogTypeFilter="bouquet"
        onRefresh={fetchBouquets}
        onEditProduct={(product) => navigate(`/admin/products/edit/${product._id}`)}
      />
    </div>
  );
};

export default BouquetsPage;
