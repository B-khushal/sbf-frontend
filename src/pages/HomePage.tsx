import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { addToCart } = useCart();
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

  // Handle add to cart with proper return type
  const handleAddToCart = (item: any, quantity: number) => {
    try {
      addToCart({ ...item, quantity });

      // Redirect to cart page after successful addition
      setTimeout(() => {
        navigate('/cart');
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  // Data fetching for products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch products from API
        const [featuredResponse, newResponse] = await Promise.allSettled([
          api.get('/products/featured'),
          api.get('/products/new')
        ]);

        const processProducts = (products) => {
          if (!Array.isArray(products)) return [];
          return products.map(product => ({
            ...product,
            _id: product._id || product.id,
            // Normalize across backend variants.
            isNewArrival: typeof product.isNewArrival === 'boolean'
              ? product.isNewArrival
              : Boolean(product.isNew),
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
    homeSections
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order),
    [homeSections]
  );

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen relative"
    >


      {/* Offer Popup */}
      <OfferPopup
        isOpen={isOfferOpen && currentOffer !== null}
        onClose={closeOffer}
        offer={currentOffer}
      />



      {enabledSections.map((section, index) => {
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
                className="bg-white/30 backdrop-blur-sm py-16 md:py-24"
              >
                <ProductGrid
                  products={featuredProducts}
                  title={section.title || "✨ Featured Collection"}
                  subtitle={section.subtitle || "Explore our most popular floral arrangements"}
                  loading={loading}
                  onAddToCart={handleAddToCart}
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
                className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 py-16 md:py-24"
              >
                <ProductGrid
                  products={newProducts}
                  title={section.title || "🌸 New Arrivals"}
                  subtitle={section.subtitle || "Discover our latest seasonal additions"}
                  loading={loading}
                  onAddToCart={handleAddToCart}
                  horizontal={true}
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
                className="px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-24 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100"
              >
                <div className="max-w-7xl mx-auto">
                  <motion.div
                    className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-center"
                    variants={containerVariants}
                  >
                    <motion.div variants={itemVariants} className="w-full lg:w-1/2">
                      <div className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                        <img
                          src={section.content?.image || "/placeholder.svg"}
                          alt={section.title || "Artisan Florist"}
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
                    </motion.div>
                  </motion.div>
                </div>
              </motion.section>
            );

          default:
            return null;
        }
      })}


    </motion.div>
  );
};

export default HomePage;
