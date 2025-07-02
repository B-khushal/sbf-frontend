import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import api from '../services/api';
import { trackApiCall } from '../utils/performance';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  order: number;
}

interface HeaderSettings {
  logo: string;
  navigationItems: NavigationItem[];
  searchPlaceholder: string;
  showWishlist: boolean;
  showCart: boolean;
  showCurrencyConverter: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  enabled: boolean;
  order: number;
}

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface FooterSettings {
  companyName: string;
  description: string;
  socialLinks: SocialLink[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  links: Array<{
    section: string;
    items: Array<{
      label: string;
      href: string;
      enabled: boolean;
    }>;
  }>;
  copyright: string;
  showMap: boolean;
  mapEmbedUrl: string;
}

interface HomeSection {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  order: number;
}

interface SettingsContextType {
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  categories: Category[];
  homeSections: HomeSection[];
  loading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
}

const defaultHeaderSettings: HeaderSettings = {
  logo: "/images/logosbf.png",
  navigationItems: [
    { id: "shop", label: "Shop", href: "/shop", enabled: true, order: 0 },
    { id: "about", label: "About", href: "/about", enabled: true, order: 1 },
    { id: "contact", label: "Contact", href: "/contact", enabled: true, order: 2 },
  ],
  searchPlaceholder: "Search for flowers...",
  showWishlist: true,
  showCart: true,
  showCurrencyConverter: true,
};

const defaultFooterSettings: FooterSettings = {
  companyName: "Spring Blossoms Florist",
  description: "Curated floral arrangements and botanical gifts for every occasion, crafted with care and delivered with love.",
  socialLinks: [
    { platform: "Instagram", url: "https://www.instagram.com/sbf_india", enabled: true },
    { platform: "Facebook", url: "#", enabled: true },
    { platform: "Twitter", url: "#", enabled: true },
  ],
  contactInfo: {
    email: "2006sbf@gmail.com",
    phone: "+91 9849589710",
    address: "Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32,Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028"
  },
  links: [
    {
      section: "Shop",
      items: [
        { label: "Bouquets", href: "/shop/bouquets", enabled: true },
        { label: "Seasonal", href: "/shop/seasonal", enabled: true },
        { label: "Sale", href: "/shop/sale", enabled: true },
      ]
    },
    {
      section: "Company",
      items: [
        { label: "About Us", href: "/about", enabled: true },
        { label: "Blog", href: "/blog", enabled: true },
        { label: "Contact", href: "/contact", enabled: true },
        { label: "Become a Vendor", href: "/vendor/register", enabled: true },
      ]
    }
  ],
  copyright: `© ${new Date().getFullYear()} Spring Blossoms Florist. All rights reserved.`,
  showMap: true,
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.3484898316306!2d78.43144207424317!3d17.395055702585967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb971c17e5196b%3A0x78305a92a4153749!2sSpring%20Blossoms%20Florist!5e0!3m2!1sen!2sin!4v1744469050804!5m2!1sen!2sin"
};

const defaultCategories: Category[] = [
  {
    id: 'bouquets',
    name: 'Bouquets',
    description: 'Handcrafted floral arrangements',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
    link: '/shop/bouquets',
    enabled: true,
    order: 0,
  },
  {
    id: 'plants',
    name: 'Plants',
    description: 'Indoor and outdoor greenery',
    image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
    link: '/shop/plants',
    enabled: true,
    order: 1,
  },
  {
    id: 'gifts',
    name: 'Gifts',
    description: 'Thoughtful presents for any occasion',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
    link: '/shop/gifts',
    enabled: true,
    order: 2,
  },
  {
    id: 'baskets',
    name: 'Baskets',
    description: 'Thoughtful presents for any occasion',
    image: '/images/d3.jpg',
    link: '/shop/baskets',
    enabled: true,
    order: 3,
  },
  {
    id: 'birthday',
    name: 'Birthday',
    description: 'Perfect floral gifts',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
    link: '/shop/birthday',
    enabled: true,
    order: 4,
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Romantic arrangements',
    image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
    link: '/shop/anniversary',
    enabled: true,
    order: 5,
  },
];

const defaultHomeSections: HomeSection[] = [
  { id: 'hero', type: 'hero', title: 'Hero Section', subtitle: '', enabled: true, order: 0 },
  { id: 'categories', type: 'categories', title: 'Categories', subtitle: '', enabled: true, order: 1 },
  { id: 'featured', type: 'featured', title: 'Featured Products', subtitle: '', enabled: true, order: 2 },
  { id: 'offers', type: 'offers', title: 'Special Offers', subtitle: '', enabled: true, order: 3 },
  { id: 'new', type: 'new', title: 'New Arrivals', subtitle: '', enabled: true, order: 4 },
  { id: 'philosophy', type: 'philosophy', title: 'Our Philosophy', subtitle: '', enabled: true, order: 5 },
];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [homeSections, setHomeSections] = useState<HomeSection[]>(defaultHomeSections);
  const [loading, setLoading] = useState(false); // Start with defaults, not loading
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Cache settings for 10 minutes
  const CACHE_DURATION = 10 * 60 * 1000;

  const fetchSettings = useCallback(async (forceRefetch = false) => {
    // Check if we need to fetch based on cache
    const now = Date.now();
    if (!forceRefetch && (now - lastFetch) < CACHE_DURATION) {
      return; // Use cached data
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    try {
      // Batch all settings requests
      const requests = [
        { method: 'get', url: '/settings/header' },
        { method: 'get', url: '/settings/footer' },
        { method: 'get', url: '/settings/categories' },
        { method: 'get', url: '/settings/home-sections' }
      ];

      const startTime = performance.now();
      const responses = await api.batch(requests);
      
      if (!isMounted) return;

      // Track API performance
      trackApiCall('/settings/batch', 'batch', startTime, 200);

      // Process responses
      const [headerResponse, footerResponse, categoriesResponse, homeSectionsResponse] = responses;

      // Header settings
      if (headerResponse.status === 'fulfilled') {
        const headerData = headerResponse.value.data;
        if (headerData && typeof headerData === 'object') {
          setHeaderSettings(prev => ({ ...prev, ...headerData }));
        }
      }

      // Footer settings
      if (footerResponse.status === 'fulfilled') {
        const footerData = footerResponse.value.data;
        if (footerData && typeof footerData === 'object') {
          setFooterSettings(prev => ({ ...prev, ...footerData }));
        }
      }

      // Categories
      if (categoriesResponse.status === 'fulfilled') {
        const categoriesData = categoriesResponse.value.data;
        if (Array.isArray(categoriesData)) {
          const processedCategories = categoriesData
            .filter(cat => cat.enabled)
            .sort((a, b) => a.order - b.order);
          
          // Only update if different from current
          if (JSON.stringify(processedCategories) !== JSON.stringify(categories)) {
            setCategories(processedCategories);
          }
        }
      }

      // Home sections
      if (homeSectionsResponse.status === 'fulfilled') {
        const sectionsData = homeSectionsResponse.value.data;
        if (Array.isArray(sectionsData)) {
          const processedSections = sectionsData
            .filter(section => section.enabled)
            .sort((a, b) => a.order - b.order);
          
          // Only update if different from current
          if (JSON.stringify(processedSections) !== JSON.stringify(homeSections)) {
            setHomeSections(processedSections);
          }
        }
      }

      setLastFetch(now);

    } catch (error) {
      if (!isMounted) return;
      
      // Silent error handling - keep defaults
      console.warn('Settings fetch failed, using defaults:', error);
      setError('Failed to load some settings');
      
      // Reset to defaults if no data exists
      if (categories.length === 0) setCategories(defaultCategories);
      if (homeSections.length === 0) setHomeSections(defaultHomeSections);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [lastFetch, categories, homeSections]);

  const refetchSettings = useCallback(() => fetchSettings(true), [fetchSettings]);

  // Initial fetch with delay to prevent blocking
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSettings();
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchSettings]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo((): SettingsContextType => ({
    headerSettings,
    footerSettings,
    categories,
    homeSections,
    loading,
    error,
    refetchSettings,
  }), [headerSettings, footerSettings, categories, homeSections, loading, error, refetchSettings]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider; 