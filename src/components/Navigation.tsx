import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, Search, ShoppingCart, User, X, Heart, Sparkles, 
  TrendingUp, DollarSign, Store, LogIn, ChevronDown, 
  MapPin, Phone, Mail, Globe, ArrowRight, Star, Zap,
  Shield, Truck, RefreshCw, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Main Navigation Row */}
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/" className="flex items-center group">
                {/* Desktop Logo */}
                <div className="hidden lg:block">
                  <img
                    src={headerSettings.logo || "/api/placeholder/200/60"}
                    alt="Spring Blossoms Florist"
                    className="h-12 w-auto xl:h-14 transition-all duration-300 ease-in-out group-hover:scale-105 drop-shadow-sm"
                  />
                </div>
                
                {/* Tablet Logo */}
                <div className="hidden md:block lg:hidden">
                  <img
                    src={headerSettings.logo || "/api/placeholder/160/50"}
                    alt="Spring Blossoms Florist"
                    className="h-10 w-auto transition-all duration-300 ease-in-out group-hover:scale-105 drop-shadow-sm"
                  />
                </div>
                
                {/* Mobile Logo */}
                <div className="md:hidden">
                  <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wider transition-all duration-300 group-hover:from-blue-600 group-hover:via-pink-500 group-hover:to-purple-600">
                    SBF
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <motion.nav 
              className="hidden lg:flex items-center space-x-1 xl:space-x-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {headerSettings?.navigationItems
                ?.filter(item => item.enabled)
                ?.sort((a, b) => a.order - b.order)
                ?.map((item) => (
                <NavLink key={item.href} to={item.href} active={pathname === item.href}>
                  {item.label}
                </NavLink>
              ))}
            </motion.nav>
            
            {/* Search Bar - Desktop/Tablet */}
            <motion.div 
              className="hidden md:flex relative flex-1 max-w-md lg:max-w-lg xl:max-w-xl mx-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary z-10" />
                  <Input
                    type="text"
                    placeholder="Search for flowers, bouquets, gifts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsSearchFocused(false);
                        setShowSuggestions(false);
                      }, 200);
                    }}
                    className="w-full pl-12 pr-12 py-3 text-sm border-2 border-gray-200 rounded-2xl bg-gray-50/50 backdrop-blur-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-gray-400"
                  />
                  
                  {isSearching ? (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <RefreshCw size={16} className="animate-spin text-primary" />
                    </div>
                  ) : (
                    <motion.button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary to-secondary text-white p-2 rounded-xl hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRight size={14} />
                    </motion.button>
                  )}
                  
                  {/* Enhanced Search Suggestions Dropdown */}
                  <AnimatePresence>
                    {(showSuggestions && isSearchFocused) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-60 max-h-96 overflow-hidden"
                      >
                        {searchQuery.length >= 2 && searchSuggestions.length > 0 && (
                          <div className="p-3">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              <Search size={14} />
                              <span>Search Results</span>
                            </div>
                            <div className="space-y-1">
                              {searchSuggestions.map((suggestion) => (
                                <motion.button
                                  key={suggestion.id}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-xl transition-all duration-200 flex items-center gap-3 group"
                                  whileHover={{ x: 4 }}
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                                    {suggestion.image && (
                                      <img 
                                        src={suggestion.image} 
                                        alt={suggestion.title}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                                      {suggestion.title}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{suggestion.category}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-primary">₹{suggestion.price}</p>
                                    <ArrowRight size={12} className="text-gray-400 group-hover:text-primary transition-colors ml-auto" />
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
                              {popularSearches.slice(0, 6).map((item) => (
                                <motion.button
                                  key={item.term}
                                  onClick={() => handlePopularSearchClick(item.term)}
                                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-xl transition-all duration-200 flex items-center gap-2 group"
                                  whileHover={{ x: 2 }}
                                >
                                  <span className="text-lg">{item.icon}</span>
                                  <div className="flex-1">
                                    <span className="group-hover:text-primary transition-colors">{item.term}</span>
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
                </div>
              </form>
            </motion.div>
            
            {/* Right Side Actions */}
            <motion.div 
              className="flex items-center space-x-1 sm:space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="hidden sm:block">
                <CurrencyConverter />
              </div>
              
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setShowMobileSearch(true)}>
                  <Search size={18} />
                </Button>
              </div>

              {user && (
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/wishlist" className="relative">
                    <Heart size={18} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </Button>
              )}
              
              <Button variant="ghost" size="icon" onClick={handleCartClick} className="relative">
                <ShoppingCart size={18} />
                {(actualCartCount > 0) && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {actualCartCount}
                  </span>
                )}
              </Button>

              {user ? (
                <div className="relative">
                  <Button variant="ghost" size="icon" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <User size={18} />
                  </Button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border p-2 z-50"
                        onMouseLeave={() => setShowUserMenu(false)}
                      >
                        <div className="p-2 border-b">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/profile" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                            <User className="w-4 h-4 mr-2" />
                            My Account
                          </Link>
                          <Link to="/orders" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            My Orders
                          </Link>
                          {user.role === 'admin' && (
                            <Link to="/admin" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                              <Shield className="w-4 h-4 mr-2" />
                              Admin Dashboard
                            </Link>
                          )}
                          {user.role === 'vendor' ? (
                            <Link to="/vendor/dashboard" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                              <Store className="w-4 h-4 mr-2" />
                              Vendor Dashboard
                            </Link>
                          ) : (
                            <Link to="/vendor/register" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                              <Store className="w-4 h-4 mr-2" />
                              Become a Vendor
                            </Link>
                          )}
                          <button 
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/login">
                    <LogIn size={18} />
                  </Link>
                </Button>
              )}

              <div className="lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-80 p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-6 border-b">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                          <span className="text-xl font-bold">SBF</span>
                        </Link>
                      </div>
                      <div className="flex-1 p-6">
                        <nav className="space-y-2">
                          {headerSettings?.navigationItems
                            ?.filter(item => item.enabled)
                            .sort((a,b) => a.order - b.order)
                            .map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'block px-4 py-2 text-sm rounded-md',
                                pathname === item.href ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </nav>
                      </div>
                      <div className="p-6 border-t">
                        {!user ? (
                          <div className="space-y-2">
                            <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                              <Link to="/login">Sign In</Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                              <Link to="/signup">Sign Up</Link>
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => {
                              logout();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full"
                          >
                            Sign Out
                          </Button>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-white z-[100] p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Search</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileSearch(false)}>
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for flowers, bouquets, gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:border-primary"
                autoFocus
              />
            </form>
            <div className="mt-4 overflow-y-auto">
              {searchQuery.length >= 2 && searchSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {searchSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        handleSuggestionClick(suggestion);
                        setShowMobileSearch(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                    >
                      <img src={suggestion.image} alt={suggestion.title} className="w-12 h-12 rounded-md object-cover" />
                      <div>
                        <p className="font-semibold">{suggestion.title}</p>
                        <p className="text-sm text-gray-500">₹{suggestion.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((item) => (
                      <button
                        key={item.term}
                        onClick={() => {
                          handlePopularSearchClick(item.term);
                          setShowMobileSearch(false);
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {item.term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;