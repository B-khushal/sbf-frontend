import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isSameDay, isValid, startOfDay } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Check,
  Gift,
  MessageSquare,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  User,
  X,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import PromoCodeInput from '@/components/PromoCodeInput';
import FreeDeliveryCelebrationModal from '@/components/ui/FreeDeliveryCelebrationModal';
import { LocationPicker } from '@/components/location/LocationPicker';
import { SERVICEABLE_PINCODES } from '@/components/ui/PinCodeInput';
import {
  AddressForm,
  AddressSelectorDrawer,
  CheckoutItemCard,
  DeliveryScheduleCard,
  MobileCheckoutBar,
  SavedAddressCard,
  type PriceBreakdownLine,
} from '@/components/checkout';
import useCart, { useCartSelectors, type CartItem } from '@/hooks/use-cart';
import useWishlist from '@/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { SavedAddress } from '@/services/authService';
import {
  type AddressInput,
  createAddress,
  deleteAddress,
  getAddressDisplayName,
  getAddresses,
  isValidIndianMobile,
  normalizeIndianMobile,
  setDefaultAddress,
  updateAddress,
} from '@/services/addressService';
import {
  calculateDeliveryFee,
  checkPincodeServiceability,
  type DeliveryCalculation,
  type PincodeServiceability,
} from '@/services/orderService';
import type { PromoCodeValidationResult } from '@/services/promoCodeService';
import type { MapplsLocation } from '@/types/location';
import api from '@/services/api';
import { marketingTracker } from '@/services/marketingTracker';
import { fixEmailTypo } from '@/utils/emailUtils';
import { cn } from '@/lib/utils';

const GUEST_ADDRESS_STORAGE_KEY = 'sbf_guest_delivery_address';
const GIFT_RECIPIENT_STORAGE_KEY = 'sbf_gift_recipient_address';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    if (e.response?.data?.message) return e.response.data.message;
    if (e.message) return e.message;
  }
  return fallback;
};

const CheckoutShippingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateItemQuantity, removeItem, isLoading: cartLoading } = useCart();
  const { subtotal, itemCount } = useCartSelectors();
  const { items: wishlistItems, addItem: addToWishlist } = useWishlist();
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();

  const addressSectionRef = useRef<HTMLDivElement>(null);
  const scheduleSectionRef = useRef<HTMLDivElement>(null);

  const hasValentine = useMemo(
    () => items.some((item) => item.productType === 'valentine' || item.isValentineProduct),
    [items]
  );

  // Delivery mode: self or gift
  const [deliveryOption, setDeliveryOption] = useState<'self' | 'gift'>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.deliveryOption === 'gift' || parsed.deliveryOption === 'self') {
          return parsed.deliveryOption;
        }
      }
    } catch {
      // Ignore malformed stored checkout draft
    }
    return hasValentine ? 'gift' : 'self';
  });

  // Sender details (used when sending as a gift)
  const [senderInfo, setSenderInfo] = useState(() => ({
    name: user?.name || '',
    phone: normalizeIndianMobile(user?.phone || ''),
    email: user?.email || '',
  }));

  useEffect(() => {
    if (user) {
      setSenderInfo((prev) => ({
        name: prev.name || user.name || '',
        phone: prev.phone || normalizeIndianMobile(user.phone || ''),
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Saved addresses & active selected personal address
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Dedicated Send-as-Gift receiver address (kept completely separate from customer's own personal address)
  const [giftRecipientAddress, setGiftRecipientAddress] = useState<SavedAddress | null>(() => {
    try {
      const raw = localStorage.getItem(GIFT_RECIPIENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.pincode || parsed.zipCode)) {
          return parsed;
        }
      }
    } catch {
      // Ignore malformed stored gift recipient
    }
    return null;
  });
  const [isEditingGiftRecipient, setIsEditingGiftRecipient] = useState<boolean>(false);
  const [saveGiftRecipientToBook, setSaveGiftRecipientToBook] = useState<boolean>(false);

  // Mappls GPS Picker state
  const [isPickingLocation, setIsPickingLocation] = useState<boolean>(false);
  const [mapDraftOverride, setMapDraftOverride] = useState<Partial<SavedAddress> | null>(null);
  const reopenDrawerAfterMapRef = useRef<boolean>(false);

  const openMapPicker = useCallback((fromDrawer = false) => {
    reopenDrawerAfterMapRef.current = fromDrawer;
    if (fromDrawer) {
      setDrawerOpen(false);
    }
    setIsPickingLocation(true);
  }, []);

  const closeMapPicker = useCallback(() => {
    setIsPickingLocation(false);
    if (reopenDrawerAfterMapRef.current) {
      reopenDrawerAfterMapRef.current = false;
      setDrawerOpen(true);
    }
  }, []);

  // Serviceability state for active selected address
  const [serviceability, setServiceability] = useState<PincodeServiceability | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState<boolean>(false);

  // Delivery Date & Time Slot state
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.selectedDate) {
          const d = new Date(parsed.selectedDate);
          if (isValid(d)) return startOfDay(d);
        }
      }
    } catch {
      // Ignore malformed stored date
    }
    return startOfDay(new Date());
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        const savedSlot = parsed.selectedTimeSlot || parsed.timeSlot;
        if (savedSlot) {
          if (savedSlot === 'same-day') return 'same_day';
          if (savedSlot === 'fixed-time') return 'evening';
          return savedSlot;
        }
      }
    } catch {
      // Ignore malformed stored time slot
    }
    return 'same_day';
  });

  // Greeting card & personal message state
  const [includeGreetingCard, setIncludeGreetingCard] = useState<boolean>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        return Boolean(parsed.cardMessage || parsed.giftMessage || parsed.includeGreetingCard);
      }
    } catch {
      // Ignore malformed stored greeting card toggle
    }
    return false;
  });

  const [cardRecipient, setCardRecipient] = useState<string>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
      return parsed.cardRecipient || '';
    } catch {
      return '';
    }
  });

  const [cardSender, setCardSender] = useState<string>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
      return parsed.cardSender || '';
    } catch {
      return '';
    }
  });

  const [cardMessage, setCardMessage] = useState<string>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
      return parsed.cardMessage || parsed.giftMessage || '';
    } catch {
      return '';
    }
  });

  const [deliveryInstructions, setDeliveryInstructions] = useState<string>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
      return parsed.deliverySpecialInstructions || parsed.deliveryInstructions || parsed.notes || '';
    } catch {
      return '';
    }
  });

  // Valentine optional upgrades
  const [surpriseDelivery, setSurpriseDelivery] = useState<boolean>(false);
  const [anonymousGift, setAnonymousGift] = useState<boolean>(false);
  const [valDeliverySettings, setValDeliverySettings] = useState<{
    sameDayEnabled?: boolean;
    sameDayCharge?: number;
    sameDayCutoff?: string;
    midnightEnabled?: boolean;
    midnightCharge?: number;
    midnightCutoff?: string;
    fixedTimeEnabled?: boolean;
    fixedTimeCharge?: number;
    surpriseEnabled?: boolean;
    surpriseCharge?: number;
    anonymousEnabled?: boolean;
    anonymousCharge?: number;
  }>({});

  // Promo code state
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
    promoCodeId?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('appliedPromoCode');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Dynamic delivery calculation & free delivery celebration modal
  const [deliveryCalculation, setDeliveryCalculation] = useState<DeliveryCalculation | null>(null);
  const [showFreeDeliveryModal, setShowFreeDeliveryModal] = useState<boolean>(false);
  const hasShownFreeDeliveryModal = useRef<boolean>(
    typeof window !== 'undefined' && sessionStorage.getItem('sbf_free_delivery_modal_shown') === 'true'
  );

  const initialSubtotalRef = useRef<number>(subtotal);

  // Track checkout started & fetch Valentine settings
  useEffect(() => {
    try {
      marketingTracker?.trackCheckoutStarted?.(initialSubtotalRef.current);
    } catch {
      // Non-blocking analytics failure
    }

    const initMetadata = async () => {
      try {
        const res = await api.get('/valentine/settings');
        if (res.data?.delivery) {
          setValDeliverySettings(res.data.delivery);
        }
      } catch {
        // Valentine settings are optional outside seasonal window
      }
    };

    initMetadata();
  }, []);

  // Load saved addresses for returning customers (or guest saved address)
  useEffect(() => {
    let active = true;

    const loadAddresses = async () => {
      setAddressesLoading(true);
      try {
        if (user?.id) {
          const list = await getAddresses();
          if (!active) return;
          setSavedAddresses(list);
          if (list.length > 0) {
            const defaultAddr = list.find((a) => a.isDefault) || list[0];
            setSelectedAddress((prev) => {
              if (prev && list.some((a) => a.id === prev.id)) {
                return list.find((a) => a.id === prev.id) || defaultAddr;
              }
              return defaultAddr;
            });
          } else {
            setSelectedAddress(null);
          }
        } else {
          // Guest checkout: restore guest session address if present
          try {
            const rawGuest = localStorage.getItem(GUEST_ADDRESS_STORAGE_KEY);
            if (rawGuest && active) {
              const parsed = JSON.parse(rawGuest);
              if (parsed && (parsed.pincode || parsed.zipCode)) {
                setSelectedAddress(parsed);
                setSavedAddresses([parsed]);
              }
            }
          } catch {
            // Ignore malformed guest storage entry
          }
        }
      } catch (err) {
        console.error('Failed to load customer addresses:', err);
      } finally {
        if (active) setAddressesLoading(false);
      }
    };

    loadAddresses();
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Active delivery address depends on whether the customer is ordering for themselves or sending a gift
  const activeDeliveryAddress = deliveryOption === 'gift' ? giftRecipientAddress : selectedAddress;

  // Verify PIN code serviceability whenever activeDeliveryAddress changes
  const activePincode = activeDeliveryAddress?.pincode || activeDeliveryAddress?.zipCode || '';

  useEffect(() => {
    if (!activePincode || activePincode.length !== 6) {
      setServiceability(null);
      return;
    }

    let cancelled = false;
    const verify = async () => {
      setCheckingServiceability(true);
      try {
        const res = await checkPincodeServiceability(activePincode);
        if (!cancelled) setServiceability(res);
      } catch {
        const localMatch = SERVICEABLE_PINCODES.find((p) => p.code === activePincode);
        if (!cancelled) {
          setServiceability(
            localMatch
              ? {
                  serviceable: true,
                  pincode: activePincode,
                  area: localMatch.area,
                  city: localMatch.city,
                  state: localMatch.state,
                  estimatedDelivery: 'Same-day & scheduled delivery available',
                }
              : {
                  serviceable: false,
                  pincode: activePincode,
                  message: `PIN code ${activePincode} is currently outside our Hyderabad & Secunderabad delivery area.`,
                }
          );
        }
      } finally {
        if (!cancelled) setCheckingServiceability(false);
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [activePincode]);

  // Recalculate delivery fee via backend whenever subtotal, slot, or address changes
  useEffect(() => {
    if (subtotal <= 0) {
      setDeliveryCalculation(null);
      return;
    }

    let cancelled = false;
    const fetchFee = async () => {
      try {
        const res = await calculateDeliveryFee({
          subtotal,
          timeSlot: selectedTimeSlot || 'same_day',
          email: senderInfo.email || activeDeliveryAddress?.email || user?.email || undefined,
          phone: senderInfo.phone || activeDeliveryAddress?.phone || user?.phone || undefined,
          userId: user?.id,
          pincode: activePincode || undefined,
          giftPackaging: false,
        });
        if (!cancelled) {
          setDeliveryCalculation(res);
          if (res?.isFirstOrderFreeDelivery && !hasShownFreeDeliveryModal.current) {
            hasShownFreeDeliveryModal.current = true;
            try {
              sessionStorage.setItem('sbf_free_delivery_modal_shown', 'true');
            } catch {
              // Storage quota or privacy mode
            }
            setShowFreeDeliveryModal(true);
          }
        }
      } catch (err) {
        console.error('Delivery fee calculation error:', err);
      }
    };

    fetchFee();
    return () => {
      cancelled = true;
    };
  }, [
    subtotal,
    selectedTimeSlot,
    activeDeliveryAddress?.email,
    activeDeliveryAddress?.phone,
    senderInfo.email,
    senderInfo.phone,
    user?.id,
    user?.email,
    user?.phone,
    activePincode,
  ]);

  // Pricing computations — Flat slot pricing:
  // Same-Day Standard & Fixed-Time (Morning, Afternoon, Evening) = ₹150 only; Midnight Express = ₹300 only
  const isFixedSlot = ['morning', 'afternoon', 'late_afternoon', 'evening', 'fixed', 'fixed_time'].includes(
    selectedTimeSlot || ''
  );
  const midnightCharge = valDeliverySettings.midnightCharge ?? 300;
  const standardAndFixedCharge = valDeliverySettings.fixedTimeCharge ?? 150;
  const surpriseCharge = valDeliverySettings.surpriseCharge ?? 100;
  const anonymousCharge = valDeliverySettings.anonymousCharge ?? 0;

  const flatSlotFee = selectedTimeSlot === 'midnight' ? midnightCharge : standardAndFixedCharge;
  const baseDeliveryFee = deliveryCalculation?.isFirstOrderFreeDelivery ? 0 : flatSlotFee;
  const surpriseFee = surpriseDelivery ? surpriseCharge : 0;
  const anonymousFee = anonymousGift ? anonymousCharge : 0;
  const totalDeliveryFee = baseDeliveryFee + surpriseFee + anonymousFee;

  const itemSavings = useMemo(() => {
    return items.reduce((acc, item) => {
      const orig = Number(item.originalPrice || 0);
      const curr = Number(item.price || 0);
      if (orig > curr) {
        return acc + (orig - curr) * (item.quantity || 1);
      }
      return acc;
    }, 0);
  }, [items]);

  const promoDiscount = appliedPromoCode ? Number(appliedPromoCode.discount || 0) : 0;
  const orderTotal = Math.max(0, subtotal + totalDeliveryFee - promoDiscount);

  const isDateInvalidForValentine = useMemo(() => {
    if (!hasValentine || !isValid(selectedDate)) return false;
    const month = selectedDate.getMonth();
    const d = selectedDate.getDate();
    return !(month === 1 && d >= 8 && d <= 15);
  }, [hasValentine, selectedDate]);

  // Address CRUD handlers connected to real backend PostgreSQL
  const handleCreateAddress = async (input: AddressInput): Promise<SavedAddress | null> => {
    setIsSavingAddress(true);
    try {
      if (user?.id) {
        const res = await createAddress(input);
        setSavedAddresses(res.addresses);
        setSelectedAddress(res.address);
        setMapDraftOverride(null);
        if (input.deliveryInstructions) {
          setDeliveryInstructions(input.deliveryInstructions);
        }
        toast({
          title: 'Delivery Address Saved',
          description: 'Your address has been saved to your account for faster future checkouts.',
        });
        return res.address;
      } else {
        const guestAddr: SavedAddress = {
          id: `guest_${Date.now()}`,
          fullName: input.fullName,
          firstName: input.firstName || input.fullName.split(' ')[0] || '',
          lastName: input.lastName || input.fullName.split(' ').slice(1).join(' ') || '',
          address: input.street,
          street: input.street,
          houseNo: input.houseNo,
          apartment: input.apartment,
          landmark: input.landmark,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          zipCode: input.pincode,
          phone: input.phone,
          alternatePhone: input.alternatePhone,
          email: input.email || senderInfo.email,
          type: input.type,
          deliveryOption,
          deliveryInstructions: input.deliveryInstructions,
          notes: input.deliveryInstructions,
          isDefault: true,
          latitude: input.latitude,
          longitude: input.longitude,
          formattedAddress: input.formattedAddress,
        };
        localStorage.setItem(GUEST_ADDRESS_STORAGE_KEY, JSON.stringify(guestAddr));
        setSavedAddresses([guestAddr]);
        setSelectedAddress(guestAddr);
        setMapDraftOverride(null);
        toast({
          title: 'Delivery Address Set',
          description: 'Your delivery address is ready for this order.',
        });
        return guestAddr;
      }
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Could not save address',
        description: getErrorMessage(error, 'Please check the address details and try again.'),
      });
      return null;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleUpdateAddress = async (id: string, input: AddressInput): Promise<SavedAddress | null> => {
    try {
      if (user?.id) {
        const res = await updateAddress(id, input);
        setSavedAddresses(res.addresses);
        if (selectedAddress?.id === id) {
          setSelectedAddress(res.address);
        }
        setMapDraftOverride(null);
        toast({
          title: 'Address Updated',
          description: 'Your saved address has been updated.',
        });
        return res.address;
      } else {
        return await handleCreateAddress(input);
      }
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: getErrorMessage(error, 'Could not update address.'),
      });
      return null;
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      if (user?.id) {
        const remaining = await deleteAddress(id);
        setSavedAddresses(remaining);
        if (selectedAddress?.id === id) {
          const fallback = remaining.find((a) => a.isDefault) || remaining[0] || null;
          setSelectedAddress(fallback);
        }
        toast({
          title: 'Address Deleted',
          description: 'The address has been removed from your account.',
        });
      } else {
        localStorage.removeItem(GUEST_ADDRESS_STORAGE_KEY);
        setSavedAddresses([]);
        setSelectedAddress(null);
      }
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: getErrorMessage(error, 'Could not delete address.'),
      });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user?.id) return;
    try {
      const updated = await setDefaultAddress(id);
      setSavedAddresses(updated);
      toast({
        title: 'Default Address Updated',
        description: 'This address will be pre-selected on future checkouts.',
      });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Could not set default',
        description: getErrorMessage(error, 'Please try again.'),
      });
    }
  };

  // Save gift receiver details (kept separate from personal address; optionally saved to address book)
  const handleSaveGiftRecipient = async (input: AddressInput): Promise<SavedAddress | null> => {
    setIsSavingAddress(true);
    try {
      let recipientAddr: SavedAddress = {
        id: giftRecipientAddress?.id || `gift_${Date.now()}`,
        fullName: input.fullName,
        firstName: input.firstName || input.fullName.split(' ')[0] || '',
        lastName: input.lastName || input.fullName.split(' ').slice(1).join(' ') || '',
        address: input.street,
        street: input.street,
        houseNo: input.houseNo,
        apartment: input.apartment,
        landmark: input.landmark,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        zipCode: input.pincode,
        phone: input.phone,
        alternatePhone: input.alternatePhone,
        email: input.email || '',
        type: input.type,
        deliveryOption: 'gift',
        deliveryInstructions: input.deliveryInstructions,
        notes: input.deliveryInstructions,
        isDefault: false,
        latitude: input.latitude,
        longitude: input.longitude,
        formattedAddress: input.formattedAddress,
      };

      if (user?.id && saveGiftRecipientToBook) {
        try {
          const res = await createAddress({ ...input, deliveryOption: 'gift', isDefault: false });
          setSavedAddresses(res.addresses);
          recipientAddr = res.address;
        } catch (err) {
          console.warn('Could not save receiver address to account book:', err);
        }
      }

      localStorage.setItem(GIFT_RECIPIENT_STORAGE_KEY, JSON.stringify(recipientAddr));
      setGiftRecipientAddress(recipientAddr);
      setIsEditingGiftRecipient(false);
      setMapDraftOverride(null);
      if (input.deliveryInstructions) {
        setDeliveryInstructions(input.deliveryInstructions);
      }
      if (!cardRecipient.trim()) {
        setCardRecipient(input.fullName);
      }
      if (!cardSender.trim() && senderInfo.name.trim()) {
        setCardSender(senderInfo.name.trim());
      }

      toast({
        title: 'Receiver Details Saved',
        description: `Gift will be delivered to ${input.fullName} (${input.pincode}).`,
      });
      return recipientAddr;
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Could not save receiver details',
        description: getErrorMessage(error, 'Please check the receiver details and try again.'),
      });
      return null;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSelectAddressForOrder = useCallback((addr: SavedAddress) => {
    // IMPORTANT: Selecting another address for THIS order never overwrites the saved default address
    if (deliveryOption === 'gift') {
      const giftAddr: SavedAddress = { ...addr, deliveryOption: 'gift', isDefault: false };
      setGiftRecipientAddress(giftAddr);
      setIsEditingGiftRecipient(false);
      try {
        localStorage.setItem(GIFT_RECIPIENT_STORAGE_KEY, JSON.stringify(giftAddr));
      } catch {
        // Ignore storage failure
      }
      if (!cardRecipient.trim()) {
        setCardRecipient(getAddressDisplayName(giftAddr));
      }
      toast({
        title: 'Gift Receiver Selected',
        description: `Gift delivering to ${getAddressDisplayName(giftAddr)} (${giftAddr.pincode || giftAddr.zipCode}).`,
      });
    } else {
      setSelectedAddress(addr);
      toast({
        title: 'Delivery Address Updated',
        description: `Delivering to ${getAddressDisplayName(addr)} (${addr.pincode || addr.zipCode}).`,
      });
    }
    if (addr.deliveryInstructions) {
      setDeliveryInstructions(addr.deliveryInstructions);
    }
  }, [cardRecipient, deliveryOption, toast]);

  // Mappls location confirmation
  const handleLocationConfirm = (location: MapplsLocation) => {
    const pin = String(location.pincode || '').replace(/\D/g, '').slice(0, 6);
    const isServiceable = SERVICEABLE_PINCODES.some((p) => p.code === pin);
    if (!isServiceable) {
      toast({
        title: 'Outside Delivery Area',
        description: `SBFlorist currently delivers in Hyderabad & Secunderabad. PIN code ${pin} is not serviceable.`,
        variant: 'destructive',
      });
      return;
    }

    setMapDraftOverride({
      fullName: location.recipientName || undefined,
      phone: location.phone || undefined,
      houseNo: location.houseNo || '',
      apartment: location.apartment || '',
      street: location.formattedAddress || '',
      address: location.formattedAddress || '',
      landmark: location.landmark || '',
      city: location.city || 'Hyderabad',
      state: location.state || 'Telangana',
      pincode: pin,
      zipCode: pin,
      latitude: location.latitude,
      longitude: location.longitude,
      formattedAddress: location.formattedAddress,
      deliveryInstructions: location.deliveryInstructions || '',
    });
    closeMapPicker();

    toast({
      title: 'Map Location Pinned',
      description: 'Address fields have been pre-filled from your selected map pin.',
    });
  };

  // Cart item quantity & wishlist actions
  const handleQuantityChange = async (itemId: string, nextQty: number) => {
    try {
      if (nextQty < 1) {
        await removeItem(itemId);
      } else {
        await updateItemQuantity(itemId, nextQty);
      }
      if (appliedPromoCode) {
        setAppliedPromoCode(null);
        localStorage.removeItem('appliedPromoCode');
      }
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Could not update quantity',
        description: getErrorMessage(err, 'Please try again.'),
      });
    }
  };

  const handleRemoveCartItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      if (appliedPromoCode) {
        setAppliedPromoCode(null);
        localStorage.removeItem('appliedPromoCode');
      }
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Could not remove item',
        description: getErrorMessage(err, 'Please try again.'),
      });
    }
  };

  const handleMoveToWishlist = async (item: CartItem) => {
    try {
      const prodId = String(item.productId || item._id || item.id);
      await addToWishlist({
        id: prodId,
        title: item.title || 'Floral Gift',
        price: Number(item.price || 0),
        image: (Array.isArray(item.images) && item.images[0]) || item.image || '/placeholder.svg',
      });
      toast({
        title: 'Saved to Wishlist',
        description: `${item.title} has been saved to your wishlist.`,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Wishlist error',
        description: 'Could not save this item to wishlist.',
      });
    }
  };

  // Promo code handlers
  const handlePromoCodeApplied = (validationResult: PromoCodeValidationResult) => {
    if (validationResult.success && validationResult.data) {
      const promoData = {
        code: validationResult.data.promoCode.code,
        discount: validationResult.data.discount.amount,
        finalAmount: validationResult.data.order.finalAmount,
      };
      setAppliedPromoCode(promoData);
      localStorage.setItem('appliedPromoCode', JSON.stringify(promoData));
    }
  };

  const handlePromoCodeRemoved = () => {
    setAppliedPromoCode(null);
    localStorage.removeItem('appliedPromoCode');
  };

  // Build standardized shippingInfo + orderData payloads (shared with CheckoutPaymentPage & backend)
  const buildCheckoutPayloads = () => {
    const targetAddress = activeDeliveryAddress;
    if (!targetAddress) return null;

    const recipientName = getAddressDisplayName(targetAddress);
    const recipientParts = recipientName.split(/\s+/).filter(Boolean);
    const rFirst = targetAddress.firstName || recipientParts[0] || 'Customer';
    const rLast = targetAddress.lastName || recipientParts.slice(1).join(' ') || '';

    const cleanSenderName = (deliveryOption === 'gift' ? senderInfo.name : recipientName).trim() || recipientName;
    const senderParts = cleanSenderName.split(/\s+/).filter(Boolean);
    const sFirst = senderParts[0] || rFirst;
    const sLast = senderParts.slice(1).join(' ') || rLast;

    const cleanEmail = fixEmailTypo(
      (deliveryOption === 'gift' ? senderInfo.email : targetAddress.email) ||
        user?.email ||
        targetAddress.email ||
        ''
    );
    const cleanPhone = normalizeIndianMobile(
      (deliveryOption === 'gift' ? senderInfo.phone : targetAddress.phone) ||
        targetAddress.phone ||
        user?.phone ||
        ''
    );
    const recipientPhone = normalizeIndianMobile(targetAddress.phone || cleanPhone);
    const activePin = targetAddress.pincode || targetAddress.zipCode || '';
    const streetAddress = targetAddress.street || targetAddress.address || targetAddress.formattedAddress || '';
    const aptCombined = [targetAddress.houseNo, targetAddress.apartment].filter(Boolean).join(', ');
    const fullFormatted =
      targetAddress.formattedAddress ||
      [
        targetAddress.houseNo,
        targetAddress.apartment,
        streetAddress,
        targetAddress.landmark ? `Near ${targetAddress.landmark}` : '',
        targetAddress.city || 'Hyderabad',
        `${targetAddress.state || 'Telangana'} – ${activePin}`,
      ]
        .filter(Boolean)
        .join(', ');

    const effectiveCardMsg = includeGreetingCard ? cardMessage.trim() : '';
    const effectiveInstructions = (deliveryInstructions || targetAddress.deliveryInstructions || '').trim();
    const deliveryType =
      selectedTimeSlot === 'midnight'
        ? 'Midnight Express Delivery'
        : isFixedSlot
        ? 'Fixed Time Delivery'
        : isSameDay(selectedDate, new Date())
        ? 'Same-Day Standard Delivery'
        : 'Standard Delivery';

    const shippingInfo = {
      firstName: sFirst,
      lastName: sLast,
      fullName: cleanSenderName,
      email: cleanEmail,
      phone: cleanPhone,
      alternatePhone: targetAddress.alternatePhone || '',
      addressType: targetAddress.type || 'home',
      address: streetAddress,
      houseNo: targetAddress.houseNo || '',
      apartment: aptCombined,
      landmark: targetAddress.landmark || '',
      city: targetAddress.city || 'Hyderabad',
      state: targetAddress.state || 'Telangana',
      zipCode: activePin,
      pincode: activePin,
      country: targetAddress.country || 'India',
      formattedAddress: fullFormatted,
      latitude: targetAddress.latitude ?? 17.3912,
      longitude: targetAddress.longitude ?? 78.4326,
      floor: targetAddress.floor || '',
      receiverFirstName: deliveryOption === 'gift' ? rFirst : '',
      receiverLastName: deliveryOption === 'gift' ? rLast : '',
      receiverPhone: deliveryOption === 'gift' ? recipientPhone : '',
      receiverEmail: deliveryOption === 'gift' ? targetAddress.email || '' : '',
      receiverAddress: deliveryOption === 'gift' ? streetAddress : '',
      receiverApartment: deliveryOption === 'gift' ? aptCombined : '',
      receiverCity: deliveryOption === 'gift' ? targetAddress.city || 'Hyderabad' : '',
      receiverState: deliveryOption === 'gift' ? targetAddress.state || 'Telangana' : '',
      receiverZipCode: deliveryOption === 'gift' ? activePin : '',
      deliveryOption,
      timeSlot: selectedTimeSlot || 'same_day',
      selectedTimeSlot: selectedTimeSlot || 'same_day',
      deliveryType,
      deliveryFee: totalDeliveryFee,
      giftPackaging: false,
      giftPackagingFee: 0,
      isFirstOrderFreeDelivery: deliveryCalculation?.isFirstOrderFreeDelivery ?? false,
      selectedDate: selectedDate.toISOString(),
      includeGreetingCard,
      cardRecipient: cardRecipient.trim() || (deliveryOption === 'gift' ? recipientName : ''),
      cardSender: cardSender.trim() || (deliveryOption === 'gift' ? cleanSenderName : ''),
      cardMessage: effectiveCardMsg,
      giftMessage: effectiveCardMsg,
      deliverySpecialInstructions: effectiveInstructions,
      deliveryInstructions: effectiveInstructions,
      notes: effectiveInstructions,
      surpriseDelivery: hasValentine ? surpriseDelivery : false,
      anonymousGift: hasValentine ? anonymousGift : false,
    };

    return shippingInfo;
  };

  // Validate checkout readiness and launch server-verified Razorpay payment
  const validateBeforePlaceOrder = (): boolean => {
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Your cart is empty',
        description: 'Add a bouquet or gift before placing an order.',
      });
      return false;
    }

    if (deliveryOption === 'gift' && (!senderInfo.name.trim() || !isValidIndianMobile(senderInfo.phone))) {
      addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast({
        variant: 'destructive',
        title: 'Sender Contact Required',
        description: 'Please provide your name and 10-digit mobile number for gift order updates.',
      });
      return false;
    }

    if (!activeDeliveryAddress || (deliveryOption === 'gift' && isEditingGiftRecipient)) {
      addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast({
        variant: 'destructive',
        title: deliveryOption === 'gift' ? 'Receiver Details Required' : 'Delivery Address Required',
        description:
          deliveryOption === 'gift'
            ? 'Please fill in and save the receiver’s name, mobile, and delivery address.'
            : 'Please complete and save your delivery address to continue.',
      });
      return false;
    }

    const pin = activeDeliveryAddress.pincode || activeDeliveryAddress.zipCode || '';
    const pinServiceable =
      serviceability !== null
        ? serviceability.serviceable
        : SERVICEABLE_PINCODES.some((p) => p.code === pin);

    if (!pinServiceable) {
      addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast({
        variant: 'destructive',
        title: 'Address Outside Delivery Area',
        description: `PIN code ${pin} is not serviceable. Please change or edit the delivery address.`,
      });
      return false;
    }

    if (hasValentine && isDateInvalidForValentine) {
      scheduleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast({
        variant: 'destructive',
        title: 'Invalid Delivery Date',
        description: "Valentine's items can only be delivered between Feb 8 and Feb 15.",
      });
      return false;
    }

    if (!selectedTimeSlot) {
      scheduleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast({
        variant: 'destructive',
        title: 'Select a Delivery Time Slot',
        description: 'Please choose your preferred delivery time slot.',
      });
      return false;
    }

    return true;
  };

  // Validate shipping details, persist shippingInfo, and redirect to /checkout/payment
  const handleProceedToPaymentPage = () => {
    if (!validateBeforePlaceOrder()) return;
    const shippingInfo = buildCheckoutPayloads();
    if (!shippingInfo) return;
    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    navigate('/checkout/payment');
  };

  // Price breakdown lines shared between Desktop Summary and Mobile Expandable Drawer
  const priceBreakdownLines: PriceBreakdownLine[] = useMemo(() => {
    const lines: PriceBreakdownLine[] = [
      { label: `Items Subtotal (${itemCount})`, amount: subtotal },
    ];
    if (itemSavings > 0) {
      lines.push({ label: 'Product Savings', amount: itemSavings, isDiscount: true });
    }
    if (promoDiscount > 0 && appliedPromoCode) {
      lines.push({
        label: `Coupon (${appliedPromoCode.code})`,
        amount: promoDiscount,
        isDiscount: true,
      });
    }
    const deliveryLabel =
      selectedTimeSlot === 'midnight'
        ? 'Midnight Express Delivery'
        : isFixedSlot
        ? 'Fixed-Time Slot Delivery'
        : 'Same-Day Standard Delivery';

    if (deliveryCalculation?.isFirstOrderFreeDelivery && surpriseFee === 0 && anonymousFee === 0) {
      lines.push({
        label: deliveryLabel,
        amount: 0,
        isFree: true,
        strikeAmount: flatSlotFee,
      });
    } else if (totalDeliveryFee === 0) {
      lines.push({ label: deliveryLabel, amount: 0, isFree: true });
    } else {
      lines.push({ label: deliveryLabel, amount: totalDeliveryFee });
    }
    return lines;
  }, [
    itemCount,
    subtotal,
    itemSavings,
    promoDiscount,
    appliedPromoCode,
    selectedTimeSlot,
    isFixedSlot,
    deliveryCalculation,
    flatSlotFee,
    surpriseFee,
    anonymousFee,
    totalDeliveryFee,
  ]);

  const handleCloseFreeDeliveryModal = () => {
    setShowFreeDeliveryModal(false);
    hasShownFreeDeliveryModal.current = true;
    try {
      sessionStorage.setItem('sbf_free_delivery_modal_shown', 'true');
    } catch {
      // Ignore storage access errors
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B18] overflow-x-clip">
      <Navigation />

      {/* Mappls Location Picker Modal */}
      {isPickingLocation && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pin delivery location on map"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeMapPicker();
            }
          }}
          className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center bg-[#1E1B18]/65 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-4xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeMapPicker}
              aria-label="Close map"
              className="fixed sm:absolute top-5 right-5 sm:top-3.5 sm:right-3.5 z-[10001] flex h-10 w-10 items-center justify-center rounded-full border border-[#E5DDD5] bg-white/95 text-[#1E1B18] shadow-lg transition-all hover:border-[#BE185D] hover:bg-[#FFF7F9] hover:text-[#BE185D] active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
            <LocationPicker
              initialLocation={
                mapDraftOverride?.latitude && mapDraftOverride?.longitude
                  ? {
                      latitude: mapDraftOverride.latitude,
                      longitude: mapDraftOverride.longitude,
                      formattedAddress: mapDraftOverride.formattedAddress || '',
                      city: mapDraftOverride.city || 'Hyderabad',
                      state: mapDraftOverride.state || 'Telangana',
                      country: 'India',
                      pincode: mapDraftOverride.pincode || '',
                      recipientName:
                        mapDraftOverride.fullName ||
                        (deliveryOption === 'self' ? user?.name || '' : ''),
                      phone:
                        mapDraftOverride.phone ||
                        (deliveryOption === 'self' ? user?.phone || '' : ''),
                    }
                  : {
                      recipientName: deliveryOption === 'self' ? user?.name || '' : '',
                      phone: deliveryOption === 'self' ? user?.phone || '' : '',
                    }
              }
              deliveryOption={deliveryOption}
              onConfirm={handleLocationConfirm}
              onCancel={closeMapPicker}
            />
          </div>
        </div>
      )}

      {/* Address Selector / Add / Edit Drawer */}
      <AddressSelectorDrawer
        open={drawerOpen}
        initialMode={drawerMode}
        editingAddress={editingAddress}
        addresses={savedAddresses}
        selectedAddressId={activeDeliveryAddress?.id || null}
        defaultFullName={deliveryOption === 'self' ? user?.name || '' : ''}
        defaultPhone={deliveryOption === 'self' ? user?.phone || '' : ''}
        defaultEmail={user?.email || ''}
        onOpenChange={setDrawerOpen}
        onSelectForOrder={handleSelectAddressForOrder}
        onCreateAddress={handleCreateAddress}
        onUpdateAddress={handleUpdateAddress}
        onDeleteAddress={handleDeleteAddress}
        onSetDefaultAddress={handleSetDefaultAddress}
        onOpenMapPicker={() => openMapPicker(true)}
        mapPinnedLabel={mapDraftOverride?.formattedAddress || null}
        onClearMapPin={() => setMapDraftOverride(null)}
        mapDraftOverride={mapDraftOverride}
      />

      <main className="mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-36 lg:pb-16">
        {/* Top Back Link + Checkout Progress Indicator */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#6F665E] hover:text-[#BE185D] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF3EE] px-3 py-1 text-[11px] font-semibold text-[#2E573A] border border-[#CBE0D0]">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Fresh Guarantee
            </span>
          </div>

          {/* 3-Step Checkout Progress Bar */}
          <nav aria-label="Checkout progress" className="mx-auto max-w-md">
            <ol className="flex items-center justify-between">
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#BE185D] text-xs font-bold text-white shadow-sm">
                  1
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#BE185D]">Shipping</span>
              </li>
              <li className="h-[2px] flex-1 mx-2 sm:mx-3 rounded-full bg-[#E5DDD5]" aria-hidden="true" />
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DFD5CA] bg-white text-xs font-semibold text-[#7A7168]">
                  2
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#7A7168]">Payment</span>
              </li>
              <li className="h-[2px] flex-1 mx-2 sm:mx-3 rounded-full bg-[#E5DDD5]" aria-hidden="true" />
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DFD5CA] bg-white text-xs font-semibold text-[#7A7168]">
                  3
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#7A7168]">Confirmed</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Empty Cart State */}
        {!cartLoading && items.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-[#EDE5DD] bg-white p-8 sm:p-12 text-center shadow-[0_6px_28px_rgba(30,27,24,0.04)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F5] text-[#BE185D]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h1 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1E1B18]">
              Your flower bag is empty
            </h1>
            <p className="mt-2 text-sm text-[#7A7168]">
              Explore handcrafted bouquets, celebration cakes, and curated floral hampers ready for same-day delivery.
            </p>
            <Button
              asChild
              className="mt-6 h-12 rounded-xl bg-[#BE185D] px-8 text-sm font-semibold text-white hover:bg-[#9D174D]"
            >
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
            {/* LEFT / MAIN COLUMN */}
            <div className="space-y-5 lg:col-span-7 xl:col-span-8 min-w-0">
              {/* SECTION 1: DELIVERY MODE & ADDRESS */}
              <section ref={addressSectionRef} className="space-y-4">
                {/* Compact Self vs Gift Toggle Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#EDE5DD] bg-white p-3.5 sm:px-5 shadow-[0_2px_12px_rgba(30,27,24,0.03)]">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8A8076]">
                      Who is receiving this order?
                    </p>
                    <p className="text-xs text-[#6F665E] mt-0.5">
                      {deliveryOption === 'gift'
                        ? 'Enter the recipient’s delivery address below — we’ll keep you updated.'
                        : 'Freshly arranged and delivered straight to your doorstep.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 rounded-xl bg-[#FAF8F5] p-1 border border-[#EDE5DD] shrink-0">
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('self')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
                        deliveryOption === 'self'
                          ? 'bg-white text-[#BE185D] shadow-xs border border-[#F5CBD8]'
                          : 'text-[#6F665E] hover:text-[#1E1B18]'
                      )}
                    >
                      <User className="h-3.5 w-3.5" />
                      For Myself
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('gift')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
                        deliveryOption === 'gift'
                          ? 'bg-white text-[#BE185D] shadow-xs border border-[#F5CBD8]'
                          : 'text-[#6F665E] hover:text-[#1E1B18]'
                      )}
                    >
                      <Gift className="h-3.5 w-3.5" />
                      Send as Gift
                    </button>
                  </div>
                </div>

                {/* Gift Sender Details (shown only in Send as Gift mode) */}
                {deliveryOption === 'gift' && (
                  <div className="rounded-2xl border border-[#F3DCE3] bg-[#FFFBFD] p-4 sm:p-5 space-y-3.5 shadow-[0_2px_12px_rgba(190,24,93,0.04)]">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F8E7ED]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#BE185D]">
                          Step 1 • Sender Details
                        </span>
                        <h2 className="text-sm sm:text-base font-semibold text-[#1E1B18]">
                          Your Details (For Invoice & Delivery Updates)
                        </h2>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF3EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#2E573A] border border-[#CBE0D0]">
                        <ShieldCheck className="h-3 w-3" />
                        Price Hidden from Receiver
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="sender-name" className="block text-xs font-semibold text-[#3C342E]">
                          Your Full Name <span className="text-[#BE185D]">*</span>
                        </label>
                        <Input
                          id="sender-name"
                          placeholder="Your full name"
                          value={senderInfo.name}
                          onChange={(e) => setSenderInfo((prev) => ({ ...prev, name: e.target.value }))}
                          className="h-11 rounded-xl border-[#E5DDD5] bg-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="sender-phone" className="block text-xs font-semibold text-[#3C342E]">
                          Your Mobile Number <span className="text-[#BE185D]">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="pointer-events-none absolute left-3 text-xs font-semibold text-[#7A7168]">
                            +91
                          </span>
                          <Input
                            id="sender-phone"
                            type="tel"
                            inputMode="tel"
                            maxLength={10}
                            placeholder="10-digit mobile"
                            value={senderInfo.phone}
                            onChange={(e) =>
                              setSenderInfo((prev) => ({
                                ...prev,
                                phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                              }))
                            }
                            className="h-11 rounded-xl border-[#E5DDD5] bg-white pl-10 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="sender-email" className="block text-xs font-semibold text-[#3C342E]">
                          Your Email <span className="font-normal text-[#8E847A]">(for invoice)</span>
                        </label>
                        <Input
                          id="sender-email"
                          type="email"
                          placeholder="you@example.com"
                          value={senderInfo.email}
                          onChange={(e) => setSenderInfo((prev) => ({ ...prev, email: e.target.value }))}
                          onBlur={(e) =>
                            setSenderInfo((prev) => ({ ...prev, email: fixEmailTypo(e.target.value) }))
                          }
                          className="h-11 rounded-xl border-[#E5DDD5] bg-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ADDRESS LOADING SKELETON vs GIFT RECEIVER FLOW vs RETURNING/FIRST-TIME PERSONAL FLOW */}
                {addressesLoading ? (
                  <div className="rounded-2xl border border-[#EDE5DD] bg-white p-5 space-y-3 animate-pulse">
                    <div className="h-3.5 w-28 rounded bg-[#EFE8E0]" />
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#F5ECEF]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 rounded bg-[#EFE8E0]" />
                        <div className="h-3.5 w-full rounded bg-[#F4EFE9]" />
                        <div className="h-3.5 w-2/3 rounded bg-[#F4EFE9]" />
                      </div>
                    </div>
                  </div>
                ) : deliveryOption === 'gift' ? (
                  giftRecipientAddress && !isEditingGiftRecipient ? (
                    <SavedAddressCard
                      isGiftRecipient
                      address={giftRecipientAddress}
                      serviceability={serviceability}
                      checkingServiceability={checkingServiceability}
                      onChangeAddress={() => {
                        setEditingAddress(null);
                        setDrawerMode('list');
                        setDrawerOpen(true);
                      }}
                      onAddNewAddress={() => {
                        setGiftRecipientAddress(null);
                        setMapDraftOverride(null);
                        setIsEditingGiftRecipient(true);
                      }}
                      onEditCurrent={() => {
                        setMapDraftOverride(null);
                        setIsEditingGiftRecipient(true);
                      }}
                    />
                  ) : (
                    <div className="rounded-2xl border border-[#F3DCE3] bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(30,27,24,0.04)] space-y-4">
                      <AddressForm
                        isGiftMode
                        initialAddress={
                          mapDraftOverride
                            ? { ...(giftRecipientAddress || {}), ...mapDraftOverride }
                            : giftRecipientAddress
                        }
                        defaultFullName=""
                        defaultPhone=""
                        defaultEmail=""
                        isFirstAddress={false}
                        submitLabel="SAVE RECEIVER DETAILS"
                        isSubmitting={isSavingAddress}
                        onSubmit={handleSaveGiftRecipient}
                        onCancel={
                          giftRecipientAddress
                            ? () => {
                                setIsEditingGiftRecipient(false);
                                setMapDraftOverride(null);
                              }
                            : undefined
                        }
                        onOpenMapPicker={() => openMapPicker(false)}
                        mapPinnedLabel={mapDraftOverride?.formattedAddress || null}
                        onClearMapPin={() => setMapDraftOverride(null)}
                        title="Step 2 • Receiver Details & Delivery Address"
                        subtitle="Enter the person receiving this gift and where we should deliver it. Your own default address won’t be changed."
                        headerAction={
                          savedAddresses.length > 0 ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingAddress(null);
                                setDrawerMode('list');
                                setDrawerOpen(true);
                              }}
                              className="h-9 rounded-xl border-[#E2B8C6] bg-[#FFF7F9] px-3 text-xs font-semibold text-[#BE185D] hover:bg-[#FFEBF1]"
                            >
                              <BookMarked className="mr-1.5 h-3.5 w-3.5" />
                              Pick Saved Address
                            </Button>
                          ) : undefined
                        }
                      />

                      {user?.id && (
                        <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-[#EDE5DD] bg-[#FAF8F5] px-3.5 py-2.5">
                          <input
                            type="checkbox"
                            checked={saveGiftRecipientToBook}
                            onChange={(e) => setSaveGiftRecipientToBook(e.target.checked)}
                            className="h-4 w-4 accent-[#BE185D] rounded"
                          />
                          <span className="text-xs sm:text-sm font-medium text-[#3C342E]">
                            Also save this receiver address to my address book for future gifts
                          </span>
                        </label>
                      )}
                    </div>
                  )
                ) : selectedAddress ? (
                  /* RETURNING CUSTOMER — COMPACT "DELIVERING TO" SAVED ADDRESS CARD */
                  <SavedAddressCard
                    address={selectedAddress}
                    serviceability={serviceability}
                    checkingServiceability={checkingServiceability}
                    onChangeAddress={() => {
                      setEditingAddress(null);
                      setDrawerMode('list');
                      setDrawerOpen(true);
                    }}
                    onAddNewAddress={() => {
                      setEditingAddress(null);
                      setMapDraftOverride(null);
                      setDrawerMode('add');
                      setDrawerOpen(true);
                    }}
                    onEditCurrent={() => {
                      setEditingAddress(selectedAddress);
                      setMapDraftOverride(null);
                      setDrawerMode('edit');
                      setDrawerOpen(true);
                    }}
                  />
                ) : (
                  /* FIRST-TIME CUSTOMER — COMPLETE ADDRESS COLLECTION FORM */
                  <div className="rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(30,27,24,0.04)]">
                    <AddressForm
                      initialAddress={mapDraftOverride}
                      defaultFullName={user?.name || ''}
                      defaultPhone={user?.phone || ''}
                      defaultEmail={user?.email || ''}
                      isFirstAddress={savedAddresses.length === 0}
                      submitLabel="SAVE ADDRESS & CONTINUE"
                      isSubmitting={isSavingAddress}
                      onSubmit={handleCreateAddress}
                      onOpenMapPicker={() => openMapPicker(false)}
                      mapPinnedLabel={mapDraftOverride?.formattedAddress || null}
                      onClearMapPin={() => setMapDraftOverride(null)}
                      title="Add Your Delivery Address"
                      subtitle="Save your address once — we’ll automatically remember it for all future orders."
                    />
                  </div>
                )}
              </section>

              {/* SECTION 2: DELIVERY DATE & TIME SLOT SELECTION */}
              <section ref={scheduleSectionRef}>
                <DeliveryScheduleCard
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  selectedSlot={selectedTimeSlot}
                  onSelectSlot={setSelectedTimeSlot}
                  backendSlots={serviceability?.slots}
                  isFirstOrderFreeDelivery={deliveryCalculation?.isFirstOrderFreeDelivery}
                  surpriseDelivery={surpriseDelivery}
                  onToggleSurpriseDelivery={setSurpriseDelivery}
                  anonymousGift={anonymousGift}
                  onToggleAnonymousGift={setAnonymousGift}
                  valSettings={valDeliverySettings}
                  estimatedDeliveryText={serviceability?.estimatedDelivery}
                />
              </section>

              {/* SECTION 3: ORDER ITEMS / REDESIGNED CHECKOUT PRODUCT CARDS */}
              <section className="rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,27,24,0.04)] space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#F3ECE5]">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#BE185D]" />
                    <h2 className="font-['Playfair_Display'] text-base sm:text-lg font-semibold text-[#1E1B18]">
                      Your Order Items ({itemCount})
                    </h2>
                  </div>
                  <Link
                    to="/shop"
                    className="text-xs font-semibold text-[#BE185D] hover:underline"
                  >
                    + Add More
                  </Link>
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    const pid = String(item.productId || item._id || item.id);
                    const isWishlisted = wishlistItems.some(
                      (w) =>
                        String(w.id) === pid ||
                        String((w as { productId?: string }).productId || '') === pid
                    );
                    return (
                      <CheckoutItemCard
                        key={item._id || item.id}
                        item={item}
                        isUpdating={cartLoading}
                        isInWishlist={isWishlisted}
                        onUpdateQuantity={handleQuantityChange}
                        onRemove={handleRemoveCartItem}
                        onMoveToWishlist={handleMoveToWishlist}
                      />
                    );
                  })}
                </div>
              </section>

              {/* SECTION 4: GREETING CARD & PERSONAL MESSAGE + DELIVERY INSTRUCTIONS */}
              <section className="rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,27,24,0.04)] space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F5] text-[#BE185D] border border-[#F5CBD8]">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm sm:text-base font-semibold text-[#1E1B18]">
                          Add a Greeting Card & Personal Message
                        </h2>
                        <span className="rounded-full bg-[#EDF3EE] px-2 py-0.5 text-[10px] font-semibold text-[#2E573A]">
                          Complimentary
                        </span>
                      </div>
                      <p className="text-xs text-[#7A7168]">
                        Handwritten on luxury embossed keepsake card stock
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={includeGreetingCard}
                    onCheckedChange={setIncludeGreetingCard}
                    aria-label="Add complimentary greeting card"
                    className="data-[state=checked]:bg-[#BE185D]"
                  />
                </div>

                {includeGreetingCard && (
                  <div className="space-y-3.5 border-t border-[#F3ECE5] pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="card-recipient" className="block text-xs font-semibold text-[#3C342E]">
                          Recipient Name
                        </label>
                        <Input
                          id="card-recipient"
                          placeholder="e.g. Priya"
                          value={cardRecipient}
                          onChange={(e) => setCardRecipient(e.target.value)}
                          className="h-11 rounded-xl border-[#E5DDD5] bg-[#FAF8F5] text-sm focus-visible:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="card-sender" className="block text-xs font-semibold text-[#3C342E]">
                          Sender Name
                        </label>
                        <Input
                          id="card-sender"
                          placeholder="e.g. With love, Aarav"
                          value={cardSender}
                          onChange={(e) => setCardSender(e.target.value)}
                          className="h-11 rounded-xl border-[#E5DDD5] bg-[#FAF8F5] text-sm focus-visible:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="card-message" className="block text-xs font-semibold text-[#3C342E]">
                          Personal Message
                        </label>
                        <span
                          className={cn(
                            'text-xs font-mono tabular-nums',
                            cardMessage.length >= 140 ? 'font-bold text-[#BE185D]' : 'text-[#8A8076]'
                          )}
                        >
                          {cardMessage.length}/150
                        </span>
                      </div>
                      <Textarea
                        id="card-message"
                        maxLength={150}
                        rows={3}
                        placeholder="Write a heartfelt note (e.g. Wishing you the happiest birthday filled with love & blooms!)"
                        value={cardMessage}
                        onChange={(e) => setCardMessage(e.target.value.slice(0, 150))}
                        className="min-h-[86px] rounded-xl border-[#E5DDD5] bg-[#FAF8F5] text-sm resize-none focus-visible:bg-white focus-visible:border-[#BE185D]"
                      />
                    </div>

                    {/* Live Embossed Keepsake Card Preview */}
                    {cardMessage.trim() && (
                      <div className="rounded-2xl border border-[#F3DCE3] bg-gradient-to-br from-[#FFF9FB] via-[#FAF8F5] to-[#FFF4F7] p-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-[#BE185D]">
                          <span className="inline-flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Keepsake Card Preview
                          </span>
                          <span>Included Free</span>
                        </div>
                        {cardRecipient.trim() && (
                          <p className="text-xs font-semibold text-[#3C342E]">
                            Dear {cardRecipient.trim()},
                          </p>
                        )}
                        <p className="font-['Playfair_Display'] text-sm italic leading-relaxed text-[#2E2824]">
                          "{cardMessage.trim()}"
                        </p>
                        {cardSender.trim() && (
                          <p className="text-right text-xs font-semibold text-[#5D544C]">
                            — {cardSender.trim()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Order-Level Delivery Instructions */}
                <div className="border-t border-[#F3ECE5] pt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="order-delivery-notes" className="block text-xs font-semibold text-[#3C342E]">
                      Delivery Partner Instructions <span className="font-normal text-[#8E847A]">(optional)</span>
                    </label>
                    <span className="text-[11px] tabular-nums text-[#8A8076]">
                      {deliveryInstructions.length}/250
                    </span>
                  </div>
                  <Input
                    id="order-delivery-notes"
                    maxLength={250}
                    placeholder="e.g. Call before arriving, leave at reception, ring bell once"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value.slice(0, 250))}
                    className="h-11 rounded-xl border-[#E5DDD5] bg-[#FAF8F5] text-sm focus-visible:bg-white"
                  />
                </div>
              </section>

              {/* SECTION 6: COUPON / PROMO CODE */}
              <section className="rounded-2xl border border-[#EDE5DD] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,27,24,0.04)]">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#BE185D]" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8A8076]">
                    Coupons & Offers
                  </span>
                </div>
                <PromoCodeInput
                  orderAmount={subtotal + totalDeliveryFee}
                  orderItems={items}
                  userId={user?.id}
                  onPromoCodeApplied={handlePromoCodeApplied}
                  onPromoCodeRemoved={handlePromoCodeRemoved}
                  appliedPromoCode={appliedPromoCode}
                  disabled={cartLoading}
                />
              </section>

              {/* Mobile Full Order Price Breakdown Card */}
              <section className="lg:hidden rounded-2xl border border-[#EDE5DD] bg-white p-4 shadow-[0_4px_20px_rgba(30,27,24,0.04)] space-y-3">
                <h2 className="font-['Playfair_Display'] text-base font-semibold text-[#1E1B18]">
                  Price Summary
                </h2>
                <div className="space-y-2">
                  {priceBreakdownLines.map((line, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-[#5D544C]">{line.label}</span>
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          line.isDiscount || line.isFree ? 'text-[#2E573A]' : 'text-[#1E1B18]'
                        )}
                      >
                        {line.isFree ? (
                          <span className="inline-flex items-center gap-1.5">
                            {line.strikeAmount && line.strikeAmount > 0 && (
                              <span className="text-xs font-normal text-[#9A9086] line-through">
                                {formatPrice(convertPrice(line.strikeAmount))}
                              </span>
                            )}
                            <span className="rounded-full bg-[#EDF3EE] px-2 py-0.5 text-[11px] font-bold text-[#2E573A]">
                              FREE
                            </span>
                          </span>
                        ) : line.isDiscount ? (
                          `-${formatPrice(convertPrice(Math.abs(line.amount)))}`
                        ) : (
                          formatPrice(convertPrice(line.amount))
                        )}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-2 bg-[#EFE8E0]" />
                  <div className="flex items-center justify-between text-base font-bold text-[#1E1B18]">
                    <span>Total Payable</span>
                    <span className="tabular-nums">{formatPrice(convertPrice(orderTotal))}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN — STICKY DESKTOP ORDER SUMMARY & PLACE ORDER */}
            <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-[#EDE5DD] bg-white p-6 shadow-[0_12px_36px_-12px_rgba(30,27,24,0.08)] space-y-5">
                <div className="flex items-center justify-between border-b border-[#F3ECE5] pb-3.5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A8076]">
                      Order Summary
                    </span>
                    <h2 className="mt-0.5 font-['Playfair_Display'] text-xl font-semibold text-[#1E1B18]">
                      Price Details
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#FAF8F5] px-3 py-1 text-xs font-semibold text-[#5D544C] border border-[#EDE5DD]">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Price Lines */}
                <div className="space-y-2.5">
                  {priceBreakdownLines.map((line, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-[#5D544C]">{line.label}</span>
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          line.isDiscount || line.isFree ? 'text-[#2E573A]' : 'text-[#1E1B18]'
                        )}
                      >
                        {line.isFree ? (
                          <span className="inline-flex items-center gap-1.5">
                            {line.strikeAmount && line.strikeAmount > 0 && (
                              <span className="text-xs font-normal text-[#9A9086] line-through">
                                {formatPrice(convertPrice(line.strikeAmount))}
                              </span>
                            )}
                            <span className="rounded-full bg-[#EDF3EE] px-2 py-0.5 text-[11px] font-bold text-[#2E573A]">
                              FREE
                            </span>
                          </span>
                        ) : line.isDiscount ? (
                          `-${formatPrice(convertPrice(Math.abs(line.amount)))}`
                        ) : (
                          formatPrice(convertPrice(line.amount))
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-[#EFE8E0]" />

                {/* Final Total */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-base font-bold text-[#1E1B18]">Total Payable</p>
                    <p className="text-[11px] text-[#7A7168]">Inclusive of all taxes</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-[#1E1B18] tabular-nums">
                    {formatPrice(convertPrice(orderTotal))}
                  </p>
                </div>

                {/* Savings Callout */}
                {(itemSavings + promoDiscount > 0 || deliveryCalculation?.isFirstOrderFreeDelivery) && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#CBE0D0] bg-[#F2F8F3] px-3.5 py-2.5 text-xs font-semibold text-[#2E573A]">
                    <Check className="h-4 w-4 shrink-0 text-[#3F6349]" />
                    <span>
                      You’re saving{' '}
                      {formatPrice(
                        convertPrice(
                          itemSavings +
                            promoDiscount +
                            (deliveryCalculation?.isFirstOrderFreeDelivery
                              ? deliveryCalculation.standardFee || 150
                              : 0)
                        )
                      )}{' '}
                      on this order!
                    </span>
                  </div>
                )}

                {/* Primary Place Order Button -> Redirects to Payment Step */}
                <div className="space-y-2.5 pt-1">
                  <Button
                    type="button"
                    disabled={cartLoading || items.length === 0}
                    onClick={handleProceedToPaymentPage}
                    className="h-13 w-full rounded-xl bg-[#BE185D] py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_8px_22px_-8px_rgba(190,24,93,0.55)] transition-all hover:bg-[#9D174D] active:scale-[0.99]"
                  >
                    <span>PLACE ORDER • {formatPrice(convertPrice(orderTotal))}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="text-center text-[11px] text-[#7A7168]">
                    Next step: Choose UPI, Card, Net Banking or Wallet on Payment
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 border-t border-[#F3ECE5] pt-3.5 text-[11px] text-[#7A7168]">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#3F6349]" />
                    Razorpay Verified
                  </span>
                  <span>•</span>
                  <span>Freshly Handcrafted</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM CHECKOUT BAR */}
      {items.length > 0 && (
        <MobileCheckoutBar
          totalAmount={orderTotal}
          ctaLabel="PLACE ORDER"
          isLoading={cartLoading}
          disabled={items.length === 0}
          breakdownLines={priceBreakdownLines}
          onPlaceOrder={handleProceedToPaymentPage}
        />
      )}

      <div className="hidden lg:block">
        <Footer />
      </div>

      <FreeDeliveryCelebrationModal
        isOpen={showFreeDeliveryModal}
        onClose={handleCloseFreeDeliveryModal}
        savedAmount={deliveryCalculation?.standardFee || 150}
      />
    </div>
  );
};

export default CheckoutShippingPage;
