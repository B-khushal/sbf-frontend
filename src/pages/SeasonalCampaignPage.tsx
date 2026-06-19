import React, { useEffect, useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Gift, ArrowRight, Sparkles, Clock, Calendar, Truck, ShieldCheck, Heart, Star, Copy, Check, X } from 'lucide-react';
import seasonalCampaignService from '@/services/seasonalCampaignService';
import { SeasonalCampaign, SeasonalCategory } from '@/types/seasonalCampaign';
import { ProductData } from '@/services/productService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getImageUrl } from '@/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SeasonalCampaignPageProps {
  slug: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

// Floating particles component for dynamic backgrounds
const FloatingParticles: React.FC<{ style: string; count?: number }> = ({ style, count = 25 }) => {
  const getParticleContent = () => {
    switch (style) {
      case 'hearts':
        return '❤️';
      case 'leaves':
        return '🌿';
      case 'petals':
        return '🌸';
      case 'confetti':
        const confettiOptions = ['🎉', '✨', '🟥', '🟨', '🟦', '🟩', '🟪'];
        return confettiOptions[Math.floor(Math.random() * confettiOptions.length)];
      default:
        return '🌸';
    }
  };

  const particles = useMemo(() => Array.from({ length: count }), [count]);

  if (style === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((_, i) => {
        const size = Math.random() * 20 + 10;
        const duration = Math.random() * 12 + 12;
        const delay = Math.random() * 6;
        const startX = Math.random() * 100;
        const spin = Math.random() * 360;

        return (
          <motion.div
            key={i}
            className="absolute text-opacity-70 select-none"
            style={{
              left: `${startX}%`,
              top: '-5%',
              fontSize: `${size}px`,
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [`${Math.random() * 15 - 7.5}vw`, `${Math.random() * 15 - 7.5}vw`],
              rotate: [spin, spin + 360],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: 'linear' as const,
            }}
          >
            {getParticleContent()}
          </motion.div>
        );
      })}
    </div>
  );
};

// Countdown Timer component
const CampaignCountdown: React.FC<{ 
  targetDate: string; 
  primaryColor: string; 
  textColor?: string; 
  subtextColor?: string; 
}> = ({ 
  targetDate, 
  primaryColor, 
  textColor = '#ffffff', 
  subtextColor = 'rgba(255,255,255,0.7)' 
}) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-4 my-8">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Mins' },
        { value: timeLeft.seconds, label: 'Secs' },
      ].map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center p-3 w-16 h-16 sm:w-20 sm:h-20 rounded-xl backdrop-blur-md shadow-lg"
          style={{ 
            backgroundColor: textColor === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <span className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: textColor }}>{item.value.toString().padStart(2, '0')}</span>
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: subtextColor }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const SeasonalCampaignPage: React.FC<SeasonalCampaignPageProps> = ({ slug }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();

  const [campaign, setCampaign] = useState<SeasonalCampaign | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (campaign && campaign.enabled) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [campaign]);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        const res = await seasonalCampaignService.getCampaignSettings(slug);
        if (res.success && res.campaign) {
          setCampaign(res.campaign);
          setProducts(res.products || []);
          
          // Track campaign page view asynchronously
          if (res.campaign._id) {
            seasonalCampaignService.trackCampaignView(res.campaign._id).catch(err => {
              console.warn('Failed to track campaign page view:', err);
            });
          }
        }
      } catch (err) {
        console.error('Error fetching campaign data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load campaign page details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [slug, toast]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: 'Promo Code Copied!',
      description: `Code "${code}" copied to clipboard.`,
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategorySlug === 'all') return products;
    return products.filter((p) => {
      // Check if product is assigned to this specific campaign category
      const campSettings = p.campaignSettings?.[slug] || {};
      const assignedCats = campSettings.categories || [];
      return assignedCats.includes(selectedCategorySlug);
    });
  }, [products, selectedCategorySlug, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Sparkles className="animate-pulse h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Preparing seasonal celebration...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-150">
        <div className="text-center max-w-md px-6">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Celebration Not Active</h1>
          <p className="text-gray-500 mb-6">This seasonal campaign is not active or has ended. Please visit our shop to explore our latest gifts!</p>
          <Button onClick={() => navigate('/shop')} className="w-full">
            Browse All Gifts
          </Button>
        </div>
      </div>
    );
  }

  const { theme, seo, offers, categories, delivery, general, banners } = campaign;

  // Custom colors and styles
  const primaryBg = theme.backgroundGradient || `linear-gradient(to bottom right, ${theme.primaryColor || '#6d28d9'}, ${theme.secondaryColor || '#4f46e5'})`;
  const primaryColor = theme.primaryColor || '#6d28d9';
  const accentColor = theme.accentColor || '#f59e0b';
  const textColor = theme.textColor || '#ffffff';
  const subtextColor = theme.subtextColor || 'rgba(255, 255, 255, 0.85)';

  const heroBanner = banners?.find((b) => b.enabled && b.position === 'hero');
  const popupBanner = banners?.find((b) => b.enabled && b.position === 'popup');
  const countdownBanner = banners?.find((b) => b.enabled && b.position === 'countdown');
  const heroStyle: React.CSSProperties = heroBanner?.image
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.75)), url(${getImageUrl(heroBanner.image)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <>
      <Helmet>
        <title>{seo.metaTitle || `${campaign.name} Special - Spring Blossoms Florist`}</title>
        <meta name="description" content={seo.metaDescription || `Exclusive gifts, combos and flowers for ${campaign.name}`} />
        {seo.keywords && seo.keywords.length > 0 && (
          <meta name="keywords" content={seo.keywords.join(', ')} />
        )}
        {seo.ogImage && <meta property="og:image" content={getImageUrl(seo.ogImage)} />}
        {seo.canonicalUrl && <link rel="canonical" href={seo.canonicalUrl} />}
      </Helmet>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen relative overflow-hidden"
        style={{ background: primaryBg }}
      >
        {/* Particle Overlay */}
        <FloatingParticles style={theme.animationStyle} count={22} />

        {/* Hero Section */}
        <section 
          className="relative min-h-[85vh] flex items-center justify-center px-4 py-20 text-center z-10 transition-all duration-500"
          style={heroStyle}
        >
          <div className="max-w-4xl mx-auto relative z-10">
            {/* Tag Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-wide mb-8 shadow-sm"
              style={{ color: textColor, borderColor: `${textColor}30` }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
              <span>{general.campaignName || campaign.name} Collection</span>
            </motion.div>

            {/* Campaign Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-md mb-6"
              style={{ color: textColor, fontFamily: theme.typography === 'serif' ? 'Playfair Display, Georgia, serif' : 'Outfit, Inter, sans-serif' }}
            >
              {heroBanner?.title || `Celebrate ${campaign.name} With Beautiful Gifts`}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm"
              style={{ color: subtextColor }}
            >
              {heroBanner?.subtitle || `Explore our handpicked curation of flowers, personalized combos, and premium gift boxes designed specifically to make this occasion memorable.`}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#campaign-products"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 animate-pulse-subtle"
                style={{ color: primaryColor }}
              >
                {general.exploreButtonText || 'Explore Collection'}
                <ArrowRight className="w-5 h-5" />
              </a>
              {(offers && offers.filter(o => o.enabled).length > 0) || (banners && banners.filter(b => b.enabled && b.position === 'offer').length > 0) ? (
                <a
                  href="#campaign-offers"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 font-bold rounded-xl border backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  style={{ color: textColor, borderColor: `${textColor}40` }}
                >
                  {general.offersButtonText || 'View Offers'}
                </a>
              ) : null}
            </motion.div>

            {/* Target Countdown */}
            {campaign.enabled && general.countdownTargetDate && (
              <motion.div variants={itemVariants} className="mt-12">
                <p 
                  className="text-xs sm:text-sm uppercase tracking-widest font-semibold mb-2"
                  style={{ color: `${textColor}aa` }}
                >
                  {general.countdownLabel || 'Order Before Time Runs Out'}
                </p>
                <CampaignCountdown 
                  targetDate={general.countdownTargetDate} 
                  primaryColor={primaryColor} 
                  textColor={textColor}
                  subtextColor={subtextColor}
                />
              </motion.div>
            )}
          </div>
        </section>

        {/* Offers Section */}
        {((offers && offers.filter(o => o.enabled).length > 0) || (banners && banners.filter(b => b.enabled && b.position === 'offer').length > 0)) && (
          <section id="campaign-offers" className="relative z-10 py-16 px-4 md:px-8 bg-white/5 backdrop-blur-md border-y border-white/10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <span 
                  className="text-xs uppercase tracking-widest font-bold"
                  style={{ color: `${textColor}aa` }}
                >
                  {general.offersLabel || 'Exclusive Deals'}
                </span>
                <h2 
                  className="text-2xl sm:text-4xl font-extrabold mt-2"
                  style={{ color: textColor }}
                >
                  {general.offersTitle || 'Special Offers For You'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Visual Image Offer Banners */}
                {banners && banners
                  .filter(b => b.enabled && b.position === 'offer')
                  .sort((a, b) => a.order - b.order)
                  .map((banner) => (
                    <div 
                      key={banner.id} 
                      className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col justify-between hover:scale-102 transition-all cursor-pointer group"
                      onClick={() => banner.link && navigate(banner.link)}
                    >
                      {banner.image && (
                        <div className="relative pt-[56.25%] overflow-hidden bg-gray-100">
                          <img 
                            src={getImageUrl(banner.image)} 
                            alt={banner.title || 'Special Promotion'} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-xs uppercase px-2.5 py-1 mb-3">
                            Promo Offer
                          </Badge>
                          {banner.title && <h3 className="text-lg font-bold text-gray-900 mb-1">{banner.title}</h3>}
                          {banner.subtitle && <p className="text-sm text-gray-500 leading-relaxed mb-4">{banner.subtitle}</p>}
                        </div>
                        {banner.link && (
                          <Button className="w-full bg-slate-900 hover:bg-black font-semibold text-xs py-2 rounded-xl text-white">
                            Shop Deal <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                {offers && offers
                  .filter(o => o.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((offer) => (
                    <div key={offer.id} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col justify-between hover:scale-102 transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 uppercase font-mono text-xs font-semibold px-2.5 py-1">
                            {offer.type.replace('-', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">Min Order: ₹{offer.minOrderAmount}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                        {offer.code && (
                          <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <span className="font-mono font-bold text-gray-800 text-sm flex-1">{offer.code}</span>
                            <button
                              onClick={() => handleCopyCode(offer.code!)}
                              className="text-gray-500 hover:text-gray-900 p-1 transition-colors"
                              title="Copy Code"
                            >
                              {copiedCode === offer.code ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Mid-Page Carousel / Banner Grid */}
        {banners && banners.filter(b => b.enabled && b.position === 'carousel').length > 0 && (
          <section className="relative z-10 py-12 px-4 md:px-8 bg-white/5 border-b border-white/10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {banners
                  .filter(b => b.enabled && b.position === 'carousel')
                  .sort((a, b) => a.order - b.order)
                  .map((banner) => (
                    <div 
                      key={banner.id} 
                      className="relative rounded-3xl overflow-hidden h-56 md:h-72 shadow-xl cursor-pointer group border border-white/15"
                      onClick={() => banner.link && navigate(banner.link)}
                    >
                      {banner.image && (
                        <img 
                          src={getImageUrl(banner.image)} 
                          alt={banner.title || 'Special Promotion'} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" 
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                        {banner.title && <h3 className="text-xl md:text-2xl font-black mb-1">{banner.title}</h3>}
                        {banner.subtitle && <p className="text-sm text-white/85">{banner.subtitle}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Standalone Countdown Clock Banner */}
        {countdownBanner && general.countdownTargetDate && (
          <section className="relative z-10 py-12 px-4 md:px-8 bg-white/5 border-b border-white/10">
            <div className="max-w-7xl mx-auto">
              <div 
                className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-center shadow-xl border border-white/15"
                style={countdownBanner.image ? {
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.85)), url(${getImageUrl(countdownBanner.image)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: '#ffffff'
                } : {
                  background: `linear-gradient(135deg, ${primaryColor}ee, ${accentColor}ee)`,
                  color: textColor
                }}
              >
                {countdownBanner.title && (
                  <h3 
                    className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight"
                    style={{ color: countdownBanner.image ? '#ffffff' : textColor }}
                  >
                    {countdownBanner.title}
                  </h3>
                )}
                {countdownBanner.subtitle && (
                  <p 
                    className="text-sm md:text-lg mb-6"
                    style={{ color: countdownBanner.image ? 'rgba(255,255,255,0.85)' : subtextColor }}
                  >
                    {countdownBanner.subtitle}
                  </p>
                )}
                <CampaignCountdown 
                  targetDate={general.countdownTargetDate} 
                  primaryColor={primaryColor} 
                  textColor={countdownBanner.image ? '#ffffff' : textColor}
                  subtextColor={countdownBanner.image ? 'rgba(255,255,255,0.7)' : subtextColor}
                />
                {countdownBanner.link && (
                  <Button 
                    onClick={() => navigate(countdownBanner.link!)}
                    className="mt-6 px-6 py-3 font-bold rounded-xl hover:scale-102 transition-all bg-white hover:bg-white/95"
                    style={{ 
                      backgroundColor: countdownBanner.image ? '#ffffff' : 'rgba(255,255,255,0.95)',
                      color: primaryColor 
                    }}
                  >
                    Explore Occasion
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Categories / Filter Section */}
        <section id="campaign-products" className="relative z-10 py-16 px-4 md:px-8 bg-white rounded-t-3xl shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold" style={{ color: primaryColor }}>
                Browse Gifts
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Curated Occasion Specialties</h2>
              <p className="text-gray-500 mt-2">Filter items by category to find the perfect token of appreciation</p>
            </div>

            {/* Circular Category Buttons */}
            {categories && categories.filter((c) => c.enabled).length > 0 && (
              <div className="flex items-center justify-start md:justify-center overflow-x-auto gap-4 pb-6 mb-12 scrollbar-none">
                <button
                  onClick={() => setSelectedCategorySlug('all')}
                  className={`flex flex-col items-center justify-center min-w-[70px] transition-all`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      selectedCategorySlug === 'all'
                        ? 'border-2 shadow-md scale-105'
                        : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    style={{ borderColor: selectedCategorySlug === 'all' ? primaryColor : 'transparent' }}
                  >
                    <Gift className="w-6 h-6 text-gray-600" style={{ color: selectedCategorySlug === 'all' ? primaryColor : undefined }} />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${selectedCategorySlug === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>All</span>
                </button>

                {categories
                  .filter((c) => c.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((cat) => {
                    const isSelected = selectedCategorySlug === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategorySlug(cat.slug)}
                        className="flex flex-col items-center justify-center min-w-[80px] transition-all"
                      >
                        <div
                          className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-2 shadow-md scale-105'
                              : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                          style={{ borderColor: isSelected ? primaryColor : 'transparent' }}
                        >
                          {cat.image ? (
                            <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium truncate max-w-[90px] text-center ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-500 border border-dashed rounded-2xl bg-gray-50">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg">No products available in this category yet.</p>
                <p className="text-sm text-gray-400 mt-1">Please explore other category filters above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((p) => {
                  const hasDiscount = p.discount > 0;
                  const finalPrice = hasDiscount ? p.price * (1 - p.discount / 100) : p.price;
                  
                  // Get campaign settings for custom badges
                  const campSettings = p.campaignSettings?.[slug] || {};
                  const customBadge = campSettings.badge;

                  return (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/product/${p._id}`)}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-101 transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
                    >
                      {/* Image Block */}
                      <div className="relative pt-[100%] bg-gray-100 overflow-hidden">
                        {p.images && p.images[0] ? (
                          <img
                            src={getImageUrl(p.images[0])}
                            alt={p.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Gift className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        {/* Custom Campaign Badge */}
                        {customBadge && (
                          <Badge className="absolute top-3 left-3 bg-purple-600 text-white border-none font-bold text-xs uppercase shadow-sm">
                            {customBadge}
                          </Badge>
                        )}
                        {/* Discount Badge */}
                        {hasDiscount && (
                          <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none font-bold text-xs shadow-sm">
                            {p.discount}% OFF
                          </Badge>
                        )}
                      </div>

                      {/* Info Block */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-purple-600 transition-colors mb-1">{p.title}</h3>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-yellow-400" />
                            <span className="text-xs font-semibold text-gray-600">{p.rating || '4.8'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex flex-col">
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(convertPrice(p.price))}
                              </span>
                            )}
                            <span className="font-extrabold text-gray-900 text-lg">
                              {formatPrice(convertPrice(finalPrice))}
                            </span>
                          </div>
                          
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full border bg-gray-50 group-hover:bg-purple-50 group-hover:text-purple-600">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative z-10 py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Same Day Delivery</h3>
              <p className="text-sm text-gray-500">
                {delivery.sameDayEnabled
                  ? `Express Same Day Delivery is available for this campaign! Charges: ₹${delivery.sameDayCharge || 0}.`
                  : 'Same day delivery cutoff rules apply based on location.'}
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Midnight Surprise</h3>
              <p className="text-sm text-gray-500">
                {delivery.midnightEnabled
                  ? `Surprise your loved ones at midnight! Enabled with a standard service charge of ₹${delivery.midnightCharge || 0}.`
                  : 'Midnight surprise deliveries available in selected zones.'}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">100% Freshness Guarantee</h3>
              <p className="text-sm text-gray-500">All flowers are hand-picked fresh from premium growers and delivered with maximum care.</p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 px-4 md:px-8 text-center relative z-10 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <Gift className="w-12 h-12 mx-auto mb-6 animate-pulse" style={{ color: primaryColor }} />
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Make {campaign.name} Special
            </h2>
            <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Choose the perfect gift and place your order today to secure priority delivery slots. Bring smiles to your loved ones!
            </p>
            <Button
              onClick={() => navigate('/shop')}
              size="lg"
              className="px-10 py-6 text-lg font-bold rounded-xl shadow-lg hover:scale-102 transition-all text-white"
              style={{ background: primaryColor }}
            >
              Browse All Gifts
            </Button>
          </div>
        </section>
        {/* Popup Banner Overlay Modal */}
        {popupBanner && showPopup && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-fade-in-up"
            >
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 bg-black/45 text-white hover:bg-black/70 rounded-full p-2 z-20 transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
              {popupBanner.image && (
                <div className="relative pt-[60%] bg-gray-100">
                  <img src={getImageUrl(popupBanner.image)} alt={popupBanner.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <div className="p-8 text-center bg-white">
                {popupBanner.title && <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{popupBanner.title}</h3>}
                {popupBanner.subtitle && <p className="text-gray-500 text-sm mb-6 leading-relaxed">{popupBanner.subtitle}</p>}
                <Button 
                  onClick={() => {
                    setShowPopup(false);
                    if (popupBanner.link) navigate(popupBanner.link);
                  }}
                  className="w-full py-6 font-bold rounded-xl text-white text-base shadow-lg transition-all"
                  style={{ background: primaryColor }}
                >
                  Claim Special Offer
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default SeasonalCampaignPage;
