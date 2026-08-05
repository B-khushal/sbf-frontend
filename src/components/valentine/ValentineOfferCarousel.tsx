import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag, Gift, Truck, Percent, Sparkles } from 'lucide-react';
import type { ValentineOfferItem } from '@/types/valentine';

interface ValentineOfferCarouselProps {
  offers: ValentineOfferItem[];
}

const offerIcons: Record<string, React.ReactNode> = {
  bogo: <Gift className="w-6 h-6" />,
  flat_discount: <Tag className="w-6 h-6" />,
  percentage_discount: <Percent className="w-6 h-6" />,
  free_item: <Gift className="w-6 h-6" />,
  free_delivery: <Truck className="w-6 h-6" />,
  combo_discount: <Tag className="w-6 h-6" />,
};

const offerGradients: Record<string, string> = {
  bogo: 'from-rose-900/90 via-rose-950/90 to-purple-950/90',
  flat_discount: 'from-amber-900/90 via-rose-950/90 to-burgundy-950/90',
  percentage_discount: 'from-purple-900/90 via-rose-950/90 to-pink-950/90',
  free_item: 'from-emerald-900/90 via-rose-950/90 to-teal-950/90',
  free_delivery: 'from-sky-900/90 via-rose-950/90 to-indigo-950/90',
  combo_discount: 'from-rose-900/90 via-red-950/90 to-pink-950/90',
};

const ValentineOfferCarousel: React.FC<ValentineOfferCarouselProps> = ({ offers }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [offers]);

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current || offers.length <= 1) return;
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [offers]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  if (!offers || offers.length === 0) return null;

  return (
    <section id="valentine-offers" className="py-6 md:py-10 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-300 text-xs font-bold tracking-[3px] uppercase mb-3 shadow-sm">
            <Sparkles size={13} className="text-rose-300 animate-pulse" />
            Limited Time Offers
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white font-serif mb-4 tracking-tight drop-shadow-sm">
            Valentine's <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">Special Offers</span>
          </h2>
          <p className="text-rose-100/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Exclusive deals and romantic bundles crafted for the season of love. Don't miss out!
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-11 h-11 rounded-full bg-rose-900/90 border border-rose-400/40 text-white flex items-center justify-center shadow-xl hover:bg-rose-800 transition-all hover:scale-110 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-11 h-11 rounded-full bg-rose-900/90 border border-rose-400/40 text-white flex items-center justify-center shadow-xl hover:bg-rose-800 transition-all hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide snap-x snap-mandatory"
          >
            {offers.map((offer, index) => (
              <motion.div
                key={offer._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="snap-center flex-shrink-0 w-[300px] md:w-[360px]"
              >
                <div className={`rounded-2xl p-6 h-full flex flex-col border border-rose-400/30 backdrop-blur-xl shadow-xl shadow-black/40 bg-gradient-to-br ${offerGradients[offer.type] || 'from-rose-900/90 via-rose-950/90 to-purple-950/90'} hover:border-rose-400/60 transition-all duration-300 hover:-translate-y-1.5`}>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/30 border border-rose-400/30 flex items-center justify-center text-rose-300 shadow-inner">
                      {offerIcons[offer.type] || <Tag className="w-6 h-6" />}
                    </div>
                    {offer.badgeText && (
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md"
                        style={{ backgroundColor: offer.badgeColor || '#be123c' }}
                      >
                        {offer.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 font-serif tracking-tight">
                    {offer.title}
                  </h3>
                  <p className="text-xs md:text-sm text-rose-100/85 mb-4 flex-1 leading-relaxed">
                    {offer.description}
                  </p>

                  {/* Value Display */}
                  {offer.discountValue > 0 && (
                    <div className="bg-white/10 backdrop-blur-md border border-rose-400/30 rounded-xl p-3 mb-4 text-center shadow-inner">
                      <span className="text-2xl font-black text-amber-300 font-serif">
                        {offer.type === 'percentage_discount' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                      </span>
                      <span className="text-xs font-bold text-rose-200 uppercase tracking-wider ml-2">
                        OFF
                      </span>
                    </div>
                  )}

                  {/* Coupon Code */}
                  {offer.code && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/80 border border-dashed border-rose-400/50 shadow-inner">
                      <span className="text-xs text-rose-200/80 font-medium">Use Code:</span>
                      <span className="font-mono font-bold text-rose-300 tracking-wider text-sm">
                        {offer.code}
                      </span>
                    </div>
                  )}

                  {/* Min Order */}
                  {offer.minOrderAmount > 0 && (
                    <p className="text-[11px] text-rose-200/60 mt-3 font-medium">
                      *Min. order ₹{offer.minOrderAmount}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValentineOfferCarousel;
