import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Calendar, Clock, ArrowRight, Sparkles, Flower2, MapPin, Gift, ChevronRight } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import api from '@/services/api';

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  featuredImage: string;
  imageAlt?: string;
  excerpt: string;
  relatedCategories?: string[];
}

const FALLBACK_BLOG_POSTS: BlogPostSummary[] = [
  {
    id: 'blog-rose-colors-meaning',
    slug: 'meaning-of-different-rose-colors-gifting-guide',
    title: 'The Complete Guide to Rose Colors & Their Meanings for Every Occasion',
    seoTitle: 'Meaning of Different Rose Colors | Rose Gifting Guide – SBFlorist',
    metaDescription: 'Discover the hidden meaning behind red, pink, yellow, white, and lavender roses. Learn how to choose the right rose bouquet for birthdays, anniversaries & romance.',
    focusKeyword: 'meaning of rose colors',
    category: 'Flower Guides',
    author: 'Spring Blossoms Master Florist',
    publishedAt: '2026-01-15T09:00:00.000Z',
    readTime: '6 min read',
    featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Assorted fresh red, pink, white and yellow roses arranged by Spring Blossoms Florist',
    excerpt: 'From passionate crimson roses to serene white blooms and joyful yellow stems, every rose shade carries a distinct emotional message. Learn which rose color fits your occasion.',
    relatedCategories: ['roses', 'premium-roses', 'romantic-bouquets'],
  },
  {
    id: 'blog-tulips-guide-india',
    slug: 'complete-guide-to-tulip-flowers-colors-meaning-care',
    title: 'Tulip Flowers in India: Colors, Symbolism & How to Keep Cut Tulips Fresh',
    seoTitle: 'Tulip Flowers Guide: Meaning, Colors & Care Tips – SBFlorist',
    metaDescription: 'Explore the elegance of red, pink, yellow, purple, and white tulips. Learn what tulip colors symbolize and how to keep fresh tulip bouquets blooming longer in Indian homes.',
    focusKeyword: 'tulip flowers meaning and care',
    category: 'Flower Guides',
    author: 'Spring Blossoms Master Florist',
    publishedAt: '2026-01-20T09:00:00.000Z',
    readTime: '5 min read',
    featuredImage: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Fresh pink, red and yellow tulip bouquet from Spring Blossoms Florist',
    excerpt: 'Tulips are among the most sought-after luxury blooms in India. Discover what pink, red, yellow, and purple tulips signify and how to extend their vase life.',
    relatedCategories: ['tulips', 'bouquets', 'vase'],
  },
  {
    id: 'blog-orchid-care-gifting',
    slug: 'purple-and-exotic-orchids-symbolism-care-gifting-guide',
    title: 'Purple & Exotic Orchids: Why Dendrobium and Phalaenopsis Make Unforgettable Gifts',
    seoTitle: 'Orchid Flowers Guide: Symbolism, Care & Gifting Ideas – SBFlorist',
    metaDescription: 'Why are purple, blue, and white orchids the ultimate luxury gift? Learn about Dendrobium and Cymbidium orchids, their vase life, and care tips for Indian climates.',
    focusKeyword: 'orchid flowers gifting and care',
    category: 'Flower Guides',
    author: 'Spring Blossoms Master Florist',
    publishedAt: '2026-01-24T09:00:00.000Z',
    readTime: '5 min read',
    featuredImage: 'https://images.unsplash.com/photo-1566907225472-514215c9e5cd?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Luxury purple orchid bouquet arranged by Spring Blossoms Florist',
    excerpt: 'Orchids symbolize rare beauty, strength, and refined luxury. Discover why fresh orchid bouquets and basket arrangements are ideal for corporate, milestone, and romantic gifting.',
    relatedCategories: ['orchids', 'flower-baskets', 'bouquets'],
  },
  {
    id: 'blog-lisianthus-hydrangea-luxury-blooms',
    slug: 'luxury-pastel-flowers-lisianthus-eustoma-and-hydrangea-guide',
    title: 'Lisianthus (Eustoma) & Hydrangeas: The Secret Behind Luxury Pastel Bouquets',
    seoTitle: 'Lisianthus (Eustoma) & Hydrangea Flowers Guide – SBFlorist',
    metaDescription: 'Discover why Lavender Lisianthus (Eustoma) and lush Hydrangeas are the top choice for modern luxury bouquets, wedding arrangements, and sophisticated gifting.',
    focusKeyword: 'lisianthus eustoma and hydrangea flowers',
    category: 'Flower Guides',
    author: 'Spring Blossoms Master Florist',
    publishedAt: '2026-01-28T09:00:00.000Z',
    readTime: '6 min read',
    featuredImage: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Pastel hydrangea and lavender lisianthus luxury floral arrangement',
    excerpt: 'Looking beyond traditional blooms? Lavender Lisianthus (Eustoma) and cloud-like Hydrangeas bring European floral couture to Indian celebrations.',
    relatedCategories: ['lavender-lisianthus', 'hydrangea', 'vase'],
  },
  {
    id: 'blog-keep-cut-flowers-fresh',
    slug: 'how-to-keep-cut-flowers-fresh-longer-at-home-india',
    title: '7 Expert Florist Secrets to Keep Cut Flowers Fresh Longer in Indian Weather',
    seoTitle: 'How to Keep Cut Flowers Fresh Longer at Home – SBFlorist Guide',
    metaDescription: 'Learn practical, florist-tested steps to make roses, lilies, tulips, orchids, and hydrangeas last up to twice as long in warm Indian homes and offices.',
    focusKeyword: 'how to keep cut flowers fresh longer',
    category: 'Educational',
    author: 'Spring Blossoms Master Florist',
    publishedAt: '2026-02-01T09:00:00.000Z',
    readTime: '7 min read',
    featuredImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Fresh cut flowers in a clean glass vase on a sunlit table',
    excerpt: 'Warm weather does not have to shorten the life of your bouquet. Follow these 7 simple florist techniques to keep your flowers vibrant for days.',
    relatedCategories: ['vase', 'roses', 'lilies', 'orchids'],
  },
  {
    id: 'blog-birthday-anniversary-flower-guide',
    slug: 'how-to-choose-perfect-birthday-and-anniversary-flowers',
    title: 'How to Choose the Perfect Flowers for Birthdays & Milestone Anniversaries',
    seoTitle: 'Best Birthday & Anniversary Flowers Guide – SBFlorist India',
    metaDescription: 'Not sure which bouquet to send for a birthday or wedding anniversary? Explore our expert guide matching flowers by milestone year, relationship, and personality.',
    focusKeyword: 'best flowers for birthday and anniversary',
    category: 'Gifting Guides',
    author: 'Spring Blossoms Gifting Concierge',
    publishedAt: '2026-02-03T09:00:00.000Z',
    readTime: '6 min read',
    featuredImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Luxury anniversary rose and lily bouquet with gift box',
    excerpt: 'Whether celebrating a 1st paper anniversary, a 25th silver jubilee, or a best friend’s milestone birthday, choosing the right bloom turns a gift into a lasting memory.',
    relatedCategories: ['birthday-bouquets', 'romantic-bouquets', 'combos'],
  },
];

const CATEGORIES = ['All', 'Flower Guides', 'Gifting Guides', 'Educational', 'Local Guides'];

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPostSummary[]>(FALLBACK_BLOG_POSTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/seo/blogs');
        if (isMounted && res.data?.blogs && Array.isArray(res.data.blogs) && res.data.blogs.length > 0) {
          const normalized = res.data.blogs.map((b: any) => ({
            ...b,
            featuredImage: b.featuredImage || b.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
            relatedCategories: Array.isArray(b.relatedCategories)
              ? b.relatedCategories.map((rc: any) =>
                  typeof rc === 'string' ? rc : String(rc?.url || rc?.name || 'roses').replace(/^\/+/, '')
                )
              : ['roses', 'bouquets'],
          }));
          setBlogs(normalized);
        }
      } catch (err) {
        console.warn('Using fallback blog articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((post) => {
      const matchesCat = selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      const hay = `${post.title} ${post.excerpt} ${post.focusKeyword || ''} ${(post.secondaryKeywords || []).join(' ')}`.toLowerCase();
      return matchesCat && hay.includes(q);
    });
  }, [blogs, selectedCategory, searchQuery]);

  const featuredPost = filteredBlogs[0];
  const remainingPosts = filteredBlogs.slice(1);

  const blogSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Spring Blossoms Florist Journal & Floral Guides',
      description: 'Expert guides on flower meanings, rose colors, tulip and orchid care, birthday and anniversary gifting ideas, and fresh flower delivery in India.',
      url: 'https://sbflorist.in/blog',
      publisher: {
        '@type': 'Organization',
        name: 'Spring Blossoms Florist',
        url: 'https://sbflorist.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://sbflorist.in/images/logosbf.png',
        },
      },
      blogPost: blogs.slice(0, 10).map((b) => ({
        '@type': 'BlogPosting',
        headline: b.title,
        url: `https://sbflorist.in/blog/${b.slug}`,
        datePublished: b.publishedAt,
        dateModified: b.updatedAt || b.publishedAt,
        description: b.metaDescription || b.excerpt,
        image: b.featuredImage,
        author: {
          '@type': 'Organization',
          name: b.author || 'Spring Blossoms Florist',
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sbflorist.in/' },
        { '@type': 'ListItem', position: 2, name: 'Flower & Gifting Blog', item: 'https://sbflorist.in/blog' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-20">
      <SEOHead
        title="Flower & Gifting Blog | Floral Care, Meaning & Guides – SBFlorist"
        description="Read expert floral guides from Spring Blossoms Florist. Learn the meaning of rose colors, tulip & orchid care tips, Indian floral heritage, and birthday or anniversary gifting ideas."
        keywords="flower blog india, meaning of rose colors, how to care for tulips in india, orchid flower care, birthday flower gifting guide, lisianthus eustoma flowers, hydrangea bouquets, spring blossoms florist blog"
        canonical="https://sbflorist.in/blog"
        structuredData={blogSchema}
      />

      {/* Breadcrumb & Hero Header */}
      <section className="relative bg-gradient-to-b from-rose-50/80 via-amber-50/40 to-[#FAF8F5] pt-8 pb-12 border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-6">
            <Link to="/" className="hover:text-rose-700 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-medium">Flower & Gifting Blog</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 text-rose-800 text-xs font-semibold tracking-wide uppercase mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Spring Blossoms Floral Journal
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight mb-4">
              Flower Meanings, Care Guides & Thoughtful Gifting Inspiration
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Curated by the master florists at Spring Blossoms Florist since 2006. Explore in-depth guides on rose color symbolism, exotic tulips, orchids, lisianthus, hydrangeas, vase care secrets for Indian homes, and memorable celebration gifting.
            </p>
          </div>

          {/* Filter Bar & Search */}
          <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      active
                        ? 'bg-rose-700 text-white shadow-sm'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tulips, roses, care tips..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {featuredPost ? (
          <>
            {/* Featured Article Card */}
            <div className="mb-12">
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[360px] overflow-hidden bg-stone-100">
                  <img
                    src={featuredPost.featuredImage}
                    alt={featuredPost.imageAlt || featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-rose-800 text-xs font-semibold shadow-sm">
                      Featured Guide • {featuredPost.category}
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-600" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 group-hover:text-rose-700 transition-colors leading-snug mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-500">By {featuredPost.author}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 group-hover:translate-x-1 transition-transform">
                      Read Full Guide <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Article Grid */}
            {remainingPosts.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-6">
                  Latest Floral & Gifting Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {remainingPosts.map((post) => (
                    <article
                      key={post.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      <Link to={`/blog/${post.slug}`} className="relative h-52 overflow-hidden bg-stone-100 block">
                        <img
                          src={post.featuredImage}
                          alt={post.imageAlt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-stone-800 text-[11px] font-semibold">
                          {post.category}
                        </span>
                      </Link>

                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-xs text-stone-500 mb-2.5">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-rose-600" />
                              {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>

                          <Link to={`/blog/${post.slug}`}>
                            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 group-hover:text-rose-700 transition-colors leading-snug mb-2.5 line-clamp-2">
                              {post.title}
                            </h3>
                          </Link>

                          <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {(post.relatedCategories || []).slice(0, 2).map((catSlug) => (
                              <Link
                                key={catSlug}
                                to={`/${catSlug}`}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                              >
                                #{catSlug}
                              </Link>
                            ))}
                          </div>
                          <Link
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800"
                          >
                            Read Guide <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
            <Flower2 className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">No matching guides found</h2>
            <p className="text-stone-600 text-sm mb-4">
              Try clearing your search filter or exploring all flower and gifting categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-full bg-rose-700 text-white text-sm font-medium hover:bg-rose-800 transition-colors"
            >
              View All Guides
            </button>
          </div>
        )}

        {/* Internal Linking Hub: Shop by Flower Variety & Gifting Collection */}
        <section className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm">
          <div className="max-w-3xl mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Explore Real Catalog Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Shop Fresh Flower Varieties Featured in Our Guides
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-1">
              Every floral guide in our journal links directly to handcrafted bouquets, vase arrangements, and luxury hampers available for same-day delivery.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: 'Fresh Roses', to: '/roses', sub: 'Red, Pink, Yellow & White' },
              { label: 'Premium Roses', to: '/premium-roses', sub: 'Long-Stem Luxury Blooms' },
              { label: 'Tulip Bouquets', to: '/tulips', sub: 'Red, Pink, Yellow & Purple' },
              { label: 'Exotic Orchids', to: '/orchids', sub: 'Purple, Blue & White Orchids' },
              { label: 'Lilies Collection', to: '/lilies', sub: 'Oriental Pink & White Lilies' },
              { label: 'Lavender Lisianthus', to: '/lavender-lisianthus', sub: 'Pastel Eustoma Arrangements' },
              { label: 'Lush Hydrangeas', to: '/hydrangea', sub: 'Blue, Pink & White Hydrangea' },
              { label: 'Fresh Carnations', to: '/carnation', sub: 'Ruffled Pastel & Red Stems' },
              { label: 'Bright Sunflowers', to: '/sunflowers', sub: 'Cheerful Golden Bouquets' },
              { label: 'Glass Vase Florals', to: '/vase', sub: 'Tabletop & Office Vases' },
              { label: 'Flower Baskets', to: '/flower-baskets', sub: 'Grand Table Arrangements' },
              { label: 'Artisanal Cakes', to: '/cakes', sub: 'Truffle, Red Velvet & Fruit' },
              { label: 'Flowers & Combos', to: '/combos', sub: 'Flowers, Cakes & Chocolates' },
              { label: 'Hyderabad Delivery', to: '/flower-delivery-hyderabad', sub: 'Same-Day & Midnight' },
              { label: 'Secunderabad Delivery', to: '/flower-delivery-secunderabad', sub: 'Express Local Florist' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="p-3.5 rounded-xl border border-stone-200/80 hover:border-rose-400 hover:bg-rose-50/40 transition-all group"
              >
                <div className="font-semibold text-sm text-stone-900 group-hover:text-rose-700 flex items-center justify-between">
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{item.sub}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogPage;
