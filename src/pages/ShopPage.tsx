import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ProductGrid from "@/components/ProductGrid";
import useCart from "@/hooks/use-cart";
import api from "@/services/api";
import categoryService, { Category } from "@/services/categoryService";
import { Search, Filter, Grid3X3, List, Star, Heart, Eye, ExternalLink, Sparkles, Leaf, Gift, ShoppingBag, X, ChevronDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { getImageUrl, getSquareImageUrl } from "@/config";
import { cn } from "@/lib/utils";
import ContactModal from "@/components/ui/ContactModal";
import { PRIMARY_CATEGORIES, matchesCategoryGroup, normalizeCategoryKey, normalizeCategoryLabel } from "@/utils/categoryTaxonomy";
import { preprocessProductForSearch, createSearchIndex, rankSearchResults } from "@/utils/searchHelper";

const CATEGORY_SLUG_MAP: Record<string, string> = {
  "budget-friendly": "Budget Friendly",
  "budget-friendly-flowers": "Budget Friendly",
  "under-1000": "Budget Friendly",
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

const FLOWER_FILTER_OPTIONS = [
  { label: 'All Flower Types', value: '' },
  { label: '🌹 Roses', value: 'rose' },
  { label: '🌸 Lilies', value: 'lily' },
  { label: '🌺 Orchids', value: 'orchid' },
  { label: '💐 Carnations', value: 'carnation' },
  { label: '🌻 Sunflowers', value: 'sunflower' },
  { label: '🌷 Tulips', value: 'tulip' },
  { label: '🌼 Gerberas', value: 'gerbera' },
  { label: '🌿 Daisies', value: 'daisy' },
  { label: '🪻 Hydrangeas', value: 'hydrangea' },
  { label: '✨ Mixed Flowers', value: 'mixed' }
];

const COLOR_FILTER_OPTIONS = [
  { label: 'All Colors', value: '', dot: 'bg-gradient-to-r from-red-400 via-pink-400 to-yellow-400' },
  { label: 'Red', value: 'red', dot: 'bg-red-500' },
  { label: 'Pink', value: 'pink', dot: 'bg-pink-400' },
  { label: 'White', value: 'white', dot: 'bg-slate-100 border border-gray-300' },
  { label: 'Yellow', value: 'yellow', dot: 'bg-yellow-400' },
  { label: 'Purple', value: 'purple', dot: 'bg-purple-500' },
  { label: 'Peach', value: 'peach', dot: 'bg-orange-300' },
  { label: 'Orange', value: 'orange', dot: 'bg-orange-500' },
  { label: 'Blue', value: 'blue', dot: 'bg-blue-500' }
];

const OCCASION_FILTER_OPTIONS = [
  { label: 'All Occasions', value: '' },
  { label: '🎂 Birthday', value: 'birthday' },
  { label: '💍 Anniversary', value: 'anniversary' },
  { label: '❤️ Love & Romance', value: 'love' },
  { label: '👰 Wedding', value: 'wedding' },
  { label: '🎉 Congratulations', value: 'congratulations' },
  { label: '🌿 Get Well Soon', value: 'get well' },
  { label: '🙏 Thank You', value: 'thank you' },
  { label: '🕊️ Sympathy', value: 'sympathy' }
];

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

export const PRICE_FILTER_MIN = 0;
export const PRICE_FILTER_MAX = 88000;
export const PRICE_HISTOGRAM_BARS = [32, 40, 34, 28, 24, 20, 18, 22];

export type PriceRangeFilterCardProps = {
  isOpen: boolean;
  onToggle: () => void;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

export const PriceRangeFilterCard: React.FC<PriceRangeFilterCardProps> = ({
  isOpen,
  onToggle,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}) => {
  const [localMin, setLocalMin] = useState(String(minValue));
  const [localMax, setLocalMax] = useState(String(maxValue));

  useEffect(() => {
    const currentNum = localMin === "" ? PRICE_FILTER_MIN : Number(localMin);
    if (minValue !== currentNum) {
      setLocalMin(String(minValue));
    }
  }, [minValue]);

  useEffect(() => {
    const currentNum = localMax === "" ? PRICE_FILTER_MAX : Number(localMax);
    if (maxValue !== currentNum) {
      setLocalMax(String(maxValue));
    }
  }, [maxValue]);

  const handleMinChange = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    setLocalMin(numeric);
    const numericVal = numeric ? Number(numeric) : PRICE_FILTER_MIN;
    onMinChange(Math.min(PRICE_FILTER_MAX, Math.max(PRICE_FILTER_MIN, numericVal)));
  };

  const handleMaxChange = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    setLocalMax(numeric);
    const numericVal = numeric ? Number(numeric) : PRICE_FILTER_MAX;
    onMaxChange(Math.min(PRICE_FILTER_MAX, Math.max(PRICE_FILTER_MIN, numericVal)));
  };

  const handleMinBlur = () => {
    const numMin = localMin ? Number(localMin) : PRICE_FILTER_MIN;
    const numMax = localMax ? Number(localMax) : PRICE_FILTER_MAX;
    if (numMin > numMax) {
      onMinChange(numMax);
      onMaxChange(numMin);
      setLocalMin(String(numMax));
      setLocalMax(String(numMin));
    }
  };

  const handleMaxBlur = () => {
    const numMin = localMin ? Number(localMin) : PRICE_FILTER_MIN;
    const numMax = localMax ? Number(localMax) : PRICE_FILTER_MAX;
    if (numMax < numMin) {
      onMinChange(numMax);
      onMaxChange(numMin);
      setLocalMin(String(numMax));
      setLocalMax(String(numMin));
    }
  };

  const minPercent = ((minValue - PRICE_FILTER_MIN) / (PRICE_FILTER_MAX - PRICE_FILTER_MIN)) * 100;
  const maxPercent = ((maxValue - PRICE_FILTER_MIN) / (PRICE_FILTER_MAX - PRICE_FILTER_MIN)) * 100;

  const displayMinPercent = Math.min(minPercent, maxPercent);
  const displayMaxPercent = Math.max(minPercent, maxPercent);

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
            style={{ left: `${displayMinPercent}%`, right: `${100 - displayMaxPercent}%` }}
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
                value={localMin}
                onChange={(e) => handleMinChange(e.target.value)}
                onBlur={handleMinBlur}
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
                value={localMax}
                onChange={(e) => handleMaxChange(e.target.value)}
                onBlur={handleMaxBlur}
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

  return normalizeCategoryLabel(trimmed) || trimmed;
};

export const getProductSellingPrice = (product: any): number => {
  if (!product) return 0;
  if (product.category === 'combos' && product.comboItems && product.comboItems.length > 0) {
    let total = Number(product.price) || 0;
    product.comboItems.forEach((item: any) => {
      if (item.customizationOptions?.allowVariants && item.customizationOptions?.variants?.length > 0) {
        const maxVariant = item.customizationOptions.variants.reduce((max: number, v: any) => v.price > max ? v.price : max, 0);
        total += maxVariant;
      } else {
        total += (Number(item.price) || 0);
      }
    });
    return total;
  }
  const basePrice = Number(product.price) || 0;
  if (product.discount && Number(product.discount) > 0) {
    return Math.round(basePrice * (1 - Number(product.discount) / 100));
  }
  return basePrice;
};

interface ShopPageProps {
  resolvedCategory?: any;
}

const ShopPage: React.FC<ShopPageProps> = ({ resolvedCategory }) => {
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
  const category = resolvedCategory ? resolvedCategory.name : (normalizedCategory || "");
  const normalizedPathCategoryKey = normalizeCategoryKey(pathCategory);
  const normalizedQueryCategoryKey = normalizeCategoryKey(queryCategory);
  const selectedCategoryKey = resolvedCategory ? resolvedCategory.slug : (normalizedPathCategoryKey || normalizedQueryCategoryKey);
  const isParentCategoryRoute = resolvedCategory ? !resolvedCategory.parentId : PRIMARY_CATEGORIES.some((category) => category.value === selectedCategoryKey);
  const isBudgetFriendlyCategory =
    selectedCategoryKey === "budget-friendly" ||
    normalizeCategoryKey(selectedCategory) === "budget-friendly" ||
    normalizeCategoryKey(pathCategory) === "budget-friendly" ||
    normalizeCategoryKey(queryCategory) === "budget-friendly";
  
  const [selectedCategory, setSelectedCategory] = useState(isBudgetFriendlyCategory ? "Budget Friendly" : category);
  const [sortBy, setSortBy] = useState("custom");
  const [viewMode, setViewMode] = useState("grid");
  const [minPriceFilter, setMinPriceFilter] = useState(PRICE_FILTER_MIN);
  const [maxPriceFilter, setMaxPriceFilter] = useState(PRICE_FILTER_MAX);
  const [isDesktopPriceOpen, setIsDesktopPriceOpen] = useState(true);
  const [isMobilePriceOpen, setIsMobilePriceOpen] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("");
  const [flowerTypeFilter, setFlowerTypeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [newArrivalOnly, setNewArrivalOnly] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
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

  const hasActiveFilters = Boolean(
    selectedCategory ||
    flowerTypeFilter ||
    occasionFilter ||
    colorFilter ||
    inStockOnly ||
    bestsellerOnly ||
    newArrivalOnly ||
    deliveryOption ||
    minPriceFilter > PRICE_FILTER_MIN ||
    maxPriceFilter < PRICE_FILTER_MAX
  );

  const handleResetAllFilters = () => {
    setSelectedCategory("");
    setMinPriceFilter(PRICE_FILTER_MIN);
    setMaxPriceFilter(PRICE_FILTER_MAX);
    setSortBy("custom");
    setDeliveryOption("");
    setOccasionFilter("");
    setFlowerTypeFilter("");
    setColorFilter("");
    setInStockOnly(false);
    setBestsellerOnly(false);
    setNewArrivalOnly(false);
    navigate("/shop");
  };

  // Get settings categories
  const { categories: settingsCategories, shopCategories } = useSettings();

  // Dynamic categories from settings with product counts
  console.log('Shop Categories:', shopCategories);
  console.log('Settings Categories:', settingsCategories);
  
  const sourceCategories = dbCategories.length > 0 ? dbCategories : (shopCategories || settingsCategories);
  
  const flowerCategories = sourceCategories
    .filter(cat => cat.showInShop === true)
    .map(cat => ({
      name: cat.name,
      description: cat.description,
      image: cat.image || '/images/roses-1.png',
      category: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      featured: cat.isFeatured || false,
      count: (cat.slug === 'budget-friendly' || cat.name?.toLowerCase() === 'budget friendly')
        ? products.filter(p => {
            const sp = getProductSellingPrice(p);
            return sp > 0 && sp <= 1000 && p.isAvailable !== false && !p.hidden;
          }).length
        : filteredProducts.filter(p => 
            p.category?.toLowerCase() === cat.name.toLowerCase() || 
            p.categories?.some((productCat: any) => productCat.toLowerCase() === cat.name.toLowerCase())
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
        const rawProducts = productsResponse.data.products || [];
        const processed = rawProducts.map((p: any) => preprocessProductForSearch(p));
        setProducts(processed);

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

        let dbCats: Category[] = [];
        try {
          dbCats = await categoryService.getCategories({ status: "active" });
          setDbCategories(dbCats);
        } catch (dbError) {
          console.error("❌ Error fetching db categories:", dbError);
        }

        const uniqueCategories = Array.from(allCategories).filter(Boolean) as string[];

        let finalCategories: string[] = [];
        try {
          const categoriesResponse = await api.get("/products/categories");
          finalCategories = categoriesResponse.data.categories || uniqueCategories;
        } catch (categoriesError) {
          finalCategories = uniqueCategories;
        }

        // Filter out categories that are toggled off in the database
        const filteredShopCategories = finalCategories.filter((catName) => {
          const dbMatch = dbCats.find(
            (c) => c.name.toLowerCase() === catName.toLowerCase() || c.slug.toLowerCase() === catName.toLowerCase()
          );
          return dbMatch ? dbMatch.showInShop !== false : true;
        });

        // Ensure active DB categories that have showInShop !== false are included
        dbCats.forEach(dbCat => {
          if (dbCat.showInShop !== false && dbCat.status === 'active') {
            const alreadyExists = filteredShopCategories.some(c => c.toLowerCase() === dbCat.name.toLowerCase() || c.toLowerCase() === dbCat.slug.toLowerCase());
            if (!alreadyExists) {
              filteredShopCategories.push(dbCat.name);
            }
          }
        });
        setCategories(filteredShopCategories);
        
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (resolvedCategory) {
      setSelectedCategory(resolvedCategory.name);
    } else if (isBudgetFriendlyCategory) {
      setSelectedCategory("Budget Friendly");
    } else {
      setSelectedCategory(category);
    }
  }, [category, pathCategory, queryCategory, resolvedCategory, isBudgetFriendlyCategory]);

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
      try {
        const index = createSearchIndex(products);
        const fuseResults = index.search(searchQuery);
        filtered = rankSearchResults(fuseResults, searchQuery);
      } catch (err) {
        console.error("Fuzzy search error on ShopPage:", err);
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
    }

    // Filter by category - support slug/space variants and parent category groups.
    if (selectedCategoryKey) {
      filtered = filtered.filter(product => {
        if (selectedCategoryKey === 'budget-friendly' || normalizeCategoryKey(selectedCategory) === 'budget-friendly') {
          const finalPrice = getProductSellingPrice(product);
          const isAvailable = product.isAvailable !== false && !product.hidden;
          return isAvailable && finalPrice > 0 && finalPrice <= 1000;
        }

        if (isParentCategoryRoute) {
          return matchesCategoryGroup(product.category, selectedCategoryKey, product.categories, product.subcategory);
        }

        const exactMatches = [
          product.subcategory,
          product.category,
          ...(Array.isArray(product.categories) ? product.categories : []),
        ]
          .map((value) => normalizeCategoryKey(value))
          .filter(Boolean);

        return exactMatches.includes(selectedCategoryKey);
      });
    }

    // Numeric INR price filtering for dual-range slider.
    filtered = filtered.filter(product => {
      const productPriceInINR = getProductSellingPrice(product);
      return productPriceInINR >= minPriceFilter && productPriceInINR <= maxPriceFilter;
    });

    // Same Day Delivery filter
    if (deliveryOption === "same-day") {
      filtered = filtered.filter((product: any) => product.sameDay !== false);
    }

    // Flower Type filter
    if (flowerTypeFilter) {
      const ft = flowerTypeFilter.toLowerCase();
      filtered = filtered.filter((p: any) => {
        const text = `${p.title || ''} ${p.description || ''} ${(p.categories || []).join(' ')} ${p.category || ''} ${(p.tags || []).map((t: any) => typeof t === 'string' ? t : t.tag || '').join(' ')}`.toLowerCase();
        return (p.flowerTypes && p.flowerTypes.includes(ft)) || text.includes(ft);
      });
    }

    // Occasion filter
    if (occasionFilter) {
      const occ = occasionFilter.toLowerCase();
      filtered = filtered.filter((p: any) => {
        const text = `${p.title || ''} ${p.description || ''} ${(p.occasions || []).join(' ')} ${(p.categories || []).join(' ')} ${p.category || ''}`.toLowerCase();
        return (p.occasions && p.occasions.includes(occ)) || text.includes(occ);
      });
    }

    // Color filter
    if (colorFilter) {
      const col = colorFilter.toLowerCase();
      filtered = filtered.filter((p: any) => {
        const text = `${p.title || ''} ${p.description || ''} ${(p.categories || []).join(' ')}`.toLowerCase();
        return (p.colors && p.colors.includes(col)) || text.includes(col);
      });
    }

    // In Stock Only filter
    if (inStockOnly) {
      filtered = filtered.filter((p: any) => {
        const stock = p.stock !== undefined ? p.stock : (p.countInStock || 0);
        return stock > 0 && p.isAvailable !== false;
      });
    }

    // Bestseller filter
    if (bestsellerOnly) {
      filtered = filtered.filter((p: any) => p.isBestseller === true);
    }

    // New Arrival filter
    if (newArrivalOnly) {
      filtered = filtered.filter((p: any) => p.isNewArrival === true || p.isNew === true);
    }

    // Helper to get product display order for custom sorting
    const getProductDisplayOrder = (product: any): number => {
      if (!product || !product.displayOrders) return 0;
      const dobj = product.displayOrders;

      if (selectedCategoryKey) {
        const catKey = selectedCategoryKey.toLowerCase();
        // 1. Try directly with selectedCategoryKey
        if (dobj.categories?.[catKey]) {
          return dobj.categories[catKey];
        }
        // 2. Try with selectedCategory (lowercase)
        if (selectedCategory) {
          const catName = selectedCategory.toLowerCase();
          if (dobj.categories?.[catName]) {
            return dobj.categories[catName];
          }
        }
        // 3. Try with product's own primary category
        if (product.category) {
          const prodCat = product.category.toLowerCase();
          if (dobj.categories?.[prodCat]) {
            return dobj.categories[prodCat];
          }
        }
        // 4. Try with product's other categories
        if (product.categories && Array.isArray(product.categories)) {
          for (const cat of product.categories) {
            const lowerCat = cat.toLowerCase();
            if (dobj.categories?.[lowerCat]) {
              return dobj.categories[lowerCat];
            }
          }
        }
      }

      // Default to shop display order if no category is selected or category-specific order is not found
      return dobj.shop || 0;
    };

    // Enhanced sorting logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "custom":
        default:
          const orderA = getProductDisplayOrder(a);
          const orderB = getProductDisplayOrder(b);
          
          const hasOrderA = orderA > 0;
          const hasOrderB = orderB > 0;
          
          if (hasOrderA && hasOrderB) {
            if (orderA !== orderB) return orderA - orderB;
          } else if (hasOrderA) {
            return -1;
          } else if (hasOrderB) {
            return 1;
          }
          
          // Fallback to newest first
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategoryKey, isParentCategoryRoute, minPriceFilter, maxPriceFilter, sortBy, searchQuery, deliveryOption, occasionFilter, flowerTypeFilter, colorFilter, inStockOnly, bestsellerOnly, newArrivalOnly]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50">
      <Helmet>
        {isBudgetFriendlyCategory ? (
          <>
            <title>Budget Friendly Flowers & Gifts Under ₹1,000 | Spring Blossoms Florist</title>
            <meta name="description" content="Shop beautiful budget-friendly flowers, bouquets and gifts under ₹1,000 from Spring Blossoms Florist. Elegant gifting options at thoughtful prices." />
            <meta name="keywords" content="budget friendly flowers, flowers under 1000, affordable flower delivery Hyderabad, budget bouquets, gifts under 1000, Spring Blossoms Florist" />
            <link rel="canonical" href="https://sbflorist.in/shop/budget-friendly" />
            <meta property="og:title" content="Budget Friendly Flowers & Gifts Under ₹1,000 | Spring Blossoms Florist" />
            <meta property="og:description" content="Shop beautiful budget-friendly flowers, bouquets and gifts under ₹1,000 from Spring Blossoms Florist. Elegant gifting options at thoughtful prices." />
            <meta property="og:url" content="https://sbflorist.in/shop/budget-friendly" />
          </>
        ) : (
          <>
            <title>Shop Online Flowers - Same Day & Midnight Delivery in Hyderabad | Spring Blossoms</title>
            <meta name="description" content="Browse our beautiful collections of fresh flowers, bouquets, cakes, and gifts. Order online for express same day and midnight delivery in Hyderabad." />
            <meta name="keywords" content="flower delivery Hyderabad, online flower delivery Hyderabad, same day flower delivery Hyderabad, midnight flower delivery Hyderabad, fresh flowers delivery Hyderabad, florist Hyderabad, best florist in Hyderabad, flower shop Hyderabad, online florist Hyderabad, bouquet delivery Hyderabad, rose bouquet delivery Hyderabad, birthday flower delivery Hyderabad, anniversary flower delivery Hyderabad, wedding flowers Hyderabad, flower arrangements Hyderabad, luxury flower delivery Hyderabad, affordable flower delivery Hyderabad, cheap flower delivery Hyderabad, premium flowers Hyderabad, flower bouquet online Hyderabad, send flowers to Hyderabad, Hyderabad flower delivery service, flowers home delivery Hyderabad, express flower delivery Hyderabad, 24 hour flower delivery Hyderabad, flowers near me Hyderabad, red roses delivery Hyderabad, orchid delivery Hyderabad, lily flower delivery Hyderabad, carnation bouquet Hyderabad, mixed flower bouquet Hyderabad, romantic flower delivery Hyderabad, Valentine's Day flowers Hyderabad, Mother's Day flower delivery Hyderabad, congratulations flowers Hyderabad, get well soon flowers Hyderabad, sympathy flowers Hyderabad, flower and cake delivery Hyderabad, flowers and gifts Hyderabad, flower basket delivery Hyderabad, customized bouquet Hyderabad, online bouquet order Hyderabad, florist near Hyderabad airport, flower delivery in Gachibowli, flower delivery in Hitech City, flower delivery in Banjara Hills, flower delivery in Jubilee Hills, flower delivery in Kondapur, flower delivery in Kukatpally, flower delivery in Secunderabad" />
          </>
        )}
      </Helmet>
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
            isBudgetFriendlyCategory ? (
              <div className="mb-10 sm:mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/70 via-sky-50/50 to-emerald-50/60 border border-bloom-pink-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-6 py-10 sm:py-12 text-center">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 max-w-3xl mx-auto">
                  {/* Breadcrumbs */}
                  <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
                    <button 
                      onClick={() => navigate('/shop')}
                      className="hover:text-primary transition-colors font-medium"
                    >
                      Shop
                    </button>
                    <span>›</span>
                    <span className="text-gray-800 font-semibold">
                      Budget Friendly
                    </span>
                  </div>

                  {/* Positioning Tagline Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-bloom-pink-200/70 shadow-xs mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-gray-700">
                      Affordable • Elegant • Thoughtfully Designed
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-3">
                    Budget Friendly
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-normal max-w-xl mx-auto">
                    Beautiful flowers, thoughtful gifts, effortless expressions — all under ₹1,000.
                  </p>

                  {/* Subtle Brand Watermark */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/70 font-serif italic">
                    <span>Spring Blossoms Florist</span>
                    <span>•</span>
                    <span>A Reason To Express</span>
                  </div>
                </div>
              </div>
            ) : (
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
            )
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
                    sortBy && sortBy !== "custom" 
                      ? 'border-sky-300 bg-gradient-to-r from-sky-50 to-pink-50 text-pink-700' 
                      : 'border-sky-200 text-sky-700 hover:border-pink-300'
                  )}
                >
                  {sortBy === "custom" ? "Sort: Recommended" : sortBy === "newest" ? "Sort: Newest" : sortBy === "price-asc" ? "Low to High" : "High to Low"}
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
                    setSortBy("custom");
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
              <div className="w-full rounded-2xl bg-white shadow-md border border-gray-200 p-4 max-h-[75vh] overflow-y-auto sidebar-scrollable">
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
                          { label: 'Recommended', value: 'custom' },
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
                            { label: 'Budget Friendly (≤ ₹1,000)', value: 'budget-friendly' },
                            { label: 'Bouquets', value: 'bouquets' },
                            { label: 'Baskets', value: 'baskets' },
                            { label: 'Roses', value: 'roses' },
                            { label: 'Birthday', value: 'birthday' },
                            { label: 'Anniversary', value: 'anniversary' },
                          ];
                          const filteredPredefined = predefined.filter(option => {
                            const dbMatch = dbCategories.find(
                              c => c.name.toLowerCase() === option.value.toLowerCase() || c.slug.toLowerCase() === option.value.toLowerCase()
                            );
                            return dbMatch ? dbMatch.showInShop !== false : true;
                          });
                          const predefinedValues = new Set(filteredPredefined.map(p => p.value));
                          const dynamicCategories = categories
                            .slice(0, 10)
                            .filter(cat => !predefinedValues.has(cat.toLowerCase()))
                            .map(cat => ({
                              label: cat.charAt(0).toUpperCase() + cat.slice(1),
                              value: cat.toLowerCase()
                            }));

                          return [...filteredPredefined, ...dynamicCategories].map(option => (
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

                  {/* Flower Type (Mobile) */}
                  <div className="border border-sky-100 rounded-lg p-4">
                    <button
                      onClick={() => setActiveFilterSection(activeFilterSection === "flower" ? null : "flower")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="font-semibold text-sky-700">Flower Type</h3>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "transition-transform duration-200",
                          activeFilterSection === "flower" && "rotate-180"
                        )}
                      />
                    </button>
                    {activeFilterSection === "flower" && (
                      <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
                        {FLOWER_FILTER_OPTIONS.map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setFlowerTypeFilter(flowerTypeFilter === f.value ? "" : f.value)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                              flowerTypeFilter === f.value
                                ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <span>{f.label}</span>
                            {flowerTypeFilter === f.value && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Color (Mobile) */}
                  <div className="border border-sky-100 rounded-lg p-4">
                    <button
                      onClick={() => setActiveFilterSection(activeFilterSection === "color" ? null : "color")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="font-semibold text-sky-700">Color</h3>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "transition-transform duration-200",
                          activeFilterSection === "color" && "rotate-180"
                        )}
                      />
                    </button>
                    {activeFilterSection === "color" && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {COLOR_FILTER_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => setColorFilter(colorFilter === c.value ? "" : c.value)}
                            className={cn(
                              "p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all",
                              colorFilter === c.value
                                ? "border-pink-500 bg-pink-50 text-pink-700 shadow-xs"
                                : "border-gray-200 text-gray-700"
                            )}
                          >
                            <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                            <span className="truncate">{c.label.replace('All Colors', 'All')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Availability & Features (Mobile) */}
                  <div className="border border-sky-100 rounded-lg p-4">
                    <button
                      onClick={() => setActiveFilterSection(activeFilterSection === "features" ? null : "features")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="font-semibold text-sky-700">Availability & Features</h3>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "transition-transform duration-200",
                          activeFilterSection === "features" && "rotate-180"
                        )}
                      />
                    </button>
                    {activeFilterSection === "features" && (
                      <div className="mt-3 space-y-2.5">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                            className="rounded text-primary focus:ring-primary h-4 w-4"
                          />
                          <span>In Stock Only</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bestsellerOnly}
                            onChange={(e) => setBestsellerOnly(e.target.checked)}
                            className="rounded text-primary focus:ring-primary h-4 w-4"
                          />
                          <span>⭐ Best Sellers</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newArrivalOnly}
                            onChange={(e) => setNewArrivalOnly(e.target.checked)}
                            className="rounded text-primary focus:ring-primary h-4 w-4"
                          />
                          <span>🆕 New Arrivals</span>
                        </label>
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
                      handleResetAllFilters();
                      setMobileFilterOpen(false);
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
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-sky-100 p-4 sticky top-24 max-h-[calc(100vh-110px)] overflow-y-auto sidebar-scrollable pr-2">
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
                      setSortBy("custom");
                      navigate("/shop");
                    }}
                    className="text-xs font-medium text-sky-600 hover:text-pink-600"
                  >
                    Reset
                  </button>
                </div>

                <FilterSection title="Category">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase() || 
                      ((cat.toLowerCase() === 'budget friendly' || cat.toLowerCase() === 'budget-friendly') && isBudgetFriendlyCategory);
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          if (cat.toLowerCase() === 'budget friendly' || cat.toLowerCase() === 'budget-friendly') {
                            navigate('/shop/budget-friendly');
                          } else {
                            setSelectedCategory(cat);
                          }
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-xs hover:bg-gray-100 flex items-center justify-between ${
                          isSelected ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white font-medium" : "text-gray-600"
                        }`}
                      >
                        <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        {(cat.toLowerCase() === 'budget friendly' || cat.toLowerCase() === 'budget-friendly') && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            ≤ ₹1k
                          </span>
                        )}
                      </button>
                    );
                  })}
                </FilterSection>

                <PriceRangeFilterCard
                  isOpen={isDesktopPriceOpen}
                  onToggle={() => setIsDesktopPriceOpen((prev) => !prev)}
                  minValue={minPriceFilter}
                  maxValue={maxPriceFilter}
                  onMinChange={setMinPriceFilter}
                  onMaxChange={setMaxPriceFilter}
                />

                <FilterSection title="Delivery">
                  {[
                    { label: 'All Delivery Options', value: '' },
                    { label: 'Same Day Delivery ⚡', value: 'same-day' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDeliveryOption(option.value)}
                      className={`w-full text-left px-3 py-1 rounded-md transition-colors text-xs hover:bg-gray-100 ${
                        deliveryOption === option.value ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white font-medium" : "text-gray-600"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </FilterSection>

                <FilterSection title="Flower Type">
                  <div className="space-y-1">
                    {FLOWER_FILTER_OPTIONS.map((flower) => (
                      <button
                        key={flower.value}
                        onClick={() => setFlowerTypeFilter(flowerTypeFilter === flower.value ? "" : flower.value)}
                        className={`w-full text-left px-3 py-1 rounded-md transition-colors text-xs hover:bg-gray-100 flex items-center justify-between ${
                          flowerTypeFilter === flower.value ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white font-medium" : "text-gray-600"
                        }`}
                      >
                        <span>{flower.label}</span>
                        {flowerTypeFilter === flower.value && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Occasion">
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {OCCASION_FILTER_OPTIONS.map((occ) => (
                      <button
                        key={occ.value}
                        onClick={() => setOccasionFilter(occasionFilter === occ.value ? "" : occ.value)}
                        className={`w-full text-left px-3 py-1 rounded-md transition-colors text-xs hover:bg-gray-100 flex items-center justify-between ${
                          occasionFilter === occ.value ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white font-medium" : "text-gray-600"
                        }`}
                      >
                        <span>{occ.label}</span>
                        {occasionFilter === occ.value && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Color">
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {COLOR_FILTER_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setColorFilter(colorFilter === c.value ? "" : c.value)}
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all border ${
                          colorFilter === c.value
                            ? "border-pink-500 bg-pink-50 text-pink-700 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        <span className="truncate">{c.label.replace('All Colors', 'All')}</span>
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Availability & Features">
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:text-primary">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>In Stock Only</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:text-primary">
                      <input
                        type="checkbox"
                        checked={bestsellerOnly}
                        onChange={(e) => setBestsellerOnly(e.target.checked)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>⭐ Best Sellers</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:text-primary">
                      <input
                        type="checkbox"
                        checked={newArrivalOnly}
                        onChange={(e) => setNewArrivalOnly(e.target.checked)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>🆕 New Arrivals</span>
                    </label>
                  </div>
                </FilterSection>

                <FilterSection title="Sort By">
                  {["custom", "newest", "price-asc", "price-desc"].map((sortOption) => (
                    <button
                      key={sortOption}
                      onClick={() => setSortBy(sortOption)}
                      className={`w-full text-left px-3 py-1 rounded-md transition-colors text-xs hover:bg-gray-100 ${
                        sortBy === sortOption ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white font-medium" : "text-gray-600"
                      }`}
                    >
                      {sortOption === "custom" ? "Recommended" : sortOption.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </FilterSection>
              </div>
            </div>

            {/* Products Grid & Active Filter Pills Bar */}
            <div className="lg:col-span-3">
              {/* Active Filter Chips & View Mode Controls */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur-sm p-3.5 rounded-2xl border border-sky-100/80 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
                  </span>
                  {hasActiveFilters && (
                    <>
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                          Cat: {selectedCategory}
                          <button onClick={() => setSelectedCategory("")} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      {flowerTypeFilter && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200">
                          Flower: {flowerTypeFilter}
                          <button onClick={() => setFlowerTypeFilter("")} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      {occasionFilter && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          Occasion: {occasionFilter}
                          <button onClick={() => setOccasionFilter("")} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      {colorFilter && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Color: {colorFilter}
                          <button onClick={() => setColorFilter("")} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      {(minPriceFilter > PRICE_FILTER_MIN || maxPriceFilter < PRICE_FILTER_MAX) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ₹{minPriceFilter} - ₹{maxPriceFilter}
                          <button onClick={() => { setMinPriceFilter(PRICE_FILTER_MIN); setMaxPriceFilter(PRICE_FILTER_MAX); }} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      {deliveryOption === "same-day" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          ⚡ Same Day
                          <button onClick={() => setDeliveryOption("")} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      {inStockOnly && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          In Stock
                          <button onClick={() => setInStockOnly(false)} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      {bestsellerOnly && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          ⭐ Bestseller
                          <button onClick={() => setBestsellerOnly(false)} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      {newArrivalOnly && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          🆕 New
                          <button onClick={() => setNewArrivalOnly(false)} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      )}
                      <button
                        onClick={handleResetAllFilters}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline ml-1"
                      >
                        Clear All
                      </button>
                    </>
                  )}
                </div>

                {/* View mode toggle */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn("p-1.5 rounded-lg transition-colors", viewMode === "grid" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100")}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn("p-1.5 rounded-lg transition-colors", viewMode === "list" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100")}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

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
                isBudgetFriendlyCategory ? (
                  <div className="text-center py-16 px-4 bg-white/70 backdrop-blur-md rounded-3xl border border-bloom-pink-100 shadow-sm max-w-lg mx-auto my-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-100 via-pink-100 to-rose-100 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                      🌸
                    </div>
                    <span className="text-xs uppercase tracking-widest text-primary font-bold px-3 py-1 bg-primary/10 rounded-full">
                      Affordable Gifting
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4 mb-2">
                      More Beautiful Choices Coming Soon
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
                      We're curating more thoughtful gifts at prices you'll love.
                    </p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-400 via-pink-500 to-rose-500 text-white text-sm font-semibold hover:shadow-md transition-all active:scale-95"
                    >
                      Continue Shopping →
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">No products found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
                  </div>
                )
              ) : (
                <ProductGrid 
                  products={filteredProducts} 
                  loading={isLoading}
                  className={viewMode === "list" ? "grid-cols-1 gap-4" : ""}
                  shopView={true}
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