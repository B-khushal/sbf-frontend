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
      // Don't show popups on vendor registration or admin pages
      if (location.pathname.startsWith('/vendor') || location.pathname.startsWith('/admin')) {
        console.log('🚫 Offer popup disabled on this page.');
        return;
      }

      try {
        console.log('🎯 Fetching active offers...');
        const { data: offers } = await api.get('/offers/active');
        console.log('📦 Received offers:', offers);

        if (offers && offers.length > 0) {
          // Check if we should show this offer
          const seenOffers = JSON.parse(sessionStorage.getItem('seenOffers') || '{}');
          console.log('👀 Previously seen offers:', seenOffers);
          
          // Find the first offer that hasn't been seen (if showOnlyOnce is true)
          const offerToShow = offers.find(offer => 
            !offer.showOnlyOnce || !seenOffers[offer._id]
          );
          console.log('🎁 Offer selected to show:', offerToShow);

          if (offerToShow) {
            setCurrentOffer(offerToShow);
            setIsOpen(true);
            console.log('🔓 Opening offer popup');

            // Mark offer as seen if showOnlyOnce is true
            if (offerToShow.showOnlyOnce) {
              seenOffers[offerToShow._id] = true;
              sessionStorage.setItem('seenOffers', JSON.stringify(seenOffers));
              console.log('✍️ Marked offer as seen in session storage');
            }
          } else {
            console.log('❌ No eligible offers to show');
          }
        } else {
          console.log('📭 No active offers found');
        }
      } catch (error) {
        console.error('❌ Error fetching offers:', error);
      }
    };

    fetchActiveOffers();
  }, [location.pathname]);

  const closeOffer = () => {
    console.log('🔒 Closing offer popup');
    setIsOpen(false);
  };

  return {
    currentOffer,
    isOpen,
    closeOffer
  };
}; 