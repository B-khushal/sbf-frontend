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
  const [hasFetched, setHasFetched] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchActiveOffers = async () => {
      // Only show popups on the homepage ('/')
      if (location.pathname !== '/') {
        if (isOpen) setIsOpen(false); // Close popup if navigating away
        setHasFetched(false); // Reset fetch status when leaving homepage
        return;
      }

      // Prevent re-fetching if we already have an open offer or have fetched
      if (isOpen || hasFetched) return;
      
      try {
        setHasFetched(true); // Mark as fetched to prevent re-runs
        const { data: offers } = await api.get('/offers/active');

        if (offers && offers.length > 0) {
          const seenOffers = JSON.parse(localStorage.getItem('seenOffers') || '{}');
          
          const offerToShow = offers.find(offer => 
            !offer.showOnlyOnce || !seenOffers[offer._id]
          );

          if (offerToShow) {
            setCurrentOffer(offerToShow);
            setIsOpen(true);

            if (offerToShow.showOnlyOnce) {
              seenOffers[offerToShow._id] = true;
              localStorage.setItem('seenOffers', JSON.stringify(seenOffers));
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching offers:', error);
        setHasFetched(false); // Allow refetch on error
      }
    };

    fetchActiveOffers();
  }, [location.pathname, isOpen, hasFetched]);

  const closeOffer = () => {
    setIsOpen(false);
  };

  return {
    currentOffer,
    isOpen,
    closeOffer
  };
}; 