import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
  order: number;
}

// Empty array for slides - will be populated from API
const defaultSlides: HeroSlide[] = [];

const HomeHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(defaultSlides.length).fill(false));
  const [loading, setLoading] = useState(false); // Start with default slides
  const navigate = useNavigate();

  // Memoize slide operations for better performance
  const enabledSlides = useMemo(() => 
    heroSlides.filter(slide => slide.enabled).sort((a, b) => a.order - b.order),
    [heroSlides]
  );

  const totalSlides = enabledSlides.length;

  // Fetch hero slides from API
  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        // Try to get cached data first
        const cacheKey = 'hero_slides';
        const cacheExpiry = 10 * 60 * 1000; // 10 minutes
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
        
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < cacheExpiry) {
          const slides = JSON.parse(cached);
          if (slides && Array.isArray(slides) && slides.length > 0) {
            setHeroSlides(slides);
            setImagesLoaded(new Array(slides.length).fill(false));
            return;
          }
        }
        
        // Fetch from API
        const response = await api.get('/settings/hero-slides');
        const slides = response.data?.filter((slide: HeroSlide) => slide.enabled)
                                ?.sort((a: HeroSlide, b: HeroSlide) => a.order - b.order) || [];
        
        // Only update if slides are different from current
        if (JSON.stringify(slides) !== JSON.stringify(heroSlides)) {
          setHeroSlides(slides);
          setImagesLoaded(new Array(slides.length).fill(false));
          setCurrentSlide(0); // Reset to first slide
          
          // Cache the results
          sessionStorage.setItem(cacheKey, JSON.stringify(slides));
          sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        }
      } catch (error) {
        // Silent error handling - keep default slides
        console.warn('Failed to fetch hero slides, using defaults:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSlides();
  }, []);
  
  const goToNextSlide = useCallback(() => {
    if (!isTransitioning && totalSlides > 0) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }
  }, [isTransitioning, totalSlides]);
  
  const goToPrevSlide = useCallback(() => {
    if (!isTransitioning && totalSlides > 0) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  }, [isTransitioning, totalSlides]);

  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://placehold.co/800x400?text=Image+Not+Found';
    handleImageLoad(index);
  }, [handleImageLoad]);
  
  useEffect(() => {
    if (totalSlides > 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Reduced transition time
      
      return () => clearTimeout(timer);
    }
  }, [currentSlide, totalSlides]);
  
  // Auto-slide with cleanup
  useEffect(() => {
    if (totalSlides > 1) {
      const interval = setInterval(goToNextSlide, 5000); // Reduced from 6s to 5s
      return () => clearInterval(interval);
    }
  }, [goToNextSlide, totalSlides]);

  // Preload images with better performance
  useEffect(() => {
    if (enabledSlides.length > 0) {
      // Preload current and next images first
      const preloadImage = (slide: HeroSlide, index: number) => {
        const img = new Image();
        img.onload = () => handleImageLoad(index);
        img.onerror = () => handleImageLoad(index);
        img.src = slide.image;
      };

      // Preload current slide immediately
      if (enabledSlides[currentSlide]) {
        preloadImage(enabledSlides[currentSlide], currentSlide);
      }

      // Preload next slide
      if (enabledSlides[(currentSlide + 1) % totalSlides]) {
        setTimeout(() => {
          preloadImage(enabledSlides[(currentSlide + 1) % totalSlides], (currentSlide + 1) % totalSlides);
        }, 100);
      }

      // Preload remaining slides with delay
      setTimeout(() => {
        enabledSlides.forEach((slide, index) => {
          if (index !== currentSlide && index !== (currentSlide + 1) % totalSlides) {
            preloadImage(slide, index);
          }
        });
      }, 500);
    }
  }, [enabledSlides, currentSlide, totalSlides, handleImageLoad]);

  // Show loading state only if no slides available
  if (loading && enabledSlides.length === 0) {
    return (
      <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] 2xl:h-[80vh] overflow-hidden bg-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-lg sm:shadow-xl lg:shadow-2xl animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Show fallback if no slides
  if (enabledSlides.length === 0) {
    return (
      <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] 2xl:h-[80vh] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl sm:rounded-2xl lg:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-lg sm:shadow-xl lg:shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center text-center text-gray-600 px-6">
          <div>
            <h1 className="text-2xl font-bold mb-4">Best Florist in Hyderabad - Premium Flower Delivery in Hyderabad</h1>
            <p className="mb-6">Online bouquet shop India offering midnight flower delivery, roses for anniversary, birthday flowers online. Send flowers online with the best florist in Hyderabad.</p>
            <Button onClick={() => navigate('/shop')} className="bg-primary hover:bg-primary/90">
              Explore Our Collection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Hero Slides */}
      <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] 2xl:h-[80vh] overflow-hidden bg-gray-900 rounded-xl sm:rounded-2xl lg:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-lg sm:shadow-xl lg:shadow-2xl">
        {enabledSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out",
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
                "absolute inset-0 w-full h-full object-cover transition-all duration-500 rounded-xl sm:rounded-2xl lg:rounded-3xl",
                imagesLoaded[index] ? "opacity-100 scale-100" : "opacity-0 scale-105"
              )}
              onLoad={() => handleImageLoad(index)}
              onError={(e) => handleImageError(e, index)}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent rounded-xl sm:rounded-2xl lg:rounded-3xl" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
              <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl text-white text-center">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 sm:mb-4 lg:mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="flex justify-center">
                <Button
                  onClick={() => navigate(slide.ctaLink)}
                  size="lg"
                  className="bg-white text-gray-800 hover:bg-white/90 hover:scale-105 transition-all duration-300 text-sm sm:text-base lg:text-lg px-6 sm:px-8 lg:px-10 py-2 sm:py-3 lg:py-4"
                >
                  {slide.ctaText}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={goToPrevSlide}
              className="absolute left-4 sm:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 lg:p-4 transition-all duration-300 hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </button>
            <button
              onClick={goToNextSlide}
              className="absolute right-4 sm:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 lg:p-4 transition-all duration-300 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </button>
          </>
        )}
        
        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
            {enabledSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => !isTransitioning && setCurrentSlide(index)}
                className={cn(
                  "w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75 hover:scale-110"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-16">
            <div className="inline-block text-xs sm:text-sm uppercase tracking-wider text-primary font-bold mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full">
              Browse Categories
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-800 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              Explore Our Beautiful Collections
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
              From elegant bouquets to thoughtful gifts, discover the perfect arrangement for every occasion and celebration.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {[
              { name: "Bouquets", emoji: "💐", color: "from-pink-400 to-rose-500", link: "/shop/bouquets" },
              { name: "Plants", emoji: "🌱", color: "from-green-400 to-emerald-500", link: "/shop/plants" },
              { name: "Combos", emoji: "🎁", color: "from-purple-400 to-violet-500", link: "/shop/combos" },
              { name: "Baskets", emoji: "🧺", color: "from-amber-400 to-orange-500", link: "/shop/baskets" },
              { name: "Birthday", emoji: "🎂", color: "from-blue-400 to-indigo-500", link: "/shop/birthday" },
              { name: "Anniversary", emoji: "💕", color: "from-red-400 to-pink-500", link: "/shop/anniversary" },
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