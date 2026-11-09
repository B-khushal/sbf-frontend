import React, { useState, useEffect, useRef } from 'react';
import productService, { ProductData } from '@/services/productService';
import { ProductCard } from '@/components/ProductGrid';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RecommendedProductsProps {
  productId: string;
  category: string;
  title?: string;
  subtitle?: string;
  limit?: number;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  productId,
  category,
  title = "You May Also Love",
  subtitle = "Curated Arrangements",
  limit = 6
}) => {
  const [recommendedProducts, setRecommendedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);
        const products = await productService.getRecommendedProducts(productId, category, limit);
        setRecommendedProducts(products);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendedProducts();
    }
  }, [productId, category, limit]);

  // Cinematic slow panning auto-scroll effect (pauses on hover)
  useEffect(() => {
    if (!isAutoScrolling || loading || !recommendedProducts.length) return;

    const container = scrollRef.current;
    if (!container) return;

    let animId: number;
    let lastTime = 0;
    const speed = 25; // Pixels per second

    const step = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (container) {
        container.scrollLeft += speed * delta;
        // Loop back to start if reached the end
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 2) {
          container.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isAutoScrolling, loading, recommendedProducts.length]);

  const handleScrollClick = (direction: 'left' | 'right') => {
    setIsAutoScrolling(false); // Stop auto-scroll on click interaction
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      const target = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-400 block text-center mb-2">
          {subtitle}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-slate-900 dark:text-slate-100 mb-8 font-serif">
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="bg-slate-100 dark:bg-slate-800 aspect-[4/5] rounded-2xl"></div>
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4"></div>
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendedProducts.length) {
    return null;
  }

  return (
    <div className="mt-16 pt-10 border-t border-slate-200/50 dark:border-slate-800/50 relative">
      {/* Header Branding */}
      <span className="text-[10px] uppercase font-extrabold tracking-[0.25em] text-rose-500 dark:text-rose-400 block text-center mb-2">
        {subtitle}
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-slate-900 dark:text-slate-100 mb-8 font-serif">
        {title}
      </h2>

      {/* Manual Scroll Controls */}
      <div className="absolute top-10 right-4 flex gap-2">
        <button
          onClick={() => handleScrollClick('left')}
          aria-label="Scroll recommendations left"
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => handleScrollClick('right')}
          aria-label="Scroll recommendations right"
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Cinematic Horizontal Scroll wrapper */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4 py-4 pb-8 -mx-4"
      >
        {recommendedProducts.map((recProd) => (
          <div
            key={recProd._id}
            className="w-[200px] xs:w-[220px] md:w-[300px] lg:w-[280px] flex-shrink-0 snap-start"
          >
            <ProductCard product={recProd as any} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;

