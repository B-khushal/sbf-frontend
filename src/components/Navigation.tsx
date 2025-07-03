import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, Search, ShoppingCart, User, X, Heart, Sparkles, 
  TrendingUp, DollarSign, Store, LogIn, ChevronDown, 
  MapPin, Phone, Mail, Globe, ArrowRight, Star, Zap,
  Shield, Truck, RefreshCw, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import CurrencyConverter from './CurrencyConverter';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import useCart from '@/hooks/use-cart';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface NavigationProps {
  cartItemCount?: number;
}

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  image?: string;
  price: number;
}

const popularSearches = [
  { term: "Roses", icon: "🌹", count: "1.2k+" },
  { term: "Wedding Bouquets", icon: "💐", count: "850+" },
  { term: "Birthday Flowers", icon: "🎂", count: "950+" },
  { term: "Anniversary Gifts", icon: "💕", count: "720+" },
  { term: "Orchids", icon: "🌺", count: "630+" },
  { term: "Sunflowers", icon: "🌻", count: "440+" },
  { term: "Tulips", icon: "🌷", count: "520+" },
  { term: "Lilies", icon: "🌸", count: "380+" }
];

const quickActions = [
  { icon: <Truck size={16} />, label: "Same Day Delivery", href: "/delivery" },
  { icon: <Gift size={16} />, label: "Gift Cards", href: "/gift-cards" },
  { icon: <Star size={16} />, label: "Best Sellers", href: "/bestsellers" },
  { icon: <Shield size={16} />, label: "Care Guide", href: "/care" }
];

const NavLink: React.FC<{ to: string; active: boolean; children: React.ReactNode; className?: string }> = ({
  to,
  active,
  children,
  className
}) => {
  return (
    <Link
      to={to}
      className={cn(
        'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl group hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10',
        active 
          ? 'text-primary bg-gradient-to-r from-primary/15 to-secondary/15 shadow-sm' 
          : 'text-gray-700 hover:text-primary',
        className
      )}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-1/2 w-6 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform -translate-x-1/2"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

const Navigation = ({ cartItemCount = 0 }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { pathname } = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const cartHook = useCart();
  const { itemCount: actualCartCount, toggleCart, isCartOpen, items } = cartHook;
  
  // Debug cart state with detailed logging
  useEffect(() => {
    console.log('Navigation - Cart state:', { 
      actualCartCount,
      itemsLength: items.length,
      items: items,
    });
  }, [actualCartCount, items]);
  const { headerSettings, loading: settingsLoading } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get wishlist count directly from localStorage
  useEffect(() => {
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
    
    const interval = setInterval(updateWishlistCount, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlist-update', handleCustomEvent as EventListener);
      clearInterval(interval);
    };
  }, []);

  // Search suggestions API call
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSearchSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
        const products = response.data.products || response.data || [];
        
        const suggestions: SearchSuggestion[] = products.slice(0, 6).map((product: any) => ({
          id: product._id,
          title: product.title,
          category: product.category,
          image: product.images?.[0],
          price: product.price
        }));
        
        setSearchSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    navigate(`/product/${suggestion.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSearchFocused(false);
  };

  const handlePopularSearchClick = (term: string) => {
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSearchFocused(false);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-white text-center py-2 text-xs sm:text-sm font-medium z-50 relative">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={14} />
            <span>🌸 Free Delivery on Your First Order </span>
            <Truck size={14} />
          </motion.div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[70]">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Main Navigation Row */}
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/" className="flex items-center group">
                <img src="/images/logo.png" alt="Spring Blossoms Florist" className="h-10 sm:h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105" />
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              <NavLink to="/" active={pathname === '/'}>Home</NavLink>
              <NavLink to="/shop" active={pathname.startsWith('/shop')}>Shop</NavLink>
              <NavLink to="/about" active={pathname === '/about'}>About</NavLink>
              <NavLink to="/contact" active={pathname === '/contact'}>Contact</NavLink>
            </nav>
            
            {/* Desktop Icons & Search */}
            <div className="hidden lg:flex items-center gap-1">
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input
                    type="text"
                    placeholder="Search for flowers, bouquets, gifts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={(e) => {
                      // Only hide if not clicking on dropdown
                      if (!e.relatedTarget?.closest('[data-search-dropdown]')) {
                        setTimeout(() => {
                          setIsSearchFocused(false);
                          setShowSuggestions(false);
                        }, 150);
                      }
                    }}
                    className={cn(
                      "w-full pl-12 pr-12 py-3 text-sm border-2 rounded-2xl transition-all duration-200 placeholder:text-gray-400",
                      "bg-gray-50/80 border-gray-200",
                      "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20",
                      "hover:bg-gray-50 hover:border-gray-300"
                    )}
                  />
                  
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                    {isSearching ? (
                      <div className="p-2">
                        <RefreshCw size={16} className="animate-spin text-primary" />
                      </div>
                    ) : (
                      <motion.button
                        type="submit"
                        className="bg-gradient-to-r from-primary to-secondary text-white p-2 rounded-xl hover:shadow-md transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                      >
                        <ArrowRight size={14} />
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Enhanced Search Suggestions Dropdown */}
                  <AnimatePresence mode="wait">
                    {(showSuggestions && isSearchFocused) && (
                      <motion.div
                        data-search-dropdown
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ 
                          duration: 0.15, 
                          ease: "easeOut"
                        }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] max-h-96 overflow-hidden will-change-transform"
                        style={{ 
                          transform: 'translateZ(0)', // Force hardware acceleration
                          contain: 'layout style paint' // Optimize rendering
                        }}
                      >
                        {searchQuery.length >= 2 && searchSuggestions.length > 0 && (
                          <div className="p-3">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              <Search size={14} />
                              <span>Search Results</span>
                            </div>
                            <div className="space-y-1">
                              {searchSuggestions.map((suggestion, index) => (
                                <motion.button
                                  key={suggestion.id}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-xl transition-all duration-150 flex items-center gap-3 group"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ 
                                    duration: 0.2, 
                                    delay: index * 0.05,
                                    ease: "easeOut"
                                  }}
                                  whileHover={{ 
                                    x: 2,
                                    transition: { duration: 0.1 }
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                                    {suggestion.image && (
                                      <img 
                                        src={suggestion.image} 
                                        alt={suggestion.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors duration-150">
                                      {suggestion.title}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{suggestion.category}</p>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-1">
                                    <p className="text-sm font-bold text-primary">₹{suggestion.price}</p>
                                    <ArrowRight size={12} className="text-gray-400 group-hover:text-primary transition-colors duration-150" />
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {searchQuery.length < 2 && (
                          <div className="p-3">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              <TrendingUp size={14} />
                              <span>Popular Searches</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {popularSearches.slice(0, 6).map((item, index) => (
                                <motion.button
                                  key={item.term}
                                  onClick={() => handlePopularSearchClick(item.term)}
                                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-xl transition-all duration-150 flex items-center gap-2 group"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ 
                                    duration: 0.2, 
                                    delay: index * 0.05,
                                    ease: "easeOut"
                                  }}
                                  whileHover={{ 
                                    x: 2,
                                    transition: { duration: 0.1 }
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <span className="text-lg">{item.icon}</span>
                                  <div className="flex-1">
                                    <span className="group-hover:text-primary transition-colors duration-150">{item.term}</span>
                                    <span className="text-xs text-gray-400 ml-1">({item.count})</span>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Zap size={14} />
                                <span>Quick Actions</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {quickActions.map((action) => (
                                  <Link
                                    key={action.href}
                                    to={action.href}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-xl transition-all duration-200 group"
                                    onClick={() => {
                                      setShowSuggestions(false);
                                      setIsSearchFocused(false);
                                    }}
                                  >
                                    {action.icon}
                                    <span className="group-hover:text-primary transition-colors">{action.label}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>

              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/wishlist')}>
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>

                <Button variant="ghost" size="icon" className="rounded-full" onClick={handleCartClick}>
                  <ShoppingCart className="h-5 w-5" />
                  {actualCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {actualCartCount}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>

                {user ? (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <img src={user.avatar || '/images/default-avatar.png'} alt="User" className="h-7 w-7 rounded-full" />
                    </Button>
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="py-2 px-2">
                            <div className="flex items-center gap-3 px-3 py-2">
                              <img src={user.avatar || '/images/default-avatar.png'} alt="User" className="h-9 w-9 rounded-full" />
                              <div>
                                <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                            </div>
                            <div className="my-1 h-px bg-gray-100" />
                            
                            {user.role === 'admin' && (
                              <SheetClose asChild>
                                <Link to="/admin" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                                  <Store className="w-4 h-4 mr-2" /> Admin Dashboard
                                </Link>
                              </SheetClose>
                            )}
                            <SheetClose asChild>
                              <Link to="/profile" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                                <User className="w-4 h-4 mr-2" /> My Profile
                              </Link>
                            </SheetClose>
                            <button
                              onClick={logout}
                              className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <LogIn className="w-4 h-4 mr-2" /> Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/login')}>
                    <User className="h-5 w-5" />
                    <span className="sr-only">Login</span>
                  </Button>
                )}
              </motion.div>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleCartClick}>
                <ShoppingCart className="h-6 w-6" />
                {actualCartCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                    {actualCartCount}
                  </span>
                )}
              </Button>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm bg-white p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 flex justify-between items-center border-b">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        <img src="/images/logo.png" alt="Spring Blossoms" className="h-10" />
                      </Link>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetClose>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4">
                      <nav className="flex flex-col space-y-2">
                        <SheetClose asChild><NavLink to="/" active={pathname === '/'}>Home</NavLink></SheetClose>
                        <SheetClose asChild><NavLink to="/shop" active={pathname.startsWith('/shop')}>Shop</NavLink></SheetClose>
                        <SheetClose asChild><NavLink to="/about" active={pathname === '/about'}>About</NavLink></SheetClose>
                        <SheetClose asChild><NavLink to="/contact" active={pathname === '/contact'}>Contact</NavLink></SheetClose>
                        <SheetClose asChild><NavLink to="/wishlist" active={pathname === '/wishlist'}>Wishlist ({wishlistCount})</NavLink></SheetClose>
                      </nav>
                      <div className="my-4 h-px bg-gray-200" />
                      {user ? (
                        <div className="space-y-2">
                          <p className="font-semibold px-4">{user.name}</p>
                          {user.role === 'admin' && (
                            <SheetClose asChild>
                              <Link to="/admin" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                                <Store className="w-4 h-4 mr-2" /> Admin Dashboard
                              </Link>
                            </SheetClose>
                          )}
                          <SheetClose asChild>
                            <Link to="/profile" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                              <User className="w-4 h-4 mr-2" /> My Profile
                            </Link>
                          </SheetClose>
                          <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <LogIn className="w-4 h-4 mr-2" /> Logout
                          </button>
                        </div>
                      ) : (
                        <SheetClose asChild>
                          <Link to="/login" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                            <LogIn className="w-4 h-4 mr-2" /> Login / Sign Up
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                    <div className="p-4 border-t mt-auto">
                      <CurrencyConverter />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSearchFocused(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;