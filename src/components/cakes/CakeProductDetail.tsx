import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  Eye,
  Check,
  Truck,
  Sparkles,
  ShieldCheck,
  Clock,
  ChevronRight,
  Maximize2,
  X,
  Gift,
  Flame,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import useWishlist from '@/hooks/use-wishlist';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ProtectedImage from '@/components/ui/ProtectedImage';
import PinCodeInput, { ServiceablePinCode } from '@/components/ui/PinCodeInput';
import ProductReviews from '@/components/ProductReviews';
import { ProductData } from '@/services/productService';
import { getAddons, AddonProduct } from '@/services/addonService';
import { getCakeVariants, CakeVariantOption } from '@/utils/cakeHelpers';
import { getProductEffectivePrice, getDiscountBreakdown } from '@/utils/pricing';
import { promptLoginForAddToCart } from '@/utils/cartAuthHelper';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface CakeProductDetailProps {
  product: ProductData & {
    _id: string;
    countInStock?: number;
    badge?: string;
    isBestseller?: boolean;
    shortDescription?: string;
  };
  onAddToCart: (item: any) => void;
  onReviewSubmit: () => void;
}

export const CakeProductDetail: React.FC<CakeProductDetailProps> = ({
  product,
  onAddToCart,
  onReviewSubmit,
}) => {
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();

  // Images & Gallery State
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop'];
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Weight / Size Variants strictly from product form
  const variants: CakeVariantOption[] = getCakeVariants(product);
  const [selectedVariant, setSelectedVariant] = useState<CakeVariantOption | null>(
    variants.length > 0 ? variants[0] : null
  );

  // Sync selected variant when variants prop/config changes
  useEffect(() => {
    if (variants.length > 0) {
      if (!selectedVariant || !variants.some(v => v.label === selectedVariant.label)) {
        setSelectedVariant(variants[0]);
      } else {
        const matching = variants.find(v => v.label === selectedVariant.label);
        if (matching && (matching.price !== selectedVariant.price || matching.stock !== selectedVariant.stock)) {
          setSelectedVariant(matching);
        }
      }
    } else {
      setSelectedVariant(null);
    }
  }, [product, variants.length]);

  // Eggless status strictly from product cakeAttributes (if configured in product form)
  const isEggless = product.cakeAttributes?.eggless;

  // Message on Cake
  const [cakeMessage, setCakeMessage] = useState('');
  const maxMessageLength = 30;

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Add-ons
  const [availableAddons, setAvailableAddons] = useState<AddonProduct[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());

  // Combos Recommendation
  const [recommendedCombos, setRecommendedCombos] = useState<any[]>([]);

  // Pincode & Delivery Checking
  const [pincodeVal, setPincodeVal] = useState('');
  const [pincodeLocation, setPincodeLocation] = useState<ServiceablePinCode | null>(null);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [isPincodeValid, setIsPincodeValid] = useState(false);

  // Active tab for details
  const [activeTab, setActiveTab] = useState<string>('about');

  // Loading state for adding to cart
  const [isAdding, setIsAdding] = useState(false);

  // Wishlist state
  const currentProductId = String(product._id || product.id || '');
  const isInWishlist = wishlistItems?.some(
    i => String(i.id) === currentProductId || String((i as any).productId) === currentProductId
  );

  // Fetch Addons and Combos on mount
  useEffect(() => {
    let isMounted = true;

    // Load saved pincode if available
    const savedPin = sessionStorage.getItem('sbf_entered_pincode') || '';
    if (savedPin) {
      setPincodeVal(savedPin);
      try {
        const savedLoc = localStorage.getItem('sbf_delivery_location');
        if (savedLoc) {
          setPincodeLocation(JSON.parse(savedLoc));
          setIsPincodeValid(true);
        }
      } catch (e) {
        // ignore
      }
    }

    const fetchData = async () => {
      try {
        // Fetch active add-ons from API - strictly no fake fallback seed items
        const addonRes = await getAddons();
        if (isMounted && addonRes?.addons?.length) {
          setAvailableAddons(addonRes.addons.filter(a => a.active !== false).slice(0, 5));
        } else if (isMounted) {
          setAvailableAddons([]);
        }

        // Fetch combo recommendations
        try {
          const comboRes = await api.get('/products', {
            params: {
              category: 'combos',
              limit: 4,
            },
          });
          if (isMounted && comboRes?.data?.products?.length) {
            setRecommendedCombos(comboRes.data.products.slice(0, 3));
          }
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('Error fetching cake page addons/combos:', err);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Stock check
  const isOutOfStock = Boolean(
    (product as any).isOutOfStock === true ||
    (product as any).isAvailable === false ||
    (typeof product.countInStock === 'number' && product.countInStock <= 0) ||
    (typeof product.stock === 'number' && product.stock <= 0) ||
    (selectedVariant && typeof selectedVariant.stock === 'number' && selectedVariant.stock <= 0)
  );

  // Calculate pricing strictly from product data
  const baseVariantPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price || 0);
  const effectiveBasePrice = getProductEffectivePrice(product, selectedVariant ? selectedVariant.price : undefined, selectedVariant);

  // Real compare/original price strictly from selected variant or product record
  const rawCompare = selectedVariant
    ? (selectedVariant.comparePrice && Number(selectedVariant.comparePrice) > effectiveBasePrice
        ? Number(selectedVariant.comparePrice)
        : (baseVariantPrice > effectiveBasePrice ? baseVariantPrice : effectiveBasePrice))
    : (product.comparePrice && Number(product.comparePrice) > effectiveBasePrice
        ? Number(product.comparePrice)
        : (effectiveBasePrice < Number(product.price) ? Number(product.price) : effectiveBasePrice));

  const discountInfo = getDiscountBreakdown(rawCompare, effectiveBasePrice);
  const hasRealDiscount = discountInfo.hasDiscount && discountInfo.percentage > 0;

  const selectedAddonsList = availableAddons.filter(a => selectedAddonIds.has(a._id));
  const addonsCost = selectedAddonsList.reduce((sum, item) => sum + (item.price || 0), 0);
  const singleUnitPrice = effectiveBasePrice + addonsCost;
  const totalPrice = singleUnitPrice * quantity;

  // Real reviews check
  const reviewCount = Number(product.numReviews || (product as any).reviewCount || 0);
  const ratingVal = Number(product.rating || 0);
  const hasReviews = ratingVal > 0 && reviewCount > 0;

  // Toggle addon
  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds(prev => {
      const next = new Set(prev);
      if (next.has(addonId)) {
        next.delete(addonId);
      } else {
        next.add(addonId);
      }
      return next;
    });
  };

  // Wishlist handler
  const handleToggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(currentProductId);
      toast({
        title: 'Removed from Wishlist',
        description: `${product.title} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        id: currentProductId,
        productId: currentProductId,
        title: product.title,
        price: selectedVariant ? selectedVariant.price : Number(product.price || 0),
        image: images[0],
      });
      toast({
        title: 'Saved to Wishlist',
        description: `${product.title} has been saved to your wishlist.`,
      });
    }
  };

  // Share handler
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} | Spring Blossoms Florist`,
          text: `Indulge in freshly baked luxury cakes: ${product.title}`,
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Product link copied to clipboard.',
      });
    }
  };

  // Add to Cart handler
  const handleAddToCart = async (redirectCheckout = false) => {
    if (isOutOfStock) {
      toast({
        title: 'Product Out of Stock',
        description: 'This cake is currently out of stock.',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const cartItemPayload = {
        id: `${product._id}_${selectedVariant?.label || 'standard'}_${Date.now()}`,
        productId: product._id,
        title: product.title,
        price: singleUnitPrice,
        originalPrice: hasRealDiscount ? (rawCompare + addonsCost) : singleUnitPrice,
        discount: hasRealDiscount ? discountInfo.percentage : (product.discount || 0),
        image: images[0],
        quantity,
        selectedVariant: selectedVariant ? {
          label: selectedVariant.label,
          price: selectedVariant.price,
          stock: selectedVariant.stock,
        } : undefined,
        customizations: {
          cakeWeight: selectedVariant?.label || product.cakeAttributes?.weight,
          weight: selectedVariant?.label || product.cakeAttributes?.weight,
          eggless: product.cakeAttributes?.eggless,
          cakeFlavor: product.cakeAttributes?.flavor,
          flavor: product.cakeAttributes?.flavor,
          cakeShape: product.cakeAttributes?.shape,
          shape: product.cakeAttributes?.shape,
          prepTime: product.cakeAttributes?.prepTime,
          occasion: product.cakeAttributes?.occasion,
          cakeMessage: cakeMessage.trim() || undefined,
          addons: selectedAddonsList.map(a => ({
            id: a._id,
            name: a.name || (a as any).title,
            price: a.price,
          })),
          addonTotal: addonsCost,
        },
      };

      if (!user) {
        promptLoginForAddToCart(
          navigate,
          cartItemPayload,
          window.location.pathname + window.location.search
        );
        return;
      }

      onAddToCart(cartItemPayload);

      toast({
        title: 'Added to Bag',
        description: `${product.title} ${selectedVariant ? `(${selectedVariant.label})` : ''} added to your shopping bag.`,
      });

      if (redirectCheckout) {
        setTimeout(() => {
          navigate('/cart');
        }, 300);
      }
    } catch (error) {
      console.error('Error adding cake to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to bag. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Dynamic tabs based strictly on available product form data
  const detailsList = Array.isArray(product.details)
    ? product.details
    : (Array.isArray((product.details as any)?.items) ? (product.details as any).items : []);

  const careList = Array.isArray(product.careInstructions)
    ? product.careInstructions
    : (typeof (product.careInstructions as any) === 'string' && (product.careInstructions as any).trim()
      ? (product.careInstructions as any).split('\n').filter(Boolean)
      : []);

  const hasCakeSpecs = Boolean(
    product.cakeAttributes &&
    (product.cakeAttributes.flavor ||
     product.cakeAttributes.shape ||
     product.cakeAttributes.weight ||
     product.cakeAttributes.prepTime ||
     product.cakeAttributes.occasion ||
     product.cakeAttributes.eggless !== undefined)
  );

  const availableTabs = [
    { id: 'about', label: 'Description' },
    ...(hasCakeSpecs ? [{ id: 'specifications', label: 'Cake Specifications' }] : []),
    ...(detailsList.length > 0 ? [{ id: 'details', label: 'Product Highlights' }] : []),
    ...(careList.length > 0 ? [{ id: 'storage', label: 'Care Instructions' }] : []),
    { id: 'delivery', label: 'Delivery & Handling' },
  ];

  useEffect(() => {
    if (!availableTabs.some(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || 'about');
    }
  }, [availableTabs, activeTab]);

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-[#0c0d0e] font-sans antialiased text-stone-900 dark:text-stone-100 pb-24 md:pb-16 selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-stone-900 dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 shrink-0" />
          <Link to="/cakes" className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-1">
            <span>Artisan Cakes</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded">NEW</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 shrink-0" />
          <span className="text-stone-900 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </nav>
      </div>

      {/* 2. Main Product Hero (Gallery + Information) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Image Gallery (6 Cols) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4 lg:sticky lg:top-24">
            {/* Main Stage Image */}
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.08)] group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full cursor-zoom-in"
                  onClick={() => setIsZoomOpen(true)}
                >
                  <ProtectedImage
                    src={images[activeImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges strictly from product record */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                {product.badge && (
                  <Badge className="bg-stone-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[11px] font-semibold tracking-wider px-3 py-1 uppercase rounded-full shadow-md">
                    {product.badge}
                  </Badge>
                )}
                {product.isBestseller && (
                  <Badge className="bg-amber-500 text-stone-950 font-bold text-[10px] tracking-wider px-2.5 py-0.5 uppercase rounded-full shadow-md">
                    Bestseller
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-rose-900/90 backdrop-blur-md text-rose-100 border border-rose-700/30 text-[10px] font-bold tracking-wider px-2.5 py-0.5 uppercase rounded-full shadow-md">
                    Featured
                  </Badge>
                )}
                {(product.isNewArrival || product.isNew) && (
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px] tracking-wider px-2.5 py-0.5 uppercase rounded-full shadow-md">
                    New Arrival
                  </Badge>
                )}
                {isEggless !== undefined && (
                  <Badge className={cn(
                    "backdrop-blur-md text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1",
                    isEggless
                      ? "bg-emerald-950/85 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-950/85 text-amber-300 border border-amber-500/30"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", isEggless ? "bg-emerald-400" : "bg-amber-400")}></span>
                    {isEggless ? '100% Eggless' : 'Contains Egg'}
                  </Badge>
                )}
              </div>

              {/* Zoom & Quick Action Trigger */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 backdrop-blur-md shadow-md border border-stone-200/50 dark:border-stone-700 hover:scale-110 active:scale-95 transition-transform"
                title="Zoom image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 border-2 transition-all p-0.5 bg-white dark:bg-stone-900",
                      activeImageIndex === idx
                        ? "border-amber-600 dark:border-amber-400 ring-2 ring-amber-500/20 shadow-md scale-102"
                        : "border-stone-200 dark:border-stone-800 opacity-70 hover:opacity-100"
                    )}
                  >
                    <ProtectedImage
                      src={img}
                      alt={`${product.title} view ${idx + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Highlights under Gallery */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-center">
                <div className="w-7 h-7 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-1">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100">Baked to Order</div>
                <div className="text-[10px] text-stone-500">Fresh artisanal bake</div>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-center">
                <div className="w-7 h-7 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center mb-1">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100">Care Transport</div>
                <div className="text-[10px] text-stone-500">Safe handling guarantee</div>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-center">
                <div className="w-7 h-7 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100">Candles & Knife</div>
                <div className="text-[10px] text-stone-500">Complimentary</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details & Customizer (6 Cols) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6">
            
            {/* Header: Title, Category, Rating & Action Icons */}
            <div className="space-y-2 border-b border-stone-200/70 dark:border-stone-800 pb-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                    Spring Blossoms Florist
                  </span>
                  <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700"></span>
                  <span className="text-[11px] text-stone-500 capitalize">
                    {product.subcategory?.replace(/-/g, ' ') || 'Artisan Cake'}
                  </span>
                </div>

                {/* Share & Wishlist buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={cn(
                      "p-2 rounded-full border transition-all",
                      isInWishlist
                        ? "bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:border-stone-400"
                    )}
                    title={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-full border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-all"
                    title="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Tagline / Short description */}
              {(product.shortDescription || product.description) && (
                <p className="text-sm text-stone-600 dark:text-stone-400 font-normal">
                  {product.shortDescription || product.description?.slice(0, 160)}
                </p>
              )}

              {/* Rating Review Stars / Stock status */}
              <div className="flex items-center gap-3 pt-1">
                {hasReviews && (
                  <>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{ratingVal.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-stone-500">
                      ({reviewCount} verified review{reviewCount === 1 ? '' : 's'})
                    </span>
                    <span className="text-stone-300 dark:text-stone-700">•</span>
                  </>
                )}
                <span className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  isOutOfStock ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  <Check className="w-3 h-3" /> {isOutOfStock ? 'Out of Stock' : 'In Stock & Fresh'}
                </span>
              </div>

              {/* Live Dynamic Price Display strictly from product form */}
              <div className="pt-3 flex items-baseline gap-3">
                <div className="text-3xl sm:text-4xl font-bold font-serif text-stone-950 dark:text-white tracking-tight">
                  {formatPrice(convertPrice(singleUnitPrice))}
                </div>
                {hasRealDiscount && (
                  <>
                    <div className="text-sm sm:text-base text-stone-400 line-through">
                      {formatPrice(convertPrice(rawCompare + addonsCost))}
                    </div>
                    <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-none text-[11px] font-semibold">
                      Save {Math.round(discountInfo.percentage)}%
                    </Badge>
                  </>
                )}
                {addonsCost > 0 && (
                  <span className="text-xs text-stone-500 dark:text-stone-400 italic">
                    (Includes {formatPrice(convertPrice(addonsCost))} add-ons)
                  </span>
                )}
              </div>
            </div>

            {/* 3. Weight Selector - ONLY rendered if variants are configured in product form */}
            {variants.length > 0 && selectedVariant && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <span>Select Cake Weight</span>
                    {selectedVariant.serves && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">• {selectedVariant.serves}</span>
                    )}
                  </label>
                  <span className="text-[11px] text-stone-400">Priced per variant</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {variants.map((variant) => {
                    const isSelected = selectedVariant.label === variant.label;
                    const variantEffectivePrice = getProductEffectivePrice(product, variant.price, variant);
                    const originalPriceForDisplay = (variant.comparePrice && Number(variant.comparePrice) > variantEffectivePrice)
                      ? Number(variant.comparePrice)
                      : variant.price;
                    const hasVariantDiscount = variantEffectivePrice < originalPriceForDisplay;

                    return (
                      <button
                        key={variant.label}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          "relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between group",
                          isSelected
                            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-100 shadow-md ring-2 ring-stone-900/10 dark:ring-stone-100/20 scale-[1.02]"
                            : "bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-400 hover:shadow-xs"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-bold tracking-tight">{variant.label}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-600"></span>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className={cn(
                              "text-xs font-bold",
                              isSelected ? "text-amber-300 dark:text-amber-700" : "text-stone-900 dark:text-stone-100"
                            )}>
                              {formatPrice(convertPrice(variantEffectivePrice))}
                            </span>
                            {hasVariantDiscount && (
                              <span className={cn(
                                "text-[10px] line-through",
                                isSelected ? "text-stone-400 dark:text-stone-500" : "text-stone-400 dark:text-stone-500"
                              )}>
                                {formatPrice(convertPrice(originalPriceForDisplay))}
                              </span>
                            )}
                          </div>
                          {variant.serves && (
                            <div className={cn(
                              "text-[10px] mt-0.5",
                              isSelected ? "text-stone-300 dark:text-stone-600" : "text-stone-400"
                            )}>
                              {variant.serves}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cake Specifications Quick Overview */}
            {hasCakeSpecs && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cake Specifications</span>
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {product.cakeAttributes?.flavor && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-medium flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Flavor:</span>
                      <span className="capitalize font-semibold">{product.cakeAttributes.flavor}</span>
                    </div>
                  )}
                  {product.cakeAttributes?.shape && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-medium flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Shape:</span>
                      <span className="capitalize font-semibold">{product.cakeAttributes.shape}</span>
                    </div>
                  )}
                  {product.cakeAttributes?.prepTime && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-medium flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Prep:</span>
                      <span className="capitalize font-semibold">{product.cakeAttributes.prepTime.replace(/-/g, ' ')}</span>
                    </div>
                  )}
                  {product.cakeAttributes?.occasion && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-medium flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Ideal For:</span>
                      <span className="capitalize font-semibold">{product.cakeAttributes.occasion}</span>
                    </div>
                  )}
                  {(!variants || variants.length === 0) && product.cakeAttributes?.weight && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-medium flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Weight:</span>
                      <span className="font-semibold">{product.cakeAttributes.weight}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Dietary Preference - ONLY displayed if configured in product form */}
            {isEggless !== undefined && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Dietary Preference
                </label>
                <div className="flex items-center gap-3">
                  {isEggless ? (
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                      <span>100% Eggless (Pure Veg)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0"></span>
                      <span>Contains Egg</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Message on Cake Input (optional personalization) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="cake-message" className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Message on Cake <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <span className={cn(
                  "text-[11px] font-mono",
                  cakeMessage.length >= maxMessageLength ? "text-rose-500 font-bold" : "text-stone-400"
                )}>
                  {cakeMessage.length}/{maxMessageLength}
                </span>
              </div>
              <div className="relative">
                <Input
                  id="cake-message"
                  value={cakeMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= maxMessageLength) {
                      setCakeMessage(e.target.value);
                    }
                  }}
                  placeholder="e.g. Happy Birthday! ♥"
                  maxLength={maxMessageLength}
                  className="h-11 rounded-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-sm focus-visible:ring-amber-500 pr-10"
                />
                {cakeMessage && (
                  <button
                    type="button"
                    onClick={() => setCakeMessage('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                Complimentary personalized chocolate plaque inscription.
              </p>
            </div>

            {/* 6. Delivery Options & Pincode Checking */}
            <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                      Delivery in Hyderabad & Secunderabad
                    </h3>
                    <p className="text-[11px] text-stone-500">Handled with celebration care</p>
                  </div>
                </div>
              </div>

              {/* PinCode Checker */}
              <div className="space-y-2">
                <PinCodeInput
                  value={pincodeVal}
                  onChange={(val) => {
                    setPincodeVal(val);
                    if (!val) {
                      setPincodeLocation(null);
                      setPincodeMessage('');
                    }
                  }}
                  placeholder="Enter 6-digit delivery pincode"
                  onSelectPinCode={(selection) => {
                    if (selection) {
                      setPincodeLocation(selection);
                      setIsPincodeValid(true);
                      setPincodeMessage(`Deliverable to ${selection.area}, ${selection.city}`);
                      localStorage.setItem('sbf_delivery_location', JSON.stringify(selection));
                      sessionStorage.setItem('sbf_entered_pincode', selection.code);
                    } else {
                      setPincodeLocation(null);
                      setIsPincodeValid(false);
                    }
                  }}
                  onValidationChange={(isValid, msg) => {
                    if (!isValid && msg) setPincodeMessage(msg);
                  }}
                  className="w-full"
                  inputClassName="h-10 text-xs rounded-xl bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800"
                />

                {pincodeMessage && (
                  <div className={cn(
                    "text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium",
                    isPincodeValid
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/50"
                  )}>
                    <span>{isPincodeValid ? '✓' : '⚠'}</span>
                    <span>{pincodeMessage}</span>
                  </div>
                )}
              </div>

              {/* Slots checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                {product.sameDay !== false && (
                  <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Same-Day (Order by 6 PM)</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Morning & Standard Slots</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Midnight Delivery</span>
                </div>
              </div>
            </div>

            {/* 7. Add-Ons: ONLY rendered if available in store */}
            {availableAddons.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-rose-500" />
                      <span>Make It Extra Special</span>
                    </h3>
                    <p className="text-[11px] text-stone-500">Pair your cake with celebration keepsakes</p>
                  </div>
                  {selectedAddonIds.size > 0 && (
                    <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-400 border-amber-300">
                      {selectedAddonIds.size} added (+{formatPrice(convertPrice(addonsCost))})
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {availableAddons.map((addon) => {
                    const isChecked = selectedAddonIds.has(addon._id);
                    return (
                      <div
                        key={addon._id}
                        onClick={() => toggleAddon(addon._id)}
                        className={cn(
                          "flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer group",
                          isChecked
                            ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-400/80 dark:border-amber-700/60 shadow-xs"
                            : "bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox */}
                          <div className={cn(
                            "w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0",
                            isChecked
                              ? "bg-amber-600 border-amber-600 text-white"
                              : "border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 group-hover:border-stone-400"
                          )}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {/* Image Thumbnail */}
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200/60 dark:border-stone-700">
                            <ProtectedImage
                              src={addon.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200'}
                              alt={addon.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                              {addon.name}
                            </div>
                            <div className="text-[10px] text-stone-500 truncate">
                              {addon.description || 'Celebration add-on'}
                            </div>
                          </div>
                        </div>

                        {/* Addon Price */}
                        <div className="text-right shrink-0 pl-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-white">
                            +{formatPrice(convertPrice(addon.price))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. Purchase Actions Row */}
            <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold font-mono text-stone-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add To Cart */}
                <Button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={isAdding || isOutOfStock}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 dark:from-stone-100 dark:to-stone-200 text-white dark:text-stone-950 hover:from-stone-800 hover:to-black font-semibold text-xs sm:text-sm tracking-wide shadow-md transition-all active:scale-[0.99] gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isOutOfStock ? 'OUT OF STOCK' : `ADD TO CART • ${formatPrice(convertPrice(totalPrice))}`}</span>
                </Button>
              </div>

              {/* Instant Checkout Button */}
              {!isOutOfStock && (
                <Button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={isAdding}
                  variant="outline"
                  className="w-full h-11 rounded-2xl border-stone-900/40 dark:border-stone-700 text-stone-900 dark:text-white hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-950 font-bold text-xs uppercase tracking-wider transition-all gap-2"
                >
                  <span>ORDER NOW FOR EXPRESS DELIVERY</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 9. Structured Description Tabs - Strictly Form-Driven */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-10 shadow-xs">
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-4 overflow-x-auto scrollbar-none">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all",
                  activeTab === tab.id
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="pt-6">
            {activeTab === 'about' && (
              <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base space-y-4">
                <p>
                  {product.description || 'Artisanal cake handcrafted for your special celebration by Spring Blossoms Florist.'}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && hasCakeSpecs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {product.cakeAttributes?.flavor && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Flavor</span>
                    <span className="text-sm font-semibold capitalize text-stone-900 dark:text-white mt-0.5 block">{product.cakeAttributes.flavor}</span>
                  </div>
                )}
                {product.cakeAttributes?.shape && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Shape</span>
                    <span className="text-sm font-semibold capitalize text-stone-900 dark:text-white mt-0.5 block">{product.cakeAttributes.shape}</span>
                  </div>
                )}
                {product.cakeAttributes?.weight && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Weight</span>
                    <span className="text-sm font-semibold text-stone-900 dark:text-white mt-0.5 block">{product.cakeAttributes.weight}</span>
                  </div>
                )}
                {product.cakeAttributes?.eggless !== undefined && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Dietary</span>
                    <span className="text-sm font-semibold text-stone-900 dark:text-white mt-0.5 block">
                      {product.cakeAttributes.eggless ? '100% Eggless (Pure Veg)' : 'Contains Egg'}
                    </span>
                  </div>
                )}
                {product.cakeAttributes?.prepTime && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Preparation Time</span>
                    <span className="text-sm font-semibold text-stone-900 dark:text-white mt-0.5 block">{product.cakeAttributes.prepTime.replace(/-/g, ' ')}</span>
                  </div>
                )}
                {product.cakeAttributes?.occasion && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Best For Occasion</span>
                    <span className="text-sm font-semibold text-stone-900 dark:text-white mt-0.5 block">{product.cakeAttributes.occasion}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && detailsList.length > 0 && (
              <div className="space-y-2.5">
                <ul className="space-y-2 list-none pl-0">
                  {detailsList.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                      <span className="text-amber-600 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'storage' && careList.length > 0 && (
              <div className="space-y-2.5">
                <ul className="space-y-2 list-none pl-0">
                  {careList.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                      <span className="text-amber-600 font-bold shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-3 text-sm text-stone-700 dark:text-stone-300">
                <p>
                  Hand-delivered with temperature care across Hyderabad & Secunderabad.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800">
                    <strong className="block text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-1">
                      Packaging Guarantee
                    </strong>
                    <span className="text-xs text-stone-600 dark:text-stone-400">
                      Secured in rigid presentation packaging to preserve icing and decorations in pristine condition.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800">
                    <strong className="block text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-1">
                      Delivery Timings
                    </strong>
                    <span className="text-xs text-stone-600 dark:text-stone-400">
                      Same-day, scheduled morning, standard and midnight delivery available during checkout.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 10. "Complete the Celebration" (Combos) */}
      {recommendedCombos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block">
                Complete The Celebration
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1">
                Pair This Cake with Fresh Flowers
              </h2>
            </div>
            <Link
              to="/cakes"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white flex items-center gap-1"
            >
              <span>View All Combos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommendedCombos.map((combo) => (
              <div
                key={combo._id}
                className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <ProtectedImage
                    src={combo.images?.[0] || combo.image}
                    alt={combo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-stone-950/85 backdrop-blur-md text-amber-300 text-[10px] uppercase font-bold tracking-wider">
                      Celebration Combo
                    </Badge>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="font-serif font-bold text-stone-900 dark:text-white group-hover:text-amber-700 transition-colors line-clamp-1">
                    {combo.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                    {combo.description || 'Curated celebration bundle.'}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="text-sm font-bold text-stone-900 dark:text-white">
                      {formatPrice(convertPrice(combo.price))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/product/${combo._id}`)}
                      className="rounded-xl text-xs h-8 px-3 border-stone-300 dark:border-stone-700 hover:bg-stone-900 hover:text-white transition-all"
                    >
                      View Combo
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. Customer Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <ProductReviews
          productId={product._id}
          productTitle={product.title}
          onReviewSubmit={onReviewSubmit}
        />
      </div>

      {/* 12. Zoom Modal Dialog */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsZoomOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <ProtectedImage
                src={images[activeImageIndex]}
                alt={product.title}
                className="w-full h-full object-contain max-h-[85vh]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 13. Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-stone-500 flex items-center gap-1 truncate">
              {selectedVariant ? (
                <span>{selectedVariant.label}</span>
              ) : (
                <span>{product.cakeAttributes?.weight || 'Standard'}</span>
              )}
              {isEggless !== undefined && (
                <>
                  <span>•</span>
                  <span>{isEggless ? 'Eggless' : 'Egg'}</span>
                </>
              )}
            </div>
            <div className="text-base font-bold font-serif text-stone-950 dark:text-white leading-tight">
              {formatPrice(convertPrice(totalPrice))}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => handleAddToCart(false)}
            disabled={isAdding || isOutOfStock}
            className="h-11 px-6 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold text-xs shadow-md tracking-wider"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            <span>ADD TO CART</span>
          </Button>
        </div>
      </div>

    </div>
  );
};

export default CakeProductDetail;
