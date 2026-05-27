import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import productService from '@/services/productService';

const CategoryMenu = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0 });
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownAlignRight, setDropdownAlignRight] = useState(false);

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

  // Fetch category counts on component mount
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setIsLoadingCounts(true);
        const counts = await productService.getCategoriesWithCounts();
        const countsMap: { [key: string]: number } = {};
        counts.forEach(item => {
          countsMap[item.name.toLowerCase()] = item.count;
        });
        setCategoryCounts(countsMap);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  useLayoutEffect(() => {
    if (hoveredCategory && navRef.current) {
      const categoryIndex = categories.findIndex(c => c.name === hoveredCategory);
      const itemRef = itemRefs.current[categoryIndex];
      const navRect = navRef.current.getBoundingClientRect();
      
      if (itemRef) {
        const itemRect = itemRef.getBoundingClientRect();
        const left = itemRect.left - navRect.left + itemRect.width / 2;
        setDropdownPosition({ left });
        // Check for overflow
        const dropdownWidth = 288; // w-72 = 18rem = 288px
        const dropdownLeft = itemRect.left + itemRect.width / 2 - dropdownWidth / 2;
        const dropdownRight = dropdownLeft + dropdownWidth;
        if (dropdownRight > window.innerWidth - 16) { // 16px margin
          setDropdownAlignRight(true);
        } else {
          setDropdownAlignRight(false);
        }
      }
    }
  }, [hoveredCategory]);

  // Helper function to get count for a category
  const getCategoryCount = (categoryName: string): number => {
    const key = categoryName.toLowerCase();
    return categoryCounts[key] || 0;
  };
  
  const categories = [
    { 
      name: "🌹 Flowers", 
      path: "/shop/flowers", 
      emoji: "🌹",
      description: "Fresh blooms for every occasion",
      popular: true,
      subcategories: [
        { name: "Roses", path: "/shop/roses", count: getCategoryCount("roses") },
        { name: "Lilies", path: "/shop/lilies", count: getCategoryCount("lilies") },
        { name: "Tulips", path: "/shop/tulips", count: getCategoryCount("tulips") },
        { name: "Orchids", path: "/shop/orchids", count: getCategoryCount("orchids") },
        { name: "Sunflowers", path: "/shop/sunflowers", count: getCategoryCount("sunflowers") },
      ]
    },
    { 
      name: "🍫 Chocolate", 
      path: "/shop/chocolate", 
      emoji: "🍫",
      description: "Delicious chocolate arrangements",
      popular: true,
      subcategories: [
        { name: "Chocolate Baskets", path: "/shop/chocolate-baskets", count: getCategoryCount("chocolate baskets") },
        { name: "Chocolate Bouquets", path: "/shop/chocolate-bouquets", count: getCategoryCount("chocolate bouquets") },
        { name: "Chocolate Gift Sets", path: "/shop/chocolate-gift-sets", count: getCategoryCount("chocolate gift sets") },
        { name: "Premium Chocolates", path: "/shop/premium-chocolates", count: getCategoryCount("premium chocolates") },
      ]
    },
    { 
      name: "🎂 Birthday", 
      path: "/shop/birthday", 
      emoji: "🎂",
      description: "Celebrate special moments",
      popular: true,
      subcategories: [
        { name: "Birthday Bouquets", path: "/shop/birthday-bouquets", count: getCategoryCount("birthday bouquets") },
        { name: "Party Arrangements", path: "/shop/party-arrangements", count: getCategoryCount("party arrangements") },
        { name: "Kids Birthday", path: "/shop/kids-birthday", count: getCategoryCount("kids birthday") },
        { name: "Birthday Cakes", path: "/shop/birthday-cakes", count: getCategoryCount("birthday cakes") },
      ]
    },
    { 
      name: "💕 Anniversary", 
      path: "/shop/anniversary", 
      emoji: "💕",
      description: "Romantic gestures made perfect",
      popular: false,
      subcategories: [
        { name: "Romantic Bouquets", path: "/shop/romantic-bouquets", count: getCategoryCount("romantic bouquets") },
        { name: "Premium Roses", path: "/shop/premium-roses", count: getCategoryCount("premium roses") },
        { name: "Love Arrangements", path: "/shop/love-arrangements", count: getCategoryCount("love arrangements") },
        { name: "Anniversary Gifts", path: "/shop/anniversary-gifts", count: getCategoryCount("anniversary gifts") },
      ]
    },
    { 
      name: "🧺 Baskets", 
      path: "/shop/baskets", 
      emoji: "🧺",
      description: "Elegant gift baskets",
      popular: false,
      subcategories: [
        { name: "Fruit Baskets", path: "/shop/fruit-baskets", count: getCategoryCount("fruit baskets") },
        { name: "Flower Baskets", path: "/shop/flower-baskets", count: getCategoryCount("flower baskets") },
        { name: "Mixed Baskets", path: "/shop/mixed-baskets", count: getCategoryCount("mixed baskets") },
        { name: "Gift Hampers", path: "/shop/gift-hampers", count: getCategoryCount("gift hampers") },
      ]
    },
    { 
      name: "🎁 Combos", 
      path: "/shop/combos", 
      emoji: "🎁",
      description: "Perfect combo packages",
      popular: true,
      subcategories: [
        { name: "Birthday Combos", path: "/shop/birthday-combos", count: getCategoryCount("birthday combos") },
        { name: "Anniversary Combos", path: "/shop/anniversary-combos", count: getCategoryCount("anniversary combos") },
        { name: "Romantic Combos", path: "/shop/romantic-combos", count: getCategoryCount("romantic combos") },
        { name: "Special Occasion Combos", path: "/shop/special-occasion-combos", count: getCategoryCount("special occasion combos") },
      ]
    },
    { 
      name: "🌿 Plants", 
      path: "/shop/plants", 
      emoji: "🌿",
      description: "Indoor & outdoor plants",
      popular: false,
      subcategories: [
        { name: "Indoor Plants", path: "/shop/indoor-plants", count: getCategoryCount("indoor plants") },
        { name: "Succulents", path: "/shop/succulents", count: getCategoryCount("succulents") },
        { name: "Garden Plants", path: "/shop/garden-plants", count: getCategoryCount("garden plants") },
        { name: "Air Purifying", path: "/shop/air-purifying", count: getCategoryCount("air purifying") },
      ]
    },
    { 
      name: "💙 Sympathy", 
      path: "/shop/sympathy", 
      emoji: "💙",
      description: "Comforting arrangements",
      popular: false,
      subcategories: [
        { name: "Sympathy Bouquets", path: "/shop/sympathy-bouquets", count: getCategoryCount("sympathy bouquets") },
        { name: "Condolence Arrangements", path: "/shop/condolence", count: getCategoryCount("condolence") },
        { name: "Memorial Flowers", path: "/shop/memorial-flowers", count: getCategoryCount("memorial flowers") },
        { name: "Peaceful Arrangements", path: "/shop/peaceful-arrangements", count: getCategoryCount("peaceful arrangements") },
      ]
    },
    { 
      name: "🎉 Occasions", 
      path: "/shop/occasions", 
      emoji: "🎉",
      description: "Special celebrations",
      popular: false,
      subcategories: [
        { name: "Wedding", path: "/shop/wedding", count: getCategoryCount("wedding") },
        { name: "Graduation", path: "/shop/graduation", count: getCategoryCount("graduation") },
        { name: "Baby Shower", path: "/shop/baby-shower", count: getCategoryCount("baby shower") },
        { name: "Housewarming", path: "/shop/housewarming", count: getCategoryCount("housewarming") },
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
      className="bg-white/98 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-nav-sub shadow-sm" 
      ref={navRef}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container relative mx-auto px-3 sm:px-4 lg:px-6 dropdown-container">
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
              className="absolute top-full mt-2 dropdown-content w-72 sm:w-80 overflow-hidden dropdown-responsive"
              style={dropdownAlignRight
                ? { right: 0 }
                : { 
                    left: `${dropdownPosition.left}px`, 
                    transform: 'translateX(-50%)',
                    maxWidth: 'calc(100vw - 2rem)' // Prevent overflow on small screens
                  }
              }
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
                          {isLoadingCounts ? (
                            <div className="w-4 h-3 flex items-center justify-center">
                              <div className="w-2 h-2 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            sub.count
                          )}
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