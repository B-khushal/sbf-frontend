import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, Sparkles, Heart, Gift, Star } from 'lucide-react';

const CategoryMenu = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  const categories = [
    { 
      name: "🌹 Flowers", 
      path: "/shop?category=flowers", 
      emoji: "🌹",
      description: "Fresh blooms for every occasion",
      popular: true,
      subcategories: [
        { name: "Roses", path: "/shop?category=roses", count: 25 },
        { name: "Lilies", path: "/shop?category=lilies", count: 18 },
        { name: "Tulips", path: "/shop?category=tulips", count: 12 },
        { name: "Orchids", path: "/shop?category=orchids", count: 15 },
      ]
    },
    { 
      name: "🎂 Birthday", 
      path: "/shop?category=birthday", 
      emoji: "🎂",
      description: "Celebrate special moments",
      popular: true,
      subcategories: [
        { name: "Birthday Bouquets", path: "/shop?category=birthday-bouquets", count: 20 },
        { name: "Party Arrangements", path: "/shop?category=party-arrangements", count: 14 },
        { name: "Kids Birthday", path: "/shop?category=kids-birthday", count: 8 },
      ]
    },
    { 
      name: "💕 Anniversary", 
      path: "/shop?category=anniversary", 
      emoji: "💕",
      description: "Romantic gestures made perfect",
      popular: false,
      subcategories: [
        { name: "Romantic Bouquets", path: "/shop?category=romantic-bouquets", count: 22 },
        { name: "Premium Roses", path: "/shop?category=premium-roses", count: 16 },
        { name: "Love Arrangements", path: "/shop?category=love-arrangements", count: 11 },
      ]
    },
    { 
      name: "🧺 Baskets", 
      path: "/shop?category=baskets", 
      emoji: "🧺",
      description: "Elegant gift baskets",
      popular: false,
      subcategories: [
        { name: "Fruit Baskets", path: "/shop?category=fruit-baskets", count: 12 },
        { name: "Flower Baskets", path: "/shop?category=flower-baskets", count: 18 },
        { name: "Mixed Baskets", path: "/shop?category=mixed-baskets", count: 9 },
      ]
    },
    { 
      name: "🎁 Gifts", 
      path: "/shop?category=gifts", 
      emoji: "🎁",
      description: "Thoughtful gift collections",
      popular: true,
      subcategories: [
        { name: "Gift Sets", path: "/shop?category=gift-sets", count: 15 },
        { name: "Chocolates", path: "/shop?category=chocolates", count: 8 },
        { name: "Combo Packs", path: "/shop?category=combo-packs", count: 12 },
      ]
    },
    { 
      name: "🌿 Plants", 
      path: "/shop?category=plants", 
      emoji: "🌿",
      description: "Indoor & outdoor plants",
      popular: false,
      subcategories: [
        { name: "Indoor Plants", path: "/shop?category=indoor-plants", count: 20 },
        { name: "Succulents", path: "/shop?category=succulents", count: 14 },
        { name: "Garden Plants", path: "/shop?category=garden-plants", count: 10 },
      ]
    },
  ];

  const quickActions = [
    { icon: <Search size={14} />, label: "Browse All", path: "/shop", color: "bg-blue-500" },
    { icon: <Heart size={14} />, label: "Wishlist", path: "/wishlist", color: "bg-red-500" },
    { icon: <Gift size={14} />, label: "Gift Cards", path: "/gift-cards", color: "bg-green-500" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  const isActive = (path: string) => {
    if (path === "/shop" && pathname === "/shop") return true;
    if (path !== "/shop" && pathname.includes(path.split('?')[0])) return true;
    return false;
  };

  return (
    <motion.section 
      className="bg-white/98 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-30 shadow-lg"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Main Categories Bar */}
        <div className="flex items-center justify-between py-3 lg:py-4">
          {/* Categories */}
          <div className="flex items-center overflow-x-auto scrollbar-hide flex-1">
            <div className="flex space-x-1 sm:space-x-2 lg:space-x-3 min-w-max pr-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.path}
                  variants={itemVariants}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={category.path}
                    className={cn(
                      "relative px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium whitespace-nowrap rounded-xl transition-all duration-300 group flex items-center gap-2 border",
                      isActive(category.path)
                        ? "text-white bg-gradient-to-r from-primary via-secondary to-accent shadow-lg border-primary/20 scale-105"
                        : "text-gray-700 hover:text-primary bg-white/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 border-gray-200/50 hover:border-primary/30 hover:shadow-md hover:scale-102"
                    )}
                  >
                    <span className="text-base lg:text-lg group-hover:scale-110 transition-transform duration-200">
                      {category.emoji}
                    </span>
                    <span className="font-semibold">
                      {category.name.split(' ').slice(1).join(' ')}
                    </span>
                    
                    {category.popular && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                      >
                        <Sparkles size={8} className="text-white" />
                      </motion.div>
                    )}
                    
                    {/* Active indicator */}
                    {isActive(category.path) && (
                      <motion.div
                        layoutId="categoryActiveIndicator"
                        className="absolute bottom-0 left-1/2 w-8 h-1 bg-white rounded-full transform -translate-x-1/2 shadow-sm"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Hover Dropdown */}
                  <AnimatePresence>
                    {hoveredCategory === category.name && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{category.emoji}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {category.name.split(' ').slice(1).join(' ')}
                              </h4>
                              <p className="text-xs text-gray-500">{category.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 rounded-lg transition-all duration-200 group"
                              >
                                <span className="group-hover:text-primary font-medium">
                                  {sub.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">
                                    {sub.count}
                                  </span>
                                  <ChevronRight size={12} className="text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                              </Link>
                            ))}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <Link
                              to={category.path}
                              className="block w-full text-center py-2 text-sm font-medium text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 rounded-lg transition-all duration-200"
                            >
                              View All {category.name.split(' ').slice(1).join(' ')}
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2 ml-4">
            {quickActions.map((action) => (
              <motion.div
                key={action.path}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={action.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 hover:shadow-lg",
                    action.color
                  )}
                  title={action.label}
                >
                  {action.icon}
                  <span className="hidden xl:inline">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="lg:hidden border-t border-gray-100 py-2">
          <div className="flex justify-center space-x-4">
            {quickActions.map((action) => (
              <motion.div
                key={action.path}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={action.path}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-lg transition-all duration-300",
                    action.color
                  )}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CategoryMenu;