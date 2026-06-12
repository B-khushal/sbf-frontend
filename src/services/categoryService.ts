import api from './api';

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryUrl: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  parentId?: string | null;
  productCount?: number;
  showInShop?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const categoryService = {
  getCategories: async (params?: { search?: string; status?: 'active' | 'inactive'; parentId?: string | 'null' }) => {
    const response = await api.get<Category[]>('/categories', { params });
    return response.data;
  },

  getCategoryById: async (id: string) => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData: Partial<Category>) => {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string, reassignTo?: string) => {
    const response = await api.delete(`/categories/${id}`, {
      params: { reassignTo }
    });
    return response.data;
  },

  bulkDelete: async (ids: string[], reassignTo?: string) => {
    const response = await api.post('/categories/bulk-delete', { ids, reassignTo });
    return response.data;
  },

  bulkUpdateStatus: async (ids: string[], status: 'active' | 'inactive') => {
    const response = await api.post('/categories/bulk-status-update', { ids, status });
    return response.data;
  }
};

export default categoryService;
