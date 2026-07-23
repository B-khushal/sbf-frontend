import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import productService, { ProductData } from "@/services/productService";
import collectionService, { CollectionData } from "@/services/collectionService";
import { getImageUrl } from "@/config";
import {
  Package,
  Image as ImageIcon,
  DollarSign,
  Warehouse,
  Globe,
  Truck,
  Layers,
  History,
  Sparkles,
  Save,
  CheckCircle,
  RotateCcw,
  Bot
} from "lucide-react";

interface EnterpriseProductEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductData | null;
  onSaved?: () => void;
}

export const EnterpriseProductEditorModal: React.FC<EnterpriseProductEditorModalProps> = ({
  open,
  onOpenChange,
  product,
  onSaved,
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<CollectionData[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [catalogType, setCatalogType] = useState<string>("bouquet");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [countInStock, setCountInStock] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [hidden, setHidden] = useState(false);

  // Type specific attributes
  // Cake
  const [cakeFlavor, setCakeFlavor] = useState("");
  const [cakeWeight, setCakeWeight] = useState("");
  const [cakeEggless, setCakeEggless] = useState(false);
  const [cakePrepTime, setCakePrepTime] = useState("");

  // Plant
  const [scientificName, setScientificName] = useState("");
  const [potIncluded, setPotIncluded] = useState(true);
  const [waterFrequency, setWaterFrequency] = useState("");
  const [lightRequirement, setLightRequirement] = useState("");

  // Chocolate
  const [chocolateBrand, setChocolateBrand] = useState("");
  const [vegetarian, setVegetarian] = useState(true);
  const [imported, setImported] = useState(false);

  // SEO Settings
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [altText, setAltText] = useState("");

  useEffect(() => {
    collectionService.getCollections().then(setCollections).catch(console.error);
  }, []);

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setCatalogType(product.catalogType || "bouquet");
      setCategory(product.category || "");
      setSku(product.sku || "");
      setPrice(product.price || 0);
      setDiscount(product.discount || 0);
      setCostPrice(product.costPrice || 0);
      setCountInStock(product.countInStock || 0);
      setImages(product.images || []);
      setHidden(Boolean(product.hidden));

      // Type attributes
      setCakeFlavor(product.cakeAttributes?.flavor || "");
      setCakeWeight(product.cakeAttributes?.weight || "");
      setCakeEggless(Boolean(product.cakeAttributes?.eggless));
      setCakePrepTime(product.cakeAttributes?.prepTime || "");

      setScientificName(product.plantAttributes?.scientificName || "");
      setPotIncluded(product.plantAttributes?.potIncluded !== false);
      setWaterFrequency(product.plantAttributes?.waterFrequency || "");
      setLightRequirement(product.plantAttributes?.lightRequirement || "");

      setChocolateBrand(product.chocolateAttributes?.brand || "");
      setVegetarian(product.chocolateAttributes?.vegetarian !== false);
      setImported(Boolean(product.chocolateAttributes?.imported));

      // SEO
      setMetaTitle(product.seoSettings?.metaTitle || product.title || "");
      setMetaDescription(product.seoSettings?.metaDescription || product.description || "");
      setSlug(product.seoSettings?.slug || product.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "");
    }
  }, [product]);

  // AI Alt text simulation
  const generateAIAltText = () => {
    if (!title) return;
    setAltText(`Fresh premium ${title} floral gift arrangement for delivery by Spring Blossoms Florist.`);
    toast({ title: "AI Alt Text Generated", description: "Generated SEO optimized image alt tag." });
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Title is required." });
    }

    try {
      setSaving(true);
      const productPayload: Partial<ProductData> = {
        ...product,
        title,
        description,
        catalogType: catalogType as any,
        category: category || "General",
        sku,
        price,
        discount,
        costPrice,
        countInStock,
        images: images.length > 0 ? images : ["https://res.cloudinary.com/djtrhfqan/image/upload/v1771960430/sbf-products/placeholder.png"],
        hidden,
        cakeAttributes: { flavor: cakeFlavor, weight: cakeWeight, eggless: cakeEggless, prepTime: cakePrepTime },
        plantAttributes: { scientificName, potIncluded, waterFrequency, lightRequirement },
        chocolateAttributes: { brand: chocolateBrand, vegetarian, imported },
        seoSettings: { metaTitle, metaDescription, slug }
      };

      if (product?._id) {
        await productService.updateProduct(product._id, productPayload);
        toast({ title: "Product Saved", description: `${title} updated successfully.` });
      } else {
        await productService.createProduct(productPayload);
        toast({ title: "Product Created", description: `${title} added to catalog.` });
      }

      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Restore Version
  const handleRestoreVersion = async (vIndex: number) => {
    if (!product?._id) return;
    try {
      await productService.restoreProductVersion(product._id, vIndex);
      toast({ title: "Version Restored", description: "Product state restored to selected version." });
      if (onSaved) onSaved();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Restore Failed", description: error.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              {product ? `Edit Product: ${product.title}` : "Create New Product"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">Enterprise catalog editor & SEO score analyzer.</p>
          </div>
          <Badge variant="outline" className="capitalize text-xs">
            {catalogType}
          </Badge>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1 bg-slate-100 dark:bg-slate-800 p-1 mb-4">
              <TabsTrigger value="general" className="text-xs gap-1"><Package className="h-3.5 w-3.5" /> General</TabsTrigger>
              <TabsTrigger value="media" className="text-xs gap-1"><ImageIcon className="h-3.5 w-3.5" /> Media</TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs gap-1"><DollarSign className="h-3.5 w-3.5" /> Pricing</TabsTrigger>
              <TabsTrigger value="inventory" className="text-xs gap-1"><Warehouse className="h-3.5 w-3.5" /> Inventory</TabsTrigger>
              <TabsTrigger value="seo" className="text-xs gap-1"><Globe className="h-3.5 w-3.5" /> SEO</TabsTrigger>
              <TabsTrigger value="shipping" className="text-xs gap-1"><Truck className="h-3.5 w-3.5" /> Shipping</TabsTrigger>
              <TabsTrigger value="related" className="text-xs gap-1"><Layers className="h-3.5 w-3.5" /> Related</TabsTrigger>
              <TabsTrigger value="history" className="text-xs gap-1"><History className="h-3.5 w-3.5" /> History</TabsTrigger>
            </TabsList>

            {/* TAB: GENERAL */}
            <TabsContent value="general" className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Product Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Catalog Type</Label>
                  <Select value={catalogType} onValueChange={setCatalogType}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bouquet">Bouquet</SelectItem>
                      <SelectItem value="plant">Plant</SelectItem>
                      <SelectItem value="cake">Cake</SelectItem>
                      <SelectItem value="chocolate">Chocolate</SelectItem>
                      <SelectItem value="hamper">Gift Hamper</SelectItem>
                      <SelectItem value="combo">Combo</SelectItem>
                      <SelectItem value="addon">Add-on</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="text-xs mt-1 min-h-[80px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Flowers" className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">SKU</Label>
                  <Input value={sku} onChange={e => setSku(e.target.value)} placeholder="SBF-BOUQ-001" className="h-8 text-xs mt-1 font-mono" />
                </div>
              </div>

              {/* Dynamic Specific Attributes */}
              {catalogType === "cake" && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-lg space-y-2">
                  <span className="font-bold text-amber-800 dark:text-amber-300">Cake Dynamic Specs</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Flavor (e.g. Chocolate Fudge)" value={cakeFlavor} onChange={e => setCakeFlavor(e.target.value)} className="h-7 text-xs" />
                    <Input placeholder="Weight (e.g. 1 Kg)" value={cakeWeight} onChange={e => setCakeWeight(e.target.value)} className="h-7 text-xs" />
                    <Input placeholder="Prep Time (e.g. 3 Hours)" value={cakePrepTime} onChange={e => setCakePrepTime(e.target.value)} className="h-7 text-xs" />
                    <div className="flex items-center gap-2 pt-1">
                      <Switch checked={cakeEggless} onCheckedChange={setCakeEggless} />
                      <span>Eggless</span>
                    </div>
                  </div>
                </div>
              )}

              {catalogType === "plant" && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-lg space-y-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">Plant Dynamic Specs</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Scientific Name" value={scientificName} onChange={e => setScientificName(e.target.value)} className="h-7 text-xs" />
                    <Input placeholder="Water Frequency" value={waterFrequency} onChange={e => setWaterFrequency(e.target.value)} className="h-7 text-xs" />
                    <Input placeholder="Light Requirement" value={lightRequirement} onChange={e => setLightRequirement(e.target.value)} className="h-7 text-xs" />
                    <div className="flex items-center gap-2 pt-1">
                      <Switch checked={potIncluded} onCheckedChange={setPotIncluded} />
                      <span>Pot Included</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB: MEDIA */}
            <TabsContent value="media" className="space-y-4 text-xs">
              <div>
                <Label className="text-xs">Add Image URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." className="h-8 text-xs" />
                  <Button size="sm" onClick={handleAddImage} className="h-8 text-xs bg-emerald-600 text-white">Add</Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group border rounded-lg overflow-hidden h-24">
                    <img src={getImageUrl(img)} alt="Product" className="w-full h-full object-cover" />
                    <button onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-[10px]">✕</button>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">AI Alt Text Generator</span>
                  <Button size="sm" variant="outline" onClick={generateAIAltText} className="h-7 text-[11px] gap-1">
                    <Bot className="h-3 w-3 text-purple-600" /> Generate AI Alt Text
                  </Button>
                </div>
                <Input value={altText} onChange={e => setAltText(e.target.value)} placeholder="SEO Alt Tag" className="h-7 text-xs" />
              </div>
            </TabsContent>

            {/* TAB: PRICING */}
            <TabsContent value="pricing" className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Selling Price (₹)</Label>
                  <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="h-8 text-xs mt-1 font-bold text-emerald-600" />
                </div>
                <div>
                  <Label className="text-xs">Discount (% OFF)</Label>
                  <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Cost Price (₹)</Label>
                  <Input type="number" value={costPrice} onChange={e => setCostPrice(Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
              </div>
            </TabsContent>

            {/* TAB: INVENTORY */}
            <TabsContent value="inventory" className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Count in Stock</Label>
                  <Input type="number" value={countInStock} onChange={e => setCountInStock(Number(e.target.value))} className="h-8 text-xs mt-1 font-bold" />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <Label className="text-xs">Product Hidden</Label>
                  <Switch checked={hidden} onCheckedChange={setHidden} />
                </div>
              </div>
            </TabsContent>

            {/* TAB: SEO */}
            <TabsContent value="seo" className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Meta Title</Label>
                <Input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs">Meta Description</Label>
                <Textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs">URL Slug</Label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} className="h-8 text-xs mt-1 font-mono" />
              </div>

              {/* Google Snippet Live Preview */}
              <div className="p-3 bg-white dark:bg-slate-900 border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Google Search Preview</span>
                <p className="text-blue-600 font-medium text-sm truncate">{metaTitle || title || "Product Title"}</p>
                <p className="text-emerald-700 text-[11px]">https://springblossoms.in/products/{slug}</p>
                <p className="text-slate-600 text-xs line-clamp-2">{metaDescription || description || "Product description preview..."}</p>
              </div>
            </TabsContent>

            {/* TAB: HISTORY & AUDIT TRAIL */}
            <TabsContent value="history" className="space-y-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Version History & Audit Log</span>
              {product?.versionHistory && product.versionHistory.length > 0 ? (
                product.versionHistory.map((ver, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="font-bold text-xs">Version #{ver.version || idx + 1}</p>
                      <p className="text-[10px] text-slate-500">{new Date(ver.timestamp).toLocaleString()} by {ver.updatedBy}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleRestoreVersion(idx)} className="h-7 text-[11px] gap-1">
                      <RotateCcw className="h-3 w-3" /> Restore
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 py-4 text-center">No previous version history recorded.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white text-xs gap-1">
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
