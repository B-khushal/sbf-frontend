import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { getImageUrl } from "@/config";
import {
  Warehouse,
  Search,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Edit,
  Check,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SoftButton } from "@/components/dashboard/SoftButton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const InventoryPage: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await productService.getAdminProducts();
      setProducts(res.products || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Inventory",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (product: ProductData) => {
    try {
      await productService.updateProduct(product._id!, {
        ...product,
        countInStock: tempStockValue,
      });
      toast({
        title: "Stock Updated",
        description: `Updated stock for ${product.title} to ${tempStockValue}.`,
      });
      setEditingStockId(null);
      fetchInventory();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    }
  };

  const filteredInventory = useMemo(() => {
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    let sufficient = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      const count = p.countInStock || 0;
      if (count > 5) sufficient++;
      else if (count > 0) lowStock++;
      else outOfStock++;
    });

    return {
      total: products.length,
      sufficient,
      lowStock,
      outOfStock,
    };
  }, [products]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Inventory" },
        ]}
        title="Inventory & Stock Health"
        description="Monitor warehouse stock reserves, low stock threshold warnings, and perform instant inline stock level adjustments."
        liveStatus={{ label: `${products.length} Items Monitored`, ping: true }}
        actions={
          <SoftButton
            variant="default"
            size="sm"
            icon={RefreshCw}
            onClick={fetchInventory}
          >
            Refresh Inventory
          </SoftButton>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total SKUs"
          value={stats.total}
          icon={Warehouse}
          color="blue"
          subtitle="Tracked products"
        />
        <StatCard
          title="Sufficient Stock"
          value={stats.sufficient}
          icon={PackageCheck}
          color="emerald"
          subtitle="> 5 units available"
        />
        <StatCard
          title="Low Stock Alert"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="amber"
          subtitle="1 - 5 units remaining"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={XCircle}
          color="rose"
          subtitle="Urgent restock needed"
        />
      </div>

      {/* Inventory Search & Filters Bar */}
      <div className="sbf-card p-4 rounded-2xl border border-white/70 dark:border-slate-800 shadow-[5px_5px_15px_rgba(163,177,198,0.22),-5px_-5px_15px_rgba(255,255,255,0.75)] bg-[#f4f7fb] dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by product name, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 h-9 text-xs rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
          <span>Showing: <strong className="text-slate-900 dark:text-slate-100">{filteredInventory.length}</strong> of {products.length} products</span>
        </div>
      </div>

      {/* Inventory Neumorphic Table */}
      <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden transition-all">
        <Table>
          <TableHeader className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
            <TableRow>
              <TableHead className="w-14 font-semibold text-xs text-slate-700 dark:text-slate-300">
                Image
              </TableHead>
              <TableHead className="min-w-[220px] font-semibold text-xs text-slate-700 dark:text-slate-300">
                Product Title & SKU
              </TableHead>
              <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                Catalog Type
              </TableHead>
              <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                Stock Level
              </TableHead>
              <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-xs text-slate-700 dark:text-slate-300">
                Quick Adjust
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-xs text-slate-500"
                >
                  Loading inventory log...
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-xs text-slate-500"
                >
                  No inventory items match search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((product) => {
                const isEditing = editingStockId === product._id;
                const count = product.countInStock || 0;
                const isOutOfStock = count <= 0;
                const isLowStock = count > 0 && count <= 5;

                return (
                  <TableRow
                    key={product._id}
                    className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/50"
                  >
                    <TableCell>
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-xl shadow-xs border border-white/60"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {product.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {product.sku || "NO-SKU"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {product.catalogType || "bouquet"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {product.category || "General"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempStockValue}
                          onChange={(e) =>
                            setTempStockValue(Number(e.target.value))
                          }
                          className="w-20 px-2 py-1 text-xs font-bold text-rose-600 rounded-lg border border-rose-300 bg-white dark:bg-slate-950 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {count} units
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          isOutOfStock
                            ? "out_of_stock"
                            : isLowStock
                            ? "low_stock"
                            : "in_stock"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <SoftButton
                          variant="primary"
                          size="sm"
                          icon={Check}
                          onClick={() => handleUpdateStock(product)}
                        >
                          Save
                        </SoftButton>
                      ) : (
                        <SoftButton
                          variant="default"
                          size="sm"
                          icon={Edit}
                          onClick={() => {
                            setEditingStockId(product._id!);
                            setTempStockValue(count);
                          }}
                        >
                          Adjust
                        </SoftButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryPage;
