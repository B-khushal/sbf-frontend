import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { ValentineSettings, ValentineOfferItem } from '../types/valentine';

interface ValentineContextType {
  isValentineEnabled: boolean;
  settings: ValentineSettings | null;
  offers: ValentineOfferItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ValentineContext = createContext<ValentineContextType | undefined>(undefined);

export const useValentine = () => {
  const context = useContext(ValentineContext);
  if (context === undefined) {
    throw new Error('useValentine must be used within a ValentineProvider');
  }
  return context;
};

interface ValentineProviderProps {
  children: ReactNode;
}

export const ValentineProvider = ({ children }: ValentineProviderProps) => {
  const [isValentineEnabled, setIsValentineEnabled] = useState(false);
  const [settings, setSettings] = useState<ValentineSettings | null>(null);
  const [offers, setOffers] = useState<ValentineOfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchValentineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First check status (lightweight)
      const statusRes = await api.get('/valentine/status');
      const isEnabled = statusRes.data?.enabled || false;
      setIsValentineEnabled(isEnabled);

      // Fetch settings and (if enabled) offers in parallel
      const [settingsRes, offersRes] = await Promise.allSettled([
        api.get('/valentine/settings'),
        isEnabled ? api.get('/valentine/offers') : Promise.resolve({ data: { offers: [] } })
      ]);

      if (settingsRes.status === 'fulfilled') {
        setSettings(settingsRes.value.data);
      }

      if (isEnabled && offersRes.status === 'fulfilled') {
        setOffers(offersRes.value.data?.offers || []);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.warn('Failed to load Valentine settings:', err);
      setError('Failed to load Valentine data');
      setIsValentineEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchValentineData();
  }, [fetchValentineData]);

  const contextValue = useMemo((): ValentineContextType => ({
    isValentineEnabled,
    settings,
    offers,
    loading,
    error,
    refetch: fetchValentineData
  }), [isValentineEnabled, settings, offers, loading, error, fetchValentineData]);

  return (
    <ValentineContext.Provider value={contextValue}>
      {children}
    </ValentineContext.Provider>
  );
};

export default ValentineProvider;
