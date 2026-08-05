import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ValentineTimelineCard } from '@/types/valentine';
import { getImageUrl } from '@/config';

interface ValentineTimelineProps {
  timeline: ValentineTimelineCard[];
  onDateClick?: (dateSlug: string) => void;
}

const ValentineTimeline: React.FC<ValentineTimelineProps> = ({ timeline = [], onDateClick }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleShopNowClick = (e: React.MouseEvent, card: ValentineTimelineCard) => {
    e.stopPropagation();
    navigate(`/valentine-shop?day=${card.id}`);
  };

  const handleCardClick = (card: ValentineTimelineCard) => {
    const slug = card.id;
    setSelectedDate(selectedDate === slug ? null : slug);
    if (onDateClick) onDateClick(slug);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return { day: d.getDate(), month: d.toLocaleString('en', { month: 'short' }) };
  };

  return (
    <section id="valentine-timeline" className="py-6 md:py-10 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-300 text-xs font-bold tracking-[3px] uppercase mb-3 shadow-sm">
            <Sparkles size={13} className="text-rose-300 animate-pulse" />
            Valentine Week Timeline
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white font-serif mb-4 tracking-tight drop-shadow-sm">
            7 Days of <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">Love</span>
          </h2>
          <p className="text-rose-100/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Each day brings a unique promise of romance. Explore exclusive gifts and handcrafted floral arrangements for every special moment.
          </p>
        </motion.div>

        {/* Timeline Cards - Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex overflow-x-auto pb-6 gap-4 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide snap-x snap-mandatory">
          {timeline.map((card, index) => {
            const { day, month } = formatDate(card.date);
            const isSelected = selectedDate === card.id;
            const isToday = new Date().getDate() === day && new Date().getMonth() === 1;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="snap-center flex-shrink-0 w-[260px] md:w-auto"
              >
                <div
                  className={`relative p-5 rounded-2xl h-full flex flex-col transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'bg-rose-950/80 border-2 border-rose-400 shadow-xl shadow-rose-500/20' 
                      : 'bg-white/10 backdrop-blur-xl border border-white/15 hover:border-rose-400/50 hover:bg-white/15 shadow-lg shadow-black/30 hover:-translate-y-1.5'
                  } ${isToday ? 'ring-2 ring-rose-500 shadow-rose-500/30' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  {/* Date Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/30 to-pink-600/30 border border-rose-400/30 flex items-center justify-center text-2xl shadow-inner">
                        {card.icon}
                      </div>
                      <div>
                        <div className="text-xs text-rose-300 font-bold uppercase tracking-widest">
                          {month}
                        </div>
                        <div className="text-2xl font-black text-white font-serif tracking-tight">
                          {day}
                        </div>
                      </div>
                    </div>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/40">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Banner Image */}
                  {card.bannerImage && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 border border-white/10 shadow-md">
                      <img
                        src={getImageUrl(card.bannerImage)}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <h3 className="text-base md:text-lg font-bold text-white mb-1.5 font-serif line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-rose-100/75 mb-4 flex-1 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Product Count & CTA */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                    <span className="text-[11px] font-medium text-rose-200/80">
                      {card.products?.length || 0} Specials
                    </span>
                    <button 
                      onClick={(e) => handleShopNowClick(e, card)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold shadow-md shadow-rose-950/40 transition-all duration-200 hover:scale-105 active:scale-95 group"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Shop
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Products Panel */}
                <AnimatePresence>
                  {isSelected && card.products && card.products.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="bg-rose-950/90 border border-rose-400/30 rounded-xl p-4 space-y-3 backdrop-blur-xl shadow-xl">
                        <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">
                          Featured Products
                        </h4>
                        {card.products.slice(0, 3).map((product: any) => (
                          <div
                            key={product._id}
                            onClick={() => navigate(`/valentine-product/${product._id}`)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover border border-white/10"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{product.title}</p>
                              <p className="text-xs text-rose-300 font-semibold">₹{product.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValentineTimeline;
