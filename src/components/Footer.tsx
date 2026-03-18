import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Heart,
  Flower2,
  Gift,
  CreditCard,
  Truck,
  ShieldCheck,
  Store
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import api from '@/services/api';

const Footer = () => {
  const { footerSettings, loading } = useSettings();
  const [email, setEmail] = useState('');

  // WhatsApp contact number - using just the number without +91
  const whatsappNumber = "9949683222";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I'm interested in your flower arrangements.`;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/newsletter/subscribe', { email });

      if (response.data.success) {
        toast.success("Thanks for subscribing!", {
          description: "We'll keep you updated with our latest offers.",
        });
        setEmail('');
      } else {
        toast.error("Subscription failed", {
          description: response.data.message || "Please try again later.",
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error("Subscription failed", {
        description: errorMessage,
      });
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/90 to-secondary/90 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
              <div className="text-center lg:text-left w-full lg:w-auto">
                <h3 className="text-xl sm:text-xl lg:text-2xl font-bold mb-3 text-white leading-tight">Subscribe to Our Newsletter</h3>
                <p className="text-white/90 text-sm lg:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">Get updates on new arrivals and special offers!</p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 min-w-0">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 w-full sm:w-[280px] lg:w-[300px] min-w-0 h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="secondary" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto whitespace-nowrap px-6 py-3 h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <Send className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8 xl:gap-12 mb-10 sm:mb-12">
          {/* Brand & Info */}
          <div className="text-center sm:text-left space-y-5 sm:space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 text-2xl font-bold text-gray-900 hover:text-primary transition-colors duration-300">
              <Flower2 className="w-7 h-7 text-primary" />
              {footerSettings.companyName}
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
              Best florist in Hyderabad offering flower delivery in Hyderabad, online bouquet shop India, midnight flower delivery,
              roses for anniversary, and birthday flowers online. Send flowers online with confidence.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap">
              {/* WhatsApp Link */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md"
                aria-label="WhatsApp"
                title="Chat with us on WhatsApp"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
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
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md"
                      aria-label={link.platform}
                    >
                      <IconComponent className="w-6 h-6" />
                    </a>
                  );
                })
              }
            </div>
          </div>

          {/* Quick Links */}
          {footerSettings.links.map((section) => (
            <div key={section.section} className="text-center sm:text-left">
              <h3 className="text-lg font-bold mb-6 text-gray-900">{section.section}</h3>
              <ul className="space-y-4">
                {section.items
                  .filter(item => item.enabled)
                  .map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className="text-gray-600 hover:text-primary transition-all duration-300 inline-flex items-center gap-3 group text-sm font-medium"
                      >
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold mb-6 text-gray-900">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold mb-1 text-gray-900">Email Us</p>
                  <a
                    href={`mailto:${footerSettings.contactInfo.email}`}
                    className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm break-all"
                  >
                    {footerSettings.contactInfo.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold mb-1 text-gray-900">Call Us</p>
                  <a
                    href={`tel:${footerSettings.contactInfo.phone}`}
                    className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {footerSettings.contactInfo.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold mb-1 text-gray-900">Visit Us</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {footerSettings.contactInfo.address}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold mb-1 text-gray-900">Business Hours</p>
                  <p className="text-gray-600 text-sm">Mon - Sun: 9:00 AM - 9:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 py-8 sm:py-10 border-t border-gray-200">
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900">Free Delivery</p>
              <p className="text-xs text-gray-600">On orders above ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900">Secure Payment</p>
              <p className="text-xs text-gray-600">100% secure checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900">Special Offers</p>
              <p className="text-xs text-gray-600">Save up to 25% off</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900">Made with Love</p>
              <p className="text-xs text-gray-600">Handcrafted flowers</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-10 space-y-6 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 font-medium">
            <p className="text-center sm:text-left">
              {footerSettings.copyright}
            </p>
            <Link to="/vendors-consent" className="inline-flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold uppercase tracking-wider">
                <Store className="w-3.5 h-3.5" /> Become a Vendor
              </span>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 sm:gap-x-8 gap-y-3 text-sm">
            <Link
              to="/terms"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              to="/shipping"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Shipping Policy
            </Link>
            <Link
              to="/refund-policy"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Refund Policy
            </Link>
            <Link
              to="/cancellation-policy"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {footerSettings.showMap && (
        <div className="mt-10 sm:mt-12">
          <iframe
            src={footerSettings.mapEmbedUrl}
            className="w-full h-[250px] sm:h-[300px] border-0 rounded-lg shadow-lg"
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
