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
  { label: '1/2 kg', price: 799, stock: 20, serves: '4–6 People' },
  { label: '1 KG', price: 1299, stock: 20, serves: '8–10 People' },
  { label: '1.5 KG', price: 1799, stock: 15, serves: '12–15 People' },
  { label: '2 KG', price: 2299, stock: 10, serves: '16–20 People' },
];

/**
 * Normalizes cake weight labels to clean, premium display format (e.g. "0.5 Kg", "1 Kg")
 */
export const formatCakeWeightLabel = (weight?: string | null): string => {
  if (!weight) return '0.5 Kg';
  const str = String(weight).trim();
  if (/^0\.5\s*kg$/i.test(str) || /^0\.5kg$/i.test(str) || /^½\s*kg$/i.test(str) || /^1\/2\s*kg$/i.test(str) || /^0\.5$/i.test(str)) {
    return '0.5 Kg';
  }
  if (/^1\s*kg$/i.test(str) || /^1kg$/i.test(str) || /^1\.0\s*kg$/i.test(str)) {
    return '1 Kg';
  }
  if (/^1\.5\s*kg$/i.test(str) || /^1\.5kg$/i.test(str)) {
    return '1.5 Kg';
  }
  if (/^2\s*kg$/i.test(str) || /^2kg$/i.test(str) || /^2\.0\s*kg$/i.test(str)) {
    return '2 Kg';
  }
  if (/^2\.5\s*kg$/i.test(str) || /^2\.5kg$/i.test(str)) {
    return '2.5 Kg';
  }
  if (/^3\s*kg$/i.test(str) || /^3kg$/i.test(str)) {
    return '3 Kg';
  }
  if (/^4\s*kg$/i.test(str) || /^4kg$/i.test(str)) {
    return '4 Kg';
  }
  if (/^5\s*kg$/i.test(str) || /^5kg$/i.test(str)) {
    return '5 Kg';
  }
  return str;
};

/**
 * Robust dynamic detection for whether a product is in the Cakes category or is a Cake offering (including combos with cakes).
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

  // 4. Subcategory check
  const subcat = (
    typeof product.subcategory === 'string'
      ? product.subcategory
      : product.subcategory?.name || product.subcategory?.slug || ''
  ).toLowerCase().trim();
  if (subcat === 'cakes' || subcat === 'cake' || subcat.includes('cake')) return true;

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

  // 6. Connected Cake in Combo or Hamper
  if (Array.isArray(product.comboAttributes?.comboProducts)) {
    const hasCakeInCombo = product.comboAttributes.comboProducts.some((cp: any) =>
      cp.type === 'cake' || cp.catalogType === 'cake' || String(cp.name || '').toLowerCase().includes('cake')
    );
    if (hasCakeInCombo) return true;
  }

  if (Array.isArray(product.hamperAttributes?.hamperItems)) {
    const hasCakeInHamper = product.hamperAttributes.hamperItems.some((hi: any) =>
      hi.type === 'cake' || hi.catalogType === 'cake' || String(hi.name || '').toLowerCase().includes('cake')
    );
    if (hasCakeInHamper) return true;
  }

  // 7. Title or description mentions cake
  const title = String(product.title || product.name || '').toLowerCase();
  if (title.includes('cake')) return true;

  return false;
};

/**
 * Returns normalized weight variants for a cake or cake-combo product.
 * Falls back safely to availableSizes, combo components, or details.priceVariants.
 */
export const getCakeVariants = (product: any): CakeVariantOption[] => {
  const servesMap: Record<string, string> = {
    '0.5 kg': '4–6 People',
    '0.5kg': '4–6 People',
    '1/2 kg': '4–6 People',
    '1/2kg': '4–6 People',
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
  };

  const getServes = (label: string): string => {
    if (!label) return '';
    const clean = label.trim().toLowerCase();
    if (servesMap[clean]) return servesMap[clean];
    if (clean.includes('0.5') || clean.includes('½') || clean.includes('1/2')) return '4–6 People';
    if (clean.includes('1.5')) return '12–15 People';
    if (clean.includes('1')) return '8–10 People';
    if (clean.includes('2.5')) return '20–24 People';
    if (clean.includes('2')) return '16–20 People';
    if (clean.includes('3')) return '24–30 People';
    if (clean.includes('4')) return '30–40 People';
    if (clean.includes('5')) return '40–50 People';
    return '';
  };

  let rawList: any[] = [];

  // 1. Explicit priceVariants on product (from product form or DB)
  if (Array.isArray(product?.priceVariants) && product.priceVariants.length > 0) {
    rawList = product.priceVariants;
  }
  // 2. details.priceVariants
  else if (Array.isArray(product?.details?.priceVariants) && product.details.priceVariants.length > 0) {
    rawList = product.details.priceVariants;
  }
  // 3. cakeAttributes.availableSizes
  else if (Array.isArray(product?.cakeAttributes?.availableSizes) && product.cakeAttributes.availableSizes.length > 0) {
    const baseP = Number(product.price || 0);
    rawList = product.cakeAttributes.availableSizes.map((sz: string) => {
      let p = baseP;
      const lower = sz.toLowerCase();
      if (lower.includes('0.5') || lower.includes('½') || lower.includes('1/2')) p = baseP > 0 ? Math.round(baseP * 0.65) : baseP;
      else if (lower.includes('1.5')) p = baseP > 0 ? Math.round(baseP * 1.45) : baseP;
      else if (lower.includes('2')) p = baseP > 0 ? Math.round(baseP * 1.9) : baseP;
      return {
        label: sz,
        price: p,
        comparePrice: baseP > p ? baseP : undefined,
        stock: Number(product.countInStock !== undefined ? product.countInStock : 20),
      };
    });
  }
  // 4. comboAttributes.comboProducts containing a cake
  else if (Array.isArray(product?.comboAttributes?.comboProducts)) {
    const cakeComp = product.comboAttributes.comboProducts.find((cp: any) =>
      cp.type === 'cake' || cp.catalogType === 'cake' || String(cp.name || '').toLowerCase().includes('cake')
    );
    if (cakeComp) {
      if (Array.isArray(cakeComp.priceVariants) && cakeComp.priceVariants.length > 0) {
        rawList = cakeComp.priceVariants;
      } else if (Array.isArray(cakeComp.cakeAttributes?.availableSizes) && cakeComp.cakeAttributes.availableSizes.length > 0) {
        rawList = cakeComp.cakeAttributes.availableSizes.map((sz: string) => ({
          label: sz,
          price: Number(product?.price || 0),
          stock: Number(product?.countInStock !== undefined ? product.countInStock : 20),
        }));
      }
    }
  }

  // If a list was resolved, normalize and sort by price ascending
  if (rawList.length > 0) {
    const result: CakeVariantOption[] = rawList.map((v: any, idx: number) => {
      const rawLabel = v.label || v.name || v.size || `Variant ${idx + 1}`;
      const label = formatCakeWeightLabel(rawLabel);
      return {
        label,
        price: Number(v.price) > 0 ? Number(v.price) : (Number(product.price) || 0),
        discountPrice: (v.discountPrice !== undefined && v.discountPrice !== null && v.discountPrice !== '') ? Number(v.discountPrice) : undefined,
        comparePrice: (v.comparePrice !== undefined && v.comparePrice !== null && v.comparePrice !== '') ? Number(v.comparePrice) : undefined,
        stock: Number(v.stock !== undefined ? v.stock : 20),
        serves: getServes(label),
      };
    });

    result.sort((a, b) => a.price - b.price);
    return result;
  }

  // 5. If a single weight is configured in cakeAttributes (e.g. "1 Kg")
  if (product?.cakeAttributes?.weight && typeof product.cakeAttributes.weight === 'string' && product.cakeAttributes.weight.trim()) {
    const w = formatCakeWeightLabel(product.cakeAttributes.weight.trim());
    return [{
      label: w,
      price: Number(product.price) || 0,
      stock: Number(product.countInStock !== undefined ? product.countInStock : 20),
      serves: getServes(w),
    }];
  }

  return [];
};
