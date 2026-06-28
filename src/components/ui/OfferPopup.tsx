import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, Gift, Tag, Calendar, Sparkles, Heart, 
  Flame, Snowflake, Clock, Check, Copy, 
  Truck, Award, ShieldCheck, Flower2, HelpCircle
} from 'lucide-react';

interface OfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    _id: string;
    title: string;
    description: string;
    subtitle?: string;
    imageUrl?: string;
    mobileImageUrl?: string;
    backgroundColor?: string;
    background?: string;
    textColor?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    theme?: 'festive' | 'sale' | 'holiday' | 'general' | 'rakhi' | 'valentines' | 'mothersday' | 'fathersday' | 'diwali' | 'christmas' | 'newyear';
    expiryDate?: string;
    endDate?: string;
    code?: string;
    badgeText?: string;
    showCountdown?: boolean;
    discountPercent?: number;
    assignedVariantId?: string;
  } | null;
  trackCtaClick?: () => void;
  trackCouponCopy?: () => void;
}

// Particle interface
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
}

// Festival theme presets
const festivalThemes = {
  valentines: {
    primaryColor: '#e11d48', // deep rose
    secondaryColor: '#fda4af',
    accentColor: '#ffe4e6',
    icon: Heart,
    particleType: 'heart',
    particleColor: 'text-rose-500/40',
    gradient: 'linear-gradient(135deg, rgba(144, 12, 63, 0.9) 0%, rgba(225, 29, 72, 0.8) 100%)',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_40px_rgba(225,29,72,0.15)]'
  },
  rakhi: {
    primaryColor: '#9a3412', // rich gold-maroon
    secondaryColor: '#f59e0b',
    accentColor: '#fef3c7',
    icon: Flower2,
    particleType: 'petal',
    particleColor: 'text-amber-500/30',
    gradient: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9) 0%, rgba(180, 83, 9, 0.8) 100%)',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]'
  },
  diwali: {
    primaryColor: '#78350f', // deep warm gold-indigo
    secondaryColor: '#fbbf24',
    accentColor: '#fef3c7',
    icon: Flame,
    particleType: 'spark',
    particleColor: 'text-yellow-400/40',
    gradient: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(146, 64, 14, 0.8) 100%)',
    border: 'border-yellow-500/30',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.2)]'
  },
  christmas: {
    primaryColor: '#166534', // forest green
    secondaryColor: '#dc2626',
    accentColor: '#fee2e2',
    icon: Snowflake,
    particleType: 'snow',
    particleColor: 'text-white/40',
    gradient: 'linear-gradient(135deg, rgba(20, 83, 45, 0.9) 0%, rgba(185, 28, 28, 0.8) 100%)',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]'
  },
  newyear: {
    primaryColor: '#1e293b', // dark carbon-gold
    secondaryColor: '#d97706',
    accentColor: '#fef3c7',
    icon: Sparkles,
    particleType: 'spark',
    particleColor: 'text-amber-400/40',
    gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_50px_rgba(217,119,6,0.25)]'
  },
  mothersday: {
    primaryColor: '#db2777', // soft lavender pink
    secondaryColor: '#f472b6',
    accentColor: '#fdf2f8',
    icon: Gift,
    particleType: 'petal',
    particleColor: 'text-pink-400/30',
    gradient: 'linear-gradient(135deg, rgba(109, 40, 217, 0.85) 0%, rgba(219, 39, 119, 0.8) 100%)',
    border: 'border-pink-400/30',
    glow: 'shadow-[0_0_40px_rgba(219,39,119,0.15)]'
  },
  fathersday: {
    primaryColor: '#1e40af', // premium deep blue
    secondaryColor: '#3b82f6',
    accentColor: '#eff6ff',
    icon: Award,
    particleType: 'spark',
    particleColor: 'text-blue-400/30',
    gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(29, 78, 216, 0.85) 100%)',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.15)]'
  },
  sale: {
    primaryColor: '#4f46e5', // indigo
    secondaryColor: '#c084fc',
    accentColor: '#faf5ff',
    icon: Tag,
    particleType: 'spark',
    particleColor: 'text-purple-400/30',
    gradient: 'linear-gradient(135deg, rgba(49, 46, 129, 0.9) 0%, rgba(109, 40, 217, 0.8) 100%)',
    border: 'border-indigo-500/30',
    glow: 'shadow-[0_0_40px_rgba(99,102,241,0.15)]'
  },
  holiday: {
    primaryColor: '#059669', // emerald
    secondaryColor: '#34d399',
    accentColor: '#ecfdf5',
    icon: Calendar,
    particleType: 'petal',
    particleColor: 'text-emerald-400/35',
    gradient: 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(16, 185, 129, 0.8) 100%)',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]'
  },
  general: {
    primaryColor: '#db2777', // brand rose
    secondaryColor: '#e11d48',
    accentColor: '#fff1f2',
    icon: Sparkles,
    particleType: 'petal',
    particleColor: 'text-rose-400/30',
    gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(225, 29, 72, 0.75) 100%)',
    border: 'border-rose-500/25',
    glow: 'shadow-[0_0_40px_rgba(244,63,94,0.12)]'
  }
};

const OfferPopup: React.FC<OfferPopupProps> = ({
  isOpen,
  onClose,
  offer,
  trackCtaClick,
  trackCouponCopy
}) => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [copied, setCopied] = useState(false);
  const [claimProgress, setClaimProgress] = useState(72);
  const [claimCount, setClaimCount] = useState(482);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Parallax Tilt state (desktop only)
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const themeName = offer?.theme ?? 'general';
  const theme = festivalThemes[themeName] || festivalThemes.general;
  const ThemeIcon = theme.icon;

  // Track size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation & Focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Lock background scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Generate particles based on theme
  useEffect(() => {
    if (!isOpen || prefersReducedMotion) return;

    const count = isMobile ? 12 : 25;
    const items: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (isMobile ? 10 : 16) + 6,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * -10,
      rotate: Math.random() * 360
    }));

    setParticles(items);
  }, [isOpen, prefersReducedMotion, isMobile]);

  // Countdown timer calculation
  useEffect(() => {
    if (!isOpen || !offer) return;

    const expiryString = offer.expiryDate || offer.endDate;
    if (!expiryString) return;

    const expiryTime = new Date(expiryString).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, offer]);

  // Simulate claim updates
  useEffect(() => {
    if (!isOpen) return;

    const startClaims = Math.floor(Math.random() * 100) + 400;
    setClaimCount(startClaims);
    setClaimProgress(Math.floor((startClaims / 600) * 100));

    const interval = setInterval(() => {
      setClaimCount(prev => {
        const next = prev + (Math.random() > 0.3 ? 1 : 0);
        setClaimProgress(Math.min(98, Math.floor((next / 600) * 100)));
        return Math.min(592, next);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!offer) return null;

  // Handle Action Button click
  const handleButtonClick = () => {
    if (trackCtaClick) trackCtaClick();
    onClose();
    if (offer.buttonLink) {
      setTimeout(() => {
        navigate(offer.buttonLink!);
      }, 300);
    }
  };

  // Copy code utility
  const handleCopyCode = () => {
    if (!offer.code) return;
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    if (trackCouponCopy) trackCouponCopy();
    setTimeout(() => setCopied(false), 2500);
  };

  // Parallax Tilt mouse listener (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || prefersReducedMotion) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Maximum tilt angle of 5 degrees
    const tiltX = (y / (box.height / 2)) * -4;
    const tiltY = (x / (box.width / 2)) * 4;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeaveCard = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Rendering correct particle symbol
  const renderParticle = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-full h-full fill-current" />;
      case 'snow':
        return <div className="w-full h-full bg-white rounded-full opacity-60 filter blur-[1px]" />;
      case 'petal':
        return (
          <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
            <path d="M12 2C12 2 3 9 3 14C3 18.97 7.03 23 12 23C16.97 23 21 18.97 21 14C21 9 12 2 12 2Z" />
          </svg>
        );
      case 'spark':
      default:
        return <Sparkles className="w-full h-full fill-current" />;
    }
  };

  // Check if image exists
  const hasImage = !!(isMobile ? (offer.mobileImageUrl || offer.imageUrl) : offer.imageUrl);
  const resolvedImageUrl = isMobile ? (offer.mobileImageUrl || offer.imageUrl) : offer.imageUrl;

  // Custom inline background override or theme gradient
  const cardBackgroundStyle = (() => {
    const bgStyle = offer.background 
      ? { background: offer.background }
      : offer.backgroundColor 
        ? { backgroundColor: offer.backgroundColor } 
        : { background: theme.gradient };

    if (isMobile) {
      if (bgStyle.background) {
        // Replace any rgba(R, G, B, A) with solid rgba(R, G, B, 1) or solid hex colors
        const solidBg = bgStyle.background.replace(/rgba\((\d+,\s*\d+,\s*\d+),\s*0\.\d+\)/g, 'rgba($1, 1)');
        return { background: solidBg };
      }
      if (bgStyle.backgroundColor && bgStyle.backgroundColor.startsWith('rgba')) {
        const solidBg = bgStyle.backgroundColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),\s*0\.\d+\)/g, 'rgba($1, 1)');
        return { backgroundColor: solidBg };
      }
    }
    return bgStyle;
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Backdrop Blur + Dimming */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60"
            aria-hidden="true"
          />

          {/* Particle Effects Layer */}
          {!prefersReducedMotion && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ 
                    opacity: 0,
                    x: `${p.x}vw`, 
                    y: '-10vh',
                    scale: 0.5,
                    rotate: p.rotate 
                  }}
                  animate={{ 
                    opacity: [0, 0.8, 0.8, 0],
                    y: '110vh',
                    x: [`${p.x}vw`, `${p.x + (Math.sin(p.id) * 10)}vw`],
                    rotate: p.rotate + 360
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={{
                    position: 'absolute',
                    width: p.size,
                    height: p.size,
                  }}
                  className={theme.particleColor}
                >
                  {renderParticle(theme.particleType)}
                </motion.div>
              ))}
            </div>
          )}

          {/* Modal Card wrapper (for spring physics and desktop layout) */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-title"
            tabIndex={-1}
            // Spring physics entry
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.85, y: 30 }}
            animate={isMobile ? { y: 0 } : { 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotateX: tilt.x,
              rotateY: tilt.y,
              transformPerspective: 1000
            }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={
              prefersReducedMotion 
                ? { duration: 0.2 } 
                : isMobile 
                  ? { type: 'spring', damping: 25, stiffness: 220 }
                  : { type: 'spring', damping: 20, stiffness: 120 }
            }
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeaveCard}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 500 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (isMobile && info.offset.y > 140) {
                onClose();
              }
            }}
            style={{
              ...cardBackgroundStyle,
              color: offer.textColor || '#ffffff'
            }}
            className={`relative z-20 w-full overflow-hidden 
              ${isMobile 
                ? 'fixed bottom-0 left-0 right-0 rounded-t-[32px] max-h-[92vh] border-t' 
                : 'max-w-4xl rounded-[32px] border shadow-2xl'
              } 
              ${theme.border} ${theme.glow} backdrop-blur-md flex flex-col md:flex-row transition-shadow duration-300 font-sans`}
          >
            {/* Mobile Drag Indicator / Handle */}
            {isMobile && (
              <div className="w-full flex justify-center py-3 select-none">
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>
            )}

            {/* Campaign Visual Column */}
            {hasImage && (
              <div className="relative w-full md:w-5/12 h-44 sm:h-56 md:h-auto overflow-hidden group select-none">
                {/* Immersive overlay gradients */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/45 via-transparent to-transparent z-10" />
                <motion.img
                  src={resolvedImageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />
                
                {/* Floating Badges */}
                {offer.badgeText && (
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                    <span className="px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/90 text-slate-900 rounded-full shadow-md backdrop-blur-sm border border-slate-200/50">
                      ✨ {offer.badgeText}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Campaign Details Column */}
            <div className={`flex-1 flex flex-col justify-between p-6 sm:p-8 md:p-10 relative z-10 ${hasImage ? '' : 'w-full'}`}>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 md:right-6 md:top-6 rounded-full p-2 bg-black/15 hover:bg-black/30 text-current hover:rotate-90 hover:scale-110 transition-all duration-300 pointer-events-auto"
                aria-label="Dismiss discount popup"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                {/* Festive Banner Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-full bg-white/15 animate-pulse">
                    <ThemeIcon className="h-4.5 w-4.5 text-yellow-300" />
                  </div>
                  {offer.discountPercent && offer.discountPercent > 0 ? (
                    <span className="text-xs font-black uppercase tracking-widest text-yellow-300">
                      {offer.discountPercent}% SPECIAL DISCOUNT
                    </span>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-widest text-yellow-300">
                      SEASONAL SPECIAL
                    </span>
                  )}
                </div>

                {/* Offer Titles */}
                <h2 id="campaign-title" className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2 select-text font-serif">
                  {offer.title}
                </h2>
                {offer.subtitle && (
                  <h3 className="text-sm font-semibold opacity-90 tracking-wide uppercase mb-4 text-yellow-100 select-text">
                    {offer.subtitle}
                  </h3>
                )}

                {/* Description */}
                <p className="text-sm sm:text-base opacity-80 leading-relaxed mb-6 select-text">
                  {offer.description}
                </p>

                {/* Claim Progress bar */}
                <div className="mb-6 bg-black/25 rounded-2xl p-4 border border-white/5">
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-slate-300">Offer Claim Rate</span>
                    <span className="text-yellow-300">{claimCount} Claimed Today</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${claimProgress}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic text-left">
                    * Limited coupons remaining. Claims are allocated on a first-come, first-served basis.
                  </p>
                </div>

                {/* Copyable Coupon Pill */}
                {offer.code && (
                  <div className="mb-6">
                    <span className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-75">
                      Coupon Code
                    </span>
                    <div className="flex p-1 bg-black/35 backdrop-blur-md rounded-2xl border border-white/15 focus-within:border-amber-400/50 transition-colors">
                      <div className="flex-1 flex items-center px-4 font-mono text-base sm:text-lg font-black tracking-widest text-yellow-300 uppercase select-all">
                        {offer.code}
                      </div>
                      <motion.button
                        onClick={handleCopyCode}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md
                          ${copied 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-white hover:bg-slate-100 text-slate-900'
                          }`}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4.5 w-4.5 animate-bounce" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Code
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Countdown Timer */}
                {offer.showCountdown !== false && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
                  <div className="mb-6">
                    <span className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-75">
                      Offer Ends In
                    </span>
                    <div className="flex gap-2 sm:gap-3 text-center">
                      {[
                        { label: 'Days', val: timeLeft.days },
                        { label: 'Hrs', val: timeLeft.hours },
                        { label: 'Mins', val: timeLeft.minutes },
                        { label: 'Secs', val: timeLeft.seconds }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-white/5">
                          <span className="block text-lg sm:text-2xl font-black text-white font-mono leading-none">
                            {item.val.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons & Trust Badges */}
              <div className="mt-4">
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  {/* Primary Action */}
                  <motion.button
                    onClick={handleButtonClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 px-6 text-sm sm:text-base font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.45)] hover:brightness-105 duration-300 relative overflow-hidden group select-none text-center cursor-pointer"
                  >
                    {/* Shine sweep effect */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
                    {offer.buttonText || 'Claim Offer'}
                  </motion.button>
                  
                  {/* Secondary Action */}
                  {offer.secondaryCtaText && (
                    <motion.button
                      onClick={() => {
                        onClose();
                        if (offer.secondaryCtaLink) {
                          setTimeout(() => navigate(offer.secondaryCtaLink!), 300);
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="py-4 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 transition-all text-center cursor-pointer"
                    >
                      {offer.secondaryCtaText}
                    </motion.button>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="flex justify-between border-t border-white/10 pt-4 text-[9px] sm:text-[10px] font-bold text-slate-300 tracking-wider">
                  <div className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-yellow-400" />
                    Same Day Delivery
                  </div>
                  <div className="flex items-center gap-1">
                    <Flower2 className="h-3.5 w-3.5 text-yellow-400" />
                    Fresh Flowers Guaranteed
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-yellow-400" />
                    Premium Packaging
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OfferPopup;
