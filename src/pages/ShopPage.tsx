import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CategoryMenu from "@/components/CategoryMenu";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import useCart from "@/hooks/use-cart";
import api from "@/services/api";
import { Search, Filter, Grid3X3, List, Star, Heart, Eye, ExternalLink, Sparkles, Leaf, Gift, ShoppingBag, X } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

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

  // Enhanced flower category data with modern design
  const flowerCategories = [
    {
      name: "Premium Roses",
      description: "Symbol of eternal love",
      image: "/images/d1.jpg",
      icon: "🌹",
      category: "roses",
      featured: true,
      count: filteredProducts.filter(p => 
        p.category?.toLowerCase() === "roses" || 
        p.categories?.some(cat => cat.toLowerCase() === "roses")
      ).length
    },
    {
      name: "Vibrant Gerberas",
      description: "Bursts of joy & color",
      image: "/images/1.jpg",
      gradient: "from-orange-500 via-yellow-500 to-red-500",
      icon: "🌼",
      category: "gerberas",
      featured: false,
      count: filteredProducts.filter(p => 
        p.category?.toLowerCase() === "gerberas" || 
        p.categories?.some(cat => cat.toLowerCase() === "gerberas")
      ).length
    },
    {
      name: "Exotic Orchids",
      description: "Sophisticated elegance",
      image: "https://images.unsplash.com/photo-1615738254841-b8263d5c935e?w=600&h=400&fit=crop",
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
      image: "https://images.unsplash.com/photo-1560116226-4d128cf6b5ee?w=600&h=400&fit=crop",
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
      image: "https://images.unsplash.com/photo-1609205807107-e6ec88c65b60?w=600&h=400&fit=crop",
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
      image: "https://images.unsplash.com/photo-1470509037663-253afd7f0c44?w=600&h=400&fit=crop",
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

  const {
    items,
    itemCount,
    isCartOpen,
    closeCart,
    updateItemQuantity,
    removeItem,
    addItem,
  } = useCart();

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
  const QuickViewModal = ({ product, onClose }) => {
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
              src={product.images?.[0] || '/images/placeholder.svg'}
              alt={product.title}
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
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
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "trending":
          return (b.orderCount || 0) - (a.orderCount || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange, sortBy, currency, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50">
      <Navigation cartItemCount={itemCount} />
      
      <main className="pt-20">
        {/* Category Menu */}
        <CategoryMenu />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {flowerCategories.map((category, index) => (
                  <div 
                    key={category.category}
                    onClick={() => handleCategoryClick(category.category)}
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100 hover:border-primary/30"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-2 sm:mb-3 lg:mb-4 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mx-auto">
                      <img 
                        src={category.image.startsWith("http") ? category.image : category.image} 
                        alt={category.name} 
                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full object-cover"
                      />
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-800 mb-1 lg:mb-2 leading-tight">{category.name}</h3>
                    <p className="text-xs text-gray-500 hidden sm:block">{category.count} products</p>
                  </div>
                ))}
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

          {/* Advanced Control Panel - Mobile Responsive */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 border border-white/50">
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
              {/* Filter Controls - Mobile Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Filter size={20} className="text-primary flex-shrink-0" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 sm:h-12 lg:h-14 px-3 sm:px-4 lg:px-6 pr-8 sm:pr-10 lg:pr-12 border-2 border-gray-200 rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-lg flex-1 min-w-0"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="h-10 sm:h-12 lg:h-14 px-3 sm:px-4 lg:px-6 pr-8 sm:pr-10 lg:pr-12 border-2 border-gray-200 rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-lg w-full"
                  >
                    <option value="all">All Prices</option>
                    <option value="0-500">Under ₹500</option>
                    <option value="500-1000">₹500 - ₹1000</option>
                    <option value="1000-2000">₹1000 - ₹2000</option>
                    <option value="2000-5000">₹2000 - ₹5000</option>
                    <option value="5000">Above ₹5000</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 sm:h-12 lg:h-14 px-3 sm:px-4 lg:px-6 pr-8 sm:pr-10 lg:pr-12 border-2 border-gray-200 rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-lg w-full"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="rating">Highest Rated</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              </div>

              {/* View Mode and Results - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${
                      viewMode === "grid" 
                        ? "bg-primary text-white shadow-lg" 
                        : "bg-white/60 text-gray-600 hover:bg-white/80"
                    }`}
                    title="Grid View"
                  >
                    <Grid3X3 size={16} className="sm:hidden" />
                    <Grid3X3 size={20} className="hidden sm:block" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${
                      viewMode === "list" 
                        ? "bg-primary text-white shadow-lg" 
                        : "bg-white/60 text-gray-600 hover:bg-white/80"
                    }`}
                    title="List View"
                  >
                    <List size={16} className="sm:hidden" />
                    <List size={20} className="hidden sm:block" />
                  </button>
                </div>
                <div className="text-sm sm:text-base lg:text-lg font-medium text-gray-800">
                  {isLoading ? "Loading..." : `${filteredProducts.length} Products`}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="mb-16">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading beautiful flowers...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Search size={60} className="text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No flowers found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {searchQuery 
                    ? "Your search didn't match any flowers in our garden. Try exploring different categories or adjusting your filters."
                    : "No products match your current filters. Try adjusting your selection."
                  }
                </p>
                <div className="flex gap-4 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        navigate('/shop');
                      }}
                      className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setPriceRange("all");
                      setSortBy("newest");
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
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

        {/* Quick View Modal */}
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

        {/* Cart Sidebar */}
        <Cart
          isOpen={isCartOpen}
          onClose={closeCart}
          items={items}
          onUpdateQuantity={updateItemQuantity}
          onRemoveItem={removeItem}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default ShopPage; 
