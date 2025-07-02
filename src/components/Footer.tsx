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
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import api from '@/services/api';

const Footer = () => {
  const { footerSettings, loading } = useSettings();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // WhatsApp contact number - using just the number without +91
  const whatsappNumber = "9949683222";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I'm interested in your flower arrangements.`;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await api.post('/newsletter/subscribe', { email });
      
      if (response.data.success) {
        toast.success("Thanks for subscribing!", {
          description: "We'll keep you updated with our latest offers.",
        });
        setEmail('');
        setSuccess("Subscription successful!");
      } else {
        toast.error("Subscription failed", {
          description: response.data.message || "Please try again later.",
        });
        setError(response.data.message || "Please try again later.");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error("Subscription failed", {
        description: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="block">
              <img
                src={footerSettings.logo || "/api/placeholder/160/50"}
                alt="Spring Blossoms Florist"
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              {footerSettings.description}
            </p>
            <div className="flex items-center gap-3">
              {footerSettings.socialLinks?.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {footerSettings.quickLinks?.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.url}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${footerSettings.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{footerSettings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${footerSettings.email}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>{footerSettings.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
                <span>{footerSettings.address}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to our newsletter for updates and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="absolute right-1 top-1 h-8"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              {success && (
                <p className="text-xs text-green-500">{success}</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Spring Blossoms Florist. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/privacy"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/shipping"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
