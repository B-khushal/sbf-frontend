import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '@/services/api';
import ShopPage from './ShopPage';
import NotFound from './NotFound';
import { Loader2 } from 'lucide-react';
import { useSeasonalCampaign } from '@/contexts/SeasonalCampaignContext';

const SeasonalCampaignPage = lazy(() => import('./SeasonalCampaignPage'));

const CategoryResolver: React.FC = () => {
  const { categorySlug } = useParams<{ parentCategory?: string; categorySlug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeCampaigns } = useSeasonalCampaign();
  const [loading, setLoading] = useState(true);
  const [resolvedCategory, setResolvedCategory] = useState<any>(null);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const currentPath = location.pathname;
  const normalizedPath = currentPath.replace(/^\/+|\/+$/g, '').toLowerCase();
  
  let campaignSlug = normalizedPath;
  if (normalizedPath.startsWith('occasions/')) {
    campaignSlug = normalizedPath.substring('occasions/'.length);
  }

  const activeCampaign = activeCampaigns.find(
    (campaign) => campaign.slug.toLowerCase() === campaignSlug
  );

  useEffect(() => {
    const resolveUrl = async () => {
      try {
        setLoading(true);
        setError(false);
        setResolvedCategory(null);
        setShouldRedirect(null);

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

        // Seasonal campaign slugs take precedence over category resolution.
        if (activeCampaign) {
          setLoading(false);
          return;
        }

        const segments = normalizedPath.split('/').filter(Boolean);
        const subSlugCandidate = categorySlug || (segments.length === 2 ? segments[1] : null);

        const response = await api.get(`/categories/resolve?url=${encodeURIComponent(currentPath)}`);

        if (response.data.redirect) {
          const toUrl = response.data.to;
          if (toUrl && toUrl.toLowerCase() !== currentPath.toLowerCase()) {
            setShouldRedirect(toUrl);
            return;
          }
        }

        if (response.data.category) {
          const category = response.data.category;
          // If the resolved category has a slug, and this is a multi-segment URL like /flowers/roses,
          // redirect to the canonical collection route /:slug (e.g. /roses)
          if (category.slug && segments.length >= 2) {
            const canonicalPath = `/${category.slug}`;
            if (canonicalPath.toLowerCase() !== currentPath.toLowerCase()) {
              setShouldRedirect(canonicalPath);
              return;
            }
          }
          setResolvedCategory(category);
        } else if (subSlugCandidate) {
          // If no direct category returned but subSlugCandidate exists, redirect to /:slug
          setShouldRedirect(`/${subSlugCandidate}`);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error resolving category URL:', err);
        const segments = normalizedPath.split('/').filter(Boolean);
        const subSlugCandidate = categorySlug || (segments.length === 2 ? segments[1] : null);
        if (subSlugCandidate) {
          setShouldRedirect(`/${subSlugCandidate}`);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    resolveUrl();
  }, [activeCampaign, currentPath, categorySlug, normalizedPath]);

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

  if (shouldRedirect && shouldRedirect.toLowerCase() !== currentPath.toLowerCase()) {
    // Perform browser redirect
    navigate(shouldRedirect, { replace: true });
    return null;
  }

  if (activeCampaign) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-2 border-primary mx-auto" />
        </div>
      }>
        <SeasonalCampaignPage slug={activeCampaign.slug} />
      </Suspense>
    );
  }

  if (error || !resolvedCategory) {
    return <NotFound />;
  }

  // Pass resolved category to ShopPage
  return <ShopPage resolvedCategory={resolvedCategory} />;
};

export default CategoryResolver;
