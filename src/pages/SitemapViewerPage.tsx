import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Globe, 
  FileText, 
  FolderTree, 
  Package, 
  Calendar, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  RefreshCw,
  Code,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';

interface SitemapMeta {
  id: string;
  name: string;
  url: string;
  uiPath?: string;
  label: string;
  count: number;
}

interface SitemapRow {
  idx: number;
  title: string;
  url: string;
  lastmod: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  image?: string;
}

interface ChildCard {
  id?: string;
  name: string;
  url: string;
  uiPath?: string;
  title: string;
  desc: string;
  count: number;
  badge: string;
  color: string;
  bg: string;
}

interface SitemapData {
  type: string;
  currentTitle: string;
  currentSubtitle: string;
  currentFile: string;
  isIndex: boolean;
  pagesCount: number;
  catCount: number;
  prodCount: number;
  occCount: number;
  sitemapsMeta: SitemapMeta[];
  rows: SitemapRow[];
  childCards: ChildCard[];
}

const SECTION_UI_PATHS: Record<string, string> = {
  index: '/sitemap',
  pages: '/sitemap/pages',
  categories: '/sitemap/categories',
  products: '/sitemap/products',
  occasions: '/sitemap/occasions'
};

export const SitemapViewerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();

  // Determine active sitemap type from URL pathname or :section param
  const currentType = useMemo(() => {
    const sec = (section || '').toLowerCase();
    if (sec === 'categories') return 'categories';
    if (sec === 'products') return 'products';
    if (sec === 'occasions') return 'occasions';
    if (sec === 'pages' || sec === 'static') return 'pages';

    const path = location.pathname.toLowerCase();
    if (path.includes('categories')) return 'categories';
    if (path.includes('products')) return 'products';
    if (path.includes('occasions')) return 'occasions';
    if (path.includes('pages') || path.includes('static')) return 'pages';
    return 'index';
  }, [location.pathname, section]);

  const [data, setData] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try same-origin /api/seo/sitemap-data first (proxied by frontend server/Vite),
      // then fall back to configured API client if needed.
      const sameOriginRes = await fetch(`/api/seo/sitemap-data?type=${encodeURIComponent(currentType)}`, {
        headers: { Accept: 'application/json' }
      });
      if (sameOriginRes.ok) {
        const json = await sameOriginRes.json();
        if (json?.success && json?.data) {
          setData(json.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall back to configured axios instance
    }

    try {
      const res = await api.get('/seo/sitemap-data', {
        params: { type: currentType }
      });
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
        setLoading(false);
        return;
      }
      throw new Error('Unexpected response format from sitemap API');
    } catch (err: any) {
      console.error('Error fetching sitemap data:', err);
      setError(err?.message || 'Unable to load live sitemap data. Please try again.');
      setLoading(false);
    }
  }, [currentType]);

  const rawXmlUrl = useMemo(() => {
    const file = data?.currentFile || (currentType === 'index' ? 'sitemap.xml' : `sitemap-${currentType}.xml`);
    return `/${file}`;
  }, [data?.currentFile, currentType]);

  const canonicalUiUrl = useMemo(() => {
    const uiPath = SECTION_UI_PATHS[currentType] || '/sitemap';
    return `https://sbflorist.in${uiPath}`;
  }, [currentType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const linkEl = document.querySelector('link[rel="canonical"]');
    if (linkEl) {
      linkEl.setAttribute('href', canonicalUiUrl);
    }
  }, [canonicalUiUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    if (!searchQuery.trim()) return data.rows;
    const q = searchQuery.toLowerCase().trim();
    return data.rows.filter(
      (r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
    );
  }, [data?.rows, searchQuery]);

  // Filter child cards in index view if search query is active
  const filteredChildCards = useMemo(() => {
    if (!data?.childCards) return [];
    if (!searchQuery.trim()) return data.childCards;
    const q = searchQuery.toLowerCase().trim();
    return data.childCards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)
    );
  }, [data?.childCards, searchQuery]);

  const getUiPathForCard = (card: ChildCard): string => {
    if (card.uiPath) return card.uiPath;
    if (card.id && SECTION_UI_PATHS[card.id]) return SECTION_UI_PATHS[card.id];
    if (card.name.includes('pages')) return '/sitemap/pages';
    if (card.name.includes('categories')) return '/sitemap/categories';
    if (card.name.includes('products')) return '/sitemap/products';
    if (card.name.includes('occasions')) return '/sitemap/occasions';
    return '/sitemap';
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 font-sans antialiased">
      <Helmet>
        <title>{data?.currentTitle ? `${data.currentTitle} | Spring Blossoms Florist` : 'Sitemap Directory | Spring Blossoms Florist'}</title>
        <meta name="description" content={data?.currentSubtitle || 'Official Sitemap directory for Spring Blossoms Florist Hyderabad & Secunderabad.'} />
        <link rel="canonical" href={canonicalUiUrl} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Top Header Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
          <Link to="/" className="hover:text-rose-700 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/sitemap" className="hover:text-rose-700 transition">Sitemap</Link>
          {currentType !== 'index' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-semibold">{data?.currentFile || `sitemap-${currentType}.xml`}</span>
            </>
          )}
        </nav>

        {/* Brand Banner Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-700">
                  Spring Blossoms Florist
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Live Verified Sitemap
                </span>
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
                A Reason to Express • Hyderabad &amp; Secunderabad
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href={rawXmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200 shadow-xs"
                title="View standard machine-readable XML format"
              >
                <Code className="w-3.5 h-3.5 text-slate-500" />
                Raw XML ({data?.currentFile || 'sitemap.xml'})
              </a>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white transition shadow-xs"
              >
                Explore Shop
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="pt-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {data?.currentTitle || 'XML Sitemap Index'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {data?.currentSubtitle || 'Master sitemap index containing discoverable URLs and sub-sitemaps for sbflorist.in.'}
            </p>
          </div>
        </div>

        {/* Sub-Sitemaps Navigation Tabs */}
        {data?.sitemapsMeta && (
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Sitemap Sections">
            {data.sitemapsMeta.map((tab) => {
              const isActive = tab.id === currentType;
              const targetPath = tab.uiPath || SECTION_UI_PATHS[tab.id] || '/sitemap';
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(targetPath)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shadow-xs ${
                    isActive
                      ? 'bg-rose-700 text-white shadow-rose-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {tab.id === 'index' && <Globe className="w-4 h-4" />}
                  {tab.id === 'pages' && <FileText className="w-4 h-4" />}
                  {tab.id === 'categories' && <FolderTree className="w-4 h-4" />}
                  {tab.id === 'products' && <Package className="w-4 h-4" />}
                  {tab.id === 'occasions' && <Calendar className="w-4 h-4" />}
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-rose-800 text-rose-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mt-6 bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-900">Unable to load live sitemap directory</h2>
            <p className="text-xs text-slate-600 mt-1 mb-4">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Loading
              </button>
              <a
                href={rawXmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
              >
                <Code className="w-3.5 h-3.5" />
                Open Raw XML
              </a>
            </div>
          </div>
        )}

        {/* Index View: Child Cards Grid */}
        {!error && data?.isIndex && (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Included Sub-Sitemaps ({data.childCards.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredChildCards.map((card) => {
                const uiTarget = getUiPathForCard(card);
                return (
                  <div
                    key={card.name}
                    onClick={() => navigate(uiTarget)}
                    className="bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-5 cursor-pointer transition hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-bold"
                          style={{ color: card.color, backgroundColor: card.bg }}
                        >
                          {card.badge}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-700 group-hover:translate-x-0.5 transition" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                      <span className="text-rose-700 flex items-center gap-1">
                        Browse Section
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <a
                        href={`/${card.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition"
                        title={`Open raw ${card.name}`}
                      >
                        XML
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search & URL Directory Card */}
        {!error && (
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Search Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={data?.isIndex ? 'Filter sub-sitemaps...' : 'Filter URLs in this sitemap...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                />
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {loading ? (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Loading URLs...
                  </span>
                ) : (
                  <span>
                    Showing {data?.isIndex ? filteredChildCards.length : filteredRows.length} of{' '}
                    {data?.isIndex ? data.childCards.length : data?.rows.length || 0} items
                  </span>
                )}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-rose-700 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">Loading sitemap records...</p>
                <p className="text-xs text-slate-400 mt-1">Fetching live index from Spring Blossoms Florist</p>
              </div>
            ) : data?.isIndex ? (
              /* Index Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Sub-Sitemap Section</th>
                      <th className="py-3 px-4">XML Endpoint</th>
                      <th className="py-3 px-4 text-center">URLs</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredChildCards.map((card, idx) => {
                      const uiTarget = getUiPathForCard(card);
                      return (
                        <tr key={card.name} className="hover:bg-slate-50/80 transition group">
                          <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-rose-700 transition">
                            <Link to={uiTarget} className="hover:underline">
                              {card.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-rose-700">
                            <a
                              href={`/${card.name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline inline-flex items-center gap-1.5"
                            >
                              {card.url}
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                              {card.count}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                to={uiTarget}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                              >
                                Browse
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                              <a
                                href={`/${card.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                              >
                                XML
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Child Sitemap Rows Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Page / Product Destination</th>
                      <th className="py-3 px-4">Canonical URL</th>
                      <th className="py-3 px-4 text-center">Category</th>
                      <th className="py-3 px-4 text-center">Last Modified</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          {searchQuery ? `No URLs match "${searchQuery}"` : 'No URLs found in this sitemap section.'}
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => {
                        const isCopied = copiedUrl === row.url;
                        return (
                          <tr key={row.url} className="hover:bg-slate-50/80 transition group">
                            <td className="py-3 px-4 text-center font-mono text-slate-400">{row.idx}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {row.image && (
                                  <img
                                    src={row.image}
                                    alt={row.title}
                                    className="w-9 h-9 rounded-md object-cover border border-slate-200 bg-slate-50 shrink-0"
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                )}
                                <div>
                                  <a
                                    href={row.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-slate-900 group-hover:text-rose-700 hover:underline transition flex items-center gap-1"
                                  >
                                    {row.title}
                                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-rose-600 transition" />
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-500">
                              <span className="truncate block max-w-xs">{row.url}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {row.badge && (
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-semibold"
                                  style={{ color: row.badgeColor || '#059669', backgroundColor: row.badgeBg || '#ecfdf5' }}
                                >
                                  {row.badge}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">
                              <span className="px-2 py-1 rounded bg-slate-100 font-mono text-xs">
                                {row.lastmod}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => copyToClipboard(row.url)}
                                  title="Copy Canonical URL"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                >
                                  {isCopied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <a
                                  href={row.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                                >
                                  Visit
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer info note */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Spring Blossoms Florist. All URLs canonicalized and synchronized with search engines.</p>
          <div className="flex items-center gap-4">
            <Link to="/faq" className="hover:text-rose-700 transition">FAQ Help Hub</Link>
            <Link to="/contact" className="hover:text-rose-700 transition">Contact Us</Link>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-rose-700 transition">XML Sitemap Index</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapViewerPage;
