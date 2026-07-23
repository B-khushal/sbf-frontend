import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { getImageUrl } from "@/config";
import { Warehouse, Search, RefreshCw, AlertTriangle, ShieldCheck, Edit, Check } from "lucide-react";

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
      toast({ variant: "destructive", title: "Error Loading Inventory", description: error.message });
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
      toast({ title: "Stock Updated", description: `Updated stock for ${product.title} to ${tempStockValue}.` });
      setEditingStockId(null);
      fetchInventory();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const filteredInventory = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 dark:bg-teal-950/40 rounded-xl text-teal-600">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Inventory & Real-Time Stock
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitor stock levels, reserved units, low stock alerts, and perform quick inline inventory adjustments.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchInventory} className="text-xs gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Inventory
        </Button>
      </div>

      {/* Inventory Search & Filters */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Filter by product name, SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Total Tracked Items: <strong className="text-slate-900 dark:text-slate-100">{products.length}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <TableHead className="min-w-[200px]">Product</TableHead>
              <TableHead>Catalog Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Quick Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  Loading inventory log...
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  No inventory items match search criteria.
                </TableCell>
              </TableRow>
            ) : filteredInventory.map(product => {
              const isEditing = editingStockId === product._id;
              const isLowStock = (product.countInStock || 0) > 0 && (product.countInStock || 0) <= 5;
              const isOutOfStock = (product.countInStock || 0) <= 0;

              return (
                <TableRow key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <img src={getImageUrl(product.images?.[0])} alt={product.title} className="w-9 h-9 object-cover rounded border" />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{product.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{product.sku || "No SKU"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {product.catalogType || "bouquet"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{product.category}</span>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={tempStockValue}
                        onChange={e => setTempStockValue(Number(e.target.value))}
                        className="w-20 h-7 text-xs font-bold text-emerald-600"
                      />
                    ) : (
                      <span className="font-bold text-xs">{product.countInStock} units</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isOutOfStock ? "destructive" : isLowStock ? "outline" : "secondary"}
                      className={`text-[10px] ${isLowStock ? "border-orange-500 text-orange-600" : ""}`}
                    >
                      {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock Alert" : "Sufficient"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Button size="sm" className="h-7 text-xs bg-emerald-600 text-white gap-1" onClick={() => handleUpdateStock(product)}>
                        <Check className="h-3 w-3" /> Save
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setEditingStockId(product._id!);
                          setTempStockValue(product.countInStock || 0);
                        }}
                      >
                        <Edit className="h-3 w-3" /> Adjust
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default InventoryPage;
