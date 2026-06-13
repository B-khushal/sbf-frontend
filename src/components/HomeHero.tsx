import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSettings } from '../contexts/SettingsContext';

const HomeHero = () => {
  const { heroSlides, promoBanners, loading } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  const enabledPromoBanners = useMemo(() => {
    return (promoBanners || [])
      .filter(banner => banner.enabled)
      .sort((a, b) => a.order - b.order);
  }, [promoBanners]);

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
      <div className="relative overflow-hidden bg-gray-200 shadow-sm animate-pulse mx-3 sm:mx-4 md:mx-6 lg:mx-8 rounded-2xl sm:rounded-3xl h-[140px] sm:h-[320px] lg:h-[450px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-sm font-semibold">Loading slideshow...</div>
        </div>
      </div>
    );
  }

  if (enabledSlides.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 shadow-sm mx-3 sm:mx-4 md:mx-6 lg:mx-8 rounded-2xl sm:rounded-3xl h-[140px] sm:h-[320px] lg:h-[450px]">
        <div className="absolute inset-0 flex items-center justify-center text-center text-gray-600 px-6">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold mb-2">Premium Flower Delivery in Hyderabad</h1>
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
    <div className="relative mx-3 sm:mx-4 md:mx-6 lg:mx-8 my-2 sm:my-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Main featured banner slider */}
        <div className={cn(
          enabledPromoBanners.length > 0 ? "lg:col-span-2" : "lg:col-span-3",
          "relative overflow-hidden bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100",
          // Mobile: compact rounded card | Desktop: tall rounded card
          "h-[140px] xs:h-[160px] sm:h-[300px] md:h-[380px] lg:h-[450px]",
          "rounded-2xl sm:rounded-[28px]"
        )}>
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
                    "absolute inset-0 w-full h-full object-cover transition-all duration-700",
                    imagesLoaded[index] ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  )}
                  onLoad={() => handleImageLoad(index)}
                  onError={(e) => handleImageError(e, index)}
                  loading={index === 0 ? "eager" : "lazy"}
                />

                {/* Tint overlay */}
                <div 
                  className="absolute inset-0 bg-black/40 transition-opacity duration-300"
                  style={{ opacity: overlayOpacity }}
                />

                {/* Content overlay - Mobile: compact left-aligned | Desktop: centered */}
                <div className={cn(
                  "absolute inset-0 flex px-4 sm:px-12 md:px-16 lg:px-20",
                  // Mobile: bottom-left aligned, compact
                  "items-end pb-3 sm:items-center sm:pb-0 sm:justify-center sm:text-center"
                )}>
                  <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl">
                    <h1 
                      className={cn(
                        "font-black leading-tight tracking-tight transition-all drop-shadow-sm",
                        // Mobile: small left-aligned | Desktop: large centered
                        "text-sm xs:text-base sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl",
                        "mb-0.5 sm:mb-2 lg:mb-4",
                        "line-clamp-2 sm:line-clamp-none"
                      )}
                      style={{ color: textCol }}
                    >
                      {slide.title}
                    </h1>
                    {/* Subtitle: hidden on mobile for compactness */}
                    <p 
                      className="hidden sm:block text-sm md:text-base lg:text-lg mb-4 lg:mb-6 leading-relaxed opacity-90 transition-all font-medium"
                      style={{ color: textCol }}
                    >
                      {slide.subtitle}
                    </p>
                    <div className="flex sm:justify-center">
                      <Button
                        onClick={() => navigate(slide.ctaLink)}
                        size="default"
                        className={cn(
                          "bg-white text-gray-800 hover:bg-white/95 hover:scale-105 transition-all duration-300 font-bold rounded-xl shadow-md hover:shadow-lg",
                          // Mobile: tiny pill button | Desktop: standard
                          "text-[10px] px-3 py-1 h-7 sm:text-sm sm:px-6 sm:py-2.5 sm:h-auto"
                        )}
                      >
                        {slide.ctaText}
                        <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Carousel navigation buttons - hidden on mobile for cleaner look */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/25 hover:bg-white/40 backdrop-blur-md rounded-full p-1 sm:p-2.5 transition-all duration-200 hover:scale-115 hidden sm:flex"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/25 hover:bg-white/40 backdrop-blur-md rounded-full p-1 sm:p-2.5 transition-all duration-200 hover:scale-115 hidden sm:flex"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
            </>
          )}

          {/* Slide progress indicators */}
          {totalSlides > 1 && (
            <div className={cn(
              "absolute left-1/2 transform -translate-x-1/2 z-20 flex",
              // Mobile: bottom with tighter spacing | Desktop: standard
              "bottom-1.5 sm:bottom-4 space-x-1 sm:space-x-2"
            )}>
              {enabledSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isTransitioning && setCurrentSlide(index)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    // Mobile: tiny dots | Desktop: standard dots
                    "w-1 h-1 sm:w-2 sm:h-2",
                    index === currentSlide
                      ? "bg-white w-3 sm:w-5"
                      : "bg-white/40 hover:bg-white/60 hover:scale-110"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stacked dynamic promotional cards (1/3 width, hidden on mobile/tablet) */}
        {enabledPromoBanners.length > 0 && (
          <div className="hidden lg:flex flex-col gap-4 lg:gap-5 h-[450px]">
            {enabledPromoBanners.slice(0, 2).map((banner, index) => (
              <div 
                key={banner.id || index}
                onClick={() => navigate(banner.link)}
                className={cn(
                  "flex-1 relative rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 group cursor-pointer",
                  index % 2 === 0 
                    ? "bg-gradient-to-br from-pink-500 to-rose-600" 
                    : "bg-gradient-to-br from-sky-500 to-indigo-600"
                )}
              >
                {/* Background Image */}
                {banner.image && (
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/25" />
                
                {/* Card Content */}
                <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white">
                  <div>
                    {banner.badge && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-white/20 border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {banner.badge.includes('👑') || banner.badge.toLowerCase().includes('premium') || banner.badge.includes('✨') || banner.badge.includes('🎉') ? (
                          <span>{banner.badge}</span>
                        ) : (
                          <>
                            <Sparkles size={10} className="fill-current text-yellow-300" />
                            {banner.badge}
                          </>
                        )}
                      </span>
                    )}
                    <h3 className="text-xl font-bold mt-2.5 leading-tight group-hover:text-pink-100 transition-colors">
                      {banner.title}
                    </h3>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed max-w-[220px]">
                      {banner.subtitle}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold group-hover:text-white/100 transition-colors pt-2">
                    {banner.ctaText || "Shop Now"}
                    <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default HomeHero;