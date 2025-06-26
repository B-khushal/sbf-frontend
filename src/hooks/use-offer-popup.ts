import { useState, useEffect, useCallback } from 'react';
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
  const [hasCheckedOffers, setHasCheckedOffers] = useState(false);

  const closeOffer = useCallback(() => {
    console.log('🔒 Closing offer popup');
    setIsOpen(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveOffers = async () => {
      // Don't fetch if we've already checked offers
      if (hasCheckedOffers) return;

      try {
        console.log('🎯 Fetching active offers...');
        const { data: offers } = await api.get('/offers/active');
        
        // Check if component is still mounted
        if (!isMounted) return;

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

          if (offerToShow && isMounted) {
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
      } finally {
        if (isMounted) {
          setHasCheckedOffers(true);
        }
      }
    };

    fetchActiveOffers();

    return () => {
      isMounted = false;
    };
  }, [hasCheckedOffers]); // Only depend on hasCheckedOffers

  return {
    currentOffer,
    isOpen,
    closeOffer
  };
}; 