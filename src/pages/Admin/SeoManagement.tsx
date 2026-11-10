import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Wand2, 
  Download, 
  Upload, 
  RefreshCw, 
  Eye, 
  Globe, 
  Smartphone, 
  Monitor, 
  Layers, 
  Check, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  HelpCircle,
  FolderTree,
  Tag,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { evaluateSeoScore, generateProductSeo } from '@/utils/seoGenerator';
import { cn } from '@/lib/utils';

interface SeoStats {
  totalProducts: number;
  optimizedCount: number;
  unoptimizedCount: number;
  manualCount: number;
  optimizationRate: number;
  averageScore: number;
  missingTitleCount: number;
  missingDescCount: number;
  missingAltCount: number;
  categoriesCount: number;
}

interface ProductSeoItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  image: string;
  imageAlt: string;
  isVisible: boolean;
  seoSettings: {
    focusKeyword: string;
    secondaryKeywords: string[] | string;
    seoTitle: string;
    metaDescription: string;
    slug: string;
    h1: string;
    imageAlt: string;
    canonicalUrl: string;
    noindex: boolean;
    isManual: boolean;
    score: number;
    warnings: string[];
    passed: string[];
  };
  updatedAt: string;
}

interface CategorySeoItem {
  id: string;
  name: string;
  slug: string;
  categoryUrl: string;
  canonicalUrl?: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword?: string;
  seoIntro?: string;
  seoContent?: string;
  hasCustomSeo: boolean;
  productCount: number;
  updatedAt: string;
}

interface BlogSeoItem {
  id: string;
  slug: string;
  title: string;
  h1?: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords?: string[];
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  featuredImage: string;
  imageAlt: string;
  excerpt: string;
  relatedCategories?: string[];
  noIndex?: boolean;
  sections?: Array<{ heading: string; body: string; bullets?: string[] }>;
  faqs?: Array<{ question: string; answer: string }>;
}

export const SeoManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'blogs' | 'health' | 'global'>('products');

  // Stats
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Products Table
  const [products, setProducts] = useState<ProductSeoItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all'); // all, good, fair, poor, missing
  const [missingFilter, setMissingFilter] = useState('all'); // all, title, desc, alt

  // Categories
  const [categories, setCategories] = useState<CategorySeoItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [bulkCatGenerating, setBulkCatGenerating] = useState(false);

  // Blogs
  const [blogs, setBlogs] = useState<BlogSeoItem[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogSeoItem | null>(null);
  const [isNewBlog, setIsNewBlog] = useState(false);
  const [savingBlog, setSavingBlog] = useState(false);

  // Health Audit
  const [healthAudit, setHealthAudit] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Global SEO Settings
  const [globalSettings, setGlobalSettings] = useState<any>({
    siteTitle: 'Spring Blossoms Florist | Buy Flowers & Gifts Online in India',
    brandName: 'Spring Blossoms Florist',
    tagline: 'A Reason to Express',
    defaultMetaDescription: 'Order fresh flower bouquets, luxury roses, tulips, orchids, cakes, chocolates, and thoughtful gifts online from Spring Blossoms Florist. Same-day & midnight delivery in Hyderabad, Secunderabad & across India.',
    canonicalDomain: 'https://sbflorist.in',
    defaultOgImage: 'https://sbflorist.in/images/og-preview.jpg',
    twitterHandle: '@sbflorist_in',
    organizationPhone: '+91-9949683222',
    organizationEmail: '2006sbf@gmail.com',
    organizationAddress: 'Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028',
    organizationCity: 'Hyderabad',
    organizationState: 'Telangana',
    organizationPostalCode: '500028',
    organizationCountry: 'IN',
    defaultRobots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    googleSiteVerification: '',
    bingSiteVerification: '',
    ga4MeasurementId: '',
    enableAutoProductSeo: true,
    enableAutoSitemapPing: true,
  });
  const [globalLoading, setGlobalLoading] = useState(false);
  const [savingGlobal, setSavingGlobal] = useState(false);

  // Bulk Operations
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<ProductSeoItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    focusKeyword: '',
    secondaryKeywords: '',
    seoTitle: '',
    metaDescription: '',
    slug: '',
    h1: '',
    imageAlt: '',
    canonicalUrl: '',
    noindex: false,
    ogImage: ''
  });
  const [savingSeo, setSavingSeo] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Edit Category Modal
  const [editingCategory, setEditingCategory] = useState<CategorySeoItem | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    metaTitle: '',
    metaDescription: '',
    slug: '',
    categoryUrl: '',
    canonicalUrl: '',
    h1: '',
    focusKeyword: '',
    seoIntro: '',
    seoContent: ''
  });
  const [savingCategory, setSavingCategory] = useState(false);

  // Load Overview Stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/seo/admin/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err: any) {
      console.error('Failed to load SEO stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load Products SEO
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        search,
        category: categoryFilter,
        scoreFilter,
        missing: missingFilter
      });
      const res = await api.get(`/seo/admin/products?${params.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load products SEO',
        variant: 'destructive'
      });
    } finally {
      setProductsLoading(false);
    }
  };

  // Load Categories SEO
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await api.get('/seo/admin/categories');
      if (res.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err: any) {
      console.error('Failed to load categories SEO:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load Blogs SEO
  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);
      const res = await api.get('/seo/admin/blogs');
      if (res.data?.success) {
        setBlogs(res.data.blogs || []);
      }
    } catch (err: any) {
      console.error('Failed to load blogs SEO:', err);
    } finally {
      setBlogsLoading(false);
    }
  };

  // Load Health Audit
  const fetchHealthAudit = async () => {
    try {
      setHealthLoading(true);
      const res = await api.get('/seo/admin/health');
      if (res.data?.success) {
        setHealthAudit(res.data.audit || null);
      }
    } catch (err: any) {
      console.error('Failed to load SEO health audit:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  // Load Global Settings
  const fetchGlobalSettings = async () => {
    try {
      setGlobalLoading(true);
      const res = await api.get('/seo/admin/global-settings');
      if (res.data?.success && res.data?.settings) {
        setGlobalSettings((prev: any) => ({ ...prev, ...res.data.settings }));
      }
    } catch (err: any) {
      console.error('Failed to load global SEO settings:', err);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'blogs') {
      fetchBlogs();
    } else if (activeTab === 'health') {
      fetchHealthAudit();
    } else if (activeTab === 'global') {
      fetchGlobalSettings();
    }
  }, [activeTab, page, search, categoryFilter, scoreFilter, missingFilter]);

  const handleBulkGenerateCategories = async () => {
    try {
      setBulkCatGenerating(true);
      const res = await api.post('/seo/admin/categories/bulk-generate');
      if (res.data?.success) {
        toast({
          title: 'Category SEO Optimized',
          description: res.data.message || 'All categories updated with rich SEO titles, descriptions & H1s.',
        });
        fetchCategories();
        fetchStats();
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to bulk generate category SEO',
        variant: 'destructive',
      });
    } finally {
      setBulkCatGenerating(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!editingBlog) return;
    try {
      setSavingBlog(true);
      const res = isNewBlog
        ? await api.post('/seo/admin/blogs', editingBlog)
        : await api.put(`/seo/admin/blogs/${editingBlog.id}`, editingBlog);
      if (res.data?.success) {
        toast({
          title: isNewBlog ? 'Blog Post Created' : 'Blog Post Updated',
          description: 'Blog article and SEO metadata saved successfully.',
        });
        setEditingBlog(null);
        setIsNewBlog(false);
        fetchBlogs();
      }
    } catch (err: any) {
      toast({
        title: 'Error Saving Blog',
        description: err.response?.data?.message || 'Failed to save blog post',
        variant: 'destructive',
      });
    } finally {
      setSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!window.confirm(`Delete blog post "${title}"?`)) return;
    try {
      const res = await api.delete(`/seo/admin/blogs/${id}`);
      if (res.data?.success) {
        toast({ title: 'Blog Deleted', description: 'Blog article removed.' });
        fetchBlogs();
      }
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to delete blog article', variant: 'destructive' });
    }
  };

  const handleSaveGlobalSettings = async () => {
    try {
      setSavingGlobal(true);
      const res = await api.put('/seo/admin/global-settings', globalSettings);
      if (res.data?.success) {
        toast({
          title: 'Global SEO Saved',
          description: 'Global metadata, organization schema, and Search Console settings updated.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to save global SEO settings',
        variant: 'destructive',
      });
    } finally {
      setSavingGlobal(false);
    }
  };

  // Open Edit Modal for Product
  const handleOpenEditModal = (item: ProductSeoItem) => {
    setEditingProduct(item);
    const seo = item.seoSettings || {};
    const secondaryStr = Array.isArray(seo.secondaryKeywords)
      ? seo.secondaryKeywords.join(', ')
      : String(seo.secondaryKeywords || '');

    setEditFormData({
      focusKeyword: seo.focusKeyword || '',
      secondaryKeywords: secondaryStr,
      seoTitle: seo.seoTitle || '',
      metaDescription: seo.metaDescription || '',
      slug: seo.slug || item.slug || '',
      h1: seo.h1 || item.name || '',
      imageAlt: seo.imageAlt || item.imageAlt || '',
      canonicalUrl: seo.canonicalUrl || `https://sbflorist.in/product/${item.slug || item.id}`,
      noindex: Boolean(seo.noindex),
      ogImage: item.image || ''
    });
  };

  // Live evaluation of current form data in modal
  const liveEvaluation = useMemo(() => {
    if (!editingProduct) return { score: 0, warnings: [], passed: [] };
    return evaluateSeoScore({
      focusKeyword: editFormData.focusKeyword,
      seoTitle: editFormData.seoTitle,
      metaDescription: editFormData.metaDescription,
      h1: editFormData.h1,
      imageAlt: editFormData.imageAlt,
      productName: editingProduct.name
    });
  }, [editingProduct, editFormData]);

  // Handle Auto-Generate single product
  const handleAutoGenerateSingle = () => {
    if (!editingProduct) return;
    const generated = generateProductSeo({
      ...editingProduct,
      title: editingProduct.name
    });

    setEditFormData({
      focusKeyword: generated.focusKeyword,
      secondaryKeywords: generated.secondaryKeywords.join(', '),
      seoTitle: generated.seoTitle,
      metaDescription: generated.metaDescription,
      slug: generated.slug,
      h1: generated.h1,
      imageAlt: generated.imageAlt,
      canonicalUrl: generated.canonicalUrl,
      noindex: generated.noindex,
      ogImage: editingProduct.image || ''
    });

    toast({
      title: 'SEO Generated',
      description: 'Optimized keyword, title, description, and tags generated.',
    });
  };

  // Save Product SEO
  const handleSaveProductSeo = async () => {
    if (!editingProduct) return;
    try {
      setSavingSeo(true);
      const res = await api.put(`/seo/admin/products/${editingProduct.id}`, {
        ...editFormData,
        secondaryKeywords: editFormData.secondaryKeywords.split(',').map(s => s.trim()).filter(Boolean)
      });

      if (res.data?.success) {
        toast({
          title: 'Success',
          description: 'Product SEO settings saved successfully.',
        });
        setEditingProduct(null);
        fetchProducts();
        fetchStats();
      }
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err.response?.data?.message || 'Error saving SEO metadata',
        variant: 'destructive'
      });
    } finally {
      setSavingSeo(false);
    }
  };

  // Bulk Generate Missing SEO
  const handleBulkGenerate = async () => {
    if (!window.confirm('Generate optimized SEO metadata for all products that lack manual customization? (Manually edited SEO will NEVER be overwritten).')) {
      return;
    }
    try {
      setBulkGenerating(true);
      const res = await api.post('/seo/admin/products/bulk-generate', { overwriteNonManual: false });
      if (res.data?.success) {
        toast({
          title: 'Bulk Generation Complete',
          description: res.data.message,
        });
        fetchProducts();
        fetchStats();
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Bulk SEO generation failed',
        variant: 'destructive'
      });
    } finally {
      setBulkGenerating(false);
    }
  };

  // Invalidate Cache
  const handlePurgeSitemapCache = async () => {
    try {
      await api.post('/seo/invalidate-cache');
      toast({
        title: 'Cache Invalidated',
        description: 'Sitemaps and crawler caches purged. Search engines will receive fresh XML immediately.',
      });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to purge cache', variant: 'destructive' });
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/seo/admin/export-csv', '_blank');
  };

  // Import CSV
  const handleImportCsv = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        try {
          setImportingCsv(true);
          const res = await api.post('/seo/admin/import-csv', { csvData: text });
          if (res.data?.success) {
            toast({
              title: 'CSV Import Completed',
              description: res.data.message,
            });
            fetchProducts();
            fetchStats();
          }
        } catch (err: any) {
          toast({
            title: 'Import Failed',
            description: err.response?.data?.message || 'Error processing CSV file',
            variant: 'destructive'
          });
        } finally {
          setImportingCsv(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Save Category SEO
  const handleSaveCategorySeo = async () => {
    if (!editingCategory) return;
    try {
      setSavingCategory(true);
      const res = await api.put(`/seo/admin/categories/${editingCategory.id}`, categoryFormData);
      if (res.data?.success) {
        toast({
          title: 'Category Saved',
          description: 'Category SEO metadata updated successfully.',
        });
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update category SEO',
        variant: 'destructive'
      });
    } finally {
      setSavingCategory(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Technical &amp; On-Page Optimization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SEO Management Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage search intent, keyword clustering, Google SERP previews, and automated metadata across your catalog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePurgeSitemapCache}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-xs gap-1.5"
            title="Purge XML sitemap and crawler HTML cache"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Purge Cache
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportCsv}
            disabled={importingCsv}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-xs gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            {importingCsv ? 'Importing...' : 'Import CSV'}
          </Button>
          <Button
            onClick={handleBulkGenerate}
            disabled={bulkGenerating}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" />
            {bulkGenerating ? 'Generating...' : 'Bulk Generate Missing SEO'}
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Catalog Products
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {statsLoading ? '...' : stats?.totalProducts || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Active indexable catalog
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center text-xl">
            📦
          </div>
        </div>

        {/* Optimized Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Optimization Rate
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {statsLoading ? '...' : `${stats?.optimizationRate || 0}%`}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats?.optimizedCount || 0} of {stats?.totalProducts || 0} products optimized
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center text-xl">
            🎯
          </div>
        </div>

        {/* Average SEO Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Avg Quality Score
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {statsLoading ? '...' : `${stats?.averageScore || 0}/100`}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Title, desc, alt &amp; keyword health
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center text-xl">
            ⭐
          </div>
        </div>

        {/* Manual Overrides */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Manual Customizations
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {statsLoading ? '...' : stats?.manualCount || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Protected from auto-overwrites
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center text-xl">
            🔒
          </div>
        </div>
      </div>

      {/* ── Main Tab Navigation ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            "px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'products'
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Tag className="w-4 h-4" />
          <span>Products Catalog SEO</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-600 dark:text-rose-400">
            {stats?.totalProducts || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={cn(
            "px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'categories'
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories &amp; Flower Pages SEO</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            {stats?.categoriesCount || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('blogs')}
          className={cn(
            "px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'blogs'
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Blog &amp; Guides SEO</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={cn(
            "px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'health'
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span>SEO Health &amp; Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab('global')}
          className={cn(
            "px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'global'
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Globe className="w-4 h-4" />
          <span>Global SEO &amp; Integrations</span>
        </button>
      </div>

      {/* ── TAB 1: PRODUCTS SEO ────────────────────────────────────── */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div className="flex-1 min-w-[260px] max-w-md relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search product name or slug..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 rounded-2xl border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Score Filter */}
              <select
                value={scoreFilter}
                onChange={(e) => {
                  setScoreFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All SEO Scores</option>
                <option value="good">Good (75–100)</option>
                <option value="fair">Fair (50–74)</option>
                <option value="poor">Poor (&lt; 50)</option>
                <option value="missing">Uncustomized (Auto)</option>
              </select>

              {/* Missing Filter */}
              <select
                value={missingFilter}
                onChange={(e) => {
                  setMissingFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Metadata Status</option>
                <option value="title">Missing Title</option>
                <option value="desc">Missing Description</option>
                <option value="alt">Missing Image Alt</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Product</th>
                    <th className="py-4 px-4">Focus Keyword</th>
                    <th className="py-4 px-4">SEO Title &amp; Description</th>
                    <th className="py-4 px-4 text-center">Score</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {productsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                        Loading products SEO metadata...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No products match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    products.map((item) => {
                      const score = item.seoSettings.score;
                      const scoreBg = score >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' : score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                          {/* Product Info */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image || '/images/logo_final.png'}
                                alt={item.imageAlt || item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                              />
                              <div className="min-w-0 max-w-[240px]">
                                <div className="font-bold text-slate-900 dark:text-white truncate">
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate font-mono">
                                  /{item.slug}
                                </div>
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1">
                                  {item.category} &bull; ₹{item.price}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Focus Keyword */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.seoSettings.focusKeyword || <span className="text-slate-400 italic">None set</span>}
                            </div>
                            {item.seoSettings.secondaryKeywords && (
                              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                {Array.isArray(item.seoSettings.secondaryKeywords)
                                  ? item.seoSettings.secondaryKeywords.slice(0, 2).join(', ')
                                  : item.seoSettings.secondaryKeywords}
                              </div>
                            )}
                          </td>

                          {/* Title & Desc */}
                          <td className="py-3.5 px-4 max-w-[340px]">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                              {item.seoSettings.seoTitle || <span className="text-rose-500">Missing Title</span>}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                              {item.seoSettings.metaDescription || <span className="text-rose-500">Missing Description</span>}
                            </div>
                          </td>

                          {/* Score */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={cn("px-2.5 py-1 rounded-xl text-xs font-black border inline-block", scoreBg)}>
                              {score}/100
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {item.seoSettings.isManual ? (
                              <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800 font-bold">
                                Manual Override
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 font-medium">
                                Auto Generated
                              </Badge>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditModal(item)}
                              className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold gap-1 hover:bg-slate-100"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit SEO
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-xl text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-xl text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: CATEGORIES & FLOWER PAGES SEO ──────────────────── */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Category &amp; Flower Variety Landing Pages ({categories.length})
              </h3>
              <p className="text-xs text-slate-500">
                Manage H1 headings, SEO titles, meta descriptions, buyer intro guides, and canonical paths for every flower and gift category.
              </p>
            </div>
            <Button
              onClick={handleBulkGenerateCategories}
              disabled={bulkCatGenerating}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              {bulkCatGenerating ? 'Optimizing Categories...' : 'Bulk Optimize All Categories'}
            </Button>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Category Name</th>
                    <th className="py-4 px-4">Canonical Path</th>
                    <th className="py-4 px-4">H1 &amp; Title</th>
                    <th className="py-4 px-4">Meta Description</th>
                    <th className="py-4 px-4 text-center">Products</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {categoriesLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                        Loading categories SEO...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No active categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                          <div>{cat.name}</div>
                          {cat.focusKeyword && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                              {cat.focusKeyword}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                          {cat.categoryUrl}
                        </td>
                        <td className="py-4 px-4 max-w-[280px]">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {cat.h1}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {cat.metaTitle}
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-[320px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {cat.metaDescription}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {cat.productCount}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryFormData({
                                metaTitle: cat.metaTitle || '',
                                metaDescription: cat.metaDescription || '',
                                slug: cat.slug || '',
                                categoryUrl: cat.categoryUrl || '',
                                canonicalUrl: cat.canonicalUrl || `https://sbflorist.in${cat.categoryUrl}`,
                                h1: cat.h1 || cat.name || '',
                                focusKeyword: cat.focusKeyword || `${cat.name.toLowerCase()} online`,
                                seoIntro: cat.seoIntro || '',
                                seoContent: cat.seoContent || ''
                              });
                            }}
                            className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit SEO
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: BLOG & GUIDES SEO ──────────────────────────────── */}
      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Floral Guides &amp; Educational Blog Articles ({blogs.length})
              </h3>
              <p className="text-xs text-slate-500">
                Target high-intent informational queries (rose color meanings, tulip &amp; orchid care, gifting etiquette) and funnel readers directly to real catalog products.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/blog', '_blank')}
                className="rounded-xl text-xs gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Live Blog
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsNewBlog(true);
                  setEditingBlog({
                    id: `blog-${Date.now()}`,
                    slug: '',
                    title: '',
                    h1: '',
                    seoTitle: '',
                    metaDescription: '',
                    focusKeyword: '',
                    secondaryKeywords: [],
                    category: 'Flower Guides',
                    author: 'Spring Blossoms Master Florist',
                    publishedAt: new Date().toISOString(),
                    readTime: '5 min read',
                    featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
                    imageAlt: '',
                    excerpt: '',
                    relatedCategories: ['roses', 'bouquets'],
                    noIndex: false,
                    sections: [
                      { heading: 'Introduction & Floral Symbolism', body: '' },
                      { heading: 'How to Choose & Care for Your Blooms', body: '' },
                    ],
                    faqs: [],
                  });
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> + New SEO Blog Guide
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Article &amp; Slug</th>
                    <th className="py-4 px-4">Focus Keyword</th>
                    <th className="py-4 px-4">SEO Title &amp; Meta Description</th>
                    <th className="py-4 px-4 text-center">Indexing</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {blogsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                        Loading blog guides...
                      </td>
                    </tr>
                  ) : blogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No blog articles found.
                      </td>
                    </tr>
                  ) : (
                    blogs.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5 max-w-[300px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={b.featuredImage}
                              alt={b.imageAlt || b.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{b.title}</div>
                              <div className="font-mono text-[11px] text-slate-500 truncate">/blog/{b.slug}</div>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-semibold">
                                {b.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {b.focusKeyword || '—'}
                        </td>
                        <td className="py-4 px-4 max-w-[340px]">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{b.seoTitle}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{b.metaDescription}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {b.noIndex ? (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">NoIndex</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Indexable</Badge>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/blog/${b.slug}`, '_blank')}
                              className="rounded-xl text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsNewBlog(false);
                                setEditingBlog(b);
                              }}
                              className="rounded-xl text-xs font-bold gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBlog(b.id, b.title)}
                              className="rounded-xl text-xs text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SEO HEALTH & DIAGNOSTICS ───────────────────────── */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border",
                (healthAudit?.summary?.healthScore ?? healthAudit?.summary?.overallHealthScore ?? 90) >= 75
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}>
                {healthLoading ? '...' : `${healthAudit?.summary?.healthScore ?? healthAudit?.summary?.overallHealthScore ?? 95}%`}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Complete Catalog &amp; Content SEO Health Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time audit of {healthAudit?.summary?.totalProducts || stats?.totalProducts || 0} products, {healthAudit?.summary?.totalCategories || stats?.categoriesCount || 0} categories, and {healthAudit?.summary?.totalBlogs || 10} blog guides.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHealthAudit}
                disabled={healthLoading}
                className="rounded-xl text-xs gap-1.5"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", healthLoading && "animate-spin")} />
                Re-Run Audit
              </Button>
              <Button
                size="sm"
                onClick={handleBulkGenerate}
                disabled={bulkGenerating}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Auto-Fix Product SEO
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Missing SEO Title', count: (healthAudit?.summary?.totalProducts ?? 0) - (healthAudit?.summary?.storedTitlesCount ?? healthAudit?.summary?.totalProducts ?? 0) },
              { label: 'Missing Meta Description', count: (healthAudit?.summary?.totalProducts ?? 0) - (healthAudit?.summary?.storedDescriptionsCount ?? healthAudit?.summary?.totalProducts ?? 0) },
              { label: 'Duplicate Titles', count: healthAudit?.summary?.duplicateTitlesCount ?? healthAudit?.summary?.duplicateTitleCount ?? 0 },
              { label: 'Duplicate Descriptions', count: healthAudit?.summary?.duplicateDescriptionsCount ?? healthAudit?.summary?.duplicateDescCount ?? 0 },
              { label: 'Avg Product SEO Score', count: healthAudit?.summary?.avgProductScore ?? 0, isScore: true },
              { label: 'Missing Image Alt Text', count: healthAudit?.summary?.missingAltCount ?? 0 },
              { label: 'Thin Product Content', count: healthAudit?.summary?.thinContentCount ?? 0 },
              { label: 'Unoptimized Categories', count: healthAudit?.summary?.unoptimizedCategoriesCount ?? healthAudit?.summary?.unoptimizedCategoryCount ?? 0 },
            ].map((diag: any, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">{diag.label}</span>
                  <span className={cn(
                    "text-2xl font-black mt-1 block",
                    diag.isScore ? "text-emerald-600" : diag.count === 0 ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {healthLoading ? '...' : diag.isScore ? `${diag.count}/100` : diag.count}
                  </span>
                </div>
                {diag.isScore || diag.count === 0 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
              </div>
            ))}
          </div>

          {/* Detailed Issue Lists */}
          {healthAudit?.issues && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Duplicate Titles &amp; Descriptions Check
                </h4>
                {(healthAudit.issues.duplicateTitles?.length || 0) === 0 &&
                (healthAudit.issues.duplicateDescriptions?.length || 0) === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Zero duplicate SEO titles or meta descriptions detected across your active catalog!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {(healthAudit.issues.duplicateTitles || []).map((d: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-amber-50 text-amber-900 flex justify-between">
                        <span className="truncate font-medium">{d.name}</span>
                        <span className="text-[10px] font-bold">Duplicate Title</span>
                      </div>
                    ))}
                    {(healthAudit.issues.duplicateDescriptions || []).map((d: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-amber-50 text-amber-900 flex justify-between">
                        <span className="truncate font-medium">{d.name}</span>
                        <span className="text-[10px] font-bold">Duplicate Desc</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Category &amp; Image Alt Text Coverage
                </h4>
                {(healthAudit.issues.unoptimizedCategories?.length || 0) === 0 &&
                (healthAudit.issues.missingAlt?.length || 0) === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    All categories and product primary images have descriptive SEO metadata!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {(healthAudit.issues.unoptimizedCategories || []).map((c: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-amber-50 text-amber-900 flex justify-between">
                        <span className="truncate font-medium">Category: {c.name}</span>
                        <span className="text-[10px] font-bold">Needs Category SEO</span>
                      </div>
                    ))}
                    {(healthAudit.issues.missingAlt || []).map((p: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-amber-50 text-amber-900 flex justify-between">
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="text-[10px] font-bold">Missing Alt</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: GLOBAL SEO & INTEGRATIONS ──────────────────────── */}
      {activeTab === 'global' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Global SEO Defaults &amp; Organization Schema
              </h3>
              <p className="text-xs text-slate-500">
                Configure your sitewide title, default meta description, canonical domain, LocalBusiness/Florist schema NAP details, and Google Search Console verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Global Website Title
                </label>
                <Input
                  value={globalSettings.siteTitle || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, siteTitle: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Default Meta Description
                </label>
                <Textarea
                  rows={3}
                  value={globalSettings.defaultMetaDescription || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, defaultMetaDescription: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Brand / Organization Name
                </label>
                <Input
                  value={globalSettings.brandName || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, brandName: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Canonical Domain
                </label>
                <Input
                  value={globalSettings.canonicalDomain || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, canonicalDomain: e.target.value })}
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Organization Phone (Schema NAP)
                </label>
                <Input
                  value={globalSettings.organizationPhone || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, organizationPhone: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Organization Email
                </label>
                <Input
                  value={globalSettings.organizationEmail || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, organizationEmail: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Physical Studio Address (LocalBusiness Schema)
                </label>
                <Input
                  value={globalSettings.organizationAddress || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, organizationAddress: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Google Search Console Verification Code
                </label>
                <Input
                  value={globalSettings.googleSiteVerification || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, googleSiteVerification: e.target.value })}
                  placeholder="Paste content attribute from google-site-verification meta tag"
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Google Analytics 4 (GA4) Measurement ID
                </label>
                <Input
                  value={globalSettings.ga4MeasurementId || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, ga4MeasurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Default Robots Meta Directive
                </label>
                <Input
                  value={globalSettings.defaultRobots || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, defaultRobots: e.target.value })}
                  className="rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button
                onClick={handleSaveGlobalSettings}
                disabled={savingGlobal}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6"
              >
                {savingGlobal ? 'Saving Global Settings...' : 'Save Global SEO Settings'}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Live XML Sitemaps &amp; Crawler Feeds
              </h4>
              <p className="text-xs text-slate-500">
                Submit <code>https://sbflorist.in/sitemap.xml</code> in Google Search Console to index all sub-sitemaps automatically.
              </p>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Primary Sitemap Index', path: '/sitemap.xml' },
                  { label: 'Products & Image Sitemap', path: '/sitemap-products.xml' },
                  { label: 'Categories & Flower Pages', path: '/sitemap-categories.xml' },
                  { label: 'Occasions Sitemap', path: '/sitemap-occasions.xml' },
                  { label: 'Blog & Guides Sitemap', path: '/sitemap-blog.xml' },
                  { label: 'Static & Local Hubs Sitemap', path: '/sitemap-pages.xml' },
                  { label: 'Robots.txt Directive', path: '/robots.txt' },
                ].map((sm) => (
                  <a
                    key={sm.path}
                    href={sm.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 flex items-center justify-between font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span>{sm.label}</span>
                    <span className="font-mono text-[11px] text-rose-600 flex items-center gap-1">
                      {sm.path} <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT SEO EDIT MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    Product SEO Editor
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white truncate max-w-lg mt-0.5">
                    {editingProduct.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoGenerateSingle}
                    className="rounded-xl text-xs gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-Generate
                  </Button>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

                {/* Score & Health Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border",
                      liveEvaluation.score >= 75
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : liveEvaluation.score >= 50
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    )}>
                      {liveEvaluation.score}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        SEO Quality Health Score
                      </h4>
                      <p className="text-xs text-slate-500">
                        {liveEvaluation.score >= 75 ? 'Excellent on-page coverage' : liveEvaluation.score >= 50 ? 'Moderate coverage with opportunities' : 'Needs attention to rank on Google'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> {liveEvaluation.passed.length} Passed
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <AlertTriangle className="w-4 h-4" /> {liveEvaluation.warnings.length} Warnings
                    </span>
                  </div>
                </div>

                {/* Google SERP Snippet Preview */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Google Search Snippet Preview
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={cn(
                          "px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer",
                          previewDevice === 'desktop' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500"
                        )}
                      >
                        <Monitor className="w-3 h-3" /> Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={cn(
                          "px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer",
                          previewDevice === 'mobile' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500"
                        )}
                      >
                        <Smartphone className="w-3 h-3" /> Mobile
                      </button>
                    </div>
                  </div>

                  <div className={cn(
                    "p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 font-sans",
                    previewDevice === 'mobile' ? "max-w-md mx-auto" : "w-full"
                  )}>
                    {/* Google URL Row */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold">
                        🌸
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        https://sbflorist.in &rsaquo; product &rsaquo; {editFormData.slug || editingProduct.slug}
                      </div>
                    </div>
                    {/* Google Title */}
                    <div className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer truncate">
                      {editFormData.seoTitle || editingProduct.name}
                    </div>
                    {/* Google Description */}
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {editFormData.metaDescription || 'No description configured yet.'}
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Focus Keyword */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Primary Focus Keyword *
                    </label>
                    <Input
                      value={editFormData.focusKeyword}
                      onChange={(e) => setEditFormData({ ...editFormData, focusKeyword: e.target.value })}
                      placeholder="e.g. Red Rose Bouquet Online"
                      className="rounded-xl text-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Primary high-intent search query to rank for.
                    </span>
                  </div>

                  {/* Secondary Keywords */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Secondary Keywords (comma-separated)
                    </label>
                    <Input
                      value={editFormData.secondaryKeywords}
                      onChange={(e) => setEditFormData({ ...editFormData, secondaryKeywords: e.target.value })}
                      placeholder="e.g. Fresh Red Roses Hyderabad, Rose Delivery"
                      className="rounded-xl text-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      3–5 related keywords from competitive clusters.
                    </span>
                  </div>
                </div>

                {/* SEO Title with Character Counter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      SEO Title (Target: 40–60 characters) *
                    </label>
                    <span className={cn(
                      "text-[11px] font-bold",
                      editFormData.seoTitle.length > 60 ? "text-rose-600" : editFormData.seoTitle.length >= 35 ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {editFormData.seoTitle.length} / 60 chars
                    </span>
                  </div>
                  <Input
                    value={editFormData.seoTitle}
                    onChange={(e) => setEditFormData({ ...editFormData, seoTitle: e.target.value })}
                    placeholder="e.g. Premium Red Rose Bouquet Online | SBFlorist Hyderabad"
                    className="rounded-xl text-xs"
                  />
                </div>

                {/* Meta Description with Character Counter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Meta Description (Target: 120–160 characters) *
                    </label>
                    <span className={cn(
                      "text-[11px] font-bold",
                      editFormData.metaDescription.length > 160 ? "text-rose-600" : editFormData.metaDescription.length >= 120 ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {editFormData.metaDescription.length} / 160 chars
                    </span>
                  </div>
                  <Textarea
                    rows={3}
                    value={editFormData.metaDescription}
                    onChange={(e) => setEditFormData({ ...editFormData, metaDescription: e.target.value })}
                    placeholder="Describe the arrangement, floral variety, occasion, and express Hyderabad delivery slots..."
                    className="rounded-xl text-xs"
                  />
                </div>

                {/* Additional Metadata Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Product URL Slug
                    </label>
                    <Input
                      value={editFormData.slug}
                      onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                      placeholder="e.g. premium-red-rose-bouquet"
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Primary Image Alt Text
                    </label>
                    <Input
                      value={editFormData.imageAlt}
                      onChange={(e) => setEditFormData({ ...editFormData, imageAlt: e.target.value })}
                      placeholder="Descriptive image alt text for Google Image SEO..."
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Product Specific H1
                    </label>
                    <Input
                      value={editFormData.h1}
                      onChange={(e) => setEditFormData({ ...editFormData, h1: e.target.value })}
                      placeholder={editingProduct.name}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Canonical URL
                    </label>
                    <Input
                      value={editFormData.canonicalUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, canonicalUrl: e.target.value })}
                      placeholder="https://sbflorist.in/product/..."
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Index / Noindex Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Search Indexing Visibility
                    </div>
                    <p className="text-[11px] text-slate-500">
                      When enabled, product is marked as <code>noindex</code> to hide from search results.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {editFormData.noindex ? 'Noindex (Hidden)' : 'Index (Public)'}
                    </span>
                    <Switch
                      checked={editFormData.noindex}
                      onCheckedChange={(val) => setEditFormData({ ...editFormData, noindex: val })}
                    />
                  </div>
                </div>

                {/* Live Audit Checklist */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    SEO Audit Checklist &amp; Warnings
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {liveEvaluation.passed.map((pass, i) => (
                      <div key={`pass-${i}`} className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{pass}</span>
                      </div>
                    ))}
                    {liveEvaluation.warnings.map((warn, i) => (
                      <div key={`warn-${i}`} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-[11px] font-medium flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProductSeo}
                  disabled={savingSeo}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
                >
                  {savingSeo ? 'Saving...' : 'Save & Protect Manual SEO'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CATEGORY SEO EDIT MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Category &amp; Flower Variety SEO Editor
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {editingCategory.name}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Category H1 Heading
                    </label>
                    <Input
                      value={categoryFormData.h1}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, h1: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Primary Focus Keyword
                    </label>
                    <Input
                      value={categoryFormData.focusKeyword}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, focusKeyword: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    SEO Meta Title
                  </label>
                  <Input
                    value={categoryFormData.metaTitle}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, metaTitle: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Meta Description
                  </label>
                  <Textarea
                    rows={3}
                    value={categoryFormData.metaDescription}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, metaDescription: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Category SEO Intro Paragraph
                  </label>
                  <Textarea
                    rows={2}
                    value={categoryFormData.seoIntro}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, seoIntro: e.target.value })}
                    placeholder="Short buyer-focused introduction displayed at the top of the category page..."
                    className="rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Additional Category Buyer Guide Content
                  </label>
                  <Textarea
                    rows={3}
                    value={categoryFormData.seoContent}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, seoContent: e.target.value })}
                    placeholder="Selection guide, flower colors, occasions, and care instructions..."
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Category URL Path
                    </label>
                    <Input
                      value={categoryFormData.categoryUrl}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, categoryUrl: e.target.value })}
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Canonical URL
                    </label>
                    <Input
                      value={categoryFormData.canonicalUrl}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, canonicalUrl: e.target.value })}
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCategorySeo}
                  disabled={savingCategory}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
                >
                  {savingCategory ? 'Saving...' : 'Save Category SEO'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── BLOG SEO & CONTENT EDIT MODAL ───────────────────────────── */}
      <AnimatePresence>
        {editingBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    {isNewBlog ? 'Create New SEO Blog Guide' : 'Edit Blog Article & SEO Metadata'}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 truncate max-w-lg">
                    {editingBlog.title || 'New Floral Guide'}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingBlog(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Article Title &amp; H1 *
                    </label>
                    <Input
                      value={editingBlog.title}
                      onChange={(e) =>
                        setEditingBlog({
                          ...editingBlog,
                          title: e.target.value,
                          h1: e.target.value,
                        })
                      }
                      placeholder="e.g. Complete Guide to Tulip Flowers: Colors, Meaning & Care"
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      URL Slug
                    </label>
                    <Input
                      value={editingBlog.slug}
                      onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                      placeholder="auto-generated-from-title"
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Guide Category
                    </label>
                    <select
                      value={editingBlog.category}
                      onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="Flower Guides">Flower Guides</option>
                      <option value="Gifting Guides">Gifting Guides</option>
                      <option value="Educational">Educational</option>
                      <option value="Local Guides">Local Guides</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Primary Focus Keyword *
                    </label>
                    <Input
                      value={editingBlog.focusKeyword}
                      onChange={(e) => setEditingBlog({ ...editingBlog, focusKeyword: e.target.value })}
                      placeholder="e.g. tulip flowers meaning and care"
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Related Category Slugs (comma-separated)
                    </label>
                    <Input
                      value={(editingBlog.relatedCategories || []).join(', ')}
                      onChange={(e) =>
                        setEditingBlog({
                          ...editingBlog,
                          relatedCategories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="tulips, roses, bouquets, vase"
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      SEO Meta Title (40–60 chars)
                    </label>
                    <Input
                      value={editingBlog.seoTitle}
                      onChange={(e) => setEditingBlog({ ...editingBlog, seoTitle: e.target.value })}
                      placeholder="e.g. Tulip Flowers Guide: Meaning, Colors & Care Tips – SBFlorist"
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Meta Description (120–160 chars)
                    </label>
                    <Textarea
                      rows={2}
                      value={editingBlog.metaDescription}
                      onChange={(e) => setEditingBlog({ ...editingBlog, metaDescription: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Article Summary / Excerpt
                    </label>
                    <Textarea
                      rows={2}
                      value={editingBlog.excerpt}
                      onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Featured Social / OG Image URL
                    </label>
                    <Input
                      value={editingBlog.featuredImage}
                      onChange={(e) => setEditingBlog({ ...editingBlog, featuredImage: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Featured Image Alt Text
                    </label>
                    <Input
                      value={editingBlog.imageAlt}
                      onChange={(e) => setEditingBlog({ ...editingBlog, imageAlt: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Indexing Control */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Search Indexing</div>
                    <p className="text-[11px] text-slate-500">Toggle whether Google indexes this blog guide.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      {editingBlog.noIndex ? 'NoIndex (Hidden)' : 'Index (Public)'}
                    </span>
                    <Switch
                      checked={Boolean(editingBlog.noIndex)}
                      onCheckedChange={(val) => setEditingBlog({ ...editingBlog, noIndex: val })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <Button variant="outline" onClick={() => setEditingBlog(null)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBlog}
                  disabled={savingBlog}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  {savingBlog ? 'Saving...' : 'Save Blog Guide & SEO'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SeoManagement;

