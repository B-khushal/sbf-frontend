import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Gift, 
  Sparkles, 
  Upload, 
  X, 
  Search, 
  Check, 
  Info, 
  Percent, 
  Layers, 
  FileText, 
  HelpCircle,
  Clock,
  ArrowRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { uploadImage as uploadImageService } from '@/services/uploadService';
import ProductService from '@/services/productService';
import { PRIMARY_CATEGORIES } from '@/utils/categoryTaxonomy';
import { 
  getAddons, 
  createAddon, 
  updateAddon, 
  type AddonProduct 
} from '@/services/addonService';

const ADDON_CATEGORIES = [
  { value: 'greeting-cards', label: 'Greeting Cards' },
  { value: 'chocolates', label: 'Chocolates' },
  { value: 'teddy-bears', label: 'Teddy Bears' },
  { value: 'candles', label: 'Candles' },
  { value: 'cakes', label: 'Cakes' },
  { value: 'perfumes', label: 'Perfumes' },
  { value: 'balloons', label: 'Balloons' },
  { value: 'gift-hampers', label: 'Gift Hampers' },
  { value: 'other', label: 'Other / Custom' }
];

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Wedding',
  'Valentine\'s Day',
  'Mother\'s Day',
  'Father\'s Day',
  'Congratulations',
  'Thank You',
  'Housewarming',
  'Baby Shower',
  'Sympathy'
];

const initialFormState = {
  name: '',
  slug: '',
  description: '',
  category: 'greeting-cards',
  image: '',
  galleryImages: [] as string[],
  price: 0,
  discountedPrice: 0,
  stock: 10,
  SKU: '',
  status: 'active' as 'active' | 'inactive',
  tags: [] as string[],
  badge: '' as '' | 'Bestseller' | 'Most Gifted' | 'New' | 'Limited',
  linkedCategories: [] as string[],
  linkedOccasions: [] as string[],
  linkedProducts: [] as string[],
  active: true,
  sortOrder: 0
};

type FormTab = 'general' | 'pricing' | 'linking';

const AddonForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  // UI States
  const [activeTab, setActiveTab] = useState<FormTab>('general');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewClicked, setPreviewClicked] = useState(false);

  // Data States
  const [formData, setFormData] = useState(initialFormState);
  const [products, setProducts] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Auto-slug control
  const [autoSlug, setAutoSlug] = useState(!isEditing);

  // Load Data on Mount
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const prodData = await ProductService.getProducts();
        setProducts(prodData || []);

        if (isEditing && id) {
          const res = await getAddons({ status: 'all' });
          if (res.success && res.addons) {
            const addon = res.addons.find(a => a._id === id);
            if (addon) {
              setFormData({
                name: addon.name,
                slug: addon.slug,
                description: addon.description,
                category: addon.category,
                image: addon.image,
                galleryImages: addon.galleryImages || [],
                price: addon.price,
                discountedPrice: addon.discountedPrice || 0,
                stock: addon.stock,
                SKU: addon.SKU || '',
                status: addon.status || 'active',
                tags: addon.tags || [],
                badge: addon.badge || '',
                linkedCategories: addon.linkedCategories || [],
                linkedOccasions: addon.linkedOccasions || [],
                linkedProducts: addon.linkedProducts || [],
                active: addon.active !== undefined ? addon.active : true,
                sortOrder: addon.sortOrder || 0
              });
            } else {
              toast({
                title: 'Addon Not Found',
                description: 'The specified addon product could not be loaded.',
                variant: 'destructive'
              });
              navigate('/admin/addons');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data for addon form:', err);
        toast({
          title: 'Error Loading Page',
          description: 'Failed to retrieve setup data from server.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id, isEditing]);

  // Name handler with optional auto-slug generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => {
      const updated: any = { ...prev, name };
      if (autoSlug) {
        updated.slug = name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      return updated;
    });
  };

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      const res = await uploadImageService(uploadFormData, 'product');
      if (res && res.imageUrl) {
        setFormData(prev => ({ ...prev, image: res.imageUrl }));
        toast({
          title: 'Upload Success',
          description: 'Addon image uploaded successfully.'
        });
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast({
        title: 'Upload Failed',
        description: err.response?.data?.message || 'Failed to upload image.',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Form Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast({
        title: 'Image Required',
        description: 'Please upload a product photo for the addon.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountedPrice: Number(formData.discountedPrice || 0),
        stock: Number(formData.stock),
        sortOrder: Number(formData.sortOrder)
      };

      let res;
      if (isEditing && id) {
        res = await updateAddon(id, payload);
      } else {
        res = await createAddon(payload);
      }

      if (res.success) {
        toast({
          title: 'Success',
          description: res.message || `Addon product ${isEditing ? 'updated' : 'created'} successfully.`
        });
        navigate('/admin/addons');
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      toast({
        title: 'Error Saving Addon',
        description: err.response?.data?.message || 'An error occurred while saving the addon.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Tag Pill handlers
  const handleAddTag = () => {
    const cleanTag = tagInput.trim().toLowerCase();
    if (cleanTag && !formData.tags.includes(cleanTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, cleanTag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // Linking Rule categories and occasions togglers
  const handleToggleCategoryRule = (catVal: string) => {
    setFormData(prev => {
      const isLinked = prev.linkedCategories.includes(catVal);
      return {
        ...prev,
        linkedCategories: isLinked 
          ? prev.linkedCategories.filter(c => c !== catVal) 
          : [...prev.linkedCategories, catVal]
      };
    });
  };

  const handleToggleOccasionRule = (occVal: string) => {
    setFormData(prev => {
      const isLinked = prev.linkedOccasions.includes(occVal);
      return {
        ...prev,
        linkedOccasions: isLinked 
          ? prev.linkedOccasions.filter(o => o !== occVal) 
          : [...prev.linkedOccasions, occVal]
      };
    });
  };

  // Linking product helpers
  const filteredProductList = useMemo(() => {
    if (!productSearch) return [];
    const searchLower = productSearch.toLowerCase();
    return products.filter(p => 
      p.title?.toLowerCase().includes(searchLower) && 
      !formData.linkedProducts.includes(p._id)
    ).slice(0, 5);
  }, [productSearch, products, formData.linkedProducts]);

  const handleAddProductRule = (productId: string) => {
    setFormData(prev => ({ ...prev, linkedProducts: [...prev.linkedProducts, productId] }));
    setProductSearch('');
  };

  const handleRemoveProductRule = (productId: string) => {
    setFormData(prev => ({ ...prev, linkedProducts: prev.linkedProducts.filter(id => id !== productId) }));
  };

  const getLinkedProductName = (productId: string) => {
    const p = products.find(prod => prod._id === productId);
    return p ? p.title : 'Product';
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl font-sans text-slate-800 antialiased">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/admin/addons')}
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-100 text-pink-700 border-0 text-[10px] font-bold uppercase tracking-wider">
                System Module
              </Badge>
              {isEditing && (
                <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[10px] font-bold uppercase tracking-wider">
                  Edit Mode
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 mt-1 flex items-center gap-2">
              <Gift className="h-7 w-7 text-pink-500 animate-pulse" />
              {isEditing ? 'Configure Addon Product' : 'Create Upsell Addon'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/addons')}
            disabled={submitting}
            className="text-slate-500 hover:text-slate-800 font-semibold text-sm"
          >
            Discard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || uploadingImage}
            className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-extrabold px-6 shadow-md shadow-pink-100 transition-all rounded-xl"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving Details...
              </span>
            ) : (
              isEditing ? 'Save Configuration' : 'Deploy Addon'
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-semibold">Retrieving upsell model details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Config Forms */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab navigation bar */}
            <div className="flex border-b border-slate-200 p-1 bg-slate-50 rounded-xl max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'general'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  General Info
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'pricing'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Percent className="h-3.5 w-3.5" />
                  Pricing & Stock
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('linking')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'linking'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Upsell Rules
                </div>
              </button>
            </div>

            {/* Form Fields Card */}
            <Card className="border-slate-200/80 shadow-md rounded-2xl overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8">
                
                {/* 1. GENERAL INFORMATION TAB */}
                {activeTab === 'general' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Addon Meta Information</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Describe the addon details as seen by store visitors.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={handleNameChange}
                          placeholder="e.g., Silk Red Rose Card"
                          className="focus:ring-2 focus:ring-pink-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="slug" className="text-xs font-bold text-slate-500 uppercase">Slug identifier *</Label>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span>Auto-generate</span>
                            <Switch 
                              checked={autoSlug} 
                              onCheckedChange={setAutoSlug} 
                              className="h-4 w-7"
                            />
                          </div>
                        </div>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                          placeholder="silk-red-rose-card"
                          disabled={autoSlug}
                          className="bg-slate-50/50 disabled:opacity-70 disabled:cursor-not-allowed"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-xs font-bold text-slate-500 uppercase">Upsell Category *</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(val) => setFormData({ ...formData, category: val })}
                        >
                          <SelectTrigger id="category" className="bg-white border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ADDON_CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="badge" className="text-xs font-bold text-slate-500 uppercase">Promotion Ribbon Badge</Label>
                        <Select 
                          value={formData.badge || 'none'} 
                          onValueChange={(val: any) => setFormData({ ...formData, badge: val === 'none' ? '' : val })}
                        >
                          <SelectTrigger id="badge" className="bg-white border-slate-200">
                            <SelectValue placeholder="No ribbon tag (default)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No ribbon tag</SelectItem>
                            <SelectItem value="Bestseller">Bestseller</SelectItem>
                            <SelectItem value="Most Gifted">Most Gifted</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Limited">Limited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase">Description / Caption *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Write a charming, short copy detailing size, materials, or tastes..."
                        rows={4}
                        className="resize-none"
                        required
                      />
                    </div>

                    {/* Image upload preview widget */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Upsell Thumbnail Image *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                        <div className="md:col-span-2">
                          <ImageUpload
                            currentImage={formData.image}
                            onImageUpload={handleImageUpload}
                            isUploading={uploadingImage}
                            aspectRatio="square"
                            placeholder="Drag image here or click to select from files"
                          />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center text-xs text-slate-500 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                            <Info className="h-4 w-4 text-pink-500 shrink-0" />
                            <span>Photo Standards</span>
                          </div>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Supported formats: JPG, PNG, WEBP.</li>
                            <li>Square aspect ratio guarantees uniform sliders on cart pages.</li>
                            <li>Use compressed file size (&lt; 5MB) for swift checkout loading.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Tags input */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Marketing Labels & Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Type a tag (e.g., romantic, velvet) and press Enter"
                        />
                        <Button type="button" variant="outline" onClick={handleAddTag} className="border-slate-200">
                          Add Pill
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 mt-2">
                          {formData.tags.map(tag => (
                            <Badge key={tag} className="bg-slate-200 text-slate-700 border-0 flex items-center gap-1 hover:bg-rose-50 hover:text-rose-600 transition-colors py-1 cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                              {tag}
                              <X className="h-3 w-3 shrink-0" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. PRICING & STOCK TAB */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Billing & Inventory Controls</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Control pricing, stock alerts, SKU identifiers, and display priorities.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-xs font-bold text-slate-500 uppercase">Original Price (₹) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            className="pl-7 bg-white border-slate-200 font-bold"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="discountedPrice" className="text-xs font-bold text-slate-500 uppercase">Discounted Price (₹)</Label>
                          {formData.price > 0 && formData.discountedPrice > 0 && formData.discountedPrice < formData.price && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">
                              {Math.round(((formData.price - formData.discountedPrice) / formData.price) * 100)}% Discount Applied
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <Input
                            id="discountedPrice"
                            type="number"
                            min="0"
                            value={formData.discountedPrice || ''}
                            onChange={(e) => setFormData({ ...formData, discountedPrice: parseFloat(e.target.value) || 0 })}
                            className="pl-7 bg-white border-slate-200 font-bold text-emerald-600"
                            placeholder="Leave empty or 0 if no discount"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-xs font-bold text-slate-500 uppercase">Stock Inventory Count *</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                          className="bg-white border-slate-200 font-semibold"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="SKU" className="text-xs font-bold text-slate-500 uppercase">SKU Reference Identifier</Label>
                        <Input
                          id="SKU"
                          value={formData.SKU}
                          onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
                          placeholder="e.g., ADDON-CARD-091"
                          className="bg-white border-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                      <div className="flex items-center justify-between bg-slate-50/40 p-4 rounded-xl border border-slate-100">
                        <div className="space-y-0.5 pr-4">
                          <Label className="text-xs font-bold text-slate-700 uppercase">Checkout Status</Label>
                          <p className="text-[10px] text-slate-400">If toggled off, this addon is completely hidden from checkout pages.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={formData.active}
                            onCheckedChange={(val) => setFormData({ ...formData, active: val, status: val ? 'active' : 'inactive' })}
                          />
                          <span className={`text-xs font-bold uppercase tracking-wider ${formData.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {formData.active ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="sortOrder" className="text-xs font-bold text-slate-700 uppercase">Sorting Priority Order</Label>
                          <Badge className="bg-slate-100 text-slate-500 text-[10px]">Lesser = High display priority</Badge>
                        </div>
                        <Input
                          id="sortOrder"
                          type="number"
                          value={formData.sortOrder}
                          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                          className="bg-white border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. UPSELL / LINKING RULES TAB */}
                {activeTab === 'linking' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Upsell Recommendation Rules</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Specify linking rules so this addon is prioritized when matching items are placed in the cart.</p>
                    </div>

                    {/* Linked Categories selection */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        <Label className="text-xs font-bold text-indigo-700 uppercase">Link to Store Categories</Label>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">E.g., recommend greeting cards only when 'Flowers' categories are present in the cart.</p>
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                        {PRIMARY_CATEGORIES.map(cat => {
                          const isLinked = formData.linkedCategories.includes(cat.value);
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => handleToggleCategoryRule(cat.value)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                isLinked
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Linked Occasions selection */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        <Label className="text-xs font-bold text-amber-700 uppercase">Link to Customer Occasions</Label>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">Detects occasion keyword patterns in cart titles (e.g. Birthday cupcakes will prioritize birthday balloons).</p>
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                        {OCCASIONS.map(occ => {
                          const isLinked = formData.linkedOccasions.includes(occ);
                          return (
                            <button
                              key={occ}
                              type="button"
                              onClick={() => handleToggleOccasionRule(occ)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                isLinked
                                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {occ}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Specific Product search linker */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <Label className="text-xs font-bold text-emerald-700 uppercase">Link to Specific Products</Label>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                        <Input
                          type="text"
                          placeholder="Type product name to search and link rules..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Dropdown list matches */}
                      {filteredProductList.length > 0 && (
                        <div className="border border-slate-200 rounded-xl bg-white shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 z-30 absolute w-full left-0 mt-1">
                          {filteredProductList.map(prod => (
                            <button
                              key={prod._id}
                              type="button"
                              onClick={() => handleAddProductRule(prod._id)}
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs font-semibold"
                            >
                              <span>{prod.title}</span>
                              <Badge className="bg-slate-100 text-slate-500 uppercase border-0 font-bold text-[9px]">
                                {prod.category}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Linked Badge lists */}
                      {formData.linkedProducts.length > 0 && (
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 mt-3 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked Store Products:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {formData.linkedProducts.map(id => (
                              <Badge 
                                key={id} 
                                className="bg-emerald-50 text-emerald-800 border-emerald-100 flex items-center gap-1.5 py-1 px-2.5 text-xs hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                onClick={() => handleRemoveProductRule(id)}
                                title="Click to unlink product"
                              >
                                {getLinkedProductName(id)}
                                <X className="h-3.5 w-3.5 shrink-0" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Live Checkout Card Preview */}
          <div className="lg:col-span-4 sticky top-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye className="h-5 w-5 text-pink-500" />
                Live Upsell Preview
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time render of how this addon looks inside checkout pages.</p>
            </div>

            {/* E-commerce Card Replica */}
            <div className="flex items-center justify-center p-6 bg-slate-100/50 border border-dashed border-slate-200 rounded-3xl min-h-[360px] relative">
              <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded">
                High Fidelity
              </span>

              {/* Replica upsell card container */}
              <div 
                className="w-[190px] sm:w-[210px] shrink-0 bg-white/95 backdrop-blur-sm border border-white/30 rounded-2xl p-3 shadow-md hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100 flex items-center justify-center">
                    {formData.image ? (
                      <img 
                        src={formData.image} 
                        alt="Upsell Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300 p-4">
                        <Gift className="h-10 w-10 text-slate-200 mb-1" />
                        <span className="text-[10px] text-slate-400 font-semibold italic text-center">No image uploaded</span>
                      </div>
                    )}
                    {formData.badge && (
                      <span className="absolute top-2 left-2 text-[10px] uppercase font-black text-white bg-gradient-to-r from-pink-500 to-rose-500 px-2 py-0.5 rounded-full shadow-sm">
                        {formData.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 mb-0.5">
                    {formData.name || 'Untitled Addon'}
                  </h4>
                  <p className="text-[10px] text-gray-500 mb-2 font-semibold capitalize">
                    {formData.category.replace('-', ' ')}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-xs sm:text-sm font-black text-pink-600">
                      ₹{formData.discountedPrice && formData.discountedPrice > 0 ? formData.discountedPrice : formData.price}
                    </span>
                    {formData.discountedPrice > 0 && formData.discountedPrice < formData.price && (
                      <span className="text-[10px] text-gray-400 line-through font-medium">
                        ₹{formData.price}
                      </span>
                    )}
                  </div>
                  
                  {previewClicked ? (
                    <div className="flex items-center justify-between bg-pink-50 rounded-xl p-1 border border-pink-200/50">
                      <button 
                        type="button"
                        onClick={() => setPreviewClicked(false)}
                        className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg flex items-center justify-center hover:shadow active:scale-95 transition-all text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-pink-600">1</span>
                      <button 
                        type="button"
                        className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg flex items-center justify-center hover:shadow active:scale-95 transition-all text-xs font-bold opacity-50 cursor-not-allowed"
                        disabled
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setPreviewClicked(true)}
                      className="w-full py-1.5 text-xs font-bold text-pink-600 hover:text-white border border-pink-500 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 rounded-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-1"
                    >
                      ADD
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Rules stats preview */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Applied Rules Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Categories Linked:</span>
                  <span className="font-bold text-slate-800">{formData.linkedCategories.length}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Occasions Linked:</span>
                  <span className="font-bold text-slate-800">{formData.linkedOccasions.length}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Specific Products Linked:</span>
                  <span className="font-bold text-slate-800">{formData.linkedProducts.length}</span>
                </div>
                <div className="border-t border-slate-200/50 pt-2 flex items-start gap-1.5 text-[11px] text-slate-400 mt-2">
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>If zero rules are selected, this addon falls back to bestselling lists and shows at checkout universally.</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonForm;
