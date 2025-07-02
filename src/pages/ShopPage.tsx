import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ProductGrid from "@/components/ProductGrid";
import useCart from "@/hooks/use-cart";
import api from "@/services/api";
import { Search, Filter, Grid3X3, List, Star, Heart, Eye, ExternalLink, Sparkles, Leaf, Gift, ShoppingBag, X, ChevronDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { getImageUrl, getSquareImageUrl } from "@/config";
import ContactModal from "@/components/ui/ContactModal";

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
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { convertPrice, formatPrice, currency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState("all");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const {
    addItem,
    showContactModal,
    contactModalProduct,
    closeContactModal,
  } = useCart();

  // Enhanced flower category data with modern design
  const flowerCategories = [
    {
      name: "Premium Roses",
      description: "Symbol of eternal love",
      image: "/images/roses-1.png",
      icon: "🌹",
      category: "roses",
      featured: true,
      count: filteredProducts.filter(p => 
        p.category?.toLowerCase() === "roses" || 
        p.categories?.some(cat => cat.toLowerCase() === "roses")
      ).length
    },
    {
      name: "Exotic Orchids",
      description: "Sophisticated elegance",
      image: "/images/p-orchid.png",
      gradient: "from-purple-500 via-indigo-500 to-blue-500",
      icon: "🌺",
      category: "orchids",
      featured: true,
      count: filteredProducts.filter(p => 
        p.category?.toLowerCase() === "orchids" || 
        p.categories?.some(cat => cat.toLowerCase() === "orchids")
      ).length
    },
    {
      name: "Graceful Lilies",
      description: "Pure serenity",
      image: "/images/p-lilly.png",
      gradient: "from-pink-500 via-rose-500 to-purple-500",
      icon: "🌷",
      category: "lilies",
      featured: false,
      count: filteredProducts.filter(p => 
        p.category?.toLowerCase() === "lilies" || 
        p.categories?.some(cat => cat.toLowerCase() === "lilies")
      ).length
    },
    {
      name: "Classic Carnations",
      description: "Timeless beauty",
      image: "/images/p-carnation.png",
      gradient: "from-red-500 via-pink-500 to-rose-500",
      icon: "💐",
      category: "carnations",
      featured: false,
      count: filteredProducts.filter(p => 
        p.category?.toLowerCase() === "carnations" || 
        p.categories?.some(cat => cat.toLowerCase() === "carnations")
      ).length
    },
    {
      name: "Sunshine Flowers",
      description: "Radiant happiness",
      image: "/images/p-sunflower.png",
      gradient: "from-yellow-500 via-orange-500 to-amber-500",
      icon: "🌻",
      category: "sunflowers",
      featured: true,
      count: filteredProducts.filter(p => 
        p.category?.toLowerCase() === "sunflowers" || 
        p.categories?.some(cat => cat.toLowerCase() === "sunflowers")
      ).length
    }
  ];

  // Handle category click with same-tab navigation
  const handleCategoryClick = (categoryName: string) => {
    const categoryUrl = `/shop/${categoryName}`;
    navigate(categoryUrl);
  };

  // Handle quick view
  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
  };

  // Quick View Modal Component - Mobile Responsive
  const QuickViewModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold pr-2">{product.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <img 
              src={getSquareImageUrl(product.images?.[0], 500, false)}
              alt={product.title}
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Try different URL constructions if the first one fails
                if (!target.src.includes('placeholder')) {
                  if (product.images?.[0]?.startsWith('/uploads/')) {
                    target.src = `https://sbf-backend.onrender.com${product.images[0]}`;
                  } else if (product.images?.[0] && !product.images[0].startsWith('http')) {
                    target.src = `https://sbf-backend.onrender.com/uploads/${product.images[0]}`;
                  } else {
                    target.src = "/images/placeholder.svg";
                  }
                } else if (!target.src.includes('placeholder.svg')) {
                  target.src = "/images/placeholder.svg";
                }
              }}
            />
            <div>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">{product.description || "Beautiful floral arrangement"}</p>
              <div className="mb-4">
                {product.discount > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-red-600">
                      {formatPrice(convertPrice(product.price * (1 - product.discount / 100)))}
                    </span>
                    <span className="text-base sm:text-lg text-gray-500 line-through">
                      {formatPrice(convertPrice(product.price))}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-primary">{formatPrice(convertPrice(product.price))}</span>
                )}
              </div>
              <button
                onClick={() => {
                  addItem({
                    id: product._id,
                    productId: product._id,
                    title: product.title,
                    price: product.price,
                    originalPrice: product.price,
                    image: product.images?.[0] || '/images/placeholder.svg'
                  }, 1);
                  onClose();
                }}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
    setSelectedCategory(category || "");
  }, [category]);

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
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

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
                  Search Results for "{searchQuery}"
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
                <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
                  ✨ Explore Our Exquisite Range ✨
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Discover our carefully curated collection of premium flowers, each handpicked to bring joy and beauty to your special moments
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
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Collection
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