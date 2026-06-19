export interface SeasonalCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  enabled: boolean;
  order: number;
}

export interface SeasonalBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  position: 'announcement' | 'hero' | 'carousel' | 'popup' | 'offer' | 'countdown';
  enabled: boolean;
  order: number;
}

export interface SeasonalOffer {
  id: string;
  title: string;
  code?: string;
  type: 'discount' | 'free-delivery' | 'bogo' | 'gift' | 'bundle';
  value: number;
  minOrderAmount: number;
  enabled: boolean;
  order: number;
}

export interface SeasonalCampaign {
  _id?: string;
  name: string;
  slug: string;
  enabled: boolean;
  revenue?: number;
  general: {
    campaignName: string;
    startDate: string | null;
    endDate: string | null;
    countdownTargetDate: string | null;
    exploreButtonText?: string;
    offersButtonText?: string;
    countdownLabel?: string;
    offersLabel?: string;
    offersTitle?: string;
    homepageSectionBadge?: string;
    homepageSectionTitle?: string;
    homepageSectionSubtitle?: string;
    cardTagText?: string;
    cardTitleText?: string;
    cardDescriptionText?: string;
    cardButtonText?: string;
    cardImage?: string;
  };
  theme: {
    icon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundStyle: string;
    backgroundGradient: string;
    animationStyle: 'petals' | 'hearts' | 'leaves' | 'confetti' | 'none';
    typography: string;
    buttonStyle: string;
    bannerStyle: string;
    textColor?: string;
    subtextColor?: string;
  };
  navigation: {
    showInHomepage: boolean;
    showInNavigationMenu: boolean;
    showInMobileNavbar: boolean;
    showInAnnouncementBar: boolean;
    showInFeaturedSection: boolean;
  };
  banners: SeasonalBanner[];
  categories: SeasonalCategory[];
  offers: SeasonalOffer[];
  delivery: {
    sameDayEnabled: boolean;
    sameDayCharge: number;
    sameDayCutoff: string;
    midnightEnabled: boolean;
    midnightCharge: number;
    midnightCutoff: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage: string;
    canonicalUrl: string;
  };
  analytics?: {
    orders: number;
    revenue: number;
    conversionRate: number;
    traffic: number;
    pageViews: number;
  };
  productCount?: number;
  ordersCount?: number;
}
