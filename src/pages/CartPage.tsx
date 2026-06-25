import React from 'react';
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, Plus, Minus, ArrowRight, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCart from '@/hooks/use-cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getRecommendedAddons, AddonProduct } from '@/services/addonService';
import { toast } from '@/hooks/use-toast';
import ContactModal from '@/components/ui/ContactModal';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PromoCodeInput from '@/components/PromoCodeInput';
import { useState, useEffect } from 'react';
import type { PromoCodeValidationResult } from '@/services/promoCodeService';
import { cn } from '@/lib/utils';
import { calculateDeliveryFee } from '@/services/orderService';
import ProtectedImage from '@/components/ui/ProtectedImage';


// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, addToCart, updateItemQuantity, removeItem, showContactModal, contactModalProduct, closeContactModal } = useCart();
  const { formatPrice, convertPrice } = useCurrency();
  
  // States for Recommended Addons
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
      
      const cartItem = {
        _id: addon._id,
        id: addon._id,
        productId: addon._id,
        productModel: 'AddonProduct' as const,
        title: addon.name,
        price: displayPrice,
        image: addon.image,
        images: [addon.image, ...addon.galleryImages].filter(Boolean),
        quantity: 1,
        category: addon.category,
        discount: discountVal,
        description: addon.description
      };
      
      await addToCart(cartItem);
      toast({
        title: "Added to cart",
        description: `${addon.name} was successfully added to your gift!`,
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
  
  // State for promo code functionality
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
  } | null>(null);

  // State for dynamic delivery calculation
  const [deliveryCalculation, setDeliveryCalculation] = useState<{
    deliveryCharge: number;
    isFirstOrderFreeDelivery: boolean;
    standardFee: number;
  } | null>(null);
  
  // Intersection observer for animations
  const [summaryRef, summaryInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  // Calculate subtotal using item.price (which is already the custom price if present)
  const subtotal = items.reduce((total, item) => {
    return total + (item.price || 0) * (item.quantity || 0);
  }, 0);

  // Fetch dynamic delivery fee
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      try {
        const result = await calculateDeliveryFee({ subtotal });
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
    // Save promo code info to localStorage for checkout process
    if (appliedPromoCode) {
      localStorage.setItem('appliedPromoCode', JSON.stringify(appliedPromoCode));
    } else {
      localStorage.removeItem('appliedPromoCode');
    }
    // Save delivery fee info to localStorage for checkout process
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
    
    // Clear promo code when cart changes to avoid incorrect calculations
    // User will need to re-apply promo code with new cart total
    if (appliedPromoCode) {
      setAppliedPromoCode(null);
      localStorage.removeItem('appliedPromoCode');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    
    // Clear promo code when cart changes
    if (appliedPromoCode) {
      setAppliedPromoCode(null);
      localStorage.removeItem('appliedPromoCode');
    }
  };

  const handlePromoCodeApplied = (validationResult: PromoCodeValidationResult) => {
    if (validationResult.success && validationResult.data) {
      setAppliedPromoCode({
        code: validationResult.data.promoCode.code,
        discount: validationResult.data.discount.amount, // This is in INR from backend
        finalAmount: validationResult.data.order.finalAmount // This is in INR from backend
      });
    }
  };

  const handlePromoCodeRemoved = () => {
    setAppliedPromoCode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-secondary/3 to-accent/3 rounded-full blur-2xl animate-pulse" />
      </div>

      <motion.main 
        className="relative flex-1 pt-8 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section - Mobile Responsive */}
        <motion.section 
          variants={itemVariants}
          className="px-3 sm:px-6 md:px-8 py-12 sm:py-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 sm:-translate-y-4">
                <div className="text-2xl sm:text-4xl text-yellow-400">🛒</div>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-800 mb-4 sm:mb-6 pt-6 sm:pt-8 leading-tight">
                Your <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Cart</span>
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-16 sm:translate-x-32 -translate-y-2 sm:-translate-y-4">
                <div className="text-2xl sm:text-4xl text-yellow-400">✨</div>
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-12">
              Review your beautiful selection before checkout
            </p>

            {/* Delivery Notice - Mobile Responsive */}
            <motion.div 
              className="max-w-2xl mx-auto bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-yellow-800">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-sm sm:text-base">📍 Delivery Area</p>
                  <p className="text-xs sm:text-sm">Currently, we only deliver to Hyderabad, Telangana. We're working on expanding our delivery network soon!</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pb-12 sm:pb-20">
          {items.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="text-center py-12 sm:py-20"
            >
              <motion.div 
                className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg border border-white/20 max-w-2xl mx-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 mb-3 sm:mb-4">Your Cart is Empty</h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">Looks like you haven't added any products to your cart yet. Let's fix that!</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => navigate('/shop')} 
                    className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Start Shopping
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-12">
              {/* Product List */}
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-2"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 overflow-hidden">
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-secondary rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800">Cart Items ({items.length})</h2>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {items.map((item, index) => {
                        const imageUrl = item.images && item.images.length > 0
                          ? item.images[0]
                          : '/api/placeholder/64/64';

                        // Calculate price logic
                        const hasDiscount = item.discount > 0 && item.originalPrice && item.originalPrice > item.price;
                        const displayPrice = hasDiscount ? item.price : item.originalPrice || item.price;
                        const originalPrice = hasDiscount ? item.originalPrice : null;

                        return (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 hover:shadow-lg transition-all duration-300"
                          >
                            {/* Mobile Layout (stacked) */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
                              {/* Product Image */}
                              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                                <ProtectedImage 
                                  src={imageUrl} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder/64/64';
                                  }}
                                />
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 min-w-0 text-center sm:text-left">
                                <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h4>
                                
                                {item.customizations?.isGiftBundle && item.customizations?.giftComponents && (
                                  <div className="text-xs text-rose-600 bg-rose-50/70 border border-rose-100/50 rounded-xl p-3 mt-2 mb-3 text-left">
                                    <p className="font-bold mb-1.5 flex items-center gap-1">
                                      <span>💝 Included Items:</span>
                                    </p>
                                    <ul className="space-y-1 text-gray-600 list-none pl-0">
                                      {item.customizations.giftComponents.map((comp: any, idx: number) => (
                                        <li key={idx} className="flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                          <span className="capitalize font-semibold text-rose-500/90">{comp.category.replace('_', ' ')}:</span>
                                          <span className="truncate">{comp.name}</span>
                                        </li>
                                      ))}
                                    </ul>
                                    {item.customizations.customMessage && (
                                      <div className="mt-2.5 pt-2.5 border-t border-rose-200/40">
                                        <span className="font-bold flex items-center gap-1 mb-1">
                                          <span>💌 Card Message:</span>
                                        </span>
                                        <p className="italic text-gray-600 bg-white/50 rounded-lg p-2 border border-rose-100/30">
                                          "{item.customizations.customMessage}"
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                                  {originalPrice && (
                                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                                      {formatPrice(convertPrice(originalPrice))}
                                    </span>
                                  )}
                                  <span className={cn(
                                    "font-bold text-sm sm:text-base",
                                    hasDiscount ? "text-red-600" : "text-black"
                                  )}>
                                    {formatPrice(convertPrice(displayPrice))}
                                  </span>
                                </div>
                                
                                {/* Selected Variant Display */}
                                {item.selectedVariant && (
                                  <div className="text-xs text-gray-600 mb-2 text-center sm:text-left">
                                    Variant: {item.selectedVariant.label}
                                  </div>
                                )}
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-0">
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Qty:</span>
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <motion.button
                                      onClick={() => handleQuantityChange(item._id, (item.quantity || 0) - 1)}
                                      className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-secondary text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all text-sm"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      disabled={(item.quantity || 0) <= 1}
                                    >
                                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </motion.button>
                                    <span className="w-8 sm:w-12 text-center font-bold text-gray-800 text-sm sm:text-base">{item.quantity || 0}</span>
                                    <motion.button
                                      onClick={() => handleQuantityChange(item._id, (item.quantity || 0) + 1)}
                                      className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-secondary text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                      whileHover={{ scale: (item.quantity || 0) >= 5 ? 1 : 1.1 }}
                                      whileTap={{ scale: (item.quantity || 0) >= 5 ? 1 : 0.9 }}
                                      disabled={(item.quantity || 0) >= 5}
                                    >
                                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Price and Remove */}
                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-3">
                                <div className="text-lg sm:text-xl font-black text-gray-800">
                                  {formatPrice(convertPrice((displayPrice || 0) * (item.quantity || 0)))}
                                </div>
                                <motion.button
                                  onClick={() => handleRemoveItem(item._id)}
                                  className="inline-flex items-center gap-1 sm:gap-2 text-red-500 hover:text-red-700 transition-colors font-medium text-xs sm:text-sm"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="sm:inline">Remove</span>
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recommended Addons Section */}
                {recommendations.length > 0 && (
                  <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/20">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800 mb-1">
                      Make Your Gift More Special ✨
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-6 font-semibold">
                      Add optional gifting addons directly from the cart
                    </p>
                    
                    {addonsLoading ? (
                      <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-[180px] sm:w-[200px] shrink-0 bg-white/40 border border-white/20 rounded-2xl p-3 space-y-3 animate-pulse">
                            <div className="aspect-square bg-gray-200 rounded-xl" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                            <div className="h-8 bg-gray-250 rounded w-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory touch-pan-x">
                        {recommendations.map(addon => {
                          const inCart = items.find(item => (item.productId === addon._id || item._id === addon._id) && item.productModel === 'AddonProduct');
                          const displayPrice = addon.discountedPrice && addon.discountedPrice > 0 ? addon.discountedPrice : addon.price;
                          const originalPrice = addon.discountedPrice && addon.discountedPrice > 0 ? addon.price : null;
                          
                          return (
                            <div 
                              key={addon._id}
                              className="w-[180px] sm:w-[200px] shrink-0 snap-start bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                            >
                              <div>
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
                                  <ProtectedImage 
                                    src={addon.image || '/api/placeholder/200/200'} 
                                    alt={addon.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = '/api/placeholder/200/200';
                                    }}
                                  />
                                  {addon.badge && (
                                    <span className="absolute top-2 left-2 text-[10px] uppercase font-black text-white bg-gradient-to-r from-pink-500 to-rose-500 px-2 py-0.5 rounded-full shadow-sm">
                                      {addon.badge}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 mb-0.5">{addon.name}</h4>
                                <p className="text-[10px] text-gray-500 mb-2 font-semibold">{addon.category}</p>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-1.5 mb-3">
                                  <span className="text-xs sm:text-sm font-black text-primary">{formatPrice(convertPrice(displayPrice))}</span>
                                  {originalPrice && (
                                    <span className="text-[10px] text-gray-400 line-through font-medium">{formatPrice(convertPrice(originalPrice))}</span>
                                  )}
                                </div>
                                
                                {inCart ? (
                                  <div className="flex items-center justify-between bg-primary/10 rounded-xl p-1 border border-primary/20">
                                    <button 
                                      onClick={() => handleQuantityChange(inCart._id, inCart.quantity - 1)}
                                      className="w-6 h-6 bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex items-center justify-center hover:shadow active:scale-95 transition-all text-xs font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-bold text-primary">{inCart.quantity}</span>
                                    <button 
                                      onClick={() => handleQuantityChange(inCart._id, inCart.quantity + 1)}
                                      className="w-6 h-6 bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex items-center justify-center hover:shadow active:scale-95 transition-all text-xs font-bold disabled:opacity-50"
                                      disabled={inCart.quantity >= 5}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => handleAddAddon(addon)}
                                    className="w-full py-1.5 text-xs font-bold text-primary hover:text-white border border-primary hover:bg-gradient-to-r hover:from-primary hover:to-secondary rounded-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-1"
                                  >
                                    ADD
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              
              {/* Order Summary */}
              <motion.div 
                ref={summaryRef}
                initial="hidden"
                animate={summaryInView ? "visible" : "hidden"}
                variants={itemVariants}
                className="lg:col-span-1"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 lg:sticky lg:top-32">
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-secondary to-accent rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800">Order Summary</h3>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                        <span className="font-bold text-gray-800 text-sm sm:text-base">{formatPrice(convertPrice(subtotal))}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm sm:text-base text-gray-600 flex items-center gap-1.5">
                          <span className="text-rose-500">🚚</span> Delivery Charge
                        </span>
                        <span className="font-bold text-sm sm:text-base text-right">
                          {deliveryCalculation?.isFirstOrderFreeDelivery ? (
                            <span className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 justify-end">
                              <span className="text-gray-400 line-through text-xs">
                                {formatPrice(convertPrice(deliveryCalculation.standardFee))}
                              </span>
                              <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse whitespace-nowrap">
                                FREE DELIVERY
                              </span>
                            </span>
                          ) : (
                            formatPrice(convertPrice(deliveryCalculation?.deliveryCharge ?? 150))
                          )}
                        </span>
                      </div>

                      {/* Promo Code Section */}
                      <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                        <PromoCodeInput
                          orderAmount={subtotal}
                          orderItems={items}
                          onPromoCodeApplied={handlePromoCodeApplied}
                          onPromoCodeRemoved={handlePromoCodeRemoved}
                          appliedPromoCode={appliedPromoCode}
                        />
                      </div>

                      <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg sm:text-xl font-black text-gray-800">Total</span>
                          <span className="text-lg sm:text-xl font-black text-primary">{formatPrice(convertPrice(finalTotal))}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={handleCheckout} 
                          className="w-full h-12 sm:h-14 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300"
                        >
                          Proceed to Checkout
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-primary transition-all text-sm sm:text-base"
                          onClick={() => navigate('/shop')}
                        >
                          Continue Shopping
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.main>



      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={closeContactModal}
        productTitle={contactModalProduct}
      />
    </div>
  );
};

export default CartPage;
