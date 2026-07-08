import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductGrid';
import productService, { OccasionData, ProductData } from '@/services/productService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Filter, X, ArrowUpDown, ChevronRight, HelpCircle, Inbox, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRIMARY_CATEGORIES } from '@/utils/categoryTaxonomy';
import CategoryResolver from './CategoryResolver';

export const OccasionProductsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { formatPrice, convertPrice } = useCurrency();

  const [occasion, setOccasion] = useState<OccasionData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [sortOption, setSortOption] = useState<string>('featured');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    const loadOccasionData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductsByOccasion(slug);
        setOccasion(data.occasion);
        setProducts(data.products || []);
      } catch (err: any) {
        console.error('Error fetching occasion products:', err);
        setError(err.response?.data?.message || 'Failed to load products for this occasion');
      } finally {
        setLoading(false);
      }
    };

    loadOccasionData();
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

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
      const discountedPrice = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
      return discountedPrice >= priceRange[0] && discountedPrice <= priceRange[1];
    });

    // Sort options
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => {
          const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
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
        // Featured products first
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
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
    setPriceRange([0, 5000]);
    setSameDayOnly(false);
    setSortOption('featured');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-slate-500 font-medium">Curating gifts for your celebration...</p>
      </div>
    );
  }

  if (error || !occasion) {
    return <CategoryResolver />;
  }

  const seoTitle = occasion.seoTitle || `${occasion.name} Gifts Delivery | Online Gift Shop - SBFlorist`;
  const seoDesc = occasion.seoDescription || `Send the finest customized gift sets, fresh flowers, and celebration cakes tagged under ${occasion.name}. Same-day and midnight delivery guaranteed.`;
  const accentColor = occasion.accentColor || '#D4AF37';

  return (
    <div className="bg-slate-50/30 min-h-screen">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {occasion.thumbnail && <meta property="og:image" content={occasion.thumbnail} />}
      </Helmet>

      {/* Breadcrumb Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/shop')}>Occasions</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-800">{occasion.name}</span>
        </nav>
      </div>

      {/* Occasion Page Banner Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div 
          className="relative rounded-2xl overflow-hidden min-h-[220px] md:min-h-[300px] flex items-center justify-center p-6 bg-gradient-to-r from-bloom-pink-500/20 via-rose-500/5 to-amber-500/10 border border-slate-100 shadow-sm"
          style={{
            backgroundImage: occasion.banner ? `url(${occasion.banner})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {occasion.banner && <div className="absolute inset-0 bg-black/35 z-10" />}

          <div className={cn(
            "relative z-20 text-center max-w-2xl px-4",
            occasion.banner ? "text-white" : "text-slate-900"
          )}>
            <div 
              className={cn(
                "inline-flex p-3 rounded-full mx-auto shadow-inner mb-3.5",
                occasion.banner ? "bg-white/10 backdrop-blur-md text-white" : "bg-white text-slate-850"
              )}
            >
              {/* Dynamic Lucide Icon */}
              {React.createElement((LucideIcons as any)[occasion.icon] || Sparkles, {
                className: "h-6 w-6",
                style: { color: occasion.banner ? '#FFFFFF' : accentColor }
              })}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">{occasion.name} Collection</h1>
            <p className={cn(
              "text-xs sm:text-sm md:text-base mt-2.5 max-w-xl mx-auto font-medium",
              occasion.banner ? "text-slate-200" : "text-slate-500"
            )}>
              {occasion.seoDescription || `Discover the finest gifts, flowers, cakes and luxury packages handpicked and curated specially for ${occasion.name}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
            {filteredAndSortedProducts.length === 0 ? (
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
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
  formatPrice
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
}) => {
  return (
    <div className="space-y-6">
      {/* Clear Filters Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">Filters</h3>
        {(selectedSubcategories.length > 0 || sameDayOnly || priceRange[0] > 0 || priceRange[1] < 5000) && (
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
      <div className="space-y-3.5">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Price Range</h4>
        <div className="px-1.5">
          <Slider
            min={0}
            max={5000}
            step={100}
            value={[priceRange[0], priceRange[1]]}
            onValueChange={val => setPriceRange([val[0], val[1]])}
            className="my-4"
          />
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
