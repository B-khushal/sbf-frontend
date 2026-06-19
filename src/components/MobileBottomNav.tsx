import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCartSelectors } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useValentine } from '@/contexts/ValentineContext';
import { useSeasonalCampaign } from '@/contexts/SeasonalCampaignContext';
import { createPortal } from 'react-dom';

const SbfMonogram = ({ isActive, glowColor }: { isActive?: boolean; glowColor?: string }) => {
  const glowStyle = isActive && glowColor
    ? { filter: `drop-shadow(0 0 6px ${glowColor})` }
    : {};

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={cn(
        "w-5 h-5 transition-all duration-300", 
        isActive ? "scale-105" : "opacity-80"
      )} 
      style={glowStyle}
      fill="none" 
      stroke="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="44" strokeWidth="4" className="opacity-20" />
      <circle cx="50" cy="50" r="38" strokeWidth="1.5" strokeDasharray="3 3" className="opacity-40" />
      <path 
        d="M62 33C58 26 42 26 38 34C34 42 46 46 50 50C54 54 64 58 60 68C56 78 40 76 38 68" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M44 43C42.5 38 38 35 32 36C34.5 40 39 42 44 43Z" 
        fill="currentColor" 
        stroke="none"
      />
      <path 
        d="M56 57C57.5 62 62 65 68 64C65.5 60 61 58 56 57Z" 
        fill="currentColor" 
        stroke="none"
      />
    </svg>
  );
};

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-5 h-5">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const RoseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 2c1.5 1.5 3 2.5 3 4.5 0 2-1.5 3.5-3 3.5s-3-1.5-3-3.5c0-2 1.5-3 3-4.5z" fill="currentColor" />
    <path d="M12 10v9" />
    <path d="M12 13c-2 0-4-1-4-3 0 2 2 3 4 3z" fill="currentColor" />
    <path d="M12 15c2 0 4-1 4-3 0 2-2 3-4 3z" fill="currentColor" />
    <path d="M9 22H15" strokeWidth="1.5" />
  </svg>
);

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-5 h-5">
    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.62 0-2.98 1.28-3 2.9C11.98 3.28 10.62 2 9 2c-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4V8h16v11z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const getCampaignMobileIcon = (icon?: string) => {
  if (icon?.toLowerCase() === 'calendar') {
    return <CalendarIcon />;
  }

  return <GiftIcon />;
};

export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isValentineEnabled, settings } = useValentine();
  const { activeCampaigns } = useSeasonalCampaign();
  const { itemCount: actualCartCount } = useCartSelectors();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Sync wishlist count from localStorage
  useEffect(() => {
    setMounted(true);
    const updateWishlistCount = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      } catch (error) {
        console.error("Error reading wishlist:", error);
        setWishlistCount(0);
      }
    };
    
    updateWishlistCount();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wishlist') {
        updateWishlistCount();
      }
    };
    
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.count === 'number') {
        setWishlistCount(e.detail.count);
      } else {
        updateWishlistCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wishlist-update', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlist-update', handleCustomEvent as EventListener);
    };
  }, []);

  const isExcludedPage = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/checkout/shipping') ||
    pathname.startsWith('/checkout/payment') ||
    pathname.startsWith('/vendors-consent');

  if (isExcludedPage || !mounted) {
    return null;
  }

  // Load and merge admin settings for Mobile bottom navigation
  const defaultConfig = {
    showSbfButton: true,
    sbfLabel: 'SBF',
    enableValentineButton: true,
    valentineIcon: 'heart' as const,
    valentineButtonColor: '#FF2E78',
    glowIntensity: 'medium' as const,
    navbarBackgroundStyle: 'glassmorphism' as const,
    enableFloatingAnimation: true,
    enableHeartParticles: true,
    enableSeasonalTheme: true,
    showWishlistDuringValentine: false,
    valentineLabel: 'LOVE',
    valentineButtonSize: 48,
    valentineGlowEnabled: true
  };

  const config = {
    ...defaultConfig,
    ...settings?.mobileNavigation
  };

  const showValentine = isValentineEnabled && config.enableValentineButton;
  const isSeasonal = isValentineEnabled && config.enableSeasonalTheme;

  const navbarCampaigns = (activeCampaigns || []).filter(
    (campaign) => campaign.enabled && campaign.navigation?.showInMobileNavbar === true
  );
  const floatingNavbarCampaign = showValentine ? null : (navbarCampaigns[0] || null);
  const inlineNavbarCampaigns = showValentine ? navbarCampaigns : navbarCampaigns.slice(1);

  // Determine if wishlist should be shown
  // When Valentine mode is ON: hide wishlist unless admin explicitly enables it
  // When Valentine mode is OFF: always show wishlist (unless a seasonal campaign is active)
  const isSeasonalCampaignActive = activeCampaigns && activeCampaigns.some(
    (c) => c.enabled && c.slug !== 'valentine' && c.slug !== 'valentines-week'
  );
  const showWishlist = showValentine 
    ? config.showWishlistDuringValentine 
    : (isSeasonalCampaignActive ? false : true);

  const activeColor = showValentine 
    ? (isSeasonal ? config.valentineButtonColor : undefined)
    : (floatingNavbarCampaign ? floatingNavbarCampaign.theme.primaryColor : undefined);

  // Build tabs dynamically
  const tabs: Array<{
    id: string;
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: number;
    isActive: boolean;
    isSpacer?: boolean;
  }> = [];

  if (config.showSbfButton) {
    tabs.push({
      id: 'sbf',
      label: config.sbfLabel || 'SBF',
      href: '/',
      icon: <SbfMonogram isActive={pathname === '/'} glowColor={activeColor} />,
      isActive: pathname === '/'
    });
  }

  tabs.push({
    id: 'shop',
    label: 'Shop',
    href: '/shop',
    icon: <ShoppingBag size={20} strokeWidth={1.5} />,
    isActive: pathname.startsWith('/shop') || pathname.startsWith('/product') || pathname.startsWith('/products')
  });

  if (showValentine) {
    // Spacer for floating Valentine button in center
    tabs.push({
      id: 'valentine-spacer',
      label: config.valentineLabel || 'LOVE',
      href: '/valentine-special',
      isSpacer: true,
      isActive: pathname.startsWith('/valentine-special') || pathname.startsWith('/valentine-shop')
    });

    inlineNavbarCampaigns.forEach((campaign) => {
      tabs.push({
        id: campaign.slug,
        label: campaign.name,
        href: `/occasions/${campaign.slug}`,
        icon: getCampaignMobileIcon(campaign.theme.icon),
        isActive: pathname.startsWith(`/occasions/${campaign.slug}`)
      });
    });
  } else if (floatingNavbarCampaign) {
    // Spacer for floating campaign button in center
    tabs.push({
      id: `campaign-spacer-${floatingNavbarCampaign.slug}`,
      label: floatingNavbarCampaign.name,
      href: `/occasions/${floatingNavbarCampaign.slug}`,
      isSpacer: true,
      isActive: pathname.startsWith(`/occasions/${floatingNavbarCampaign.slug}`)
    });

    inlineNavbarCampaigns.forEach((campaign) => {
      tabs.push({
        id: campaign.slug,
        label: campaign.name,
        href: `/occasions/${campaign.slug}`,
        icon: getCampaignMobileIcon(campaign.theme.icon),
        isActive: pathname.startsWith(`/occasions/${campaign.slug}`)
      });
    });
  }

  // Only show wishlist when appropriate
  if (showWishlist) {
    tabs.push({
      id: 'wishlist',
      label: 'Wishlist',
      href: '/wishlist',
      icon: <Heart size={20} strokeWidth={1.5} />,
      badge: wishlistCount > 0 ? wishlistCount : undefined,
      isActive: pathname.startsWith('/wishlist')
    });
  }

  tabs.push({
    id: 'cart',
    label: 'Cart',
    href: '/cart',
    icon: <ShoppingCart size={20} strokeWidth={1.5} />,
    badge: actualCartCount > 0 ? actualCartCount : undefined,
    isActive: pathname.startsWith('/cart')
  });

  tabs.push({
    id: 'account',
    label: 'Account',
    href: user ? '/profile' : '/login',
    icon: <User size={20} strokeWidth={1.5} />,
    isActive: pathname.startsWith('/profile') || pathname.startsWith('/login')
  });

  // Dynamic glow style based on color and intensity
  const buttonSize = config.valentineButtonSize || 48;
  const glowEnabled = config.valentineGlowEnabled !== false;
  const glowShadows = glowEnabled ? {
    low: `0 4px 12px -3px ${config.valentineButtonColor}30, 0 2px 6px -2px ${config.valentineButtonColor}20`,
    medium: `0 6px 18px -3px ${config.valentineButtonColor}50, 0 3px 8px -2px ${config.valentineButtonColor}30`,
    high: `0 8px 24px -3px ${config.valentineButtonColor}70, 0 4px 12px -2px ${config.valentineButtonColor}40`
  } : {
    low: `0 2px 8px -2px rgba(0,0,0,0.1)`,
    medium: `0 4px 12px -2px rgba(0,0,0,0.15)`,
    high: `0 6px 16px -2px rgba(0,0,0,0.2)`
  };
  const glowStyle = glowShadows[config.glowIntensity] || glowShadows.medium;

  // Floating Valentine Button element
  const floatingValentineButton = showValentine && (
    <Link
      to="/valentine-special"
      className={cn(
        "absolute left-1/2 flex items-center justify-center rounded-full text-white z-50",
        config.enableFloatingAnimation ? "animate-float" : "",
        "transition-all duration-300 ease-out active:scale-95"
      )}
      style={{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        top: `-${Math.round(buttonSize * 0.42)}px`,
        background: `linear-gradient(135deg, ${config.valentineButtonColor} 0%, #FF5C93 50%, ${config.valentineButtonColor}dd 100%)`,
        boxShadow: glowStyle,
        border: `1.5px solid rgba(255,255,255,0.35)`,
        '--glow-color': `${config.valentineButtonColor}50`
      } as React.CSSProperties}
    >
      {/* Frosted shine overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      
      {/* Selected Icon */}
      <span className="relative z-10 drop-shadow-sm">
        {config.valentineIcon === 'rose' ? <RoseIcon /> : config.valentineIcon === 'gift' ? <GiftIcon /> : <HeartIcon />}
      </span>
      
      {/* Floating Particles — reduced to 3 for subtlety */}
      {config.enableHeartParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="absolute text-rose-300 text-[8px] select-none pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-4px',
                marginTop: '-4px',
                '--x': `${(i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 14)}px`,
                '--y': `-${22 + Math.random() * 18}px`,
                animation: 'particleRise 3s ease-out infinite',
                animationDelay: `${i * 0.8}s`
              } as React.CSSProperties}
            >
              ❤️
            </span>
          ))}
        </div>
      )}
    </Link>
  );

  // Floating Seasonal Campaign Button element (mutually exclusive with Valentine's center slot)
  const floatingCampaignButton = !showValentine && floatingNavbarCampaign && (
    <Link
      to={`/occasions/${floatingNavbarCampaign.slug}`}
      className={cn(
        "absolute left-1/2 flex items-center justify-center rounded-full text-white z-50",
        config.enableFloatingAnimation ? "animate-float" : "",
        "transition-all duration-300 ease-out active:scale-95"
      )}
      style={{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        top: `-${Math.round(buttonSize * 0.42)}px`,
        background: `linear-gradient(135deg, ${floatingNavbarCampaign.theme.primaryColor} 0%, ${floatingNavbarCampaign.theme.secondaryColor || floatingNavbarCampaign.theme.primaryColor} 50%, ${floatingNavbarCampaign.theme.primaryColor}dd 100%)`,
        boxShadow: activeColor ? `0 6px 18px -3px ${activeColor}50, 0 3px 8px -2px ${activeColor}30` : undefined,
        border: `1.5px solid rgba(255,255,255,0.35)`,
        '--glow-color': `${floatingNavbarCampaign.theme.primaryColor}50`
      } as React.CSSProperties}
    >
      {/* Frosted shine overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      
      {/* Selected Icon */}
      <span className="relative z-10 drop-shadow-sm">
        {getCampaignMobileIcon(floatingNavbarCampaign.theme.icon)}
      </span>
      
      {/* Floating Particles — reduced to 3 for subtlety */}
      {config.enableHeartParticles && floatingNavbarCampaign.theme.animationStyle !== 'none' && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(3)].map((_, i) => {
            let particleChar = '🎁';
            if (floatingNavbarCampaign.theme.animationStyle === 'hearts') particleChar = '❤️';
            else if (floatingNavbarCampaign.theme.animationStyle === 'petals') particleChar = '🌸';
            else if (floatingNavbarCampaign.theme.animationStyle === 'leaves') particleChar = '🍃';
            else if (floatingNavbarCampaign.theme.animationStyle === 'confetti') particleChar = '🎉';
            
            return (
              <span
                key={i}
                className="absolute text-[8px] select-none pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-4px',
                  marginTop: '-4px',
                  '--x': `${(i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 14)}px`,
                  '--y': `-${22 + Math.random() * 18}px`,
                  animation: 'particleRise 3s ease-out infinite',
                  animationDelay: `${i * 0.8}s`
                } as React.CSSProperties}
              >
                {particleChar}
              </span>
            );
          })}
        </div>
      )}
    </Link>
  );

  const isGlass = config.navbarBackgroundStyle === 'glassmorphism';

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 9999,
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
    ...(activeColor ? {
      boxShadow: `0 -8px 30px -8px ${activeColor}15`,
      borderTop: `1px solid ${activeColor}20`
    } : {
      boxShadow: '0 -4px 24px rgba(0,0,0,0.04)'
    })
  };

  const content = (
    <div 
      className={cn(
        "mobile-bottom-nav lg:hidden border-t px-2 pt-2 pb-1.5 transition-all duration-300 rounded-t-[1.5rem]",
        isGlass
          ? "bg-white/70 dark:bg-slate-900/75 backdrop-blur-2xl border-white/30 dark:border-slate-800/40"
          : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"
      )}
      style={containerStyle}
    >
      {/* CSS Animations — optimized for 60fps */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translate(-50%, -${Math.round(buttonSize * 0.42)}px); }
          50% { transform: translate(-50%, -${Math.round(buttonSize * 0.42) + 3}px); }
          100% { transform: translate(-50%, -${Math.round(buttonSize * 0.42)}px); }
        }
        @keyframes floatPulse {
          0% { box-shadow: 0 4px 12px -3px var(--glow-color); }
          50% { box-shadow: 0 8px 20px 0px var(--glow-color); }
          100% { box-shadow: 0 4px 12px -3px var(--glow-color); }
        }
        @keyframes particleRise {
          0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          100% { transform: translate(var(--x), var(--y)) scale(0); opacity: 0; }
        }
        .animate-float {
          animation: floatUp 4s ease-in-out infinite;
          will-change: transform;
        }
        .animate-glow-pulse {
          animation: floatPulse 2.5s ease-in-out infinite;
          will-change: box-shadow;
        }
      `}</style>

      {/* Floating Center Button wrapper */}
      <div className="relative w-full h-full flex items-center justify-evenly">
        {floatingValentineButton}
        {floatingCampaignButton}

        {tabs.map((item) => {
          if (item.isSpacer) {
            // Placeholder space for the floating center button
            return (
              <div 
                key={item.id} 
                className="relative flex flex-col items-center justify-end flex-1 min-w-[52px] py-1 select-none pointer-events-none"
              >
                <div style={{ width: `${buttonSize}px`, height: `${Math.round(buttonSize * 0.55)}px` }} />
                <span 
                  className={cn(
                    "text-[9px] font-semibold tracking-widest z-10 transition-all duration-300 mt-0.5 uppercase",
                    item.isActive 
                      ? "font-bold" 
                      : "text-gray-400 dark:text-gray-500"
                  )}
                  style={item.isActive && activeColor ? {
                    color: activeColor
                  } : {}}
                >
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 min-w-[52px] min-h-[44px] py-1 text-[10px] font-semibold transition-all duration-300 rounded-xl z-10",
                item.isActive 
                  ? (activeColor ? "" : "text-primary font-bold")
                  : "text-gray-500 hover:text-primary dark:text-gray-400"
              )}
              style={item.isActive && activeColor ? {
                color: activeColor
              } : {}}
            >
              {/* Active Highlight Capsule */}
              {item.isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className={cn(
                    "absolute inset-x-1 inset-y-0.5 rounded-xl z-0",
                    activeColor ? "" : "bg-primary/10"
                  )}
                  style={activeColor ? {
                    backgroundColor: `${activeColor}15`
                  } : {}}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <motion.div 
                className="relative flex items-center justify-center w-6 h-6 mb-0.5 z-10"
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
              >
                {item.icon}
                {item.badge !== undefined && (
                  <span 
                    className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 z-20 shadow-sm"
                    style={{
                      background: activeColor ? `linear-gradient(135deg, ${activeColor} 0%, ${showValentine ? '#FF5C93' : (floatingNavbarCampaign?.theme.secondaryColor || activeColor)} 100%)` : 'hsl(var(--primary))'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.div>
              <span className="text-[10px] font-semibold z-10 uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileBottomNav;
