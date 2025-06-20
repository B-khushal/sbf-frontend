import React, { useState, useEffect } from 'react';
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
    <section className="relative w-full h-[70vh] sm:h-[50vh] md:h-[70vh] max-h-[800px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative w-full h-full overflow-hidden rounded-xl shadow-lg">
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
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
        
        {/* Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-4xl w-full text-center text-white px-4">
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
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <a
                  href={slide.ctaLink}
                  className="inline-block px-8 py-3.5 bg-white/95 text-primary text-sm font-medium tracking-wide hover:bg-white transition-all rounded-md shadow-md"
                >
                  {slide.ctaText}
                </a>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 ease-smooth",
                index === currentSlide 
                  ? "bg-white scale-100" 
                  : "bg-white/40 scale-90 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Arrow Controls */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/30 transition-all duration-300 ease-smooth"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/30 transition-all duration-300 ease-smooth"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default HomeHero;