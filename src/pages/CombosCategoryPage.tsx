import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Filter,
  X,
  Sparkles,
  ChevronRight,
  Scale,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Flower2,
  Cake,
  Truck,
  HeartHandshake,
  ShieldCheck,
  Layers,
  Heart,
  Search,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import api from "@/services/api";
import { CakeComboCard } from "@/components/cakes/CakeComboCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { isComboProduct, extractComboComponents } from "@/utils/comboHelpers";
import { formatCakeWeightLabel } from "@/utils/cakeHelpers";

// Quick filter pills for combos
const COMBO_PILLS = [
  { id: "all", label: "All Combos", icon: "🎁" },
  { id: "birthday", label: "Birthday Combos", icon: "🎂" },
  { id: "roses", label: "Roses & Cake", icon: "🌹" },
  { id: "lilies", label: "Lilies & Red Velvet", icon: "🌸" },
  { id: "chocolate", label: "Chocolate Truffle Sets", icon: "🍫" },
  { id: "romance", label: "Anniversary & Romance", icon: "❤️" },
  { id: "hampers", label: "Luxury Hampers", icon: "👑" },
  { id: "budget", label: "Under ₹2,000", icon: "🏷️" },
];

const COMBINATION_TYPES = [
  { id: "all", label: "All Pairings" },
  { id: "bouquet-cake", label: "Bouquet + Cake (Signature)" },
  { id: "bouquet-chocolate", label: "Bouquet + Chocolates" },
  { id: "mega-hamper", label: "Grand Hampers (3+ Items)" },
];

const CAKE_FLAVORS = [
  { id: "all", label: "All Flavors" },
  { id: "red-velvet", label: "Red Velvet" },
  { id: "chocolate", label: "Dutch / Belgian Chocolate" },
  { id: "pineapple", label: "Pineapple & Fruit" },
  { id: "butterscotch", label: "Butterscotch" },
  { id: "black-forest", label: "Black Forest" },
];

const PRICE_RANGES = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-1500", label: "Under ₹1,500", min: 0, max: 1500 },
  { id: "1500-2500", label: "₹1,500 – ₹2,500", min: 1500, max: 2500 },
  { id: "2500-4000", label: "₹2,500 – ₹4,000", min: 2500, max: 4000 },
  { id: "4000-plus", label: "₹4,000+", min: 4000, max: Infinity },
];

const SORT_OPTIONS = [
  { id: "featured", label: "Featured & Bestsellers" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Customer Rating" },
  { id: "newest", label: "New Arrivals" },
];

export const CombosCategoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice, convertPrice } = useCurrency();

  // Raw data from database
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filters
  const [selectedPill, setSelectedPill] = useState<string>(
    searchParams.get("type") || searchParams.get("category") || "all"
  );
  const [selectedComboType, setSelectedComboType] = useState<string>("all");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [egglessOnly, setEgglessOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Sync category/type param with URL
  useEffect(() => {
    const p = searchParams.get("type") || searchParams.get("category");
    if (p) {
      setSelectedPill(p.toLowerCase());
    }
  }, [searchParams]);

  // Fetch combo products directly from the API
  useEffect(() => {
    let isMounted = true;
    const loadCombos = async () => {
      try {
        setLoading(true);

        // Fetch products; API supports querying or returns full list
        const res = await api.get("/products");
        const rawList = res.data?.products || (Array.isArray(res.data) ? res.data : []);

        // Filter to only combo and hamper products using robust helper
        const comboOnly = rawList.filter((p: any) => {
          if (!p) return false;
          const cat = String(p.category || '').toLowerCase();
          const catalogType = String(p.catalogType || '').toLowerCase();
          const title = String(p.title || p.name || '').toLowerCase();
          // Explicit double-guard to ensure baskets never render in combos
          if (cat === 'baskets' || cat === 'basket' || catalogType === 'basket') {
            return false;
          }
          if (title.includes('basket') && !title.includes('combo') && catalogType !== 'combo') {
            return false;
          }
          return isComboProduct(p);
        });

        if (isMounted) {
          setProducts(comboOnly);
        }
      } catch (err) {
        console.error("Error loading combo products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCombos();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Text Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const title = (p.title || p.name || "").toLowerCase();
        const desc = (p.description || p.shortDescription || "").toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }

    // 2. Quick Pill Filter
    if (selectedPill !== "all") {
      switch (selectedPill) {
        case "birthday":
          list = list.filter((p) => {
            const str = `${p.title || ""} ${p.category || ""} ${p.description || ""} ${JSON.stringify(p.categories || [])}`.toLowerCase();
            return str.includes("birthday");
          });
          break;
        case "roses":
          list = list.filter((p) => {
            const str = `${p.title || ""} ${p.description || ""}`.toLowerCase();
            return str.includes("rose");
          });
          break;
        case "lilies":
          list = list.filter((p) => {
            const str = `${p.title || ""} ${p.description || ""}`.toLowerCase();
            return str.includes("lily") || str.includes("lilies");
          });
          break;
        case "chocolate":
          list = list.filter((p) => {
            const str = `${p.title || ""} ${p.description || ""}`.toLowerCase();
            return str.includes("chocolate") || str.includes("truffle");
          });
          break;
        case "romance":
          list = list.filter((p) => {
            const str = `${p.title || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
            return str.includes("romance") || str.includes("anniversary") || str.includes("love");
          });
          break;
        case "hampers":
          list = list.filter((p) => {
            const str = `${p.title || ""} ${p.catalogType || ""} ${p.category || ""}`.toLowerCase();
            return str.includes("hamper") || (Array.isArray(p.comboAttributes?.comboProducts) && p.comboAttributes.comboProducts.length >= 3);
          });
          break;
        case "budget":
          list = list.filter((p) => Number(p.price || 0) <= 2000);
          break;
        default:
          break;
      }
    }

    // 3. Combination Type Filter
    if (selectedComboType !== "all") {
      list = list.filter((p) => {
        const { bouquet, cake, otherComponents } = extractComboComponents(p);
        if (selectedComboType === "bouquet-cake") {
          return Boolean(bouquet && cake);
        }
        if (selectedComboType === "bouquet-chocolate") {
          const str = `${p.title || ""} ${p.description || ""}`.toLowerCase();
          return str.includes("chocolate") && !str.includes("cake");
        }
        if (selectedComboType === "mega-hamper") {
          return otherComponents.length > 0 || (Array.isArray(p.comboAttributes?.comboProducts) && p.comboAttributes.comboProducts.length >= 3);
        }
        return true;
      });
    }

    // 4. Cake Flavor Filter
    if (selectedFlavor !== "all") {
      const q = selectedFlavor.replace(/-/g, " ").toLowerCase();
      list = list.filter((p) => {
        const cakeFlavor = (p.cakeAttributes?.flavor || "").toLowerCase();
        const fullText = `${p.title || ""} ${p.description || ""}`.toLowerCase();
        return cakeFlavor.includes(q) || fullText.includes(q);
      });
    }

    // 5. Eggless Only Filter
    if (egglessOnly) {
      list = list.filter((p) => {
        // If cake attributes specified, check eggless
        if (p.cakeAttributes?.eggless !== undefined) {
          return Boolean(p.cakeAttributes.eggless);
        }
        return true; // Default bakery is eggless
      });
    }

    // 6. Price Range Filter
    if (selectedPriceRange !== "all") {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        list = list.filter((p) => {
          const price = Number(p.price || 0);
          return price >= range.min && price <= range.max;
        });
      }
    }

    // 7. Sorting
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "rating":
        list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case "newest":
        list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case "featured":
      default:
        list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
    }

    return list;
  }, [
    products,
    searchQuery,
    selectedPill,
    selectedComboType,
    selectedFlavor,
    selectedPriceRange,
    egglessOnly,
    sortBy,
  ]);

  const handlePillSelect = (pillId: string) => {
    setSelectedPill(pillId);
    if (pillId === "all") {
      searchParams.delete("type");
      searchParams.delete("category");
    } else {
      searchParams.set("type", pillId);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedPill("all");
    setSelectedComboType("all");
    setSelectedFlavor("all");
    setSelectedPriceRange("all");
    setEgglessOnly(false);
    setSearchQuery("");
    setSortBy("featured");
    searchParams.delete("type");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  const activeFilterCount =
    (selectedPill !== "all" ? 1 : 0) +
    (selectedComboType !== "all" ? 1 : 0) +
    (selectedFlavor !== "all" ? 1 : 0) +
    (selectedPriceRange !== "all" ? 1 : 0) +
    (egglessOnly ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // SEO Schema
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Luxury Flowers & Cake Combos Online | Spring Blossoms Florist",
    description:
      "Order signature flower bouquet and cake combos online from Spring Blossoms Florist. Dutch red roses, oriental lilies paired with oven-fresh Red Velvet, Belgian Chocolate & Black Forest cakes with express same-day handover.",
    url: "https://sbflorist.in/combos",
    hasPart: filteredProducts.slice(0, 10).map((prod) => ({
      "@type": "Product",
      name: prod.name || prod.title,
      description: prod.shortDescription || prod.description,
      image: prod.images?.[0] || prod.image,
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: prod.price,
        availability: prod.isAvailable !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    })),
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      <Helmet>
        <title>Flower and Cake Combos in Hyderabad | Spring Blossoms Florist</title>
        <meta
          name="description"
          content="Make celebrations memorable with flower and cake combos from Spring Blossoms Florist. Explore available gift combinations for birthdays, anniversaries and special moments."
        />
        <link rel="canonical" href="https://sbflorist.in/combos" />
        <meta property="og:title" content="Flower and Cake Combos in Hyderabad | Spring Blossoms Florist" />
        <meta
          property="og:description"
          content="Make celebrations memorable with flower and cake combos from Spring Blossoms Florist. Explore available gift combinations for birthdays, anniversaries and special moments."
        />
        <meta property="og:url" content="https://sbflorist.in/combos" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Breadcrumbs */}
      <div className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-5">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-rose-900 font-bold">Combos &amp; Hampers</span>
          {selectedPill !== "all" && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-slate-800 capitalize">
                {selectedPill.replace(/-/g, " ")}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Hero Banner Section */}
      <div className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 mt-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950 via-neutral-900 to-amber-950 text-white p-6 sm:p-10 md:p-14 2xl:p-16 shadow-xl">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl 2xl:max-w-4xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-400/15 border border-rose-400/30 text-rose-200 text-[11px] font-extrabold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span>SBF SIGNATURE CELEBRATION COMBOS</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl 2xl:text-6xl font-black font-serif tracking-tight leading-tight">
              Flower and Cake Combos in Hyderabad
            </h1>

            <p className="text-xs sm:text-base 2xl:text-lg text-rose-100/90 font-light leading-relaxed">
              Make celebrations memorable with handcrafted flower and cake combos from Spring Blossoms Florist. Breathtaking Dutch flower bouquets paired seamlessly with freshly baked artisan cakes and imported chocolates.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-[11px] sm:text-xs font-semibold text-rose-200/90">
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <Flower2 className="w-3.5 h-3.5 text-rose-300" /> Fresh Dutch Blooms
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <Cake className="w-3.5 h-3.5 text-amber-300" /> Oven-Fresh Artisan Cakes
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <Truck className="w-3.5 h-3.5 text-emerald-300" /> Same-Day Handover
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <Gift className="w-3.5 h-3.5 text-pink-300" /> Free Message Card
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category / Pill Filter Bar */}
      <div className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {COMBO_PILLS.map((pill) => {
            const isSelected = selectedPill === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => handlePillSelect(pill.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 shadow-2xs",
                  isSelected
                    ? "bg-rose-800 text-white shadow-sm ring-2 ring-rose-800/20"
                    : "bg-white text-slate-700 hover:bg-rose-50/80 border border-rose-200/60"
                )}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Sidebar Filters + Products Grid */}
      <div className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 mt-6 pb-20">
        {/* Top Control Bar: Results Count + Search + Sort + Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-rose-100 p-3 sm:p-4 mb-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-black text-slate-900">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Celebration Combo" : "Celebration Combos"} Available
            </span>
            {activeFilterCount > 0 && (
              <Badge className="bg-rose-100 text-rose-900 border-rose-300 text-[10px] py-0.5">
                {activeFilterCount} active
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Inline Quick Search */}
            <div className="relative min-w-[140px] sm:min-w-[180px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search combos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 rounded-xl focus:ring-rose-400"
              />
            </div>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden text-xs gap-1.5 border-rose-200 bg-rose-50/50 text-rose-900 font-bold rounded-xl h-8"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-700" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-700 text-white text-[9px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="hidden sm:inline font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 h-8 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white rounded-3xl border border-rose-100 p-5 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm tracking-wide">
                <Filter className="w-4 h-4 text-rose-700" />
                <span>COMBO FILTERS</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Dietary Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-100 p-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                  🌱 100% Eggless Cakes
                </Label>
                <p className="text-[10px] text-emerald-800/80">Only vegetarian bakery items</p>
              </div>
              <Switch
                checked={egglessOnly}
                onCheckedChange={setEgglessOnly}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>

            {/* Combination Types */}
            <div className="space-y-2.5">
              <Label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-700" />
                <span>Pairing Type</span>
              </Label>
              <div className="space-y-1">
                {COMBINATION_TYPES.map((t) => {
                  const isChecked = selectedComboType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedComboType(t.id)}
                      className={cn(
                        "w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between",
                        isChecked
                          ? "bg-rose-50 text-rose-900 font-bold border border-rose-200"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span>{t.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-rose-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cake Flavor Selection */}
            <div className="space-y-2.5 pt-2 border-t border-rose-100">
              <Label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-amber-600" />
                <span>Cake Flavor in Combo</span>
              </Label>
              <div className="space-y-1">
                {CAKE_FLAVORS.map((f) => {
                  const isChecked = selectedFlavor === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFlavor(f.id)}
                      className={cn(
                        "w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between",
                        isChecked
                          ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span>{f.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5 pt-2 border-t border-rose-100">
              <Label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Price Range
              </Label>
              <div className="space-y-1">
                {PRICE_RANGES.map((r) => {
                  const isChecked = selectedPriceRange === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedPriceRange(r.id)}
                      className={cn(
                        "w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between",
                        isChecked
                          ? "bg-rose-50 text-rose-900 font-bold border border-rose-200"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span>{r.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-rose-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Value Assurance Note */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50 to-white border border-rose-200/80 text-[11px] text-slate-700 space-y-1">
              <div className="font-extrabold text-rose-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Bundle & Save More</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Ordering paired bouquets and cakes saves up to 25% compared to purchasing items individually.
              </p>
            </div>
          </aside>

          {/* Products Grid Area (Matches Cakes Category Standard) */}
          <main className="lg:col-span-3 2xl:col-span-4 3xl:col-span-5">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3.5 sm:gap-5 2xl:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[380px] rounded-2xl bg-white border border-rose-100 animate-pulse p-3.5 flex flex-col justify-between"
                  >
                    <div className="w-full aspect-square bg-rose-50/80 rounded-xl" />
                    <div className="space-y-2 mt-3">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                    </div>
                    <div className="h-8 bg-slate-100 rounded-xl mt-3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-rose-100 shadow-2xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                  <Gift className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    No matching combos found
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    Try adjusting your filters or search keywords to discover more celebration combos.
                  </p>
                </div>
                <Button
                  onClick={handleResetFilters}
                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl px-5 py-2"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              /* Products Grid (2 columns on mobile, 3 columns on tablet/desktop, 4-5 on big screens) */
              <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3.5 sm:gap-5 2xl:gap-6">
                {filteredProducts.map((combo) => (
                  <motion.div
                    key={combo._id || combo.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-full flex flex-col"
                  >
                    <CakeComboCard combo={combo} className="h-full" />
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Trust & Gifting Highlights Strip */}
      <section className="bg-white border-t border-rose-100/80 py-12">
        <div className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-rose-50/40 border border-rose-100/70">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Same-Day Hand Delivery
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Delivered fresh by hand within 2–3 hours across Hyderabad & Secunderabad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/40 border border-amber-100/70">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0">
                <Cake className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  100% Eggless Available
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Baked fresh to order with Belgian chocolate, rich cream, and pure vegetarian recipes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-rose-50/40 border border-rose-100/70">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0">
                <Flower2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Hydration Pack Blooms
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Bouquets travel in specialized floral water reservoirs ensuring peak freshness.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/70">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Free Personalized Note
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every celebration combo includes a custom greeting card penned with your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Information & Combos Guide */}
      <section className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pb-16">
        <div className="bg-white rounded-3xl border border-rose-100/90 p-6 sm:p-10 shadow-xs space-y-10">
          <div className="border-b border-rose-100 pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-serif">
              Shop Flower and Cake Combos
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Why settle for just flowers or just cake when you can double the celebration? At Spring Blossoms Florist, our master florists and pastry chefs pair fresh Dutch roses and lilies with gourmet artisan cakes to create stunning celebration combinations. Each combo is packaged with temperature-preserving care and delivered together seamlessly in Hyderabad &amp; Secunderabad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                Birthday Flower and Cake Gifts
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Celebrate birthdays with our signature pairings: vibrant 10 or 20 Red Rose bouquets coupled with rich Dutch Truffle chocolate cake, or colorful mixed gerbera bouquets with fresh Pineapple cake. Includes a complimentary personalized birthday note card.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                Anniversary Gift Combinations
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Mark your milestone with romantic luxury: 50 long-stem Dutch red roses bundled with velvety Red Velvet cake and imported Ferrero Rocher chocolates. Perfect for unforgettable midnight surprises right at 12:00 AM.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                How to Order a Flower and Cake Combo
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ordering is effortless: select your preferred floral arrangement, pick your cake flavor and weight (0.5 kg or 1 kg, egg or 100% eggless), add your custom message, and choose Daytime Express or Midnight Surprise delivery during checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Slide-Over Filters Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10"
            >
              <div className="p-4 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <Filter className="w-4 h-4 text-rose-700" />
                  <span>FILTER COMBOS</span>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-6">
                {/* Dietary Toggle */}
                <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-100 p-3">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                      🌱 100% Eggless Cakes
                    </Label>
                    <p className="text-[10px] text-emerald-800/80">Only vegetarian bakery items</p>
                  </div>
                  <Switch
                    checked={egglessOnly}
                    onCheckedChange={setEgglessOnly}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>

                {/* Pairing Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-900 uppercase">
                    Pairing Type
                  </Label>
                  <div className="space-y-1">
                    {COMBINATION_TYPES.map((t) => {
                      const isChecked = selectedComboType === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedComboType(t.id)}
                          className={cn(
                            "w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between",
                            isChecked
                              ? "bg-rose-50 text-rose-900 font-bold border border-rose-200"
                              : "text-slate-600"
                          )}
                        >
                          <span>{t.label}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-rose-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cake Flavor */}
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-900 uppercase">
                    Cake Flavor in Combo
                  </Label>
                  <div className="space-y-1">
                    {CAKE_FLAVORS.map((f) => {
                      const isChecked = selectedFlavor === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFlavor(f.id)}
                          className={cn(
                            "w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between",
                            isChecked
                              ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                              : "text-slate-600"
                          )}
                        >
                          <span>{f.label}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-amber-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-900 uppercase">
                    Price Range
                  </Label>
                  <div className="space-y-1">
                    {PRICE_RANGES.map((r) => {
                      const isChecked = selectedPriceRange === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setSelectedPriceRange(r.id)}
                          className={cn(
                            "w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between",
                            isChecked
                              ? "bg-rose-50 text-rose-900 font-bold border border-rose-200"
                              : "text-slate-600"
                          )}
                        >
                          <span>{r.label}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-rose-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-rose-100 flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1 text-xs rounded-xl"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 bg-rose-700 hover:bg-rose-800 text-white text-xs rounded-xl font-bold"
                >
                  Show Results ({filteredProducts.length})
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CombosCategoryPage;
