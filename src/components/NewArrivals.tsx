import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, ShoppingBag, Star, ArrowRight, Sparkles, Wand2, ChevronLeft, ChevronRight, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { getImageUrl } from "@/config";
import { QuickViewModal } from "./ui/QuickViewModal";
import ProtectedImage from "./ui/ProtectedImage";

import { Product } from "./ProductGrid";

type NewArrivalsProps = {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (item: any, quantity: number) => boolean;
};

type FilterTab = {
  id: string;
  label: string;
};

const FILTER_TABS: FilterTab[] = [
  { id: "all", label: "All Arrivals" },
  { id: "roses", label: "Roses" },
  { id: "luxury", label: "Luxury Bouquets" },
  { id: "romantic", label: "Romantic" },
  { id: "anniversary", label: "Anniversary" },
  { id: "bestsellers", label: "Best Sellers" },
];

export const NewArrivals = ({ products, loading, onAddToCart }: NewArrivalsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState("all");
  const [isHovered, setIsHovered] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Drag-to-scroll refs
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragDistance = useRef(0);

  // Viewport intersection observer for entrance animation
  const [sectionRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  // Filter products locally based on category or tags
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    // Filter out hidden products for non-admin users
    const visible = user?.role === 'admin'
      ? products
      : products.filter(product => !product.hidden);

    if (activeTab === "all") return visible;

    return visible.filter(product => {
      const title = product.title.toLowerCase();
      const desc = (product.description || "").toLowerCase();
      const category = (product.category || "").toLowerCase();
      const categories = (product.categories || []).map(c => c.toLowerCase());

      switch (activeTab) {
        case "roses":
          return category.includes("rose") || title.includes("rose") || categories.includes("roses") || categories.includes("rose");
        case "luxury":
          return category.includes("luxury") || title.includes("luxury") || desc.includes("luxury") || category.includes("bouquet") || title.includes("bouquet");
        case "romantic":
          return category.includes("romantic") || title.includes("romantic") || desc.includes("romantic") || title.includes("love") || category.includes("love") || category.includes("romance");
        case "anniversary":
          return category.includes("anniversary") || title.includes("anniversary") || desc.includes("anniversary");
        case "bestsellers":
          return product.featured || product.isFeatured || (product.rating && product.rating >= 4.5);
        default:
          return true;
      }
    });
  }, [products, activeTab, user]);

  // Handle horizontal mouse dragging to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;

    isDragging.current = true;
    dragDistance.current = 0;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeft.current = container.scrollLeft;
    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walkX = x - startX.current;
    
    // Track cumulative drag distance to distinguish drag from simple click
    dragDistance.current += Math.abs(e.movementX);
    container.scrollLeft = scrollLeft.current - walkX * 1.5;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    const container = scrollRef.current;
    if (!container) return;

    container.style.cursor = "grab";
    container.style.removeProperty("user-select");
  };

  // Convert vertical scroll to horizontal scroll when hovering
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 0.8;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Simple scroll buttons
  const scrollByAmount = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const offsetWidth = container.offsetWidth;
    const scrollAmount = direction === "left" ? -offsetWidth * 0.75 : offsetWidth * 0.75;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Trigger quick view
  const handleOpenQuickView = (product: Product) => {
    setActiveProduct(product);
    setIsQuickViewOpen(true);
  };

  // Framer Motion variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={sectionVariants}
      className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-[#fffbfd] via-[#fdf6f9] to-[#fffbfd]"
    >
      {/* Cinematic soft floral blur glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-pink-200/10 blur-[130px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] md:w-[700px] h-[400px] md:h-[700px] rounded-full bg-purple-200/10 blur-[150px] animate-pulse" style={{ animationDuration: "16s", animationDelay: "2s" }} />
        <div className="absolute top-12 left-10 w-2.5 h-2.5 bg-[#FFB6C1]/40 rounded-full animate-float pointer-events-none" />
        <div className="absolute bottom-24 right-20 w-3 h-3 bg-[#E91E63]/10 rounded-full animate-float pointer-events-none" style={{ animationDelay: "2.5s" }} />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#db2777]/20 rounded-full animate-float pointer-events-none" style={{ animationDelay: "5s" }} />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Intro Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div variants={itemVariants} className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 border border-pink-100/60 px-4 py-1.5 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-[#b53d69] uppercase mb-4 shadow-[0_2px_10px_rgba(244,114,182,0.05)]">
              <Flower2 className="h-3 w-3 animate-spin-slow text-[#b53d69]" />
              Freshly Curated Floral Arrivals
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 font-sans leading-tight">
              The Autumn <span className="bg-gradient-to-r from-[#b53d69] via-rose-500 to-amber-500 bg-clip-text text-transparent italic font-serif font-normal">New Arrivals</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-xl font-normal leading-relaxed">
              Experience stunning floral artistry handpicked daily. Explore bespoke seasonal collections crafted to inspire and elevate.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/shop")}
              className="group h-11 px-5 rounded-full border-gray-200/80 bg-white/70 backdrop-blur-sm hover:bg-black hover:text-white transition-all duration-300 font-medium text-xs sm:text-sm tracking-wide gap-2 shadow-sm"
            >
              View Collection
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scrollByAmount("left")}
                className="w-11 h-11 rounded-full border border-gray-200/80 bg-white/70 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollByAmount("right")}
                className="w-11 h-11 rounded-full border border-gray-200/80 bg-white/70 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Category Tabs / Quick Filters */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth"
        >
          <div className="flex gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-pink-100/30 shadow-sm mx-auto sm:mx-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-[#b53d69] text-white shadow-[0_4px_14px_rgba(181,61,105,0.25)] scale-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Showcase Body */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-white/60 border border-white/40 rounded-3xl p-4 aspect-[4/5] flex flex-col justify-between animate-pulse shadow-sm",
                  i % 2 === 1 && "md:translate-y-8"
                )}
              >
                <div className="w-full h-[65%] bg-gray-200/60 rounded-2xl" />
                <div className="space-y-3 mt-4 flex-1 flex flex-col justify-end">
                  <div className="w-3/4 h-4 bg-gray-200/60 rounded" />
                  <div className="w-1/2 h-3 bg-gray-200/60 rounded" />
                  <div className="w-full h-8 bg-gray-200/60 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-pink-100/30">
            <span className="text-4xl block mb-3">🌸</span>
            <p className="text-gray-500 font-medium">No fresh arrivals match this collection.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={() => {
                handleMouseUpOrLeave();
                setIsHovered(false);
              }}
              onMouseEnter={() => setIsHovered(true)}
              className="flex gap-6 overflow-x-auto pt-6 pb-20 no-scrollbar scroll-smooth snap-x snap-mandatory cursor-grab"
              style={{
                scrollBehavior: "smooth",
              }}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "min-w-[280px] xs:min-w-[320px] md:min-w-[360px] max-w-[380px] flex-shrink-0 snap-start",
                      idx % 2 === 1 && "md:translate-y-10" // Staggered cards layout
                    )}
                  >
                    <LuxuryProductCard
                      product={product}
                      dragDistance={dragDistance}
                      onAddToCart={onAddToCart}
                      onOpenQuickView={handleOpenQuickView}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Subtle premium visual layout decorations */}
            <div className="absolute left-0 right-0 bottom-4 h-[1px] bg-gradient-to-r from-transparent via-pink-200/60 to-transparent pointer-events-none" />
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      {activeProduct && (
        <QuickViewModal
          product={activeProduct}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          onAddToCart={onAddToCart}
        />
      )}
    </motion.section>
  );
};

// Sub-Component: LuxuryProductCard
const LuxuryProductCard = ({
  product,
  dragDistance,
  onAddToCart,
  onOpenQuickView,
}: {
  product: Product;
  dragDistance: React.MutableRefObject<number>;
  onAddToCart?: (item: any, quantity: number) => boolean;
  onOpenQuickView: (product: Product) => void;
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHeartPounding, setIsHeartPounding] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

  const isInWishlist = wishlistItems.some((item) => item.id === product._id);

  // Spotlight light reflection tracking
  const handleSpotlightMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Navigates to product detail page if clicking without dragging
  const handleCardClick = (e: React.MouseEvent) => {
    if (dragDistance.current > 15) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    window.open(`/product/${product._id}`, "_blank", "noopener,noreferrer");
  };

  // Quick add handler
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login first to add items to your cart", {
        description: "You'll be redirected to the login page",
        duration: 3000,
      });
      setTimeout(() => {
        navigate("/login", {
          state: {
            redirect: window.location.pathname,
            message: "Please login to add items to your cart",
          },
        });
      }, 1500);
      return;
    }

    try {
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
      toast.success("🛒 Added to cart!", {
        description: `${product.title} has been added to your cart`,
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/cart");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item to cart");
    }
  };

  // Wishlist toggle handler
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login first to manage wishlist", {
        description: "You'll be redirected to the login page",
        duration: 3000,
      });
      setTimeout(() => {
        navigate("/login", {
          state: {
            redirect: window.location.pathname,
            message: "Please login to manage your wishlist",
          },
        });
      }, 1500);
      return;
    }

    setIsHeartPounding(true);
    setTimeout(() => setIsHeartPounding(false), 500);

    try {
      const wishlistItem = {
        id: String(product._id),
        title: product.title,
        image: product.images?.[0] || "/images/placeholder.svg",
        price: product.price,
      };

      if (isInWishlist) {
        await removeFromWishlist(String(product._id));
      } else {
        await addToWishlist(wishlistItem);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update wishlist");
    }
  };

  // Badges state
  const badges = useMemo(() => {
    const items = [];
    if (product.discount > 0) {
      items.push({ text: `-${product.discount}%`, type: "discount" });
    }
    if (product.featured || product.isFeatured) {
      items.push({ text: "Featured", type: "featured" });
    }
    if (product.isNewArrival || product.isNew) {
      items.push({ text: "New", type: "new" });
    }
    if (product.sameDay !== false) {
      items.push({ text: "⚡ Same Day", type: "sameday" });
    }
    return items;
  }, [product]);

  return (
    <div
      onClick={handleCardClick}
      onMouseMove={handleSpotlightMove}
      className={cn(
        "group relative flex flex-col justify-between h-[480px] md:h-[530px] w-full bg-white/60 backdrop-blur-md border border-white/30 hover:border-pink-250/50 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_50px_rgba(251,113,133,0.12)] transition-all duration-700 ease-out cursor-pointer overflow-hidden z-20 hover:-translate-y-2",
        product.hidden && "opacity-70 border-dashed border-orange-300"
      )}
    >
      {/* Dynamic spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(251, 113, 133, 0.07), transparent 75%)`,
        }}
      />

      {/* Card Visual Content - Dominating the card */}
      <div className="relative h-[66%] w-full overflow-hidden bg-gray-50 flex-shrink-0">
        
        {/* Wishlist Button (reveal on hover/always responsive) */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/85 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out sm:opacity-0 sm:translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0 active:scale-90",
            isHeartPounding && "scale-125",
            isInWishlist && "opacity-100 translate-y-0 bg-white"
          )}
        >
          <Heart
            className={cn(
              "h-4.5 w-4.5 transition-colors duration-300",
              isInWishlist ? "fill-red-500 stroke-red-500" : "stroke-gray-600 hover:stroke-red-500"
            )}
          />
        </button>

        {/* Minimal Badges Bar */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 max-w-[70%]">
          {badges.map((badge, i) => (
            <span
              key={i}
              className={cn(
                "text-[8px] sm:text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full border shadow-sm",
                badge.type === "discount" && "bg-red-50/90 text-red-650 border-red-100/60",
                badge.type === "featured" && "bg-amber-50/90 text-amber-600 border-amber-100/60",
                badge.type === "new" && "bg-emerald-50/90 text-emerald-700 border-emerald-100/60",
                badge.type === "sameday" && "bg-sky-50/90 text-sky-700 border-sky-100/60"
              )}
            >
              {badge.text}
            </span>
          ))}
        </div>

        {/* Quick View Trigger Hover Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-10">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="bg-white/95 text-gray-800 border-0 shadow-md hover:bg-black hover:text-white transition-all duration-300 translate-y-3 group-hover:translate-y-0 text-xs font-semibold rounded-full px-5 py-2.5"
          >
            Quick View
          </Button>
        </div>

        {/* Default Product Image */}
        <ProtectedImage
          src={getImageUrl(product.images[0]) || "/images/placeholder.svg"}
          alt={product.title}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out-expo group-hover:scale-105",
            product.images.length > 1 && "group-hover:opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />

        {/* Hover Product Image */}
        {product.images.length > 1 && (
          <ProtectedImage
            src={getImageUrl(product.images[1])}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-[1000ms] ease-out-expo opacity-0 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Shimmer Placeholder */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
        )}
      </div>

      {/* Card Information - Clean typography layout */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-white/40">
        <div className="space-y-2">
          {/* Rating */}
          {product.rating ? (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
              <div className="flex items-center text-amber-500">
                <Star size={11} className="fill-current text-amber-500 mr-0.5" />
                <span className="text-gray-700 font-bold">{(product.rating).toFixed(1)}</span>
              </div>
              {product.numReviews ? <span className="text-gray-300">({product.numReviews})</span> : null}
            </div>
          ) : (
            <div className="h-4" />
          )}

          {/* Title */}
          <h3 className="font-medium text-sm md:text-base text-gray-800 leading-snug line-clamp-2 transition-colors duration-300 group-hover:text-[#b53d69]">
            {product.title}
          </h3>
        </div>

        <div className="mt-4 space-y-3.5">
          {/* Price & Discount */}
          <div className="flex items-baseline gap-2">
            {product.discount > 0 ? (
              <>
                <span className="text-base sm:text-lg font-extrabold text-red-600">
                  {formatPrice(convertPrice(product.price * (1 - product.discount / 100)))}
                </span>
                <span className="text-xs text-gray-400 line-through font-normal">
                  {formatPrice(convertPrice(product.price))}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg font-bold text-gray-900">
                {formatPrice(convertPrice(product.price))}
              </span>
            )}
          </div>

          {/* Action Button: Customizable or Quick Add */}
          {product.isCustomizable ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/product/${product._id}?customize=true`);
              }}
              className="w-full h-10 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-[#b53d69] hover:from-purple-650 hover:to-[#9f2d57] text-white border-0 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 hover:shadow-md"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Customize Choice
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickAdd}
              className="w-full h-10 text-xs font-semibold rounded-xl border border-[#b53d69]/30 bg-transparent text-[#b53d69] hover:bg-gradient-to-r hover:from-[#b53d69] hover:to-rose-500 hover:text-white hover:border-0 shadow-sm transition-all duration-500 flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Quick Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
