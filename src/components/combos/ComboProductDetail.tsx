import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ArrowRight,
  MessageSquare,
  Cake,
  Flower2,
  PackageCheck,
  Leaf,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Lock,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import useWishlist from '@/hooks/use-wishlist';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import ProtectedImage from '@/components/ui/ProtectedImage';
import PinCodeInput, { ServiceablePinCode } from '@/components/ui/PinCodeInput';
import ProductReviews from '@/components/ProductReviews';
import productService, { ProductData } from '@/services/productService';
import { getAddons, AddonProduct } from '@/services/addonService';
import { promptLoginForAddToCart } from '@/utils/cartAuthHelper';
import { Link, useNavigate } from 'react-router-dom';
import {
  extractComboComponents,
  getComboCakeVariants,
  ComboVariantOption,
  ComboComponentItem
} from '@/utils/comboHelpers';
import { getImageUrl } from '@/config';
import { CakeComboCard } from '@/components/cakes/CakeComboCard';

interface ComboProductDetailProps {
  product: ProductData & {
    _id: string;
    countInStock?: number;
  };
  onAddToCart: (item: any) => void;
  onReviewSubmit: () => void;
}

export const ComboProductDetail: React.FC<ComboProductDetailProps> = ({
  product,
  onAddToCart,
  onReviewSubmit,
}) => {
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();

  // 1. Extract Combo Components (Bouquet, Cake, and Additional items)
  const { bouquet, cake, allComponents, otherComponents } = useMemo(() => {
    return extractComboComponents(product);
  }, [product]);

  // 2. Extract and Manage Cake Weight Options (1/2 kg and 1 kg)
  const cakeVariants = useMemo<ComboVariantOption[]>(() => {
    return getComboCakeVariants(product, cake);
  }, [product, cake]);

  const [selectedVariant, setSelectedVariant] = useState<ComboVariantOption>(
    cakeVariants[0] || {
      label: '1/2 kg',
      title: '1/2 kg Cake + Bouquet',
      weight: '1/2 kg',
      serves: '4–6 People',
      price: Number(product.price) || 1299,
      comparePrice: Number(product.comparePrice) || Math.round((Number(product.price) || 1299) * 1.25),
      savings: Math.round((Number(product.price) || 1299) * 0.25),
      discountPercentage: 20,
      stock: 50,
    }
  );

  useEffect(() => {
    if (cakeVariants.length > 0) {
      const match = cakeVariants.find(v => v.label === selectedVariant?.label) || cakeVariants[0];
      setSelectedVariant(match);
    }
  }, [cakeVariants]);

  // 3. Images & Gallery Management
  const images = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      list.push(...product.images);
    } else if (product.image) {
      list.push(product.image);
    }

    // Add component images if not already in list
    if (bouquet?.image && !list.includes(bouquet.image)) {
      list.push(bouquet.image);
    }
    if (cake?.image && !list.includes(cake.image)) {
      list.push(cake.image);
    }

    return list.filter(Boolean).length > 0 ? list : ['/images/placeholder.svg'];
  }, [product, bouquet, cake]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // 4. Customizations State
  const [cakeMessage, setCakeMessage] = useState('');
  const maxCakeMessageLength = 30;

  const [greetingCardOpen, setGreetingCardOpen] = useState(false);
  const [cardRecipient, setCardRecipient] = useState('');
  const [cardSender, setCardSender] = useState('');
  const [cardMessage, setCardMessage] = useState('');

  // 5. Quantity & Stock
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = Boolean(product.countInStock !== undefined && product.countInStock <= 0);

  // 6. Upsell Add-ons
  const [availableAddons, setAvailableAddons] = useState<AddonProduct[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadAddons = async () => {
      try {
        const res = await getAddons({ status: 'active' });
        if (res.success && Array.isArray(res.addons)) {
          setAvailableAddons(res.addons.slice(0, 6));
        }
      } catch (err) {
        console.warn('Could not load upsell addons:', err);
      }
    };
    loadAddons();
  }, []);

  const selectedAddonsList = useMemo(() => {
    return availableAddons.filter(a => selectedAddonIds.has(a._id));
  }, [availableAddons, selectedAddonIds]);

  const addonsCost = useMemo(() => {
    return selectedAddonsList.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [selectedAddonsList]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds(prev => {
      const next = new Set(prev);
      if (next.has(addonId)) next.delete(addonId);
      else next.add(addonId);
      return next;
    });
  };

  // 7. Dynamic Price Calculation
  const unitPrice = selectedVariant.price + addonsCost;
  const totalPrice = unitPrice * quantity;
  const unitComparePrice = selectedVariant.comparePrice + addonsCost;
  const totalSavings = (selectedVariant.savings) * quantity;

  // Individual component value estimation for the bundle proposition
  const bouquetEstimatedValue = bouquet.price > 0 ? bouquet.price : Math.round(selectedVariant.price * 0.58);
  const cakeEstimatedValue = selectedVariant.label === '1 kg'
    ? Math.round(selectedVariant.price * 0.58)
    : Math.round(selectedVariant.price * 0.48);
  const individualCombinedTotal = bouquetEstimatedValue + cakeEstimatedValue;
  const comboBundleDiscount = Math.max(0, individualCombinedTotal - selectedVariant.price);

  // 8. Wishlist
  const comboId = String(product._id || product.id || '');
  const isInWishlist = wishlistItems.some(
    (item) => String(item.id) === comboId || String((item as any).productId) === comboId
  );
  const [isHeartPounding, setIsHeartPounding] = useState(false);

  const handleToggleWishlist = async () => {
    setIsHeartPounding(true);
    setTimeout(() => setIsHeartPounding(false), 500);

    try {
      if (isInWishlist) {
        await removeFromWishlist(comboId);
        toast({ title: 'Removed from Wishlist', description: `${product.title} was removed.` });
      } else {
        await addToWishlist({
          id: comboId,
          productId: comboId,
          title: product.title,
          price: selectedVariant.price,
          image: images[0],
        });
        toast({ title: 'Saved to Wishlist! ❤️', description: `${product.title} saved to your favorites.` });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update wishlist.' });
    }
  };

  // 9. Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} | Spring Blossoms Florist`,
          text: `Celebrate with this luxurious Bouquet + Cake Combo: ${product.title}`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link Copied!', description: 'Product link copied to clipboard.' });
    }
  };

  // Real reviews check
  const reviewCount = Number(product.numReviews || (product as any).reviewCount || 0);
  const ratingVal = Number(product.rating || 0);
  const hasReviews = ratingVal > 0 && reviewCount > 0;

  // 10. Pincode & Delivery Checking
  const [pincodeVal, setPincodeVal] = useState('');
  const [pincodeLocation, setPincodeLocation] = useState<ServiceablePinCode | null>(null);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [isPincodeValid, setIsPincodeValid] = useState(false);

  // 11. Related Combos Recommendations
  const [relatedCombos, setRelatedCombos] = useState<ProductData[]>([]);
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await productService.getProducts(1, 'combos');
        const list = res?.products || [];
        const filtered = list.filter((p: any) => String(p._id) !== comboId).slice(0, 3);
        setRelatedCombos(filtered);
      } catch (e) {
        console.warn('Error fetching related combos:', e);
      }
    };
    fetchRelated();
  }, [comboId]);

  // 12. Active Tab State
  const [activeTab, setActiveTab] = useState<'about' | 'items' | 'care' | 'delivery'>('about');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 13. Add to Cart Handler
  const handleAddToCartClick = (redirectCheckout = false) => {
    if (isOutOfStock) {
      return toast({
        variant: 'destructive',
        title: 'Out of Stock',
        description: 'This combo is currently out of stock.'
      });
    }

    try {
      setIsAddingToCart(true);

      const cartItemPayload = {
        id: `${product._id}_${selectedVariant.label}_${Date.now()}`,
        productId: product._id,
        title: product.title,
        price: unitPrice,
        originalPrice: unitComparePrice,
        discount: selectedVariant.discountPercentage,
        image: images[0],
        images,
        quantity,
        category: product.category || 'combos',
        catalogType: 'combo',
        selectedVariant: {
          label: selectedVariant.title,
          price: selectedVariant.price,
          stock: selectedVariant.stock,
        },
        customizations: {
          isCombo: true,
          isGiftBundle: true,
          giftComponents: allComponents.map(c => ({
            name: c.name,
            category: c.type === 'cake' ? `Cake (${selectedVariant.label})` : (c.type === 'bouquet' ? 'Bouquet' : c.category)
          })),
          cakeWeight: selectedVariant.weight,
          weight: selectedVariant.weight,
          cakeServes: selectedVariant.serves,
          cakeMessage: cakeMessage.trim() || undefined,
          eggless: true,
          greetingCard: cardMessage.trim() ? {
            recipient: cardRecipient.trim(),
            sender: cardSender.trim(),
            message: cardMessage.trim(),
          } : undefined,
          customMessage: cardMessage.trim() || undefined,
          addons: selectedAddonsList.map(a => ({
            id: a._id,
            name: a.name || a.title,
            price: a.price,
          })),
          addonTotal: addonsCost,
        }
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
        title: 'Combo Added to Bag! 🎉',
        description: `${product.title} (${selectedVariant.label} Cake) added to your shopping bag.`,
      });

      if (redirectCheckout) {
        setTimeout(() => {
          navigate('/cart');
        }, 300);
      }
    } catch (error) {
      console.error('Error adding combo to cart:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add combo to bag. Please try again.'
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-rose-50/25 to-amber-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-20">
      
      {/* Top Floating Breadcrumbs & Highlights */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-rose-100/70 dark:border-slate-800 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
          <nav className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium overflow-hidden whitespace-nowrap">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link to="/shop/combos" className="hover:text-rose-600 transition-colors">Combos & Hampers</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
              {product.title}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 rounded-full gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleWishlist}
              className={cn(
                "h-8 px-2.5 text-xs rounded-full gap-1.5 transition-colors",
                isInWishlist ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40" : "text-slate-600 hover:text-rose-600"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", isInWishlist && "fill-rose-600 stroke-rose-600", isHeartPounding && "scale-125 transition-transform")} />
              <span className="hidden sm:inline">{isInWishlist ? 'Saved' : 'Wishlist'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-10">
        
        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Dual Gallery & Interactive Connected Anatomy (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Main Stage Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-slate-800 shadow-[0_12px_40px_rgba(244,63,94,0.08)] group">
              <ProtectedImage
                src={getImageUrl(images[activeImageIndex]) || '/images/placeholder.svg'}
                alt={product.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out cursor-zoom-in"
                onClick={() => setIsZoomOpen(true)}
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Badge className="bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-[11px] px-3 py-1 rounded-full shadow-md uppercase tracking-wider gap-1.5 border-0">
                  <Gift className="w-3.5 h-3.5" /> Celebration Combo
                </Badge>
                {selectedVariant.discountPercentage > 0 && (
                  <Badge className="bg-emerald-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-sm gap-1 self-start">
                    <Sparkles className="w-3 h-3" /> {selectedVariant.discountPercentage}% SAVINGS
                  </Badge>
                )}
              </div>

              {/* Zoom Button */}
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Enlarge image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white dark:bg-slate-900",
                      activeImageIndex === idx
                        ? "border-rose-500 scale-105 shadow-md shadow-rose-500/20"
                        : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img
                      src={getImageUrl(img) || '/images/placeholder.svg'}
                      alt={`${product.title} thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 🔥 CONNECTED COMBO DUO SPOTLIGHT CARD */}
            <div className="rounded-3xl border border-rose-200/80 dark:border-rose-950/60 bg-gradient-to-br from-white via-rose-50/40 to-amber-50/30 dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center font-bold text-xs">
                    🎁
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Connected Celebration Duo
                    </h4>
                    <p className="text-[11px] text-slate-500">Handcrafted bouquet paired with freshly baked cake</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-700 dark:text-rose-300 font-bold">
                  2-in-1 Bundle
                </Badge>
              </div>

              {/* Side-by-Side Connected Cards */}
              <div className="relative grid grid-cols-2 gap-3 pt-1">
                
                {/* Bouquet Card */}
                <div
                  onClick={() => {
                    const bIdx = images.findIndex(img => img === bouquet.image);
                    if (bIdx >= 0) setActiveImageIndex(bIdx);
                  }}
                  className="group/item relative rounded-2xl p-3 bg-white/90 dark:bg-slate-850 border border-rose-100 dark:border-slate-800 hover:border-rose-300 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-rose-50 dark:bg-slate-800">
                      <img
                        src={getImageUrl(bouquet.image) || '/images/placeholder.svg'}
                        alt={bouquet.name}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                      />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/95 text-rose-800 shadow-2xs">
                        🌸 Flowers
                      </span>
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 group-hover/item:text-rose-600">
                        {bouquet.name}
                      </h5>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Check className="w-2.5 h-2.5" /> Farm Fresh Stems
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Click to inspect</p>
                </div>

                {/* PLUS CONNECTOR BADGE */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md ring-4 ring-white dark:ring-slate-900 animate-pulse">
                  +
                </div>

                {/* Cake Card */}
                <div
                  onClick={() => {
                    const cIdx = images.findIndex(img => img === cake.image);
                    if (cIdx >= 0) setActiveImageIndex(cIdx);
                  }}
                  className="group/item relative rounded-2xl p-3 bg-white/90 dark:bg-slate-850 border border-amber-100 dark:border-slate-800 hover:border-amber-300 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-amber-50 dark:bg-slate-800">
                      <img
                        src={getImageUrl(cake.image) || '/images/placeholder.svg'}
                        alt={cake.name}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                      />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/95 text-amber-800 shadow-2xs">
                        🎂 Cake
                      </span>
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 group-hover/item:text-amber-600">
                        {cake.name}
                      </h5>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Leaf className="w-2.5 h-2.5" /> 100% Eggless ({selectedVariant.label})
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Click to inspect</p>
                </div>

              </div>
            </div>

            {/* Trust Assurance Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Same-Day Delivery</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col items-center gap-1">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>100% Eggless Cake</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Freshness Guaranteed</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Product Details, Cake Weight Variants, Personalization & Cart (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Titles & Ratings */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/40">
                  {product.category || 'Celebration Combo'}
                </span>
                {hasReviews ? (
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <strong className="text-slate-800 dark:text-slate-200">
                      {ratingVal.toFixed(1)}
                    </strong>{' '}
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    <span>No reviews yet</span>
                  </span>
                )}
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Order now for Same-Day Handover
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                {product.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {product.description || `Delight them with this signature celebration pairing. Features a gorgeous fresh flower bouquet beautifully hand-tied alongside an artisan freshly baked cake.`}
              </p>
            </div>

            {/* 💰 DYNAMIC PRICING & COMBO DISCOUNT BREAKDOWN */}
            <div className="rounded-3xl p-5 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-transparent border border-rose-200/80 dark:border-rose-900/40 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatPrice(convertPrice(unitPrice))}
                  </span>
                  {unitComparePrice > unitPrice && (
                    <span className="text-base sm:text-lg text-slate-400 line-through font-semibold">
                      {formatPrice(convertPrice(unitComparePrice))}
                    </span>
                  )}
                </div>

                {selectedVariant.discountPercentage > 0 && (
                  <Badge className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    SAVE {formatPrice(convertPrice(selectedVariant.savings))} ({selectedVariant.discountPercentage}% OFF)
                  </Badge>
                )}
              </div>

              {/* Combo Value Proposition Breakdown Box */}
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/90 p-3.5 border border-rose-100 dark:border-slate-800 text-xs space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5 text-rose-500" />
                    {bouquet.name} (Bouquet)
                  </span>
                  <span>{formatPrice(convertPrice(bouquetEstimatedValue))}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Cake className="w-3.5 h-3.5 text-amber-500" />
                    {cake.name} ({selectedVariant.label} Cake)
                  </span>
                  <span>{formatPrice(convertPrice(cakeEstimatedValue))}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Regular Individual Price:</span>
                  <span className="line-through text-slate-400">{formatPrice(convertPrice(individualCombinedTotal))}</span>
                </div>
                <div className="flex items-center justify-between font-black text-emerald-600 dark:text-emerald-400 text-[13px]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Exclusive Combo Price:
                  </span>
                  <span>{formatPrice(convertPrice(selectedVariant.price))}</span>
                </div>
              </div>
            </div>

            {/* 🎂 CAKE WEIGHT / SIZE SELECTION: 1/2 KG & 1 KG OPTIONS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Cake className="w-4 h-4 text-rose-500" />
                  Select Cake Weight / Size *
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  🍃 100% Eggless
                </span>
              </div>

              {/* Segmented Cards: 1/2 KG and 1 KG */}
              <div className="grid grid-cols-2 gap-3.5">
                {cakeVariants.map((variant) => {
                  const isSelected = selectedVariant.label === variant.label;
                  const isOneKg = variant.label.includes('1 kg') || variant.label.includes('1kg');

                  return (
                    <button
                      key={variant.label}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={cn(
                        "relative text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between bg-white dark:bg-slate-900 shadow-2xs hover:shadow-sm",
                        isSelected
                          ? "border-rose-500 ring-2 ring-rose-500/20 bg-gradient-to-b from-rose-50/60 to-white dark:from-rose-950/30 dark:to-slate-900"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      {/* Top Pill / Badge */}
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                          isSelected
                            ? "bg-rose-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        )}>
                          {isOneKg ? 'Best Value 👑' : 'Most Popular ✨'}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Weight Label & Servings */}
                      <div>
                        <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {variant.label}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {variant.serves}
                        </p>
                      </div>

                      {/* Pricing Tag */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between w-full">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          {formatPrice(convertPrice(variant.price))}
                        </span>
                        {variant.savings > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            Save {formatPrice(convertPrice(variant.savings))}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ✍️ FREE MESSAGE ON CAKE */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900 p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                  Message on Cake (Complimentary)
                </label>
                <span className="text-[10px] text-slate-400">
                  {cakeMessage.length}/{maxCakeMessageLength} chars
                </span>
              </div>
              <Input
                placeholder="e.g. Happy Birthday Priya ❤️"
                value={cakeMessage}
                maxLength={maxCakeMessageLength}
                onChange={(e) => setCakeMessage(e.target.value)}
                className="h-9 text-xs bg-slate-50/70 dark:bg-slate-850 border-slate-200 dark:border-slate-700 focus:ring-rose-400"
              />
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Piped neatly in chocolate frosting on cake top surface.
              </p>
            </div>

            {/* 💌 COMPLIMENTARY GREETING MESSAGE CARD TOGGLE */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900 p-4 space-y-3 shadow-2xs">
              <button
                type="button"
                onClick={() => setGreetingCardOpen(!greetingCardOpen)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center text-xs">
                    💌
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Add a Complimentary Greeting Card
                    </h5>
                    <p className="text-[10px] text-slate-500">Printed on luxury embossed keepsake card stock</p>
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", greetingCardOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {greetingCardOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Recipient Name (e.g. Sarah)"
                        value={cardRecipient}
                        onChange={(e) => setCardRecipient(e.target.value)}
                        className="h-8 text-xs bg-slate-50 dark:bg-slate-850"
                      />
                      <Input
                        placeholder="From (e.g. With love, Rohan)"
                        value={cardSender}
                        onChange={(e) => setCardSender(e.target.value)}
                        className="h-8 text-xs bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                    <Textarea
                      placeholder="Write your heartfelt message here (up to 200 characters)..."
                      value={cardMessage}
                      maxLength={200}
                      onChange={(e) => setCardMessage(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-850 min-h-[60px]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 🎁 CELEBRATION ADD-ONS (UPSELL CAROUSEL) */}
            {availableAddons.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-rose-500" />
                    Make It Extra Special (Add-ons)
                  </label>
                  <span className="text-[10px] text-slate-500">Select any to include in hamper</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableAddons.map((addon) => {
                    const isChecked = selectedAddonIds.has(addon._id);
                    return (
                      <div
                        key={addon._id}
                        onClick={() => toggleAddon(addon._id)}
                        className={cn(
                          "p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 bg-white dark:bg-slate-900 select-none",
                          isChecked
                            ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-2xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        )}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={getImageUrl(addon.image || (addon.images && addon.images[0])) || '/images/placeholder.svg'}
                            alt={addon.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                            {addon.name || addon.title}
                          </p>
                          <p className="text-[10px] font-extrabold text-rose-600">
                            +{formatPrice(convertPrice(addon.price))}
                          </p>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                          isChecked ? "bg-rose-500 border-rose-500 text-white" : "border-slate-300 dark:border-slate-700"
                        )}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 📍 PINCODE & DELIVERY ESTIMATION */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Check Delivery Slot & Pincode
                </label>
                <span className="text-[10px] font-semibold text-rose-600">
                  Hyderabad & Secunderabad Only
                </span>
              </div>

              <PinCodeInput
                value={pincodeVal}
                onChange={setPincodeVal}
                onSelectLocation={setPincodeLocation}
                onValidationChange={(isValid, message) => {
                  setIsPincodeValid(isValid);
                  setPincodeMessage(message);
                }}
                placeholder="Enter 6-digit Pincode (e.g. 500034)"
              />

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Same-Day Standard: <strong>FREE</strong></span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Midnight Delivery: <strong>11 PM–12 AM</strong></span>
                </div>
              </div>
            </div>

            {/* 🛒 QUANTITY & CTA ACTIONS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Pill */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 p-1 shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-black text-sm text-slate-900 dark:text-slate-100">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag CTA */}
                <Button
                  onClick={() => handleAddToCartClick(false)}
                  disabled={isOutOfStock || isAddingToCart}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/25 gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isAddingToCart ? 'Adding Combo...' : `Add Combo to Bag • ${formatPrice(convertPrice(totalPrice))}`}
                </Button>
              </div>

              {/* Instant Buy Now Button */}
              <Button
                variant="outline"
                onClick={() => handleAddToCartClick(true)}
                disabled={isOutOfStock || isAddingToCart}
                className="w-full h-11 rounded-2xl border-2 border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs uppercase tracking-wider shadow-xs"
              >
                Instant Buy Now • Checkout Today
              </Button>

              <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                100% Secure Checkout • Temperature-Controlled Floral & Bakery Van Handover
              </p>
            </div>

          </div>

        </div>

        {/* 📑 TABBED DETAILS & SPECIFICATIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-900/50">
            {[
              { id: 'about', label: 'Combo Overview', icon: Sparkles },
              { id: 'items', label: 'What’s in the Box', icon: Gift },
              { id: 'care', label: 'Freshness & Care Guide', icon: Leaf },
              { id: 'delivery', label: 'Delivery & Policy', icon: Truck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                    isActive
                      ? "border-rose-600 text-rose-600 bg-white dark:bg-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {activeTab === 'about' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  The Story Behind This Celebration Combo
                </h3>
                <p>
                  Flowers express sentiments that words cannot capture, while cake sweetens every milestone memory. 
                  Our master florists and artisan pastry chefs collaborated to design this seamless duo so your celebration 
                  feels thoughtfully curated down to the finest detail.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-700 space-y-1.5">
                    <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <Flower2 className="w-4 h-4 text-rose-600" />
                      Handcrafted Fresh Blooms
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Sourced daily from sustainable high-altitude flower farms, each blossom is inspected for vibrant petals and stems.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700 space-y-1.5">
                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Cake className="w-4 h-4 text-amber-600" />
                      Fresh Bakery Craftsmanship
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      100% vegetarian, eggless recipe baked only upon order receipt to preserve authentic moisture and rich ganache layers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6 max-w-4xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Package Contents & Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allComponents.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-4 bg-slate-50/40 dark:bg-slate-850">
                      <img
                        src={getImageUrl(item.image) || '/images/placeholder.svg'}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 space-y-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                          {item.type}
                        </Badge>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {item.type === 'cake' ? `Selected weight: ${selectedVariant.label} • Serves: ${selectedVariant.serves}` : 'Handcrafted fresh arrangement'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Care Guidelines for Maximum Longevity
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <Flower2 className="w-4 h-4" /> Flower Bouquet Care
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <li>Unwrap the floral packaging and trim 1-2 cm off stem bottoms at a 45-degree angle.</li>
                      <li>Place stems immediately into a clean vase filled with cool, clean drinking water.</li>
                      <li>Keep away from direct Hyderabad sunshine, AC exhaust vents, and ripening fruit bowls.</li>
                      <li>Refresh vase water every 48 hours for flowers that stay vivid for 5–7 days.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Cake className="w-4 h-4" /> Cake Storage & Serving
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <li>Refrigerate cake immediately upon delivery (temperature 4°C to 8°C).</li>
                      <li>Remove cake from refrigerator approximately 20 minutes prior to candle cutting for optimal softness.</li>
                      <li>Best enjoyed within 48 hours of delivery.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Hyderabad & Secunderabad Delivery Commitment
                </h3>
                <p>
                  To preserve delicate floral stems and temperature-sensitive cake frosting, Spring Blossoms Florist operates 
                  a dedicated fleet of climate-controlled delivery vehicles across all pin codes in Hyderabad and Secunderabad.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-900 dark:text-slate-100 mb-1">Standard Handover:</strong>
                    Hand-delivered safely during daytime hours (10:00 AM – 8:00 PM).
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-900 dark:text-slate-100 mb-1">Midnight Surprise:</strong>
                    Delivered right at the celebration hour between 11:15 PM and 12:00 AM.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🌟 CUSTOMER REVIEWS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <ProductReviews
            productId={comboId}
            productTitle={product.title}
            onReviewSubmit={onReviewSubmit}
          />
        </div>

        {/* 🎁 RELATED COMBOS CAROUSEL */}
        {relatedCombos.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  You May Also Love
                </h3>
                <p className="text-xs text-slate-500">Other trending celebration combos & hampers</p>
              </div>
              <Link
                to="/shop/combos"
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                View All Combos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCombos.map((c) => (
                <CakeComboCard key={c._id || c.id} combo={c} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 🔍 LIGHTBOX IMAGE ZOOM MODAL */}
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
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={getImageUrl(images[activeImageIndex]) || '/images/placeholder.svg'}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ComboProductDetail;
