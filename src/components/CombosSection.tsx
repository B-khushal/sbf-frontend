import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Gift, Sparkles, Flower2, Cake } from "lucide-react";
import api from "@/services/api";
import { CakeComboCard } from "./cakes/CakeComboCard";
import { Button } from "@/components/ui/button";
import { isComboProduct } from "@/utils/comboHelpers";

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
}

export const CombosSection: React.FC<CombosSectionProps> = ({ section }) => {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const title = section?.title || "Flowers & Cakes, Curated for Double Joy";
  const subtitle = section?.subtitle || "Experience the magic of paired celebrations. Hand-tied fresh Dutch bouquets bundled with gourmet oven-fresh cakes, Belgian chocolates, and personalized greeting notes.";
  const badgeText = section?.content?.badgeText || "SBF SIGNATURE COMBOS & HAMPERS";
  const ctaText = section?.content?.ctaText || "EXPLORE ALL COMBOS";
  const ctaLink = section?.content?.ctaLink || "/combos";
  const showCta = section?.content?.showCta !== false;
  const showPills = section?.content?.showPills !== false;
  const itemsCount = section?.content?.itemsCount || 8;

  useEffect(() => {
    let isMounted = true;

    const fetchCombosData = async () => {
      try {
        setLoading(true);
        // Fetch all products to discover all combos regardless of catalog type or subcategory
        const response = await api.get("/products");
        const rawList = response.data?.products || (Array.isArray(response.data) ? response.data : []);

        const validCombos = rawList.filter((p: any) => {
          if (!p) return false;
          // Guard against baskets
          const cat = String(p.category || "").toLowerCase();
          const catalogType = String(p.catalogType || "").toLowerCase();
          const title = String(p.title || p.name || "").toLowerCase();
          if (cat === "baskets" || cat === "basket" || catalogType === "basket") {
            return false;
          }
          if (title.includes("basket") && !title.includes("combo") && catalogType !== "combo") {
            return false;
          }
          return isComboProduct(p);
        });

        if (isMounted) {
          setCombos(validCombos);
        }
      } catch (err) {
        console.warn("Could not fetch combos for home section:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCombosData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = Math.min(scrollRef.current.offsetWidth * 0.8, 600);
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-[#fffbf8] via-[#fff7f7] to-white overflow-hidden border-y border-rose-100/60">
      {/* Ambient Luxury Lighting Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="space-y-3">
            {/* Brand Capsule Badge */}
            {badgeText && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-950 text-xs font-bold tracking-wider uppercase">
                <Gift className="w-3.5 h-3.5 text-rose-600" />
                <span>{badgeText}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
            )}

            {/* Main Title */}
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-serif leading-tight">
              {title}
            </h2>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action Links & Horizontal Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Horizontal Arrow Controls (Desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleScroll("left")}
                aria-label="Previous combos"
                className="w-10 h-10 rounded-full border-rose-200 bg-white/90 hover:bg-rose-50 text-slate-700 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleScroll("right")}
                aria-label="Next combos"
                className="w-10 h-10 rounded-full border-rose-200 bg-white/90 hover:bg-rose-50 text-slate-700 shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Premium CTA Link */}
            {showCta && (
              <Link
                to={ctaLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-800 to-rose-900 hover:from-rose-900 hover:to-rose-950 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all duration-300 hover:shadow-lg group"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Value Highlights Pill Strip */}
        {showPills && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-10 text-[11px] sm:text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5 bg-white/80 border border-rose-100 px-3 py-1.5 rounded-xl shadow-2xs backdrop-blur-xs">
              <Flower2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Fresh Dutch Blooms</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 border border-rose-100 px-3 py-1.5 rounded-xl shadow-2xs backdrop-blur-xs">
              <Cake className="w-3.5 h-3.5 text-amber-500" />
              <span>Oven-Fresh Artisan Cakes</span>
            </span>
          </div>
        )}

        {/* Featured Combos Carousel / Grid Container */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            ref={scrollRef}
            className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory"
          >
            {loading ? (
              // Luxury Shimmer Skeletons
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`combo-skel-${idx}`}
                  className="w-[280px] xs:w-[300px] sm:w-auto shrink-0 snap-start rounded-2xl border border-rose-100 bg-white p-3.5 space-y-3 animate-pulse h-[380px] flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-rose-50/80 rounded-xl" />
                  <div className="space-y-2 mt-2">
                    <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  </div>
                  <div className="h-8 bg-slate-100 rounded-xl w-full mt-auto" />
                </div>
              ))
            ) : combos.length > 0 ? (
              combos.slice(0, itemsCount).map((combo) => (
                <div
                  key={combo._id || combo.id}
                  className="w-[280px] xs:w-[300px] sm:w-auto shrink-0 snap-start flex flex-col h-full"
                >
                  <CakeComboCard combo={combo} className="h-full" />
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-slate-500 bg-white/60 rounded-2xl border border-rose-100 p-8 space-y-3">
                <Gift className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  New celebration combos are currently being curated!
                </p>
                <Link
                  to="/combos"
                  className="inline-block text-xs font-bold text-rose-700 hover:text-rose-800 underline"
                >
                  Explore the full catalog
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CombosSection;
