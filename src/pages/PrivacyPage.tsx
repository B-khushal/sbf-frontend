import React from 'react';
import { motion } from "framer-motion";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, FileText, Sparkles, Users, Database, Globe, Clock, UserCheck, Baby, RefreshCw, Phone } from 'lucide-react';

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

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
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
                <div className="text-4xl text-blue-400">🔒</div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-800 mb-6 pt-8 leading-tight">
                Privacy <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Policy</span>
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-32 -translate-y-4">
                <div className="text-4xl text-yellow-400">✨</div>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Your trusted local florist since 2006. Committed to protecting your personal information in accordance with Indian data protection laws.
            </p>
            
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Data Protection</h3>
                <p className="text-sm text-gray-600">IT Act 2000 compliant</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Eye className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Transparency</h3>
                <p className="text-sm text-gray-600">Clear data practices</p>
              </motion.div>
              <motion.div 
                className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Lock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Your Control</h3>
                <p className="text-sm text-gray-600">Full data rights</p>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">Privacy Policy</h2>
                    <p className="text-gray-600 mt-1">Spring Blossoms Florist - Effective Date: [Insert Effective Date]</p>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8">
                    {/* Introduction */}
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-gray-700 leading-relaxed">
                        This Privacy Policy is an integral part of the Terms and Conditions of Spring Blossoms Florist ("we", "us", "our") and should be read in conjunction with them. Spring Blossoms Florist is committed to protecting your personal information and privacy in accordance with the applicable data protection laws of India, including the Information Technology Act, 2000 and associated rules.
                      </p>
                    </motion.div>

                    {/* Company Overview */}
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Company Overview
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Spring Blossoms Florist, established in 2006, operates the website [Insert Website URL] and is dedicated to maintaining your trust and confidence. This Privacy Policy outlines how we collect, use, and protect your personal data when you interact with our services.
                      </p>
                    </motion.div>

                    {/* Consent */}
                    <motion.div 
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-purple-500" />
                        Consent
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        By accessing and using our website, and by voluntarily providing your personal information, you consent to our collection, storage, and use of your data in accordance with this Privacy Policy. If you do not agree, please refrain from using our services.
                      </p>
                    </motion.div>

                    {/* Scope of the Policy */}
                    <motion.div 
                      className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-pink-500" />
                        Scope of the Policy
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        This Privacy Policy describes our practices concerning the collection, usage, and disclosure of personal information through our website and any associated digital or physical services.
                      </p>
                    </motion.div>

                    {/* Information We Collect */}
                    <motion.div 
                      className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Database className="w-5 h-5 text-rose-500" />
                        Information We Collect
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We collect and store the following types of information:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Name, address, contact number, and email</li>
                        <li>Date of birth, gender, and preferences</li>
                        <li>Login credentials (for registered users)</li>
                        <li>Order and transaction details</li>
                        <li>Device and browser information</li>
                        <li>Cookies and user behavior analytics</li>
                      </ul>
                    </motion.div>

                    {/* Purpose of Collection */}
                    <motion.div 
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-500" />
                        Purpose of Collection
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        The personal information we collect is used to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Fulfill orders and provide requested services</li>
                        <li>Send order updates and customer service responses</li>
                        <li>Improve user experience on our platform</li>
                        <li>Conduct promotional and marketing campaigns</li>
                        <li>Comply with legal obligations</li>
                      </ul>
                    </motion.div>

                    {/* Disclosure of Information */}
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl p-6 border border-yellow-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-yellow-500" />
                        Disclosure of Information
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We may share your information with:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Delivery and logistics partners</li>
                        <li>Payment gateway service providers</li>
                        <li>Technical support and hosting vendors</li>
                        <li>Law enforcement or governmental agencies (as required)</li>
                        <li>Affiliates and subsidiaries for operational purposes</li>
                      </ul>
                    </motion.div>

                    {/* Data Security */}
                    <motion.div 
                      className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-green-500" />
                        Data Security
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        We implement appropriate technical and organizational measures to secure your data from unauthorized access, alteration, or loss. These include secure servers, encrypted transmissions, and access-controlled databases.
                      </p>
                    </motion.div>

                    {/* Cookies and Tracking */}
                    <motion.div 
                      className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-teal-500" />
                        Cookies and Tracking
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our website uses cookies to improve functionality and user experience. Users can manage cookie settings through their browser. Disabling cookies may affect site performance.
                      </p>
                    </motion.div>

                    {/* Retention of Information */}
                    <motion.div 
                      className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-500" />
                        Retention of Information
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        We retain your personal data as long as necessary for the purposes outlined in this policy, or as required by applicable law. Once the retention period expires, your data will be deleted or anonymized.
                      </p>
                    </motion.div>

                    {/* User Rights */}
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-500" />
                        User Rights
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You have the right to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                        <li>Access your personal information</li>
                        <li>Correct any inaccuracies</li>
                        <li>Withdraw consent at any time</li>
                        <li>Opt-out of marketing communications</li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed">
                        For data access or correction, contact us using the details below.
                      </p>
                    </motion.div>

                    {/* Use of Children's Information */}
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Baby className="w-5 h-5 text-indigo-500" />
                        Use of Children's Information
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our services are intended for users above 18 years. We do not knowingly collect information from children under 18. Parents or guardians may contact us for any necessary removal of data.
                      </p>
                    </motion.div>

                    {/* Amendments to the Policy */}
                    <motion.div 
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-purple-500" />
                        Amendments to the Policy
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        We may update this Privacy Policy periodically. Changes will be effective upon posting. We encourage you to review this page regularly to stay informed.
                      </p>
                    </motion.div>

                    {/* Contact and Grievance Redressal */}
                    <motion.div 
                      className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-pink-500" />
                        Contact and Grievance Redressal
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        For any complaints, corrections, or access requests regarding your personal data, please contact:
                      </p>
                      <div className="bg-white/50 p-4 rounded-xl border border-white/30">
                        <p className="font-bold text-gray-800 mb-2"><strong>Name:</strong> B Deepak Kumar</p>
                        <p className="text-gray-700 mb-2"><strong>Address:</strong> Door No. 12-2-786/A & B, Najam Centre,
                        Pillar No. 32,Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028</p>
                        <p className="text-gray-700 mb-2"><strong>Email:</strong> 2006sbf@gmail.com</p>
                        <p className="text-gray-700"><strong>Phone:</strong> +91 9849589710</p>
                      </div>
                    </motion.div>

                    {/* Final Note */}
                    <motion.div 
                      className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100 text-center"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-gray-700 leading-relaxed font-medium">
                        <strong>Spring Blossoms Florist</strong> remains committed to safeguarding your personal data and ensuring transparency in how we handle it. Your privacy is our priority.
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

export default PrivacyPage;
