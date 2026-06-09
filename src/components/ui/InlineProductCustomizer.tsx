import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Camera, 
  Hash, 
  MessageSquare, 
  Flower2, 
  Gift, 
  Info, 
  X,
  Upload,
  Check,
  ShoppingCart,
  Plus,
  Minus,
  ChevronDown,
  Trash2,
  Sparkles,
  ShoppingBag,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';
import { ComboItem } from '@/services/productService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/config';
import { useCurrency } from '@/contexts/CurrencyContext';

type AddonOption = {
  name: string;
  price: number;
  type: 'flower' | 'chocolate';
  quantity?: number;
  image?: string;
};

type CustomizationOptions = {
  allowPhotoUpload: boolean;
  allowNumberInput: boolean;
  numberInputLabel: string;
  allowMessageCard: boolean;
  messageCardPrice: number;
  addons: {
    flowers: AddonOption[];
    chocolates: AddonOption[];
  };
  previewImage: string;
  useSameFlowerImage?: boolean;
  flowerGroupImage?: string;
  useSameChocolateImage?: boolean;
  chocolateGroupImage?: string;
};

type ComboItemCustomization = {
  itemIndex: number;
  message?: string;
  color?: string;
  size?: string;
  quantity: number;
  photo?: string;
  customText?: string;
  selectedAddons: string[];
  selectedVariant?: string;
};

type CustomizationData = {
  photo?: string;
  number?: string;
  messageCard?: string;
  selectedFlowers: (AddonOption & { quantity: number })[];
  selectedChocolates: (AddonOption & { quantity: number })[];
  comboItemCustomizations?: ComboItemCustomization[];
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  deliveryInstructions?: string;
};

type PriceVariant = {
  label: string;
  price: number;
  stock: number;
};

interface InlineProductCustomizerProps {
  product: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    category: string;
    customizationOptions: CustomizationOptions;
    comboItems?: ComboItem[];
    comboName?: string;
    comboDescription?: string;
    discount?: number;
  };
  selectedVariant?: PriceVariant | null;
  onAddToCart: (customizations: CustomizationData, totalPrice: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

// Unsplash placeholders
const getAddonImage = (name: string, type: 'flower' | 'chocolate'): string => {
  const lower = name.toLowerCase();
  if (type === 'flower') {
    if (lower.includes('rose')) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop';
    }
    if (lower.includes('lily') || lower.includes('lilies')) {
      return 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?q=80&w=200&auto=format&fit=crop';
    }
    if (lower.includes('orchid')) {
      return 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=200&auto=format&fit=crop';
    }
    if (lower.includes('carnation')) {
      return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=200&auto=format&fit=crop';
    }
    if (lower.includes('sunflower')) {
      return 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=200&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=200&auto=format&fit=crop';
  } else {
    if (lower.includes('ferrer') || lower.includes('rocher')) {
      return 'https://images.unsplash.com/photo-1549007994-cb92ca21edf6?q=80&w=200&auto=format&fit=crop';
    }
    if (lower.includes('cadbury') || lower.includes('dairy milk')) {
      return 'https://images.unsplash.com/photo-1548907040-4d42b52125e1?q=80&w=200&auto=format&fit=crop';
    }
    if (lower.includes('kitkat') || lower.includes('kit kat')) {
      return 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=200&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=200&auto=format&fit=crop';
  }
};

const getAddonDescription = (name: string, type: 'flower' | 'chocolate'): string => {
  const lower = name.toLowerCase();
  if (type === 'flower') {
    if (lower.includes('rose')) return 'Premium long-stemmed fresh rose';
    if (lower.includes('lily') || lower.includes('lilies')) return 'Fragrant fresh oriental lily bloom';
    if (lower.includes('orchid')) return 'Exotic luxury orchid stem';
    if (lower.includes('carnation')) return 'Charming classic carnation stem';
    return 'Freshly picked floral stem';
  } else {
    if (lower.includes('ferrer')) return 'Premium Italian hazelnut chocolates';
    if (lower.includes('cadbury')) return 'Classic smooth milk chocolate';
    return 'Delightful sweet treat';
  }
};

const getAddonTag = (index: number): 'Bestseller' | 'Popular' | 'Recommended' | 'New' | null => {
  const tags: ('Bestseller' | 'Popular' | 'Recommended' | 'New')[] = ['Bestseller', 'Popular', 'Recommended', 'New'];
  if (index % 3 === 0) return tags[index % 4];
  return null;
};

export function InlineProductCustomizer({
  product,
  selectedVariant,
  onAddToCart,
  isOpen,
  onToggleOpen,
}: InlineProductCustomizerProps) {
  const { formatPrice, convertPrice } = useCurrency();
  const [customizations, setCustomizations] = useState<CustomizationData>({
    selectedFlowers: [],
    selectedChocolates: [],
    comboItemCustomizations: product.comboItems?.map((_, index) => ({
      itemIndex: index,
      quantity: 1,
      selectedAddons: []
    })) || []
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedComboIndex, setExpandedComboIndex] = useState<number | null>(0);
  const customizerRef = useRef<HTMLDivElement>(null);

  // Initialize active tab once opened
  useEffect(() => {
    if (isOpen && !activeTab) {
      // Pick the first available step
      if (product.customizationOptions.allowPhotoUpload) setActiveTab('photo');
      else if (product.customizationOptions.allowNumberInput) setActiveTab('number');
      else if (product.customizationOptions.allowMessageCard) setActiveTab('message');
      else if (product.comboItems && product.comboItems.length > 0) setActiveTab('combo');
      else if (product.customizationOptions.addons.flowers.length > 0) setActiveTab('flowers');
      else setActiveTab('delivery');
    }
  }, [isOpen, activeTab, product]);

  // Calculate pricing
  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const baseDiscountedPrice = product.discount
    ? basePrice - (basePrice * product.discount) / 100
    : basePrice;

  // Add-ons total
  const addonsTotal = useMemo(() => {
    let total = 0;
    customizations.selectedFlowers.forEach(flower => {
      total += flower.price * (flower.quantity || 1);
    });
    customizations.selectedChocolates.forEach(chocolate => {
      total += chocolate.price * (chocolate.quantity || 1);
    });
    if (customizations.messageCard && product.customizationOptions.allowMessageCard) {
      total += product.customizationOptions.messageCardPrice;
    }
    return total;
  }, [customizations, product.customizationOptions.allowMessageCard, product.customizationOptions.messageCardPrice]);

  // Combo items subtotal additions
  const comboTotal = useMemo(() => {
    if (product.category !== 'combos' || !product.comboItems) return baseDiscountedPrice;
    let total = baseDiscountedPrice;
    product.comboItems.forEach((item, idx) => {
      const customization = customizations.comboItemCustomizations?.find(c => c.itemIndex === idx);
      let price = item.price;
      if (item.customizationOptions.allowVariants && item.customizationOptions.variants && customization?.selectedVariant) {
        const variant = item.customizationOptions.variants.find(v => v.name === customization.selectedVariant);
        if (variant) price = variant.price;
      }
      total += price * (customization?.quantity || 1);
    });
    return total;
  }, [product, customizations, baseDiscountedPrice]);

  const activeTotalPrice = product.category === 'combos' ? comboTotal : (baseDiscountedPrice + addonsTotal);

  // Steps definitions & progress tracking
  const steps = useMemo(() => {
    const list = [];
    if (product.customizationOptions.allowPhotoUpload) {
      list.push({ id: 'photo', label: 'Photo Upload', completed: !!uploadedPhoto, icon: Camera });
    }
    if (product.customizationOptions.allowNumberInput) {
      list.push({ id: 'number', label: 'Custom Number', completed: !!customizations.number?.trim(), icon: Hash });
    }
    if (product.customizationOptions.allowMessageCard) {
      list.push({ id: 'message', label: 'Greeting Card', completed: !!customizations.messageCard?.trim(), icon: MessageSquare });
    }
    if (product.category === 'combos' && product.comboItems && product.comboItems.length > 0) {
      list.push({ id: 'combo', label: 'Combo Contents', completed: true, icon: ShoppingBag }); // combo defaults to completed
    }
    if (product.customizationOptions.addons.flowers.length > 0) {
      list.push({ id: 'flowers', label: 'Extra Flowers', completed: customizations.selectedFlowers.length > 0, icon: Flower2 });
    }
    if (product.customizationOptions.addons.chocolates.length > 0) {
      list.push({ id: 'chocolates', label: 'Treats & Gifts', completed: customizations.selectedChocolates.length > 0, icon: Gift });
    }
    list.push({ 
      id: 'delivery', 
      label: 'Delivery Notes', 
      completed: !!customizations.deliveryDate, 
      icon: Calendar 
    });
    return list;
  }, [product, customizations, uploadedPhoto]);

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // File drag-and-drop & upload actions
  const validateAndUpload = async (file: File) => {
    setUploadError(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Invalid format. Please upload JPEG, PNG, or WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Max size is 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setUploadedPhoto(url);
      setCustomizations(prev => ({ ...prev, photo: url }));
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    setCustomizations(prev => ({ ...prev, photo: undefined }));
  };

  // Add-ons handlers
  const toggleFlowerAddon = (addon: AddonOption) => {
    setCustomizations(prev => {
      const isSelected = prev.selectedFlowers.some(f => f.name === addon.name);
      return {
        ...prev,
        selectedFlowers: isSelected
          ? prev.selectedFlowers.filter(f => f.name !== addon.name)
          : [...prev.selectedFlowers, { ...addon, quantity: 1 }]
      };
    });
  };

  const updateFlowerQuantity = (addonName: string, quantity: number) => {
    if (quantity < 1) {
      setCustomizations(prev => ({
        ...prev,
        selectedFlowers: prev.selectedFlowers.filter(f => f.name !== addonName)
      }));
      return;
    }
    setCustomizations(prev => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map(f => 
        f.name === addonName ? { ...f, quantity } : f
      )
    }));
  };

  const toggleChocolateAddon = (addon: AddonOption) => {
    setCustomizations(prev => {
      const isSelected = prev.selectedChocolates.some(c => c.name === addon.name);
      return {
        ...prev,
        selectedChocolates: isSelected
          ? prev.selectedChocolates.filter(c => c.name !== addon.name)
          : [...prev.selectedChocolates, { ...addon, quantity: 1 }]
      };
    });
  };

  const updateChocolateQuantity = (addonName: string, quantity: number) => {
    if (quantity < 1) {
      setCustomizations(prev => ({
        ...prev,
        selectedChocolates: prev.selectedChocolates.filter(c => c.name !== addonName)
      }));
      return;
    }
    setCustomizations(prev => ({
      ...prev,
      selectedChocolates: prev.selectedChocolates.map(c => 
        c.name === addonName ? { ...c, quantity } : c
      )
    }));
  };

  // Combo Customizations
  const updateComboCustomization = (itemIdx: number, field: keyof ComboItemCustomization, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      comboItemCustomizations: prev.comboItemCustomizations?.map(item =>
        item.itemIndex === itemIdx ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const handleComboPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemIdx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(file);
        updateComboCustomization(itemIdx, 'photo', url);
      } catch (err) {
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = () => {
    onAddToCart(customizations, activeTotalPrice);
  };

  return (
    <div id="customize-section" ref={customizerRef} className="mt-12 border-t pt-8">
      {/* Redesigned Header: Luxury Aesthetic */}
      <div 
        onClick={onToggleOpen}
        className="group flex flex-col md:flex-row md:items-center justify-between cursor-pointer py-4 px-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-800 transition-all duration-300 hover:shadow-md hover:border-primary/40 select-none"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-rose-400 text-primary-foreground dark:text-slate-900 flex items-center justify-center shadow-inner">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-850 dark:text-slate-100 flex items-center gap-2">
              Customize Your Gift
              <span className="text-xs font-semibold py-0.5 px-2 bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-full">Luxury Customization</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Personalize photos, tag numbers, message cards, delivery dates, and sweet extras.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 md:mt-0">
          {isOpen && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Steps completed:</span>
              <span className="font-extrabold text-primary">{completedCount}/{steps.length}</span>
              <div className="w-20 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  className="bg-primary h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-slate-400 group-hover:text-primary transition-colors ml-auto md:ml-0"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {/* Visual Steps Progress Bar */}
            <div className="py-6 px-4 bg-slate-50/20 dark:bg-slate-900/10 border-b border-slate-100 dark:border-slate-850">
              <div className="flex justify-between items-center max-w-xl mx-auto mb-3">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Personalization Flow</span>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  {progressPercent}% Complete
                </span>
              </div>
              <div className="max-w-xl mx-auto h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-primary via-rose-400 to-emerald-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Step Icons Indicator */}
              <div className="flex justify-center flex-wrap gap-4 sm:gap-6 mt-4">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  const isActive = activeTab === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveTab(step.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full border transition-all duration-300",
                        isActive 
                          ? "bg-primary text-white border-primary shadow-sm shadow-primary/20 scale-105" 
                          : step.completed
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      <StepIcon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{step.label}</span>
                      {step.completed && <Check className="h-3 w-3 text-emerald-500 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Two-Column / Mobile Stacked Layout */}
            <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Accordion Panels (Span 7) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 1. Photo Upload */}
                {product.customizationOptions.allowPhotoUpload && (
                  <div 
                    className={cn(
                      "rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 overflow-hidden shadow-sm",
                      activeTab === 'photo' 
                        ? "border-primary ring-1 ring-primary/20 shadow-md shadow-primary/5" 
                        : "border-slate-200/80 dark:border-slate-800"
                    )}
                  >
                    <div 
                      onClick={() => setActiveTab(activeTab === 'photo' ? null : 'photo')}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                          activeTab === 'photo' ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                        )}>
                          <Camera className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2">
                            Personal Photo Upload
                            {uploadedPhoto && <Check className="h-4 w-4 text-emerald-500" />}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">High quality photo print to add with gifts</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", activeTab === 'photo' && "rotate-180")} />
                    </div>

                    <AnimatePresence initial={false}>
                      {activeTab === 'photo' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-slate-100 dark:border-slate-900 p-5 bg-slate-50/20 dark:bg-slate-950/20"
                        >
                          {uploadedPhoto ? (
                            <div className="relative rounded-2xl overflow-hidden border border-primary/20 group">
                              <img
                                src={uploadedPhoto}
                                alt="Uploaded preview"
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={removePhoto}
                                  className="rounded-full flex items-center gap-1.5 h-9"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Remove Photo
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={cn(
                                "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300",
                                isDragOver 
                                  ? "border-primary bg-primary/5 scale-[0.99]" 
                                  : "border-slate-200 dark:border-slate-800 bg-slate-50/30 hover:border-primary/50"
                              )}
                            >
                              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                              <Label htmlFor="inline-photo-upload" className="cursor-pointer">
                                <div className="text-sm font-bold text-primary hover:underline">Click to browse or Drag & Drop here</div>
                                <p className="text-xs text-slate-400 mt-1.5">Supports JPG, PNG, WEBP up to 5MB</p>
                              </Label>
                              <input
                                id="inline-photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="hidden"
                              />
                              {isUploading && (
                                <motion.div 
                                  className="mt-3 text-xs font-bold text-primary animate-pulse flex items-center justify-center gap-1.5"
                                >
                                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                  Uploading your gift photo...
                                </motion.div>
                              )}
                              {uploadError && (
                                <p className="mt-2 text-xs font-semibold text-rose-500">{uploadError}</p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 2. Custom Number / Text tag */}
                {product.customizationOptions.allowNumberInput && (
                  <div 
                    className={cn(
                      "rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 overflow-hidden shadow-sm",
                      activeTab === 'number' 
                        ? "border-primary ring-1 ring-primary/20 shadow-md" 
                        : "border-slate-200/80 dark:border-slate-800"
                    )}
                  >
                    <div 
                      onClick={() => setActiveTab(activeTab === 'number' ? null : 'number')}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                          activeTab === 'number' ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                        )}>
                          <Hash className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2">
                            Customized Number Tag
                            {customizations.number?.trim() && <Check className="h-4 w-4 text-emerald-500" />}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Custom digit sign for birthday or anniversary</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", activeTab === 'number' && "rotate-180")} />
                    </div>

                    <AnimatePresence initial={false}>
                      {activeTab === 'number' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-slate-100 dark:border-slate-900 p-5 bg-slate-50/20 dark:bg-slate-950/20"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="tag-number" className="text-xs font-bold text-slate-600 dark:text-slate-350">
                              {product.customizationOptions.numberInputLabel || 'Tag number (e.g. 25)'}
                            </Label>
                            <Input
                              id="tag-number"
                              type="text"
                              maxLength={15}
                              placeholder="e.g. 18 or Happy Bday"
                              value={customizations.number || ''}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, number: e.target.value }))}
                              className="h-11 bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-primary focus:border-primary text-sm font-semibold"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 3. Greeting Card Message */}
                {product.customizationOptions.allowMessageCard && (
                  <div 
                    className={cn(
                      "rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 overflow-hidden shadow-sm",
                      activeTab === 'message' 
                        ? "border-primary ring-1 ring-primary/20 shadow-md" 
                        : "border-slate-200/80 dark:border-slate-800"
                    )}
                  >
                    <div 
                      onClick={() => setActiveTab(activeTab === 'message' ? null : 'message')}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                          activeTab === 'message' ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                        )}>
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2">
                            Add Personal Greeting Card
                            {customizations.messageCard?.trim() && <Check className="h-4 w-4 text-emerald-500" />}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Written text delivered with your flowers</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-amber-100 hover:bg-amber-150 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-none font-bold text-[10px]">
                          +₹{product.customizationOptions.messageCardPrice}
                        </Badge>
                        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", activeTab === 'message' && "rotate-180")} />
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {activeTab === 'message' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-slate-100 dark:border-slate-900 p-5 bg-slate-50/20 dark:bg-slate-950/20"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="greeting-msg" className="text-xs font-bold text-slate-600 dark:text-slate-350">Card Greeting Message</Label>
                            <Textarea
                              id="greeting-msg"
                              maxLength={350}
                              placeholder="Write a message here (e.g. Wishing you the happiest birthday, lots of love!)"
                              value={customizations.messageCard || ''}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, messageCard: e.target.value }))}
                              className="min-h-[100px] bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:ring-primary text-sm font-medium"
                            />
                            <div className="text-right text-[10px] text-slate-400">
                              {(customizations.messageCard || '').length}/350 characters
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 4. Combo Customizations Drawer */}
                {product.category === 'combos' && product.comboItems && product.comboItems.length > 0 && (
                  <div 
                    className={cn(
                      "rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 overflow-hidden shadow-sm",
                      activeTab === 'combo' 
                        ? "border-primary ring-1 ring-primary/20 shadow-md" 
                        : "border-slate-200/80 dark:border-slate-800"
                    )}
                  >
                    <div 
                      onClick={() => setActiveTab(activeTab === 'combo' ? null : 'combo')}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                          activeTab === 'combo' ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                        )}>
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                            Customize Combo Items
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Configure individual items inside the package</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", activeTab === 'combo' && "rotate-180")} />
                    </div>

                    <AnimatePresence initial={false}>
                      {activeTab === 'combo' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-slate-100 dark:border-slate-900 p-4 space-y-4 bg-slate-50/20 dark:bg-slate-950/20"
                        >
                          <div className="space-y-3">
                            {product.comboItems.map((item, idx) => {
                              const itemCustomization = customizations.comboItemCustomizations?.find(c => c.itemIndex === idx);
                              const isSubExpanded = expandedComboIndex === idx;

                              return (
                                <Card key={idx} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-sm">
                                  <div 
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/40 select-none"
                                    onClick={() => setExpandedComboIndex(isSubExpanded ? null : idx)}
                                  >
                                    <div className="flex items-center gap-3">
                                      {item.image && (
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-850"
                                        />
                                      )}
                                      <div className="text-left">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{item.name}</h4>
                                        {item.description && (
                                          <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-[300px]">{item.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {itemCustomization?.quantity && itemCustomization.quantity > 1 && (
                                        <Badge className="bg-purple-100 text-purple-800 border-none font-extrabold text-[9px]">
                                          x{itemCustomization.quantity}
                                        </Badge>
                                      )}
                                      <motion.div
                                        animate={{ rotate: isSubExpanded ? 180 : 0 }}
                                        className="text-slate-400"
                                      >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      </motion.div>
                                    </div>
                                  </div>

                                  <AnimatePresence initial={false}>
                                    {isSubExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-100 dark:border-slate-850 p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/10"
                                      >
                                        {/* Color Choice */}
                                        {item.customizationOptions.allowColorChoice && item.customizationOptions.colorOptions.length > 0 && (
                                          <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">Color Option</Label>
                                            <div className="flex flex-wrap gap-1.5">
                                              {item.customizationOptions.colorOptions.map((color, colorIdx) => (
                                                <button
                                                  key={colorIdx}
                                                  type="button"
                                                  onClick={() => updateComboCustomization(idx, 'color', color)}
                                                  className={cn(
                                                    "px-3 py-1 rounded-lg text-xs font-semibold border transition-all",
                                                    itemCustomization?.color === color
                                                      ? "bg-primary text-white border-primary shadow-sm"
                                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                                                  )}
                                                >
                                                  {color}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Size Choice */}
                                        {item.customizationOptions.allowSizeChoice && item.customizationOptions.sizeOptions.length > 0 && (
                                          <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">Size Option</Label>
                                            <div className="flex flex-wrap gap-1.5">
                                              {item.customizationOptions.sizeOptions.map((size, sizeIdx) => (
                                                <button
                                                  key={sizeIdx}
                                                  type="button"
                                                  onClick={() => updateComboCustomization(idx, 'size', size)}
                                                  className={cn(
                                                    "px-3 py-1 rounded-lg text-xs font-semibold border transition-all",
                                                    itemCustomization?.size === size
                                                      ? "bg-primary text-white border-primary shadow-sm"
                                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                                                  )}
                                                >
                                                  {size}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Custom Text Choice */}
                                        {item.customizationOptions.allowCustomText && (
                                          <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">
                                              {item.customizationOptions.customTextLabel || 'Custom text tag'}
                                            </Label>
                                            <Input
                                              type="text"
                                              placeholder="Details..."
                                              value={itemCustomization?.customText || ''}
                                              onChange={(e) => updateComboCustomization(idx, 'customText', e.target.value)}
                                              className="h-9 text-xs bg-white dark:bg-slate-900"
                                            />
                                          </div>
                                        )}

                                        {/* Greeting Message Choice */}
                                        {item.customizationOptions.allowMessage && (
                                          <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">
                                              {item.customizationOptions.messageLabel || 'Item greeting message'}
                                            </Label>
                                            <Textarea
                                              placeholder="Message content..."
                                              value={itemCustomization?.message || ''}
                                              onChange={(e) => updateComboCustomization(idx, 'message', e.target.value)}
                                              className="h-16 text-xs resize-none"
                                            />
                                          </div>
                                        )}

                                        {/* Sub-item photo upload */}
                                        {item.customizationOptions.allowPhotoUpload && (
                                          <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">Sub-item Image Upload</Label>
                                            {itemCustomization?.photo ? (
                                              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group">
                                                <img
                                                  src={itemCustomization.photo}
                                                  alt="Subitem upload"
                                                  className="w-full h-full object-cover"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => updateComboCustomization(idx, 'photo', undefined)}
                                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                                                >
                                                  <X className="h-4 w-4" />
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="border border-dashed rounded-lg p-4 text-center bg-white dark:bg-slate-900">
                                                <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                                                <Label htmlFor={`combo-upload-${idx}`} className="cursor-pointer text-[10px] font-bold text-primary">
                                                  Browse sub-item image
                                                </Label>
                                                <input
                                                  id={`combo-upload-${idx}`}
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={(e) => handleComboPhotoUpload(e, idx)}
                                                  className="hidden"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </Card>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 5. Extra Flowers Selection */}
                {product.customizationOptions.addons.flowers.length > 0 && (
                  <div 
                    className={cn(
                      "rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 overflow-hidden shadow-sm",
                      activeTab === 'flowers' 
                        ? "border-primary ring-1 ring-primary/20 shadow-md" 
                        : "border-slate-200/80 dark:border-slate-800"
                    )}
                  >
                    <div 
                      onClick={() => setActiveTab(activeTab === 'flowers' ? null : 'flowers')}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                          activeTab === 'flowers' ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                        )}>
                          <Flower2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2">
                            Enhance with Extra Flowers
                            {customizations.selectedFlowers.length > 0 && <Check className="h-4 w-4 text-emerald-500" />}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Upgrade bouquet with additional fresh blooms</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", activeTab === 'flowers' && "rotate-180")} />
                    </div>

                    <AnimatePresence initial={false}>
                      {activeTab === 'flowers' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-slate-100 dark:border-slate-900 p-5 bg-slate-50/20 dark:bg-slate-950/20"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {product.customizationOptions.addons.flowers.map((flower, idx) => {
                              const selectedFlower = customizations.selectedFlowers.find(f => f.name === flower.name);
                              const isSelected = !!selectedFlower;
                              const quantity = selectedFlower?.quantity || 0;
                              const tag = getAddonTag(idx);
                              const addonImage = flower.image ? getImageUrl(flower.image) : getAddonImage(flower.name, 'flower');
                              const addonDesc = getAddonDescription(flower.name, 'flower');

                              return (
                                <motion.div
                                  key={idx}
                                  whileHover={{ y: -2 }}
                                  className={cn(
                                    "p-3 rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 flex items-center justify-between gap-3 shadow-sm select-none relative overflow-hidden",
                                    isSelected 
                                      ? "border-pink-500/80 ring-1 ring-pink-500/30 shadow-pink-500/5 bg-pink-50/10 dark:bg-pink-950/10" 
                                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350"
                                  )}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-900 flex-shrink-0 bg-slate-50">
                                      <img
                                        src={addonImage}
                                        alt={flower.name}
                                        className="w-full h-full object-cover"
                                      />
                                      {tag && (
                                        <div className="absolute top-0 left-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold uppercase text-[7px] px-1.5 py-0.5 rounded-br-lg shadow-sm">
                                          {tag}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                                        {flower.name}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{addonDesc}</p>
                                      <div className="text-xs font-bold text-pink-600 dark:text-pink-400 mt-1">
                                        +₹{flower.price}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-shrink-0 z-10">
                                    {isSelected ? (
                                      <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full p-0.5 border border-slate-200 dark:border-slate-800 w-24 h-8 justify-between">
                                        <button
                                          type="button"
                                          onClick={() => updateFlowerQuantity(flower.name, quantity - 1)}
                                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 w-6 text-center">
                                          {quantity}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => updateFlowerQuantity(flower.name, quantity + 1)}
                                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => toggleFlowerAddon(flower)}
                                        className="h-8 rounded-full border-pink-200 dark:border-pink-900/60 text-pink-600 hover:bg-pink-50/50 dark:text-pink-400 font-bold text-xs px-4"
                                      >
                                        + ADD
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 6. Chocolates & Premium Treats */}
                {product.customizationOptions.addons.chocolates.length > 0 && (
                  <div 
                    className={cn(
                      "rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 overflow-hidden shadow-sm",
                      activeTab === 'chocolates' 
                        ? "border-primary ring-1 ring-primary/20 shadow-md" 
                        : "border-slate-200/80 dark:border-slate-800"
                    )}
                  >
                    <div 
                      onClick={() => setActiveTab(activeTab === 'chocolates' ? null : 'chocolates')}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                          activeTab === 'chocolates' ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                        )}>
                          <Gift className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2">
                            Chocolates & Premium Treats
                            {customizations.selectedChocolates.length > 0 && <Check className="h-4 w-4 text-emerald-500" />}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Complement florist gift with gourmet chocolates</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", activeTab === 'chocolates' && "rotate-180")} />
                    </div>

                    <AnimatePresence initial={false}>
                      {activeTab === 'chocolates' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-slate-100 dark:border-slate-900 p-5 bg-slate-50/20 dark:bg-slate-950/20"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {product.customizationOptions.addons.chocolates.map((chocolate, idx) => {
                              const selectedChocolate = customizations.selectedChocolates.find(c => c.name === chocolate.name);
                              const isSelected = !!selectedChocolate;
                              const quantity = selectedChocolate?.quantity || 0;
                              const tag = getAddonTag(idx + 1);
                              const addonImage = chocolate.image ? getImageUrl(chocolate.image) : getAddonImage(chocolate.name, 'chocolate');
                              const addonDesc = getAddonDescription(chocolate.name, 'chocolate');

                              return (
                                <motion.div
                                  key={idx}
                                  whileHover={{ y: -2 }}
                                  className={cn(
                                    "p-3 rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 flex items-center justify-between gap-3 shadow-sm select-none relative overflow-hidden",
                                    isSelected 
                                      ? "border-orange-500/80 ring-1 ring-orange-500/30 shadow-orange-500/5 bg-orange-50/10 dark:bg-orange-950/10" 
                                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350"
                                  )}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-900 flex-shrink-0 bg-slate-50">
                                      <img
                                        src={addonImage}
                                        alt={chocolate.name}
                                        className="w-full h-full object-cover"
                                      />
                                      {tag && (
                                        <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold uppercase text-[7px] px-1.5 py-0.5 rounded-br-lg shadow-sm">
                                          {tag}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                                        {chocolate.name}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{addonDesc}</p>
                                      <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-1">
                                        +₹{chocolate.price}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-shrink-0 z-10">
                                    {isSelected ? (
                                      <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full p-0.5 border border-slate-200 dark:border-slate-800 w-24 h-8 justify-between">
                                        <button
                                          type="button"
                                          onClick={() => updateChocolateQuantity(chocolate.name, quantity - 1)}
                                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 w-6 text-center">
                                          {quantity}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => updateChocolateQuantity(chocolate.name, quantity + 1)}
                                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => toggleChocolateAddon(chocolate)}
                                        className="h-8 rounded-full border-orange-200 dark:border-orange-900/60 text-orange-600 hover:bg-orange-50/50 dark:text-orange-400 font-bold text-xs px-4"
                                      >
                                        + ADD
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 7. Delivery Date & Instruction notes */}
                <div 
                  className={cn(
                    "rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 overflow-hidden shadow-sm",
                    activeTab === 'delivery' 
                      ? "border-primary ring-1 ring-primary/20 shadow-md" 
                      : "border-slate-200/80 dark:border-slate-800"
                  )}
                >
                  <div 
                    onClick={() => setActiveTab(activeTab === 'delivery' ? null : 'delivery')}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                        activeTab === 'delivery' ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                      )}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2">
                          Delivery Date & Special Notes
                          {customizations.deliveryDate && <Check className="h-4 w-4 text-emerald-500" />}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Specify when to deliver and specific guidelines</p>
                      </div>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", activeTab === 'delivery' && "rotate-180")} />
                  </div>

                  <AnimatePresence initial={false}>
                    {activeTab === 'delivery' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-slate-100 dark:border-slate-900 p-5 bg-slate-50/20 dark:bg-slate-950/20 space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Date selection picker */}
                          <div className="space-y-1.5">
                            <Label htmlFor="deliv-date" className="text-xs font-bold text-slate-600 dark:text-slate-350">Delivery Date</Label>
                            <div className="relative">
                              <Input
                                id="deliv-date"
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={customizations.deliveryDate || ''}
                                onChange={(e) => setCustomizations(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                className="h-11 bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl pr-10 text-sm font-semibold text-slate-800 dark:text-slate-200"
                              />
                            </div>
                          </div>

                          {/* Delivery premium time slot */}
                          <div className="space-y-1.5">
                            <Label htmlFor="deliv-slot" className="text-xs font-bold text-slate-600 dark:text-slate-350">Delivery Time Window</Label>
                            <select
                              id="deliv-slot"
                              value={customizations.deliveryTimeSlot || ''}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, deliveryTimeSlot: e.target.value }))}
                              className="w-full h-11 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 rounded-xl px-3 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-200"
                            >
                              <option value="">Standard Slot (9:00 AM - 7:00 PM)</option>
                              <option value="morning">Morning Express (7:00 AM - 11:00 AM) [+₹150]</option>
                              <option value="evening">Sunset Slots (5:00 PM - 8:00 PM) [+₹100]</option>
                              <option value="midnight">Midnight Gifting Surprise (11:00 PM - 12:00 AM) [+₹250]</option>
                            </select>
                          </div>
                        </div>

                        {/* Special instructions */}
                        <div className="space-y-1.5">
                          <Label htmlFor="deliv-notes" className="text-xs font-bold text-slate-600 dark:text-slate-350">Delivery Instructions / Notes</Label>
                          <Textarea
                            id="deliv-notes"
                            placeholder="e.g. Please leave bouquet with guard / ring bell twice / surprise recipient at office..."
                            value={customizations.deliveryInstructions || ''}
                            onChange={(e) => setCustomizations(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                            className="min-h-[70px] bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl resize-none text-sm"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Right Column: Sticky Summary Preview Card (Span 5) */}
              <div className="lg:col-span-5 sticky top-24">
                <Card className="border border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-white to-slate-50/20 dark:from-slate-950 dark:to-slate-950/20 shadow-lg rounded-3xl p-5 space-y-5 overflow-hidden relative">
                  
                  {/* Decorative glowing background accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="text-center pb-2">
                    <div className="relative inline-block group">
                      <img
                        src={uploadedPhoto || product.images[0] || product.customizationOptions.previewImage}
                        alt={product.title}
                        className="w-40 h-40 object-cover rounded-2xl mx-auto border border-slate-100 dark:border-slate-900 shadow-md transition-all duration-500 group-hover:scale-[1.02]"
                      />
                      {uploadedPhoto && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm mt-4 tracking-tight">{product.title}</h4>
                    {selectedVariant && (
                      <span className="text-[10px] uppercase font-bold py-0.5 px-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-full mt-1.5 inline-block">
                        Size: {selectedVariant.label}
                      </span>
                    )}
                  </div>

                  {/* Configured options summary */}
                  <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 max-h-56 overflow-y-auto sidebar-scrollable">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Personalization details</span>
                    
                    {/* Standard items summary */}
                    {uploadedPhoto && (
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5"><Camera className="h-3.5 w-3.5 text-primary" /> Photo Print</span>
                        <span className="font-bold text-emerald-500">Included</span>
                      </div>
                    )}
                    {customizations.number?.trim() && (
                      <div className="flex items-center justify-between text-xs text-slate-650 dark:text-slate-300">
                        <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-primary" /> Tag Number</span>
                        <span className="font-bold">{customizations.number}</span>
                      </div>
                    )}
                    {customizations.messageCard?.trim() && (
                      <div className="space-y-1 text-xs text-slate-650 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-primary" /> Greeting Card</span>
                          <span className="font-bold">+₹{product.customizationOptions.messageCardPrice}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 italic line-clamp-1">"{customizations.messageCard}"</p>
                      </div>
                    )}

                    {/* Flower Add-ons */}
                    {customizations.selectedFlowers.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-slate-650 dark:text-slate-300">
                        <span className="truncate flex items-center gap-1.5"><Flower2 className="h-3.5 w-3.5 text-pink-400" /> {f.name}</span>
                        <span className="font-bold">x{f.quantity} (+₹{f.price * f.quantity})</span>
                      </div>
                    ))}

                    {/* Chocolate Add-ons */}
                    {customizations.selectedChocolates.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-slate-650 dark:text-slate-300">
                        <span className="truncate flex items-center gap-1.5"><Gift className="h-3.5 w-3.5 text-orange-400" /> {c.name}</span>
                        <span className="font-bold">x{c.quantity} (+₹{c.price * c.quantity})</span>
                      </div>
                    ))}

                    {/* Combo Add-ons details */}
                    {customizations.comboItemCustomizations?.some(c => c.quantity > 1 || c.message || c.color || c.size || c.photo) && (
                      <div className="border-t pt-2 mt-2 space-y-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400 block">Combo Sub-items Customizations</span>
                        {customizations.comboItemCustomizations.map((c, i) => {
                          const item = product.comboItems?.[c.itemIndex];
                          if (!item || (!c.color && !c.size && !c.message && !c.photo && c.quantity === 1)) return null;
                          return (
                            <div key={i} className="text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>:
                              {c.color && ` Color: ${c.color}`}
                              {c.size && ` Size: ${c.size}`}
                              {c.message && ` Message Card included`}
                              {c.photo && ` Photo printed`}
                              {c.quantity > 1 && ` Qty: ${c.quantity}`}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Delivery Date Details */}
                    {customizations.deliveryDate && (
                      <div className="border-t pt-2 mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> Delivery Date</span>
                          <span className="font-bold">{customizations.deliveryDate}</span>
                        </div>
                        {customizations.deliveryTimeSlot && (
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Time slot:</span>
                            <span className="font-semibold">{customizations.deliveryTimeSlot === 'morning' ? 'Morning Express' : customizations.deliveryTimeSlot === 'evening' ? 'Sunset Slot' : 'Midnight Surpise'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Default state: No configurations yet */}
                    {!uploadedPhoto && 
                     !customizations.number?.trim() && 
                     !customizations.messageCard?.trim() && 
                     customizations.selectedFlowers.length === 0 && 
                     customizations.selectedChocolates.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400 font-semibold italic">
                        Select a step above to start customizing your gifting arrangement.
                      </div>
                    )}
                  </div>

                  {/* Pricing recap details */}
                  <div className="space-y-1.5 pt-2 border-t">
                    <div className="flex justify-between text-xs text-slate-450 dark:text-slate-400">
                      <span>Base product price</span>
                      <span>{formatPrice(convertPrice(baseDiscountedPrice))}</span>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="flex justify-between text-xs text-slate-450 dark:text-slate-400">
                        <span>Personalized additions</span>
                        <span>+ {formatPrice(convertPrice(addonsTotal))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-extrabold text-primary pt-2">
                      <span>Live Estimated Total</span>
                      <span>{formatPrice(convertPrice(activeTotalPrice))}</span>
                    </div>
                  </div>

                  {/* Confirm customizations / Add to cart CTA */}
                  <Button 
                    onClick={handleSubmit}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-rose-500 hover:from-primary/95 hover:to-rose-500/95 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    Confirm & Add customized to Cart
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Card>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Action Bar */}
      {isOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-5 py-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] animate-fade-in">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Est. Gifting Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                {formatPrice(convertPrice(activeTotalPrice))}
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleSubmit}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-rose-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      )}
    </div>
  );
}
