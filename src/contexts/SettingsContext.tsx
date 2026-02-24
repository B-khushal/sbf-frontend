import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import { trackApiCall } from '../utils/performance';

console.log("SettingsContext loaded");

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
  content?: {
    image?: string;
    [key: string]: any;
  };
}

interface SettingsContextType {
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  categories: Category[];
  shopCategories: Category[];
  homeSections: HomeSection[];
  loading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
}

const defaultHeaderSettings: HeaderSettings = {
  logo: "/placeholder.svg",
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

const defaultCategories: Category[] = [];

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

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [shopCategories, setShopCategories] = useState<Category[]>(defaultCategories);
  const [homeSections, setHomeSections] = useState<HomeSection[]>(defaultHomeSections);
  const [loading, setLoading] = useState(false); // Start with defaults, not loading
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all settings at once
      const response = await api.get('/settings/all');
      const data = response.data;

      console.log('Settings data received:', data);

      // Handle header settings
      if (data.headerSettings) {
        setHeaderSettings(prev => ({ ...prev, ...data.headerSettings }));
      }

      // Handle footer settings
      if (data.footerSettings) {
        setFooterSettings(prev => ({ ...prev, ...data.footerSettings }));
      }

      // Handle categories
      if (data.categories && Array.isArray(data.categories)) {
        const enabledCategories = data.categories
          .filter((cat: Category) => cat.enabled)
          .sort((a: Category, b: Category) => a.order - b.order);
        setCategories(enabledCategories);
      }

      // Handle shop categories
      if (data.shopCategories && Array.isArray(data.shopCategories)) {
        const enabledShopCategories = data.shopCategories
          .filter((cat: Category) => cat.enabled)
          .sort((a: Category, b: Category) => a.order - b.order);
        setShopCategories(enabledShopCategories);
      }

      // Handle home sections
      if (data.homeSections && Array.isArray(data.homeSections)) {
        const enabledSections = data.homeSections
          .filter((section: HomeSection) => section.enabled)
          .sort((a: HomeSection, b: HomeSection) => a.order - b.order);
        setHomeSections(enabledSections);
      }

    } catch (error) {
      console.warn('Settings fetch failed, using defaults:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
      console.log('Settings loading complete');
    }
  }, []);

  const refetchSettings = useCallback(() => fetchSettings(), [fetchSettings]);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo((): SettingsContextType => ({
    headerSettings,
    footerSettings,
    categories,
    shopCategories,
    homeSections,
    loading,
    error,
    refetchSettings,
  }), [headerSettings, footerSettings, categories, shopCategories, homeSections, loading, error, refetchSettings]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider; 
