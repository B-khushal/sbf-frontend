import React from 'react';
import { motion } from "framer-motion";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { RefreshCw, Clock, CreditCard, AlertCircle, CheckCircle, Phone, Mail, FileText, Sparkles, ArrowRight } from 'lucide-react';

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

const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
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
                <div className="text-4xl text-green-400">💰</div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-800 mb-6 pt-8 leading-tight">
                Refund <span className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent">Policy</span>
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-32 -translate-y-4">
                <div className="text-4xl text-yellow-400">✨</div>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Clear and transparent refund policies to ensure your complete satisfaction with Spring Blossoms Florist.
            </p>
            
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Clock className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">24-48 Hours</h3>
                <p className="text-sm text-gray-600">Processing time</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <CreditCard className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Multiple Methods</h3>
                <p className="text-sm text-gray-600">Bank/UPI/Wallet</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle className="w-8 h-8 text-teal-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">100% Safe</h3>
                <p className="text-sm text-gray-600">Secure process</p>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">Refund Policy</h2>
                    <p className="text-gray-600 mt-1">Spring Blossoms Florist - Effective Date: January 2024</p>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8">
                    {/* Introduction */}
                    <motion.div 
                      className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-500" />
                        Our Commitment to You
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        At Spring Blossoms Florist, your satisfaction is our priority. We understand that sometimes situations arise that may require a refund. This policy outlines the conditions and process for refunds to ensure transparency and fairness for all our customers.
                      </p>
                    </motion.div>

                    {/* Refund Eligibility */}
                    <motion.div 
                      className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Refund Eligibility
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Order Issues:</strong> Wrong flowers delivered, damaged products, or significant quality issues</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Delivery Failures:</strong> Failed delivery due to our fault or incorrect address provided by us</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Service Issues:</strong> Delivery significantly delayed beyond the promised time without prior notice</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Payment Errors:</strong> Duplicate charges or incorrect billing amounts</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Non-Refundable Items */}
                    <motion.div 
                      className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Non-Refundable Situations
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Successfully Delivered Orders:</strong> Orders delivered correctly as per specifications</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Customer Address Issues:</strong> Delivery failures due to incorrect/incomplete address provided by customer</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Recipient Unavailability:</strong> Unable to deliver due to recipient not being available after multiple attempts</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Natural Variation:</strong> Minor variations in flower appearance due to natural characteristics</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700"><strong>Change of Mind:</strong> Customer deciding they no longer want the order after it has been prepared</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Important Notes */}
                    <motion.div 
                      className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Important Notes</h3>
                      <div className="space-y-2 text-gray-700">
                        <p>• All refund requests must include order number and contact details</p>
                        <p>• Partial refunds may be offered for partially satisfactory orders</p>
                        <p>• We reserve the right to verify all refund claims</p>
                        <p>• This policy is subject to change with prior notice</p>
                        <p>• Contact us immediately for any delivery issues or concerns</p>
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

export default RefundPolicyPage; 