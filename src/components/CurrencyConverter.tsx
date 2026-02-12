import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, DollarSign } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const CurrencyConverter: React.FC<{ className?: string }> = ({ className }) => {
  const { currency, setCurrency, rate } = useCurrency();

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 h-8 md:h-8"
          >
            {/* Mobile view - show only DollarSign icon */}
            <span className="md:hidden">
              <DollarSign size={16} className="text-pink-600" />
            </span>
            
            {/* Desktop view - show currency text and ArrowRightLeft icon */}
            <span className="hidden md:flex items-center gap-1">
              <span className="font-medium">{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
              <ArrowRightLeft size={14} />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="z-dropdown min-w-[160px] dropdown-responsive">
          <DropdownMenuItem onClick={() => setCurrency('INR')}>
            ₹ INR (Indian Rupee)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCurrency('USD')}>
            $ USD (US Dollar)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
