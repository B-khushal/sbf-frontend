import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Truck, ArrowRight, User, MapPin, Package, ChevronDown, ChevronUp, Info, Clock, Gift, Home } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PinCodeInput, { type PinCodeSelection } from '@/components/ui/PinCodeInput';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const inputClassName = 'h-12 rounded-xl border-slate-300 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500';
const sectionCardClassName = 'space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm sm:p-5';
const mobileActionButtonClassName = 'h-14 min-h-[48px] rounded-xl text-base font-semibold shadow-sm';

const CheckoutShippingPage = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { subtotal } = useCartSelectors();
  const { toast } = useToast();
  
  const [deliveryOption, setDeliveryOption] = useState<'self' | 'gift'>('self');
  const [giftMessage, setGiftMessage] = useState('');
  const { formatPrice, convertPrice } = useCurrency();
  const isMobile = useIsMobile();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isSavedAddressesOpen, setIsSavedAddressesOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
  
  // Calculate midnight delivery fee
  const midnightDeliveryFee = 300.00; // ₹300
  const hasMidnightFee = selectedTimeSlot === 'midnight';
  const deliveryFee = hasMidnightFee ? midnightDeliveryFee : 0;

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
    try {
      const addresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
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

  const handleSavedAddressSelect = (address: any) => {
    if (address.deliveryOption === 'self') {
      setFormData({
        ...formData,
        firstName: address.firstName,
        lastName: address.lastName,
        address: address.address,
        apartment: address.apartment || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        phone: address.phone,
        email: address.email,
        notes: address.notes || '',
      });
      setSelectedSenderPin({
        code: address.zipCode,
        area: '',
        city: address.city,
        state: address.state,
      });
      setSenderPinValidation({ isValid: true, message: '' });
    } else {
      setFormData({
        ...formData,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        email: address.email,
        receiverFirstName: address.receiverFirstName,
        receiverLastName: address.receiverLastName,
        receiverAddress: address.receiverAddress,
        receiverApartment: address.receiverApartment || '',
        receiverCity: address.receiverCity,
        receiverState: address.receiverState,
        receiverZipCode: address.receiverZipCode,
        receiverPhone: address.receiverPhone,
        receiverEmail: address.receiverEmail || '',
      });
      setSelectedReceiverPin({
        code: address.receiverZipCode,
        area: '',
        city: address.receiverCity,
        state: address.receiverState,
      });
      setReceiverPinValidation({ isValid: true, message: '' });
      
      if (address.giftMessage) {
        setGiftMessage(address.giftMessage);
      }
    }
    
    // Switch to the correct delivery option if needed
    setDeliveryOption(address.deliveryOption);
    setIsSavedAddressesOpen(false);
    
    toast({
      title: "Address loaded",
      description: "Your saved address has been applied",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
      toast({
        title: "Please select a delivery time",
        description: "You need to select a delivery time slot to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Check PIN code validation first
    if (!activePinValidation.isValid || !selectedDeliveryPin?.code) {
      toast({
        title: "Invalid PIN code",
        description: activePinValidation.message,
        variant: "destructive"
      });
      return;
    }

    // Validate based on delivery option
    if (deliveryOption === 'self') {
      if (!formData.firstName || !formData.lastName || !formData.address || 
          !formData.city || !formData.state || !formData.zipCode || 
          !formData.phone) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!formData.firstName || !formData.lastName || !formData.phone ||
          !formData.receiverFirstName || !formData.receiverLastName || 
          !formData.receiverAddress || !formData.receiverCity || 
          !formData.receiverState || !formData.receiverZipCode || 
          !formData.receiverPhone) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields for both sender and receiver",
          variant: "destructive"
        });
        return;
      }
    }

    // Save shipping information
    const shippingInfo = {
      ...formData,
      timeSlot: selectedTimeSlot,
      deliveryOption,
      deliveryFee,
      selectedDate: selectedDate.toISOString(),
      giftMessage: deliveryOption === 'gift' ? giftMessage : undefined,
    };

    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));

    // Save address if requested
    if (formData.saveInfo) {
      try {
        const existingAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        const newAddress = {
          id: Date.now().toString(),
          ...shippingInfo,
          isDefault: existingAddresses.length === 0
        };
        
        const updatedAddresses = [...existingAddresses, newAddress];
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
        
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

  const handleDeleteAddress = (addressId: string) => {
    try {
      const existingAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
      const updatedAddresses = existingAddresses.filter((addr: any) => addr.id !== addressId);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      setSavedAddresses(updatedAddresses);
      
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
  const isContinueDisabled = !selectedDeliveryPin?.code || !activePinValidation.isValid;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <motion.div 
        className="container mx-auto max-w-6xl px-4 py-4 pb-32 sm:px-6 sm:py-6 lg:px-8 lg:py-8 lg:pb-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Progress Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-primary">Shipping</span>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Shipping Form */}
          <div className="mx-auto w-full max-w-md space-y-6 lg:col-span-2 lg:max-w-none">
            {/* Shipping Information */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-visible border-0 bg-white/85 shadow-lg backdrop-blur-sm">
                <CardHeader className="space-y-2 px-4 pb-0 pt-5 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="w-5 h-5 text-primary" />
                    Shipping Information
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
                    className="space-y-4 pb-40 lg:space-y-5 lg:pb-0"
                  >
                    {/* Saved Addresses Dropdown */}
                    {savedAddresses.length > 0 && (
                      <div className={sectionCardClassName}>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary" />
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
                            {savedAddresses.map((address: any) => (
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
                                        {address.deliveryOption === 'self' 
                                          ? address.address 
                                          : address.receiverAddress}
                                        {', '}
                                        {address.deliveryOption === 'self' 
                                          ? address.city 
                                          : address.receiverCity}
                                        {', '}
                                        {address.deliveryOption === 'self' 
                                          ? address.state 
                                          : address.receiverState}
                                        {' '}
                                        {address.deliveryOption === 'self' 
                                          ? address.zipCode 
                                          : address.receiverZipCode}
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
                        <Gift className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Delivery Type</span>
                      </div>
                      
                      <Tabs defaultValue="self" onValueChange={(value) => setDeliveryOption(value as 'self' | 'gift')}>
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
                        <User size={18} className="text-primary" />
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
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="address" className="block text-sm font-medium">
                              Address *
                            </label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              required
                              placeholder="Enter your address"
                              className={inputClassName}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="apartment" className="block text-sm font-medium">
                              Apartment, suite, etc. (optional)
                            </label>
                            <Input
                              id="apartment"
                              name="apartment"
                              value={formData.apartment}
                              onChange={handleInputChange}
                              placeholder="Apartment, suite, etc."
                              className={inputClassName}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-3">
                              <label htmlFor="zipCode" className="block text-sm font-medium">
                                Delivery PIN Code *
                              </label>
                              <PinCodeInput
                                value={formData.zipCode}
                                onChange={handleZipCodeChange}
                                placeholder="Enter PIN code"
                                required
                                inputClassName={inputClassName}
                                onSelectPinCode={handleSenderPinSelect}
                                onValidationChange={handleSenderPinValidation}
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="city" className="block text-sm font-medium">
                                City *
                              </label>
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                readOnly
                                placeholder="Auto-filled from pincode"
                                className={cn(inputClassName, 'bg-slate-100')}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="state" className="block text-sm font-medium">
                                State/Province *
                              </label>
                              <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                                readOnly
                                placeholder="Auto-filled from pincode"
                                className={cn(inputClassName, 'bg-slate-100')}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="zipCodeDisplay" className="block text-sm font-medium">
                                Selected PIN
                              </label>
                              <Input
                                id="zipCodeDisplay"
                                value={formData.zipCode}
                                readOnly
                                placeholder="Choose a pincode above"
                                className={cn(inputClassName, 'bg-slate-100')}
                              />
                            </div>
                          </div>
                          
                          {!senderPinValidation.isValid && (
                            <Alert className="border-amber-200 bg-amber-50">
                              <AlertDescription className="text-amber-700">
                                {senderPinValidation.message}
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="space-y-2">
                            <label htmlFor="notes" className="block text-sm font-medium">
                              Delivery Notes (optional)
                            </label>
                            <Textarea
                              id="notes"
                              name="notes"
                              value={formData.notes}
                              onChange={handleInputChange}
                              placeholder="Any special instructions for delivery..."
                              rows={3}
                              className="min-h-[112px] rounded-xl border-slate-300 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Receiver Information (for gift option) */}
                    {deliveryOption === 'gift' && (
                      <div className={sectionCardClassName}>
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-primary" />
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
                        
                        <div className="space-y-2">
                          <label htmlFor="receiverAddress" className="block text-sm font-medium">
                            Address *
                          </label>
                          <Input
                            id="receiverAddress"
                            name="receiverAddress"
                            value={formData.receiverAddress}
                            onChange={handleInputChange}
                            required={deliveryOption === 'gift'}
                            placeholder="Enter receiver's address"
                            className={inputClassName}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="receiverApartment" className="block text-sm font-medium">
                            Apartment, suite, etc. (optional)
                          </label>
                          <Input
                            id="receiverApartment"
                            name="receiverApartment"
                            value={formData.receiverApartment}
                            onChange={handleInputChange}
                            placeholder="Apartment, suite, etc."
                            className={inputClassName}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="space-y-2 sm:col-span-3">
                            <label htmlFor="receiverZipCode" className="block text-sm font-medium">
                              Receiver PIN Code *
                            </label>
                            <PinCodeInput
                              value={formData.receiverZipCode}
                              onChange={handleReceiverZipCodeChange}
                              placeholder="Enter PIN code"
                              required={deliveryOption === 'gift'}
                              inputClassName={inputClassName}
                              onSelectPinCode={handleReceiverPinSelect}
                              onValidationChange={handleReceiverPinValidation}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="receiverCity" className="block text-sm font-medium">
                              City *
                            </label>
                            <Input
                              id="receiverCity"
                              name="receiverCity"
                                value={formData.receiverCity}
                                onChange={handleInputChange}
                                required={deliveryOption === 'gift'}
                                readOnly
                                placeholder="Auto-filled from pincode"
                                className={cn(inputClassName, 'bg-slate-100')}
                              />
                            </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="receiverState" className="block text-sm font-medium">
                              State/Province *
                            </label>
                            <Input
                              id="receiverState"
                              name="receiverState"
                                value={formData.receiverState}
                                onChange={handleInputChange}
                                required={deliveryOption === 'gift'}
                                readOnly
                                placeholder="Auto-filled from pincode"
                                className={cn(inputClassName, 'bg-slate-100')}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="receiverZipCodeDisplay" className="block text-sm font-medium">
                                Selected PIN
                              </label>
                              <Input
                                id="receiverZipCodeDisplay"
                                value={formData.receiverZipCode}
                                readOnly
                                placeholder="Choose a pincode above"
                                className={cn(inputClassName, 'bg-slate-100')}
                              />
                            </div>
                          </div>

                          {!receiverPinValidation.isValid && (
                            <Alert className="border-amber-200 bg-amber-50">
                              <AlertDescription className="text-amber-700">
                                {receiverPinValidation.message}
                              </AlertDescription>
                            </Alert>
                          )}
                        
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
                        
                        {/* Gift Message Card */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            Gift Message (optional)
                          </label>
                          <MessageCard 
                            message={giftMessage}
                            onChange={setGiftMessage}
                          />
                        </div>
                      </div>
                    )}
                    
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
                      />
                      {hasMidnightFee && (
                        <Badge variant="secondary" className="mt-2">
                          Midnight Delivery (+₹300)
                        </Badge>
                      )}
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
                        className="h-12 gap-2 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 px-6 hover:from-green-700 hover:to-blue-700"
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
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div variants={itemVariants} className="sticky top-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
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

                        {deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Midnight Delivery Fee</span>
                            <span>{formatPrice(convertPrice(deliveryFee))}</span>
                          </div>
                        )}
                        
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
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-lg lg:hidden">
        <div className="mx-auto w-full max-w-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order Total</p>
                <p className="text-base font-semibold text-slate-900">{formatPrice(convertPrice(orderTotal))}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>{selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}</p>
                <p>{selectedTimeSlot ? selectedTimeSlot.charAt(0).toUpperCase() + selectedTimeSlot.slice(1) : 'Select slot'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate('/cart')}
                className={cn(mobileActionButtonClassName, 'border-slate-300 px-4')}
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                form="shipping-form"
                disabled={isContinueDisabled}
                className={cn(
                  mobileActionButtonClassName,
                  'bg-gradient-to-r from-green-600 to-blue-600 px-4 text-sm text-white hover:from-green-700 hover:to-blue-700'
                )}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default CheckoutShippingPage;
