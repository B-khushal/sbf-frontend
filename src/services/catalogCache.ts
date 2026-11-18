import api from '@/services/api';
import categoryService, { type Category } from '@/services/categoryService';
import { preprocessProductForSearch } from '@/utils/searchHelper';

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes in-memory freshness window

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let rawProductsCache: CacheEntry<unknown[]> | null = null;
let processedProductsCache: CacheEntry<unknown[]> | null = null;
let inFlightProductsPromise: Promise<unknown[]> | null = null;

let activeCategoriesCache: CacheEntry<Category[]> | null = null;
let inFlightCategoriesPromise: Promise<Category[]> | null = null;

let productCategoriesCache: CacheEntry<string[]> | null = null;
let inFlightProductCategoriesPromise: Promise<string[]> | null = null;

const resolvedCategoryUrlCache = new Map<string, CacheEntry<unknown>>();

const isFresh = <T,>(entry: CacheEntry<T> | null): entry is CacheEntry<T> =>
  Boolean(entry && Date.now() - entry.timestamp < CACHE_TTL_MS);

export const peekCachedProducts = (): unknown[] | null =>
  rawProductsCache ? rawProductsCache.data : null;

export const peekCachedProcessedProducts = (): unknown[] | null =>
  processedProductsCache ? processedProductsCache.data : null;

export const peekCachedActiveCategories = (): Category[] | null =>
  activeCategoriesCache ? activeCategoriesCache.data : null;

export const getCachedProducts = async (forceRefresh = false): Promise<unknown[]> => {
  if (!forceRefresh && isFresh(rawProductsCache)) {
    return rawProductsCache.data;
  }

  if (!inFlightProductsPromise) {
    inFlightProductsPromise = api
      .get('/products')
      .then((res) => {
        const list = res.data?.products || (Array.isArray(res.data) ? res.data : []);
        const now = Date.now();
        rawProductsCache = { data: list, timestamp: now };
        processedProductsCache = {
          data: list.map((p: unknown) => preprocessProductForSearch(p)),
          timestamp: now,
        };
        return list;
      })
      .finally(() => {
        inFlightProductsPromise = null;
      });
  }

  return inFlightProductsPromise;
};

export const getCachedProcessedProducts = async (forceRefresh = false): Promise<unknown[]> => {
  if (!forceRefresh && isFresh(processedProductsCache)) {
    return processedProductsCache.data;
  }
  await getCachedProducts(forceRefresh);
  return processedProductsCache?.data || [];
};

export const getCachedActiveCategories = async (forceRefresh = false): Promise<Category[]> => {
  if (!forceRefresh && isFresh(activeCategoriesCache)) {
    return activeCategoriesCache.data;
  }

  if (!inFlightCategoriesPromise) {
    inFlightCategoriesPromise = categoryService
      .getCategories({ status: 'active' })
      .then((cats) => {
        const list = Array.isArray(cats) ? cats : [];
        activeCategoriesCache = { data: list, timestamp: Date.now() };
        return list;
      })
      .finally(() => {
        inFlightCategoriesPromise = null;
      });
  }

  return inFlightCategoriesPromise;
};

export const getCachedProductCategories = async (forceRefresh = false): Promise<string[]> => {
  if (!forceRefresh && isFresh(productCategoriesCache)) {
    return productCategoriesCache.data;
  }

  if (!inFlightProductCategoriesPromise) {
    inFlightProductCategoriesPromise = api
      .get('/products/categories')
      .then((res) => {
        const list = Array.isArray(res.data?.categories) ? res.data.categories : [];
        productCategoriesCache = { data: list, timestamp: Date.now() };
        return list;
      })
      .finally(() => {
        inFlightProductCategoriesPromise = null;
      });
  }

  return inFlightProductCategoriesPromise;
};

export const prefetchShopCatalog = (): void => {
  // Fire-and-forget warm-up on category hover/touch so navigation feels instant
  void getCachedProducts().catch(() => {
    // Non-blocking warm-up
  });
};

export const getCachedResolvedCategory = (url: string): unknown | null => {
  const key = url.toLowerCase();
  const entry = resolvedCategoryUrlCache.get(key) || null;
  return isFresh(entry) ? entry.data : null;
};

export const setCachedResolvedCategory = (url: string, data: unknown): void => {
  resolvedCategoryUrlCache.set(url.toLowerCase(), {
    data,
    timestamp: Date.now(),
  });
};
