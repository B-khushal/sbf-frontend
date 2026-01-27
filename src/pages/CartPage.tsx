import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, Plus, Minus, ArrowRight, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCart from '@/hooks/use-cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import ContactModal from '@/components/ui/ContactModal';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PromoCodeInput from '@/components/PromoCodeInput';
import { useState } from 'react';
import type { PromoCodeValidationResult } from '@/services/promoCodeService';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

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
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateItemQuantity, removeItem, showContactModal, contactModalProduct, closeContactModal, loadCart } = useCart();
  const { formatPrice, convertPrice } = useCurrency();
  const { user } = useAuth();
  
  // State for promo code functionality
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
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

  // Load cart data when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadCart(user.id);
    } else {
      loadCart();
    }
  }, [user, loadCart]);

  // Calculate final total with promo code discount (apply discount to original INR amount, then convert)
  const finalTotal = appliedPromoCode ? (subtotal - appliedPromoCode.discount) : subtotal;
  
  const handleCheckout = () => {
    // Save promo code info to localStorage for checkout process
    if (appliedPromoCode) {
      localStorage.setItem('appliedPromoCode', JSON.stringify(appliedPromoCode));
    } else {
      localStorage.removeItem('appliedPromoCode');
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
                                <img 
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
                        <span className="text-sm sm:text-base text-gray-600">Shipping</span>
                        <span className="text-xs sm:text-sm text-gray-500">Calculated at checkout</span>
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
