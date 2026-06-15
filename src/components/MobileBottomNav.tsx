import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCartSelectors } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useValentine } from '@/contexts/ValentineContext';
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
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-6 h-6">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const RoseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 2c1.5 1.5 3 2.5 3 4.5 0 2-1.5 3.5-3 3.5s-3-1.5-3-3.5c0-2 1.5-3 3-4.5z" fill="currentColor" />
    <path d="M12 10v9" />
    <path d="M12 13c-2 0-4-1-4-3 0 2 2 3 4 3z" fill="currentColor" />
    <path d="M12 15c2 0 4-1 4-3 0 2-2 3-4 3z" fill="currentColor" />
    <path d="M9 22H15" strokeWidth="1.5" />
  </svg>
);

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-6 h-6">
    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.62 0-2.98 1.28-3 2.9C11.98 3.28 10.62 2 9 2c-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4V8h16v11z" />
  </svg>
);

export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isValentineEnabled, settings } = useValentine();
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
    enableSeasonalTheme: true
  };

  const config = {
    ...defaultConfig,
    ...settings?.mobileNavigation
  };

  const showValentine = isValentineEnabled && config.enableValentineButton;
  const isSeasonal = isValentineEnabled && config.enableSeasonalTheme;

  // Build tabs dynamically
  const tabs = [];

  if (config.showSbfButton) {
    tabs.push({
      id: 'sbf',
      label: config.sbfLabel || 'SBF',
      href: '/',
      icon: <SbfMonogram isActive={pathname === '/'} glowColor={isSeasonal ? config.valentineButtonColor : undefined} />,
      isActive: pathname === '/'
    });
  }

  tabs.push({
    id: 'shop',
    label: 'Shop',
    href: '/shop',
    icon: <ShoppingBag size={22} strokeWidth={1.5} />,
    isActive: pathname.startsWith('/shop') || pathname.startsWith('/product') || pathname.startsWith('/products')
  });

  if (showValentine) {
    // Spacer for floating Valentine button in center
    tabs.push({
      id: 'valentine-spacer',
      label: "Valentine's",
      href: '/valentine-special',
      isSpacer: true,
      isActive: pathname.startsWith('/valentine-special') || pathname.startsWith('/valentine-shop')
    });
  }

  tabs.push({
    id: 'wishlist',
    label: 'Wishlist',
    href: '/wishlist',
    icon: <Heart size={22} strokeWidth={1.5} />,
    badge: wishlistCount > 0 ? wishlistCount : undefined,
    isActive: pathname.startsWith('/wishlist')
  });

  tabs.push({
    id: 'cart',
    label: 'Cart',
    href: '/cart',
    icon: <ShoppingCart size={22} strokeWidth={1.5} />,
    badge: actualCartCount > 0 ? actualCartCount : undefined,
    isActive: pathname.startsWith('/cart')
  });

  tabs.push({
    id: 'account',
    label: 'Account',
    href: user ? '/profile' : '/login',
    icon: <User size={22} strokeWidth={1.5} />,
    isActive: pathname.startsWith('/profile') || pathname.startsWith('/login')
  });

  // Dynamic glow style based on color and intensity
  const glowShadows = {
    low: `0 4px 10px -2px ${config.valentineButtonColor}33`,
    medium: `0 8px 20px -2px ${config.valentineButtonColor}66`,
    high: `0 12px 30px -2px ${config.valentineButtonColor}aa`
  };
  const glowStyle = glowShadows[config.glowIntensity] || glowShadows.medium;

  // Floating Valentine Button element
  const floatingValentineButton = showValentine && (
    <Link
      to="/valentine-special"
      className={cn(
        "absolute left-1/2 flex items-center justify-center rounded-full text-white z-50",
        config.enableFloatingAnimation ? "animate-float" : "",
        "transition-all duration-300 ease-out active:scale-95 border-3"
      )}
      style={{
        width: '56px',
        height: '56px',
        top: '-24px',
        background: `linear-gradient(135deg, ${config.valentineButtonColor} 0%, #FF5C93 100%)`,
        boxShadow: glowStyle,
        borderColor: '#FFD6E5',
        '--glow-color': `${config.valentineButtonColor}66`
      } as React.CSSProperties}
    >
      {/* Frosted shine overlay */}
      <div className="absolute inset-0.5 rounded-full bg-white/10 backdrop-blur-[1px] pointer-events-none" />
      
      {/* Selected Icon */}
      <span className="relative z-10 drop-shadow-md">
        {config.valentineIcon === 'rose' ? <RoseIcon /> : config.valentineIcon === 'gift' ? <GiftIcon /> : <HeartIcon />}
      </span>
      
      {/* Floating Particles */}
      {config.enableHeartParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="absolute text-rose-400 text-[10px] select-none pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-5px',
                marginTop: '-5px',
                '--x': `${(i % 2 === 0 ? 1 : -1) * (14 + Math.random() * 18)}px`,
                '--y': `-${30 + Math.random() * 25}px`,
                animation: 'particleRise 2.5s ease-out infinite',
                animationDelay: `${i * 0.5}s`
              } as React.CSSProperties}
            >
              ❤️
            </span>
          ))}
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
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.6rem)',
    ...(isSeasonal ? {
      boxShadow: `0 -10px 35px -10px ${config.valentineButtonColor}20`,
      borderTop: `1px solid ${config.valentineButtonColor}30`
    } : {
      boxShadow: '0 -8px 30px rgba(0,0,0,0.06)'
    })
  };

  const content = (
    <div 
      className={cn(
        "mobile-bottom-nav lg:hidden border-t px-3 pt-2 pb-2 transition-all duration-300 rounded-t-[1.8rem]",
        isGlass
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-800/50"
          : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"
      )}
      style={containerStyle}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translate(-50%, -20px); }
          50% { transform: translate(-50%, -26px); }
          100% { transform: translate(-50%, -20px); }
        }
        @keyframes floatPulse {
          0% { box-shadow: 0 4px 10px -2px var(--glow-color); }
          50% { box-shadow: 0 12px 25px 2px var(--glow-color); }
          100% { box-shadow: 0 4px 10px -2px var(--glow-color); }
        }
        @keyframes particleRise {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          100% { transform: translate(var(--x), var(--y)) scale(0); opacity: 0; }
        }
        .animate-float {
          animation: floatUp 3.2s ease-in-out infinite;
        }
        .animate-glow-pulse {
          animation: floatPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Center Button wrapper */}
      <div className="relative w-full h-full flex items-center justify-around">
        {floatingValentineButton}

        {tabs.map((item) => {
          if (item.isSpacer) {
            // Placeholder space for the floating center button
            return (
              <div 
                key={item.id} 
                className="relative flex flex-col items-center justify-end flex-1 py-1 text-[10px] select-none pointer-events-none"
              >
                <div className="w-14 h-11" />
                <span 
                  className={cn(
                    "text-[10px] font-bold tracking-wider z-10 transition-all duration-300 mt-1 uppercase",
                    item.isActive 
                      ? "font-bold" 
                      : "text-gray-400 dark:text-gray-500"
                  )}
                  style={item.isActive && isSeasonal ? {
                    color: config.valentineButtonColor
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
                "relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-all duration-300 rounded-xl z-10",
                item.isActive 
                  ? (isSeasonal ? "" : "text-primary font-bold")
                  : "text-gray-500 hover:text-primary dark:text-gray-400"
              )}
              style={item.isActive && isSeasonal ? {
                color: config.valentineButtonColor
              } : {}}
            >
              {/* Active Highlight Capsule */}
              {item.isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className={cn(
                    "absolute inset-x-1 inset-y-0.5 rounded-xl z-0",
                    isSeasonal ? "" : "bg-primary/10"
                  )}
                  style={isSeasonal ? {
                    backgroundColor: `${config.valentineButtonColor}18`
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
                      background: isSeasonal ? `linear-gradient(135deg, ${config.valentineButtonColor} 0%, #FF5C93 100%)` : 'hsl(var(--primary))'
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
