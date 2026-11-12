import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  Heart,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Scale,
  Sparkles,
  Star,
  Truck,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { getImageUrl } from "@/config";
import ProtectedImage from "./ui/ProtectedImage";
import { QuickViewModal } from "./ui/QuickViewModal";
import { cn } from "@/lib/utils";
import { promptLoginForAddToCart } from "@/utils/cartAuthHelper";
import { getProductEffectivePrice } from "@/utils/pricing";
import { formatCakeWeightLabel } from "@/utils/cakeHelpers";
import { extractComboComponents, isComboProduct } from "@/utils/comboHelpers";
import { marketingTracker } from "@/services/marketingTracker";
import { useValentine } from "@/contexts/ValentineContext";
import { getProductDetailsPath, shouldShowValentineProductDetails } from "@/utils/productRouting";

export type AddStatus = "idle" | "loading" | "added" | "error";

export interface EditorialProductCardProps {
  product: any;
  index?: number;
  contextLabel?: string;
  showRatings?: boolean;
  showReviews?: boolean;
  onAddToCart?: (item: any, quantity?: number) => any;
  className?: string;
}

const stripHtml = (raw: string): string =>
  raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatComboTagName = (name: string, type?: string): string => {
  if (!name) return type === "cake" ? "Cake" : "Flowers";
  let clean = name.trim();
  if (clean.includes("–")) {
    const parts = clean.split("–");
    if (parts[1]?.trim()) clean = parts[1].trim();
  } else if (clean.includes("-") && !clean.toLowerCase().includes("cake-")) {
    const parts = clean.split("-");
    if (parts[1]?.trim()) clean = parts[1].trim();
  }
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  if (type === "cake" && !clean.toLowerCase().includes("cake")) {
    clean = `${clean} Cake`;
  }
  return clean;
};

const computeComboEffectivePrice = (product: any, baseEffective: number): number => {
  if (
    product?.category === "combos" &&
    Array.isArray(product?.comboItems) &&
    product.comboItems.length > 0
  ) {
    let total = Number(product.price || 0);
    product.comboItems.forEach((item: any) => {
      const variants = item?.customizationOptions?.variants;
      if (item?.customizationOptions?.allowVariants && Array.isArray(variants) && variants.length > 0) {
        const maxVariant = variants.reduce(
          (max: number, v: any) => (Number(v.price) > max ? Number(v.price) : max),
          0
        );
        total += maxVariant;
      } else {
        total += Number(item?.price || 0);
      }
    });
    return total;
  }
  return baseEffective;
};

export const EditorialProductCard: React.FC<EditorialProductCardProps> = React.memo(
  ({
    product,
    index = 0,
    contextLabel,
    showRatings = true,
    showReviews = true,
    onAddToCart,
    className,
  }) => {
    const navigate = useNavigate();
    const { formatPrice, convertPrice } = useCurrency();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { isValentineEnabled } = useValentine();
    const {
      items: wishlistItems,
      addItem: addToWishlist,
      removeItem: removeFromWishlist,
    } = useWishlist();

    const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
    const [isWishlistPending, setIsWishlistPending] = useState<boolean>(false);
    const [addStatus, setAddStatus] = useState<AddStatus>("idle");
    const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);
    const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      };
    }, []);

    if (!product) return null;

    const prodId = String(product._id || product.id || "");
    const title = product.title || product.name || "Handcrafted Floral Gift";
    const isValentineActiveProduct = shouldShowValentineProductDetails(product, isValentineEnabled);
    const productHref = getProductDetailsPath(product, isValentineEnabled);

    const isInWishlist = wishlistItems.some(
      (item) => String(item.id) === prodId || String((item as any).productId) === prodId
    );

    const variants: any[] = Array.isArray(product.priceVariants)
      ? product.priceVariants
      : [];
    const safeVariantIdx = selectedVariantIdx < variants.length ? selectedVariantIdx : 0;
    const activeVariant = variants[safeVariantIdx] || null;

    // Pricing strictly derived from real DB fields
    const baseRawPrice = activeVariant
      ? Number(activeVariant.price || 0)
      : Number(product.price || 0);
    const computedEffective = activeVariant
      ? getProductEffectivePrice(product, Number(activeVariant.price), activeVariant)
      : getProductEffectivePrice(product);
    const effectivePrice = activeVariant
      ? computedEffective
      : computeComboEffectivePrice(product, computedEffective);

    const compareCandidate = activeVariant
      ? Number(activeVariant.comparePrice || 0)
      : Number(product.comparePrice || 0);
    const regularPrice =
      compareCandidate > effectivePrice
        ? compareCandidate
        : effectivePrice < baseRawPrice
        ? baseRawPrice
        : effectivePrice;

    const hasDiscount = effectivePrice > 0 && regularPrice > effectivePrice;
    const discountPct = hasDiscount
      ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
      : 0;
    const savingsAmount = hasDiscount ? regularPrice - effectivePrice : 0;

    // Real stock evaluation (variant stock if variant selected, else product stock)
    const activeStock: number | undefined = activeVariant && typeof activeVariant.stock === "number"
      ? activeVariant.stock
      : typeof product.stock === "number"
      ? product.stock
      : typeof product.countInStock === "number"
      ? product.countInStock
      : undefined;

    const isOutOfStock = Boolean(
      product.isOutOfStock === true ||
        product.isAvailable === false ||
        (typeof activeStock === "number" && activeStock <= 0)
    );
    const isLowStock =
      !isOutOfStock && typeof activeStock === "number" && activeStock > 0 && activeStock <= 5;

    // Real images
    const primaryImage =
      (Array.isArray(product.images) && product.images[0]) ||
      product.image ||
      "/placeholder.svg";
    const secondaryImage =
      Array.isArray(product.images) && product.images.length > 1 ? product.images[1] : null;

    const primaryImageUrl = getImageUrl(primaryImage, {
      width: 600,
      height: 750,
      crop: "fill",
    });
    const secondaryImageUrl = secondaryImage
      ? getImageUrl(secondaryImage, { width: 600, height: 750, crop: "fill" })
      : null;

    // Real category / product-type metadata
    const isCombo = isComboProduct(product);
    const isCake = Boolean(
      product.catalogType === "cake" ||
        product.category === "cakes" ||
        (Array.isArray(product.categories) &&
          product.categories.some(
            (c: any) => typeof c === "string" && c.toLowerCase().includes("cake")
          )) ||
        product.cakeAttributes?.flavor ||
        product.cakeAttributes?.weight ||
        (Array.isArray(product.cakeAttributes?.availableSizes) &&
          product.cakeAttributes.availableSizes.length > 0)
    );

    const isEggless =
      product.cakeAttributes?.eggless !== undefined
        ? Boolean(product.cakeAttributes.eggless)
        : undefined;

    const rawWeight =
      activeVariant?.size ||
      activeVariant?.label ||
      activeVariant?.name ||
      product.cakeAttributes?.weight ||
      product.cakeAttributes?.availableSizes?.[0] ||
      null;
    const displayWeight = (isCake || variants.length > 0) && rawWeight
      ? formatCakeWeightLabel(String(rawWeight))
      : null;

    // Real combo components (never fabricated fallbacks)
    const extractedCombo = isCombo ? extractComboComponents(product) : null;
    const realComboComponents: Array<{ name: string; type?: string }> = isCombo
      ? (extractedCombo?.allComponents?.length
          ? extractedCombo.allComponents
          : Array.isArray(product.comboAttributes?.comboProducts) &&
            product.comboAttributes.comboProducts.length > 0
          ? product.comboAttributes.comboProducts
          : Array.isArray(product.comboItems) && product.comboItems.length > 0
          ? product.comboItems
          : [])
      : [];

    // Real ratings & review count
    const ratingVal = Number(product.rating || 0);
    const reviewCount = Number(product.reviewCount ?? product.numReviews ?? 0);
    const hasGenuineRating = showRatings && ratingVal > 0;

    // Real flags
    const hasVideo = Array.isArray(product.videos) && product.videos.length > 0;
    const isCustomizable = Boolean(
      product.isCustomizable === true || product.personalizationEnabled === true
    );
    const requiresComboSelection = Boolean(
      isCombo && Array.isArray(product.comboItems) && product.comboItems.length > 0
    );
    const supportsSameDay = product.sameDay === true || product.isSameDay === true;
    const isNewItem = Boolean(product.isNewArrival === true || product.isNew === true);

    // Real attribute summary lines (only when present in DB)
    const hamperCount = Array.isArray(product.hamperAttributes?.hamperItems)
      ? product.hamperAttributes.hamperItems.length
      : 0;

    const attributeHighlights: string[] = [];
    if (isCake && product.cakeAttributes?.flavor) {
      attributeHighlights.push(String(product.cakeAttributes.flavor));
    }
    if (isCake && product.cakeAttributes?.prepTime) {
      attributeHighlights.push(String(product.cakeAttributes.prepTime));
    }
    if (product.plantAttributes?.indoor) attributeHighlights.push("Indoor Plant");
    if (product.plantAttributes?.outdoor) attributeHighlights.push("Outdoor Plant");
    if (product.plantAttributes?.potIncluded) attributeHighlights.push("Pot Included");
    if (product.chocolateAttributes?.brand) {
      attributeHighlights.push(String(product.chocolateAttributes.brand));
    }
    if (product.chocolateAttributes?.weight) {
      attributeHighlights.push(String(product.chocolateAttributes.weight));
    }
    if (hamperCount > 0) {
      attributeHighlights.push(`${hamperCount} Items Included`);
    }

    // Real short description / tagline fallback if no richer highlight pills exist
    const rawShortDesc =
      (typeof product.shortDescription === "string" && product.shortDescription) ||
      (typeof product.details?.tagline === "string" && product.details.tagline) ||
      (Array.isArray(product.details) && typeof product.details[0] === "string"
        ? product.details[0]
        : "") ||
      (typeof product.description === "string" ? product.description : "");
    const cleanShortDesc = rawShortDesc ? stripHtml(rawShortDesc) : "";

    const resolvedMetaLabel =
      contextLabel ||
      (product.subcategory
        ? String(product.subcategory).replace(/[-_]/g, " ")
        : product.category
        ? String(product.category).replace(/[-_]/g, " ")
        : "Spring Blossoms");

    const trackProductClick = useCallback(() => {
      try {
        marketingTracker.trackMerchandisingClick(
          product.category || "catalog",
          prodId,
          title
        );
      } catch (_) {}
    }, [product.category, prodId, title]);

    const handleWishlistToggle = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!prodId || isWishlistPending) return;

      setIsWishlistPending(true);
      try {
        if (isInWishlist) {
          await removeFromWishlist(prodId);
        } else {
          await addToWishlist({
            id: prodId,
            title,
            price: effectivePrice,
            image: getImageUrl(primaryImage, { width: 400, height: 500, crop: "fill" }),
          });
        }
      } catch (err) {
        console.error("Wishlist toggle error:", err);
      } finally {
        setIsWishlistPending(false);
      }
    };

    const handlePrimaryAction = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isOutOfStock) {
        toast.error("This item is currently out of stock");
        return;
      }

      if (isCustomizable) {
        trackProductClick();
        navigate(`${productHref}?customize=true`);
        return;
      }

      if (requiresComboSelection) {
        trackProductClick();
        navigate(productHref);
        return;
      }

      if (addStatus === "loading") return;

      const cartItem = {
        _id: prodId,
        id: prodId,
        productId: prodId,
        title,
        name: title,
        price: effectivePrice,
        originalPrice: regularPrice || effectivePrice,
        discount: discountPct || product.discount || 0,
        image: primaryImage,
        images:
          Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : primaryImage !== "/placeholder.svg"
            ? [primaryImage]
            : [],
        quantity: 1,
        category: product.category,
        description: product.description,
        isValentineProduct: isValentineActiveProduct,
        selectedVariant: activeVariant
          ? {
              id: activeVariant.id || activeVariant._id,
              label:
                activeVariant.label ||
                activeVariant.name ||
                activeVariant.size ||
                displayWeight ||
                "Standard",
              price: effectivePrice,
              stock: activeVariant.stock ?? 50,
            }
          : displayWeight
          ? {
              label: displayWeight,
              price: effectivePrice,
              stock: activeStock ?? 50,
            }
          : undefined,
        ...(isCake
          ? {
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
            }
          : {}),
      };

      if (!user) {
        promptLoginForAddToCart(
          navigate,
          cartItem,
          window.location.pathname + window.location.search
        );
        return;
      }

      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      setAddStatus("loading");

      try {
        if (onAddToCart) {
          await Promise.resolve(onAddToCart(cartItem, 1));
        } else {
          await addToCart(cartItem);
          toast.success(`${title} added to cart`);
        }

        try {
          marketingTracker.trackAddToCart({
            id: prodId,
            title,
            price: effectivePrice,
            category: product.category,
          });
        } catch (_) {}

        setAddStatus("added");
        statusTimerRef.current = setTimeout(() => setAddStatus("idle"), 1800);
      } catch (err) {
        console.error("Error adding item to cart:", err);
        setAddStatus("error");
        toast.error("Failed to add to cart. Please try again.");
        statusTimerRef.current = setTimeout(() => setAddStatus("idle"), 2500);
      }
    };

    return (
      <>
        <article
          className={cn(
            "group flex h-full w-full flex-col rounded-2xl bg-white/95 border border-[#EDE5DD] shadow-[0_2px_10px_rgba(30,27,24,0.03)] transition-all duration-300 hover:border-[#E2B8C6] hover:shadow-[0_12px_28px_-10px_rgba(190,24,93,0.12)]",
            className
          )}
        >
          {/* 4:5 Editorial Media Block */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-2xl bg-[#F5F0EA]">
            <Link
              to={productHref}
              onClick={trackProductClick}
              aria-label={title}
              className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D] focus-visible:ring-inset"
            >
              <ProtectedImage
                src={primaryImageUrl}
                alt={title}
                width={600}
                height={750}
                loading={index < 6 ? "eager" : "lazy"}
                fetchPriority={index < 4 ? "high" : "auto"}
                decoding="async"
                className={cn(
                  "h-full w-full object-cover object-center transition-all duration-500 ease-out md:group-hover:scale-[1.04]",
                  secondaryImageUrl && "md:group-hover:opacity-0",
                  isOutOfStock && "opacity-85 grayscale-[20%]"
                )}
              />
              {secondaryImageUrl && (
                <ProtectedImage
                  src={secondaryImageUrl}
                  alt={`${title} alternate view`}
                  width={600}
                  height={750}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "hidden md:block absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-500 ease-out md:group-hover:opacity-100 md:group-hover:scale-[1.04]",
                    isOutOfStock && "grayscale-[20%]"
                  )}
                />
              )}
            </Link>

            {/* Top-Left Real Status Badges (Max 2, zero fabricated flags) */}
            <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
              {isOutOfStock ? (
                <span className="rounded-full bg-[#2B2522]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FAF8F5] backdrop-blur-sm">
                  Sold Out
                </span>
              ) : (
                <>
                  {hasDiscount && discountPct > 0 && (
                    <span className="rounded-full bg-[#FFF7F9]/95 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#BE185D] border border-[#F5CBD8] shadow-xs backdrop-blur-sm">
                      -{discountPct}% OFF
                    </span>
                  )}
                  {isValentineEnabled && product.valentineBadge ? (
                    <span className="rounded-full bg-[#BE185D]/90 px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                      {product.valentineBadge}
                    </span>
                  ) : product.isBestseller ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF6EB]/95 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#8C6520] border border-[#EBD8B5] backdrop-blur-sm">
                      <Sparkles className="h-2.5 w-2.5 text-[#B8862D]" aria-hidden="true" />
                      <span>Bestseller</span>
                    </span>
                  ) : isNewItem ? (
                    <span className="rounded-full bg-[#EDF3EE]/95 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#355A40] border border-[#CBE0D0] backdrop-blur-sm">
                      New
                    </span>
                  ) : product.isFeatured ? (
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#4A423B] border border-[#E7DFD7] backdrop-blur-sm">
                      Featured
                    </span>
                  ) : null}
                </>
              )}
            </div>

            {/* Bottom-Left Real Dietary / Motion / Weight Pill */}
            {(isEggless !== undefined || hasVideo || (isCake && displayWeight)) && (
              <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5 max-w-[85%]">
                {isEggless !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-semibold backdrop-blur-sm",
                      isEggless
                        ? "border-[#CBE0D0] bg-[#F2F8F3]/95 text-[#2E573A]"
                        : "border-[#EAD3BA] bg-[#FDF6ED]/95 text-[#8A541F]"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isEggless ? "bg-[#2E7D4B]" : "bg-[#B86E24]"
                      )}
                    />
                    <span>{isEggless ? "Eggless" : "Contains Egg"}</span>
                  </span>
                )}
                {isCake && displayWeight && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#EAE0D5] bg-white/92 px-2 py-0.5 text-[9.5px] font-semibold text-[#3C342E] backdrop-blur-sm">
                    <Scale className="h-2.5 w-2.5 text-[#A0773B]" aria-hidden="true" />
                    <span className="truncate">{displayWeight}</span>
                  </span>
                )}
                {hasVideo && !isOutOfStock && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1E1B18]/75 px-2 py-0.5 text-[9.5px] font-semibold text-white backdrop-blur-sm">
                    <Play className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                    <span>Video</span>
                  </span>
                )}
              </div>
            )}

            {/* Top-Right Actions: Wishlist + Desktop Quick View */}
            <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={isWishlistPending}
                aria-pressed={isInWishlist}
                aria-label={
                  isInWishlist
                    ? `Remove ${title} from wishlist`
                    : `Add ${title} to wishlist`
                }
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D]",
                  isInWishlist
                    ? "border-[#F4C2D2] bg-white/95 text-[#BE185D] shadow-xs"
                    : "border-white/60 bg-white/80 text-[#3B332F] hover:bg-white hover:text-[#BE185D]",
                  isWishlistPending && "opacity-60 cursor-wait"
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isInWishlist ? "fill-[#BE185D] scale-105" : "scale-100"
                  )}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickViewOpen(true);
                }}
                aria-label={`Quick view ${title}`}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[#3B332F] opacity-0 backdrop-blur-md transition-all duration-200 group-hover:opacity-100 hover:bg-white hover:text-[#BE185D] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D]"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card Content Details */}
          <div className="flex flex-1 flex-col justify-between gap-2.5 p-3 sm:p-3.5">
            <div className="space-y-1.5">
              {/* Top Meta: Real Category/Subcategory Label + Genuine Rating */}
              <div className="flex items-center justify-between gap-2 min-h-[18px]">
                <span className="truncate text-[10.5px] font-medium uppercase tracking-[0.09em] text-[#7A7168]">
                  {resolvedMetaLabel}
                </span>

                {hasGenuineRating && (
                  <div
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FBF7F0] px-1.5 py-0.5 border border-[#EFE3CE]"
                    aria-label={`Rated ${ratingVal.toFixed(1)} out of 5`}
                  >
                    <Star
                      className="h-3 w-3 fill-[#C6923A] text-[#C6923A]"
                      aria-hidden="true"
                    />
                    <span className="text-[11px] font-semibold text-[#2E2824] tabular-nums">
                      {ratingVal.toFixed(1)}
                    </span>
                    {showReviews && reviewCount > 0 && (
                      <span className="text-[10px] text-[#857A6E] tabular-nums">
                        ({reviewCount})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Crawlable Product Title (2-line max) */}
              <h3 className="text-[13.5px] sm:text-[14.5px] font-medium leading-[1.35] text-[#1E1B18] line-clamp-2 min-h-[2.7em]">
                <Link
                  to={productHref}
                  onClick={trackProductClick}
                  className="transition-colors hover:text-[#BE185D] focus-visible:outline-none focus-visible:underline"
                >
                  {title}
                </Link>
              </h3>

              {/* Real Product-Specific Highlights (Combo items / Attributes / Short Description) */}
              {realComboComponents.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {realComboComponents.slice(0, 2).map((item, idx) => (
                    <span
                      key={`${prodId}-comp-${idx}`}
                      title={item.name}
                      className="inline-flex max-w-full items-center gap-1 rounded-md border border-[#F3DCE3] bg-[#FFF7F9] px-1.5 py-0.5 text-[10px] font-medium text-[#8E244D]"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-[#BE185D]" aria-hidden="true" />
                      <span className="truncate max-w-[125px]">
                        {formatComboTagName(item.name, item.type)}
                      </span>
                    </span>
                  ))}
                  {realComboComponents.length > 2 && (
                    <span className="text-[10px] font-medium text-[#7A7168] px-0.5">
                      +{realComboComponents.length - 2} more
                    </span>
                  )}
                </div>
              ) : attributeHighlights.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {attributeHighlights.slice(0, 2).map((attr, idx) => (
                    <span
                      key={`${prodId}-attr-${idx}`}
                      className="inline-flex items-center rounded-md border border-[#E9E0D7] bg-[#FAF7F3] px-1.5 py-0.5 text-[10px] font-medium text-[#5D544C] truncate max-w-[140px]"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              ) : cleanShortDesc ? (
                <p className="text-[11px] leading-snug text-[#746B62] line-clamp-1">
                  {cleanShortDesc}
                </p>
              ) : null}

              {/* Real Variant Weight / Size Pills with Live Price */}
              {variants.length > 1 ? (
                <div
                  className="flex flex-wrap items-center gap-1 pt-0.5"
                  role="group"
                  aria-label="Available sizes and pricing"
                >
                  {variants.slice(0, 3).map((variant, vIdx) => {
                    const rawLabel =
                      variant.size || variant.label || variant.name || `Opt ${vIdx + 1}`;
                    const label = formatCakeWeightLabel(String(rawLabel)) || String(rawLabel);
                    const vEff = getProductEffectivePrice(
                      product,
                      Number(variant.price),
                      variant
                    );
                    const vOut = typeof variant.stock === "number" && variant.stock <= 0;
                    const isActive = vIdx === safeVariantIdx;

                    return (
                      <button
                        key={variant.id || variant._id || `${prodId}-v-${vIdx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVariantIdx(vIdx);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors border tabular-nums",
                          isActive
                            ? "border-[#EAB6C8] bg-[#FFF1F5] text-[#9D174D]"
                            : "border-[#E9E1D9] bg-[#FAF8F5] text-[#6B635B] hover:border-[#D7CBC0]",
                          vOut && "opacity-55 line-through"
                        )}
                      >
                        <span>{label}</span>
                        <span className={isActive ? "font-semibold" : "text-[#4D453E]"}>
                          {formatPrice(convertPrice(vEff))}
                        </span>
                      </button>
                    );
                  })}
                  {variants.length > 3 && (
                    <span className="text-[10px] text-[#8A8076] pl-0.5">
                      +{variants.length - 3}
                    </span>
                  )}
                </div>
              ) : !isCake && displayWeight ? (
                <p className="text-[11px] font-medium text-[#5A7562] truncate">
                  {displayWeight}
                </p>
              ) : null}

              {/* Real Delivery / Customization / Low Stock Micro-Cues */}
              {(supportsSameDay || isCustomizable || isLowStock) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px]">
                  {supportsSameDay && !isOutOfStock && (
                    <span className="inline-flex items-center gap-1 font-medium text-[#3F6349]">
                      <Truck className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>Same-Day Delivery</span>
                    </span>
                  )}
                  {isCustomizable && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-[#FDF2F6] px-1.5 py-0.5 font-medium text-[#A62858]">
                      <Wand2 className="h-2.5 w-2.5" aria-hidden="true" />
                      <span>Customizable</span>
                    </span>
                  )}
                  {isLowStock && (
                    <span className="font-semibold text-[#B45309]">
                      Only {activeStock} left
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Row: Real Price / Savings + Compact Rose-Pink CTA */}
            <div className="flex items-center justify-between gap-2 border-t border-[#F3ECE5] pt-2.5">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[14.5px] sm:text-[15.5px] font-semibold tracking-tight text-[#1E1B18] tabular-nums">
                  {formatPrice(convertPrice(effectivePrice))}
                </span>
                {hasDiscount && (
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[11px] text-[#9A9086] line-through tabular-nums">
                      {formatPrice(convertPrice(regularPrice))}
                    </span>
                    {savingsAmount > 0 && (
                      <span className="text-[10px] font-semibold text-[#BE185D] whitespace-nowrap">
                        Save {formatPrice(convertPrice(savingsAmount))}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={isOutOfStock || addStatus === "loading"}
                aria-label={
                  isOutOfStock
                    ? `${title} is out of stock`
                    : isCustomizable
                    ? `Customize ${title}`
                    : requiresComboSelection
                    ? `View ${title}`
                    : `Add ${title} to cart`
                }
                className={cn(
                  "inline-flex shrink-0 items-center justify-center gap-1 rounded-full px-3 sm:px-3.5 h-8 sm:h-9 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D] focus-visible:ring-offset-1 active:scale-[0.97]",
                  isOutOfStock
                    ? "cursor-not-allowed bg-[#F1ECE6] text-[#93887E]"
                    : addStatus === "added"
                    ? "bg-[#4F6F58] text-white"
                    : addStatus === "error"
                    ? "bg-[#FCE8EC] text-[#B91C1C] border border-[#F5B8C4] hover:bg-[#FAD6DE]"
                    : "bg-[#BE185D] text-white shadow-[0_2px_8px_rgba(190,24,93,0.18)] hover:bg-[#9D174D]"
                )}
              >
                {isOutOfStock ? (
                  <span>Unavailable</span>
                ) : isCustomizable ? (
                  <>
                    <Wand2 className="h-3 w-3" aria-hidden="true" />
                    <span>Customize</span>
                  </>
                ) : requiresComboSelection ? (
                  <>
                    <span>View Set</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </>
                ) : addStatus === "loading" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>Adding</span>
                  </>
                ) : addStatus === "added" ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Added</span>
                  </>
                ) : addStatus === "error" ? (
                  <>
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    <span>Retry</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </article>

        {isQuickViewOpen && (
          <QuickViewModal
            product={{
              ...product,
              _id: prodId,
              title,
              price: effectivePrice,
            }}
            isOpen={isQuickViewOpen}
            onClose={() => setIsQuickViewOpen(false)}
            onAddToCart={onAddToCart}
          />
        )}
      </>
    );
  }
);

EditorialProductCard.displayName = "EditorialProductCard";

export const EditorialProductCardSkeleton: React.FC = () => (
  <div className="flex w-full flex-col rounded-2xl bg-white border border-[#EDE5DD] overflow-hidden">
    <div className="aspect-[4/5] w-full bg-[#EFE9E2] animate-pulse" />
    <div className="p-3 sm:p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-[#EFE9E2] animate-pulse" />
        <div className="h-3 w-10 rounded bg-[#EFE9E2] animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded bg-[#EFE9E2] animate-pulse" />
        <div className="h-3.5 w-3/4 rounded bg-[#EFE9E2] animate-pulse" />
      </div>
      <div className="h-3 w-2/3 rounded bg-[#F3EEE8] animate-pulse" />
      <div className="flex items-center justify-between pt-2 border-t border-[#F4EEE8]">
        <div className="h-4 w-16 rounded bg-[#EFE9E2] animate-pulse" />
        <div className="h-8 w-16 rounded-full bg-[#F5E1E8] animate-pulse" />
      </div>
    </div>
  </div>
);

