import api from './api';

export interface AddonProduct {
  _id: string;
  name: string;
  title?: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  galleryImages: string[];
  images?: string[];
  price: number;
  discountedPrice: number;
  stock: number;
  SKU: string;
  status: 'active' | 'inactive';
  tags: string[];
  badge: '' | 'Bestseller' | 'Most Gifted' | 'New' | 'Limited';
  linkedCategories: string[];
  linkedOccasions: string[];
  linkedProducts: string[];
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getAddons = async (params?: { category?: string; status?: string; search?: string }): Promise<{ success: boolean; addons: AddonProduct[] }> => {
  const response = await api.get('/addons', { params });
  return response.data;
};

export const getRecommendedAddons = async (items: any[]): Promise<{ success: boolean; addons: AddonProduct[] }> => {
  const response = await api.post('/addons/recommendations', { items });
  return response.data;
};

export const createAddon = async (addonData: Partial<AddonProduct>): Promise<{ success: boolean; addon: AddonProduct; message: string }> => {
  const response = await api.post('/addons', addonData);
  return response.data;
};

export const updateAddon = async (id: string, addonData: Partial<AddonProduct>): Promise<{ success: boolean; addon: AddonProduct; message: string }> => {
  const response = await api.put(`/addons/${id}`, addonData);
  return response.data;
};

export const deleteAddon = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/addons/${id}`);
  return response.data;
};
