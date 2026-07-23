import React, { useEffect, useState } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Sprout, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Plants Catalog
            </h1>
            <p className="text-xs text-muted-foreground">
              Indoor/outdoor plants, scientific names, pot specifications, and care guides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPlants} className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/admin/products/new?type=plant")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Plant
          </Button>
        </div>
      </div>

      <EnterpriseProductTable
        products={products}
        loading={loading}
        catalogTypeFilter="plant"
        onRefresh={fetchPlants}
        onEditProduct={(product) => navigate(`/admin/products/edit/${product._id}`)}
      />
    </div>
  );
};

export default PlantsPage;
