import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Cake, Sparkles, Gift } from "lucide-react";
import api from "@/services/api";
import { CakeProductCard } from "./cakes/CakeProductCard";
import { CakeComboCard } from "./cakes/CakeComboCard";
import { Button } from "@/components/ui/button";

interface CakesSectionProps {
  onAddToCart?: (item: any, quantity: number) => boolean;
}

export const CakesSection: React.FC<CakesSectionProps> = ({ onAddToCart }) => {
  const navigate = useNavigate();
  const [cakes, setCakes] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCakesData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products", {
          params: { category: "cakes" }
        });

        const rawList = response.data?.products || (Array.isArray(response.data) ? response.data : []);

        const validCakes: any[] = [];
        const validCombos: any[] = [];

        rawList.forEach((prod: any) => {
          const isCombo =
            prod.catalogType === "combo" ||
            prod.category === "combos" ||
            prod.subcategory?.includes("combo") ||
            (Array.isArray(prod.categories) && prod.categories.some((c: string) => c.includes("combo"))) ||
            (prod.details?.categories && prod.details.categories.some((c: string) => c.includes("combo")));

          if (isCombo) {
            validCombos.push(prod);
          } else {
            validCakes.push(prod);
          }
        });

        if (isMounted) {
          setCakes(validCakes);
          setCombos(validCombos);
        }
      } catch (err) {
        console.warn("Could not fetch cakes from API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCakesData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = Math.min(scrollRef.current.offsetWidth * 0.8, 600);
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-[#faf6f2] via-[#fffbf7] to-white overflow-hidden border-y border-amber-100/50">
      {/* Subtle Luxury Pattern Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="space-y-3">
            {/* Subtle Brand Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-bold tracking-wider uppercase">
              <Cake className="w-3.5 h-3.5 text-amber-600" />
              <span>NOW SERVING CAKES</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>

            {/* Main Title */}
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-serif">
              Cakes, Made for Every Celebration
            </h2>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl font-light">
              Freshly crafted cakes to make every special moment a little sweeter. Baked to order with pure ingredients and delivered fresh across the city.
            </p>
          </div>

          {/* Action Links & Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Horizontal Arrow Controls (Desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleScroll("left")}
                aria-label="Previous cakes"
                className="w-10 h-10 rounded-full border-amber-200 bg-white/90 hover:bg-amber-50 text-slate-700 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleScroll("right")}
                aria-label="Next cakes"
                className="w-10 h-10 rounded-full border-amber-200 bg-white/90 hover:bg-amber-50 text-slate-700 shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Premium CTA Link */}
            <Link
              to="/cakes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all duration-300 hover:shadow-lg group"
            >
              <span>EXPLORE CAKES</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Featured Cake Carousel / Horizontal Grid */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            ref={scrollRef}
            className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory"
          >
            {loading ? (
              // Skeletons
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`cake-skel-${idx}`}
                  className="w-[280px] xs:w-[300px] sm:w-auto shrink-0 snap-start rounded-2xl border border-amber-100 bg-white p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full h-48 bg-amber-50 rounded-xl" />
                  <div className="h-4 bg-amber-100 rounded-md w-3/4" />
                  <div className="h-3 bg-amber-50 rounded-md w-1/2" />
                  <div className="h-8 bg-amber-100 rounded-lg w-full mt-4" />
                </div>
              ))
            ) : cakes.length > 0 ? (
              cakes.slice(0, 8).map((cake) => (
                <div
                  key={cake._id || cake.id}
                  className="w-[280px] xs:w-[300px] sm:w-auto shrink-0 snap-start flex flex-col h-full"
                >
                  <CakeProductCard
                    product={cake}
                    onAddToCart={onAddToCart}
                    className="h-full"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-slate-500">
                Fresh cakes coming right up! Explore our cake collection page.
              </div>
            )}
          </div>
        </div>

        {/* --- SUBSECTION 4: CAKES & MORE / CELEBRATE WITH MORE COMBOS --- */}
        {combos.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-amber-200/50">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-rose-600 mb-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Cakes & More</span>
                </div>
                <h3 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
                  Celebrate With More
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  Curated celebration bundles pairing our freshly baked cakes with luxury Dutch roses, Ferrero Rocher chocolates, and gifts.
                </p>
              </div>

              <Link
                to="/cakes?category=combos"
                className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 group"
              >
                <span>View all combos</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Combos Row / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {combos.slice(0, 4).map((combo) => (
                <CakeComboCard key={combo._id || combo.id} combo={combo} className="h-full" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CakesSection;
