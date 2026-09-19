import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  ArrowRight, 
  Info, 
  Sparkles, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Truck, 
  CheckCircle2,
  ChevronRight,
  Gift,
  MapPin,
  Clock,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCart from '@/hooks/use-cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getRecommendedAddons, AddonProduct } from '@/services/addonService';
import { toast } from '@/hooks/use-toast';
import ContactModal from '@/components/ui/ContactModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PromoCodeInput from '@/components/PromoCodeInput';
import type { PromoCodeValidationResult } from '@/services/promoCodeService';
import { cn } from '@/lib/utils';
import { calculateDeliveryFee } from '@/services/orderService';
import ProtectedImage from '@/components/ui/ProtectedImage';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    items, 
    addToCart, 
    updateItemQuantity, 
    removeItem, 
    showContactModal, 
    contactModalProduct, 
    closeContactModal,
    updateItemCustomizations 
  } = useCart();
  
  const { formatPrice, convertPrice } = useCurrency();
  
  // State for Recommended Addons
  const [recommendations, setRecommendations] = useState<AddonProduct[]>([]);
  const [addonsLoading, setAddonsLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (items.length === 0) {
        setRecommendations([]);
        return;
      }
      setAddonsLoading(true);
      try {
        const res = await getRecommendedAddons(items);
        if (res.success) {
          setRecommendations(res.addons);
        }
      } catch (err) {
        console.error('Error fetching recommended addons:', err);
      } finally {
        setAddonsLoading(false);
      }
    };

    fetchRecommendations();
  }, [items]);

  const handleAddAddon = async (addon: AddonProduct) => {
    try {
      const displayPrice = addon.discountedPrice && addon.discountedPrice > 0 ? addon.discountedPrice : addon.price;
      const discountVal = addon.discountedPrice && addon.discountedPrice > 0 ? Math.round(((addon.price - addon.discountedPrice) / addon.price) * 100) : 0;
      
      const addonId = addon._id || (addon as any).id;
      const gallery = Array.isArray(addon.galleryImages) ? addon.galleryImages : [];
      const imagesList = [addon.image, ...gallery].filter(Boolean);

      const cartItem = {
        _id: addonId,
        id: addonId,
        productId: addonId,
        productModel: 'AddonProduct' as const,
        title: addon.name,
        price: displayPrice,
        image: addon.image || imagesList[0] || '',
        images: imagesList.length > 0 ? imagesList : [addon.image || ''],
        quantity: 1,
        category: addon.category,
        discount: discountVal,
        description: addon.description
      };
      
      await addToCart(cartItem);
      toast({
        title: "Added to gift",
        description: `${addon.name} has been added to your cart.`,
      });
    } catch (error: any) {
      console.error('Error adding addon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add addon product.",
        variant: "destructive",
      });
    }
  };
  
  // Promo code state
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
  } | null>(null);

  // Edit personalization modal state
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editError, setEditError] = useState('');

  // Dynamic delivery calculation state
  const [deliveryCalculation, setDeliveryCalculation] = useState<{
    deliveryCharge: number;
    isFirstOrderFreeDelivery: boolean;
    standardFee: number;
  } | null>(null);

  // Calculate subtotal using item.price
  const subtotal = items.reduce((total, item) => {
    return total + (item.price || 0) * (item.quantity || 0);
  }, 0);

  // Fetch dynamic delivery fee
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const userObj = userStr ? JSON.parse(userStr) : null;
        const result = await calculateDeliveryFee({
          subtotal,
          userId: userObj?.id || userObj?._id,
          email: userObj?.email,
          phone: userObj?.phone
        });
        setDeliveryCalculation(result);
      } catch (err) {
        console.error('Error fetching delivery calculation:', err);
      }
    };
    if (subtotal > 0) {
      fetchDeliveryFee();
    } else {
      setDeliveryCalculation(null);
    }
  }, [subtotal]);

  const deliveryFee = deliveryCalculation?.deliveryCharge ?? 0;

  // Calculate final total with promo code discount and delivery fee
  const finalTotal = (subtotal + deliveryFee) - (appliedPromoCode ? appliedPromoCode.discount : 0);
  
  const handleCheckout = () => {
    if (appliedPromoCode) {
      localStorage.setItem('appliedPromoCode', JSON.stringify(appliedPromoCode));
    } else {
      localStorage.removeItem('appliedPromoCode');
    }
    if (deliveryCalculation) {
      localStorage.setItem('checkoutDeliveryCalculation', JSON.stringify(deliveryCalculation));
    }
    navigate('/checkout/shipping');
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }
    
    updateItemQuantity(itemId, newQuantity);
    
    if (appliedPromoCode) {
      setAppliedPromoCode(null);
      localStorage.removeItem('appliedPromoCode');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    
    if (appliedPromoCode) {
      setAppliedPromoCode(null);
      localStorage.removeItem('appliedPromoCode');
    }
  };

  const handlePromoCodeApplied = (validationResult: PromoCodeValidationResult) => {
    if (validationResult.success && validationResult.data) {
      setAppliedPromoCode({
        code: validationResult.data.promoCode.code,
        discount: validationResult.data.discount.amount,
        finalAmount: validationResult.data.order.finalAmount
      });
    }
  };

  const handlePromoCodeRemoved = () => {
    setAppliedPromoCode(null);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditingText(item.customizations?.personalization?.value || '');
    setEditError('');
  };

  const validateEditText = (text: string, item: any) => {
    let transformed = text;
    const transform = item.textTransform || 'original';
    if (transform === 'uppercase') transformed = text.toUpperCase();
    else if (transform === 'lowercase') transformed = text.toLowerCase();
    else if (transform === 'titlecase') transformed = text.replace(/\b\w/g, c => c.toUpperCase());

    const allowed = item.allowedCharacters || {
      alphabets: true,
      numbers: false,
      spaces: true,
      hyphen: false,
      ampersand: false,
      period: false,
      emoji: false
    };

    const trimmedLength = transformed.trim().length;

    if (item.personalizationRequired && trimmedLength === 0) {
      return { valid: false, error: `${item.fieldLabel || 'Custom text'} is required.` };
    }

    if (trimmedLength > 0 && trimmedLength < (item.minCharacters || 1)) {
      return { valid: false, error: `Minimum ${item.minCharacters || 1} characters required.` };
    }

    if (trimmedLength > (item.maxCharacters || 10)) {
      return { valid: false, error: `Maximum ${item.maxCharacters || 10} characters allowed.` };
    }

    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\u2600-\u27BF|[\uE000-\uF8FF]|\u2010-\u201f|[\u2000-\u3300]/;

    for (let i = 0; i < transformed.length; i++) {
      const char = transformed[i];

      if (char === ' ') {
        if (!allowed.spaces) return { valid: false, error: "Spaces are not allowed." };
        continue;
      }

      if (char === '-') {
        if (!allowed.hyphen) return { valid: false, error: "Hyphens are not allowed." };
        continue;
      }

      if (char === '&') {
        if (!allowed.ampersand) return { valid: false, error: "Ampersands (&) are not allowed." };
        continue;
      }

      if (char === '.') {
        if (!allowed.period) return { valid: false, error: "Periods (.) are not allowed." };
        continue;
      }

      if (char >= '0' && char <= '9') {
        if (!allowed.numbers) return { valid: false, error: "Numbers are not allowed." };
        continue;
      }

      const isEmoji = emojiRegex.test(char) || (i + 1 < transformed.length && emojiRegex.test(transformed.substring(i, i + 2)));
      if (isEmoji) {
        if (!allowed.emoji) return { valid: false, error: "Emojis are not allowed." };
        if (emojiRegex.test(char)) continue;
        i++;
        continue;
      }

      const isLetter = (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
      if (isLetter) {
        if (!allowed.alphabets) return { valid: false, error: "Alphabets are not allowed." };
        continue;
      }

      return { valid: false, error: `Character "${char}" is not allowed.` };
    }

    return { valid: true, error: "" };
  };

  const handleSavePersonalization = async () => {
    if (!editingItem) return;

    const valResult = validateEditText(editingText, editingItem);
    if (!valResult.valid) {
      setEditError(valResult.error);
      return;
    }

    try {
      const transform = editingItem.textTransform || 'original';
      let transformedValue = editingText.trim();
      if (transform === 'uppercase') transformedValue = editingText.toUpperCase();
      else if (transform === 'lowercase') transformedValue = editingText.toLowerCase();
      else if (transform === 'titlecase') transformedValue = editingText.replace(/\b\w/g, c => c.toUpperCase());

      const charCount = transformedValue.length;
      const extraChars = Math.max(0, charCount - (editingItem.baseIncludedCharacters || 0));
      const extraPrice = extraChars * (editingItem.pricePerCharacter || 0);
      const personalizationCost = Math.min(editingItem.maxExtraPrice || Infinity, extraPrice);

      const itemBasePrice = editingItem.selectedVariant?.price || editingItem.originalPrice || editingItem.price;
      const itemBaseDiscountedPrice = editingItem.discount
        ? itemBasePrice - (itemBasePrice * editingItem.discount) / 100
        : itemBasePrice;

      const newPrice = itemBaseDiscountedPrice + personalizationCost;

      const updatedPersonalization = {
        ...editingItem.customizations.personalization,
        value: transformedValue,
        characterCount: charCount
      };

      const updatedCustomizations = {
        ...editingItem.customizations,
        personalization: updatedPersonalization
      };

      await updateItemCustomizations(editingItem._id || editingItem.id, updatedCustomizations, newPrice);

      setEditingItem(null);
      toast({
        title: "Personalization Updated",
        description: "Your custom card / bouquet text was updated.",
      });
    } catch (err: any) {
      console.error(err);
      setEditError(err.message || "Failed to update customization.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-blue-50/70 via-bloom-pink-50/50 to-bloom-green-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-rose-100 selection:text-rose-900 relative overflow-hidden">
      
      {/* Animated Floating Ambient Gradient Orbs (Website Signature Brand Glow) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 via-transparent to-primary/10 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
        
        {/* Navigation Breadcrumb & Stepper Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-200/70 dark:border-slate-800">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400 font-medium">
            <Link to="/" className="hover:text-stone-800 dark:hover:text-slate-200 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link to="/shop" className="hover:text-stone-800 dark:hover:text-slate-200 transition-colors">Boutique</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 dark:text-white font-semibold">Shopping Bag</span>
          </nav>

          {/* Stepper with Brand Gradient */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-stone-900 dark:text-white">
              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center text-[10px] font-bold shadow-xs">1</span>
              <span>Review Bag</span>
            </span>
            <span className="w-6 h-[1px] bg-stone-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="w-5 h-5 rounded-full border border-stone-300 dark:border-slate-700 flex items-center justify-center text-[10px]">2</span>
              <span>Delivery Address</span>
            </span>
            <span className="w-6 h-[1px] bg-stone-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="w-5 h-5 rounded-full border border-stone-300 dark:border-slate-700 flex items-center justify-center text-[10px]">3</span>
              <span>Payment</span>
            </span>
          </div>
        </div>

        {/* Header Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-white">
              Shopping <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Bag</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-primary/15 to-secondary/15 text-stone-800 dark:text-slate-200 border border-primary/20">
              {items.length} {items.length === 1 ? 'creation' : 'creations'}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400">
            Handcrafted with farm-fresh blooms & temperature-controlled delivery
          </p>
        </div>

        {/* Premium Delivery Caution Banner (Optimized: Compact on Mobile, Authoritative on Desktop) */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-pink-500/[0.05] to-amber-500/[0.08] dark:from-amber-400/[0.09] dark:to-orange-400/[0.05] border border-amber-300/80 dark:border-amber-700/60 p-2.5 sm:p-4 mb-4 sm:mb-6 backdrop-blur-xs shadow-[0_2px_12px_rgba(217,119,6,0.06)]">
          <div className="flex items-center sm:items-start gap-2.5 sm:gap-3.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-pink-500/20 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 border border-amber-400/40 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                  <span className="hidden sm:inline">Delivery Caution & Service Area</span>
                  <span className="sm:hidden">Service Notice</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-xs tracking-wider">
                  Hyderabad & Secunderabad Only
                </span>
              </div>
              <p className="text-[11px] sm:text-[13px] text-amber-900/90 dark:text-amber-200/90 leading-snug sm:leading-relaxed">
                <span className="sm:hidden">
                  Hand-delivered exclusively across <strong>Hyderabad & Secunderabad</strong> to preserve freshness. Deliveries outside twin cities cannot be processed.
                </span>
                <span className="hidden sm:inline">
                  To guarantee optimal floral freshness, delicate arrangement safety, and same-day express scheduling, Spring Blossoms Florist delivers <strong>strictly within Hyderabad and Secunderabad (Telangana)</strong>. Deliveries outside this twin cities metropolitan zone cannot be processed.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {items.length === 0 ? (
          /* Premium Empty Cart State */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-stone-200/80 dark:border-slate-800 p-8 sm:p-14 text-center max-w-lg mx-auto my-12 shadow-sm"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center mx-auto mb-4 shadow-md">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-2 font-serif">Your Bag is Empty</h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto mb-6 leading-relaxed">
              Explore our artisanal fresh flower bouquets, gourmet gift bundles, and seasonal floral collections.
            </p>
            <Button
              onClick={() => navigate('/shop')}
              className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 h-10 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Explore Floral Creations
            </Button>
          </motion.div>
        ) : (
          /* 2-Column Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Cart Items & Addons (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* First Order Free Delivery Banner (If applicable) */}
              {deliveryCalculation?.isFirstOrderFreeDelivery && (
                <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <span>Complimentary Hand-Delivery Unlocked</span>
                      <span className="text-[9px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2 py-0.5 rounded font-extrabold uppercase shadow-2xs">FIRST ORDER PRIVILEGE</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 truncate">
                      Free white-glove direct delivery anywhere in Hyderabad & Secunderabad on your first purchase.
                    </p>
                  </div>
                </div>
              )}

              {/* Items Container Card */}
              <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-5 py-3.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 dark:bg-slate-850/60 border-b border-stone-200/70 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-[10px]">
                      <ShoppingBag className="w-3 h-3" />
                    </div>
                    <span>Selected Arrangements & Items ({items.length})</span>
                  </div>
                  <span>Total Price</span>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-slate-850">
                  {items.map((item, index) => {
                    const imageUrl = item.images && item.images.length > 0
                      ? item.images[0]
                      : '/api/placeholder/80/80';

                    const hasDiscount = item.discount > 0 && item.originalPrice && item.originalPrice > item.price;
                    const displayPrice = hasDiscount ? item.price : item.originalPrice || item.price;
                    const originalPrice = hasDiscount ? item.originalPrice : null;

                    return (
                      <motion.div
                        key={item._id || item.id || index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 hover:bg-stone-50/40 dark:hover:bg-slate-850/30 transition-colors"
                      >
                        {/* Product Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 dark:bg-slate-800 border border-stone-200/70 dark:border-slate-700/60 shrink-0 relative group shadow-2xs">
                          <ProtectedImage
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/api/placeholder/80/80';
                            }}
                          />
                          {item.productModel === 'AddonProduct' && (
                            <span className="absolute bottom-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wider bg-stone-900/90 text-white px-1.5 py-0.5 rounded shadow-xs">
                              Addon
                            </span>
                          )}
                        </div>

                        {/* Product Information */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm sm:text-[15px] font-semibold text-stone-900 dark:text-white leading-snug line-clamp-2">
                                {item.title}
                              </h3>
                              
                              {/* Price */}
                              <div className="text-right shrink-0">
                                <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                                  {formatPrice(convertPrice((displayPrice || 0) * (item.quantity || 0)))}
                                </div>
                                {originalPrice && (
                                  <div className="text-[11px] text-stone-400 line-through">
                                    {formatPrice(convertPrice(originalPrice * (item.quantity || 0)))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Variant / Meta Details */}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {item.selectedVariant?.label && (
                                <span className="text-[11px] font-medium text-stone-700 dark:text-slate-300 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  Variant: {item.selectedVariant.label}
                                </span>
                              )}
                              {item.category && (
                                <span className="text-[11px] text-stone-400 capitalize">
                                  {item.category.replace(/_/g, ' ')}
                                </span>
                              )}
                              <span className="text-[11px] text-stone-400">
                                • {formatPrice(convertPrice(displayPrice || 0))} each
                              </span>
                            </div>

                            {/* Gift Components Details */}
                            {item.customizations?.isGiftBundle && item.customizations?.giftComponents && (
                              <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-[11px] space-y-1">
                                <p className="font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-1">
                                  <Gift className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Curated Gift Inclusions:</span>
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {item.customizations.giftComponents.map((comp: any, idx: number) => (
                                    <span key={idx} className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-800/40 text-stone-700 dark:text-slate-300 text-[10px] font-medium shadow-2xs">
                                      {comp.category ? `${comp.category.replace('_', ' ')}: ` : ''}{comp.name}
                                    </span>
                                  ))}
                                </div>
                                {item.customizations.customMessage && (
                                  <p className="italic text-stone-600 dark:text-slate-300 text-[11px] pt-1">
                                    "{item.customizations.customMessage}"
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Personalized Text Badge */}
                            {item.customizations?.personalization && (
                              <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent dark:bg-slate-800/60 border border-secondary/30 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                <div className="min-w-0 pr-2">
                                  <span className="text-[10px] text-primary dark:text-sky-400 uppercase font-bold tracking-wider block">
                                    {item.customizations.personalization.label || 'Custom Text'}
                                  </span>
                                  <span className="font-semibold text-stone-800 dark:text-slate-200 truncate block">
                                    "{item.customizations.personalization.value}"
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(item)}
                                  className="h-6 text-[11px] px-2.5 text-pink-600 hover:text-pink-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 rounded-md font-semibold shrink-0 transition-colors"
                                >
                                  Edit Text
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Stepper & Removal */}
                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 dark:border-slate-850">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-400 font-medium">Quantity:</span>
                              <div className="flex items-center bg-stone-100 dark:bg-slate-800 rounded-lg p-0.5 border border-stone-200/70 dark:border-slate-700/60">
                                <button
                                  onClick={() => handleQuantityChange(item._id || item.id, (item.quantity || 0) - 1)}
                                  disabled={(item.quantity || 0) <= 1}
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-stone-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center font-bold text-xs text-stone-900 dark:text-slate-100">
                                  {item.quantity || 0}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item._id || item.id, (item.quantity || 0) + 1)}
                                  disabled={(item.quantity || 0) >= 5}
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-stone-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item._id || item.id)}
                              className="text-xs text-stone-400 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1 p-1 rounded-md transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Gift Addons Section */}
              {recommendations.length > 0 && (
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-3xl border border-stone-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                        Thoughtful <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Accompanying Gifts</span>
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Chocolates, cards, teddy bears & celebration accompaniments
                      </p>
                    </div>
                  </div>

                  {addonsLoading ? (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-[140px] shrink-0 bg-stone-50 dark:bg-slate-800 rounded-2xl p-2.5 animate-pulse space-y-2">
                          <div className="aspect-square bg-stone-200 dark:bg-slate-700 rounded-xl" />
                          <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-3/4" />
                          <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-slate-800">
                      {recommendations.map((addon) => {
                        const inCart = items.find(item => (item.productId === addon._id || item._id === addon._id) && item.productModel === 'AddonProduct');
                        const displayPrice = addon.discountedPrice && addon.discountedPrice > 0 ? addon.discountedPrice : addon.price;
                        const originalPrice = addon.discountedPrice && addon.discountedPrice > 0 ? addon.price : null;

                        return (
                          <div
                            key={addon._id}
                            className="w-[145px] sm:w-[155px] shrink-0 bg-stone-50/70 dark:bg-slate-800/40 rounded-2xl border border-stone-200/70 dark:border-slate-700/60 p-2.5 flex flex-col justify-between hover:shadow-xs transition-shadow"
                          >
                            <div>
                              <div className="relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-800 mb-2">
                                <ProtectedImage
                                  src={addon.image || '/api/placeholder/150/150'}
                                  alt={addon.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder/150/150';
                                  }}
                                />
                                {addon.badge && (
                                  <span className="absolute top-1 left-1 text-[8px] uppercase font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white px-1.5 py-0.2 rounded shadow-xs">
                                    {addon.badge}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-semibold text-stone-800 dark:text-slate-200 line-clamp-1">
                                {addon.name}
                              </h4>
                              <p className="text-[10px] text-stone-400 capitalize">
                                {addon.category}
                              </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-stone-200/50 dark:border-slate-700/40">
                              <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-xs font-bold text-stone-900 dark:text-white">
                                  {formatPrice(convertPrice(displayPrice))}
                                </span>
                                {originalPrice && (
                                  <span className="text-[10px] text-stone-400 line-through">
                                    {formatPrice(convertPrice(originalPrice))}
                                  </span>
                                )}
                              </div>

                              {inCart ? (
                                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-stone-200 dark:border-slate-700">
                                  <button
                                    onClick={() => handleQuantityChange(inCart._id, inCart.quantity - 1)}
                                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-stone-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold">{inCart.quantity}</span>
                                  <button
                                    onClick={() => handleQuantityChange(inCart._id, inCart.quantity + 1)}
                                    disabled={inCart.quantity >= 5}
                                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-stone-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 disabled:opacity-40"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddAddon(addon)}
                                  className="w-full h-7 text-[11px] font-bold rounded-lg border border-primary/40 text-primary hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:border-transparent transition-all shadow-2xs"
                                >
                                  + Add
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Order Summary (4 Cols, Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-stone-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <h2 className="text-base font-bold text-stone-900 dark:text-white pb-3 mb-4 border-b border-stone-150 dark:border-slate-800 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-[11px] font-medium text-stone-400">INR Pricing</span>
                </h2>

                <div className="space-y-3 text-xs">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-stone-600 dark:text-slate-300">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-stone-900 dark:text-white text-sm">
                      {formatPrice(convertPrice(subtotal))}
                    </span>
                  </div>

                  {/* Delivery Fee */}
                  <div className="flex justify-between items-center text-stone-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>Delivery (Twin Cities)</span>
                      <span title="Hand-delivery across Hyderabad and Secunderabad" className="cursor-help inline-flex items-center">
                        <Info className="w-3 h-3 text-stone-400" />
                      </span>
                    </span>
                    <div>
                      {deliveryCalculation?.isFirstOrderFreeDelivery ? (
                        <div className="flex items-center gap-1.5">
                          <span className="line-through text-stone-400 text-[11px]">
                            {formatPrice(convertPrice(deliveryCalculation.standardFee))}
                          </span>
                          <span className="font-bold text-white text-xs bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-0.5 rounded shadow-2xs">
                            FREE
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-stone-900 dark:text-white">
                          {formatPrice(convertPrice(deliveryCalculation?.deliveryCharge ?? 150))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Promo Code Discount if applied */}
                  {appliedPromoCode && appliedPromoCode.discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Coupon Applied ({appliedPromoCode.code})</span>
                      <span>-{formatPrice(convertPrice(appliedPromoCode.discount))}</span>
                    </div>
                  )}

                  {/* Promo Code Section */}
                  <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                    <PromoCodeInput
                      orderAmount={subtotal}
                      orderItems={items}
                      onPromoCodeApplied={handlePromoCodeApplied}
                      onPromoCodeRemoved={handlePromoCodeRemoved}
                      appliedPromoCode={appliedPromoCode}
                    />
                  </div>

                  {/* Estimated Grand Total */}
                  <div className="pt-3.5 border-t border-stone-200 dark:border-slate-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-bold text-stone-900 dark:text-white block">
                        Estimated Total
                      </span>
                      <span className="text-[10px] text-stone-400">
                        GST & handling charges included
                      </span>
                    </div>
                    <span className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white">
                      {formatPrice(convertPrice(finalTotal))}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-5 space-y-2.5">
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to Delivery</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate('/shop')}
                    className="w-full h-9 text-xs text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white rounded-xl font-medium"
                  >
                    Continue Shopping
                  </Button>
                </div>

                {/* Trust & Reassurance Badges */}
                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[11px] text-stone-600 dark:text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>100% Secure Online Payment (Razorpay)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-stone-600 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Farm-Fresh Blooms Handpicked on Order Date</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-stone-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Scheduled Slot & Midnight Delivery Available</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={closeContactModal}
        productTitle={contactModalProduct}
      />

      {/* Edit Personalization Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-150 dark:border-slate-800">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <span>Edit Personalization</span>
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingItem(null)}
                  className="h-7 w-7 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-slate-300">
                    {editingItem.fieldLabel || 'Custom Text'}
                  </Label>
                  <Input
                    value={editingText}
                    placeholder={editingItem.placeholder || 'Enter custom text'}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const maxLimit = editingItem.maxCharacters || 10;
                      if (raw.length <= maxLimit) {
                        setEditingText(raw);
                      }
                    }}
                    className="rounded-xl text-xs h-9 focus-visible:ring-rose-500"
                  />
                  
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                    <span>{editingItem.helperText || 'Capitalization will follow bouquet format.'}</span>
                    <span className="font-semibold">
                      {editingText.length} / {editingItem.maxCharacters || 10}
                    </span>
                  </div>

                  {editError && (
                    <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>{editError}</span>
                    </p>
                  )}
                </div>

                {editingText.trim().length > 0 && (
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/60 dark:border-slate-700/60 text-center">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-0.5">
                      Preview
                    </span>
                    <div className="text-xs font-bold text-stone-800 dark:text-slate-100 flex items-center justify-center gap-1">
                      <span>❤️</span>
                      <span>
                        {(() => {
                          const transform = editingItem.textTransform || 'original';
                          let txt = editingText.trim();
                          if (transform === 'uppercase') return txt.toUpperCase();
                          if (transform === 'lowercase') return txt.toLowerCase();
                          if (transform === 'titlecase') return txt.replace(/\b\w/g, c => c.toUpperCase());
                          return txt;
                        })()}
                      </span>
                      <span>❤️</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl text-xs h-8 px-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePersonalization}
                  className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-95 text-white rounded-xl text-xs h-8 px-4 font-semibold shadow-xs transition-all"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
