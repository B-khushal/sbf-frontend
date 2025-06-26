import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/config';
import { motion } from 'framer-motion';

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
    // Try different URL constructions if the first one fails
    if (!target.src.includes('placeholder')) {
      if (heroSlides[index].image.startsWith('/uploads/')) {
        target.src = `https://sbf-backend.onrender.com${heroSlides[index].image}`;
      } else if (!heroSlides[index].image.startsWith('http')) {
        target.src = `https://sbf-backend.onrender.com/uploads/${heroSlides[index].image}`;
      } else {
        target.src = '/images/placeholder.svg';
      }
    }
    handleImageLoad(index);
  };
  
  // Reset transition state after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
    
    return () => clearTimeout(timer);
  }, [currentSlide]);
  
  // Auto-advance slides
  useEffect(() => {
    if (isTransitioning) return; // Don't start new interval if transitioning
    
    const interval = setInterval(goToNextSlide, 6000);
    return () => clearInterval(interval);
  }, [isTransitioning]); // Only depend on isTransitioning

  // Preload images with optimized URLs
  useEffect(() => {
    heroSlides.forEach((slide, index) => {
      const img = new Image();
      img.onload = () => handleImageLoad(index);
      img.onerror = () => {
        console.error(`Failed to preload image: ${slide.image}`);
        handleImageLoad(index);
      };
      img.src = getImageUrl(slide.image, {
        width: 1920,
        height: 1080,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      });
    });
  }, []); // Empty dependency array since heroSlides is constant

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
              src={getImageUrl(slide.image, {
                width: 1920,
                height: 1080,
                crop: 'fill',
                quality: 'auto',
                format: 'auto'
              })}
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
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6 sm:p-8 md:p-10 lg:p-12">
              <motion.h1 
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              <motion.p 
                className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button
                  onClick={() => navigate(slide.ctaLink)}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg"
                >
                  {slide.ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        ))}
        
        {/* Navigation Buttons */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentSlide
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
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
              { name: 'Roses', emoji: '🌹', link: '/shop/roses', color: 'from-rose-400 to-pink-500' },
              { name: 'Lilies', emoji: '🌺', link: '/shop/lilies', color: 'from-purple-400 to-indigo-500' },
              { name: 'Tulips', emoji: '🌷', link: '/shop/tulips', color: 'from-yellow-400 to-orange-500' },
              { name: 'Orchids', emoji: '🌸', link: '/shop/orchids', color: 'from-pink-400 to-rose-500' },
              { name: 'Sunflowers', emoji: '🌻', link: '/shop/sunflowers', color: 'from-amber-400 to-yellow-500' },
              { name: 'Bouquets', emoji: '💐', link: '/shop/bouquets', color: 'from-emerald-400 to-green-500' },
            ].map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-primary/20"
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;