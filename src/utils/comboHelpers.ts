import { ProductData } from '@/services/productService';

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

  // 1. Explicit catalogType
  const catalogType = String(product.catalogType || '').toLowerCase().trim();
  if (catalogType === 'combo' || catalogType === 'hamper') return true;

  // 2. Category check
  const cat = String(
    typeof product.category === 'string'
      ? product.category
      : product.category?.name || product.category?.slug || ''
  ).toLowerCase().trim();

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
    cat === 'hampers' ||
    cat === 'baskets'
  ) {
    return true;
  }

  // 3. Categories array check
  if (Array.isArray(product.categories)) {
    const hasCombo = product.categories.some((c: any) => {
      const val = String(typeof c === 'string' ? c : c?.name || c?.slug || '').toLowerCase().trim();
      return val.includes('combo') || val.includes('hamper');
    });
    if (hasCombo) return true;
  }

  // 4. Subcategory check
  const subcat = String(
    typeof product.subcategory === 'string'
      ? product.subcategory
      : product.subcategory?.name || product.subcategory?.slug || ''
  ).toLowerCase().trim();
  if (subcat.includes('combo') || subcat.includes('hamper')) return true;

  // 5. comboAttributes with products
  if (Array.isArray(product.comboAttributes?.comboProducts) && product.comboAttributes.comboProducts.length > 0) {
    return true;
  }

  // 6. hamperAttributes with items
  if (Array.isArray(product.hamperAttributes?.hamperItems) && product.hamperAttributes.hamperItems.length > 0) {
    return true;
  }

  // 7. comboItems
  if (Array.isArray(product.comboItems) && product.comboItems.length > 0) {
    return true;
  }

  // 8. Title indicates a bouquet and cake duo
  const title = String(product.title || product.name || '').toLowerCase();
  if ((title.includes('combo') || title.includes('hamper')) && (title.includes('cake') || title.includes('bouquet') || title.includes('flowers'))) {
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
    name.includes('pastry') ||
    name.includes('gateau') ||
    name.includes('cheesecake')
  );
};

/**
 * Checks if a component or title/category refers to a bouquet / flowers
 */
export const isBouquetComponent = (item: any): boolean => {
  if (!item) return false;
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
    type === 'lily' ||
    type === 'lilies' ||
    type === 'orchid' ||
    name.includes('bouquet') ||
    name.includes('roses') ||
    name.includes('flowers') ||
    name.includes('blooms') ||
    name.includes('lilies') ||
    name.includes('orchids') ||
    name.includes('carnations')
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

/**
 * Calculates and returns the two cake weight options (1/2 kg and 1 kg) for the combo
 */
export const getComboCakeVariants = (
  product: any,
  cakeComponent?: ComboComponentItem | null
): ComboVariantOption[] => {
  const baseComboPrice = Number(product?.price) || 1299;
  const baseComboCompare = Number(product?.comparePrice) || Math.round(baseComboPrice * 1.25);

  // Check if product has explicit variants
  const rawVariants = Array.isArray(product?.priceVariants) && product.priceVariants.length > 0
    ? product.priceVariants
    : (Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants : null);

  let halfKgPrice = baseComboPrice;
  let halfKgCompare = baseComboCompare;
  let oneKgPrice = baseComboPrice + 450;
  let oneKgCompare = baseComboCompare + 550;

  if (rawVariants) {
    const halfKgEntry = rawVariants.find((v: any) => {
      const l = String(v.label || v.name || v.size || '').toLowerCase();
      return l.includes('1/2') || l.includes('0.5') || l.includes('½');
    });

    const oneKgEntry = rawVariants.find((v: any) => {
      const l = String(v.label || v.name || v.size || '').toLowerCase();
      return (l.includes('1 kg') || l.includes('1kg') || l === '1 kg') && !l.includes('1/2');
    });

    if (halfKgEntry) {
      const regularP = Number(halfKgEntry.price) || halfKgPrice;
      const discP = (halfKgEntry.discountPrice !== undefined && halfKgEntry.discountPrice !== null && Number(halfKgEntry.discountPrice) > 0)
        ? Number(halfKgEntry.discountPrice)
        : regularP;

      halfKgPrice = discP;
      halfKgCompare = Number(halfKgEntry.comparePrice) || regularP;
      if (halfKgCompare <= halfKgPrice && regularP > halfKgPrice) {
        halfKgCompare = regularP;
      }
    }

    if (oneKgEntry) {
      const regularP = Number(oneKgEntry.price) || (halfKgPrice + 450);
      const discP = (oneKgEntry.discountPrice !== undefined && oneKgEntry.discountPrice !== null && Number(oneKgEntry.discountPrice) > 0)
        ? Number(oneKgEntry.discountPrice)
        : regularP;

      oneKgPrice = discP;
      oneKgCompare = Number(oneKgEntry.comparePrice) || regularP;
      if (oneKgCompare <= oneKgPrice && regularP > oneKgPrice) {
        oneKgCompare = regularP;
      }
    } else if (rawVariants.length >= 2 && !oneKgEntry) {
      const secondV = rawVariants[1];
      const regularP = Number(secondV.price) || (halfKgPrice + 450);
      const discP = (secondV.discountPrice !== undefined && secondV.discountPrice !== null && Number(secondV.discountPrice) > 0)
        ? Number(secondV.discountPrice)
        : regularP;

      oneKgPrice = discP;
      oneKgCompare = Number(secondV.comparePrice) || regularP;
    }
  } else if (cakeComponent?.priceVariants && Array.isArray(cakeComponent.priceVariants) && cakeComponent.priceVariants.length >= 2) {
    const cakeDiff = (Number(cakeComponent.priceVariants[1]?.price) || 0) - (Number(cakeComponent.priceVariants[0]?.price) || 0);
    if (cakeDiff > 0) {
      oneKgPrice = halfKgPrice + cakeDiff;
      oneKgCompare = halfKgCompare + cakeDiff + 100;
    }
  }

  // Ensure compare price is strictly greater than selling price to show savings
  if (halfKgCompare <= halfKgPrice) {
    halfKgCompare = Math.round(halfKgPrice * 1.25);
  }
  if (oneKgCompare <= oneKgPrice) {
    oneKgCompare = Math.round(oneKgPrice * 1.25);
  }

  const halfSavings = halfKgCompare - halfKgPrice;
  const halfPct = Math.round((halfSavings / halfKgCompare) * 100);

  const oneSavings = oneKgCompare - oneKgPrice;
  const onePct = Math.round((oneSavings / oneKgCompare) * 100);

  return [
    {
      label: '1/2 kg',
      title: '1/2 kg Cake + Bouquet',
      weight: '1/2 kg',
      serves: '4–6 People',
      price: halfKgPrice,
      comparePrice: halfKgCompare,
      savings: halfSavings,
      discountPercentage: halfPct,
      stock: 50,
    },
    {
      label: '1 kg',
      title: '1 kg Cake + Bouquet',
      weight: '1 kg',
      serves: '8–10 People',
      price: oneKgPrice,
      comparePrice: oneKgCompare,
      savings: oneSavings,
      discountPercentage: onePct,
      stock: 45,
    }
  ];
};
