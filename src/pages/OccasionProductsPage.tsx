import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '@/components/seo/SEOHead';
import { ProductCard } from '@/components/ProductGrid';
import productService, { OccasionData, ProductData } from '@/services/productService';
import api from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Filter, X, ArrowUpDown, ChevronRight, Inbox, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import CategoryResolver from './CategoryResolver';
import { PriceRangeFilterCard, PRICE_FILTER_MIN, PRICE_FILTER_MAX } from './ShopPage';
import { getProductEffectivePrice } from '@/utils/pricing';

export interface OccasionSeoConfig {
  name: string;
  h1: string;
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  keywords: string[];
}

export const OCCASION_SEO_MAP: Record<string, OccasionSeoConfig> = {
  romance: {
    name: 'Romance',
    h1: 'Romantic Flowers & Gifts',
    title: 'Romantic Flowers & Gifts | Spring Blossoms Florist',
    description: 'Express your love with romantic flowers, red rose bouquets, and thoughtful gifts from Spring Blossoms Florist.',
    icon: 'Heart',
    accentColor: '#E11D48',
    keywords: ['romance', 'romantic', 'love', 'rose', 'red rose', 'valentine', 'anniversary'],
  },
  birthday: {
    name: 'Birthday',
    h1: 'Birthday Flowers & Gifts',
    title: 'Birthday Flowers & Gifts | Spring Blossoms Florist',
    description: 'Celebrate birthdays with vibrant flower bouquets, delicious cakes, and curated gift combos from Spring Blossoms Florist.',
    icon: 'Cake',
    accentColor: '#D97706',
    keywords: ['birthday', 'bday', 'cake', 'celebration', 'bouquet'],
  },
  sympathy: {
    name: 'Sympathy',
    h1: 'Sympathy Flowers & Condolence Gifts',
    title: 'Sympathy Flowers & Condolence Gifts | Spring Blossoms Florist',
    description: 'Send peaceful sympathy flowers, white lily arrangements, and condolence gifts with care from Spring Blossoms Florist.',
    icon: 'Flower2',
    accentColor: '#475569',
    keywords: ['sympathy', 'condolence', 'white', 'lily', 'lilies', 'peace', 'memorial'],
  },
  anniversary: {
    name: 'Anniversary',
    h1: 'Anniversary Flowers & Gifts',
    title: 'Anniversary Flowers & Gifts | Spring Blossoms Florist',
    description: 'Mark special milestones with anniversary flowers, luxury rose bouquets, cakes, and gift hampers from Spring Blossoms Florist.',
    icon: 'Sparkles',
    accentColor: '#BE123C',
    keywords: ['anniversary', 'romance', 'rose', 'combo', 'couple', 'celebration'],
  },
  'get-well-soon': {
    name: 'Get Well Soon',
    h1: 'Get Well Soon Flowers & Gifts',
    title: 'Get Well Soon Flowers & Gifts | Spring Blossoms Florist',
    description: 'Brighten their recovery with cheerful get well soon flowers, fresh bouquets, and thoughtful gifts from Spring Blossoms Florist.',
    icon: 'Sun',
    accentColor: '#059669',
    keywords: ['get well', 'get-well-soon', 'recovery', 'cheerful', 'yellow', 'sunflower', 'plant', 'basket'],
  },
  congratulations: {
    name: 'Congratulations',
    h1: 'Congratulations Flowers & Gifts',
    title: 'Congratulations Flowers & Gifts | Spring Blossoms Florist',
    description: 'Celebrate achievements and milestones with congratulations flowers, bouquets, and gift hampers from Spring Blossoms Florist.',
    icon: 'Award',
    accentColor: '#7C3AED',
    keywords: ['congratulations', 'congrats', 'success', 'achievement', 'bouquet', 'combo'],
  },
};

const formatSlugLabel = (rawSlug?: string): string => {
  if (!rawSlug) return 'Occasions';
  return rawSlug
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const OccasionProductsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatPrice } = useCurrency();

  const normalizedSlug = (slug || '').trim().toLowerCase();
  const isExplicitOccasionPath = location.pathname.toLowerCase().startsWith('/occasions');
  const staticOccasionConfig = normalizedSlug ? OCCASION_SEO_MAP[normalizedSlug] : undefined;
  const isKnownOccasion = Boolean(isExplicitOccasionPath || staticOccasionConfig);

  const [occasion, setOccasion] = useState<OccasionData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(Boolean(normalizedSlug));
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [sortOption, setSortOption] = useState<string>('featured');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_FILTER_MIN, PRICE_FILTER_MAX]);
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isDesktopPriceOpen, setIsDesktopPriceOpen] = useState(true);
  const [isMobilePriceOpen, setIsMobilePriceOpen] = useState(true);

  useEffect(() => {
    if (!normalizedSlug) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadOccasionData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductsByOccasion(normalizedSlug);
        if (!isMounted) return;
        setOccasion(data.occasion);
        setProducts(data.products || []);
      } catch (err: any) {
        console.error('Error fetching occasion products:', err);
        if (!isMounted) return;

        // If this is a known occasion route (/occasions/* or in OCCASION_SEO_MAP), try fallback product matching
        if (isKnownOccasion) {
          try {
            const res = await api.get('/products');
            if (!isMounted) return;
            const allProducts: ProductData[] = res.data?.products || (Array.isArray(res.data) ? res.data : []);
            const keywords = staticOccasionConfig?.keywords || [normalizedSlug.replace(/-/g, ' ')];
            const matched = allProducts.filter((p: any) => {
              const haystack = [
                p.title,
                p.name,
                p.description,
                p.category,
                ...(Array.isArray(p.categories) ? p.categories : []),
                ...(Array.isArray(p.occasions) ? p.occasions : []),
                ...(Array.isArray(p.tags) ? p.tags : []),
              ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
              return keywords.some(kw => haystack.includes(kw.toLowerCase()));
            });
            setProducts(matched.length > 0 ? matched : allProducts.slice(0, 12));
          } catch (_) {
            setProducts([]);
          }
        } else {
          setError(err.response?.data?.message || 'Failed to load products for this occasion');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOccasionData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [normalizedSlug, isKnownOccasion, staticOccasionConfig]);

  // Extract all unique categories/types available in these products to build filters
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach(p => {
      if (p.category) types.add(p.category);
    });
    return Array.from(types);
  }, [products]);

  // Filter & Sort logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by type/category
    if (selectedSubcategories.length > 0) {
      result = result.filter(p => selectedSubcategories.includes(p.category));
    }

    // Filter by delivery speed
    if (sameDayOnly) {
      result = result.filter(p => p.sameDay !== false);
    }

    // Filter by price (accounting for currency conversions)
    result = result.filter(p => {
      const discountedPrice = getProductEffectivePrice(p);
      return discountedPrice >= priceRange[0] && discountedPrice <= priceRange[1];
    });

    // Sort options
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => {
          const priceA = getProductEffectivePrice(a);
          const priceB = getProductEffectivePrice(b);
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const priceA = getProductEffectivePrice(a);
          const priceB = getProductEffectivePrice(b);
          return priceB - priceA;
        });
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'featured':
      default:
        break;
    }

    return result;
  }, [products, selectedSubcategories, sameDayOnly, priceRange, sortOption]);

  const handleSubcategoryToggle = (type: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSelectedSubcategories([]);
    setPriceRange([PRICE_FILTER_MIN, PRICE_FILTER_MAX]);
    setSameDayOnly(false);
    setSortOption('featured');
  };

  // For root-level /:slug routes that are NOT known occasions, wait for API or delegate to CategoryResolver
  if (!isKnownOccasion) {
    if (loading) {
      return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-slate-500 font-medium">Loading collection...</p>
        </div>
      );
    }
    if (error || !occasion) {
      return <CategoryResolver />;
    }
  }

  // Handle /occasions index hub when no slug is provided
  if (!normalizedSlug) {
    return (
      <div className="bg-slate-50/30 min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SEOHead
          title="Shop Flowers & Gifts by Occasion | Spring Blossoms Florist"
          description="Explore handcrafted flower bouquets, cakes, and gift hampers for every occasion including birthdays, anniversaries, romance, sympathy, and congratulations."
          canonical="/occasions"
        />
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Shop Flowers &amp; Gifts by Occasion
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Celebrate life&apos;s meaningful moments with fresh flowers, artisan cakes, and thoughtful gifts curated for every occasion.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(OCCASION_SEO_MAP).map(([occSlug, cfg]) => (
            <Link
              key={occSlug}
              to={`/occasions/${occSlug}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-2">
                  {cfg.h1}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">{cfg.description}</p>
              </div>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-rose-600">
                Explore {cfg.name} Collection <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const displayName = staticOccasionConfig?.name || occasion?.name || formatSlugLabel(normalizedSlug);
  const headingText = staticOccasionConfig?.h1 || (occasion?.name ? `${occasion.name} Flowers & Gifts` : `${displayName} Flowers & Gifts`);
  const seoTitle = staticOccasionConfig?.title || occasion?.seoTitle || `${headingText} | Spring Blossoms Florist`;
  const seoDesc =
    staticOccasionConfig?.description ||
    occasion?.seoDescription ||
    `Explore handcrafted flowers, bouquets, cakes, and gift sets for ${displayName} at Spring Blossoms Florist.`;
  const canonicalPath = isExplicitOccasionPath || staticOccasionConfig ? `/occasions/${normalizedSlug}` : `/${normalizedSlug}`;
  const accentColor = occasion?.accentColor || staticOccasionConfig?.accentColor || '#D4AF37';
  const iconName = occasion?.icon || staticOccasionConfig?.icon || 'Sparkles';
  const bannerUrl = occasion?.banner;

  return (
    <div className="bg-slate-50/30 min-h-screen">
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        canonical={canonicalPath}
        ogImage={occasion?.thumbnail}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Occasions', item: '/occasions' },
          { name: displayName, item: canonicalPath },
        ]}
      />

      {/* Breadcrumb Nav */}
      <div className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/shop')}>Occasions</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-800">{displayName}</span>
        </nav>
      </div>

      {/* Occasion Page Banner Hero */}
      <div className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 mt-5">
        <div
          className="relative rounded-2xl overflow-hidden min-h-[220px] md:min-h-[300px] flex items-center justify-center p-6 bg-gradient-to-r from-bloom-pink-500/20 via-rose-500/5 to-amber-500/10 border border-slate-100 shadow-sm"
          style={{
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {bannerUrl && <div className="absolute inset-0 bg-black/35 z-10" />}

          <div className={cn(
            "relative z-20 text-center max-w-2xl px-4",
            bannerUrl ? "text-white" : "text-slate-900"
          )}>
            <div
              className={cn(
                "inline-flex p-3 rounded-full mx-auto shadow-inner mb-3.5",
                bannerUrl ? "bg-white/10 backdrop-blur-md text-white" : "bg-white text-slate-850"
              )}
            >
              {React.createElement((LucideIcons as any)[iconName] || Sparkles, {
                className: "h-6 w-6",
                style: { color: bannerUrl ? '#FFFFFF' : accentColor }
              })}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">{headingText}</h1>
            <p className={cn(
              "text-xs sm:text-sm md:text-base mt-2.5 max-w-xl mx-auto font-medium",
              bannerUrl ? "text-slate-200" : "text-slate-600"
            )}>
              {seoDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Filter Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 hidden lg:block space-y-6">
            <CardFilters
              uniqueTypes={uniqueTypes}
              selectedSubcategories={selectedSubcategories}
              handleSubcategoryToggle={handleSubcategoryToggle}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sameDayOnly={sameDayOnly}
              setSameDayOnly={setSameDayOnly}
              handleClearFilters={handleClearFilters}
              formatPrice={formatPrice}
              isPriceOpen={isDesktopPriceOpen}
              setIsPriceOpen={setIsDesktopPriceOpen}
            />
          </aside>

          {/* Grid Area */}
          <div className="flex-1 space-y-6">
            {/* Sorting and Mobile Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                Showing <span className="text-slate-900 font-bold">{filteredAndSortedProducts.length}</span> products
              </span>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden h-9 text-xs flex items-center gap-1.5 border-slate-200"
                >
                  <Filter className="h-3.5 w-3.5" /> Filters
                </Button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value)}
                    className="h-9 text-xs border rounded-md px-2.5 bg-white font-semibold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">New Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={`occ-skel-${idx}`}
                    className="h-80 rounded-2xl bg-white border border-slate-100 p-4 animate-pulse space-y-3"
                  >
                    <div className="w-full h-44 bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border rounded-2xl p-6 text-center gap-3">
                <Inbox className="h-10 w-10 text-slate-350" />
                <h3 className="font-semibold text-lg text-slate-800">No Matching Gifts</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Try clearing your filters or widening your budget price range to find items.
                </p>
                <Button onClick={handleClearFilters} size="sm" className="bg-slate-900 text-white font-semibold mt-1">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 md:gap-5 2xl:gap-6">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard key={product._id} product={product as any} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet/Drawer Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileFiltersOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="relative z-10 w-full max-w-xs h-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="font-black text-lg text-slate-950 flex items-center gap-1.5">
                  <Filter className="h-4.5 w-4.5" /> Filter Options
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="py-6 space-y-6">
                <CardFilters
                  uniqueTypes={uniqueTypes}
                  selectedSubcategories={selectedSubcategories}
                  handleSubcategoryToggle={handleSubcategoryToggle}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sameDayOnly={sameDayOnly}
                  setSameDayOnly={setSameDayOnly}
                  handleClearFilters={handleClearFilters}
                  formatPrice={formatPrice}
                  isPriceOpen={isMobilePriceOpen}
                  setIsPriceOpen={setIsMobilePriceOpen}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Button onClick={() => setMobileFiltersOpen(false)} className="w-full bg-slate-900 text-white font-bold h-11">
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Sub-component for filters fields (keeps layouts DRY)
const CardFilters = ({
  uniqueTypes,
  selectedSubcategories,
  handleSubcategoryToggle,
  priceRange,
  setPriceRange,
  sameDayOnly,
  setSameDayOnly,
  handleClearFilters,
  isPriceOpen,
  setIsPriceOpen
}: {
  uniqueTypes: string[];
  selectedSubcategories: string[];
  handleSubcategoryToggle: (type: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sameDayOnly: boolean;
  setSameDayOnly: (val: boolean) => void;
  handleClearFilters: () => void;
  formatPrice: (price: number) => string;
  isPriceOpen: boolean;
  setIsPriceOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="space-y-6">
      {/* Clear Filters Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">Filters</h3>
        {(selectedSubcategories.length > 0 || sameDayOnly || priceRange[0] > PRICE_FILTER_MIN || priceRange[1] < PRICE_FILTER_MAX) && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-0.5"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Delivery Speed */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Delivery Speed</h4>
        <div className="flex items-center gap-2">
          <Checkbox
            id="same-day"
            checked={sameDayOnly}
            onCheckedChange={checked => setSameDayOnly(Boolean(checked))}
          />
          <Label htmlFor="same-day" className="text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            Same Day Delivery
          </Label>
        </div>
      </div>

      {/* Filter by Category/Gifting Type */}
      {uniqueTypes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Gift Category</h4>
          <div className="flex flex-col gap-2.5">
            {uniqueTypes.map(type => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedSubcategories.includes(type)}
                  onCheckedChange={() => handleSubcategoryToggle(type)}
                />
                <Label htmlFor={`type-${type}`} className="text-xs font-semibold text-slate-700 capitalize cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Slider */}
      <PriceRangeFilterCard
        isOpen={isPriceOpen}
        onToggle={() => setIsPriceOpen(prev => !prev)}
        minValue={priceRange[0]}
        maxValue={priceRange[1]}
        onMinChange={minVal => setPriceRange([minVal, priceRange[1]])}
        onMaxChange={maxVal => setPriceRange([priceRange[0], maxVal])}
      />
    </div>
  );
};

export default OccasionProductsPage;
