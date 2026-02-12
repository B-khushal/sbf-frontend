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

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-gray-200/80 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">{title}</h3>
        <ChevronDown
          size={18}
          className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="mt-4 space-y-2">{children}</div>}
    </div>
  );
};

const ShopPage = () => {
  const { category: pathCategory } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { convertPrice, formatPrice, currency } = useCurrency();
  
  // Get category from both path params and query params
  const queryCategory = searchParams.get('category');
  // Normalize the category from the URL slug to the actual category name
  const normalizedCategory = pathCategory && CATEGORY_SLUG_MAP[pathCategory.toLowerCase()]
    ? CATEGORY_SLUG_MAP[pathCategory.toLowerCase()]
    : pathCategory;
  const category = normalizedCategory || queryCategory || "";
  
  // Redirect from query parameter to path parameter if needed
  useEffect(() => {
    if (queryCategory && !pathCategory) {
      navigate(`/shop/${queryCategory}`, { replace: true });
    }
  }, [queryCategory, pathCategory, navigate]);
  
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState("all");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

    // Enhanced price filtering with currency conversion
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      
      filtered = filtered.filter(product => {
        // Convert the filter range from display currency back to INR for comparison
        let minPriceInINR, maxPriceInINR;
        
        if (currency === 'USD') {
          minPriceInINR = min ? min * 84 : 0; // Approximate USD to INR
          maxPriceInINR = max ? max * 84 : Number.MAX_VALUE;
        } else if (currency === 'EUR') {
          minPriceInINR = min ? min * 91 : 0; // Approximate EUR to INR
          maxPriceInINR = max ? max * 91 : Number.MAX_VALUE;
        } else if (currency === 'GBP') {
          minPriceInINR = min ? min * 105 : 0; // Approximate GBP to INR
          maxPriceInINR = max ? max * 105 : Number.MAX_VALUE;
        } else {
          // INR - use directly
          minPriceInINR = min || 0;
          maxPriceInINR = max || Number.MAX_VALUE;
        }
        
        const productPriceInINR = product.price; // Product prices are stored in INR
        
        if (max) {
          return productPriceInINR >= minPriceInINR && productPriceInINR <= maxPriceInINR;
        } else {
          return productPriceInINR >= minPriceInINR;
        }
      });
    }

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
  }, [products, selectedCategory, priceRange, sortBy, currency, searchQuery]);

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
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
                  ✨ Online Bouquet Shop India - Flower Delivery in Hyderabad ✨
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Discover our carefully curated collection of premium flowers for flower delivery in Hyderabad, online bouquet shop India, 
                  midnight flower delivery, roses for anniversary, and birthday flowers online. Send flowers online with the best florist in Hyderabad.
                </p>
              </div>

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

          {/* Main Content: Filters and Product Grid */}
          <div className="flex items-center justify-end mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"
            >
              <Filter size={16} />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-4">
            
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="lg:col-span-1">
                <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm p-4 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Filter size={18} />
                      Filters
                    </h2>
                    <button 
                      onClick={() => {
                        setSelectedCategory("");
                        setPriceRange("all");
                        setSortBy("newest");
                        navigate("/shop");
                      }}
                      className="text-xs font-medium text-gray-500 hover:text-primary"
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
                          selectedCategory === cat ? "bg-primary text-white font-medium" : "text-gray-600"
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </FilterSection>

                  <FilterSection title="Price Range">
                    {["0-1000", "1000-2000", "2000-5000", "5000+"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setPriceRange(range)}
                        className={`w-full text-left px-3 py-1 rounded-md transition-colors text-xs hover:bg-gray-100 ${
                          priceRange === range ? "bg-primary text-white font-medium" : "text-gray-600"
                        }`}
                      >
                        ₹{range.replace("-", " - ")}
                      </button>
                    ))}
                  </FilterSection>

                  <FilterSection title="Sort By">
                    {["newest", "price-asc", "price-desc"].map((sortOption) => (
                      <button
                        key={sortOption}
                        onClick={() => setSortBy(sortOption)}
                        className={`w-full text-left px-3 py-1 rounded-md transition-colors text-xs hover:bg-gray-100 ${
                          sortBy === sortOption ? "bg-primary text-white font-medium" : "text-gray-600"
                        }`}
                      >
                        {sortOption.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </FilterSection>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
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