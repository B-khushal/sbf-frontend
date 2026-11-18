import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, Gift, ArrowRight, CheckCircle2, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useWishlist from "@/hooks/use-wishlist";
import { getImageUrl } from "@/config";
import ProtectedImage from "../ui/ProtectedImage";
import { extractComboComponents } from "@/utils/comboHelpers";

export interface CakeComboCardProps {
  combo: Record<string, unknown>;
  className?: string;
}

interface ComboComponentItem {
  name: string;
  type?: string;
}

// Shorten component titles into clean concise lines for mobile & desktop
const formatComboComponentName = (name: string, type?: string): string => {
  if (!name) return type === "cake" ? "Artisan Cake" : "Fresh Flowers";
  let clean = name.trim();

  if (clean.includes("–")) {
    const parts = clean.split("–");
    if (parts[1] && parts[1].trim()) {
      clean = parts[1].trim();
    }
  } else if (clean.includes("-") && !clean.toLowerCase().includes("cake-")) {
    const parts = clean.split("-");
    if (parts[1] && parts[1].trim()) {
      clean = parts[1].trim();
    }
  }

  clean = clean.charAt(0).toUpperCase() + clean.slice(1);

  if (type === "cake" && !clean.toLowerCase().includes("cake")) {
    clean = `${clean} Cake`;
  }

  return clean;
};

export const CakeComboCard: React.FC<CakeComboCardProps> = ({ combo, className }) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [isHeartPounding, setIsHeartPounding] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const comboId = String(combo._id || combo.id || "");
  const isInWishlist = wishlistItems.some(
    (item) =>
      String(item.id) === comboId ||
      String((item as { productId?: string }).productId || "") === comboId
  );

  const title = String(combo.name || combo.title || "Celebration Combo");
  const price = Number(combo.price || 0);
  const comparePrice = combo.comparePrice ? Number(combo.comparePrice) : null;
  const savings = comparePrice && comparePrice > price ? comparePrice - price : null;

  const detailsObj = combo.details as { tagline?: string } | undefined;
  const tagline = detailsObj?.tagline || "Flowers & Cake Combo";
  const imagesArr = Array.isArray(combo.images) ? (combo.images as string[]) : [];
  const imageSrc = imagesArr[0] || String(combo.image || "") || "/placeholder.svg";

  const extracted = extractComboComponents(combo);
  const attrProducts = (combo.comboAttributes as { comboProducts?: ComboComponentItem[] } | undefined)
    ?.comboProducts;
  const comboProducts: ComboComponentItem[] =
    extracted.allComponents.length > 0
      ? extracted.allComponents
      : Array.isArray(attrProducts) && attrProducts.length > 0
      ? attrProducts
      : [
          { name: "Artisan Cake", type: "cake" },
          { name: "Fresh Flowers", type: "bouquet" },
        ];

  const rating = Number(combo.rating || 0);
  const reviewCount = Number(combo.reviewCount || combo.numReviews || 0);

  const handleCardClick = () => {
    navigate(`/product/${comboId}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsHeartPounding(true);
    window.setTimeout(() => setIsHeartPounding(false), 450);

    try {
      if (isInWishlist) {
        await removeFromWishlist(comboId);
      } else {
        await addToWishlist({
          id: comboId,
          title,
          image: imageSrc,
          price,
        });
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#EDE5DD] bg-white shadow-[0_2px_14px_rgba(30,27,24,0.04)] transition-all duration-300 hover:border-[#E2B8C6] hover:shadow-[0_12px_28px_rgba(190,24,93,0.10)] cursor-pointer",
        className
      )}
    >
      {/* Product Image — Clean 4:5 container, zero visual clutter */}
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-[#F5F0EA]">
        {/* Single Crisp Top-Left Badge */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20 flex flex-col items-start gap-1 max-w-[calc(100%-3rem)]">
          {savings ? (
            <span className="inline-flex items-center rounded-full bg-[#BE185D] px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white shadow-xs whitespace-nowrap">
              Save {formatPrice(convertPrice(savings))}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#F0D5DF] bg-white/95 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#9D174D] backdrop-blur-sm whitespace-nowrap">
              <Gift className="h-2.5 w-2.5 shrink-0" />
              Combo
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/92 backdrop-blur-sm shadow-xs transition-transform duration-200 hover:bg-white hover:scale-105 active:scale-95",
            isHeartPounding && "scale-120"
          )}
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
              isInWishlist ? "fill-[#BE185D] stroke-[#BE185D]" : "stroke-[#5D544C] hover:stroke-[#BE185D]"
            )}
          />
        </button>

        {/* Responsive Sized Product Image */}
        <ProtectedImage
          src={
            imageSrc.startsWith("/")
              ? imageSrc
              : getImageUrl(imageSrc, { width: 480, height: 600, crop: "fill" }) || "/placeholder.svg"
          }
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />

        {!isImageLoaded && (
          <div className="absolute inset-0 bg-[#F5F0EA] animate-pulse" />
        )}
      </div>

      {/* Card Body — Strict min-w-0 & clean alignment for 320px+ 2-col grids */}
      <div className="flex flex-1 min-w-0 flex-col justify-between p-2.5 sm:p-3.5">
        <div className="min-w-0 space-y-1.5">
          {/* Eyebrow Tagline — Properly truncated, never clipped mid-word */}
          <p className="truncate text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] text-[#BE185D]">
            {tagline}
          </p>

          {/* Title — Exact 2-line box, zero peeking descenders */}
          <h3 className="line-clamp-2 overflow-hidden text-[12.5px] sm:text-sm font-semibold leading-[1.32] text-[#1E1B18] min-h-[2.64em] group-hover:text-[#BE185D] transition-colors">
            {title}
          </h3>

          {/* Included Items — Compact, readable, zero overflow */}
          <ul className="space-y-1 pt-0.5 min-w-0">
            {comboProducts.slice(0, 2).map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-1 min-w-0 text-[10px] sm:text-[11px] text-[#5D544C]"
                title={item.name}
              >
                <CheckCircle2 className="h-3 w-3 shrink-0 text-[#BE185D]/80" />
                <span className="truncate">{formatComboComponentName(item.name, item.type)}</span>
              </li>
            ))}
          </ul>

          {/* Single-Line Delivery & Rating Row (Never wraps awkwardly) */}
          <div className="flex items-center justify-between gap-1.5 pt-1 min-w-0">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#EDF3EE] px-1.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-semibold text-[#2E573A] whitespace-nowrap truncate">
              <Zap className="h-2.5 w-2.5 shrink-0 fill-[#3F6349] text-[#3F6349]" />
              <span className="sm:hidden">Same Day</span>
              <span className="hidden sm:inline">Same-Day Delivery</span>
            </span>

            {reviewCount > 0 && rating > 0 && (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-[#FBF7F0] px-1.5 py-0.5 text-[10px] font-bold text-[#9A6B1E] tabular-nums">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Pricing & Full-Width CTA */}
        <div className="mt-2.5 pt-2.5 border-t border-[#F3ECE5] space-y-2 min-w-0">
          <div className="flex items-baseline justify-between gap-1.5 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
              <span className="text-[14px] sm:text-base font-bold tracking-tight text-[#1E1B18] tabular-nums whitespace-nowrap">
                {formatPrice(convertPrice(price))}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-[10.5px] sm:text-xs text-[#9A9086] line-through tabular-nums whitespace-nowrap">
                  {formatPrice(convertPrice(comparePrice))}
                </span>
              )}
            </div>

            {savings ? (
              <span className="hidden sm:inline-flex shrink-0 rounded-md bg-[#FFF0F5] px-1.5 py-0.5 text-[10px] font-bold text-[#BE185D] whitespace-nowrap">
                Save {formatPrice(convertPrice(savings))}
              </span>
            ) : null}
          </div>

          <Button
            type="button"
            size="sm"
            className="h-9 sm:h-10 w-full rounded-xl bg-[#BE185D] px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#9D174D] active:scale-[0.98] flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span className="sm:hidden">View Combo</span>
            <span className="hidden sm:inline">View Combo Set</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </article>
  );
};

export default CakeComboCard;
