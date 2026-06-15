import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingBag } from 'lucide-react';
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
    <section id="valentine-timeline" className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block text-sm uppercase tracking-[4px] text-rose-300/70 font-medium mb-3">
            Valentine Week
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] mb-4">
            8 Days of <span className="valentine-gradient-text">Love</span>
          </h2>
          <p className="text-rose-200/60 text-base md:text-lg max-w-2xl mx-auto">
            Each day brings a unique way to express your love. Explore exclusive gifts for every special moment.
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
                  className={`valentine-timeline-card valentine-glass-dark p-5 h-full flex flex-col ${
                    isSelected ? 'ring-2 ring-rose-400/60' : ''
                  } ${isToday ? 'valentine-glow' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  {/* Date Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                        {card.icon}
                      </div>
                      <div>
                        <div className="text-xs text-rose-300/60 uppercase tracking-wider">
                          {month}
                        </div>
                        <div className="text-2xl font-bold text-white font-['Playfair_Display']">
                          {day}
                        </div>
                      </div>
                    </div>
                    {isToday && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Banner Image */}
                  {card.bannerImage && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4">
                      <img
                        src={getImageUrl(card.bannerImage)}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2 font-['Playfair_Display']">
                    {card.title}
                  </h3>
                  <p className="text-sm text-rose-200/50 mb-4 flex-1 line-clamp-2">
                    {card.description}
                  </p>

                  {/* Product Count & CTA */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-rose-300/50">
                      {card.products?.length || 0} products
                    </span>
                    <button 
                      onClick={(e) => handleShopNowClick(e, card)}
                      className="flex items-center gap-1 text-sm font-medium text-rose-300 hover:text-rose-200 transition-colors group"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Shop Now
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
                      <div className="valentine-glass-dark rounded-xl p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-rose-300 mb-2">
                          Featured Products
                        </h4>
                        {card.products.slice(0, 3).map((product: any) => (
                          <div
                            key={product._id}
                            onClick={() => navigate(`/valentine-product/${product._id}`)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{product.title}</p>
                              <p className="text-xs text-rose-300/60">₹{product.price}</p>
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
