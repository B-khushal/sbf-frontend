import api from './api';

export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    faqs: number;
  };
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  slug: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    displayOrder?: number;
  };
  keywords: string[];
  isPublished: boolean;
  isFeatured: boolean;
  displayLocations: string[];
  displayOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetFaqsParams {
  category?: string;
  location?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}

export interface AdminFaqParams {
  search?: string;
  categoryId?: string;
  status?: 'all' | 'published' | 'draft';
  location?: string;
  page?: number;
  limit?: number;
}

export interface AdminFaqResponse {
  success: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: FaqItem[];
  categories: FaqCategory[];
}

export const faqService = {
  // Public APIs
  async getFaqs(params?: GetFaqsParams): Promise<FaqItem[]> {
    const res = await api.get('/faqs', { params });
    return res.data?.data || [];
  },

  async getCategories(includeInactive = false): Promise<FaqCategory[]> {
    const res = await api.get('/faqs/categories', {
      params: { includeInactive: includeInactive ? 'true' : 'false' }
    });
    return res.data?.data || [];
  },

  async getFaqBySlug(slug: string): Promise<FaqItem | null> {
    const res = await api.get(`/faqs/by-slug/${slug}`);
    return res.data?.data || null;
  },

  async voteHelpful(id: string, vote: 'helpful' | 'not_helpful'): Promise<{ helpfulCount: number; notHelpfulCount: number }> {
    const res = await api.post(`/faqs/${id}/vote`, { vote });
    return res.data?.data || { helpfulCount: 0, notHelpfulCount: 0 };
  },

  // Admin APIs (Protected)
  async getAdminFaqs(params?: AdminFaqParams): Promise<AdminFaqResponse> {
    const res = await api.get('/faqs/admin/all', { params });
    return res.data;
  },

  async createFaq(data: Partial<FaqItem>): Promise<FaqItem> {
    const res = await api.post('/faqs/admin', data);
    return res.data?.data;
  },

  async updateFaq(id: string, data: Partial<FaqItem>): Promise<FaqItem> {
    const res = await api.put(`/faqs/admin/${id}`, data);
    return res.data?.data;
  },

  async deleteFaq(id: string): Promise<void> {
    await api.delete(`/faqs/admin/${id}`);
  },

  async togglePublish(id: string): Promise<FaqItem> {
    const res = await api.patch(`/faqs/admin/${id}/publish`);
    return res.data?.data;
  },

  async reorderFaqs(items: Array<{ id: string; displayOrder: number }>): Promise<void> {
    await api.put('/faqs/admin/reorder', { items });
  },

  async createCategory(data: Partial<FaqCategory>): Promise<FaqCategory> {
    const res = await api.post('/faqs/admin/categories', data);
    return res.data?.data;
  },

  async updateCategory(id: string, data: Partial<FaqCategory>): Promise<FaqCategory> {
    const res = await api.put(`/faqs/admin/categories/${id}`, data);
    return res.data?.data;
  },

  async deleteCategory(id: string, force = false): Promise<void> {
    await api.delete(`/faqs/admin/categories/${id}`, {
      params: { force: force ? 'true' : 'false' }
    });
  }
};

export default faqService;
