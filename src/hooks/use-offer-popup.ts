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
      // Rule 1: Only show popups on the homepage ('/')
      if (location.pathname !== '/') {
        if (isOpen) setIsOpen(false); // Close popup if navigating away
        return;
      }

      // Rule 2: Don't show if it has already been shown in this session.
      const shownThisSession = sessionStorage.getItem('offerShownThisSession');
      if (shownThisSession) {
        return;
      }
      
      try {
        const { data: offers } = await api.get('/offers/active');

        if (offers && offers.length > 0) {
          // Rule 3: Check localStorage for offers that should only be shown once ever.
          const seenOffers = JSON.parse(localStorage.getItem('seenOffers') || '{}');
          
          const offerToShow = offers.find(offer => 
            !offer.showOnlyOnce || !seenOffers[offer._id]
          );

          if (offerToShow) {
            setCurrentOffer(offerToShow);
            setIsOpen(true);
            
            // Mark as shown for this session
            sessionStorage.setItem('offerShownThisSession', 'true');

            // If it's a "show only once" offer, add it to localStorage.
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

    // Use a small delay to prevent race conditions on initial load
    const timer = setTimeout(() => {
        fetchActiveOffers();
    }, 100);

    return () => clearTimeout(timer);

  }, [location.pathname]);

  const closeOffer = () => {
    setIsOpen(false);
  };

  return {
    currentOffer,
    isOpen,
    closeOffer
  };
}; 