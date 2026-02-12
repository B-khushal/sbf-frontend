import React from 'react';
import { X, MessageCircle, Mail, Phone } from 'lucide-react';
import { Button } from './button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from './dialog';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, productTitle }) => {
  const handleWhatsAppClick = () => {
    const message = `Hi! I would like to order more than 5 units of "${productTitle}". Can you help me with bulk pricing and availability?`;
    const whatsappUrl = `https://wa.me/9949683222?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    const subject = `Bulk Order Inquiry - ${productTitle}`;
    const body = `Dear Spring Blossoms Florist,

I am interested in ordering more than 5 units of "${productTitle}".

Could you please provide:
- Bulk pricing information
- Availability details
- Delivery options for large orders

Thank you for your assistance.

Best regards`;
    
    const emailUrl = `mailto:2006sbf@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+919849589710';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white relative">
          <DialogTitle className="text-2xl font-bold mb-2 text-white">
            Need More Than 5 Items?
          </DialogTitle>
          <p className="text-white/90 text-sm">
            For bulk orders, please contact us directly for special pricing and availability.
          </p>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">
              We limit online orders to 5 items per product to ensure availability for all customers.
            </p>
            <p className="text-gray-800 font-medium mt-2">
              Contact us for bulk orders of "{productTitle}"
            </p>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            {/* WhatsApp */}
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <MessageCircle size={24} />
              <div className="text-left">
                <div>WhatsApp Us</div>
                <div className="text-sm opacity-90">9949683222</div>
              </div>
            </Button>

            {/* Email */}
            <Button
              onClick={handleEmailClick}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <Mail size={24} />
              <div className="text-left">
                <div>Email Us</div>
                <div className="text-sm opacity-90">2006sbf@gmail.com</div>
              </div>
            </Button>

            {/* Call */}
            <Button
              onClick={handleCallClick}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <Phone size={24} />
              <div className="text-left">
                <div>Call Us</div>
                <div className="text-sm opacity-90">+91 98495 89710</div>
              </div>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Bulk Order Benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Special bulk pricing discounts</li>
              <li>• Priority processing & delivery</li>
              <li>• Customization options available</li>
              <li>• Dedicated customer support</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal; 