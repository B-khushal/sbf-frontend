import axios from 'axios';
import { API_URL } from '@/config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

export interface DashboardOverviewResponse {
  success: boolean;
  timeframe: string;
  range: { start: string; end: string };
  kpis: {
    totalVisitors: number;
    uniqueVisitors: number;
    productViews: number;
    engagedVisitors: number;
    addToCart: number;
    checkoutStarted: number;
    purchases: number;
    conversionRate: string;
    revenue: number;
    aov: number;
    cartAbandonment: string;
    returningVisitors: number;
    liveNow: number;
  };
  funnel: Array<{ stage: string; count: number; dropOffRate: string }>;
  trafficSources: Array<{ source: string; sessions: number; percentage: number }>;
  dailyTrend: Array<{ date: string; revenue: number; orders: number; visitors: number }>;
  topProducts: Array<{ productId: string; title: string; views: number; cartAdds: number; price: number }>;
  topSearches: Array<{ query: string; searches: number; uniqueSearchers: number }>;
  topCampaigns: Array<{ id: string; name: string; platform: string; spend: number; revenue: number; clicks: number; sessions: number; purchases: number }>;
  opportunities: Array<{ id: string; type: string; title: string; description: string; metric: string; impact: string }>;
}

export interface LiveVisitor {
  sessionId: string;
  visitorId: string;
  displayName: string;
  device: string;
  source: string;
  campaign: string;
  currentPage: string;
  activity: string;
  duration: string;
  lastActiveAt: string;
  status: 'Active' | 'Idle' | 'Left';
  interestScore: number;
  interestLevel: string;
}

export const marketingService = {
  // 1. Dashboard
  getDashboardOverview: async (params: { timeframe?: string; startDate?: string; endDate?: string }) => {
    const res = await axios.get<DashboardOverviewResponse>(`${API_URL}/marketing/dashboard`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  // 2. Live Visitors
  getLiveVisitors: async () => {
    const res = await axios.get<{ success: boolean; activeCount: number; idleCount: number; visitors: LiveVisitor[] }>(
      `${API_URL}/marketing/live-visitors`,
      getAuthHeaders()
    );
    return res.data;
  },

  // 3. Customers & Journeys
  getCustomers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await axios.get(`${API_URL}/marketing/customers`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  getCustomerProfile: async (id: string) => {
    const res = await axios.get(`${API_URL}/marketing/customers/${id}`, getAuthHeaders());
    return res.data;
  },

  getCustomerJourney: async (id: string) => {
    const res = await axios.get(`${API_URL}/marketing/journeys/${id}`, getAuthHeaders());
    return res.data;
  },

  // 4. Conversion Funnel
  getConversionFunnel: async (params?: { timeframe?: string }) => {
    const res = await axios.get(`${API_URL}/marketing/funnel`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  // 5. Product & Occasion Analytics
  getProductAnalytics: async (params?: { timeframe?: string }) => {
    const res = await axios.get(`${API_URL}/marketing/products`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  getOccasionAnalytics: async (params?: { timeframe?: string }) => {
    const res = await axios.get(`${API_URL}/marketing/occasions`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  // 6. Cart Intelligence
  getCartIntelligence: async () => {
    const res = await axios.get(`${API_URL}/marketing/cart-intelligence`, getAuthHeaders());
    return res.data;
  },

  // 7. Search Intelligence
  getSearchIntelligence: async (params?: { timeframe?: string }) => {
    const res = await axios.get(`${API_URL}/marketing/search`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  // 8. Campaigns
  getCampaigns: async () => {
    const res = await axios.get(`${API_URL}/marketing/campaigns`, getAuthHeaders());
    return res.data;
  },

  createCampaign: async (data: any) => {
    const res = await axios.post(`${API_URL}/marketing/campaigns`, data, getAuthHeaders());
    return res.data;
  },

  // 9. Attribution
  getAttribution: async (model: string = 'Last Touch') => {
    const res = await axios.get(`${API_URL}/marketing/attribution`, {
      ...getAuthHeaders(),
      params: { model }
    });
    return res.data;
  },

  // 10. Audience Segments
  getSegments: async () => {
    const res = await axios.get(`${API_URL}/marketing/segments`, getAuthHeaders());
    return res.data;
  },

  createSegment: async (data: any) => {
    const res = await axios.post(`${API_URL}/marketing/segments`, data, getAuthHeaders());
    return res.data;
  },

  // 11. Cohorts & Retention
  getCohorts: async () => {
    const res = await axios.get(`${API_URL}/marketing/cohorts`, getAuthHeaders());
    return res.data;
  },

  getRetention: async () => {
    const res = await axios.get(`${API_URL}/marketing/retention`, getAuthHeaders());
    return res.data;
  },

  // 12. Opportunities
  getOpportunities: async () => {
    const res = await axios.get(`${API_URL}/marketing/opportunities`, getAuthHeaders());
    return res.data;
  },

  // 13. Events Feed
  getEventsFeed: async (params?: { limit?: number; category?: string }) => {
    const res = await axios.get(`${API_URL}/marketing/events-feed`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  // 14. Settings & Activity Logs
  getSettings: async () => {
    const res = await axios.get(`${API_URL}/marketing/settings`, getAuthHeaders());
    return res.data;
  },

  updateSettings: async (data: any) => {
    const res = await axios.put(`${API_URL}/marketing/settings`, data, getAuthHeaders());
    return res.data;
  },

  getActivityLogs: async () => {
    const res = await axios.get(`${API_URL}/marketing/activity-logs`, getAuthHeaders());
    return res.data;
  },

  // 15. Reports Export
  exportReportUrl: (reportType: string, timeframe: string = '30d') => {
    const token = localStorage.getItem('token') || '';
    return `${API_URL}/marketing/reports/export?reportType=${reportType}&timeframe=${timeframe}&token=${token}`;
  }
};
