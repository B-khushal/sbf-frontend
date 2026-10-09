import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Cake, Plus, Egg, Scale, Clock, ChefHat, Sparkles, IndianRupee, Trash2, Users, Check, Tag } from 'lucide-react';
import type { ProductData, PriceVariant } from '@/services/productService';
import { getProductEffectivePrice } from '@/utils/pricing';

const CAKE_FLAVORS = [
  'Vanilla', 'Chocolate', 'Butterscotch', 'Black Forest', 'Red Velvet',
  'Pineapple', 'Mango', 'Strawberry', 'Blueberry', 'Truffle',
  'Coffee', 'Caramel', 'Oreo', 'Cheesecake', 'Fruit',
  'German Chocolate', 'Lemon', 'Coconut', 'Tiramisu', 'Fondant',
  'Rainbow', 'Nutella', 'Ferrero Rocher', 'Kit Kat', 'Rasmalai',
  'Gulab Jamun', 'Kaju Katli', 'Biscoff'
];

const CAKE_SHAPES = [
  { value: 'round', label: '⬤ Round' },
  { value: 'square', label: '◼ Square' },
  { value: 'rectangle', label: '▬ Rectangle' },
  { value: 'heart', label: '♥ Heart' },
  { value: 'star', label: '★ Star' },
  { value: 'hexagon', label: '⬡ Hexagon' },
  { value: 'tiered', label: '🎂 Tiered / Multi-Layer' },
  { value: 'number', label: '🔢 Number Shape' },
  { value: 'letter', label: '🔤 Letter Shape' },
  { value: 'custom', label: '✨ Custom / Sculpted' },
];

const PRESET_CAKE_SIZES = [
  '0.5 Kg', '1 Kg', '1.5 Kg', '2 Kg', '2.5 Kg', '3 Kg', '4 Kg', '5 Kg',
  '6 inch', '8 inch', '10 inch', '12 inch',
];

const SERVING_MAP: Record<string, string> = {
  '0.5 kg': '4–6 People',
  '0.5kg': '4–6 People',
  '½ kg': '4–6 People',
  '1 kg': '8–10 People',
  '1kg': '8–10 People',
  '1.5 kg': '12–15 People',
  '1.5kg': '12–15 People',
  '2 kg': '16–20 People',
  '2kg': '16–20 People',
  '2.5 kg': '20–24 People',
  '2.5kg': '20–24 People',
  '3 kg': '24–30 People',
  '3kg': '24–30 People',
  '4 kg': '30–40 People',
  '4kg': '30–40 People',
  '5 kg': '40–50 People',
  '5kg': '40–50 People',
  '6 inch': '4–6 People',
  '8 inch': '8–12 People',
  '10 inch': '14–18 People',
  '12 inch': '20–26 People',
};

const getServesText = (label: string): string => {
  if (!label) return '';
  const clean = label.trim().toLowerCase();
  if (SERVING_MAP[clean]) return SERVING_MAP[clean];
  if (clean.includes('0.5') || clean.includes('½')) return '4–6 People';
  if (clean.includes('1.5')) return '12–15 People';
  if (clean.includes('1')) return '8–10 People';
  if (clean.includes('2.5')) return '20–24 People';
  if (clean.includes('2')) return '16–20 People';
  if (clean.includes('3')) return '24–30 People';
  if (clean.includes('4')) return '30–40 People';
  if (clean.includes('5')) return '40–50 People';
  return '';
};

const CAKE_OCCASIONS = [
  'Birthday', 'Anniversary', 'Wedding', 'Baby Shower', 'Engagement',
  'Valentine\'s Day', 'Mother\'s Day', 'Father\'s Day', 'Graduation',
  'Retirement', 'Housewarming', 'Congratulations', 'Get Well Soon',
  'Diwali', 'Christmas', 'New Year', 'Corporate Event', 'Kids Party'
];

const PREP_TIMES = [
  { value: '2-hours', label: '⚡ 2 Hours (Express)' },
  { value: '4-hours', label: '🕐 4 Hours' },
  { value: '6-hours', label: '🕕 6 Hours' },
  { value: 'same-day', label: '📦 Same Day' },
  { value: 'next-day', label: '📅 Next Day' },
  { value: '2-days', label: '📆 2 Days' },
  { value: '3-days', label: '📆 3 Days' },
  { value: '1-week', label: '🗓️ 1 Week (Custom Orders)' },
];

interface CakeFormSectionProps {
  formData: ProductData;
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>;
}

const CakeFormSection: React.FC<CakeFormSectionProps> = ({ formData, setFormData }) => {
  const attrs = formData.cakeAttributes || {};
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Hydrate priceVariants from availableSizes if priceVariants is empty
  useEffect(() => {
    const hasExistingVariants = Array.isArray(formData.priceVariants) && formData.priceVariants.length > 0;
    const hasAvailableSizes = Array.isArray(attrs.availableSizes) && attrs.availableSizes.length > 0;

    if (!hasExistingVariants && hasAvailableSizes) {
      const defaultPrice = Number(formData.price) || 0;
      const defaultStock = Number(formData.countInStock !== undefined ? formData.countInStock : 20);

      const hydratedVariants: PriceVariant[] = attrs.availableSizes.map(size => {
        let suggestedPrice = defaultPrice;
        const clean = size.toLowerCase();
        if (clean.includes('0.5') || clean.includes('½')) {
          suggestedPrice = defaultPrice > 0 ? Math.round(defaultPrice * 0.65) : defaultPrice;
        } else if (clean.includes('1.5')) {
          suggestedPrice = defaultPrice > 0 ? Math.round(defaultPrice * 1.45) : defaultPrice;
        } else if (clean.includes('2')) {
          suggestedPrice = defaultPrice > 0 ? Math.round(defaultPrice * 1.9) : defaultPrice;
        }

        return {
          label: size,
          price: suggestedPrice,
          stock: defaultStock,
        };
      });

      setFormData(prev => ({
        ...prev,
        hasPriceVariants: true,
        priceVariants: hydratedVariants,
      }));
    }
  }, [attrs.availableSizes, formData.priceVariants, formData.price, formData.countInStock, setFormData]);

  const updateAttr = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      cakeAttributes: {
        ...prev.cakeAttributes,
        [field]: value,
      }
    }));
  };

  // Helper to calculate sensible default price based on weight
  const calculateDefaultPrice = (sizeLabel: string): number => {
    const basePrice = Number(formData.price) || 0;
    if (basePrice <= 0) return 0;

    const clean = sizeLabel.toLowerCase();
    if (clean.includes('0.5') || clean.includes('½')) {
      return Math.round(basePrice * 0.65);
    }
    if (clean.includes('1.5')) {
      return Math.round(basePrice * 1.45);
    }
    if (clean.includes('2')) {
      return Math.round(basePrice * 1.9);
    }
    if (clean.includes('3')) {
      return Math.round(basePrice * 2.8);
    }
    return basePrice;
  };

  // Add a size variant
  const addVariant = (size: string) => {
    const label = size.trim();
    if (!label) return;

    const currentVariants = Array.isArray(formData.priceVariants) ? [...formData.priceVariants] : [];
    if (currentVariants.some(v => v.label.toLowerCase() === label.toLowerCase())) {
      return;
    }

    const newPrice = calculateDefaultPrice(label);
    const newStock = Number(formData.countInStock !== undefined ? formData.countInStock : 20);

    const updatedVariants: PriceVariant[] = [
      ...currentVariants,
      { label, price: newPrice, stock: newStock }
    ];

    setFormData(prev => ({
      ...prev,
      hasPriceVariants: true,
      priceVariants: updatedVariants,
      cakeAttributes: {
        ...prev.cakeAttributes,
        availableSizes: updatedVariants.map(v => v.label),
        weight: prev.cakeAttributes?.weight || updatedVariants[0]?.label || '',
      }
    }));
  };

  // Remove a size variant by index
  const removeVariant = (index: number) => {
    const currentVariants = Array.isArray(formData.priceVariants) ? [...formData.priceVariants] : [];
    const updatedVariants = currentVariants.filter((_, i) => i !== index);

    setFormData(prev => ({
      ...prev,
      hasPriceVariants: updatedVariants.length > 0,
      priceVariants: updatedVariants,
      cakeAttributes: {
        ...prev.cakeAttributes,
        availableSizes: updatedVariants.map(v => v.label),
        weight: updatedVariants.length > 0 ? (prev.cakeAttributes?.weight || updatedVariants[0]?.label) : '',
      }
    }));
  };

  // Update a specific field of a variant (label, price, discountPrice, stock)
  const updateVariant = (index: number, field: 'label' | 'price' | 'discountPrice' | 'stock', value: any) => {
    const currentVariants = Array.isArray(formData.priceVariants) ? [...formData.priceVariants] : [];
    if (!currentVariants[index]) return;

    const updatedVal = field === 'label'
      ? String(value)
      : (value === '' || value === undefined ? undefined : Math.max(0, Number(value) || 0));

    currentVariants[index] = {
      ...currentVariants[index],
      [field]: updatedVal,
    };

    setFormData(prev => ({
      ...prev,
      hasPriceVariants: currentVariants.length > 0,
      priceVariants: currentVariants,
      cakeAttributes: {
        ...prev.cakeAttributes,
        availableSizes: currentVariants.map(v => v.label),
        weight: currentVariants[0]?.label || prev.cakeAttributes?.weight,
      }
    }));
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSizeInput.trim()) return;
    addVariant(customSizeInput.trim());
    setCustomSizeInput('');
  };

  const variantsList = Array.isArray(formData.priceVariants) ? formData.priceVariants : [];

  return (
    <Card className="border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-rose-50/30 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-100/60 to-orange-100/40 border-b border-amber-200/60 pb-5">
        <CardTitle className="flex items-center gap-3 text-amber-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
            <Cake className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">Cake Specifications & Weight Variants</span>
            <p className="text-xs text-amber-700/80 font-normal mt-0.5">Flavor, weight variants with individual pricing, eggless option & preparation details</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Row 1: Flavor + Shape */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
              <ChefHat className="h-3.5 w-3.5 text-amber-600" /> Cake Flavor
            </Label>
            <Select value={attrs.flavor || ''} onValueChange={(v) => updateAttr('flavor', v)}>
              <SelectTrigger className="h-10 text-sm border-amber-200 focus:ring-amber-400 rounded-xl bg-white">
                <SelectValue placeholder="Select flavor..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {CAKE_FLAVORS.map(f => (
                  <SelectItem key={f} value={f.toLowerCase()} className="text-sm">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Cake Shape
            </Label>
            <Select value={attrs.shape || 'round'} onValueChange={(v) => updateAttr('shape', v)}>
              <SelectTrigger className="h-10 text-sm border-amber-200 focus:ring-amber-400 rounded-xl bg-white">
                <SelectValue placeholder="Select shape..." />
              </SelectTrigger>
              <SelectContent>
                {CAKE_SHAPES.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-sm">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Default Base Weight + Prep Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-amber-600" /> Default Base Weight
            </Label>
            <Input
              value={attrs.weight || ''}
              onChange={(e) => updateAttr('weight', e.target.value)}
              placeholder="e.g., 1 Kg, 0.5 Kg"
              className="h-10 text-sm border-amber-200 focus:ring-amber-400 rounded-xl bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Preparation Time
            </Label>
            <Select value={attrs.prepTime || ''} onValueChange={(v) => updateAttr('prepTime', v)}>
              <SelectTrigger className="h-10 text-sm border-amber-200 focus:ring-amber-400 rounded-xl bg-white">
                <SelectValue placeholder="Select prep time..." />
              </SelectTrigger>
              <SelectContent>
                {PREP_TIMES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-sm">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3: Egg/Eggless Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <Egg className="h-4.5 w-4.5 text-green-700" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-amber-900">Eggless Option</Label>
              <p className="text-xs text-amber-700/70">Mark this cake as eggless / 100% vegetarian</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-[10px] font-bold py-0.5 px-2 ${attrs.eggless ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
              {attrs.eggless ? '🌱 Eggless' : '🥚 Contains Egg'}
            </Badge>
            <Switch
              checked={Boolean(attrs.eggless)}
              onCheckedChange={(checked) => updateAttr('eggless', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>

        {/* Row 4: Occasion */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-amber-900">Best For Occasion</Label>
          <Select value={attrs.occasion || ''} onValueChange={(v) => updateAttr('occasion', v)}>
            <SelectTrigger className="h-10 text-sm border-amber-200 focus:ring-amber-400 rounded-xl bg-white">
              <SelectValue placeholder="Select occasion..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {CAKE_OCCASIONS.map(o => (
                <SelectItem key={o} value={o.toLowerCase()} className="text-sm">{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-amber-200/80 my-2" />

        {/* Row 5: CAKE WEIGHT & PRICE VARIANTS MANAGER */}
        <div className="space-y-4 rounded-xl border-2 border-amber-300/80 bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <Label className="text-base font-bold text-amber-950">Cake Weight & Price Variants</Label>
              </div>
              <p className="text-xs text-amber-800/80 mt-1">
                Configure prices and stock for each weight (e.g. 0.5 Kg, 1 Kg, 2 Kg). Each size appears as an interactive option on the cake product page.
              </p>
            </div>
            {variantsList.length > 0 && (
              <Badge className="bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-center font-semibold text-xs">
                {variantsList.length} Weight Variant{variantsList.length === 1 ? '' : 's'}
              </Badge>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">
              Quick Add Standard Weights:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_CAKE_SIZES.map(size => {
                const isAdded = variantsList.some(v => v.label.toLowerCase() === size.toLowerCase());
                return (
                  <Button
                    key={size}
                    type="button"
                    variant={isAdded ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isAdded) {
                        const idx = variantsList.findIndex(v => v.label.toLowerCase() === size.toLowerCase());
                        if (idx >= 0) removeVariant(idx);
                      } else {
                        addVariant(size);
                      }
                    }}
                    className={`h-8 text-xs rounded-lg font-medium transition-all ${
                      isAdded
                        ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm ring-1 ring-amber-800'
                        : 'border-amber-300 text-amber-900 hover:bg-amber-100/70 bg-white'
                    }`}
                  >
                    {isAdded ? <Check className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Custom Size Adder */}
          <div className="flex gap-2 items-center pt-1">
            <Input
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSize(e);
                }
              }}
              placeholder="Or type custom size (e.g., ½ Kg, 3 Tier, Heart Shape 1 Kg)..."
              className="h-9 text-xs border-amber-200 focus:ring-amber-400 rounded-xl bg-white flex-1"
            />
            <Button
              type="button"
              onClick={handleAddCustomSize}
              disabled={!customSizeInput.trim()}
              size="sm"
              className="h-9 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs px-4"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Weight
            </Button>
          </div>

          {/* Configured Variants Table / Card List */}
          {variantsList.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                <span>Configured Cake Variants ({variantsList.length})</span>
                <span className="text-[11px] text-amber-700/80 font-normal">Pricing and inventory per weight</span>
              </div>

              <div className="space-y-2.5">
                {variantsList.map((variant, index) => {
                  const serves = getServesText(variant.label);
                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-amber-200/90 bg-white hover:border-amber-300 p-4 shadow-xs transition-all space-y-3"
                    >
                      {/* Top: Size info & Actions */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 border border-amber-200 text-amber-800">
                            <Scale className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                              <span>{variant.label}</span>
                              {index === 0 && (
                                <Badge className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0 border-none">
                                  Base Size
                                </Badge>
                              )}
                            </div>
                            {serves && (
                              <div className="text-[11px] text-amber-700/80 flex items-center gap-1 font-medium">
                                <Users className="h-3 w-3" /> {serves}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          className="h-8 w-8 p-0 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remove variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Middle: 3 Clean Grid Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                            <IndianRupee className="h-3 w-3 text-stone-500" /> Regular Price (₹) *
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">₹</span>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={variant.price || ''}
                              onChange={(e) => updateVariant(index, 'price', e.target.value)}
                              placeholder="e.g., 730"
                              className="h-9 pl-7 text-xs font-bold border-stone-200 focus:border-amber-500 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-emerald-800 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3 text-emerald-600" /> Direct Discount Price (₹)
                            </span>
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-semibold">₹</span>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={(variant as any).discountPrice !== undefined && (variant as any).discountPrice !== null ? (variant as any).discountPrice : ''}
                              onChange={(e) => updateVariant(index, 'discountPrice', e.target.value)}
                              placeholder={variant.price ? `Auto (₹${getProductEffectivePrice(formData, variant.price, { ...variant, discountPrice: undefined })})` : "Final price"}
                              className="h-9 pl-7 text-xs font-bold border-emerald-300 focus:border-emerald-500 rounded-lg bg-emerald-50/30 text-emerald-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                            Stock Quantity
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={variant.stock !== undefined ? variant.stock : 20}
                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                            placeholder="e.g., 20"
                            className="h-9 text-xs font-medium border-stone-200 focus:border-amber-500 rounded-lg bg-white"
                          />
                        </div>
                      </div>

                      {/* Bottom: Live calculation feedback */}
                      {variant.price > 0 && (() => {
                        const eff = getProductEffectivePrice(formData, variant.price, variant);
                        const diff = variant.price - eff;
                        const pct = Math.round((diff / variant.price) * 100);
                        return (
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 px-3 py-2 rounded-lg bg-amber-50/70 border border-amber-200/60">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-900 font-medium">Customer Pays:</span>
                              <span className="text-emerald-700 font-extrabold text-sm">₹{eff}</span>
                              {diff > 0 && (
                                <span className="text-stone-400 line-through text-xs">₹{variant.price}</span>
                              )}
                            </div>
                            {diff > 0 ? (
                              <Badge className="bg-emerald-600 text-white border-none text-[11px] font-bold px-2 py-0.5 shadow-2xs">
                                Direct Discount: -₹{diff} ({pct}% OFF)
                              </Badge>
                            ) : (
                              <span className="text-stone-500 text-[11px]">No discount</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-amber-300 p-6 text-center bg-amber-50/40">
              <Scale className="h-8 w-8 text-amber-500/70 mx-auto mb-2" />
              <p className="text-sm font-semibold text-amber-950">No Weight Variants Configured</p>
              <p className="text-xs text-amber-800/80 max-w-md mx-auto mt-1">
                Click any of the standard weights above (e.g., <span className="font-semibold">0.5 Kg</span>, <span className="font-semibold">1 Kg</span>, <span className="font-semibold">2 Kg</span>) to define sizes with their distinct prices.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CakeFormSection;
