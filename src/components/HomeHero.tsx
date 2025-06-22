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
      <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-gray-900">
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
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 animate-pulse flex items-center justify-center">
                <div className="text-white/50 text-xl">Loading...</div>
              </div>
            )}
            
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-700",
                imagesLoaded[index] ? "opacity-100 scale-100" : "opacity-0 scale-105"
              )}
              onLoad={() => handleImageLoad(index)}
              onError={(e) => handleImageError(e, index)}
              loading={index === 0 ? "eager" : "lazy"}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={cn(
                  "transition-all duration-700 ease-out",
                  index === currentSlide 
                    ? "opacity-100 transform translate-y-0" 
                    : "opacity-0 transform translate-y-8"
                )}>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate(slide.ctaLink)}
                  >
                    {slide.ctaText}
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Controls */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-4 z-20">
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
            onClick={goToPrevSlide}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          
          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300",
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
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
            onClick={goToNextSlide}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Shop by Category
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our beautiful collection of fresh flowers for every occasion
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {[
              { name: 'Roses', icon: '🌹' },
              { name: 'Tulips', icon: '🌷' },
              { name: 'Sunflowers', icon: '🌻' },
              { name: 'Lilies', icon: '🌺' },
              { name: 'Orchids', icon: '🌸' },
              { name: 'Mixed', icon: '💐' }
            ].map((category, index) => (
              <div
                key={index}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => navigate(`/shop?category=${category.name.toLowerCase()}`)}
              >
                <div className="relative bg-white rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-5xl mb-2 sm:mb-3 lg:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;