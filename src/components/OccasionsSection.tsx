import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import axios from "axios";
import {
  ArrowRight,
  Award,
  Baby,
  Briefcase,
  Cake,
  Calendar,
  CalendarHeart,
  Crown,
  Flame,
  Flower,
  Flower2,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Moon,
  PartyPopper,
  RefreshCw,
  Ribbon,
  ShoppingBag,
  Smile,
  Sparkles,
  Star,
  Sun,
  Users,
} from "lucide-react";
import productService, { OccasionData, ProductData } from "@/services/productService";
import { cn } from "@/lib/utils";
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

const OCCASION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gift,
  Cake,
  Heart,
  Sparkles,
  PartyPopper,
  Crown,
  Award,
  Baby,
  Flower,
  Flower2,
  Sun,
  Moon,
  Star,
  Ribbon,
  ShoppingBag,
  Users,
  Smile,
  Flame,
  Home,
  Briefcase,
  Gem,
  GraduationCap,
  Calendar,
  CalendarHeart,
};

const OccasionIcon = ({ name, className }: { name?: string; className?: string }) => {
  const Icon = (name && OCCASION_ICON_MAP[name]) || Sparkles;
  return <Icon className={className} aria-hidden="true" />;
};

export interface OccasionsSectionProps {
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
      maxProducts?: number;
      showRatings?: boolean;
      showReviews?: boolean;
    };
  };
  onAddToCart?: (item: any, quantity?: number) => any;
}

export const OccasionsSection: React.FC<OccasionsSectionProps> = ({
  section,
  onAddToCart,
}) => {
  const [occasions, setOccasions] = useState<OccasionData[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loadingOccasions, setLoadingOccasions] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState<number>(0);

  // Tab bar scroll cues & auto-scroll refs
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabButtonsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const [tabFadeLeft, setTabFadeLeft] = useState<boolean>(false);
  const [tabFadeRight, setTabFadeRight] = useState<boolean>(false);

  // In-memory occasion products cache & active AbortController
  const productsCacheRef = useRef<Map<string, ProductData[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const maxProducts = section?.content?.maxProducts || 15;
  const showRatings = section?.content?.showRatings !== false;
  const showReviews = section?.content?.showReviews !== false;

  const selectedOccasion =
    occasions.find((occ) => occ.slug === selectedSlug) || occasions[0] || null;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const {
    trackRef,
    canScrollPrev,
    canScrollNext,
    isDragging,
    scrollBy,
    trackProps,
  } = useHorizontalCarousel([products.length, loadingProducts], selectedSlug);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 1. Fetch active homepage occasions from live DB
  useEffect(() => {
    let mounted = true;
    const loadOccasions = async () => {
      try {
        setLoadingOccasions(true);
        const list = await productService.getOccasions(true);
        if (!mounted) return;
        const activeList = Array.isArray(list)
          ? list.filter((occ) => occ && occ.isActive !== false && occ.slug)
          : [];
        setOccasions(activeList);
        if (activeList.length > 0) {
          setSelectedSlug((prev) =>
            prev && activeList.some((o) => o.slug === prev) ? prev : activeList[0].slug
          );
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load occasions:", err);
        setOccasions([]);
      } finally {
        if (mounted) {
          setLoadingOccasions(false);
        }
      }
    };
    loadOccasions();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch products for selected occasion with cache + AbortController cancellation
  useEffect(() => {
    if (!selectedSlug) return;

    const cached = productsCacheRef.current.get(selectedSlug);
    if (cached) {
      setProducts(cached);
      setFetchError(null);
      setLoadingProducts(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let isCurrent = true;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setFetchError(null);
        const response = await productService.getProductsByOccasion(
          selectedSlug,
          controller.signal
        );
        if (!isCurrent || controller.signal.aborted) return;

        const fetchedProducts = Array.isArray(response?.products)
          ? response.products.slice(0, maxProducts)
          : [];
        productsCacheRef.current.set(selectedSlug, fetchedProducts);
        setProducts(fetchedProducts);
      } catch (err: any) {
        if (
          axios.isCancel(err) ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }
        if (!isCurrent) return;
        console.error("Error loading occasion products:", err);
        setFetchError("Unable to load curated gifts right now.");
      } finally {
        if (isCurrent && !controller.signal.aborted) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [selectedSlug, maxProducts, retryToken]);

  // 3. Keep active tab scrolled smoothly into view & track tab overflow edge fades
  const updateTabFades = useCallback(() => {
    const el = tabListRef.current;
    if (!el) return;
    setTabFadeLeft(el.scrollLeft > 8);
    setTabFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = tabListRef.current;
    if (!el) return;
    updateTabFades();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateTabFades())
        : null;
    ro?.observe(el);

    return () => ro?.disconnect();
  }, [occasions, updateTabFades]);

  useEffect(() => {
    if (!selectedSlug) return;
    const btn = tabButtonsRef.current[selectedSlug];
    if (btn) {
      btn.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  }, [selectedSlug, prefersReducedMotion]);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (occasions.length === 0) return;
    let nextIdx = -1;
    if (e.key === "ArrowRight") {
      nextIdx = (index + 1) % occasions.length;
    } else if (e.key === "ArrowLeft") {
      nextIdx = (index - 1 + occasions.length) % occasions.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = occasions.length - 1;
    }

    if (nextIdx >= 0) {
      e.preventDefault();
      const targetOccasion = occasions[nextIdx];
      setSelectedSlug(targetOccasion.slug);
      tabButtonsRef.current[targetOccasion.slug]?.focus();
    }
  };

  if (!loadingOccasions && occasions.length === 0) {
    return null;
  }

  const exploreHref = selectedOccasion?.slug
    ? `/occasions/${selectedOccasion.slug}`
    : "/occasions";

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="shop-by-occasion-heading"
        className="relative w-full overflow-x-clip bg-[#FAF8F5] border-y border-[#ECE3DA]/80 py-12 sm:py-16 lg:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#FCEBF1]/50 blur-3xl"
        />

        <div className={SECTION_CONTAINER_CLASS}>
          {/* 1. Compact Editorial Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B93860]">
                CURATED FOR EVERY MOMENT.
              </p>
              <h2
                id="shop-by-occasion-heading"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="mt-2 text-[28px] sm:text-[34px] lg:text-[38px] font-semibold leading-[1.15] tracking-[-0.015em] text-[#1E1B18]"
              >
                {section?.title || "Shop by Occasion"}
              </h2>
              <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#645C54]">
                Find the perfect flowers, cakes and thoughtful gifts for every celebration.
              </p>
            </div>
          </div>

          {/* 2. Single-Row Horizontally Scrollable Occasion Tab Bar */}
          <div className="relative mt-7 sm:mt-8 border-b border-[#E9E0D7]">
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#FAF8F5] to-transparent transition-opacity duration-200",
                tabFadeLeft ? "opacity-100" : "opacity-0"
              )}
            />
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#FAF8F5] to-transparent transition-opacity duration-200",
                tabFadeRight ? "opacity-100" : "opacity-0"
              )}
            />

            <div
              ref={tabListRef}
              role="tablist"
              aria-label="Browse gifts by occasion"
              onScroll={updateTabFades}
              className="flex flex-nowrap items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar py-0.5 touch-pan-x"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {loadingOccasions
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={`occ-tab-skel-${idx}`}
                      className="my-2.5 h-5 w-24 shrink-0 rounded-full bg-[#ECE5DD] animate-pulse"
                    />
                  ))
                : occasions.map((occ, idx) => {
                    const isSelected = selectedOccasion?.slug === occ.slug;
                    return (
                      <button
                        key={occ._id || occ.slug}
                        ref={(el) => {
                          tabButtonsRef.current[occ.slug] = el;
                        }}
                        id={`occasion-tab-${occ.slug}`}
                        role="tab"
                        type="button"
                        aria-selected={isSelected}
                        aria-controls="occasion-products-panel"
                        tabIndex={isSelected ? 0 : -1}
                        onClick={() => setSelectedSlug(occ.slug)}
                        onKeyDown={(e) => handleTabKeyDown(e, idx)}
                        className={cn(
                          "relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap pb-3 pt-2 text-[13.5px] sm:text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:text-[#BE185D]",
                          isSelected
                            ? "text-[#BE185D]"
                            : "text-[#6D645B] hover:text-[#1E1B18]"
                        )}
                      >
                        <OccasionIcon
                          name={occ.icon}
                          className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
                            isSelected ? "text-[#BE185D]" : "text-[#9A8E83]"
                          )}
                        />
                        <span>{occ.name}</span>

                        {isSelected && (
                          <motion.span
                            layoutId="shop-by-occasion-active-tab"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#BE185D]"
                          />
                        )}
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* 3. Single Horizontal Product Carousel Panel */}
          <div
            id="occasion-products-panel"
            role="tabpanel"
            aria-labelledby={
              selectedOccasion ? `occasion-tab-${selectedOccasion.slug}` : undefined
            }
            className="relative mt-6 sm:mt-8 min-h-[340px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {loadingOccasions || loadingProducts ? (
                <motion.div
                  key="occasion-loading"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-nowrap gap-3.5 sm:gap-5 overflow-x-hidden py-1"
                  aria-busy="true"
                  aria-label="Loading curated occasion gifts"
                >
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`card-skel-${idx}`} className={CAROUSEL_CARD_WIDTH_CLASS}>
                      <EditorialProductCardSkeleton />
                    </div>
                  ))}
                </motion.div>
              ) : fetchError ? (
                <motion.div
                  key="occasion-error"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#EDE5DD] bg-white/80 px-6 py-12 text-center"
                >
                  <p className="text-sm font-medium text-[#2E2824]">{fetchError}</p>
                  <button
                    type="button"
                    onClick={() => setRetryToken((prev) => prev + 1)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#BE185D] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9D174D]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Try Again</span>
                  </button>
                </motion.div>
              ) : products.length === 0 ? (
                <motion.div
                  key={`occasion-empty-${selectedOccasion?.slug || "none"}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#EDE5DD] bg-white/75 px-6 py-12 text-center"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FDF0F4] text-[#BE185D]">
                    <OccasionIcon name={selectedOccasion?.icon} className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-base font-medium text-[#1E1B18]">
                    {selectedOccasion
                      ? `New arrangements for ${selectedOccasion.name} are being curated.`
                      : "Explore our floral collections."}
                  </p>
                  <p className="mt-1 max-w-md text-xs sm:text-sm text-[#6E655C]">
                    Browse our full catalog of fresh flowers, handcrafted bouquets, cakes and gifts.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#DEC9D2] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#BE185D] transition-colors hover:bg-[#FFF5F8]"
                  >
                    <span>Browse Full Catalog</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key={`occasion-track-${selectedOccasion?.slug || "active"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HorizontalCarouselTrack
                    trackRef={trackRef}
                    isDragging={isDragging}
                    trackProps={trackProps}
                    ariaLabel={`${selectedOccasion?.name || "Occasion"} gift carousel`}
                    canScrollPrev={canScrollPrev}
                    canScrollNext={canScrollNext}
                    onScrollPrev={() => scrollBy(-1)}
                    onScrollNext={() => scrollBy(1)}
                    prevLabel="Scroll previous occasion gifts"
                    nextLabel="Scroll next occasion gifts"
                  >
                    {products.map((product, index) => (
                      <div
                        key={String(product._id || (product as any).id || index)}
                        className={CAROUSEL_CARD_WIDTH_CLASS}
                      >
                        <EditorialProductCard
                          product={product}
                          index={index}
                          contextLabel={selectedOccasion?.name}
                          showRatings={showRatings}
                          showReviews={showReviews}
                          onAddToCart={onAddToCart}
                        />
                      </div>
                    ))}
                  </HorizontalCarouselTrack>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Centered Minimal Bottom Navigation Link */}
          <div className="mt-8 sm:mt-10 flex justify-center">
            <Link
              to={exploreHref}
              className="group inline-flex items-center gap-2 rounded-full border border-[#E5D9CE] bg-white/85 px-5 py-2.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#2B2522] transition-all duration-200 hover:border-[#DFB4C4] hover:bg-[#FFF9FB] hover:text-[#BE185D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D]"
            >
              <span>
                {selectedOccasion?.name
                  ? `EXPLORE ALL ${selectedOccasion.name.toUpperCase()} GIFTS`
                  : "EXPLORE ALL OCCASION GIFTS"}
              </span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
};

export default OccasionsSection;
