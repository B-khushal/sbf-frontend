import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSettings } from '../contexts/SettingsContext';

const HomeHero = () => {
  const { heroSlides, loading } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Handle window resizing to detect mobile image breakpoints
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 640;

  // Filter and sort slides based on enablement and schedule parameters
  const enabledSlides = useMemo(() => {
    const now = new Date();
    return (heroSlides || [])
      .filter(slide => {
        if (!slide.enabled) return false;
        if (slide.schedulePublishStart) {
          const start = new Date(slide.schedulePublishStart);
          if (now < start) return false;
        }
        if (slide.schedulePublishEnd) {
          const end = new Date(slide.schedulePublishEnd);
          if (now > end) return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [heroSlides]);

  const totalSlides = enabledSlides.length;

  useEffect(() => {
    if (enabledSlides.length > 0) {
      setImagesLoaded(new Array(enabledSlides.length).fill(false));
    }
  }, [enabledSlides]);

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
      if (newLoaded.length > index) {
        newLoaded[index] = true;
      }
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
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, totalSlides]);

  // Auto slide interval
  useEffect(() => {
    if (totalSlides > 1) {
      const interval = setInterval(goToNextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [goToNextSlide, totalSlides]);

  // Preload slides images
  useEffect(() => {
    if (enabledSlides.length > 0) {
      const preloadImage = (src: string, index: number) => {
        if (!src) return;
        const img = new Image();
        img.onload = () => handleImageLoad(index);
        img.onerror = () => handleImageLoad(index);
        img.src = src;
      };

      const currentSlideSrc = isMobile && enabledSlides[currentSlide]?.mobileImage 
        ? enabledSlides[currentSlide].mobileImage 
        : enabledSlides[currentSlide]?.image;

      if (currentSlideSrc) {
        preloadImage(currentSlideSrc, currentSlide);
      }
    }
  }, [enabledSlides, currentSlide, isMobile, handleImageLoad]);

  if (loading && enabledSlides.length === 0) {
    return (
      <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] 2xl:h-[80vh] overflow-hidden bg-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-lg animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 text-lg">Loading slides...</div>
        </div>
      </div>
    );
  }

  if (enabledSlides.length === 0) {
    return (
      <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] 2xl:h-[80vh] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl sm:rounded-2xl lg:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center text-center text-gray-600 px-6">
          <div>
            <h1 className="text-2xl font-bold mb-4">Best Florist in Hyderabad - Premium Flower Delivery</h1>
            <p className="mb-6">Send fresh bouquets and gifts online with Spring Blossoms Florist.</p>
            <Button onClick={() => navigate('/shop')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              Explore Our Collection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] 2xl:h-[80vh] overflow-hidden bg-gray-900 rounded-xl sm:rounded-2xl lg:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-lg sm:shadow-xl lg:shadow-2xl">
        {enabledSlides.map((slide, index) => {
          const slideImage = isMobile && slide.mobileImage ? slide.mobileImage : slide.image;
          const overlayOpacity = slide.overlayOpacity !== undefined ? slide.overlayOpacity : 0.4;
          const textCol = slide.textColor || '#ffffff';

          return (
            <div
              key={slide.id || index}
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out",
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              {/* Skeleton loading display */}
              {!imagesLoaded[index] && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 animate-pulse flex items-center justify-center rounded-xl sm:rounded-2xl lg:rounded-3xl">
                  <div className="text-white/50 text-base">Loading...</div>
                </div>
              )}

              {/* Slide Image */}
              <img
                src={slideImage}
                alt={slide.title}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-all duration-500 rounded-xl sm:rounded-2xl lg:rounded-3xl",
                  imagesLoaded[index] ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
                onLoad={() => handleImageLoad(index)}
                onError={(e) => handleImageError(e, index)}
                loading={index === 0 ? "eager" : "lazy"}
              />

              {/* Tint overlay based on configuration */}
              <div 
                className="absolute inset-0 bg-black rounded-xl sm:rounded-2xl lg:rounded-3xl transition-opacity duration-300"
                style={{ opacity: overlayOpacity }}
              />

              {/* Content overlay */}
              <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-12 md:px-16 lg:px-20">
                <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl text-center">
                  <h1 
                    className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 sm:mb-4 lg:mb-6 leading-tight transition-all"
                    style={{ color: textCol }}
                  >
                    {slide.title}
                  </h1>
                  <p 
                    className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-6 sm:mb-8 lg:mb-10 leading-relaxed opacity-90 transition-all"
                    style={{ color: textCol }}
                  >
                    {slide.subtitle}
                  </p>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => navigate(slide.ctaLink)}
                      size="lg"
                      className="bg-white text-gray-800 hover:bg-white/90 hover:scale-105 transition-all duration-300 text-sm sm:text-base lg:text-lg px-6 sm:px-8 lg:px-10 py-2 sm:py-3 lg:py-4 font-bold"
                    >
                      {slide.ctaText}
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Carousel buttons */}
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

        {/* Indicators */}
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
    </div>
  );
};

export default HomeHero;