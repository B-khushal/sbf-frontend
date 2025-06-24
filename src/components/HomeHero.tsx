import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const heroSlides = [
  {
    id: 1,
    title: "Spring Collection",
    subtitle: "Freshly picked arrangements to brighten your day",
    image: "/images/d1.jpg",
    ctaText: "Shop Now",
    ctaLink: "/shop",
  },
  {
    id: 2,
    title: "Signature Bouquets",
    subtitle: "Handcrafted with love and attention to detail",
    image: "/images/d2.jpg",
    ctaText: "Shop Now",
    ctaLink: "/shop",
  },
  {
    id: 3,
    title: "Seasonal Specials",
    subtitle: "Limited edition arrangements for every occasion",
    image: "/images/d3.jpg",
    ctaText: "Shop Now",
    ctaLink: "/shop",
  },
];

const HomeHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(heroSlides.length).fill(false));
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const goToNextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
  };
  
  const goToPrevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    console.error(`Failed to load image for slide ${index}:`, heroSlides[index].image);
    const target = e.target as HTMLImageElement;
    target.src = '/images/placeholder.svg';
    handleImageLoad(index);
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
    
    return () => clearTimeout(timer);
  }, [currentSlide]);
  
  useEffect(() => {
    const interval = setInterval(goToNextSlide, 6000);
    return () => clearInterval(interval);
  }, [currentSlide, isTransitioning]);

  // Preload images
  useEffect(() => {
    heroSlides.forEach((slide, index) => {
      const img = new Image();
      img.onload = () => handleImageLoad(index);
      img.onerror = () => {
        console.error(`Failed to preload image: ${slide.image}`);
        handleImageLoad(index);
      };
      img.src = slide.image;
    });
  }, []);

  return (
    <div className="relative">
      {/* Hero Slides */}
      <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] 2xl:h-[80vh] overflow-hidden bg-gray-900 rounded-xl sm:rounded-2xl lg:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-lg sm:shadow-xl lg:shadow-2xl">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Loading skeleton */}
            {!imagesLoaded[index] && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 animate-pulse flex items-center justify-center rounded-xl sm:rounded-2xl lg:rounded-3xl">
                <div className="text-white/50 text-base sm:text-lg lg:text-xl">Loading...</div>
              </div>
            )}
            
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-700 rounded-xl sm:rounded-2xl lg:rounded-3xl",
                imagesLoaded[index] ? "opacity-100 scale-100" : "opacity-0 scale-105"
              )}
              onLoad={() => handleImageLoad(index)}
              onError={(e) => handleImageError(e, index)}
              loading={index === 0 ? "eager" : "lazy"}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 rounded-xl sm:rounded-2xl lg:rounded-3xl" />
        
        {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center text-white max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12">
                <div className={cn(
                  "transition-all duration-700 ease-out",
                  index === currentSlide 
                    ? "opacity-100 transform translate-y-0" 
                    : "opacity-0 transform translate-y-8"
                )}>
                  <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-2 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight drop-shadow-lg">
                  {slide.title}
                </h1>
                  <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 xs:mb-5 sm:mb-6 md:mb-7 lg:mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
                  {slide.subtitle}
                </p>
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-gray-100 px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate(slide.ctaLink)}
                >
                  {slide.ctaText}
                    <ArrowRight className="ml-1.5 xs:ml-2 w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Controls */}
        <div className="absolute bottom-3 xs:bottom-4 sm:bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 xs:gap-3 sm:gap-4 z-20">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
            onClick={goToPrevSlide}
          >
            <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </Button>
          
          <div className="flex gap-1.5 xs:gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={cn(
                  "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full transition-all duration-300",
                index === currentSlide 
                    ? 'bg-white scale-125 shadow-lg'
                    : 'bg-white/50 hover:bg-white/75 hover:scale-110'
              )}
                onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
            onClick={goToNextSlide}
        >
            <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              Discover our beautiful collection of fresh flowers and arrangements
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {[
              { 
                name: 'Roses', 
                emoji: '🌹', 
                link: '/shop/roses', 
                color: 'from-rose-400 to-pink-500',
                subcategories: [
                  { name: 'Red Roses', link: '/shop/red-roses', count: 25 },
                  { name: 'White Roses', link: '/shop/white-roses', count: 18 },
                  { name: 'Pink Roses', link: '/shop/pink-roses', count: 22 },
                  { name: 'Yellow Roses', link: '/shop/yellow-roses', count: 15 },
                ]
              },
              { 
                name: 'Lilies', 
                emoji: '🌺', 
                link: '/shop/lilies', 
                color: 'from-purple-400 to-indigo-500',
                subcategories: [
                  { name: 'Tiger Lilies', link: '/shop/tiger-lilies', count: 12 },
                  { name: 'Oriental Lilies', link: '/shop/oriental-lilies', count: 16 },
                  { name: 'Asiatic Lilies', link: '/shop/asiatic-lilies', count: 14 },
                  { name: 'Easter Lilies', link: '/shop/easter-lilies', count: 8 },
                ]
              },
              { 
                name: 'Tulips', 
                emoji: '🌷', 
                link: '/shop/tulips', 
                color: 'from-yellow-400 to-orange-500',
                subcategories: [
                  { name: 'Red Tulips', link: '/shop/red-tulips', count: 18 },
                  { name: 'Yellow Tulips', link: '/shop/yellow-tulips', count: 20 },
                  { name: 'Purple Tulips', link: '/shop/purple-tulips', count: 15 },
                  { name: 'Mixed Tulips', link: '/shop/mixed-tulips', count: 25 },
                ]
              },
              { 
                name: 'Orchids', 
                emoji: '🌸', 
                link: '/shop/orchids', 
                color: 'from-pink-400 to-rose-500',
                subcategories: [
                  { name: 'Phalaenopsis', link: '/shop/phalaenopsis', count: 12 },
                  { name: 'Dendrobium', link: '/shop/dendrobium', count: 10 },
                  { name: 'Cattleya', link: '/shop/cattleya', count: 8 },
                  { name: 'Cymbidium', link: '/shop/cymbidium', count: 6 },
                ]
              },
              { 
                name: 'Sunflowers', 
                emoji: '🌻', 
                link: '/shop/sunflowers', 
                color: 'from-amber-400 to-yellow-500',
                subcategories: [
                  { name: 'Giant Sunflowers', link: '/shop/giant-sunflowers', count: 15 },
                  { name: 'Dwarf Sunflowers', link: '/shop/dwarf-sunflowers', count: 12 },
                  { name: 'Teddy Bear', link: '/shop/teddy-bear-sunflowers', count: 8 },
                  { name: 'Red Sunflowers', link: '/shop/red-sunflowers', count: 6 },
                ]
              },
              { 
                name: 'Bouquets', 
                emoji: '💐', 
                link: '/shop/bouquets', 
                color: 'from-emerald-400 to-green-500',
                subcategories: [
                  { name: 'Wedding Bouquets', link: '/shop/wedding-bouquets', count: 30 },
                  { name: 'Birthday Bouquets', link: '/shop/birthday-bouquets', count: 25 },
                  { name: 'Anniversary', link: '/shop/anniversary-bouquets', count: 20 },
                  { name: 'Sympathy Bouquets', link: '/shop/sympathy-bouquets', count: 18 },
                ]
              },
            ].map((category) => (
              <motion.div
                key={category.name}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to={category.link}
                  className="group relative bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-primary/20 block"
                >
                  <div className={cn(
                    "w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300",
                    category.color
                  )}>
                    <span className="text-lg xs:text-xl sm:text-2xl lg:text-3xl">{category.emoji}</span>
                  </div>
                  <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors duration-200">
                    {category.name}
                  </h3>
                  
                  {/* Hover Indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </Link>

                {/* Hover Dropdown */}
                <AnimatePresence>
                  {hoveredCategory === category.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 min-w-[240px] overflow-hidden z-50"
                    >
                      {/* Category Header */}
                      <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 bg-gradient-to-br rounded-full flex items-center justify-center text-white text-lg shadow-md",
                            category.color
                          )}>
                            {category.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-500">Premium quality flowers</p>
                          </div>
                        </div>
                      </div>

                      {/* Subcategories */}
                      <div className="p-2">
                        {category.subcategories.map((sub, idx) => (
                          <motion.div
                            key={sub.link}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ 
                              delay: idx * 0.05,
                              type: "spring",
                              stiffness: 300,
                              damping: 25
                            }}
                          >
                            <Link
                              to={sub.link}
                              className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary/8 hover:to-secondary/8 transition-all duration-300 group"
                            >
                              <span className="text-gray-700 group-hover:text-primary font-medium transition-colors duration-200">
                                {sub.name}
                              </span>
                              <span className="text-xs text-gray-400 group-hover:text-primary/60 transition-colors duration-200">
                                {sub.count} items
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      {/* View All Link */}
                      <Link
                        to={category.link}
                        className="block p-3 text-center text-sm font-medium text-primary hover:text-secondary border-t border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all duration-300"
                      >
                        View All {category.name}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;