import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageVisit } from '@/services/activityService';
import { marketingTracker } from '@/services/marketingTracker';

const ActivityRouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const currentUrl = `${location.pathname}${location.search}`;

    if (location.pathname.startsWith('/api')) {
      return;
    }

    void trackPageVisit(currentUrl);

    // Track marketing storefront pageview (exclude internal panels like /admin and /marketing)
    if (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/marketing')) {
      marketingTracker.trackPageView(location.pathname);
    }
  }, [location.pathname, location.search]);

  return null;
};

export default ActivityRouteTracker;
