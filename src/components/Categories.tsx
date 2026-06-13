import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { ArrowUpRight, Flower2, Gift, Heart, Leaf, Sparkles } from 'lucide-react';

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

const CategoryCircleItem = ({ category, index, isVisible }: { category: any; index: number; isVisible: boolean }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(toCategoryQueryValue(category.name))}`}
      className="flex flex-col items-center justify-start flex-shrink-0 snap-center select-none group"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`,
      }}
    >
      <div className="relative w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-transform duration-[250ms] ease group-hover:scale-105 group-active:scale-105 group-hover:shadow-[0_8px_24px_rgba(236,72,153,0.15)]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-full" />
        )}
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <span className="text-[11px] font-bold text-gray-700 text-center mt-2 w-[84px] leading-tight truncate">
        {category.name}
      </span>
    </Link>
  );
};

const Categories = () => {
  const { categories, mobileBanners, loading } = useSettings();
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

  const activeBanners = useMemo(() => {
    if (!mobileBanners || !Array.isArray(mobileBanners)) return [];
    const now = new Date();
    return mobileBanners.filter(banner => {
      if (!banner.enabled) return false;
      if (banner.schedulePublishStart && new Date(banner.schedulePublishStart) > now) return false;
      if (banner.schedulePublishEnd && new Date(banner.schedulePublishEnd) < now) return false;
      return true;
    }).sort((a, b) => a.order - b.order);
  }, [mobileBanners]);

  if (loading) {
    return (
      <section className="py-8 sm:py-12 px-4 sm:px-6">
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
      className="relative overflow-hidden py-6 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#fffafc] via-white to-white"
      aria-label="Shop by category"
    >
      {/* Scrollbar style injection */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Background soft blurs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-[#FFB6C1]/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#E91E63]/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Mobile Banner (Show on mobile/max-width 768px, hide on tablet/desktop) */}
        {activeBanners.length > 0 && (
          <div className="block md:hidden mb-6 px-1">
            {activeBanners.map((banner) => (
              <Link
                key={banner.id}
                to={banner.link || "#"}
                className="relative block w-full h-[90px] rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.08)] bg-gradient-to-r from-pink-100 to-rose-200 border border-white/40 mb-3 last:mb-0 transition-transform active:scale-[0.98] duration-200"
              >
                {banner.image && (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Semi-transparent dark overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent p-4 flex flex-col justify-center text-white">
                  <h4 className="text-sm font-extrabold tracking-wide uppercase leading-tight drop-shadow-sm">
                    {banner.title}
                  </h4>
                  <p className="text-xs text-white/95 mt-0.5 font-medium leading-tight drop-shadow-xs">
                    {banner.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F5] border border-[#f3d7e2]/80 px-3.5 py-1 text-[10px] font-bold tracking-[0.18em] text-[#b53d69] uppercase mb-3.5 shadow-sm">
            <Sparkles className="h-3 w-3 animate-pulse text-[#b53d69]" />
            Curated Gifting Collections
          </div>
          {/* Heading */}
          <h2 className="text-[24px] md:text-[30px] font-extrabold text-gray-900 tracking-[-0.03em] leading-tight font-sans uppercase">
            Shop By Category
          </h2>
          {/* Subtitle */}
          <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed px-2">
            Discover curated luxury floral arrangements, cakes and gifts for every occasion.
          </p>
        </div>

        {/* MOBILE VIEW: Horizontal scroll of circular category items */}
        <div className="md:hidden w-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex gap-4 py-2 px-1">
          {enabledCategories.map((category, index) => (
            <CategoryCircleItem
              key={category.id}
              category={category}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* TABLET VIEW: 4-column grid with circular images for 768px - 1024px */}
        <div className="hidden md:grid lg:hidden grid-cols-4 gap-6 py-2">
          {enabledCategories.map((category, index) => (
            <CategoryCircleItem
              key={category.id}
              category={category}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* DESKTOP VIEW: Premium Elegant Grid Cards (1024px and above) */}
        <div className="hidden lg:grid grid-cols-6 gap-5">
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