import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const Footer = () => {
  const { footerSettings, loading } = useSettings();

  // WhatsApp contact number - using just the number without +91
  const whatsappNumber = "9949683222";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I'm interested in your flower arrangements.`;

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
    <footer className="bg-secondary/40 pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pb-8 sm:pb-12 mb-8 sm:mb-12 border-b">
          {/* Brand & Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block text-lg sm:text-xl font-medium mb-3 sm:mb-4">
              {footerSettings.companyName}
            </Link>
            <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6 max-w-xs leading-relaxed">
              {footerSettings.description}
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {/* WhatsApp Link */}
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-muted-foreground hover:text-green-500 transition-colors duration-300 bg-green-50 hover:bg-green-100 rounded-full"
                aria-label="WhatsApp"
                title="Chat with us on WhatsApp"
              >
                <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
              
              {/* Existing Social Links */}
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
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-300"
                      aria-label={link.platform}
                    >
                      <IconComponent size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </a>
                  );
                })
              }
            </div>
          </div>

          {/* Google Maps Iframe */}
          {footerSettings.showMap && (
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-sm font-medium uppercase tracking-wide mb-3 sm:mb-4">
                Location
              </h3>
              <div className="aspect-w-16 aspect-h-9 w-full">
                <iframe 
                  src={footerSettings.mapEmbedUrl} 
                  className="w-full h-40 sm:h-48 rounded-lg" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Dynamic Footer Links */}
          {footerSettings.links.map((section) => (
            <div key={section.section} className="min-w-0">
              <h3 className="text-sm font-medium uppercase tracking-wide mb-3 sm:mb-4">
                {section.section}
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-sm">
                {section.items
                  .filter(item => item.enabled)
                  .map((item) => (
                  <li key={item.href}>
                    <Link 
                      to={item.href} 
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Contact Info */}
          <div className="min-w-0">
            <h3 className="text-sm font-medium uppercase tracking-wide mb-3 sm:mb-4">
              Contact
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li className="flex items-start">
                <Mail size={14} className="mr-2 mt-0.5 text-muted-foreground flex-shrink-0 sm:w-4 sm:h-4" />
                <a 
                  href={`mailto:${footerSettings.contactInfo.email}`} 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 break-all"
                >
                  {footerSettings.contactInfo.email}
                </a>
              </li>
              <li className="flex items-start">
                <Phone size={14} className="mr-2 mt-0.5 text-muted-foreground flex-shrink-0 sm:w-4 sm:h-4" />
                <a 
                  href={`tel:${footerSettings.contactInfo.phone}`} 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {footerSettings.contactInfo.phone}
                </a>
              </li>
              {/* Additional WhatsApp Contact */}
              <li className="flex items-start">
                <MessageCircle size={14} className="mr-2 mt-0.5 text-green-600 flex-shrink-0 sm:w-4 sm:h-4" />
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-green-600 transition-colors duration-200"
                >
                   {whatsappNumber} WhatsApp
                </a>
              </li>
              <li className="pt-1 sm:pt-2">
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {footerSettings.contactInfo.address}
                </p>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-muted-foreground space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            {footerSettings.copyright}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4">
            <Link to="/terms" className="hover:text-primary transition-colors duration-200">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/shipping" className="hover:text-primary transition-colors duration-200">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
