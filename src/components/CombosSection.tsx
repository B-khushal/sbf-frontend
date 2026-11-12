import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, Flower2, Cake } from "lucide-react";
import axios from "axios";
import api from "@/services/api";
import { isComboProduct } from "@/utils/comboHelpers";
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

export interface CombosSectionProps {
  section?: {
    title?: string;
    subtitle?: string;
    content?: {
      badgeText?: string;
      ctaText?: string;
      ctaLink?: string;
      showCta?: boolean;
      showPills?: boolean;
      itemsCount?: number;
    };
    [key: string]: any;
  };
  onAddToCart?: (item: any, quantity?: number) => any;
}

export const CombosSection: React.FC<CombosSectionProps> = ({
  section,
  onAddToCart,
}) => {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const title = section?.title || "Flowers & Cakes, Curated for Double Joy";
  const subtitle =
    section?.subtitle ||
    "Experience the magic of paired celebrations. Hand-tied fresh Dutch bouquets bundled with gourmet oven-fresh cakes, Belgian chocolates, and personalized greeting notes.";
  const badgeText = section?.content?.badgeText || "SBF SIGNATURE COMBOS & HAMPERS";
  const ctaText = section?.content?.ctaText || "EXPLORE ALL COMBOS";
  const ctaLink = section?.content?.ctaLink || "/combos";
  const showCta = section?.content?.showCta !== false;
  const showPills = section?.content?.showPills !== false;
  const itemsCount = section?.content?.itemsCount || 12;

  const {
    trackRef,
    canScrollPrev,
    canScrollNext,
    isDragging,
    scrollBy,
    trackProps,
  } = useHorizontalCarousel([combos.length, loading]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchCombosData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products", {
          signal: controller.signal,
        });
        const rawList =
          response.data?.products ||
          (Array.isArray(response.data) ? response.data : []);

        const validCombos = rawList.filter((p: any) => {
          if (!p) return false;
          const cat = String(p.category || "").toLowerCase();
          const catalogType = String(p.catalogType || "").toLowerCase();
          const pTitle = String(p.title || p.name || "").toLowerCase();
          if (cat === "baskets" || cat === "basket" || catalogType === "basket") {
            return false;
          }
          if (
            pTitle.includes("basket") &&
            !pTitle.includes("combo") &&
            catalogType !== "combo"
          ) {
            return false;
          }
          return isComboProduct(p);
        });

        if (isMounted) {
          setCombos(validCombos);
        }
      } catch (err: any) {
        if (axios.isCancel(err) || err?.name === "CanceledError" || err?.name === "AbortError") {
          return;
        }
        console.warn("Could not fetch combos for home section:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCombosData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (!loading && combos.length === 0) {
    return null;
  }

  const visibleCombos = combos.slice(0, itemsCount);

  return (
    <section
      aria-labelledby="combos-section-heading"
      className="relative w-full overflow-x-clip py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#FFF9FA] via-[#FFFDFB] to-white border-b border-[#F2E4E8]/80"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 right-1/3 h-72 w-72 rounded-full bg-[#FCEBF1]/50 blur-3xl"
      />

      <div className={`${SECTION_CONTAINER_CLASS} z-10`}>
        {/* Section Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
          <div className="max-w-2xl">
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B93860]">
                <Gift className="h-3.5 w-3.5 text-[#BE185D]" aria-hidden="true" />
                <span>{badgeText}</span>
              </div>
            )}

            <h2
              id="combos-section-heading"
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

        {/* Subtle Value Highlights Strip */}
        {showPills && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-6 sm:mb-7 text-xs font-medium text-[#544B44]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EFE2E7] bg-white/85 px-3 py-1">
              <Flower2 className="h-3.5 w-3.5 text-[#BE185D]" aria-hidden="true" />
              <span>Fresh Blooms</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EFE6DA] bg-white/85 px-3 py-1">
              <Cake className="h-3.5 w-3.5 text-[#B4813F]" aria-hidden="true" />
              <span>Oven-Fresh Cakes</span>
            </span>
          </div>
        )}

        {/* Single-Row Side-Scroll Combos Carousel */}
        {loading ? (
          <div
            className="flex flex-nowrap gap-3.5 sm:gap-5 overflow-x-hidden py-1"
            aria-busy="true"
            aria-label="Loading signature combo sets"
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`combo-skel-${idx}`} className={CAROUSEL_CARD_WIDTH_CLASS}>
                <EditorialProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <HorizontalCarouselTrack
            trackRef={trackRef}
            isDragging={isDragging}
            trackProps={trackProps}
            ariaLabel="Curated gift combos carousel"
            canScrollPrev={canScrollPrev}
            canScrollNext={canScrollNext}
            onScrollPrev={() => scrollBy(-1)}
            onScrollNext={() => scrollBy(1)}
            prevLabel="Previous combo sets"
            nextLabel="Next combo sets"
          >
            {visibleCombos.map((combo, index) => (
              <div
                key={String(combo._id || combo.id || index)}
                className={CAROUSEL_CARD_WIDTH_CLASS}
              >
                <EditorialProductCard
                  product={combo}
                  index={index}
                  contextLabel="Combo Gift Set"
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

export default CombosSection;
