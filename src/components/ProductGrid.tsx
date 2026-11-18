import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ComboItem } from "@/services/productService";
import {
  EditorialProductCard,
  EditorialProductCardSkeleton,
} from "./EditorialProductCard";

export type Product = {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  price: number;
  costPrice?: number;
  discount: number;
  discountType?: "percentage" | "direct" | string;
  discountPrice?: number;
  images: string[];
  image?: string;
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
  reviewCount?: number;
  sameDay?: boolean;
  stock?: number;
  countInStock?: number;
  isAvailable?: boolean;
  isOutOfStock?: boolean;
  customizationOptions?: {
    allowPhotoUpload: boolean;
    allowNumberInput: boolean;
    numberInputLabel: string;
    allowMessageCard: boolean;
    messageCardPrice: number;
    addons: {
      flowers: Array<{ name: string; price: number; type: "flower" }>;
      chocolates: Array<{ name: string; price: number; type: "chocolate" }>;
    };
    previewImage: string;
  };
  comboItems?: ComboItem[];
  comboName?: string;
  comboDescription?: string;
  videos?: any[];
  priceVariants?: any[];
  comparePrice?: number;
  cakeAttributes?: any;
  plantAttributes?: any;
  chocolateAttributes?: any;
  hamperAttributes?: any;
  comboAttributes?: any;
  isBestseller?: boolean;
  valentineBadge?: string;
  slug?: string;
};

type ProductGridProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
  className?: string;
  loading?: boolean;
  onAddToCart?: (item: any, quantity: number) => boolean;
  horizontal?: boolean;
  shopView?: boolean;
};

const ProductGrid = ({
  products,
  title,
  subtitle,
  className,
  loading,
  onAddToCart,
  horizontal,
  shopView = false,
}: ProductGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const visibleProducts =
    user?.role === "admin"
      ? products
      : products.filter((product) => !product.hidden);

  const scrollBy = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = Math.max(200, Math.floor(container.offsetWidth * 0.8));
    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      className={cn(
        "py-6 sm:py-10 lg:py-14 px-3 sm:px-4 md:px-6 lg:px-8",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="text-center mb-5 sm:mb-8 lg:mb-10">
          {title && (
            <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-2 text-[#1E1B18]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[#6F665E] max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-2">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className={idx >= 4 ? "hidden md:block" : ""}>
              <EditorialProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="text-center py-10 sm:py-14">
          <div className="text-3xl sm:text-4xl mb-3">🌸</div>
          <p className="text-[#6F665E] text-sm sm:text-base">
            No products available at the moment.
          </p>
        </div>
      ) : horizontal ? (
        <div className="relative">
          {visibleProducts.length > 2 && (
            <button
              type="button"
              aria-label="Scroll left"
              className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full border border-[#EDE5DD] bg-white/95 text-[#3C342E] shadow-md transition-all hover:border-[#BE185D] hover:text-[#BE185D]"
              onClick={() => scrollBy("left")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 no-scrollbar scroll-smooth snap-x snap-mandatory items-stretch"
          >
            {visibleProducts.map((product, index) => (
              <div
                className="w-[172px] min-[400px]:w-[192px] sm:w-[235px] md:w-[255px] flex-shrink-0 snap-start flex flex-col"
                key={`${product._id || product.id}-${index}`}
              >
                <EditorialProductCard
                  product={product}
                  index={index}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>

          {visibleProducts.length > 2 && (
            <button
              type="button"
              aria-label="Scroll right"
              className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full border border-[#EDE5DD] bg-white/95 text-[#3C342E] shadow-md transition-all hover:border-[#BE185D] hover:text-[#BE185D]"
              onClick={() => scrollBy("right")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 items-stretch",
            shopView
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6",
            className
          )}
        >
          {visibleProducts.map((product, index) => (
            <EditorialProductCard
              key={product._id || product.id || index}
              product={product}
              index={index}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// Unified ProductCard export — delegates to SBFlorist's global EditorialProductCard
export const ProductCard = ({
  product,
  onAddToCart,
  linkPrefix,
  className,
}: {
  product: Product;
  onAddToCart?: (item: any, quantity: number) => boolean;
  linkPrefix?: string;
  className?: string;
}) => {
  return (
    <EditorialProductCard
      product={product}
      onAddToCart={onAddToCart}
      linkPrefix={linkPrefix}
      className={className}
    />
  );
};

export default ProductGrid;
