import React, { useLayoutEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  breadcrumbs?: BreadcrumbItem[];
}

export const SITE_ORIGIN = 'https://sbflorist.in';
export const DEFAULT_BRAND = 'Spring Blossoms Florist';
export const DEFAULT_OG_IMAGE = 'https://sbflorist.in/images/logo_final.png';

export const serializeJsonLd = (schema: Record<string, any>): string =>
  JSON.stringify(schema).replace(/</g, '\\u003c');

export const cleanCanonicalUrl = (url?: string): string => {
  if (!url) {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/\/+$/, '');
      return path ? `${SITE_ORIGIN}${path}` : `${SITE_ORIGIN}/`;
    }
    return `${SITE_ORIGIN}/`;
  }

  let normalized = url.trim();
  if (normalized === '/') {
    return `${SITE_ORIGIN}/`;
  }
  if (normalized.startsWith('/')) {
    normalized = `${SITE_ORIGIN}${normalized}`;
  }

  // Ensure https and correct domain
  try {
    const parsed = new URL(normalized);
    parsed.protocol = 'https:';
    parsed.host = 'sbflorist.in';
    // Remove query params from canonical unless explicitly intended
    parsed.search = '';
    parsed.hash = '';
    const finalPath = parsed.pathname.replace(/\/+$/, '');
    return finalPath ? `${parsed.origin}${finalPath}` : `${parsed.origin}/`;
  } catch (e) {
    return normalized;
  }
};

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonical,
  keywords,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
  breadcrumbs,
}) => {
  const finalTitle = title ? (title.includes('Spring Blossoms') || title.includes('SB Florist') ? title : `${title} | ${DEFAULT_BRAND}`) : `Flower Delivery in Hyderabad | ${DEFAULT_BRAND}`;
  const finalDesc = description || 'Send fresh flower bouquets, roses and thoughtful gifts with Spring Blossoms Florist in Hyderabad. Explore flowers for birthdays, anniversaries and special occasions.';
  const finalCanonical = cleanCanonicalUrl(canonical);
  const finalOgImage = ogImage.startsWith('/') ? `${SITE_ORIGIN}${ogImage}` : ogImage;

  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      const staticScripts = document.head.querySelectorAll('script[data-prerendered-seo]');
      staticScripts.forEach((el) => el.parentNode?.removeChild(el));
    }
  }, [finalCanonical]);

  // Build breadcrumb JSON-LD if provided
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item === '/' ? `${SITE_ORIGIN}/` : (crumb.item.startsWith('/') ? `${SITE_ORIGIN}${crumb.item}` : crumb.item),
    })),
  } : null;

  const schemasToRender: Array<Record<string, any>> = [];
  if (jsonLd) {
    if (Array.isArray(jsonLd)) {
      schemasToRender.push(...jsonLd);
    } else {
      schemasToRender.push(jsonLd);
    }
  }
  if (breadcrumbSchema) {
    schemasToRender.push(breadcrumbSchema);
  }

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={finalCanonical} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:site_name" content={DEFAULT_BRAND} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* JSON-LD Schemas */}
      {schemasToRender.map((schema, index) => (
        <script key={`seo-schema-${index}`} type="application/ld+json">
          {serializeJsonLd(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
