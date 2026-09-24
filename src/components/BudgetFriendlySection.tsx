import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, HeartHandshake } from "lucide-react";
import api from "@/services/api";
import { Product, ProductCard } from "./ProductGrid";
import { ProductCardSkeleton } from "./HomePageSkeleton";

interface BudgetFriendlySectionProps {
  section?: {
    title?: string;
    subtitle?: string;
    styling?: {
      background?: string;
      padding?: string;
      spacing?: string;
      animation?: string;
    };
    content?: {
      tagline?: string;
      showTagline?: boolean;
      taglineIcon?: string;
      ctaText?: string;
      ctaLink?: string;
      showCta?: boolean;
      maxProducts?: number;
    };
  };
  onAddToCart?: (item: any, quantity: number) => boolean;
}

const renderTaglineIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Heart':
      return <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />;
    case 'Gift':
      return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
    case 'Star':
      return <Sparkles className="w-3.5 h-3.5 text-yellow-500" />;
    case 'Sparkles':
    default:
      return <Sparkles className="w-3.5 h-3.5 text-bloom-pink-600" />;
  }
};

export const BudgetFriendlySection: React.FC<BudgetFriendlySectionProps> = ({
  section,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const title = section?.title || "Beautiful Gifts, Thoughtfully Priced";
  const subtitle =
    section?.subtitle ||
    "Discover elegant bouquets and gifts starting from ₹399 — all thoughtfully selected under ₹1,000.";
  const tagline = section?.content?.tagline !== undefined ? section.content.tagline : "Affordable • Elegant • Thoughtfully Designed";
  const showTagline = section?.content?.showTagline !== false && Boolean(tagline);
  const taglineIcon = section?.content?.taglineIcon || "Sparkles";
  const ctaText = section?.content?.ctaText || "Explore Budget Friendly";
  const ctaLink = section?.content?.ctaLink || "/shop/budget-friendly";
  const showCta = section?.content?.showCta !== false && Boolean(ctaText);
  const maxProducts = section?.content?.maxProducts || 8;
  const customBackground = section?.styling?.background;
  const customPadding = section?.styling?.padding || "py-14 sm:py-20";

  useEffect(() => {
    let isMounted = true;
    const fetchBudgetProducts = async () => {
      try {
        setLoading(true);
        // Call our specialized budget-friendly endpoint or products query
        const response = await api.get("/products", {
          params: { category: "budget-friendly", limit: maxProducts },
        });

        const rawList =
          response.data?.products ||
          (Array.isArray(response.data) ? response.data : []);

        const normalized: Product[] = rawList.map((p: any) => ({
          ...p,
          _id: p._id || p.id,
          id: p._id || p.id,
          isNewArrival:
            typeof p.isNewArrival === "boolean" ? p.isNewArrival : Boolean(p.isNew),
        }));

        if (isMounted) {
          setProducts(normalized.slice(0, maxProducts));
        }
      } catch (err) {
        console.warn("Could not fetch budget-friendly products:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBudgetProducts();
    return () => {
      isMounted = false;
    };
  }, [maxProducts]);

  // If loading has completed and no products match, do not render a broken or empty banner on homepage
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section 
      className={`relative ${customPadding} ${customBackground || 'bg-gradient-to-b from-stone-50/60 via-amber-50/20 to-white'} overflow-hidden`}
    >
      {/* Subtle luxury ambient backdrops */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-5">
          <div className="max-w-2xl">
            {/* Tagline / Eyebrow */}
            {showTagline && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200/60 text-bloom-dark text-xs sm:text-sm font-medium tracking-wide mb-3 shadow-sm">
                {renderTaglineIcon(taglineIcon)}
                <span>{tagline}</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Desktop CTA */}
          {showCta && (
            <div className="hidden md:flex items-center shrink-0">
              <Link
                to={ctaLink}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-black text-sm font-medium transition-all duration-200 shadow-sm hover:shadow hover:gap-3"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        {showCta && (
          <div className="mt-8 text-center md:hidden">
            <Link
              to={ctaLink}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-black text-sm font-medium transition-all duration-200 shadow-sm"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BudgetFriendlySection;
