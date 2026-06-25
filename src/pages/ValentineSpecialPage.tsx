import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { useValentine } from '@/contexts/ValentineContext';
import api from '@/services/api';

import FloatingPetals from '@/components/valentine/FloatingPetals';
import ValentineCountdown from '@/components/valentine/ValentineCountdown';
import ValentineTimeline from '@/components/valentine/ValentineTimeline';
import ValentineProductGrid from '@/components/valentine/ValentineProductGrid';
import ValentineOfferCarousel from '@/components/valentine/ValentineOfferCarousel';
import ValentineGiftBuilder from '@/components/valentine/ValentineGiftBuilder';
import ValentineDeliveryOptions from '@/components/valentine/ValentineDeliveryOptions';
import '@/components/valentine/valentine.css';

import type { ValentineProduct, ValentineGiftBuilderItem } from '@/types/valentine';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const ValentineSpecialPage: React.FC = () => {
  const navigate = useNavigate();
  const { isValentineEnabled, settings, offers, loading: contextLoading } = useValentine();

  const [products, setProducts] = useState<ValentineProduct[]>([]);
  const [giftItems, setGiftItems] = useState<ValentineGiftBuilderItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch Valentine products and gift builder items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProductsLoading(true);
        const [productsRes, giftRes] = await Promise.allSettled([
          api.get('/valentine/products?limit=200'),
          api.get('/valentine/gift-builder/items'),
        ]);

        if (productsRes.status === 'fulfilled') {
          setProducts(productsRes.value.data?.products || []);
        }
        if (giftRes.status === 'fulfilled') {
          setGiftItems(giftRes.value.data?.items || []);
        }
      } catch (err) {
        console.error('Error loading Valentine data:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    if (isValentineEnabled) fetchData();
  }, [isValentineEnabled]);

  // If Valentine mode is OFF, redirect
  if (!contextLoading && !isValentineEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-white">
        <div className="text-center max-w-md px-6">
          <Heart className="w-16 h-16 text-rose-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3 font-['Playfair_Display']">
            Valentine's Special Coming Soon
          </h1>
          <p className="text-gray-500 mb-6">
            Our Valentine's Week experience is being prepared with love. Check back soon!
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors"
          >
            Return Home
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (contextLoading) {
    return (
      <div className="min-h-screen valentine-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4 valentine-heart-pulse" />
          <p className="text-rose-200/70 text-lg">Loading Valentine's experience...</p>
        </div>
      </div>
    );
  }

  const theme = settings?.theme;
  const seo = settings?.seo;

  const getCategoryProductCount = (catName: string, catSlug: string) => {
    return products.filter(p => {
      const matchValCatArray = p.valentineCategories?.some(c => 
        c.toLowerCase() === catName.toLowerCase() || c.toLowerCase().replace(/\s+/g, '-') === catSlug.toLowerCase()
      );
      const matchValCat = p.valentineCategory?.toLowerCase() === catName.toLowerCase() || 
                         p.valentineCategory?.toLowerCase().replace(/\s+/g, '-') === catSlug.toLowerCase();
      const matchCat = p.category?.toLowerCase() === catName.toLowerCase() || 
                       p.category?.toLowerCase().replace(/\s+/g, '-') === catSlug.toLowerCase();
      return matchValCatArray || matchValCat || matchCat;
    }).length;
  };

  return (
    <>
      {/* SEO */}
      {seo && (
        <Helmet>
          <title>{seo.metaTitle}</title>
          <meta name="description" content={seo.metaDescription} />
          <meta name="keywords" content={seo.keywords?.join(', ')} />
          {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
          {seo.canonicalUrl && <link rel="canonical" href={seo.canonicalUrl} />}
          <meta property="og:title" content={seo.metaTitle} />
          <meta property="og:description" content={seo.metaDescription} />
        </Helmet>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen valentine-gradient-hero relative overflow-hidden"
      >
        {/* Floating Petals */}
        <FloatingPetals enabled={theme?.floatingPetals ?? true} count={18} />

        {/* ============================================================
            HERO SECTION
            ============================================================ */}
        <motion.section
          variants={itemVariants}
          className="relative min-h-[90vh] flex items-center justify-center px-4 md:px-8 pt-8 pb-16"
        >
          {/* Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full valentine-glass border border-rose-400/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-sm text-rose-200/80 font-medium tracking-wide">
                {settings?.general?.campaignName || "Valentine's Week Special"}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-6 font-['Playfair_Display']"
            >
              {(theme?.heroHeadline || 'Celebrate Love This Valentine Week').split(' ').map((word, i) => (
                <span key={i} className={['Love', 'Valentine'].includes(word) ? 'valentine-gradient-text' : ''}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-rose-200/60 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {theme?.heroSubheadline || 'Exclusive bouquets, romantic gifts, surprise hampers, and special offers crafted for your loved ones.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href={theme?.ctaButton1Link || '#valentine-products'}
                className="valentine-btn-primary text-base px-8 py-4 flex items-center gap-2"
              >
                <Heart className="w-5 h-5" fill="currentColor" />
                {theme?.ctaButton1Text || "Shop Valentine's Collection"}
              </a>
              <a
                href={theme?.ctaButton2Link || '#valentine-offers'}
                className="valentine-btn-outline text-base px-8 py-4 flex items-center gap-2"
              >
                {theme?.ctaButton2Text || "Explore Valentine's Week Offers"}
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="mt-16"
            >
              <p className="text-sm text-rose-300/50 uppercase tracking-[3px] mb-4">
                Valentine's Day Countdown
              </p>
              <ValentineCountdown
                targetDate={settings?.general?.countdownTargetDate || new Date(new Date().getFullYear(), 1, 14).toISOString()}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* ============================================================
            VALENTINE WEEK TIMELINE
            ============================================================ */}
        {settings?.timeline && settings.timeline.length > 0 && (
          <motion.div variants={itemVariants}>
            <ValentineTimeline 
              timeline={settings.timeline.map(card => ({
                ...card,
                products: products.filter(p => p.availableDates?.includes(card.id))
              }))} 
            />
          </motion.div>
        )}

        {/* ============================================================
            VALENTINE CATEGORIES
            ============================================================ */}
        {settings?.categories && settings.categories.filter(c => c.enabled).length > 0 && (
          <motion.section
            variants={itemVariants}
            id="valentine-categories"
            className="py-16 md:py-24 px-4 md:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <span className="inline-block text-sm uppercase tracking-[4px] text-rose-300/70 font-medium mb-3">
                  Shop By Category
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] mb-4">
                  Valentine's <span className="valentine-gradient-text">Gift Categories</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                {settings.categories
                  .filter(c => c.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((cat, index) => (
                    <motion.a
                      key={cat.id}
                      href={`/valentine-shop?category=${cat.slug.toLowerCase().replace(/\s+/g, '-')}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="valentine-glass-dark rounded-2xl p-4 text-center group hover:border-rose-400/20 border border-transparent transition-all duration-300"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 flex items-center justify-center mx-auto mb-3 text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                        ) : (
                          '🌹'
                        )}
                      </div>
                      <h3 className="text-xs md:text-sm font-semibold text-white group-hover:text-rose-300 transition-colors line-clamp-2">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] text-rose-300/40 block mt-1 font-mono">
                        {getCategoryProductCount(cat.name, cat.slug)} products
                      </span>
                    </motion.a>
                  ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ============================================================
            VALENTINE PRODUCTS
            ============================================================ */}
        <motion.div variants={itemVariants}>
          <ValentineProductGrid
            products={products.slice(0, 12)}
            loading={productsLoading}
            title="Valentine's Exclusive Collection"
            subtitle="Handpicked with love for your special someone"
          />
        </motion.div>

        {/* ============================================================
            SPECIAL OFFERS
            ============================================================ */}
        {offers.length > 0 && (
          <motion.div variants={itemVariants}>
            <ValentineOfferCarousel offers={offers} />
          </motion.div>
        )}

        {/* ============================================================
            GIFT BUILDER
            ============================================================ */}
        {giftItems.length > 0 && (
          <motion.div variants={itemVariants}>
            <ValentineGiftBuilder items={giftItems} />
          </motion.div>
        )}

        {/* ============================================================
            DELIVERY OPTIONS
            ============================================================ */}
        {settings?.delivery && (
          <motion.div variants={itemVariants}>
            <ValentineDeliveryOptions delivery={settings.delivery} />
          </motion.div>
        )}

        {/* ============================================================
            FOOTER CTA
            ============================================================ */}
        <motion.section
          variants={itemVariants}
          className="py-20 md:py-28 px-4 md:px-8 text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <Heart className="w-12 h-12 text-rose-400 mx-auto mb-6 valentine-heart-pulse" fill="currentColor" />
            <h2 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] mb-4">
              Make This Valentine's <span className="valentine-gradient-text">Unforgettable</span>
            </h2>
            <p className="text-rose-200/60 text-base md:text-lg mb-8 max-w-xl mx-auto">
              Don't wait — the best gifts are chosen early. Order now for guaranteed delivery.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="valentine-btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
            >
              <Heart className="w-5 h-5" fill="currentColor" />
              Shop All Valentine's Gifts
            </button>
          </div>
        </motion.section>
      </motion.div>
    </>
  );
};

export default ValentineSpecialPage;
