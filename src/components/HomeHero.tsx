import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const heroSlides = [
  {
    id: 1,
    title: "Spring Collection",
    subtitle: "Freshly picked arrangements to brighten your day",
    image: "/images/1.jpg",
    ctaText: "Shop Now",
    ctaLink: "/shop",
  },
  {
    id: 2,
    title: "Signature Bouquets",
    subtitle: "Handcrafted with love and attention to detail",
    image: "/images/2.jpg",
    ctaText: "Shop Now",
    ctaLink: "/shop",
  },
  {
    id: 3,
    title: "Seasonal Specials",
    subtitle: "Limited edition arrangements for every occasion",
    image: "/images/3.jpg",
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