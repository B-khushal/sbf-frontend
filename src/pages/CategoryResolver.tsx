import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import api from '@/services/api';
import ShopPage, { TARGET_CATEGORY_SEO } from './ShopPage';
import NotFound from './NotFound';
import { Loader2 } from 'lucide-react';
import { useSeasonalCampaign } from '@/contexts/SeasonalCampaignContext';
import { useSettings } from '@/contexts/SettingsContext';
import {
  getCachedResolvedCategory,
  setCachedResolvedCategory,
} from '@/services/catalogCache';

const SeasonalCampaignPage = lazy(() => import('./SeasonalCampaignPage'));

const STATIC_ROUTES = [
  '/about', '/contact', '/login', '/signup', '/register', '/profile', '/account', '/orders', '/cart', '/wishlist',
  '/checkout', '/admin', '/vendor', '/terms', '/privacy', '/shipping',
  '/refund-policy', '/cancellation-policy', '/faq', '/faqs', '/sitemap', '/site-map', '/blog',
];

const CategoryResolver: React.FC = () => {
  const { categorySlug } = useParams<{ parentCategory?: string; categorySlug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSeasonalCampaignSlug } = useSeasonalCampaign();
  const { shopCategories, categories: settingsCategories } = useSettings();

  const currentPath = location.pathname;
  const normalizedPath = currentPath.replace(/^\/+|\/+$/g, '').toLowerCase();

  let campaignSlug = normalizedPath;
  if (normalizedPath.startsWith('occasions/')) {
    campaignSlug = normalizedPath.substring('occasions/'.length);
  }

  const isSeasonal = isSeasonalCampaignSlug(campaignSlug);

  // Synchronously match against already-loaded SettingsContext categories (0ms wait when navigating from HomePage)
  const instantSettingsMatch = useMemo(() => {
    const pool = [...(shopCategories || []), ...(settingsCategories || [])];
    if (pool.length === 0) return null;

    return (
      pool.find((cat) => {
        const slug = String(cat.slug || '')
          .replace(/^\/+|\/+$/g, '')
          .toLowerCase();
        const link = String((cat as { categoryUrl?: string; link?: string }).categoryUrl || cat.link || '')
          .replace(/^\/+|\/+$/g, '')
          .toLowerCase();
        const nameSlug = String(cat.name || '')
          .toLowerCase()
          .replace(/&/g, ' and ')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');

        return slug === normalizedPath || link === normalizedPath || nameSlug === normalizedPath;
      }) || null
    );
  }, [shopCategories, settingsCategories, normalizedPath]);

  const cachedResolution = getCachedResolvedCategory(currentPath) as {
    category?: Record<string, unknown>;
    redirect?: boolean;
    to?: string;
  } | null;

  const [loading, setLoading] = useState<boolean>(
    () => !instantSettingsMatch && !cachedResolution?.category
  );
  const [resolvedCategory, setResolvedCategory] = useState<Record<string, unknown> | null>(
    () => (cachedResolution?.category || (instantSettingsMatch as unknown as Record<string, unknown>) || null)
  );
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(
    () => (cachedResolution?.redirect && cachedResolution?.to ? cachedResolution.to : null)
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const resolveUrl = async () => {
      try {
        setError(false);
        setShouldRedirect(null);

        if (STATIC_ROUTES.some((route) => currentPath.startsWith(route))) {
          if (active) {
            setError(true);
            setLoading(false);
          }
          return;
        }

        if (isSeasonal) {
          if (active) setLoading(false);
          return;
        }

        const cached = getCachedResolvedCategory(currentPath) as {
          category?: Record<string, unknown>;
          redirect?: boolean;
          to?: string;
        } | null;

        if (cached) {
          if (active) {
            if (cached.redirect && cached.to && cached.to.toLowerCase() !== currentPath.toLowerCase()) {
              setShouldRedirect(cached.to);
            } else if (cached.category) {
              setResolvedCategory(cached.category);
            }
            setLoading(false);
          }
          return;
        }

        // If we already matched from SettingsContext, render immediately without blocking spinner!
        if (instantSettingsMatch) {
          if (active) {
            setResolvedCategory(instantSettingsMatch as unknown as Record<string, unknown>);
            setLoading(false);
          }
        } else {
          if (active) {
            setLoading(true);
            setResolvedCategory(null);
          }
        }

        const segments = normalizedPath.split('/').filter(Boolean);
        const subSlugCandidate = categorySlug || (segments.length === 2 ? segments[1] : null);

        const response = await api.get(`/categories/resolve?url=${encodeURIComponent(currentPath)}`);
        if (!active) return;

        setCachedResolvedCategory(currentPath, response.data);

        if (response.data.redirect) {
          const toUrl = response.data.to;
          if (toUrl && toUrl.toLowerCase() !== currentPath.toLowerCase()) {
            setShouldRedirect(toUrl);
            return;
          }
        }

        if (response.data.category) {
          const category = response.data.category;
          if (category.slug && segments.length >= 2) {
            const canonicalPath = `/${category.slug}`;
            if (canonicalPath.toLowerCase() !== currentPath.toLowerCase()) {
              setShouldRedirect(canonicalPath);
              return;
            }
          }
          setResolvedCategory(category);
        } else if (!instantSettingsMatch) {
          if (subSlugCandidate) {
            setShouldRedirect(`/${subSlugCandidate}`);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (!active) return;
        console.error('Error resolving category URL:', err);
        if (!instantSettingsMatch) {
          const segments = normalizedPath.split('/').filter(Boolean);
          const subSlugCandidate = categorySlug || (segments.length === 2 ? segments[1] : null);
          if (subSlugCandidate) {
            setShouldRedirect(`/${subSlugCandidate}`);
          } else {
            setError(true);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    resolveUrl();
    return () => {
      active = false;
    };
  }, [isSeasonal, currentPath, categorySlug, normalizedPath, instantSettingsMatch]);

  if (isSeasonal && normalizedPath.startsWith('occasions/')) {
    return <Navigate to={`/${campaignSlug}`} replace />;
  }

  if (isSeasonal) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-2 border-primary mx-auto" />
          </div>
        }
      >
        <SeasonalCampaignPage slug={campaignSlug} />
      </Suspense>
    );
  }

  const targetSeoConfig = TARGET_CATEGORY_SEO[normalizedPath];
  const fallbackCategory = targetSeoConfig
    ? {
        slug: normalizedPath,
        name: targetSeoConfig.h1,
        metaTitle: targetSeoConfig.title,
        metaDescription: targetSeoConfig.description,
        categoryUrl: targetSeoConfig.canonical,
      }
    : null;

  if (shouldRedirect && shouldRedirect.toLowerCase() !== currentPath.toLowerCase()) {
    navigate(shouldRedirect, { replace: true });
    return null;
  }

  const activeCategory = resolvedCategory || instantSettingsMatch || fallbackCategory;
  if (activeCategory) {
    return <ShopPage resolvedCategory={activeCategory} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-10 w-10 text-[#BE185D] mx-auto mb-3" />
          <p className="text-[#6F665E] text-sm font-medium">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !resolvedCategory) {
    return <NotFound />;
  }

  return <ShopPage resolvedCategory={resolvedCategory} />;
};

export default CategoryResolver;
