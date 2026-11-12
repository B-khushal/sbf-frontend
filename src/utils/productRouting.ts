export interface ValentineRoutableProduct {
  _id?: string;
  id?: string;
  slug?: string;
  isValentineProduct?: boolean;
  productType?: string;
  showInValentineShop?: boolean;
}

/**
 * Returns true when a product has been added to Valentine products via
 * productType, isValentineProduct, or showInValentineShop.
 */
export function isValentineCollectionProduct(
  product: ValentineRoutableProduct | null | undefined
): boolean {
  if (!product) return false;
  return Boolean(
    product.isValentineProduct ||
      product.productType === 'valentine' ||
      product.showInValentineShop
  );
}

/**
 * A product should use the Valentine product details experience only when
 * Valentine mode is active AND the product belongs to Valentine products.
 */
export function shouldShowValentineProductDetails(
  product: ValentineRoutableProduct | null | undefined,
  isValentineEnabled: boolean
): boolean {
  return Boolean(isValentineEnabled && isValentineCollectionProduct(product));
}

/**
 * Resolves the canonical product details route path based on Valentine mode
 * and whether the product is included in Valentine products.
 */
export function getProductDetailsPath(
  productOrId: ValentineRoutableProduct | string | null | undefined,
  isValentineEnabled: boolean,
  linkPrefix?: string
): string {
  const id =
    typeof productOrId === 'string'
      ? productOrId
      : String(productOrId?._id || productOrId?.id || '');

  if (!id) return '/shop';

  if (linkPrefix) {
    const cleaned = linkPrefix.replace(/\/+$/, '');
    const resolvedPrefix =
      cleaned === '/valentine-product' && !isValentineEnabled ? '/product' : cleaned;
    return `${resolvedPrefix}/${id}`;
  }

  const useValentineRoute =
    typeof productOrId !== 'string' &&
    shouldShowValentineProductDetails(productOrId, isValentineEnabled);

  return `${useValentineRoute ? '/valentine-product' : '/product'}/${id}`;
}

