import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  ShoppingBag,
  Truck,
  Gift,
  CreditCard,
  Clock,
  RefreshCw,
  Heart,
  ShieldCheck,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ExternalLink,
  Sparkles,
  Check,
  Share2,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import faqService, { FaqCategory, FaqItem } from '@/services/faqService';
import { useToast } from '@/hooks/use-toast';

// Icon mapping helper
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  RefreshCw: <RefreshCw className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
};

// Text highlighter for search query terms
const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;

  const escaped = highlight.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-rose-100 text-rose-900 font-semibold rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

const POPULAR_SHORTCUTS = [
  'Same-day flower delivery',
  'Delivery charges',
  'Flower and cake combo',
  'Payment methods',
  'Flower care tips',
  'Store location',
];

export const FaqPage: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();

  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, 'helpful' | 'not_helpful'>>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load user votes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sbf_faq_votes');
      if (stored) {
        setUserVotes(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Fetch FAQ categories and all published FAQs
  useEffect(() => {
    let isMounted = true;
    const loadFaqData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [catsData, faqsData] = await Promise.all([
          faqService.getCategories(),
          faqService.getFaqs(),
        ]);

        if (isMounted) {
          setCategories(catsData);
          setFaqs(faqsData);
        }
      } catch (err: any) {
        console.error('Failed to load FAQs:', err);
        if (isMounted) {
          setError('Unable to load FAQs right now. Please refresh the page or contact our support.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFaqData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle URL hash anchor linking (e.g. #how-can-i-place-an-order)
  useEffect(() => {
    if (loading || faqs.length === 0) return;

    const hash = location.hash.replace('#', '');
    if (hash) {
      const targetFaq = faqs.find((f) => f.slug === hash || f.id === hash);
      if (targetFaq) {
        setSelectedCategory(targetFaq.categoryId);
        setExpandedItems([targetFaq.id]);
        setTimeout(() => {
          const el = document.getElementById(targetFaq.slug) || document.getElementById(targetFaq.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [location.hash, loading, faqs]);

  // Filtered FAQs based on category & search query
  const filteredFaqs = useMemo(() => {
    let result = faqs;

    // If there is an active search query, search globally across all categories
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter((item) => {
        const inQuestion = item.question.toLowerCase().includes(q);
        const inAnswer = item.answer.toLowerCase().includes(q);
        const inCategory = item.category?.name.toLowerCase().includes(q);
        const inKeywords = (item.keywords || []).some((kw) => kw.toLowerCase().includes(q));
        return inQuestion || inAnswer || inCategory || inKeywords;
      });

      // If user selected a specific category AND searched, narrow further only if results exist
      if (selectedCategory !== 'all') {
        const inCategoryResults = result.filter(
          (item) => item.categoryId === selectedCategory || item.category?.slug === selectedCategory
        );
        // Show category results if any exist, otherwise keep all matching results
        if (inCategoryResults.length > 0) {
          result = inCategoryResults;
        }
      }
    } else if (selectedCategory !== 'all') {
      result = result.filter(
        (item) => item.categoryId === selectedCategory || item.category?.slug === selectedCategory
      );
    }

    return result;
  }, [faqs, selectedCategory, debouncedQuery]);

  // Handle Helpful / Not Helpful voting
  const handleVote = async (faqId: string, vote: 'helpful' | 'not_helpful') => {
    if (userVotes[faqId]) {
      toast({
        title: 'Feedback already submitted',
        description: 'Thank you! You have already shared your feedback for this answer.',
      });
      return;
    }

    try {
      const updated = await faqService.voteHelpful(faqId, vote);
      setFaqs((prev) =>
        prev.map((item) =>
          item.id === faqId
            ? {
                ...item,
                helpfulCount: updated.helpfulCount,
                notHelpfulCount: updated.notHelpfulCount,
              }
            : item
        )
      );

      const newVotes = { ...userVotes, [faqId]: vote };
      setUserVotes(newVotes);
      try {
        localStorage.setItem('sbf_faq_votes', JSON.stringify(newVotes));
      } catch {
        // ignore
      }

      toast({
        title: 'Thank you for your feedback!',
        description: 'Your response helps us improve our customer support answers.',
      });
    } catch (err) {
      console.error('Failed to submit vote:', err);
    }
  };

  // Copy shareable link to clipboard
  const handleCopyLink = (faq: FaqItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/faq#${faq.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(faq.id);
    toast({
      title: 'Link copied to clipboard',
      description: 'You can now share this specific question and answer.',
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Structured Data (FAQPage Schema)
  const faqSchema = useMemo(() => {
    const publishedList = faqs.slice(0, 30); // Top published items for schema
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: publishedList.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer.replace(/<[^>]+>/g, ' '),
        },
      })),
    };
  }, [faqs]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col selection:bg-rose-100 selection:text-rose-900">
      <Helmet>
        <title>FAQs | Flower, Cake & Gift Delivery in Hyderabad | SB Florist</title>
        <meta
          name="description"
          content="Find answers about flower delivery in Hyderabad and Secunderabad, bouquets, cakes, gift combos, order tracking, payments, cancellations and refunds at Spring Blossoms Florist."
        />
        <link rel="canonical" href="https://sbflorist.in/faq" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navigation />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        {/* Breadcrumb Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-gray-500">
            <Link to="/" className="hover:text-rose-700 transition-colors">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium">FAQ</span>
          </nav>
        </div>

        {/* Hero Header Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Spring Blossoms Help & Customer Guide</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Frequently Asked Questions
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Everything you need to know about ordering flowers, cakes, and gifts with Spring Blossoms Florist in Hyderabad &amp; Secunderabad.
          </p>

          {/* Interactive Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-6">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g., delivery charges, same day, refund, cake)..."
                className="w-full pl-12 pr-10 py-6 text-base rounded-2xl border-gray-200 bg-white shadow-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all placeholder:text-gray-400"
                aria-label="Search frequently asked questions"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {debouncedQuery && (
              <div className="mt-2 text-left text-xs sm:text-sm text-gray-500 flex items-center justify-between px-2">
                <span>
                  Found <strong className="text-gray-900">{filteredFaqs.length}</strong> {filteredFaqs.length === 1 ? 'question' : 'questions'} for &ldquo;{debouncedQuery}&rdquo;
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-rose-700 hover:underline font-medium"
                >
                  Reset search
                </button>
              </div>
            )}
          </div>

          {/* Popular Search Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto text-xs sm:text-sm">
            <span className="text-gray-400 font-medium mr-1">Popular:</span>
            {POPULAR_SHORTCUTS.map((phrase) => (
              <button
                key={phrase}
                onClick={() => setSearchQuery(phrase)}
                className="px-3 py-1 rounded-full bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-300 text-gray-700 hover:text-rose-800 transition-colors shadow-2xs"
              >
                {phrase}
              </button>
            ))}
          </div>
        </section>

        {/* Category Navigation Pills */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-rose-700 text-white shadow-md'
                    : 'bg-white hover:bg-rose-50/60 text-gray-700 border border-gray-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>All Questions</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === 'all'
                      ? 'bg-rose-800/80 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {faqs.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = cat._count?.faqs || faqs.filter((f) => f.categoryId === cat.id).length;
                const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
                const iconComponent = cat.icon && CATEGORY_ICONS[cat.icon] ? CATEGORY_ICONS[cat.icon] : <HelpCircle className="w-4 h-4" />;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                      isSelected
                        ? 'bg-rose-700 text-white shadow-md'
                        : 'bg-white hover:bg-rose-50/60 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span className="shrink-0">{iconComponent}</span>
                    <span>{cat.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-rose-800/80 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQs Accordion Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {loading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-16 bg-white rounded-2xl border border-gray-200 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-800">
              <p className="font-semibold mb-2">Notice</p>
              <p className="text-sm mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Retry Loading FAQs
              </Button>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No matching questions found</h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm mb-6 leading-relaxed">
                We couldn&apos;t find an answer matching &ldquo;{debouncedQuery}&rdquo;. Try using simpler keywords or reach out to our florist team directly.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  variant="outline"
                  className="rounded-xl"
                >
                  Clear Search &amp; View All
                </Button>
                <Button
                  onClick={() => {
                    const message = encodeURIComponent(`Hello Spring Blossoms Florist! I have a question about: ${debouncedQuery}`);
                    window.open(`https://wa.me/9949683222?text=${message}`, '_blank');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask on WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={expandedItems}
              onValueChange={setExpandedItems}
              className="space-y-3"
            >
              {filteredFaqs.map((faq) => {
                const categoryName = faq.category?.name;
                const isVoted = userVotes[faq.id];

                return (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    id={faq.slug}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs transition-all data-[state=open]:border-rose-300 data-[state=open]:shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger className="px-5 py-4 sm:px-6 hover:no-underline text-left group">
                      <div className="flex flex-col items-start gap-1 pr-4">
                        {categoryName && selectedCategory === 'all' && (
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            {categoryName}
                          </span>
                        )}
                        <span className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-rose-800 transition-colors">
                          <HighlightText text={faq.question} highlight={debouncedQuery} />
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5 sm:px-6 text-gray-700 text-sm sm:text-base leading-relaxed border-t border-gray-50 pt-3">
                      <div
                        className="prose prose-sm max-w-none text-gray-700 space-y-2"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />

                      {/* Accordion Actions & Feedback */}
                      <div className="mt-5 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                        {/* Was this helpful widget */}
                        <div className="flex items-center gap-2">
                          <span>Was this answer helpful?</span>
                          <button
                            onClick={() => handleVote(faq.id, 'helpful')}
                            disabled={Boolean(isVoted)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                              isVoted === 'helpful'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-gray-50 hover:bg-emerald-50 border-gray-200 text-gray-600 hover:text-emerald-700'
                            }`}
                            aria-label="Vote helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Yes ({faq.helpfulCount})</span>
                          </button>
                          <button
                            onClick={() => handleVote(faq.id, 'not_helpful')}
                            disabled={Boolean(isVoted)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                              isVoted === 'not_helpful'
                                ? 'bg-rose-50 border-rose-300 text-rose-700'
                                : 'bg-gray-50 hover:bg-rose-50 border-gray-200 text-gray-600 hover:text-rose-700'
                            }`}
                            aria-label="Vote not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>No</span>
                          </button>
                        </div>

                        {/* Copy Link to this question */}
                        <button
                          onClick={(e) => handleCopyLink(faq, e)}
                          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-rose-700 transition-colors"
                          title="Copy direct link to this FAQ"
                        >
                          {copiedId === faq.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share Question</span>
                            </>
                          )}
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </section>

        {/* Helpful Florist Categories & Quick Navigation */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Explore Spring Blossoms Collections</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Looking for something specific? Browse our fresh flower arrangements, cakes, and gifts hand-delivered across Hyderabad.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: 'Bouquets', path: '/category/bouquets' },
                { label: 'Red Roses', path: '/category/roses' },
                { label: 'Fresh Cakes', path: '/cakes' },
                { label: 'Combos & Gifts', path: '/combos' },
                { label: 'Indoor Plants', path: '/category/plants' },
                { label: 'All Products', path: '/shop' },
                { label: 'Delivery Policy', path: '/shipping-privacy' },
                { label: 'Cancellation & Refund', path: '/cancellation-policy' },
                { label: 'Terms of Service', path: '/terms-conditions' },
                { label: 'Track Order', path: '/track-order' },
                { label: 'My Account', path: '/account' },
                { label: 'Contact Us', path: '/contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-rose-50 border border-gray-200/60 hover:border-rose-200 text-xs sm:text-sm font-medium text-gray-800 hover:text-rose-800 transition-all group"
                >
                  <span className="truncate">{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-700 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Still Need Help? Support Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-stone-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-700/60 border border-rose-500/40 text-rose-200 text-xs font-semibold uppercase tracking-wider mb-4">
                Personalized Florist Support
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
                Still have questions? We&apos;re here to help!
              </h2>
              <p className="text-rose-100 text-sm sm:text-base leading-relaxed mb-8">
                Our Hyderabad customer support desk and florist team are available 7 days a week (9:00 AM – 11:00 PM IST) for custom arrangements, order modifications, and delivery assistance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* WhatsApp Support */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white mb-3">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">WhatsApp Chat</h3>
                    <p className="text-xs text-rose-200 mt-1 mb-4">Fastest response for order updates &amp; photos.</p>
                  </div>
                  <Button
                    onClick={() => {
                      const msg = encodeURIComponent("Hello Spring Blossoms Florist! I need assistance with an order/inquiry.");
                      window.open(`https://wa.me/9949683222?text=${msg}`, '_blank');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl"
                  >
                    Chat +91 9949683222
                  </Button>
                </div>

                {/* Phone Call Support */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white mb-3">
                      <Phone className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Call Support</h3>
                    <p className="text-xs text-rose-200 mt-1 mb-4">Mon–Sun: 09:00 AM to 11:00 PM IST.</p>
                  </div>
                  <Button
                    onClick={() => {
                      window.location.href = 'tel:+919949683222';
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-xl"
                  >
                    Call +91 9949683222
                  </Button>
                </div>

                {/* Email Support */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white mb-3">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Email Us</h3>
                    <p className="text-xs text-rose-200 mt-1 mb-4">contact@sbflorist.in for corporate &amp; queries.</p>
                  </div>
                  <Button
                    onClick={() => {
                      window.location.href = 'mailto:contact@sbflorist.in?subject=Customer%20Support%20Inquiry%20-%20SB%20Florist';
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-xl"
                  >
                    Send Email
                  </Button>
                </div>

                {/* Store Address */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white mb-3">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Visit Our Store</h3>
                    <p className="text-xs text-rose-200 mt-1 mb-4">Mehdipatnam, Pillar No. 32, Hyderabad.</p>
                  </div>
                  <Button
                    onClick={() => {
                      window.open('https://maps.google.com/?q=Spring+Blossoms+Florist+Mehdipatnam+Hyderabad', '_blank');
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-xl"
                  >
                    View on Maps
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FaqPage;
