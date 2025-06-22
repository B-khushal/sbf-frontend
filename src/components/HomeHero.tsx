import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <section className="relative w-full h-[100vh] sm:h-[90vh] md:h-[85vh] lg:h-[90vh] xl:h-[95vh] max-h-[900px] pt-16 md:pt-20">
      <div className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl mx-4 sm:mx-6 lg:mx-8">
        {/* Background Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-700 ease-smooth",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={index !== currentSlide}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)',
                transition: 'transform 10s ease-out',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/10" />
          </div>
        ))}
        
        {/* Content */}
        <div className="relative h-full flex items-center justify-center z-10">
          <div className="max-w-4xl w-full text-center text-white px-4 sm:px-6 lg:px-8">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "transition-all duration-700 ease-out-expo",
                  index === currentSlide 
                    ? "opacity-100 transform translate-y-0" 
                    : "opacity-0 transform translate-y-8 absolute pointer-events-none"
                )}
                aria-hidden={index !== currentSlide}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.ctaLink}
                  className="inline-flex items-center px-8 py-4 bg-white/95 hover:bg-white text-gray-900 text-sm font-semibold tracking-wide transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                >
                  {slide.ctaText}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 ease-smooth hover:scale-110",
                index === currentSlide 
                  ? "bg-white scale-110 shadow-lg" 
                  : "bg-white/50 scale-90 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Arrow Controls */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all duration-300 ease-smooth z-20 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all duration-300 ease-smooth z-20 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default HomeHero;