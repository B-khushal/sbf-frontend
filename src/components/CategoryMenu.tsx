import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSettings } from '@/contexts/SettingsContext';
import productService from '@/services/productService';
import { normalizeCategoryKey } from '@/utils/categoryTaxonomy';
import { useSeasonalCampaign } from '@/contexts/SeasonalCampaignContext';

const EMOJI_MAPPING: { [key: string]: string } = {
  flowers: '🌹',
  chocolate: '🍫',
  birthday: '🎂',
  anniversary: '💕',
  baskets: '🧺',
  combos: '🎁',
  plants: '🌿',
  sympathy: '💙',
  occasions: '🎉',
};
const DEFAULT_EMOJI = '🌸';

const CategoryMenu = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0 });
  const { shopCategories, loading: settingsLoading } = useSettings();
  const { activeCampaigns } = useSeasonalCampaign();
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
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

  // Fetch dynamic category product counts on mount
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setIsLoadingCounts(true);
        const counts = await productService.getCategoriesWithCounts();
        const countsMap: { [key: string]: number } = {};
        counts.forEach(item => {
          const normalizedKey = normalizeCategoryKey(item.name);
          countsMap[normalizedKey] = item.count;
        });
        setCategoryCounts(countsMap);
      } catch (error) {
        console.error('Error fetching category counts in CategoryMenu:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const getEmoji = (slug: string) => EMOJI_MAPPING[slug.toLowerCase()] || DEFAULT_EMOJI;
  const getCategoryCount = (categoryName: string): number => {
    const key = normalizeCategoryKey(categoryName);
    return categoryCounts[key] || 0;
  };

  const categories = useMemo(() => {
    return ((shopCategories || []) as any[])
      .filter(cat => cat.enabled && !cat.parentId)
      .sort((a, b) => (a.priority ?? a.sortOrder ?? 0) - (b.priority ?? b.sortOrder ?? 0))
      .map(parent => {
        const parentIdStr = parent._id || parent.id;
        let subcats = ((shopCategories || []) as any[])
          .filter(c => {
            if (!c.enabled || !c.parentId) return false;
            const childParentId = typeof c.parentId === 'object' ? (c.parentId._id || c.parentId.id) : c.parentId;
            return childParentId === parentIdStr;
          })
          .sort((a, b) => (a.priority ?? a.sortOrder ?? 0) - (b.priority ?? b.sortOrder ?? 0))
          .map(sub => ({
            name: sub.name,
            path: sub.link || sub.categoryUrl,
            count: getCategoryCount(sub.name)
          }));

        // Dynamically append created seasonal campaigns to "Occasions" parent category
        const isOccasions = parent.name.toLowerCase().includes('occasions') || parent.slug?.toLowerCase().includes('occasions');
        if (isOccasions && activeCampaigns) {
          const campaignSubcats = activeCampaigns.map(campaign => ({
            name: campaign.name,
            path: `/occasions/${campaign.slug}`,
            count: campaign.productCount || 0
          }));
          subcats = [...subcats, ...campaignSubcats];
        }

        return {
          name: parent.name,
          path: parent.link || parent.categoryUrl,
          emoji: getEmoji(parent.slug || parent.name),
          description: parent.description || '',
          popular: parent.featured || false,
          subcategories: subcats
        };
      });
  }, [shopCategories, categoryCounts, activeCampaigns]);

  useLayoutEffect(() => {
    if (hoveredCategory && navRef.current) {
      const categoryIndex = categories.findIndex(c => c.name === hoveredCategory);
      const itemRef = itemRefs.current[categoryIndex];
      const navRect = navRef.current.getBoundingClientRect();
      
      if (itemRef) {
        const itemRect = itemRef.getBoundingClientRect();
        const dropdownWidth = window.innerWidth < 640 ? 288 : 320;
        
        // Preferred left edge of the dropdown relative to the container
        const preferredLeftEdge = (itemRect.left + itemRect.width / 2 - navRect.left) - dropdownWidth / 2;
        
        // Minimum and maximum allowed left edge to stay within viewport with 16px padding
        const minLeftEdge = 16 - navRect.left;
        const maxLeftEdge = window.innerWidth - 16 - navRect.left - dropdownWidth;
        
        // Clamp the left edge
        const clampedLeftEdge = Math.max(minLeftEdge, Math.min(preferredLeftEdge, maxLeftEdge));
        
        setDropdownPosition({ left: clampedLeftEdge });
      }
    }
  }, [hoveredCategory, categories]);

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
  } as const;

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
  } as const;

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
      className="hidden md:block bg-white/98 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-nav-sub shadow-sm" 
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
                      {category.name}
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
              style={{ 
                left: `${dropdownPosition.left}px`, 
                maxWidth: 'calc(100vw - 2rem)' // Prevent overflow on small screens
              }}
              onMouseEnter={() => handleMouseEnter(activeCategory.name)}
            >
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeCategory.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {activeCategory.name}
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
                  View All {activeCategory.name}
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