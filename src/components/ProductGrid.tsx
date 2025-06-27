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
  viewMode?: 'grid' | 'list';
  onQuickView?: (product: Product) => void;
};

const ProductGrid = ({ products, title, subtitle, className, loading, onAddToCart, onOpenCart, viewMode = 'grid', onQuickView }: ProductGridProps) => {
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
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-9">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onOpenCart={onOpenCart}
              viewMode={viewMode}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ product, onAddToCart, onOpenCart, viewMode = 'grid', onQuickView }: { 
  product: Product; 
  onAddToCart?: (item: any, quantity: number) => boolean;
  onOpenCart?: () => void;
  viewMode?: 'grid' | 'list';
  onQuickView?: (product: Product) => void;
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
  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  // Calculate average rating
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length
    : product.rating || 0;

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group relative flex flex-col cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 flex flex-col gap-1 sm:gap-2">
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "p-2 rounded-full transition-colors",
            isInWishlist ? "bg-red-500/90 text-white" : "bg-white/70 text-gray-700 hover:bg-white"
          )}
        >
          <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="relative">
        <div className={cn("bg-gray-100", viewMode === 'list' ? 'aspect-square' : 'aspect-w-1 aspect-h-1')}>
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
      </div>

      <div className="p-3 sm:p-4 lg:p-5 flex-grow flex flex-col">
        <div className="flex-grow">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight truncate group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-primary font-bold text-lg">
              {formatPrice(convertPrice(discountedPrice))}
            </p>
            {product.discount > 0 && (
              <p className="text-gray-400 line-through text-sm">
                {formatPrice(convertPrice(product.price))}
              </p>
            )}
          </div>
          <div className="flex items-center mt-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < (averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">({product.numReviews || 0})</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          {viewMode === 'grid' ? (
            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onQuickView) onQuickView(product);
                }}
                size="sm"
                variant="outline"
                className="bg-white/80 text-xs h-8 px-3 flex-1"
              >
                <Eye size={14} className="mr-1.5" />
                Quick View
              </Button>
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="text-xs h-8 px-3 flex-1"
              >
                <ShoppingBag size={14} className="mr-1.5" />
                Add to Cart
              </Button>
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center gap-2">
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="bg-primary/90 text-white hover:bg-primary shadow-lg rounded-full text-xs h-9 px-4 flex-1"
              >
                <ShoppingBag size={14} className="mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleViewDetails}
                size="sm"
                variant="secondary"
                className="bg-white/90 text-gray-800 hover:bg-white shadow-lg rounded-full text-xs h-9 px-4"
              >
                <Eye size={14} className="mr-2" />
                Details
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;