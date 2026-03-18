import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { ArrowUpRight, Flower2, Gift, Heart, Leaf, Sparkles } from 'lucide-react';

const CATEGORY_QUERY_ALIASES: Record<string, string> = {
  anivarsery: 'anniversary',
  aniversary: 'anniversary',
};

const toCategoryQueryValue = (name: string) =>
  {
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
      { threshold: 0.2 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  // If no categories are available, don't render the section
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#fff7fa] via-[#fffafb] to-[#f9f9f9]"
      aria-label="Shop by category"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-[#FFB6C1]/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#E91E63]/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#f3d7e2] px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#b53d69] uppercase mb-5">
            <Flower2 className="h-3.5 w-3.5" />
            Curated Categories
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2C2C2C] leading-tight">
            Explore Our Beautiful Collections
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#5e5e5e] max-w-2xl mx-auto leading-relaxed">
            Discover curated floral arrangements for every occasion.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              isVisible={isVisible}
              delay={index * 0.06}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface CategoryType {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  enabled: boolean;
  order: number;
}

interface CategoryCardProps {
  category: CategoryType;
  isVisible: boolean;
  delay: number;
}

const CategoryCard = ({ category, isVisible, delay }: CategoryCardProps) => {
  const Icon = pickCategoryIcon(category.name);

  return (
    <Link
      to={`/shop?category=${encodeURIComponent(toCategoryQueryValue(category.name))}`}
      aria-label={`Browse ${category.name}`}
      className="group relative block overflow-hidden rounded-[18px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_38px_rgba(19,14,17,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63]/60 focus-visible:ring-offset-2"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(22px)',
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s, box-shadow 0.3s ease, translate 0.3s ease`,
      }}
    >
      <div className="relative aspect-[4/5] min-h-[180px]">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

        <div className="relative z-10 h-full flex flex-col justify-between p-3 sm:p-4">
          <div className="self-start inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/35 transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-md transition-colors duration-300 group-hover:text-[#ffe6ef]">
              {category.name}
            </h3>
            <p className="mt-1 text-[11px] sm:text-xs leading-4 text-white/80 line-clamp-2">
              {category.description}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-white/85 transition-all duration-300 group-hover:text-white">
              Shop now
              <ArrowUpRight className="h-3.5 w-3.5 translate-y-[0.5px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[18px] border border-white/40 transition-colors duration-300 group-hover:border-white/60" />
    </Link>
  );
};

export default Categories;