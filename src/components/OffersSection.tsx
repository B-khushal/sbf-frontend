import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/services/api';

interface Offer {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  background: string;
  textColor: string;
  buttonText: string;
  buttonLink: string;
  startDate: string;
  endDate: string;
  theme: 'festive' | 'sale' | 'holiday' | 'general';
}

const OffersSection = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get('/offers/active');
        setOffers(data || []);
      } catch (error) {
        console.error('Error fetching offers:', error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'festive':
        return 'from-red-500 via-green-500 to-red-500';
      case 'sale':
        return 'from-orange-500 via-red-500 to-pink-500';
      case 'holiday':
        return 'from-blue-500 via-purple-500 to-indigo-500';
      default:
        return 'from-primary via-secondary to-accent';
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'festive':
        return <Sparkles className="w-5 h-5" />;
      case 'sale':
        return <Gift className="w-5 h-5" />;
      case 'holiday':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <section className="px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-8xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading offers...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) {
    return null; // Don't render section if no offers
  }

  return (
    <section className="px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-orange-100/30 to-red-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-amber-100/30 to-yellow-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-8xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Gift className="w-4 h-4" />
            Special Offers
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 mb-4 leading-tight">
            🎉 Limited Time Deals
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Don't miss out on these exclusive offers - beautiful flowers at unbeatable prices!
          </p>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div 
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                style={{ background: offer.background }}
              >
                {/* Theme-based accent bar */}
                <div className={`h-1 bg-gradient-to-r ${getThemeGradient(offer.theme)}`} />
                
                {/* Offer Image */}
                {offer.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={offer.imageUrl} 
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Theme Icon */}
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${getThemeGradient(offer.theme)} text-white mb-4`}>
                    {getThemeIcon(offer.theme)}
                  </div>

                  {/* Title & Description */}
                  <h3 
                    className="text-xl sm:text-2xl font-bold mb-3 leading-tight"
                    style={{ color: offer.textColor }}
                  >
                    {offer.title}
                  </h3>
                  <p 
                    className="text-sm sm:text-base mb-4 leading-relaxed opacity-80"
                    style={{ color: offer.textColor }}
                  >
                    {offer.description}
                  </p>

                  {/* Dates */}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Until {format(new Date(offer.endDate), 'MMM dd')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-red-500 font-semibold">Limited time</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <motion.a
                    href={offer.buttonLink}
                    className={`inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-gray-900 bg-gradient-to-r ${getThemeGradient(offer.theme)} hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{offer.buttonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getThemeGradient(offer.theme)} opacity-10`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        {offers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-12 sm:mt-16"
          >
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Hurry up! These exclusive deals won't last long.
            </p>
            <motion.a
              href="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-secondary to-accent text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Gift className="w-5 h-5" />
              Shop All Offers
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default OffersSection; 