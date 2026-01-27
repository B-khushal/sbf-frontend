import React, { useState } from 'react';
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Info, Send, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm, openWhatsApp, openEmail, callPhone, openGoogleMaps } from '@/services/contactService';

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

const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Intersection observer hooks for scroll animations
  const [formRef, formInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const [contactRef, contactInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format message for WhatsApp and SMS
      const contactMessage = `*New Contact Form Message*
      
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}

Message:
${formData.message}

---
Sent from Spring Blossoms Florist Website`;

      // Send via WhatsApp
      const whatsappNumber = "9849589710";
      const encodedMessage = encodeURIComponent(contactMessage);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Also create SMS link as fallback
      const smsMessage = `New Contact: ${formData.firstName} ${formData.lastName} (${formData.email}) - ${formData.message}`;
      const encodedSmsMessage = encodeURIComponent(smsMessage);
      const smsUrl = `sms:${whatsappNumber}?body=${encodedSmsMessage}`;
      
      // Show success message
      toast({
        title: "Message Sent! 🌸",
        description: "Your message has been sent via WhatsApp. We'll get back to you soon!",
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      });
      
      // Optional: Also open SMS as backup (user can choose)
      setTimeout(() => {
        if (window.confirm("Would you also like to send this message via SMS as a backup?")) {
          window.location.href = smsUrl;
        }
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try contacting us directly at +91 9849589710.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-secondary/3 to-accent/3 rounded-full blur-2xl animate-pulse" />
      </div>
      
      <motion.main 
        className="relative flex-1 pt-24 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section - Mobile Responsive */}
        <motion.section 
          variants={itemVariants}
          className="px-3 sm:px-6 md:px-8 py-12 sm:py-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 sm:-translate-y-4">
                <div className="text-2xl sm:text-4xl text-yellow-400">💬</div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black text-gray-800 mb-4 sm:mb-6 pt-6 sm:pt-8 leading-tight">
                Contact <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Us</span> - Best Florist in Hyderabad
              </h1>
              <div className="absolute top-0 right-1/2 transform translate-x-16 sm:translate-x-32 -translate-y-2 sm:-translate-y-4">
                <div className="text-2xl sm:text-4xl text-yellow-400">✨</div>
              </div>
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-12 px-2">
              Contact the best florist in Hyderabad for flower delivery in Hyderabad, online bouquet shop India services, 
              midnight flower delivery, roses for anniversary, and birthday flowers online. Send flowers online with confidence.
            </p>

            {/* Delivery Notice - Mobile Responsive */}
            <motion.div 
              className="max-w-2xl mx-auto bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-yellow-800">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-sm sm:text-base">📍 Delivery Area</p>
                  <p className="text-xs sm:text-sm">Currently, we only deliver to Hyderabad, Telangana. We're working on expanding our delivery network soon!</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pb-12 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* Contact Form - Mobile Responsive */}
            <motion.section 
              ref={formRef}
              initial="hidden"
              animate={formInView ? "visible" : "hidden"}
              variants={fadeInVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/20"
            >
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-secondary rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800">Get In Touch</h2>
                </div>
                
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Ready to create something beautiful together? Send us a message and let's bring your floral vision to life!
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <motion.div 
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                        First Name *
                      </label>
                      <Input 
                        id="firstName" 
                        placeholder="Your first name" 
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all"
                        required 
                      />
                    </motion.div>
                    <motion.div 
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                        Last Name *
                      </label>
                      <Input 
                        id="lastName" 
                        placeholder="Your last name" 
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all"
                        required 
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="space-y-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address *
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all"
                      required 
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="message" className="text-sm font-semibold text-gray-700">
                      Your Message *
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your floral needs, special occasion, or any questions you have..." 
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="rounded-2xl border-2 border-gray-200 focus:border-primary transition-all resize-none"
                      required 
                    />
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-14 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message 🌸
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.section>
            
            {/* Contact Information */}
            <motion.section 
              ref={contactRef}
              initial="hidden"
              animate={contactInView ? "visible" : "hidden"}
              variants={fadeInVariants}
            >
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-800">Visit Our Store</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Come experience our beautiful collection in person at our flagship store in the heart of Hyderabad.
                </p>
              </motion.div>
              
              <motion.div className="space-y-6" variants={containerVariants}>
                <motion.div 
                  variants={itemVariants}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">📍 Our Location</h3>
                      <p className="text-gray-600 leading-relaxed mb-3">
                      Door No. 12-2-786/A & B, Najam Centre,<br />
                       Pillar No. 32,Rethi Bowli, Mehdipatnam,<br />
                        Hyderabad, Telangana 500028<br />
                        <span className="text-sm text-primary font-semibold">Near Tolichihocki, HITEC City </span>
                      </p>
                      <Button
                        onClick={openGoogleMaps}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        View on Maps
                      </Button>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Phone className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">📞 Phone</h3>
                        <p className="text-gray-600 text-lg mb-1">+91 9849589710</p>
                        <p className="text-sm text-gray-500 mb-3">Available during business hours</p>
                        <Button
                          onClick={() => window.location.href = 'tel:+919849589710'}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      </div>
                    </div>
                    
                    {/* WhatsApp Contact */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center shrink-0">
                        <MessageCircle className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">💬 WhatsApp</h3>
                        <p className="text-green-600 text-lg font-semibold mb-1">9849589710</p>
                        <p className="text-sm text-gray-500 mb-3">Chat with us instantly</p>
                        <Button
                          onClick={() => {
                            const message = "Hello! I'm interested in your flower arrangements.";
                            const encodedMessage = encodeURIComponent(message);
                            const whatsappUrl = `https://wa.me/9849589710?text=${encodedMessage}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat on WhatsApp
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">✉️ Email</h3>
                        <p className="text-gray-600 text-lg mb-1">2006sbf@gmail.com</p>
                        <p className="text-sm text-gray-500 mb-3">We reply within 24 hours</p>
                        <Button
                          onClick={() => openEmail("Inquiry - Spring Blossoms Florist")}
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Clock className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">⏰ Store Hours</h3>
                        <div className="text-gray-600 space-y-1">
                          <p><span className="font-semibold">Monday-Friday:</span> 09:00 AM - 11:00 PM</p>
                          <p><span className="font-semibold">Saturday:</span> 09:00 AM - 11:00 PM</p>
                          <p><span className="font-semibold">Sunday:</span> 09:00 AM - 11:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.section>
          </div>
        </div>

        {/* Call to Action Section */}
        <motion.section 
          variants={itemVariants}
          className="px-6 md:px-8 py-20 text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-6">
              Let's Create Something Beautiful Together! 🌺
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Browse our exquisite collection while you're here
            </p>
            <motion.a
              href="/shop"
              className="inline-block px-12 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-lg rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🛍️ Explore Our Collection
            </motion.a>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
};

export default ContactPage;
