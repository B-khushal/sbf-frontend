import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/services/api';
import ShopPage from './ShopPage';
import NotFound from './NotFound';
import { Loader2 } from 'lucide-react';

const CategoryResolver: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resolvedCategory, setResolvedCategory] = useState<any>(null);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const resolveUrl = async () => {
      try {
        setLoading(true);
        setError(false);
        const currentPath = location.pathname;

        // Skip static page routes if caught here by mistake (defensive check)
        const staticRoutes = [
          '/about', '/contact', '/login', '/signup', '/profile', '/cart', '/wishlist',
          '/checkout', '/admin', '/vendor', '/terms', '/privacy', '/shipping',
          '/refund-policy', '/cancellation-policy'
        ];
        
        if (staticRoutes.some(route => currentPath.startsWith(route))) {
          setError(true);
          setLoading(false);
          return;
        }

        const response = await api.get(`/categories/resolve?url=${encodeURIComponent(currentPath)}`);

        if (response.data.redirect) {
          setShouldRedirect(response.data.to);
        } else {
          setResolvedCategory(response.data.category);
        }
      } catch (err) {
        console.error('Error resolving category URL:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    resolveUrl();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Resolving category...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    // Perform browser redirect
    navigate(shouldRedirect, { replace: true });
    return null;
  }

  if (error || !resolvedCategory) {
    return <NotFound />;
  }

  // Pass resolved category to ShopPage
  return <ShopPage resolvedCategory={resolvedCategory} />;
};

export default CategoryResolver;
