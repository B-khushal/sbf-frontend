import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Trash2, ShoppingBag, RefreshCw, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface WishlistItem {
  id: string;
  title: string;
  image: string;
  price: number;
}

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

const WishlistPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { items, isLoading, loadWishlist, removeItem } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();

  // Debug logging
  console.log('WishlistPage render:', { items, isLoading, user });

  // Intersection observer for animations
  const [contentRef, contentInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Load wishlist when component mounts or user changes
  useEffect(() => {
    console.log('WishlistPage useEffect triggered:', { user });
    loadWishlist();
  }, [user]); // Remove loadWishlist from dependencies to prevent infinite loop

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    try {
      await loadWishlist();
    } catch (error) {
      console.error('Manual refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh wishlist",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Move item to cart and remove from wishlist
  const moveToCart = async (item: WishlistItem) => {
    try {
      // Validate item data
      if (!item.id || !item.title || typeof item.price !== 'number') {
        console.error('Invalid item data for cart:', item);
        toast({
          title: "Error",
          description: "Invalid item data",
          variant: "destructive",
          duration: 3000,
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
        category: '',
        discount: 0,
        images: [item.image],
        description: '',
        details: [],
        careInstructions: [],
        isNewArrival: false,
        isFeatured: false
      };
      
      addToCart(cartItem);
      
      await removeFromWishlist(item.id);
      toast({
        title: "Added to Cart! 🛒",
        description: `${item.title} has been moved to your cart`,
        duration: 3000,
      });
      
      // Redirect to cart page after successful addition
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (error) {
      console.error("Error moving item to cart:", error);
      toast({
        title: "Error",
        description: "Failed to move item to cart",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (id: string) => {
    try {
      if (!id) {
        console.error('Invalid item ID for removal:', id);
        toast({
          title: "Error",
          description: "Invalid item ID",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      await removeItem(id);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-secondary/3 to-accent/3 rounded-full blur-2xl animate-pulse" />
      </div>

      <motion.main 
        className="relative flex-1 pt-20 sm:pt-24 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.section 
          variants={itemVariants}
          className="px-4 sm:px-6 md:px-8 py-8 sm:py-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 sm:-translate-y-4">
                <div className="text-2xl sm:text-4xl text-red-400">💖</div>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-800 mb-4 sm:mb-6 pt-6 sm:pt-8 leading-tight">
                Your <span className="bg-gradient-to-r from-red-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">Wishlist</span>
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-16 sm:translate-x-32 -translate-y-2 sm:-translate-y-4">
                <div className="text-2xl sm:text-4xl text-yellow-400">✨</div>
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
              Your collection of favorite floral arrangements
            </p>
            
            {/* Stats Card */}
            <motion.div 
              className="max-w-sm sm:max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-current" />
                  <span className="text-base sm:text-lg font-bold text-gray-800">{items.length} item(s) saved</span>
                </div>
                <motion.button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl sm:rounded-2xl hover:shadow-lg transition-all text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>
              </div>
              

            </motion.div>
          </div>
        </motion.section>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-16 sm:pb-20">


          {isLoading && items.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="text-center py-12 sm:py-20"
            >
              <motion.div 
                className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-lg border border-white/20 max-w-2xl mx-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-spin" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 mb-3 sm:mb-4">Loading Your Wishlist...</h2>
                <p className="text-base sm:text-lg text-gray-600">Please wait while we fetch your saved items.</p>
              </motion.div>
            </motion.div>
          ) : !isLoading && items.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="text-center py-12 sm:py-20"
            >
              <motion.div 
                className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-lg border border-white/20 max-w-2xl mx-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-red-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 mb-3 sm:mb-4">Your Wishlist is Empty</h2>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">Start saving your favorite floral arrangements to see them here!</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => navigate("/shop")} 
                    className="px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Browse Products
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              ref={contentRef}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-4 sm:space-y-6"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  custom={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-3 sm:p-4 md:p-6">
                    {/* Mobile-First Layout */}
                    <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-6">
                      {/* Product Image - Larger on Mobile */}
                      <div className="w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0 shadow-sm">
                        <img
                          src={item.image || "/images/placeholder.jpg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/placeholder.jpg";
                          }}
                        />
                      </div>
                      
                      {/* Product Details - Better Mobile Layout */}
                      <div className="flex-1 min-w-0 text-center sm:text-left space-y-2 sm:space-y-1">
                        <h4 className="text-lg sm:text-xl font-black text-gray-800 leading-tight px-2 sm:px-0">{item.title}</h4>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <span className="text-xl sm:text-2xl font-black text-primary">₹{item.price.toFixed(2)}</span>
                          <div className="px-2 sm:px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 rounded-full">
                            <span className="text-xs sm:text-sm font-semibold text-red-600">❤️ Saved</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Improved Mobile Layout */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sm:w-auto">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto"
                        >
                          <Button 
                            onClick={() => moveToCart(item)} 
                            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 md:py-3 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base min-h-[44px]"
                          >
                            <ShoppingBag className="w-4 h-4 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-2" />
                            Add to Cart
                          </Button>
                        </motion.div>

                        <motion.button
                          onClick={() => removeFromWishlist(item.id)}
                          className="w-full sm:w-auto p-3 sm:p-2 md:p-3 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center min-h-[44px]"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="w-4 h-4 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                          <span className="ml-2 text-sm font-medium">Remove</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Continue Shopping */}
          {items.length > 0 && (
            <div className="text-center mt-12 sm:mt-16">
              <Button onClick={() => navigate('/shop')} className="text-sm sm:text-base">
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
};

export default WishlistPage;
