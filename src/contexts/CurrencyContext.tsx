import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rate: number;
  setRate: (rate: number) => void;
  formatPrice: (amount: number | undefined) => string;
  convertPrice: (amount: number | undefined) => number;
  getExchangeRateDisplay: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export type CurrencyCode = 'INR' | 'USD' | 'AED' | 'EUR' | 'GBP';

// Updated exchange rates
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.01199, // 1 INR ≈ 0.01199 USD (1 USD ≈ ₹83.40)
  AED: 0.04405, // 1 INR ≈ 0.04405 AED (1 AED ≈ ₹22.70)
  EUR: 0.011,
  GBP: 0.0096
};

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  AED: 'en-AE',
  EUR: 'en-US',
  GBP: 'en-GB'
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  // Initialize currency from localStorage or default to INR
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && savedCurrency in EXCHANGE_RATES) {
      return savedCurrency as CurrencyCode;
    }
    return 'INR';
  });
  const [rate, setRate] = useState(EXCHANGE_RATES[currency]);

  // Update rate when currency changes on initialization
  useEffect(() => {
    setRate(EXCHANGE_RATES[currency]);
  }, [currency]);

  // Update currency rate when currency changes
  const handleSetCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    setRate(EXCHANGE_RATES[newCurrency]);
    // Persist currency selection to localStorage
    localStorage.setItem('selectedCurrency', newCurrency);
  }, []);

  // Convert price from INR to the selected currency
  const convertPrice = useCallback((amount: number | undefined): number => {
    if (amount === undefined || amount === null) return 0;
    
    // If we're already in INR, no conversion needed
    if (currency === 'INR') return amount;
    
    // Convert from INR to USD or other currency
    const rate = EXCHANGE_RATES[currency];
    return amount * rate;
  }, [currency]);

  // Format the price according to the selected currency
  const formatPrice = useCallback((amount: number | undefined): string => {
    if (amount === undefined || amount === null) {
      return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(0);
    }
    
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }, [currency]);

  // Display exchange rate in a user-friendly way
  const getExchangeRateDisplay = useCallback(() => {
    if (currency === 'INR') return '1 USD ≈ ₹83.40 | 1 AED ≈ ₹22.70';
    if (currency === 'USD') return '1 INR ≈ $0.01199';
    if (currency === 'AED') return '1 INR ≈ AED 0.04405';
    if (currency === 'EUR') return '1 INR ≈ €0.0110';
    return '1 INR ≈ £0.0096';
  }, [currency]);

  const value = {
    currency,
    rate,
    setCurrency: handleSetCurrency,
    setRate,
    formatPrice,
    convertPrice,
    getExchangeRateDisplay,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
