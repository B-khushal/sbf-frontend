import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Truck, ArrowRight, User, MapPin, Package, ChevronDown, ChevronUp, Info, Clock, Gift, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import MessageCard from '@/components/MessageCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useCart, { useCartSelectors } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useValentine } from '@/contexts/ValentineContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PinCodeInput, { type PinCodeSelection, SERVICEABLE_PINCODES } from '@/components/ui/PinCodeInput';
import { LocationPicker } from '@/components/location/LocationPicker';
import { LocationPreview } from '@/components/location/LocationPreview';
import { MapplsLocation } from '@/types/location';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getUserProfile, updateUserProfile, SavedAddress } from '@/services/authService';
import { calculateDeliveryFee } from '@/services/orderService';
import api from '@/services/api';
import FreeDeliveryCelebrationModal from '@/components/ui/FreeDeliveryCelebrationModal';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
};

const inputClassName = 'h-12 rounded-xl border-slate-300 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500';
const sectionCardClassName = 'space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm sm:p-5';
const mobileActionButtonClassName = 'h-12 min-h-[48px] rounded-xl text-sm font-semibold shadow-sm';

const CheckoutShippingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items } = useCart();
  const { subtotal } = useCartSelectors();
  const { toast } = useToast();
  const { isValentineEnabled } = useValentine();
  
  const [deliveryLocation, setDeliveryLocation] = useState<MapplsLocation | null>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.latitude && parsed.longitude && parsed.formattedAddress) {
          return {
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            formattedAddress: parsed.formattedAddress,
            city: parsed.city || 'Hyderabad',
            state: parsed.state || 'Telangana',
            country: parsed.country || 'India',
            pincode: parsed.pincode || parsed.zipCode || '',
            recipientName: parsed.recipientName || '',
            phone: parsed.phone || '',
            houseNo: parsed.houseNo || '',
            apartment: parsed.apartment || '',
            floor: parsed.floor || '',
            landmark: parsed.landmark || '',
            deliveryInstructions: parsed.deliveryInstructions || '',
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isPickingLocation, setIsPickingLocation] = useState(false);

  const handleLocationConfirm = (location: MapplsLocation) => {
    const isServiceable = SERVICEABLE_PINCODES.some(pin => pin.code === location.pincode);
    if (!isServiceable) {
      toast({
        title: "Outside Delivery Area",
        description: `Unfortunately, SBFlorist does not deliver to the selected PIN code (${location.pincode}) in Hyderabad or Secunderabad. Please select a serviceable address.`,
        variant: "destructive"
      });
      return;
    }

    setDeliveryLocation(location);
    setIsPickingLocation(false);

    const names = location.recipientName ? location.recipientName.split(' ') : ['', ''];
    const fName = names[0] || '';
    const lName = names.slice(1).join(' ') || '';

    if (deliveryOption === 'self') {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || fName,
        lastName: prev.lastName || lName,
        phone: prev.phone || location.phone || '',
        address: location.formattedAddress,
        apartment: location.apartment || '',
        zipCode: location.pincode,
        city: location.city,
        state: location.state
      }));
      setSelectedSenderPin({
        code: location.pincode,
        area: location.landmark || '',
        city: location.city,
        state: location.state
      });
      setSenderPinValidation({ isValid: true, message: '' });
    } else {
      setFormData(prev => ({
        ...prev,
        receiverFirstName: fName,
        receiverLastName: lName,
        receiverPhone: location.phone || '',
        receiverAddress: location.formattedAddress,
        receiverApartment: location.apartment || '',
        receiverZipCode: location.pincode,
        receiverCity: location.city,
        receiverState: location.state
      }));
      setSelectedReceiverPin({
        code: location.pincode,
        area: location.landmark || '',
        city: location.city,
        state: location.state
      });
      setReceiverPinValidation({ isValid: true, message: '' });
    }

    toast({
      title: "Delivery Location Set",
      description: "Address has been successfully configured.",
    });
  };

  const hasValentine = items.some(item => item.productType === 'valentine' || item.isValentineProduct);

  const [greetingCard, setGreetingCard] = useState<string>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.greetingCard) return parsed.greetingCard;
      }
      const firstValItem = items.find(item => item.customizations?.greetingCard);
      return firstValItem?.customizations?.greetingCard || 'none';
    } catch {
      return 'none';
    }
  });
  const [surpriseDelivery, setSurpriseDelivery] = useState<boolean>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.surpriseDelivery !== undefined) return !!parsed.surpriseDelivery;
      }
      const firstValItem = items.find(item => item.customizations?.surpriseDelivery !== undefined);
      return !!firstValItem?.customizations?.surpriseDelivery;
    } catch {
      return false;
    }
  });
  const [anonymousGift, setAnonymousGift] = useState<boolean>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.anonymousGift !== undefined) return !!parsed.anonymousGift;
      }
      const firstValItem = items.find(item => item.customizations?.anonymousGift !== undefined);
      return !!firstValItem?.customizations?.anonymousGift;
    } catch {
      return false;
    }
  });
  
  const [deliveryOption, setDeliveryOption] = useState<'self' | 'gift'>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.deliveryOption) return parsed.deliveryOption;
      }
      return hasValentine ? 'gift' : 'self';
    } catch {
      return 'self';
    }
  });

  const [cardMessage, setCardMessage] = useState<string>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.cardMessage) return parsed.cardMessage;
        if (parsed.giftMessage) return parsed.giftMessage;
      }
      const firstValItem = items.find(item => item.customizations?.loveNote);
      return firstValItem?.customizations?.loveNote || '';
    } catch {
      return '';
    }
  });

  const [deliverySpecialInstructions, setDeliverySpecialInstructions] = useState<string>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.deliverySpecialInstructions) return parsed.deliverySpecialInstructions;
        if (parsed.notes) return parsed.notes;
      }
      return '';
    } catch {
      return '';
    }
  });
  
  const { formatPrice, convertPrice } = useCurrency();
  const isMobile = useIsMobile();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isSavedAddressesOpen, setIsSavedAddressesOpen] = useState(false);
  const [showFreeDeliveryModal, setShowFreeDeliveryModal] = useState(false);
  const hasShownFreeDeliveryModal = React.useRef(false);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    try {
      const info = localStorage.getItem('shippingInfo');
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.selectedDate) {
          const date = new Date(parsed.selectedDate);
          if (!isNaN(date.getTime())) return date;
        }
      }
      return new Date();
    } catch {
      return new Date();
    }
  });
  const [formData, setFormData] = useState({
    // Sender details
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '',
    phone: '',
    email: '',
    notes: '',
    saveInfo: false,
    
    // Receiver details (for gift option)
    receiverFirstName: '',
    receiverLastName: '',
    receiverAddress: '',
    receiverApartment: '',
    receiverCity: 'Hyderabad',
    receiverState: 'Telangana',
    receiverZipCode: '',
    receiverPhone: '',
    receiverEmail: '',
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedSenderPin, setSelectedSenderPin] = useState<PinCodeSelection | null>(null);
  const [selectedReceiverPin, setSelectedReceiverPin] = useState<PinCodeSelection | null>(null);
  const [senderPinValidation, setSenderPinValidation] = useState({
    isValid: false,
    message: 'Select a valid delivery pincode to continue.',
  });
  const [receiverPinValidation, setReceiverPinValidation] = useState({
    isValid: false,
    message: 'Select a valid delivery pincode to continue.',
  });
  
  // State for dynamic delivery calculation
  const [deliveryCalculation, setDeliveryCalculation] = useState<{
    deliveryCharge: number;
    isFirstOrderFreeDelivery: boolean;
    standardFee: number;
  } | null>(null);

  // Fetch Valentine delivery settings
  const [valDeliverySettings, setValDeliverySettings] = useState<{
    sameDayEnabled?: boolean; sameDayCharge?: number; sameDayCutoff?: string;
    midnightEnabled?: boolean; midnightCharge?: number; midnightCutoff?: string;
    fixedTimeEnabled?: boolean; fixedTimeCharge?: number;
    surpriseEnabled?: boolean; surpriseCharge?: number;
    anonymousEnabled?: boolean; anonymousCharge?: number;
  }>({});

  useEffect(() => {
    const fetchValSettings = async () => {
      try {
        const res = await api.get('/valentine/settings');
        if (res.data?.delivery) {
          setValDeliverySettings(res.data.delivery);
        }
      } catch (err) {
        console.error('Failed to fetch valentine delivery settings:', err);
      }
    };
    fetchValSettings();
  }, []);

  const midnightCharge = valDeliverySettings.midnightCharge ?? 300;
  const fixedTimeCharge = valDeliverySettings.fixedTimeCharge ?? 150;
  const surpriseCharge = valDeliverySettings.surpriseCharge ?? 100;
  const anonymousCharge = valDeliverySettings.anonymousCharge ?? 0;

  // Fetch dynamic delivery fee
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      try {
        const result = await calculateDeliveryFee({
          subtotal,
          timeSlot: selectedTimeSlot || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined
        });
        setDeliveryCalculation(result);
        if (result?.isFirstOrderFreeDelivery && selectedTimeSlot && !hasShownFreeDeliveryModal.current) {
          hasShownFreeDeliveryModal.current = true;
          setShowFreeDeliveryModal(true);
        }
      } catch (err) {
        console.error('Error fetching delivery calculation:', err);
      }
    };
    fetchDeliveryFee();
  }, [subtotal, selectedTimeSlot, formData.email, formData.phone]);

  const baseSlotFee = selectedTimeSlot === 'midnight' 
    ? midnightCharge 
    : (selectedTimeSlot === 'fixed' || selectedTimeSlot === 'fixed_time' ? fixedTimeCharge : 0);

  const surpriseFee = surpriseDelivery ? surpriseCharge : 0;
  const anonymousFee = anonymousGift ? anonymousCharge : 0;

  const deliveryFee = (deliveryCalculation?.deliveryCharge ?? baseSlotFee) + surpriseFee + anonymousFee;
  const hasMidnightFee = selectedTimeSlot === 'midnight';

  // Check if selected date is valid for Valentine items
  const isDateInvalidForValentine = React.useMemo(() => {
    if (!hasValentine) return false;
    const month = selectedDate.getMonth(); // 1 = Feb
    const dateNum = selectedDate.getDate();
    return !(month === 1 && dateNum >= 8 && dateNum <= 15);
  }, [hasValentine, selectedDate]);

  const isContinueDisabled = isDateInvalidForValentine || !selectedTimeSlot;

  // Load promo code discount from localStorage if available
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
  } | null>(null);

  useEffect(() => {
    const savedPromoCode = localStorage.getItem('appliedPromoCode');
    if (savedPromoCode) {
      try {
        setAppliedPromoCode(JSON.parse(savedPromoCode));
      } catch (error) {
        console.error('Error parsing promo code from localStorage:', error);
      }
    }
  }, []);

  // Calculate total with delivery fee and promo discount
  const promoDiscount = appliedPromoCode ? appliedPromoCode.discount : 0;
  const orderTotal = subtotal + deliveryFee - promoDiscount;
  
  // Load saved addresses on component mount
  useEffect(() => {
    const loadSavedAddresses = async () => {
      try {
        const profile = await getUserProfile();
        setSavedAddresses(profile.addresses || []);
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      }
    };

    loadSavedAddresses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, saveInfo: checked }));
  };

  const handleZipCodeChange = (value: string) => {
    setFormData(prev => ({ ...prev, zipCode: value }));
  };

  const handleReceiverZipCodeChange = (value: string) => {
    setFormData(prev => ({ ...prev, receiverZipCode: value }));
  };

  const handleSenderPinSelect = (selection: PinCodeSelection | null) => {
    setSelectedSenderPin(selection);

    if (selection) {
      setFormData(prev => ({
        ...prev,
        zipCode: selection.code,
        city: selection.city,
        state: selection.state,
      }));
    }
  };

  const handleReceiverPinSelect = (selection: PinCodeSelection | null) => {
    setSelectedReceiverPin(selection);

    if (selection) {
      setFormData(prev => ({
        ...prev,
        receiverZipCode: selection.code,
        receiverCity: selection.city,
        receiverState: selection.state,
      }));
    }
  };

  const handleSenderPinValidation = (isValid: boolean, message?: string) => {
    setSenderPinValidation({
      isValid,
      message: message || (isValid ? '' : 'Select a valid delivery pincode to continue.'),
    });
  };

  const handleReceiverPinValidation = (isValid: boolean, message?: string) => {
    setReceiverPinValidation({
      isValid,
      message: message || (isValid ? '' : 'Select a valid delivery pincode to continue.'),
    });
  };

  const handleSavedAddressSelect = (address: SavedAddress) => {
    const activeOption = (address.deliveryOption as 'self' | 'gift') || 'self';

    const effectiveStreet = (activeOption === 'gift' ? address.receiverAddress : address.address)
      || address.formattedAddress
      || [address.houseNo, address.apartment, address.landmark].filter(Boolean).join(', ');

    const effectiveCity = (activeOption === 'gift' ? address.receiverCity : address.city) || 'Hyderabad';
    const effectiveState = (activeOption === 'gift' ? address.receiverState : address.state) || 'Telangana';
    const effectiveZip = (activeOption === 'gift' ? address.receiverZipCode : address.zipCode) || address.pincode || '';
    const effectivePhone = (activeOption === 'gift' ? (address.receiverPhone || address.phone) : address.phone) || '';
    const effectiveName = activeOption === 'gift'
      ? `${address.receiverFirstName || ''} ${address.receiverLastName || ''}`.trim()
      : `${address.firstName || ''} ${address.lastName || ''}`.trim();

    const fullFormatted = address.formattedAddress || [effectiveStreet, effectiveCity, effectiveState, effectiveZip].filter(Boolean).join(', ');

    // 1. Always restore map/delivery location so delivery location card displays fully
    setDeliveryLocation({
      latitude: address.latitude || 17.3912,
      longitude: address.longitude || 78.4326,
      formattedAddress: fullFormatted,
      city: effectiveCity,
      state: effectiveState,
      country: address.country || 'India',
      pincode: effectiveZip,
      recipientName: effectiveName,
      phone: effectivePhone,
      houseNo: address.houseNo || address.apartment || address.receiverApartment || '',
      apartment: address.apartment || address.receiverApartment || '',
      floor: address.floor || '',
      landmark: address.landmark || '',
      deliveryInstructions: address.deliveryInstructions || address.deliverySpecialInstructions || address.notes || '',
    });

    // 2. Populate manual form data for both self & gift options
    setFormData(prev => ({
      ...prev,
      firstName: address.firstName || prev.firstName || '',
      lastName: address.lastName || prev.lastName || '',
      address: address.address || address.formattedAddress || effectiveStreet || prev.address || '',
      apartment: address.apartment || address.houseNo || prev.apartment || '',
      city: address.city || 'Hyderabad',
      state: address.state || 'Telangana',
      zipCode: address.zipCode || address.pincode || prev.zipCode || '',
      phone: address.phone || prev.phone || '',
      email: address.email || prev.email || '',
      notes: address.notes || address.deliveryInstructions || '',
      
      receiverFirstName: address.receiverFirstName || prev.receiverFirstName || '',
      receiverLastName: address.receiverLastName || prev.receiverLastName || '',
      receiverAddress: address.receiverAddress || address.formattedAddress || effectiveStreet || prev.receiverAddress || '',
      receiverApartment: address.receiverApartment || address.houseNo || prev.receiverApartment || '',
      receiverCity: address.receiverCity || 'Hyderabad',
      receiverState: address.receiverState || 'Telangana',
      receiverZipCode: address.receiverZipCode || address.pincode || prev.receiverZipCode || '',
      receiverPhone: address.receiverPhone || prev.receiverPhone || '',
      receiverEmail: address.receiverEmail || prev.receiverEmail || '',
    }));

    // 3. Update Pincode Validation
    const activeZip = effectiveZip;
      
    if (activeZip) {
      if (activeOption === 'self') {
        setSelectedSenderPin({
          code: activeZip,
          area: address.landmark || '',
          city: effectiveCity,
          state: effectiveState
        });
        setSenderPinValidation({ isValid: true, message: '' });
      } else {
        setSelectedReceiverPin({
          code: activeZip,
          area: address.landmark || '',
          city: effectiveCity,
          state: effectiveState
        });
        setReceiverPinValidation({ isValid: true, message: '' });
      }
    }

    // 4. Restore messages & dropdown state
    setDeliveryOption(activeOption);
    setCardMessage(address.cardMessage || address.giftMessage || '');
    setDeliverySpecialInstructions(address.deliverySpecialInstructions || address.deliveryInstructions || address.notes || '');
    setIsSavedAddressesOpen(false);
    
    toast({
      title: "Saved Address Applied",
      description: `Loaded ${activeOption === 'gift' ? 'Gift' : 'Self'} address for ${address.firstName || 'User'}.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasValentine && isDateInvalidForValentine) {
      toast({
        title: "Invalid Delivery Date",
        description: "Valentine Special products can only be delivered during Valentine's Week (8 Feb - 15 Feb). Please select a date between Feb 8 and Feb 15.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTimeSlot) {
      toast({
        title: "Please select a delivery time",
        description: "You need to select a delivery time slot to continue",
        variant: "destructive"
      });
      return;
    }

    // Validate based on delivery option
    if (deliveryOption === 'self') {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast({
          title: "Missing information",
          description: "Please fill in your name and phone number.",
          variant: "destructive"
        });
        return;
      }
      if (!formData.address || !formData.address.trim()) {
        toast({
          title: "Missing delivery address",
          description: "Please enter your street / delivery address.",
          variant: "destructive"
        });
        return;
      }
      if (!formData.zipCode || !formData.zipCode.trim()) {
        toast({
          title: "Missing pincode",
          description: "Please enter a valid 6-digit delivery pincode.",
          variant: "destructive"
        });
        return;
      }
      const isServiceable = SERVICEABLE_PINCODES.some(pin => pin.code === formData.zipCode.trim());
      if (!isServiceable) {
        toast({
          title: "Outside Delivery Area",
          description: `SBFlorist currently does not deliver to PIN code (${formData.zipCode}). Please enter a serviceable pincode in Hyderabad or Secunderabad.`,
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!formData.firstName || !formData.lastName || !formData.phone ||
          !formData.receiverFirstName || !formData.receiverLastName || 
          !formData.receiverPhone) {
        toast({
          title: "Missing information",
          description: "Please fill in names and phone numbers for both sender and receiver.",
          variant: "destructive"
        });
        return;
      }
      if (!formData.receiverAddress || !formData.receiverAddress.trim()) {
        toast({
          title: "Missing receiver address",
          description: "Please enter receiver's delivery address.",
          variant: "destructive"
        });
        return;
      }
      if (!formData.receiverZipCode || !formData.receiverZipCode.trim()) {
        toast({
          title: "Missing receiver pincode",
          description: "Please enter a valid 6-digit receiver pincode.",
          variant: "destructive"
        });
        return;
      }
      const isServiceable = SERVICEABLE_PINCODES.some(pin => pin.code === formData.receiverZipCode.trim());
      if (!isServiceable) {
        toast({
          title: "Outside Delivery Area",
          description: `SBFlorist currently does not deliver to PIN code (${formData.receiverZipCode}). Please enter a serviceable pincode in Hyderabad or Secunderabad.`,
          variant: "destructive"
        });
        return;
      }
    }

    const activeAddress = deliveryOption === 'self' ? formData.address : formData.receiverAddress;
    const activeApartment = deliveryOption === 'self' ? formData.apartment : formData.receiverApartment;
    const activeCity = deliveryOption === 'self' ? (formData.city || 'Hyderabad') : (formData.receiverCity || 'Hyderabad');
    const activeState = deliveryOption === 'self' ? (formData.state || 'Telangana') : (formData.receiverState || 'Telangana');
    const activeZipCode = deliveryOption === 'self' ? formData.zipCode : formData.receiverZipCode;

    const formattedAddr = deliveryLocation?.formattedAddress || 
      `${activeApartment ? activeApartment + ', ' : ''}${activeAddress}, ${activeCity}, ${activeState} - ${activeZipCode}`.trim();

    // Save shipping information
    const shippingInfo = {
      ...formData,
      timeSlot: selectedTimeSlot,
      deliveryOption,
      deliveryFee,
      isFirstOrderFreeDelivery: deliveryCalculation?.isFirstOrderFreeDelivery ?? false,
      selectedDate: selectedDate.toISOString(),
      cardMessage: cardMessage,
      deliverySpecialInstructions: deliveryLocation?.deliveryInstructions || deliverySpecialInstructions,
      giftMessage: cardMessage, // legacy compatibility
      notes: deliveryLocation?.deliveryInstructions || deliverySpecialInstructions, // legacy compatibility
      greetingCard: hasValentine ? greetingCard : 'none',
      surpriseDelivery: hasValentine ? surpriseDelivery : false,
      anonymousGift: hasValentine ? anonymousGift : false,

      // Location details (use map location if set, otherwise manual address & default Hyderabad coords)
      latitude: deliveryLocation?.latitude || 17.3912,
      longitude: deliveryLocation?.longitude || 78.4326,
      formattedAddress: formattedAddr,
      country: deliveryLocation?.country || 'India',
      pincode: activeZipCode,
      landmark: deliveryLocation?.landmark || '',
      houseNo: deliveryLocation?.houseNo || activeApartment || '',
      floor: deliveryLocation?.floor || '',
      deliveryInstructions: deliveryLocation?.deliveryInstructions || deliverySpecialInstructions,
    };

    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));

    // Save address if requested
    if (formData.saveInfo) {
      try {
        const newAddress: SavedAddress = {
          id: Date.now().toString(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: (deliveryOption === 'self' ? formData.address : formData.receiverAddress) || formattedAddr || '',
          apartment: deliveryOption === 'self' ? formData.apartment : formData.receiverApartment,
          city: deliveryOption === 'self' ? formData.city : formData.receiverCity,
          state: deliveryOption === 'self' ? formData.state : formData.receiverState,
          zipCode: deliveryOption === 'self' ? formData.zipCode : formData.receiverZipCode,
          phone: deliveryOption === 'self' ? formData.phone : formData.receiverPhone,
          email: deliveryOption === 'self' ? formData.email : formData.receiverEmail,
          notes: deliveryLocation?.deliveryInstructions || deliverySpecialInstructions,
          cardMessage: cardMessage,
          deliverySpecialInstructions: deliveryLocation?.deliveryInstructions || deliverySpecialInstructions,
          deliveryOption,
          isDefault: savedAddresses.length === 0,
          giftMessage: cardMessage,
          receiverFirstName: formData.receiverFirstName,
          receiverLastName: formData.receiverLastName,
          receiverEmail: formData.receiverEmail,
          receiverPhone: formData.receiverPhone,
          receiverAddress: formData.receiverAddress || formattedAddr || '',
          receiverApartment: formData.receiverApartment,
          receiverCity: formData.receiverCity,
          receiverState: formData.receiverState,
          receiverZipCode: formData.receiverZipCode,
          
          // Mappls fields
          latitude: deliveryLocation?.latitude || 17.3912,
          longitude: deliveryLocation?.longitude || 78.4326,
          formattedAddress: formattedAddr,
          country: deliveryLocation?.country || 'India',
          pincode: activeZipCode,
          landmark: deliveryLocation?.landmark || '',
          houseNo: deliveryLocation?.houseNo || activeApartment || '',
          floor: deliveryLocation?.floor || '',
          deliveryInstructions: deliveryLocation?.deliveryInstructions || deliverySpecialInstructions,
        };

        const updatedAddresses = [...savedAddresses, newAddress];
        const updatedProfile = await updateUserProfile({ addresses: updatedAddresses });
        setSavedAddresses(updatedProfile.addresses || updatedAddresses);
        
        toast({
          title: "Address saved",
          description: "Your address has been saved for future orders",
        });
      } catch (error) {
        console.error('Error saving address:', error);
      }
    }

    // Navigate to payment page
    navigate('/checkout/payment');
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const updatedAddresses = savedAddresses.filter((addr) => addr.id !== addressId);
      const updatedProfile = await updateUserProfile({ addresses: updatedAddresses });
      setSavedAddresses(updatedProfile.addresses || updatedAddresses);
      
      toast({
        title: "Address deleted",
        description: "The address has been removed from your saved addresses",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
    if (deliveryCalculation?.isFirstOrderFreeDelivery || !user?.id) {
      setShowFreeDeliveryModal(true);
    }
  };

  const handleFieldFocusCapture = (event: React.FocusEvent<HTMLFormElement>) => {
    const target = event.target as HTMLElement;
    const mobileFocusableSelector = 'input, textarea, select, [role="combobox"], [contenteditable="true"]';
    const desktopFocusableSelector = 'input, textarea, button, [role="combobox"]';

    if (target.matches(isMobile ? mobileFocusableSelector : desktopFocusableSelector)) {
      window.setTimeout(() => {
        if (isMobile) {
          const targetTop = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: Math.max(0, targetTop - 100),
            behavior: 'smooth',
          });
          return;
        }

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }, 150);
    }
  };

  const activePinValidation = deliveryOption === 'self' ? senderPinValidation : receiverPinValidation;
  const selectedDeliveryPin = deliveryOption === 'self' ? selectedSenderPin : selectedReceiverPin;

  return (
    <div className={cn(
      "min-h-screen overflow-x-hidden transition-colors duration-500",
      hasValentine 
        ? "bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50" 
        : "bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
    )}>
      <Navigation />

      {isPickingLocation && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-[9999] overflow-y-auto flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl relative shadow-2xl animate-in zoom-in-95 duration-200">
            <LocationPicker
              initialLocation={deliveryLocation || {
                recipientName: deliveryOption === 'self' 
                  ? `${formData.firstName} ${formData.lastName}`.trim()
                  : `${formData.receiverFirstName} ${formData.receiverLastName}`.trim(),
                phone: deliveryOption === 'self' ? formData.phone : formData.receiverPhone
              }}
              deliveryOption={deliveryOption}
              onConfirm={handleLocationConfirm}
              onCancel={() => setIsPickingLocation(false)}
            />
          </div>
        </div>
      )}
      
      <div className="container mx-auto max-w-7xl px-4 py-4 pb-32 sm:px-6 sm:py-6 lg:px-8 lg:py-8 lg:pb-8">
        {/* Progress Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white",
                hasValentine ? "bg-rose-500" : "bg-primary"
              )}>
                1
              </div>
              <span className={cn("ml-2 text-sm font-medium", hasValentine ? "text-rose-600 font-bold" : "text-primary")}>Shipping</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">Payment</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">Confirmation</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid (Order Summary fixed to right on Laptop/PC) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          {/* Left Column - Shipping Form */}
          <div className="mx-auto w-full max-w-md space-y-6 lg:col-span-7 xl:col-span-7 lg:max-w-none">
            {/* Shipping Information */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-visible border-0 bg-white/85 shadow-lg backdrop-blur-sm">
                <CardHeader className="space-y-2 px-4 pb-0 pt-5 sm:px-6">
                  <CardTitle className={cn(
                    "flex items-center gap-2 text-lg font-bold font-['Playfair_Display']",
                    hasValentine ? "text-rose-800" : ""
                  )}>
                    <Truck className={cn("w-5 h-5", hasValentine ? "text-rose-500 animate-bounce" : "text-primary")} />
                    Shipping Information {hasValentine && "❤️"}
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Fill in the delivery details below. On mobile, your pincode search opens in a full-width picker for easier selection.
                  </p>
                </CardHeader>
                <CardContent className="px-4 pb-6 pt-4 sm:px-6">
                  <form
                    id="shipping-form"
                    onSubmit={handleSubmit}
                    noValidate
                    onFocusCapture={handleFieldFocusCapture}
                    className="space-y-4 pb-28 lg:space-y-5 lg:pb-0"
                  >
                    {/* Saved Addresses Dropdown */}
                    {savedAddresses.length > 0 && (
                      <div className={sectionCardClassName}>
                        <div className="flex items-center gap-2">
                          <Home className={cn("h-4 w-4", hasValentine ? "text-rose-500" : "text-primary")} />
                          <span className="text-sm font-medium">Saved Addresses</span>
                          <Badge variant="secondary" className="text-xs">
                            {savedAddresses.length} saved
                          </Badge>
                        </div>
                        
                        <Collapsible open={isSavedAddressesOpen} onOpenChange={setIsSavedAddressesOpen}>
                          <CollapsibleTrigger asChild>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="h-12 w-full justify-between rounded-xl border-slate-300 text-base"
                            >
                              <span>Select a saved address</span>
                              {isSavedAddressesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-2">
                            {savedAddresses.map((address) => (
                              <Card key={address.id} className="cursor-pointer border-slate-200 transition-colors hover:border-primary">
                                <CardContent className="p-3" onClick={() => handleSavedAddressSelect(address)}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">
                                        {address.firstName} {address.lastName}
                                        {address.deliveryOption === 'gift' && (
                                          <span className="text-muted-foreground"> → {address.receiverFirstName} {address.receiverLastName}</span>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {(() => {
                                          const isGift = address.deliveryOption === 'gift';
                                          const street = (isGift ? address.receiverAddress : address.address)
                                            || address.formattedAddress
                                            || [address.houseNo, address.apartment, address.landmark].filter(Boolean).join(', ');
                                          const city = isGift ? address.receiverCity : address.city;
                                          const state = isGift ? address.receiverState : address.state;
                                          const zip = isGift ? (address.receiverZipCode || address.pincode) : (address.zipCode || address.pincode);

                                          return [street, city, state, zip].filter(Boolean).join(', ');
                                        })()}
                                      </div>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                          {address.deliveryOption === 'gift' ? 'Gift' : 'Self Delivery'}
                                        </Badge>
                                        {address.isDefault && (
                                          <Badge variant="secondary" className="text-xs">Default</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAddress(address.id);
                                      }}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                    
                    {/* Delivery Options */}
                    <div className={sectionCardClassName}>
                      <div className="flex items-center gap-2">
                        <Gift className={cn("h-4 w-4", hasValentine ? "text-rose-500" : "text-primary")} />
                        <span className="text-sm font-medium">Delivery Type</span>
                      </div>
                      
                      <Tabs value={deliveryOption} onValueChange={(value) => setDeliveryOption(value as 'self' | 'gift')}>
                        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
                          <TabsTrigger value="self" className="flex min-h-[44px] items-center gap-2 rounded-lg text-sm">
                            <User className="h-4 w-4" />
                            For Myself
                          </TabsTrigger>
                          <TabsTrigger value="gift" className="flex min-h-[44px] items-center gap-2 rounded-lg text-sm">
                            <Gift className="h-4 w-4" />
                            Send as Gift
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="self" className="mt-4">
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                              Enter your shipping details for delivery to your address.
                            </p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="gift" className="mt-4">
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-sm text-purple-700">
                              Send this order as a gift to someone else. You'll need to provide both your information and the recipient's.
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    {/* Sender Information */}
                    <div className={sectionCardClassName}>
                      <div className="flex items-center gap-2">
                        <User size={18} className={hasValentine ? "text-rose-500" : "text-primary"} />
                        <h2 className="text-lg font-medium">
                          {deliveryOption === 'self' ? 'Your Information' : 'Sender Information'}
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="firstName" className="block text-sm font-medium">
                            First Name *
                          </label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter first name"
                            className={inputClassName}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="lastName" className="block text-sm font-medium">
                            Last Name *
                          </label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter last name"
                            className={inputClassName}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="phone" className="block text-sm font-medium">
                            Phone *
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter phone number"
                            className={inputClassName}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-medium">
                            Email (optional)
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email address"
                            className={inputClassName}
                          />
                        </div>
                      </div>
                      
                      {deliveryOption === 'self' && (
                        <div className="space-y-4 pt-3 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                              <Home className="h-4 w-4 text-emerald-600" />
                              Delivery Address
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">Hyderabad Delivery Area</span>
                          </div>

                          {/* Manual Address Input Fields */}
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label htmlFor="apartment" className="block text-sm font-medium">
                                House / Flat No. & Building (optional)
                              </label>
                              <Input
                                id="apartment"
                                name="apartment"
                                value={formData.apartment}
                                onChange={handleInputChange}
                                placeholder="e.g. Flat 302, Sai Heights"
                                className={inputClassName}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="address" className="block text-sm font-medium">
                                Street Address / Area / Locality *
                              </label>
                              <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g. Road No. 12, Banjara Hills"
                                className={inputClassName}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-1">
                              <label htmlFor="zipCode" className="block text-sm font-medium">
                                Pincode *
                              </label>
                              <Input
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                required
                                maxLength={6}
                                placeholder="e.g. 500034"
                                className={inputClassName}
                              />
                            </div>

                            <div className="space-y-2 sm:col-span-1">
                              <label htmlFor="city" className="block text-sm font-medium">
                                City
                              </label>
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                readOnly
                                className={cn(inputClassName, "bg-slate-100/70 cursor-not-allowed")}
                              />
                            </div>

                            <div className="space-y-2 sm:col-span-1">
                              <label htmlFor="state" className="block text-sm font-medium">
                                State
                              </label>
                              <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                readOnly
                                className={cn(inputClassName, "bg-slate-100/70 cursor-not-allowed")}
                              />
                            </div>
                          </div>

                          {/* Optional MapmyIndia Location Picker */}
                          <div className="mt-4 pt-2">
                            {deliveryLocation ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Map Coordinates Pinned
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeliveryLocation(null)}
                                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2"
                                  >
                                    Remove Map Pin
                                  </Button>
                                </div>
                                <LocationPreview
                                  location={deliveryLocation}
                                  onChangeLocation={() => setIsPickingLocation(true)}
                                />
                              </div>
                            ) : (
                              <div className="p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-800">Pin Location on Map (Optional)</h4>
                                    <p className="text-xs text-slate-500">Want to pinpoint exact GPS coordinates on map?</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsPickingLocation(true)}
                                  className="rounded-xl h-10 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-semibold text-xs shrink-0 w-full sm:w-auto"
                                >
                                  Select on Map
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Receiver Information (for gift option) */}
                    {deliveryOption === 'gift' && (
                      <div className={sectionCardClassName}>
                        <div className="flex items-center gap-2">
                          <User size={18} className={hasValentine ? "text-rose-500" : "text-primary"} />
                          <h2 className="text-lg font-medium">Receiver Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label htmlFor="receiverFirstName" className="block text-sm font-medium">
                              First Name *
                            </label>
                            <Input
                              id="receiverFirstName"
                              name="receiverFirstName"
                              value={formData.receiverFirstName}
                              onChange={handleInputChange}
                              required={deliveryOption === 'gift'}
                              placeholder="Enter receiver's first name"
                              className={inputClassName}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="receiverLastName" className="block text-sm font-medium">
                              Last Name *
                            </label>
                            <Input
                              id="receiverLastName"
                              name="receiverLastName"
                              value={formData.receiverLastName}
                              onChange={handleInputChange}
                              required={deliveryOption === 'gift'}
                              placeholder="Enter receiver's last name"
                              className={inputClassName}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label htmlFor="receiverPhone" className="block text-sm font-medium">
                              Phone *
                            </label>
                            <Input
                              id="receiverPhone"
                              name="receiverPhone"
                              type="tel"
                              value={formData.receiverPhone}
                              onChange={handleInputChange}
                              required={deliveryOption === 'gift'}
                              placeholder="Enter receiver's phone"
                              className={inputClassName}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="receiverEmail" className="block text-sm font-medium">
                              Email (optional)
                            </label>
                            <Input
                              id="receiverEmail"
                              name="receiverEmail"
                              type="email"
                              value={formData.receiverEmail}
                              onChange={handleInputChange}
                              placeholder="Enter receiver's email"
                              className={inputClassName}
                            />
                          </div>
                        </div>

                        {/* Receiver Manual Delivery Address */}
                        <div className="space-y-4 pt-3 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                              <Home className="h-4 w-4 text-purple-600" />
                              Receiver's Delivery Address
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">Hyderabad Delivery Area</span>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label htmlFor="receiverApartment" className="block text-sm font-medium">
                                House / Flat No. & Building (optional)
                              </label>
                              <Input
                                id="receiverApartment"
                                name="receiverApartment"
                                value={formData.receiverApartment}
                                onChange={handleInputChange}
                                placeholder="e.g. Villa 14, Palm Meadows"
                                className={inputClassName}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="receiverAddress" className="block text-sm font-medium">
                                Street Address / Area / Locality *
                              </label>
                              <Input
                                id="receiverAddress"
                                name="receiverAddress"
                                value={formData.receiverAddress}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g. Hitec City, Near Cyber Towers"
                                className={inputClassName}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-1">
                              <label htmlFor="receiverZipCode" className="block text-sm font-medium">
                                Pincode *
                              </label>
                              <Input
                                id="receiverZipCode"
                                name="receiverZipCode"
                                value={formData.receiverZipCode}
                                onChange={handleInputChange}
                                required
                                maxLength={6}
                                placeholder="e.g. 500081"
                                className={inputClassName}
                              />
                            </div>

                            <div className="space-y-2 sm:col-span-1">
                              <label htmlFor="receiverCity" className="block text-sm font-medium">
                                City
                              </label>
                              <Input
                                id="receiverCity"
                                name="receiverCity"
                                value={formData.receiverCity}
                                onChange={handleInputChange}
                                readOnly
                                className={cn(inputClassName, "bg-slate-100/70 cursor-not-allowed")}
                              />
                            </div>

                            <div className="space-y-2 sm:col-span-1">
                              <label htmlFor="receiverState" className="block text-sm font-medium">
                                State
                              </label>
                              <Input
                                id="receiverState"
                                name="receiverState"
                                value={formData.receiverState}
                                onChange={handleInputChange}
                                readOnly
                                className={cn(inputClassName, "bg-slate-100/70 cursor-not-allowed")}
                              />
                            </div>
                          </div>

                          {/* Optional Map Location Section for Receiver */}
                          <div className="mt-4 pt-2">
                            {deliveryLocation ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                                    <Check className="h-3.5 w-3.5 text-purple-600" /> Receiver GPS Location Pinned
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeliveryLocation(null)}
                                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2"
                                  >
                                    Remove Map Pin
                                  </Button>
                                </div>
                                <LocationPreview
                                  location={deliveryLocation}
                                  onChangeLocation={() => setIsPickingLocation(true)}
                                />
                              </div>
                            ) : (
                              <div className="p-4 border border-dashed border-slate-300 rounded-2xl bg-purple-50/50 hover:bg-purple-100/50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-800">Pin Receiver Location on Map (Optional)</h4>
                                    <p className="text-xs text-slate-500">Want to pinpoint exact map location for recipient?</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsPickingLocation(true)}
                                  className="rounded-xl h-10 border-purple-500 text-purple-700 hover:bg-purple-50 font-semibold text-xs shrink-0 w-full sm:w-auto"
                                >
                                  Select on Map
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Valentine Upgrades Section */}
                    {hasValentine && (
                      <div className={cn(
                        sectionCardClassName,
                        "border-rose-200 bg-rose-50/50 shadow-sm relative overflow-hidden"
                      )}>
                        {/* Ambient glow inside card */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-400/10 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-rose-500 animate-pulse" />
                          <span className="text-sm font-semibold text-rose-800">❤️ Premium Valentine Gifting Upgrades</span>
                        </div>
                        
                        <div className="space-y-4 mt-2 relative z-10">
                          {/* Greeting Card Selector */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-rose-700">Greeting Card Upgrade</label>
                            <select
                              value={greetingCard}
                              onChange={(e) => setGreetingCard(e.target.value)}
                              className="w-full h-12 bg-white/90 border border-rose-200 rounded-xl px-3 text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-rose-500 focus:outline-none"
                            >
                              <option value="none">No Card</option>
                              <option value="classic-love">Classic Red Love Card (₹49)</option>
                              <option value="floral-romance">Luxury Floral Greeting Card (₹79)</option>
                              <option value="heart-popout">3D Pop-Up Heart Card (₹129)</option>
                            </select>
                          </div>

                          {/* Options Checkboxes */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <label className={cn(
                              "p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs select-none transition-all duration-200 bg-white shadow-sm",
                              surpriseDelivery 
                                ? 'border-rose-400 bg-rose-50/70 text-rose-800 font-semibold' 
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            )}>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 font-bold">
                                  🎁 Surprise Delivery
                                </span>
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                  +{formatPrice(convertPrice(surpriseCharge))}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={surpriseDelivery}
                                onChange={(e) => setSurpriseDelivery(e.target.checked)}
                                className="hidden"
                              />
                              <div className={cn(
                                "w-4 h-4 rounded-md border flex items-center justify-center transition-all ml-2 shrink-0",
                                surpriseDelivery ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300 bg-white'
                              )}>
                                {surpriseDelivery && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </label>

                            <label className={cn(
                              "p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs select-none transition-all duration-200 bg-white shadow-sm",
                              anonymousGift 
                                ? 'border-rose-400 bg-rose-50/70 text-rose-800 font-semibold' 
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            )}>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 font-bold">
                                  🕵️ Anonymous Sender
                                </span>
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  {anonymousCharge > 0 ? `+${formatPrice(convertPrice(anonymousCharge))}` : 'FREE'}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={anonymousGift}
                                onChange={(e) => setAnonymousGift(e.target.checked)}
                                className="hidden"
                              />
                              <div className={cn(
                                "w-4 h-4 rounded-md border flex items-center justify-center transition-all ml-2 shrink-0",
                                anonymousGift ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300 bg-white'
                              )}>
                                {anonymousGift && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Gifting & Delivery Special Options Card */}
                    <div className={sectionCardClassName}>
                      <div className="flex items-center gap-2">
                        <MessageSquare size={18} className={hasValentine ? "text-rose-500" : "text-primary"} />
                        <h2 className="text-lg font-medium">Gifting & Delivery Options</h2>
                      </div>
                      
                      {/* Card Message Textarea */}
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between">
                          <label htmlFor="cardMessage" className="block text-sm font-medium">
                            Card Message (optional)
                          </label>
                          <span className={cn("text-xs", cardMessage.length > 150 ? "text-red-500 font-bold animate-pulse" : "text-slate-500")}>
                            {cardMessage.length}/150
                          </span>
                        </div>
                        <Textarea
                          id="cardMessage"
                          name="cardMessage"
                          value={cardMessage}
                          onChange={(e) => setCardMessage(e.target.value.slice(0, 150))}
                          placeholder="Write a message to be written on the greeting card (e.g., Happy Birthday! Wishing you a great year ahead...)"
                          rows={3}
                          className="min-h-[100px] rounded-xl border-slate-300 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                        />
                        <p className="text-xs text-slate-500">
                          This message will be handwritten and included with your order. (Max 150 characters)
                        </p>
                      </div>

                      {/* Delivery Special Instructions Textarea */}
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between">
                          <label htmlFor="deliverySpecialInstructions" className="block text-sm font-medium">
                            Delivery Special Instructions (optional)
                          </label>
                          <span className={cn("text-xs", deliverySpecialInstructions.length > 250 ? "text-red-500 font-bold animate-pulse" : "text-slate-500")}>
                            {deliverySpecialInstructions.length}/250
                          </span>
                        </div>
                        <Textarea
                          id="deliverySpecialInstructions"
                          name="deliverySpecialInstructions"
                          value={deliverySpecialInstructions}
                          onChange={(e) => setDeliverySpecialInstructions(e.target.value.slice(0, 250))}
                          placeholder="e.g. Ring bell, leave at reception, landmark, contact receiver before delivery..."
                          rows={3}
                          className="min-h-[100px] rounded-xl border-slate-300 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                        />
                        <p className="text-xs text-slate-500">
                          Specific instructions for our delivery partner. (Max 250 characters)
                        </p>
                      </div>
                    </div>

                    {/* Time Slot Selector */}
                    <div className={cn(sectionCardClassName, 'scroll-mb-44')}>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-primary" />
                        <h2 className="text-lg font-medium">Delivery Time</h2>
                      </div>
                      <TimeSlotSelector
                        selectedSlot={selectedTimeSlot}
                        onSelectSlot={handleTimeSlotSelect}
                        onSelectDate={setSelectedDate}
                        selectedDate={selectedDate}
                        surpriseDelivery={surpriseDelivery}
                        onToggleSurpriseDelivery={setSurpriseDelivery}
                        anonymousGift={anonymousGift}
                        onToggleAnonymousGift={setAnonymousGift}
                        valSettings={valDeliverySettings}
                      />
                    </div>
                    
                    {/* Save Information Checkbox */}
                    <div className="flex items-start space-x-3 rounded-2xl border border-slate-200 bg-gray-50 p-4">
                      <Checkbox 
                        id="saveInfo" 
                        checked={formData.saveInfo}
                        onCheckedChange={handleCheckboxChange}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor="saveInfo"
                        className="cursor-pointer text-sm font-medium leading-5"
                      >
                        Save this information for next time
                      </label>
                    </div>
                    
                    {hasValentine && isDateInvalidForValentine && (
                      <Alert variant="destructive" className="mt-4 rounded-xl border-rose-200 bg-rose-50 text-rose-800">
                        <AlertDescription className="flex items-center gap-2 font-medium">
                          <Info className="h-4 w-4 text-rose-600 flex-shrink-0" />
                          Valentine Special products can only be delivered during Valentine's Week (8 Feb - 15 Feb). Please select a valid delivery date.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Form Actions */}
                    <div className="hidden items-center justify-between border-t pt-4 lg:flex">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="h-12 rounded-xl px-5"
                      >
                        Back to Cart
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={isContinueDisabled}
                        className={cn(
                          "h-12 gap-2 rounded-xl px-6",
                          hasValentine 
                            ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md shadow-rose-200" 
                            : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        )}
                      >
                        Continue to Payment
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Right Column - Order Summary (Fixed to right side on Laptop & PC) */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 lg:self-start z-20">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="lg:hidden">
                  <CardTitle 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowOrderSummary(!showOrderSummary)}
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Order Summary
                    </span>
                    {showOrderSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CardTitle>
                </CardHeader>
                
                <div className="hidden lg:block">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                </div>

                <AnimatePresence>
                  <motion.div
                    initial={{ height: showOrderSummary ? 'auto' : 0 }}
                    animate={{ height: showOrderSummary || window.innerWidth >= 1024 ? 'auto' : 0 }}
                    className="lg:!h-auto overflow-hidden"
                  >
                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item._id} className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={item.images && item.images.length > 0 ? item.images[0] : '/api/placeholder/64/64'} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder/64/64';
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-sm font-medium">
                                {formatPrice(convertPrice(item.price * item.quantity))}
                              </div>
                            </div>
                            
                            {/* Customization Details */}
                            {item.customizations && (
                              <div className="ml-15 pl-3 border-l-2 border-purple-200 space-y-1">
                                {item.customizations.number && (
                                  <div className="text-xs text-gray-600">
                                    Number: {item.customizations.number}
                                  </div>
                                )}
                                {item.customizations.messageCard && (
                                  <div className="text-xs text-gray-600">
                                    Message: "{item.customizations.messageCard}"
                                  </div>
                                )}
                                {item.customizations.selectedFlowers && item.customizations.selectedFlowers.length > 0 && (
                                  <div className="text-xs text-pink-600">
                                    🌸 {item.customizations.selectedFlowers.map((f: any) => `${f.name}${(f.quantity || 1) > 1 ? `×${f.quantity || 1}` : ''}`).join(', ')}
                                  </div>
                                )}
                                {item.customizations.selectedChocolates && item.customizations.selectedChocolates.length > 0 && (
                                  <div className="text-xs text-orange-600">
                                    🍫 {item.customizations.selectedChocolates.map((c: any) => `${c.name}${(c.quantity || 1) > 1 ? `×${c.quantity || 1}` : ''}`).join(', ')}
                                  </div>
                                )}
                                {item.customizations.isGiftBundle && item.customizations.giftComponents && (
                                  <div className="text-xs text-rose-600 bg-rose-50/50 border border-rose-100 rounded-lg p-2 space-y-1">
                                    <div className="font-semibold">🎁 Selected items:</div>
                                    {item.customizations.giftComponents.map((comp: any, idx: number) => (
                                      <div key={idx} className="text-[11px] text-gray-600 pl-1.5 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                                        <span className="capitalize font-semibold text-rose-500">{comp.category.replace('_', ' ')}:</span>
                                        <span className="truncate">{comp.name}</span>
                                      </div>
                                    ))}
                                    {item.customizations.customMessage && (
                                      <div className="text-[11px] text-gray-500 italic pl-1.5 pt-0.5 border-t border-rose-100/50">
                                        Card Message: "{item.customizations.customMessage}"
                                      </div>
                                    )}
                                  </div>
                                )}
                                {item.customizations.personalization && (
                                  <div className="text-xs text-slate-700 bg-slate-50/50 border border-slate-200/40 rounded-lg p-2 space-y-1 mt-1.5">
                                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                                      <span>✨ Customization:</span>
                                    </div>
                                    <div className="pl-1 text-slate-600">
                                      <span className="font-medium text-slate-500">{item.customizations.personalization.label || 'Recipient Name'}:</span>{' '}
                                      <span className="font-bold text-slate-800">{item.customizations.personalization.value}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Separator />

                      {/* Order Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{formatPrice(convertPrice(subtotal))}</span>
                        </div>

                         <div className="flex justify-between text-sm">
                          <span>
                            {selectedTimeSlot === 'midnight' ? 'Midnight Delivery Fee' : 'Standard Delivery Fee'}
                          </span>
                          <span className="font-semibold text-right">
                            {deliveryCalculation?.isFirstOrderFreeDelivery ? (
                              <span className="flex items-center gap-1.5 justify-end">
                                <span className="text-gray-400 line-through text-xs">
                                  {formatPrice(convertPrice(deliveryCalculation.standardFee))}
                                </span>
                                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse whitespace-nowrap">
                                  FREE
                                </span>
                              </span>
                            ) : (
                              formatPrice(convertPrice(deliveryFee))
                            )}
                          </span>
                        </div>
                        
                        {appliedPromoCode && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Promo Discount ({appliedPromoCode.code})</span>
                            <span>-{formatPrice(convertPrice(promoDiscount))}</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(convertPrice(orderTotal))}</span>
                        </div>
                      </div>

                      {/* Promo Code Reminder - only show if no promo code applied */}
                      {!appliedPromoCode && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-center gap-2 text-blue-700 text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="font-medium">Have a promo code?</span>
                          </div>
                          <button 
                            onClick={() => navigate('/cart')}
                            className="text-blue-600 text-xs underline mt-1 hover:text-blue-800"
                          >
                            Go to cart to apply it
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                </AnimatePresence>
              </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur lg:hidden">
        <div className="mx-auto w-full max-w-lg px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Order Total</p>
              <p className="text-base font-semibold text-slate-900">{formatPrice(convertPrice(orderTotal))}</p>
            </div>
            <div className="text-right text-xs leading-tight text-slate-500">
              <p>{selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}</p>
              <p>{selectedTimeSlot ? selectedTimeSlot.charAt(0).toUpperCase() + selectedTimeSlot.slice(1) : 'Select slot'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/cart')}
              className={cn(mobileActionButtonClassName, 'border-slate-300 px-3')}
            >
              Back to Cart
            </Button>
            <Button
              type="submit"
              form="shipping-form"
              disabled={isContinueDisabled}
              className={cn(
                mobileActionButtonClassName,
                'px-3 text-white',
                hasValentine 
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-md shadow-rose-200' 
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
              )}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block">
        <Footer />
      </div>

      <FreeDeliveryCelebrationModal
        isOpen={showFreeDeliveryModal}
        onClose={() => setShowFreeDeliveryModal(false)}
        savedAmount={150}
      />
    </div>
  );
};

export default CheckoutShippingPage;
