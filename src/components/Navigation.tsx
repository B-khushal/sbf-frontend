import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User, X, Heart, Sparkles, TrendingUp, DollarSign, Store, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import CurrencyConverter from './CurrencyConverter';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import useCart from '@/hooks/use-cart';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/hooks/use-auth';

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
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b shadow-sm">
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
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {headerSettings.navigationItems
            .filter(item => item.enabled)
            .sort((a, b) => a.order - b.order)
            .map((item) => (
            <NavLink key={item.href} to={item.href} active={pathname === item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search flowers, bouquets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-pink-600 transition-colors"
              >
                Search
              </button>
            )}
          </form>

          {/* Desktop Search Suggestions Dropdown */}
          {showSuggestions && isSearchFocused && searchQuery.length >= 2 && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-3">
                <div className="text-xs font-bold text-pink-600 mb-3 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  Suggestions
                </div>
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-pink-50 rounded-lg transition-all duration-200 text-left mb-1"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {suggestion.image ? (
                        <img 
                          src={suggestion.image} 
                          alt={suggestion.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-pink-100 flex items-center justify-center">
                          <Search className="h-4 w-4 text-pink-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate text-sm">{suggestion.title}</div>
                      <div className="text-xs text-pink-600">{suggestion.category}</div>
                      <div className="text-xs text-gray-500">₹{suggestion.price}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Popular Searches Dropdown */}
          {showSuggestions && isSearchFocused && searchQuery.length < 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
              <div className="p-3">
                <div className="text-xs font-bold text-green-600 mb-3 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  Popular Searches
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularSearchClick(term)}
                      className="text-left p-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Currency Converter - Desktop */}
          {headerSettings.showCurrencyConverter && (
            <CurrencyConverter className="hidden md:block" />
          )}

          {/* Mobile Navigation Icons */}
          <div className="md:hidden flex items-center space-x-1">
            {/* Shop Icon - Mobile */}
            <Link to="/shop">
              <Button variant="ghost" size="icon" aria-label="Shop" className="text-pink-600 transition-colors hover:text-green-600">
                <Store className="h-5 w-5" />
              </Button>
            </Link>

            {/* Currency Converter - Mobile with Dollar Sign Icon */}
            {headerSettings.showCurrencyConverter && (
              <div className="relative">
                <CurrencyConverter />
              </div>
            )}
          </div>

          {/* Wishlist Icon - Desktop & Mobile */}
          {headerSettings.showWishlist && (
            <Link to="/wishlist">
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

          {/* User Authentication */}
          {!user ? (
            <Link to="/login">
              <Button 
                variant="outline" 
                size="sm"
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          ) : (
            <Link to="/profile">
              <Button variant="ghost" size="icon" aria-label="User Profile" className="text-pink-600 transition-colors hover:text-green-600">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Mobile Sign In Button */}
          {!user && (
            <Link to="/login">
              <Button 
                variant="outline" 
                size="sm"
                className="md:hidden flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 px-2 py-1 text-xs"
              >
                <LogIn className="h-3 w-3" />
                Sign In
              </Button>
            </Link>
          )}
          
          {/* Desktop Sidebar Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Search & More" className="hidden md:block text-pink-600 transition-colors hover:text-green-600">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4 border-b">
                  <h2 className="text-xl font-bold text-pink-600">Search & Explore</h2>
                </div>
                
                {/* Enhanced Desktop Sidebar Search */}
                <div className="px-2 py-4 mb-4">
                  <div className="text-sm font-semibold text-pink-600 mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Products
                  </div>
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search for flowers, bouquets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleSearchFocus}
                        className="w-full pl-10 pr-4 py-3 border-2 border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-gradient-to-r from-pink-50/50 to-purple-50/50"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
                      >
                        Search
                      </button>
                    )}
                  </form>

                  {/* Search Suggestions in Desktop Sidebar */}
                  {searchQuery.length >= 2 && searchSuggestions.length > 0 && (
                    <div className="mt-4 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 rounded-xl border border-pink-200/50 shadow-lg overflow-hidden backdrop-blur-sm">
                      <div className="p-3">
                        <div className="text-xs font-bold text-pink-600 mb-3 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                          ✨ SUGGESTIONS
                        </div>
                        {searchSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-gradient-to-r hover:from-pink-100/70 hover:to-purple-100/70 rounded-lg transition-all duration-300 text-left mb-2 bg-white/70"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex-shrink-0 overflow-hidden">
                              {suggestion.image ? (
                                <img 
                                  src={suggestion.image} 
                                  alt={suggestion.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                                  <Search className="h-3 w-3 text-pink-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-pink-800 truncate text-sm">{suggestion.title}</div>
                              <div className="text-xs text-purple-600">{suggestion.category}</div>
                              <div className="text-xs text-gray-500">₹{suggestion.price}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches in Desktop Sidebar */}
                  {searchQuery.length < 2 && (
                    <div className="mt-4">
                      <div className="text-xs font-bold text-green-600 mb-3 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        🔥 POPULAR SEARCHES
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {popularSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => handlePopularSearchClick(term)}
                            className="text-left p-2 text-sm text-pink-700 bg-gradient-to-r from-white/80 to-pink-50/80 hover:from-pink-100 hover:to-purple-100 rounded-lg transition-all duration-300 font-medium shadow-sm"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick Navigation Links */}
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Quick Navigation</h3>
                  <nav className="flex flex-col space-y-2">
                    {headerSettings.navigationItems
                      .filter(item => item.enabled)
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg transition-colors",
                          pathname === item.href 
                            ? "font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700" 
                            : "text-muted-foreground hover:bg-pink-50 hover:text-pink-600"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Mobile Menu - Only for navigation, no search */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4 border-b">
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
                
                <nav className="flex flex-col space-y-4 mt-6 flex-1">
                  {headerSettings.navigationItems
                    .filter(item => item.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "px-4 py-3 text-lg rounded-lg transition-colors",
                        pathname === item.href 
                          ? "font-medium bg-gradient-to-r from-bloom-pink-100 to-bloom-blue-100 text-bloom-blue-700" 
                          : "text-muted-foreground hover:bg-bloom-pink-50 hover:text-bloom-blue-600"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Mobile Authentication */}
                  {!user ? (
                    <Link
                      to="/login"
                      className="mx-4 mt-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      to="/profile"
                      className="px-4 py-3 text-lg rounded-lg transition-colors text-muted-foreground hover:bg-bloom-pink-50 hover:text-bloom-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-2 inline" />
                      Profile
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>


    </header>
  );
};

export default Navigation;