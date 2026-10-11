import { ProductData } from '@/services/productService';
import { formatCakeWeightLabel } from './cakeHelpers';

export interface ComboVariantOption {
  label: string; // e.g. "1/2 kg" or "1 kg"
  title: string; // e.g. "1/2 kg Cake + Bouquet"
  weight: string; // "1/2 kg" | "1 kg"
  serves: string; // "4–6 People" | "8–10 People"
  price: number;
  comparePrice: number;
  savings: number;
  discountPercentage: number;
  stock: number;
}

export interface ComboComponentItem {
  id?: string;
  productId?: string;
  name: string;
  type: string; // 'bouquet' | 'cake' | 'chocolate' | 'other'
  category?: string;
  price: number;
  image: string;
  quantity: number;
  features?: string[];
  description?: string;
  details?: Record<string, any>;
  priceVariants?: any[];
  cakeAttributes?: any;
}

/**
 * Checks whether a product represents a Combo / Hamper package
 */
export const isComboProduct = (product: any): boolean => {
  if (!product) return false;

  const catalogType = String(product.catalogType || '').toLowerCase().trim();
  const cat = String(
    typeof product.category === 'string'
      ? product.category
      : product.category?.name || product.category?.slug || ''
  ).toLowerCase().trim();
  const subcat = String(
    typeof product.subcategory === 'string'
      ? product.subcategory
      : product.subcategory?.name || product.subcategory?.slug || ''
  ).toLowerCase().trim();
  const title = String(product.title || product.name || '').toLowerCase().trim();
  const cats = Array.isArray(product.categories)
    ? product.categories.map((c: any) =>
        String(typeof c === 'string' ? c : c?.name || c?.slug || '').toLowerCase().trim()
      )
    : [];

  const hasExplicitComboAttrs =
    (Array.isArray(product.comboAttributes?.comboProducts) && product.comboAttributes.comboProducts.length > 0) ||
    (Array.isArray(product.hamperAttributes?.hamperItems) && product.hamperAttributes.hamperItems.length > 0) ||
    (Array.isArray(product.comboItems) && product.comboItems.length > 0);

  // 1. Strict Basket Exclusion: Baskets belong to /baskets, not /combos
  const isBasketCategory =
    cat === 'baskets' ||
    cat === 'basket' ||
    subcat.includes('basket') ||
    cats.includes('baskets') ||
    cats.includes('flower-baskets') ||
    cats.includes('fruit-baskets') ||
    cats.includes('mixed-baskets') ||
    cats.includes('chocolate-baskets');

  const isBasketType = catalogType === 'basket';
  const isBasketTitle =
    (title.includes('basket') || title.includes('arrangement') || title.includes('stand') || title.includes('pyramid') || title.includes('cascade')) &&
    !title.includes('combo');

  // If it's a basket and not explicitly created as a combo package, reject it
  if (
    (isBasketCategory || isBasketType || isBasketTitle) &&
    catalogType !== 'combo' &&
    cat !== 'combos' &&
    !hasExplicitComboAttrs
  ) {
    return false;
  }

  // 2. Explicit catalogType
  if (catalogType === 'combo' || catalogType === 'hamper') return true;

  // 3. Category check (Baskets deliberately excluded)
  if (
    cat === 'combos' ||
    cat === 'combo' ||
    cat === 'combo-packs' ||
    cat === 'birthday-combos' ||
    cat === 'anniversary-combos' ||
    cat === 'romantic-combos' ||
    cat === 'special-occasion-combos' ||
    cat === 'cake-combos' ||
    cat === 'gift-hampers' ||
    cat === 'hampers'
  ) {
    return true;
  }

  // 4. Categories array check
  if (
    cats.some(
      (c) =>
        c === 'combos' ||
        c === 'cake-combos' ||
        c === 'combo-packs' ||
        c === 'birthday-combos' ||
        c === 'anniversary-combos' ||
        c === 'romantic-combos' ||
        c === 'special-occasion-combos' ||
        c.includes('combo')
    )
  ) {
    return true;
  }

  // 5. Subcategory check
  if (subcat.includes('combo')) return true;

  // 6. Explicit combo / hamper attributes
  if (hasExplicitComboAttrs) {
    return true;
  }

  // 7. Title indicates an explicit duo celebration (and not a basket)
  if (
    (title.includes('combo') || title.includes('hamper')) &&
    (title.includes('cake') || title.includes('bouquet') || title.includes('flowers') || title.includes('chocolate'))
  ) {
    return true;
  }

  return false;
};

/**
 * Checks if a component or title/category refers to a cake
 */
export const isCakeComponent = (item: any): boolean => {
  if (!item) return false;
  const type = String(item.type || item.category || '').toLowerCase();
  const name = String(item.name || item.title || '').toLowerCase();
  return (
    type === 'cake' ||
    type === 'cakes' ||
    type === 'bakery' ||
    name.includes('cake') ||
    name.includes('truffle') ||
    name.includes('velvet') ||
    name.includes('forest') ||
    name.includes('pastry') ||
    name.includes('gateau') ||
    name.includes('cheesecake') ||
    name.includes('butterscotch') ||
    name.includes('pineapple') ||
    Boolean(item.cakeAttributes && Object.keys(item.cakeAttributes).length > 0)
  );
};

/**
 * Checks if a component or title/category refers to a bouquet / flowers
 */
export const isBouquetComponent = (item: any): boolean => {
  if (!item) return false;
  if (isCakeComponent(item)) return false;
  const type = String(item.type || item.category || '').toLowerCase();
  const name = String(item.name || item.title || '').toLowerCase();
  return (
    type === 'bouquet' ||
    type === 'bouquets' ||
    type === 'flower' ||
    type === 'flowers' ||
    type === 'rose' ||
    type === 'roses' ||
    type === 'carnation' ||
    type === 'carnations' ||
    type === 'lily' ||
    type === 'lilies' ||
    type === 'orchid' ||
    type === 'orchids' ||
    name.includes('bouquet') ||
    name.includes('rose') ||
    name.includes('roses') ||
    name.includes('flower') ||
    name.includes('flowers') ||
    name.includes('bloom') ||
    name.includes('blooms') ||
    name.includes('lily') ||
    name.includes('lilies') ||
    name.includes('lili') ||
    name.includes('bliss') ||
    name.includes('carnation') ||
    name.includes('carnations') ||
    name.includes('orchid') ||
    name.includes('orchids')
  );
};

/**
 * Normalizes and extracts connected components (Bouquet, Cake, and additional items)
 */
export const extractComboComponents = (product: any): {
  bouquet: ComboComponentItem;
  cake: ComboComponentItem;
  allComponents: ComboComponentItem[];
  otherComponents: ComboComponentItem[];
  hasBouquetAndCake: boolean;
} => {
  const rawList: any[] = [];

  if (Array.isArray(product?.comboAttributes?.comboProducts) && product.comboAttributes.comboProducts.length > 0) {
    rawList.push(...product.comboAttributes.comboProducts);
  } else if (Array.isArray(product?.hamperAttributes?.hamperItems) && product.hamperAttributes.hamperItems.length > 0) {
    rawList.push(...product.hamperAttributes.hamperItems);
  } else if (Array.isArray(product?.comboItems) && product.comboItems.length > 0) {
    rawList.push(...product.comboItems);
  }

  const allComponents: ComboComponentItem[] = rawList.map((item, idx) => {
    const rawType = String(item.type || item.category || '').toLowerCase();
    let normalizedType = 'other';
    if (isCakeComponent(item)) normalizedType = 'cake';
    else if (isBouquetComponent(item)) normalizedType = 'bouquet';
    else if (rawType.includes('chocolate')) normalizedType = 'chocolate';

    return {
      id: item.productId || item.id || `comp_${idx}`,
      productId: item.productId || item.id,
      name: item.name || item.title || `Item ${idx + 1}`,
      type: normalizedType,
      category: item.type || item.category || 'Gift Item',
      price: Number(item.price) || 0,
      image: item.image || (Array.isArray(item.images) ? item.images[0] : '') || '',
      quantity: Number(item.quantity) || 1,
      features: item.features || [],
      description: item.description,
      details: item.details,
      priceVariants: item.priceVariants,
      cakeAttributes: item.cakeAttributes,
    };
  });

  let bouquet = allComponents.find(c => c.type === 'bouquet');
  let cake = allComponents.find(c => c.type === 'cake');

  // If 2 components and only 1 was matched, match the other
  if (allComponents.length === 2) {
    if (cake && !bouquet) {
      const other = allComponents.find(c => c !== cake);
      if (other) {
        other.type = 'bouquet';
        bouquet = other;
      }
    } else if (bouquet && !cake) {
      const other = allComponents.find(c => c !== bouquet);
      if (other) {
        other.type = 'cake';
        cake = other;
      }
    }
  }

  const mainImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : [product?.image || '/images/placeholder.svg'];

  // Smart fallback if bouquet not explicitly structured
  if (!bouquet) {
    bouquet = {
      id: 'default_bouquet',
      name: product?.title ? `${product.title.split('&')[0]?.split('+')[0]?.trim() || 'Handcrafted Fresh Bouquet'}` : 'Handcrafted Fresh Bouquet',
      type: 'bouquet',
      category: 'Bouquet',
      price: Math.round(Number(product?.price || 1299) * 0.55),
      image: mainImages[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
      quantity: 1,
      features: [
        'Farm-fresh hand-tied blooms',
        'Hydration stems wrap protection',
        'Artisanal silk bow wrapping'
      ],
      description: 'Handcrafted fresh flowers arranged in premium waterproof wrapping paper with soft silk ribbons.'
    };
  }

  // Smart fallback if cake not explicitly structured
  if (!cake) {
    cake = {
      id: 'default_cake',
      name: product?.title?.toLowerCase().includes('cake')
        ? (product.title.split('&')[1]?.split('+')[1]?.trim() || 'Gourmet Artisan Cake')
        : 'Gourmet Artisan Cake',
      type: 'cake',
      category: 'Artisan Cake',
      price: Math.round(Number(product?.price || 1299) * 0.45),
      image: mainImages[1] || mainImages[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600',
      quantity: 1,
      features: [
        '100% Eggless bakery fresh',
        'Complimentary message on cake',
        'Candle & knife included'
      ],
      description: 'Decadent freshly baked cake prepared with authentic Belgian chocolate and rich sponge layers.'
    };
  }

  const otherComponents = allComponents.filter(c => c !== bouquet && c !== cake);

  return {
    bouquet,
    cake,
    allComponents: allComponents.length > 0 ? allComponents : [bouquet, cake],
    otherComponents,
    hasBouquetAndCake: true,
  };
};

const SERVES_LOOKUP: Record<string, string> = {
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
};

const getVariantServes = (label: string): string => {
  if (!label) return '';
  const clean = label.trim().toLowerCase();
  if (SERVES_LOOKUP[clean]) return SERVES_LOOKUP[clean];
  if (clean.includes('0.5') || clean.includes('½') || clean.includes('1/2')) return '4–6 People';
  if (clean.includes('1.5')) return '12–15 People';
  if (clean.includes('1')) return '8–10 People';
  if (clean.includes('2.5')) return '20–24 People';
  if (clean.includes('2')) return '16–20 People';
  if (clean.includes('3')) return '24–30 People';
  return 'Celebration Portion';
};

/**
 * Calculates and returns the cake weight options for the combo.
 * Strictly matches the available variants of the connected cake component
 * (e.g. if Red Velvet has only 1 variant of 1 Kg, the combo will only offer 1 Kg).
 */
export const getComboCakeVariants = (
  product: any,
  cakeComponent?: ComboComponentItem | null
): ComboVariantOption[] => {
  const baseComboPrice = Number(product?.price) || 1299;
  const baseComboCompare = Number(product?.comparePrice) || Math.round(baseComboPrice * 1.25);

  // Check product's explicit variants
  const rawProductVariants = Array.isArray(product?.priceVariants) && product.priceVariants.length > 0
    ? product.priceVariants
    : (Array.isArray(product?.details?.priceVariants) && product.details.priceVariants.length > 0
      ? product.details.priceVariants
      : (Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants : null));

  // Determine what cake variants actually exist for the connected cake component
  const connectedCakeVariants: any[] | null = (Array.isArray(cakeComponent?.priceVariants) && cakeComponent.priceVariants.length > 0)
    ? cakeComponent.priceVariants
    : (Array.isArray(cakeComponent?.cakeAttributes?.availableSizes) && cakeComponent.cakeAttributes.availableSizes.length > 0
      ? cakeComponent.cakeAttributes.availableSizes.map((sz: any) => ({ label: String(sz) }))
      : (cakeComponent?.cakeAttributes?.weight
        ? [{ label: String(cakeComponent.cakeAttributes.weight) }]
        : null));

  // Determine the target variant labels to build
  let targetLabels: string[] = [];

  // Priority 1: Connected Cake Variants
  if (connectedCakeVariants && connectedCakeVariants.length > 0) {
    targetLabels = connectedCakeVariants.map(v => formatCakeWeightLabel(v.label || v.name || v.size));
  }
  // Priority 2: Product's explicit price variants
  else if (rawProductVariants && rawProductVariants.length > 0) {
    targetLabels = rawProductVariants.map((v: any) => formatCakeWeightLabel(v.label || v.name || v.size));
  }
  // Priority 3: Product's cakeAttributes availableSizes
  else if (Array.isArray(product?.cakeAttributes?.availableSizes) && product.cakeAttributes.availableSizes.length > 0) {
    targetLabels = product.cakeAttributes.availableSizes.map((sz: any) => formatCakeWeightLabel(sz));
  }
  // Priority 4: Default 0.5 Kg and 1 Kg fallback
  else {
    targetLabels = ['0.5 Kg', '1 Kg'];
  }

  // Deduplicate target labels preserving order
  targetLabels = Array.from(new Set(targetLabels.filter(Boolean)));

  // If only 1 variant exists (e.g. Red Velvet 1 Kg), produce only that single variant
  return targetLabels.map((targetLabel, idx) => {
    const normTarget = formatCakeWeightLabel(targetLabel);
    const isOneKg = normTarget.toLowerCase().includes('1 kg') || normTarget.toLowerCase().includes('1kg');
    const isHalfKg = normTarget.toLowerCase().includes('0.5') || normTarget.toLowerCase().includes('1/2') || normTarget.toLowerCase().includes('½');

    // 1. Try to find match in product's own priceVariants
    const matchingProdVar = rawProductVariants?.find((v: any) => {
      const l = formatCakeWeightLabel(v.label || v.name || v.size || '');
      return l.toLowerCase() === normTarget.toLowerCase();
    });

    let sellingPrice = baseComboPrice;
    let comparePrice = baseComboCompare;
    let stock = 50;

    if (matchingProdVar) {
      const regularP = Number(matchingProdVar.price) || baseComboPrice;
      const discP = (matchingProdVar.discountPrice !== undefined && matchingProdVar.discountPrice !== null && Number(matchingProdVar.discountPrice) > 0)
        ? Number(matchingProdVar.discountPrice)
        : regularP;

      sellingPrice = discP;
      comparePrice = Number(matchingProdVar.comparePrice) || regularP;
      if (comparePrice <= sellingPrice && regularP > sellingPrice) {
        comparePrice = regularP;
      }
      if (matchingProdVar.stock !== undefined) {
        stock = Number(matchingProdVar.stock);
      }
    } else {
      // If no explicit product variant match, calculate based on single vs multiple variants
      if (targetLabels.length === 1) {
        // Single variant combo (e.g. Red Velvet 1 Kg combo)
        sellingPrice = (product?.discountPrice !== undefined && product?.discountPrice !== null && Number(product.discountPrice) > 0)
          ? Number(product.discountPrice)
          : baseComboPrice;
        comparePrice = Number(product?.comparePrice) || Math.round(sellingPrice * 1.25);
      } else {
        // Multiple variants (e.g. 0.5 Kg and 1 Kg)
        if (isHalfKg || idx === 0) {
          sellingPrice = baseComboPrice;
          comparePrice = baseComboCompare;
        } else if (isOneKg || idx === 1) {
          let cakeUpgrade = 450;
          if (connectedCakeVariants && connectedCakeVariants.length >= 2) {
            const cakeDiff = (Number(connectedCakeVariants[1]?.price) || 0) - (Number(connectedCakeVariants[0]?.price) || 0);
            if (cakeDiff > 0) cakeUpgrade = cakeDiff;
          }
          sellingPrice = baseComboPrice + cakeUpgrade;
          comparePrice = baseComboCompare + cakeUpgrade + 100;
        } else {
          // Extra variant (e.g. 1.5 Kg or 2 Kg)
          sellingPrice = Math.round(baseComboPrice * (1 + idx * 0.45));
          comparePrice = Math.round(baseComboCompare * (1 + idx * 0.45));
        }
      }
    }

    // Ensure compare price is strictly greater than selling price to show savings
    if (comparePrice <= sellingPrice) {
      comparePrice = Math.round(sellingPrice * 1.25);
    }

    const savings = Math.max(0, comparePrice - sellingPrice);
    const discountPercentage = comparePrice > 0 ? Math.round((savings / comparePrice) * 100) : 0;

    return {
      label: normTarget,
      title: `${normTarget} Cake + Bouquet`,
      weight: normTarget,
      serves: getVariantServes(normTarget),
      price: sellingPrice,
      comparePrice,
      savings,
      discountPercentage,
      stock,
    };
  });
};
