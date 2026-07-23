import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Cookie, Scale, ShieldCheck, Thermometer, Calendar, Store } from 'lucide-react';
import type { ProductData } from '@/services/productService';

const CHOCOLATE_BRANDS = [
  'Cadbury', 'Ferrero Rocher', 'Lindt', 'Godiva', 'Toblerone',
  'Ghirardelli', 'Hershey\'s', 'Nestlé', 'Kit Kat', 'Milka',
  'Belgian', 'Swiss', 'Artisanal / Handmade', 'Patchi', 'Bournville',
  'Amul', 'Sugar Free', 'Dark Fantasy', 'Custom Assorted', 'Other'
];

const CHOCOLATE_WEIGHTS = [
  '50 gm', '100 gm', '150 gm', '200 gm', '250 gm',
  '300 gm', '400 gm', '500 gm', '750 gm', '1 Kg', '2 Kg'
];

const STORAGE_OPTIONS = [
  { value: 'room-temp', label: '🏠 Room Temperature' },
  { value: 'cool-dry', label: '🌡️ Cool & Dry Place' },
  { value: 'refrigerate', label: '❄️ Refrigerate' },
  { value: 'freeze', label: '🧊 Freezer' },
  { value: 'avoid-sun', label: '☀️ Avoid Direct Sunlight' },
];

interface ChocolateFormSectionProps {
  formData: ProductData;
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>;
}

const ChocolateFormSection: React.FC<ChocolateFormSectionProps> = ({ formData, setFormData }) => {
  const attrs = formData.chocolateAttributes || {};

  const updateAttr = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      chocolateAttributes: {
        ...prev.chocolateAttributes,
        [field]: value,
      }
    }));
  };

  return (
    <Card className="border-2 border-rose-200/80 bg-gradient-to-br from-rose-50/80 via-pink-50/40 to-amber-50/20 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-rose-100/60 to-pink-100/40 border-b border-rose-200/60 pb-5">
        <CardTitle className="flex items-center gap-3 text-rose-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 shadow-md">
            <Cookie className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">Chocolate Specifications</span>
            <p className="text-xs text-rose-700/80 font-normal mt-0.5">Brand, weight, imported status, dietary info & storage conditions</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Row 1: Brand + Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rose-900 flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-rose-600" /> Brand
            </Label>
            <Select value={attrs.brand || ''} onValueChange={(v) => updateAttr('brand', v)}>
              <SelectTrigger className="h-10 text-sm border-rose-200 focus:ring-rose-400 rounded-xl bg-white">
                <SelectValue placeholder="Select brand..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {CHOCOLATE_BRANDS.map(b => (
                  <SelectItem key={b} value={b.toLowerCase()} className="text-sm">{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rose-900 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-rose-600" /> Net Weight
            </Label>
            <Select value={attrs.weight || ''} onValueChange={(v) => updateAttr('weight', v)}>
              <SelectTrigger className="h-10 text-sm border-rose-200 focus:ring-rose-400 rounded-xl bg-white">
                <SelectValue placeholder="Select weight..." />
              </SelectTrigger>
              <SelectContent>
                {CHOCOLATE_WEIGHTS.map(w => (
                  <SelectItem key={w} value={w} className="text-sm">{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Storage + Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rose-900 flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-rose-600" /> Storage Condition
            </Label>
            <Select value={attrs.storage || ''} onValueChange={(v) => updateAttr('storage', v)}>
              <SelectTrigger className="h-10 text-sm border-rose-200 focus:ring-rose-400 rounded-xl bg-white">
                <SelectValue placeholder="Select storage..." />
              </SelectTrigger>
              <SelectContent>
                {STORAGE_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-sm">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rose-900 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-rose-600" /> Best Before / Expiry Date
            </Label>
            <Input
              type="date"
              value={attrs.expiryDate ? new Date(attrs.expiryDate).toISOString().split('T')[0] : ''}
              onChange={(e) => updateAttr('expiryDate', e.target.value || null)}
              className="h-10 text-sm border-rose-200 focus:ring-rose-400 rounded-xl bg-white"
            />
          </div>
        </div>

        <Separator className="bg-rose-200/60" />

        {/* Row 3: Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-700" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-rose-900">Imported Product</Label>
                <p className="text-[10px] text-rose-700/70">Mark as internationally imported</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-[10px] font-bold py-0.5 px-2 ${attrs.imported ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                {attrs.imported ? '🌍 Imported' : '🇮🇳 Domestic'}
              </Badge>
              <Switch
                checked={Boolean(attrs.imported)}
                onCheckedChange={(checked) => updateAttr('imported', checked)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                <ShieldCheck className="h-4.5 w-4.5 text-green-700" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-rose-900">Vegetarian</Label>
                <p className="text-[10px] text-rose-700/70">Contains no non-veg ingredients</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-[10px] font-bold py-0.5 px-2 ${attrs.vegetarian !== false ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                {attrs.vegetarian !== false ? '🌱 Veg' : '🔴 Non-Veg'}
              </Badge>
              <Switch
                checked={attrs.vegetarian !== false}
                onCheckedChange={(checked) => updateAttr('vegetarian', checked)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChocolateFormSection;
