import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, Sparkles, Gift, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import useWishlist from "@/hooks/use-wishlist";
import { getImageUrl } from "@/config";
import ProtectedImage from "../ui/ProtectedImage";

export interface CakeComboCardProps {
  combo: any;
  className?: string;
}

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

  const tagline = combo.details?.tagline || "Perfect for Birthdays & Anniversaries";
  const imageSrc = (Array.isArray(combo.images) && combo.images[0]) || combo.image || "/placeholder.svg";

  // Combo item pills/breakdown
  const comboProducts = combo.comboAttributes?.comboProducts || [
    { name: "Artisan Cake", type: "cake" },
    { name: "Fresh Flowers", type: "bouquet" }
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
        "group relative bg-gradient-to-b from-white via-rose-50/20 to-amber-50/30 rounded-3xl border border-rose-200/60 hover:border-rose-300 overflow-hidden shadow-[0_6px_24px_rgba(244,63,94,0.06)] hover:shadow-[0_16px_36px_rgba(244,63,94,0.12)] transition-all duration-300 cursor-pointer flex flex-col h-full justify-between",
        className
      )}
    >
      {/* Luxury Top Header Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-rose-200/80 px-2.5 py-1 rounded-full shadow-xs">
        <Gift className="w-3.5 h-3.5 text-rose-500" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-900">
          Celebration Combo
        </span>
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        aria-label="Add to wishlist"
        className={cn(
          "absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95",
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

      {/* Image Section */}
      <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-slate-100 flex-shrink-0">
        <ProtectedImage
          src={getImageUrl(imageSrc) || "/placeholder.svg"}
          alt={combo.name || combo.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />

        {savings && (
          <div className="absolute bottom-3 left-3 z-20 bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> SAVE {formatPrice(convertPrice(savings))}
          </div>
        )}

        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-amber-50 animate-pulse" />
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white/80">
        <div className="space-y-2">
          {/* Tagline */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 tracking-wide">
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>{tagline}</span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-rose-700 transition-colors">
            {combo.name || combo.title}
          </h3>

          {/* Combo Items Included Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {comboProducts.slice(0, 3).map((item: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-50/80 text-rose-900 border border-rose-200/60 px-2 py-0.5 rounded-md"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-rose-500" />
                {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 mt-auto border-t border-rose-100/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Combo Price
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {formatPrice(convertPrice(price))}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(convertPrice(comparePrice))}
                </span>
              )}
            </div>
          </div>

          <Button
            size="sm"
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-xs px-3.5 py-2 gap-1 group/btn shrink-0"
          >
            <span>VIEW COMBO</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CakeComboCard;
