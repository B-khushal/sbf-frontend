import React, { useEffect } from 'react';
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
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden">
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
            className="absolute right-4 top-4 text-current opacity-70 hover:opacity-100 transition-opacity z-10 bg-black/10 hover:bg-black/20 rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Content */}
          <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-4">
            {offer.imageUrl && (
              <div className="mb-2">
                <img
                  src={offer.imageUrl}
                  alt="Offer"
                  className="max-h-32 sm:max-h-40 w-auto rounded-lg object-contain"
                />
              </div>
            )}
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              {offer.title}
            </h2>
            
            <p className="text-sm sm:text-base opacity-90 max-w-sm">
              {offer.description}
            </p>
            
            <Button
              onClick={handleButtonClick}
              className="mt-4 w-full sm:w-auto px-8 py-3 text-base font-semibold rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg"
              style={{
                backgroundColor: offer.textColor,
                color: offer.backgroundColor
              }}
            >
              {offer.buttonText}
            </Button>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-current opacity-20 rounded-tl-xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-current opacity-20 rounded-br-xl" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferPopup; 