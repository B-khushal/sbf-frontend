import React, { useEffect, useState } from "react";
import { EnterpriseProductTable } from "@/components/Admin/EnterpriseProductTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { Boxes, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        const cat = String(p.category || '').toLowerCase();
        const catalogType = String(p.catalogType || '').toLowerCase();
        const title = String(p.title || p.name || '').toLowerCase();
        const cats = Array.isArray(p.categories) ? p.categories.map((c: string) => String(c).toLowerCase()) : [];

        // Exclude bouquets or non-combo items explicitly
        const isBouquetItem = catalogType === 'bouquet' || title.endsWith('bouquet') || title.includes('luxury bouquet');
        if (isBouquetItem && catalogType !== 'combo' && cat !== 'combos') {
          return false;
        }

        const isComboCat = cat === 'combos' || cat === 'combo products' || cat.includes('combo') || cats.some(c => c === 'combos' || c.includes('combo'));
        const isComboType = catalogType === 'combo';
        const hasComboItems = Array.isArray(p.comboItems) && p.comboItems.length > 0;

        return (isComboCat || isComboType || hasComboItems) && !isBouquetItem;
      });

      console.log(`CombosCatalogPage - Found ${comboProducts.length} combo product(s):`, comboProducts);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 rounded-xl text-blue-600">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Combos & Hampers Catalog
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage multi-product offer bundles, gift hampers, and curated combo sets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCombos} className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/admin/products/new?category=combos")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm px-4"
          >
            <Plus className="h-4 w-4" /> Add Combo Product
          </Button>
        </div>
      </div>

      {/* Enterprise Product Table View */}
      <EnterpriseProductTable
        products={products}
        loading={loading}
        catalogTypeFilter="all"
        onRefresh={fetchCombos}
        onEditProduct={(product) => navigate(`/admin/products/edit/${product._id}`)}
      />
    </div>
  );
};

export default CombosCatalogPage;
