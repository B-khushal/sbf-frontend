import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import seasonalCampaignService from '../services/seasonalCampaignService';
import { SeasonalCampaign } from '../types/seasonalCampaign';

interface SeasonalCampaignContextType {
  activeCampaigns: SeasonalCampaign[];
  campaigns: SeasonalCampaign[]; // Admin list
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchAdmin: () => Promise<void>;
  getCampaignBySlug: (slug: string) => SeasonalCampaign | undefined;
}

const SeasonalCampaignContext = createContext<SeasonalCampaignContextType | undefined>(undefined);

export const useSeasonalCampaign = () => {
  const context = useContext(SeasonalCampaignContext);
  if (context === undefined) {
    throw new Error('useSeasonalCampaign must be used within a SeasonalCampaignProvider');
  }
  return context;
};

interface SeasonalCampaignProviderProps {
  children: React.ReactNode;
}

export const SeasonalCampaignProvider = ({ children }: SeasonalCampaignProviderProps) => {
  const [activeCampaigns, setActiveCampaigns] = useState<SeasonalCampaign[]>([]);
  const [campaigns, setCampaigns] = useState<SeasonalCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await seasonalCampaignService.getActiveCampaignsStatus();
      if (res.success) {
        setActiveCampaigns(res.campaigns);
      }
    } catch (err) {
      console.warn('Failed to load active seasonal campaigns:', err);
      setError('Failed to load seasonal campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllCampaignsAdmin = useCallback(async () => {
    try {
      // Check if user has token and is admin before calling
      const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
      const user = localStorage.getItem('user');
      const role = localStorage.getItem('role');
      
      let isAdmin = role === 'admin';
      if (!isAdmin && userData) {
        try {
          isAdmin = JSON.parse(userData).role === 'admin';
        } catch (_) {}
      }
      if (!isAdmin && user) {
        try {
          isAdmin = JSON.parse(user).role === 'admin';
        } catch (_) {}
      }

      if (!isAdmin) return;

      const res = await seasonalCampaignService.adminGetAllCampaigns();
      if (res.success) {
        setCampaigns(res.campaigns);
      }
    } catch (err) {
      console.warn('Failed to load all seasonal campaigns (admin):', err);
    }
  }, []);

  useEffect(() => {
    fetchActiveCampaigns();
    fetchAllCampaignsAdmin();
  }, [fetchActiveCampaigns, fetchAllCampaignsAdmin]);

  const getCampaignBySlug = useCallback((slug: string) => {
    return activeCampaigns.find(c => c.slug === slug);
  }, [activeCampaigns]);

  const contextValue = useMemo((): SeasonalCampaignContextType => ({
    activeCampaigns,
    campaigns,
    loading,
    error,
    refetch: fetchActiveCampaigns,
    refetchAdmin: fetchAllCampaignsAdmin,
    getCampaignBySlug
  }), [activeCampaigns, campaigns, loading, error, fetchActiveCampaigns, fetchAllCampaignsAdmin, getCampaignBySlug]);

  return (
    <SeasonalCampaignContext.Provider value={contextValue}>
      {children}
    </SeasonalCampaignContext.Provider>
  );
};
