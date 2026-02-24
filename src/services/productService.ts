import axios from 'axios';
import { API_URL } from '@/config';

export interface AddonOption {
  name: string;
  price: number;
  type: 'flower' | 'chocolate';
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
}

export interface PriceVariant {
  label: string;
  price: number;
  stock: number;
}

export interface ProductData {
  _id?: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  categories: string[];
  countInStock: number;
  images: string[];
  details: string[];
  careInstructions: string[];
  isNewArrival: boolean;
  isFeatured: boolean;
  hidden: boolean;
  isCustomizable: boolean;
  hasPriceVariants: boolean;
  priceVariants: PriceVariant[];
  customizationOptions: CustomizationOptions;
  comboItems: ComboItem[];
  comboName: string;
  comboDescription: string;
  comboSubcategory: string;
}

// Define backend product type to match backend schema
interface BackendProductData {
  _id?: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  categories?: string[];
  brand?: string;
  countInStock: number;
  images: string[];
  details?: string[];
  careInstructions?: string[];
  isNew?: boolean; // Backend uses isNew
  isNewArrival?: boolean; // Backward compatibility for older backend variants
  isFeatured?: boolean;
  hidden?: boolean;
  isCustomizable?: boolean;
  hasPriceVariants?: boolean;
  priceVariants?: PriceVariant[];
  customizationOptions?: CustomizationOptions;
  // Combo-specific fields
  comboItems?: ComboItem[];
  comboName?: string;
  comboDescription?: string;
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
  cleanData.isCustomizable = Boolean(productData.isCustomizable);
  cleanData.hasPriceVariants = Boolean(productData.hasPriceVariants);
  
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
      previewImage: productData.customizationOptions.previewImage || ""
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
  
  return cleanData;
};

// Helper function to map backend data to frontend model
const mapBackendToFrontend = (data: BackendProductData): ProductData => {
  // Create a copy to avoid modifying the original
  const mappedData: Partial<ProductData> = { ...data };

  // Map either backend field (isNew or isNewArrival) to frontend isNewArrival
  if ('isNew' in data || 'isNewArrival' in data) {
    mappedData.isNewArrival = Boolean(
      typeof data.isNew === 'boolean' ? data.isNew : data.isNewArrival
    );
  }

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

  // ✅ Handle details properly (flatten nested arrays from backend)
  if (Array.isArray(data.details)) {
    // Backend sends details as array of arrays, flatten it for frontend
    mappedData.details = data.details.flat().filter(detail => 
      detail && typeof detail === 'string' && detail.trim().length > 0
    );
  } else if (typeof data.details === 'string') {
    // Split by comma or any separator if it's a string
    mappedData.details = data.details.split(/[,•]/).map(str => str.trim()).filter(str => str.length > 0);
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
      previewImage: data.customizationOptions.previewImage || ""
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
      previewImage: ""
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
