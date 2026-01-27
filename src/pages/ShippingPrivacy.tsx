import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Truck, 
  Clock, 
  MapPin, 
  DollarSign, 
  Search, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Shield,
  ArrowLeft,
  CheckCircle,
  Star,
  Package,
  Users,
  RefreshCw,
  Calendar,
  Home,
  Building,
  Heart,
  UserX
} from 'lucide-react';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const ShippingPage = () => {
  const [contentRef, contentInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-secondary/3 to-accent/3 rounded-full blur-2xl animate-pulse" />
      </div>

      <Navigation />
      
      <motion.main 
        className="flex-grow relative z-10 pt-20 sm:pt-24"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.section 
          variants={itemVariants}
          className="px-4 sm:px-6 md:px-8 py-8 sm:py-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 sm:-translate-y-4">
                <div className="text-2xl sm:text-4xl">🚚</div>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-gray-800 mb-4 sm:mb-6 pt-6 sm:pt-8 leading-tight">
                Flower Delivery in Hyderabad - <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-teal-600 bg-clip-text text-transparent">Shipping & Delivery</span>
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-16 sm:translate-x-32 -translate-y-2 sm:-translate-y-4">
                <div className="text-2xl sm:text-4xl">🌸</div>
              </div>
            </div>
            <p className="text-base sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
              Best florist in Hyderabad offering flower delivery in Hyderabad, online bouquet shop India, midnight flower delivery, 
              roses for anniversary, and birthday flowers online. Send flowers online with prompt and safe delivery.
            </p>

            {/* Back Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-8 sm:mb-12"
            >
              <Link to="/">
                <Button 
                  variant="outline"
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-primary transition-all text-sm sm:text-base"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Info Cards */}
        <motion.section 
          variants={itemVariants}
          className="px-4 sm:px-6 md:px-8 pb-8 sm:pb-16"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/20 text-center hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2">Hyderabad Only</h3>
                <p className="text-sm sm:text-base text-gray-600">Delivery within Hyderabad, Telangana</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/20 text-center hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2">Scheduled Delivery</h3>
                <p className="text-sm sm:text-base text-gray-600">Timely & reliable</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/20 text-center hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2">Hand Delivered</h3>
                <p className="text-sm sm:text-base text-gray-600">By our in-house team</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Policy Details */}
        <motion.section
          ref={contentRef}
          variants={itemVariants}
          className="px-4 sm:px-6 md:px-8 pb-12 sm:pb-20"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden"
              variants={itemVariants}
            >
              <div className="p-6 sm:p-8 md:p-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Shipping & Delivery Policy</h2>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8">
                    {/* Serviceable Area */}
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        Serviceable Area
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        We currently <strong>only deliver within Hyderabad, Telangana</strong>. Orders outside this region are not accepted or fulfilled at this time.
                      </p>
                    </motion.div>

                    {/* General Delivery Terms */}
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-500" />
                        General Delivery Terms
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Flowers may be delivered in <strong>fully bloomed, semi-bloomed, or bud stage</strong> depending on availability.</li>
                        <li>Orders are hand-delivered by our in-house team or authorized delivery personnel.</li>
                        <li>Deliveries are available from <strong>Monday to Sunday</strong>, excluding national holidays or any unforeseen closures.</li>
                      </ul>
                    </motion.div>

                    {/* Delivery Timeframes */}
                    <motion.div 
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        Delivery Timeframes
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li><strong>Standard delivery:</strong> Place orders by <strong>4:00 PM IST</strong> for next day delivery.</li>
                        <li><strong>Fixed time delivery:</strong> Subject to a delivery window of ±30 minutes from the chosen time.</li>
                        <li><strong>Midnight delivery:</strong> Currently not available.</li>
                      </ul>
                    </motion.div>

                    {/* Delivery Confirmation */}
                    <motion.div 
                      className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-pink-500" />
                        Delivery Confirmation
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>We do not guarantee the exact delivery time. Delivery times are <strong>estimated</strong> and subject to product availability and delivery location.</li>
                        <li>You may receive a <strong>confirmation call/SMS</strong> upon successful delivery.</li>
                      </ul>
                    </motion.div>

                    {/* Non-Delivery Cases */}
                    <motion.div 
                      className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <UserX className="w-5 h-5 text-rose-500" />
                        Non-Delivery Cases
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Orders will be considered delivered in the following scenarios even if the product is not physically handed to the recipient:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Incorrect delivery address.</li>
                        <li>Recipient unavailable at the time of delivery.</li>
                        <li>Premises locked or inaccessible.</li>
                        <li>Recipient refuses the delivery.</li>
                        <li>Recipient requests the order be left at reception, gate, security, or with a neighbor.</li>
                      </ul>
                    </motion.div>

                    {/* Special Locations */}
                    <motion.div 
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Building className="w-5 h-5 text-orange-500" />
                        Special Locations
                      </h3>
                      <div className="space-y-4 text-gray-700">
                        <div>
                          <h4 className="font-semibold mb-2">🏥 Hospitals:</h4>
                          <p>Please provide accurate details such as hospital name, ward/room number, and recipient name. Flowers will be delivered to the reception or as per hospital protocol.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">🏨 Hotels:</h4>
                          <p>Please provide hotel name, room number, and contact details. If the recipient has checked out or hasn't checked in, the delivery will be considered complete if left at the reception.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">💒 Wedding Halls / Events:</h4>
                          <p>Delivery will be made to an event coordinator or responsible person onsite.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">🏠 PGs / Hostels / Cantonments / Gated Communities:</h4>
                          <p>Recipient must coordinate with the delivery executive. If unavailable, the order will be left at reception or with a responsible authority.</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Redelivery and Refunds */}
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl p-6 border border-yellow-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-yellow-500" />
                        Redelivery and Refunds
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li><strong>We attempt delivery only once</strong> for perishable items such as flowers.</li>
                        <li>In case the delivery is not executed for reasons not attributable to Spring Blossoms Florist, <strong>no redelivery or refund</strong> will be made.</li>
                      </ul>
                    </motion.div>

                    {/* Order Tracking */}
                    <motion.div 
                      className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Search className="w-5 h-5 text-green-500" />
                        Order Tracking
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        For order-related inquiries, you may reach out to us via WhatsApp or our customer support number provided on the website.
                      </p>
                    </motion.div>

                    {/* Unforeseen Delays */}
                    <motion.div 
                      className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-teal-500" />
                        Unforeseen Delays
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Delivery may be delayed due to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                        <li>Severe weather</li>
                        <li>Roadblocks or traffic issues</li>
                        <li>Festivals or high order volume</li>
                        <li>Political disruptions</li>
                        <li>Any unforeseen circumstances</li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed">
                        In such cases, customers will be notified via phone, SMS, or email.
                      </p>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div 
                      className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-cyan-500" />
                        Customer Support
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        If you have questions regarding your delivery or would like assistance with your order, please contact our customer support team:
                      </p>
                      <div className="bg-white/50 p-4 rounded-xl border border-white/30">
                        <p className="text-gray-700 mb-2"><strong>Address:</strong> Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
                        <p className="text-gray-700 mb-2"><strong>Email:</strong> 2006sbf@gmail.com</p>
                        <p className="text-gray-700"><strong>Phone:</strong> +91 9849589710</p>
                      </div>
                    </motion.div>

                    {/* Final Note */}
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 text-center"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="text-xl">🌸</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        We are committed to ensuring every bouquet brings a smile, right on time.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default ShippingPage;
