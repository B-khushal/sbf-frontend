import api from './api';
import { SeasonalCampaign } from '../types/seasonalCampaign';
import { ProductData } from './productService';

class SeasonalCampaignService {
  // GET /api/seasonal-campaigns/status - Fetch active campaigns status
  async getActiveCampaignsStatus(): Promise<{ success: boolean; campaigns: SeasonalCampaign[] }> {
    const response = await api.get('/seasonal-campaigns/status');
    return response.data;
  }

  // GET /api/seasonal-campaigns/settings/:slug - Fetch campaign settings and products
  async getCampaignSettings(slug: string): Promise<{ success: boolean; campaign: SeasonalCampaign; products: ProductData[] }> {
    const response = await api.get(`/seasonal-campaigns/settings/${slug}`);
    return response.data;
  }

  // POST /api/seasonal-campaigns/view/:id - Track traffic/pageView
  async trackCampaignView(id: string): Promise<{ success: boolean; pageViews: number }> {
    const response = await api.post(`/seasonal-campaigns/view/${id}`);
    return response.data;
  }

  // GET /api/seasonal-campaigns/admin/all - Fetch all campaigns with full statistics
  async adminGetAllCampaigns(): Promise<{ success: boolean; campaigns: SeasonalCampaign[] }> {
    const response = await api.get('/seasonal-campaigns/admin/all');
    return response.data;
  }

  // POST /api/seasonal-campaigns/admin - Create a new occasion
  async adminCreateCampaign(campaignData: Partial<SeasonalCampaign>): Promise<{ success: boolean; campaign: SeasonalCampaign; message: string }> {
    const response = await api.post('/seasonal-campaigns/admin', campaignData);
    return response.data;
  }

  // PUT /api/seasonal-campaigns/admin/:id - Update campaign settings
  async adminUpdateCampaign(id: string, campaignData: Partial<SeasonalCampaign>): Promise<{ success: boolean; campaign: SeasonalCampaign; message: string }> {
    const response = await api.put(`/seasonal-campaigns/admin/${id}`, campaignData);
    return response.data;
  }

  // DELETE /api/seasonal-campaigns/admin/:id - Delete an occasion
  async adminDeleteCampaign(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/seasonal-campaigns/admin/${id}`);
    return response.data;
  }

  // GET /api/seasonal-campaigns/admin/:id/analytics - Fetch analytics dashboard data
  async adminGetCampaignAnalytics(id: string): Promise<{
    success: boolean;
    summary: {
      totalOrders: number;
      totalRevenue: number;
      completedOrders: number;
      conversionRate: number;
      pageViews: number;
      averageOrderValue: number;
    };
    topProducts: Array<{
      _id: string;
      title: string;
      price: number;
      unitsSold: number;
      revenue: number;
    }>;
    offersUsage: Array<{
      title: string;
      code: string;
      type: string;
      usageCount: number;
    }>;
  }> {
    const response = await api.get(`/seasonal-campaigns/admin/${id}/analytics`);
    return response.data;
  }
}

export default new SeasonalCampaignService();
