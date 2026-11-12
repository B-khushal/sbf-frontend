import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, HeartHandshake } from "lucide-react";
import axios from "axios";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import { Product } from "./ProductGrid";
import {
  CAROUSEL_CARD_WIDTH_CLASS,
  HorizontalCarouselTrack,
  SECTION_CONTAINER_CLASS,
  useHorizontalCarousel,
} from "./HorizontalProductCarousel";
import {
  EditorialProductCard,
  EditorialProductCardSkeleton,
} from "./EditorialProductCard";

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
  onAddToCart?: (item: any, quantity: number) => any;
}

const renderTaglineIcon = (iconName?: string) => {
  switch (iconName) {
    case "Heart":
      return <HeartHandshake className="w-3.5 h-3.5 text-[#BE185D]" aria-hidden="true" />;
    case "Gift":
    case "Star":
      return <Sparkles className="w-3.5 h-3.5 text-[#B8862D]" aria-hidden="true" />;
    case "Sparkles":
    default:
      return <Sparkles className="w-3.5 h-3.5 text-[#BE185D]" aria-hidden="true" />;
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
  const tagline =
    section?.content?.tagline !== undefined
      ? section.content.tagline
      : "Affordable • Elegant • Thoughtfully Designed";
  const showTagline = section?.content?.showTagline !== false && Boolean(tagline);
  const taglineIcon = section?.content?.taglineIcon || "Sparkles";
  const ctaText = section?.content?.ctaText || "Explore Budget Friendly";
  const ctaLink = section?.content?.ctaLink || "/shop/budget-friendly";
  const showCta = section?.content?.showCta !== false && Boolean(ctaText);
  const maxProducts = section?.content?.maxProducts || 12;
  const customBackground = section?.styling?.background;
  const customPadding = section?.styling?.padding || "py-12 sm:py-16 lg:py-20";

  const {
    trackRef,
    canScrollPrev,
    canScrollNext,
    isDragging,
    scrollBy,
    trackProps,
  } = useHorizontalCarousel([products.length, loading]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchBudgetProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products", {
          params: { category: "budget-friendly", limit: maxProducts },
          signal: controller.signal,
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
      } catch (err: any) {
        if (axios.isCancel(err) || err?.name === "CanceledError" || err?.name === "AbortError") {
          return;
        }
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
      controller.abort();
    };
  }, [maxProducts]);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="budget-friendly-heading"
      className={`relative w-full overflow-x-clip ${customPadding} ${
        customBackground || "bg-gradient-to-b from-[#FAF8F5] via-[#FDFBF8] to-white"
      } border-b border-[#EFE8E0]/80`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-[#FCEBF1]/45 blur-3xl"
      />

      <div className={cn(SECTION_CONTAINER_CLASS, "z-10")}>
        {/* Section Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-7 sm:mb-9">
          <div className="max-w-2xl">
            {showTagline && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B93860]">
                {renderTaglineIcon(taglineIcon)}
                <span>{tagline}</span>
              </div>
            )}

            <h2
              id="budget-friendly-heading"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="mt-2 text-[26px] sm:text-[32px] lg:text-[36px] font-semibold leading-[1.15] tracking-[-0.015em] text-[#1E1B18]"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#645C54]">
              {subtitle}
            </p>
          </div>

          {showCta && (
            <div className="hidden md:flex items-center shrink-0">
              <Link
                to={ctaLink}
                className="inline-flex items-center gap-2 rounded-full border border-[#E3D8CD] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2B2522] transition-all duration-200 hover:border-[#DFB4C4] hover:bg-[#FFF9FB] hover:text-[#BE185D]"
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/* Single-Row Side-Scroll Product Carousel */}
        {loading ? (
          <div
            className="flex flex-nowrap gap-3.5 sm:gap-5 overflow-x-hidden py-1"
            aria-busy="true"
            aria-label="Loading budget-friendly gifts"
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`budget-skel-${idx}`} className={CAROUSEL_CARD_WIDTH_CLASS}>
                <EditorialProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <HorizontalCarouselTrack
            trackRef={trackRef}
            isDragging={isDragging}
            trackProps={trackProps}
            ariaLabel="Budget-friendly floral gifts carousel"
            canScrollPrev={canScrollPrev}
            canScrollNext={canScrollNext}
            onScrollPrev={() => scrollBy(-1)}
            onScrollNext={() => scrollBy(1)}
            prevLabel="Previous budget-friendly gifts"
            nextLabel="Next budget-friendly gifts"
          >
            {products.map((product, index) => (
              <div
                key={String(product._id || (product as any).id || index)}
                className={CAROUSEL_CARD_WIDTH_CLASS}
              >
                <EditorialProductCard
                  product={product}
                  index={index}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </HorizontalCarouselTrack>
        )}

        {/* Mobile / Centered Bottom CTA */}
        {showCta && (
          <div className="mt-7 flex justify-center md:hidden">
            <Link
              to={ctaLink}
              className="inline-flex items-center gap-2 rounded-full border border-[#E3D8CD] bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2B2522] transition-colors hover:border-[#DFB4C4] hover:text-[#BE185D]"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BudgetFriendlySection;
