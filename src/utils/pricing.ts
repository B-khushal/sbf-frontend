/**
 * Shared pricing and discount utility functions
 */

export interface ProductPriceInfo {
  price: number;
  discount?: number;
  discountType?: 'percentage' | 'direct' | string;
  discountPrice?: number;
  hasPriceVariants?: boolean;
  priceVariants?: Array<{ price: number; label?: string; [key: string]: any }>;
}

/**
 * Calculates the final selling price for a product taking into account:
 * 1. Direct discount price (if discountType === 'direct' and discountPrice is valid)
 * 2. Percentage discount (if discount > 0)
 * 3. Fallback to regular price
 */
export function getProductEffectivePrice(product: ProductPriceInfo, selectedVariantPrice?: number): number {
  const basePrice = typeof selectedVariantPrice === 'number' && selectedVariantPrice > 0
    ? selectedVariantPrice
    : (Number(product.price) || 0);

  // If a variant is selected and has its own price, apply the percentage discount to the variant
  if (typeof selectedVariantPrice === 'number' && selectedVariantPrice > 0) {
    if (product.discount && Number(product.discount) > 0) {
      return Math.round(basePrice * (1 - Number(product.discount) / 100));
    }
    return basePrice;
  }

  // If main product has direct discount price configured
  if (
    (product.discountType === 'direct' || product.discountType === 'fixed') &&
    typeof product.discountPrice === 'number' &&
    product.discountPrice > 0 &&
    product.discountPrice < basePrice
  ) {
    return product.discountPrice;
  }

  // If main product has percentage discount
  if (product.discount && Number(product.discount) > 0) {
    return Math.round(basePrice * (1 - Number(product.discount) / 100));
  }

  return basePrice;
}

/**
 * Computes savings amount and discount percentage
 */
export function getDiscountBreakdown(price: number, effectivePrice: number): {
  savings: number;
  percentage: number;
  hasDiscount: boolean;
} {
  const regular = Math.max(0, Number(price) || 0);
  const final = Math.max(0, Number(effectivePrice) || 0);

  if (regular > 0 && final > 0 && final < regular) {
    const savings = regular - final;
    const percentage = Number(((savings / regular) * 100).toFixed(2));
    return {
      savings,
      percentage,
      hasDiscount: true,
    };
  }

  return {
    savings: 0,
    percentage: 0,
    hasDiscount: false,
  };
}
