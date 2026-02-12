import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Gift, Tag, Calendar, Sparkles } from 'lucide-react';
import Modal from './Modal';
import { Button } from './button';

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
    expiryDate?: string;
    code?: string;
  } | null;
}

const themeConfig = {
  festive: {
    icon: Sparkles,
    gradient: 'from-yellow-400 via-red-500 to-pink-500',
    pattern: 'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    animation: 'animate-sparkle'
  },
  sale: {
    icon: Tag,
    gradient: 'from-blue-400 via-indigo-500 to-purple-500',
    pattern: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
    animation: 'animate-pulse'
  },
  holiday: {
    icon: Calendar,
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
    pattern: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 5px, transparent 5px, transparent 25px)',
    animation: 'animate-bounce'
  },
  general: {
    icon: Gift,
    gradient: 'from-gray-100 to-gray-200',
    pattern: 'linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
    animation: 'animate-fade'
  }
};

const OfferPopup: React.FC<OfferPopupProps> = ({
  isOpen,
  onClose,
  offer
}) => {
  console.log('🎭 OfferPopup render:', { isOpen, offer });
  const navigate = useNavigate();
  const ThemeIcon = offer && themeConfig[offer.theme] ? themeConfig[offer.theme].icon : Gift;
  console.log('🎨 Theme config:', { theme: offer?.theme, hasConfig: !!themeConfig[offer?.theme] });

  const handleButtonClick = () => {
    onClose();
    if (offer?.buttonLink) {
    navigate(offer.buttonLink);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  console.log('🎭 OfferPopup render check:', { isOpen, offer });
  if (!offer) {
    console.log('❌ No offer provided to OfferPopup');
    return null;
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="p-0 w-full max-w-lg"
      showCloseButton={false}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-gradient-to-br ${themeConfig[offer.theme].gradient} rounded-xl overflow-hidden shadow-2xl`}
                style={{
                  backgroundColor: offer.backgroundColor,
                  color: offer.textColor
                }}
              >
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: themeConfig[offer.theme].pattern }}
            />

                {/* Close Button */}
                <button
                  onClick={onClose}
              className="absolute right-4 top-4 text-current opacity-70 hover:opacity-100 transition-all z-50 pointer-events-auto 
                       bg-black/10 hover:bg-black/20 rounded-full p-2 hover:rotate-90 duration-300"
              aria-label="Close offer"
                >
              <X className="h-5 w-5" />
                </button>

            {/* Content Container */}
            <div className="relative z-10 p-6 sm:p-8">
              {/* Icon and Title Section */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full bg-white/20 ${themeConfig[offer.theme].animation}`}>
                  <ThemeIcon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {offer.title}
                </h2>
              </div>

              {/* Image Section */}
              {offer.imageUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                      <img
                        src={offer.imageUrl}
                        alt="Offer"
                    className="w-full h-48 sm:h-56 object-cover rounded-lg shadow-lg"
                    loading="eager"
                  />
                </motion.div>
              )}

              {/* Description */}
              <p className="text-base sm:text-lg opacity-90 mb-6 leading-relaxed">
                {offer.description}
              </p>

              {/* Offer Code Section */}
              {offer.code && (
                <div className="bg-white/20 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div className="font-mono text-lg font-bold tracking-wider">
                    {offer.code}
                  </div>
                  <Button
                    onClick={() => handleCopyCode(offer.code!)}
                    variant="secondary"
                    size="sm"
                    className="hover:scale-105 transition-transform"
                  >
                    Copy Code
                  </Button>
                    </div>
                  )}

              {/* Expiry Date */}
              {offer.expiryDate && (
                <p className="text-sm opacity-75 mb-4">
                  Offer valid until {new Date(offer.expiryDate).toLocaleDateString()}
                    </p>
              )}

              {/* Action Button */}
                    <Button
                      onClick={handleButtonClick}
                className="w-full py-4 text-base font-semibold rounded-xl hover:scale-105 
                         transition-all duration-300 shadow-lg hover:shadow-xl"
                      style={{
                        backgroundColor: offer.textColor,
                        color: offer.backgroundColor
                      }}
                    >
                      {offer.buttonText}
                    </Button>
                  </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-current opacity-20 rounded-tl-xl transform -translate-x-12 -translate-y-12 rotate-45" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-current opacity-20 rounded-br-xl transform translate-x-12 translate-y-12 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default OfferPopup; 