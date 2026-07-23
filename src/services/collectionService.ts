import axios from 'axios';
import { API_URL } from '@/config';
import { ProductData } from './productService';

export interface CollectionData {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  icon?: string;
  displayPriority?: number;
  visibility?: 'published' | 'hidden' | 'scheduled';
  scheduleDate?: string;
  products?: ProductData[] | string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getAuthConfig = () => {
  const userInfo = localStorage.getItem('userInfo');
  const token = userInfo ? JSON.parse(userInfo).token : null;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

class CollectionService {
  async getCollections(): Promise<CollectionData[]> {
    const response = await axios.get<{ collections: CollectionData[] }>(`${API_URL}/collections`);
    return response.data.collections || [];
  }

  async getCollectionByIdOrSlug(idOrSlug: string): Promise<CollectionData> {
    const response = await axios.get<{ collection: CollectionData }>(`${API_URL}/collections/${idOrSlug}`);
    return response.data.collection;
  }

  async createCollection(collectionData: Partial<CollectionData>): Promise<CollectionData> {
    const response = await axios.post<{ collection: CollectionData }>(
      `${API_URL}/collections`,
      collectionData,
      getAuthConfig()
    );
    return response.data.collection;
  }

  async updateCollection(id: string, collectionData: Partial<CollectionData>): Promise<CollectionData> {
    const response = await axios.put<{ collection: CollectionData }>(
      `${API_URL}/collections/${id}`,
      collectionData,
      getAuthConfig()
    );
    return response.data.collection;
  }

  async deleteCollection(id: string): Promise<{ message: string }> {
    const response = await axios.delete<{ message: string }>(`${API_URL}/collections/${id}`, getAuthConfig());
    return response.data;
  }
}

export default new CollectionService();
