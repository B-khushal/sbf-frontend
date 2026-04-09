import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageVisit } from '@/services/activityService';

const ActivityRouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const currentUrl = `${location.pathname}${location.search}`;

    if (location.pathname.startsWith('/api')) {
      return;
    }

    void trackPageVisit(currentUrl);
  }, [location.pathname, location.search]);

  return null;
};

export default ActivityRouteTracker;
