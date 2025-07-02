import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';

interface Offer {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  buttonText: string;
  buttonLink: string;
  theme: 'festive' | 'sale' | 'holiday' | 'general';
  showOnlyOnce: boolean;
}

export const useOfferPopup = () => {
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchActiveOffers = async () => {
      // Reset state when location changes
      setIsOpen(false);
      setCurrentOffer(null);

      // Rule 1: Only show popups on the homepage ('/')
      if (location.pathname !== '/') {
        return;
      }

      // Rule 2: Don't show if it has already been shown in this session
      const shownThisSession = sessionStorage.getItem('offerShownThisSession');
      if (shownThisSession) {
        return;
      }
      
      try {
        const { data: offers } = await api.get('/offers/active');

        if (offers && offers.length > 0) {
          // Rule 3: Check localStorage for offers that should only be shown once ever
          const seenOffers = JSON.parse(localStorage.getItem('seenOffers') || '{}');
          
          const offerToShow = offers.find(offer => 
            !offer.showOnlyOnce || !seenOffers[offer._id]
          );

          if (offerToShow) {
            // Set the offer first
            setCurrentOffer(offerToShow);
            
            // Then set isOpen after a short delay to ensure proper animation
            setTimeout(() => {
              setIsOpen(true);
            }, 500);
            
            // Mark as shown for this session
            sessionStorage.setItem('offerShownThisSession', 'true');

            // If it's a "show only once" offer, add it to localStorage
            if (offerToShow.showOnlyOnce) {
              seenOffers[offerToShow._id] = true;
              localStorage.setItem('seenOffers', JSON.stringify(seenOffers));
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching offers:', error);
      }
    };

    // Initial delay to ensure proper page load
    const timer = setTimeout(() => {
      fetchActiveOffers();
    }, 1500);

    return () => {
      clearTimeout(timer);
      setIsOpen(false);
      setCurrentOffer(null);
    };
  }, [location.pathname]);

  const closeOffer = () => {
    setIsOpen(false);
    // Remove offer after animation
    setTimeout(() => {
      setCurrentOffer(null);
    }, 300);
  };

  return {
    currentOffer,
    isOpen,
    closeOffer
  };
}; 