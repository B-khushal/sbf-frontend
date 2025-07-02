import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  Instagram, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Send, 
  Heart,
  Flower2,
  Gift,
  CreditCard,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

const Footer = () => {
  const { footerSettings, loading } = useSettings();
  const [email, setEmail] = useState('');

  // WhatsApp contact number - using just the number without +91
  const whatsappNumber = "9949683222";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I'm interested in your flower arrangements.`;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the newsletter subscription
    toast.success("Thanks for subscribing!", {
      description: "We'll keep you updated with our latest offers.",
    });
    setEmail('');
  };

  if (loading) {
    return (
      <footer className="bg-secondary/40 pt-12 sm:pt-16 pb-6 sm:pb-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading footer...</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-gradient-to-br from-secondary/40 via-secondary/30 to-secondary/20 pt-16 pb-8">
      {/* Newsletter Section */}
      <div className="absolute top-0 left-0 right-0 transform -translate-y-1/2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary/90 to-secondary/90 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">Subscribe to Our Newsletter</h3>
                <p className="text-white/80 text-sm sm:text-base">Get updates on new arrivals and special offers!</p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full sm:w-auto gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-w-[240px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <Send className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 pt-8">
          {/* Brand & Info */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-semibold mb-4">
              <Flower2 className="w-6 h-6 text-primary" />
              {footerSettings.companyName}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {footerSettings.description}
            </p>
            <div className="flex items-center gap-3">
              {/* WhatsApp Link */}
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors duration-300"
                aria-label="WhatsApp"
                title="Chat with us on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              
              {/* Social Links */}
              {footerSettings.socialLinks
                .filter(link => link.enabled)
                .map((link) => {
                  const IconComponent = 
                    link.platform === 'Instagram' ? Instagram :
                    link.platform === 'Facebook' ? Facebook :
                    link.platform === 'Twitter' ? Twitter : Instagram;
                  
                  return (
                    <a 
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-300"
                      aria-label={link.platform}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })
              }
            </div>
          </div>

          {/* Quick Links */}
          {footerSettings.links.map((section) => (
            <div key={section.section}>
              <h3 className="text-base font-semibold mb-4">{section.section}</h3>
              <ul className="space-y-3">
                {section.items
                  .filter(item => item.enabled)
                  .map((item) => (
                    <li key={item.href}>
                      <Link 
                        to={item.href} 
                        className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group text-sm"
                      >
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Email Us</p>
                  <a 
                    href={`mailto:${footerSettings.contactInfo.email}`} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {footerSettings.contactInfo.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Call Us</p>
                  <a 
                    href={`tel:${footerSettings.contactInfo.phone}`} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {footerSettings.contactInfo.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Visit Us</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {footerSettings.contactInfo.address}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Business Hours</p>
                  <p className="text-muted-foreground text-sm">Mon - Sun: 9:00 AM - 9:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-y">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-sm">Free Delivery</p>
              <p className="text-xs text-muted-foreground">On orders above ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-sm">Secure Payment</p>
              <p className="text-xs text-muted-foreground">100% secure checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-sm">Special Offers</p>
              <p className="text-xs text-muted-foreground">Save up to 25% off</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-sm">Made with Love</p>
              <p className="text-xs text-muted-foreground">Handcrafted flowers</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            {footerSettings.copyright}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors duration-200">
              Shipping Policy
            </Link>
            <Link to="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
              Refund Policy
            </Link>
            <Link to="/cancellation-policy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {footerSettings.showMap && (
        <div className="mt-12">
          <iframe 
            src={footerSettings.mapEmbedUrl} 
            className="w-full h-[300px] border-0" 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}
    </footer>
  );
};

export default Footer;
