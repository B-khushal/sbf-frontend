import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { getImageUrl } from "@/config";
import { Gift, Plus, Trash2, Calculate, Save, Search, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HamperComponentItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
}

const HAMPER_CATEGORIES = [
  "Flowers", "Cake", "Chocolate", "Greeting Card", "Soft Toys", "Plants", "Dry Fruits", "Custom Gifts"
];

const HampersBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hamper details state
  const [hamperTitle, setHamperTitle] = useState("");
  const [hamperDescription, setHamperDescription] = useState("");
  const [hamperCategory, setHamperCategory] = useState("Gift Hampers");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [customPriceOverride, setCustomPriceOverride] = useState<boolean>(false);
  const [selectedComponents, setSelectedComponents] = useState<HamperComponentItem[]>([]);
  const [hamperImage, setHamperImage] = useState("");

  // Search filter for available items
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.getAdminProducts();
        setAllProducts(res.products || []);
      } catch (error) {
        console.error("Error loading products for hamper builder:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Calculate total component base price
  const totalComponentPrice = selectedComponents.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  // Automatically sync selling price unless user manually overrides it
  useEffect(() => {
    if (!customPriceOverride) {
      setSellingPrice(totalComponentPrice);
    }
  }, [totalComponentPrice, customPriceOverride]);

  const addComponentToHamper = (product: ProductData) => {
    setSelectedComponents(prev => {
      const existing = prev.find(item => item.id === product._id);
      if (existing) {
        return prev.map(item =>
          item.id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product._id!,
          name: product.title,
          category: product.category,
          price: product.price,
          image: product.images?.[0] || "",
          quantity: 1,
        }
      ];
    });

    if (!hamperImage && product.images?.[0]) {
      setHamperImage(product.images[0]);
    }
  };

  const removeComponent = (id: string) => {
    setSelectedComponents(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeComponent(id);
    setSelectedComponents(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: qty } : item)
    );
  };

  const handleSaveHamper = async () => {
    if (!hamperTitle.trim()) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Please enter a Gift Hamper title." });
    }
    if (selectedComponents.length === 0) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Please add at least one component to the hamper." });
    }

    try {
      setSaving(true);
      const hamperData: Partial<ProductData> = {
        title: hamperTitle,
        description: hamperDescription || "Curated luxury gift hamper.",
        catalogType: "hamper",
        category: hamperCategory,
        price: sellingPrice || totalComponentPrice,
        discount: customPriceOverride && totalComponentPrice > sellingPrice
          ? Math.round(((totalComponentPrice - sellingPrice) / totalComponentPrice) * 100)
          : 0,
        images: hamperImage ? [hamperImage] : selectedComponents.map(c => c.image).filter(Boolean),
        countInStock: 20,
        isCustomizable: true,
        hamperAttributes: {
          hamperItems: selectedComponents.map(c => ({
            productId: c.id,
            name: c.name,
            type: c.category,
            price: c.price,
            image: c.image,
            quantity: c.quantity,
          }))
        }
      };

      await productService.createProduct(hamperData);
      toast({ title: "Hamper Created!", description: `${hamperTitle} successfully added to Hampers catalog.` });
      navigate("/admin/products/hampers");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Create Hamper", description: error.message || "Error saving hamper." });
    } finally {
      setSaving(false);
    }
  };

  const availableFiltered = allProducts.filter(p => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCatFilter !== "all" && p.category !== selectedCatFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 dark:bg-purple-950/40 rounded-xl text-purple-600">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Gift Hamper Builder
            </h1>
            <p className="text-xs text-muted-foreground">
              Combine flowers, cakes, chocolates, soft toys, and gifts into a premium hamper package.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSaveHamper}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Gift Hamper"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Available Components Library */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-1 flex flex-col h-[650px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Add Items to Hamper</span>
              <Badge variant="secondary" className="text-[10px]">{availableFiltered.length} items</Badge>
            </CardTitle>
            <div className="space-y-2 mt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search flowers, chocolates..."
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
            ) : availableFiltered.map(product => (
              <div
                key={product._id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{product.title}</p>
                    <p className="text-[11px] text-muted-foreground">₹{product.price} • {product.category}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => addComponentToHamper(product)}
                  className="h-7 px-2 text-[11px] gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Center: Composition & Details */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Hamper Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Hamper Title *</Label>
                <Input
                  placeholder="e.g. Royal Valentine Celebration Hamper"
                  value={hamperTitle}
                  onChange={e => setHamperTitle(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  placeholder="Include a short summary of items contained..."
                  value={hamperDescription}
                  onChange={e => setHamperDescription(e.target.value)}
                  className="text-xs mt-1 min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs text-slate-500">Calculated Cost</Label>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">₹{totalComponentPrice}</p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Selling Price (₹)</Label>
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={e => {
                      setSellingPrice(Number(e.target.value));
                      setCustomPriceOverride(true);
                    }}
                    className="h-8 text-xs mt-1 font-bold text-emerald-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Components List */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Hamper Contents</CardTitle>
              <Badge variant="outline" className="text-[10px]">{selectedComponents.length} items</Badge>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[280px] overflow-y-auto">
              {selectedComponents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No components added yet. Select items from the left library.
                </p>
              ) : selectedComponents.map(item => (
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
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={() => removeComponent(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Live Preview Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" /> Live Customer Card Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {hamperImage || selectedComponents[0]?.image ? (
                  <img
                    src={getImageUrl(hamperImage || selectedComponents[0]?.image)}
                    alt="Hamper Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400 text-xs">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                    No image selected
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-purple-600 text-white text-[10px]">
                  Gift Hamper
                </Badge>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {hamperTitle || "Untitled Gift Hamper"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {hamperDescription || "Included items preview will appear here."}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Includes {selectedComponents.length} Premium Items:
                  </p>
                  <ul className="text-[11px] text-muted-foreground space-y-1">
                    {selectedComponents.map(c => (
                      <li key={c.id} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>{c.quantity}x {c.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="text-xs text-slate-400 line-through">₹{totalComponentPrice}</span>
                    <p className="text-lg font-bold text-emerald-600">₹{sellingPrice}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600">
                    Ready to Order
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HampersBuilderPage;
