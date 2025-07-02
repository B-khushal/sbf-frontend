import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { AlertTriangle } from "lucide-react";
import HomeHero from "../components/HomeHero";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";
import OffersSection from "../components/OffersSection";
import useCart from "../hooks/use-cart";
import { useSettings } from "../contexts/SettingsContext";
import { useOfferPopup } from "../hooks/use-offer-popup";
import OfferPopup from "../components/ui/OfferPopup";
import api from "../services/api";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const HomePage = () => {
  const { addItem, openCart } = useCart();
  const { homeSections, loading: settingsLoading } = useSettings();
  const { currentOffer, isOpen: isOfferOpen, closeOffer } = useOfferPopup();
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Intersection observer hooks for scroll animations
  const [philosophyRef, philosophyInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "50px"
  });

  // Data fetching for products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Try to get cached data first
        const cacheKey = 'homepage_products';
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
        
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < cacheExpiry) {
          const data = JSON.parse(cached);
          setFeaturedProducts(data.featured || []);
          setNewProducts(data.new || []);
          setLoading(false);
          return;
        }
        
        // Fetch products from API
        const [featuredResponse, newResponse] = await Promise.allSettled([
          api.get('/products/featured'),
          api.get('/products/new')
        ]);
        
        const processProducts = (products) => {
          if (!Array.isArray(products)) return [];
          return products.map(product => ({
            ...product,
            _id: product._id || product.id
          }));
        };

        const featuredData = featuredResponse.status === 'fulfilled' 
          ? processProducts(featuredResponse.value.data.products || featuredResponse.value.data || [])
          : [];
          
        const newData = newResponse.status === 'fulfilled'
          ? processProducts(newResponse.value.data.products || newResponse.value.data || [])
          : [];

        setFeaturedProducts(featuredData);
        setNewProducts(newData);
        
        // Cache the results
        sessionStorage.setItem(cacheKey, JSON.stringify({
          featured: featuredData,
          new: newData
        }));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Memoize enabled sections to prevent unnecessary re-renders
  const enabledSections = useMemo(() => 
    homeSections.filter(section => section.enabled),
    [homeSections]
  );

  // Function to render different section types
  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case 'hero':
        return (
          <motion.div 
            key={`hero-${index}`}
            variants={itemVariants} 
            className="relative w-full overflow-hidden"
          >
            <HomeHero />
          </motion.div>
        );
      
      case 'categories':
        return (
          <motion.section 
            key={`categories-${index}`}
            variants={itemVariants}
            className="relative"
          >
            <Categories />
          </motion.section>
        );
      
      case 'featured':
        return (
          <motion.section 
            key={`featured-${index}`}
            variants={itemVariants}
            className="bg-white/30 backdrop-blur-sm"
          >
            <ProductGrid
              products={featuredProducts}
              title={section.title || "✨ Featured Collection"}
              subtitle={section.subtitle || "Explore our most popular floral arrangements"}
              loading={loading}
              onAddToCart={addItem}
              onOpenCart={openCart}
            />
          </motion.section>
        );
      
      case 'offers':
        return (
          <motion.section 
            key={`offers-${index}`}
            variants={itemVariants}
            className="relative"
          >
            <OffersSection />
          </motion.section>
        );
      
      case 'new':
        return (
          <motion.section 
            key={`new-${index}`}
            variants={itemVariants}
            className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5"
          >
            <ProductGrid
              products={newProducts}
              title={section.title || "🌸 New Arrivals"}
              subtitle={section.subtitle || "Discover our latest seasonal additions"}
              loading={loading}
              onAddToCart={addItem}
              onOpenCart={openCart}
            />
          </motion.section>
        );
      
      case 'philosophy':
        return (
          <motion.section 
            key={`philosophy-${index}`}
            ref={philosophyRef}
            initial="hidden"
            animate={philosophyInView ? "visible" : "hidden"}
            variants={fadeInVariants}
            className="px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100"
          >
            <div className="max-w-7xl mx-auto">
              <motion.div 
                className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-center"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants} className="w-full lg:w-1/2">
                  <div className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                    <img 
                      src="/images/d3.jpg" 
                      alt="Artisan Florist" 
                      className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                </motion.div>
                <motion.div 
                  className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left"
                  variants={itemVariants}
                >
                  <div className="inline-block text-xs sm:text-sm uppercase tracking-wider text-primary font-bold mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full w-fit mx-auto lg:mx-0">
                    Our Philosophy
                  </div>
                  <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-800 mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight">
                    {section.title || "Artfully Crafted Botanical Experiences"}
                  </h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 md:mb-7 lg:mb-8 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed px-2 lg:px-0">
                    {section.subtitle || "Every arrangement we create is a unique work of art, designed to bring beauty and tranquility into your everyday spaces."}
                  </p>
                  <motion.a 
                    href="/about" 
                    className="inline-block self-center lg:self-start px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 xs:py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-sm xs:text-base sm:text-lg md:text-xl rounded-full hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More About Us
                  </motion.a>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        );
      
      case 'custom':
        return (
          <motion.section 
            key={`custom-${index}`}
            variants={itemVariants}
            className="px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20 text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                {section.title || "Custom Section"}
              </h2>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2">
                {section.subtitle || "This is a custom section that can be configured from the admin panel."}
              </p>
            </div>
          </motion.section>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50 min-h-screen">
      
      {isOfferOpen && currentOffer && (
        <OfferPopup 
          offer={currentOffer} 
          isOpen={isOfferOpen} 
          onClose={closeOffer} 
        />
      )}
      
      <motion.div 
        className="space-y-8 sm:space-y-12 md:space-y-16 lg:space-y-20 xl:space-y-24 pb-12 sm:pb-16 md:pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {enabledSections.length === 0 && !settingsLoading ? (
          <div className="text-center py-20 px-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">No sections to display</h2>
            <p className="mt-2 text-gray-600">
              The homepage sections may be loading or are not configured.
            </p>
          </div>
        ) : (
          enabledSections.map((section, index) => (
            <div key={section.id || index} className="overflow-hidden">
              {renderSection(section, index)}
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default HomePage;
