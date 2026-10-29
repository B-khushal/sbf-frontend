import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import seasonalCampaignService from '../services/seasonalCampaignService';
import { SeasonalCampaign } from '../types/seasonalCampaign';

export const KNOWN_SEASONAL_SLUGS = [
  'new-year',
  'diwali',
  'rakhi',
  'friendship-day',
  'fathers-day',
  'mothers-day'
];

interface SeasonalCampaignContextType {
  activeCampaigns: SeasonalCampaign[];
  campaigns: SeasonalCampaign[]; // Admin list
  allSlugs: string[];
  allCampaignSlugs: Array<{ id: string; name: string; slug: string; enabled: boolean }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchAdmin: () => Promise<void>;
  getCampaignBySlug: (slug: string) => SeasonalCampaign | undefined;
  isSeasonalCampaignSlug: (slug?: string | null) => boolean;
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
  const [allSlugs, setAllSlugs] = useState<string[]>(KNOWN_SEASONAL_SLUGS);
  const [allCampaignSlugs, setAllCampaignSlugs] = useState<Array<{ id: string; name: string; slug: string; enabled: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await seasonalCampaignService.getActiveCampaignsStatus();
      if (res.success) {
        setActiveCampaigns(res.campaigns);
        if (Array.isArray(res.allSlugs) && res.allSlugs.length > 0) {
          // Merge with known slugs to ensure nothing is missed
          const merged = Array.from(new Set([...KNOWN_SEASONAL_SLUGS, ...res.allSlugs.map(s => s.toLowerCase())]));
          setAllSlugs(merged);
        }
        if (Array.isArray(res.allCampaignSlugs)) {
          setAllCampaignSlugs(res.allCampaignSlugs);
        }
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
        const adminSlugs = res.campaigns.map(c => c.slug.toLowerCase());
        setAllSlugs(prev => Array.from(new Set([...prev, ...adminSlugs])));
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
    const normalized = slug.trim().toLowerCase();
    return activeCampaigns.find(c => c.slug.toLowerCase() === normalized) ||
           campaigns.find(c => c.slug.toLowerCase() === normalized);
  }, [activeCampaigns, campaigns]);

  const isSeasonalCampaignSlug = useCallback((rawSlug?: string | null): boolean => {
    if (!rawSlug) return false;
    const cleanSlug = rawSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    const candidate = cleanSlug.startsWith('occasions/') ? cleanSlug.substring('occasions/'.length) : cleanSlug;
    
    // Check known default set first
    if (KNOWN_SEASONAL_SLUGS.includes(candidate)) return true;
    // Check dynamic slugs loaded from backend
    if (allSlugs.includes(candidate)) return true;
    if (activeCampaigns.some(c => c.slug.toLowerCase() === candidate)) return true;
    if (campaigns.some(c => c.slug.toLowerCase() === candidate)) return true;
    return false;
  }, [allSlugs, activeCampaigns, campaigns]);

  const contextValue = useMemo((): SeasonalCampaignContextType => ({
    activeCampaigns,
    campaigns,
    allSlugs,
    allCampaignSlugs,
    loading,
    error,
    refetch: fetchActiveCampaigns,
    refetchAdmin: fetchAllCampaignsAdmin,
    getCampaignBySlug,
    isSeasonalCampaignSlug
  }), [activeCampaigns, campaigns, allSlugs, allCampaignSlugs, loading, error, fetchActiveCampaigns, fetchAllCampaignsAdmin, getCampaignBySlug, isSeasonalCampaignSlug]);

  return (
    <SeasonalCampaignContext.Provider value={contextValue}>
      {children}
    </SeasonalCampaignContext.Provider>
  );
};
