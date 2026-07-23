import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Cake, Plus, X, Egg, Scale, Clock, ChefHat, Sparkles } from 'lucide-react';
import type { ProductData } from '@/services/productService';

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

const CAKE_SIZES = [
  '0.5 Kg', '1 Kg', '1.5 Kg', '2 Kg', '2.5 Kg', '3 Kg', '4 Kg', '5 Kg',
  '6 inch', '8 inch', '10 inch', '12 inch',
  '6 Piece', '12 Piece', '24 Piece',
];

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

  const updateAttr = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      cakeAttributes: {
        ...prev.cakeAttributes,
        [field]: value,
      }
    }));
  };

  const addSize = (size: string) => {
    if (!size.trim()) return;
    const current = attrs.availableSizes || [];
    if (current.includes(size)) return;
    updateAttr('availableSizes', [...current, size]);
  };

  const removeSize = (size: string) => {
    updateAttr('availableSizes', (attrs.availableSizes || []).filter(s => s !== size));
  };

  return (
    <Card className="border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-rose-50/30 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-100/60 to-orange-100/40 border-b border-amber-200/60 pb-5">
        <CardTitle className="flex items-center gap-3 text-amber-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
            <Cake className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">Cake Specifications</span>
            <p className="text-xs text-amber-700/80 font-normal mt-0.5">Flavor, weight, egg/eggless preferences, shapes & preparation details</p>
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

        {/* Row 2: Weight + Prep Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-amber-600" /> Weight / Size
            </Label>
            <Input
              value={attrs.weight || ''}
              onChange={(e) => updateAttr('weight', e.target.value)}
              placeholder="e.g., 1 Kg, 500 gm"
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
              <p className="text-xs text-amber-700/70">Mark this cake as eggless / vegetarian</p>
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

        <Separator className="bg-amber-200/60" />

        {/* Row 5: Available Sizes (Multi-select tags) */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-amber-900">Available Sizes</Label>
          <p className="text-xs text-amber-700/70">Click sizes below to add, or type a custom size.</p>

          {/* Quick-add preset sizes */}
          <div className="flex flex-wrap gap-2">
            {CAKE_SIZES.map(size => {
              const isActive = (attrs.availableSizes || []).includes(size);
              return (
                <Button
                  key={size}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => isActive ? removeSize(size) : addSize(size)}
                  className={`h-8 text-xs rounded-lg font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm' 
                      : 'border-amber-300 text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  {isActive && '✓ '}{size}
                </Button>
              );
            })}
          </div>

          {/* Selected sizes */}
          {(attrs.availableSizes || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(attrs.availableSizes || []).map(size => (
                <Badge key={size} className="bg-amber-100 text-amber-900 border border-amber-300 text-xs py-1 px-2.5 gap-1.5 rounded-lg font-semibold">
                  {size}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-600 transition-colors" onClick={() => removeSize(size)} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CakeFormSection;
