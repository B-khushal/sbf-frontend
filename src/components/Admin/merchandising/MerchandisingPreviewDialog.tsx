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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getImageUrl } from "@/config";
import productService from "@/services/productService";
import {
  Eye,
  Sparkles,
  RotateCcw,
  GripVertical,
  Pin,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Info,
  TrendingUp,
  Star
} from "lucide-react";

interface MerchandisingPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  sectionLabel: string;
  activeMode: string;
  protectedTopCount: number;
  rotationFrequency: string;
  rotationVersion: number;
  onApplyAndClose?: (mode: string) => void;
}

export const MerchandisingPreviewDialog: React.FC<MerchandisingPreviewDialogProps> = ({
  isOpen,
  onClose,
  section,
  sectionLabel,
  activeMode,
  protectedTopCount,
  rotationFrequency,
  rotationVersion,
  onApplyAndClose
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("smart_rotation");
  const [loading, setLoading] = useState<boolean>(true);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedTab(activeMode || "smart_rotation");
      fetchPreview(activeMode || "smart_rotation");
    }
  }, [isOpen, section, activeMode]);

  const fetchPreview = async (mode: string) => {
    try {
      setLoading(true);
      const data = await productService.getMerchandisingPreview(section, {
        mode,
        protectedTopCount,
        rotationFrequency,
        rotationVersion
      });
      setPreviewData(data);
    } catch (err) {
      console.error("Error fetching merchandising preview:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (mode: string) => {
    setSelectedTab(mode);
    fetchPreview(mode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Merchandising Strategy Simulation
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Simulating ordering rules for <strong>{sectionLabel}</strong>. Simulated results do not alter live storefront.
                </DialogDescription>
              </div>
            </div>

            <Badge variant="outline" className="text-xs font-mono border-pink-200 text-pink-700 dark:text-pink-300">
              Simulation Mode
            </Badge>
          </div>
        </DialogHeader>

        {/* Strategy Tabs */}
        <div className="pt-2">
          <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-10 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <TabsTrigger
                value="smart_rotation"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#ec4899] rounded-lg"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Smart + Rotation (Mode C)
              </TabsTrigger>
              <TabsTrigger
                value="smart"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 rounded-lg"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Pure Smart Ranking (Mode B)
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 rounded-lg"
              >
                <GripVertical className="h-3.5 w-3.5" />
                Manual Order (Mode A)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Summary Metric Chips */}
        {previewData?.counts && (
          <div className="grid grid-cols-4 gap-2 pt-2 text-center">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">
                Pinned Items
              </span>
              <span className="text-base font-black text-amber-900 dark:text-amber-100">
                {previewData.counts.pinned}
              </span>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 p-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">
                Protected Top Zone
              </span>
              <span className="text-base font-black text-purple-900 dark:text-purple-100">
                {previewData.counts.protectedTop}
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 p-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                Rotating Discovery
              </span>
              <span className="text-base font-black text-blue-900 dark:text-blue-100">
                {previewData.counts.rotating}
              </span>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 p-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 block">
                Out of Stock
              </span>
              <span className="text-base font-black text-rose-900 dark:text-rose-100">
                {previewData.counts.outOfStock}
              </span>
            </div>
          </div>
        )}

        {/* Product List Stream */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 border border-slate-100 dark:border-slate-800 rounded-xl p-2 my-2 bg-slate-50/50 dark:bg-slate-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-pink-600" />
              <span className="text-xs font-semibold">Simulating ordering sequence...</span>
            </div>
          ) : !previewData?.items || previewData.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No products found for this section.
            </div>
          ) : (
            previewData.items.map((item: any) => {
              const imgSrc = item.image ? getImageUrl(item.image) : "/placeholder.png";

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    item.isPinned
                      ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700"
                      : item.isProtectedTop
                      ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
                      : item.isOutOfStock
                      ? "bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800/40 opacity-70"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-mono text-xs font-black text-slate-500">
                      #{item.position}
                    </span>

                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </span>

                        {item.isPinned && (
                          <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0 rounded flex items-center gap-0.5">
                            <Pin className="h-2.5 w-2.5" /> Pinned #{item.pinIndex}
                          </Badge>
                        )}

                        {item.isProtectedTop && (
                          <Badge className="bg-purple-600 text-white text-[9px] px-1.5 py-0 rounded flex items-center gap-0.5">
                            <ShieldCheck className="h-2.5 w-2.5" /> Top Zone
                          </Badge>
                        )}

                        {item.isRotating && (
                          <Badge className="bg-blue-600 text-white text-[9px] px-1.5 py-0 rounded flex items-center gap-0.5">
                            <RefreshCw className="h-2.5 w-2.5" /> Rotating
                          </Badge>
                        )}

                        {item.isOutOfStock && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 rounded">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>₹{item.price}</span>
                        <span>•</span>
                        <span>Stock: {item.stock}</span>
                        {item.rating > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-600">
                              <Star className="h-2.5 w-2.5 fill-current" /> {item.rating} ({item.reviewCount})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Smart Score & Breakdown */}
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-xs font-black font-mono text-slate-800 dark:text-slate-200">
                      Score: {item.smartScore}
                    </div>
                    {item.scoreBreakdown && (
                      <div className="text-[9px] text-muted-foreground flex items-center gap-1.5 justify-end">
                        <span title="Sales Score">Sales: {Math.round(item.scoreBreakdown.sales * 100)}%</span>
                        <span>•</span>
                        <span title="Freshness">Fresh: {Math.round(item.scoreBreakdown.freshness * 100)}%</span>
                        <span>•</span>
                        <span title="Stock">Stock: {Math.round(item.scoreBreakdown.stock * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>To make this preview live on the store, choose strategy on main screen & save.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-xl h-8">
              Close Preview
            </Button>
            {onApplyAndClose && (
              <Button
                size="sm"
                onClick={() => {
                  onApplyAndClose(selectedTab);
                  onClose();
                }}
                className="bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-semibold rounded-xl h-8"
              >
                Select Mode & Apply
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default MerchandisingPreviewDialog;
