import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles, Filter, SlidersHorizontal, Check, Calendar, Tag, Info, Search, X, RotateCcw } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

import { useValentine } from '@/contexts/ValentineContext';
import { useAuth } from '@/hooks/use-auth';
import { promptLoginForAddToCart } from '@/utils/cartAuthHelper';
import useCart from '@/hooks/use-cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import api from '@/services/api';

import FloatingPetals from '@/components/valentine/FloatingPetals';
import ValentineCountdown from '@/components/valentine/ValentineCountdown';
import ValentineSeoEditorialSection from '@/components/valentine/ValentineSeoEditorialSection';
import { getValentineWeekDays } from '@/utils/valentineCalendar';
import '@/components/valentine/valentine.css';
import ProtectedImage from '@/components/ui/ProtectedImage';

import type { ValentineProduct } from '@/types/valentine';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
} as const;

// Dynamic Valentine Days calculation
const dynamicWeekDays = getValentineWeekDays();
const VALENTINE_DAYS = [
  { slug: 'all', label: 'All Days', short: 'All Days' },
  ...dynamicWeekDays.map((d) => ({
    slug: d.id,
    label: `${d.icon} ${d.name} (${d.dayNumber} Feb)`,
    short: `${d.name} (${d.dayNumber} Feb)`
  }))
];

const PRESET_CATEGORIES = [
  { slug: 'all', name: 'All Categories' },
  { slug: 'roses', name: 'Roses' },
  { slug: 'bouquets', name: 'Romantic Bouquets' },
  { slug: 'cakes', name: 'Cakes' },
  { slug: 'combos', name: 'Combos & Hampers' },
  { slug: 'chocolates', name: 'Chocolates' },
  { slug: 'plants', name: 'Lucky Plants' }
];

const ValentineShopPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isValentineEnabled, settings, offers, loading: contextLoading } = useValentine();
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState<ValentineProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>(searchParams.get('day') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Fetch Valentine products from dynamic endpoint
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await api.get('/valentine/products?limit=250');
        setProducts(response.data.products || []);
      } catch (err) {
        console.error('Error fetching Valentine products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    if (isValentineEnabled) {
      fetchProducts();
    }
  }, [isValentineEnabled]);

  // Sync state with URL params
  useEffect(() => {
    const day = searchParams.get('day');
    const cat = searchParams.get('category');
    if (day) setSelectedDay(day);
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Categories list
  const valentineCategories = useMemo(() => {
    if (settings?.categories && settings.categories.length > 0) {
      return [{ slug: 'all', name: 'All Categories' }, ...settings.categories.filter((c) => c.enabled)];
    }
    return PRESET_CATEGORIES;
  }, [settings]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const title = (p.title || (p as any).name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    // Filter by day
    if (selectedDay !== 'all') {
      filtered = filtered.filter((p) => {
        if (p.valentineDate === selectedDay) return true;
        if (p.availableDates && p.availableDates.includes(selectedDay)) return true;
        // Thematic day fallback
        const name = (p.title || (p as any).name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        if (selectedDay === 'rose-day') return /rose/i.test(name || cat);
        if (selectedDay === 'chocolate-day') return /chocolate/i.test(name || cat);
        if (selectedDay === 'teddy-day') return /teddy|hamper/i.test(name || cat);
        return false;
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const cleanTarget = selectedCategory.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter((p) => {
        const prodCat = (p.valentineCategory || p.category || '').toLowerCase();
        if (prodCat.includes(cleanTarget)) return true;

        if (p.valentineCategories && p.valentineCategories.length > 0) {
          return p.valentineCategories.some((cat) => cat.toLowerCase().includes(cleanTarget));
        }

        const name = (p.title || (p as any).name || '').toLowerCase();
        return name.includes(cleanTarget);
      });
    }

    // Filter by price
    filtered = filtered.filter((p) => (p.price || 0) <= priceRange);

    // Sort products
    if (sortBy === 'featured') {
      filtered.sort((a, b) => {
        const isBestA = (a as any).isBestseller ? 2 : 0;
        const isBestB = (b as any).isBestseller ? 2 : 0;
        const isFeatA = a.isFeatured ? 1 : 0;
        const isFeatB = b.isFeatured ? 1 : 0;
        return (isBestB + isFeatB) - (isBestA + isFeatA);
      });
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return filtered;
  }, [products, searchQuery, selectedDay, selectedCategory, priceRange, sortBy]);

  const updateFilters = (day: string, cat: string) => {
    const params: Record<string, string> = {};
    if (day !== 'all') params.day = day;
    if (cat !== 'all') params.category = cat;
    setSearchParams(params);
    setSelectedDay(day);
    setSelectedCategory(cat);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDay('all');
    setSelectedCategory('all');
    setPriceRange(10000);
    setSortBy('featured');
    setSearchParams({});
  };

  const handleAddToCart = async (product: ValentineProduct) => {
    try {
      setAddingToCartId(product._id);
      
      const cartItem = {
        _id: product._id,
        id: product._id,
        productId: product._id,
        title: product.title || (product as any).name,
        price: product.price,
        originalPrice: product.price,
        image: product.images?.[0] || product.image || '',
        images: product.images || [],
        quantity: 1,
        category: product.category || '',
        discount: product.discount || 0,
        description: product.description || '',
        careInstructions: product.careInstructions || [],
        isNewArrival: Boolean(product.isNewArrival),
        isFeatured: Boolean(product.isFeatured),
        productType: 'valentine' as const,
        isValentineProduct: true,
        availableDates: product.availableDates || [],
      };

      if (!user) {
        promptLoginForAddToCart(navigate, cartItem, window.location.pathname + window.location.search);
        return;
      }

      await addToCart(cartItem);
      
      setTimeout(() => {
        navigate('/cart');
      }, 300);
    } catch (err) {
      console.error('Error adding Valentine product to cart:', err);
    } finally {
      setAddingToCartId(null);
    }
  };

  // Master Switch Preservation
  if (!contextLoading && !isValentineEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50">
        <SEOHead
          title="Valentine's Day Gifts & Flowers Online | SBFlorist Hyderabad"
          description="Celebrate love with romantic rose bouquets, beautiful flowers, cakes and Valentine's Day gift combos from Spring Blossoms Florist. Explore Valentine's gifts online."
          canonical="/valentine-shop"
          keywords="Valentine's Day Gifts, Valentine's Day Gifts Online, Valentine's Day Flowers, Valentine's Day Gifts Hyderabad, Valentine's Day Gift Delivery, Valentine's Day Rose Bouquet, Romantic Valentine's Day Gifts, Valentine's Day Cake and Flower Combos"
          ogImage="https://sbflorist.in/images/hero-flower-shop.jpg"
        />
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
          <Heart className="w-14 h-14 text-rose-500 mx-auto mb-4 fill-rose-500 animate-pulse" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-serif mb-4">
            Valentine's Day Gifts
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Explore romantic red roses, sweet heart cakes, and luxury gift hampers handcrafted for love celebrations throughout the year.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/roses" className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-sm text-sm">
              Explore Rose Bouquets &rarr;
            </Link>
            <Link to="/combos" className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition-colors text-sm">
              Flower &amp; Cake Combos
            </Link>
          </div>
        </div>

        <ValentineSeoEditorialSection isOffSeason={true} />
      </div>
    );
  }

  if (contextLoading || (productsLoading && products.length === 0)) {
    return (
      <div className="min-h-screen bg-[#54081c] flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4 valentine-heart-pulse" />
          <p className="text-rose-200/70 text-lg">Unveiling romantic selections...</p>
        </div>
      </div>
    );
  }

  const seo = settings?.seo;
  const hasActiveFilters = searchQuery.trim() !== '' || selectedDay !== 'all' || selectedCategory !== 'all' || priceRange < 10000;

  return (
    <>
      <SEOHead
        title={seo?.metaTitle || "Valentine's Day Gifts & Flowers Online | SBFlorist Hyderabad"}
        description={seo?.metaDescription || "Celebrate love with romantic rose bouquets, beautiful flowers, cakes and Valentine's Day gift combos from Spring Blossoms Florist. Explore Valentine's gifts online."}
        canonical={seo?.canonicalUrl || "/valentine-shop"}
        keywords={seo?.keywords?.join(', ') || "Valentine's Day Gifts, Valentine's Day Gifts Online, Valentine's Day Flowers, Valentine's Day Gifts Hyderabad, Valentine's Day Gift Delivery, Valentine's Day Rose Bouquet, Romantic Valentine's Day Gifts, Valentine's Day Cake and Flower Combos"}
        ogImage={seo?.ogImage || "https://sbflorist.in/images/hero-flower-shop.jpg"}
      />

      <div className="min-h-screen bg-[#2e040f] text-white relative overflow-hidden font-sans">
        <FloatingPetals enabled={settings?.theme?.floatingPetals ?? true} count={22} />

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[400px] bg-rose-700/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-pink-600/8 rounded-full blur-[100px] pointer-events-none" />

        {/* ================= HEADER BANNER ================= */}
        <div className="relative py-12 md:py-16 px-4 md:px-8 border-b border-rose-950 bg-gradient-to-b from-rose-950/40 to-[#2e040f]">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs text-rose-200/90 font-semibold tracking-wider uppercase">
                Luxury Seasonal Gifting
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 font-serif tracking-tight"
            >
              Valentine's Day <span className="valentine-gradient-text">Collection</span>
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-rose-200/70 max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-6"
            >
              Explore {products.length}+ handcrafted Dutch roses, heart celebration cakes, and romantic gift hampers available for Hyderabad delivery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <ValentineCountdown 
                targetDate={settings?.general?.countdownTargetDate || new Date(new Date().getFullYear(), 1, 14).toISOString()} 
              />
            </motion.div>
          </div>
        </div>

        {/* ================= SHOP ENVIRONMENT ================= */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* 1. SIDEBAR FILTERS (Desktop) */}
            <div className="hidden lg:block space-y-6">
              <div className="valentine-glass-dark border border-rose-950 p-5 rounded-3xl space-y-6">
                
                {/* Search in sidebar */}
                <div>
                  <label className="text-xs font-semibold uppercase text-rose-300/60 tracking-wider block mb-2">
                    Search Valentine Blooms
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search roses, cakes, combos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1b0209] border border-rose-900/60 rounded-xl px-3.5 py-2 pl-9 text-xs text-rose-100 placeholder:text-rose-300/40 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <Search className="w-3.5 h-3.5 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Day Selector */}
                <div className="space-y-3 pt-4 border-t border-rose-950/60">
                  <h3 className="text-xs font-semibold uppercase text-rose-300/60 tracking-wider">
                    Valentine Week (7–14 Feb)
                  </h3>
                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                    {VALENTINE_DAYS.map((day) => (
                      <button
                        key={day.slug}
                        onClick={() => updateFilters(day.slug, selectedCategory)}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs rounded-xl transition-all duration-200 ${
                          selectedDay === day.slug
                            ? 'bg-rose-500/25 border border-rose-500/40 text-rose-200 font-semibold'
                            : 'hover:bg-rose-950/30 border border-transparent text-rose-200/70 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{day.label}</span>
                        {selectedDay === day.slug && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selector */}
                <div className="space-y-3 pt-4 border-t border-rose-950/60">
                  <h3 className="text-xs font-semibold uppercase text-rose-300/60 tracking-wider">
                    Categories
                  </h3>
                  <div className="space-y-1.5">
                    {valentineCategories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => updateFilters(selectedDay, cat.slug)}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs rounded-xl transition-all duration-200 ${
                          selectedCategory === cat.slug
                            ? 'bg-rose-500/25 border border-rose-500/40 text-rose-200 font-semibold'
                            : 'hover:bg-rose-950/30 border border-transparent text-rose-200/70 hover:text-white'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Selector */}
                <div className="space-y-3 pt-4 border-t border-rose-950/60">
                  <div className="flex justify-between items-center text-xs font-semibold text-rose-300/60 tracking-wider">
                    <span>Budget Limit</span>
                    <span className="text-rose-400 font-bold font-mono">
                      {formatPrice(convertPrice(priceRange))}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-rose-950/65"
                  />
                  <div className="flex justify-between text-[10px] text-rose-200/40 font-mono">
                    <span>₹500</span>
                    <span>₹10,000+</span>
                  </div>
                </div>

                {/* Reset button */}
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2 px-3 rounded-xl bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-rose-800/40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>

            {/* 2. MAIN STORE GRID */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* Search Bar on mobile */}
              <div className="lg:hidden relative">
                <input
                  type="text"
                  placeholder="Search Valentine gifts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1b0209] border border-rose-900/60 rounded-xl px-4 py-2.5 pl-10 text-xs text-rose-100 placeholder:text-rose-300/40 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <Search className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-rose-950/20 border border-rose-950 p-3.5 rounded-2xl">
                <div className="text-xs text-rose-200/60">
                  Showing <span className="text-white font-bold">{filteredProducts.length}</span> handcrafted Valentine creations
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-grow sm:flex-grow-0 bg-[#3d0615] border border-rose-950 text-rose-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="featured">Featured Selection</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Customer Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Pills */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-rose-300/60 text-xs mr-1">Active Filters:</span>
                  
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Query: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                    </span>
                  )}

                  {selectedDay !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Day: {VALENTINE_DAYS.find((d) => d.slug === selectedDay)?.short || selectedDay}
                      <button onClick={() => updateFilters('all', selectedCategory)}><X className="w-3 h-3" /></button>
                    </span>
                  )}

                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Category: {selectedCategory}
                      <button onClick={() => updateFilters(selectedDay, 'all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}

                  {priceRange < 10000 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Under ₹{priceRange}
                      <button onClick={() => setPriceRange(10000)}><X className="w-3 h-3" /></button>
                    </span>
                  )}

                  <button
                    onClick={handleResetFilters}
                    className="text-rose-400 hover:text-white underline text-xs ml-2"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Mobile Filter Controls */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <select
                  value={selectedDay}
                  onChange={(e) => updateFilters(e.target.value, selectedCategory)}
                  className="bg-[#3d0615] border border-rose-950 text-rose-200 rounded-xl px-3 py-2 text-xs flex-shrink-0"
                >
                  {VALENTINE_DAYS.map((d) => (
                    <option key={d.slug} value={d.slug}>{d.label}</option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => updateFilters(selectedDay, e.target.value)}
                  className="bg-[#3d0615] border border-rose-950 text-rose-200 rounded-xl px-3 py-2 text-xs flex-shrink-0"
                >
                  {valentineCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={priceRange.toString()}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="bg-[#3d0615] border border-rose-950 text-rose-200 rounded-xl px-3 py-2 text-xs flex-shrink-0"
                >
                  <option value="1000">Under ₹1,000</option>
                  <option value="2000">Under ₹2,000</option>
                  <option value="3500">Under ₹3,500</option>
                  <option value="10000">All Budgets</option>
                </select>
              </div>

              {/* Product Grid */}
              <AnimatePresence mode="popLayout">
                {filteredProducts.length > 0 ? (
                  <motion.div
                    layout
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5"
                  >
                    {filteredProducts.map((product) => {
                      const prodId = product._id || (product as any).id;
                      const title = product.title || (product as any).name;
                      const dayName = VALENTINE_DAYS.find((d) => d.slug === product.valentineDate)?.short || '';

                      return (
                        <motion.div
                          layout
                          key={prodId}
                          variants={itemVariants}
                          whileHover={{ y: -5 }}
                          className="valentine-glass-dark border border-rose-950/80 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-rose-950/25 transition-all duration-300 relative"
                        >
                          {/* Badge overlay */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
                            {dayName && (
                              <div className="bg-rose-600/90 text-white font-bold text-[9px] sm:text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {dayName}
                              </div>
                            )}
                            <div className="bg-black/50 backdrop-blur-md text-rose-300 font-bold text-[8px] sm:text-[9px] uppercase px-2 py-0.5 rounded-full border border-rose-500/20">
                              ❤️ Valentine
                            </div>
                          </div>

                          {/* Image */}
                          <div 
                            className="aspect-square overflow-hidden bg-rose-950/40 relative cursor-pointer"
                            onClick={() => navigate(`/valentine-product/${prodId}`)}
                          >
                            <ProtectedImage
                              src={product.images?.[0] || product.image || '/images/placeholder.jpg'}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1b0209]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                              <span className="text-xs bg-white text-rose-950 font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                                View Details
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-3 sm:p-4 flex-grow flex flex-col">
                            <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-rose-400 uppercase mb-1 line-clamp-1">
                              {product.valentineCategory || product.category}
                            </span>
                            <h3 
                              className="font-bold text-xs sm:text-sm md:text-base text-white group-hover:text-rose-300 transition-colors line-clamp-1 cursor-pointer mb-1.5 font-serif"
                              onClick={() => navigate(`/valentine-product/${prodId}`)}
                            >
                              {title}
                            </h3>

                            {/* Short Available Dates Summary */}
                            {product.availableDates && product.availableDates.length > 0 && (
                              <div className="mb-3 text-[10px] text-rose-200/50 flex items-center gap-1">
                                <span className="text-rose-400">📅</span>
                                <span className="truncate">Delivers: {product.availableDates.join(' • ')}</span>
                              </div>
                            )}

                            {/* Price and Cart */}
                            <div className="mt-auto pt-2.5 border-t border-rose-950/50 flex items-center justify-between gap-2">
                              <div className="font-mono font-bold text-xs sm:text-base text-rose-300">
                                {formatPrice(convertPrice(product.price))}
                              </div>

                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={addingToCartId === prodId}
                                className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900/40 text-white p-2 sm:p-2.5 rounded-xl transition-colors shadow-lg shadow-rose-950/20"
                                aria-label="Add to cart"
                              >
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-rose-950/15 border border-rose-950/40 rounded-3xl p-6"
                  >
                    <Heart className="w-12 h-12 text-rose-500/40 mx-auto mb-3" />
                    <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                      No matching romantic creations found
                    </h3>
                    <p className="text-rose-200/60 text-xs sm:text-sm mt-1 max-w-sm mx-auto mb-4">
                      Try resetting your search query or expanding the price range slider.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
                    >
                      Show All Valentine Blooms
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* SEO Editorial & Content Architecture */}
        <div className="bg-white text-slate-900 border-t border-rose-950">
          <ValentineSeoEditorialSection />
        </div>
      </div>
    </>
  );
};

export default ValentineShopPage;
