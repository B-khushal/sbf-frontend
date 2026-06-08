export interface AddonProduct {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: AddonCategory;
  image: string;
  galleryImages: string[];
  price: number;
  discountedPrice: number | null;
  effectivePrice: number;
  discountPercentage: number;
  stock: number;
  inStock: boolean;
  sku: string;
  status: 'active' | 'inactive';
  tags: string[];
  badge: AddonBadge;
  linkedCategories: string[];
  linkedOccasions: string[];
  linkedProducts: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type AddonCategory =
  | 'Chocolates'
  | 'Greeting Cards'
  | 'Teddy Bears'
  | 'Candles'
  | 'Cakes'
  | 'Perfumes'
  | 'Balloons'
  | 'Gift Hampers'
  | 'Dry Fruits'
  | 'Plants'
  | 'Mugs'
  | 'Photo Frames'
  | 'Other';

export type AddonBadge = '' | 'Bestseller' | 'Most Gifted' | 'New' | 'Limited';

export type AddonOccasion =
  | 'Birthday'
  | 'Anniversary'
  | "Valentine's Day"
  | "Mother's Day"
  | "Father's Day"
  | "Women's Day"
  | 'Raksha Bandhan'
  | 'Diwali'
  | 'Christmas'
  | 'New Year'
  | 'Congratulations'
  | 'Get Well Soon'
  | 'Thank You'
  | 'Other';

export const ADDON_CATEGORIES: AddonCategory[] = [
  'Chocolates',
  'Greeting Cards',
  'Teddy Bears',
  'Candles',
  'Cakes',
  'Perfumes',
  'Balloons',
  'Gift Hampers',
  'Dry Fruits',
  'Plants',
  'Mugs',
  'Photo Frames',
  'Other'
];

export const ADDON_BADGES: AddonBadge[] = ['', 'Bestseller', 'Most Gifted', 'New', 'Limited'];

export const ADDON_OCCASIONS: AddonOccasion[] = [
  'Birthday',
  'Anniversary',
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
  "Women's Day",
  'Raksha Bandhan',
  'Diwali',
  'Christmas',
  'New Year',
  'Congratulations',
  'Get Well Soon',
  'Thank You',
  'Other'
];

export interface AddonProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  category: AddonCategory;
  image: string;
  galleryImages: string[];
  price: number;
  discountedPrice: number | null;
  stock: number;
  sku: string;
  status: 'active' | 'inactive';
  tags: string[];
  badge: AddonBadge;
  linkedCategories: string[];
  linkedOccasions: string[];
  linkedProducts: string[];
  sortOrder: number;
}

export interface AddonProductsResponse {
  success: boolean;
  addonProducts: AddonProduct[];
  total: number;
  page: number;
  pages: number;
  message?: string;
}

// Badge color mapping for UI rendering
export const BADGE_COLORS: Record<AddonBadge, { bg: string; text: string; border: string }> = {
  '': { bg: '', text: '', border: '' },
  'Bestseller': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Most Gifted': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'New': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Limited': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};
