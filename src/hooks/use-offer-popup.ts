import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';

interface Offer {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  background?: string; // Backend field name
  backgroundColor?: string; // Frontend field name
  textColor: string;
  buttonText: string;
  buttonLink: string;
  theme: 'festive' | 'sale' | 'holiday' | 'general';
  showOnlyOnce: boolean;
  endDate?: string; // Backend field name
  expiryDate?: string; // Frontend field name
  code?: string;
  startDate?: string;
  priority?: number;
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
      console.log('🔍 Session storage check:', { shownThisSession });
      if (shownThisSession) {
        console.log('❌ Offer already shown this session');
        return;
      }
      
      try {
        console.log('🔍 Fetching active offers...');
        const { data: offers } = await api.get('/offers/active');
        console.log('📦 Received offers:', offers);

        if (offers && offers.length > 0) {
          // Rule 3: Check localStorage for offers that should only be shown once ever
          const seenOffers = JSON.parse(localStorage.getItem('seenOffers') || '{}');
          
          // Filter valid offers
          const validOffers = offers.filter(offer => {
            // Check if offer should be shown only once
            if (offer.showOnlyOnce && seenOffers[offer._id]) {
              return false;
            }

            // Check expiry date (use endDate from backend or expiryDate from frontend)
            const expiryDate = offer.endDate || offer.expiryDate;
            if (expiryDate && new Date(expiryDate) < new Date()) {
              return false;
            }

            // Check start date
            if (offer.startDate && new Date(offer.startDate) > new Date()) {
              return false;
            }

            return true;
          });

          // Sort by priority if available
          const sortedOffers = validOffers.sort((a, b) => {
            const priorityA = a.priority ?? 0;
            const priorityB = b.priority ?? 0;
            return priorityB - priorityA;
          });

          const offerToShow = sortedOffers[0];
          console.log('🎯 Selected offer to show:', offerToShow);

          if (offerToShow) {
            console.log('✅ Setting offer and opening popup...');
            
            // Transform backend data to frontend format
            const transformedOffer = {
              ...offerToShow,
              backgroundColor: offerToShow.background || offerToShow.backgroundColor,
              expiryDate: offerToShow.endDate || offerToShow.expiryDate
            };
            
            // Set the offer first
            setCurrentOffer(transformedOffer);
            
            // Then set isOpen after a short delay to ensure proper animation
            setTimeout(() => {
              console.log('🚀 Opening popup...');
              setIsOpen(true);
            }, 1000); // Increased delay for better UX
            
            // Mark as shown for this session
            sessionStorage.setItem('offerShownThisSession', 'true');

            // If it's a "show only once" offer, add it to localStorage
            if (offerToShow.showOnlyOnce) {
              seenOffers[offerToShow._id] = true;
              localStorage.setItem('seenOffers', JSON.stringify(seenOffers));
            }

            // Track offer impression
            try {
              await api.post(`/offers/${offerToShow._id}/impression`);
            } catch (error) {
              console.error('Failed to track offer impression:', error);
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

  const closeOffer = async () => {
    setIsOpen(false);

    // Track offer close if there's a current offer
    if (currentOffer) {
      try {
        await api.post(`/offers/${currentOffer._id}/close`);
      } catch (error) {
        console.error('Failed to track offer close:', error);
      }
    }

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