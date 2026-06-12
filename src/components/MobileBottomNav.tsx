import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import useCart, { useCartSelectors } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { createPortal } from 'react-dom';

export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
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
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/vendors-consent');

  if (isExcludedPage || !mounted) {
    return null;
  }

  const bottomNavItems = [
    {
      label: 'Shop',
      href: '/shop',
      icon: <ShoppingBag size={20} />,
      isActive: pathname.startsWith('/shop') || pathname === '/' || pathname.startsWith('/product') || pathname.startsWith('/products'),
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: <Heart size={20} />,
      badge: wishlistCount > 0 ? wishlistCount : undefined,
      isActive: pathname.startsWith('/wishlist'),
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: <ShoppingCart size={20} />,
      badge: actualCartCount > 0 ? actualCartCount : undefined,
      isActive: pathname.startsWith('/cart'),
    },
    {
      label: 'Account',
      href: user ? '/profile' : '/login',
      icon: <User size={20} />,
      isActive: pathname.startsWith('/profile') || pathname.startsWith('/login'),
    },
  ];

  const content = (
    <div 
      className="mobile-bottom-nav md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-4 pt-3 animate-slide-up"
      style={{ 
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)'
      }}
    >
      <div className="flex items-center justify-around">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-semibold transition-all duration-300 rounded-xl",
              item.isActive 
                ? "text-primary font-bold" 
                : "text-gray-500 hover:text-primary"
            )}
          >
            {/* Active Tab Highlight */}
            {item.isActive && (
              <motion.div
                layoutId="activeBottomTab"
                className="absolute inset-0 bg-primary/10 rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            
            <motion.div 
              className="relative flex items-center justify-center w-6 h-6 mb-1 z-10"
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
            >
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 z-20">
                  {item.badge}
                </span>
              )}
            </motion.div>
            <span className="text-[10px] uppercase tracking-wider font-semibold z-10">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileBottomNav;
