import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag, Gift, Truck, Percent } from 'lucide-react';
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
  bogo: 'from-rose-600/20 to-pink-600/20',
  flat_discount: 'from-amber-600/20 to-orange-600/20',
  percentage_discount: 'from-purple-600/20 to-fuchsia-600/20',
  free_item: 'from-emerald-600/20 to-teal-600/20',
  free_delivery: 'from-sky-600/20 to-blue-600/20',
  combo_discount: 'from-rose-600/20 to-red-600/20',
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
    <section id="valentine-offers" className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm uppercase tracking-[4px] text-rose-300/70 font-medium mb-3">
            Limited Time
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] mb-4">
            Valentine's <span className="valentine-gradient-text">Special Offers</span>
          </h2>
          <p className="text-rose-200/60 text-base md:text-lg max-w-2xl mx-auto">
            Exclusive deals crafted for the season of love. Don't miss out!
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full valentine-glass-dark flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full valentine-glass-dark flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
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
                <div className={`valentine-glass-dark rounded-2xl p-6 h-full flex flex-col border border-rose-500/10 bg-gradient-to-br ${offerGradients[offer.type] || 'from-rose-600/20 to-pink-600/20'}`}>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-rose-400">
                      {offerIcons[offer.type] || <Tag className="w-6 h-6" />}
                    </div>
                    {offer.badgeText && (
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: offer.badgeColor || '#be123c' }}
                      >
                        {offer.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 font-['Playfair_Display']">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-rose-200/60 mb-4 flex-1">
                    {offer.description}
                  </p>

                  {/* Value Display */}
                  {offer.discountValue > 0 && (
                    <div className="valentine-glass rounded-xl p-3 mb-4 text-center">
                      <span className="text-2xl font-bold valentine-gradient-text">
                        {offer.type === 'percentage_discount' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                      </span>
                      <span className="text-sm text-rose-300/60 ml-2">
                        {offer.type === 'percentage_discount' ? 'OFF' : 'OFF'}
                      </span>
                    </div>
                  )}

                  {/* Coupon Code */}
                  {offer.code && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-dashed border-rose-400/30">
                      <span className="text-xs text-rose-300/60">Use Code:</span>
                      <span className="font-mono font-bold text-rose-300 tracking-wider">
                        {offer.code}
                      </span>
                    </div>
                  )}

                  {/* Min Order */}
                  {offer.minOrderAmount > 0 && (
                    <p className="text-[11px] text-rose-300/40 mt-3">
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
