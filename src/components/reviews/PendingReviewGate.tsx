import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import usePendingReviewStore from '@/hooks/use-pending-review';
import DeliveredOrderReviewDrawer from './DeliveredOrderReviewDrawer';

export const PendingReviewGate: React.FC = () => {
  const { isAuthenticated, user, isAuthLoading } = useAuth();
  const { checkPendingReviews } = usePendingReviewStore();
  const lastCheckedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      const currentUserId = user.id || (user as any)._id;
      // When user changes or on first mount when authenticated
      if (lastCheckedUserRef.current !== currentUserId) {
        lastCheckedUserRef.current = currentUserId;
        // Check for pending reviews on delivered orders, auto-opening drawer if any exist
        checkPendingReviews(true);
      }
    } else if (!isAuthenticated) {
      lastCheckedUserRef.current = null;
      usePendingReviewStore.getState().resetState();
    }
  }, [isAuthenticated, user, isAuthLoading, checkPendingReviews]);

  return <DeliveredOrderReviewDrawer />;
};

export default PendingReviewGate;
