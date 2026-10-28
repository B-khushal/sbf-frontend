import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, Sparkles, Gift, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useWishlist from "@/hooks/use-wishlist";
import { getImageUrl } from "@/config";
import ProtectedImage from "../ui/ProtectedImage";
import { extractComboComponents } from "@/utils/comboHelpers";

export interface CakeComboCardProps {
  combo: any;
  className?: string;
}

// Clean helper to shorten component titles into elegant concise tags
const formatComboComponentName = (name: string, type?: string): string => {
  if (!name) return type === "cake" ? "Artisan Cake" : "Fresh Flowers";
  let clean = name.trim();

  // Strip brand / collection prefixes separated by dashes, e.g. "Timeless Romance – 10 Red Rose Bouquet"
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

  // Capitalize first letter
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);

  // If cake component doesn't mention cake
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
    (item) => String(item.id) === comboId || String((item as any).productId) === comboId
  );

  const price = Number(combo.price || 0);
  const comparePrice = combo.comparePrice ? Number(combo.comparePrice) : null;
  const savings = comparePrice && comparePrice > price ? comparePrice - price : null;

  const tagline = combo.details?.tagline || "Celebration Flowers & Cake";
  const imageSrc = (Array.isArray(combo.images) && combo.images[0]) || combo.image || "/placeholder.svg";

  // Combo item pills/breakdown extracted dynamically
  const extracted = extractComboComponents(combo);
  const comboProducts =
    extracted.allComponents.length > 0
      ? extracted.allComponents
      : Array.isArray(combo.comboAttributes?.comboProducts) && combo.comboAttributes.comboProducts.length > 0
      ? combo.comboAttributes.comboProducts
      : [
          { name: "Artisan Cake", type: "cake" },
          { name: "Fresh Flowers", type: "bouquet" },
        ];

  const handleCardClick = () => {
    navigate(`/product/${comboId}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsHeartPounding(true);
    setTimeout(() => setIsHeartPounding(false), 500);

    try {
      if (isInWishlist) {
        await removeFromWishlist(comboId);
      } else {
        await addToWishlist({
          id: comboId,
          title: combo.name || combo.title || "Celebration Combo",
          image: imageSrc,
          price,
        });
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative bg-white rounded-2xl border border-rose-100/80 hover:border-rose-300/80 overflow-hidden shadow-[0_4px_20px_rgba(244,63,94,0.04)] hover:shadow-[0_12px_28px_rgba(244,63,94,0.12)] transition-all duration-300 cursor-pointer flex flex-col h-full justify-between",
        className
      )}
    >
      {/* Product Image Section */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-rose-50/50 via-amber-50/20 to-white flex-shrink-0">
        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 items-start">
          <span className="backdrop-blur-md bg-white/95 text-rose-900 border border-rose-200/80 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
            <Gift className="w-2.5 h-2.5 text-rose-500" />
            COMBO
          </span>

          {savings && (
            <span className="bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> SAVE {formatPrice(convertPrice(savings))}
            </span>
          )}
        </div>

        {/* Pairing Highlight Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-md border border-rose-200/70 text-rose-950 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1 max-w-[85%]">
          <Sparkles className="w-2.5 h-2.5 text-rose-600 shrink-0" />
          <span className="truncate">Double Celebration Set</span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Add to wishlist"
          className={cn(
            "absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-xs transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95",
            isHeartPounding && "scale-125"
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              isInWishlist ? "fill-rose-500 stroke-rose-500" : "stroke-slate-600 hover:stroke-rose-500"
            )}
          />
        </button>

        {/* Product Image */}
        <ProtectedImage
          src={getImageUrl(imageSrc) || "/placeholder.svg"}
          alt={combo.name || combo.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />

        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100 animate-pulse" />
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 xs:p-3.5 sm:p-4 flex flex-col justify-between flex-1 bg-white">
        <div className="space-y-1.5 flex flex-col">
          {/* Tagline */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 tracking-wide line-clamp-1">
            <Sparkles className="w-2.5 h-2.5 text-rose-500 shrink-0" />
            <span className="truncate">{tagline}</span>
          </div>

          {/* Title - Consistent 2-line height */}
          <p className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] leading-snug group-hover:text-rose-700 transition-colors">
            {combo.name || combo.title}
          </p>

          {/* Combo Items Included Pills - Fixed height row */}
          <div className="flex flex-wrap gap-1.5 pt-0.5 min-h-[1.75rem] items-center">
            {comboProducts.slice(0, 2).map((item: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold bg-rose-50/90 text-rose-900 border border-rose-200/70 px-2 py-0.5 rounded-md truncate max-w-[150px]"
                title={item.name}
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                <span className="truncate">{formatComboComponentName(item.name, item.type)}</span>
              </span>
            ))}
          </div>

          {/* Micro Trust Strip (Rating & Delivery) */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex items-center text-amber-500 bg-amber-50/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
              <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
              <span>{(combo.rating || 4.9).toFixed(1)}</span>
              <span className="text-slate-400 font-normal ml-1">({combo.reviewCount || 24})</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              ⚡ Same Day Handover
            </span>
          </div>
        </div>

        {/* Pricing & CTA - Bottom Section */}
        <div className="pt-2.5 mt-auto border-t border-rose-100/80 space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                {formatPrice(convertPrice(price))}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  {formatPrice(convertPrice(comparePrice))}
                </span>
              )}
            </div>

            {savings ? (
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                Save {formatPrice(convertPrice(savings))}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-medium">Combo Price</span>
            )}
          </div>

          {/* Luxury Full-Width Action Button (Never overlaps or clips) */}
          <Button
            size="sm"
            className="w-full h-8 xs:h-9 text-xs font-bold rounded-xl transition-all duration-300 gap-1.5 shadow-xs shrink-0 bg-gradient-to-r from-rose-600 via-rose-700 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white hover:shadow-md group/btn"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>View Combo Set</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CakeComboCard;
