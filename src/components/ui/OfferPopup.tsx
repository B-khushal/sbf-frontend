import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface OfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    title: string;
    description: string;
    imageUrl?: string;
    backgroundColor: string;
    textColor: string;
    buttonText: string;
    buttonLink: string;
    theme: 'festive' | 'sale' | 'holiday' | 'general';
  };
}

const OfferPopup: React.FC<OfferPopupProps> = ({
  isOpen,
  onClose,
  offer
}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    onClose();
    navigate(offer.buttonLink);
  };

  const getThemeStyles = () => {
    switch (offer.theme) {
      case 'festive':
        return 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500';
      case 'sale':
        return 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500';
      case 'holiday':
        return 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500';
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
  };

  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>{offer.title}</DialogTitle>
            <DialogDescription>{offer.description}</DialogDescription>
          </VisuallyHidden>
          
          <div 
            className={`relative ${getThemeStyles()} text-white`}
            style={{
              backgroundColor: offer.backgroundColor,
              color: offer.textColor
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-current opacity-70 hover:opacity-100 transition-opacity z-10 bg-black/10 rounded-full p-1"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Content */}
            <div className="p-8">
              {offer.imageUrl && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={offer.imageUrl}
                    alt="Offer"
                    className="max-h-[200px] w-auto rounded-lg object-contain"
                  />
                </div>
              )}

              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold leading-tight">
                  {offer.title}
                </h2>
                
                <p className="text-lg opacity-90">
                  {offer.description}
                </p>

                <Button
                  onClick={handleButtonClick}
                  className="mt-6 w-full py-6 text-lg font-semibold rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg"
                  style={{
                    backgroundColor: offer.textColor,
                    color: offer.backgroundColor
                  }}
                >
                  {offer.buttonText}
                </Button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-current opacity-20 rounded-tl-xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-current opacity-20 rounded-br-xl" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferPopup; 