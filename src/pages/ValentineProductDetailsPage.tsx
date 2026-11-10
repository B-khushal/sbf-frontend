import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  ShoppingBag,
  Share2,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  Gift,
  ClipboardList,
  Leaf,
  Info,
  Truck,
  Sparkles,
  AlertCircle,
  Check,
  Calendar,
  MapPin,
  X,
  Play,
  ArrowLeft,
  ShieldAlert,
  MessageSquare,
  HelpCircle,
  Clock,
  Moon,
  Sparkle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import useCart from '@/hooks/use-cart';
import useWishlist from '@/hooks/use-wishlist';
import { useValentine } from '@/contexts/ValentineContext';

import productService, { ProductData, ProductVideo, ComboItem } from '@/services/productService';
import { getImageUrl, getProductImageUrl } from '@/config';
import ContactModal from '@/components/ui/ContactModal';
import PinCodeInput from '@/components/ui/PinCodeInput';
import ProtectedImage from '@/components/ui/ProtectedImage';
import ProductReviews from '@/components/ProductReviews';
import RecommendedProducts from '@/components/RecommendedProducts';
import SEOHead from '@/components/seo/SEOHead';
import ContextualFaq from '@/components/faq/ContextualFaq';
import FloatingPetals from '@/components/valentine/FloatingPetals';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { promptLoginForAddToCart } from '@/utils/cartAuthHelper';
import { getProductEffectivePrice } from '@/utils/pricing';
import { marketingTracker } from '@/services/marketingTracker';
import { trackProductView } from '@/services/activityService';
import { generateProductSeo } from '@/utils/seoGenerator';
import { getValentineWeekDays } from '@/utils/valentineCalendar';
import { buildProductReviewUrl } from '@/utils/reviewUrls';

import '@/components/valentine/valentine.css';

const MotionProtectedImage = motion(ProtectedImage);

export interface PriceVariant {
  label: string;
  price: number;
  stock: number;
  discountPrice?: number;
  comparePrice?: number;
  detail?: string;
  description?: string;
  badge?: string;
}

export interface ExtendedValentineProduct extends ProductData {
  _id: string;
  dateWisePricing?: Record<string, number>;
  dateWiseStock?: Record<string, number>;
  availableDates?: string[];
  valentineCategory?: string;
  isValentineExclusive?: boolean;
}

const GREETING_CARD_OPTIONS = [
  { id: 'complimentary-standard', label: 'Complimentary Keepsake Card', extra: 0, badge: 'FREE' },
  { id: 'classic-love', label: 'Classic Red Love Card', extra: 49, badge: '+₹49' },
  { id: 'floral-romance', label: 'Luxury Floral Keepsake Card', extra: 79, badge: '+₹79' },
  { id: 'heart-popout', label: '3D Pop-Up Heart Card', extra: 129, badge: '+₹129' },
];

const FIXED_TIME_SLOTS = [
  {
    id: 'morning',
    label: 'Morning',
    time: '9:00 AM - 12:00 PM',
    available: true,
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    time: '12:00 PM - 3:00 PM',
    available: true,
  },
  {
    id: 'late_afternoon',
    label: 'Late Afternoon',
    time: '3:00 PM - 6:00 PM',
    available: true,
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '6:00 PM - 9:00 PM',
    available: true,
  },
];

const ValentineProductDetailsPage: React.FC = () => {
  const { id, productId } = useParams<{ id?: string; productId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const actualId = id || productId || '';

  const { isValentineEnabled, settings, loading: contextLoading } = useValentine();
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<ExtendedValentineProduct | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  // Gallery state
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLens, setShowLens] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Purchase state
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<PriceVariant | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('same_day');
  const [anonymousGift, setAnonymousGift] = useState<boolean>(false);
  const [surpriseDelivery, setSurpriseDelivery] = useState<boolean>(false);
  const [greetingCardChoice, setGreetingCardChoice] = useState<string>('complimentary-standard');

  // Greeting Card Inputs (Recipient, Sender, Message)
  const [cardRecipient, setCardRecipient] = useState<string>('');
  const [cardSender, setCardSender] = useState<string>('');
  const [cardMessage, setCardMessage] = useState<string>('');

  // Personalization text (if product.personalizationEnabled)
  const [personalizationText, setPersonalizationText] = useState<string>('');

  // Pincode Availability Checker
  const [pincodeCheckVal, setPincodeCheckVal] = useState('');
  const [isPincodeExpanded, setIsPincodeExpanded] = useState(false);
  const [pincodeLocation, setPincodeLocation] = useState<any>(null);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [isPincodeValid, setIsPincodeValid] = useState(false);
  const productInfoRef = useRef<HTMLDivElement>(null);

  // Modals & UI controls
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [defaultExpanded, setDefaultExpanded] = useState<string[]>(['details', 'description', 'care', 'delivery']);

  // Dynamic Valentine Week Days
  const valentineWeekDays = useMemo(() => getValentineWeekDays(), []);

  // Fetch product data
  const fetchProductDetails = async () => {
    if (!actualId || actualId.trim() === '') {
      navigate('/valentine-shop', { replace: true });
      return;
    }

    try {
      setProductLoading(true);
      const data = await productService.getProductById(actualId);

      // Block hidden products
      if (data.hidden) {
        navigate('/valentine-shop', { replace: true });
        return;
      }

      setProduct(data as ExtendedValentineProduct);

      // Initialize variant if available
      if (data.hasPriceVariants && data.priceVariants && data.priceVariants.length > 0) {
        setSelectedVariant(data.priceVariants[0]);
      } else {
        setSelectedVariant(null);
      }

      // Initialize selected delivery date
      if (data.availableDates && data.availableDates.length > 0) {
        setSelectedDate(data.availableDates[0]);
      } else if (valentineWeekDays && valentineWeekDays.length > 0) {
        setSelectedDate(valentineWeekDays[0].formattedDate);
      }
    } catch (err) {
      console.error('Error fetching Valentine product details:', err);
      navigate('/valentine-shop', { replace: true });
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [actualId]);

  // Sync pincode selection with localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sbf_delivery_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPincodeLocation(parsed);
        setPincodeCheckVal(parsed.code);
        setIsPincodeValid(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Track product view for analytics
  useEffect(() => {
    if (product?._id) {
      void trackProductView(
        product._id,
        product.title,
        `/valentine-product/${product._id}`
      );
      marketingTracker.trackProductView({
        id: product._id,
        title: product.title,
        price: product.price,
        category: product.category,
        occasion: 'Valentine'
      });
    }
  }, [product?._id, product?.title, product?.price, product?.category]);

  // Gallery items builder (images + videos)
  const galleryItems = useMemo(() => {
    if (!product) return [];
    const items: Array<
      | { type: 'image'; url: string; index: number }
      | { type: 'video'; video: ProductVideo; index: number }
    > = [];

    const rawImages = (product.images && product.images.length > 0)
      ? product.images
      : (product.image ? [product.image] : []);

    rawImages.forEach((img, idx) => {
      if (img && typeof img === 'string') {
        items.push({ type: 'image', url: img, index: idx });
      }
    });

    if (product.videos && product.videos.length > 0) {
      product.videos.forEach((vid, idx) => {
        items.push({
          type: 'video',
          video: vid,
          index: (rawImages.length || 0) + idx,
        });
      });
    }

    if (items.length === 0) {
      items.push({ type: 'image', url: '/images/placeholder.svg', index: 0 });
    }

    return items;
  }, [product]);

  // Active pricing calculation
  const activeBasePrice = useMemo(() => {
    if (!product) return 0;

    // Check if variant is chosen with custom price
    if (selectedVariant && selectedVariant.price) {
      return selectedVariant.price;
    }

    // Check date-wise pricing override
    if (selectedDate && product.dateWisePricing) {
      const pricingObj = product.dateWisePricing as Record<string, number>;
      const trimmedDate = selectedDate.trim();
      const matchKey = Object.keys(pricingObj).find(k =>
        trimmedDate.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(trimmedDate.toLowerCase())
      );
      if (matchKey && pricingObj[matchKey] !== undefined) {
        return pricingObj[matchKey];
      }
    }

    return getProductEffectivePrice(product as any);
  }, [product, selectedVariant, selectedDate]);

  // Greeting card upgrade cost
  const cardExtraCost = useMemo(() => {
    const cardOpt = GREETING_CARD_OPTIONS.find(c => c.id === greetingCardChoice);
    return cardOpt ? cardOpt.extra : 0;
  }, [greetingCardChoice]);

  // Delivery settings & charges synced with CheckoutShippingPage & TimeSlotSelector
  const valDeliverySettings = settings?.delivery;
  const midnightCharge = valDeliverySettings?.midnightCharge ?? 300;
  const fixedTimeCharge = valDeliverySettings?.fixedTimeCharge ?? 150;
  const surpriseCharge = valDeliverySettings?.surpriseCharge ?? 100;
  const anonymousCharge = valDeliverySettings?.anonymousCharge ?? 0;
  const sameDayCharge = valDeliverySettings?.sameDayCharge ?? 150;

  const isSelectedDateToday = useMemo(() => {
    if (!selectedDate) return false;
    const now = new Date();
    if (now.getMonth() !== 1) return false; // Feb is month 1
    const match = selectedDate.match(/\b(\d{1,2})\b/);
    if (!match) return false;
    return parseInt(match[1], 10) === now.getDate();
  }, [selectedDate]);

  const isSlotAvailable = (slot: typeof FIXED_TIME_SLOTS[0]): boolean => {
    if (!slot.available) return false;
    if (!isSelectedDateToday) return true;
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 5.5 * 3600000);
    const currentHour = istTime.getHours() + istTime.getMinutes() / 60;
    const timeRange = slot.time.split(' - ')[0];
    const [hourStr, minuteStr] = timeRange.split(':');
    let hour = parseInt(hourStr, 10);
    if (minuteStr.includes('PM') && hour !== 12) hour += 12;
    else if (minuteStr.includes('AM') && hour === 12) hour = 0;
    return hour - currentHour >= 0.25;
  };

  const getUnavailableReason = (slot: typeof FIXED_TIME_SLOTS[0]): string | null => {
    if (!slot.available) return 'Unavailable';
    if (!isSelectedDateToday) return null;
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 5.5 * 3600000);
    const currentHour = istTime.getHours() + istTime.getMinutes() / 60;
    const timeRange = slot.time.split(' - ')[0];
    const [hourStr, minuteStr] = timeRange.split(':');
    let hour = parseInt(hourStr, 10);
    if (minuteStr.includes('PM') && hour !== 12) hour += 12;
    else if (minuteStr.includes('AM') && hour === 12) hour = 0;
    if (hour <= currentHour) return 'Time passed for today';
    if (hour - currentHour < 0.25) return 'Need 15+ minutes notice';
    return null;
  };

  const isFixedSlot = ['morning', 'afternoon', 'late_afternoon', 'evening', 'fixed', 'fixed_time'].includes(selectedDeliveryOption);

  // Delivery option extra cost (matched with CheckoutShippingPage)
  const deliveryExtraCost = useMemo(() => {
    if (selectedDeliveryOption === 'midnight') return midnightCharge;
    if (isFixedSlot) return fixedTimeCharge;
    if (selectedDeliveryOption === 'same_day') return isSelectedDateToday ? sameDayCharge : 0;
    return 0;
  }, [selectedDeliveryOption, isFixedSlot, midnightCharge, fixedTimeCharge, isSelectedDateToday, sameDayCharge]);

  const activeUnitPrice = useMemo(() => {
    return activeBasePrice + cardExtraCost;
  }, [activeBasePrice, cardExtraCost]);

  const originalPrice = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant && selectedVariant.comparePrice) {
      return selectedVariant.comparePrice;
    }
    return Number(product.price) || activeUnitPrice;
  }, [product, selectedVariant, activeUnitPrice]);

  // Stock check for selected date
  const isSoldOutForDate = useMemo(() => {
    if (!product) return false;
    if (selectedDate && product.dateWiseStock) {
      const stockObj = product.dateWiseStock as Record<string, number>;
      const matchKey = Object.keys(stockObj).find(k =>
        selectedDate.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(selectedDate.toLowerCase())
      );
      if (matchKey && stockObj[matchKey] !== undefined) {
        return stockObj[matchKey] <= 0;
      }
    }
    return (product.countInStock !== undefined && product.countInStock <= 0) || product.isOutOfStock;
  }, [product, selectedDate]);

  const isOutOfStock = isSoldOutForDate;

  // Wishlist state
  const isInWishlist = useMemo(() => {
    if (!product) return false;
    const currentId = String(product._id);
    return wishlistItems?.some(i => String(i.id) === currentId || String((i as any).productId) === currentId);
  }, [product, wishlistItems]);

  const handleToggleWishlist = () => {
    if (!product) return;
    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast({
        title: 'Removed from Wishlist',
        description: `${product.title} has been removed from your saved items.`,
      });
    } else {
      addToWishlist({
        id: product._id,
        productId: product._id,
        title: product.title,
        price: activeUnitPrice,
        originalPrice: originalPrice,
        image: galleryItems[0]?.type === 'image' ? galleryItems[0].url : '/images/placeholder.svg',
        category: product.category,
      });
      toast({
        title: 'Saved to Wishlist ❤️',
        description: `${product.title} has been added to your favorites.`,
      });
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this gorgeous Valentine's arrangement from Spring Blossoms Florist: ${product.title}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied 📋',
        description: 'Product link copied to your clipboard.',
      });
    }
  };

  // Keyboard navigation & body lock for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImage((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0));
      }
    };

    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, galleryItems.length]);

  // Scroll listener for sticky bottom bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      const ctaSection = document.getElementById('main-purchase-section');
      if (ctaSection) {
        const rect = ctaSection.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const rect = currentTarget.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width - 0.5;
    const py = (clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: px, y: py });
    setZoomPos({ x: clientX - rect.left, y: clientY - rect.top });
  };

  // Add to Cart and Buy Now
  const handleAddToCart = async (isBuyNow = false) => {
    if (!product) return;

    if (isSoldOutForDate) {
      toast({
        title: 'Sold Out for Selected Date',
        description: 'This gift is currently sold out for your chosen delivery date. Please select another date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAddingToCart(true);

      const customizations = {
        deliveryDate: selectedDate,
        loveNote: cardMessage.trim() || undefined,
        cardRecipient: cardRecipient.trim() || undefined,
        cardSender: cardSender.trim() || undefined,
        greetingCard: greetingCardChoice === 'complimentary-standard' ? 'none' : greetingCardChoice,
        deliveryOption: selectedDeliveryOption,
        timeSlot: selectedDeliveryOption,
        deliveryOptionCost: deliveryExtraCost,
        anonymousGift,
        surpriseDelivery,
        personalizationText: personalizationText.trim() || undefined,
        selectedCampaign: "Valentine's Week",
        deliveryRestrictions: "Valentine Week delivery dates are reserved exclusively for Valentine's Special products."
      };

      // Sync delivery option, time slot, upgrades, and card details to checkout shippingInfo
      try {
        const existingInfoStr = localStorage.getItem('shippingInfo');
        const existingInfo = existingInfoStr ? JSON.parse(existingInfoStr) : {};
        const dayMatch = selectedDate?.match(/\b(\d{1,2})\b/);
        let syncedIsoDate = existingInfo.selectedDate;
        if (dayMatch) {
          const dayNum = Math.min(15, Math.max(8, parseInt(dayMatch[1], 10)));
          const now = new Date();
          let targetYear = now.getFullYear();
          const candidateDate = new Date(targetYear, 1, dayNum, 12, 0, 0);
          if (candidateDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            targetYear += 1;
          }
          syncedIsoDate = new Date(targetYear, 1, dayNum, 12, 0, 0).toISOString();
        }
        const updatedShippingInfo = {
          ...existingInfo,
          timeSlot: selectedDeliveryOption,
          selectedTimeSlot: selectedDeliveryOption,
          surpriseDelivery,
          anonymousGift,
          greetingCard: greetingCardChoice === 'complimentary-standard' ? 'none' : greetingCardChoice,
          ...(syncedIsoDate ? { selectedDate: syncedIsoDate } : {}),
          ...(cardRecipient.trim() ? { cardRecipient: cardRecipient.trim() } : {}),
          ...(cardSender.trim() ? { cardSender: cardSender.trim() } : {}),
          ...(cardMessage.trim() ? { cardMessage: cardMessage.trim(), giftMessage: cardMessage.trim() } : {}),
        };
        localStorage.setItem('shippingInfo', JSON.stringify(updatedShippingInfo));
      } catch (e) {
        console.warn('Could not sync shippingInfo to localStorage:', e);
      }

      const cartItem = {
        _id: product._id,
        id: `${product._id}${selectedVariant ? `-${selectedVariant.label}` : ''}${selectedDate ? `-${selectedDate.replace(/[^a-zA-Z0-9]/g, '')}` : ''}`,
        productId: product._id,
        title: product.title,
        price: activeUnitPrice,
        originalPrice: originalPrice,
        image: galleryItems[0]?.type === 'image' ? galleryItems[0].url : (product.images?.[0] || product.image || ''),
        images: product.images || [],
        quantity: quantity,
        category: product.category || 'Valentine',
        discount: product.discount || 0,
        description: product.description || '',
        details: product.details || [],
        careInstructions: product.careInstructions || [],
        isNewArrival: Boolean(product.isNewArrival),
        isFeatured: Boolean(product.isFeatured),
        productType: 'valentine' as const,
        isValentineProduct: true,
        selectedVariant: selectedVariant || undefined,
        availableDates: product.availableDates || [],
        customizations,
      };

      if (!user) {
        promptLoginForAddToCart(navigate, cartItem, window.location.pathname + window.location.search);
        return;
      }

      await addToCart(cartItem);

      marketingTracker.trackAddToCart({
        id: product._id,
        title: product.title,
        price: activeUnitPrice,
        quantity: quantity
      });

      toast({
        title: 'Added to Valentine Cart ❤️',
        description: `${quantity} × ${product.title} reserved for ${selectedDate || 'Valentine Delivery'}.`,
      });

      if (isBuyNow) {
        setTimeout(() => {
          navigate('/cart');
        }, 300);
      }
    } catch (err) {
      console.error('Failed adding Valentine item to cart:', err);
      toast({
        title: 'Unable to Add to Cart',
        description: 'Please check your options and try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Loading state
  if (productLoading || contextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFDFD] via-[#FAF6F4] to-[#FFF9F7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-serif tracking-wider text-rose-800">
            Curating Valentine's arrangement with love...
          </p>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFDFD] via-[#FAF6F4] to-[#FFF9F7] flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl border border-rose-100">
          <Sparkles className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold font-serif text-slate-900 mb-2">Valentine Gift Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The romantic arrangement you are looking for may have concluded or is no longer listed.
          </p>
          <Button
            onClick={() => navigate('/valentine-shop')}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 font-semibold shadow-md"
          >
            Explore Valentine Collection
          </Button>
        </div>
      </div>
    );
  }

  // SEO metadata calculation
  const existingSeo = (product as any).seoSettings || {};
  const generatedSeo = generateProductSeo({
    ...product,
    name: product.title,
    category: product.category || 'Valentine Roses',
  }, existingSeo);

  const productSeoTitle = existingSeo.seoTitle || `${product.title} | Exclusive Valentine's Gift | SBFlorist Hyderabad`;
  const productSeoDesc = existingSeo.metaDescription || `Order ${product.title} online for Valentine's Day from Spring Blossoms Florist. Fresh romantic flowers and gifts delivered same-day and midnight in Hyderabad.`;
  const productCanonical = existingSeo.canonicalUrl || `/valentine-product/${product.slug || product._id || actualId}`;
  const currentMediaUrl = galleryItems[selectedImage]?.type === 'image'
    ? getImageUrl(galleryItems[selectedImage].url)
    : '/images/placeholder.svg';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: productSeoDesc,
    image: galleryItems.map(item => item.type === 'image' ? getImageUrl(item.url) : ''),
    sku: String(product._id),
    ...(product.rating && product.numReviews ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(product.rating).toFixed(1),
        reviewCount: Number(product.numReviews),
        bestRating: 5,
        worstRating: 1
      }
    } : {}),
    offers: {
      '@type': 'Offer',
      url: `https://sbflorist.in/valentine-product/${product._id}`,
      priceCurrency: 'INR',
      price: activeUnitPrice,
      priceValidUntil: '2026-02-15',
      itemCondition: 'https://schema.org/NewCondition',
      availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: {
        '@type': 'Florist',
        '@id': 'https://sbflorist.in/#business',
        name: 'Spring Blossoms Florist',
        url: 'https://sbflorist.in/'
      }
    }
  };

  const breadcrumbs = [
    { name: 'Home', item: '/' },
    { name: "Valentine's Day Gifts", item: '/valentine-special' },
    { name: product.valentineCategory || product.category || 'Valentine Roses', item: '/valentine-shop' },
    { name: product.title, item: productCanonical },
  ];

  const currentGalleryItem = galleryItems[selectedImage];

  return (
    <section className="pt-8 sm:pt-12 pb-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#FFFDFD] via-[#FAF6F4] to-[#FFF9F7] text-slate-900 relative overflow-visible lg:overflow-visible">
      {/* Dynamic SEO Head with JSON-LD Schema */}
      <SEOHead
        title={productSeoTitle}
        description={productSeoDesc}
        canonical={productCanonical}
        keywords={existingSeo.focusKeyword ? `${existingSeo.focusKeyword}, Valentine's Day Gifts, Flower Delivery Hyderabad` : "Valentine's Day Flowers, Romantic Roses, Valentine Gift Combos, Flower Delivery Hyderabad"}
        ogType="product"
        ogImage={currentMediaUrl}
        ogImageAlt={`${product.title} - Valentine's Day Flower Delivery Hyderabad`}
        jsonLd={productSchema}
        breadcrumbs={breadcrumbs}
      />

      {/* Floating Petals */}
      <FloatingPetals enabled={settings?.theme?.floatingPetals ?? true} count={14} />

      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 right-[15%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.035)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute top-[35%] -left-[10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.025)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.02)_0%,transparent_70%)] blur-[90px]" />
      </div>

      <div className="w-full max-w-[1440px] 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pb-32 md:pb-12 overflow-visible">
        {/* Navigation Breadcrumb / Back to Valentine Shop */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-rose-100/60">
          <Link
            to="/valentine-shop"
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 hover:text-rose-900 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Valentine Collection
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/50">
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>Valentine Special Exclusive</span>
          </div>
        </div>

        {/* 2-COLUMN DESKTOP LAYOUT WITH STICKY LEFT IMAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-[560px_minmax(0,1fr)] 2xl:grid-cols-[640px_minmax(0,1fr)] 3xl:grid-cols-[720px_minmax(0,1fr)] lg:gap-[72px] 2xl:gap-20 gap-8 items-start relative">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: STICKY PRODUCT IMAGE GALLERY                */}
          {/* ======================================================== */}
          <div className="lg:sticky lg:top-[115px] lg:self-start w-full relative">
            <div className="flex flex-col md:flex-row gap-6 lg:w-full">
              
              {/* 1. Vertical Thumbnail Strip (Desktop) */}
              {galleryItems.length > 1 && (
                <div className="hidden md:flex md:flex-col gap-3 w-20 max-h-[520px] overflow-y-auto no-scrollbar pr-1 py-1 flex-shrink-0">
                  {galleryItems.map((item, index) => {
                    const isVideo = item.type === 'video';
                    const thumbUrl = isVideo
                      ? (item.video.thumbnailUrl || '/images/placeholder.svg')
                      : getImageUrl(item.url);

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "aspect-[4/5] w-full relative overflow-hidden rounded-2xl bg-white border transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs",
                          selectedImage === index
                            ? "border-rose-600 ring-2 ring-rose-500/20 shadow-md scale-102"
                            : "border-rose-100 opacity-60 hover:opacity-100"
                        )}
                        aria-label={`View image ${index + 1}`}
                      >
                        <ProtectedImage
                          src={thumbUrl}
                          alt={`${product.title} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isVideo && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play size={14} className="text-white fill-current" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Main Large Cinematic Image / Video Viewer */}
              <div className="relative flex-1">
                <div className="relative w-full">
                  <div
                    ref={containerRef}
                    className={cn(
                      "relative w-full group rounded-[28px] bg-white border border-rose-100 shadow-[0_15px_40px_rgba(225,29,72,0.04)] overflow-hidden aspect-[4/5] lg:max-w-[calc((100vh-160px)*4/5)] lg:max-h-[calc(100vh-160px)] mx-auto flex items-center justify-center p-0 backdrop-blur-md"
                    )}
                  >
                    {/* Out of Stock Luxury Badge */}
                    {isOutOfStock && (
                      <div className="absolute top-4 left-4 z-20 backdrop-blur-md bg-stone-900/85 text-white border border-white/20 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xl pointer-events-none">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-stone-100">
                          Sold Out For Date
                        </span>
                      </div>
                    )}

                    {/* Valentine Premium Seal */}
                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md border border-rose-200/60 text-rose-800 font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-rose-500" />
                      <span>Handcrafted Fresh</span>
                    </div>

                    <div
                      className={cn(
                        "relative w-full h-full flex items-center justify-center",
                        currentGalleryItem?.type === 'image' ? 'cursor-zoom-in' : ''
                      )}
                      onMouseMove={currentGalleryItem?.type === 'image' ? handleMouseMove : undefined}
                      onMouseEnter={currentGalleryItem?.type === 'image' ? () => {
                        setIsHovered(true);
                        setShowLens(true);
                      } : undefined}
                      onMouseLeave={currentGalleryItem?.type === 'image' ? () => {
                        setIsHovered(false);
                        setShowLens(false);
                        setMousePos({ x: 0, y: 0 });
                      } : undefined}
                      onClick={currentGalleryItem?.type === 'image' ? () => setIsLightboxOpen(true) : undefined}
                    >
                      {/* Image Loading Skeleton */}
                      {isImageLoading && currentGalleryItem?.type === 'image' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-50 via-rose-100/50 to-rose-50 animate-pulse flex items-center justify-center">
                          <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      {/* Main Media Display */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedImage}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full flex items-center justify-center"
                        >
                          {currentGalleryItem?.type === 'image' ? (
                            <MotionProtectedImage
                              src={getImageUrl(currentGalleryItem.url)}
                              alt={`${product.title} - Valentine Flower Delivery Hyderabad | Spring Blossoms Florist`}
                              loading="eager"
                              fetchPriority="high"
                              onLoad={() => setIsImageLoading(false)}
                              className={cn(
                                "w-full h-full object-cover rounded-[28px] transition-transform duration-700 ease-out",
                                isOutOfStock && "grayscale-[20%] opacity-90"
                              )}
                              style={{
                                transform: isHovered
                                  ? `scale(1.08) translate(${-mousePos.x * 20}px, ${-mousePos.y * 20}px)`
                                  : 'scale(1) translate(0px, 0px)'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <video
                                src={currentGalleryItem.video.url}
                                controls
                                autoPlay
                                muted
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Floating Zoom / Lightbox Prompt */}
                      {currentGalleryItem?.type === 'image' && (
                        <div className="absolute bottom-4 left-4 z-10 bg-white/85 backdrop-blur-md border border-rose-100 text-slate-700 text-[10px] font-semibold px-3 py-1 rounded-xl shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to expand fullscreen
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Horizontal Thumbnail Strip */}
                  {galleryItems.length > 1 && (
                    <div className="md:hidden flex gap-2.5 overflow-x-auto pb-2 pt-3 scrollbar-none">
                      {galleryItems.map((item, index) => {
                        const isVideo = item.type === 'video';
                        const thumbUrl = isVideo
                          ? (item.video.thumbnailUrl || '/images/placeholder.svg')
                          : getImageUrl(item.url);

                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={cn(
                              "w-16 h-20 rounded-xl overflow-hidden border flex-shrink-0 transition-all shadow-xs",
                              selectedImage === index
                                ? "border-rose-600 ring-2 ring-rose-500/20 scale-95"
                                : "border-rose-100 opacity-60"
                            )}
                          >
                            <ProtectedImage
                              src={thumbUrl}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: SCROLLABLE PRODUCT DETAILS & CONFIGURATION */}
          {/* ======================================================== */}
          <div ref={productInfoRef} className="min-w-0 flex flex-col space-y-6 lg:pb-12">
            
            {/* 1. Product Title & Brand Identity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-[0.2em] text-rose-600 uppercase">
                  Valentine's Day Exclusive Collection
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-[10px] font-medium text-slate-400 uppercase">
                  {product.valentineCategory || product.category || 'Luxury Floristry'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-slate-900 font-serif leading-[1.15]">
                {product.title}
              </h1>
            </div>

            {/* 2. Rating & Reviews Bar */}
            <div className="flex items-center gap-3">
              {((product.reviewCount && product.reviewCount > 0) || (product.numReviews && product.numReviews > 0)) ? (
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer group"
                >
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={cn(
                          i < Math.round(product.rating || 0)
                            ? "fill-current text-amber-400"
                            : "text-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-700 font-semibold group-hover:text-rose-600 transition-colors">
                    {Number(product.rating || 0).toFixed(1)}{' '}
                    <span className="text-slate-400 font-normal">
                      ({(product.reviewCount || product.numReviews)} {(product.reviewCount || product.numReviews) === 1 ? 'review' : 'reviews'})
                    </span>
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-slate-200 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={15} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">New Valentine Arrival</span>
                </div>
              )}
              <span className="h-3 w-px bg-slate-200" />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('reviews-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate(buildProductReviewUrl(product._id, product.title));
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2"
              >
                {((product.reviewCount && product.reviewCount > 0) || (product.numReviews && product.numReviews > 0)) ? 'Read reviews' : 'Write a review'}
              </button>
            </div>

            {/* 3. Pricing Section (dynamically recalculated) */}
            <div className="p-5 rounded-3xl bg-white border border-rose-100/80 shadow-xs flex justify-between items-center gap-4">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Valentine Delivered Price
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 font-sans tabular-nums">
                    {formatPrice(convertPrice(activeUnitPrice))}
                  </span>
                  {activeUnitPrice < originalPrice && (
                    <span className="text-base text-slate-400 line-through font-medium font-sans tabular-nums">
                      {formatPrice(convertPrice(originalPrice))}
                    </span>
                  )}
                </div>
              </div>
              {activeUnitPrice < originalPrice && (
                <div className="bg-rose-600 text-white font-extrabold text-xs uppercase px-3 py-1.5 rounded-xl shadow-xs">
                  Save {Math.round(((originalPrice - activeUnitPrice) / originalPrice) * 100)}%
                </div>
              )}
            </div>

            {/* 4. Valentine Delivery Date Picker */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  Select Valentine Gifting Date
                </label>
                <span className="text-[11px] text-rose-600 font-medium">Feb 7 – Feb 14</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {valentineWeekDays.map((vDay) => {
                  const isSelected = selectedDate === vDay.formattedDate || selectedDate === vDay.name || selectedDate === `${vDay.dayNumber} Feb`;
                  return (
                    <button
                      key={vDay.id}
                      type="button"
                      onClick={() => setSelectedDate(vDay.formattedDate)}
                      className={cn(
                        "p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-[68px]",
                        isSelected
                          ? "bg-rose-50 border-rose-600 ring-2 ring-rose-500/20 shadow-xs"
                          : "bg-white border-slate-200/70 hover:border-rose-200 hover:bg-rose-50/30 text-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">{vDay.icon}</span>
                        <span className={cn(
                          "text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md",
                          isSelected ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                          Feb {vDay.dayNumber}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold line-clamp-1",
                        isSelected ? "text-rose-900" : "text-slate-800"
                      )}>
                        {vDay.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {isSoldOutForDate ? (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1 pt-1">
                  <ShieldAlert className="w-4 h-4" />
                  Sold Out for {selectedDate}. Please choose another Valentine date.
                </p>
              ) : (
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Guaranteed fresh delivery window confirmed for {selectedDate}.
                </p>
              )}
            </div>

            {/* 5. Product Variants (e.g. Bouquet Sizes / Stem Counts) */}
            {product.hasPriceVariants && product.priceVariants && product.priceVariants.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-rose-100/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Select Bouquet Size / Variant
                  </label>
                  {selectedVariant && (
                    <span className="text-xs font-semibold text-rose-600">
                      Selected: {selectedVariant.label}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.priceVariants.map((variant, idx) => {
                    const isSelected = selectedVariant?.label === variant.label;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all flex items-center justify-between",
                          isSelected
                            ? "bg-rose-50 border-rose-600 ring-2 ring-rose-500/20 shadow-xs"
                            : "bg-white border-slate-200/70 hover:border-rose-200 hover:bg-rose-50/20"
                        )}
                      >
                        <div>
                          <p className={cn("text-xs font-bold", isSelected ? "text-rose-900" : "text-slate-800")}>
                            {variant.label}
                          </p>
                          {variant.detail && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{variant.detail}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-900 font-sans tabular-nums">
                            {formatPrice(convertPrice(variant.price))}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Pincode Availability Checker */}
            <div className="py-2 border-y border-rose-100/60">
              <button
                type="button"
                onClick={() => setIsPincodeExpanded(!isPincodeExpanded)}
                className="flex items-center justify-between w-full py-2.5 text-left text-sm font-semibold text-slate-700 hover:text-rose-600 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-rose-600 group-hover:scale-110 transition-transform" />
                  {pincodeLocation ? (
                    <span className="text-emerald-700 font-medium">
                      Delivering to: <strong className="font-bold">{pincodeLocation.area?.split('/')[0]} ({pincodeLocation.code})</strong>
                    </span>
                  ) : (
                    <span className="text-slate-700">Check delivery availability in Hyderabad / Secunderabad</span>
                  )}
                </span>
                <span className="text-xs text-rose-600 underline underline-offset-2 font-semibold">
                  {pincodeLocation ? 'Change' : 'Check Pincode'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isPincodeExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="p-4 bg-white border border-rose-100 rounded-2xl space-y-3 shadow-xs">
                      <p className="text-[11px] text-slate-500">
                        Enter your Hyderabad or Secunderabad 6-digit pincode to verify immediate Valentine dispatch availability.
                      </p>
                      <PinCodeInput
                        value={pincodeCheckVal}
                        onChange={(val) => {
                          setPincodeCheckVal(val);
                          if (!val) {
                            setPincodeLocation(null);
                            setPincodeMessage('');
                          }
                        }}
                        placeholder="Enter 6-digit Pincode (e.g. 500034)"
                        onSelectPinCode={(selection) => {
                          if (selection) {
                            setPincodeLocation(selection);
                            setIsPincodeValid(true);
                            setPincodeMessage(`Deliverable to ${selection.area}: Dispatched via climate-controlled luxury floral carrier.`);
                            localStorage.setItem('sbf_delivery_location', JSON.stringify(selection));
                            sessionStorage.setItem('sbf_entered_pincode', selection.code);
                            window.dispatchEvent(new CustomEvent('sbf-location-updated', { detail: selection }));
                          } else {
                            setPincodeLocation(null);
                            setIsPincodeValid(false);
                          }
                        }}
                        onValidationChange={(isValid, msg) => {
                          if (!isValid && msg) setPincodeMessage(msg);
                        }}
                        className="w-full"
                        inputClassName="h-11 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-rose-500 bg-white border-slate-200"
                      />
                      {pincodeMessage && (
                        <div className={cn(
                          "text-xs px-3 py-2 rounded-xl flex items-start gap-1.5 leading-relaxed font-medium",
                          isPincodeValid
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        )}>
                          <span>{isPincodeValid ? '✓' : '⚠'}</span>
                          <span>{pincodeMessage}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 7. Valentine Delivery Timing Options (Matched with Checkout & TimeSlotSelector) */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose-600" />
                  <span className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                    Select Delivery Option & Time Slot
                  </span>
                </div>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Verified Service Rates
                </span>
              </div>

              {/* 3 Main Delivery Service Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Same Day Standard / Standard Delivery */}
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryOption('same_day')}
                  className={cn(
                    "p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 shadow-xs flex flex-col justify-between text-left select-none",
                    selectedDeliveryOption === 'same_day'
                      ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold scale-[1.01]"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">🚚</span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {isSelectedDateToday ? `+${formatPrice(convertPrice(sameDayCharge))}` : 'Standard'}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <p className="font-bold text-xs sm:text-sm">
                      {isSelectedDateToday ? 'Same Day Standard' : 'Standard Delivery'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-normal">
                      {isSelectedDateToday ? '9 AM - 9 PM • Cutoff 6:00 PM' : '9 AM - 9 PM • All Day Delivery'}
                    </p>
                  </div>
                </button>

                {/* 2. Midnight Delivery */}
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryOption('midnight')}
                  className={cn(
                    "p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 shadow-xs flex flex-col justify-between text-left select-none",
                    selectedDeliveryOption === 'midnight'
                      ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-950 font-bold scale-[1.01]"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">🌙</span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                      +{formatPrice(convertPrice(midnightCharge))}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <p className="font-bold text-xs sm:text-sm">Midnight Delivery</p>
                    <p className="text-[11px] text-slate-500 font-normal">
                      {isSelectedDateToday ? '11:30 PM - 12:30 AM • Cutoff 8 PM' : '11:30 PM - 12:30 AM • Night Delivery'}
                    </p>
                  </div>
                </button>

                {/* 3. Fixed Time Slot */}
                <button
                  type="button"
                  onClick={() => {
                    const fixedIds = ['morning', 'afternoon', 'late_afternoon', 'evening'];
                    if (!fixedIds.includes(selectedDeliveryOption)) {
                      const firstAvailable = FIXED_TIME_SLOTS.find(s => isSlotAvailable(s))?.id || 'evening';
                      setSelectedDeliveryOption(firstAvailable);
                    }
                  }}
                  className={cn(
                    "p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 shadow-xs flex flex-col justify-between text-left select-none",
                    ['morning', 'afternoon', 'late_afternoon', 'evening'].includes(selectedDeliveryOption)
                      ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold scale-[1.01]"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">⏰</span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      +{formatPrice(convertPrice(fixedTimeCharge))}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <p className="font-bold text-xs sm:text-sm">Fixed Time Slot</p>
                    <p className="text-[11px] text-slate-500 font-normal">Pick Specific 3-Hour Slot</p>
                  </div>
                </button>
              </div>

              {/* Specific Time Window Slots (Shown when Fixed Time Slot is selected) */}
              {selectedDeliveryOption !== 'midnight' && selectedDeliveryOption !== 'same_day' && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Select Preferred Time Window
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {FIXED_TIME_SLOTS.map((slot) => {
                      const available = isSlotAvailable(slot);
                      const unavailableReason = !available ? getUnavailableReason(slot) : null;
                      const isSlotSelected = selectedDeliveryOption === slot.id;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!available}
                          onClick={() => available && setSelectedDeliveryOption(slot.id)}
                          className={cn(
                            "p-3.5 rounded-2xl border text-left transition-all flex justify-between items-start",
                            isSlotSelected
                              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50 font-semibold"
                              : "bg-white border-slate-200 hover:border-amber-400",
                            !available && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900">{slot.label}</div>
                            <div className="text-[11px] text-slate-500 font-normal">{slot.time}</div>
                            <div className="text-xs text-amber-600 font-bold mt-1">
                              +{formatPrice(convertPrice(fixedTimeCharge))}
                            </div>
                            {unavailableReason && (
                              <div className="text-[11px] text-red-500 mt-1 font-medium">
                                {unavailableReason}
                              </div>
                            )}
                          </div>
                          <div
                            className={cn(
                              "w-4 h-4 rounded-md border flex items-center justify-center transition-all mt-0.5 shrink-0",
                              isSlotSelected
                                ? "bg-amber-600 border-amber-600 text-white"
                                : "border-slate-300 bg-white"
                            )}
                          >
                            {isSlotSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Valentine Delivery Upgrades (Surprise Delivery & Anonymous Sender) */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <span>✨</span> Valentine Delivery Upgrades
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={cn(
                      "p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all duration-200 shadow-xs select-none",
                      surpriseDelivery
                        ? "bg-rose-50 border-rose-400 ring-2 ring-rose-400/20 text-rose-950 font-bold"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎁</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Surprise Delivery</p>
                        <p className="text-[10px] text-slate-500 font-normal">Discreet delivery service</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        +{formatPrice(convertPrice(surpriseCharge))}
                      </span>
                      <input
                        type="checkbox"
                        checked={surpriseDelivery}
                        onChange={(e) => setSurpriseDelivery(e.target.checked)}
                        className="hidden"
                      />
                      <div
                        className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0",
                          surpriseDelivery ? "bg-rose-600 border-rose-600 text-white" : "border-slate-300 bg-white"
                        )}
                      >
                        {surpriseDelivery && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </label>

                  <label
                    className={cn(
                      "p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all duration-200 shadow-xs select-none",
                      anonymousGift
                        ? "bg-purple-50 border-purple-400 ring-2 ring-purple-400/20 text-purple-950 font-bold"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕵️</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Anonymous Sender</p>
                        <p className="text-[10px] text-slate-500 font-normal">Hide sender info on box</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {anonymousCharge > 0 ? `+${formatPrice(convertPrice(anonymousCharge))}` : 'FREE'}
                      </span>
                      <input
                        type="checkbox"
                        checked={anonymousGift}
                        onChange={(e) => setAnonymousGift(e.target.checked)}
                        className="hidden"
                      />
                      <div
                        className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0",
                          anonymousGift ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"
                        )}
                      >
                        {anonymousGift && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 8. Complimentary Greeting Card & Love Note (Formatted per user blueprint) */}
            <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💌</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Add a Complimentary Greeting Card
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Printed on luxury embossed keepsake card stock
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-rose-600 border-rose-200 bg-rose-50">
                  Included
                </Badge>
              </div>

              {/* Side-by-side inputs: Recipient & From */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Recipient Name</label>
                  <Input
                    type="text"
                    value={cardRecipient}
                    onChange={(e) => setCardRecipient(e.target.value)}
                    placeholder="Recipient Name (e.g. Sarah)"
                    className="h-10 text-xs rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">From / Sender</label>
                  <Input
                    type="text"
                    value={cardSender}
                    onChange={(e) => setCardSender(e.target.value)}
                    placeholder="From (e.g. With love, Rohan)"
                    className="h-10 text-xs rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              {/* Textarea for heartfelt message with 200 chars limit */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600">Heartfelt Message</label>
                  <span className={cn(
                    "text-[10px] font-mono",
                    cardMessage.length > 200 ? "text-red-500 font-bold" : "text-slate-400"
                  )}>
                    {cardMessage.length}/200 chars
                  </span>
                </div>
                <textarea
                  value={cardMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setCardMessage(e.target.value);
                    }
                  }}
                  placeholder="Write your heartfelt message here (up to 200 characters)..."
                  className="w-full h-20 p-3 text-xs rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Card Stock / Upgrade Options */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-slate-600">Select Greeting Card Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GREETING_CARD_OPTIONS.map((c) => {
                    const isSelected = greetingCardChoice === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setGreetingCardChoice(c.id)}
                        className={cn(
                          "p-2 rounded-xl border text-left text-[11px] font-semibold transition-all",
                          isSelected
                            ? "bg-rose-50 border-rose-500 text-rose-900 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-rose-200"
                        )}
                      >
                        <span className="block line-clamp-1">{c.label}</span>
                        <span className="text-[10px] text-rose-600 font-extrabold">{c.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 9. Product Personalization if enabled */}
            {product.personalizationEnabled && (
              <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <h4 className="text-xs font-bold text-slate-900">
                    {product.fieldLabel || 'Custom Bouquet Spelling / Ribbon Text'}
                  </h4>
                </div>
                <Input
                  value={personalizationText}
                  onChange={(e) => setPersonalizationText(e.target.value)}
                  placeholder={product.placeholder || "e.g. FOREVER, KHUSHAL, PRIYA"}
                  className="h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-rose-500"
                />
                {personalizationText.trim() && (
                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/50 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Bouquet Ribbon Will Spell</span>
                    <span className="text-sm font-extrabold text-rose-800 tracking-wider">
                      ❤️ {personalizationText.toUpperCase()} ❤️
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 10. Normal Purchase Actions (Mobile view) */}
            <div id="main-purchase-section" className="flex flex-col gap-3 lg:hidden pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-xs font-bold uppercase text-slate-500">Quantity</span>
                <div className="flex items-center h-9 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-30"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center font-bold text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleAddToCart(false)}
                  disabled={addingToCart || isOutOfStock}
                  className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart ? 'Adding...' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart || isOutOfStock}
                  className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center bg-white shadow-xs"
                >
                  <Heart className={cn("w-5 h-5", isInWishlist ? "fill-rose-600 text-rose-600" : "text-slate-600")} />
                </button>
              </div>
            </div>

            {/* 11. Sticky Luxury Purchase Box (Desktop Only) */}
            <div className="sticky bottom-6 z-30 bg-white/90 backdrop-blur-xl border border-rose-200/70 p-5 rounded-3xl shadow-[0_20px_50px_rgba(225,29,72,0.08)] hidden lg:flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Quantity</span>
                  <div className="flex items-center h-9 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      type="button"
                      className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      type="button"
                      className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total price</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-sans tabular-nums">
                    {formatPrice(convertPrice(activeUnitPrice * quantity))}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {isOutOfStock ? (
                  <Button
                    type="button"
                    disabled
                    className="flex-1 h-12 rounded-2xl bg-stone-100 text-stone-400 font-semibold cursor-not-allowed border border-stone-200 flex items-center justify-center gap-2 opacity-90 shadow-none pointer-events-none"
                  >
                    Sold Out For Selected Date
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => handleAddToCart(false)}
                      disabled={addingToCart}
                      className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {addingToCart ? 'Reserving...' : 'Add to Cart'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleAddToCart(true)}
                      disabled={addingToCart}
                      className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs hover:opacity-95 transition-all shadow-[0_4px_20px_rgba(225,29,72,0.25)] border-none"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Instant Pre-order
                    </Button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="h-12 w-12 border border-slate-200 flex items-center justify-center rounded-2xl bg-white hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-700 shadow-xs"
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={18} className={cn("transition-colors", isInWishlist ? "fill-rose-500 text-rose-500" : "")} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-12 w-12 border border-slate-200 flex items-center justify-center rounded-2xl bg-white hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-700 shadow-xs"
                  title="Share product"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Trust Badges in Sticky Box */}
              <div className="flex justify-between items-center pt-2 text-[9px] text-slate-400 uppercase font-black tracking-widest border-t border-slate-100">
                <span className="flex items-center gap-1">🌸 Fresh Flowers</span>
                <span className="flex items-center gap-1">🚚 Midnight Slot</span>
                <span className="flex items-center gap-1">🎁 Luxury Keepsake</span>
              </div>
            </div>

            {/* 12. Product Details Accordion Section */}
            <Accordion
              type="multiple"
              className="w-full space-y-3 pt-4 border-t border-rose-100/70"
              value={defaultExpanded}
              onValueChange={setDefaultExpanded}
            >
              {/* Product Contents */}
              <AccordionItem value="details" className="border-none">
                <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-xs text-slate-800 bg-white hover:bg-rose-50/50 border border-rose-100/80 rounded-2xl hover:no-underline transition-all">
                  <span className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-rose-600" />
                    Product Contents & Specifications
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white/70 border border-t-0 border-rose-100/80 rounded-b-2xl -mt-1 text-xs text-slate-600 space-y-3">
                  <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                    <p className="text-rose-900 text-[11px] leading-relaxed font-semibold">
                      Each Valentine arrangement is crafted by our master floral artisans using premium Dutch and Bangalore-grown roses harvested fresh for your celebration.
                    </p>
                  </div>
                  {product.details && product.details.length > 0 ? (
                    product.details.map((detail, index) => (
                      <div key={index} className="flex items-start gap-2 py-0.5 text-slate-700">
                        <span className="text-rose-500 text-xs mt-0.5">✦</span>
                        <p className="text-[11px] leading-relaxed font-medium">{detail}</p>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500 text-xs">✦</span>
                        <p className="text-[11px]">Farm-fresh premium long-stem roses conditioned for extended vase life.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500 text-xs">✦</span>
                        <p className="text-[11px]">Artisanal wrap with imported water-wicking hydration wrap and luxury satin ribbon.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500 text-xs">✦</span>
                        <p className="text-[11px]">Complimentary embossed greeting card with your personalized message.</p>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Product Description */}
              {product.description && (
                <AccordionItem value="description" className="border-none">
                  <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-xs text-slate-800 bg-white hover:bg-rose-50/50 border border-rose-100/80 rounded-2xl hover:no-underline transition-all">
                    <span className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-rose-600" />
                      Arrangement Story & Details
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white/70 border border-t-0 border-rose-100/80 rounded-b-2xl -mt-1 text-xs text-slate-600">
                    <p className="leading-relaxed font-medium text-slate-700 text-xs">{product.description}</p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Combo Contents if combo */}
              {product.category === "combos" && product.comboItems && product.comboItems.length > 0 && (
                <AccordionItem value="combo" className="border-none">
                  <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-xs text-slate-800 bg-white hover:bg-rose-50/50 border border-rose-100/80 rounded-2xl hover:no-underline transition-all">
                    <span className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-rose-600" />
                      Included in this Combo
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white/70 border border-t-0 border-rose-100/80 rounded-b-2xl -mt-1 text-xs text-slate-600 space-y-3">
                    {product.comboItems.map((item, index) => (
                      <div key={index} className="flex gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                          />
                        )}
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{item.name}</h5>
                          {item.description && (
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Artisanal Care Instructions */}
              <AccordionItem value="care" className="border-none">
                <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-xs text-slate-800 bg-white hover:bg-rose-50/50 border border-rose-100/80 rounded-2xl hover:no-underline transition-all">
                  <span className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-rose-600" />
                    Artisanal Flower Care Guide
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white/70 border border-t-0 border-rose-100/80 rounded-b-2xl -mt-1 text-xs text-slate-600 space-y-2">
                  {(product.careInstructions && product.careInstructions.length > 0) ? (
                    product.careInstructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2 py-0.5 text-slate-700">
                        <span className="text-emerald-500 text-xs">🌿</span>
                        <p className="text-[11px] leading-relaxed font-medium">{instruction}</p>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2 text-slate-700">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 text-xs">🌿</span>
                        <p className="text-[11px]">Trim rose stems diagonally by 1–2 inches under running water upon arrival.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 text-xs">🌿</span>
                        <p className="text-[11px]">Place in a clean vase filled with cold water. Replenish with fresh water every 24 hours.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 text-xs">🌿</span>
                        <p className="text-[11px]">Keep away from direct sunlight, air conditioning drafts, and heating vents.</p>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Delivery Information */}
              <AccordionItem value="delivery" className="border-none">
                <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-xs text-slate-800 bg-white hover:bg-rose-50/50 border border-rose-100/80 rounded-2xl hover:no-underline transition-all">
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-rose-600" />
                    Valentine Delivery Policies & Guidelines
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white/70 border border-t-0 border-rose-100/80 rounded-b-2xl -mt-1 text-xs text-slate-600 space-y-3">
                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="text-rose-600 text-xs mt-0.5">🚚</span>
                      <p className="text-[11px] leading-relaxed">
                        <strong>Climate-Controlled Delivery:</strong> Hand-delivered across 50+ localities in Hyderabad & Secunderabad. No third-party couriers used for perishable blooms.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-600 text-xs mt-0.5">🌙</span>
                      <p className="text-[11px] leading-relaxed">
                        <strong>Midnight Surprise:</strong> Midnight slots are delivered strictly between 11:00 PM and 12:15 AM on the requested date.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-600 text-xs mt-0.5">📍</span>
                      <p className="text-[11px] leading-relaxed">
                        <strong>Single Attempt Policy:</strong> Please ensure the recipient or a representative is available. Re-delivery incurs an additional transit fee.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Frequently Asked Questions */}
              <AccordionItem value="faqs" className="border-none">
                <AccordionTrigger className="w-full flex items-center justify-between py-3 px-4 font-bold text-xs text-slate-800 bg-white hover:bg-rose-50/50 border border-rose-100/80 rounded-2xl hover:no-underline transition-all">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-rose-600" />
                    Valentine's Ordering FAQs
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white/70 border border-t-0 border-rose-100/80 rounded-b-2xl -mt-1 text-xs text-slate-600 space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Q: Can I pre-order for Valentine's Day (Feb 14) in advance?</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Yes! We strongly recommend pre-ordering. Valentine's Day capacity is limited and popular arrangements sell out early.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Q: Will my card message be handwritten or printed?</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      All messages are printed using luxury calligraphic typography on embossed greeting cards for an exquisite presentation.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* 13. Customer Reviews Section */}
            <div id="reviews-section" className="pt-8 border-t border-rose-100/80 overflow-visible relative">
              <ProductReviews
                productId={product._id}
                productTitle={product.title}
                onReviewSubmit={fetchProductDetails}
              />
            </div>
          </div>
        </div>

        {/* 14. Recommended Products Section */}
        <div className="mt-16">
          <RecommendedProducts
            productId={product._id}
            category={product.category}
            title="Complete Your Valentine's Surprise"
            subtitle="Curated Romantic Duos"
            variant="valentine"
            linkPrefix="/valentine-product"
            limit={10}
          />
        </div>

        {/* 15. Contextual FAQs for Valentine Gifts */}
        <ContextualFaq
          location="product"
          title="Valentine Gifting & Midnight Delivery FAQs"
          subtitle="Everything you need to know about romantic deliveries, custom cards, and flower freshness in Hyderabad."
          limit={4}
          className="mt-16 bg-white/60 border border-rose-100/70 rounded-3xl p-6"
        />
      </div>

      {/* Mobile Sticky Bottom Purchase Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-rose-200/60 z-40 py-3.5 px-4 shadow-[0_-10px_30px_rgba(225,29,72,0.08)] pb-[calc(0.85rem+env(safe-area-inset-bottom))]"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ProtectedImage
                  src={galleryItems[0]?.type === 'image' ? getImageUrl(galleryItems[0].url) : '/images/placeholder.svg'}
                  alt={product.title}
                  className="w-11 h-11 object-cover rounded-xl border border-rose-100"
                />
                <div className="hidden xs:block">
                  <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">{product.title}</h4>
                  <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                    {formatPrice(convertPrice(activeUnitPrice))}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleAddToCart(false)}
                  disabled={addingToCart || isOutOfStock}
                  className="bg-slate-900 text-white text-xs font-bold px-4 h-10 rounded-xl hover:bg-slate-800"
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                  Add
                </Button>
                <Button
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart || isOutOfStock}
                  className="bg-rose-600 text-white text-xs font-bold px-5 h-10 rounded-xl hover:bg-rose-700 shadow-sm shadow-rose-600/30"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  Pre-order
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Modal */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              key="valentine-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 flex flex-col justify-between p-6 select-none"
              style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 99999,
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="flex justify-between items-center text-white/90 max-w-5xl mx-auto w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs font-bold tracking-widest uppercase">
                  {selectedImage + 1} / {galleryItems.length} • {product.title}
                </span>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => prev > 0 ? prev - 1 : galleryItems.length - 1);
                  }}
                  className="absolute left-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-10"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="relative max-w-fit mx-auto" onClick={(e) => e.stopPropagation()}>
                  <MotionProtectedImage
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    src={getImageUrl(currentGalleryItem?.url || '')}
                    alt={product.title}
                    className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => prev < galleryItems.length - 1 ? prev + 1 : 0);
                  }}
                  className="absolute right-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-10"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Thumbnails row in lightbox */}
              {galleryItems.length > 1 && (
                <div
                  className="flex gap-2.5 justify-center py-4 overflow-x-auto no-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  {galleryItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-12 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 relative",
                        selectedImage === index
                          ? "border-white scale-105"
                          : "border-transparent opacity-40 hover:opacity-100"
                      )}
                    >
                      <ProtectedImage
                        src={getImageUrl(item.url)}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Contact / Bulk Order Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        productTitle={product.title}
      />
    </section>
  );
};

export default ValentineProductDetailsPage;
