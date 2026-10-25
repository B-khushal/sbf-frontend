import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { ArrowUpRight, Flower2, Gift, Heart, Leaf, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { CategorySkeleton } from './HomePageSkeleton';
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

const getCategoryUrl = (category: any): string => {
  if (!category) return '/shop';

  const normalizedName = (category.name || '').toLowerCase().trim();
  const slug = (category.slug || toCategoryQueryValue(category.name || '')).toLowerCase().trim();

  // Explicit route for Cakes collection
  if (normalizedName === 'cakes' || slug === 'cakes') {
    return '/cakes';
  }

  // If a direct categoryUrl or link exists on the category object
  const directUrl = category.categoryUrl || category.link;
  if (typeof directUrl === 'string') {
    const trimmed = directUrl.trim();
    if (trimmed.startsWith('/')) {
      if (trimmed.toLowerCase().includes('category=cakes')) {
        return '/cakes';
      }
      return trimmed;
    }
  }

  // Default clean slug route e.g. /flowers, /birthday, /anniversary
  if (slug) {
    return `/${slug}`;
  }

  return '/shop';
};

const CategoryCircleItem = ({ category, index, isVisible }: { category: any; index: number; isVisible: boolean }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const href = getCategoryUrl(category);

  return (
    <Link
      to={href}
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

interface CategoryCardProps {
  category: any;
  isVisible: boolean;
  delay: number;
  onCardClick?: (e: React.MouseEvent) => void;
}

const CategoryCard = ({ category, isVisible, delay, onCardClick }: CategoryCardProps) => {
  const Icon = pickCategoryIcon(category.name || '');
  const href = getCategoryUrl(category);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      to={href}
      onClick={onCardClick}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-white",
        "shadow-[0_4px_18px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-pink-300/70",
        "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(236,72,153,0.15)]",
        "w-[150px] xs:w-[165px] sm:w-[190px] md:w-[215px] lg:w-[230px] xl:w-[245px] 2xl:w-[260px] 3xl:w-[275px]",
        "flex-shrink-0 snap-start select-none"
      )}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(15px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s, box-shadow 0.3s ease, translate 0.3s ease, border-color 0.3s ease`,
      }}
    >
      <div className="relative aspect-[4/5] min-h-[180px] xs:min-h-[200px] sm:min-h-[230px] md:min-h-[250px]">
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
        )}

        {/* Category Image */}
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Multi-stop soft dark gradient for guaranteed legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-45% to-black/5 transition-opacity duration-300 group-hover:from-black/90" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-3.5 sm:p-4 text-white">
          <div className="self-start inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25 shadow-sm transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>

          <div>
            <h3 className="text-xs sm:text-sm md:text-[15px] font-bold text-white tracking-wide group-hover:text-pink-100 transition-colors line-clamp-1 drop-shadow-sm">
              {category.name}
            </h3>
            <p className="mt-0.5 text-[9px] sm:text-[10px] md:text-[11px] text-white/75 line-clamp-1 font-medium leading-normal drop-shadow-xs">
              {category.description || 'Explore collection'}
            </p>
            <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-white/90 group-hover:text-white transition-colors">
              <span>Shop Now</span>
              <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Backwards-compatible alias
const DesktopCategoryCard = CategoryCard;

interface CategoriesProps {
  title?: string;
  subtitle?: string;
}

const Categories = ({ title, subtitle }: CategoriesProps) => {
  const { categories, mobileBanners, loading } = useSettings();
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse drag-to-scroll tracking
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

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

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    } else {
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    // Initial check after rendering
    const timer = setTimeout(checkScroll, 250);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, [checkScroll, categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 260);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.25;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

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
    return <CategorySkeleton />;
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
      className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-10 md:pb-14 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#fffafc] via-white to-white"
      aria-label="Shop by category and occasion"
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

      <div className="relative w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
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
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F5] border border-[#f3d7e2]/80 px-3.5 py-1 text-[10px] font-bold tracking-[0.18em] text-[#b53d69] uppercase mb-3 shadow-sm">
            <Sparkles className="h-3 w-3 animate-pulse text-[#b53d69]" />
            Curated Gifting Collections
          </div>
          {/* Heading */}
          <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-extrabold text-gray-900 tracking-[-0.03em] leading-tight font-sans uppercase">
            {title || "Shop By Category"}
          </h2>
          {/* Subtitle */}
          <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed px-2">
            {subtitle || "Discover curated luxury floral arrangements, cakes and gifts for every occasion."}
          </p>
        </div>

        {/* MOBILE VIEW: Horizontal scroll of circular category items */}
        <div className="md:hidden w-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex gap-4 py-2 px-1">
          {enabledCategories.map((category, index) => (
            <CategoryCircleItem
              key={category.id || category._id || index}
              category={category}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* DESKTOP & TABLET VIEW: Single-Row Side-Scrolling Cards */}
        <div className="hidden md:block relative group/carousel -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Floating Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={cn(
              "absolute -left-2 sm:-left-3 md:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-30",
              "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full",
              "bg-white/95 backdrop-blur-md border border-pink-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.14)]",
              "flex items-center justify-center text-gray-800 transition-all duration-200",
              "hover:bg-primary hover:text-white hover:border-primary hover:scale-110 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-primary/40",
              canScrollLeft
                ? "opacity-100 cursor-pointer pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Floating Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={cn(
              "absolute -right-2 sm:-right-3 md:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-30",
              "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full",
              "bg-white/95 backdrop-blur-md border border-pink-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.14)]",
              "flex items-center justify-center text-gray-800 transition-all duration-200",
              "hover:bg-primary hover:text-white hover:border-primary hover:scale-110 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-primary/40",
              canScrollRight
                ? "opacity-100 cursor-pointer pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Single-Row Side-Scrolling Container */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={cn(
              "flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth",
              "snap-x snap-mandatory py-2.5 px-1 items-stretch",
              "cursor-grab active:cursor-grabbing select-none"
            )}
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {enabledCategories.map((category, index) => (
              <CategoryCard
                key={category.id || category._id || index}
                category={category}
                isVisible={isVisible}
                delay={index * 0.04}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          {/* Sleek Scroll Progress Bar at the Bottom */}
          {enabledCategories.length > 3 && (
            <div className="flex items-center justify-center mt-5 sm:mt-7">
              <div className="relative h-1 sm:h-1.5 w-28 sm:w-36 bg-pink-100/80 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-150"
                  style={{
                    width: '35%',
                    left: `${(scrollProgress / 100) * 65}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
export { DesktopCategoryCard };