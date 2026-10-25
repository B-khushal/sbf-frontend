import { create } from 'zustand';
import {
  getPendingDeliveredReviews,
  type PendingDeliveredReviewItem,
} from '@/services/reviewService';

interface PendingReviewState {
  hasPendingReview: boolean;
  pendingItems: PendingDeliveredReviewItem[];
  isDrawerOpen: boolean;
  activeItem: PendingDeliveredReviewItem | null;
  blockReason: string | null;
  isLoading: boolean;
  lastCheckedAt: number | null;

  // Actions
  checkPendingReviews: (autoOpen?: boolean) => Promise<boolean>;
  openDrawer: (reason?: string, item?: PendingDeliveredReviewItem) => void;
  closeDrawer: () => void;
  setActiveItem: (item: PendingDeliveredReviewItem) => void;
  markItemReviewed: (orderId: string, productId: string) => void;
  resetState: () => void;
}

export const usePendingReviewStore = create<PendingReviewState>((set, get) => ({
  hasPendingReview: false,
  pendingItems: [],
  isDrawerOpen: false,
  activeItem: null,
  blockReason: null,
  isLoading: false,
  lastCheckedAt: null,

  checkPendingReviews: async (autoOpen = false) => {
    const isAuth =
      localStorage.getItem('isAuthenticated') === 'true' ||
      Boolean(localStorage.getItem('token'));

    if (!isAuth) {
      set({
        hasPendingReview: false,
        pendingItems: [],
        activeItem: null,
        isDrawerOpen: false,
        blockReason: null,
      });
      return false;
    }

    set({ isLoading: true });
    try {
      const data = await getPendingDeliveredReviews();
      const hasPending = Boolean(data?.hasPendingReview && data?.pendingItems?.length > 0);
      const items = data?.pendingItems || [];
      const currentActive = get().activeItem;

      // Keep active item if still pending, otherwise select first pending
      const nextActive =
        items.find(
          (i) =>
            i.orderId === currentActive?.orderId &&
            i.productId === currentActive?.productId
        ) || items[0] || null;

      set({
        hasPendingReview: hasPending,
        pendingItems: items,
        activeItem: nextActive,
        isLoading: false,
        lastCheckedAt: Date.now(),
        ...(hasPending && autoOpen ? { isDrawerOpen: true } : {}),
      });

      return hasPending;
    } catch (error) {
      console.warn('Failed to check pending reviews:', error);
      set({ isLoading: false });
      return false;
    }
  },

  openDrawer: (reason?: string, item?: PendingDeliveredReviewItem) => {
    const current = get();
    set({
      isDrawerOpen: true,
      blockReason: reason || null,
      activeItem: item || current.activeItem || current.pendingItems[0] || null,
    });
  },

  closeDrawer: () => {
    set({
      isDrawerOpen: false,
      blockReason: null,
    });
  },

  setActiveItem: (item: PendingDeliveredReviewItem) => {
    set({ activeItem: item });
  },

  markItemReviewed: (orderId: string, productId: string) => {
    const currentItems = get().pendingItems;
    const remaining = currentItems.filter(
      (item) => !(item.orderId === orderId && item.productId === productId)
    );

    const hasPending = remaining.length > 0;
    set({
      pendingItems: remaining,
      hasPendingReview: hasPending,
      activeItem: remaining[0] || null,
      blockReason: null,
    });

    // Re-verify from server in background
    setTimeout(() => {
      get().checkPendingReviews(false);
    }, 1200);
  },

  resetState: () => {
    set({
      hasPendingReview: false,
      pendingItems: [],
      isDrawerOpen: false,
      activeItem: null,
      blockReason: null,
      isLoading: false,
      lastCheckedAt: null,
    });
  },
}));

export default usePendingReviewStore;
