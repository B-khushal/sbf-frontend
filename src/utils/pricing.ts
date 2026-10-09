/**
 * Shared pricing and discount utility functions
 */

export interface ProductPriceInfo {
  price: number;
  discount?: number;
  discountType?: 'percentage' | 'direct' | 'fixed' | string;
  discountPrice?: number | string | null;
  discountedPrice?: number | string | null;
  comparePrice?: number | string | null;
  hasPriceVariants?: boolean;
  priceVariants?: Array<{
    price: number;
    label?: string;
    discountPrice?: number | string | null;
    comparePrice?: number | string | null;
    [key: string]: any;
  }>;
  details?: {
    discount?: number;
    discountType?: string;
    discountPrice?: number | string | null;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Calculates the final selling price for a product or variant taking into account:
 * 1. Variant-level direct discount (v.discountPrice) or comparePrice
 * 2. Product-level direct discount price (discountType === 'direct' | 'fixed' or discountPrice valid)
 * 3. Percentage discount (if discount > 0)
 * 4. Fallback to regular price
 */
export function getProductEffectivePrice(product: any, selectedVariantPrice?: number, selectedVariant?: any): number {
  if (!product) return 0;

  const regularPrice = Math.max(0, Number(product.price) || 0);

  // 1. Check if the variant itself has an explicit discount or direct price
  const variant = selectedVariant || (
    (typeof selectedVariantPrice === 'number' && selectedVariantPrice > 0 && Array.isArray(product.priceVariants))
      ? product.priceVariants.find((v: any) =>
          Number(v.price) === selectedVariantPrice ||
          Number(v.discountPrice) === selectedVariantPrice
        )
      : null
  );

  if (variant) {
    // Explicit variant direct discount price
    if (variant.discountPrice !== undefined && variant.discountPrice !== null && variant.discountPrice !== '') {
      const vdp = Number(variant.discountPrice);
      if (!isNaN(vdp) && vdp > 0 && (!variant.price || vdp < Number(variant.price))) {
        return vdp;
      }
    }
    // Variant with comparePrice where price is already the discounted price
    if (variant.comparePrice && Number(variant.comparePrice) > Number(variant.price) && Number(variant.price) > 0) {
      return Number(variant.price);
    }
  }

  const basePrice = typeof selectedVariantPrice === 'number' && selectedVariantPrice > 0
    ? selectedVariantPrice
    : regularPrice;

  // 2. Parse product-level discount properties defensively (numbers, strings, or nested in details)
  const rawDiscountType = String(
    product.discountType ??
    product.details?.discountType ??
    'percentage'
  ).toLowerCase().trim();

  const isDirectMode = rawDiscountType === 'direct' || rawDiscountType === 'fixed';

  const parsedDiscountPrice = (() => {
    const candidates = [
      product.discountPrice,
      product.details?.discountPrice,
      product.discountedPrice,
      product.details?.discountedPrice,
    ];
    for (const c of candidates) {
      if (c !== undefined && c !== null && c !== '') {
        const num = Number(c);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return NaN;
  })();

  const hasValidDirectPrice = !isNaN(parsedDiscountPrice) && parsedDiscountPrice > 0;

  // 3. Apply Direct Discount (exact for base product, proportional for variants)
  if (hasValidDirectPrice && (isDirectMode || parsedDiscountPrice < (selectedVariantPrice ? basePrice : regularPrice))) {
    // If evaluating the base product or variant with exact base price
    if (typeof selectedVariantPrice !== 'number' || Math.abs(basePrice - regularPrice) < 0.01) {
      return parsedDiscountPrice;
    }
    // If variant has different price, apply direct discount proportionally
    if (regularPrice > 0) {
      const directRatio = parsedDiscountPrice / regularPrice;
      return Math.round(basePrice * directRatio);
    }
    return parsedDiscountPrice;
  }

  // 4. Apply Percentage Discount
  const discountPct = Number(product.discount ?? product.details?.discount ?? 0);
  if (discountPct > 0 && discountPct < 100) {
    return Math.round(basePrice * (1 - discountPct / 100));
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
