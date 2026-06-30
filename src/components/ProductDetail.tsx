import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Minus, Plus, ChevronLeft, ChevronRight, Star, Eye, ShoppingBag, Wand2, Gift, ClipboardList, Leaf, Info, Truck, Tag } from 'lucide-react';
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
import { ProductCard } from './ProductGrid';
import ProductReviews from '@/components/ProductReviews';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { X, MapPin } from 'lucide-react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildProductReviewUrl } from '@/utils/reviewUrls';
import PinCodeInput from '@/components/ui/PinCodeInput';
import ProtectedImage from './ui/ProtectedImage';

const MotionProtectedImage = motion(ProtectedImage);


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
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4 py-4 pb-12 md:pb-16 -mx-4"
      >
        {recommendedProducts.map((recProd) => {
          return (
            <div
              key={recProd._id}
              className="w-[200px] xs:w-[220px] md:w-[320px] lg:w-[300px] flex-shrink-0 snap-start"
            >
              <ProductCard product={recProd as any} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getComboMaxPrice = (product: ProductData) => {
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

  // Pincode Availability Section States
  const [pincodeCheckVal, setPincodeCheckVal] = useState('');
  const [isPincodeExpanded, setIsPincodeExpanded] = useState(false);
  const [pincodeLocation, setPincodeLocation] = useState<any>(null);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [isPincodeValid, setIsPincodeValid] = useState(false);

  const productInfoRef = useRef<HTMLDivElement>(null);

  // Sync pincode selection with localStorage / sessionStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sbf_delivery_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPincodeLocation(parsed);
        setPincodeCheckVal(parsed.code);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Handle location update from external events (e.g. navbar change)
  useEffect(() => {
    const handleLocationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setPincodeLocation(customEvent.detail);
        setPincodeCheckVal(customEvent.detail.code);
      }
    };
    window.addEventListener('sbf-location-updated', handleLocationUpdate);
    return () => window.removeEventListener('sbf-location-updated', handleLocationUpdate);
  }, []);

  const handleTogglePincode = () => {
    const nextState = !isPincodeExpanded;
    setIsPincodeExpanded(nextState);

    if (nextState) {
      // Smooth scroll to the top of the product info section
      setTimeout(() => {
        const yOffset = -90; // account for sticky header height
        const element = productInfoRef.current;
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    }
  };

  // Redesign Luxury Interaction States
  const [isMobile, setIsMobile] = useState(false);
  const [defaultExpanded, setDefaultExpanded] = useState<string[]>([]);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const mobileCheck = window.innerWidth < 1024;
        setIsMobile(mobileCheck);

        // Expand accordions by default on desktop
        if (!mobileCheck) {
          setDefaultExpanded(["details", "description", "combo", "care", "delivery", "faqs"]);
        } else {
          setDefaultExpanded(["details"]);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Lock body scroll and listen for Escape key when lightbox is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const rect = currentTarget.getBoundingClientRect();

    // Parallax mouse position
    const px = (clientX - rect.left) / rect.width - 0.5;
    const py = (clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: px, y: py });

    // Lens zoom mouse position
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    setZoomPos({ x: lx, y: ly });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) {
        if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedImage, product.images]);


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
        type: "warning",
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
        type: "warning",
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
          type: "warning",
        });
        return;
      }

      // Check stock
      const variantStock = selectedVariant?.stock ?? product.countInStock;
      if (variantStock < quantity) {
        toast({
          title: "Not enough stock",
          description: "The selected quantity is not available",
          type: "error",
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
        type: "cart",
        image: getImageUrl(product.images[0]),
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
        type: "error",
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
          type: "error",
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
          type: "login",
          duration: 4000,
        });
      } else if (errorMessage.includes('already in wishlist')) {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist",
          type: "info",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          type: "error",
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
          type: "success",
          duration: 3000,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard!",
          type: "success",
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
          type: "error",
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
    <section className="pt-12 sm:pt-16 pb-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-visible lg:overflow-visible">

      {/* Decorative ambient background lighting */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-bloom-pink-100/20 via-bloom-blue-100/10 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-bloom-green-100/15 via-bloom-blue-100/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[560px_minmax(0,1fr)] lg:gap-[72px] gap-8 items-start relative">

          {/* LEFT SIDE: Immersive Sticky Product Gallery */}
          <div className="lg:sticky lg:top-[120px] lg:self-start w-full relative">
            <div className="flex flex-col md:flex-row gap-6 lg:w-full">

              {/* 1. Vertical Thumbnail Strip (Desktop) */}
              {product.images.length > 1 && (
                <div className="hidden md:flex md:flex-col gap-3 w-20 max-h-[520px] overflow-y-auto no-scrollbar pr-1 py-1 flex-shrink-0">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "aspect-[4/5] w-full relative overflow-hidden rounded-xl bg-white dark:bg-slate-950 border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm",
                        selectedImage === index
                          ? "border-slate-800 dark:border-slate-100 shadow-[0_0_15px_rgba(0,0,0,0.06)] ring-2 ring-slate-800/10 dark:ring-slate-100/20 scale-102"
                          : "border-slate-200/60 opacity-60 hover:opacity-100"
                      )}
                    >
                      <ProtectedImage
                        src={getImageUrl(image, { bustCache: false })}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* 2. Main Large Cinematic Image (with Parallax & Magnifier Lens) */}
              <div className="relative flex-1">
                <div className="relative w-full">
                  <div
                    ref={containerRef}
                    className={cn(
                      "relative w-full group rounded-[28px] bg-slate-100/30 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden aspect-[4/5] lg:max-w-[calc((100vh-160px)*4/5)] lg:max-h-[calc(100vh-160px)] mx-auto flex items-center justify-center p-0 backdrop-blur-sm",
                    ""
                    )}
                  >
                    {/* Soft ambient background glow inside container for premium look */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-bloom-pink-100/5 via-bloom-blue-100/5 to-transparent blur-xl pointer-events-none" />

                    <div
                      className="relative w-full h-full cursor-zoom-in flex items-center justify-center"
                      onMouseMove={handleMouseMove}
                      onMouseEnter={() => {
                        setIsHovered(true);
                        setShowLens(true);
                      }}
                      onMouseLeave={() => {
                        setIsHovered(false);
                        setShowLens(false);
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

                      {/* Animated Image Frame */}
                      <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <MotionProtectedImage
                          src={imageUrl}
                          alt={product.title}
                          onLoad={() => setIsImageLoading(false)}
                          className="w-full h-full object-cover rounded-[28px] transition-transform duration-700 ease-out"
                          style={{
                            transform: isHovered && !isMobile
                              ? `scale(1.08) translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`
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

                      {/* Magnifying Lens (Desktop Only) */}
                      {showLens && !isMobile && containerRef.current && (
                        <div
                          className="absolute pointer-events-none border border-white/30 shadow-[0_25px_60px_rgba(0,0,0,0.35)] rounded-full overflow-hidden hidden lg:block"
                          style={{
                            width: '180px',
                            height: '180px',
                            left: `${zoomPos.x - 90}px`,
                            top: `${zoomPos.y - 90}px`,
                            backgroundImage: `url(${imageUrl})`,
                            backgroundPosition: `${(zoomPos.x / containerRef.current.getBoundingClientRect().width) * 100}% ${(zoomPos.y / containerRef.current.getBoundingClientRect().height) * 100}%`,
                            backgroundSize: '250%',
                            backgroundRepeat: 'no-repeat',
                            zIndex: 30,
                          }}
                        />
                      )}

                      {/* Badges for New / Featured */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                        {(product.isNewArrival || (product as { isNew?: boolean }).isNew) && (
                          <span className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded shadow-sm">
                            New Arrival
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="bg-amber-500/90 text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded shadow-sm">
                            Featured
                          </span>
                        )}
                      </div>

                      {product.discount > 0 && (
                        <span className="absolute bottom-4 right-4 bg-rose-600/90 text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded shadow-sm z-10">
                          -{product.discount}% Off
                        </span>
                      )}

                      {/* Hover UI Overlay hints */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/10 transition-colors pointer-events-none duration-300" />
                      <div className="absolute bottom-4 left-4 text-xs font-semibold bg-white/70 backdrop-blur-md text-slate-800 dark:bg-slate-950/70 dark:text-slate-200 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm pointer-events-none">
                        🔍 Hover to inspect • Click to expand
                      </div>

                      {/* Left/Right Controls (Mobile and desktop fallback) */}
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
                        "h-16 aspect-[4/5] relative overflow-hidden rounded-lg bg-white border flex-shrink-0 transition-all duration-300",
                        selectedImage === index
                          ? "border-slate-800 ring-2 ring-slate-800/10 scale-102"
                          : "border-slate-200/80 opacity-60"
                      )}
                    >
                      <ProtectedImage
                        src={getImageUrl(image, { bustCache: false })}
                        alt={`${product.title} visual ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Scrollable luxury product content panel */}
          <div className="min-w-0 flex flex-col space-y-6 lg:pb-12">

            {/* 1. Product Name */}
            <div>
              <h1
                className="font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-serif"
                style={!isMobile ? { fontSize: 'clamp(2.5rem, 3vw, 3.5rem)', lineHeight: '1.05', maxWidth: '100%', wordBreak: 'normal' } : undefined}
              >
                {product.title}
              </h1>
            </div>

            {/* 2. Category Breadcrumb */}
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase">
              <span>Shop</span>
              <span>/</span>
              <span>{product.category || 'Luxury Gifting'}</span>
            </div>

            {/* 3. Rating & Reviews */}
            <div className="flex items-center gap-3">
              {product.numReviews && product.numReviews > 0 ? (
                <>
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={cn(
                          i < Math.round(product.rating || 0)
                            ? "fill-current text-amber-400"
                            : "text-slate-200 dark:text-slate-800"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {Number(product.rating || 0).toFixed(1)} ({product.numReviews} review{product.numReviews > 1 ? 's' : ''})
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center text-slate-200 dark:text-slate-800 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">No reviews yet</span>
                </>
              )}
              <span className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
              <button
                onClick={() => navigate(buildProductReviewUrl(product._id, product.title))}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold underline underline-offset-2"
              >
                View all reviews
              </button>
            </div>

            {/* 4. Price Section */}
            <div className="py-4 border-y border-slate-100 dark:border-slate-900/60">
              <div className="flex items-baseline gap-3">
                {product.category === 'combos' && product.comboItems && product.comboItems.length > 0 ? (
                  <span className="text-3xl lg:text-[3rem] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {formatPrice(convertPrice(getComboMaxPrice(product)))}
                  </span>
                ) : (
                  <>
                    <motion.span
                      key={displayDiscountedPrice}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl lg:text-[3rem] font-bold text-slate-900 dark:text-slate-100 tracking-tight"
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

            {/* 5. Offer Details (Luxury Coupon Info) */}
            {/*<div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 via-pink-50/30 to-slate-50/10 dark:from-slate-900/40 dark:via-pink-950/5 dark:to-slate-900/20 border border-slate-200/50 dark:border-slate-800/80 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <Tag size={14} />
                <span>Exclusive Store Offers</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
                <li>Use coupon <strong className="font-extrabold text-slate-800 dark:text-slate-200">SBF100</strong> for Flat ₹100 discount on your first order.</li>
                <li>Free temperature-controlled premium gift wrapping box included.</li>
                <li>Same-day urgent dispatch available across Hyderabad city bounds.</li>
              </ul>
            </div> */}

            {/* 6. Delivery Availability (Pincode checker) */}
            <div className="py-2 border-b border-slate-100 dark:border-slate-900/60">
              <button
                type="button"
                onClick={handleTogglePincode}
                className="flex items-center justify-between w-full py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-350 hover:text-primary transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary group-hover:scale-110 transition-transform" />
                  {pincodeLocation ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Delivering to: <strong className="font-bold">{pincodeLocation.area.split('/')[0]} ({pincodeLocation.code})</strong>
                    </span>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-300">Check delivery availability in your area</span>
                  )}
                </span>
                <span className="text-xs text-primary underline underline-offset-2 font-medium">
                  {pincodeLocation ? 'Change' : 'Check Pincode'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isPincodeExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Enter a Hyderabad pincode to see if this luxury arrangement can be dispatched to your location.
                      </p>

                      <div className="relative">
                        <PinCodeInput
                          value={pincodeCheckVal}
                          onChange={(val) => {
                            setPincodeCheckVal(val);
                            if (!val) {
                              setPincodeLocation(null);
                              setPincodeMessage('');
                            }
                          }}
                          placeholder="Enter 6-digit Pincode"
                          onSelectPinCode={(selection) => {
                            if (selection) {
                              setPincodeLocation(selection);
                              setIsPincodeValid(true);
                              setPincodeMessage(`Deliverable: Dispatched via premium climate-controlled courier.`);
                              localStorage.setItem('sbf_delivery_location', JSON.stringify(selection));
                              sessionStorage.setItem('sbf_entered_pincode', selection.code);
                              window.dispatchEvent(new CustomEvent('sbf-location-updated', { detail: selection }));
                            } else {
                              setPincodeLocation(null);
                              setIsPincodeValid(false);
                            }
                          }}
                          onValidationChange={(isValid, msg) => {
                            if (!isValid && msg) {
                              setPincodeMessage(msg);
                            }
                          }}
                          className="w-full"
                          inputClassName="h-11 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                      </div>

                      {pincodeMessage && (
                        <div className={cn(
                          "text-xs px-3 py-2 rounded-xl flex items-start gap-1.5 leading-relaxed font-medium animate-fade-in",
                          isPincodeValid
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/30"
                            : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100/30"
                        )}>
                          <span className="text-[14px] leading-none">{isPincodeValid ? '✓' : '⚠'}</span>
                          <span>{pincodeMessage}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 7. Product Variants */}
            {renderVariantSelection()}

            {/* 8. Add-ons Customize Banner */}
            {product.isCustomizable && (
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Customizations & Add-ons</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Include message card, dry fruits, or chocolates.</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleCustomize}
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs rounded-xl"
                >
                  Customize
                </Button>
              </div>
            )}

            {/* 9. Quantity Selector (Desktop/Mobile Non-sticky version) */}
            <div className="flex items-center gap-4 lg:hidden">
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

            {/* 10. Normal CTA Buttons (Only visible on mobile/tablet) */}
            <div className="flex gap-3 lg:hidden">
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

            {/* 10. Sticky Luxury Purchase Box (Desktop Only) */}
            <div className="sticky bottom-6 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.06)] hidden lg:flex flex-col gap-4.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* Quantity selector inside desktop sticky box */}
                  <div className="flex items-center h-9 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 shadow-inner">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      type="button"
                      className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-30 rounded-l-xl"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-800 dark:text-slate-200">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      type="button"
                      className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors rounded-r-xl"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total price</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {formatPrice(convertPrice(displayDiscountedPrice * quantity))}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {product.isCustomizable ? (
                  <Button
                    type="button"
                    className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold hover:shadow-md transition-all border-none"
                    onClick={handleCustomize}
                    disabled={product.hasPriceVariants && !selectedVariant}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Customize & Add to Cart
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold hover:shadow-md transition-all border-none"
                      onClick={handleAddToCart}
                      disabled={product.hasPriceVariants && !selectedVariant}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 h-11 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold hover:opacity-95 transition-all shadow-[0_4px_15px_rgba(225,29,72,0.15)] border-none"
                      onClick={async () => {
                        await handleAddToCart();
                        navigate('/cart');
                      }}
                      disabled={product.hasPriceVariants && !selectedVariant}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Buy Now
                    </Button>
                  </>
                )}

                {/* Wishlist & Share in sticky container */}
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  className="h-11 w-11 border border-slate-200 dark:border-slate-800 flex items-center justify-center rounded-xl bg-white dark:bg-slate-950 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-700 dark:text-slate-350 shadow-sm"
                  title="Add to wishlist"
                >
                  <Heart size={16} className={cn("transition-colors", wishlistItems?.some(i => i.id === String(product._id)) ? "fill-rose-500 text-rose-500" : "")} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-11 w-11 border border-slate-200 dark:border-slate-800 flex items-center justify-center rounded-xl bg-white dark:bg-slate-950 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-700 dark:text-slate-350 shadow-sm"
                  title="Share product"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Trust & promise badges */}
              <div className="flex justify-between items-center pt-2 text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest border-t border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1.5">🌸 Fresh Flowers</span>
                <span className="flex items-center gap-1.5">🚚 Same Day</span>
                <span className="flex items-center gap-1.5">🎁 Premium Pack</span>
              </div>
            </div>

            {/* Luxury Trust Indicators Grid (Non-sticky details) */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 lg:hidden">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/20 text-pink-500 dark:text-pink-400 flex items-center justify-center flex-shrink-0">
                  <Leaf size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">Fresh Blooms</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">100% Freshness</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Gift size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">Same Day</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Order by 1 PM</p>
                </div>
              </div>
            </div>

            {/* Overhauled Product Details Accordion Section */}
            <Accordion
              type="multiple"
              className="w-full space-y-3 pt-4 border-t border-slate-100 dark:border-slate-900/60"
              value={defaultExpanded}
              onValueChange={setDefaultExpanded}
            >

              {/* 11. Product Contents (Details) */}
              <AccordionItem value="details" className="border-none">
                <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                  <span className="flex items-center gap-2.5">
                    <ClipboardList className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Product Contents
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-650 dark:text-slate-400 space-y-3">
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3.5 rounded-xl border border-amber-100/70 dark:border-amber-950/40">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-500 text-sm flex-shrink-0">📸</span>
                      <p className="text-amber-800 dark:text-amber-400 text-[11px] leading-relaxed font-semibold">
                        The visual displayed serves as a luxury baseline. Minor seasonal variations in flower types or exact foliage might occur based on premium local availability.
                      </p>
                    </div>
                  </div>
                  {product.details && product.details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-2.5 py-1 text-slate-700 dark:text-slate-350">
                      <span className="text-primary text-xs mt-0.5 flex-shrink-0">✦</span>
                      <p className="text-[11px] leading-relaxed font-medium">{detail}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* 11. Product Description */}
              {product.description && (
                <AccordionItem value="description" className="border-none">
                  <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                    <span className="flex items-center gap-2.5">
                      <Info className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Product Description
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-650 dark:text-slate-400">
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
                  <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-650 dark:text-slate-400">
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

              {/* 12. Artisanal Care Instructions */}
              {product.careInstructions && product.careInstructions.length > 0 && (
                <AccordionItem value="care" className="border-none">
                  <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                    <span className="flex items-center gap-2.5">
                      <Leaf className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Artisanal Care Instructions
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-650 dark:text-slate-400 space-y-2">
                    {product.careInstructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2.5 py-1 text-slate-700 dark:text-slate-350">
                        <span className="text-emerald-500 text-xs flex-shrink-0">🌿</span>
                        <p className="text-[11px] leading-relaxed font-medium">{instruction}</p>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="delivery" className="border-none">
                <AccordionTrigger className="w-full flex items-center justify-between py-3.5 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                  <span className="flex items-center gap-2.5">
                    <Truck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Delivery Information
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-650 dark:text-slate-400 space-y-4.5">
                  <div className="bg-primary/5 dark:bg-primary/10 p-3.5 rounded-xl border border-primary/10 dark:border-primary/20">
                    <p className="font-bold text-slate-800 dark:text-slate-250 text-xs mb-1">
                      Important Notes When Using SBF Delivery Service:
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-slate-750 dark:text-slate-350">
                      <span className="text-primary text-xs mt-0.5 flex-shrink-0">🚚</span>
                      <p className="text-[11px] leading-relaxed font-medium">
                        <strong className="text-slate-850 dark:text-slate-200 font-bold">Delivery Method:</strong> All flowers are hand-delivered to ensure freshness and quality. We do not use couriers for perishable items.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-750 dark:text-slate-350">
                      <span className="text-primary text-xs mt-0.5 flex-shrink-0">📸</span>
                      <p className="text-[11px] leading-relaxed font-medium">
                        <strong className="text-slate-850 dark:text-slate-200 font-bold">Images on the Website:</strong> The images on the website give a general idea of how the flowers will look, but the actual product may slightly differ in shape and size. Rest assured, SBF strives to replicate the design closely.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-750 dark:text-slate-350">
                      <span className="text-primary text-xs mt-0.5 flex-shrink-0">⏰</span>
                      <p className="text-[11px] leading-relaxed font-medium">
                        <strong className="text-slate-850 dark:text-slate-200 font-bold">Delivery Timing:</strong> While we strive to deliver within the selected time window, delivery times may vary based on your location and the specific flowers ordered. Please allow some flexibility.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-750 dark:text-slate-350">
                      <span className="text-primary text-xs mt-0.5 flex-shrink-0">📍</span>
                      <p className="text-[11px] leading-relaxed font-medium">
                        <strong className="text-slate-850 dark:text-slate-200 font-bold">One Delivery Attempt:</strong> As flowers are perishable, only one delivery attempt will be made. Please ensure someone is available at the delivery address to receive the order. If re-delivery is required, additional charges will apply.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-750 dark:text-slate-350">
                      <span className="text-primary text-xs mt-0.5 flex-shrink-0">🚫</span>
                      <p className="text-[11px] leading-relaxed font-medium">
                        <strong className="text-slate-850 dark:text-slate-200 font-bold">No Redirection of Address:</strong> Once an order has been dispatched, it cannot be redirected to a different address. Please double-check the delivery address during checkout.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-750 dark:text-slate-350">
                      <span className="text-primary text-xs mt-0.5 flex-shrink-0">🌿</span>
                      <p className="text-[11px] leading-relaxed font-medium">
                        <strong className="text-slate-850 dark:text-slate-200 font-bold">Blooming Stage:</strong> Flowers may arrive fully bloomed, semi-bloomed, or in buds depending on availability and freshness.
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/70 dark:border-emerald-950/40 mt-1">
                    <p className="text-emerald-800 dark:text-emerald-400 text-[11px] leading-relaxed font-semibold">
                      By following these care and delivery guidelines, you can enjoy your flowers at their best for as long as possible!
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 14. Frequently Asked Questions (FAQs) */}
              <AccordionItem value="faqs" className="border-none">
                <AccordionTrigger className="w-full flex items-center justify-between py-3.5 px-4 font-bold text-sm text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-150/70 dark:border-slate-900 rounded-xl hover:no-underline transition-all">
                  <span className="flex items-center gap-2.5">
                    <Star className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Frequently Asked Questions
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white dark:bg-slate-950 border border-t-0 border-slate-150/70 dark:border-slate-900 rounded-b-xl -mt-1 shadow-inner text-xs text-slate-650 dark:text-slate-400 space-y-3.5">
                  <div>
                    <h5 className="font-bold text-slate-855 dark:text-slate-200 text-xs">Q: Will my flowers look exactly like the image?</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                      Our master florists craft each bouquet by hand. While we preserve the design, volume, and color palette, minor seasonal substitutions of flower types may occur to guarantee maximum freshness.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-850 dark:text-slate-200 text-xs">Q: Can I add a custom card or select a specific delivery date?</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                      Yes. During checkout, you can select your preferred delivery date, time slot, and write a personalized message card.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

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
            <div id="reviews-section" className="pt-8 border-t border-slate-100 dark:border-slate-900/60 overflow-visible relative">
              <ProductReviews
                productId={product._id}
                productTitle={product.title}
                onReviewSubmit={onReviewSubmit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-16 pb-16">
        <div className="pt-8 border-t border-slate-100 dark:border-slate-900/60 overflow-visible relative">
          <RecommendedProducts productId={product._id} category={product.category} />
        </div>
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
                <ProtectedImage
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
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              key="product-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 flex flex-col justify-between p-6 select-none"
              style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 99999,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {/* Lightbox header */}
              <div
                className="flex justify-center items-center text-white/80"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs font-bold tracking-[0.1em] uppercase">
                  {selectedImage + 1} / {product.images.length} • {product.title}
                </span>
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

                <div
                  className="relative max-w-fit mx-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MotionProtectedImage
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
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/85 hover:bg-black text-white flex items-center justify-center border border-white/40 shadow-xl hover:scale-110 active:scale-95 transition-all z-20"
                  >
                    <X size={16} />
                  </button>
                </div>

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
                <div
                  className="flex gap-2.5 justify-center py-4 overflow-x-auto no-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
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
                      <ProtectedImage
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
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};

export default ProductDetail;
