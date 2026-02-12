import React from 'react';
import { motion } from "framer-motion";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FileText, Scale, CreditCard, Truck, RefreshCw, Sparkles, Shield, Users, AlertCircle, Gavel } from 'lucide-react';

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

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 relative overflow-hidden">
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
                <div className="text-4xl text-green-400">📋</div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-800 mb-6 pt-8 leading-tight">
                Terms & <span className="bg-gradient-to-r from-green-500 via-teal-600 to-blue-600 bg-clip-text text-transparent">Conditions</span>
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-32 -translate-y-4">
                <div className="text-4xl text-yellow-400">✨</div>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Your trusted local florist since 2006. Please read these terms carefully before using our services.
            </p>
            
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Scale className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Fair Terms</h3>
                <p className="text-sm text-gray-600">Clear and reasonable</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <CreditCard className="w-8 h-8 text-teal-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Secure Payment</h3>
                <p className="text-sm text-gray-600">Trusted transactions</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Truck className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Timely Delivery</h3>
                <p className="text-sm text-gray-600">Reliable service</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Fair Returns</h3>
                <p className="text-sm text-gray-600">Customer-focused</p>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">Terms & Conditions</h2>
                    <p className="text-gray-600 mt-1">Spring Blossoms Florist - Effective Date: [Insert Effective Date]</p>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8">
                    {/* Overview */}
                    <motion.div 
                      className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-500" />
                        Overview
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Welcome to Spring Blossoms Florist, your trusted local florist since 2006. By using our website, placing orders, or engaging with our services, you agree to be bound by the terms and conditions outlined below. These terms form a legally binding agreement between you and Spring Blossoms Florist, and govern your access to and use of our services.
                      </p>
                    </motion.div>

                    {/* Eligibility */}
                    <motion.div 
                      className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-teal-500" />
                        Eligibility
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our services are available only to individuals who can legally enter into binding contracts under Indian Contract Act, 1872. Persons who are "incompetent to contract" are not eligible to use our services. If you are under the age of 18, you may use our services only under the supervision of a parent or legal guardian.
                      </p>
                    </motion.div>

                    {/* Account Registration */}
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        Account Registration
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        To access certain features of our website, you may be required to create an account. You agree to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Provide accurate and up-to-date information</li>
                        <li>Maintain the confidentiality of your account credentials</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed mt-4">
                        We reserve the right to suspend or terminate your account at our sole discretion.
                      </p>
                    </motion.div>

                    {/* Product Availability and Pricing */}
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-500" />
                        Product Availability and Pricing
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We strive to ensure all products listed on our website are accurate in terms of description and pricing. However, due to seasonal availability, flower arrangements may vary. In such cases, we reserve the right to substitute with similar items of equal or greater value without prior notice.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        All prices listed are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Prices and availability are subject to change without notice.
                      </p>
                    </motion.div>

                    {/* Order Acceptance and Cancellation */}
                    <motion.div 
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-purple-500" />
                        Order Acceptance and Cancellation
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        When you place an order with us, you will receive an acknowledgment via email or SMS. This acknowledgment does not constitute acceptance of your order. Spring Blossoms Florist reserves the right to accept or reject your order for any reason, including but not limited to stock unavailability, payment issues, or suspected fraudulent activity.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        You may cancel or modify your order up to 24 hours before the scheduled delivery time. No modifications or cancellations are allowed once the order is confirmed and processed.
                      </p>
                    </motion.div>

                    {/* Delivery and Shipping */}
                    <motion.div 
                      className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-pink-500" />
                        Delivery and Shipping
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We offer scheduled deliveries within our operational regions. Delivery charges may apply depending on location, time, or urgency. While we strive to honor requested delivery times, delays may occur due to factors beyond our control such as traffic, weather, or public holidays.
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        In case the recipient is unavailable at the time of delivery:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>The product may be left with a neighbor/security personnel (with prior approval)</li>
                        <li>A second attempt may be scheduled (additional charges may apply)</li>
                        <li>The order may be marked as delivered if all efforts are made</li>
                      </ul>
                    </motion.div>

                    {/* Substitution Policy */}
                    <motion.div 
                      className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-rose-500" />
                        Substitution Policy
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Occasionally, substitutions may be necessary to ensure timely delivery. We guarantee that the quality and value of the replacement item will match or exceed the original product ordered. Substitutions will be made with items of similar style, color, and value.
                      </p>
                    </motion.div>

                    {/* Return and Refund Policy */}
                    <motion.div 
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-orange-500" />
                        Return and Refund Policy
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We do not accept returns for perishable goods once delivered. However, in cases of damage, incorrect delivery, or defective items, you may request:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                        <li>Re-delivery of the same product</li>
                        <li>Refund in the form of a gift voucher within 24 hours</li>
                        <li>Refund to original mode of payment within 7–10 business days</li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        <strong>Conditions where refunds will not be provided:</strong>
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Incorrect delivery address</li>
                        <li>Unavailability of the recipient</li>
                        <li>Mishandling of products after delivery</li>
                        <li>Complaints received after 48 hours of delivery</li>
                      </ul>
                    </motion.div>

                    {/* Use of Website */}
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl p-6 border border-yellow-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-yellow-500" />
                        Use of Website
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You agree not to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                        <li>Use our site for unlawful or fraudulent purposes</li>
                        <li>Harm or attempt to harm minors</li>
                        <li>Send or receive material which is offensive, defamatory, or violates third-party rights</li>
                        <li>Gain unauthorized access to our servers or any other systems</li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed">
                        We reserve the right to monitor usage and restrict access where misuse is detected.
                      </p>
                    </motion.div>

                    {/* Intellectual Property Rights */}
                    <motion.div 
                      className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-500" />
                        Intellectual Property Rights
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        All content, designs, logos, images, and text on the website are the intellectual property of Spring Blossoms Florist. Unauthorized use, reproduction, or distribution is strictly prohibited. You may not use any content for commercial purposes without written permission.
                      </p>
                    </motion.div>

                    {/* Liability Disclaimer */}
                    <motion.div 
                      className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-teal-500" />
                        Liability Disclaimer
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        While we strive for excellence, Spring Blossoms Florist shall not be liable for any direct or indirect loss resulting from:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Delays in delivery due to unforeseen events</li>
                        <li>Variations in product appearance</li>
                        <li>Customer misuse or misunderstanding of products</li>
                        <li>Unauthorized access to user data</li>
                      </ul>
                    </motion.div>

                    {/* Promotions and Discounts */}
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Promotions and Discounts
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Promotional codes and discounts are subject to their own terms and may not be combined with other offers. We reserve the right to revoke offers at our discretion.
                      </p>
                    </motion.div>

                    {/* Communication */}
                    <motion.div 
                      className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-500" />
                        Communication
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        By registering on our website, you consent to receive promotional and transactional communication via email, SMS, or phone. You may opt out of promotional messages at any time.
                      </p>
                    </motion.div>

                    {/* Indemnification */}
                    <motion.div 
                      className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-500" />
                        Indemnification
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        You agree to indemnify and hold harmless Spring Blossoms Florist, its directors, employees, and agents from any claims, liabilities, damages, or expenses arising out of your use of our services or violation of these terms.
                      </p>
                    </motion.div>

                    {/* Governing Law */}
                    <motion.div 
                      className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-red-500" />
                        Governing Law and Jurisdiction
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        These terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in [Insert City], India.
                      </p>
                    </motion.div>

                    {/* Amendments */}
                    <motion.div 
                      className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-pink-500" />
                        Amendments
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Spring Blossoms Florist reserves the right to change these terms at any time. Changes will be effective immediately upon posting. Continued use of the website constitutes your acceptance of the updated terms.
                      </p>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        Contact Us
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        For any questions regarding these Terms and Conditions, please contact:
                      </p>
                      <div className="bg-white/50 p-4 rounded-xl border border-white/30">
                        <p className="font-bold text-gray-800 mb-2">Spring Blossoms Florist</p>
                        <p className="text-gray-700">Door No. 12-2-786/A & B, Najam Centre,
                        Pillar No. 32,Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
                        <p className="text-gray-700">Email: 2006sbf@gmail.com</p>
                        <p className="text-gray-700">Phone: +91 9849589710</p>
                      </div>
                    </motion.div>

                    {/* Final Note */}
                    <motion.div 
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 text-center"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-gray-700 leading-relaxed font-medium">
                        <strong>Spring Blossoms Florist</strong> is dedicated to ensuring a safe, satisfying, and delightful experience for all our customers. Your trust is our most valuable asset.
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

export default TermsPage;
