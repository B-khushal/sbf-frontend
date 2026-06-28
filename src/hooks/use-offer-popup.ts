import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';

export interface Offer {
  _id: string;
  title: string;
  description: string;
  subtitle?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  background?: string;
  backgroundColor?: string; // fallback
  textColor?: string;
  buttonText: string;
  buttonLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  theme: 'festive' | 'sale' | 'holiday' | 'general' | 'rakhi' | 'valentines' | 'mothersday' | 'fathersday' | 'diwali' | 'christmas' | 'newyear';
  showOnlyOnce?: boolean;
  showCountdown?: boolean;
  discountPercent?: number;
  code?: string;
  badgeText?: string;
  
  // Smart triggers & targeting
  triggerType?: 'timeDelay' | 'scroll' | 'exitIntent' | 'immediately' | 'combined';
  triggerDelay?: number;
  triggerScrollPercent?: number;
  frequencyCap?: 'always' | 'oncePerSession' | 'oncePerDay' | 'oncePerWeek' | 'oncePerMonth' | 'onceEver';
  deviceTargeting?: 'desktop' | 'mobile' | 'both';

  // A/B Testing
  isABTesting?: boolean;
  assignedVariantId?: string;
  variants?: Array<{
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    mobileImageUrl?: string;
    discountPercent?: number;
    code?: string;
    buttonText: string;
    buttonLink: string;
    background?: string;
    textColor?: string;
    badgeText?: string;
    theme?: any;
  }>;

  endDate?: string;
  expiryDate?: string;
  startDate?: string;
  priority?: number;
}

export const useOfferPopup = () => {
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const triggerFiredRef = useRef(false);

  // Expose track functions
  const trackCtaClick = async () => {
    if (!currentOffer) return;
    try {
      await api.post(`/offers/${currentOffer._id}/cta-click`, {
        variantId: currentOffer.assignedVariantId
      });
      console.log('📈 Tracked CTA Click for offer', currentOffer._id, 'variant', currentOffer.assignedVariantId);
      
      // Store in session to track checkout conversions later
      if (currentOffer.code) {
        sessionStorage.setItem('activeOfferCoupon', JSON.stringify({
          offerId: currentOffer._id,
          code: currentOffer.code,
          variantId: currentOffer.assignedVariantId
        }));
      }
    } catch (error) {
      console.error('Failed to track CTA click:', error);
    }
  };

  const trackCouponCopy = async () => {
    if (!currentOffer) return;
    try {
      await api.post(`/offers/${currentOffer._id}/coupon-copy`, {
        variantId: currentOffer.assignedVariantId
      });
      console.log('📈 Tracked Coupon Copy for offer', currentOffer._id, 'variant', currentOffer.assignedVariantId);
      
      // Store in session to track checkout conversions later
      if (currentOffer.code) {
        sessionStorage.setItem('activeOfferCoupon', JSON.stringify({
          offerId: currentOffer._id,
          code: currentOffer.code,
          variantId: currentOffer.assignedVariantId
        }));
      }
    } catch (error) {
      console.error('Failed to track coupon copy:', error);
    }
  };

  const trackConversion = async () => {
    if (!currentOffer) return;
    try {
      await api.post(`/offers/${currentOffer._id}/conversion`, {
        variantId: currentOffer.assignedVariantId
      });
      console.log('📈 Tracked Conversion for offer', currentOffer._id, 'variant', currentOffer.assignedVariantId);
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  };

  useEffect(() => {
    let delayTimer: NodeJS.Timeout | null = null;
    let triggerTimer: NodeJS.Timeout | null = null;
    
    // Check if the current environment is mobile
    const isMobileDevice = () => window.innerWidth < 768;

    const checkFrequencyCap = (offer: Offer): boolean => {
      const cap = offer.frequencyCap || 'oncePerSession';
      const offerId = offer._id;
      
      if (cap === 'always') return true;
      
      if (cap === 'oncePerSession') {
        return !sessionStorage.getItem(`offer_shown_session_${offerId}`);
      }

      const lastShownTime = localStorage.getItem(`offer_shown_time_${offerId}`);
      if (!lastShownTime) return true;

      const diffMs = Date.now() - parseInt(lastShownTime, 10);
      const diffHours = diffMs / (1000 * 60 * 60);

      switch (cap) {
        case 'oncePerDay':
          return diffHours >= 24;
        case 'oncePerWeek':
          return diffHours >= 24 * 7;
        case 'oncePerMonth':
          return diffHours >= 24 * 30;
        case 'onceEver':
          return !localStorage.getItem(`offer_shown_ever_${offerId}`);
        default:
          return true;
      }
    };

    const recordOfferShown = (offer: Offer) => {
      const offerId = offer._id;
      const cap = offer.frequencyCap || 'oncePerSession';

      sessionStorage.setItem(`offer_shown_session_${offerId}`, 'true');
      localStorage.setItem(`offer_shown_time_${offerId}`, Date.now().toString());
      if (cap === 'onceEver') {
        localStorage.setItem(`offer_shown_ever_${offerId}`, 'true');
      }
    };

    const fetchActiveOffers = async () => {
      // Reset trigger states when location changes
      setIsOpen(false);
      setCurrentOffer(null);
      triggerFiredRef.current = false;

      // Rule 1: Only show popups on the homepage ('/')
      if (location.pathname !== '/') {
        return;
      }

      try {
        console.log('🔍 Fetching active offers...');
        const { data: offers } = await api.get('/offers/active');
        console.log('📦 Received offers:', offers);

        if (offers && offers.length > 0) {
          // Filter valid offers by device and start/end dates
          const currentDate = new Date();
          const validOffers = offers.filter((offer: Offer) => {
            // Check expiry date
            const expiryDate = offer.endDate || offer.expiryDate;
            if (expiryDate && new Date(expiryDate) < currentDate) {
              return false;
            }

            // Check start date
            if (offer.startDate && new Date(offer.startDate) > currentDate) {
              return false;
            }

            // Device targeting check
            const targeting = offer.deviceTargeting || 'both';
            const isMobile = isMobileDevice();
            if (targeting === 'mobile' && !isMobile) return false;
            if (targeting === 'desktop' && isMobile) return false;

            // Frequency cap check
            if (!checkFrequencyCap(offer)) {
              console.log(`❌ Offer ${offer._id} capped by frequency rules.`);
              return false;
            }

            return true;
          });

          // Sort by priority if available
          const sortedOffers = validOffers.sort((a: Offer, b: Offer) => {
            const priorityA = a.priority ?? 0;
            const priorityB = b.priority ?? 0;
            return priorityB - priorityA;
          });

          const selectedOffer = sortedOffers[0];
          if (!selectedOffer) {
            console.log('❌ No eligible offers matching device/frequency/date criteria.');
            return;
          }

          console.log('🎯 Selected eligible offer:', selectedOffer);

          // Handle A/B Testing Variant Selection
          let transformedOffer = {
            ...selectedOffer,
            backgroundColor: selectedOffer.background || selectedOffer.backgroundColor,
            expiryDate: selectedOffer.endDate || selectedOffer.expiryDate
          };

          if (selectedOffer.isABTesting && selectedOffer.variants && selectedOffer.variants.length > 0) {
            const abStorageKey = `offer_variant_assigned_${selectedOffer._id}`;
            let assignedVariantId = localStorage.getItem(abStorageKey);
            let variantToServe = null;

            if (assignedVariantId) {
              variantToServe = selectedOffer.variants.find(v => v._id === assignedVariantId);
            }

            if (!variantToServe) {
              // Pick random variant
              const randomIndex = Math.floor(Math.random() * selectedOffer.variants.length);
              variantToServe = selectedOffer.variants[randomIndex];
              localStorage.setItem(abStorageKey, variantToServe._id);
            }

            console.log('🧬 A/B Test Active: Serving variant:', variantToServe.title);

            // Override main fields with variant fields
            transformedOffer = {
              ...transformedOffer,
              assignedVariantId: variantToServe._id,
              title: variantToServe.title || transformedOffer.title,
              description: variantToServe.description || transformedOffer.description,
              imageUrl: variantToServe.imageUrl || transformedOffer.imageUrl,
              mobileImageUrl: variantToServe.mobileImageUrl || transformedOffer.mobileImageUrl,
              discountPercent: variantToServe.discountPercent ?? transformedOffer.discountPercent,
              code: variantToServe.code || transformedOffer.code,
              buttonText: variantToServe.buttonText || transformedOffer.buttonText,
              buttonLink: variantToServe.buttonLink || transformedOffer.buttonLink,
              background: variantToServe.background || transformedOffer.background,
              backgroundColor: variantToServe.background || transformedOffer.background,
              textColor: variantToServe.textColor || transformedOffer.textColor,
              badgeText: variantToServe.badgeText || transformedOffer.badgeText,
              theme: variantToServe.theme || transformedOffer.theme
            };
          }

          setCurrentOffer(transformedOffer);

          // Initialize Smart Trigger Mechanisms
          const triggerType = transformedOffer.triggerType || 'combined';
          const triggerDelaySec = transformedOffer.triggerDelay ?? 8;
          const scrollPercent = transformedOffer.triggerScrollPercent ?? 30;

          const fireTrigger = () => {
            if (triggerFiredRef.current) return;
            triggerFiredRef.current = true;
            
            console.log('🚀 Trigger fired! Showing popup.');
            setIsOpen(true);
            recordOfferShown(transformedOffer);

            // Track impression
            api.post(`/offers/${transformedOffer._id}/impression`, {
              variantId: transformedOffer.assignedVariantId
            }).catch(err => console.error('Failed to track impression:', err));
          };

          // 1. Immediate trigger
          if (triggerType === 'immediately') {
            fireTrigger();
            return;
          }

          // 2. Delay trigger (runs in both delay and combined mode)
          if (triggerType === 'timeDelay' || triggerType === 'combined') {
            triggerTimer = setTimeout(() => {
              fireTrigger();
            }, triggerDelaySec * 1000);
          }

          // 3. Scroll depth trigger (runs in scroll and combined mode)
          const handleScroll = () => {
            if (triggerFiredRef.current) return;
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollTotal <= 0) return;
            const currentScrollPercent = (window.scrollY / scrollTotal) * 100;
            if (currentScrollPercent >= scrollPercent) {
              console.log('📜 Scroll trigger condition met:', currentScrollPercent.toFixed(1), '%');
              fireTrigger();
              cleanup();
            }
          };

          if (triggerType === 'scroll' || triggerType === 'combined') {
            window.addEventListener('scroll', handleScroll, { passive: true });
          }

          // 4. Exit Intent trigger (runs in exitIntent and combined mode) - Desktop only
          const handleMouseLeave = (e: MouseEvent) => {
            if (triggerFiredRef.current) return;
            if (e.clientY <= 20) { // Mouse moved near or above top edge
              console.log('🖱️ Exit intent detected');
              fireTrigger();
              cleanup();
            }
          };

          if ((triggerType === 'exitIntent' || triggerType === 'combined') && !isMobileDevice()) {
            document.addEventListener('mouseleave', handleMouseLeave);
          }

          const cleanup = () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mouseleave', handleMouseLeave);
            if (triggerTimer) clearTimeout(triggerTimer);
          };

          return cleanup;
        }
      } catch (error) {
        console.error('❌ Error fetching offers:', error);
      }
    };

    // Initial check after short delay
    delayTimer = setTimeout(() => {
      fetchActiveOffers();
    }, 1500);

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (triggerTimer) clearTimeout(triggerTimer);
      setIsOpen(false);
      setCurrentOffer(null);
    };
  }, [location.pathname]);

  const closeOffer = async () => {
    setIsOpen(false);

    if (currentOffer) {
      try {
        await api.post(`/offers/${currentOffer._id}/close`, {
          variantId: currentOffer.assignedVariantId
        });
      } catch (error) {
        console.error('Failed to track offer close:', error);
      }
    }

    setTimeout(() => {
      setCurrentOffer(null);
    }, 500); // match transition
  };

  return {
    currentOffer,
    isOpen,
    closeOffer,
    trackCtaClick,
    trackCouponCopy,
    trackConversion
  };
};