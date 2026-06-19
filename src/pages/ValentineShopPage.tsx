import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles, Filter, SlidersHorizontal, Check, Calendar, Tag, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { useValentine } from '@/contexts/ValentineContext';
import useCart from '@/hooks/use-cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import api from '@/services/api';

import FloatingPetals from '@/components/valentine/FloatingPetals';
import ValentineCountdown from '@/components/valentine/ValentineCountdown';
import '@/components/valentine/valentine.css';
import ProtectedImage from '@/components/ui/ProtectedImage';


import type { ValentineProduct } from '@/types/valentine';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const VALENTINE_DAYS = [
  { slug: 'all', label: 'All Days' },
  { slug: 'rose-day', label: '🌹 Rose Day (8 Feb)' },
  { slug: 'propose-day', label: '💍 Propose Day (9 Feb)' },
  { slug: 'chocolate-day', label: '🍫 Chocolate Day (10 Feb)' },
  { slug: 'teddy-day', label: '🧸 Teddy Day (11 Feb)' },
  { slug: 'promise-day', label: '🤝 Promise Day (12 Feb)' },
  { slug: 'hug-day', label: '🤗 Hug Day (13 Feb)' },
  { slug: 'valentines-day', label: '💖 Valentine\'s Day (14 Feb)' },
  { slug: 'celebration-day', label: '🥂 Celebration Day (15 Feb)' },
];

const ValentineShopPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isValentineEnabled, settings, offers, loading: contextLoading } = useValentine();
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<ValentineProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Filter States
  const [selectedDay, setSelectedDay] = useState<string>(searchParams.get('day') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Fetch Valentine products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await api.get('/products?isValentineProduct=true');
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

  // Get categories from settings or products
  const valentineCategories = useMemo(() => {
    if (settings?.categories && settings.categories.length > 0) {
      return [{ slug: 'all', name: 'All Categories' }, ...settings.categories.filter(c => c.enabled)];
    }
    const categories = new Set<string>();
    products.forEach(p => {
      if (p.valentineCategory) categories.add(p.valentineCategory);
      else if (p.category) categories.add(p.category);
    });
    return [
      { slug: 'all', name: 'All Categories' },
      ...Array.from(categories).map(c => ({ slug: c.toLowerCase().replace(/\s+/g, '-'), name: c })),
    ];
  }, [settings, products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by day
    if (selectedDay !== 'all') {
      filtered = filtered.filter(p => 
        p.valentineDate === selectedDay || 
        (p.availableDates && p.availableDates.includes(selectedDay))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => {
        const catSlug = p.valentineCategory 
          ? p.valentineCategory.toLowerCase().replace(/\s+/g, '-')
          : p.category.toLowerCase().replace(/\s+/g, '-');
        if (catSlug === selectedCategory) return true;

        if (p.valentineCategories && p.valentineCategories.length > 0) {
          return p.valentineCategories.some(cat => 
            cat.toLowerCase().replace(/\s+/g, '-') === selectedCategory
          );
        }
        return false;
      });
    }

    // Filter by price
    filtered = filtered.filter(p => p.price <= priceRange);

    // Sort products
    if (sortBy === 'featured') {
      filtered.sort((a, b) => {
        const orderA = a.displayOrders?.occasions?.valentine || 0;
        const orderB = b.displayOrders?.occasions?.valentine || 0;
        
        const hasOrderA = orderA > 0;
        const hasOrderB = orderB > 0;
        
        if (hasOrderA && hasOrderB) {
          if (orderA !== orderB) return orderA - orderB;
        } else if (hasOrderA) {
          return -1;
        } else if (hasOrderB) {
          return 1;
        }
        
        // Fallback to newest first
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [products, selectedDay, selectedCategory, priceRange, sortBy]);

  const updateFilters = (day: string, cat: string) => {
    const params: Record<string, string> = {};
    if (day !== 'all') params.day = day;
    if (cat !== 'all') params.category = cat;
    setSearchParams(params);
    setSelectedDay(day);
    setSelectedCategory(cat);
  };

  const handleAddToCart = async (product: ValentineProduct) => {
    try {
      setAddingToCartId(product._id);
      
      const cartItem = {
        _id: product._id,
        id: product._id,
        productId: product._id,
        title: product.title,
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

      await addToCart(cartItem);
      
      // Delay navigation slightly to let the store update
      setTimeout(() => {
        navigate('/cart');
      }, 300);
    } catch (err) {
      console.error('Error adding Valentine product to cart:', err);
    } finally {
      setAddingToCartId(null);
    }
  };

  // Master Switch Redirect
  if (!contextLoading && !isValentineEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-white">
        <div className="text-center max-w-md px-6">
          <Heart className="w-16 h-16 text-rose-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3 font-['Playfair_Display']">
            Valentine's Experience Closed
          </h1>
          <p className="text-gray-500 mb-6">
            The Valentine's Week shopping portal is currently inactive. Please check out our beautiful flowers on the main shop.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors"
          >
            Go to Shop
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (contextLoading || productsLoading) {
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

  return (
    <>
      {seo && (
        <Helmet>
          <title>{seo.metaTitle ? `Valentine Shop | ${seo.metaTitle}` : 'Valentine\'s Special Luxury Shop'}</title>
          <meta name="description" content={seo.metaDescription} />
        </Helmet>
      )}

      <div className="min-h-screen bg-[#2e040f] text-white relative overflow-hidden font-sans">
        {/* Floating Petals */}
        <FloatingPetals enabled={settings?.theme?.floatingPetals ?? true} count={22} />

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[400px] bg-rose-700/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-pink-600/8 rounded-full blur-[100px] pointer-events-none" />

        {/* ================= HEADER BANNER ================= */}
        <div className="relative py-12 md:py-20 px-4 md:px-8 border-b border-rose-950 bg-gradient-to-b from-rose-950/30 to-[#2e040f]">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs text-rose-200/90 font-semibold tracking-wider uppercase">
                Luxury Floral Gifting
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-black mb-4 font-['Playfair_Display'] tracking-tight"
            >
              The Valentine <span className="valentine-gradient-text">Specialty Shop</span>
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-rose-200/60 max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-8"
            >
              Express your love with hand-arranged collections reserved exclusively for Valentine's Week delivery.
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* 1. SIDEBAR FILTERS (Desktop) */}
            <div className="hidden lg:block space-y-6">
              <div className="valentine-glass-dark border border-rose-950 p-5 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-rose-950/60">
                  <Filter className="w-4 h-4 text-rose-400" />
                  <h2 className="font-bold text-sm tracking-widest uppercase">Refine Selection</h2>
                </div>

                {/* Day Selector */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-rose-300/60 tracking-wider">
                    Filter by Campaign Day
                  </h3>
                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                    {VALENTINE_DAYS.map((day) => (
                      <button
                        key={day.slug}
                        onClick={() => updateFilters(day.slug, selectedCategory)}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs rounded-xl transition-all duration-200 ${
                          selectedDay === day.slug
                            ? 'bg-rose-500/20 border border-rose-500/35 text-rose-300 font-semibold'
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
                <div className="space-y-3 pt-4 border-t border-rose-950/40">
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
                            ? 'bg-rose-500/20 border border-rose-500/35 text-rose-300 font-semibold'
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
                <div className="space-y-3 pt-4 border-t border-rose-950/40">
                  <div className="flex justify-between items-center text-xs font-semibold text-rose-300/60 tracking-wider">
                    <span>Max Price</span>
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
                    <span>₹10,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MAIN STORE GRID */}
            <div className="lg:col-span-3 space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-rose-950/20 border border-rose-950 p-4 rounded-2xl">
                <div className="text-xs text-rose-200/50">
                  Showing <span className="text-white font-bold">{filteredProducts.length}</span> luxury romantic options
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-grow sm:flex-grow-0 bg-[#3d0615] border border-rose-950 text-rose-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="featured">Featured Collection</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Mobile Filter Controls */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <select
                  value={selectedDay}
                  onChange={(e) => updateFilters(e.target.value, selectedCategory)}
                  className="bg-[#3d0615] border border-rose-950 text-rose-200 rounded-xl px-3 py-2 text-xs"
                >
                  {VALENTINE_DAYS.map(d => (
                    <option key={d.slug} value={d.slug}>{d.label}</option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => updateFilters(selectedDay, e.target.value)}
                  className="bg-[#3d0615] border border-rose-950 text-rose-200 rounded-xl px-3 py-2 text-xs"
                >
                  {valentineCategories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={priceRange.toString()}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="bg-[#3d0615] border border-rose-950 text-rose-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="1500">Under ₹1,500</option>
                  <option value="3000">Under ₹3,000</option>
                  <option value="5000">Under ₹5,000</option>
                  <option value="10000">All Prices</option>
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
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                  >
                    {filteredProducts.map((product) => {
                      const dayName = VALENTINE_DAYS.find(d => d.slug === product.valentineDate)?.label.split(' ')[1] || '';
                      
                      return (
                        <motion.div
                          layout
                          key={product._id}
                          variants={itemVariants}
                          whileHover={{ y: -6 }}
                          className="valentine-glass-dark border border-rose-950/80 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-rose-950/20 transition-all duration-300 relative"
                        >
                          {/* Badge overlay */}
                          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                            {dayName && (
                              <div className="bg-rose-600/90 text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {dayName} Day
                              </div>
                            )}
                            <div className="bg-black/40 backdrop-blur-md text-rose-300 font-bold text-[9px] uppercase px-2 py-0.5 rounded-full border border-rose-500/20">
                              ❤️ Valentine Exclusive
                            </div>
                          </div>

                          {/* Image */}
                          <div 
                            className="aspect-square overflow-hidden bg-rose-950/40 relative cursor-pointer"
                            onClick={() => navigate(`/valentine-product/${product._id}`)}
                          >
                            <ProtectedImage
                              src={product.images?.[0] || product.image || '/images/placeholder.jpg'}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1b0209]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                              <span className="text-xs bg-white text-rose-950 font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                                View Details
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-4 flex-grow flex flex-col">
                            <span className="text-[10px] font-semibold tracking-widest text-rose-400 uppercase mb-1">
                              {product.valentineCategory || product.category}
                            </span>
                            <h3 
                              className="font-bold text-sm md:text-base text-white group-hover:text-rose-300 transition-colors line-clamp-1 cursor-pointer mb-2 font-['Playfair_Display']"
                              onClick={() => navigate(`/valentine-product/${product._id}`)}
                            >
                              {product.title}
                            </h3>

                            {/* Short Available Dates Summary */}
                            {product.availableDates && product.availableDates.length > 0 && (
                              <div className="mb-4 text-[10px] text-rose-200/50 flex items-center gap-1">
                                <span className="text-rose-400">📅</span>
                                <span>Delivers: {product.availableDates.join(' • ')}</span>
                              </div>
                            )}

                            {/* Price and Cart */}
                            <div className="mt-auto pt-3 border-t border-rose-950/40 flex items-center justify-between gap-2">
                              <div className="font-mono font-bold text-sm md:text-lg text-rose-300">
                                {formatPrice(convertPrice(product.price))}
                              </div>

                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={addingToCartId === product._id}
                                className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900/40 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-rose-950/20"
                                aria-label="Add to cart"
                              >
                                <Heart className="w-4 h-4" fill="currentColor" />
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
                    className="text-center py-20 bg-rose-950/10 border border-rose-950/40 rounded-3xl"
                  >
                    <Heart className="w-12 h-12 text-rose-950 mx-auto mb-4" />
                    <p className="text-rose-200/60 font-semibold font-['Playfair_Display'] text-lg">
                      No matching romantic creations found.
                    </p>
                    <p className="text-rose-200/40 text-xs mt-1">
                      Try adjusting your filters or checking alternative campaign days.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ValentineShopPage;
