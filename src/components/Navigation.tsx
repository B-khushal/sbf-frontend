import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User, X, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import CurrencyConverter from './CurrencyConverter';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import useCart from '@/hooks/use-cart';
import { useSettings } from '@/contexts/SettingsContext';

interface NavItem {
  href: string;
  label: string;
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

// Removed hardcoded navItems - now using dynamic settings

const popularSearches = [
  "Roses", "Wedding Bouquets", "Birthday Flowers", "Anniversary Gifts", 
  "Orchids", "Sunflowers", "Tulips", "Lilies"
];

const NavLink: React.FC<{ to: string; active: boolean; children: React.ReactNode }> = ({
  to,
  active,
  children,
}) => {
  return (
    <Link
      to={to}
      className={cn(
        'text-sm font-medium transition-colors text-pink-600 hover:text-green-600',
        active ? 'font-bold' : 'text-muted-foreground'
      )}
    >
      {children}
    </Link>
  );
};

const Navigation = ({ cartItemCount = 0 }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const { itemCount: actualCartCount } = useCart();
  const { headerSettings, loading: settingsLoading } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    
    const interval = setInterval(updateWishlistCount, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlist-update', handleCustomEvent as EventListener);
      clearInterval(interval);
    };
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        const response = await api.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const products = response.data.products || response.data || [];
        
        const suggestions: SearchSuggestion[] = products.slice(0, 5).map((product: any) => ({
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

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          {/* Desktop Logo */}
          <img
            src={headerSettings.logo}
            alt="Spring Blossoms Florist Logo"
            className="hidden md:block h-24 w-70 transition-transform duration-300 ease-in-out hover:scale-105"
          />
          {/* Mobile Logo */}
          <div className="md:hidden">
            <span className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wider hover:from-blue-600 hover:via-pink-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
              SBF
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation and Search */}
        <div className="hidden md:flex items-center space-x-6">
          {headerSettings.navigationItems
            .filter(item => item.enabled)
            .sort((a, b) => a.order - b.order)
            .map((item) => (
            <NavLink key={item.href} to={item.href} active={pathname === item.href}>
              {item.label}
            </NavLink>
          ))}
          
          {/* Enhanced Search Bar */}
          <div ref={searchRef} className="relative">
            <form onSubmit={handleSearchSubmit} className={cn(
              "flex items-center bg-gradient-to-r from-bloom-blue-50 to-bloom-pink-50 rounded-full px-4 py-2 shadow-sm transition-all duration-300",
              isSearchFocused 
                ? "w-80 shadow-lg ring-2 ring-bloom-blue-200" 
                : "w-72 hover:shadow-md hover:from-bloom-pink-50 hover:to-bloom-green-50"
            )}>
              <input
                type="text"
                placeholder={isSearchFocused ? "Search for flowers, bouquets, occasions..." : headerSettings.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                className="bg-transparent placeholder-bloom-blue-400 text-bloom-blue-600 text-sm focus:outline-none w-full transition-all"
              />
              <button 
                type="submit" 
                className="text-bloom-green-500 hover:text-bloom-pink-500 transition-colors ml-2 p-1 rounded-full hover:bg-white/50"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="animate-spin h-4 w-4 border-2 border-bloom-green-500 border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (isSearchFocused || searchQuery.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-white via-bloom-pink-50/30 to-bloom-blue-50/30 rounded-2xl shadow-2xl border border-bloom-pink-200/50 z-50 overflow-hidden backdrop-blur-sm">
                {searchQuery.length >= 2 && (
                  <>
                    {searchSuggestions.length > 0 && (
                      <div className="p-3 bg-gradient-to-r from-bloom-pink-50/50 to-bloom-blue-50/50">
                        <div className="text-xs font-bold text-bloom-blue-600 mb-3 flex items-center gap-1 bg-white/80 p-2 rounded-lg shadow-sm">
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                          ✨ SUGGESTIONS
                        </div>
                        {searchSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-bloom-pink-100/70 hover:to-bloom-blue-100/70 rounded-xl transition-all duration-300 text-left mb-2 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-bloom-pink-200 to-bloom-blue-200 rounded-xl flex-shrink-0 overflow-hidden shadow-md">
                              {suggestion.image ? (
                                <img 
                                  src={suggestion.image.startsWith('/') 
                                    ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${suggestion.image}`
                                    : suggestion.image
                                  } 
                                  alt={suggestion.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-bloom-pink-200 to-bloom-blue-200 flex items-center justify-center">
                                  <Search className="h-4 w-4 text-bloom-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-bloom-blue-800 truncate">{suggestion.title}</div>
                              <div className="text-xs text-bloom-pink-600 bg-bloom-pink-100/60 px-2 py-1 rounded-full inline-block mt-1">{suggestion.category}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {searchQuery.length >= 2 && (
                      <div className="border-t border-bloom-pink-200/50 p-3 bg-gradient-to-r from-bloom-blue-50/50 to-bloom-pink-50/50">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full flex items-center gap-2 p-3 text-white bg-gradient-to-r from-bloom-blue-500 to-bloom-pink-500 hover:from-bloom-blue-600 hover:to-bloom-pink-600 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          <Search className="h-4 w-4" />
                          🔍 Search for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {searchQuery.length < 2 && (
                  <div className="p-3 bg-gradient-to-br from-bloom-green-50/50 via-bloom-blue-50/50 to-bloom-pink-50/50">
                    <div className="text-xs font-bold text-bloom-green-600 mb-3 flex items-center gap-1 bg-white/80 p-2 rounded-lg shadow-sm">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      🔥 POPULAR SEARCHES
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handlePopularSearchClick(term)}
                          className="text-left p-3 text-sm text-bloom-blue-700 bg-gradient-to-r from-white/80 to-bloom-blue-50/80 hover:from-bloom-blue-100 hover:to-bloom-pink-100 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] border border-bloom-blue-200/50"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Currency Converter - Desktop */}
          {headerSettings.showCurrencyConverter && (
            <CurrencyConverter className="hidden md:block" />
          )}
          
          {/* Account - Desktop only */}
          <Link to="/profile" className="hidden md:block">
            <Button variant="ghost" size="icon" aria-label="Account" className="text-pink-600 transition-colors hover:text-green-600">
              <User className="h-5 w-5 hover:text-green-600" />
            </Button>
          </Link>

          {/* Mobile Currency Converter */}
          {headerSettings.showCurrencyConverter && (
            <div className="md:hidden">
              <CurrencyConverter />
            </div>
          )}

          {/* Mobile Search Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Search" 
            className="md:hidden text-pink-600 transition-colors hover:text-green-600"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Wishlist Icon */}
          {headerSettings.showWishlist && (
            <Link to="/wishlist" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="text-pink-600 transition-colors hover:text-green-600 relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
          )}
          
          {/* Shopping Cart */}
          {headerSettings.showCart && (
            <Link to="/cart">
              <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative text-pink-600 transition-colors hover:text-green-600">
                <ShoppingCart className="h-5 w-5" />
                {actualCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {actualCartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4">
                  <Link to="/" className="text-xl font-bold transition-colors"
                   onClick={() => setMobileMenuOpen(false)}>
                    <span className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wider hover:from-blue-600 hover:via-pink-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                      SBF
                    </span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Enhanced Mobile Search */}
                <div className="px-4 py-2 mb-4">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search for flowers, bouquets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-bloom-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-bloom-blue-300 focus:border-bloom-blue-300 bg-gradient-to-r from-bloom-blue-50/50 to-bloom-pink-50/50"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-bloom-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-bloom-blue-600 transition-colors"
                      >
                        Search
                      </button>
                    )}
                  </form>
                </div>
                
                <nav className="flex flex-col space-y-4 mt-4">
                  {headerSettings.navigationItems
                    .filter(item => item.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "px-4 py-2 text-lg",
                        pathname === item.href ? "font-medium" : "text-muted-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Wishlist in mobile sidebar */}
                  {headerSettings.showWishlist && (
                    <Link
                      to="/wishlist"
                      className="px-4 py-2 text-lg text-muted-foreground flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      <span>Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Account in mobile sidebar */}
                  <Link
                    to="/profile"
                    className="px-4 py-2 text-lg text-muted-foreground flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Account</span>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-gradient-to-br from-bloom-pink-50 via-white to-bloom-blue-50 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-bloom-pink-200/50 bg-gradient-to-r from-bloom-blue-100/30 to-bloom-pink-100/30 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-bloom-blue-700">🔍 Search Products</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileSearchOpen(false)}
              className="text-bloom-pink-600 hover:text-bloom-blue-600 hover:bg-bloom-pink-100/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for flowers, bouquets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-bloom-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-bloom-blue-300 focus:border-bloom-blue-300 bg-gradient-to-r from-bloom-blue-50/50 to-bloom-pink-50/50"
                  autoFocus
                />
              </div>
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-bloom-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-bloom-blue-600 transition-colors"
                >
                  Search
                </button>
              )}
            </form>

            {/* Search suggestions for mobile */}
            {searchQuery.length >= 2 && searchSuggestions.length > 0 && (
              <div className="mt-4 bg-gradient-to-br from-white via-bloom-pink-50/30 to-bloom-blue-50/30 rounded-xl border border-bloom-pink-200/50 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="p-3 bg-gradient-to-r from-bloom-pink-50/50 to-bloom-blue-50/50">
                  <div className="text-xs font-bold text-bloom-blue-600 mb-3 flex items-center gap-1 bg-white/80 p-2 rounded-lg shadow-sm">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    ✨ SUGGESTIONS
                  </div>
                  {searchSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        handleSuggestionClick(suggestion);
                        setMobileSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-bloom-pink-100/70 hover:to-bloom-blue-100/70 rounded-xl transition-all duration-300 text-left mb-2 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-bloom-pink-200 to-bloom-blue-200 rounded-xl flex-shrink-0 overflow-hidden shadow-md">
                        {suggestion.image ? (
                          <img 
                            src={suggestion.image.startsWith('/') 
                              ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${suggestion.image}`
                              : suggestion.image
                            } 
                            alt={suggestion.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-bloom-pink-200 to-bloom-blue-200 flex items-center justify-center">
                            <Search className="h-4 w-4 text-bloom-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-bloom-blue-800 truncate">{suggestion.title}</div>
                        <div className="text-xs text-bloom-pink-600 bg-bloom-pink-100/60 px-2 py-1 rounded-full inline-block mt-1">{suggestion.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular searches for mobile */}
            {searchQuery.length < 2 && (
              <div className="mt-4">
                <div className="text-xs font-bold text-bloom-green-600 mb-3 flex items-center gap-1 bg-white/80 p-2 rounded-lg shadow-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  🔥 POPULAR SEARCHES
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        handlePopularSearchClick(term);
                        setMobileSearchOpen(false);
                      }}
                      className="text-left p-3 text-sm text-bloom-blue-700 bg-gradient-to-r from-white/80 to-bloom-blue-50/80 hover:from-bloom-blue-100 hover:to-bloom-pink-100 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] border border-bloom-blue-200/50"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;