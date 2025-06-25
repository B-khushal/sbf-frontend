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
  onAddToCart?: (item: any, quantity: number) => boolean;
  onOpenCart?: () => void;
};

const ProductGrid = ({ products, title, subtitle, className, loading, onAddToCart, onOpenCart }: ProductGridProps) => {
  return (
    <section className={cn("py-8 sm:py-12 lg:py-16 xl:py-20 px-3 sm:px-4 md:px-6 lg:px-8", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 xl:mb-16">
          {title && (
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed px-2">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 sm:py-12 lg:py-16">
          <div className="inline-block w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 sm:py-12 lg:py-16">
          <div className="text-3xl sm:text-4xl lg:text-6xl mb-3 sm:mb-4">🌸</div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-9">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} onOpenCart={onOpenCart} />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ product, onAddToCart, onOpenCart }: { 
  product: Product; 
  onAddToCart?: (item: any, quantity: number) => boolean;
  onOpenCart?: () => void;
}) => {
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
      // Use the passed onAddToCart function if available, otherwise use the hook
      const addToCartFunction = onAddToCart || addItem;
      const openCartFunction = onOpenCart || openCart;
      
      const success = addToCartFunction({
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
        setTimeout(() => openCartFunction(), 300);
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
        price: product.price,
        image: product.images?.[0] || '/images/placeholder.svg',
        category: product.category,
        dateAdded: new Date().toISOString()
      };

      const currentWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      let updatedWishlist;
      let message;

      if (isInWishlist) {
        updatedWishlist = currentWishlist.filter((item: any) => item.id !== String(product._id));
        message = "Removed from wishlist";
        setWishlist(prev => prev.filter(id => id !== product._id));
      } else {
        updatedWishlist = [...currentWishlist, wishlistItem];
        message = "Added to wishlist";
        setWishlist(prev => [...prev, product._id]);
      }

      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      
      // Dispatch custom event for wishlist updates
      const event = new CustomEvent('wishlist-update', { 
        detail: { 
          count: updatedWishlist.length,
          action: isInWishlist ? 'remove' : 'add',
          product: wishlistItem
        }
      });
      window.dispatchEvent(event);

      toast.success(`❤️ ${message}!`, {
        description: `${product.title} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist", {
        description: "Please try again",
        duration: 3000,
      });
    }
  };

  // Check if product is new (created within last 30 days)
  const isNewProduct = () => {
    if (!product.createdAt && !product.isNewArrival) return false;
    if (product.isNewArrival) return true;
    const createdDate = new Date(product.createdAt!);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  // Check if product is featured
  const isFeaturedProduct = () => {
    return product.featured || product.isFeatured;
  };

  // Calculate discounted price
  const discountedPrice = product.discount > 0 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  // Calculate average rating
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : product.rating || 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-200/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
    >
      {/* Badges */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 flex flex-col gap-1 sm:gap-2">
        {product.discount > 0 && (
          <span className="bg-red-500 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-full shadow-lg">
            -{product.discount}%
          </span>
        )}
        {isNewProduct() && (
          <span className="bg-green-500 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-full shadow-lg">
            NEW
          </span>
        )}
        {isFeaturedProduct() && (
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Featured</span>
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200/50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
      >
        <Heart 
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200",
            isInWishlist 
              ? "text-red-500 fill-red-500" 
              : "text-gray-400 hover:text-red-500 group-hover:text-red-500"
          )}
        />
      </button>

      {/* Image Container */}
      <div className="relative aspect-[4/5] sm:aspect-[4/5] overflow-hidden bg-gray-100">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-lg sm:text-xl">🌸</div>
          </div>
        )}
        <img
          src={getImageUrl(product.images?.[0]) || '/images/placeholder.svg'}
          alt={product.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.svg';
            setIsImageLoaded(true);
          }}
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-5">
        {/* Title and Category */}
        <div className="mb-2 sm:mb-3">
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base lg:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">{product.category}</p>
        </div>

        {/* Rating */}
        {averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2 sm:mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4",
                    i < averageRating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-500">
              {averageRating.toFixed(1)}
              {product.numReviews && ` (${product.numReviews})`}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="text-base sm:text-lg lg:text-xl font-bold text-primary">
            {formatPrice(convertPrice(discountedPrice))}
          </span>
          {product.discount > 0 && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {formatPrice(convertPrice(product.price))}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleViewDetails}
            variant="outline"
            size="sm"
            className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-gray-50 border-gray-200 transition-all duration-200"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Quick View</span>
            <span className="xs:hidden">View</span>
          </Button>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Add to Cart</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;