import { CartItem } from '@/utils/cartManager';

export const PENDING_CART_ITEM_KEY = 'sbf_pending_cart_item';

export interface PendingCartData {
  item: CartItem;
  redirectUrl: string;
  timestamp: number;
}

/**
 * Saves an item that an anonymous visitor attempted to add to cart.
 */
export const savePendingCartItem = (
  item: CartItem | any,
  redirectUrl: string = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
): void => {
  try {
    const data: PendingCartData = {
      item,
      redirectUrl: redirectUrl || '/',
      timestamp: Date.now()
    };
    sessionStorage.setItem(PENDING_CART_ITEM_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save pending cart item to sessionStorage:', err);
  }
};

/**
 * Retrieves and clears the pending cart item from sessionStorage.
 */
export const getAndClearPendingCartItem = (): PendingCartData | null => {
  try {
    const raw = sessionStorage.getItem(PENDING_CART_ITEM_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_CART_ITEM_KEY);
    const parsed = JSON.parse(raw);
    if (parsed && !parsed.item) {
      return {
        item: parsed,
        redirectUrl: '/',
        timestamp: Date.now()
      };
    }
    return parsed;
  } catch (err) {
    console.error('Failed to retrieve pending cart item:', err);
    try {
      sessionStorage.removeItem(PENDING_CART_ITEM_KEY);
    } catch {}
    return null;
  }
};

/**
 * Inspects the pending cart item without removing it.
 */
export const peekPendingCartItem = (): CartItem | null => {
  try {
    const raw = sessionStorage.getItem(PENDING_CART_ITEM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.item || parsed;
  } catch {
    return null;
  }
};

/**
 * Redirects an anonymous visitor to the login page with the pending cart item preserved.
 */
export const promptLoginForAddToCart = (
  navigate: (path: string, options?: any) => void,
  item: CartItem | any,
  currentPath: string = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
): void => {
  savePendingCartItem(item, currentPath);
  const itemName = item.title || (item as any).name || 'this product';

  navigate('/login', {
    state: {
      redirect: currentPath || '/',
      from: currentPath || '/',
      message: `Please log in or create an account to add "${itemName}" to your cart and proceed.`,
      pendingCartItem: item
    }
  });
};
