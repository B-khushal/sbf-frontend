import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flower2,
  Sparkles,
  Search,
  X,
  ChevronRight,
  ArrowUpRight,
  Gift,
  Cake,
  Truck,
  Info,
  ShieldCheck,
  MapPin,
  Heart,
  Calendar,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  PhoneCall,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import categoryService, { Category } from '@/services/categoryService';

export interface SitemapLink {
  title: string;
  url: string;
  description?: string;
  badge?: string;
  keywords?: string[];
}

export interface SitemapSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  links: SitemapLink[];
}

// Authoritative curated seed destinations verified in the database & route registry
const BASE_SECTIONS: SitemapSection[] = [
  {
    id: 'collections',
    title: 'Shop All Flowers & Gifts',
    subtitle: 'Signature arrangements, fresh floral bouquets, and luxury hand-tied bunches',
    icon: Flower2,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    links: [
      { title: 'Shop All Flowers', url: '/shop', description: 'Browse our complete catalog of fresh blooms & gifts', badge: 'Full Catalog' },
      { title: 'Flower Bouquets', url: '/bouquets', description: 'Handcrafted daily with farm-fresh flowers', badge: 'Popular' },
      { title: 'Fresh Roses', url: '/roses', description: 'Classic red, pink, yellow & pastel long-stem roses', badge: 'Bestseller' },
      { title: 'Flower Baskets', url: '/flower-baskets', description: 'Artisanal wicker basket floral arrangements' },
      { title: 'Vase Arrangements', url: '/vase', description: 'Elegant glass vase table centerpieces' },
      { title: 'Premium Long-Stem Roses', url: '/premium-roses', description: 'Imported Grade-A Dutch & Tasmanian roses', badge: 'Luxury' },
      { title: 'Exotic Orchids', url: '/orchids', description: 'Long-lasting purple, white & blue dendrobium orchids' },
      { title: 'Fresh Carnations', url: '/carnation', description: 'Charming pastel carnations in vibrant wraps' },
      { title: 'Dutch Tulips', url: '/tulips', description: 'Exquisite seasonal imported Dutch tulip stems' },
      { title: 'Mixed Flower Baskets', url: '/mixed-baskets', description: 'Harmonious blends of seasonal fresh garden blooms' },
      { title: 'Budget Friendly Flowers', url: '/budget-friendly', description: 'Thoughtful floral gifts under ₹1,000', badge: 'Value' },
      { title: 'Lavender Lisianthus', url: '/lavender-lisianthus', description: 'Delicate lisianthus arrangements with romantic charm' }
    ]
  },
  {
    id: 'flowers',
    title: 'Shop by Flower Type & Colors',
    subtitle: 'Browse your favorite blossom varieties, stem styles, and vibrant palettes',
    icon: Layers,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    links: [
      { title: 'Red Roses Collection', url: '/roses', description: 'Deep crimson roses expressing timeless love & passion' },
      { title: 'Sunflowers Collection', url: '/sunflowers', description: 'Bright cheerful sunflowers radiating warmth & optimism', badge: 'Trending' },
      { title: 'Asiatic & Oriental Lilies', url: '/lilies', description: 'Fragrant pink, white & yellow lilies with lavish petals' },
      { title: 'Royal Hydrangeas', url: '/hydrangea', description: 'Lush blue, purple & blush hydrangea flower globes' },
      { title: 'Lavender Lisianthus', url: '/lavender-lisianthus', description: 'Graceful bell-shaped lisianthus in royal lavender tones' },
      { title: 'Fresh Carnations', url: '/carnation', description: 'Soft ruffled carnations for warm congratulations' },
      { title: 'Exotic Orchids', url: '/orchids', description: 'Statement orchids for luxury decor and milestone gifts' },
      { title: 'Dutch Tulips', url: '/tulips', description: 'Elegant springtime Dutch tulips for refined gifting' },
      { title: 'Mixed Floral Bouquets', url: '/bouquets', description: 'Vibrant combinations of seasonal botanicals' },
      { title: 'Party Flower Arrangements', url: '/party-arrangements', description: 'Festive floral arrangements for venue & home parties' }
    ]
  },
  {
    id: 'occasions',
    title: 'Shop by Occasion',
    subtitle: 'Celebrate life’s unforgettable moments with tailored flower and gift curations',
    icon: Calendar,
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    links: [
      { title: 'Birthday Flowers & Gifts', url: '/birthday', description: 'Colorful bouquets, balloons & sweet birthday surprises', badge: 'Popular' },
      { title: 'Anniversary Flowers & Gifts', url: '/anniversary', description: 'Romantic roses, elegant combos & couple arrangements', badge: 'Popular' },
      { title: 'Love & Romance Bouquets', url: '/love-romance', description: 'Express heartfelt passion with heartfelt red roses' },
      { title: 'Wedding & Bridal Florals', url: '/wedding', description: 'Exquisite bridal party stems & congratulatory arrangements' },
      { title: 'Congratulations Bouquets', url: '/congratulations', description: 'Celebrate promotions, graduations & new beginnings' },
      { title: 'Thank You Flowers', url: '/thank-you', description: 'Graceful pastel blooms expressing sincere gratitude' },
      { title: 'Get Well Soon Bouquets', url: '/get-well-soon', description: 'Uplifting sunny blossoms to brighten recuperation days' },
      { title: 'Sympathy & Condolence Flowers', url: '/sympathy', description: 'White lilies & serene carnations offering solace' },
      { title: "Mother's Day Flowers", url: '/mothers-day', description: 'Tender pink carnations and roses honoring mothers' },
      { title: "Father's Day Gifts", url: '/fathers-day', description: 'Sophisticated flower & cake combinations for fathers' },
      { title: "Valentine's Day Special", url: '/valentines-day', description: 'Exclusive Valentine week roses, chocolates & combos', badge: 'Featured' },
      { title: 'Friendship Day Bouquets', url: '/friendship-day', description: 'Vibrant yellow roses celebrating lifelong companions' },
      { title: 'Baby Shower Florals', url: '/baby-shower', description: 'Sweet pastel arrangements welcoming new arrivals' },
      { title: 'Housewarming Flowers', url: '/housewarming', description: 'Warm floral baskets blessing brand new homes' },
      { title: "Teacher's Day Flowers", url: '/teachers-day', description: 'Respectful floral tributes for beloved educators' },
      { title: 'New Year Celebrations', url: '/new-year', description: 'Sparkling floral bouquets ushering in the New Year' },
      { title: 'Christmas Festive Florals', url: '/christmas', description: 'Red and white holiday arrangements with festive greens' },
      { title: 'Diwali Festive Gifts', url: '/diwali', description: 'Golden celebration combos & marigold-inspired blossoms' }
    ]
  },
  {
    id: 'cakes',
    title: 'Cakes & Celebration Combos',
    subtitle: 'Oven-fresh bakery cakes paired with flowers, chocolates & gift hampers',
    icon: Cake,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    links: [
      { title: 'All Celebration Cakes', url: '/cakes', description: 'Delicious gourmet artisan cakes for every sweet tooth', badge: 'Fresh Daily' },
      { title: 'Dutch Truffle & Chocolate Cakes', url: '/cakes/chocolate-cakes', description: 'Rich Belgian & dark chocolate indulgence' },
      { title: 'Fresh Fruit Cakes', url: '/cakes/fruit-cakes', description: 'Vanilla sponge layered with seasonal fresh tropical fruits' },
      { title: 'Classic Red Velvet Cakes', url: '/cakes/red-velvet-cakes', description: 'Smooth cream cheese frosting on rich red velvet crumb' },
      { title: 'Traditional Black Forest Cakes', url: '/cakes/black-forest-cakes', description: 'Cherries, dark chocolate shavings and fresh whipped cream' },
      { title: 'Special Birthday Cakes', url: '/cakes/birthday-cakes', description: 'Custom message cakes baked fresh for birthday parties' },
      { title: 'Cake & Flower Combos', url: '/cake-flower-combos', description: 'Signature bouquet paired with freshly baked matching cake', badge: 'Combo Deal' },
      { title: 'Anniversary Gift Combos', url: '/anniversary-combos', description: 'Red roses, heart cakes & Ferrero Rocher chocolates' },
      { title: 'Birthday Gift Combos', url: '/birthday-combos', description: 'Party flowers, celebration cake and celebratory card' },
      { title: 'Celebration Combo Packs', url: '/combo-packs', description: 'Value packages combining flowers, teddy, cakes & sweets' },
      { title: 'Gourmet Fruit Baskets', url: '/fruit-baskets', description: 'Healthy fresh fruit hampers styled with garden blooms' },
      { title: 'Chocolate Bouquets & Baskets', url: '/chocolate-bouquets', description: 'Handcrafted bouquets wrapped with Cadbury & Ferrero treats' },
      { title: 'Premium Chocolate Gift Sets', url: '/chocolate-gift-sets', description: 'Artisanal gift boxes with luxury assorted chocolates' }
    ]
  },
  {
    id: 'delivery',
    title: 'Flower Delivery Areas',
    subtitle: 'Same-day, express & midnight floral delivery across Hyderabad & Secunderabad',
    icon: Truck,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    links: [
      { 
        title: 'Flower Delivery in Hyderabad', 
        url: '/flower-delivery-hyderabad', 
        description: 'Same-day & midnight deliveries across Banjara Hills, Jubilee Hills, Gachibowli, Hitec City, Mehdipatnam, Kukatpally, Madhapur & 50+ areas',
        badge: 'Same-Day'
      },
      { 
        title: 'Flower Delivery in Secunderabad', 
        url: '/flower-delivery-secunderabad', 
        description: 'Reliable floral delivery across Sainikpuri, Marredpally, Begumpet, Trimulgherry, ECIL, Bowenpally, Malkajgiri & Secunderabad PIN codes',
        badge: 'Same-Day'
      }
    ]
  },
  {
    id: 'support',
    title: 'About & Customer Support',
    subtitle: 'Learn about our floral design studio, customer service & florist partnerships',
    icon: Info,
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    links: [
      { title: 'About Spring Blossoms Florist', url: '/about', description: 'Our legacy, design philosophy & Mehdipatnam flagship floral studio' },
      { title: 'Contact Us & Floral Studio', url: '/contact', description: 'Direct florist helpline, studio directions & WhatsApp assistance' },
      { title: 'Shipping & Delivery Guide', url: '/shipping', description: 'Delivery slots, midnight cutoffs, shipping rates & pin code serviceability' },
      { title: 'Become a Partner Vendor', url: '/vendors-consent', description: 'Join our local florist and bakery partner fulfillment network' }
    ]
  },
  {
    id: 'policies',
    title: 'Customer Policies & Legal',
    subtitle: 'Transparency, customer security, cancellation terms & guarantee guidelines',
    icon: ShieldCheck,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    links: [
      { title: 'Terms of Service', url: '/terms', description: 'Standard order terms, delivery agreements & user rights' },
      { title: 'Privacy Policy', url: '/privacy', description: 'How we securely safeguard your shopper data and payment details' },
      { title: 'Refund Policy', url: '/refund-policy', description: 'Our 100% freshness guarantee and hassle-free return guidelines' },
      { title: 'Cancellation Policy', url: '/cancellation-policy', description: 'Order cancellation timeframes and rescheduling instructions' }
    ]
  }
];

// Quick filter categories
const FILTER_TABS = [
  { id: 'all', label: 'All Links' },
  { id: 'collections', label: 'Flowers & Bouquets' },
  { id: 'flowers', label: 'Flower Types & Colors' },
  { id: 'occasions', label: 'Occasions' },
  { id: 'cakes', label: 'Cakes & Combos' },
  { id: 'delivery', label: 'Delivery Areas' },
  { id: 'support', label: 'About & Policies' }
];

const SitemapPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sections, setSections] = useState<SitemapSection[]>(BASE_SECTIONS);
  const [dynamicLoading, setDynamicLoading] = useState(false);

  // Dynamic category sync with graceful fallback
  useEffect(() => {
    let isMounted = true;
    const fetchDynamicCategories = async () => {
      try {
        setDynamicLoading(true);
        const categories = await categoryService.getCategories({ status: 'active' });
        if (!isMounted || !Array.isArray(categories) || categories.length === 0) return;

        // Collect existing URLs in base sections
        const existingUrls = new Set<string>();
        BASE_SECTIONS.forEach(s => s.links.forEach(l => existingUrls.add(l.url.toLowerCase())));

        const newCategoryLinks: SitemapLink[] = [];

        categories.forEach((cat: Category) => {
          if (!cat.name) return;
          const url = cat.categoryUrl || `/${cat.slug}`;
          const cleanUrl = url.startsWith('/') ? url : `/${url}`;
          
          if (!existingUrls.has(cleanUrl.toLowerCase()) && !cleanUrl.includes('admin')) {
            existingUrls.add(cleanUrl.toLowerCase());
            newCategoryLinks.push({
              title: cat.name,
              url: cleanUrl,
              description: cat.description || `Fresh ${cat.name.toLowerCase()} curated by our master florists`,
              badge: cat.featured ? 'Featured' : undefined
            });
          }
        });

        if (newCategoryLinks.length > 0 && isMounted) {
          setSections(prevSections => {
            return prevSections.map(sec => {
              if (sec.id === 'collections') {
                return {
                  ...sec,
                  links: [...sec.links, ...newCategoryLinks]
                };
              }
              return sec;
            });
          });
        }
      } catch (err) {
        // Silently use the robust static seed
        console.debug('Dynamic category sync: using cached sitemap seed');
      } finally {
        if (isMounted) setDynamicLoading(false);
      }
    };

    fetchDynamicCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered links calculation
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return sections
      .map(sec => {
        // Check tab match
        if (activeTab !== 'all') {
          if (activeTab === 'support') {
            if (sec.id !== 'support' && sec.id !== 'policies') return null;
          } else if (sec.id !== activeTab) {
            return null;
          }
        }

        // Filter links by search query
        let matchedLinks = sec.links;
        if (q) {
          matchedLinks = sec.links.filter(link => {
            const matchTitle = link.title.toLowerCase().includes(q);
            const matchDesc = link.description?.toLowerCase().includes(q);
            const matchUrl = link.url.toLowerCase().includes(q);
            const matchSec = sec.title.toLowerCase().includes(q);
            return matchTitle || matchDesc || matchUrl || matchSec;
          });
        }

        if (matchedLinks.length === 0) return null;

        return {
          ...sec,
          links: matchedLinks
        };
      })
      .filter((sec): sec is SitemapSection => sec !== null);
  }, [sections, searchQuery, activeTab]);

  // Total count of matching destinations
  const totalMatchingLinks = useMemo(() => {
    return filteredSections.reduce((acc, sec) => acc + sec.links.length, 0);
  }, [filteredSections]);

  const totalAllLinks = useMemo(() => {
    return sections.reduce((acc, sec) => acc + sec.links.length, 0);
  }, [sections]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveTab('all');
  };

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20 pt-6 sm:pt-10">
      <Helmet>
        <title>Sitemap | Spring Blossoms Florist — Flower Delivery Hyderabad</title>
        <meta
          name="description"
          content="Explore Spring Blossoms Florist HTML sitemap. Discover fresh flower bouquets, roses, cakes, combos, occasion gifts, and flower delivery across Hyderabad and Secunderabad."
        />
        <link rel="canonical" href="https://sbflorist.in/sitemap" />
        <meta property="og:title" content="Sitemap | Spring Blossoms Florist — Flower Delivery Hyderabad" />
        <meta
          property="og:description"
          content="Explore Spring Blossoms Florist complete sitemap. Quick discovery for bouquets, roses, cakes, combos, occasions, and delivery areas in Hyderabad."
        />
        <meta property="og:url" content="https://sbflorist.in/sitemap" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Sitemap | Spring Blossoms Florist" />
        <meta
          name="twitter:description"
          content="Find all flower collections, bouquets, gifts, delivery areas and customer support pages in one organized directory."
        />
      </Helmet>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-6">
          <Link
            to="/"
            className="hover:text-rose-600 transition-colors font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 rounded"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-800 font-semibold" aria-current="page">
            Sitemap
          </span>
        </nav>

        {/* Page Header Introduction */}
        <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          {/* Subtle floral visual accent badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-800 text-xs sm:text-sm font-medium mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>A Reason to Express — Website Directory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight mb-4">
            Explore Spring Blossoms Florist
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
            Find our flower collections, bouquets, gifts, delivery information, and helpful pages in one place.
          </p>
        </header>

        {/* Search & Quick Filter Controls */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-stone-200/90 shadow-xs focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-400 transition-all">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-stone-400 ml-2.5 shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search flower collections, cakes, occasions, delivery areas..."
                className="w-full pl-3 pr-10 py-2 text-sm sm:text-base text-stone-800 placeholder-stone-400 bg-transparent border-0 focus:outline-none focus:ring-0"
                aria-label="Search sitemap links and categories"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Category Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
            {FILTER_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500',
                    isActive
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100/80 border border-stone-200/80'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active search status count bar */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-2 mt-3 font-medium">
            <span>
              {searchQuery || activeTab !== 'all' ? (
                <>
                  Found <strong className="text-stone-800">{totalMatchingLinks}</strong> destinations
                  {searchQuery && <> for &ldquo;<span className="text-rose-600">{searchQuery}</span>&rdquo;</>}
                </>
              ) : (
                <>Showing all <strong>{totalAllLinks}</strong> verified destinations across Hyderabad</>
              )}
            </span>
            {(searchQuery || activeTab !== 'all') && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Empty State when no links match search query */}
        {filteredSections.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-2">No sitemap entries match your search</h2>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              We couldn’t find any pages matching &ldquo;<span className="font-semibold text-stone-800">{searchQuery}</span>&rdquo;.
              Try checking your spelling or reset the filter to explore all collections.
            </p>
            <button
              type="button"
              onClick={handleClearSearch}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" /> Reset Search & Browse All
            </button>
          </div>
        )}

        {/* Sitemap Sections Grid */}
        <div className="space-y-10 sm:space-y-12">
          {filteredSections.map(section => {
            const Icon = section.icon;
            const isSecondary = section.id === 'policies';

            return (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`heading-${section.id}`}
                className={cn(
                  'bg-white rounded-2xl border transition-all duration-300 p-6 sm:p-8',
                  isSecondary
                    ? 'border-stone-200 bg-stone-50/50'
                    : 'border-stone-200/90 shadow-xs hover:border-rose-200/80 hover:shadow-md'
                )}
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/70 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2
                        id={`heading-${section.id}`}
                        className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight"
                      >
                        {section.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 mt-0.5 font-normal">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Section count badge */}
                  <span
                    className={cn(
                      'self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold border',
                      section.badgeColor
                    )}
                  >
                    {section.links.length} {section.links.length === 1 ? 'Destination' : 'Destinations'}
                  </span>
                </div>

                {/* Section Links Grid */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-6">
                  {section.links.map(link => {
                    return (
                      <li key={link.url + link.title}>
                        <Link
                          to={link.url}
                          className="group h-full flex flex-col justify-between p-3.5 rounded-xl border border-stone-100/80 bg-stone-50/40 hover:bg-rose-50/50 hover:border-rose-200/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-stone-800 group-hover:text-rose-700 transition-colors">
                                {link.title}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {link.badge && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-rose-100/80 text-rose-700">
                                    {link.badge}
                                  </span>
                                )}
                                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                              </div>
                            </div>
                            {link.description && (
                              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                                {link.description}
                              </p>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-stone-400 mt-2 truncate">
                            {link.url}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* XML Sitemap & Technical SEO Notice Card */}
        <aside
          aria-label="Technical SEO & XML Sitemap details"
          className="mt-12 bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono text-xs font-semibold uppercase">
                XML Sitemap Index
              </span>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active for Googlebot & Bingbot
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed pt-1">
              Search engine crawlers and automated indexing bots can access our automated XML sitemap index directly at{' '}
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-rose-600 hover:text-rose-700 hover:underline font-semibold"
              >
                /sitemap.xml
              </a>
              .
            </p>
          </div>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-2xs"
          >
            <span>View XML Sitemap</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </aside>
      </div>
    </div>
  );
};

export default SitemapPage;
