import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Camera, 
  Hash, 
  MessageSquare, 
  Flower2, 
  Gift, 
  IndianRupee, 
  Info, 
  X,
  Upload,
  Check,
  ShoppingCart,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';
import { ComboItem } from '@/services/productService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/config';

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
};

interface CustomizeProductModalProps {
  open: boolean;
  onClose: () => void;
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
  };
  onAddToCart: (customizations: CustomizationData, totalPrice: number) => void;
}

// High-quality unsplash image fallbacks for add-ons
const getAddonImage = (name: string, type: 'flower' | 'chocolate'): string => {
  const lower = name.toLowerCase();
  if (type === 'flower') {
    if (lower.includes('rose')) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=120&auto=format&fit=crop';
    }
    if (lower.includes('lily') || lower.includes('lilies')) {
      return 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?q=80&w=120&auto=format&fit=crop';
    }
    if (lower.includes('orchid')) {
      return 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=120&auto=format&fit=crop';
    }
    if (lower.includes('carnation')) {
      return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=120&auto=format&fit=crop';
    }
    if (lower.includes('sunflower')) {
      return 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=120&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=120&auto=format&fit=crop';
  } else {
    if (lower.includes('ferrer') || lower.includes('rocher')) {
      return 'https://images.unsplash.com/photo-1549007994-cb92ca21edf6?q=80&w=120&auto=format&fit=crop';
    }
    if (lower.includes('cadbury') || lower.includes('dairy milk')) {
      return 'https://images.unsplash.com/photo-1548907040-4d42b52125e1?q=80&w=120&auto=format&fit=crop';
    }
    if (lower.includes('kitkat') || lower.includes('kit kat')) {
      return 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=120&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=120&auto=format&fit=crop';
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

export function CustomizeProductModal({
  open,
  onClose,
  product,
  onAddToCart,
}: CustomizeProductModalProps) {
  const [customizations, setCustomizations] = useState<CustomizationData>({
    selectedFlowers: [],
    selectedChocolates: [],
    comboItemCustomizations: product.comboItems?.map((_, index) => ({
      itemIndex: index,
      quantity: 1,
      selectedAddons: []
    })) || []
  });

  const [totalPrice, setTotalPrice] = useState(product.price);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedComboIndex, setExpandedComboIndex] = useState<number | null>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset confirmation state when modal opens
    if (open) {
      setIsConfirmed(false);
    }
  }, [open]);

  useEffect(() => {
    // Calculate total price based on selections
    let total = product.price;

    customizations.selectedFlowers.forEach(flower => {
      total += flower.price * (flower.quantity || 1);
    });

    customizations.selectedChocolates.forEach(chocolate => {
      total += chocolate.price * (chocolate.quantity || 1);
    });

    if (customizations.messageCard && product.customizationOptions.allowMessageCard) {
      total += product.customizationOptions.messageCardPrice;
    }

    setTotalPrice(total);
  }, [customizations, product.price, product.customizationOptions.messageCardPrice]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(file);
        setUploadedPhoto(url);
        setCustomizations(prev => ({
          ...prev,
          photo: url
        }));
      } catch (err) {
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    setCustomizations(prev => ({
      ...prev,
      photo: undefined
    }));
  };

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

  const updateFlowerQuantity = (addonName: string, quantity: number) => {
    if (quantity < 1) {
      // Remove addon if quantity goes below 1
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

  const updateChocolateQuantity = (addonName: string, quantity: number) => {
    if (quantity < 1) {
      // Remove addon if quantity goes below 1
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

  const handleConfirm = () => {
    setIsConfirmed(true);
    // Smooth scroll back to top of preview when reviewing
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleSubmit = () => {
    onAddToCart(customizations, product.category === 'combos' ? comboTotalPrice : totalPrice);
    onClose();
    setIsConfirmed(false);
  };

  const getAddonTotal = (addons: (AddonOption & { quantity: number })[]) => {
    return addons.reduce((sum, addon) => sum + (addon.price * (addon.quantity || 1)), 0);
  };

  // Combo item customization functions
  const updateComboItemCustomization = (itemIndex: number, field: keyof ComboItemCustomization, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      comboItemCustomizations: prev.comboItemCustomizations?.map(customization =>
        customization.itemIndex === itemIndex
          ? { ...customization, [field]: value }
          : customization
      ) || []
    }));
  };

  const updateComboItemQuantity = (itemIndex: number, quantity: number) => {
    if (quantity < 1) return;
    updateComboItemCustomization(itemIndex, 'quantity', quantity);
  };

  const toggleComboItemAddon = (itemIndex: number, addonName: string) => {
    const currentCustomization = customizations.comboItemCustomizations?.find(c => c.itemIndex === itemIndex);
    const currentAddons = currentCustomization?.selectedAddons || [];
    
    const newAddons = currentAddons.includes(addonName)
      ? currentAddons.filter(addon => addon !== addonName)
      : [...currentAddons, addonName];
    
    updateComboItemCustomization(itemIndex, 'selectedAddons', newAddons);
  };

  const handleComboItemPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, itemIndex: number) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(file);
        updateComboItemCustomization(itemIndex, 'photo', url);
      } catch (err) {
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const comboTotalPrice = useMemo(() => {
    if (product.category !== 'combos' || !product.comboItems) return product.price;
    let total = product.price;
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
  }, [product, customizations]);

  const activeTotalPrice = product.category === 'combos' ? comboTotalPrice : totalPrice;
  const selectedCount = customizations.selectedFlowers.length + customizations.selectedChocolates.length + (customizations.photo ? 1 : 0) + (customizations.messageCard ? 1 : 0);

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogPrimitive.Portal>
          {/* Backdrop Blur Overlay */}
          <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/45 backdrop-blur-sm transition-all duration-300" />
          
          {/* Top-Centered Container */}
          <div className="fixed inset-0 z-modal overflow-y-auto flex items-start justify-center p-4 sm:p-10">
            
            {/* Modal Dialog Content Primitive */}
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative w-full max-w-4xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden outline-none"
              >
                <DialogPrimitive.Description className="sr-only">
                  Customize your selected flower bouquet or gift items, add message cards, uploaded photos, and treats.
                </DialogPrimitive.Description>
            {/* Header section */}
            <div className="relative bg-white dark:bg-slate-950 px-5 pt-3 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              
              {/* Drag Handle on Mobile */}
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden cursor-grab active:cursor-grabbing" />
              
              <div className="flex items-center gap-4">
                <img
                  src={uploadedPhoto || product.images[0] || product.customizationOptions.previewImage}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded-xl border border-slate-100 dark:border-slate-800 flex-shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                    {product.category === 'combos' ? 'Gift Combo Box' : 'Luxury Bouquet'}
                  </span>
                  <DialogTitle className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    Customize {product.title}
                  </DialogTitle>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main scrollable customization zone */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-28 flex flex-col md:flex-row gap-6 min-h-0 max-h-[calc(85vh-170px)] sm:max-h-[calc(80vh-170px)]"
            >
              <AnimatePresence mode="wait">
                {!isConfirmed ? (
                  // Customization step (Left customization, right sticky recap on desktop)
                  <motion.div 
                    key="customizer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex flex-col md:flex-row gap-6 items-start"
                  >
                    {/* Left Customizations list */}
                    <div className="flex-1 w-full space-y-5">
                      
                      {/* Photo Upload Card */}
                      {product.customizationOptions.allowPhotoUpload && (
                        <Card className="border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Camera className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                Upload Personal Photo
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-[200px] text-xs">Upload a personal photo to print or include with this custom arrangement.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </CardTitle>
                              <p className="text-xs text-slate-400 mt-0.5">High quality JPEG or PNG up to 5MB</p>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            {uploadedPhoto ? (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative rounded-xl overflow-hidden border border-blue-200 dark:border-blue-900 group"
                              >
                                <img
                                  src={uploadedPhoto}
                                  alt="Uploaded photo"
                                  className="w-full h-36 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 rounded-full flex items-center gap-1.5"
                                    onClick={removePhoto}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Remove
                                  </Button>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-6 text-center transition-colors bg-slate-50/50 dark:bg-slate-900/20">
                                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <Label htmlFor="photo-upload" className="cursor-pointer">
                                  <div className="text-sm font-semibold text-primary hover:underline">Click to browse file</div>
                                </Label>
                                <Input
                                  id="photo-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  disabled={isUploading}
                                  className="hidden"
                                />
                                {isUploading && (
                                  <div className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                                    Uploading to Cloudinary...
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Number Input Card */}
                      {product.customizationOptions.allowNumberInput && (
                        <Card className="border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <Hash className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                                Customized Number Tag
                              </CardTitle>
                              <p className="text-xs text-slate-400 mt-0.5">Specify a custom number for balloons, signs, or boxes</p>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <Input
                              type="text"
                              placeholder={product.customizationOptions.numberInputLabel || 'e.g., age 25'}
                              value={customizations.number || ''}
                              onChange={(e) => setCustomizations(prev => ({
                                ...prev,
                                number: e.target.value
                              }))}
                              className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-primary"
                            />
                          </CardContent>
                        </Card>
                      )}

                      {/* Message Card Text Area */}
                      {product.customizationOptions.allowMessageCard && (
                        <Card className="border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                              <MessageSquare className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                                  Add Personal Greeting Card
                                </CardTitle>
                                <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border-none text-[10px]">
                                  +₹{product.customizationOptions.messageCardPrice}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">Write a heartfelt message to deliver with the florist package</p>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <Textarea
                              placeholder="Type your personal message here (e.g. Happy Birthday! Love you lots...)"
                              value={customizations.messageCard || ''}
                              onChange={(e) => setCustomizations(prev => ({
                                ...prev,
                                messageCard: e.target.value
                              }))}
                              className="min-h-[90px] text-sm bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:ring-1 focus:ring-primary"
                            />
                          </CardContent>
                        </Card>
                      )}

                      {/* Combo Items customizer */}
                      {product.category === 'combos' && product.comboItems && product.comboItems.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">Customize Combo Package</h3>
                          </div>
                          
                          <div className="space-y-3">
                            {product.comboItems.map((item, idx) => {
                              const itemCustomization = customizations.comboItemCustomizations?.find(c => c.itemIndex === idx);
                              const isExpanded = expandedComboIndex === idx;
                              
                              return (
                                <Card key={idx} className="border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm transition-all">
                                  <div 
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                                    onClick={() => setExpandedComboIndex(isExpanded ? null : idx)}
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
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</h4>
                                        {item.description && (
                                          <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[350px]">{item.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {itemCustomization?.quantity && itemCustomization.quantity > 1 && (
                                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-[10px] font-bold border-none">
                                          x{itemCustomization.quantity}
                                        </Badge>
                                      )}
                                      <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-slate-400"
                                      >
                                        <ChevronDown className="h-4 w-4" />
                                      </motion.div>
                                    </div>
                                  </div>

                                  <AnimatePresence initial={false}>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden border-t border-slate-100 dark:border-slate-850"
                                      >
                                        <div className="p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/10">
                                          
                                          {/* Quantity customization */}
                                          {item.customizationOptions.allowQuantity && (
                                            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm">
                                              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Item Quantity</span>
                                              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 w-24 h-8 justify-between">
                                                <button
                                                  type="button"
                                                  onClick={() => updateComboItemQuantity(idx, Math.max(1, (itemCustomization?.quantity || 1) - 1))}
                                                  className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                                >
                                                  <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-6 text-center select-none">
                                                  {itemCustomization?.quantity || 1}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => updateComboItemQuantity(idx, Math.min(item.customizationOptions.maxQuantity || 5, (itemCustomization?.quantity || 1) + 1))}
                                                  className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                                >
                                                  <Plus className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {/* Color Choice */}
                                          {item.customizationOptions.allowColorChoice && item.customizationOptions.colorOptions.length > 0 && (
                                            <div className="space-y-1.5">
                                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-350">Select Color Color</Label>
                                              <div className="flex flex-wrap gap-2">
                                                {item.customizationOptions.colorOptions.map((color, colorIdx) => (
                                                  <button
                                                    key={colorIdx}
                                                    type="button"
                                                    onClick={() => updateComboItemCustomization(idx, 'color', color)}
                                                    className={cn(
                                                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                                      itemCustomization?.color === color
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20"
                                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
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
                                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-350">Select Size</Label>
                                              <div className="flex flex-wrap gap-2">
                                                {item.customizationOptions.sizeOptions.map((size, sizeIdx) => (
                                                  <button
                                                    key={sizeIdx}
                                                    type="button"
                                                    onClick={() => updateComboItemCustomization(idx, 'size', size)}
                                                    className={cn(
                                                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                                      itemCustomization?.size === size
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20"
                                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                                                    )}
                                                  >
                                                    {size}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Custom Text Option */}
                                          {item.customizationOptions.allowCustomText && (
                                            <div className="space-y-1.5">
                                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-350">
                                                {item.customizationOptions.customTextLabel || 'Customization Name Tag'}
                                              </Label>
                                              <Input
                                                type="text"
                                                placeholder={`Enter details for ${item.name}`}
                                                value={itemCustomization?.customText || ''}
                                                onChange={(e) => updateComboItemCustomization(idx, 'customText', e.target.value)}
                                                className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                                              />
                                            </div>
                                          )}

                                          {/* Message Input options */}
                                          {item.customizationOptions.allowMessage && (
                                            <div className="space-y-1.5">
                                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-350">
                                                {item.customizationOptions.messageLabel || 'Item Message Card'}
                                              </Label>
                                              <Textarea
                                                placeholder={`Write message for ${item.name}`}
                                                value={itemCustomization?.message || ''}
                                                onChange={(e) => updateComboItemCustomization(idx, 'message', e.target.value)}
                                                className="h-16 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl resize-none"
                                              />
                                            </div>
                                          )}

                                          {/* Variant selectors */}
                                          {item.customizationOptions.allowVariants && item.customizationOptions.variants && item.customizationOptions.variants.length > 0 && (
                                            <div className="space-y-1.5">
                                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-350">
                                                {item.customizationOptions.variantLabel || 'Choose Option'}
                                              </Label>
                                              <select
                                                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-200"
                                                value={itemCustomization?.selectedVariant || ''}
                                                onChange={e => updateComboItemCustomization(idx, 'selectedVariant', e.target.value)}
                                              >
                                                <option value="">Select Option</option>
                                                {item.customizationOptions.variants.map((v, vIdx) => (
                                                  <option key={vIdx} value={v.name}>
                                                    {v.name} (+₹{v.price})
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          )}

                                          {/* Photo uploader for sub-item */}
                                          {item.customizationOptions.allowPhotoUpload && (
                                            <div className="space-y-1.5">
                                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-350">Item Photo Upload</Label>
                                              {itemCustomization?.photo ? (
                                                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group">
                                                  <img
                                                    src={itemCustomization.photo}
                                                    alt="Item upload"
                                                    className="w-full h-full object-cover"
                                                  />
                                                  <button
                                                    type="button"
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                    onClick={() => updateComboItemCustomization(idx, 'photo', undefined)}
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center bg-white dark:bg-slate-900 hover:border-purple-400 transition-colors">
                                                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                                                  <Label htmlFor={`photo-upload-${idx}`} className="cursor-pointer text-[11px] font-bold text-primary hover:underline">
                                                    Browse Item Image
                                                  </Label>
                                                  <input
                                                    id={`photo-upload-${idx}`}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleComboItemPhotoUpload(e, idx)}
                                                    disabled={isUploading}
                                                    className="hidden"
                                                  />
                                                  {isUploading && <span className="text-[10px] text-purple-600 dark:text-purple-400 block mt-1 animate-pulse">Uploading...</span>}
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Sub-item addons */}
                                          {item.customizationOptions.allowAddons && item.customizationOptions.addonOptions.length > 0 && (
                                            <div className="space-y-1.5">
                                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-350">Select Addons</Label>
                                              <div className="flex flex-wrap gap-2">
                                                {item.customizationOptions.addonOptions.map((addonName, aIdx) => (
                                                  <button
                                                    key={aIdx}
                                                    type="button"
                                                    onClick={() => toggleComboItemAddon(idx, addonName)}
                                                    className={cn(
                                                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                                      itemCustomization?.selectedAddons.includes(addonName)
                                                        ? "bg-purple-600 text-white border-purple-600"
                                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                                                    )}
                                                  >
                                                    {addonName}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Flowers Add-ons Section */}
                      {product.customizationOptions.addons.flowers.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <Flower2 className="h-5 w-5 text-pink-500" />
                            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">Enhance with Extra Flowers</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    "p-3 rounded-2xl border bg-white dark:bg-slate-950 transition-all flex items-center justify-between gap-3 shadow-sm select-none relative overflow-hidden",
                                    isSelected 
                                      ? "border-pink-500/80 ring-1 ring-pink-500/30 shadow-pink-500/5" 
                                      : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300"
                                  )}
                                >
                                  {/* Left side Metadata */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-900 flex-shrink-0 bg-slate-50">
                                      <img
                                        src={addonImage}
                                        alt={flower.name}
                                        className="w-full h-full object-cover"
                                      />
                                      {tag && (
                                        <div className="absolute top-0 left-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black uppercase text-[7px] px-1.5 py-0.5 rounded-br-lg shadow-sm">
                                          {tag}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                                        {flower.name}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                        {addonDesc}
                                      </p>
                                      <div className="text-xs font-bold text-pink-600 dark:text-pink-400 mt-1">
                                        +₹{flower.price}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right side Quantity / ADD Control */}
                                  <div className="flex-shrink-0 z-10">
                                    {isSelected ? (
                                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 w-24 h-8 justify-between shadow-inner">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateFlowerQuantity(flower.name, quantity - 1);
                                          }}
                                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                        >
                                          <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 w-6 text-center">
                                          {quantity}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateFlowerQuantity(flower.name, quantity + 1);
                                          }}
                                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => toggleFlowerAddon(flower)}
                                        className="h-8 rounded-full border-pink-200 dark:border-pink-900/60 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 text-pink-600 dark:text-pink-400 font-bold text-xs px-4"
                                      >
                                        + ADD
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Chocolates Add-ons Section */}
                      {product.customizationOptions.addons.chocolates.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <Gift className="h-5 w-5 text-orange-500" />
                            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">Chocolates & Premium Treats</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    "p-3 rounded-2xl border bg-white dark:bg-slate-950 transition-all flex items-center justify-between gap-3 shadow-sm select-none relative overflow-hidden",
                                    isSelected 
                                      ? "border-orange-500/80 ring-1 ring-orange-500/30 shadow-orange-500/5" 
                                      : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300"
                                  )}
                                >
                                  {/* Left side Metadata */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-900 flex-shrink-0 bg-slate-50">
                                      <img
                                        src={addonImage}
                                        alt={chocolate.name}
                                        className="w-full h-full object-cover"
                                      />
                                      {tag && (
                                        <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black uppercase text-[7px] px-1.5 py-0.5 rounded-br-lg shadow-sm">
                                          {tag}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                                        {chocolate.name}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                        {addonDesc}
                                      </p>
                                      <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-1">
                                        +₹{chocolate.price}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right side Quantity / ADD Control */}
                                  <div className="flex-shrink-0 z-10">
                                    {isSelected ? (
                                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 w-24 h-8 justify-between shadow-inner">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateChocolateQuantity(chocolate.name, quantity - 1);
                                          }}
                                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                        >
                                          <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 w-6 text-center">
                                          {quantity}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateChocolateQuantity(chocolate.name, quantity + 1);
                                          }}
                                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors shadow-sm"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => toggleChocolateAddon(chocolate)}
                                        className="h-8 rounded-full border-orange-200 dark:border-orange-900/60 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold text-xs px-4"
                                      >
                                        + ADD
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right side Sticky Review panel (Desktop only) */}
                    <div className="hidden md:block w-80 sticky top-0 flex-shrink-0 max-h-[calc(80vh-190px)] sidebar-scrollable pr-1">
                      <Card className="border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md shadow-lg rounded-2xl p-4 space-y-4">
                        <div className="text-center">
                          <img
                            src={uploadedPhoto || product.images[0] || product.customizationOptions.previewImage}
                            alt={product.title}
                            className="w-32 h-32 object-cover rounded-2xl mx-auto border border-slate-100 dark:border-slate-900 shadow-sm"
                          />
                          <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm mt-3">{product.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">Base Price: ₹{product.price}</p>
                        </div>
                        
                        {selectedCount > 0 && (
                          <>
                            <Separator className="bg-slate-100 dark:bg-slate-850" />
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Customizations</span>
                              {customizations.number && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-350">
                                  <Hash className="h-3 w-3 text-primary" /> Number tag: {customizations.number}
                                </div>
                              )}
                              {customizations.messageCard && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-350">
                                  <MessageSquare className="h-3 w-3 text-primary" /> Card: "{customizations.messageCard}"
                                </div>
                              )}
                              {customizations.selectedFlowers.map((f, i) => (
                                <div key={i} className="flex items-center justify-between text-xs text-slate-650 dark:text-slate-300">
                                  <span className="truncate flex items-center gap-1.5"><Flower2 className="h-3 w-3 text-pink-500" /> {f.name}</span>
                                  <span className="font-bold">x{f.quantity}</span>
                                </div>
                              ))}
                              {customizations.selectedChocolates.map((c, i) => (
                                <div key={i} className="flex items-center justify-between text-xs text-slate-650 dark:text-slate-300">
                                  <span className="truncate flex items-center gap-1.5"><Gift className="h-3 w-3 text-orange-500" /> {c.name}</span>
                                  <span className="font-bold">x{c.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        
                        <Separator className="bg-slate-100 dark:bg-slate-850" />
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Subtotal</span>
                            <span>₹{product.price}</span>
                          </div>
                          {selectedCount > 0 && (
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>Add-ons Total</span>
                              <span>+ ₹{activeTotalPrice - product.price}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-bold text-primary pt-1.5">
                            <span>Grand Total</span>
                            <span>₹{activeTotalPrice}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                ) : (
                  // Wizard step 2: Confirmation / Checkout Review screen
                  <motion.div 
                    key="review"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-xl mx-auto space-y-6 py-4"
                  >
                    <div className="text-center space-y-2">
                      <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Review Your Customizations</h3>
                      <p className="text-xs text-slate-400">Please confirm your selection details before adding to cart</p>
                    </div>

                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-md overflow-hidden">
                      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-3 border-b border-slate-100 dark:border-slate-850">
                        <img
                          src={uploadedPhoto || product.images[0] || product.customizationOptions.previewImage}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-100 dark:border-slate-900"
                        />
                        <div className="text-left">
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-250 text-sm">{product.title}</h4>
                          <span className="text-xs font-semibold text-slate-450 dark:text-slate-400">Base Price: ₹{product.price}</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4 text-left">
                        {/* Number input preview */}
                        {customizations.number && (
                          <div className="flex items-start gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                              <Hash className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 font-bold block">Custom Tag Number</span>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{customizations.number}</span>
                            </div>
                          </div>
                        )}

                        {/* Photo upload preview */}
                        {uploadedPhoto && (
                          <div className="flex items-start gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                              <Camera className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-slate-400 font-bold block">Printed Photo Upload</span>
                              <img
                                src={uploadedPhoto}
                                alt="Printed upload"
                                className="w-24 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800 mt-1"
                              />
                            </div>
                          </div>
                        )}

                        {/* Message card text preview */}
                        {customizations.messageCard && (
                          <div className="flex items-start gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 font-bold block">Greeting Card Message (+₹{product.customizationOptions.messageCardPrice})</span>
                              <blockquote className="text-sm italic text-slate-700 dark:text-slate-250 font-medium mt-0.5 border-l-2 border-amber-200 pl-2">
                                "{customizations.messageCard}"
                              </blockquote>
                            </div>
                          </div>
                        )}

                        {/* Custom flower add-ons list */}
                        {customizations.selectedFlowers.length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0">
                              <Flower2 className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-slate-400 font-bold block">Extra Flower Add-ons</span>
                              <div className="space-y-1 mt-1">
                                {customizations.selectedFlowers.map((f, i) => (
                                  <div key={i} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-850">
                                    <span className="font-semibold text-slate-700 dark:text-slate-350">{f.name}</span>
                                    <span className="font-bold text-primary">x{f.quantity} (+₹{f.price * f.quantity})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Custom chocolate add-ons list */}
                        {customizations.selectedChocolates.length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                              <Gift className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-slate-400 font-bold block">Chocolates & Treats</span>
                              <div className="space-y-1 mt-1">
                                {customizations.selectedChocolates.map((c, i) => (
                                  <div key={i} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-850">
                                    <span className="font-semibold text-slate-700 dark:text-slate-350">{c.name}</span>
                                    <span className="font-bold text-primary">x{c.quantity} (+₹{c.price * c.quantity})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Combo Customizations details list */}
                        {customizations.comboItemCustomizations && customizations.comboItemCustomizations.length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <span className="text-xs text-slate-400 font-bold block">Combo Sub-item Customizations</span>
                              {customizations.comboItemCustomizations.map((c, idx) => {
                                const comboItem = product.comboItems?.[c.itemIndex];
                                if (!comboItem) return null;
                                return (
                                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                    <div className="font-bold text-purple-700 dark:text-purple-450">{comboItem.name}</div>
                                    {c.quantity > 1 && <div>• Quantity: {c.quantity}</div>}
                                    {c.message && <div>• Card: "{c.message}"</div>}
                                    {c.color && <div>• Color: {c.color}</div>}
                                    {c.size && <div>• Size: {c.size}</div>}
                                    {c.customText && <div>• Custom Text: "{c.customText}"</div>}
                                    {c.photo && <div>• Custom photo uploaded</div>}
                                    {c.selectedVariant && <div>• Selected: {c.selectedVariant}</div>}
                                    {c.selectedAddons.length > 0 && <div>• Addons: {c.selectedAddons.join(', ')}</div>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {selectedCount === 0 && (!customizations.comboItemCustomizations || customizations.comboItemCustomizations.length === 0) && (
                          <div className="text-center py-4 text-xs text-slate-400 font-semibold italic">
                            No extra custom add-ons selected. Bouquet will be delivered in its premium standard package.
                          </div>
                        )}
                      </div>
                    </Card>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsConfirmed(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 flex items-center gap-1.5 mx-auto"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back to Customizations
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom sticky checkout bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-5 py-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  {isConfirmed ? 'Final Total' : 'Estimated Price'}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                    ₹{activeTotalPrice}
                  </span>
                  {selectedCount > 0 && !isConfirmed && (
                    <span className="text-[10px] sm:text-xs text-slate-450 dark:text-slate-500 font-bold">
                      ({selectedCount} add-on{selectedCount > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isConfirmed && (
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmed(false)}
                    className="h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 text-sm"
                  >
                    Edit
                  </Button>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {!isConfirmed ? (
                    <Button
                      onClick={handleConfirm}
                      className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-rose-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2 group transition-all"
                    >
                      Confirm Selection
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="h-12 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2 transition-all"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>

              </motion.div>
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Portal>
      </Dialog>
    </TooltipProvider>
  );
}
