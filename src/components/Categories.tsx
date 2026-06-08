import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { ArrowUpRight, Flower2, Gift, Heart, Leaf, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_QUERY_ALIASES: Record<string, string> = {
  anivarsery: 'anniversary',
  aniversary: 'anniversary',
};

const toCategoryQueryValue = (name: string) => {
  const normalized = name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return CATEGORY_QUERY_ALIASES[normalized] || normalized;
};

const pickCategoryIcon = (name: string) => {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('anniversary') || normalizedName.includes('love')) {
    return Heart;
  }

  if (normalizedName.includes('plant') || normalizedName.includes('succulent') || normalizedName.includes('garden')) {
    return Leaf;
  }

  if (normalizedName.includes('combo') || normalizedName.includes('gift') || normalizedName.includes('basket')) {
    return Gift;
  }

  if (normalizedName.includes('birthday') || normalizedName.includes('special')) {
    return Sparkles;
  }

  return Flower2;
};

const Categories = () => {
  const { categories, loading } = useSettings();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-500 text-sm">Loading categories...</p>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  // Pre-process categories to ensure clean sorting
  const enabledCategories = categories
    .filter(cat => cat.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-12 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#fffafc] via-white to-white"
      aria-label="Shop by category"
    >
      {/* Background soft blurs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-[#FFB6C1]/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#E91E63]/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#f3d7e2]/60 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-[#b53d69] uppercase mb-4 shadow-sm">
            <Flower2 className="h-3 w-3" />
            Curated Gifting Collections
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 leading-tight">
            Shop by Best Categories
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Discover curated luxury arrangements hand-delivered for every occasion.
          </p>
        </div>

        {/* Mobile View: 2-Row Grid of Circles (matches Reference Image) */}
        <div className="md:hidden overflow-x-auto pb-4 no-scrollbar">
          <div className="grid grid-flow-col grid-rows-2 gap-x-5 gap-y-4 w-max px-2">
            {enabledCategories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${encodeURIComponent(toCategoryQueryValue(category.name))}`}
                className="flex flex-col items-center justify-center w-[76px] select-none active:scale-95 transition-transform"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-pink-50 shadow-sm flex items-center justify-center p-0.5 group">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Subtle border overlay */}
                  <div className="absolute inset-0 rounded-full border border-black/5" />
                </div>
                <span className="text-[11px] font-bold text-gray-700 text-center mt-1.5 line-clamp-1 w-full tracking-wide">
                  {category.name.replace(/Special|Delivery|Gifts/gi, '').trim()}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop View: Premium Elegant Grid Cards */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-5">
          {enabledCategories.map((category, index) => (
            <DesktopCategoryCard
              key={category.id}
              category={category}
              isVisible={isVisible}
              delay={index * 0.05}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

interface CategoryCardProps {
  category: any;
  isVisible: boolean;
  delay: number;
}

const DesktopCategoryCard = ({ category, isVisible, delay }: CategoryCardProps) => {
  const Icon = pickCategoryIcon(category.name);

  return (
    <Link
      to={`/shop?category=${encodeURIComponent(toCategoryQueryValue(category.name))}`}
      className="group relative block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-primary/20 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(19,14,17,0.08)]"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(15px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s, box-shadow 0.3s ease, translate 0.3s ease, border-color 0.3s ease`,
      }}
    >
      <div className="relative aspect-[4/5] min-h-[170px]">
        {/* Category Image */}
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Soft Shadow Tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-4 text-white">
          <div className="self-start inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20 transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-3.5 w-3.5" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-pink-100 transition-colors">
              {category.name}
            </h3>
            <p className="mt-0.5 text-[10px] text-white/70 line-clamp-1 font-medium leading-normal">
              {category.description || 'Explore collection'}
            </p>
            <div className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-white/80 group-hover:text-white transition-colors">
              Shop Now
              <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Categories;