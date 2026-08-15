import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, Play, Eye, ShoppingCart } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { getImageUrl } from "@/config";
import { QuickViewModal } from "./ui/QuickViewModal";
import ProtectedImage from "./ui/ProtectedImage";
import productService, { OccasionData, ProductData } from "@/services/productService";
import { cn } from "@/lib/utils";
import { ProductCardSkeleton } from "./HomePageSkeleton";

// Lucide icon dynamic loader helper
const OccasionIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Gift;
  return <IconComponent className={className} style={style} />;
};

type OccasionsSectionProps = {
  section: {
    title?: string;
    subtitle?: string;
    styling?: {
      background?: string;
      padding?: string;
      spacing?: string;
      animation?: string;
    };
    content?: {
      maxProducts?: number;
      autoplay?: boolean;
      autoplaySpeed?: number;
      arrowStyle?: 'floating-semi-transparent' | 'none' | 'small-dots';
      cardStyle?: 'premium' | 'minimalist' | 'bordered';
      showRatings?: boolean;
      showReviews?: boolean;
      showDeliveryBadge?: boolean;
      showDiscount?: boolean;
      showWishlist?: boolean;
      showQuickView?: boolean;
      productsPerRow?: number;
      animationStyle?: string;
    };
  };
  onAddToCart?: (item: any, quantity: number) => boolean;
};

// --- Occasion Product Card ---
const OccasionProductCard = ({
  product,
  onAddToCart,
  config = {}
}: {
  product: ProductData;
  onAddToCart?: (item: any, quantity: number) => boolean;
  config?: any;
}) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHeartPounding, setIsHeartPounding] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const isInWishlist = wishlistItems.some(item => item.id === product._id);

  // Multi-image auto-slider effect
  useEffect(() => {
    if (!isHovered || !product.images || product.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % product.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, product.images]);

  // Reset image index when hover ends
  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveImageIndex(0);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.dot-indicator')) {
      return;
    }
    navigate(`/product/${product._id}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login first to manage your wishlist", {
        description: "Redirecting to login...",
        duration: 3000,
      });
      setTimeout(() => {
        navigate('/login', { state: { redirect: window.location.pathname } });
      }, 1500);
      return;
    }

    setIsHeartPounding(true);
    setTimeout(() => setIsHeartPounding(false), 500);

    try {
      const prodId = String(product._id || product.id || '');
      const prodTitle = product.title || product.name || '';
      const rawPrice = product.price ?? product.costPrice ?? 0;
      const prodPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice || '0');

      if (!prodId || !prodTitle) {
        toast.error("Invalid product data");
        return;
      }

      const wishlistItem = {
        id: prodId,
        title: prodTitle,
        image: product.images?.[0] || (typeof product.image === 'string' ? product.image : '/images/placeholder.svg'),
        price: prodPrice
      };

      if (isInWishlist) {
        await removeFromWishlist(prodId);
        toast.success("💔 Removed from Wishlist");
      } else {
        await addToWishlist(wishlistItem);
        toast.success("💖 Added to Wishlist");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const addToCartFn = onAddToCart || addToCart;
    const discountedPrice = product.discount && product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

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

    addToCartFn(cartItem, 1);
    toast.success("🛒 Added to cart!");
  };

  const handleBuyNowAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const addToCartFn = onAddToCart || addToCart;
    const discountedPrice = product.discount && product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

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

    addToCartFn(cartItem, 1);
    navigate('/cart');
  };

  const discountedPrice = product.discount && product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative flex flex-col justify-between h-[420px] md:h-[490px] w-full bg-white border border-gray-100 rounded-[18px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(212,175,55,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none",
          config.cardStyle === 'bordered' && "border-2 border-slate-200",
          config.cardStyle === 'minimalist' && "border-none shadow-none rounded-none"
        )}
      >
        {/* Visual Media Container */}
        <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex-shrink-0">
          
          {/* Wishlist Icon */}
          {config.showWishlist !== false && (
            <button
              onClick={handleWishlistToggle}
              className={cn(
                "absolute top-3 right-3 z-20 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:scale-105 active:scale-95 transition-all duration-300",
                isHeartPounding && "scale-125"
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isInWishlist ? "fill-rose-500 stroke-rose-500" : "stroke-gray-500 hover:stroke-rose-500"
                )}
              />
            </button>
          )}

          {/* Discount Badge */}
          {config.showDiscount !== false && product.discount > 0 && (
            <span className="absolute top-3 left-3 z-20 bg-rose-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {product.discount}% OFF
            </span>
          )}

          {/* Quick View Button Overlay (desktop only) */}
          {config.showQuickView !== false && (
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 hidden md:flex">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickViewOpen(true);
                }}
                className="bg-white text-gray-800 border-none shadow-md hover:bg-slate-900 hover:text-white transition-all duration-300 font-semibold rounded-full px-4 py-2"
              >
                <Eye className="h-4 w-4 mr-1.5" />
                Quick View
              </Button>
            </div>
          )}

          {/* Product Image Slider */}
          <div className="w-full h-full relative">
            <ProtectedImage
              src={getImageUrl(product.images[activeImageIndex]) || "/images/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              onLoad={() => setIsImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Shimmer loader placeholder */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
            )}

            {/* Pagination dots */}
            {product.images && product.images.length > 1 && isHovered && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImageIndex(i);
                    }}
                    className={cn(
                      "dot-indicator w-1.5 h-1.5 rounded-full transition-all duration-300",
                      activeImageIndex === i ? "bg-white w-3 scale-110 shadow-sm" : "bg-white/60"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card Metadata & Actions */}
        <div className="p-3.5 flex flex-col justify-between flex-1">
          <div className="space-y-1.5">
            {/* Rating / Review Count */}
            {config.showRatings !== false && product.rating ? (
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                <div className="flex items-center text-amber-500 bg-amber-50/40 px-1 py-0.5 rounded">
                  <Star size={10} className="fill-current text-amber-500 mr-0.5" />
                  <span className="font-extrabold text-gray-700">{(product.rating).toFixed(1)}</span>
                </div>
                {config.showReviews !== false && product.numReviews ? (
                  <span className="text-gray-400">({product.numReviews} Reviews)</span>
                ) : null}
              </div>
            ) : (
              <div className="h-4" />
            )}

            {/* Title */}
            <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-2 leading-tight group-hover:text-bloom-pink-600 transition-colors">
              {product.title}
            </h3>

            {/* Delivery Badge */}
            {config.showDeliveryBadge !== false && product.sameDay !== false && (
              <span className="inline-block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                ⚡ Same Day Delivery
              </span>
            )}
          </div>

          <div className="mt-3 space-y-2.5">
            {/* Prices */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-gray-900">
                {formatPrice(convertPrice(discountedPrice))}
              </span>
              {product.discount > 0 && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                  {formatPrice(convertPrice(product.price))}
                </span>
              )}
            </div>

            {/* CTA Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToCartAction}
                className="w-full h-8 sm:h-9 text-[10px] sm:text-xs border-slate-200 hover:border-slate-800 rounded-lg text-slate-700 bg-white font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <ShoppingCart className="h-3 w-3" />
                Add
              </Button>
              <Button
                size="sm"
                onClick={handleBuyNowAction}
                className="w-full h-8 sm:h-9 text-[10px] sm:text-xs bg-gradient-to-r from-bloom-pink-500 to-rose-500 hover:from-bloom-pink-600 hover:to-rose-600 text-white border-0 rounded-lg font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-[0_2px_6px_rgba(244,63,94,0.15)]"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product as any}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

// --- Homepage OccasionsSection Component ---
export const OccasionsSection = ({ section, onAddToCart }: OccasionsSectionProps) => {
  const [occasions, setOccasions] = useState<OccasionData[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [occasionsLoading, setOccasionsLoading] = useState(true);
  const [productsCache, setProductsCache] = useState<Record<string, ProductData[]>>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load active occasions config
  useEffect(() => {
    const loadOccasions = async () => {
      try {
        setOccasionsLoading(true);
        // homepageOnly = true to fetch active occasions configured for homepage
        const data = await productService.getOccasions(true);
        setOccasions(data);
        if (data.length > 0) {
          // Default selection to Birthday, or the first occasion in list
          const birthdayTab = data.find(o => o.slug === 'birthday') || data[0];
          setSelectedOccasion(birthdayTab);
        }
      } catch (err) {
        console.error('Error fetching homepage occasions:', err);
      } finally {
        setOccasionsLoading(false);
      }
    };
    loadOccasions();
  }, []);

  // Load products for the active occasion tab
  useEffect(() => {
    if (!selectedOccasion) return;

    const fetchProductsForOccasion = async () => {
      const occId = selectedOccasion._id || '';
      
      // If cached, return cached products immediately
      if (productsCache[occId]) {
        setProducts(productsCache[occId]);
        return;
      }

      try {
        setLoading(true);
        // Load products belonging to this occasion
        const limit = section.content?.maxProducts || 10;
        const response = await productService.getProductsByOccasion(selectedOccasion.slug);
        
        const productsList = (response.products || []).slice(0, limit);
        setProducts(productsList);
        
        // Cache the result
        setProductsCache(prev => ({
          ...prev,
          [occId]: productsList
        }));
      } catch (err) {
        console.error(`Error loading products for occasion "${selectedOccasion.name}":`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsForOccasion();
  }, [selectedOccasion, productsCache, section.content?.maxProducts]);

  // Carousel Arrow Controls
  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Header Title details
  const sectionTitle = section.title || "Shop by Occasion ⭐";
  const sectionSubtitle = section.subtitle || "Find the perfect flowers, cakes, plants and gifts curated specially for every celebration.";
  const showArrows = section.content?.arrowStyle !== 'none';
  const accentGold = selectedOccasion?.accentColor || '#D4AF37';

  // Responsive padding settings
  const paddingClass = section.styling?.padding || "py-16";
  const backgroundStyle = section.styling?.background || "#FFFDF7"; // SBFlorist Soft Cream

  if (occasionsLoading) {
    return (
      <div className={cn("max-w-7xl mx-auto px-4", paddingClass)}>
        <div className="h-6 w-48 bg-slate-100 animate-pulse rounded mb-2" />
        <div className="h-4 w-96 bg-slate-100 animate-pulse rounded mb-8" />
        <div className="flex gap-4 mb-8 overflow-x-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-28 bg-slate-100 animate-pulse rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (occasions.length === 0) return null;

  return (
    <div
      style={{ backgroundColor: backgroundStyle }}
      className={cn("w-full transition-colors duration-500", paddingClass)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
            {sectionSubtitle}
          </p>
        </div>

        {/* Occasion Tabs Bar */}
        <div className="relative border-b border-slate-100 mb-8 z-20">
          <div
            ref={tabsScrollRef}
            className="flex gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5 select-none"
          >
            {occasions.map((occ) => {
              const isSelected = selectedOccasion?._id === occ._id;
              
              return (
                <button
                  key={occ._id}
                  onClick={() => setSelectedOccasion(occ)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all duration-300 flex-shrink-0 group hover:shadow-[0_-4px_12px_rgba(212,175,55,0.03)] border-b-2 border-transparent",
                    isSelected 
                      ? "bg-white text-slate-900 shadow-[0_-3px_10px_rgba(0,0,0,0.03)]" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                  style={{
                    borderTop: isSelected ? `2.5px solid ${occ.accentColor || '#D4AF37'}` : '2.5px solid transparent'
                  }}
                >
                  <OccasionIcon 
                    name={occ.icon} 
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isSelected ? "" : "text-slate-400"
                    )} 
                    style={{ color: isSelected ? (occ.accentColor || '#D4AF37') : undefined }}
                  />
                  <span>{occ.name}</span>

                  {/* Animated Tab underline indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeUnderline"
                      className="absolute bottom-[-2.5px] left-0 right-0 h-[2.5px] z-10"
                      style={{ backgroundColor: occ.accentColor || '#D4AF37' }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Slider Carousel */}
        <div className="relative group/carousel">
          
          {/* Left Arrow Button */}
          {showArrows && products.length > 0 && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/90 border border-slate-100 shadow-md hover:bg-slate-900 hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hidden md:flex active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Right Arrow Button */}
          {showArrows && products.length > 0 && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/90 border border-slate-100 shadow-md hover:bg-slate-900 hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hidden md:flex active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Products Sliding Container */}
          <div className="w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {loading ? (
                // Skeletons list
                <motion.div
                  key="skeleton-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
                >
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className={idx >= 2 ? "hidden md:block" : ""}>
                      <ProductCardSkeleton />
                    </div>
                  ))}
                </motion.div>
              ) : products.length === 0 ? (
                // Empty state
                <motion.div
                  key="empty-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <p className="text-slate-500 font-medium">No products currently available for this celebration.</p>
                  <Button 
                    onClick={() => navigate('/shop')} 
                    className="mt-4 bg-slate-900 text-white font-bold"
                  >
                    Browse Shop
                  </Button>
                </motion.div>
              ) : (
                // Horizontal scroll list of products
                <motion.div
                  key={`products-${selectedOccasion?.slug}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  ref={scrollRef}
                  className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1"
                >
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="snap-start flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(50%-10px)] md:w-[calc(33.33%-10px)] lg:w-[calc(25%-15px)] xl:w-[calc(25%-15px)]"
                    >
                      <OccasionProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        config={section.content}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* View All occasion landing page link */}
        {selectedOccasion && products.length > 0 && !loading && (
          <div className="mt-8 text-center">
            <Button
              variant="link"
              onClick={() => navigate(`/${selectedOccasion.slug}`)}
              className="text-xs sm:text-sm font-extrabold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              style={{ color: accentGold }}
            >
              Explore All {selectedOccasion.name} Gifts
              <ChevronRight className="h-4 w-4 ml-1 inline" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
