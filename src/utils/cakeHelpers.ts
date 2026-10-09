/**
 * Cake Utility Helpers for Spring Blossoms Florist
 * Provides dynamic detection, weight variants, pricing, and cake defaults.
 */

export interface CakeVariantOption {
  label: string;
  price: number;
  stock: number;
  serves: string;
  discountPrice?: number;
  comparePrice?: number;
}

export const DEFAULT_CAKE_VARIANTS: CakeVariantOption[] = [
  { label: '½ KG', price: 799, stock: 20, serves: '4–6 People' },
  { label: '1 KG', price: 1299, stock: 20, serves: '8–10 People' },
  { label: '1.5 KG', price: 1799, stock: 15, serves: '12–15 People' },
  { label: '2 KG', price: 2299, stock: 10, serves: '16–20 People' },
];

/**
 * Robust dynamic detection for whether a product is in the Cakes category or is a Cake offering.
 */
export const isCakeProduct = (product: any): boolean => {
  if (!product) return false;

  // 1. Explicit catalogType
  if (product.catalogType === 'cake') return true;

  // 2. Primary category check
  const cat = (
    typeof product.category === 'string'
      ? product.category
      : product.category?.name || product.category?.slug || ''
  ).toLowerCase().trim();
  if (cat === 'cakes' || cat === 'cake') return true;

  // 3. Categories array check
  if (Array.isArray(product.categories)) {
    const hasCake = product.categories.some((c: any) => {
      const val = String(typeof c === 'string' ? c : c?.name || c?.slug || '').toLowerCase().trim();
      return val === 'cakes' || val === 'cake';
    });
    if (hasCake) return true;
  }

  // 4. Subcategory check (must not be combos)
  const subcat = (
    typeof product.subcategory === 'string'
      ? product.subcategory
      : product.subcategory?.name || product.subcategory?.slug || ''
  ).toLowerCase().trim();
  if ((subcat === 'cakes' || subcat === 'cake') && !cat.includes('combo')) return true;

  // 5. Cake attributes present
  if (
    product.cakeAttributes &&
    (product.cakeAttributes.flavor ||
      product.cakeAttributes.weight ||
      product.cakeAttributes.shape ||
      product.cakeAttributes.prepTime ||
      product.cakeAttributes.occasion ||
      (Array.isArray(product.cakeAttributes.availableSizes) && product.cakeAttributes.availableSizes.length > 0) ||
      product.cakeAttributes.eggless !== undefined)
  ) {
    return true;
  }

  return false;
};

/**
 * Returns normalized weight variants for a cake product.
 * Returns ONLY genuine price variants configured in the product form.
 * If no price variants are configured, returns an empty array (no seed/fake variants).
 */
export const getCakeVariants = (product: any): CakeVariantOption[] => {
  const servesMap: Record<string, string> = {
    '0.5 kg': '4–6 People',
    '0.5kg': '4–6 People',
    '½ kg': '4–6 People',
    '1 kg': '8–10 People',
    '1kg': '8–10 People',
    '1.5 kg': '12–15 People',
    '1.5kg': '12–15 People',
    '2 kg': '16–20 People',
    '2kg': '16–20 People',
    '2.5 kg': '20–24 People',
    '2.5kg': '20–24 People',
    '3 kg': '24–30 People',
    '3kg': '24–30 People',
    '4 kg': '30–40 People',
    '4kg': '30–40 People',
    '5 kg': '40–50 People',
    '5kg': '40–50 People',
    '6 inch': '4–6 People',
    '8 inch': '8–12 People',
    '10 inch': '14–18 People',
    '12 inch': '20–26 People',
    '6 piece': '6 Servings',
    '12 piece': '12 Servings',
    '24 piece': '24 Servings',
  };

  const getServes = (label: string): string => {
    if (!label) return '';
    const clean = label.trim().toLowerCase();
    if (servesMap[clean]) return servesMap[clean];
    if (clean.includes('0.5') || clean.includes('½')) return '4–6 People';
    if (clean.includes('1.5')) return '12–15 People';
    if (clean.includes('1')) return '8–10 People';
    if (clean.includes('2.5')) return '20–24 People';
    if (clean.includes('2')) return '16–20 People';
    if (clean.includes('3')) return '24–30 People';
    if (clean.includes('4')) return '30–40 People';
    if (clean.includes('5')) return '40–50 People';
    return '';
  };

  // 1. Explicit priceVariants on product (from product form or DB)
  if (Array.isArray(product?.priceVariants) && product.priceVariants.length > 0) {
    return product.priceVariants.map((v: any, idx: number) => {
      const label = v.label || v.name || v.size || `Variant ${idx + 1}`;
      return {
        label,
        price: Number(v.price) > 0 ? Number(v.price) : (Number(product.price) || 0),
        discountPrice: (v.discountPrice !== undefined && v.discountPrice !== null && v.discountPrice !== '') ? Number(v.discountPrice) : undefined,
        comparePrice: (v.comparePrice !== undefined && v.comparePrice !== null && v.comparePrice !== '') ? Number(v.comparePrice) : undefined,
        stock: Number(v.stock !== undefined ? v.stock : 20),
        serves: getServes(label),
      };
    });
  }

  // 2. If availableSizes are configured in cakeAttributes
  if (Array.isArray(product?.cakeAttributes?.availableSizes) && product.cakeAttributes.availableSizes.length > 0) {
    return product.cakeAttributes.availableSizes.map((size: string) => ({
      label: size,
      price: Number(product.price) || 0,
      stock: Number(product.countInStock !== undefined ? product.countInStock : 20),
      serves: getServes(size),
    }));
  }

  // 3. If a single weight is configured in cakeAttributes (e.g. "1 Kg")
  if (product?.cakeAttributes?.weight && typeof product.cakeAttributes.weight === 'string' && product.cakeAttributes.weight.trim()) {
    const w = product.cakeAttributes.weight.trim();
    return [{
      label: w,
      price: Number(product.price) || 0,
      stock: Number(product.countInStock !== undefined ? product.countInStock : 20),
      serves: getServes(w),
    }];
  }

  // Strictly no seed data: return empty array if product form did not configure any sizes/variants
  return [];
};
