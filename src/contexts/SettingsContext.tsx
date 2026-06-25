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
    texts?: string[];
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
  securePaymentEnabled?: boolean;
  securePaymentHeaderText?: string;
  securePaymentHighlightText?: string;
  securePaymentGatewayText?: string;
  securePaymentTrustText?: string;
  securePaymentLogoType?: 'default' | 'custom';
  securePaymentCustomLogo?: string;
  paymentMethodUpiEnabled?: boolean;
  paymentMethodUpiType?: 'default' | 'custom';
  paymentMethodUpiUrl?: string;
  paymentMethodVisaEnabled?: boolean;
  paymentMethodVisaType?: 'default' | 'custom';
  paymentMethodVisaUrl?: string;
  paymentMethodMastercardEnabled?: boolean;
  paymentMethodMastercardType?: 'default' | 'custom';
  paymentMethodMastercardUrl?: string;
  paymentMethodRuPayEnabled?: boolean;
  paymentMethodRuPayType?: 'default' | 'custom';
  paymentMethodRuPayUrl?: string;
  paymentMethodNetBankingEnabled?: boolean;
  paymentMethodNetBankingType?: 'default' | 'custom';
  paymentMethodNetBankingUrl?: string;
  paymentMethodWalletsEnabled?: boolean;
  paymentMethodWalletsType?: 'default' | 'custom';
  paymentMethodWalletsUrl?: string;
  paymentMethodEmiEnabled?: boolean;
  paymentMethodEmiType?: 'default' | 'custom';
  paymentMethodEmiUrl?: string;
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

export interface WhatsAppWidgetSettings {
  enabled: boolean;
  phoneNumber: string;
  position: 'right' | 'left';
  message: string;
  showHoverCard: boolean;
  showFloatingAnimation: boolean;
  businessName: string;
  widgetTitle: string;
  widgetSubtitle: string;
  widgetSize: 'small' | 'medium' | 'large';
  iconStyle: 'circle' | 'pill';
  borderRadius: number;
  shadowIntensity: 'low' | 'medium' | 'high';
  welcomeText: string;
  ctaButtonText: string;
  onlineStatusText: string;
  businessHoursMessage: string;
  showOnlyOnHomepage: boolean;
  showOnValentineLanding: boolean;
}

export interface NotificationsSettings {
  whatsappFloating?: WhatsAppWidgetSettings;
  popupCreator?: any;
  exitIntentPopup?: any;
}

interface SettingsContextType {
  heroSlides: any[];
  mobileBanners: any[];
  promoBanners: any[];
  homeSections: HomeSection[];
  categories: Category[];
  shopCategories: Category[];
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  notificationsSettings: NotificationsSettings;
  globalSettings: any;
  deliverySettings: any;
  themeSettings: any;
  productDisplaySettings: any;
  imageProtectionSettings: any;
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
    texts: ['Use code SBF10 to get an exclusive discount — only on your first order! 🌸'],
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
    email: "contact@sbflorist.in",
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
    },
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
  ],
  securePaymentEnabled: true,
  securePaymentHeaderText: "Secure Payments by",
  securePaymentHighlightText: "100% Safe & Encrypted Transactions",
  securePaymentGatewayText: "Trusted Payment Gateway",
  securePaymentTrustText: "Trusted by Millions of Businesses",
  securePaymentLogoType: "default",
  securePaymentCustomLogo: "",
  paymentMethodUpiEnabled: true,
  paymentMethodUpiType: "default",
  paymentMethodUpiUrl: "",
  paymentMethodVisaEnabled: true,
  paymentMethodVisaType: "default",
  paymentMethodVisaUrl: "",
  paymentMethodMastercardEnabled: true,
  paymentMethodMastercardType: "default",
  paymentMethodMastercardUrl: "",
  paymentMethodRuPayEnabled: true,
  paymentMethodRuPayType: "default",
  paymentMethodRuPayUrl: "",
  paymentMethodNetBankingEnabled: true,
  paymentMethodNetBankingType: "default",
  paymentMethodNetBankingUrl: "",
  paymentMethodWalletsEnabled: true,
  paymentMethodWalletsType: "default",
  paymentMethodWalletsUrl: "",
  paymentMethodEmiEnabled: true,
  paymentMethodEmiType: "default",
  paymentMethodEmiUrl: ""
};

export const defaultWhatsAppWidgetSettings: WhatsAppWidgetSettings = {
  enabled: true,
  phoneNumber: '9949683222',
  position: 'right',
  message: "Hello! I'm interested in your flower arrangements.",
  showHoverCard: true,
  showFloatingAnimation: true,
  businessName: 'Spring Blossoms Florist',
  widgetTitle: 'WhatsApp Us',
  widgetSubtitle: 'Need help choosing flowers?',
  widgetSize: 'medium',
  iconStyle: 'circle',
  borderRadius: 12,
  shadowIntensity: 'medium',
  welcomeText: 'Chat with our floral experts.',
  ctaButtonText: 'Chat Now',
  onlineStatusText: 'Online',
  businessHoursMessage: 'Typically replies within minutes',
  showOnlyOnHomepage: false,
  showOnValentineLanding: false
};

export const defaultNotificationsSettings: NotificationsSettings = {
  whatsappFloating: defaultWhatsAppWidgetSettings,
  popupCreator: {
    enabled: false,
    image: '',
    title: 'Special Offer!',
    subtitle: 'Get 10% off your first purchase',
    ctaText: 'Shop Now',
    ctaLink: '/shop'
  },
  exitIntentPopup: {
    enabled: false,
    title: "Wait! Don't Go Empty Handed",
    subtitle: "Use code EXIT10 for 10% off!",
    discountCode: "EXIT10"
  }
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
  const [mobileBanners, setMobileBanners] = useState<any[]>([]);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopCategories, setShopCategories] = useState<Category[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [notificationsSettings, setNotificationsSettings] = useState<NotificationsSettings>(defaultNotificationsSettings);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [deliverySettings, setDeliverySettings] = useState<any>({});
  const [themeSettings, setThemeSettings] = useState<any>({});
  const [productDisplaySettings, setProductDisplaySettings] = useState<any>({});
  const [imageProtectionSettings, setImageProtectionSettings] = useState<any>({
    enableWatermark: true,
    watermarkText: "sbflorist.in",
    watermarkOpacity: 20,
    watermarkPosition: "Center + Bottom Right",
    watermarkSize: 30,
    watermarkRotation: -45,
    repeatingPattern: false
  });
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
      if (data.mobileBanners) setMobileBanners(data.mobileBanners);
      if (data.promoBanners) setPromoBanners(data.promoBanners);
      if (data.homeSections) setHomeSections(data.homeSections);
      if (data.categories) setCategories(data.categories);
      if (data.shopCategories) setShopCategories(data.shopCategories);
      if (data.headerSettings) setHeaderSettings(prev => ({ ...prev, ...data.headerSettings }));
      if (data.footerSettings) setFooterSettings(prev => ({ ...prev, ...data.footerSettings }));
      if (data.notificationsSettings) {
        setNotificationsSettings(prev => ({
          ...prev,
          ...data.notificationsSettings,
          whatsappFloating: {
            ...prev.whatsappFloating,
            ...(data.notificationsSettings.whatsappFloating || {})
          }
        }));
      }
      if (data.globalSettings) setGlobalSettings(data.globalSettings);
      if (data.deliverySettings) setDeliverySettings(data.deliverySettings);
      if (data.themeSettings) {
        setThemeSettings(data.themeSettings);
        applyTheme(data.themeSettings);
      }
      if (data.productDisplaySettings) setProductDisplaySettings(data.productDisplaySettings);
      if (data.imageProtectionSettings) setImageProtectionSettings(data.imageProtectionSettings);
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
        if (preview.mobileBanners) setMobileBanners(preview.mobileBanners);
        if (preview.promoBanners) setPromoBanners(preview.promoBanners);
        if (preview.homeSections) setHomeSections(preview.homeSections);
        if (preview.categories) setCategories(preview.categories);
        if (preview.shopCategories) setShopCategories(preview.shopCategories);
        if (preview.headerSettings) setHeaderSettings(prev => ({ ...prev, ...preview.headerSettings }));
        if (preview.footerSettings) setFooterSettings(prev => ({ ...prev, ...preview.footerSettings }));
        if (preview.notificationsSettings) {
          setNotificationsSettings(prev => ({
            ...prev,
            ...preview.notificationsSettings,
            whatsappFloating: {
              ...prev.whatsappFloating,
              ...(preview.notificationsSettings.whatsappFloating || {})
            }
          }));
        }
        if (preview.globalSettings) setGlobalSettings(preview.globalSettings);
        if (preview.deliverySettings) setDeliverySettings(preview.deliverySettings);
        if (preview.themeSettings) {
          setThemeSettings(preview.themeSettings);
          applyTheme(preview.themeSettings);
        }
        if (preview.productDisplaySettings) setProductDisplaySettings(preview.productDisplaySettings);
        if (preview.imageProtectionSettings) setImageProtectionSettings(preview.imageProtectionSettings);
      }
    };

    window.addEventListener('message', handlePreviewMessage);
    return () => {
      window.removeEventListener('message', handlePreviewMessage);
    };
  }, [applyTheme]);

  const contextValue = useMemo((): SettingsContextType => ({
    heroSlides,
    mobileBanners,
    promoBanners,
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
    imageProtectionSettings,
    draftSettings,
    history,
    loading,
    error,
    refetchSettings,
    applyTheme
  }), [
    heroSlides,
    mobileBanners,
    promoBanners,
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
    imageProtectionSettings,
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
