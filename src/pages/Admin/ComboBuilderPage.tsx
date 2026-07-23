import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { getImageUrl } from "@/config";
import { Boxes, Plus, Trash2, Save, Search, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComboItemSelection {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
}

const ComboBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Combo Basic Info
  const [comboTitle, setComboTitle] = useState("");
  const [comboDescription, setComboDescription] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [priceOverride, setPriceOverride] = useState<boolean>(false);
  const [stockPolicy, setStockPolicy] = useState<"hide" | "partial" | "replace">("hide");

  // Selected combo items
  const [selectedItems, setSelectedItems] = useState<ComboItemSelection[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await productService.getAdminProducts();
        setAllProducts(res.products || []);
      } catch (error) {
        console.error("Error loading products for combo builder:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Financial calculations
  const totalBasePrice = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    if (!priceOverride) {
      setSellingPrice(totalBasePrice);
    }
  }, [totalBasePrice, priceOverride]);

  const marginPercentage = sellingPrice > 0
    ? Math.round(((sellingPrice - totalBasePrice * 0.7) / sellingPrice) * 100)
    : 0;

  const discountPercentage = totalBasePrice > sellingPrice
    ? Math.round(((totalBasePrice - sellingPrice) / totalBasePrice) * 100)
    : 0;

  const addItemToCombo = (prod: ProductData) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === prod._id);
      if (existing) {
        return prev.map(i => i.id === prod._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [
        ...prev,
        {
          id: prod._id!,
          name: prod.title,
          price: prod.price,
          category: prod.category,
          image: prod.images?.[0] || "",
          quantity: 1,
        }
      ];
    });
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setSelectedItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const handleSaveCombo = async () => {
    if (!comboTitle.trim()) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Combo Title is required." });
    }
    if (selectedItems.length < 2) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Please add at least 2 items to form a Combo Product." });
    }

    try {
      setSaving(true);
      const comboData: Partial<ProductData> = {
        title: comboTitle,
        description: comboDescription || "Custom multi-product bouquet & gift combo.",
        catalogType: "combo",
        category: "Combo Products",
        price: sellingPrice || totalBasePrice,
        discount: discountPercentage,
        images: selectedItems.map(i => i.image).filter(Boolean),
        countInStock: 50,
        comboName: comboTitle,
        comboDescription: comboDescription,
        comboAttributes: {
          comboProducts: selectedItems.map(i => ({
            productId: i.id,
            name: i.name,
            type: i.category,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
          })),
          stockPolicy: stockPolicy,
        }
      };

      await productService.createProduct(comboData);
      toast({ title: "Combo Product Created!", description: `${comboTitle} saved to catalog.` });
      navigate("/admin/products/combos");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const filteredLibrary = allProducts.filter(p => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 rounded-xl text-blue-600">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Combo Products Builder
            </h1>
            <p className="text-xs text-muted-foreground">
              Combine flowers, cakes, chocolates, and accessories into irresistible offer bundles.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSaveCombo}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving Combo..." : "Save Combo Product"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Available Products Library */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-1 flex flex-col h-[650px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Product Library</span>
              <Badge variant="secondary" className="text-[10px]">{filteredLibrary.length} items</Badge>
            </CardTitle>
            <div className="space-y-2 mt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <p className="text-xs text-slate-500 text-center py-8">Loading catalog...</p>
            ) : filteredLibrary.map(prod => (
              <div
                key={prod._id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={getImageUrl(prod.images?.[0])} alt={prod.title} className="w-10 h-10 object-cover rounded" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{prod.title}</p>
                    <p className="text-[11px] text-muted-foreground">₹{prod.price} • {prod.category}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => addItemToCombo(prod)}
                  className="h-7 px-2 text-[11px] gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Center: Composition & Settings */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Combo Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Combo Title *</Label>
                <Input
                  placeholder="e.g. Roses & Chocolate Fudge Combo"
                  value={comboTitle}
                  onChange={e => setComboTitle(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  placeholder="Describe what makes this combo special..."
                  value={comboDescription}
                  onChange={e => setComboDescription(e.target.value)}
                  className="text-xs mt-1 min-h-[50px]"
                />
              </div>

              {/* Combo Stock Rule Settings */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Out-Of-Stock Rule
                </div>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                  Action when an individual item in this combo goes out of stock:
                </p>
                <Select value={stockPolicy} onValueChange={(val: any) => setStockPolicy(val)}>
                  <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hide">Hide Combo Automatically</SelectItem>
                    <SelectItem value="partial">Show Partial Availability Badge</SelectItem>
                    <SelectItem value="replace">Allow Automatic Substitution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Selected Combo Assembly Zone */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Composition Area</CardTitle>
              <Badge variant="outline" className="text-[10px]">{selectedItems.length} items</Badge>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[280px] overflow-y-auto">
              {selectedItems.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No items selected yet. Click "+ Add" on items in the left library.
                </p>
              ) : selectedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-8 h-8 object-cover rounded" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">₹{item.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded bg-white dark:bg-slate-900">
                      <button className="px-2 py-0.5 text-xs" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span className="px-2 font-bold">{item.quantity}</span>
                      <button className="px-2 py-0.5 text-xs" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Financial Preview & Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-1 space-y-4 p-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-500" /> Financial & Margin Calculator
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live metrics based on component breakdown.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs">
            <div>
              <span className="text-slate-500">Base Cost Sum</span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">₹{totalBasePrice}</p>
            </div>
            <div>
              <span className="text-slate-500">Estimated Margin</span>
              <p className="text-base font-bold text-emerald-600">~{marginPercentage}%</p>
            </div>
          </div>

          <div>
            <Label className="text-xs">Combo Selling Price (₹)</Label>
            <Input
              type="number"
              value={sellingPrice}
              onChange={e => {
                setSellingPrice(Number(e.target.value));
                setPriceOverride(true);
              }}
              className="h-9 text-sm font-bold text-emerald-600 mt-1"
            />
            {discountPercentage > 0 && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                Customer saves {discountPercentage}% OFF compared to individual items!
              </p>
            )}
          </div>

          {/* Customer Preview Card */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Combo Preview</span>
              <Badge className="bg-blue-600 text-white text-[10px]">Combo Savings</Badge>
            </div>

            <div className="p-3 space-y-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {selectedItems.map((item, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded border border-slate-200 dark:border-slate-700"
                  />
                ))}
              </div>

              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                {comboTitle || "Untitled Combo Product"}
              </h4>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 line-through">₹{totalBasePrice}</span>
                  <p className="text-base font-bold text-emerald-600">₹{sellingPrice}</p>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500">
                  Same Day Eligible
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComboBuilderPage;
