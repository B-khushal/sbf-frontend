import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import { getImageUrl } from "@/config";
import api from "@/services/api";
import { Gift, Plus, Trash2, Save, Search, Check, Sparkles, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HamperComponentItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
}

const COMBO_CATEGORIES = [
  { value: "combos", label: "🎁 All Combos" },
  { value: "birthday-combos", label: "🎂 Birthday Combos" },
  { value: "anniversary-combos", label: "💍 Anniversary Combos" },
  { value: "romantic-combos", label: "❤️ Romantic Combos" },
  { value: "special-occasion-combos", label: "✨ Special Occasion Combos" },
  { value: "gift-hampers", label: "📦 Gift Hampers" }
];

const resolveComboImage = (img: string | undefined): string => {
  if (!img || img.trim() === '' || img === 'undefined' || img === 'null') {
    return '/images/placeholder.svg';
  }
  return getImageUrl(img);
};

const HampersBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Hamper / Combo details state
  const [hamperTitle, setHamperTitle] = useState("");
  const [hamperDescription, setHamperDescription] = useState("");
  const [comboCategory, setComboCategory] = useState("gift-hampers");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [customPriceOverride, setCustomPriceOverride] = useState<boolean>(false);
  const [selectedComponents, setSelectedComponents] = useState<HamperComponentItem[]>([]);
  const [hamperImage, setHamperImage] = useState("");

  // Search filter for available items
  const [searchTerm, setSearchTerm] = useState("");

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
    const prodImg = product.images?.[0] || (product as any).image || "";
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
          name: product.title || (product as any).name || "Item",
          category: product.category || "General",
          price: product.price || 0,
          image: prodImg,
          quantity: 1,
        }
      ];
    });

    if (!hamperImage && prodImg) {
      setHamperImage(prodImg);
    }
  };

  const removeComponent = (id: string) => {
    setSelectedComponents(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeComponent(id);
      return;
    }
    setSelectedComponents(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const response = await api.post("/uploads", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = response.data.imageUrl || response.data.url || response.data.path;
      if (uploadedUrl) {
        setHamperImage(uploadedUrl);
        toast({ title: "Image Uploaded!", description: "Combo product main image updated." });
      }
    } catch (error: any) {
      console.error("Image upload failed:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Failed to upload image." });
    } finally {
      setUploadingImage(false);
    }
  };

  const discountPercent = totalComponentPrice > sellingPrice && totalComponentPrice > 0
    ? Math.round(((totalComponentPrice - sellingPrice) / totalComponentPrice) * 100)
    : 0;

  const handleSaveHamper = async () => {
    if (!hamperTitle.trim()) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Please enter a title for the combo product." });
    }

    if (selectedComponents.length === 0) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Please add at least 1 item to the combo product." });
    }

    try {
      setSaving(true);
      const mainImage = hamperImage || selectedComponents[0]?.image || "";
      const comboProductData: Partial<ProductData> = {
        title: hamperTitle,
        description: hamperDescription || `Exclusive combo hamper package featuring ${selectedComponents.map(c => c.name).join(", ")}.`,
        category: comboCategory,
        categories: [comboCategory, "combos"],
        catalogType: "combo",
        price: sellingPrice || totalComponentPrice,
        discount: discountPercent,
        images: mainImage ? [mainImage, ...selectedComponents.map(c => c.image).filter(img => img && img !== mainImage)] : selectedComponents.map(c => c.image).filter(Boolean),
        countInStock: 50,
        comboName: hamperTitle,
        comboDescription: hamperDescription,
        comboAttributes: {
          comboProducts: selectedComponents.map(c => ({
            productId: c.id,
            name: c.name,
            type: c.category,
            price: c.price,
            image: c.image,
            quantity: c.quantity,
          })),
        }
      };

      await productService.createProduct(comboProductData as ProductData);
      toast({ title: "Combo Product Created! 🎉", description: `${hamperTitle} has been saved to your catalog.` });
      navigate("/admin/products/combos");
    } catch (error: any) {
      console.error("Error creating combo product:", error);
      toast({ variant: "destructive", title: "Failed to Create Combo", description: error.message || "Error saving combo product." });
    } finally {
      setSaving(false);
    }
  };

  const availableFiltered = allProducts.filter(p => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const activeDisplayImage = hamperImage || selectedComponents[0]?.image;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Add a Combo Product
            </h1>
            <p className="text-xs text-muted-foreground">
              Combine flowers, cakes, chocolates, soft toys, and gifts into a premium hamper package or combo.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSaveHamper}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm px-5"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving Combo..." : "Save Combo Product"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Catalog Picker */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-1 flex flex-col h-[650px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Add Items to Combo</span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                {availableFiltered.length} items
              </Badge>
            </CardTitle>
            <div className="space-y-2 mt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search flowers, cakes, chocolates..."
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
                    src={resolveComboImage(product.images?.[0] || (product as any).image)}
                    alt={product.title}
                    onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
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
                  className="h-7 px-2 text-[11px] gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Center Column: Basic Info & Category Selection */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Combo Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Combo Title *</Label>
                <Input
                  placeholder="e.g. Royal Valentine Rose & Chocolate Combo"
                  value={hamperTitle}
                  onChange={e => setHamperTitle(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>

              {/* Category Selection Dropdown */}
              <div>
                <Label className="text-xs">Combo Category *</Label>
                <Select value={comboCategory} onValueChange={setComboCategory}>
                  <SelectTrigger className="h-8 text-xs mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select Combo Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMBO_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} className="text-xs">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  placeholder="Include a short summary of items contained in this combo..."
                  value={hamperDescription}
                  onChange={e => setHamperDescription(e.target.value)}
                  className="text-xs mt-1 min-h-[60px]"
                />
              </div>

              {/* Combo Product Main Image Upload & Selector */}
              <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-emerald-600" /> Combo Product Image *
                  </Label>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors">
                    {uploadingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <Input
                  placeholder="Or paste direct image URL here..."
                  value={hamperImage}
                  onChange={e => setHamperImage(e.target.value)}
                  className="h-8 text-xs bg-white dark:bg-slate-900"
                />

                {/* Quick Thumbnail Picker */}
                {selectedComponents.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[10px] text-slate-500 mb-1 font-medium">Pick image from added items:</p>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {selectedComponents.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setHamperImage(c.image)}
                          className={`relative w-10 h-10 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                            hamperImage === c.image ? 'border-emerald-500 scale-105 shadow-md' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={resolveComboImage(c.image)}
                            alt={c.name}
                            onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
              <CardTitle className="text-sm font-semibold">Combo Contents</CardTitle>
              <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-700 dark:text-emerald-400">{selectedComponents.length} items</Badge>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[280px] overflow-y-auto">
              {selectedComponents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No components added yet. Select items from the left library.
                </p>
              ) : selectedComponents.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={resolveComboImage(item.image)}
                      alt={item.name}
                      onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                      className="w-8 h-8 object-cover rounded border"
                    />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">₹{item.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded bg-white dark:bg-slate-900">
                      <button className="px-2 py-0.5 text-xs font-bold" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span className="px-2 font-bold text-emerald-600">{item.quantity}</span>
                      <button className="px-2 py-0.5 text-xs font-bold" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => removeComponent(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Customer Card Preview */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" /> Live Customer Card Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
              
              {/* Image Box */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                {activeDisplayImage ? (
                  <img
                    src={resolveComboImage(activeDisplayImage)}
                    alt="Combo Product Preview"
                    onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center text-slate-400 text-xs p-6">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    No image selected. Upload an image or select items on left.
                  </div>
                )}

                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                  🎁 Gift Combo
                </Badge>

                {discountPercent > 0 && (
                  <Badge className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </Badge>
                )}
              </div>

              {/* Product Info Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                  {hamperTitle || "Untitled Combo Product"}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {hamperDescription || "Included items preview will appear here."}
                </p>

                {/* Included Items Preview Pill */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Includes {selectedComponents.length} Premium Items:
                  </p>
                  {selectedComponents.length > 0 ? (
                    <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 max-h-24 overflow-y-auto">
                      {selectedComponents.map(c => (
                        <li key={c.id} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{c.quantity}x {c.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No components added yet.</p>
                  )}
                </div>

                {/* Price & CTA Action */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    {totalComponentPrice > sellingPrice && totalComponentPrice > 0 && (
                      <span className="text-xs text-slate-400 line-through mr-1.5">₹{totalComponentPrice}</span>
                    )}
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ₹{sellingPrice}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 shadow-md shadow-emerald-500/20"
                  >
                    Ready to Order ✨
                  </Button>
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
