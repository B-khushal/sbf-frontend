import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchActiveOffers = async () => {
      try {
        const { data: offers } = await api.get('/offers/active');

        if (offers && offers.length > 0) {
          // Check if we should show this offer
          const seenOffers = JSON.parse(localStorage.getItem('seenOffers') || '{}');
          
          // Find the first offer that hasn't been seen (if showOnlyOnce is true)
          const offerToShow = offers.find(offer => 
            !offer.showOnlyOnce || !seenOffers[offer._id]
          );

          if (offerToShow) {
            setCurrentOffer(offerToShow);
            setIsOpen(true);

            // Mark offer as seen if showOnlyOnce is true
            if (offerToShow.showOnlyOnce) {
              seenOffers[offerToShow._id] = true;
              localStorage.setItem('seenOffers', JSON.stringify(seenOffers));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchActiveOffers();
  }, []);

  const closeOffer = () => {
    setIsOpen(false);
  };

  return {
    currentOffer,
    isOpen,
    closeOffer
  };
}; 