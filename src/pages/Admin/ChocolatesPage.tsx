import React, { useEffect, useState } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Cookie, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-100 dark:bg-yellow-950/40 rounded-xl text-yellow-700">
            <Cookie className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Chocolates & Confectionery
            </h1>
            <p className="text-xs text-muted-foreground">
              Artisanal, imported, vegetarian chocolates, brands, and expiry date management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchChocolates} className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/admin/products/new?type=chocolate")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Chocolate
          </Button>
        </div>
      </div>

      <EnterpriseProductTable
        products={products}
        loading={loading}
        catalogTypeFilter="chocolate"
        onRefresh={fetchChocolates}
        onEditProduct={(product) => navigate(`/admin/products/edit/${product._id}`)}
      />
    </div>
  );
};

export default ChocolatesPage;
