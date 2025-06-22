import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Tag, X, Check, AlertCircle } from 'lucide-react';
import { validatePromoCode, type PromoCodeValidationResult } from '@/services/promoCodeService';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PromoCodeInputProps {
  orderAmount: number;
  orderItems?: any[];
  userId?: string;
  onPromoCodeApplied: (validationResult: PromoCodeValidationResult) => void;
  onPromoCodeRemoved: () => void;
  appliedPromoCode?: {
    code: string;
    discount: number;
    finalAmount: number;
  } | null;
  disabled?: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  orderAmount,
  orderItems = [],
  userId,
  onPromoCodeApplied,
  onPromoCodeRemoved,
  appliedPromoCode,
  disabled = false
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setValidationMessage({
        type: 'error',
        message: 'Please enter a promo code'
      });
      return;
    }

    setIsValidating(true);
    setValidationMessage(null);

    try {
      const result = await validatePromoCode({
        code: promoCode.trim(),
        orderAmount,
        items: orderItems,
        userId
      });

      if (result.success && result.data) {
        setValidationMessage({
          type: 'success',
          message: `Promo code applied! You saved ${formatPrice(convertPrice(result.data.discount.amount))}`
        });
        
        onPromoCodeApplied(result);
        
        toast({
          title: "Promo code applied!",
          description: `You saved ${formatPrice(convertPrice(result.data.discount.amount))} with code ${promoCode.toUpperCase()}`,
        });
      } else {
        setValidationMessage({
          type: 'error',
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      setValidationMessage({
        type: 'error',
        message: 'Failed to validate promo code. Please try again.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setValidationMessage(null);
    onPromoCodeRemoved();
    
    toast({
      title: "Promo code removed",
      description: "Your order total has been updated",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating && !appliedPromoCode) {
      handleApplyPromoCode();
    }
  };

  if (appliedPromoCode) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Promo code "{appliedPromoCode.code}" applied
              </p>
              <p className="text-sm text-green-600">
                You saved {formatPrice(convertPrice(appliedPromoCode.discount))}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemovePromoCode}
            disabled={disabled}
            className="text-green-700 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Original total:</span>
          <span className="line-through">{formatPrice(convertPrice(orderAmount))}</span>
        </div>
        <div className="flex justify-between items-center font-medium text-lg">
          <span>Final total:</span>
          <span className="text-green-600">{formatPrice(convertPrice(appliedPromoCode.finalAmount))}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Have a promo code?</h3>
      </div>
      
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value.toUpperCase());
            setValidationMessage(null);
          }}
          onKeyPress={handleKeyPress}
          disabled={disabled || isValidating}
          className="flex-1"
        />
        <Button
          onClick={handleApplyPromoCode}
          disabled={disabled || isValidating || !promoCode.trim()}
          className="px-6"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Applying...
            </>
          ) : (
            'Apply'
          )}
        </Button>
      </div>

      {validationMessage && (
        <Alert variant={validationMessage.type === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationMessage.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground">
        Enter your promo code to get instant discounts on your order
      </div>
    </div>
  );
};

export default PromoCodeInput; 