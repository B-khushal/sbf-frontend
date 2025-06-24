import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const CategoryMenu = () => {
  const { pathname } = useLocation();
  
  const categories = [
    { name: "🌹 Flowers", path: "/shop/flowers", emoji: "🌹" },
    { name: "🎂 Birthday", path: "/shop/birthday", emoji: "🎂" },
    { name: "💕 Anniversary", path: "/shop/anniversary", emoji: "💕" },
    { name: "🧺 Baskets", path: "/shop/baskets", emoji: "🧺" },
  ];

  return (
    <motion.section 
      className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center overflow-x-auto py-3 scrollbar-hide">
          <div className="flex space-x-2 md:space-x-4 min-w-max">
            {categories.map((category, index) => (
              <motion.div
                key={category.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
              >
                <Link
                  to={category.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium whitespace-nowrap rounded-xl transition-all duration-300 group",
                    pathname === category.path
                      ? "text-primary bg-gradient-to-r from-primary/15 to-secondary/15 shadow-sm"
                      : "text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{category.emoji}</span>
                    <span>{category.name.split(' ').slice(1).join(' ')}</span>
                  </span>
                  
                  {/* Active indicator */}
                  {pathname === category.path && (
                    <motion.div
                      layoutId="categoryActiveIndicator"
                      className="absolute bottom-0 left-1/2 w-6 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform -translate-x-1/2"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
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