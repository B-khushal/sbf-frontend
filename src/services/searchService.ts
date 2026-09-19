import axios from 'axios';
import { API_URL } from '@/config';
import { createAuthConfig } from './productService';
import { marketingTracker } from '@/services/marketingTracker';

export interface SearchQueryParams {
  q?: string;
  category?: string;
  flowerType?: string;
  occasion?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sameDay?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchFacets {
  flowerTypes: Record<string, number>;
  colors: Record<string, number>;
  occasions: Record<string, number>;
  categories: Record<string, number>;
  priceRange: { min: number; max: number };
}

export interface SearchResponse {
  success: boolean;
  query: string;
  correctedQuery?: string | null;
  total: number;
  page: number;
  totalPages: number;
  products: any[];
  facets: SearchFacets;
  responseTimeMs: number;
  fromCache?: boolean;
}

export interface SearchSuggestionResponse {
  query: string;
  correctedQuery?: string | null;
  categories: string[];
  suggestions: string[];
  products: Array<{
    _id: string;
    id: string;
    title: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    category: string;
    rating: number;
  }>;
}

export interface SearchAnalyticsSummary {
  totalSearches: number;
  uniqueKeywords: number;
  failedSearchesCount: number;
  totalConversions: number;
  conversionRate: number;
  totalSearchRevenue: number;
}

export interface SearchAnalyticsResponse {
  success: boolean;
  timeframe: string;
  summary: SearchAnalyticsSummary;
  topSearches: Array<{
    term: string;
    count: number;
    resultsCount: number;
    clicks: number;
    conversions: number;
    revenue: number;
    lastSearched: string;
  }>;
  failedSearches: Array<{
    term: string;
    count: number;
    lastSearched: string;
  }>;
}

export const searchService = {
  async search(params: SearchQueryParams): Promise<SearchResponse> {
    if (params?.q) {
      try {
        marketingTracker.trackSearch(params.q);
      } catch (e) {}
    }
    const response = await axios.get<SearchResponse>(`${API_URL}/search`, { params });
    return response.data;
  },

  async getSuggestions(q: string): Promise<SearchSuggestionResponse> {
    const response = await axios.get<SearchSuggestionResponse>(`${API_URL}/search/suggestions`, {
      params: { q }
    });
    return response.data;
  },

  async trackSearch(eventData: {
    query: string;
    resultsCount?: number;
    clickedProductId?: string;
    clickedProductTitle?: string;
    converted?: boolean;
    orderId?: string;
    orderTotal?: number;
  }): Promise<any> {
    try {
      const config = createAuthConfig();
      const response = await axios.post(`${API_URL}/search/track`, eventData, config);
      return response.data;
    } catch (e) {
      // Non-critical tracking fail
      return null;
    }
  },

  async getAnalytics(timeframe: 'today' | '7days' | '30days' | 'all' = '30days'): Promise<SearchAnalyticsResponse> {
    const config = createAuthConfig();
    const response = await axios.get<SearchAnalyticsResponse>(`${API_URL}/search/analytics`, {
      ...config,
      params: { timeframe }
    });
    return response.data;
  }
};

export default searchService;
