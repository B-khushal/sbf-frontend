import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cake,
  Filter,
  X,
  Sparkles,
  ChevronRight,
  ArrowUpDown,
  Gift,
  Scale,
  Check,
  RotateCcw,
  Star,
  SlidersHorizontal
} from "lucide-react";
import api from "@/services/api";
import { CakeProductCard } from "@/components/cakes/CakeProductCard";
import { CakeComboCard } from "@/components/cakes/CakeComboCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

const FLAVOR_CATEGORIES = [
  { id: "all", label: "All Cakes", icon: "🎂" },
  { id: "chocolate", label: "Chocolate", icon: "🍫" },
  { id: "red-velvet", label: "Red Velvet", icon: "❤️" },
  { id: "black-forest", label: "Black Forest", icon: "🍒" },
  { id: "fruit", label: "Fruit & Pineapple", icon: "🍍" },
  { id: "butterscotch", label: "Butterscotch", icon: "🍯" },
  { id: "premium", label: "Premium Celebration", icon: "✨" },
  { id: "combos", label: "Combos", icon: "🎁" }
];

const WEIGHT_OPTIONS = [
  { id: "half-kg", label: "½ KG", value: "0.5" },
  { id: "one-kg", label: "1 KG", value: "1" },
  { id: "one-half-kg", label: "1.5 KG", value: "1.5" },
  { id: "two-kg-plus", label: "2 KG+", value: "2" }
];

const PRICE_RANGES = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-500", label: "Under ₹500", min: 0, max: 500 },
  { id: "500-1000", label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { id: "1000-2000", label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { id: "2000-plus", label: "₹2,000+", min: 2000, max: Infinity }
];

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Customer Rating" },
  { id: "newest", label: "New Arrivals" }
];

export const CakesCategoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice, convertPrice } = useCurrency();

  // Raw data from database
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filters
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [egglessOnly, setEgglessOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Sync category param with URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat.toLowerCase());
    }
  }, [searchParams]);

  // Fetch cakes directly from the database API
  useEffect(() => {
    let isMounted = true;
    const loadCakes = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products", {
          params: { category: "cakes" }
        });

        const rawList = res.data?.products || (Array.isArray(res.data) ? res.data : []);
        if (isMounted) {
          setProducts(rawList);
        }
      } catch (err) {
        console.error("Error loading cakes from API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCakes();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Flavor / Category filter
    if (selectedCategory && selectedCategory !== "all") {
      list = list.filter((p) => {
        const catStr = (
          p.category + " " +
          (p.subcategory || "") + " " +
          (Array.isArray(p.categories) ? p.categories.join(" ") : "") + " " +
          (p.name || p.title || "") + " " +
          (p.cakeAttributes?.flavor || "")
        ).toLowerCase();

        if (selectedCategory === "combos") {
          return (
            p.catalogType === "combo" ||
            p.category === "combos" ||
            catStr.includes("combo")
          );
        }

        if (selectedCategory === "chocolate") return catStr.includes("chocolate") || catStr.includes("truffle");
        if (selectedCategory === "red-velvet") return catStr.includes("red velvet") || catStr.includes("red-velvet");
        if (selectedCategory === "black-forest") return catStr.includes("black forest") || catStr.includes("black-forest");
        if (selectedCategory === "fruit") return catStr.includes("fruit") || catStr.includes("pineapple") || catStr.includes("strawberry");
        if (selectedCategory === "butterscotch") return catStr.includes("butterscotch") || catStr.includes("caramel");
        if (selectedCategory === "premium") return catStr.includes("opera") || catStr.includes("celebration") || p.isFeatured;

        return catStr.includes(selectedCategory);
      });
    }

    // 2. Weight filter
    if (selectedWeights.length > 0) {
      list = list.filter((p) => {
        const availableSizes = p.cakeAttributes?.availableSizes || [];
        const variantSizes = (p.priceVariants || []).map((v: any) => v.size || v.name || v.label);
        const allSizes = [...availableSizes, ...variantSizes, p.cakeAttributes?.weight].map(
          (s) => String(s || "").toLowerCase()
        );

        return selectedWeights.some((w) => {
          if (w === "half-kg") return allSizes.some((s) => s.includes("0.5") || s.includes("½") || s.includes("half"));
          if (w === "one-kg") return allSizes.some((s) => s.includes("1 kg") || s === "1kg");
          if (w === "one-half-kg") return allSizes.some((s) => s.includes("1.5") || s.includes("one and half"));
          if (w === "two-kg-plus") return allSizes.some((s) => s.includes("2 kg") || s.includes("2kg") || s.includes("3") || s.includes("4"));
          return false;
        });
      });
    }

    // 3. Price filter
    if (selectedPriceRange !== "all") {
      const targetRange = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (targetRange) {
        list = list.filter((p) => {
          const price = Number(p.price || 0);
          return price >= targetRange.min && price <= targetRange.max;
        });
      }
    }

    // 4. Eggless only filter
    if (egglessOnly) {
      list = list.filter((p) => p.cakeAttributes?.eggless !== false);
    }

    // 5. Sorting
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
  }, [products, selectedCategory, selectedWeights, selectedPriceRange, egglessOnly, sortBy]);

  // Separate Combos for dedicated subsection
  const comboProducts = useMemo(() => {
    return products.filter((p) =>
      p.catalogType === "combo" ||
      p.category === "combos" ||
      p.subcategory?.includes("combo") ||
      (Array.isArray(p.categories) && p.categories.some((c: string) => c.includes("combo")))
    );
  }, [products]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catId);
    }
    setSearchParams(searchParams);
  };

  const handleWeightToggle = (weightId: string) => {
    setSelectedWeights((prev) =>
      prev.includes(weightId) ? prev.filter((w) => w !== weightId) : [...prev, weightId]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedWeights([]);
    setSelectedPriceRange("all");
    setEgglessOnly(false);
    setSortBy("featured");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    selectedWeights.length +
    (selectedPriceRange !== "all" ? 1 : 0) +
    (egglessOnly ? 1 : 0);

  // SEO Schema
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Premium Cakes Online | Spring Blossoms Florist",
    description:
      "Order freshly crafted cakes online from Spring Blossoms Florist. Choose from chocolate, red velvet, black forest, pineapple, butterscotch cakes and premium cake & flower combos.",
    url: "https://sbflorist.in/cakes",
    hasPart: filteredProducts.slice(0, 10).map((prod) => ({
      "@type": "Product",
      name: prod.name || prod.title,
      description: prod.shortDescription || prod.description,
      image: prod.images?.[0] || prod.image,
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: prod.price,
        availability: prod.isAvailable !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    }))
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      <Helmet>
        <title>Premium Cakes Online | Spring Blossoms Florist</title>
        <meta
          name="description"
          content="Order freshly crafted cakes online from Spring Blossoms Florist. Choose from chocolate, red velvet, black forest, pineapple, butterscotch cakes and premium cake & flower combos."
        />
        <meta name="keywords" content="Cakes in Hyderabad, Fresh Cakes Online, Birthday Cakes Hyderabad, Red Velvet Cake, Black Forest Cake, Cake Flower Combo, Same Day Cake Delivery" />
        <link rel="canonical" href="https://sbflorist.in/cakes" />
        <meta property="og:title" content="Premium Cakes Online | Spring Blossoms Florist" />
        <meta property="og:description" content="Order freshly crafted cakes and celebration combos with same-day delivery across Hyderabad." />
        <meta property="og:url" content="https://sbflorist.in/cakes" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-amber-900 font-bold">Cakes</span>
          {selectedCategory !== "all" && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-slate-800 capitalize">{selectedCategory.replace(/-/g, " ")}</span>
            </>
          )}
        </nav>
      </div>

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white p-6 sm:p-10 md:p-14 shadow-lg">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-60 h-60 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 text-[11px] font-extrabold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SBF ARTISAN PATISSERIE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight leading-tight">
              Cakes, Made for Every Celebration
            </h1>

            <p className="text-xs sm:text-base text-amber-100/90 font-light leading-relaxed">
              Freshly crafted cakes to make every special moment a little sweeter. Baked with European dark cocoa, fresh churned cream, and hand-selected berries.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] sm:text-xs font-semibold text-amber-200/80">
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                ✓ 100% Eggless Available
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                ✓ Same-Day Express Delivery
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                ✓ Baked Fresh to Order
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category / Flavor Filter Pills Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {FLAVOR_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 shadow-2xs",
                  isSelected
                    ? "bg-amber-800 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-amber-50/80 border border-amber-200/60"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Sidebar Filters + Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        {/* Top Control Bar: Results Count + Sort + Mobile Filter Trigger */}
        <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-amber-100/80 p-3 sm:p-4 mb-6 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Cake" : "Cakes"} Available
            </span>
            {activeFilterCount > 0 && (
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] py-0.5">
                {activeFilterCount} active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden text-xs gap-1.5 border-amber-200 bg-amber-50/50 text-amber-900 font-bold rounded-xl"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[9px] flex items-center justify-center font-bold">
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
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 cursor-pointer"
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white rounded-3xl border border-amber-100/80 p-5 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm tracking-wide">
                <Filter className="w-4 h-4 text-amber-700" />
                <span>FILTERS</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
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
                  🌱 100% Eggless
                </Label>
                <p className="text-[10px] text-emerald-800/80">Only pure vegetarian cakes</p>
              </div>
              <Switch
                checked={egglessOnly}
                onCheckedChange={setEgglessOnly}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>

            {/* Weight Filter */}
            <div className="space-y-2.5">
              <Label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                <span>Weight / Size</span>
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {WEIGHT_OPTIONS.map((w) => {
                  const isChecked = selectedWeights.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleWeightToggle(w.id)}
                      className={cn(
                        "text-xs font-bold px-3 py-2 rounded-xl transition-all border text-center flex items-center justify-between",
                        isChecked
                          ? "bg-amber-700 text-white border-amber-700 shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-amber-50/70 border-slate-200/70"
                      )}
                    >
                      <span>{w.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5 pt-2 border-t border-amber-100">
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
                          ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span>{r.label}</span>
                      {isChecked && <Check className="w-3 h-3 text-amber-700" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`skel-${idx}`}
                    className="h-80 rounded-2xl bg-white border border-amber-100 p-4 animate-pulse space-y-3"
                  >
                    <div className="w-full h-44 bg-amber-50 rounded-xl" />
                    <div className="h-4 bg-amber-100 rounded w-3/4" />
                    <div className="h-3 bg-amber-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
                {filteredProducts.map((cake) => (
                  <CakeProductCard key={cake._id || cake.id} product={cake} className="h-full" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-amber-100 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <Cake className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No cakes found matching your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing some filters or searching for another flavor to explore our full patisserie collection.
                </p>
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="rounded-xl border-amber-300 text-amber-900 font-bold text-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            )}

            {/* Combos Highlight Section (if not currently filtering exclusively to single cakes) */}
            {comboProducts.length > 0 && selectedCategory !== "combos" && (
              <div className="mt-14 pt-10 border-t border-amber-200/60 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 block">
                      Recommended Pairings
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                      Cake + Flower Combos
                    </h2>
                  </div>
                  <Link
                    to="/cakes?category=combos"
                    className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {comboProducts.slice(0, 3).map((combo) => (
                    <CakeComboCard key={combo._id || combo.id} combo={combo} className="h-full" />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col z-10 shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                  <span>FILTER CAKES</span>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-6">
                {/* 100% Eggless */}
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <span className="text-xs font-bold text-emerald-900">🌱 100% Eggless Only</span>
                  <Switch checked={egglessOnly} onCheckedChange={setEgglessOnly} />
                </div>

                {/* Weight Options */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-900">Weight / Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {WEIGHT_OPTIONS.map((w) => {
                      const isChecked = selectedWeights.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => handleWeightToggle(w.id)}
                          className={cn(
                            "text-xs font-bold p-2.5 rounded-xl border text-center",
                            isChecked
                              ? "bg-amber-700 text-white border-amber-700"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          )}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Options */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-900">Price Range</Label>
                  <div className="space-y-1">
                    {PRICE_RANGES.map((r) => {
                      const isChecked = selectedPriceRange === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedPriceRange(r.id)}
                          className={cn(
                            "w-full text-left text-xs font-semibold p-2.5 rounded-xl border flex items-center justify-between",
                            isChecked
                              ? "bg-amber-50 text-amber-900 border-amber-200 font-bold"
                              : "bg-white text-slate-700 border-slate-100"
                          )}
                        >
                          <span>{r.label}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-amber-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1 rounded-xl text-xs font-bold"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white"
                >
                  Show {filteredProducts.length} Results
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CakesCategoryPage;
