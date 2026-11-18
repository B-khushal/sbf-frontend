import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/contexts/CurrencyContext";
import ProtectedImage from "@/components/ui/ProtectedImage";
import { getImageUrl } from "@/config";
import { promptLoginForAddToCart } from "@/utils/cartAuthHelper";

interface WishlistItem {
  id: string;
  title: string;
  image: string;
  price: number;
}

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { items, isLoading, loadWishlist, removeItem } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();
  const { formatPrice, convertPrice } = useCurrency();

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const handleManualRefresh = async () => {
    try {
      await loadWishlist();
    } catch {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh wishlist",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (id: string) => {
    try {
      await removeItem(id);
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    try {
      if (!item.id || !item.title || typeof item.price !== "number") {
        toast({
          title: "Error",
          description: "Invalid item data",
          variant: "destructive",
        });
        return;
      }

      const cartItem = {
        _id: item.id,
        id: item.id,
        productId: item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.price,
        image: item.image,
        quantity: 1,
        category: "",
        discount: 0,
        images: [item.image],
        description: "",
        details: [],
        careInstructions: [],
        isNewArrival: false,
        isFeatured: false,
      };

      if (!user) {
        promptLoginForAddToCart(navigate, cartItem, "/wishlist");
        return;
      }

      await addToCart(cartItem);
      await removeItem(item.id);
      toast({
        title: "Added to Cart",
        description: `${item.title} has been moved to your cart`,
      });
      navigate("/cart");
    } catch {
      toast({
        title: "Error",
        description: "Failed to move item to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B18] overflow-x-clip">
      <div className="mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-16">
        {/* Header Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(30,27,24,0.03)]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BE185D]">
              Saved Collection
            </span>
            <h1 className="mt-1 font-['Playfair_Display'] text-2xl sm:text-3xl font-semibold text-[#1E1B18]">
              Your Wishlist
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#7A7168]">
              {items.length} {items.length === 1 ? "item" : "items"} saved for special moments
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="h-10 rounded-xl border-[#E5DDD5] bg-[#FAF8F5] px-4 text-xs sm:text-sm font-semibold text-[#3C342E] hover:border-[#E2B8C6] hover:bg-[#FFF7F9] hover:text-[#BE185D] self-start sm:self-auto"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && items.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-[#EDE5DD] bg-white animate-pulse"
              >
                <div className="aspect-[4/5] bg-[#EFE9E2]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[#EFE9E2]" />
                  <div className="h-4 w-1/3 rounded bg-[#EFE9E2]" />
                  <div className="h-9 w-full rounded-xl bg-[#F5E1E8]" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="mx-auto max-w-lg rounded-3xl border border-[#EDE5DD] bg-white p-8 sm:p-12 text-center shadow-[0_6px_28px_rgba(30,27,24,0.04)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F5] text-[#BE185D]">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1E1B18]">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-sm text-[#7A7168]">
              Tap the heart icon on any bouquet, cake, or floral hamper to save it here for later.
            </p>
            <Button
              onClick={() => navigate("/shop")}
              className="mt-6 h-11 rounded-xl bg-[#BE185D] px-7 text-sm font-semibold text-white hover:bg-[#9D174D]"
            >
              Browse Collections
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Responsive 2-col Mobile -> 3-col Tablet -> 4-col Desktop Grid */
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 items-stretch">
              {items.map((item) => {
                const imgSrc = item.image?.startsWith("/")
                  ? item.image
                  : getImageUrl(item.image || "/placeholder.svg", {
                      width: 500,
                      height: 625,
                      crop: "fill",
                    });

                return (
                  <article
                    key={item.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#EDE5DD] bg-white shadow-[0_2px_10px_rgba(30,27,24,0.03)] transition-all hover:border-[#E2B8C6] hover:shadow-[0_12px_28px_-10px_rgba(190,24,93,0.12)]"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F0EA]">
                      <Link to={`/product/${item.id}`} className="block h-full w-full">
                        <ProtectedImage
                          src={imgSrc}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label={`Remove ${item.title} from wishlist`}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-rose-600 shadow-xs backdrop-blur-sm transition-colors hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-2.5 p-2.5 sm:p-3.5 min-w-0">
                      <div className="space-y-1">
                        <h3 className="text-[13px] sm:text-sm font-medium leading-snug text-[#1E1B18] line-clamp-2 min-h-[2.6em] break-words">
                          <Link
                            to={`/product/${item.id}`}
                            className="hover:text-[#BE185D] transition-colors"
                          >
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-sm sm:text-base font-bold text-[#1E1B18] tabular-nums">
                          {formatPrice(convertPrice(Number(item.price || 0)))}
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={() => moveToCart(item)}
                        className="h-9 w-full rounded-xl bg-[#BE185D] px-3 text-xs font-semibold text-white hover:bg-[#9D174D]"
                      >
                        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                        Move to Cart
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/shop")}
                className="h-11 rounded-xl border-[#E2B8C6] bg-white px-6 text-sm font-semibold text-[#BE185D] hover:bg-[#FFF7F9]"
              >
                Continue Shopping
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
