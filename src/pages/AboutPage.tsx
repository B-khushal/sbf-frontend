import React, { useState } from 'react';
import { motion } from "framer-motion";
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
                    src="/images/s1.png" 
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

export default AboutPage;
