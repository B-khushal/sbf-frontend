import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Sprout, Droplets, Sun, Ruler, FlaskConical, Leaf, Plus, X, TreePine } from 'lucide-react';
import type { ProductData } from '@/services/productService';

const WATER_FREQUENCIES = [
  { value: 'daily', label: '💧 Daily' },
  { value: 'alternate-days', label: '💧 Alternate Days' },
  { value: 'twice-week', label: '💧 Twice a Week' },
  { value: 'weekly', label: '💧 Weekly' },
  { value: 'bi-weekly', label: '💧 Every 2 Weeks' },
  { value: 'monthly', label: '💧 Monthly' },
  { value: 'when-dry', label: '🏜️ When Soil is Dry' },
  { value: 'minimal', label: '🌵 Minimal (Succulents)' },
];

const LIGHT_REQUIREMENTS = [
  { value: 'full-sun', label: '☀️ Full Sunlight (6+ hours)' },
  { value: 'partial-sun', label: '🌤️ Partial Sunlight (3-6 hours)' },
  { value: 'bright-indirect', label: '💡 Bright Indirect Light' },
  { value: 'low-light', label: '🌙 Low Light Tolerant' },
  { value: 'shade', label: '🌿 Full Shade' },
  { value: 'fluorescent', label: '💡 Fluorescent / Artificial Light' },
];

const PLANT_HEIGHTS = [
  'Under 6 inches', '6-12 inches', '1-2 feet', '2-3 feet',
  '3-5 feet', '5-8 feet', 'Over 8 feet', 'Hanging / Trailing'
];

const CARE_LEVEL_OPTIONS = [
  { value: 'beginner', label: '🟢 Beginner Friendly' },
  { value: 'easy', label: '🟡 Easy Care' },
  { value: 'moderate', label: '🟠 Moderate Care' },
  { value: 'expert', label: '🔴 Expert Level' },
];

const DEFAULT_CARE_INSTRUCTIONS = [
  'Water when top soil feels dry',
  'Place in bright indirect sunlight',
  'Fertilize once a month during growing season',
  'Re-pot every 12-18 months',
  'Mist leaves regularly for humidity',
  'Prune dead or yellowing leaves',
  'Keep away from cold drafts',
  'Rotate plant weekly for even growth',
  'Clean leaves with damp cloth monthly',
  'Use well-draining potting mix',
  'Avoid overwatering to prevent root rot',
  'Keep soil moist but not waterlogged',
  'Protect from direct afternoon sun',
  'Use a pebble tray for added humidity',
];

interface PlantFormSectionProps {
  formData: ProductData;
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>;
}

const PlantFormSection: React.FC<PlantFormSectionProps> = ({ formData, setFormData }) => {
  const attrs = formData.plantAttributes || {};

  const updateAttr = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      plantAttributes: {
        ...prev.plantAttributes,
        [field]: value,
      }
    }));
  };

  const addCareInstruction = (instruction: string) => {
    if (!instruction.trim()) return;
    const current = attrs.careInstructions || [];
    if (current.includes(instruction)) return;
    updateAttr('careInstructions', [...current, instruction]);
  };

  const removeCareInstruction = (instruction: string) => {
    updateAttr('careInstructions', (attrs.careInstructions || []).filter(c => c !== instruction));
  };

  return (
    <Card className="border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-green-50/40 to-teal-50/30 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-100/60 to-green-100/40 border-b border-emerald-200/60 pb-5">
        <CardTitle className="flex items-center gap-3 text-emerald-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
            <Sprout className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">Plant Specifications</span>
            <p className="text-xs text-emerald-700/80 font-normal mt-0.5">Scientific name, environment, care level, watering & light requirements</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Row 1: Scientific Name + Height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5 text-emerald-600" /> Scientific / Botanical Name
            </Label>
            <Input
              value={attrs.scientificName || ''}
              onChange={(e) => updateAttr('scientificName', e.target.value)}
              placeholder="e.g., Epipremnum aureum"
              className="h-10 text-sm border-emerald-200 focus:ring-emerald-400 rounded-xl bg-white italic"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5 text-emerald-600" /> Plant Height
            </Label>
            <Select value={attrs.height || ''} onValueChange={(v) => updateAttr('height', v)}>
              <SelectTrigger className="h-10 text-sm border-emerald-200 focus:ring-emerald-400 rounded-xl bg-white">
                <SelectValue placeholder="Select height range..." />
              </SelectTrigger>
              <SelectContent>
                {PLANT_HEIGHTS.map(h => (
                  <SelectItem key={h} value={h} className="text-sm">{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Watering + Light */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-blue-600" /> Watering Frequency
            </Label>
            <Select value={attrs.waterFrequency || ''} onValueChange={(v) => updateAttr('waterFrequency', v)}>
              <SelectTrigger className="h-10 text-sm border-emerald-200 focus:ring-emerald-400 rounded-xl bg-white">
                <SelectValue placeholder="Select watering schedule..." />
              </SelectTrigger>
              <SelectContent>
                {WATER_FREQUENCIES.map(w => (
                  <SelectItem key={w.value} value={w.value} className="text-sm">{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-yellow-600" /> Light Requirement
            </Label>
            <Select value={attrs.lightRequirement || ''} onValueChange={(v) => updateAttr('lightRequirement', v)}>
              <SelectTrigger className="h-10 text-sm border-emerald-200 focus:ring-emerald-400 rounded-xl bg-white">
                <SelectValue placeholder="Select light needs..." />
              </SelectTrigger>
              <SelectContent>
                {LIGHT_REQUIREMENTS.map(l => (
                  <SelectItem key={l.value} value={l.value} className="text-sm">{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3: Indoor / Outdoor / Pot Included toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <TreePine className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-emerald-900">Indoor Plant</Label>
              </div>
            </div>
            <Switch
              checked={Boolean(attrs.indoor)}
              onCheckedChange={(checked) => updateAttr('indoor', checked)}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                <Sun className="h-4 w-4 text-sky-700" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-emerald-900">Outdoor Plant</Label>
              </div>
            </div>
            <Switch
              checked={Boolean(attrs.outdoor)}
              onCheckedChange={(checked) => updateAttr('outdoor', checked)}
              className="data-[state=checked]:bg-sky-600"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Leaf className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-emerald-900">Pot Included</Label>
              </div>
            </div>
            <Switch
              checked={attrs.potIncluded !== false}
              onCheckedChange={(checked) => updateAttr('potIncluded', checked)}
              className="data-[state=checked]:bg-amber-600"
            />
          </div>
        </div>

        <Separator className="bg-emerald-200/60" />

        {/* Row 4: Plant Care Instructions */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-emerald-900">Plant Care Instructions</Label>
          <p className="text-xs text-emerald-700/70">Click to add pre-defined care tips, or the care instructions entered in the main form will also be used.</p>

          <div className="flex flex-wrap gap-2">
            {DEFAULT_CARE_INSTRUCTIONS.map(inst => {
              const isActive = (attrs.careInstructions || []).includes(inst);
              return (
                <Button
                  key={inst}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => isActive ? removeCareInstruction(inst) : addCareInstruction(inst)}
                  className={`h-auto text-[11px] rounded-lg font-medium py-1.5 px-3 transition-all ${
                    isActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  {isActive && '✓ '}{inst}
                </Button>
              );
            })}
          </div>

          {(attrs.careInstructions || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(attrs.careInstructions || []).map(inst => (
                <Badge key={inst} className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] py-1 px-2.5 gap-1.5 rounded-lg font-semibold">
                  {inst}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-600 transition-colors" onClick={() => removeCareInstruction(inst)} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantFormSection;
