import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
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

  // Handle window resizing
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
      const interval = setInterval(goToNextSlide, 6000);
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
      <div className="relative h-[220px] sm:h-[320px] lg:h-[450px] overflow-hidden bg-gray-200 rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-sm animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-sm font-semibold">Loading slideshow...</div>
        </div>
      </div>
    );
  }

  if (enabledSlides.length === 0) {
    return (
      <div className="relative h-[220px] sm:h-[320px] lg:h-[450px] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center text-center text-gray-600 px-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Premium Flower Delivery in Hyderabad</h1>
            <p className="mb-4 text-xs sm:text-sm text-gray-500">Send handcrafted bouquets online with Spring Blossoms Florist.</p>
            <Button onClick={() => navigate('/shop')} className="bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl">
              Explore Our Collection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-3 sm:mx-4 md:mx-6 lg:mx-8 my-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Main featured banner slider (2/3 width on desktop) */}
        <div className="lg:col-span-2 relative h-[180px] xs:h-[220px] sm:h-[300px] md:h-[380px] lg:h-[450px] overflow-hidden bg-gray-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
          {enabledSlides.map((slide, index) => {
            const slideImage = isMobile && slide.mobileImage ? slide.mobileImage : slide.image;
            const overlayOpacity = slide.overlayOpacity !== undefined ? slide.overlayOpacity : 0.35;
            const textCol = slide.textColor || '#ffffff';

            return (
              <div
                key={slide.id || index}
                className={cn(
                  "absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out",
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                {/* Skeleton loading display */}
                {!imagesLoaded[index] && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center" />
                )}

                {/* Slide Image */}
                <img
                  src={slideImage}
                  alt={slide.title}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-all duration-700 rounded-[28px]",
                    imagesLoaded[index] ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  )}
                  onLoad={() => handleImageLoad(index)}
                  onError={(e) => handleImageError(e, index)}
                  loading={index === 0 ? "eager" : "lazy"}
                />

                {/* Tint overlay */}
                <div 
                  className="absolute inset-0 bg-black/40 rounded-[28px] transition-opacity duration-300"
                  style={{ opacity: overlayOpacity }}
                />

                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-center px-6 sm:px-12 md:px-16 lg:px-20">
                  <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl text-center">
                    <h1 
                      className="text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black mb-1 sm:mb-2 lg:mb-4 leading-tight tracking-tight transition-all drop-shadow-sm"
                      style={{ color: textCol }}
                    >
                      {slide.title}
                    </h1>
                    <p 
                      className="text-[10px] xs:text-[11px] sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 lg:mb-6 leading-relaxed opacity-90 transition-all font-medium"
                      style={{ color: textCol }}
                    >
                      {slide.subtitle}
                    </p>
                    <div className="flex justify-center">
                      <Button
                        onClick={() => navigate(slide.ctaLink)}
                        size="default"
                        className="bg-white text-gray-800 hover:bg-white/95 hover:scale-105 transition-all duration-300 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 h-auto font-bold rounded-xl shadow-md hover:shadow-lg"
                      >
                        {slide.ctaText}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Carousel navigation buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/25 hover:bg-white/40 backdrop-blur-md rounded-full p-1.5 sm:p-2.5 transition-all duration-200 hover:scale-115"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/25 hover:bg-white/40 backdrop-blur-md rounded-full p-1.5 sm:p-2.5 transition-all duration-200 hover:scale-115"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
            </>
          )}

          {/* Slide progress indicators */}
          {totalSlides > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2">
              {enabledSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isTransitioning && setCurrentSlide(index)}
                  className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300",
                    index === currentSlide
                      ? "bg-white w-4 sm:w-5"
                      : "bg-white/40 hover:bg-white/60 hover:scale-110"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stacked twin promotional cards (1/3 width, hidden on mobile/tablet) */}
        <div className="hidden lg:flex flex-col gap-4 lg:gap-5 h-[450px]">
          {/* Promo Card 1 */}
          <div 
            onClick={() => navigate('/shop?category=anniversary')}
            className="flex-1 relative rounded-[28px] overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 group cursor-pointer"
          >
            {/* Background Image */}
            <img 
              src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=600" 
              alt="Anniversary Flowers" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/25" />
            
            {/* Card Content */}
            <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white">
              <div>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-white/20 border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <Sparkles size={10} className="fill-current text-yellow-300" />
                  Same-day Delivery
                </span>
                <h3 className="text-xl font-bold mt-2.5 leading-tight group-hover:text-pink-100 transition-colors">
                  Anniversary Collection
                </h3>
                <p className="text-xs text-white/80 mt-1 leading-relaxed max-w-[220px]">
                  Celebrate love with standard rose arrangements and luxury gifts.
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold group-hover:text-white/100 transition-colors pt-2">
                Send Romance Gifts
                <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Promo Card 2 */}
          <div 
            onClick={() => navigate('/shop?category=premium-collections')}
            className="flex-1 relative rounded-[28px] overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 group cursor-pointer"
          >
            {/* Background Image */}
            <img 
              src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=600" 
              alt="Premium Collections" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/25" />
            
            {/* Card Content */}
            <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white">
              <div>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-white/20 border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  👑 Premium
                </span>
                <h3 className="text-xl font-bold mt-2.5 leading-tight group-hover:text-sky-100 transition-colors">
                  Luxury Handcrafted Bouquets
                </h3>
                <p className="text-xs text-white/80 mt-1 leading-relaxed max-w-[220px]">
                  Exceptional designs from premium exotic local and imported flowers.
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold group-hover:text-white/100 transition-colors pt-2">
                Explore Elite Store
                <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeHero;