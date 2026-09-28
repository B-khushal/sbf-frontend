import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import productService, { ProductData } from '@/services/productService';
import {
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  Layers,
  CheckSquare,
  Globe,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ProductCatalogExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  products: ProductData[];
  categories: string[];
}

// Core preset categories requested for Meta Catalog
const PRESET_CATEGORIES = [
  { id: 'bouquets', label: 'Bouquets', icon: '💐' },
  { id: 'plants', label: 'Plants', icon: '🪴' },
  { id: 'arrangements', label: 'Arrangements', icon: '🧺' },
  { id: 'gifts', label: 'Gifts', icon: '🎁' },
  { id: 'cakes', label: 'Cakes', icon: '🎂' },
  { id: 'combos', label: 'Combos', icon: '✨' },
  { id: 'add-ons', label: 'Add-ons', icon: '🍫' }
];

export const ProductCatalogExportModal: React.FC<ProductCatalogExportModalProps> = ({
  isOpen,
  onClose,
  selectedProductIds,
  products,
  categories,
}) => {
  const { toast } = useToast();

  // Export mode: 'all' | 'categories' | 'products'
  const [exportType, setExportType] = useState<'all' | 'categories' | 'products'>(
    selectedProductIds.length > 0 ? 'products' : 'all'
  );

  // Automatically update exportType when modal opens or selected items change
  useEffect(() => {
    if (isOpen) {
      if (selectedProductIds.length > 0) {
        setExportType('products');
      } else {
        setExportType('all');
      }
    }
  }, [isOpen, selectedProductIds]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'bouquets',
    'plants',
    'arrangements',
    'gifts',
    'cakes',
    'combos',
    'add-ons'
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [showWarningsDialog, setShowWarningsDialog] = useState(false);
  const [showColumnsPreview, setShowColumnsPreview] = useState(false);
  const [exportWarnings, setExportWarnings] = useState<
    Array<{ productId: string; productName: string; issue: string }>
  >([]);
  const [lastExportStats, setLastExportStats] = useState<{
    totalCount: number;
    completeCount: number;
    warningCount: number;
    filename: string;
  } | null>(null);

  // Combine preset categories with any custom configured categories in admin
  const allAvailableCategories = useMemo(() => {
    const map = new Map<string, { id: string; label: string; icon?: string }>();

    // Add presets first
    PRESET_CATEGORIES.forEach((cat) => {
      map.set(cat.id.toLowerCase(), cat);
    });

    // Add configured categories from admin
    categories.forEach((catName) => {
      const cleanSlug = catName.toLowerCase().trim().replace(/\s+/g, '-');
      if (!map.has(cleanSlug)) {
        map.set(cleanSlug, {
          id: cleanSlug,
          label: catName.charAt(0).toUpperCase() + catName.slice(1),
          icon: '🏷️'
        });
      }
    });

    return Array.from(map.values());
  }, [categories]);

  // Toggle single category selection
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Toggle all categories selection
  const toggleSelectAllCategories = () => {
    if (selectedCategories.length === allAvailableCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(allAvailableCategories.map((c) => c.id));
    }
  };

  // Trigger export
  const handleExport = async () => {
    // Validation
    if (exportType === 'categories' && selectedCategories.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one category to export.',
        variant: 'destructive',
      });
      return;
    }

    if (exportType === 'products' && selectedProductIds.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one product to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      const payload: {
        type: 'all' | 'categories' | 'products';
        categoryIds?: string[];
        productIds?: string[];
      } = {
        type: exportType,
      };

      if (exportType === 'categories') {
        payload.categoryIds = selectedCategories;
      } else if (exportType === 'products') {
        payload.productIds = selectedProductIds;
      }

      const result = await productService.exportProductCatalog(payload);

      // Trigger browser file download
      const downloadUrl = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', result.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setLastExportStats({
        totalCount: result.totalCount,
        completeCount: result.completeCount,
        warningCount: result.warningCount,
        filename: result.filename,
      });

      if (result.warningCount > 0 && result.warnings.length > 0) {
        setExportWarnings(result.warnings);
        setShowWarningsDialog(true);
        toast({
          title: 'Export completed with warnings',
          description: `${result.totalCount} products exported. ${result.warningCount} items require attention.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Catalog exported successfully',
          description: `${result.totalCount} products exported to ${result.filename}.`,
        });
        onClose();
      }
    } catch (error: any) {
      console.error('Catalog export error:', error);
      toast({
        title: 'Export Failed',
        description: error?.response?.data?.message || error?.message || 'Failed to generate product catalog CSV.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-pink-200 shadow-2xl p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-6 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                    Product Catalog Export
                    <Badge className="bg-white/25 hover:bg-white/30 text-white text-[11px] font-medium border-0">
                      Meta Ads & Marketing
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-pink-100 text-xs mt-0.5">
                    Generate clean, production-ready product data for Meta Ads, Facebook & Instagram Product Catalogs.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Informational Callout (Section 16 requirement) */}
            <div className="bg-gradient-to-r from-pink-50 via-rose-50/50 to-amber-50/40 border border-pink-200/80 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-pink-100 rounded-lg text-pink-700 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-pink-900 text-sm flex items-center gap-1.5">
                    Marketing Catalog
                    <Badge variant="outline" className="text-[10px] text-pink-700 border-pink-300 py-0">
                      Meta Ads Compatible
                    </Badge>
                  </div>
                  <p className="text-pink-800/90 mt-1 leading-relaxed">
                    Export your product catalog for Meta Ads, Facebook & Instagram product catalogs. The exported CSV contains product images, product information, pricing, availability, delivery options and customer-facing URLs.
                  </p>
                </div>
              </div>
            </div>

            {/* Export Scope Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                1. Select Export Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Full Catalog */}
                <button
                  type="button"
                  onClick={() => setExportType('all')}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    exportType === 'all'
                      ? 'border-pink-500 bg-pink-50/40 ring-2 ring-pink-500/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        exportType === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        exportType === 'all'
                          ? 'border-pink-600 bg-pink-600 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {exportType === 'all' && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Full Catalog</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Every active product & add-on</div>
                  </div>
                </button>

                {/* Selected Categories */}
                <button
                  type="button"
                  onClick={() => setExportType('categories')}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    exportType === 'categories'
                      ? 'border-pink-500 bg-pink-50/40 ring-2 ring-pink-500/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        exportType === 'categories'
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        exportType === 'categories'
                          ? 'border-pink-600 bg-pink-600 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {exportType === 'categories' && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">By Category</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {selectedCategories.length} categories chosen
                    </div>
                  </div>
                </button>

                {/* Selected Products */}
                <button
                  type="button"
                  onClick={() => setExportType('products')}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    exportType === 'products'
                      ? 'border-pink-500 bg-pink-50/40 ring-2 ring-pink-500/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        exportType === 'products'
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        exportType === 'products'
                          ? 'border-pink-600 bg-pink-600 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {exportType === 'products' && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Selected Products</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {selectedProductIds.length} products checked
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Scope Details: Category Selection */}
            {exportType === 'categories' && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Categories ({selectedCategories.length}/{allAvailableCategories.length})
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAllCategories}
                    className="text-xs h-7 text-pink-600 hover:text-pink-700"
                  >
                    {selectedCategories.length === allAvailableCategories.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {allAvailableCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                          isChecked
                            ? 'bg-white border-pink-400 text-pink-900 font-medium shadow-2xs'
                            : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                        />
                        <span className="truncate">
                          {cat.icon && <span className="mr-1">{cat.icon}</span>}
                          {cat.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {selectedCategories.length === 0 && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ Please select at least one category.
                  </p>
                )}
              </div>
            )}

            {/* Scope Details: Selected Products */}
            {exportType === 'products' && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Product Selection
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedProductIds.length} Selected
                  </Badge>
                </div>

                {selectedProductIds.length === 0 ? (
                  <Alert className="border-amber-300 bg-amber-50/70">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-800">
                      No products currently selected. Use the checkboxes in the Products table or grid on the page to pick products, then return here to export.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>{selectedProductIds.length}</strong> products will be exported in this CSV batch.
                    </p>
                    <p className="text-[11px] text-gray-500">
                      You can select products across multiple categories or filters before exporting.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CSV Specification Details (Expandable) */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowColumnsPreview(!showColumnsPreview)}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50/70 hover:bg-gray-100/70 text-left transition-colors text-xs font-semibold text-gray-700"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>CSV Output Columns (Exactly 8 columns in order)</span>
                </div>
                {showColumnsPreview ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>

              {showColumnsPreview && (
                <div className="p-4 bg-white border-t border-gray-200 text-xs space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { num: 1, name: 'Product Image', desc: 'Primary HTTPS image' },
                      { num: 2, name: 'Product ID', desc: 'Unique catalog ID' },
                      { num: 3, name: 'Product Name', desc: 'Exact product title' },
                      { num: 4, name: 'Short Description', desc: 'Plain text without HTML' },
                      { num: 5, name: 'Price', desc: 'Numeric selling price' },
                      { num: 6, name: 'Availability', desc: 'in stock / out of stock' },
                      { num: 7, name: 'Delivery Information', desc: 'Standardized delivery' },
                      { num: 8, name: 'Product URL', desc: 'Customer shop link' }
                    ].map((col) => (
                      <div key={col.num} className="p-2 bg-slate-50 border rounded-lg">
                        <div className="font-semibold text-gray-900">
                          {col.num}. {col.name}
                        </div>
                        <div className="text-[10px] text-gray-500">{col.desc}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 pt-1">
                    Encoded in UTF-8 with BOM for 100% compatibility with Excel, Google Sheets, and Meta Commerce Manager.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleExport}
              disabled={
                isExporting ||
                (exportType === 'categories' && selectedCategories.length === 0) ||
                (exportType === 'products' && selectedProductIds.length === 0)
              }
              className="bg-pink-600 hover:bg-pink-700 text-white min-w-[200px] shadow-sm font-semibold"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating CSV...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {exportType === 'all' && 'Export Full Catalog CSV'}
                  {exportType === 'categories' && `Export Selected Categories (${selectedCategories.length})`}
                  {exportType === 'products' && `Export Selected Products (${selectedProductIds.length})`}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warnings & Attention Dialog (Section 11 requirement) */}
      <Dialog open={showWarningsDialog} onOpenChange={setShowWarningsDialog}>
        <DialogContent className="max-w-xl border-amber-200 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <DialogTitle>Export Completed with Warnings</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-600 pt-1">
              Your CSV was downloaded, but some products have missing or incomplete information for Meta Catalog ads.
            </DialogDescription>
          </DialogHeader>

          {lastExportStats && (
            <div className="grid grid-cols-3 gap-3 my-2 text-center text-xs">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <div className="text-lg font-bold text-gray-800">{lastExportStats.totalCount}</div>
                <div className="text-gray-500">Total Exported</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-lg font-bold text-emerald-700">{lastExportStats.completeCount}</div>
                <div className="text-emerald-600">Complete</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-lg font-bold text-amber-700">{lastExportStats.warningCount}</div>
                <div className="text-amber-600">Need Attention</div>
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto border rounded-lg text-xs divide-y">
            {exportWarnings.map((item, idx) => (
              <div key={idx} className="p-2.5 flex items-start justify-between gap-3 bg-white hover:bg-slate-50">
                <div>
                  <div className="font-semibold text-gray-900">{item.productName}</div>
                  <div className="text-[10px] text-gray-500">ID: {item.productId}</div>
                </div>
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-[10px] whitespace-nowrap">
                  {item.issue}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              onClick={() => {
                setShowWarningsDialog(false);
                onClose();
              }}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCatalogExportModal;
