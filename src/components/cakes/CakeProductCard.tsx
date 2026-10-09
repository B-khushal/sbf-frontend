import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, ShoppingBag, Star, Sparkles, Scale, Egg } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { getImageUrl } from "@/config";
import { QuickViewModal } from "../ui/QuickViewModal";
import ProtectedImage from "../ui/ProtectedImage";
import { promptLoginForAddToCart } from "@/utils/cartAuthHelper";
import { getProductEffectivePrice } from "@/utils/pricing";

export interface CakeProductCardProps {
  product: any;
  onAddToCart?: (item: any, quantity: number) => boolean;
  className?: string;
  isCompact?: boolean;
}

export const CakeProductCard: React.FC<CakeProductCardProps> = ({
  product,
  onAddToCart,
  className,
  isCompact = false,
}) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHeartPounding, setIsHeartPounding] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const prodId = String(product._id || product.id || "");
  const isInWishlist = wishlistItems.some(
    (item) => String(item.id) === prodId || String((item as any).productId) === prodId
  );

  const variants = Array.isArray(product.priceVariants) && product.priceVariants.length > 0
    ? product.priceVariants
    : [];

  // Default to first variant (often ½ KG) or product price
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const activeVariant = variants[selectedVariantIdx] || null;

  // Active price: variant price if available, otherwise effective base price
  const baseRawPrice = activeVariant ? Number(activeVariant.price) : Number(product.price || 0);
  const activePrice = activeVariant
    ? getProductEffectivePrice(product, Number(activeVariant.price), activeVariant)
    : getProductEffectivePrice(product);
  const activeComparePrice = activeVariant?.comparePrice
    ? Number(activeVariant.comparePrice)
    : (activePrice < baseRawPrice ? baseRawPrice : (product.comparePrice ? Number(product.comparePrice) : null));

  // Weight display (e.g. from cakeAttributes, variant, or availableSizes)
  const displayWeight = activeVariant?.size || activeVariant?.label || product.cakeAttributes?.weight || product.cakeAttributes?.availableSizes?.[0] || "Standard";
  const isEggless = product.cakeAttributes?.eggless !== undefined ? Boolean(product.cakeAttributes.eggless) : undefined;

  const isOutOfStock = Boolean(
    product.isOutOfStock === true ||
    product.isAvailable === false ||
    (typeof product.stock === "number" && product.stock <= 0) ||
    (typeof product.countInStock === "number" && product.countInStock <= 0)
  );

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    navigate(`/product/${prodId}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsHeartPounding(true);
    setTimeout(() => setIsHeartPounding(false), 500);

    try {
      const prodTitle = product.title || product.name || "Celebration Cake";
      const image = Array.isArray(product.images) && product.images[0]
        ? product.images[0]
        : (product.image || "/placeholder.svg");

      if (isInWishlist) {
        await removeFromWishlist(prodId);
      } else {
        await addToWishlist({
          id: prodId,
          title: prodTitle,
          image,
          price: activePrice,
        });
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This cake is currently out of stock");
      return;
    }

    try {
      const resolvedTitle = product.title || product.name || "Celebration Cake";
      const cartItem = {
        _id: prodId,
        id: prodId,
        productId: prodId,
        title: resolvedTitle,
        name: resolvedTitle,
        price: activePrice,
        originalPrice: activeComparePrice || activePrice,
        images: product.images || (product.image ? [product.image] : []),
        quantity: 1,
        category: "cakes",
        description: product.description,
        selectedVariant: activeVariant
          ? {
              id: activeVariant.id || activeVariant._id,
              label: activeVariant.name || activeVariant.size || displayWeight,
              price: activePrice,
              stock: activeVariant.stock || 50,
            }
          : {
              label: displayWeight,
              price: activePrice,
              stock: 50,
            },
        customizations: {
          cakeWeight: displayWeight,
          weight: displayWeight,
          eggless: isEggless,
          cakeFlavor: product.cakeAttributes?.flavor,
          flavor: product.cakeAttributes?.flavor,
          cakeShape: product.cakeAttributes?.shape,
          shape: product.cakeAttributes?.shape,
          prepTime: product.cakeAttributes?.prepTime,
          occasion: product.cakeAttributes?.occasion,
        },
      };

      if (!user) {
        promptLoginForAddToCart(navigate, cartItem, window.location.pathname + window.location.search);
        return;
      }

      if (onAddToCart) {
        onAddToCart(cartItem, 1);
      } else {
        addToCart(cartItem);
      }

      toast.success("🎂 Added cake to cart!", {
        description: `${resolvedTitle} (${displayWeight}) added to your celebration order`,
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/cart");
      }, 900);
    } catch (error) {
      console.error("Error adding cake to cart:", error);
      toast.error("Failed to add cake to cart");
    }
  };

  const imageSrc = (Array.isArray(product.images) && product.images[0]) || product.image || "/placeholder.svg";
  const hoverImageSrc = (Array.isArray(product.images) && product.images[1]) || null;

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          "group relative bg-white rounded-2xl border border-amber-100/70 hover:border-amber-300/60 overflow-hidden shadow-[0_4px_20px_rgba(217,119,6,0.04)] hover:shadow-[0_12px_28px_rgba(217,119,6,0.12)] transition-all duration-300 cursor-pointer flex flex-col h-full justify-between",
          className
        )}
      >
        {/* Cake Image Section */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-amber-50/50 via-rose-50/20 to-white flex-shrink-0">
          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 items-start">
            {isOutOfStock ? (
              <span className="backdrop-blur-md bg-stone-900/85 text-white border border-white/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
            ) : (
              <>
                {activeComparePrice && activeComparePrice > activePrice && (
                  <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    -{Math.round(((activeComparePrice - activePrice) / activeComparePrice) * 100)}% OFF
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> BESTSELLER
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    NEW
                  </span>
                )}
                {isEggless && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Eggless
                  </span>
                )}
              </>
            )}
          </div>

          {/* Prominent Weight Badge (Upper Right or Lower Left) */}
          <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-md border border-amber-200/70 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1 max-w-[85%]">
            <Scale className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{displayWeight}</span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            aria-label="Add to wishlist"
            className={cn(
              "absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95",
              isHeartPounding && "scale-125"
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors duration-200",
                isInWishlist ? "fill-rose-500 stroke-rose-500" : "stroke-gray-600 hover:stroke-rose-500"
              )}
            />
          </button>

          {/* Quick View Button (Desktop) */}
          <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 hidden md:flex">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/95 text-gray-800 hover:bg-white text-xs font-semibold rounded-xl px-4 py-1.5 shadow-md transition-transform duration-300 translate-y-2 group-hover:translate-y-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
            >
              Quick View
            </Button>
          </div>

          {/* Main Cake Image */}
          <ProtectedImage
            src={getImageUrl(imageSrc) || "/placeholder.svg"}
            alt={product.title || product.name || "Artisan Cake"}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105",
              hoverImageSrc && "group-hover:opacity-0",
              isOutOfStock && "grayscale-[25%] opacity-90"
            )}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />

          {hoverImageSrc && (
            <ProtectedImage
              src={getImageUrl(hoverImageSrc)}
              alt={product.title || product.name || "Artisan Cake view"}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100 animate-pulse" />
          )}
        </div>

        {/* Cake Content Section */}
        <div className={cn("flex flex-col justify-between flex-1 bg-white", isCompact ? "p-2.5 xs:p-3" : "p-3 xs:p-3.5 md:p-4")}>
          <div className="space-y-1.5 flex flex-col">
            {/* Title */}
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-amber-800 transition-colors">
              {product.title || product.name}
            </h3>

            {/* Short Description */}
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {product.shortDescription || product.description || "Freshly baked celebration cake"}
            </p>

            {/* Rating & Delivery */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex items-center text-amber-500 bg-amber-50/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                <span>{(product.rating || 4.8).toFixed(1)}</span>
                <span className="text-slate-400 font-normal ml-1">({product.reviewCount || 24})</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                ⚡ Same Day
              </span>
            </div>

            {/* Selectable Weights if multiple variants exist */}
            {variants.length > 1 && (
              <div className="flex flex-wrap gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                {variants.slice(0, 4).map((variant: any, idx: number) => {
                  const isSelected = idx === selectedVariantIdx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-md transition-all",
                        isSelected
                          ? "bg-amber-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/60"
                      )}
                    >
                      {variant.size || variant.name || variant.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="pt-2.5 mt-auto border-t border-slate-100 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {formatPrice(convertPrice(activePrice))}
                </span>
                {activeComparePrice && activeComparePrice > activePrice && (
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                    {formatPrice(convertPrice(activeComparePrice))}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] text-amber-700 font-medium truncate text-right max-w-[120px]"
                title={displayWeight}
              >
                {displayWeight}
              </span>
            </div>

            <Button
              size="sm"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={cn(
                "w-full h-8 xs:h-9 text-xs font-bold rounded-xl transition-all duration-300 gap-1.5 shadow-xs shrink-0",
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white hover:shadow-md"
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal
          product={{
            ...product,
            _id: prodId,
            price: activePrice,
            title: product.title || product.name,
          }}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
};

export default CakeProductCard;
