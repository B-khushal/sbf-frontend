import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, Play, Eye, ShoppingCart, Scale, Sparkles } from "lucide-react";
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
import { getProductEffectivePrice } from "@/utils/pricing";
import { formatCakeWeightLabel } from "@/utils/cakeHelpers";

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
  config = {},
  onCardClick,
}: {
  product: ProductData;
  onAddToCart?: (item: any, quantity: number) => boolean;
  config?: any;
  onCardClick?: (e: React.MouseEvent) => void;
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
    if (onCardClick) {
      onCardClick(e);
      if (e.defaultPrevented) return;
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

  const isCake = Boolean(
    product.catalogType === 'cake' ||
    (typeof product.category === 'string' && product.category.toLowerCase().includes('cake')) ||
    (Array.isArray(product.categories) && product.categories.some(c => String(c).toLowerCase().includes('cake'))) ||
    product.cakeAttributes ||
    (product.title && product.title.toLowerCase().includes('cake'))
  );

  const variants = Array.isArray(product.priceVariants) && product.priceVariants.length > 0
    ? product.priceVariants
    : [];

  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const activeVariant = variants[selectedVariantIdx] || null;

  const baseRawPrice = activeVariant ? Number(activeVariant.price) : Number(product.price || 0);
  const effectivePrice = activeVariant
    ? getProductEffectivePrice(product, Number(activeVariant.price), activeVariant)
    : getProductEffectivePrice(product);

  const activeComparePrice = activeVariant
    ? (activeVariant.comparePrice && Number(activeVariant.comparePrice) > effectivePrice
        ? Number(activeVariant.comparePrice)
        : (effectivePrice < baseRawPrice ? baseRawPrice : null))
    : (product.comparePrice && Number(product.comparePrice) > effectivePrice
        ? Number(product.comparePrice)
        : (effectivePrice < Number(product.price || 0) ? Number(product.price || 0) : null));

  const hasDiscount = effectivePrice > 0 && activeComparePrice !== null && activeComparePrice > effectivePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((activeComparePrice - effectivePrice) / activeComparePrice) * 100)
    : (product.discount || 0);

  const rawWeight = activeVariant?.label || (activeVariant as any)?.size || product.cakeAttributes?.weight || product.cakeAttributes?.availableSizes?.[0] || (isCake ? "1/2 kg" : undefined);
  const displayWeight = isCake && rawWeight ? formatCakeWeightLabel(rawWeight) : rawWeight;
  const isEggless = product.cakeAttributes?.eggless !== undefined ? Boolean(product.cakeAttributes.eggless) : undefined;

  const isOutOfStock = Boolean(
    product.isOutOfStock === true ||
    product.isAvailable === false ||
    (typeof product.stock === 'number' && product.stock <= 0) ||
    (typeof product.countInStock === 'number' && product.countInStock <= 0)
  );

  const buildCartItem = () => {
    const prodId = String(product._id || product.id || '');
    const resolvedTitle = product.title || product.name || 'Product';
    return {
      _id: prodId,
      id: prodId,
      productId: prodId,
      title: resolvedTitle,
      name: resolvedTitle,
      price: effectivePrice,
      originalPrice: activeComparePrice || effectivePrice,
      images: product.images || ((product as any).image ? [(product as any).image] : []),
      quantity: 1,
      discount: discountPercentage || product.discount || 0,
      category: product.category || (isCake ? "cakes" : undefined),
      description: product.description,
      selectedVariant: activeVariant
        ? {
            id: (activeVariant as any).id || (activeVariant as any)._id,
            label: (activeVariant as any).size || activeVariant.label || displayWeight,
            price: effectivePrice,
            stock: activeVariant.stock || 50,
          }
        : isCake && displayWeight
        ? {
            label: displayWeight,
            price: effectivePrice,
            stock: 50,
          }
        : undefined,
      customizations: isCake
        ? {
            cakeWeight: displayWeight,
            weight: displayWeight,
            eggless: isEggless,
            cakeFlavor: product.cakeAttributes?.flavor,
            flavor: product.cakeAttributes?.flavor,
            cakeShape: product.cakeAttributes?.shape,
            shape: product.cakeAttributes?.shape,
            prepTime: product.cakeAttributes?.prepTime,
            occasion: product.cakeAttributes?.occasion,
          }
        : undefined,
    };
  };

  const handleAddToCartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }

    const addToCartFn = onAddToCart || addToCart;
    const cartItem = buildCartItem();

    addToCartFn(cartItem, 1);
    toast.success(isCake ? "🎂 Added cake to cart!" : "🛒 Added to cart!", {
      description: isCake && displayWeight ? `${product.title} (${displayWeight}) added to your celebration order` : undefined,
    });
  };

  const handleBuyNowAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }

    const addToCartFn = onAddToCart || addToCart;
    const cartItem = buildCartItem();

    addToCartFn(cartItem, 1);
    navigate('/cart');
  };

  // Clean Title Casing (e.g. "chocolate cake" -> "Chocolate Cake")
  const formattedTitle = useMemo(() => {
    const raw = (product.title || product.name || '').trim();
    return raw.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }, [product.title, product.name]);

  // Clean currency display without trailing .00 for whole numbers
  const formatCurrencyClean = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '';
    return formatPrice(convertPrice(amount)).replace(/\.00$/, '');
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative flex flex-col justify-between h-full w-full bg-white border border-slate-200/80 hover:border-amber-300/80 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_30px_rgba(212,175,55,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none",
          config.cardStyle === 'bordered' && "border-2 border-slate-200",
          config.cardStyle === 'minimalist' && "border-none shadow-none rounded-none"
        )}
      >
        {/* Visual Media Container */}
        <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex-shrink-0 rounded-t-2xl">
          
          {/* Wishlist Frosted Glass Icon */}
          {config.showWishlist !== false && (
            <button
              onClick={handleWishlistToggle}
              aria-label="Wishlist"
              className={cn(
                "absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-md shadow-xs border border-white/60 hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-300",
                isHeartPounding && "scale-125"
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isInWishlist ? "fill-rose-500 stroke-rose-500" : "stroke-slate-600 hover:stroke-rose-500"
                )}
              />
            </button>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 items-start">
            {isOutOfStock ? (
              <span className="backdrop-blur-md bg-stone-900/85 text-white border border-white/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
            ) : (
              <>
                {config.showDiscount !== false && hasDiscount && (
                  <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                    -{discountPercentage}% OFF
                  </span>
                )}
                {(product as any).isBestseller && (
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Bestseller
                  </span>
                )}
                {isCake && isEggless && (
                  <span className="bg-emerald-500/95 backdrop-blur-sm text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> Eggless
                  </span>
                )}
              </>
            )}
          </div>

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
                className="bg-white/95 text-slate-900 border-none shadow-md hover:bg-slate-900 hover:text-white transition-all duration-300 font-bold rounded-full px-4 py-1.5 text-xs"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Quick View
              </Button>
            </div>
          )}

          {/* Product Image Slider */}
          <div className="w-full h-full relative">
            <ProtectedImage
              src={getImageUrl(product.images[activeImageIndex]) || "/images/placeholder.svg"}
              alt={formattedTitle}
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
              <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-20">
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
        <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
          <div className="space-y-1.5">
            {/* Title Container (fixed 2 lines) */}
            <div className="min-h-[2.35rem] flex items-start overflow-hidden">
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
                {formattedTitle}
              </h3>
            </div>

            {/* Rating & Same-Day Delivery Row */}
            <div className="h-5 flex items-center gap-1.5 overflow-hidden">
              {config.showRatings !== false && product.rating ? (
                <div className="flex items-center text-amber-500 bg-amber-50/70 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                  <Star size={10} className="fill-current text-amber-500 mr-0.5" />
                  <span className="text-slate-800 font-extrabold">{(product.rating).toFixed(1)}</span>
                  {config.showReviews !== false && product.numReviews ? (
                    <span className="text-slate-400 font-normal ml-0.5">({product.numReviews})</span>
                  ) : null}
                </div>
              ) : null}

              {config.showDeliveryBadge !== false && product.sameDay !== false && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-100/80 px-1.5 py-0.5 rounded-md">
                  ⚡ Same Day
                </span>
              )}
            </div>

            {/* Selectable Weight Variants / Attribute Row (Fixed Height Slot for Uniform Layout) */}
            <div className="h-7 flex items-center pt-0.5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {variants.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  {variants.slice(0, 3).map((v: any, idx: number) => {
                    const isSel = idx === selectedVariantIdx;
                    const rawLabel = v.label || (v as any).size || v.name;
                    const label = isCake ? formatCakeWeightLabel(rawLabel) : rawLabel;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md transition-all flex items-center justify-center border",
                          isSel
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs scale-102"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : isCake && displayWeight ? (
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900/90 bg-amber-50/70 border border-amber-200/70 px-2 py-0.5 rounded-md">
                  <Scale className="w-3 h-3 text-amber-600" />
                  <span>{displayWeight}</span>
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400">
                  {product.category ? `${product.category.charAt(0).toUpperCase() + product.category.slice(1)}` : 'Handcrafted'}
                </span>
              )}
            </div>
          </div>

          {/* Pricing & CTA Section */}
          <div className="pt-2 mt-auto border-t border-slate-100/90 space-y-2">
            {/* Price Line */}
            <div className="flex items-baseline justify-between gap-1.5 h-6">
              <div className="flex items-baseline gap-1.5">
                <span className={cn(
                  "text-base sm:text-lg font-black tracking-tight",
                  hasDiscount ? "text-rose-600 font-black" : "text-slate-900"
                )}>
                  {formatCurrencyClean(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through font-normal">
                    {formatCurrencyClean(activeComparePrice)}
                  </span>
                )}
              </div>

              {hasDiscount && (
                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                  Save {discountPercentage}%
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToCartAction}
                disabled={isOutOfStock}
                className="w-full h-8 sm:h-9 text-xs border-slate-200 hover:border-slate-800 rounded-xl text-slate-800 bg-white hover:bg-slate-50 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-slate-600" />
                Add
              </Button>
              <Button
                size="sm"
                onClick={handleBuyNowAction}
                disabled={isOutOfStock}
                className="w-full h-8 sm:h-9 text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white border-0 rounded-xl font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs hover:shadow-md"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={{
          ...product,
          price: effectivePrice,
          originalPrice: activeComparePrice || effectivePrice,
          priceVariants: product.priceVariants,
        } as any}
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

  // Scroll tracking states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Tabs scroll tracking states
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);

  // Mouse drag-to-scroll tracking
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

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
        // Load products belonging to this occasion (default 16 for rich side-scroller)
        const limit = section.content?.maxProducts || 16;
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

  // Product carousel scroll checker
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    } else {
      setScrollProgress(0);
    }
  }, []);

  // Tabs scroll checker
  const checkTabsScroll = useCallback(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollTabsLeft(scrollLeft > 6);
    setCanScrollTabsRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  // Set up listeners for product scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    const timer = setTimeout(checkScroll, 250);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, [checkScroll, products, selectedOccasion]);

  // Set up listeners for tabs scroll
  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;

    checkTabsScroll();
    el.addEventListener('scroll', checkTabsScroll, { passive: true });
    window.addEventListener('resize', checkTabsScroll);

    const timer = setTimeout(checkTabsScroll, 250);

    return () => {
      el.removeEventListener('scroll', checkTabsScroll);
      window.removeEventListener('resize', checkTabsScroll);
      clearTimeout(timer);
    };
  }, [checkTabsScroll, occasions]);

  // Carousel Arrow Controls
  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = Math.max(container.clientWidth * 0.75, 280);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Tabs Arrow Controls
  const handleTabsScroll = (direction: 'left' | 'right') => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.6, 200);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftStartRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const container = scrollRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.25;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Header Title details
  const sectionTitle = section.title || "Shop by Occasion ⭐";
  const sectionSubtitle = section.subtitle || "Find the perfect flowers, cakes, plants and gifts curated specially for every celebration.";
  const showArrows = section.content?.arrowStyle !== 'none';
  const accentGold = selectedOccasion?.accentColor || '#D4AF37';

  // Responsive padding settings
  const paddingClass = section.styling?.padding || "py-12 sm:py-16 md:py-20";
  const backgroundStyle = section.styling?.background || "#FFFDF7"; // SBFlorist Soft Cream

  if (occasionsLoading) {
    return (
      <div className={cn("max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8", paddingClass)}>
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
      <div className="max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Desktop Paired Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-10 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {sectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* Desktop & Tablet Paired Header Navigation Arrows */}
          {products.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 self-center sm:self-end flex-shrink-0">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous products"
                className={cn(
                  "h-9 w-9 md:h-10 md:w-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 transition-all duration-200",
                  canScrollLeft
                    ? "hover:bg-slate-900 hover:text-white hover:border-slate-900 active:scale-95 cursor-pointer shadow-md"
                    : "opacity-35 cursor-not-allowed text-slate-300 border-slate-200"
                )}
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Next products"
                className={cn(
                  "h-9 w-9 md:h-10 md:w-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 transition-all duration-200",
                  canScrollRight
                    ? "hover:bg-slate-900 hover:text-white hover:border-slate-900 active:scale-95 cursor-pointer shadow-md"
                    : "opacity-35 cursor-not-allowed text-slate-300 border-slate-200"
                )}
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Occasion Tabs Bar with Scroll Buttons */}
        <div className="relative border-b border-slate-200/80 mb-8 z-20 group/tabs">
          {/* Tabs Left Arrow */}
          {canScrollTabsLeft && (
            <button
              type="button"
              onClick={() => handleTabsScroll('left')}
              aria-label="Scroll occasions left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Tabs Right Arrow */}
          {canScrollTabsRight && (
            <button
              type="button"
              onClick={() => handleTabsScroll('right')}
              aria-label="Scroll occasions right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div
            ref={tabsScrollRef}
            className="flex gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5 select-none px-1"
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
        <div className="relative group/carousel -mx-4 px-4 sm:mx-0 sm:px-0">
          
          {/* Floating Left Arrow Button */}
          {showArrows && products.length > 0 && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={cn(
                "absolute -left-2 sm:-left-3 md:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-30",
                "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full",
                "bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.14)]",
                "flex items-center justify-center text-slate-800 transition-all duration-200",
                "hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-110 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-slate-400",
                canScrollLeft
                  ? "opacity-100 cursor-pointer pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Floating Right Arrow Button */}
          {showArrows && products.length > 0 && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={cn(
                "absolute -right-2 sm:-right-3 md:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-30",
                "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full",
                "bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.14)]",
                "flex items-center justify-center text-slate-800 transition-all duration-200",
                "hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-110 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-slate-400",
                canScrollRight
                  ? "opacity-100 cursor-pointer pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Products Sliding Container in the SAME ROW on all screens */}
          <div className="w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {loading ? (
                // Skeletons list
                <motion.div
                  key="skeleton-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-4 sm:gap-5 md:gap-6 overflow-hidden py-2"
                >
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-[230px] xs:w-[250px] sm:w-[270px] md:w-[285px] lg:w-[295px] xl:w-[310px]"
                    >
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
                // Single-Row Horizontal side-scroller of products
                <motion.div
                  key={`products-${selectedOccasion?.slug}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 items-stretch cursor-grab active:cursor-grabbing select-none"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="snap-start flex-shrink-0 w-[230px] xs:w-[250px] sm:w-[270px] md:w-[285px] lg:w-[295px] xl:w-[310px] 2xl:w-[325px] 3xl:w-[340px] flex"
                    >
                      <OccasionProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        config={section.content}
                        onCardClick={handleCardClick}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scroll Progress Bar */}
          {products.length > 3 && (
            <div className="flex items-center justify-center mt-6 sm:mt-8">
              <div className="relative h-1 sm:h-1.5 w-28 sm:w-36 bg-amber-100/80 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: accentGold || '#D4AF37',
                    width: '35%',
                    left: `${(scrollProgress / 100) * 65}%`,
                  }}
                />
              </div>
            </div>
          )}
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
