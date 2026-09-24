import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, Search, ShoppingCart, User, X, Heart, Sparkles, 
  TrendingUp, DollarSign, Store, LogIn, ChevronDown, 
  MapPin, Phone, Mail, Globe, ArrowRight, Star, Zap,
  Shield, Truck, RefreshCw, Gift, Home, Info, MessageCircle, Package,
  ShoppingBag, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CurrencyConverter from './CurrencyConverter';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import useCart, { useCartSelectors } from '@/hooks/use-cart';
import useWishlist from '@/hooks/use-wishlist';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/hooks/use-auth';
import { useValentine } from '@/contexts/ValentineContext';
import { useSeasonalCampaign } from '@/contexts/SeasonalCampaignContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DeliveryLocationSelector } from './ui/DeliveryLocationSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { preprocessProductForSearch, createSearchIndex, rankSearchResults, SearchItem } from '@/utils/searchHelper';
import searchService from '@/services/searchService';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface NavigationProps {
  cartItemCount?: number;
}

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query || !text) return <span>{text}</span>;
  
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-primary/20 text-primary font-semibold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

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

// Helper function to get icon for navigation items
const getNavIcon = (href: string, label: string) => {
  const path = href.toLowerCase();
  if (path.includes('/shop') || path === '/') return <Package size={16} />;
  if (path.includes('/about')) return <Info size={16} />;
  if (path.includes('/contact')) return <MessageCircle size={16} />;
  if (path.includes('/home')) return <Home size={16} />;
  if (path.includes('/gift')) return <Gift size={16} />;
  if (path.includes('/category')) return <Package size={16} />;
  // Default icon for unknown routes
  return <Globe size={16} />;
};

const Navigation = ({ cartItemCount = 0 }: NavigationProps) => {
  const { isValentineEnabled } = useValentine();
  const { activeCampaigns } = useSeasonalCampaign();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems?.length || 0;
  const cartHook = useCart();
  const { itemCount: actualCartCount } = useCartSelectors();
  const { items } = cartHook;
  
  // Debug cart state log removed
  const { headerSettings, shopCategories, categories: settingsCategories, loading: settingsLoading } = useSettings();
  const activeShopCategories = useMemo(() => {
    const list = shopCategories || settingsCategories || [];
    return list.filter((c: any) => c.showInShop === true && c.status !== 'inactive' && c.enabled !== false && !c.parentId);
  }, [shopCategories, settingsCategories]);

  // Featured collections excluding special quick-link categories like budget-friendly
  const curatedShopCollections = useMemo(() => {
    return activeShopCategories.filter((c: any) => {
      const name = (c.name || '').toLowerCase().trim();
      const slug = (c.slug || '').toLowerCase().trim();
      return name !== 'budget friendly' && slug !== 'budget-friendly' && name !== 'budget-friendly' && name !== 'all' && slug !== 'all';
    });
  }, [activeShopCategories]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const hasMarketingAccess = Boolean(user && [
    'marketing_head', 'marketing_team', 'marketing', 'admin', 'platform_admin', 'store_owner', 'store_manager'
  ].includes(user.role));

  const hasAdminAccess = Boolean(user && [
    'admin', 'platform_admin', 'store_owner', 'store_manager', 'delivery_manager', 'support_staff', 'inventory_staff', 'finance_staff'
  ].includes(user.role));

  const isHomePage = pathname === '/';

  const handleBackClick = () => {
    if (window.history.length > 1 && (window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      if (pathname.includes('/product') || pathname.includes('/valentine-product')) {
        navigate('/shop');
      } else if (pathname.includes('/cart') || pathname.includes('/checkout')) {
        navigate('/shop');
      } else if (pathname.includes('/category') || pathname.includes('/shop')) {
        navigate('/');
      } else {
        navigate('/');
      }
    }
  };

  const [allProducts, setAllProducts] = useState<SearchItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const fuseRef = useRef<any>(null);

  // Add outside-click + Esc handlers only while menu is open.
  useEffect(() => {
    if (!showUserMenu) {
      return;
    }

    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);

  // Smart positioning for dropdown
  const handleDropdownToggle = () => {
    if (!showUserMenu) {
      // Check if dropdown would be cut off at bottom
      const button = userMenuRef.current?.querySelector('button');
      if (button) {
        const rect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 300; // Approximate dropdown height
        
        if (rect.bottom + dropdownHeight > viewportHeight) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    }
    setShowUserMenu(!showUserMenu);
  };

  const shouldShowDropdown =
    isSearchFocused &&
    (
      searchQuery.length > 0 ||
      recentSearches.length > 0 ||
      popularSearches.length > 0
    );

  // Floating UI Setup
  const { refs, floatingStyles, x, y, strategy } = useFloating({
    placement: 'bottom-start',
    open: shouldShowDropdown,
    middleware: [
      offset(8),
      flip({ fallbackPlacements: ['top'] }),
      shift({ padding: 12 })
    ],
    whileElementsMounted: autoUpdate,
  });

  // Debug logging removed to prevent console spam
  /*
  console.log("NAV_SEARCH_DEBUG:", JSON.stringify({
    isSearchFocused,
    searchQuery,
    shouldShowDropdown,
    recentSearchesCount: recentSearches.length,
    floatingStyles,
    x,
    y,
    strategy,
    hasReference: !!refs.reference.current,
    hasFloating: !!refs.floating.current
  }));
  */

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading recent searches', e);
    }
  }, []);

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [
      cleanTerm,
      ...recentSearches.filter(s => s.toLowerCase() !== cleanTerm.toLowerCase())
    ].slice(0, 10);
    setRecentSearches(updated);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving recent searches', e);
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving recent searches', e);
    }
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('recentSearches');
    } catch (e) {
      console.error('Error clearing recent searches', e);
    }
  };

  // Pre-load products on focus
  const handleSearchFocus = async () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
    
    if (hasLoadedProducts || isLoadingProducts) return;
    
    setIsLoadingProducts(true);
    try {
      const response = await api.get('/products');
      const products = response.data.products || response.data || [];
      const processed = products
        .filter((p: any) => !p.hidden && (p.approvalStatus === 'approved' || !p.approvalStatus))
        .map((p: any) => preprocessProductForSearch(p));
        
      setAllProducts(processed);
      fuseRef.current = createSearchIndex(processed);
      setHasLoadedProducts(true);
    } catch (error) {
      console.error('Error loading search index:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setActiveSuggestionIndex(-1);
      return;
    }

    const performLocalSearch = () => {
      if (!fuseRef.current) return;
      setIsSearching(true);
      try {
        const fuseResults = fuseRef.current.search(searchQuery);
        const ranked = rankSearchResults(fuseResults, searchQuery);
        setSearchResults(ranked);
      } catch (err) {
        console.error('Fuzzy search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performLocalSearch, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const term = searchQuery.trim();
      saveSearchTerm(term);
      searchService.trackSearch({
        query: term,
        resultsCount: searchResults.length
      });
      navigate(`/shop?search=${encodeURIComponent(term)}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setIsSearchFocused(false);
    }
  };

  const handleProductClick = (product: SearchItem) => {
    const prodTitle = product.title || product.name || 'Product';
    saveSearchTerm(prodTitle);
    searchService.trackSearch({
      query: searchQuery.trim() || prodTitle,
      clickedProductId: String(product._id || product.id),
      clickedProductTitle: prodTitle
    });
    navigate(`/product/${product._id || product.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSearchFocused(false);
  };

  const handleQueryClick = (term: string) => {
    saveSearchTerm(term);
    searchService.trackSearch({
      query: term,
      resultsCount: searchResults.length
    });
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSearchFocused(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  // Generate dynamic matching categories
  const matchingCategories = headerSettings?.navigationItems
    ?.filter(item => item.enabled && item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(item => item.label)
    .concat(
      allProducts
        .map(p => p.category)
        .filter((cat, index, self) => cat && self.indexOf(cat) === index)
        .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((cat, index, self) => cat && self.indexOf(cat) === index)
    .slice(0, 4) || [];

  // Generate dynamic search term suggestions
  const dynamicSuggestions = (() => {
    if (searchQuery.length < 2) return [];
    const list: string[] = [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    popularSearches.forEach(item => {
      if (item.term.toLowerCase().includes(lowerQuery) && item.term.toLowerCase() !== lowerQuery) {
        list.push(item.term);
      }
    });

    allProducts.forEach(product => {
      if (product.category.toLowerCase().includes(lowerQuery) && !list.includes(product.category)) {
        list.push(product.category);
      }
      (product.categories || []).forEach(cat => {
        if (cat.toLowerCase().includes(lowerQuery) && !list.includes(cat)) {
          list.push(cat);
        }
      });
    });

    allProducts.forEach(product => {
      if (product.title.toLowerCase().startsWith(lowerQuery) && product.title.length < 30) {
        if (!list.includes(product.title)) {
          list.push(product.title);
        }
      }
    });
    
    return list.slice(0, 5);
  })();

  // Handle keyboard navigation inside search dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!shouldShowDropdown) return;

    const selectableItems: { type: 'query' | 'product'; value: string; id?: string; rawItem?: any }[] = [];

    if (searchQuery.length < 2) {
      recentSearches.forEach(term => {
        selectableItems.push({ type: 'query', value: term });
      });
      popularSearches.forEach(item => {
        selectableItems.push({ type: 'query', value: item.term });
      });
    } else {
      matchingCategories.forEach(cat => {
        selectableItems.push({ type: 'query', value: cat });
      });
      dynamicSuggestions.forEach(term => {
        selectableItems.push({ type: 'query', value: term });
      });
      searchResults.slice(0, 5).forEach(product => {
        selectableItems.push({ type: 'product', value: product.title, id: product._id, rawItem: product });
      });
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < selectableItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : selectableItems.length - 1
      );
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < selectableItems.length) {
        e.preventDefault();
        const selected = selectableItems[activeSuggestionIndex];
        if (selected.type === 'query') {
          handleQueryClick(selected.value);
        } else if (selected.type === 'product' && selected.id) {
          handleProductClick(selected.rawItem);
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      const input = e.currentTarget.querySelector('input');
      if (input) input.blur();
    }
  };

  return (
    <>
      {/* Main Navigation */}
      <header className="bg-gradient-to-r from-sky-100/90 via-pink-100/90 to-emerald-100/90 dark:from-sky-950/60 dark:via-pink-950/60 dark:to-emerald-950/60 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-nav">
        {/* Mobile Internal Page Header (← SBF ... ☰) */}
        {!isHomePage && (
          <div className="md:hidden flex items-center justify-between h-14 px-3 sm:px-4 w-full">
            {/* Left: Back Button + SBF Logo/Text */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={handleBackClick}
                className="p-1.5 -ml-1 rounded-full text-slate-800 dark:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft size={22} className="text-slate-800 dark:text-slate-100" />
              </button>
              <Link to="/" className="flex items-center gap-1.5 flex-shrink-0 group">
                {headerSettings?.logo ? (
                  <img
                    src={headerSettings.logo}
                    alt="Spring Blossoms Florist"
                    className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                ) : (
                  <span className="text-xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wider">
                    SBF
                  </span>
                )}
              </Link>
            </div>

            {/* Right: Menu Button ONLY */}
            <div className="flex items-center flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(open => !open)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-panel"
                className="h-9 w-9 p-0 text-slate-800 dark:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 active:scale-95 transition-all"
              >
                <Menu size={22} />
              </Button>
            </div>
          </div>
        )}

        {/* Standard Navigation Bar Container (Desktop/Tablet Always, Mobile Home Only) */}
        <div className={cn("container mx-auto px-3 sm:px-4 lg:px-6", !isHomePage && "hidden md:block")}>
          {/* Main Navigation Row */}
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
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
                      alt="Best Florist in Hyderabad - Flower Delivery in Hyderabad | Spring Blossoms Florist"
                      className="h-12 w-auto xl:h-14 transition-all duration-300 ease-in-out group-hover:scale-105 drop-shadow-sm"
                    />
                  </div>
                  
                  {/* Tablet Logo */}
                  <div className="hidden md:block lg:hidden">
                    <img
                      src={headerSettings.logo || "/api/placeholder/160/50"}
                      alt="Best Florist in Hyderabad - Flower Delivery in Hyderabad | Spring Blossoms Florist"
                      className="h-10 w-auto transition-all duration-300 ease-in-out group-hover:scale-105 drop-shadow-sm"
                    />
                  </div>
                  
                  {/* Mobile Logo */}
                  <div className="md:hidden flex items-center">
                    {headerSettings?.logo ? (
                      <img
                        src={headerSettings.logo}
                        alt="Best Florist in Hyderabad - Flower Delivery in Hyderabad | Spring Blossoms Florist"
                        className="h-8 w-auto object-contain transition-all duration-300 ease-in-out group-hover:scale-105 drop-shadow-sm"
                      />
                    ) : (
                      <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wider transition-all duration-300 group-hover:from-blue-600 group-hover:via-pink-500 group-hover:to-purple-600">
                        SBF
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            </div>
            
            {/* Location Selector - Desktop/Tablet Only */}
            <div className="hidden md:flex items-center ml-4 flex-shrink-0">
              <DeliveryLocationSelector variant="navbar" />
            </div>
            
            {/* Desktop Navigation */}
            <motion.nav 
              className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-shrink-0 mx-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {headerSettings?.navigationItems
                ?.filter(item => item.enabled)
                ?.sort((a, b) => a.order - b.order)
                ?.map((item) => {
                    if (item.href === '/shop') {
                      return (
                        <div key={item.href} className="relative group">
                          <NavLink 
                            to="/shop" 
                            active={pathname === '/shop' || pathname.startsWith('/shop/')}
                            className="flex items-center gap-1.5 font-semibold text-[14px]"
                          >
                            <span>{item.label}</span>
                            <ChevronDown 
                              size={14} 
                              className="text-gray-400 group-hover:text-primary transition-transform duration-300 group-hover:rotate-180" 
                            />
                          </NavLink>

                          {/* Luxury Glassmorphic Dropdown Menu */}
                          <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-1.5 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50 w-[360px] sm:w-[390px]">
                            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(244,63,94,0.15),0_10px_30px_-5px_rgba(0,0,0,0.08)] p-3 border border-pink-100/70 overflow-hidden">
                              
                              {/* Top Tier Highlight Options */}
                              <div className="space-y-1.5">
                                {/* All Products */}
                                <Link
                                  to="/shop"
                                  className={cn(
                                    "group/item flex items-center justify-between p-2.5 rounded-xl transition-all duration-200",
                                    pathname === '/shop'
                                      ? "bg-rose-50 text-rose-700 shadow-xs ring-1 ring-rose-200/60"
                                      : "hover:bg-gradient-to-r hover:from-rose-50/70 hover:to-purple-50/40 text-gray-800"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover/item:scale-105",
                                      pathname === '/shop'
                                        ? "bg-rose-500 text-white shadow-sm"
                                        : "bg-rose-100/80 text-rose-600 group-hover/item:bg-rose-500 group-hover/item:text-white"
                                    )}>
                                      <ShoppingBag size={17} />
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold flex items-center gap-1.5 leading-tight text-gray-900 group-hover/item:text-rose-600 transition-colors">
                                        <span>All Products</span>
                                      </div>
                                      <div className="text-[11px] text-gray-400 font-normal">
                                        Explore full handcrafted bouquets & gifts
                                      </div>
                                    </div>
                                  </div>
                                  <ArrowRight size={14} className="text-gray-300 group-hover/item:text-rose-500 group-hover/item:translate-x-0.5 transition-all duration-200" />
                                </Link>

                                {/* Budget Friendly */}
                                <Link
                                  to="/shop/budget-friendly"
                                  className={cn(
                                    "group/item flex items-center justify-between p-2.5 rounded-xl transition-all duration-200",
                                    pathname === '/shop/budget-friendly'
                                      ? "bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-200/70"
                                      : "hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-orange-50/40 text-gray-800"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover/item:scale-105",
                                      pathname === '/shop/budget-friendly'
                                        ? "bg-amber-500 text-white shadow-sm"
                                        : "bg-amber-100 text-amber-700 group-hover/item:bg-amber-500 group-hover/item:text-white"
                                    )}>
                                      <Sparkles size={17} />
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold flex items-center gap-1.5 leading-tight text-gray-900 group-hover/item:text-amber-800 transition-colors">
                                        <span>Budget Friendly</span>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                          ≤ ₹1k
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-gray-400 font-normal">
                                        Pocket-friendly fresh flower arrangements
                                      </div>
                                    </div>
                                  </div>
                                  <ArrowRight size={14} className="text-gray-300 group-hover/item:text-amber-600 group-hover/item:translate-x-0.5 transition-all duration-200" />
                                </Link>
                              </div>

                              {/* Curated Categories / Collections */}
                              {curatedShopCollections.length > 0 && (
                                <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                                  <div className="px-2.5 pb-1.5 flex items-center justify-between">
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                                      Featured Collections
                                    </span>
                                    <span className="text-[10px] font-medium text-rose-500">
                                      {curatedShopCollections.length} Categories
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 max-h-52 overflow-y-auto pr-0.5 scrollbar-thin">
                                    {curatedShopCollections.map((cat: any) => {
                                      const catSlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
                                      const catUrl = `/shop/${catSlug}`;
                                      const isCurrentCat = pathname === catUrl;
                                      return (
                                        <Link
                                          key={cat.id || cat._id || catSlug}
                                          to={catUrl}
                                          className={cn(
                                            "group/cat flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-all duration-150",
                                            isCurrentCat
                                              ? "bg-primary/10 text-primary font-semibold"
                                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                          )}
                                        >
                                          <div className="flex items-center gap-1.5 truncate">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 group-hover/cat:scale-125 transition-transform" />
                                            <span className="truncate">{cat.name}</span>
                                          </div>
                                          {cat.productCount !== undefined && cat.productCount > 0 && (
                                            <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-gray-100 text-gray-500 ml-1 shrink-0">
                                              {cat.productCount}
                                            </span>
                                          )}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Bottom Assurance Banner */}
                              <div className="mt-2.5 pt-2 border-t border-gray-100/80">
                                <div className="bg-gradient-to-r from-rose-50/70 via-purple-50/50 to-pink-50/70 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] text-gray-600 border border-rose-100/50">
                                  <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                                    <Truck size={13} className="text-rose-500" />
                                    <span>Same-Day Delivery</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-emerald-700 font-medium">
                                    <Shield size={13} className="text-emerald-500" />
                                    <span>100% Freshness</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    }
                  return (
                    <NavLink key={item.href} to={item.href} active={pathname === item.href}>
                      {item.label}
                    </NavLink>
                  );
                })}
              {isValentineEnabled && (
                <NavLink to="/valentine-special" active={pathname === '/valentine-special'} className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1">
                  Valentine's <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse inline" />
                </NavLink>
              )}
              {activeCampaigns && activeCampaigns
                .filter(c => (c.enabled || (c as any).isActive) && (c.navigation?.showInNavigationMenu !== false) && ((c.navigation as any)?.showInNavbar !== false) && c.slug !== 'valentine' && c.slug !== 'valentines-week')
                .map((campaign) => (
                  <NavLink 
                    key={campaign.slug} 
                    to={`/occasions/${campaign.slug}`} 
                    active={pathname === `/occasions/${campaign.slug}`}
                    className="text-purple-700 hover:text-purple-900 font-semibold"
                  >
                    {campaign.name}
                  </NavLink>
                ))
              }
            </motion.nav>
            
            {/* Search Bar - Responsive */}
            <motion.div 
              className="flex items-center gap-1.5 relative flex-1 max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl mx-2 sm:mx-4 md:mx-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            >
              <form 
                onSubmit={handleSearchSubmit} 
                className="flex-1 w-full relative"
                onKeyDown={handleKeyDown}
              >
                <div className="relative group isolate">
                  <Search 
                    size={18} 
                    className={cn(
                      "absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 z-10",
                      isSearchFocused ? "text-primary" : "text-gray-400"
                    )} 
                  />
                  <Input
                    ref={refs.setReference}
                    type="text"
                    role="combobox"
                    aria-expanded={shouldShowDropdown}
                    aria-autocomplete="list"
                    aria-controls="search-results-listbox"
                    aria-haspopup="listbox"
                    placeholder={isMobile ? "Search..." : "Search for flowers, bouquets, gifts..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsSearchFocused(false);
                      }, 150);
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
                  
                  {/* Enhanced Search Suggestions Dropdown using Portal */}
                  {createPortal(
                    <AnimatePresence>
                      {shouldShowDropdown && (
                        <motion.div
                        ref={refs.setFloating}
                        style={{
                          position: strategy,
                          left: x ?? 0,
                          top: y ?? 0,
                          zIndex: 10000,
                        }}
                        data-search-dropdown
                        id="search-results-listbox"
                        role="listbox"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ 
                          duration: 0.15, 
                          ease: "easeOut"
                        }}
                        className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden dropdown-responsive flex flex-col max-h-[70vh] w-[min(90vw,380px)] sm:w-[460px] md:w-[600px] select-none"
                      >
                        <div className="flex flex-col h-full max-h-[70vh]">
                          <div className="overflow-y-auto p-4 space-y-4 max-h-[70vh] scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
                            {isLoadingProducts && searchQuery.length >= 2 && (
                              <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500">
                                <RefreshCw size={16} className="animate-spin text-primary" />
                                <span>Initializing search index...</span>
                              </div>
                            )}

                            {searchQuery.length < 2 && (
                              <>
                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between px-2">
                                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</span>
                                      <button 
                                        type="button"
                                        onClick={clearAllRecentSearches}
                                        className="text-xs text-primary hover:underline font-semibold"
                                      >
                                        Clear All
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 px-2">
                                      {recentSearches.map((term, index) => (
                                        <div 
                                          key={term}
                                          role="option"
                                          aria-selected={index === activeSuggestionIndex}
                                          onClick={() => handleQueryClick(term)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-xl cursor-pointer text-sm transition-colors group",
                                            index === activeSuggestionIndex && "bg-primary/10 text-primary ring-1 ring-primary/20"
                                          )}
                                          onMouseEnter={() => setActiveSuggestionIndex(-1)}
                                        >
                                          <span>{term}</span>
                                          <X 
                                            size={12} 
                                            onClick={(e) => removeRecentSearch(e, term)}
                                            className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" 
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Popular Searches */}
                                <div className="space-y-2">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 block">Popular Searches</span>
                                  <div className="grid grid-cols-2 gap-2 px-1">
                                    {popularSearches.map((item, index) => {
                                      const globalIndex = recentSearches.length + index;
                                      return (
                                        <button
                                          key={item.term}
                                          type="button"
                                          role="option"
                                          aria-selected={globalIndex === activeSuggestionIndex}
                                          onClick={() => handleQueryClick(item.term)}
                                          className={cn(
                                            "text-left px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-xl transition-all duration-150 flex items-center gap-2 group",
                                            globalIndex === activeSuggestionIndex && "bg-gradient-to-r from-primary/5 to-secondary/5 text-primary"
                                          )}
                                          onMouseEnter={() => setActiveSuggestionIndex(-1)}
                                        >
                                          <span className="text-lg">{item.icon}</span>
                                          <div className="flex-1 min-w-0">
                                            <span className="group-hover:text-primary transition-colors duration-150 truncate block font-medium">{item.term}</span>
                                            <span className="text-xs text-gray-400 block">{item.count} searches</span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 block">Quick Actions</span>
                                  <div className="grid grid-cols-2 gap-2 px-1">
                                    {quickActions.map((action) => (
                                      <Link
                                        key={action.href}
                                        to={action.href}
                                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-xl transition-all duration-200 group"
                                        onClick={() => {
                                          setShowSuggestions(false);
                                          setIsSearchFocused(false);
                                        }}
                                      >
                                        <div className="text-gray-400 group-hover:text-primary transition-colors">
                                          {action.icon}
                                        </div>
                                        <span className="group-hover:text-primary transition-colors truncate font-medium">{action.label}</span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {!isLoadingProducts && searchQuery.length >= 2 && (
                              <>
                                {/* Categories and Suggestions suggestions */}
                                {(matchingCategories.length > 0 || dynamicSuggestions.length > 0) && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Matching Categories */}
                                    {matchingCategories.length > 0 && (
                                      <div className="space-y-1.5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 block">Categories</span>
                                        <div className="space-y-0.5">
                                          {matchingCategories.map((cat, index) => {
                                            const globalIndex = index;
                                            return (
                                              <button
                                                key={cat}
                                                type="button"
                                                role="option"
                                                aria-selected={globalIndex === activeSuggestionIndex}
                                                onClick={() => handleQueryClick(cat)}
                                                className={cn(
                                                  "w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors flex items-center gap-2 font-medium",
                                                  globalIndex === activeSuggestionIndex && "bg-primary/5 text-primary"
                                                )}
                                                onMouseEnter={() => setActiveSuggestionIndex(-1)}
                                              >
                                                <Package size={14} className="text-gray-400 group-hover:text-primary" />
                                                <span className="truncate">
                                                  <HighlightMatch text={cat} query={searchQuery} />
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Dynamic Suggestions */}
                                    {dynamicSuggestions.length > 0 && (
                                      <div className="space-y-1.5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 block">Suggestions</span>
                                        <div className="space-y-0.5">
                                          {dynamicSuggestions.map((term, index) => {
                                            const globalIndex = matchingCategories.length + index;
                                            return (
                                              <button
                                                key={term}
                                                type="button"
                                                role="option"
                                                aria-selected={globalIndex === activeSuggestionIndex}
                                                onClick={() => handleQueryClick(term)}
                                                className={cn(
                                                  "w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors flex items-center gap-2 font-medium",
                                                  globalIndex === activeSuggestionIndex && "bg-primary/5 text-primary"
                                                )}
                                                onMouseEnter={() => setActiveSuggestionIndex(-1)}
                                              >
                                                <Search size={14} className="text-gray-400 group-hover:text-primary" />
                                                <span className="truncate">
                                                  <HighlightMatch text={term} query={searchQuery} />
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Product Results */}
                                {searchResults.length > 0 && (
                                  <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 block">Products</span>
                                    <div className="space-y-1">
                                      {searchResults.slice(0, 5).map((product, index) => {
                                        const globalIndex = matchingCategories.length + dynamicSuggestions.length + index;
                                        return (
                                          <button
                                            key={product._id}
                                            type="button"
                                            role="option"
                                            aria-selected={globalIndex === activeSuggestionIndex}
                                            onClick={() => handleProductClick(product)}
                                            className={cn(
                                              "w-full text-left p-2 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-2xl transition-all flex items-start gap-3 group border border-transparent hover:border-gray-100",
                                              globalIndex === activeSuggestionIndex && "bg-gradient-to-r from-primary/5 to-secondary/5 border-gray-100 text-primary"
                                            )}
                                            onMouseEnter={() => setActiveSuggestionIndex(-1)}
                                          >
                                            <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                              {product.images?.[0] ? (
                                                <img 
                                                  src={product.images[0]} 
                                                  alt={product.title}
                                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                  loading="lazy"
                                                />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                  <Package size={20} />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-primary truncate">
                                                  <HighlightMatch text={product.title} query={searchQuery} />
                                                </p>
                                                <p className="text-sm font-black text-primary whitespace-nowrap">
                                                  ₹{product.price}
                                                </p>
                                              </div>
                                              <p className="text-xs font-semibold text-gray-400 capitalize mb-1">
                                                <HighlightMatch text={product.category} query={searchQuery} />
                                              </p>
                                              <p className="text-xs text-gray-500 line-clamp-1">
                                                <HighlightMatch text={product.shortDescription} query={searchQuery} />
                                              </p>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Empty State */}
                                {searchResults.length === 0 && matchingCategories.length === 0 && dynamicSuggestions.length === 0 && !isSearching && (
                                  <div className="py-8 text-center space-y-4">
                                    <div className="text-4xl text-gray-300">🔍</div>
                                    <div className="space-y-1">
                                      <h3 className="text-base font-bold text-gray-700">No products found</h3>
                                      <p className="text-xs text-gray-400 max-w-xs mx-auto">
                                        No results match "{searchQuery}". Please check your spelling or search another keyword.
                                      </p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 max-w-sm mx-auto">
                                      <span className="text-xs font-semibold text-gray-400 block mb-2 text-left px-2">Popular Categories</span>
                                      <div className="flex flex-wrap gap-2 justify-center">
                                        {popularSearches.slice(0, 5).map(item => (
                                          <button
                                            key={item.term}
                                            type="button"
                                            onClick={() => handleQueryClick(item.term)}
                                            className="text-xs px-2.5 py-1.5 bg-gray-50 hover:bg-primary/5 hover:text-primary font-semibold rounded-lg transition-colors border border-gray-100"
                                          >
                                            {item.icon} {item.term}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
                </div>
              </form>

              {/* Mobile Currency Converter */}
              <div className="md:hidden flex-shrink-0 z-20">
                <CurrencyConverter />
              </div>
            </motion.div>
            
            {/* Right Side Actions */}
            <motion.div 
              className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="hidden md:block dropdown-container">
                <CurrencyConverter />
              </div>
              
              <div className="hidden md:block">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/wishlist" className="relative" title="Wishlist">
                    <Heart size={18} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-sm animate-pulse">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>
              
              <div className="hidden md:block">
                <Button variant="ghost" size="icon" onClick={handleCartClick} className="relative">
                  <ShoppingCart size={18} />
                  {(actualCartCount > 0) && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {actualCartCount}
                    </span>
                  )}
                </Button>
              </div>

              <div className="hidden md:block">
                {user ? (
                  <div ref={userMenuRef} className="relative dropdown-container">
                    <Button variant="ghost" size="icon" onClick={handleDropdownToggle}>
                      <User size={18} />
                    </Button>
                    <AnimatePresence>
                      {showUserMenu && (
                        <>
                          {/* Backdrop for mobile */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/40 z-[1000] sm:hidden backdrop-blur-sm"
                            onClick={() => setShowUserMenu(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={`absolute right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-dropdown will-change-transform ${
                              dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}
                            style={{ 
                              transform: 'translateZ(0)',
                              contain: 'layout style paint'
                            }}
                            onMouseLeave={() => setShowUserMenu(false)}
                            onTouchStart={(e) => e.stopPropagation()}
                          >
                            {/* Mobile close button */}
                            <div className="flex justify-between items-center p-2 border-b sm:hidden">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-2 flex-shrink-0"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <X size={14} />
                              </Button>
                            </div>
                            
                            {/* Desktop header */}
                            <div className="p-2 border-b hidden sm:block">
                              <p className="font-semibold text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            
                            <div className="py-1 max-h-64 overflow-y-auto">
                              <Link 
                                to="/profile" 
                                className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                                  <User className="w-4 h-4" />
                                </div>
                                <span className="truncate">My Account</span>
                              </Link>
                              <Link 
                                to="/profile#orders" 
                                className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                                  <ShoppingCart className="w-4 h-4" />
                                </div>
                                <span className="truncate">My Orders</span>
                              </Link>
                              {hasMarketingAccess && (
                                <Link 
                                  to="/marketing" 
                                  className="flex items-center w-full px-3 py-3 text-sm text-purple-700 hover:bg-purple-50 rounded-md transition-all duration-200 font-medium group"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0 text-purple-600 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-4 h-4" />
                                  </div>
                                  <span className="truncate">Marketing Panel</span>
                                </Link>
                              )}
                              {hasAdminAccess && (
                                <Link 
                                  to="/admin" 
                                  className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                                    <Store className="w-4 h-4" />
                                  </div>
                                  <span className="truncate">Admin Dashboard</span>
                                </Link>
                              )}
                              {user.role === 'vendor' && (
                                <Link 
                                  to="/vendor/dashboard" 
                                  className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                                    <Store className="w-4 h-4" />
                                  </div>
                                  <span className="truncate">Vendor Dashboard</span>
                                </Link>
                              )}
                              <button
                                onClick={() => {
                                  logout();
                                  setShowUserMenu(false);
                                }}
                                className="flex items-center w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                              >
                                <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                                  <LogIn className="w-4 h-4" />
                                </div>
                                <span className="truncate">Sign Out</span>
                              </button>
                            </div>
                          </motion.div>
                        </>
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
              </div>

              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-nav-panel"
                >
                  <Menu size={18} />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Panel (in-flow, scrolls with page) */}
      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden overflow-hidden border-b bg-white"
          >
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3">
              <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-4 border-b flex justify-between items-center">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <span className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      SBF
                    </span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X size={20} />
                  </Button>
                </div>

                <div className="max-h-[70dvh] overflow-y-auto p-4 space-y-6">
                  {user ? (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild><Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link></Button>
                      <Button asChild variant="outline"><Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link></Button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase">Delivery Location</p>
                    <div className="px-1">
                      <DeliveryLocationSelector variant="mobile" />
                    </div>
                  </div>

                  <nav className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase">Menu</p>
                    {isValentineEnabled && (
                      <Link
                        to="/valentine-special"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-all duration-200 bg-rose-50 text-rose-600',
                          pathname === '/valentine-special' && 'bg-rose-100'
                        )}
                      >
                        <div className="flex items-center justify-center w-5 h-5">
                          <Heart size={16} className="text-rose-500 fill-rose-500 animate-pulse" />
                        </div>
                        <span>Valentine's ❤️</span>
                      </Link>
                    )}
                    {activeCampaigns && activeCampaigns
                      .filter(c => (c.enabled || (c as any).isActive) && (c.navigation?.showInNavigationMenu !== false) && ((c.navigation as any)?.showInNavbar !== false) && c.slug !== 'valentine' && c.slug !== 'valentines-week')
                      .map((campaign) => (
                        <Link
                          key={campaign.slug}
                          to={`/occasions/${campaign.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-all duration-200 bg-purple-50 text-purple-700',
                            pathname === `/occasions/${campaign.slug}` && 'bg-purple-100'
                          )}
                        >
                          <div className="flex items-center justify-center w-5 h-5">
                            <Gift size={16} className="text-purple-500" />
                          </div>
                          <span>{campaign.name} 🎉</span>
                        </Link>
                      ))
                    }
                    {headerSettings?.navigationItems
                      ?.filter(item => item.enabled)
                      ?.sort((a,b) => a.order - b.order)
                      ?.map((item) => (
                        <React.Fragment key={item.href}>
                          <Link
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                              pathname === item.href ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
                            )}
                          >
                            <div className="flex items-center justify-center w-5 h-5">
                              {getNavIcon(item.href, item.label)}
                            </div>
                            <span>{item.label}</span>
                          </Link>
                          {item.href === '/shop' && (
                            <div className="pl-6 space-y-0.5 border-l-2 border-gray-100 ml-5 my-1">
                              <Link
                                to="/shop/budget-friendly"
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                                  pathname === '/shop/budget-friendly' ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles size={14} className="text-amber-500" />
                                  <span>Budget Friendly</span>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                  Under ₹1k
                                </span>
                              </Link>
                              {curatedShopCollections.map((cat: any) => {
                                const catSlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
                                const catUrl = `/shop/${catSlug}`;
                                const isCurrentCat = pathname === catUrl;
                                return (
                                  <Link
                                    key={cat.id || cat._id || catSlug}
                                    to={catUrl}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                      'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                                      isCurrentCat ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'
                                    )}
                                  >
                                    <span>{cat.name}</span>
                                    {cat.productCount !== undefined && cat.productCount > 0 && (
                                      <span className="text-xs text-gray-400">{cat.productCount}</span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </React.Fragment>
                    ))}
                  </nav>

                  {user && (
                    <nav className="space-y-1">
                      <p className="px-3 text-xs font-semibold text-gray-400 uppercase">Account</p>
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200', pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100')}>
                        <div className="flex items-center justify-center w-5 h-5">
                          <User size={16} />
                        </div>
                        <span>My Account</span>
                      </Link>
                      <Link to="/profile#orders" onClick={() => setMobileMenuOpen(false)} className='flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100'>
                        <div className="flex items-center justify-center w-5 h-5">
                          <ShoppingCart size={16} />
                        </div>
                        <span>My Orders</span>
                      </Link>
                      {hasMarketingAccess && (
                        <Link to="/marketing" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200', pathname.startsWith('/marketing') ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-purple-700 hover:bg-purple-50')}>
                          <div className="flex items-center justify-center w-5 h-5 text-purple-600">
                            <TrendingUp size={16} />
                          </div>
                          <span>Marketing Panel</span>
                        </Link>
                      )}
                      {hasAdminAccess && (
                        <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200', pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100')}>
                          <div className="flex items-center justify-center w-5 h-5">
                            <Store size={16} />
                          </div>
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'vendor' && (
                        <Link to="/vendor/dashboard" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200', pathname.startsWith('/vendor') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100')}>
                          <div className="flex items-center justify-center w-5 h-5">
                            <Store size={16} />
                          </div>
                          <span>Vendor Dashboard</span>
                        </Link>
                      )}
                    </nav>
                  )}
                </div>

                {user && (
                  <div className="p-4 border-t">
                    <Button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <LogIn size={16} className="mr-2" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
