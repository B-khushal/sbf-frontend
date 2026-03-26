import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, DollarSign, ChevronDown } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';

const CurrencyConverter: React.FC<{ className?: string }> = ({ className }) => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectCurrency = (nextCurrency: 'INR' | 'USD') => {
    setCurrency(nextCurrency);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative dropdown-container ${className || ''}`}>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 h-8 md:h-8"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="md:hidden">
          <DollarSign size={16} className="text-pink-600" />
        </span>

        <span className="hidden md:flex items-center gap-1">
          <span className="font-medium">{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
          <ArrowRightLeft size={14} />
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-dropdown min-w-[190px] rounded-md border bg-white p-1 shadow-md">
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => handleSelectCurrency('INR')}
          >
            ₹ INR (Indian Rupee)
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => handleSelectCurrency('USD')}
          >
            $ USD (US Dollar)
          </button>
        </div>
      )}
    </div>
  );
};

// Also export a more detailed card version that can be used elsewhere
export const CurrencyConverterCard: React.FC = () => {
  const { currency, setCurrency, getExchangeRateDisplay } = useCurrency();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-primary" />
          Currency Converter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="w-full flex justify-between items-center"
          >
            <span>Currently viewing in: <strong>{currency === 'INR' ? '₹ INR' : '$ USD'}</strong></span>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Exchange rate: {getExchangeRateDisplay()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
