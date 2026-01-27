import React from 'react';
import { motion } from "framer-motion";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { X, AlertTriangle, Phone, Mail, FileText, Sparkles, ArrowRight, Clock, UserX, MessageCircle } from 'lucide-react';

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

const CancellationPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-secondary/3 to-accent/3 rounded-full blur-2xl animate-pulse" />
      </div>
      
      <Navigation cartItemCount={0} />
      
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
                <div className="text-4xl text-red-400">❌</div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-800 mb-6 pt-8 leading-tight">
                Cancellation <span className="bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 bg-clip-text text-transparent">Policy</span>
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-32 -translate-y-4">
                <div className="text-4xl text-yellow-400">⚠️</div>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Important information about order cancellations and our commitment to delivering your beautiful flowers.
            </p>
            
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <UserX className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">No Cancellations</h3>
                <p className="text-sm text-gray-600">After booking confirmation</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <MessageCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Personal Request</h3>
                <p className="text-sm text-gray-600">Contact us directly</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Immediate Processing</h3>
                <p className="text-sm text-gray-600">Orders processed quickly</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Content Section */}
        <motion.section 
          variants={itemVariants}
          className="px-6 md:px-8 pb-20"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden"
              variants={itemVariants}
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">Cancellation Policy</h2>
                    <p className="text-gray-600 mt-1">Spring Blossoms Florist - Effective Date: January 2024</p>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8">
                    {/* No Cancellation Policy */}
                    <motion.div 
                      className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        No Cancellation After Booking Confirmation
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Once your order is confirmed, we immediately begin sourcing fresh flowers and preparing your arrangement. Due to the perishable nature of flowers and our commitment to quality, we do not accept cancellations after booking confirmation.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700">Orders are processed immediately upon confirmation</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700">Fresh flowers are sourced and arranged to order</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700">Delivery schedules are optimized based on confirmed orders</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Personal Request Exception */}
                    <motion.div 
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-orange-500" />
                        Cancellation on Personal Request
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        While we maintain a strict no-cancellation policy, we understand that exceptional circumstances may arise. In such cases, you may contact us directly to discuss your situation.
                      </p>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">How to Request:</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Contact us immediately after placing your order</li>
                          <li>• Provide your order number and reason for cancellation</li>
                          <li>• Our team will review your request case-by-case</li>
                          <li>• Approval is not guaranteed and depends on order status</li>
                        </ul>
                      </div>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-blue-500" />
                        Contact for Cancellation Requests
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-800">Phone Support</p>
                            <p className="text-gray-700">+91 9849589710</p>
                            <p className="text-sm text-gray-600">9 AM - 10 PM (Daily)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-800">Email Support</p>
                            <p className="text-gray-700">2006sbf@gmail.com</p>
                            <p className="text-sm text-gray-600">Include order number</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Important Terms */}
                    <motion.div 
                      className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Important Terms</h3>
                      <div className="space-y-2 text-gray-700 text-sm">
                        <p>• This policy is effective from order confirmation</p>
                        <p>• Spring Blossoms Florist reserves the right to make final decisions on cancellation requests</p>
                        <p>• Any approved cancellations will follow our refund policy</p>
                        <p>• By placing an order, you agree to these cancellation terms</p>
                        <p>• We recommend double-checking all order details before confirming</p>
                      </div>
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

export default CancellationPolicyPage; 