import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Cake } from "lucide-react";
import axios from "axios";
import api from "@/services/api";
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

interface CakesSectionProps {
  onAddToCart?: (item: any, quantity: number) => any;
  section?: {
    title?: string;
    subtitle?: string;
    content?: {
      badgeText?: string;
      ctaText?: string;
      ctaLink?: string;
      showCta?: boolean;
      itemsCount?: number;
    };
    [key: string]: any;
  };
}

export const CakesSection: React.FC<CakesSectionProps> = ({ onAddToCart, section }) => {
  const [cakes, setCakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const title = section?.title || "Cakes, Made for Every Celebration";
  const subtitle =
    section?.subtitle ||
    "Freshly crafted cakes to make every special moment a little sweeter. Baked to order with pure ingredients and delivered fresh across the city.";
  const badgeText = section?.content?.badgeText || "NOW SERVING CAKES";
  const ctaText = section?.content?.ctaText || "EXPLORE CAKES";
  const ctaLink = section?.content?.ctaLink || "/cakes";
  const showCta = section?.content?.showCta !== false;
  const itemsCount = section?.content?.itemsCount || 12;

  const {
    trackRef,
    canScrollPrev,
    canScrollNext,
    isDragging,
    scrollBy,
    trackProps,
  } = useHorizontalCarousel([cakes.length, loading]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchCakesData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products", {
          params: { category: "cakes" },
          signal: controller.signal,
        });

        const rawList =
          response.data?.products ||
          (Array.isArray(response.data) ? response.data : []);

        const validCakes: any[] = [];
        rawList.forEach((prod: any) => {
          const isCombo =
            prod.catalogType === "combo" ||
            prod.category === "combos" ||
            prod.subcategory?.includes("combo") ||
            (Array.isArray(prod.categories) &&
              prod.categories.some((c: string) => typeof c === "string" && c.includes("combo"))) ||
            (Array.isArray(prod.details?.categories) &&
              prod.details.categories.some((c: string) => typeof c === "string" && c.includes("combo")));

          if (!isCombo) {
            validCakes.push(prod);
          }
        });

        if (isMounted) {
          setCakes(validCakes);
        }
      } catch (err: any) {
        if (axios.isCancel(err) || err?.name === "CanceledError" || err?.name === "AbortError") {
          return;
        }
        console.warn("Could not fetch cakes from API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCakesData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (!loading && cakes.length === 0) {
    return null;
  }

  const visibleCakes = cakes.slice(0, itemsCount);

  return (
    <section
      aria-labelledby="cakes-section-heading"
      className="relative w-full overflow-x-clip py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#FAF6F0] via-[#FFFDF9] to-white border-b border-[#EFE6DA]/80"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-[#F5E6CC]/35 blur-3xl"
      />

      <div className={`${SECTION_CONTAINER_CLASS} z-10`}>
        {/* Section Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-7 sm:mb-9">
          <div className="max-w-2xl">
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9A6B2F]">
                <Cake className="h-3.5 w-3.5 text-[#B4813F]" aria-hidden="true" />
                <span>{badgeText}</span>
              </div>
            )}

            <h2
              id="cakes-section-heading"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="mt-2 text-[26px] sm:text-[32px] lg:text-[36px] font-semibold leading-[1.15] tracking-[-0.015em] text-[#1E1B18]"
            >
              {title}
            </h2>

            {subtitle && (
              <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#645C54]">
                {subtitle}
              </p>
            )}
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

        {/* Single-Row Side-Scroll Cakes Carousel */}
        {loading ? (
          <div
            className="flex flex-nowrap gap-3.5 sm:gap-5 overflow-x-hidden py-1"
            aria-busy="true"
            aria-label="Loading celebration cakes"
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`cake-skel-${idx}`} className={CAROUSEL_CARD_WIDTH_CLASS}>
                <EditorialProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <HorizontalCarouselTrack
            trackRef={trackRef}
            isDragging={isDragging}
            trackProps={trackProps}
            ariaLabel="Celebration cakes carousel"
            canScrollPrev={canScrollPrev}
            canScrollNext={canScrollNext}
            onScrollPrev={() => scrollBy(-1)}
            onScrollNext={() => scrollBy(1)}
            prevLabel="Previous cakes"
            nextLabel="Next cakes"
          >
            {visibleCakes.map((cake, index) => (
              <div
                key={String(cake._id || cake.id || index)}
                className={CAROUSEL_CARD_WIDTH_CLASS}
              >
                <EditorialProductCard
                  product={cake}
                  index={index}
                  contextLabel={cake.cakeAttributes?.flavor || "Artisan Cake"}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </HorizontalCarouselTrack>
        )}

        {/* Mobile CTA */}
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

export default CakesSection;
