import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ShoppingBag,
  Share2,
} from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import api from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getImageUrl } from '@/config';

interface BlogSection {
  heading: string;
  body: string;
  bullets?: string[];
}

interface BlogFaq {
  question: string;
  answer: string;
}

interface RelatedProductItem {
  id: string;
  title: string;
  slug?: string;
  price: number;
  discount?: number;
  images?: string[];
  category?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  h1?: string;
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
  noIndex?: boolean;
  sections?: BlogSection[];
  faqs?: BlogFaq[];
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { formatPrice } = useCurrency();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductItem[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPost = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setNotFound(false);
        const res = await api.get(`/seo/blogs/${encodeURIComponent(slug)}`);
        if (isMounted && res.data?.blog) {
          const rawBlog = res.data.blog;
          const normalizedBlog: BlogPostDetail = {
            ...rawBlog,
            featuredImage: rawBlog.featuredImage || rawBlog.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
            relatedCategories: Array.isArray(rawBlog.relatedCategories)
              ? rawBlog.relatedCategories.map((rc: any) =>
                  typeof rc === 'string' ? rc : String(rc?.url || rc?.name || 'roses').replace(/^\/+/, '')
                )
              : ['roses', 'bouquets'],
          };
          setPost(normalizedBlog);
          setRelatedProducts(Array.isArray(res.data.relatedProducts) ? res.data.relatedProducts : []);
          const rawRelatedBlogs = Array.isArray(res.data.relatedBlogs) ? res.data.relatedBlogs : [];
          setRelatedPosts(
            rawRelatedBlogs.map((rb: any) => ({
              ...rb,
              featuredImage: rb.featuredImage || rb.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
            }))
          );
        } else if (isMounted) {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error loading blog article:', err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4">
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-48 bg-stone-200 rounded" />
          <div className="h-10 w-3/4 bg-stone-200 rounded" />
          <div className="h-80 w-full bg-stone-200 rounded-3xl" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-stone-200 rounded" />
            <div className="h-4 w-5/6 bg-stone-200 rounded" />
            <div className="h-4 w-4/6 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-stone-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Floral Guide Not Found</h1>
          <p className="text-stone-600 text-sm mb-6">
            The article you are looking for may have been moved or updated. Explore our latest flower care and gifting guides below.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/blog"
              className="px-5 py-2.5 rounded-full bg-rose-700 text-white text-sm font-semibold hover:bg-rose-800 transition-colors"
            >
              Browse All Guides
            </Link>
            <Link
              to="/shop"
              className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-800 text-sm font-semibold hover:bg-stone-200 transition-colors"
            >
              Shop Fresh Flowers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://sbflorist.in/blog/${post.slug}`;
  const keywordsStr = [post.focusKeyword, ...(post.secondaryKeywords || [])].filter(Boolean).join(', ');

  const structuredData: Record<string, any>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.h1 || post.title,
      description: post.metaDescription || post.excerpt,
      image: post.featuredImage ? [post.featuredImage] : ['https://sbflorist.in/images/logosbf.png'],
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        '@type': 'Organization',
        name: post.author || 'Spring Blossoms Florist',
        url: 'https://sbflorist.in',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Spring Blossoms Florist',
        logo: {
          '@type': 'ImageObject',
          url: 'https://sbflorist.in/images/logosbf.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      keywords: keywordsStr,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sbflorist.in/' },
        { '@type': 'ListItem', position: 2, name: 'Flower & Gifting Blog', item: 'https://sbflorist.in/blog' },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
      ],
    },
  ];

  if (Array.isArray(post.faqs) && post.faqs.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-20">
      <SEOHead
        title={post.seoTitle || `${post.title} | Spring Blossoms Florist`}
        description={post.metaDescription || post.excerpt}
        keywords={keywordsStr}
        canonical={canonicalUrl}
        ogImage={post.featuredImage}
        ogType="article"
        noIndex={Boolean(post.noIndex)}
        structuredData={structuredData}
      />

      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 overflow-x-auto no-scrollbar">
            <Link to="/" className="hover:text-rose-700 whitespace-nowrap">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <Link to="/blog" className="hover:text-rose-700 whitespace-nowrap">Flower & Gifting Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-stone-900 font-medium truncate max-w-[220px] sm:max-w-md">{post.title}</span>
          </nav>

          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Guides
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold tracking-wide">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-stone-500">
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            {new Date(post.publishedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-stone-500">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {post.readTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 leading-tight mb-5">
          {post.h1 || post.title}
        </h1>

        <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-6">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between py-4 border-y border-stone-200/80 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-700 text-white flex items-center justify-center font-serif font-bold text-sm">
              SB
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900">{post.author || 'Spring Blossoms Master Florist'}</div>
              <div className="text-xs text-stone-500">Spring Blossoms Florist • Trusted Since 2006</div>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Guide
          </button>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-md mb-10 max-h-[480px]">
            <img
              src={post.featuredImage}
              alt={post.imageAlt || post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Main Article Body + Sidebar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left/Center Article Content */}
        <article className="lg:col-span-8 space-y-8">
          {(post.sections || []).map((section, idx) => (
            <section
              key={idx}
              id={`section-${idx}`}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-sm"
            >
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-3">
                {section.heading}
              </h2>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
              {Array.isArray(section.bullets) && section.bullets.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-1" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Article FAQs */}
          {Array.isArray(post.faqs) && post.faqs.length > 0 && (
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <HelpCircle className="w-5 h-5 text-rose-600" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-4">
                {post.faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200/70">
                    <h3 className="text-base font-semibold text-stone-900 mb-1.5">{faq.question}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Real Catalog Products Matched to This Blog Post */}
          {relatedProducts.length > 0 && (
            <section className="bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200/70 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
                    <ShoppingBag className="w-3.5 h-3.5" /> Handcrafted Fresh Daily
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">
                    Shop Fresh Arrangements Featured in This Guide
                  </h2>
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800"
                >
                  View Full Catalog <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedProducts.slice(0, 6).map((prod) => {
                  const finalPrice = prod.discount
                    ? Math.round(prod.price * (1 - prod.discount / 100))
                    : prod.price;
                  const imgUrl = getImageUrl(prod.images?.[0]);
                  return (
                    <Link
                      key={prod.id}
                      to={`/product/${prod.id}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-rose-300 hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="h-44 overflow-hidden bg-stone-100 relative">
                        <img
                          src={imgUrl}
                          alt={`${prod.title} - Fresh ${prod.category || 'Flowers'} from Spring Blossoms Florist`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {prod.discount ? (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                            {prod.discount}% OFF
                          </span>
                        ) : null}
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] text-stone-500 capitalize mb-0.5">{prod.category || 'Fresh Blooms'}</div>
                          <h3 className="text-sm font-semibold text-stone-900 group-hover:text-rose-700 line-clamp-2">
                            {prod.title}
                          </h3>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-sm font-bold text-stone-900">{formatPrice(finalPrice)}</span>
                          <span className="text-xs font-semibold text-rose-700 group-hover:translate-x-0.5 transition-transform">
                            Order Now →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </article>

        {/* Right Sidebar: Quick Navigation & Related Flower Collections */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Table of Contents */}
            {Array.isArray(post.sections) && post.sections.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-3">
                  In This Floral Guide
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {post.sections.map((sec, idx) => (
                    <li key={idx}>
                      <a
                        href={`#section-${idx}`}
                        className="text-stone-600 hover:text-rose-700 transition-colors flex items-start gap-2"
                      >
                        <span className="text-rose-600 font-semibold">{idx + 1}.</span>
                        <span>{sec.heading}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Flower & Gift Categories */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Explore Collections
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 mb-3">
                Shop Related Flower Varieties
              </h3>
              <div className="flex flex-wrap gap-2">
                {(post.relatedCategories && post.relatedCategories.length > 0
                  ? post.relatedCategories
                  : ['roses', 'tulips', 'orchids', 'lilies', 'hydrangea', 'combos']
                ).map((catSlug) => (
                  <Link
                    key={catSlug}
                    to={`/${catSlug}`}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-700 text-stone-800 hover:text-white text-xs font-medium capitalize transition-colors"
                  >
                    {catSlug.replace(/-/g, ' ')}
                  </Link>
                ))}
                <Link
                  to="/flower-delivery-hyderabad"
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-700 text-rose-800 hover:text-white text-xs font-medium transition-colors"
                >
                  Hyderabad Delivery
                </Link>
                <Link
                  to="/flower-delivery-secunderabad"
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-700 text-rose-800 hover:text-white text-xs font-medium transition-colors"
                >
                  Secunderabad Delivery
                </Link>
              </div>
            </div>

            {/* Same-Day Delivery Promise Box */}
            <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-serif font-bold mb-2">
                Send Fresh Flowers Today
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Handcrafted by master florists at Spring Blossoms Florist. Enjoy same-day, fixed-time, and midnight delivery across Hyderabad & Secunderabad.
              </p>
              <Link
                to="/shop"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                Explore All Bouquets <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Blog Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              More Flower & Gifting Guides
            </h2>
            <Link to="/blog" className="text-sm font-semibold text-rose-700 hover:text-rose-800">
              View All Guides →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rPost) => (
              <Link
                key={rPost.id}
                to={`/blog/${rPost.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-44 overflow-hidden bg-stone-100">
                  <img
                    src={rPost.featuredImage}
                    alt={rPost.imageAlt || rPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                      {rPost.category}
                    </span>
                    <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-rose-700 mt-1 mb-2 line-clamp-2">
                      {rPost.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2">{rPost.excerpt}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>{rPost.readTime}</span>
                    <span className="font-semibold text-rose-700">Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPostPage;
