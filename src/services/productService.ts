import axios from 'axios';
import { API_URL } from '@/config';

export interface AddonOption {
  name: string;
  price: number;
  type: 'flower' | 'chocolate';
  image?: string;
}

export interface ComboItemVariant {
  name: string;
  price: number;
  description?: string;
}

export interface ComboItemCustomizationOptions {
  allowMessage: boolean;
  messageLabel: string;
  allowColorChoice: boolean;
  colorOptions: string[];
  allowSizeChoice: boolean;
  sizeOptions: string[];
  allowQuantity: boolean;
  maxQuantity: number;
  allowPhotoUpload: boolean;
  allowCustomText: boolean;
  customTextLabel: string;
  allowAddons: boolean;
  addonOptions: string[];
  // Pricing variants for size/type selection
  variants?: ComboItemVariant[];
  allowVariants?: boolean;
  variantLabel?: string; // e.g., "Size", "Type", "Weight"
}

export interface ComboItem {
  name: string;
  description: string;
  image: string;
  price: number; // Base price for this item
  quantity: number; // Default quantity
  notes?: string; // Optional notes field
  customizationOptions: ComboItemCustomizationOptions;
}

export interface CustomizationOptions {
  allowPhotoUpload: boolean;
  allowNumberInput: boolean;
  numberInputLabel: string;
  allowMessageCard: boolean;
  messageCardPrice: number;
  addons: {
    flowers: AddonOption[];
    chocolates: AddonOption[];
  };
  previewImage: string;
  useSameFlowerImage?: boolean;
  flowerGroupImage?: string;
  useSameChocolateImage?: boolean;
  chocolateGroupImage?: string;
}

export interface PriceVariant {
  label: string;
  price: number;
  stock: number;
}

export interface ProductVideo {
  _id?: string;
  url: string;
  source: 'upload' | 'youtube' | 'vimeo' | 'cloudinary' | 'custom';
  publicId?: string;
  title?: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  isFeatured?: boolean;
  order?: number;
}

export interface OccasionData {
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  banner: string;
  thumbnail: string;
  accentColor: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  featured: boolean;
  visibleOnHomepage: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductData {
  _id?: string;
  id?: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  costPrice?: number;
  discount: number;
  category: string;
  subcategory: string;
  categories: string[];
  occasionIds?: string[];
  countInStock: number;
  images: string[];
  image?: string;
  details: string[];
  careInstructions: string[];
  isNew?: boolean;
  isNewArrival: boolean;
  isRecommended?: boolean;
  isFeatured: boolean;
  hidden: boolean;
  sameDay?: boolean;
  rating?: number;
  numReviews?: number;
  createdAt?: string;
  updatedAt?: string;
  isCustomizable: boolean;
  hasPriceVariants: boolean;
  priceVariants: PriceVariant[];
  customizationOptions: CustomizationOptions;
  comboItems: ComboItem[];
  comboName: string;
  comboDescription: string;
  comboSubcategory: string;
  productType?: 'regular' | 'valentine';
  isValentineProduct?: boolean;
  availableDates?: string[];
  dateWiseStock?: Record<string, number>;
  dateWisePricing?: Record<string, number>;
  dateWiseOffers?: Record<string, string>;
  dateWiseDeliveryCharges?: Record<string, number>;
  valentineDate?: string | null;
  isValentineExclusive?: boolean;
  valentineCategory?: string;
  showInValentineShop?: boolean;
  valentineCategories?: string[];
  valentineSections?: string[];
  valentineBadge?: string;
  featureInValentineHero?: boolean;
  enableValentinePricing?: boolean;
  valentineSeoTitle?: string;
  valentineSeoDescription?: string;
  valentineSlug?: string;
  seasonalCampaigns?: string[];
  campaignSettings?: Record<string, any>;
  videos?: ProductVideo[];
  personalizationEnabled?: boolean;
  personalizationType?: 'name' | 'word' | 'text' | 'letter-bouquet' | 'custom-message';
  fieldLabel?: string;
  placeholder?: string;
  minCharacters?: number;
  maxCharacters?: number;
  allowedCharacters?: {
    alphabets: boolean;
    numbers: boolean;
    spaces: boolean;
    hyphen: boolean;
    ampersand: boolean;
    period: boolean;
    emoji: boolean;
  };
  personalizationRequired?: boolean;
  textTransform?: 'original' | 'uppercase' | 'lowercase' | 'titlecase';
  helperText?: string;
  pricePerCharacter?: number;
  baseIncludedCharacters?: number;
  maxExtraPrice?: number;
  // Enterprise Catalog Architecture Fields
  catalogType?: 'bouquet' | 'plant' | 'cake' | 'chocolate' | 'hamper' | 'combo' | 'addon' | 'custom';
  sku?: string;
  status?: 'published' | 'draft' | 'hidden' | 'archived' | 'scheduled';
  costPrice?: number;
  barcode?: string;
  allowBackorders?: boolean;
  warehouseLocation?: string;
  vendor?: string | { _id: string; name: string; storeName?: string };
  cakeAttributes?: {
    flavor?: string;
    weight?: string;
    shape?: string;
    eggless?: boolean;
    prepTime?: string;
    availableSizes?: string[];
    occasion?: string;
  };
  plantAttributes?: {
    scientificName?: string;
    potIncluded?: boolean;
    indoor?: boolean;
    outdoor?: boolean;
    waterFrequency?: string;
    lightRequirement?: string;
    height?: string;
    careInstructions?: string[];
  };
  chocolateAttributes?: {
    brand?: string;
    weight?: string;
    imported?: boolean;
    vegetarian?: boolean;
    expiryDate?: string;
    storage?: string;
  };
  hamperAttributes?: {
    hamperItems?: Array<{
      productId?: string;
      name: string;
      type: string;
      price: number;
      image: string;
      quantity: number;
    }>;
  };
  comboAttributes?: {
    comboProducts?: Array<{
      productId?: string;
      name: string;
      type: string;
      price: number;
      image: string;
      quantity: number;
    }>;
    stockPolicy?: 'hide' | 'partial' | 'replace';
  };
  seoSettings?: {
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
    canonicalUrl?: string;
    ogImage?: string;
    twitterCard?: string;
    keywords?: string[];
  };
  collections?: string[];
  versionHistory?: Array<{
    version: number;
    updatedBy: string;
    changes: string;
    data: any;
    timestamp: string;
  }>;
  activityLogs?: Array<{
    action: string;
    performedBy: string;
    details: string;
    timestamp: string;
  }>;
  relatedProducts?: string[];
  crossSellProducts?: string[];
  upsellProducts?: string[];
}

export interface OverviewStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  hiddenProducts: number;
  draftProducts: number;
  bestSellingCategory: string;
  recentlyAdded: ProductData[];
  lowInventoryCount: number;
  averageRating: number;
  pendingReviewCount: number;
  typeDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  recentlyUpdated: ProductData[];
}

// Define backend product type to match backend schema
interface BackendProductData {
  _id?: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  subcategory?: string;
  categories?: string[];
  occasionIds?: string[];
  brand?: string;
  countInStock: number;
  images: string[];
  details?: string[] | string;
  careInstructions?: string[] | string;
  isNew?: boolean; // Backend uses isNew
  isNewArrival?: boolean; // Backward compatibility for older backend variants
  isRecommended?: boolean;
  isFeatured?: boolean;
  hidden?: boolean;
  sameDay?: boolean;
  rating?: number;
  numReviews?: number;
  isCustomizable?: boolean;
  hasPriceVariants?: boolean;
  priceVariants?: PriceVariant[];
  customizationOptions?: CustomizationOptions;
  // Combo-specific fields
  comboItems?: ComboItem[];
  comboName?: string;
  comboDescription?: string;
  productType?: 'regular' | 'valentine';
  isValentineProduct?: boolean;
  availableDates?: string[];
  dateWiseStock?: Record<string, number>;
  dateWisePricing?: Record<string, number>;
  dateWiseOffers?: Record<string, string>;
  dateWiseDeliveryCharges?: Record<string, number>;
  valentineDate?: string | null;
  isValentineExclusive?: boolean;
  valentineCategory?: string;
  showInValentineShop?: boolean;
  valentineCategories?: string[];
  valentineSections?: string[];
  valentineBadge?: string;
  featureInValentineHero?: boolean;
  enableValentinePricing?: boolean;
  valentineSeoTitle?: string;
  valentineSeoDescription?: string;
  valentineSlug?: string;
  seasonalCampaigns?: string[];
  campaignSettings?: Record<string, any>;
  videos?: ProductVideo[];
  personalizationEnabled?: boolean;
  personalizationType?: 'name' | 'word' | 'text' | 'letter-bouquet' | 'custom-message';
  fieldLabel?: string;
  placeholder?: string;
  minCharacters?: number;
  maxCharacters?: number;
  allowedCharacters?: {
    alphabets: boolean;
    numbers: boolean;
    spaces: boolean;
    hyphen: boolean;
    ampersand: boolean;
    period: boolean;
    emoji: boolean;
  };
  personalizationRequired?: boolean;
  textTransform?: 'original' | 'uppercase' | 'lowercase' | 'titlecase';
  helperText?: string;
  pricePerCharacter?: number;
  baseIncludedCharacters?: number;
  maxExtraPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Allow other properties with unknown type
}

// Helper function to get auth token from storage
const getAuthToken = () => {
  // Try userData first (from our recent changes)
  const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      if (parsed.token) return parsed.token;
    } catch (err) {
      console.error('Error parsing userData:', err);
    }
  }
  
  // Fall back to user (from the existing auth system)
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.token) return parsed.token;
    } catch (err) {
      console.error('Error parsing user data:', err);
    }
  }
  
  // Finally, try direct token storage
  const token = localStorage.getItem('token');
  if (token) return token;
  
  return null;
};

// Helper function to create config with auth header
const createAuthConfig = () => {
  const token = getAuthToken();
  return {
    timeout: 120000, // 120s timeout for slow network connections
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    }
  };
};

// Helper function to clean product data for API submission
const prepareProductData = (productData: ProductData): BackendProductData => {
  // Clean empty or null values, ensure boolean fields are sent as booleans
  const cleanData: BackendProductData = { ...productData };
  
  // Send both fields for backward/forward compatibility.
  cleanData.isNew = Boolean(productData.isNewArrival);
  cleanData.isNewArrival = Boolean(productData.isNewArrival);
  
  // Force boolean fields to be actual booleans
  cleanData.isFeatured = Boolean(productData.isFeatured);
  cleanData.hidden = Boolean(productData.hidden);
  cleanData.sameDay = productData.sameDay !== undefined ? Boolean(productData.sameDay) : true;
  cleanData.isCustomizable = Boolean(productData.isCustomizable);
  cleanData.hasPriceVariants = Boolean(productData.hasPriceVariants);
  
  // Valentine properties
  cleanData.productType = productData.productType || 'regular';
  cleanData.isValentineProduct = Boolean(productData.isValentineProduct);
  cleanData.availableDates = productData.availableDates || [];
  cleanData.dateWiseStock = productData.dateWiseStock || {};
  cleanData.dateWisePricing = productData.dateWisePricing || {};
  cleanData.dateWiseOffers = productData.dateWiseOffers || {};
  cleanData.dateWiseDeliveryCharges = productData.dateWiseDeliveryCharges || {};
  cleanData.valentineDate = productData.valentineDate || null;
  cleanData.isValentineExclusive = Boolean(productData.isValentineExclusive);
  cleanData.valentineCategory = productData.valentineCategory || '';
  cleanData.showInValentineShop = Boolean(productData.showInValentineShop);
  cleanData.valentineCategories = productData.valentineCategories || [];
  cleanData.valentineSections = productData.valentineSections || [];
  cleanData.valentineBadge = productData.valentineBadge || '';
  cleanData.featureInValentineHero = Boolean(productData.featureInValentineHero);
  cleanData.enableValentinePricing = Boolean(productData.enableValentinePricing);
  cleanData.valentineSeoTitle = productData.valentineSeoTitle || '';
  cleanData.valentineSeoDescription = productData.valentineSeoDescription || '';
  cleanData.valentineSlug = productData.valentineSlug || '';
  
  // Process price variants for backend
  if (productData.hasPriceVariants && Array.isArray(productData.priceVariants)) {
    cleanData.priceVariants = productData.priceVariants.map(variant => ({
      label: String(variant.label),
      price: Number(variant.price),
      stock: Number(variant.stock)
    }));
  } else {
    cleanData.priceVariants = [];
  }

  // Process details for backend (convert array to format expected by backend)
  if (Array.isArray(productData.details)) {
    // Filter out empty details and send as array
    cleanData.details = productData.details.filter(detail => 
      detail && typeof detail === 'string' && detail.trim().length > 0
    );
  }

  // Process care instructions for backend
  if (Array.isArray(productData.careInstructions)) {
    cleanData.careInstructions = productData.careInstructions.filter(instruction => 
      instruction && typeof instruction === 'string' && instruction.trim().length > 0
    );
  }

  // Process customization options for backend
  if (productData.customizationOptions) {
    cleanData.customizationOptions = {
      allowPhotoUpload: Boolean(productData.customizationOptions.allowPhotoUpload),
      allowNumberInput: Boolean(productData.customizationOptions.allowNumberInput),
      numberInputLabel: productData.customizationOptions.numberInputLabel || "Enter number",
      allowMessageCard: Boolean(productData.customizationOptions.allowMessageCard),
      messageCardPrice: Number(productData.customizationOptions.messageCardPrice) || 0,
      addons: {
        flowers: Array.isArray(productData.customizationOptions.addons?.flowers) 
          ? productData.customizationOptions.addons.flowers 
          : [],
        chocolates: Array.isArray(productData.customizationOptions.addons?.chocolates) 
          ? productData.customizationOptions.addons.chocolates 
          : []
      },
      previewImage: productData.customizationOptions.previewImage || "",
      useSameFlowerImage: Boolean(productData.customizationOptions.useSameFlowerImage),
      flowerGroupImage: productData.customizationOptions.flowerGroupImage || "",
      useSameChocolateImage: Boolean(productData.customizationOptions.useSameChocolateImage),
      chocolateGroupImage: productData.customizationOptions.chocolateGroupImage || ""
    };
  }

  // Process combo fields for backend
  if (productData.comboItems && Array.isArray(productData.comboItems)) {
    cleanData.comboItems = productData.comboItems;
  }
  if (productData.comboName) {
    cleanData.comboName = productData.comboName;
  }
  if (productData.comboDescription) {
    cleanData.comboDescription = productData.comboDescription;
  }
  
  // Process videos for backend
  cleanData.videos = Array.isArray(productData.videos) ? productData.videos : [];
  
  // Process personalization settings for backend
  cleanData.personalizationEnabled = Boolean(productData.personalizationEnabled);
  cleanData.personalizationType = productData.personalizationType || 'name';
  cleanData.fieldLabel = productData.fieldLabel || '';
  cleanData.placeholder = productData.placeholder || '';
  cleanData.minCharacters = productData.minCharacters !== undefined ? Number(productData.minCharacters) : 1;
  cleanData.maxCharacters = productData.maxCharacters !== undefined ? Number(productData.maxCharacters) : 10;
  cleanData.allowedCharacters = productData.allowedCharacters || {
    alphabets: true,
    numbers: false,
    spaces: true,
    hyphen: false,
    ampersand: false,
    period: false,
    emoji: false
  };
  cleanData.personalizationRequired = Boolean(productData.personalizationRequired);
  cleanData.textTransform = productData.textTransform || 'original';
  cleanData.helperText = productData.helperText || '';
  cleanData.pricePerCharacter = productData.pricePerCharacter !== undefined ? Number(productData.pricePerCharacter) : 0;
  cleanData.baseIncludedCharacters = productData.baseIncludedCharacters !== undefined ? Number(productData.baseIncludedCharacters) : 0;
  cleanData.maxExtraPrice = productData.maxExtraPrice !== undefined ? Number(productData.maxExtraPrice) : 0;

  return cleanData;
};

// Helper function to map backend data to frontend model
const mapBackendToFrontend = (data: BackendProductData): ProductData => {
  // Create a copy to avoid modifying the original
  const mappedData: Partial<ProductData> = { ...data } as any;

  // Ensure numeric price, discount, and costPrice
  mappedData.price = data.price !== undefined ? Number(data.price) : 0;
  mappedData.discount = data.discount !== undefined ? Number(data.discount) : 0;
  if (data.costPrice !== undefined) {
    mappedData.costPrice = Number(data.costPrice);
  }

  // Map either backend field (isNew or isNewArrival) to frontend isNewArrival
  if ('isNew' in data || 'isNewArrival' in data) {
    mappedData.isNewArrival = Boolean(
      typeof data.isNew === 'boolean' ? data.isNew : data.isNewArrival
    );
    mappedData.isNew = mappedData.isNewArrival;
  }
  mappedData.isRecommended = Boolean(data.isRecommended);
  mappedData.createdAt = data.createdAt;
  mappedData.updatedAt = data.updatedAt;

  // Map Valentine properties
  mappedData.productType = data.productType || 'regular';
  mappedData.isValentineProduct = Boolean(data.isValentineProduct);
  mappedData.availableDates = data.availableDates || [];
  mappedData.dateWiseStock = (data.dateWiseStock as Record<string, number>) || {};
  mappedData.dateWisePricing = (data.dateWisePricing as Record<string, number>) || {};
  mappedData.dateWiseOffers = (data.dateWiseOffers as Record<string, string>) || {};
  mappedData.dateWiseDeliveryCharges = (data.dateWiseDeliveryCharges as Record<string, number>) || {};
  mappedData.valentineDate = data.valentineDate || null;
  mappedData.isValentineExclusive = Boolean(data.isValentineExclusive);
  mappedData.valentineCategory = data.valentineCategory || '';
  mappedData.showInValentineShop = Boolean(data.showInValentineShop);
  mappedData.valentineCategories = Array.isArray(data.valentineCategories) ? data.valentineCategories : [];
  mappedData.valentineSections = Array.isArray(data.valentineSections) ? data.valentineSections : [];
  mappedData.valentineBadge = typeof data.valentineBadge === 'string' ? data.valentineBadge : '';
  mappedData.featureInValentineHero = Boolean(data.featureInValentineHero);
  mappedData.enableValentinePricing = Boolean(data.enableValentinePricing);
  mappedData.valentineSeoTitle = typeof data.valentineSeoTitle === 'string' ? data.valentineSeoTitle : '';
  mappedData.valentineSeoDescription = typeof data.valentineSeoDescription === 'string' ? data.valentineSeoDescription : '';
  mappedData.valentineSlug = typeof data.valentineSlug === 'string' ? data.valentineSlug : '';

  // Map combo fields
  if (data.comboItems) {
    mappedData.comboItems = data.comboItems;
  }
  if (data.comboName) {
    mappedData.comboName = data.comboName;
  }
  if (data.comboDescription) {
    mappedData.comboDescription = data.comboDescription;
  }

  // Map videos
  mappedData.videos = Array.isArray(data.videos) ? data.videos : [];

  // Map personalization settings
  mappedData.personalizationEnabled = Boolean(data.personalizationEnabled);
  mappedData.personalizationType = data.personalizationType || 'name';
  mappedData.fieldLabel = data.fieldLabel || '';
  mappedData.placeholder = data.placeholder || '';
  mappedData.minCharacters = data.minCharacters !== undefined ? Number(data.minCharacters) : 1;
  mappedData.maxCharacters = data.maxCharacters !== undefined ? Number(data.maxCharacters) : 10;
  mappedData.allowedCharacters = data.allowedCharacters || {
    alphabets: true,
    numbers: false,
    spaces: true,
    hyphen: false,
    ampersand: false,
    period: false,
    emoji: false
  };
  mappedData.personalizationRequired = Boolean(data.personalizationRequired);
  mappedData.textTransform = data.textTransform || 'original';
  mappedData.helperText = data.helperText || '';
  mappedData.pricePerCharacter = data.pricePerCharacter !== undefined ? Number(data.pricePerCharacter) : 0;
  mappedData.baseIncludedCharacters = data.baseIncludedCharacters !== undefined ? Number(data.baseIncludedCharacters) : 0;
  mappedData.maxExtraPrice = data.maxExtraPrice !== undefined ? Number(data.maxExtraPrice) : 0;

  // ✅ Handle details properly (flatten nested arrays from backend)
  const details = data.details;
  if (Array.isArray(details)) {
    // Backend sends details as array of arrays, flatten it for frontend
    mappedData.details = details.flat().filter(detail =>
      detail && typeof detail === 'string' && detail.trim().length > 0
    );
  } else if (typeof details === 'string') {
    // Split by comma or any separator if it's a string
    mappedData.details = details.split(/[,•]/).map(str => str.trim()).filter(str => str.length > 0);
  } else {
    mappedData.details = [];
  }

  // ✅ Handle care instructions
  if (Array.isArray(data.careInstructions)) {
    mappedData.careInstructions = data.careInstructions.filter(instruction => 
      instruction && typeof instruction === 'string' && instruction.trim().length > 0
    );
  } else {
    mappedData.careInstructions = [];
  }

  mappedData.sameDay = data.sameDay !== undefined ? Boolean(data.sameDay) : true;

  // ✅ Handle customization fields
  if (data.isCustomizable !== undefined) {
    mappedData.isCustomizable = Boolean(data.isCustomizable);
  }

  // ✅ Handle price variants
  if (data.hasPriceVariants !== undefined) {
    mappedData.hasPriceVariants = Boolean(data.hasPriceVariants);
  }
  
  if (Array.isArray(data.priceVariants)) {
    mappedData.priceVariants = data.priceVariants.map(variant => ({
      label: String(variant.label),
      price: Number(variant.price),
      stock: Number(variant.stock)
    }));
  } else {
    mappedData.priceVariants = [];
  }

  if (data.customizationOptions) {
    mappedData.customizationOptions = {
      allowPhotoUpload: Boolean(data.customizationOptions.allowPhotoUpload),
      allowNumberInput: Boolean(data.customizationOptions.allowNumberInput),
      numberInputLabel: data.customizationOptions.numberInputLabel || "Enter number",
      allowMessageCard: Boolean(data.customizationOptions.allowMessageCard),
      messageCardPrice: Number(data.customizationOptions.messageCardPrice) || 0,
      addons: {
        flowers: Array.isArray(data.customizationOptions.addons?.flowers) 
          ? data.customizationOptions.addons.flowers 
          : [],
        chocolates: Array.isArray(data.customizationOptions.addons?.chocolates) 
          ? data.customizationOptions.addons.chocolates 
          : []
      },
      previewImage: data.customizationOptions.previewImage || "",
      useSameFlowerImage: Boolean(data.customizationOptions.useSameFlowerImage),
      flowerGroupImage: data.customizationOptions.flowerGroupImage || "",
      useSameChocolateImage: Boolean(data.customizationOptions.useSameChocolateImage),
      chocolateGroupImage: data.customizationOptions.chocolateGroupImage || ""
    };
  } else {
    // Set default customization options if none exist
    mappedData.customizationOptions = {
      allowPhotoUpload: false,
      allowNumberInput: false,
      numberInputLabel: "Enter number",
      allowMessageCard: false,
      messageCardPrice: 0,
      addons: {
        flowers: [],
        chocolates: []
      },
      previewImage: "",
      useSameFlowerImage: false,
      flowerGroupImage: "",
      useSameChocolateImage: false,
      chocolateGroupImage: ""
    };
  }

  return mappedData as ProductData;
};

class ProductService {
  async getProducts(): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products`);
    // Map each product to our frontend model
    return Array.isArray(response.data) 
      ? response.data.map(mapBackendToFrontend) 
      : [];
  }

  async getAllProducts(): Promise<ProductData[]> {
    return this.getProducts();
  }

  async toggleVisibility(id: string): Promise<any> {
    const config = createAuthConfig();
    const response = await axios.put(`${API_URL}/products/admin/${id}/toggle-visibility`, {}, config);
    return response.data;
  }

  async getProductById(id: string): Promise<ProductData> {
    const config = createAuthConfig();
    const response = await axios.get(`${API_URL}/products/${id}`, config);
    
    // Map the backend data to our frontend model
    return mapBackendToFrontend(response.data);
  }

  async createProduct(productData: ProductData): Promise<ProductData> {
    const config = createAuthConfig();

    // Process data ensuring proper types for all fields
    const processedData = prepareProductData(productData);

    const response = await axios.post(`${API_URL}/products`, processedData, config);
    return response.data;
  }

  async updateProduct(id: string, productData: ProductData): Promise<ProductData> {
    const config = createAuthConfig();

    // Process data ensuring proper types for all fields
    const processedData = prepareProductData(productData);

    const response = await axios.put(`${API_URL}/products/${id}`, processedData, config);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    const config = createAuthConfig();
    await axios.delete(`${API_URL}/products/${id}`, config);
  }

  async getProductsByCategory(category: string): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products/category/${category}`);
    return response.data;
  }

  async getCategoriesWithCounts(): Promise<{ name: string; count: number }[]> {
    const response = await axios.get(`${API_URL}/products/categories-with-counts`);
    return response.data;
  }

  async getNewArrivals(): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products/new`);

    // Extract products from the response
    const products = response.data.products || response.data;
    
    // Map each product to our frontend model
    return Array.isArray(products) 
      ? products.map(mapBackendToFrontend) 
      : [];
  }

  async getFeaturedProducts(): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products/featured`);

    // Extract products from the response
    const products = response.data.products || response.data;
    
    // Map each product to our frontend model
    return Array.isArray(products) 
      ? products.map(mapBackendToFrontend) 
      : [];
  }

  async searchProducts(query: string): Promise<ProductData[]> {
    const response = await axios.get(`${API_URL}/products/search?q=${query}`);
    return response.data;
  }

  async getRecommendedProducts(currentProductId: string, category: string, limit = 6): Promise<ProductData[]> {
    try {
      // First try to get products from the same category
      const categoryProducts = await this.getProductsByCategory(category);
      
      // Filter out the current product and hidden products
      const filteredProducts = categoryProducts.filter(product => 
        product._id !== currentProductId && !product.hidden
      );

      // If we have enough products from the same category, return them
      if (filteredProducts.length >= limit) {
        return filteredProducts.slice(0, limit);
      }

      // If not enough products from the same category, get all products
      const allProducts = await this.getProducts();
      const allFiltered = allProducts.filter(product => 
        product._id !== currentProductId && !product.hidden
      );

      // Prioritize products from the same category, then add others
      const recommended = [
        ...filteredProducts,
        ...allFiltered.filter(product => product.category !== category)
      ];

      return recommended.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      // Fallback: get featured products
      try {
        const featuredProducts = await this.getFeaturedProducts();
        return featuredProducts.filter(product => 
          product._id !== currentProductId && !product.hidden
        ).slice(0, limit);
      } catch (fallbackError) {
        console.error('Error fetching featured products as fallback:', fallbackError);
        return [];
      }
    }
  }

  async bulkUpdateValentineSettings(productIds: string[], action: string, value?: any): Promise<any> {
    const config = createAuthConfig();
    const response = await axios.post(`${API_URL}/products/admin/bulk-valentine`, { productIds, action, value }, config);
    return response.data;
  }

  async getSectionProductsForSorting(section: string): Promise<any> {
    const config = createAuthConfig();
    const response = await axios.get(`${API_URL}/products/order/${section}`, config);
    return response.data;
  }

  async updateSectionProductsOrder(section: string, displayOrders: Record<string, number>, sortBy?: string, sortDirection?: string): Promise<any> {
    const config = createAuthConfig();
    const response = await axios.put(`${API_URL}/products/order/update`, { section, displayOrders, sortBy, sortDirection }, config);
    return response.data;
  }

  async bulkUpdateSectionProducts(productIds: string[], action: string, value?: any, section?: string): Promise<any> {
    const config = createAuthConfig();
    const response = await axios.put(`${API_URL}/products/order/bulk-update`, { productIds, action, value, section }, config);
    return response.data;
  }

  async resetSectionProductsOrder(section: string): Promise<any> {
    const config = createAuthConfig();
    const response = await axios.post(`${API_URL}/products/order/reset`, { section }, config);
    return response.data;
  }

  // Occasion management APIs
  async getOccasions(homepageOnly = false): Promise<OccasionData[]> {
    const response = await axios.get<OccasionData[]>(`${API_URL}/occasions`, {
      params: homepageOnly ? { homepage: 'true' } : {}
    });
    return response.data;
  }

  async getAdminOccasions(): Promise<OccasionData[]> {
    const config = createAuthConfig();
    const response = await axios.get<OccasionData[]>(`${API_URL}/occasions/admin`, config);
    return response.data;
  }

  async createOccasion(occasionData: Partial<OccasionData>): Promise<OccasionData> {
    const config = createAuthConfig();
    const response = await axios.post<OccasionData>(`${API_URL}/occasions`, occasionData, config);
    return response.data;
  }

  async updateOccasion(id: string, occasionData: Partial<OccasionData>): Promise<OccasionData> {
    const config = createAuthConfig();
    const response = await axios.put<OccasionData>(`${API_URL}/occasions/${id}`, occasionData, config);
    return response.data;
  }

  async deleteOccasion(id: string): Promise<{ message: string }> {
    const config = createAuthConfig();
    const response = await axios.delete<{ message: string }>(`${API_URL}/occasions/${id}`, config);
    return response.data;
  }

  async getProductsByOccasion(slug: string): Promise<{ occasion: OccasionData, products: ProductData[], total: number }> {
    const response = await axios.get<{ occasion: OccasionData, products: ProductData[], total: number }>(
      `${API_URL}/products/by-occasion/${slug}`
    );
    return response.data;
  }

  // Enterprise Catalog Services
  async getOverviewStats(): Promise<OverviewStats> {
    const config = createAuthConfig();
    const response = await axios.get<OverviewStats>(`${API_URL}/products/admin/overview-stats`, config);
    return response.data;
  }

  async getProductsByCatalogType(type: string): Promise<{ products: ProductData[]; total: number }> {
    const config = createAuthConfig();
    const response = await axios.get<{ products: ProductData[]; total: number }>(`${API_URL}/products/type/${type}`, config);
    return response.data;
  }

  async executeBulkAction(action: string, productIds: string[], payload?: any): Promise<any> {
    const config = createAuthConfig();
    const response = await axios.post(`${API_URL}/products/admin/bulk-action`, { action, productIds, payload }, config);
    return response.data;
  }

  async restoreProductVersion(productId: string, versionIndex: number): Promise<any> {
    const config = createAuthConfig();
    const response = await axios.post(`${API_URL}/products/${productId}/restore-version`, { versionIndex }, config);
    return response.data;
  }

  async getAdminProducts(params?: any): Promise<{ products: ProductData[]; page?: number; pages?: number; total?: number }> {
    const config = createAuthConfig();
    const response = await axios.get<{ products: ProductData[]; page?: number; pages?: number; total?: number }>(
      `${API_URL}/products/admin/all`,
      { ...config, params }
    );
    return response.data;
  }
}

export default new ProductService();

// Get all products with pagination and filtering
export const getProducts = async (page = 1, category?: string) => {
  const response = await axios.get<{ products: ProductData[], page: number, pages: number }>(`${API_URL}/products`, {
    params: {
      page,
      category,
    },
  });
  return response.data;
};

// Get top rated products
export const getTopProducts = async () => {
  const response = await axios.get<ProductData[]>(`${API_URL}/products/top`);
  return response.data;
};
