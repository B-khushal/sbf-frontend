import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Filter, RefreshCw, ChevronDown, Check, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import { ProductCard, type Product } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';

interface ValentineGiftFinderProps {
  className?: string;
}

const RECIPIENTS = [
  { id: 'all', label: 'Anyone Special', icon: '✨' },
  { id: 'girlfriend', label: 'For Girlfriend', icon: '💖' },
  { id: 'wife', label: 'For Wife', icon: '💍' },
  { id: 'boyfriend', label: 'For Boyfriend', icon: '🎁' },
  { id: 'husband', label: 'For Husband', icon: '🤵' },
  { id: 'friend', label: 'Best Friend', icon: '🌸' }
];

const BUDGETS = [
  { id: 'all', label: 'Any Budget' },
  { id: 'under-1000', label: 'Under ₹999' },
  { id: '1000-2000', label: '₹1,000 – ₹2,000' },
  { id: '2000-3500', label: '₹2,000 – ₹3,500' },
  { id: 'luxury', label: 'Luxury (₹3,500+)' }
];

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🛍️' },
  { id: 'roses', label: 'Fresh Roses', icon: '🌹' },
  { id: 'bouquets', label: 'Romantic Bouquets', icon: '💐' },
  { id: 'cakes', label: 'Cakes & Treats', icon: '🎂' },
  { id: 'combos', label: 'Curated Combos', icon: '🎁' },
  { id: 'chocolates', label: 'Chocolates & Hampers', icon: '🍫' }
];

const OCCASIONS = [
  { id: 'all', label: 'All Romantic Days' },
  { id: 'valentines-day', label: "Valentine's Day (14 Feb)" },
  { id: 'rose-day', label: 'Rose Day (7 Feb)' },
  { id: 'propose-day', label: 'Propose Day (8 Feb)' },
  { id: 'chocolate-day', label: 'Chocolate Day (9 Feb)' },
  { id: 'teddy-day', label: 'Teddy Day (10 Feb)' },
  { id: 'promise-day', label: 'Promise Day (11 Feb)' },
  { id: 'hug-day', label: 'Hug Day (12 Feb)' },
  { id: 'kiss-day', label: 'Kiss Day (13 Feb)' }
];

export const ValentineGiftFinder: React.FC<ValentineGiftFinderProps> = ({ className = '' }) => {
  const [recipient, setRecipient] = useState<string>('all');
  const [budget, setBudget] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [occasion, setOccasion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (recipient !== 'all') params.append('recipient', recipient);
      if (budget !== 'all') params.append('budget', budget);
      if (category !== 'all') params.append('category', category);
      if (occasion !== 'all') params.append('occasion', occasion);
      if (sortBy !== 'featured') params.append('sortBy', sortBy);
      params.append('limit', '8');

      const response = await api.get(`/valentine/gift-finder?${params.toString()}`);
      setProducts(response.data.products || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Error in gift finder:', err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [recipient, budget, category, occasion, sortBy]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleReset = () => {
    setRecipient('all');
    setBudget('all');
    setCategory('all');
    setOccasion('all');
    setSortBy('featured');
  };

  const hasActiveFilters = recipient !== 'all' || budget !== 'all' || category !== 'all' || occasion !== 'all' || sortBy !== 'featured';

  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      {/* Container with luxury warm-ivory / blush styling */}
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(225,29,72,0.12)] border border-rose-100 dark:border-rose-950/40">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Assisted Gift Recommendation
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Find The <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Perfect Valentine Gift</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Tell us who you're surprising and your preference — we'll curate handcrafted blooms & treats right from our Hyderabad studio.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-6 bg-rose-50/40 dark:bg-slate-800/40 p-5 sm:p-6 rounded-2xl border border-rose-100/60 dark:border-rose-900/30">
          
          {/* Step 1: Who is it for? */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
              1. Who is this gift for?
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {RECIPIENTS.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setRecipient(rec.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    recipient === rec.id
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-rose-300'
                  }`}
                >
                  <span>{rec.icon}</span>
                  <span>{rec.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Budget */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
              2. Your Desired Budget
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {BUDGETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudget(b.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    budget === b.id
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-rose-300'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Category & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                3. Preferred Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-4 py-2.5 pr-10 border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                4. Valentine Week Day / Occasion
              </label>
              <div className="relative">
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-4 py-2.5 pr-10 border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {OCCASIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active summary & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-rose-100/80 dark:border-rose-900/40 text-xs sm:text-sm">
            <div className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {loading ? 'Searching blooms...' : `${total} Handcrafted Matches Found`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-xs">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 bg-rose-50/50 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {products.map((p) => (
                <ProductCard key={p._id || p.id} product={p} linkPrefix="/valentine-product" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-rose-50/30 dark:bg-slate-800/20 border border-dashed border-rose-200 dark:border-rose-900/40">
              <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                No exact match with this combination
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Try widening your budget filter or switching to "All Gifts" to see our complete seasonal catalog.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="rounded-full border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                Show All Valentine's Gifts
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ValentineGiftFinder;

