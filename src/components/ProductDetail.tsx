import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Minus, Plus, ChevronLeft, ChevronRight, Star, Eye, ShoppingBag, Wand2, Gift, ClipboardList, Leaf, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import { getImageUrl, getProductImageUrl } from '@/config';
import ContactModal from '@/components/ui/ContactModal';
import { InlineProductCustomizer } from '@/components/ui/InlineProductCustomizer';
import useCart from '@/hooks/use-cart';
import useWishlist from '@/hooks/use-wishlist';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import productService, { ProductData, ComboItem } from '@/services/productService';
import ProductReviews from '@/components/ProductReviews';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useNavigate, useSearchParams } from "react-router-dom";

type AddonOption = {
  name: string;
  price: number;
  type: 'flower' | 'chocolate';
  image?: string;
};

type CustomizationOptions = {
  allowPhotoUpload: boolean;
  allowNumberInput: boolean;
  numberInputLabel: string;
  allowMessageCard: boolean;
  messageCardPrice: number;
  addons: {
    flowers: AddonOption[];
    chocolates: AddonOption[];
  };
  previewImage: string;
  allowVariants?: boolean;
  variants?: { name: string; price: number }[];
  variantLabel?: string;
  useSameFlowerImage?: boolean;
  flowerGroupImage?: string;
  useSameChocolateImage?: boolean;
  chocolateGroupImage?: string;
};

type CustomizationData = {
  photo?: string;
  number?: string;
  messageCard?: string;
  selectedFlowers: AddonOption[];
  selectedChocolates: AddonOption[];
};

type PriceVariant = {
  label: string;
  price: number;
  stock: number;
};

type ProductDetailProps = {
  product: ProductData & {
    _id: string;
    countInStock: number;
  };
  onAddToCart: (item: {
    id: string;
    productId: string;
    title: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
    selectedVariant?: PriceVariant;
    customizations?: CustomizationData;
  }) => void;
  onReviewSubmit: () => void;
};

// Recommended Products Component
const RecommendedProducts: React.FC<{ productId: string; category: string }> = ({ productId, category }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, convertPrice } = useCurrency();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);
        const products = await productService.getRecommendedProducts(productId, category, 6);
        setRecommendedProducts(products);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [productId, category]);

  // Cinematic slow panning auto-scroll effect (pauses on hover)
  useEffect(() => {
    if (!isAutoScrolling || loading || !recommendedProducts.length) return;
    
    const container = scrollRef.current;
    if (!container) return;

    let animId: number;
    let lastTime = 0;
    const speed = 25; // Pixels per second

    const step = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (container) {
        container.scrollLeft += speed * delta;
        // Loop back to start if reached the end
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 2) {
          container.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isAutoScrolling, loading, recommendedProducts.length]);

  const handleScrollClick = (direction: 'left' | 'right') => {
    setIsAutoScrolling(false); // Stop auto-scroll on click interaction
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      const target = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  const handleProductClick = (product: ProductData) => {
    window.open(`/product/${product._id}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-900">
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-400 block text-center mb-2">Curations</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-slate-900 dark:text-slate-100 mb-8">You May Also Love</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="bg-slate-100 dark:bg-slate-900 aspect-[4/5] rounded-2xl"></div>
              <div className="h-3.5 bg-slate-100 dark:bg-slate-900 rounded-lg w-3/4"></div>
              <div className="h-3.5 bg-slate-100 dark:bg-slate-900 rounded-lg w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendedProducts.length) {
    return null;
  }

  return (
    <div className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-900/60 relative">
      
      {/* Header Branding */}
      <span className="text-[10px] uppercase font-extrabold tracking-[0.25em] text-slate-400 dark:text-slate-500 block text-center mb-2">Curated Arrangements</span>
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-slate-900 dark:text-slate-100 mb-10">
        You May Also Love
      </h2>

      {/* Manual Scroll Controls */}
      <div className="absolute top-10 right-4 flex gap-2">
        <button
          onClick={() => handleScrollClick('left')}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-350 hover:bg-slate-50 shadow-sm transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => handleScrollClick('right')}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-350 hover:bg-slate-50 shadow-sm transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Cinematic Horizontal Scroll wrapper */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4 py-8 -mx-4"
      >
        {recommendedProducts.map((recProd, index) => {
          const discountedPrice = recProd.discount
            ? recProd.price * (1 - recProd.discount / 100)
            : recProd.price;

          // Asymmetric Staggered layout offsets
          const staggerClass = index % 2 === 0 ? "translate-y-0" : "translate-y-3 md:translate-y-6";

          return (
            <div
              key={recProd._id}
              onClick={() => handleProductClick(recProd)}
              className={cn(
                "w-[230px] flex-shrink-0 snap-start group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer select-none",
                staggerClass
              )}
            >
              {/* Product Image Frame */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-900">
                {recProd.discount > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[9px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-md shadow-sm">
                    -{recProd.discount}%
                  </div>
                )}
                {(recProd.isNewArrival || (recProd as { isNew?: boolean }).isNew) && (
                  <div className="absolute top-3 right-3 z-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-md shadow-sm">
                    NEW
                  </div>
                )}
                <img
                  src={getImageUrl(recProd.images[0]) || '/images/placeholder.svg'}
                  alt={recProd.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/10 transition-colors duration-500" />
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-1.5">
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  {recProd.category || 'bouquet'}
                </span>
                <h3 className="font-extrabold text-xs text-slate-850 dark:text-slate-200 line-clamp-2 group-hover:text-primary transition-colors leading-relaxed">
                  {recProd.title}
                </h3>

                {/* Price layout */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatPrice(convertPrice(discountedPrice))}
                  </span>
                  {recProd.discount > 0 && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(convertPrice(recProd.price))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getComboMaxPrice = (product: typeof product) => {
  if (product.category !== 'combos' || !product.comboItems) return product.price;
  let total = product.price;
  product.comboItems.forEach(item => {
    if (item.customizationOptions && item.customizationOptions.allowVariants && item.customizationOptions.variants && item.customizationOptions.variants.length > 0) {
      // Use the max variant price
      const maxVariant = item.customizationOptions.variants.reduce((max, v) => v.price > max ? v.price : max, 0);
      total += maxVariant;
    } else {
      total += item.price;
    }
  });
  return total;
};

const ProductDetail = ({ product, onAddToCart, onReviewSubmit }: ProductDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<PriceVariant | null>(
    product.hasPriceVariants && product.priceVariants?.length ? product.priceVariants[0] : null
  );
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCustomizerExpanded, setIsCustomizerExpanded] = useState(false);
  const [customizations, setCustomizations] = useState<CustomizationData | undefined>();
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redesign Luxury Interaction States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const { currentTarget, clientX, clientY } = e;

  const rect = currentTarget.getBoundingClientRect();

  const x = (clientX - rect.left) / rect.width - 0.5;
  const y = (clientY - rect.top) / rect.height - 0.5;

  setMousePos({ x, y });
};


  // Scroll handler to toggle sticky bottom checkout bar
  useEffect(() => {
    const handleScroll = () => {
      const ctaSection = document.getElementById('main-cta-section');
      if (ctaSection) {
        const rect = ctaSection.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset image loading status when selected image changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [selectedImage]);

  // Check for customize parameter and expand inline customizer if present
  useEffect(() => {
    const shouldCustomize = searchParams.get('customize') === 'true';
    if (shouldCustomize && product.isCustomizable) {
      // Small delay to ensure the page is fully loaded
      setTimeout(() => {
        setIsCustomizerExpanded(true);
        document.getElementById('customize-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
    }
  }, [searchParams, product.isCustomizable]);

  const handleVariantChange = (itemIdx: number, variantName: string) => {
    setSelectedVariants(prev => {
      const updated = [...prev];
      updated[itemIdx] = variantName;
      return updated;
    });
  };
  const comboTotalPrice = React.useMemo(() => {
    if (product.category !== 'combos' || !product.comboItems) return product.price;
    let total = product.price;
    product.comboItems.forEach((item, idx) => {
      const variant = item.customizationOptions && item.customizationOptions.allowVariants && item.customizationOptions.variants
        ? item.customizationOptions.variants.find(v => v.name === selectedVariants[idx])
        : null;
      total += variant ? variant.price : item.price;
    });
    return total;
  }, [product, selectedVariants]);

  // Debug log to check properties
  console.log(`Product Detail ${product.title}:`, {
    isNewArrival: product.isNewArrival,
    isFeatured: product.isFeatured,
    discount: product.discount
  });

  // Calculate prices in base currency (INR)
  const originalPrice = product.price;
  const currentPrice = React.useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product.price;
  }, [selectedVariant, product.price]);
  const discountedPrice = React.useMemo(() => {
    const basePrice = currentPrice;
    return product.discount ? basePrice * (1 - product.discount / 100) : basePrice;
  }, [currentPrice, product.discount]);

  // Handle image URL using utility function with optimization for product detail view
  const imageUrl = getProductImageUrl(product.images[selectedImage], 800, false);

  // Image Navigation
  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const incrementQuantity = () => {
    if (quantity >= 5) {
      toast({
        title: "Quantity Limit Reached",
        description: "Maximum 5 items allowed per product. Contact us for bulk orders.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => quantity > 1 && setQuantity((prev) => prev - 1);

  const handleCustomize = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (product.hasPriceVariants && !selectedVariant) {
      toast({
        title: "Please select a variant",
        description: "You need to select a size/quantity variant before customizing",
        variant: "destructive",
      });
      return;
    }

    setIsCustomizerExpanded(true);
    setTimeout(() => {
      document.getElementById('customize-section')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const handleVariantSelect = (variant: PriceVariant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = async () => {
    try {
      if (product.hasPriceVariants && !selectedVariant) {
        toast({
          title: "Please select a variant",
          description: "You need to select a size/quantity variant before adding to cart",
          variant: "destructive",
        });
        return;
      }

      // Check stock
      const variantStock = selectedVariant?.stock ?? product.countInStock;
      if (variantStock < quantity) {
        toast({
          title: "Not enough stock",
          description: "The selected quantity is not available",
          variant: "destructive",
        });
        return;
      }

      const cartItem = {
        _id: product._id,
        id: `${product._id}${selectedVariant ? `-${selectedVariant.label}` : ''}`,
        productId: product._id,
        title: product.title,
        price: displayDiscountedPrice,
        originalPrice: displayPrice,
        image: product.images[0],
        images: product.images,
        quantity,
        selectedVariant,
        customizations,
      };

      onAddToCart(cartItem);

      toast({
        title: "Added to Cart",
        description: `${product.title} ${selectedVariant ? `(${selectedVariant.label})` : ''} has been added to your cart successfully`,
      });

      // Redirect to cart page after successful addition
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async () => {
    try {
      // Validate product data
      if (!product._id || !product.title || typeof product.price !== 'number') {
        console.error('Invalid product data for wishlist:', product);
        toast({
          title: "Error",
          description: "Invalid product data",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Use utility function for consistent image URL construction
      const imageUrl = getImageUrl(product.images?.[0], { bustCache: true });

      // Create wishlist item with proper ID
      const wishlistItem = {
        id: String(product._id),
        title: product.title,
        image: imageUrl,
        price: product.price
      };

      console.log("Adding to wishlist from ProductDetail:", wishlistItem);

      // Use the wishlist hook to add item
      await addToWishlist(wishlistItem);

    } catch (error) {
      console.error("Error adding to wishlist:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to wishlist';

      if (errorMessage.includes('log in')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to wishlist",
          variant: "destructive",
          duration: 4000,
        });
      } else if (errorMessage.includes('already in wishlist')) {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.title} - SBF Florist`,
      text: `Check out this beautiful ${product.title} from SBF Florist! ${formatPrice(convertPrice(discountedPrice))}`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Product shared successfully!",
          duration: 3000,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard!",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Final fallback: Copy URL only
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard!",
          duration: 3000,
        });
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
        toast({
          title: "Error",
          description: "Failed to share or copy link",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  // Update price display based on selected variant
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayDiscountedPrice = product.discount
    ? displayPrice - (displayPrice * product.discount) / 100
    : displayPrice;

  // Price Variants Section
  const renderVariantSelection = () => {
    if (!product.hasPriceVariants || !product.priceVariants?.length) return null;

    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Size/Quantity</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {product.priceVariants.map((variant, index) => (
              <motion.div
                key={variant.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md",
                    selectedVariant?.label === variant.label
                      ? "border-2 border-primary bg-primary/5 shadow-sm"
                      : "border border-gray-200 hover:border-primary/50",
                    variant.stock === 0 && "opacity-50"
                  )}
                  onClick={() => variant.stock > 0 && setSelectedVariant(variant)}
                >
                  <motion.div
                    className="p-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900">{variant.label}</h4>
                      <p className="mt-1 text-lg font-semibold text-primary">
                        {formatPrice(convertPrice(variant.price))}
                      </p>
                      {variant.stock > 0 ? (
                        variant.stock <= 5 && (
                          <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-700">
                            Only {variant.stock} left
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="mt-2 bg-red-50 text-red-700">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Variant Selection Notice */}
        {!selectedVariant && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Please select a variant to continue
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="pt-12 sm:pt-16 pb-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-fade-in relative overflow-hidden">
      
      {/* Decorative ambient background lighting */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-bloom-pink-100/20 via-bloom-blue-100/10 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-bloom-green-100/15 via-bloom-blue-100/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT SIDE: Immersive Product Gallery (Span 7 on lg) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* 1. Vertical Thumbnail Strip (Desktop, Span 2) */}
            {product.images.length > 1 && (
              <div className="hidden md:flex md:flex-col gap-3 md:col-span-2 max-h-[500px] overflow-y-auto no-scrollbar pr-1 py-1">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-[4/5] w-full relative overflow-hidden rounded-xl bg-white border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm",
                      selectedImage === index
                        ? "border-slate-800 dark:border-slate-100 shadow-[0_0_15px_rgba(0,0,0,0.06)] ring-2 ring-slate-800/10 dark:ring-slate-100/20 scale-102"
                        : "border-slate-200/60 opacity-60 hover:opacity-100"
                    )}
                  >
                    <img
                      src={getImageUrl(image, { bustCache: false })}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 2. Main Large Cinematic Image (Span 10 on lg/md) */}
            <div className={cn(
              "relative md:col-span-10 group rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 shadow-[0_15px_45px_rgba(0,0,0,0.04)] overflow-hidden",
              product.images.length <= 1 ? "md:col-span-12" : ""
            )}>
              {/* Soft ambient glow behind images */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-bloom-pink-100/20 via-bloom-blue-100/10 to-transparent rounded-[2.5rem] blur-2xl opacity-60 -z-10 group-hover:opacity-80 transition-opacity duration-500" />
              
              <div 
                className="relative pb-[125%] overflow-hidden cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setMousePos({ x: 0, y: 0 });
                }}
                onClick={() => setIsLightboxOpen(true)}
              >
                {/* Image Loading Skeleton */}
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Animated & Swipeable Image Frame */}
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  <motion.img
                    src={imageUrl}
                    alt={product.title}
                    onLoad={() => setIsImageLoading(false)}
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                    style={{
                      transform: isHovered 
                        ? `scale(1.08) translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` 
                        : 'scale(1) translate(0px, 0px)',
                      transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                  
                  {/* Swipe Area for Mobile */}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipeThreshold = 50;
                      if (offset.x < -swipeThreshold) {
                        nextImage();
                      } else if (offset.x > swipeThreshold) {
                        prevImage();
                      }
                    }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing md:hidden"
                  />
                </motion.div>

                {/* Badges for New / Featured */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                  {(product.isNewArrival || (product as { isNew?: boolean }).isNew) && (
                    <span className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-md shadow-sm">
                      New Arrival
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-amber-500/90 text-white text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-md shadow-sm">
                      Featured
                    </span>
                  )}
                </div>

                {product.discount > 0 && (
                  <span className="absolute bottom-4 right-4 bg-rose-600/90 text-white text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-md shadow-sm z-10">
                    -{product.discount}% Off
                  </span>
                )}

                {/* Hover UI overlay hints */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/10 transition-colors pointer-events-none duration-300" />
                <div className="absolute bottom-4 left-4 text-xs font-semibold bg-white/70 backdrop-blur-md text-slate-800 dark:bg-slate-950/70 dark:text-slate-200 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm pointer-events-none">
                  🔍 Hover to inspect • Click to expand
                </div>

                {/* Left/Right controls (Mobile and desktop fallback) */}
                {product.images.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-slate-250 shadow-sm pointer-events-auto hover:bg-white dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-slate-250 shadow-sm pointer-events-auto hover:bg-white dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Horizontal Thumbnail Strip (Mobile, below image) */}
            {product.images.length > 1 && (
              <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar py-2 col-span-1 justify-center px-1">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-12 h-15 relative overflow-hidden rounded-lg bg-white border flex-shrink-0 transition-all duration-300",
                      selectedImage === index
                        ? "border-slate-800 ring-2 ring-slate-800/10 scale-102"
                        : "border-slate-200/80 opacity-60"
                    )}
                  >
                    <img
                      src={getImageUrl(image, { bustCache: false })}
                      alt={`${product.title} visual ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Redesigned Product Info (Span 5 on lg) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Category badge */}
            <div className="space-y-2">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
                {product.category || 'Luxury Gifting'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Ratings & reviews summary inline */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-400 gap-0.5">
                <Star size={16} className="fill-current" />
                <Star size={16} className="fill-current" />
                <Star size={16} className="fill-current" />
                <Star size={16} className="fill-current" />
                <Star size={16} className="fill-current" />
              </div>
              <span className="text-xs text-slate-400 font-medium">Verified by 20+ clients</span>
              <span className="h-3 w-px bg-slate-200" />
              <button 
                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-2"
              >
                Go to reviews
              </button>
            </div>

            {/* Animated Pricing & Discount */}
            <div className="py-4 border-y border-slate-100 dark:border-slate-900">
              <div className="flex items-baseline gap-3">
                {product.category === 'combos' && product.comboItems && product.comboItems.length > 0 ? (
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {formatPrice(convertPrice(getComboMaxPrice(product)))}
                  </span>
                ) : (
                  <>
                    <motion.span 
                      key={displayDiscountedPrice}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
                    >
                      {formatPrice(convertPrice(displayDiscountedPrice))}
                    </motion.span>
                    {product.discount > 0 && (
                      <span className="text-lg text-slate-400 line-through font-medium">
                        {formatPrice(convertPrice(displayPrice))}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {/* Availability Indicator */}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {product.countInStock > 0 ? 'In Stock • Handcrafted & Dispatched Today' : 'Out of Stock • Reserve by Contacting Us'}
                </span>
              </div>
            </div>

            {/* Variant Select Grid (Inline render) */}
            {renderVariantSelection()}

            {/* Quantity Selector + Checkout Actions container */}
            <div id="main-cta-section" className="space-y-4 pt-4">
              
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center h-10 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 shadow-sm max-w-[130px]">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-30 rounded-l-xl"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-800 dark:text-slate-200">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors rounded-r-xl"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {product.isCustomizable ? (
                  <Button
                    type="button"
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white font-bold hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:scale-[1.01] transition-all duration-300 dark:from-white dark:to-slate-100 dark:text-slate-900 border-none"
                    onClick={handleCustomize}
                    disabled={product.hasPriceVariants && !selectedVariant}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Customize Bouquet
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white font-bold hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:scale-[1.01] transition-all duration-300 dark:from-white dark:to-slate-100 dark:text-slate-900 border-none"
                    onClick={handleAddToCart}
                    disabled={product.hasPriceVariants && !selectedVariant}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
                
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  className="h-12 w-12 border border-slate-200 dark:border-slate-800 flex items-center justify-center rounded-xl bg-white dark:bg-slate-950 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-300 text-slate-700 dark:text-slate-350 shadow-sm"
                  title="Add to wishlist"
                >
                  <Heart size={18} className={cn("transition-colors", wishlistItems?.some(i => i.id === String(product._id)) ? "fill-rose-500 text-rose-500" : "")} />
                </button>
                
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-12 w-12 border border-slate-200 dark:border-slate-800 flex items-center justify-center rounded-xl bg-white dark:bg-slate-950 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-300 text-slate-700 dark:text-slate-350 shadow-sm"
                  title="Share product"
                >
                  <Share2 size={18} />
                </button>
              </div>

            </div>

            {/* Luxury Trust Indicators Grid */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/20 text-pink-500 dark:text-pink-400 flex items-center justify-center flex-shrink-0">
                  <Leaf size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">Fresh Blooms</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">100% Freshness Guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Gift size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">Same Day</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Order by 4 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🛡️</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">Secure Checkout</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Encrypted Payments</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💝</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">Handcrafted</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Prepared with Care</p>
                </div>
              </div>
            </div>

            {/* Overhauled Product Details Accordion Section */}
            <Accordion type="multiple" className="w-full space-y-3 pt-4 border-t border-slate-100 dark:border-slate-900" defaultValue={["details"]}>
              
              {/* Detail Accordion */}
              <AccordionItem value="details" className="border-none">
                <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                  <span className="flex items-center gap-2.5">
                    <ClipboardList className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Product Contents
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-600 dark:text-slate-400 space-y-3">
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3.5 rounded-xl border border-amber-100/70 dark:border-amber-950/40">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-500 text-sm flex-shrink-0">📸</span>
                      <p className="text-amber-800 dark:text-amber-400 text-[11px] leading-relaxed font-semibold">
                        The visual displayed serves as a luxury baseline. Minor seasonal variations in flower types or exact foliage might occur based on premium local availability.
                      </p>
                    </div>
                  </div>
                  {product.details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-2.5 py-1 text-slate-700 dark:text-slate-300">
                      <span className="text-primary text-xs mt-0.5 flex-shrink-0">✦</span>
                      <p className="text-[11px] leading-relaxed font-medium">{detail}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* Description Accordion */}
              {product.description && (
                <AccordionItem value="description" className="border-none">
                  <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                    <span className="flex items-center gap-2.5">
                      <Info className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Product Description
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-600 dark:text-slate-400">
                    <p className="leading-relaxed font-medium text-slate-700 dark:text-slate-350">{product.description}</p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Combo Contents */}
              {product.category === "combos" && product.comboItems && product.comboItems.length > 0 && (
                <AccordionItem value="combo" className="border-none">
                  <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                    <span className="flex items-center gap-2.5">
                      <Gift className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Combo Contents
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-600 dark:text-slate-400">
                    {product.comboName && (
                      <div className="mb-4 pb-2 border-b border-slate-100 dark:border-slate-900">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{product.comboName}</h4>
                        {product.comboDescription && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{product.comboDescription}</p>
                        )}
                      </div>
                    )}
                    <div className="space-y-3">
                      {product.comboItems.map((item, index) => (
                        <div key={index} className="flex gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900/60 bg-slate-50/50 dark:bg-slate-900/20">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200/50"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-slate-250 text-xs">{item.name}</h5>
                            {item.description && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Care Instructions Accordion */}
              {product.careInstructions && product.careInstructions.length > 0 && (
                <AccordionItem value="care" className="border-none">
                  <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                    <span className="flex items-center gap-2.5">
                      <Leaf className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Artisanal Care Instructions
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-600 dark:text-slate-400 space-y-2">
                    {product.careInstructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2.5 py-1 text-slate-700 dark:text-slate-350">
                        <span className="text-emerald-500 text-xs flex-shrink-0">🌿</span>
                        <p className="text-[11px] leading-relaxed font-medium">{instruction}</p>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}

            </Accordion>

          </div>
        </div>

        {/* Inline Product Customizer */}
        {product.isCustomizable && product.customizationOptions && (
          <InlineProductCustomizer
            isOpen={isCustomizerExpanded}
            onToggleOpen={() => setIsCustomizerExpanded(!isCustomizerExpanded)}
            product={{
              _id: product._id,
              title: product.title,
              price: discountedPrice,
              images: product.images,
              category: product.category,
              customizationOptions: product.customizationOptions,
              comboItems: product.comboItems,
              comboName: product.comboName,
              comboDescription: product.comboDescription,
              discount: product.discount
            }}
            selectedVariant={selectedVariant}
            onAddToCart={(customizations, customTotalPrice) => {
              setCustomizations(customizations);
              // Use the customTotalPrice as the unit price for the cart item
              const cartItem = {
                _id: product._id,
                id: `${product._id}${selectedVariant ? `-${selectedVariant.label}` : ''}`,
                productId: product._id,
                title: product.title,
                price: customTotalPrice, // unit price only
                originalPrice: originalPrice,
                image: imageUrl,
                quantity: quantity, // quantity is handled by cart
                category: product.category,
                discount: product.discount,
                images: product.images,
                description: product.description,
                details: product.details,
                careInstructions: product.careInstructions,
                isNewArrival: Boolean(
                  product.isNewArrival || (product as { isNew?: boolean }).isNew
                ),
                isFeatured: product.isFeatured,
                customizations: customizations
              };
              addToCart(cartItem);
              toast({
                title: "Added to cart",
                description: `${quantity} × ${product.title} added to your cart`,
                duration: 3000,
              });

              // Redirect to cart page after successful addition
              setTimeout(() => {
                navigate('/cart');
              }, 1000);
            }}
          />
        )}

        {/* Product Reviews Section */}
        <div id="reviews-section">
          <ProductReviews productId={product._id} onReviewSubmit={onReviewSubmit} />
        </div>

        {/* Recommended Products Section */}
        <RecommendedProducts productId={product._id} category={product.category} />
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        productTitle={product.title}
      />

      {/* Sticky Bottom Purchase Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/80 z-40 py-3.5 px-4 shadow-[0_-10px_35px_rgba(0,0,0,0.06)]"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={getImageUrl(product.images[0]) || '/images/placeholder.svg'}
                  alt={product.title}
                  className="w-11 h-11 object-cover rounded-xl border border-slate-100 dark:border-slate-800"
                />
                <div className="hidden xs:block">
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{product.title}</h4>
                  <p className="text-[11px] text-primary font-bold mt-0.5">
                    {formatPrice(convertPrice(displayDiscountedPrice))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {product.hasPriceVariants && (
                  <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400">
                    Size: {selectedVariant?.label || 'None selected'}
                  </span>
                )}
                {product.isCustomizable ? (
                  <Button
                    onClick={handleCustomize}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-5 h-10 rounded-xl hover:shadow-md transition-all active:scale-95"
                    disabled={product.hasPriceVariants && !selectedVariant}
                  >
                    Customize
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-5 h-10 rounded-xl hover:shadow-md transition-all active:scale-95"
                    disabled={product.hasPriceVariants && !selectedVariant}
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Gallery */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-modal flex flex-col justify-between p-6 select-none"
          >
            {/* Lightbox header */}
            <div className="flex justify-between items-center text-white/80">
              <span className="text-xs font-bold tracking-[0.1em] uppercase">
                {selectedImage + 1} / {product.images.length} • {product.title}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lightbox Main Image */}
            <div className="relative flex-1 flex items-center justify-center max-w-4xl mx-auto w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-0 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-10"
              >
                <ChevronLeft size={24} />
              </button>

              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={getImageUrl(product.images[selectedImage], { bustCache: false })}
                alt={product.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-0 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-10"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Lightbox Thumbnails Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 justify-center py-4 overflow-x-auto no-scrollbar">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-12 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                      selectedImage === index
                        ? "border-white scale-105"
                        : "border-transparent opacity-40 hover:opacity-100"
                    )}
                  >
                    <img
                      src={getImageUrl(image, { bustCache: false })}
                      alt="preview thumb"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductDetail;
