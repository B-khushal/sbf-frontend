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
    activeCartPipelineValue?: number;
    activeCartPipelineCount?: number;
    totalPipelineValue?: number;
  };
  funnel: Array<{ stage: string; count: number; dropOffRate: string }>;
  trafficSources: Array<{ source: string; sessions: number; percentage: number }>;
  dailyTrend: Array<{ date: string; revenue: number; orders: number; visitors: number }>;
  topProducts: Array<{ productId: string; title: string; views: number; cartAdds: number; price: number }>;
  topSearches: Array<{ query: string; searches: number; uniqueSearchers: number }>;
  topCampaigns: Array<{ id: string; name: string; platform: string; spend: number; revenue: number; clicks: number; sessions: number; purchases: number }>;
  opportunities: Array<{ id: string; type: string; title: string; description: string; metric: string; impact: string }>;
}

export interface LiveVisitorCartItem {
  productId?: string;
  title: string;
  price: number;
  quantity: number;
}

export interface LiveVisitorCart {
  hasCart: boolean;
  totalValue: number;
  itemCount: number;
  checkoutStarted: boolean;
  items: LiveVisitorCartItem[];
}

export interface LiveVisitorLatestEvent {
  eventType?: string;
  productTitle?: string;
  productPrice?: number;
  path?: string;
  timestamp?: string;
}

export interface LiveVisitor {
  sessionId: string;
  visitorId: string;
  userId?: string | null;
  displayName: string;
  shortId?: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  registeredUserId?: string | null;
  isRegisteredCustomer?: boolean;
  totalOrders?: number;
  totalCustomerRevenue?: number;
  device: string;
  browser?: string;
  os?: string;
  city?: string;
  region?: string;
  country?: string;
  source: string;
  medium?: string;
  campaign: string;
  utmSource?: string;
  utmMedium?: string;
  utmContent?: string;
  currentPage: string;
  displayPage?: string;
  landingPage?: string;
  resolvedProduct?: { id: string; name: string; price: number; image?: string | null };
  activity: string;
  duration: string;
  durationSeconds?: number;
  startedAt?: string;
  lastActiveAt: string;
  lastActiveAgo?: string;
  pageViewsCount?: number;
  cartAddsCount?: number;
  checkoutsCount?: number;
  purchasesCount?: number;
  status: 'Active' | 'Idle' | 'Left';
  interestScore: number;
  interestLevel: string;
  cart?: LiveVisitorCart;
  latestEvent?: LiveVisitorLatestEvent;
}

export interface LiveActivityFeedItem {
  id: string;
  sessionId: string;
  visitorId: string;
  eventType: string;
  productTitle?: string;
  productPrice?: number;
  path?: string;
  searchQuery?: string;
  cartValue?: number;
  timestamp: string;
  timeAgo?: string;
  actorName: string;
  city?: string;
  device?: string;
}

export interface LiveVisitorsSummary {
  activeCount: number;
  idleCount: number;
  totalTracked: number;
  cartCount: number;
  checkoutCount: number;
  totalCartValue: number;
  registeredCount: number;
  guestCount: number;
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  sourceBreakdown: Array<{ source: string; count: number }>;
  topPages: Array<{ path: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
  topSource: string;
  topPage: string;
}

export interface LiveVisitorsResponse {
  success: boolean;
  timeframe: string;
  activeCount: number;
  idleCount: number;
  summary: LiveVisitorsSummary;
  visitors: LiveVisitor[];
  recentActivityFeed: LiveActivityFeedItem[];
}

export interface ReportColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'badge';
}

export interface ReportResponse {
  success: boolean;
  reportType: string;
  reportTitle: string;
  reportDescription: string;
  category: string;
  timeframe: string;
  range: { start: string; end: string };
  columns: ReportColumn[];
  summary: Record<string, any>;
  rows: Array<Record<string, any>>;
  chartData: Array<Record<string, any>>;
  totalRows: number;
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
  getLiveVisitors: async (params?: {
    timeframe?: string;
    stage?: string;
    device?: string;
    source?: string;
    customerType?: string;
    search?: string;
    limit?: number;
  }) => {
    const res = await axios.get<LiveVisitorsResponse>(
      `${API_URL}/marketing/live-visitors`,
      {
        ...getAuthHeaders(),
        params
      }
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

  // 15. Reports & Analytics Engine
  getReportData: async (params: {
    reportType: string;
    timeframe?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ReportResponse> => {
    const res = await axios.get<ReportResponse>(`${API_URL}/marketing/reports/data`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  downloadReport: async (params: {
    reportType: string;
    timeframe?: string;
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'json';
  }) => {
    const format = params.format || 'csv';
    const res = await axios.get(`${API_URL}/marketing/reports/export`, {
      ...getAuthHeaders(),
      params,
      responseType: 'blob'
    });

    const disposition = res.headers['content-disposition'];
    let filename = `sbf_${params.reportType}_${params.timeframe || 'period'}.${format}`;
    if (disposition) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blob = new Blob([res.data], {
      type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportReportUrl: (reportType: string, timeframe: string = '30d', format: string = 'csv', startDate?: string, endDate?: string) => {
    const token = localStorage.getItem('token') || '';
    let url = `${API_URL}/marketing/reports/export?reportType=${reportType}&timeframe=${timeframe}&format=${format}&token=${token}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    return url;
  }
};
