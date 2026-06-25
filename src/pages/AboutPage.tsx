import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Heart, Award, Users, Leaf, Sparkles, Star, X, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      ease: [0.25, 0.46, 0.45, 0.94] as const
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
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
};

const AboutPage: React.FC = () => {
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  // Intersection observer hooks for scroll animations
  const [storyRef, storyInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const [valuesRef, valuesInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const [processRef, processInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const openJourneyModal = () => setShowJourneyModal(true);
  const closeJourneyModal = () => setShowJourneyModal(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50 relative overflow-hidden">
      <Helmet>
        <title>About Spring Blossoms - Best Florist in Hyderabad | Online Bouquet Shop</title>
        <meta name="description" content="Learn more about Spring Blossoms, the best florist in Hyderabad. We offer fresh flowers delivery, roses for anniversary, and online flower delivery in Hyderabad." />
        <meta name="keywords" content="flower delivery Hyderabad, online flower delivery Hyderabad, same day flower delivery Hyderabad, midnight flower delivery Hyderabad, fresh flowers delivery Hyderabad, florist Hyderabad, best florist in Hyderabad, flower shop Hyderabad, online florist Hyderabad, bouquet delivery Hyderabad, rose bouquet delivery Hyderabad, birthday flower delivery Hyderabad, anniversary flower delivery Hyderabad, wedding flowers Hyderabad, flower arrangements Hyderabad, luxury flower delivery Hyderabad, affordable flower delivery Hyderabad, cheap flower delivery Hyderabad, premium flowers Hyderabad, flower bouquet online Hyderabad, send flowers to Hyderabad, Hyderabad flower delivery service, flowers home delivery Hyderabad, express flower delivery Hyderabad, 24 hour flower delivery Hyderabad, flowers near me Hyderabad, red roses delivery Hyderabad, orchid delivery Hyderabad, lily flower delivery Hyderabad, carnation bouquet Hyderabad, mixed flower bouquet Hyderabad, romantic flower delivery Hyderabad, Valentine's Day flowers Hyderabad, Mother's Day flower delivery Hyderabad, congratulations flowers Hyderabad, get well soon flowers Hyderabad, sympathy flowers Hyderabad, flower and cake delivery Hyderabad, flowers and gifts Hyderabad, flower basket delivery Hyderabad, customized bouquet Hyderabad, online bouquet order Hyderabad, florist near Hyderabad airport, flower delivery in Gachibowli, flower delivery in Hitech City, flower delivery in Banjara Hills, flower delivery in Jubilee Hills, flower delivery in Kondapur, flower delivery in Kukatpally, flower delivery in Secunderabad" />
      </Helmet>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-bloom-blue-200/20 via-transparent to-bloom-pink-200/20 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-bloom-green-200/20 via-transparent to-bloom-blue-200/20 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-bloom-pink-100/30 to-bloom-green-100/30 rounded-full blur-2xl animate-pulse" />
      </div>
      
      <motion.main 
        className="relative flex-1 pt-24 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.section 
          variants={itemVariants}
          className="px-6 md:px-8 py-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <div className="text-4xl text-yellow-400">✨</div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-800 mb-6 pt-8 leading-tight">
                About <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Spring Blossoms</span> - Best Florist in Hyderabad
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-32 -translate-y-4">
                <div className="text-4xl text-yellow-400">✨</div>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Leading flower delivery in Hyderabad and online bouquet shop India. We're passionate about bringing the freshest flowers 
              and arrangements to your special moments, offering midnight flower delivery, roses for anniversary, and birthday flowers online.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <div className="text-2xl font-black text-primary mb-2">10K+</div>
                <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Award className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <div className="text-2xl font-black text-secondary mb-2">18</div>
                <div className="text-sm text-gray-600 font-medium">Years Experience</div>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-black text-accent mb-2">50+</div>
                <div className="text-sm text-gray-600 font-medium">Expert Florists</div>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Leaf className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-black text-primary mb-2">100%</div>
                <div className="text-sm text-gray-600 font-medium">Sustainable</div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Our Story Section */}
        <motion.section 
          ref={storyRef}
          initial="hidden"
          animate={storyInView ? "visible" : "hidden"}
          variants={fadeInVariants}
          className="px-6 md:px-8 py-16 md:py-24 bg-white/30 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="flex flex-col lg:flex-row gap-12 items-center"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="w-full lg:w-1/2">
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
                  <img 
                    src="https://res.cloudinary.com/djtrhfqan/image/upload/v1781358906/ChatGPT_Image_Jun_13_2026_07_14_02_PM_yfimlo.png" 
                    alt="Our Story" 
                    className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-bold text-gray-800">Founded in 2006</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="w-full lg:w-1/2 flex flex-col justify-center"
                variants={itemVariants}
              >
                <div className="inline-block text-sm uppercase tracking-wider text-primary font-bold mb-4 px-4 py-2 bg-primary/10 rounded-full w-fit">
                  Our Story
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 mb-6 leading-tight">
                  From Small Dreams <br />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    to Blooming Reality
                  </span>
                </h2>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Founded in 2006, Spring Blossoms started with a simple mission: to connect people through the 
                  language of flowers. What began as a small local shop has blossomed into the best florist in Hyderabad 
                  and a leading online bouquet shop India, offering premium flower delivery in Hyderabad.
                </p>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Our journey is rooted in the belief that every flower tells a story, and every arrangement 
                  carries emotions that words sometimes cannot express.
                </p>
                <motion.button 
                  onClick={openJourneyModal}
                  className="inline-block self-start px-8 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-lg rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Book className="w-5 h-5 mr-2 inline" />
                  Read Our Journey
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Mission & Values Section */}
        <motion.section 
          ref={valuesRef}
          initial="hidden"
          animate={valuesInView ? "visible" : "hidden"}
          variants={fadeInVariants}
          className="px-6 md:px-8 py-16 md:py-24 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
                Our Mission & <span className="text-primary">Values</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We believe that flowers have the power to transform spaces and emotions
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              variants={containerVariants}
            >
              <motion.div 
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  We believe that flowers have the power to transform spaces and emotions. Our mission 
                  is to create beautiful, sustainable arrangements that bring joy to every occasion, 
                  connecting hearts through nature's most beautiful expressions.
                </p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Values</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Sustainability in sourcing and packaging
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    Artistry in every arrangement
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    Excellence in customer service
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Community engagement and support
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Our Process Section */}
        <motion.section 
          ref={processRef}
          initial="hidden"
          animate={processInView ? "visible" : "hidden"}
          variants={fadeInVariants}
          className="px-6 md:px-8 py-16 md:py-24 bg-white/30 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
                Our <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Process</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Every Spring Blossoms arrangement is carefully crafted by our team of experienced florists
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
            >
              <motion.div 
                variants={itemVariants}
                className="text-center bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">1. Sustainable Sourcing</h3>
                <p className="text-gray-600 leading-relaxed">
                  We source the freshest blooms from sustainable farms, ensuring quality and environmental responsibility.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="text-center bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">2. Artful Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our expert florists create designs that balance classic elegance with contemporary trends.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="text-center bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">3. Delivered with Love</h3>
                <p className="text-gray-600 leading-relaxed">
                  Each arrangement is carefully packaged and delivered fresh to create unforgettable moments.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section 
          variants={itemVariants}
          className="px-6 md:px-8 py-20 text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-6">
              Ready to Experience Our Magic? 🌺
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover our complete collection and let us help you create unforgettable moments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/shop"
                className="inline-block px-12 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-lg rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🛍️ Shop Now
              </motion.a>
              <motion.a
                href="/contact"
                className="inline-block px-12 py-4 bg-white text-gray-800 font-bold text-lg rounded-full border-2 border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💬 Contact Us
              </motion.a>
            </div>
          </div>
        </motion.section>
      </motion.main>
      
      {showJourneyModal && <JourneyModal onClose={closeJourneyModal} />}
    </div>
  );
};

interface JourneyModalProps {
  onClose: () => void;
}

const JourneyModal: React.FC<JourneyModalProps> = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-gray-150">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center gap-2">
              🌸 Our Journey
            </h3>
            <p className="text-gray-600 mt-1">From small dreams to blooming reality since 2006</p>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Timeline Content */}
          <div className="max-h-[60vh] p-6 sm:p-8 overflow-y-auto">
            <div className="relative border-l-2 border-primary/20 ml-4 pl-6 space-y-8 py-2">
              {/* 2006 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-md" />
                <h4 className="font-extrabold text-primary text-lg mb-1">2006 — The First Seed</h4>
                <p className="text-gray-600 leading-relaxed">
                  Opened a small, cozy local flower boutique in the heart of Hyderabad. Our vision was simple yet profound: to deliver the freshest flowers with exceptional customer service and introduce Hyderabad to a new level of floral styling.
                </p>
              </div>

              {/* 2012 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-secondary border-4 border-white shadow-md" />
                <h4 className="font-extrabold text-secondary text-lg mb-1">2012 — Branching Out</h4>
                <p className="text-gray-600 leading-relaxed">
                  Expanded our network to partner directly with local flower farmers across India and exotic growers worldwide. This direct sourcing model guaranteed unmatched freshness and allowed us to introduce exotic orchids and lilies to our collections.
                </p>
              </div>

              {/* 2018 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-accent border-4 border-white shadow-md" />
                <h4 className="font-extrabold text-accent text-lg mb-1">2018 — Going Digital</h4>
                <p className="text-gray-600 leading-relaxed">
                  Launched our first digital platform, allowing customers to send roses for anniversary events, birthday flowers, and custom bouquets from anywhere in the world, with guaranteed same-day and midnight delivery services.
                </p>
              </div>

              {/* 2023 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-md" />
                <h4 className="font-extrabold text-primary text-lg mb-1">2023 — A Reason to Express</h4>
                <p className="text-gray-600 leading-relaxed">
                  Rebranded to SBF (Spring Blossoms Florist) with a state-of-the-art customizable bundle system, custom greeting cards, and real-time delivery notification updates, helping our community find a true reason to express their emotions.
                </p>
              </div>

              {/* Today */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-md animate-pulse" />
                <h4 className="font-extrabold text-emerald-600 text-lg mb-1">Today — Blooming Strong</h4>
                <p className="text-gray-600 leading-relaxed">
                  Now recognized as the best florist in Hyderabad, we remain dedicated to green packaging, sustainable operations, and creating unforgettable memories for our customers through premium floral creations.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t flex justify-end">
            <Button 
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutPage;
