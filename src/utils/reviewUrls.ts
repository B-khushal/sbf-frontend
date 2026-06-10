import { slugify } from './slugify';

export const buildProductReviewUrl = (
  productId: string,
  productTitle: string,
  options?: {
    orderId?: string;
  }
) => {
  const slug = slugify(productTitle || 'product-reviews');
  const basePath = `/products/${productId}/reviews/${slug}`;

  if (!options?.orderId) {
    return basePath;
  }

  return `${basePath}?orderId=${options.orderId}`;
};
