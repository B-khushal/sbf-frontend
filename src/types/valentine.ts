// Valentine's Week System TypeScript interfaces

export interface ValentineTimelineCard {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  bannerImage: string;
  products: ValentineProduct[];
  offers: ValentineOfferItem[];
  enabled: boolean;
  order: number;
}

export interface ValentineCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  enabled: boolean;
  order: number;
}

export interface ValentineGiftBuilderItem {
  id: string;
  category: 'flowers' | 'chocolates' | 'teddy' | 'greeting_card' | 'photo_frame' | 'perfume' | 'custom_message';
  name: string;
  description: string;
  price: number;
  image: string;
  enabled: boolean;
  stock: number;
  order: number;
}

export interface ValentineBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  position: 'announcement' | 'hero' | 'carousel' | 'popup';
  enabled: boolean;
  order: number;
}

export interface ValentineDeliverySettings {
  sameDayEnabled: boolean;
  sameDayCharge: number;
  sameDayCutoff: string;
  midnightEnabled: boolean;
  midnightCharge: number;
  midnightCutoff: string;
  fixedTimeEnabled: boolean;
  fixedTimeCharge: number;
  surpriseEnabled: boolean;
  surpriseCharge: number;
  anonymousEnabled: boolean;
  anonymousCharge: number;
  zones: Array<{ name: string; enabled: boolean; extraCharge: number }>;
}

export interface ValentineTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  heroImage: string;
  heroHeadline: string;
  heroSubheadline: string;
  ctaButton1Text: string;
  ctaButton1Link: string;
  ctaButton2Text: string;
  ctaButton2Link: string;
  floatingPetals: boolean;
  heartAnimations: boolean;
  confetti: boolean;
}

export interface ValentineSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
}

export interface ValentineMarketing {
  exitIntentPopup: boolean;
  exitIntentTitle: string;
  exitIntentSubtitle: string;
  exitIntentCode: string;
  limitedStockIndicators: boolean;
  trendingProducts: boolean;
  bestSellerBadges: boolean;
  recentPurchaseNotifications: boolean;
  socialProofWidgets: boolean;
}

export interface MobileNavigationSettings {
  showSbfButton: boolean;
  sbfLabel: string;
  enableValentineButton: boolean;
  valentineIcon: 'heart' | 'rose' | 'gift';
  valentineButtonColor: string;
  glowIntensity: 'low' | 'medium' | 'high';
  navbarBackgroundStyle: 'glassmorphism' | 'solid';
  enableFloatingAnimation: boolean;
  enableHeartParticles: boolean;
  enableSeasonalTheme: boolean;
}

export interface ValentineSettings {
  enabled: boolean;
  general: {
    campaignName: string;
    startDate: string;
    endDate: string;
    countdownTargetDate: string;
  };
  theme: ValentineTheme;
  timeline: ValentineTimelineCard[];
  categories: ValentineCategory[];
  delivery: ValentineDeliverySettings;
  giftBuilderItems: ValentineGiftBuilderItem[];
  seo: ValentineSEO;
  marketing: ValentineMarketing;
  banners: ValentineBanner[];
  mobileNavigation?: MobileNavigationSettings;
}

export interface ValentineOfferItem {
  _id: string;
  title: string;
  description: string;
  type: 'bogo' | 'flat_discount' | 'percentage_discount' | 'free_item' | 'free_delivery' | 'combo_discount';
  discountValue: number;
  minOrderAmount: number;
  freeItemName: string;
  products: string[];
  code: string;
  image: string;
  badgeText: string;
  badgeColor: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
  order: number;
}

export interface ValentineProduct {
  _id: string;
  title: string;
  images: string[];
  price: number;
  discount: number;
  category: string;
  description: string;
  countInStock: number;
  valentineDate: string | null;
  isValentineExclusive: boolean;
  valentineCategory: string;
  rating: number;
  numReviews: number;
}

export interface ValentineAnalytics {
  period: {
    startDate: string;
    endDate: string;
    year: number;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    completedOrders: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  dailyData: Array<{
    date: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  topProducts: Array<{
    title: string;
    price: number;
    valentineDate: string;
    valentineCategory: string;
  }>;
  activeOffers: number;
  offersUsage: Array<{
    title: string;
    type: string;
    usageCount: number;
  }>;
}

export type ValentineDateSlug = 
  | 'rose-day' 
  | 'propose-day' 
  | 'chocolate-day' 
  | 'teddy-day' 
  | 'promise-day' 
  | 'hug-day' 
  | 'valentines-day' 
  | 'celebration-day';

export const VALENTINE_DATE_MAP: Record<ValentineDateSlug, { day: number; month: number; label: string; icon: string }> = {
  'rose-day': { day: 8, month: 2, label: 'Rose Day', icon: '🌹' },
  'propose-day': { day: 9, month: 2, label: 'Propose Day', icon: '💍' },
  'chocolate-day': { day: 10, month: 2, label: 'Chocolate Day', icon: '🍫' },
  'teddy-day': { day: 11, month: 2, label: 'Teddy Day', icon: '🧸' },
  'promise-day': { day: 12, month: 2, label: 'Promise Day', icon: '🤝' },
  'hug-day': { day: 13, month: 2, label: 'Hug Day', icon: '🤗' },
  'valentines-day': { day: 14, month: 2, label: "Valentine's Day", icon: '❤️' },
  'celebration-day': { day: 15, month: 2, label: 'Celebration Day', icon: '🎉' },
};
