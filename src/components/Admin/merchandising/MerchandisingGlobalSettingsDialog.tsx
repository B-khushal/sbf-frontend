import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import productService from "@/services/productService";
import {
  Sliders,
  RotateCcw,
  ShieldCheck,
  Save,
  CheckCircle2,
  Info,
  Clock,
  Sparkles
} from "lucide-react";

interface MerchandisingGlobalSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export const MerchandisingGlobalSettingsDialog: React.FC<MerchandisingGlobalSettingsDialogProps> = ({
  isOpen,
  onClose,
  onSettingsSaved
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Settings Form State
  const [defaultMode, setDefaultMode] = useState<string>("smart_rotation");
  const [isRotationEnabled, setIsRotationEnabled] = useState<boolean>(true);
  const [rotationFrequency, setRotationFrequency] = useState<string>("daily");
  const [defaultProtectedTopCount, setDefaultProtectedTopCount] = useState<number>(4);
  const [minDataThreshold, setMinDataThreshold] = useState<number>(2);
  const [isPersonalizationEnabled, setIsPersonalizationEnabled] = useState<boolean>(true);
  const [isExplorationEnabled, setIsExplorationEnabled] = useState<boolean>(true);

  // Weights (Percentages)
  const [weights, setWeights] = useState<{
    sales: number;
    ratingAndReviews: number;
    availabilityAndStock: number;
    freshness: number;
    discountAndPromotion: number;
    adminPriority: number;
  }>({
    sales: 30,
    ratingAndReviews: 20,
    availabilityAndStock: 20,
    freshness: 15,
    discountAndPromotion: 10,
    adminPriority: 5
  });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await productService.getMerchandisingSettings();
      const global = res.global || {};

      setDefaultMode(global.defaultMode || "smart_rotation");
      setIsRotationEnabled(global.isRotationEnabled !== false);
      setRotationFrequency(global.rotationFrequency || "daily");
      setDefaultProtectedTopCount(global.defaultProtectedTopCount !== undefined ? global.defaultProtectedTopCount : 4);
      setMinDataThreshold(global.minDataThreshold !== undefined ? global.minDataThreshold : 2);
      setIsPersonalizationEnabled(global.isPersonalizationEnabled !== false);
      setIsExplorationEnabled(global.isExplorationEnabled !== false);

      if (global.scoringWeights) {
        setWeights({
          sales: Math.round((global.scoringWeights.sales || 0.3) * 100),
          ratingAndReviews: Math.round((global.scoringWeights.ratingAndReviews || 0.2) * 100),
          availabilityAndStock: Math.round((global.scoringWeights.availabilityAndStock || 0.2) * 100),
          freshness: Math.round((global.scoringWeights.freshness || 0.15) * 100),
          discountAndPromotion: Math.round((global.scoringWeights.discountAndPromotion || 0.1) * 100),
          adminPriority: Math.round((global.scoringWeights.adminPriority || 0.05) * 100)
        });
      }
    } catch (err: any) {
      console.error("Error loading merchandising settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const normalizedWeights = {
        sales: weights.sales / 100,
        ratingAndReviews: weights.ratingAndReviews / 100,
        availabilityAndStock: weights.availabilityAndStock / 100,
        freshness: weights.freshness / 100,
        discountAndPromotion: weights.discountAndPromotion / 100,
        adminPriority: weights.adminPriority / 100
      };

      await productService.updateMerchandisingSettings({
        global: {
          defaultMode,
          isRotationEnabled,
          rotationFrequency,
          defaultProtectedTopCount,
          minDataThreshold,
          isPersonalizationEnabled,
          isExplorationEnabled,
          scoringWeights: normalizedWeights
        }
      });

      toast({
        title: "Global Merchandising Saved",
        description: "Storewide default merchandising rules updated successfully."
      });

      if (onSettingsSaved) onSettingsSaved();
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Could not save global merchandising settings."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setDefaultMode("smart_rotation");
    setIsRotationEnabled(true);
    setRotationFrequency("daily");
    setDefaultProtectedTopCount(4);
    setMinDataThreshold(2);
    setIsPersonalizationEnabled(true);
    setIsExplorationEnabled(true);
    setWeights({
      sales: 30,
      ratingAndReviews: 20,
      availabilityAndStock: 20,
      freshness: 15,
      discountAndPromotion: 10,
      adminPriority: 5
    });
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/40 text-[#ec4899] flex items-center justify-center">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Global Merchandising Configuration
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Storewide default rules for springblossomsflorist.in product ordering.
                </DialogDescription>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={resetToDefaults} className="text-xs text-pink-600 h-8">
              Restore Defaults
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 my-2 text-xs">
          {/* General Defaults */}
          <div className="space-y-3 bg-slate-50/80 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block text-[11px]">
              Storewide Defaults
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Default Catalog Mode</Label>
                <Select value={defaultMode} onValueChange={setDefaultMode}>
                  <SelectTrigger className="h-8 mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smart_rotation">Mode C: Smart + Controlled Rotation</SelectItem>
                    <SelectItem value="smart">Mode B: Smart Ranking Only</SelectItem>
                    <SelectItem value="manual">Mode A: Manual Sequence</SelectItem>
                    <SelectItem value="personalized">Mode D: Personalized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Rotation Schedule</Label>
                <Select value={rotationFrequency} onValueChange={setRotationFrequency}>
                  <SelectTrigger className="h-8 mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (Every 24 Hours)</SelectItem>
                    <SelectItem value="3days">Every 3 Days</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Default Protected Top Positions</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={defaultProtectedTopCount}
                  onChange={(e) => setDefaultProtectedTopCount(Number(e.target.value))}
                  className="h-8 mt-1 text-xs"
                />
                <span className="text-[10px] text-muted-foreground">
                  Positions 1 to {defaultProtectedTopCount} never rotate.
                </span>
              </div>

              <div>
                <Label className="text-xs font-semibold">Min Sales Data Threshold</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={minDataThreshold}
                  onChange={(e) => setMinDataThreshold(Number(e.target.value))}
                  className="h-8 mt-1 text-xs"
                />
                <span className="text-[10px] text-muted-foreground">
                  Minimum orders required for high sales weight.
                </span>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-2.5 bg-slate-50/80 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block text-[11px]">
              Engine Toggles
            </span>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Controlled Discovery Rotation
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Deterministically rotates eligible catalog items below top zone.
                </p>
              </div>
              <Switch checked={isRotationEnabled} onCheckedChange={setIsRotationEnabled} />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <div>
                <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Privacy-Conscious Personalization
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Boosts viewed categories within session without saving personal profile.
                </p>
              </div>
              <Switch checked={isPersonalizationEnabled} onCheckedChange={setIsPersonalizationEnabled} />
            </div>
          </div>

          {/* Scoring Weights */}
          <div className="space-y-3 bg-slate-50/80 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block text-[11px]">
                Smart Ranking Signal Weights
              </span>
              <Badge className={totalWeight === 100 ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}>
                Total: {totalWeight}%
              </Badge>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span>Sales Velocity & Units Sold:</span>
                <span className="font-mono font-bold">{weights.sales}%</span>
              </div>
              <Slider
                value={[weights.sales]}
                max={60}
                step={5}
                onValueChange={([val]) => setWeights((prev) => ({ ...prev, sales: val }))}
              />

              <div className="flex items-center justify-between pt-1">
                <span>Customer Ratings & Review Confidence:</span>
                <span className="font-mono font-bold">{weights.ratingAndReviews}%</span>
              </div>
              <Slider
                value={[weights.ratingAndReviews]}
                max={50}
                step={5}
                onValueChange={([val]) => setWeights((prev) => ({ ...prev, ratingAndReviews: val }))}
              />

              <div className="flex items-center justify-between pt-1">
                <span>Stock Depth & In-Stock Reliability:</span>
                <span className="font-mono font-bold">{weights.availabilityAndStock}%</span>
              </div>
              <Slider
                value={[weights.availabilityAndStock]}
                max={40}
                step={5}
                onValueChange={([val]) => setWeights((prev) => ({ ...prev, availabilityAndStock: val }))}
              />

              <div className="flex items-center justify-between pt-1">
                <span>Product Freshness (New arrivals bonus):</span>
                <span className="font-mono font-bold">{weights.freshness}%</span>
              </div>
              <Slider
                value={[weights.freshness]}
                max={30}
                step={5}
                onValueChange={([val]) => setWeights((prev) => ({ ...prev, freshness: val }))}
              />

              <div className="flex items-center justify-between pt-1">
                <span>Promotional Discount / Offer Lift:</span>
                <span className="font-mono font-bold">{weights.discountAndPromotion}%</span>
              </div>
              <Slider
                value={[weights.discountAndPromotion]}
                max={30}
                step={5}
                onValueChange={([val]) => setWeights((prev) => ({ ...prev, discountAndPromotion: val }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-xl h-8">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-semibold rounded-xl h-8 gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save Global Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default MerchandisingGlobalSettingsDialog;
