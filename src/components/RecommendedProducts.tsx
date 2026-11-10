import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import productService, { ProductData } from '@/services/productService';
import { ProductCard } from '@/components/ProductGrid';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Gift,
  Award,
  ArrowUpRight,
  Truck,
  ShieldCheck,
  Flower2,
} from 'lucide-react';

export interface RecommendedProductsProps {
  productId: string;
  category: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  variant?: 'default' | 'valentine' | 'cake' | 'combo';
  linkPrefix?: string;
}

type CurationTab = 'similar' | 'pairings' | 'bestsellers';

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  productId,
  category,
  title,
  subtitle,
  limit = 10,
  variant = 'default',
  linkPrefix,
}) => {
  const [similarProducts, setSimilarProducts] = useState<ProductData[]>([]);
  const [pairingProducts, setPairingProducts] = useState<ProductData[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<ProductData[]>([]);
  const [activeTab, setActiveTab] = useState<CurationTab>('similar');
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const normalizedCategory = String(category || 'flowers').toLowerCase().trim();

  // Dynamic theme & copy based on variant / category
  const themeConfig = useMemo(() => {
    if (variant === 'valentine') {
      return {
        eyebrow: subtitle || 'Curated Romantic Duos',
        heading: title || "Complete Your Valentine's Surprise",
        description:
          'Handpicked romantic arrangements, luxury rose boxes, and indulgent pairings crafted to make their heart skip a beat.',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/70 text-rose-700 dark:text-rose-300',
        accentText: 'text-rose-600 dark:text-rose-400',
        activePill:
          'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20 border-transparent',
        progressFill: 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600',
        cardGlow: 'from-rose-50/50 via-white to-pink-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-rose-950/20',
        exploreLink: '/valentine-shop',
        exploreLabel: 'Explore Valentine Collection',
        similarLabel: 'Romantic Picks',
      };
    }

    if (variant === 'cake' || normalizedCategory.includes('cake')) {
      return {
        eyebrow: subtitle || 'Patisserie & Floral Curations',
        heading: title || 'You May Also Love',
        description:
          'Oven-fresh gourmet cakes, celebration combos, and hand-tied floral arrangements to elevate every milestone.',
        badgeBg: 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300',
        accentText: 'text-amber-700 dark:text-amber-400',
        activePill:
          'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 shadow-md shadow-stone-900/15 border-transparent',
        progressFill: 'bg-gradient-to-r from-amber-600 via-rose-500 to-amber-500',
        cardGlow: 'from-amber-50/30 via-white to-rose-50/25 dark:from-stone-900 dark:via-stone-900/95 dark:to-stone-950',
        exploreLink: '/cakes',
        exploreLabel: 'Explore All Cakes',
        similarLabel: 'Similar Cakes',
      };
    }

    if (variant === 'combo' || normalizedCategory.includes('combo') || normalizedCategory.includes('hamper')) {
      return {
        eyebrow: subtitle || 'Signature Celebration Bundles',
        heading: title || 'You May Also Love',
        description:
          'Thoughtfully paired flower, cake, chocolate, and luxury gift hampers designed for grand celebrations.',
        badgeBg: 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/60 text-rose-700 dark:text-rose-300',
        accentText: 'text-rose-600 dark:text-rose-400',
        activePill:
          'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/15 border-transparent',
        progressFill: 'bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500',
        cardGlow: 'from-rose-50/30 via-white to-amber-50/25 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950',
        exploreLink: '/combos',
        exploreLabel: 'Explore All Combos',
        similarLabel: 'Similar Combos',
      };
    }

    return {
      eyebrow: subtitle || 'Bespoke Floral Curations',
      heading: title || 'You May Also Love',
      description:
        'Artisanal floral arrangements, gourmet cakes, and curated gift combos handcrafted daily by our master florists.',
      badgeBg: 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-200/70 dark:border-rose-800/60 text-rose-700 dark:text-rose-300',
      accentText: 'text-rose-600 dark:text-rose-400',
      activePill:
        'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/15 border-transparent',
      progressFill: 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500',
      cardGlow: 'from-slate-50/70 via-white to-rose-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950',
      exploreLink: category ? `/shop?category=${encodeURIComponent(category)}` : '/shop',
      exploreLabel: 'View Full Collection',
      similarLabel: 'Similar Creations',
    };
  }, [variant, normalizedCategory, title, subtitle, category]);

  // Fetch multi-tab curated recommendations from real database
  useEffect(() => {
    let isMounted = true;

    const fetchCuratedCollections = async () => {
      if (!productId) return;
      try {
        setLoading(true);

        // Fetch similar category products and full catalog in parallel
        const [recByCat, allCatalog] = await Promise.all([
          productService.getRecommendedProducts(productId, category || 'flowers', limit).catch(() => []),
          productService.getProducts().catch(() => []),
        ]);

        if (!isMounted) return;

        const validCatalog = (Array.isArray(allCatalog) ? allCatalog : []).filter(
          (p) => p && String(p._id) !== String(productId) && !p.hidden && p.isAvailable !== false
        );

        const validRec = (Array.isArray(recByCat) ? recByCat : []).filter(
          (p) => p && String(p._id) !== String(productId) && !p.hidden && p.isAvailable !== false
        );

        // 1. Similar Creations
        const similarIds = new Set(validRec.map((p) => String(p._id)));
        const similarList = [...validRec];
        if (similarList.length < limit) {
          for (const item of validCatalog) {
            if (similarList.length >= limit) break;
            if (!similarIds.has(String(item._id))) {
              similarList.push(item);
              similarIds.add(String(item._id));
            }
          }
        }

        // 2. Complementary Pairings (Cross-sell combos/cakes/bouquets)
        const isViewingCake = normalizedCategory.includes('cake');
        const isViewingCombo = normalizedCategory.includes('combo') || normalizedCategory.includes('hamper');

        const pairingsPool = validCatalog.filter((p) => {
          const pCat = String(p.category || '').toLowerCase();
          const pCats = Array.isArray(p.categories) ? p.categories.map((c) => String(c).toLowerCase()) : [];
          const pTitle = String(p.title || (p as any).name || '').toLowerCase();

          if (isViewingCake) {
            return (
              pCat.includes('combo') ||
              pCat.includes('bouquet') ||
              pCat.includes('flower') ||
              pCat.includes('rose') ||
              pCats.some((c) => c.includes('combo') || c.includes('bouquet') || c.includes('rose'))
            );
          }
          if (isViewingCombo) {
            return (
              pCat.includes('cake') ||
              pCat.includes('rose') ||
              pCat.includes('chocolate') ||
              pTitle.includes('luxury') ||
              pTitle.includes('hamper')
            );
          }
          // Default (viewing flowers/bouquets): pair with combos, cakes, chocolates, hampers
          return (
            pCat.includes('combo') ||
            pCat.includes('cake') ||
            pCat.includes('chocolate') ||
            pCat.includes('hamper') ||
            pCats.some((c) => c.includes('combo') || c.includes('cake') || c.includes('hamper')) ||
            pTitle.includes('combo') ||
            pTitle.includes('cake')
          );
        });

        const finalPairings =
          pairingsPool.length >= 4
            ? pairingsPool.slice(0, limit)
            : validCatalog.filter((p) => !similarIds.has(String(p._id))).slice(0, limit);

        // 3. Customer Favorites / Bestsellers
        const sortedBestsellers = [...validCatalog]
          .sort((a, b) => {
            const aScore =
              (a.isBestseller ? 10 : 0) +
              (a.isFeatured ? 6 : 0) +
              (Number(a.rating || 0) >= 4.5 ? 5 : 0) +
              Math.min(Number(a.numReviews || 0), 10);
            const bScore =
              (b.isBestseller ? 10 : 0) +
              (b.isFeatured ? 6 : 0) +
              (Number(b.rating || 0) >= 4.5 ? 5 : 0) +
              Math.min(Number(b.numReviews || 0), 10);
            return bScore - aScore;
          })
          .slice(0, limit);

        setSimilarProducts(similarList.slice(0, limit));
        setPairingProducts(finalPairings);
        setBestsellerProducts(sortedBestsellers);
        setActiveTab('similar');
      } catch (err) {
        console.error('Error loading curated recommendations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCuratedCollections();
    return () => {
      isMounted = false;
    };
  }, [productId, category, normalizedCategory, limit]);

  const activeProducts = useMemo(() => {
    if (activeTab === 'pairings' && pairingProducts.length > 0) return pairingProducts;
    if (activeTab === 'bestsellers' && bestsellerProducts.length > 0) return bestsellerProducts;
    return similarProducts;
  }, [activeTab, similarProducts, pairingProducts, bestsellerProducts]);

  // Update scroll state & progress indicator
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(scrollWidth - clientWidth, 0);
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScroll - 8);
    setScrollProgress(maxScroll > 0 ? Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)) : 100);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Reset scroll position when tab switches
    el.scrollTo({ left: 0, behavior: 'smooth' });
    const timer = setTimeout(updateScrollState, 150);
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [activeProducts, updateScrollState]);

  // Gentle card-by-card auto-advance (harmonious with CSS scroll-snap, pauses on hover/touch)
  useEffect(() => {
    if (isPaused || loading || activeProducts.length <= 3) return;
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 10) return;

      if (scrollLeft >= maxScroll - 16) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }, 5200);

    return () => clearInterval(interval);
  }, [isPaused, loading, activeProducts.length]);

  const handleScrollClick = (direction: 'left' | 'right') => {
    setIsPaused(true);
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.72, 280);
    const target = direction === 'left' ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="mt-16 pt-12 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-50/80 via-white to-rose-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/70 dark:border-slate-800/80 p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-3">
              <div className="h-6 w-44 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-9 w-72 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-4 w-96 max-w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="bg-slate-100 dark:bg-slate-800 aspect-square rounded-xl" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2" />
                <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!similarProducts.length && !pairingProducts.length && !bestsellerProducts.length) {
    return null;
  }

  const tabs: Array<{ id: CurationTab; label: string; icon: React.ReactNode; count: number }> = [
    {
      id: 'similar',
      label: themeConfig.similarLabel,
      icon: <Sparkles className="w-3.5 h-3.5" />,
      count: similarProducts.length,
    },
    ...(pairingProducts.length > 0
      ? [
          {
            id: 'pairings' as CurationTab,
            label: 'Complete the Celebration',
            icon: <Gift className="w-3.5 h-3.5" />,
            count: pairingProducts.length,
          },
        ]
      : []),
    ...(bestsellerProducts.length > 0
      ? [
          {
            id: 'bestsellers' as CurationTab,
            label: 'Customer Favorites',
            icon: <Award className="w-3.5 h-3.5" />,
            count: bestsellerProducts.length,
          },
        ]
      : []),
  ];

  return (
    <section
      aria-label={themeConfig.heading}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      className="mt-14 sm:mt-20 relative"
    >
      {/* Main Luxury Framed Container */}
      <div
        className={`relative rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${themeConfig.cardGlow} border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-8 lg:p-10 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.07)] overflow-hidden`}
      >
        {/* Subtle Ambient Decorative Orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-200/20 dark:bg-rose-900/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-3xl" />

        {/* Top Editorial Header Row */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-200/60 dark:border-slate-800/70">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[11px] font-extrabold uppercase tracking-[0.2em] shadow-2xs backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-rose-200/70 dark:border-rose-900/60 text-rose-600 dark:text-rose-400">
              {variant === 'valentine' ? (
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>{themeConfig.eyebrow}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {themeConfig.heading}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {themeConfig.description}
            </p>
          </div>

          {/* Right Controls: Curation Tabs + Navigation Arrows */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
            {/* Multi-Curation Switcher Pills */}
            {tabs.length > 1 && (
              <div
                role="tablist"
                aria-label="Recommendation categories"
                className="inline-flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 backdrop-blur-md"
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      type="button"
                      aria-selected={isActive}
                      onClick={() => {
                        setIsPaused(true);
                        setActiveTab(tab.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? themeConfig.activePill
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Desktop Prev / Next Tactile Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScrollClick('left')}
                disabled={!canScrollLeft}
                aria-label="Previous recommendations"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  canScrollLeft
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:hover:bg-white dark:hover:text-slate-900 shadow-xs hover:scale-105 active:scale-95'
                    : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScrollClick('right')}
                disabled={!canScrollRight}
                aria-label="Next recommendations"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  canScrollRight
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:hover:bg-white dark:hover:text-slate-900 shadow-xs hover:scale-105 active:scale-95'
                    : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Carousel Track */}
        <div className="relative mt-6 sm:mt-8">
          {/* Left Floating Edge Gradient & Arrow on Desktop */}
          {canScrollLeft && (
            <div className="hidden lg:flex items-center absolute left-0 top-0 bottom-4 z-20 pointer-events-none pr-8 bg-gradient-to-r from-white/80 dark:from-slate-900/80 to-transparent">
              <button
                type="button"
                onClick={() => handleScrollClick('left')}
                aria-label="Scroll left"
                className="pointer-events-auto ml-1 w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-800 dark:text-white hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Right Floating Edge Gradient & Arrow on Desktop */}
          {canScrollRight && (
            <div className="hidden lg:flex items-center justify-end absolute right-0 top-0 bottom-4 z-20 pointer-events-none pl-8 bg-gradient-to-l from-white/80 dark:from-slate-900/80 to-transparent">
              <button
                type="button"
                onClick={() => handleScrollClick('right')}
                aria-label="Scroll right"
                className="pointer-events-auto mr-1 w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-800 dark:text-white hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              ref={scrollRef}
              className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1"
            >
              {activeProducts.map((recProd, index) => (
                <div
                  key={`${activeTab}-${recProd._id || (recProd as any).id || index}`}
                  className="w-[230px] xs:w-[245px] sm:w-[265px] md:w-[280px] lg:w-[290px] flex-shrink-0 snap-start flex flex-col"
                >
                  <ProductCard
                    product={recProd as any}
                    linkPrefix={linkPrefix || (variant === 'valentine' ? '/valentine-product' : undefined)}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Progress Bar & Explore Link */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Smooth Progress Indicator */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-44 h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${themeConfig.progressFill}`}
                style={{ width: `${Math.max(scrollProgress, 18)}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
              {activeProducts.length} Handpicked Items
            </span>
          </div>

          {/* Trust Highlights + View Full Collection Link */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Flower2 className="w-3.5 h-3.5 text-rose-500" />
                Farm-Fresh Blooms
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Same-Day Hyderabad Delivery
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                100% Quality Promise
              </span>
            </div>

            <Link
              to={themeConfig.exploreLink}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors group"
            >
              <span>{themeConfig.exploreLabel}</span>
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:bg-rose-600 dark:group-hover:bg-rose-500 dark:group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts;
