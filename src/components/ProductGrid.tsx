import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, ShoppingBag, Eye, Star, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useCart from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { getImageUrl } from "@/config";

export type Product = {
  _id: string;
  title: string;
  price: number;
  discount: number;
  images: string[];
  category: string;
  categories?: string[];
  description?: string;
  createdAt?: string;
  featured?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  rating?: number;
  numReviews?: number;
  reviews?: Array<{
    user: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
};

type ProductGridProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
  className?: string;
  loading?: boolean;
};

const ProductGrid = ({ products, title, subtitle, className, loading }: ProductGridProps) => {
  return (
    <section className={cn("py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          {title && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 sm:py-16">
          <div className="inline-block w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="text-4xl sm:text-6xl mb-4">🌸</div>
          <p className="text-muted-foreground text-base sm:text-lg">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addItem, openCart } = useCart();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { user } = useAuth();

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const wishlistStr = localStorage.getItem("wishlist");
      if (wishlistStr) {
        const wishlistItems = JSON.parse(wishlistStr);
        if (Array.isArray(wishlistItems)) {
          setWishlist(wishlistItems.map(item => item.id));
        }
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }, []);
  
  const isInWishlist = wishlist.includes(product._id);

  // Handle main card click - redirect to product details
  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click isn't on a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    console.log("Card clicked, navigating to product:", product._id);
    navigate(`/product/${product._id}`);
  };

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add to cart clicked:", product.title);
    
    if (!user) {
      toast.error("Please login first to add items to your cart", {
        description: "You'll be redirected to the login page",
        duration: 3000,
      });
      // Redirect to login page with current page as redirect path
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            redirect: window.location.pathname,
            message: "Please login to add items to your cart"
          } 
        });
      }, 1500);
      return;
    }
    
    try {
      const success = addItem({
        id: product._id,
        productId: product._id,
        title: product.title,
        price: discountedPrice,
        originalPrice: product.price,
        image: product.images?.[0] || '/images/placeholder.svg'
      }, 1);
      
      if (success) {
        toast.success("🛒 Added to cart!", {
          description: `${product.title} has been added to your cart`,
          duration: 3000,
        });
        setTimeout(() => openCart(), 300);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
        toast.error("Failed to add to cart", {
        description: "Please try again",
          duration: 3000,
        });
      }
  };

  // Handle view details
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("View details clicked:", product._id);
    navigate(`/product/${product._id}`);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Wishlist toggle clicked:", product._id);
    
    if (!user) {
      toast.error("Please login first to add items to your wishlist", {
        description: "You'll be redirected to the login page",
        duration: 3000,
      });
      // Redirect to login page with current page as redirect path
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            redirect: window.location.pathname,
            message: "Please login to manage your wishlist"
          } 
        });
      }, 1500);
      return;
    }
    
    try {
      const wishlistItem = {
        id: String(product._id),
        title: product.title,
        image: getImageUrl(product.images?.[0]),
        price: product.price
      };
      
      let existingWishlist = [];
      try {
        const wishlistStr = localStorage.getItem("wishlist");
        existingWishlist = wishlistStr ? JSON.parse(wishlistStr) : [];
        if (!Array.isArray(existingWishlist)) {
          existingWishlist = [];
        }
      } catch (error) {
        console.error("Error parsing wishlist:", error);
        existingWishlist = [];
      }
      
      const isCurrentlyInWishlist = existingWishlist.some(item => item.id === String(product._id));
      
      if (isCurrentlyInWishlist) {
        const updatedWishlist = existingWishlist.filter(item => item.id !== String(product._id));
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setWishlist(prev => prev.filter(id => id !== product._id));
        toast.success("💔 Removed from wishlist", {
          description: "Item has been removed from your wishlist",
          duration: 2000,
        });
      } else {
        const updatedWishlist = [...existingWishlist, wishlistItem];
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setWishlist(prev => [...prev, product._id]);
        toast.success("💖 Added to wishlist", {
          description: "Item has been added to your wishlist",
          duration: 2000,
        });
      }
      
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  // Calculate discounted price
  const originalPrice = product.price;
  const discountedPrice = product.discount > 0 ? originalPrice - (originalPrice * product.discount / 100) : originalPrice;
  const hasDiscount = product.discount > 0;

  // Check if product is new (either marked as new or within last 30 days)
  const isNewProduct = () => {
    // Check if explicitly marked as new (handles both frontend and backend property names)
    if (product.isNewArrival || (product as any).isNew) return true;
    
    // Fallback to date-based check if createdAt is available
    if (!product.createdAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(product.createdAt) > thirtyDaysAgo;
  };

  // Check if product is featured (handles both frontend and backend property names)
  const isFeaturedProduct = () => {
    return product.featured || product.isFeatured || (product as any).isFeatured;
  };
  
  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer hover:border-primary/20"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Image Loading Skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.svg';
            setIsImageLoaded(true);
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
          {hasDiscount && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
              -{product.discount}%
            </span>
          )}
          {isNewProduct() && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
              <Sparkles className="w-2 h-2 sm:w-3 sm:h-3" />
              New
            </span>
          )}
          {isFeaturedProduct() && (
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
              <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-current" />
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button - Always visible */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300", 
              isInWishlist 
                ? "fill-red-500 text-red-500 scale-110" 
                : "text-gray-600 hover:text-red-500 hover:scale-110"
            )} />
          </Button>
        </div>

        {/* Gradient Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="mb-2 sm:mb-3">
          <p className="text-xs sm:text-sm text-primary font-semibold uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 text-sm sm:text-base lg:text-lg leading-tight">
          {product.title}
        </h3>
        </div>
        
        {/* Price Section */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className={cn(
            "text-lg sm:text-xl lg:text-2xl font-bold",
            hasDiscount ? "text-red-600" : "text-gray-900"
          )}>
            {formatPrice(convertPrice(discountedPrice))}
          </div>
          {hasDiscount && (
            <div className="text-xs sm:text-sm text-gray-500 line-through">
              {formatPrice(convertPrice(originalPrice))}
            </div>
          )}
          {hasDiscount && (
            <span className="text-xs sm:text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              Save {formatPrice(convertPrice(originalPrice - discountedPrice))}
            </span>
          )}
        </div>

        {/* Rating Stars - Only show if product has reviews */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {(product.numReviews && product.numReviews > 0) ? (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-200",
                    i < Math.floor(product.rating || 0) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "fill-gray-200 text-gray-200"
                  )} 
                />
              ))}
              <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
                ({product.rating?.toFixed(1) || '0.0'}) • {product.numReviews} review{product.numReviews !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-xs sm:text-sm text-gray-400">No reviews yet</span>
            </div>
          )}
          
          {/* Action Hint */}
          <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs sm:text-sm font-medium mr-1">View</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        </div>

        {/* Action Buttons - Always visible */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-white text-gray-900 hover:bg-gray-50 shadow-sm border border-gray-200 hover:border-primary/30 transition-all duration-300 text-xs sm:text-sm"
            onClick={handleViewDetails}
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Quick</span> View
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 shadow-sm transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add to</span> Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;