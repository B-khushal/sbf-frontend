import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles, Star, ShieldCheck, Clock, Award, Gift, Truck } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

import { useValentine } from '@/contexts/ValentineContext';
import api from '@/services/api';

import FloatingPetals from '@/components/valentine/FloatingPetals';
import ValentineCountdown from '@/components/valentine/ValentineCountdown';
import ValentineTimeline from '@/components/valentine/ValentineTimeline';
import ValentineProductGrid from '@/components/valentine/ValentineProductGrid';
import ValentineOfferCarousel from '@/components/valentine/ValentineOfferCarousel';
import ValentineGiftBuilder from '@/components/valentine/ValentineGiftBuilder';
import ValentineDeliveryOptions from '@/components/valentine/ValentineDeliveryOptions';
import ValentineSeoEditorialSection from '@/components/valentine/ValentineSeoEditorialSection';
import ValentineGiftFinder from '@/components/valentine/ValentineGiftFinder';
import { ProductCard, type Product } from '@/components/ProductGrid';
import '@/components/valentine/valentine.css';

import type { ValentineGiftBuilderItem } from '@/types/valentine';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

interface DynamicSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  empty: boolean;
  products: Product[];
  metadata?: any;
}

const ValentineSpecialPage: React.FC = () => {
  const navigate = useNavigate();
  const { isValentineEnabled, settings, offers, loading: contextLoading } = useValentine();

  const [sections, setSections] = useState<DynamicSection[]>([]);
  const [giftItems, setGiftItems] = useState<ValentineGiftBuilderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sections and gift builder items from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectionsRes, giftRes] = await Promise.allSettled([
          api.get('/valentine/sections'),
          api.get('/valentine/gift-builder/items'),
        ]);

        if (sectionsRes.status === 'fulfilled') {
          setSections(sectionsRes.value.data?.sections || []);
        }
        if (giftRes.status === 'fulfilled') {
          setGiftItems(giftRes.value.data?.items || []);
        }
      } catch (err) {
        console.error('Error loading Valentine sections:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isValentineEnabled) {
      fetchData();
    }
  }, [isValentineEnabled]);

  // Seasonal Preservation: Keep Valentine SEO intact year-round
  if (!contextLoading && !isValentineEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50">
        <SEOHead
          title="Valentine's Day Gifts & Flowers Online | SBFlorist Hyderabad"
          description="Celebrate love with romantic rose bouquets, beautiful flowers, cakes and Valentine's Day gift combos from Spring Blossoms Florist. Explore Valentine's gifts online."
          canonical="/valentine-special"
          keywords="Valentine's Day Gifts, Valentine's Day Gifts Online, Valentine's Day Flowers, Valentine's Day Gifts Hyderabad, Valentine's Day Gift Delivery, Valentine's Day Rose Bouquet, Romantic Valentine's Day Gifts, Valentine's Day Cake and Flower Combos"
          ogImage="https://sbflorist.in/images/hero-flower-shop.jpg"
        />
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
          <Heart className="w-14 h-14 text-rose-500 mx-auto mb-4 fill-rose-500 animate-pulse" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-serif mb-4">
            Valentine's Day Gifts
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Celebrate timeless romance with farm-fresh Dutch roses, heart-shaped celebration cakes, and bespoke gift hampers handcrafted by Hyderabad's premier floral studio.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/roses" className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-sm text-sm">
              Explore Rose Bouquets &rarr;
            </Link>
            <Link to="/combos" className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition-colors text-sm">
              Flower &amp; Cake Combos
            </Link>
          </div>
        </div>

        <ValentineSeoEditorialSection isOffSeason={true} />
      </div>
    );
  }

  if (contextLoading || (loading && sections.length === 0)) {
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

  // Helper to extract specific section data
  const getSection = (id: string) => sections.find((s) => s.id === id);

  return (
    <>
      <SEOHead
        title={seo?.metaTitle || "Valentine's Day Gifts & Flowers Online | SBFlorist Hyderabad"}
        description={seo?.metaDescription || "Celebrate love with romantic rose bouquets, beautiful flowers, cakes and Valentine's Day gift combos from Spring Blossoms Florist. Explore Valentine's gifts online."}
        canonical={seo?.canonicalUrl || "/valentine-special"}
        keywords={seo?.keywords?.join(', ') || "Valentine's Day Gifts, Valentine's Day Gifts Online, Valentine's Day Flowers, Valentine's Day Gifts Hyderabad, Valentine's Day Gift Delivery, Valentine's Day Rose Bouquet, Romantic Valentine's Day Gifts, Valentine's Day Cake and Flower Combos"}
        ogImage={seo?.ogImage || "https://sbflorist.in/images/hero-flower-shop.jpg"}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen valentine-gradient-hero relative overflow-hidden"
      >
        <FloatingPetals enabled={theme?.floatingPetals ?? true} count={18} />

        {/* ============================================================
            1. HERO SECTION
            ============================================================ */}
        <motion.section
          variants={itemVariants}
          className="relative min-h-[85vh] flex items-center justify-center px-4 md:px-8 pt-8 pb-16"
        >
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full valentine-glass border border-rose-400/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-sm text-rose-200/80 font-medium tracking-wide">
                {settings?.general?.campaignName || "Valentine's Week 2026"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-4 font-['Playfair_Display']"
            >
              Valentine's Day <span className="valentine-gradient-text">Gifts</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-lg sm:text-xl md:text-2xl font-serif text-rose-200/90 mb-4"
            >
              {theme?.heroHeadline || 'Celebrate Love This Valentine Week'}
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-base sm:text-lg text-rose-200/70 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {theme?.heroSubheadline || 'Celebrate love with handcrafted rose bouquets, artisan cakes, and bespoke gift combos delivered across Hyderabad with same-day and midnight express service.'}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="#valentine-gift-finder"
                className="valentine-btn-primary text-base px-8 py-4 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Find The Perfect Gift
              </a>
              <Link
                to="/valentine-shop"
                className="valentine-btn-outline text-base px-8 py-4 flex items-center gap-2"
              >
                <Heart className="w-5 h-5" fill="currentColor" />
                Browse All Valentine Gifts
              </Link>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="mt-14"
            >
              <p className="text-xs sm:text-sm text-rose-300/60 uppercase tracking-[3px] mb-3">
                Valentine's Day Countdown
              </p>
              <ValentineCountdown
                targetDate={settings?.general?.countdownTargetDate || new Date(new Date().getFullYear(), 1, 14).toISOString()}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* ============================================================
            2. VALENTINE WEEK TIMELINE (Feb 7 – Feb 14)
            ============================================================ */}
        {settings?.timeline && settings.timeline.length > 0 && (
          <motion.div variants={itemVariants} className="py-12 px-4 md:px-8">
            <ValentineTimeline 
              timeline={settings.timeline.map((card) => {
                const weekSec = getSection('valentine-week');
                const matchedDay = weekSec?.metadata?.days?.find((d: any) => d.id === card.id);
                return {
                  ...card,
                  products: matchedDay?.products || []
                };
              })} 
            />
          </motion.div>
        )}

        {/* ============================================================
            3. INTERACTIVE VALENTINE GIFT FINDER
            ============================================================ */}
        <motion.section
          variants={itemVariants}
          id="valentine-gift-finder"
          className="py-16 md:py-24 px-4 md:px-8 scroll-mt-24"
        >
          <ValentineGiftFinder />
        </motion.section>

        {/* ============================================================
            4. VALENTINE CATEGORIES
            ============================================================ */}
        {settings?.categories && settings.categories.filter((c) => c.enabled).length > 0 && (
          <motion.section
            variants={itemVariants}
            id="valentine-categories"
            className="py-12 md:py-20 px-4 md:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <span className="inline-block text-xs uppercase tracking-[4px] text-rose-300/70 font-semibold mb-2">
                  Shop By Category
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
                  Valentine's <span className="valentine-gradient-text">Gift Categories</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                {settings.categories
                  .filter((c) => c.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link
                        to={`/valentine-shop?category=${cat.slug.toLowerCase().replace(/\s+/g, '-')}`}
                        className="valentine-glass-dark rounded-2xl p-5 text-center group hover:border-rose-400/40 border border-white/5 transition-all duration-300 block h-full flex flex-col items-center justify-center"
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 flex items-center justify-center mb-3 text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-12 h-12 object-contain" />
                          ) : (
                            '🌹'
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors line-clamp-2">
                          {cat.name}
                        </h3>
                        <span className="text-xs text-rose-300/60 block mt-1.5 flex items-center gap-1">
                          Explore Collection &rarr;
                        </span>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ============================================================
            5. DYNAMIC PRODUCT SECTIONS (Zero Seed Data — Real DB Products)
            ============================================================ */}
        {sections
          .filter((sec) => sec.enabled && !sec.empty && sec.products && sec.products.length > 0)
          .map((sec) => (
            <motion.section
              key={sec.id}
              variants={itemVariants}
              className="py-14 md:py-20 px-4 md:px-8 border-t border-white/5"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs uppercase tracking-[3px] text-rose-300/70 font-semibold block mb-1">
                      Curated Seasonal Selection
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-serif">
                      {sec.name}
                    </h2>
                  </div>
                  <Link
                    to={`/valentine-shop?category=${sec.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-300 hover:text-rose-200 transition-colors"
                  >
                    View All {sec.name} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                  {sec.products.slice(0, 8).map((product) => (
                    <ProductCard key={product._id || product.id} product={product} linkPrefix="/valentine-product" />
                  ))}
                </div>
              </div>
            </motion.section>
          ))}

        {/* ============================================================
            6. SPECIAL OFFERS & COUPONS
            ============================================================ */}
        {offers.length > 0 && (
          <motion.div variants={itemVariants} className="py-12">
            <ValentineOfferCarousel offers={offers} />
          </motion.div>
        )}

        {/* ============================================================
            7. BESPOKE GIFT BUILDER
            ============================================================ */}
        {giftItems.length > 0 && (
          <motion.div variants={itemVariants} className="py-14">
            <ValentineGiftBuilder items={giftItems} />
          </motion.div>
        )}

        {/* ============================================================
            8. GUARANTEED DELIVERY OPTIONS
            ============================================================ */}
        {settings?.delivery && (
          <motion.div variants={itemVariants} className="py-12">
            <ValentineDeliveryOptions delivery={settings.delivery} />
          </motion.div>
        )}

        {/* ============================================================
            9. WHY CHOOSE SBFLORIST
            ============================================================ */}
        <motion.section variants={itemVariants} className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[3px] text-rose-300/70 font-semibold block mb-2">
              The SBFlorist Guarantee
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-serif">
              Why Celebrate Valentine's <span className="valentine-gradient-text">With SBFlorist?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="valentine-glass-dark p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1.5">Express 2-Hour Delivery</h3>
              <p className="text-xs text-rose-200/70 leading-relaxed">
                Prompt delivery across Hyderabad &amp; Secunderabad so your romantic surprise arrives right on time.
              </p>
            </div>

            <div className="valentine-glass-dark p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1.5">Midnight Surprises</h3>
              <p className="text-xs text-rose-200/70 leading-relaxed">
                Ring in Valentine's Day at 12:00 AM sharp with our dedicated midnight delivery fleet.
              </p>
            </div>

            <div className="valentine-glass-dark p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1.5">100% Farm-Fresh Dutch Blooms</h3>
              <p className="text-xs text-rose-200/70 leading-relaxed">
                Directly sourced premium Dutch roses and exotic blossoms arranged with artistic finesse.
              </p>
            </div>

            <div className="valentine-glass-dark p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1.5">Complimentary Message Card</h3>
              <p className="text-xs text-rose-200/70 leading-relaxed">
                Every Valentine arrangement includes a luxury handwritten greeting card with your words.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ============================================================
            10. SEO EDITORIAL ARCHITECTURE & HYDERABAD CONTENT
            ============================================================ */}
        <motion.div variants={itemVariants} className="bg-white/95 rounded-t-[2.5rem] mt-12 pt-10 text-slate-900 shadow-2xl">
          <ValentineSeoEditorialSection />
        </motion.div>

        {/* ============================================================
            11. FOOTER CTA
            ============================================================ */}
        <motion.section
          variants={itemVariants}
          className="py-20 md:py-28 px-4 md:px-8 text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <Heart className="w-12 h-12 text-rose-400 mx-auto mb-6 valentine-heart-pulse" fill="currentColor" />
            <h2 className="text-3xl md:text-5xl font-bold text-white font-serif mb-4">
              Make This Valentine's <span className="valentine-gradient-text">Unforgettable</span>
            </h2>
            <p className="text-rose-200/70 text-base md:text-lg mb-8 max-w-xl mx-auto">
              Don't wait until the last minute — Hyderabad's favorite blooms sell out fast. Reserve your delivery early.
            </p>
            <button
              onClick={() => navigate('/valentine-shop')}
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
