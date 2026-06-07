import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

console.log("SettingsContext loaded");

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  order: number;
  submenu?: any[];
}

interface HeaderSettings {
  logo: string;
  stickyLogo?: string;
  mobileLogo?: string;
  announcementBar?: {
    enabled: boolean;
    text: string;
    link: string;
    bgColor: string;
    textColor: string;
  };
  scrollingTicker?: {
    enabled: boolean;
    texts: string[];
    speed: number;
  };
  navigationItems: NavigationItem[];
  searchPlaceholder: string;
  showWishlist: boolean;
  showCart: boolean;
  showCurrencyConverter: boolean;
  showLanguageSelector?: boolean;
  stickyHeader?: boolean;
  transparentHeader?: boolean;
  mobileHeaderStyle?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  enabled: boolean;
  order: number;
  slug?: string;
  priority?: number;
  featured?: boolean;
  colorTheme?: string;
  parentId?: string | null;
  mobileOrder?: number;
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
  newsletter?: {
    enabled: boolean;
    title: string;
    placeholder: string;
  };
  paymentIcons?: string[];
  trustBadges?: Array<{ icon: string; text: string }>;
  seoFooterText?: string;
  appDownloadButtons?: { enabled: boolean; androidLink: string; iosLink: string };
  backgroundStyle?: string;
}

interface HomeSection {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  order: number;
  visibility?: { desktop: boolean; tablet: boolean; mobile: boolean };
  styling?: { background: string; padding: string; spacing: string; animation: string };
  content?: {
    image?: string;
    [key: string]: any;
  };
}

interface SettingsContextType {
  heroSlides: any[];
  homeSections: HomeSection[];
  categories: Category[];
  shopCategories: Category[];
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  notificationsSettings: any;
  globalSettings: any;
  deliverySettings: any;
  themeSettings: any;
  productDisplaySettings: any;
  draftSettings: any;
  history: any[];
  loading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
  applyTheme: (theme: any) => void;
}

const defaultHeaderSettings: HeaderSettings = {
  logo: "/placeholder.svg",
  stickyLogo: "/placeholder.svg",
  mobileLogo: "/placeholder.svg",
  announcementBar: {
    enabled: true,
    text: 'Use code SBF10 to get an exclusive discount — only on your first order! 🌸',
    link: '',
    bgColor: 'linear-gradient(to right, #7dd3fc, #f9a8d4, #86efac)',
    textColor: '#ffffff'
  },
  navigationItems: [
    { id: "shop", label: "Shop", href: "/shop", enabled: true, order: 0 },
    { id: "about", label: "About", href: "/about", enabled: true, order: 1 },
    { id: "contact", label: "Contact", href: "/contact", enabled: true, order: 2 },
  ],
  searchPlaceholder: "Search for flowers...",
  showWishlist: true,
  showCart: true,
  showCurrencyConverter: true,
  showLanguageSelector: false,
  stickyHeader: true,
  transparentHeader: false,
  mobileHeaderStyle: 'default'
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
    phone: "+91 9949683222",
    address: "Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028"
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
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.3484898316306!2d78.43144207424317!3d17.395055702585967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb971c17e5196b%3A0x78305a92a4153749!2sSpring%20Blossoms%20Florist!5e0!3m2!1sen!2sin!4v1744469050804!5m2!1sen!2sin",
  newsletter: { enabled: true, title: 'Subscribe to Our Newsletter', placeholder: 'Enter your email' },
  paymentIcons: ['visa', 'mastercard', 'upi', 'razorpay'],
  trustBadges: [
    { icon: 'Truck', text: 'Free Delivery' },
    { icon: 'ShieldCheck', text: 'Secure Payment' },
    { icon: 'Gift', text: 'Special Offers' },
    { icon: 'Heart', text: 'Made with Love' }
  ]
};

const hexToHsl = (hex: string): string => {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

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
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopCategories, setShopCategories] = useState<Category[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [notificationsSettings, setNotificationsSettings] = useState<any>({});
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [deliverySettings, setDeliverySettings] = useState<any>({});
  const [themeSettings, setThemeSettings] = useState<any>({});
  const [productDisplaySettings, setProductDisplaySettings] = useState<any>({});
  const [draftSettings, setDraftSettings] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyTheme = useCallback((theme: any) => {
    if (!theme) return;
    const root = document.documentElement;

    const processColor = (color: string) => {
      if (color && color.startsWith('#')) {
        return hexToHsl(color);
      }
      return color;
    };

    if (theme.primaryColor) {
      root.style.setProperty('--primary', processColor(theme.primaryColor));
    }
    if (theme.secondaryColor) {
      root.style.setProperty('--secondary', processColor(theme.secondaryColor));
    }
    if (theme.accentColor) {
      root.style.setProperty('--accent', processColor(theme.accentColor));
    }
    if (theme.borderRadius !== undefined) {
      root.style.setProperty('--radius', `${theme.borderRadius}rem`);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/settings/all');
      const data = response.data;

      console.log('Settings Context loaded:', data);

      if (data.heroSlides) setHeroSlides(data.heroSlides);
      if (data.homeSections) setHomeSections(data.homeSections);
      if (data.categories) setCategories(data.categories);
      if (data.shopCategories) setShopCategories(data.shopCategories);
      if (data.headerSettings) setHeaderSettings(prev => ({ ...prev, ...data.headerSettings }));
      if (data.footerSettings) setFooterSettings(prev => ({ ...prev, ...data.footerSettings }));
      if (data.notificationsSettings) setNotificationsSettings(data.notificationsSettings);
      if (data.globalSettings) setGlobalSettings(data.globalSettings);
      if (data.deliverySettings) setDeliverySettings(data.deliverySettings);
      if (data.themeSettings) {
        setThemeSettings(data.themeSettings);
        applyTheme(data.themeSettings);
      }
      if (data.productDisplaySettings) setProductDisplaySettings(data.productDisplaySettings);
      if (data.draftSettings) setDraftSettings(data.draftSettings);
      if (data.history) setHistory(data.history);

    } catch (err) {
      console.warn('Failed to load settings from server, using local fallbacks', err);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  const refetchSettings = useCallback(() => fetchSettings(), [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle postMessage live preview syncing
  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      // Validate SBF_SETTINGS_PREVIEW key
      if (event.data && event.data.type === 'SBF_SETTINGS_PREVIEW') {
        const preview = event.data.settings;
        console.log('Preview overriding settings:', preview);
        
        if (preview.heroSlides) setHeroSlides(preview.heroSlides);
        if (preview.homeSections) setHomeSections(preview.homeSections);
        if (preview.categories) setCategories(preview.categories);
        if (preview.shopCategories) setShopCategories(preview.shopCategories);
        if (preview.headerSettings) setHeaderSettings(prev => ({ ...prev, ...preview.headerSettings }));
        if (preview.footerSettings) setFooterSettings(prev => ({ ...prev, ...preview.footerSettings }));
        if (preview.notificationsSettings) setNotificationsSettings(preview.notificationsSettings);
        if (preview.globalSettings) setGlobalSettings(preview.globalSettings);
        if (preview.deliverySettings) setDeliverySettings(preview.deliverySettings);
        if (preview.themeSettings) {
          setThemeSettings(preview.themeSettings);
          applyTheme(preview.themeSettings);
        }
        if (preview.productDisplaySettings) setProductDisplaySettings(preview.productDisplaySettings);
      }
    };

    window.addEventListener('message', handlePreviewMessage);
    return () => {
      window.removeEventListener('message', handlePreviewMessage);
    };
  }, [applyTheme]);

  const contextValue = useMemo((): SettingsContextType => ({
    heroSlides,
    homeSections,
    categories,
    shopCategories,
    headerSettings,
    footerSettings,
    notificationsSettings,
    globalSettings,
    deliverySettings,
    themeSettings,
    productDisplaySettings,
    draftSettings,
    history,
    loading,
    error,
    refetchSettings,
    applyTheme
  }), [
    heroSlides,
    homeSections,
    categories,
    shopCategories,
    headerSettings,
    footerSettings,
    notificationsSettings,
    globalSettings,
    deliverySettings,
    themeSettings,
    productDisplaySettings,
    draftSettings,
    history,
    loading,
    error,
    refetchSettings,
    applyTheme
  ]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
