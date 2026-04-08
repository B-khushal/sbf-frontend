import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ProductGrid from "@/components/ProductGrid";
import useCart from "@/hooks/use-cart";
import api from "@/services/api";
import { Search, Filter, Grid3X3, List, Star, Heart, Eye, ExternalLink, Sparkles, Leaf, Gift, ShoppingBag, X, ChevronDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { getImageUrl, getSquareImageUrl } from "@/config";
import { cn } from "@/lib/utils";
import ContactModal from "@/components/ui/ContactModal";

const CATEGORY_SLUG_MAP: Record<string, string> = {
  "chocolate-baskets": "Chocolate Baskets",
  "chocolate-bouquets": "Chocolate Bouquets",
  "chocolate-gift-sets": "Chocolate Gift Sets",
  "premium-chocolates": "Premium Chocolates",
  "gift-hampers": "Gift Hampers",
  "fruit-baskets": "Fruit Baskets",
  "flower-baskets": "Flower Baskets",
  "mixed-baskets": "Mixed Baskets",
  "mixed-arrangements": "Mixed Arrangements",
  "premium-collections": "Premium Collections",
  "seasonal-specials": "Seasonal Specials",
  "corporate-gifts": "Corporate Gifts",
  "baby-shower": "Baby Shower",
  "housewarming": "Housewarming",
  "thank-you": "Thank You",
  "party-arrangements": "Party Arrangements",
  "kids-birthday": "Kids Birthday",
  "birthday-cakes": "Birthday Cakes",
  "romantic-bouquets": "Romantic Bouquets",
  "love-arrangements": "Love Arrangements",
  "anniversary-gifts": "Anniversary Gifts",
  "gift-sets": "Gift Sets",
  "combos": "Combos",
  "combo-packs": "Combo Packs",
  "birthday-combos": "Birthday Combos",
  "anniversary-combos": "Anniversary Combos",
  "romantic-combos": "Romantic Combos",
  "special-occasion-combos": "Special Occasion Combos",
  "indoor-plants": "Indoor Plants",
  "succulents": "Succulents",
  "garden-plants": "Garden Plants",
  "air-purifying": "Air Purifying",
  "sympathy-bouquets": "Sympathy Bouquets",
  "condolence-arrangements": "Condolence Arrangements",
  "memorial-flowers": "Memorial Flowers",
  "peaceful-arrangements": "Peaceful Arrangements",
  "valentines-day": "Valentine's Day",
  "mothers-day": "Mother's Day",
  "fathers-day": "Father's Day",
  "new-year": "New Year",
  "raksha-bandhan": "Raksha Bandhan",
  // Add more as needed
};

const CATEGORY_ALIAS_MAP: Record<string, string> = {
  anivarsery: "Anniversary",
  aniversary: "Anniversary",
  "anivarsery gifts": "Anniversary Gifts",
  "aniversary gifts": "Anniversary Gifts",
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-sky-100 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-pink-500">{title}</h3>
        <ChevronDown
          size={18}
          className={`text-sky-500 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="mt-4 space-y-2">{children}</div>}
    </div>
  );
};

const PRICE_FILTER_MIN = 0;
const PRICE_FILTER_MAX = 88000;
const PRICE_HISTOGRAM_BARS = [32, 40, 34, 28, 24, 20, 18, 22];

type PriceRangeFilterCardProps = {
  isOpen: boolean;
  onToggle: () => void;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

const PriceRangeFilterCard: React.FC<PriceRangeFilterCardProps> = ({
  isOpen,
  onToggle,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}) => {
  const normalizeInput = (value: string, fallback: number) => {
    const numeric = value.replace(/\D/g, "");
    if (!numeric) return fallback;
    return Math.min(PRICE_FILTER_MAX, Math.max(PRICE_FILTER_MIN, Number(numeric)));
  };

  const minPercent = ((minValue - PRICE_FILTER_MIN) / (PRICE_FILTER_MAX - PRICE_FILTER_MIN)) * 100;
  const maxPercent = ((maxValue - PRICE_FILTER_MIN) / (PRICE_FILTER_MAX - PRICE_FILTER_MIN)) * 100;

  return (
    <div className="w-full mt-3 mb-4 rounded-2xl bg-white shadow-md border border-sky-100 p-4">
      <style>{`
        .price-range-input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          background: transparent;
          position: absolute;
          top: 0;
          left: 0;
          height: 18px;
          pointer-events: none;
        }
        .price-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #67b9df;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          pointer-events: auto;
          cursor: pointer;
          position: relative;
          z-index: 3;
        }
        .price-range-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #67b9df;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          pointer-events: auto;
          cursor: pointer;
          position: relative;
          z-index: 3;
        }
      `}</style>

      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between pb-3 border-b border-sky-100"
      >
        <span className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-pink-500">Price</span>
        <span className="text-lg text-sky-500 leading-none">{isOpen ? "-" : "+"}</span>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-[520px] opacity-100 pt-4" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex items-end gap-[2px] h-12">
          {PRICE_HISTOGRAM_BARS.map((height, index) => (
            <div
              key={`hist-${index}`}
              className="flex-1 bg-gray-300 rounded-t-sm"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-[13px] text-[#666]">
          <span>₹ 0</span>
          <span>₹ 6000+</span>
        </div>

        <div className="relative mt-4 h-[18px]">
          <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full rounded-full bg-[#ddd]" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-gradient-to-r from-sky-400 to-pink-500"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />

          <input
            type="range"
            min={PRICE_FILTER_MIN}
            max={PRICE_FILTER_MAX}
            value={minValue}
            onChange={(e) => onMinChange(Math.min(Number(e.target.value), maxValue))}
            className="price-range-input"
          />
          <input
            type="range"
            min={PRICE_FILTER_MIN}
            max={PRICE_FILTER_MAX}
            value={maxValue}
            onChange={(e) => onMaxChange(Math.max(Number(e.target.value), minValue))}
            className="price-range-input"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Minimum</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
              <input
                value={minValue}
                onChange={(e) => {
                  const next = normalizeInput(e.target.value, PRICE_FILTER_MIN);
                  onMinChange(Math.min(next, maxValue));
                }}
                className="w-full h-10 rounded-md border border-[#ddd] bg-white pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Maximum</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
              <input
                value={maxValue}
                onChange={(e) => {
                  const next = normalizeInput(e.target.value, PRICE_FILTER_MAX);
                  onMaxChange(Math.max(next, minValue));
                }}
                className="w-full h-10 rounded-md border border-[#ddd] bg-white pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const normalizeCategoryValue = (value?: string | null): string => {
  if (!value) return "";

  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  const lowerWithSpaces = lower.replace(/-/g, " ");

  if (CATEGORY_SLUG_MAP[lower]) {
    return CATEGORY_SLUG_MAP[lower];
  }

  if (CATEGORY_ALIAS_MAP[lower]) {
    return CATEGORY_ALIAS_MAP[lower];
  }

  if (CATEGORY_ALIAS_MAP[lowerWithSpaces]) {
    return CATEGORY_ALIAS_MAP[lowerWithSpaces];
  }

  // Make generic slugs like "birthday-bouquets" compatible with category matching.
  return trimmed.replace(/-/g, " ");
};

const ShopPage = () => {
  const { category: pathCategory } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { convertPrice, formatPrice } = useCurrency();
  
  // Get category from both path params and query params
  const queryCategory = searchParams.get('category');
  // Normalize category from path/query to actual category names used by product data.
  const normalizedPathCategory = normalizeCategoryValue(pathCategory);
  const normalizedQueryCategory = normalizeCategoryValue(queryCategory);
  const normalizedCategory = normalizedPathCategory || normalizedQueryCategory;
  const category = normalizedCategory || "";
  
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [minPriceFilter, setMinPriceFilter] = useState(PRICE_FILTER_MIN);
  const [maxPriceFilter, setMaxPriceFilter] = useState(PRICE_FILTER_MAX);
  const [isDesktopPriceOpen, setIsDesktopPriceOpen] = useState(true);
  const [isMobilePriceOpen, setIsMobilePriceOpen] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState<string | null>(null);

  const {
    addToCart,
    showContactModal,
    contactModalProduct,
    closeContactModal,
  } = useCart();

  // Get settings categories
  const { categories: settingsCategories, shopCategories } = useSettings();

  // Dynamic categories from settings with product counts
  console.log('Shop Categories:', shopCategories);
  console.log('Settings Categories:', settingsCategories);
  
  const flowerCategories = (shopCategories || settingsCategories).map(cat => ({
    name: cat.name,
    description: cat.description,
    image: cat.image,
    category: cat.name.toLowerCase().replace(/\s+/g, '-'),
    featured: cat.order < 3, // First 3 categories are featured
    count: filteredProducts.filter(p => 
      p.category?.toLowerCase() === cat.name.toLowerCase() || 
      p.categories?.some(productCat => productCat.toLowerCase() === cat.name.toLowerCase())
    ).length
  }));

  // Handle category click with same-tab navigation
  const handleCategoryClick = (categoryName: string) => {
    const categoryUrl = `/shop/${categoryName}`;
    navigate(categoryUrl);
  };

  // Initialize from URL parameters
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productsResponse = await api.get("/products");
        setProducts(productsResponse.data.products || []);

        // Collect both primary categories and additional categories
        const allCategories = new Set();
        (productsResponse.data.products || []).forEach((product: any) => {
          if (product.category) {
            allCategories.add(product.category.toLowerCase());
          }
          if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach(cat => allCategories.add(cat.toLowerCase()));
          }
        });

        const uniqueCategories = Array.from(allCategories).filter(Boolean);

        try {
          const categoriesResponse = await api.get("/products/categories");
          setCategories(categoriesResponse.data.categories || uniqueCategories);
        } catch (categoriesError) {
          setCategories(uniqueCategories);
        }
        
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setSelectedCategory(category);
  }, [category, pathCategory, queryCategory]);

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    try {
      const wishlistStr = localStorage.getItem("wishlist");
      if (wishlistStr) {
        const wishlistItems = JSON.parse(wishlistStr);
        if (Array.isArray(wishlistItems)) {
          const wishlistIds = wishlistItems.map(item => item.id);
          setWishlist(wishlistIds);
        }
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }, []);

  // Enhanced filtering logic with search, categories, and price range support
  useEffect(() => {
    let filtered = [...products];

    // Search filter - search in title, description, category, and additional categories
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const titleMatch = product.title?.toLowerCase().includes(query);
        const descriptionMatch = product.description?.toLowerCase().includes(query);
        const primaryCategoryMatch = product.category?.toLowerCase().includes(query);
        const additionalCategoriesMatch = product.categories?.some(cat => 
          cat.toLowerCase().includes(query)
        );
        
        return titleMatch || descriptionMatch || primaryCategoryMatch || additionalCategoriesMatch;
      });
    }

    // Filter by category - check both primary category and additional categories
    if (selectedCategory) {
      filtered = filtered.filter(product => {
        const primaryMatch = product.category?.toLowerCase() === selectedCategory.toLowerCase();
        const additionalMatch = product.categories?.some(cat => 
          cat.toLowerCase() === selectedCategory.toLowerCase()
        );
        return primaryMatch || additionalMatch;
      });
    }

    // Numeric INR price filtering for dual-range slider.
    filtered = filtered.filter(product => {
      const productPriceInINR = Number(product.price) || 0;
      return productPriceInINR >= minPriceFilter && productPriceInINR <= maxPriceFilter;
    });

    // Enhanced sorting logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, minPriceFilter, maxPriceFilter, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50">
      <main className="pt-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Results Header */}
          {searchQuery && (
            <div className="mb-12">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      navigate('/shop');
                    }}
                    className="hover:text-primary transition-colors"
                  >
                    Shop
                  </button>
                  <span>›</span>
                  <span className="text-gray-800 font-medium">
                    Search Results
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
                  Search Results for "{searchQuery}" - Flower Delivery in Hyderabad
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} matching your search
                </p>
              </div>
            </div>
          )}

          {/* Explore Our Exquisite Range - Only show when no category is selected and no search */}
          {!selectedCategory && !searchQuery && (
            <div className="mb-16">

              {/* Mobile Responsive Category Grid */}
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 justify-items-center">
                  {flowerCategories.map((category, index) => (
                    <div 
                      key={category.category}
                      onClick={() => handleCategoryClick(category.category)}
                      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100 hover:border-primary/30"
                    >
                      {/* 2:3 Aspect Ratio Image */}
                      <div className="aspect-[2/3] w-full overflow-hidden">
                        <img 
                          src={category.image.startsWith("http") ? category.image : category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      </div>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                        <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 leading-tight">{category.name}</h3>
                        <p className="text-xs text-white/80 hidden sm:block">{category.count} products</p>
                      </div>
                      
                      {/* Popular Badge */}
                      {category.featured && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          ✨
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category Header - Show when a category is selected */}
          {selectedCategory && !searchQuery && (
            <div className="mb-12">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <button 
                    onClick={() => navigate('/shop')}
                    className="hover:text-primary transition-colors"
                  >
                    Shop
                  </button>
                  <span>›</span>
                  <span className="text-gray-800 font-medium">
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Collection - Flower Delivery in Hyderabad
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Discover our beautiful selection of {selectedCategory.toLowerCase()} carefully curated for your special moments
                </p>
              </div>
            </div>
          )}

          {/* Main Content: Mobile Horizontal Dropdown Filters + Product Grid */}
          {/* Mobile Horizontal Filter Pills */}
          <div className="lg:hidden">
            <div 
              className="flex overflow-x-auto gap-2 px-2 py-3"
              style={{ 
                scrollBehavior: 'smooth', 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none'
              }}
            >
              <style>{`
                .mobile-filter-row::-webkit-scrollbar { display: none; }
                .mobile-filter-row { scrollbar-width: none; }
              `}</style>
              
              <div className="mobile-filter-row flex gap-2 overflow-x-auto flex-nowrap">
                {/* Filters Button */}
                <button
                  onClick={() => {
                    setMobileFilterOpen(true);
                    setActiveFilterSection(null);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                    'bg-gradient-to-r from-sky-400 to-pink-500 text-white transition-all duration-200',
                    'hover:shadow-md active:scale-95 flex-shrink-0'
                  )}
                >
                  <Filter size={16} />
                  Filters
                </button>

                {/* Sort By Button */}
                <button
                  onClick={() => {
                    setMobileFilterOpen(true);
                    setActiveFilterSection("sort");
                  }}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                    'bg-white border-2 transition-all duration-200 flex-shrink-0',
                    sortBy && sortBy !== "newest" 
                      ? 'border-sky-300 bg-gradient-to-r from-sky-50 to-pink-50 text-pink-700' 
                      : 'border-sky-200 text-sky-700 hover:border-pink-300'
                  )}
                >
                  {sortBy === "newest" ? "Sort" : sortBy === "price-asc" ? "Low to High" : "High to Low"}
                  <ChevronDown size={14} />
                </button>

                {/* Price Button */}
                <button
                  onClick={() => {
                    setMobileFilterOpen(true);
                    setIsMobilePriceOpen(true);
                  }}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                    'bg-white border-2 transition-all duration-200 flex-shrink-0',
                    (minPriceFilter !== PRICE_FILTER_MIN || maxPriceFilter !== PRICE_FILTER_MAX)
                      ? 'border-sky-300 bg-gradient-to-r from-sky-50 to-pink-50 text-pink-700'
                      : 'border-sky-200 text-sky-700 hover:border-pink-300'
                  )}
                >
                  {(minPriceFilter === PRICE_FILTER_MIN && maxPriceFilter === PRICE_FILTER_MAX)
                    ? "Price"
                    : `Price: ₹${minPriceFilter} - ₹${maxPriceFilter}`}
                  <ChevronDown size={14} />
                </button>

                {/* Category Button */}
                <button
                  onClick={() => {
                    setMobileFilterOpen(true);
                    setActiveFilterSection("category");
                  }}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                    'bg-white border-2 transition-all duration-200 flex-shrink-0',
                    selectedCategory
                      ? 'border-sky-300 bg-gradient-to-r from-sky-50 to-pink-50 text-pink-700'
                      : 'border-sky-200 text-sky-700 hover:border-pink-300'
                  )}
                >
                  {selectedCategory ? `Category: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` : 'Category'}
                  <ChevronDown size={14} />
                </button>

                {/* Delivery Button */}
                <button
                  onClick={() => {
                    setMobileFilterOpen(true);
                    setActiveFilterSection("delivery");
                  }}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                    'bg-white border-2 transition-all duration-200 flex-shrink-0',
                    deliveryOption
                      ? 'border-sky-300 bg-gradient-to-r from-sky-50 to-pink-50 text-pink-700'
                      : 'border-sky-200 text-sky-700 hover:border-pink-300'
                  )}
                >
                  {deliveryOption ? `Delivery: ${deliveryOption.replace('-', ' ')}` : 'Delivery'}
                  <ChevronDown size={14} />
                </button>

                {/* Occasion Button */}
                <button
                  onClick={() => {
                    setMobileFilterOpen(true);
                    setActiveFilterSection("occasion");
                  }}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                    'bg-white border-2 transition-all duration-200 flex-shrink-0',
                    occasionFilter
                      ? 'border-sky-300 bg-gradient-to-r from-sky-50 to-pink-50 text-pink-700'
                      : 'border-sky-200 text-sky-700 hover:border-pink-300'
                  )}
                >
                  {occasionFilter ? `Occasion: ${occasionFilter.replace('-', ' ')}` : 'Occasion'}
                  <ChevronDown size={14} />
                </button>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setMinPriceFilter(PRICE_FILTER_MIN);
                    setMaxPriceFilter(PRICE_FILTER_MAX);
                    setSortBy("newest");
                    setDeliveryOption("");
                    setOccasionFilter("");
                    navigate("/shop");
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                    'bg-white border border-red-300 text-red-600 transition-all duration-200',
                    'hover:bg-red-50 hover:shadow-sm active:scale-95 flex-shrink-0'
                  )}
                >
                  <X size={16} />
                  Reset
                </button>
              </div>
            </div>
            
            {/* Inline Expandable Filter Panel */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                mobileFilterOpen ? "max-h-[1200px] opacity-100 translate-y-0 mt-3 mb-4" : "max-h-0 opacity-0 -translate-y-1"
              )}
            >
              <div className="w-full rounded-2xl bg-white shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-pink-500">Filters</h2>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close filters"
                  >
                    <X size={20} className="text-sky-500" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="border border-sky-100 rounded-lg p-4">
                    <button
                      onClick={() => setActiveFilterSection(activeFilterSection === "sort" ? null : "sort")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="font-semibold text-sky-700">Sort By</h3>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "transition-transform duration-200",
                          activeFilterSection === "sort" && "rotate-180"
                        )}
                      />
                    </button>
                    {activeFilterSection === "sort" && (
                      <div className="mt-3 space-y-2">
                        {[
                          { label: 'Newest', value: 'newest' },
                          { label: 'Price: Low to High', value: 'price-asc' },
                          { label: 'Price: High to Low', value: 'price-desc' },
                        ].map(option => (
                          <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="sort"
                              value={option.value}
                              checked={sortBy === option.value}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <span className="text-gray-700 group-hover:text-pink-600 transition-colors">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <PriceRangeFilterCard
                    isOpen={isMobilePriceOpen}
                    onToggle={() => setIsMobilePriceOpen((prev) => !prev)}
                    minValue={minPriceFilter}
                    maxValue={maxPriceFilter}
                    onMinChange={setMinPriceFilter}
                    onMaxChange={setMaxPriceFilter}
                  />

                  <div className="border border-sky-100 rounded-lg p-4">
                    <button
                      onClick={() => setActiveFilterSection(activeFilterSection === "category" ? null : "category")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="font-semibold text-sky-700">Category</h3>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "transition-transform duration-200",
                          activeFilterSection === "category" && "rotate-180"
                        )}
                      />
                    </button>
                    {activeFilterSection === "category" && (
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {(() => {
                          const predefined = [
                            { label: 'Bouquets', value: 'bouquets' },
                            { label: 'Baskets', value: 'baskets' },
                            { label: 'Roses', value: 'roses' },
                            { label: 'Birthday', value: 'birthday' },
                            { label: 'Anniversary', value: 'anniversary' },
                          ];
                          const predefinedValues = new Set(predefined.map(p => p.value));
                          const dynamicCategories = categories
                            .slice(0, 10)
                            .filter(cat => !predefinedValues.has(cat.toLowerCase()))
                            .map(cat => ({
                              label: cat.charAt(0).toUpperCase() + cat.slice(1),
                              value: cat.toLowerCase()
                            }));

                          return [...predefined, ...dynamicCategories].map(option => (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="radio"
                                name="category"
                                value={option.value}
                                checked={selectedCategory === option.value}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-5 h-5 cursor-pointer"
                              />
                              <span className="text-gray-700 group-hover:text-pink-600 transition-colors">{option.label}</span>
                            </label>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="border border-sky-100 rounded-lg p-4">
                    <button
                      onClick={() => setActiveFilterSection(activeFilterSection === "delivery" ? null : "delivery")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="font-semibold text-sky-700">Delivery</h3>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "transition-transform duration-200",
                          activeFilterSection === "delivery" && "rotate-180"
                        )}
                      />
                    </button>
                    {activeFilterSection === "delivery" && (
                      <div className="mt-3 space-y-2">
                        {[
                          { label: 'Same Day', value: 'same-day' },
                          { label: 'Tomorrow', value: 'tomorrow' },
                          { label: 'Midnight', value: 'midnight' },
                        ].map(option => (
                          <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="delivery"
                              value={option.value}
                              checked={deliveryOption === option.value}
                              onChange={(e) => setDeliveryOption(e.target.value)}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <span className="text-gray-700 group-hover:text-pink-600 transition-colors">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border border-sky-100 rounded-lg p-4">
                    <button
                      onClick={() => setActiveFilterSection(activeFilterSection === "occasion" ? null : "occasion")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="font-semibold text-sky-700">Occasion</h3>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "transition-transform duration-200",
                          activeFilterSection === "occasion" && "rotate-180"
                        )}
                      />
                    </button>
                    {activeFilterSection === "occasion" && (
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {[
                          { label: 'Birthday', value: 'birthday' },
                          { label: 'Anniversary', value: 'anniversary' },
                          { label: 'Love & Romance', value: 'love' },
                          { label: 'Congratulations', value: 'congratulations' },
                          { label: 'Get Well', value: 'get-well' },
                          { label: 'Thank You', value: 'thank-you' },
                        ].map(option => (
                          <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="occasion"
                              value={option.value}
                              checked={occasionFilter === option.value}
                              onChange={(e) => setOccasionFilter(e.target.value)}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <span className="text-gray-700 group-hover:text-pink-600 transition-colors">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-sky-100 mt-4 pt-4 space-y-3">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-3 bg-gradient-to-r from-sky-400 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setMinPriceFilter(PRICE_FILTER_MIN);
                      setMaxPriceFilter(PRICE_FILTER_MAX);
                      setSortBy("newest");
                      setDeliveryOption("");
                      setOccasionFilter("");
                      navigate("/shop");
                    }}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-4">
            
            {/* Filters Sidebar - Desktop Only (>= lg) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-sky-100 p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-pink-500 flex items-center gap-2">
                    <Filter size={18} />
                    Filters
                  </h2>
                  <button 
                    onClick={() => {
                      setSelectedCategory("");
                      setMinPriceFilter(PRICE_FILTER_MIN);
                      setMaxPriceFilter(PRICE_FILTER_MAX);
                      setSortBy("newest");
                      navigate("/shop");
                    }}
                    className="text-xs font-medium text-sky-600 hover:text-pink-600"
                  >
                    Reset
                  </button>
                </div>

                <FilterSection title="Category">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-1 rounded-md transition-colors text-xs hover:bg-gray-100 ${
                        selectedCategory === cat ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white font-medium" : "text-gray-600"
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </FilterSection>

                <PriceRangeFilterCard
                  isOpen={isDesktopPriceOpen}
                  onToggle={() => setIsDesktopPriceOpen((prev) => !prev)}
                  minValue={minPriceFilter}
                  maxValue={maxPriceFilter}
                  onMinChange={setMinPriceFilter}
                  onMaxChange={setMaxPriceFilter}
                />

                <FilterSection title="Sort By">
                  {["newest", "price-asc", "price-desc"].map((sortOption) => (
                    <button
                      key={sortOption}
                      onClick={() => setSortBy(sortOption)}
                      className={`w-full text-left px-3 py-1 rounded-md transition-colors text-xs hover:bg-gray-100 ${
                        sortBy === sortOption ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white font-medium" : "text-gray-600"
                      }`}
                    >
                      {sortOption.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </FilterSection>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm animate-pulse">
                      <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
                      <div className="mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800">No products found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <ProductGrid 
                  products={filteredProducts} 
                  loading={isLoading}
                  className={viewMode === "list" ? "grid-cols-1 gap-4" : ""}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={closeContactModal}
        productTitle={contactModalProduct}
      />
    </div>
  );
};

export default ShopPage; 