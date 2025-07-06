import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Truck, ArrowRight, User, MapPin, Package, Clock, Gift, Plus, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import MessageCard from '@/components/MessageCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useCart, { useCartSelectors } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import api from '@/services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PinCodeInput from '@/components/ui/PinCodeInput';

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

const CheckoutShippingPage = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { subtotal } = useCartSelectors();
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();
  
  const [deliveryOption, setDeliveryOption] = useState<'self' | 'gift'>('self');
  const [giftMessage, setGiftMessage] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isPinCodeValid, setIsPinCodeValid] = useState(true);
  const [pinCodeValidationMessage, setPinCodeValidationMessage] = useState('');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  
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
  
  // Calculate midnight delivery fee
  const midnightDeliveryFee = 100.00;
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

  const handlePinCodeValidation = (isValid: boolean, message?: string) => {
    setIsPinCodeValid(isValid);
    setPinCodeValidationMessage(message || '');
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
      
      if (address.giftMessage) {
        setGiftMessage(address.giftMessage);
      }
    }
    
    setDeliveryOption(address.deliveryOption);
    setShowSavedAddresses(false);
    
    toast({
      title: "Address loaded",
      description: "Your saved address has been applied",
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
    setSavedAddresses(updatedAddresses);
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    
    toast({
      title: "Address deleted",
      description: "The address has been removed from your saved addresses",
    });
  };

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
    
    if (slotId === 'midnight') {
      toast({
        title: "Midnight Delivery Selected",
        description: `Additional fee of ${formatPrice(midnightDeliveryFee)} will be added`,
      });
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
    
    if (!isPinCodeValid) {
      toast({
        title: "Invalid PIN code",
        description: pinCodeValidationMessage,
        variant: "destructive"
      });
      return;
    }

    // Validate based on delivery option
    if (deliveryOption === 'self') {
      if (!formData.firstName || !formData.lastName || !formData.address || 
          !formData.city || !formData.state || !formData.zipCode || 
          !formData.phone || !formData.email) {
        toast({
          title: "Please fill in all required fields",
          description: "All fields marked with * are required",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!formData.firstName || !formData.lastName || !formData.phone || 
          !formData.email || !formData.receiverFirstName || !formData.receiverLastName || 
          !formData.receiverAddress || !formData.receiverCity || !formData.receiverState || 
          !formData.receiverZipCode || !formData.receiverPhone) {
        toast({
          title: "Please fill in all required fields",
          description: "All fields marked with * are required for both sender and receiver",
          variant: "destructive"
        });
        return;
      }
    }

    // Save address if requested
    if (formData.saveInfo) {
      const addressToSave = {
        id: Date.now().toString(),
        ...formData,
        deliveryOption,
        giftMessage: deliveryOption === 'gift' ? giftMessage : '',
        createdAt: new Date().toISOString()
      };
      
      const updatedAddresses = [...savedAddresses, addressToSave];
      setSavedAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    }

    // Save shipping info to localStorage
    const shippingInfo = {
      ...formData,
      deliveryOption,
      giftMessage: deliveryOption === 'gift' ? giftMessage : '',
      timeSlot: selectedTimeSlot,
      deliveryFee,
      selectedDate: selectedDate.toISOString(),
    };
    
    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
    
    // Navigate to payment page
    navigate('/checkout/payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Option Selection */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5 text-primary" />
                    Delivery Option
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        deliveryOption === 'self' 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="deliveryOption"
                            value="self"
                            checked={deliveryOption === 'self'}
                            onChange={(e) => setDeliveryOption(e.target.value as 'self' | 'gift')}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="font-medium">For Myself</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Deliver to my address</p>
                          </div>
                        </div>
                      </label>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        deliveryOption === 'gift' 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="deliveryOption"
                            value="gift"
                            checked={deliveryOption === 'gift'}
                            onChange={(e) => setDeliveryOption(e.target.value as 'self' | 'gift')}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-primary" />
                              <span className="font-medium">As a Gift</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Send to someone else</p>
                          </div>
                        </div>
                      </label>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                        Saved Addresses
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                      >
                        {showSavedAddresses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <AnimatePresence>
                    {showSavedAddresses && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="space-y-3">
                          {savedAddresses.map((address) => (
                            <div
                              key={address.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {address.firstName} {address.lastName}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {address.deliveryOption === 'self' ? 'Self' : 'Gift'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {address.deliveryOption === 'self' 
                                      ? `${address.address}, ${address.city}, ${address.state} - ${address.zipCode}`
                                      : `To: ${address.receiverFirstName} ${address.receiverLastName}, ${address.receiverAddress}, ${address.receiverCity}`
                                    }
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSavedAddressSelect(address)}
                                  >
                                    Use
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAddress(address.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}

            {/* Address Form */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    {deliveryOption === 'self' ? 'Your Details' : 'Sender & Receiver Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sender Details */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Your Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <Input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full"
                          />
                        </div>
                      </div>

                      {deliveryOption === 'self' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address *
                            </label>
                            <Input
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              required
                              className="w-full"
                              placeholder="Street address"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Apartment, suite, etc. (optional)
                            </label>
                            <Input
                              name="apartment"
                              value={formData.apartment}
                              onChange={handleInputChange}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                              </label>
                              <Input
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                State *
                              </label>
                              <Input
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                PIN Code *
                              </label>
                              <PinCodeInput
                                value={formData.zipCode}
                                onChange={handleZipCodeChange}
                                onValidation={handlePinCodeValidation}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Receiver Details (for gift option) */}
                    {deliveryOption === 'gift' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Receiver Information</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                              </label>
                              <Input
                                name="receiverFirstName"
                                value={formData.receiverFirstName}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                              </label>
                              <Input
                                name="receiverLastName"
                                value={formData.receiverLastName}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                              </label>
                              <Input
                                name="receiverPhone"
                                type="tel"
                                value={formData.receiverPhone}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                              </label>
                              <Input
                                name="receiverEmail"
                                type="email"
                                value={formData.receiverEmail}
                                onChange={handleInputChange}
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address *
                            </label>
                            <Input
                              name="receiverAddress"
                              value={formData.receiverAddress}
                              onChange={handleInputChange}
                              required
                              className="w-full"
                              placeholder="Street address"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Apartment, suite, etc. (optional)
                            </label>
                            <Input
                              name="receiverApartment"
                              value={formData.receiverApartment}
                              onChange={handleInputChange}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                              </label>
                              <Input
                                name="receiverCity"
                                value={formData.receiverCity}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                State *
                              </label>
                              <Input
                                name="receiverState"
                                value={formData.receiverState}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                PIN Code *
                              </label>
                              <PinCodeInput
                                value={formData.receiverZipCode}
                                onChange={handleReceiverZipCodeChange}
                                onValidation={handlePinCodeValidation}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Gift Message */}
                    {deliveryOption === 'gift' && (
                      <>
                        <Separator />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gift Message (optional)
                          </label>
                          <Textarea
                            value={giftMessage}
                            onChange={(e) => setGiftMessage(e.target.value)}
                            placeholder="Add a personal message for the recipient..."
                            className="w-full"
                            rows={3}
                          />
                        </div>
                      </>
                    )}

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions (optional)
                      </label>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special delivery instructions..."
                        className="w-full"
                        rows={2}
                      />
                    </div>

                    {/* Save Address Option */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveInfo"
                        checked={formData.saveInfo}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <label htmlFor="saveInfo" className="text-sm text-gray-700">
                        Save this address for future orders
                      </label>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Time Slot Selection */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-primary" />
                    Delivery Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimeSlotSelector
                    selectedSlot={selectedTimeSlot}
                    onSelectSlot={handleTimeSlotSelect}
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                  />
                  {hasMidnightFee && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Midnight delivery incurs an additional fee of {formatPrice(midnightDeliveryFee)}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Continue Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
                size="lg"
              >
                Continue to Payment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
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
                          <div key={item._id} className="flex items-center space-x-3">
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
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Order Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        
                        {hasMidnightFee && (
                          <div className="flex justify-between text-sm">
                            <span>Midnight Delivery Fee</span>
                            <span>{formatPrice(deliveryFee)}</span>
                          </div>
                        )}
                        
                        {appliedPromoCode && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Promo Discount ({appliedPromoCode.code})</span>
                            <span>-{formatPrice(promoDiscount)}</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(orderTotal)}</span>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                          <Truck className="w-4 h-4" />
                          Delivery Information
                        </div>
                        <p className="text-blue-600 text-xs">
                          Currently delivering to Hyderabad, Telangana only
                        </p>
                      </div>
                    </CardContent>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default CheckoutShippingPage;