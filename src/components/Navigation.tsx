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
  const { itemCount: actualCartCount, toggleCart } = useCart();
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between h-14 sm:h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          {/* Desktop Logo */}
          <img
            src={headerSettings.logo}
            alt="Spring Blossoms Florist Logo"
            className="hidden lg:block h-20 w-60 xl:h-24 xl:w-70 transition-transform duration-300 ease-in-out hover:scale-105"
          />
          {/* Tablet Logo */}
          <img
            src={headerSettings.logo}
            alt="Spring Blossoms Florist Logo"
            className="hidden md:block lg:hidden h-16 w-48 transition-transform duration-300 ease-in-out hover:scale-105"
          />
          {/* Mobile Logo */}
          <div className="md:hidden">
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wider hover:from-blue-600 hover:via-pink-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
              SBF
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          {headerSettings.navigationItems
            .filter(item => item.enabled)
            .sort((a, b) => a.order - b.order)
            .map((item) => (
            <NavLink key={item.href} to={item.href} active={pathname === item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>
        
        {/* Search Bar - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:flex relative flex-1 max-w-sm lg:max-w-md xl:max-w-lg mx-4 lg:mx-6">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search flowers, bouquets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={() => {
                  setTimeout(() => {
                    setIsSearchFocused(false);
                    setShowSuggestions(false);
                  }, 200);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50/50 backdrop-blur-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            {/* Search Suggestions Dropdown */}
            {(showSuggestions && isSearchFocused) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchQuery.length >= 2 && searchSuggestions.length > 0 && (
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Products</h4>
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{suggestion.title}</p>
                          <p className="text-xs text-gray-500">{suggestion.category}</p>
                        </div>
                        <p className="text-sm font-medium text-primary">₹{suggestion.price}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchQuery.length < 2 && (
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Popular Searches</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handlePopularSearchClick(term)}
                          className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {/* Currency Converter - Hidden on mobile */}
          <div className="hidden sm:block">
            <CurrencyConverter />
          </div>
          
          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden w-8 h-8 sm:w-10 sm:h-10"
            onClick={() => navigate('/shop')}
          >
            <Search size={18} />
          </Button>
          
          {/* Wishlist */}
          {user && (
            <Button variant="ghost" size="icon" asChild className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Link to="/wishlist">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
          
          {/* Cart */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCart}
            className="relative w-8 h-8 sm:w-10 sm:h-10"
          >
            <ShoppingCart size={18} />
            {actualCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                {actualCartCount > 9 ? '9+' : actualCartCount}
              </span>
            )}
          </Button>
          
          {/* User Menu */}
          {user ? (
            <Button variant="ghost" size="icon" asChild className="w-8 h-8 sm:w-10 sm:h-10">
              <Link to="/profile">
                <User size={18} />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild className="w-8 h-8 sm:w-10 sm:h-10">
              <Link to="/login">
                <LogIn size={18} />
              </Link>
            </Button>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden w-8 h-8 sm:w-10 sm:h-10">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <span className="text-xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Spring Blossoms Florist
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8"
                  >
                    <X size={18} />
                  </Button>
                </div>
                
                {/* Mobile Search */}
                <div className="p-4 border-b">
                  <form onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setMobileMenuOpen(false);
                  }}>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search flowers, bouquets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg"
                      />
                    </div>
                  </form>
                </div>
                
                {/* Currency Converter */}
                <div className="p-4 border-b">
                  <CurrencyConverter />
                </div>
                
                {/* Navigation Links */}
                <div className="flex-1 p-4">
                  <nav className="space-y-2">
                    {headerSettings.navigationItems
                      .filter(item => item.enabled)
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                          pathname === item.href 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                
                {/* Mobile Footer Actions */}
                <div className="p-4 border-t space-y-2">
                  {!user ? (
                    <>
                      <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/profile">My Account</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navigation;