import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Trash2, ShoppingBag, RefreshCw, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
  const { items, removeItem, isLoading, refreshWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  // Intersection observer for animations
  const [contentRef, contentInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your wishlist",
        variant: "destructive",
        duration: 4000,
      });
      navigate('/login', { 
        state: { 
          redirect: '/wishlist',
          message: "Please login to view your wishlist"
        } 
      });
    }
  }, [user, navigate, toast]);

  // Move item to cart and remove from wishlist
  const moveToCart = async (item: WishlistItem) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    try {
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
      
      await addToCart(cartItem);
      await removeItem(item.id);
      
      toast({
        title: "Added to Cart! 🛒",
        description: `${item.title} has been moved to your cart`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error moving item to cart:', error);
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
      await removeItem(id);
      toast({
        title: "Removed from Wishlist 💔",
        description: "Item has been removed from your wishlist",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // If user is not authenticated, show loading or redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <motion.main 
        className="pt-20 sm:pt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <motion.section 
          className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-8 sm:mb-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-4 sm:mb-6">
                My Wishlist
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Your saved favorites are waiting here. Move them to your cart when you're ready to purchase!
              </p>
            </motion.div>

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
                  onClick={refreshWishlist}
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
          {isLoading ? (
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
          ) : items.length === 0 ? (
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
