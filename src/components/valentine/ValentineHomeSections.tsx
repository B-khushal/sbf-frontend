import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Sparkles, Gift, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ValentineSettings } from '@/types/valentine';
import { VALENTINE_DATE_MAP } from '@/types/valentine';
import ValentineCountdown from './ValentineCountdown';
import ValentineTimeline from './ValentineTimeline';
import ValentineProductGrid from './ValentineProductGrid';
import ValentineOfferCarousel from './ValentineOfferCarousel';

interface ValentineHomeSectionsProps {
  settings: ValentineSettings;
  offers: any[];
}

export const ValentineHomeSections: React.FC<ValentineHomeSectionsProps> = ({ settings, offers }) => {
  const navigate = useNavigate();

  // Extract featured products from the timeline cards to showcase on home
  const featuredProducts = React.useMemo(() => {
    const productsList = settings.timeline
      ?.filter(card => card.enabled)
      ?.flatMap(card => card.products || [])
      ?.filter((product, index, self) => 
        product && self.findIndex(p => p?._id === product?._id) === index
      ) || [];
    return productsList.slice(0, 4); // Show top 4 featured valentine products
  }, [settings.timeline]);

  const activeTimelineCards = React.useMemo(() => {
    return settings.timeline
      ?.filter(card => card.enabled)
      ?.sort((a, b) => a.order - b.order) || [];
  }, [settings.timeline]);

  return (
    <div className="w-full space-y-16 py-12 bg-gradient-to-b from-rose-50/40 via-white to-transparent overflow-hidden">
      {/* 1. Countdown Banner */}
      {settings.general?.countdownTargetDate && (
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-900 via-rose-800 to-burgundy-900 text-white shadow-xl p-8 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,164,175,0.15),transparent)] pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wider uppercase">
                  <Sparkles size={12} className="text-rose-300 animate-pulse" />
                  <span>The Season of Love is Here</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-serif">
                  {settings.theme?.heroHeadline || "Make This Valentine's Week Unforgettable"}
                </h2>
                <p className="text-rose-100 text-sm md:text-base leading-relaxed">
                  {settings.theme?.heroSubheadline || "Gift your special someone beautiful custom-crafted bouquets, premium gift boxes, and lovely surprises. Order today!"}
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-xs uppercase tracking-widest text-rose-300 font-bold flex items-center gap-1">
                  <Clock size={12} className="animate-spin-slow" /> Campaign Ends In
                </div>
                <ValentineCountdown targetDate={settings.general.countdownTargetDate} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Valentine Week Timeline Preview */}
      {activeTimelineCards.length > 0 && (
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center justify-center p-2 bg-rose-50 rounded-2xl text-rose-600">
              <Calendar size={20} className="animate-bounce" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">
              Valentine's Week Timeline
            </h3>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Each day is a new promise of love. Select a special day to view exclusive products crafted just for that day!
            </p>
          </div>

          <div className="relative">
            <ValentineTimeline 
              timeline={activeTimelineCards} 
              onDateClick={(dateSlug) => navigate(`/valentine-special?day=${dateSlug}`)}
            />
          </div>
        </div>
      )}

      {/* 3. Special Offers Carousel */}
      {offers && offers.length > 0 && (
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">
              Exclusive Romantic Offers
            </h3>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Save on your romantic gifts with these curated discounts and bundles
            </p>
          </div>
          <ValentineOfferCarousel offers={offers} />
        </div>
      )}

      {/* 4. Featured Valentine Products */}
      {featuredProducts.length > 0 && (
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center justify-center p-2 bg-rose-50 rounded-2xl text-rose-600">
              <Heart size={20} className="fill-rose-500 text-rose-500" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">
              Handcrafted Valentine Specials
            </h3>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Discover our most popular arrangements designed to capture hearts
            </p>
          </div>
          
          <ValentineProductGrid products={featuredProducts} />

          <div className="text-center mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/valentine-special')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-full font-bold shadow-lg shadow-rose-500/25 transition-all duration-300"
            >
              Shop Full Valentine Special Collection
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      )}

      {/* 5. Custom Gift Builder Promo Card */}
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-rose-50 border border-rose-100 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
              <Gift size={12} className="fill-rose-600" />
              <span>Interactive Gift Builder</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">
              Build Your Own Custom Love Bundle
            </h3>
            <p className="text-gray-600 text-sm md:text-base max-w-xl">
              Choose your partner's favorite flowers, add delicious premium chocolates, cute teddies, a greeting card with a custom message, and a special frame. We'll box it beautifully!
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/valentine-special#gift-builder')}
            className="relative z-10 whitespace-nowrap px-8 py-4 bg-white border border-rose-200 text-rose-600 font-bold rounded-2xl shadow-sm hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 transition-all duration-300 flex items-center gap-2"
          >
            Start Designing
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ValentineHomeSections;
