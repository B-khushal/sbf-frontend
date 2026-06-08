import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, ShoppingBag, Star, ArrowRight, Sparkles, Wand2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { getImageUrl } from "@/config";
import { ComboItem } from "@/services/productService";
import { QuickViewModal } from "./ui/QuickViewModal";

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
  isNew?: boolean;
  isFeatured?: boolean;
  isCustomizable?: boolean;
  hidden?: boolean;
  rating?: number;
  numReviews?: number;
  sameDay?: boolean;
  customizationOptions?: {
    allowPhotoUpload: boolean;
    allowNumberInput: boolean;
    numberInputLabel: string;
    allowMessageCard: boolean;
    messageCardPrice: number;
    addons: {
      flowers: Array<{ name: string; price: number; type: 'flower' }>;
      chocolates: Array<{ name: string; price: number; type: 'chocolate' }>;
    };
    previewImage: string;
  };
  // Combo-specific fields
  comboItems?: ComboItem[];
  comboName?: string;
  comboDescription?: string;
};

type ProductGridProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
  className?: string;
  loading?: boolean;
  onAddToCart?: (item: any, quantity: number) => boolean;
  horizontal?: boolean;
};

const ProductGrid = ({ products, title, subtitle, className, loading, onAddToCart, horizontal }: ProductGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Filter out hidden products for non-admin users
  const visibleProducts = user?.role === 'admin'
    ? products
    : products.filter(product => !product.hidden);

  // Auto-scroll logic with circular scrolling
  useEffect(() => {
    if (!horizontal || !visibleProducts.length) return;
    const container = scrollRef.current;
    if (!container) return;

    let scrollAmount = 1.2; // px per frame
    let reqId: number;
    let isHovered = false;

    // Expose a way to set isHovered from outside (arrow click)
    (container as any)._setIsHovered = (val: boolean) => { isHovered = val; };

    // On mount, set scrollLeft to the start of the second set
    const setInitialScroll = () => {
      const originalContentWidth = container.scrollWidth / 3;
      container.scrollLeft = originalContentWidth;
    };
    setTimeout(setInitialScroll, 100); // Wait for render

    const step = () => {
      if (!container) return;

      if (!isHovered) {
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        const originalContentWidth = container.scrollWidth / 3;

        // If we've reached the end of the second set, jump back to the same position in the second set
        if (scrollLeft + containerWidth >= originalContentWidth * 2 - 2) {
          container.scrollLeft = originalContentWidth;
        } else {
          container.scrollLeft += scrollAmount;
        }
      }
      reqId = requestAnimationFrame(step);
    };
    reqId = requestAnimationFrame(step);

    // Pause on hover
    const onMouseEnter = () => { isHovered = true; };
    const onMouseLeave = () => { isHovered = false; };
    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      delete (container as any)._setIsHovered;
    };
  }, [horizontal, visibleProducts.length]);

  // Manual scroll with circular behavior
  const scrollBy = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollAmount = Math.floor(container.offsetWidth * 0.8);
      const currentScroll = container.scrollLeft;
      const containerWidth = container.offsetWidth;
      const originalContentWidth = container.scrollWidth / 3;

      // Pause auto-scroll when arrow is clicked
      if ((container as any)._setIsHovered) {
        (container as any)._setIsHovered(true);
      }

      if (direction === 'right') {
        // If we're near the end of the second set, jump to the beginning of the second set
        if (currentScroll + containerWidth >= originalContentWidth * 2 - scrollAmount) {
          container.scrollTo({ left: originalContentWidth, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        // If we're near the beginning of the second set, jump to the end of the second set
        if (currentScroll <= originalContentWidth + scrollAmount) {
          container.scrollTo({ left: originalContentWidth * 2 - containerWidth, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }

      // Resume auto-scroll after a delay
      setTimeout(() => {
        if ((container as any)._setIsHovered) {
          (container as any)._setIsHovered(false);
        }
      }, 2000);
    }
  };

  // Create circular product list for seamless scrolling
  const circularProducts = horizontal && visibleProducts.length > 0
    ? [...visibleProducts, ...visibleProducts, ...visibleProducts] // Triple the products for seamless loop
    : visibleProducts;

  return (
    <section className={cn("py-8 sm:py-12 lg:py-16 xl:py-20 px-3 sm:px-4 md:px-6 lg:px-8", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 xl:mb-16">
          {title && (
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed px-2 text-center">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 sm:py-12 lg:py-16">
          <div className="inline-block w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg text-center">Loading products...</p>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="text-center py-8 sm:py-12 lg:py-16">
          <div className="text-3xl sm:text-4xl lg:text-6xl mb-3 sm:mb-4 text-center">🌸</div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg text-center">No products available at the moment.</p>
        </div>
      ) : horizontal ? (
        <div className="relative">
          <button
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-primary/80 hover:text-white text-primary shadow rounded-full p-2 transition-all duration-200"
            style={{ display: visibleProducts.length > 2 ? 'block' : 'none' }}
            onClick={() => scrollBy('left')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
            style={{
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory'
            }}
          >
            {circularProducts.map((product, index) => (
              <div
                className="min-w-[220px] max-w-xs flex-shrink-0 scroll-snap-align-start"
                key={`${product._id}-${index}`}
              >
                <ProductCard product={product} onAddToCart={onAddToCart} />
              </div>
            ))}
          </div>
          <button
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-primary/80 hover:text-white text-primary shadow rounded-full p-2 transition-all duration-200"
            style={{ display: visibleProducts.length > 2 ? 'block' : 'none' }}
            onClick={() => scrollBy('right')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
};

const getComboMaxPrice = (product: Product) => {
  if (product.category !== 'combos' || !product.comboItems) return product.price;
  let total = product.price;
  product.comboItems.forEach(item => {
    if (item.customizationOptions && item.customizationOptions.allowVariants && item.customizationOptions.variants && item.customizationOptions.variants.length > 0) {
      // Use the max variant price
      const maxVariant = item.customizationOptions.variants.reduce((max, v) => v.price > max ? v.price : max, 0);
      total += maxVariant;
    } else {
      total += item.price;
    }
  });
  return total;
};

const ProductCard = ({ product, onAddToCart }: {
  product: Product;
  onAddToCart?: (item: any, quantity: number) => boolean;
}) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHeartPounding, setIsHeartPounding] = useState(false);
  const { user } = useAuth();

  const isInWishlist = wishlistItems.some(item => item.id === product._id);

  // Handle main card click - redirect to product details
  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click isn't on a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    console.log("Card clicked, navigating to product:", product._id);
    window.open(`/product/${product._id}`, '_blank', 'noopener,noreferrer');
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
      const addToCartFunction = onAddToCart || addToCart;

      // Calculate discounted price if needed
      const discountedPrice = product.discount && product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

      // Create cart item with proper structure
      const cartItem = {
        _id: product._id,
        title: product.title,
        price: discountedPrice,
        images: product.images || [],
        quantity: 1,
        discount: product.discount || 0,
        category: product.category,
        description: product.description,
      };

      console.log("Adding to cart:", cartItem);
      addToCartFunction(cartItem, 1);

      toast.success("🛒 Added to cart!", {
        description: `${product.title} has been added to your cart`,
        duration: 3000,
      });

      // Redirect to cart page after successful addition
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart", {
        description: "Please try again",
        duration: 3000,
      });
    }
  };

  const handleCustomizeAndAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Customize and add to cart clicked:", product.title);
    navigate(`/product/${product._id}?customize=true`);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login first to add items to your wishlist", {
        description: "You'll be redirected to the login page",
        duration: 3000,
      });
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

    setIsHeartPounding(true);
    setTimeout(() => setIsHeartPounding(false), 500);

    try {
      if (!product._id || !product.title || typeof product.price !== 'number') {
        console.error('Invalid product data for wishlist:', product);
        toast.error("Invalid product data");
        return;
      }

      const wishlistItem = {
        id: String(product._id),
        title: product.title,
        image: product.images?.[0] || '/images/placeholder.svg',
        price: product.price
      };

      if (isInWishlist) {
        await removeFromWishlist(String(product._id));
      } else {
        await addToWishlist(wishlistItem);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  // Check if product is new
  const isNewProduct = () => {
    if (!product.createdAt && !product.isNewArrival && !product.isNew) return false;
    if (product.isNewArrival || product.isNew) return true;
    const createdDate = new Date(product.createdAt!);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  // Check if product is featured
  const isFeaturedProduct = () => {
    return product.featured || product.isFeatured;
  };

  return (
    <>
      <div
        className={cn(
          "group relative bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-[#f9a8d4]/30 overflow-hidden hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer flex flex-col h-full",
          product.hidden ? 'opacity-75 border-2 border-orange-200' : ''
        )}
        onClick={handleCardClick}
      >
        {/* Product Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
          
          {/* Badges Container */}
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            {product.discount > 0 && (
              <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                -{product.discount}% OFF
              </Badge>
            )}
            {isFeaturedProduct() && (
              <Badge variant="default" className="bg-yellow-400 hover:bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                ⭐ Featured
              </Badge>
            )}
            {isNewProduct() && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                NEW
              </Badge>
            )}
            {product.hidden && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-orange-500 text-orange-600 bg-orange-50/80">
                Hidden
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-2 right-2 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-white hover:scale-110",
              isHeartPounding && "scale-125"
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors duration-200",
                isInWishlist ? "fill-red-500 stroke-red-500" : "stroke-gray-600 hover:stroke-red-500"
              )}
            />
          </button>

          {/* Quick View Hover overlay (desktop only) */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 hidden md:flex">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-gray-800 border-0 shadow-lg hover:bg-white/95 text-xs font-bold rounded-xl px-4 py-2 transition-transform duration-300 translate-y-2 group-hover:translate-y-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
            >
              Quick View
            </Button>
          </div>

          {/* Image 1 (Default) */}
          <img
            src={getImageUrl(product.images[0]) || '/images/placeholder.svg'}
            alt={product.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105",
              product.images.length > 1 && "group-hover:opacity-0"
            )}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />

          {/* Image 2 (Hover) */}
          {product.images.length > 1 && (
            <img
              src={getImageUrl(product.images[1])}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {/* Skeleton Load Placeholder */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
          )}
        </div>

        {/* Product Details Section */}
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {product.title}
            </h3>

            {/* Rating & Delivery Info */}
            {((product.numReviews && product.numReviews > 0) || product.sameDay !== false) && (
              <div className="flex items-center gap-2 mb-2">
                {product.numReviews && product.numReviews > 0 ? (
                  <div className="flex items-center text-amber-400">
                    <Star size={11} className="fill-current" />
                    <span className="text-[10px] font-bold text-gray-700 ml-0.5">
                      {(product.rating || 0).toFixed(1)}
                    </span>
                  </div>
                ) : null}
                {product.numReviews && product.numReviews > 0 && product.sameDay !== false && (
                  <span className="text-[10px] text-gray-300 font-medium">|</span>
                )}
                {product.sameDay !== false && (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    ⚡ Same Day
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            {/* Price section */}
            <div className="flex items-baseline gap-1.5 mb-3.5">
              {product.category === 'combos' && product.comboItems && product.comboItems.length > 0 ? (
                <span className={cn(
                  "text-sm sm:text-base font-black",
                  product.discount > 0 ? "text-red-600" : "text-gray-900"
                )}>
                  {formatPrice(convertPrice(getComboMaxPrice(product)))}
                </span>
              ) : (
                <>
                  <span className={cn(
                    "text-sm sm:text-base font-black",
                    product.discount > 0 ? "text-red-600" : "text-gray-900"
                  )}>
                    {formatPrice(convertPrice(product.discount ? product.price * (1 - product.discount / 100) : product.price))}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xs text-gray-450 line-through font-medium">
                      {formatPrice(convertPrice(product.price))}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 mt-auto">
              {product.isCustomizable ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 py-2 h-9 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl border-0 shadow-sm transition-all"
                  onClick={handleCustomizeAndAddToCart}
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Customize
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 py-2 h-9 text-xs bg-primary hover:bg-primary/95 text-white font-bold rounded-xl border-0 shadow-sm transition-all flex items-center justify-center gap-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-3 w-3" />
                  Add
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default ProductGrid;
