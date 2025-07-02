import React, { useState, useRef, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CategoryMenu = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (categoryName: string) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setHoveredCategory(categoryName);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  useLayoutEffect(() => {
    if (hoveredCategory && navRef.current) {
      const categoryIndex = categories.findIndex(c => c.name === hoveredCategory);
      const itemRef = itemRefs.current[categoryIndex];
      const navRect = navRef.current.getBoundingClientRect();
      
      if (itemRef) {
        const itemRect = itemRef.getBoundingClientRect();
        const left = itemRect.left - navRect.left + itemRect.width / 2;
        setDropdownPosition({ left });
      }
    }
  }, [hoveredCategory]);
  
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

  const activeCategory = categories.find(c => c.name === hoveredCategory);

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transformOrigin: "top center"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transformOrigin: "top center",
      transition: { 
        duration: 0.3, 
        ease: "easeOut",
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transformOrigin: "top center",
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const subcategoryVariants = {
    hidden: { 
      x: -30, 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8
      }
    }
  };

  const subcategoryContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const isActive = (path: string) => {
    if (path === "/shop" && pathname === "/shop") return true;
    if (path !== "/shop" && pathname.includes(path.split('?')[0])) return true;
    return false;
  };

  return (
    <nav 
      className="bg-white/98 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-[60] shadow-sm" 
      ref={navRef}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container relative mx-auto px-3 sm:px-4 lg:px-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center justify-start py-3 lg:py-4">
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {categories.map((category, index) => (
                <div
                  key={category.path}
                  onMouseEnter={() => handleMouseEnter(category.name)}
                  ref={el => itemRefs.current[index] = el}
                >
                  <Link
                    to={category.path}
                    className={cn(
                      "relative px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-300 group flex items-center gap-2 border",
                      isActive(category.path)
                        ? "text-white bg-primary shadow-lg"
                        : "text-gray-600 hover:text-primary bg-gray-50 hover:bg-white border-transparent hover:border-primary/30 hover:shadow-md"
                    )}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                      {category.emoji}
                    </span>
                    <span className="font-semibold">
                      {category.name.split(' ').slice(1).join(' ')}
                    </span>
                    <ChevronDown 
                      size={14} 
                      className={cn(
                        "transition-transform duration-200",
                        hoveredCategory === category.name ? "rotate-180" : ""
                      )}
                    />
                    {category.popular && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                        <Sparkles size={10} className="text-white" />
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full mt-2 bg-white rounded-xl shadow-lg border w-72 overflow-hidden z-[100]"
              style={{ 
                left: `${dropdownPosition.left}px`,
                transform: 'translateX(-50%)',
              }}
              onMouseEnter={() => handleMouseEnter(activeCategory.name)}
            >
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeCategory.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {activeCategory.name.split(' ').slice(1).join(' ')}
                    </h3>
                    <p className="text-sm text-gray-500">{activeCategory.description}</p>
                  </div>
                </div>
              </div>

              <motion.div 
                className="p-2"
                variants={subcategoryContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {activeCategory.subcategories.map((sub) => (
                  <motion.div
                    key={sub.path}
                    variants={subcategoryVariants}
                    className="overflow-hidden"
                  >
                    <Link
                      to={sub.path}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary/8 hover:to-secondary/8 transition-all duration-300 group transform hover:scale-[1.02]"
                      onClick={() => setHoveredCategory(null)}
                    >
                      <span className="text-gray-700 group-hover:text-primary font-medium transition-colors duration-200">
                        {sub.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 group-hover:text-primary/60 transition-colors duration-200 bg-gray-50 group-hover:bg-primary/10 px-2 py-1 rounded-full">
                          {sub.count}
                        </span>
                        <motion.div
                          whileHover={{ x: 2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors duration-200" />
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <div className="border-t border-gray-100">
                <Link
                  to={activeCategory.path}
                  className="block p-4 text-center text-sm font-medium text-primary hover:text-secondary bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all duration-300"
                  onClick={() => setHoveredCategory(null)}
                >
                  View All {activeCategory.name.split(' ').slice(1).join(' ')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default CategoryMenu; 