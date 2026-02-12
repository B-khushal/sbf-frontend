import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  formatPrice: (amount: number | undefined) => string;
  convertPrice: (amount: number | undefined) => number;
  getExchangeRateDisplay: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Updated exchange rates
const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.01162, // 1 INR = 0.01162 USD (or $1 = ₹86.04)
  EUR: 0.011,
  GBP: 0.0096
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  // Initialize currency from localStorage or default to INR
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    return savedCurrency || 'INR';
  });
  const [rate, setRate] = useState(EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES]);

  // Update rate when currency changes on initialization
  useEffect(() => {
    setRate(EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES]);
  }, [currency]);

  // Update currency rate when currency changes
  const handleSetCurrency = useCallback((newCurrency: string) => {
    setCurrency(newCurrency);
    setRate(EXCHANGE_RATES[newCurrency as keyof typeof EXCHANGE_RATES]);
    // Persist currency selection to localStorage
    localStorage.setItem('selectedCurrency', newCurrency);
  }, []);

  // Convert price from INR to the selected currency
  const convertPrice = useCallback((amount: number | undefined): number => {
    if (amount === undefined || amount === null) return 0;
    
    // If we're already in INR, no conversion needed
    if (currency === 'INR') return amount;
    
    // Convert from INR to USD or other currency
    const rate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
    return amount * rate;
  }, [currency]);

  // Format the price according to the selected currency
  const formatPrice = useCallback((amount: number | undefined): string => {
    if (amount === undefined || amount === null) {
      return currency === 'INR' ? '₹0.00' : 
             currency === 'USD' ? '$0.00' :
             currency === 'EUR' ? '€0.00' : '£0.00';
    }
    
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }, [currency]);

  // Display exchange rate in a user-friendly way
  const getExchangeRateDisplay = useCallback(() => {
    if (currency === 'INR') {
      return `1 USD ≈ ₹86.04`;
    } else {
      return `1 INR ≈ $0.0116`;
    }
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
