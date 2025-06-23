import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { AlertTriangle } from "lucide-react";
import Navigation from "../components/Navigation";
import CategoryMenu from "../components/CategoryMenu"; 
import HomeHero from "../components/HomeHero";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import Cart from "../components/Cart";
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
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const HomePage = () => {
  const { items, itemCount, isCartOpen, closeCart, updateItemQuantity, removeItem } = useCart();
  const { homeSections, loading: settingsLoading } = useSettings();
  const { currentOffer, isOpen: isOfferOpen, closeOffer } = useOfferPopup();
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Intersection observer hooks for scroll animations
  const [philosophyRef, philosophyInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Function to render different section types
  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case 'hero':
        return (
          <motion.div 
            variants={itemVariants} 
            className="relative w-full overflow-hidden"
          >
            <HomeHero />
          </motion.div>
        );
      
      case 'categories':
        return (
          <motion.section 
            variants={itemVariants}
            className="relative"
          >
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading categories...</p>
              </div>
            ) : (
              <Categories />
            )}
          </motion.section>
        );
      
      case 'featured':
        return (
          <motion.section 
            variants={itemVariants}
            className="bg-white/30 backdrop-blur-sm"
          >
            <ProductGrid
              products={featuredProducts}
              title={section.title || "✨ Featured Collection"}
              subtitle={section.subtitle || "Explore our most popular floral arrangements"}
              loading={loading}
            />
          </motion.section>
        );
      
      case 'new':
        return (
          <motion.section 
            variants={itemVariants}
            className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5"
          >
            <ProductGrid
              products={newProducts}
              title={section.title || "🌸 New Arrivals"}
              subtitle={section.subtitle || "Discover our latest seasonal additions"}
              loading={loading}
            />
          </motion.section>
        );
      
      case 'philosophy':
        return (
          <motion.section 
            ref={philosophyRef}
            initial="hidden"
            animate={philosophyInView ? "visible" : "hidden"}
            variants={fadeInVariants}
            className="px-3 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100"
          >
            <div className="max-w-7xl mx-auto">
              <motion.div 
                className="flex flex-col lg:flex-row gap-8 sm:gap-12 items-center"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants} className="w-full lg:w-1/2">
                  <div className="relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl mx-auto max-w-md lg:max-w-none">
                    <img 
                      src="/images/d3.jpg" 
                      alt="Artisan Florist" 
                      className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                </motion.div>
                <motion.div 
                  className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left"
                  variants={itemVariants}
                >
                  <div className="inline-block text-xs sm:text-sm uppercase tracking-wider text-primary font-bold mb-4 px-3 sm:px-4 py-2 bg-primary/10 rounded-full w-fit mx-auto lg:mx-0">
                    Our Philosophy
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 mb-4 sm:mb-6 leading-tight">
                    {section.title || "Artfully Crafted Botanical Experiences"}
                  </h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed px-2 lg:px-0">
                    {section.subtitle || "Every arrangement we create is a unique work of art, designed to bring beauty and tranquility into your everyday spaces."}
                  </p>
                  <motion.a 
                    href="/about" 
                    className="inline-block self-center lg:self-start px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-base sm:text-lg rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
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
            variants={itemVariants}
            className="px-3 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 mb-4 sm:mb-6">
                {section.title || "Custom Section"}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
                {section.subtitle || "This is a custom section that can be configured from the admin panel."}
              </p>
            </div>
          </motion.section>
        );
      
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchProducts = async (retryCount = 0) => {
      try {
        setError("");
        setLoading(true);

        const results = await Promise.all([
          api.get("/products/featured"),
          api.get("/products/new"),
        ]).catch(async (err) => {
          if (retryCount < 2) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return fetchProducts(retryCount + 1);
          }
          throw err;
        });
        
        if (!results) return;
        const [featuredRes, newRes] = results;

        const processProducts = (products) => {
          return products.map((product) => ({
            ...product,
            originalPrice: product.price,
            price: product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price,
          }));
        };
      
        setFeaturedProducts(featuredRes.data.products || []);
        setNewProducts(newRes.data.products || []);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100"
    >
      {/* Offer Popup */}
      {currentOffer && (
        <OfferPopup
          isOpen={isOfferOpen}
          onClose={closeOffer}
          offer={currentOffer}
        />
      )}

      <Navigation />
      <CategoryMenu />
      
      {/* Main Content with proper top spacing */}
      <main className="relative z-10">
      {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 mt-20">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Render sections based on settings */}
      {!settingsLoading && homeSections?.map((section, index) => (
        <React.Fragment key={section.id || index}>
          {renderSection(section, index)}
        </React.Fragment>
      ))}
      </main>

        <Cart
          items={items}
        isOpen={isCartOpen}
          onClose={closeCart}
          onUpdateQuantity={updateItemQuantity}
          onRemoveItem={removeItem}
        />

      <Footer />
    </motion.div>
  );
};

export default HomePage;
