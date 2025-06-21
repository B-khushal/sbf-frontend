import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const Footer = () => {
  const { footerSettings, loading } = useSettings();

  // WhatsApp contact number
  const whatsappNumber = "994968322";
  const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=Hello! I'm interested in your flower arrangements.`;

  if (loading) {
    return (
      <footer className="bg-secondary/40 pt-16 pb-8 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading footer...</p>
          </div>
        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-secondary/40 pt-16 pb-8 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 mb-12 border-b">
          {/* Brand & Info */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block text-xl font-medium mb-4">
              {footerSettings.companyName}
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              {footerSettings.description}
            </p>
            <div className="flex space-x-4">
              {/* WhatsApp Link */}
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-green-500 transition-colors duration-300 bg-green-50 hover:bg-green-100 rounded-full"
                aria-label="WhatsApp"
                title="Chat with us on WhatsApp"
              >
                <MessageCircle size={18} />
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
                      className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-300"
                      aria-label={link.platform}
                    >
                      <IconComponent size={18} />
                    </a>
                  );
                })
              }
            </div>
          </div>

          {/* Google Maps Iframe */}
          {footerSettings.showMap && (
            <div className="md:col-span-1">
              <h3 className="text-sm font-medium uppercase tracking-wide mb-4">
                Location
              </h3>
              <div className="aspect-w-16 aspect-h-9 w-full">
                <iframe 
                  src={footerSettings.mapEmbedUrl} 
                  className="w-full h-48" 
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
            <div key={section.section}>
              <h3 className="text-sm font-medium uppercase tracking-wide mb-4">
                {section.section}
              </h3>
              <ul className="space-y-3 text-sm">
                {section.items
                  .filter(item => item.enabled)
                  .map((item) => (
                  <li key={item.href}>
                    <Link 
                      to={item.href} 
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <Mail size={16} className="mr-2 mt-0.5 text-muted-foreground" />
                <a 
                  href={`mailto:${footerSettings.contactInfo.email}`} 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {footerSettings.contactInfo.email}
                </a>
              </li>
              <li className="flex items-start">
                <Phone size={16} className="mr-2 mt-0.5 text-muted-foreground" />
                <a 
                  href={`tel:${footerSettings.contactInfo.phone}`} 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {footerSettings.contactInfo.phone}
                </a>
              </li>
              {/* Additional WhatsApp Contact */}
              <li className="flex items-start">
                <MessageCircle size={16} className="mr-2 mt-0.5 text-green-600" />
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-green-600 transition-colors duration-200"
                >
                  +91 {whatsappNumber} (WhatsApp)
                </a>
              </li>
              <li className="pt-2">
                <p className="text-muted-foreground">
                  {footerSettings.contactInfo.address}
                </p>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">
            {footerSettings.copyright}
          </div>
          <div className="flex flex-wrap gap-4">
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
