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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import MessageCard from '@/components/MessageCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useCart, { useCartSelectors } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  
  const [deliveryOption, setDeliveryOption] = useState<'self' | 'gift'>('self');
  const [giftMessage, setGiftMessage] = useState('');
  const { formatPrice, convertPrice } = useCurrency();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isSavedAddressesOpen, setIsSavedAddressesOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shippingMethod, setShippingMethod] = useState('standard');
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
  const [isPinCodeValid, setIsPinCodeValid] = useState(true);
  const [pinCodeValidationMessage, setPinCodeValidationMessage] = useState('');
  
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

  const navigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
          {/* Left Column - Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="w-5 h-5 text-primary" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Saved Addresses Dropdown */}
                    {savedAddresses.length > 0 && (
                      <div className="space-y-3">
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
                              className="w-full justify-between"
                            >
                              <span>Select a saved address</span>
                              {isSavedAddressesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-2">
                            {savedAddresses.map((address: any) => (
                              <Card key={address.id} className="cursor-pointer hover:border-primary transition-colors">
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Delivery Type</span>
                      </div>
                      
                      <Tabs defaultValue="self" onValueChange={(value) => setDeliveryOption(value as 'self' | 'gift')}>
                        <TabsList className="grid grid-cols-2 w-full">
                          <TabsTrigger value="self" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            For Myself
                          </TabsTrigger>
                          <TabsTrigger value="gift" className="flex items-center gap-2">
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-primary" />
                        <h2 className="text-lg font-medium">
                          {deliveryOption === 'self' ? 'Your Information' : 'Sender Information'}
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                placeholder="Enter city"
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
                                placeholder="Enter state"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="zipCode" className="block text-sm font-medium">
                                Zip/Postal Code *
                              </label>
                              <PinCodeInput
                                value={formData.zipCode}
                                onChange={handleZipCodeChange}
                                placeholder="Enter PIN code"
                                required
                                onValidationChange={handlePinCodeValidation}
                              />
                            </div>
                          </div>
                          
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
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Receiver Information (for gift option) */}
                    {deliveryOption === 'gift' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-primary" />
                          <h2 className="text-lg font-medium">Receiver Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                              placeholder="Enter city"
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
                              placeholder="Enter state"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="receiverZipCode" className="block text-sm font-medium">
                              Zip/Postal Code *
                            </label>
                            <PinCodeInput
                              value={formData.receiverZipCode}
                              onChange={handleReceiverZipCodeChange}
                              placeholder="Enter PIN code"
                              required={deliveryOption === 'gift'}
                              onValidationChange={handlePinCodeValidation}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="space-y-4">
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
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                      <Checkbox 
                        id="saveInfo" 
                        checked={formData.saveInfo}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <label
                        htmlFor="saveInfo"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Save this information for next time
                      </label>
                    </div>
                    
                    {/* Form Actions */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/cart')}
                      >
                        Back to Cart
                      </Button>
                      
                      <Button type="submit" className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
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
      
      <Footer />
    </div>
  );
};

export default CheckoutShippingPage;