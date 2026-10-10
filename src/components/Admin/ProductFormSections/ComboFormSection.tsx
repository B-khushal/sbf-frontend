import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Gift,
  Flower2,
  Cake,
  Plus,
  Search,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  IndianRupee,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight,
  Calculator,
  Layers,
  Wand2
} from 'lucide-react';
import type { ProductData, PriceVariant } from '@/services/productService';
import productService from '@/services/productService';
import { getImageUrl } from '@/config';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ComboFormSectionProps {
  formData: ProductData;
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>;
}

export const ComboFormSection: React.FC<ComboFormSectionProps> = ({ formData, setFormData }) => {
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  // Search queries for selector dropdowns
  const [bouquetSearch, setBouquetSearch] = useState('');
  const [cakeSearch, setCakeSearch] = useState('');
  const [isBouquetDropdownOpen, setIsBouquetDropdownOpen] = useState(false);
  const [isCakeDropdownOpen, setIsCakeDropdownOpen] = useState(false);

  // Selected components state
  const [selectedBouquet, setSelectedBouquet] = useState<ProductData | null>(null);
  const [selectedCake, setSelectedCake] = useState<ProductData | null>(null);

  // Optional combo bundle discount (e.g. flat discount on the combined bundle)
  const [comboBundleDiscount, setComboBundleDiscount] = useState<number>(0);
  const [autoSyncPrices, setAutoSyncPrices] = useState<boolean>(true);

  // 1. Fetch catalog products on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await productService.getAdminProducts();
        const prods: ProductData[] = res.products || [];
        setAllProducts(prods);

        // Hydrate from existing formData if already connected
        const existingComboProds = formData.comboAttributes?.comboProducts || [];
        if (existingComboProds.length > 0) {
          const bouquetItem = existingComboProds.find(
            (p: any) => p.type === 'bouquet' || p.name?.toLowerCase().includes('bouquet') || p.name?.toLowerCase().includes('rose')
          );
          const cakeItem = existingComboProds.find(
            (p: any) => p.type === 'cake' || p.name?.toLowerCase().includes('cake')
          );

          if (bouquetItem?.productId) {
            const foundB = prods.find(p => p._id === bouquetItem.productId);
            if (foundB) setSelectedBouquet(foundB);
          } else if (bouquetItem) {
            // Match by name
            const foundB = prods.find(p => p.title?.toLowerCase() === bouquetItem.name?.toLowerCase());
            if (foundB) setSelectedBouquet(foundB);
          }

          if (cakeItem?.productId) {
            const foundC = prods.find(p => p._id === cakeItem.productId);
            if (foundC) setSelectedCake(foundC);
          } else if (cakeItem) {
            // Match by name
            const foundC = prods.find(p => p.title?.toLowerCase().includes('cake') && bouquetItem?.name !== p.title);
            if (foundC) setSelectedCake(foundC);
          }
        } else if (formData.description) {
          // Smart match from description text (e.g., "featuring Timeless Romance – 10 Red Rose Bouquet, chocolate cake")
          const descLower = formData.description.toLowerCase();
          const matchBouquet = prods.find(p => {
            const titleLower = (p.title || '').toLowerCase();
            return (p.catalogType === 'bouquet' || p.category === 'flowers') && descLower.includes(titleLower);
          });
          if (matchBouquet) setSelectedBouquet(matchBouquet);

          const matchCake = prods.find(p => {
            const titleLower = (p.title || '').toLowerCase();
            return (p.catalogType === 'cake' || p.category === 'cakes' || titleLower.includes('cake')) && descLower.includes(titleLower);
          });
          if (matchCake) setSelectedCake(matchCake);
        }
      } catch (err) {
        console.error('Error loading products for combo section:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Filter available bouquets from catalog
  const availableBouquets = useMemo(() => {
    return allProducts.filter(p => {
      const type = String(p.catalogType || '').toLowerCase();
      const cat = String(p.category || '').toLowerCase();
      const title = String(p.title || '').toLowerCase();

      const isBouquet = type === 'bouquet' || cat === 'flowers' || cat === 'bouquets' || title.includes('bouquet') || title.includes('roses') || title.includes('flower');
      const isNotCombo = type !== 'combo' && cat !== 'combos';

      if (!isBouquet || !isNotCombo) return false;
      if (bouquetSearch && !title.includes(bouquetSearch.toLowerCase())) return false;
      return true;
    });
  }, [allProducts, bouquetSearch]);

  // Filter available cakes from catalog
  const availableCakes = useMemo(() => {
    return allProducts.filter(p => {
      const type = String(p.catalogType || '').toLowerCase();
      const cat = String(p.category || '').toLowerCase();
      const title = String(p.title || '').toLowerCase();

      const isCake = type === 'cake' || cat === 'cakes' || cat === 'cake' || title.includes('cake');
      const isNotCombo = type !== 'combo' && cat !== 'combos';

      if (!isCake || !isNotCombo) return false;
      if (cakeSearch && !title.includes(cakeSearch.toLowerCase())) return false;
      return true;
    });
  }, [allProducts, cakeSearch]);

  // Extract Cake Variants from the connected cake (just like Photo 1)
  const connectedCakeVariants = useMemo(() => {
    if (!selectedCake) return [];

    if (Array.isArray(selectedCake.priceVariants) && selectedCake.priceVariants.length > 0) {
      return selectedCake.priceVariants.map(v => ({
        label: v.label,
        price: Number(v.price) || Number(selectedCake.price) || 0,
        discountPrice: v.discountPrice !== undefined && v.discountPrice !== null ? Number(v.discountPrice) : undefined,
        comparePrice: v.comparePrice !== undefined ? Number(v.comparePrice) : undefined,
        stock: Number(v.stock !== undefined ? v.stock : 50)
      }));
    }

    // Default if no explicit priceVariants on cake
    const baseP = Number(selectedCake.price) || 699;
    return [
      {
        label: '0.5 Kg',
        price: baseP,
        discountPrice: selectedCake.discountPrice ? Number(selectedCake.discountPrice) : undefined,
        stock: 50
      },
      {
        label: '1 Kg',
        price: Math.round(baseP * 1.8),
        discountPrice: selectedCake.discountPrice ? Math.round(Number(selectedCake.discountPrice) * 1.8) : undefined,
        stock: 50
      }
    ];
  }, [selectedCake]);

  // Find 0.5 Kg and 1 Kg cake entries
  const cake05Variant = useMemo(() => {
    return connectedCakeVariants.find(v => {
      const l = v.label.toLowerCase();
      return l.includes('0.5') || l.includes('1/2') || l.includes('½');
    }) || connectedCakeVariants[0] || null;
  }, [connectedCakeVariants]);

  const cake1KgVariant = useMemo(() => {
    return connectedCakeVariants.find(v => {
      const l = v.label.toLowerCase();
      return (l.includes('1 kg') || l.includes('1kg') || l === '1 kg') && !l.includes('0.5') && !l.includes('1/2');
    }) || connectedCakeVariants[1] || null;
  }, [connectedCakeVariants]);

  // 2. Calculate Combined Prices (Photo 2)
  const calculations = useMemo(() => {
    const bouquetRegular = selectedBouquet ? Number(selectedBouquet.price || 0) : 0;
    const bouquetSelling = selectedBouquet
      ? Number(selectedBouquet.discountPrice || selectedBouquet.price || 0)
      : 0;

    const cake05Regular = cake05Variant ? Number(cake05Variant.price || 0) : (selectedCake ? Number(selectedCake.price || 0) : 0);
    const cake05Selling = cake05Variant?.discountPrice !== undefined
      ? Number(cake05Variant.discountPrice)
      : cake05Regular;

    const cake1KgRegular = cake1KgVariant
      ? Number(cake1KgVariant.price || 0)
      : (cake05Regular + 500);
    const cake1KgSelling = cake1KgVariant?.discountPrice !== undefined
      ? Number(cake1KgVariant.discountPrice)
      : (cake05Selling + 500);

    // 0.5 Kg Combined
    const total05Regular = bouquetRegular + cake05Regular;
    const total05Selling = Math.max(0, (bouquetSelling + cake05Selling) - comboBundleDiscount);
    const total05Savings = total05Regular > total05Selling ? total05Regular - total05Selling : 0;
    const total05DiscountPct = total05Regular > 0 ? Math.round((total05Savings / total05Regular) * 100) : 0;

    // 1 Kg Combined
    const total1KgRegular = bouquetRegular + cake1KgRegular;
    const total1KgSelling = Math.max(0, (bouquetSelling + cake1KgSelling) - comboBundleDiscount);
    const total1KgSavings = total1KgRegular > total1KgSelling ? total1KgRegular - total1KgSelling : 0;
    const total1KgDiscountPct = total1KgRegular > 0 ? Math.round((total1KgSavings / total1KgRegular) * 100) : 0;

    return {
      bouquetRegular,
      bouquetSelling,
      cake05Regular,
      cake05Selling,
      cake1KgRegular,
      cake1KgSelling,
      total05Regular,
      total05Selling,
      total05Savings,
      total05DiscountPct,
      total1KgRegular,
      total1KgSelling,
      total1KgSavings,
      total1KgDiscountPct,
    };
  }, [selectedBouquet, selectedCake, cake05Variant, cake1KgVariant, comboBundleDiscount]);

  // 3. Auto-sync calculated prices into Photo 2's formData
  useEffect(() => {
    if (!autoSyncPrices || !selectedBouquet || !selectedCake) return;

    // Generate combo priceVariants for 0.5 Kg and 1 Kg
    const newPriceVariants: PriceVariant[] = [
      {
        label: '0.5 Kg',
        price: calculations.total05Regular,
        discountPrice: calculations.total05Savings > 0 ? calculations.total05Selling : undefined,
        stock: Math.min(Number(selectedBouquet.countInStock || 50), Number(selectedCake.countInStock || 50)),
      },
      {
        label: '1 Kg',
        price: calculations.total1KgRegular,
        discountPrice: calculations.total1KgSavings > 0 ? calculations.total1KgSelling : undefined,
        stock: Math.min(Number(selectedBouquet.countInStock || 50), Number(selectedCake.countInStock || 50)),
      }
    ];

    const bouquetImg = selectedBouquet.images?.[0] || selectedBouquet.image || '';
    const cakeImg = selectedCake.images?.[0] || selectedCake.image || '';

    setFormData(prev => ({
      ...prev,
      catalogType: 'combo',
      category: prev.category || 'combos',
      categories: Array.from(new Set([...(prev.categories || []), 'combos', prev.category].filter(Boolean))),
      // Sync Photo 2's Regular Price & Discount
      price: calculations.total05Regular,
      discountPrice: calculations.total05Savings > 0 ? calculations.total05Selling : undefined,
      discount: calculations.total05DiscountPct,
      discountType: calculations.total05Savings > 0 ? 'direct' : prev.discountType,
      hasPriceVariants: true,
      priceVariants: newPriceVariants,
      // Connect cake attributes from the selected cake
      cakeAttributes: {
        flavor: selectedCake.cakeAttributes?.flavor || (selectedCake.title?.toLowerCase().includes('chocolate') ? 'Chocolate' : 'Artisan Flavor'),
        eggless: selectedCake.cakeAttributes?.eggless !== undefined ? selectedCake.cakeAttributes.eggless : true,
        shape: selectedCake.cakeAttributes?.shape || 'round',
        prepTime: selectedCake.cakeAttributes?.prepTime || 'same-day',
        availableSizes: ['0.5 Kg', '1 Kg'],
        occasion: selectedCake.cakeAttributes?.occasion || 'celebration',
      },
      // Store in comboAttributes.comboProducts
      comboAttributes: {
        comboProducts: [
          {
            productId: selectedBouquet._id,
            name: selectedBouquet.title,
            type: 'bouquet',
            price: calculations.bouquetRegular,
            image: bouquetImg,
            quantity: 1,
            catalogType: 'bouquet',
          },
          {
            productId: selectedCake._id,
            name: selectedCake.title,
            type: 'cake',
            price: calculations.cake05Regular,
            image: cakeImg,
            quantity: 1,
            catalogType: 'cake',
            priceVariants: connectedCakeVariants,
            cakeAttributes: selectedCake.cakeAttributes,
          }
        ]
      }
    }));
  }, [
    selectedBouquet?._id,
    selectedCake?._id,
    calculations,
    autoSyncPrices,
    connectedCakeVariants
  ]);

  // Auto-Fill Title and Description based on connected products
  const handleAutoFillDetails = () => {
    if (!selectedBouquet || !selectedCake) return;
    const newTitle = `${selectedBouquet.title} with ${selectedCake.title}`;
    const newDescription = `Exclusive combo hamper package featuring ${selectedBouquet.title}, ${selectedCake.title}.`;

    setFormData(prev => ({
      ...prev,
      title: newTitle,
      description: newDescription,
    }));

    toast({
      title: "Title & Description Updated!",
      description: `Auto-filled as "${newTitle}"`,
    });
  };

  return (
    <Card className="border-2 border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/40 dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-rose-100/70 via-pink-100/50 to-amber-100/50 dark:from-rose-950/50 dark:to-slate-900 border-b border-rose-200/60 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-md">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Combo Builder: Connect Bouquet & Cake</span>
                <Badge className="bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5">
                  Celebration Duo
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Connect a bouquet product and a cake product from your catalog. Cake weight variants (0.5 Kg & 1 Kg) and combined prices will automatically sync to Photo 2's pricing fields.
              </CardDescription>
            </div>
          </div>

          {selectedBouquet && selectedCake && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFillDetails}
              className="text-xs font-semibold gap-1.5 border-rose-300 text-rose-700 bg-white hover:bg-rose-50 self-start sm:self-auto"
            >
              <Wand2 className="w-3.5 h-3.5 text-rose-600" />
              Auto-Fill Title & Description
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        
        {/* 2 COLUMN SELECTOR GRID: BOUQUET & CAKE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* SECTION 1: CONNECT BOUQUET PRODUCT */}
          <div className="rounded-2xl border-2 border-rose-200 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-rose-950 dark:text-rose-200 flex items-center gap-2">
                <Flower2 className="w-4 h-4 text-rose-600" />
                1. Connect Bouquet Product *
              </h4>
              {selectedBouquet && (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border-0">
                  <Check className="w-3 h-3 mr-1" /> Connected
                </Badge>
              )}
            </div>

            {/* Selected Bouquet Preview Card */}
            {selectedBouquet ? (
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-slate-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getImageUrl(selectedBouquet.images?.[0] || selectedBouquet.image) || '/images/placeholder.svg'}
                    alt={selectedBouquet.title}
                    className="w-14 h-14 object-cover rounded-xl border border-rose-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {selectedBouquet.title}
                    </p>
                    <p className="text-xs font-bold text-rose-600 mt-0.5">
                      ₹{selectedBouquet.price}
                      {selectedBouquet.discountPrice && (
                        <span className="text-[11px] text-slate-400 line-through ml-1.5 font-normal">
                          ₹{selectedBouquet.discountPrice}
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {selectedBouquet.category || 'Bouquet'}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBouquet(null)}
                  className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-100/60 p-0 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              /* Bouquet Search / Dropdown Picker */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search bouquets (e.g. Timeless Romance, 10 Roses)..."
                    value={bouquetSearch}
                    onChange={(e) => {
                      setBouquetSearch(e.target.value);
                      setIsBouquetDropdownOpen(true);
                    }}
                    onFocus={() => setIsBouquetDropdownOpen(true)}
                    className="pl-9 h-9 text-xs border-rose-200 focus:ring-rose-400 rounded-xl"
                  />
                </div>

                {isBouquetDropdownOpen && (
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-rose-200 bg-white dark:bg-slate-900 p-1 space-y-1 shadow-lg">
                    {availableBouquets.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No bouquets found in catalog.</p>
                    ) : (
                      availableBouquets.slice(0, 8).map(b => (
                        <div
                          key={b._id}
                          onClick={() => {
                            setSelectedBouquet(b);
                            setIsBouquetDropdownOpen(false);
                            setBouquetSearch('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={getImageUrl(b.images?.[0] || b.image) || '/images/placeholder.svg'}
                              alt={b.title}
                              className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{b.title}</p>
                              <p className="text-[11px] text-rose-600 font-semibold">₹{b.price}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 text-[11px] text-rose-600 font-bold px-2">
                            Select
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: CONNECT CAKE PRODUCT (TAKES CAKE DATA & CONFIGURED VARIANTS) */}
          <div className="rounded-2xl border-2 border-amber-200 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
                <Cake className="w-4 h-4 text-amber-600" />
                2. Connect Cake Product *
              </h4>
              {selectedCake && (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border-0">
                  <Check className="w-3 h-3 mr-1" /> Connected
                </Badge>
              )}
            </div>

            {/* Selected Cake Preview Card with Configured Variants */}
            {selectedCake ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-slate-850 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getImageUrl(selectedCake.images?.[0] || selectedCake.image) || '/images/placeholder.svg'}
                      alt={selectedCake.title}
                      className="w-14 h-14 object-cover rounded-xl border border-amber-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {selectedCake.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          🍃 Eggless
                        </span>
                        {selectedCake.cakeAttributes?.flavor && (
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                            {selectedCake.cakeAttributes.flavor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCake(null)}
                    className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-100/60 p-0 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* CONFIGURED CAKE VARIANTS EXTRACTED FROM CAKE PRODUCT (PHOTO 1) */}
                <div className="p-3 rounded-xl bg-amber-100/50 dark:bg-amber-950/30 border border-amber-200 text-xs space-y-2">
                  <span className="font-black text-[11px] uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Cake Variants Taken from {selectedCake.title}:
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* 0.5 Kg Variant Preview */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 shadow-2xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 dark:text-slate-100 font-bold">0.5 Kg (Base)</strong>
                        <span className="text-[10px] text-slate-400">4-6 People</span>
                      </div>
                      <p className="text-xs font-black text-amber-700 dark:text-amber-300">
                        ₹{calculations.cake05Regular}
                        {calculations.cake05Selling < calculations.cake05Regular && (
                          <span className="text-[11px] font-semibold text-emerald-600 ml-1.5">
                            (Disc: ₹{calculations.cake05Selling})
                          </span>
                        )}
                      </p>
                    </div>

                    {/* 1 Kg Variant Preview */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 shadow-2xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 dark:text-slate-100 font-bold">1 Kg</strong>
                        <span className="text-[10px] text-slate-400">8-10 People</span>
                      </div>
                      <p className="text-xs font-black text-amber-700 dark:text-amber-300">
                        ₹{calculations.cake1KgRegular}
                        {calculations.cake1KgSelling < calculations.cake1KgRegular && (
                          <span className="text-[11px] font-semibold text-emerald-600 ml-1.5">
                            (Disc: ₹{calculations.cake1KgSelling})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Cake Search / Dropdown Picker */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search cakes (e.g. Chocolate Cake, Truffle)..."
                    value={cakeSearch}
                    onChange={(e) => {
                      setCakeSearch(e.target.value);
                      setIsCakeDropdownOpen(true);
                    }}
                    onFocus={() => setIsCakeDropdownOpen(true)}
                    className="pl-9 h-9 text-xs border-amber-200 focus:ring-amber-400 rounded-xl"
                  />
                </div>

                {isCakeDropdownOpen && (
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-amber-200 bg-white dark:bg-slate-900 p-1 space-y-1 shadow-lg">
                    {availableCakes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No cakes found in catalog.</p>
                    ) : (
                      availableCakes.slice(0, 8).map(c => (
                        <div
                          key={c._id}
                          onClick={() => {
                            setSelectedCake(c);
                            setIsCakeDropdownOpen(false);
                            setCakeSearch('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={getImageUrl(c.images?.[0] || c.image) || '/images/placeholder.svg'}
                              alt={c.title}
                              className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{c.title}</p>
                              <p className="text-[11px] text-amber-700 font-semibold">₹{c.price}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 text-[11px] text-amber-700 font-bold px-2">
                            Select
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        <Separator className="bg-rose-200/60" />

        {/* 🧮 SECTION 3: CALCULATED PRICE OF BOTH PRODUCTS (SYNCS WITH PHOTO 2) */}
        {selectedBouquet && selectedCake ? (
          <div className="rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs font-bold">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                    <span>Calculated Combined Pricing (Auto-Synced with Photo 2)</span>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5">
                      ✓ Active
                    </Badge>
                  </h4>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    The Regular Price & Discount in the form above are automatically computed from the connected bouquet and cake.
                  </p>
                </div>
              </div>

              {/* Extra Combo Special Discount Input */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                <Label className="text-xs font-bold text-slate-700 whitespace-nowrap">Combo Extra Discount (₹):</Label>
                <Input
                  type="number"
                  min="0"
                  value={comboBundleDiscount === 0 ? '' : comboBundleDiscount}
                  placeholder="0"
                  onChange={(e) => setComboBundleDiscount(Number(e.target.value) || 0)}
                  className="h-7 w-20 text-xs font-black text-rose-600 text-right p-1"
                />
              </div>
            </div>

            {/* Price Breakdown Cards for 0.5 Kg and 1 Kg */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              
              {/* Card A: 0.5 Kg Combined Calculation */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <span>💐 Bouquet + 🎂 0.5 Kg Cake</span>
                    <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-700">Base Combo</Badge>
                  </span>
                  <span className="text-[11px] text-slate-400">Serves 4–6</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Bouquet ({selectedBouquet.title}):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{calculations.bouquetRegular}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cake 0.5 Kg ({selectedCake.title}):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{calculations.cake05Regular}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>Photo 2 Regular Price:</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₹{calculations.total05Regular}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xs text-rose-600">
                    <span>Final Selling Price:</span>
                    <span>₹{calculations.total05Selling}</span>
                  </div>
                </div>
              </div>

              {/* Card B: 1 Kg Combined Calculation */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <span>💐 Bouquet + 🎂 1 Kg Cake</span>
                    <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-700">1 Kg Upgrade</Badge>
                  </span>
                  <span className="text-[11px] text-slate-400">Serves 8–10</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Bouquet ({selectedBouquet.title}):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{calculations.bouquetRegular}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cake 1 Kg ({selectedCake.title}):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{calculations.cake1KgRegular}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>1 Kg Variant Regular Price:</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₹{calculations.total1KgRegular}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xs text-rose-600">
                    <span>Final Selling Price:</span>
                    <span>₹{calculations.total1KgSelling}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Confirmation Note */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Both 0.5 Kg and 1 Kg options are now connected with calculated pricing. Customers will be able to toggle between them on the product page.
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-rose-300 rounded-xl bg-rose-50/30 text-xs text-slate-500">
            <Gift className="w-8 h-8 text-rose-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Please connect both a Bouquet and a Cake above.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Once both are connected, the combined prices for 0.5 Kg and 1 Kg will calculate and sync automatically.
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default ComboFormSection;
