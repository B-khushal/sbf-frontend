import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Truck, ArrowRight, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import MessageCard from '@/components/MessageCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useCart from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Make sure these are imported
import { Info } from 'lucide-react';
import api from '@/services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const CheckoutShippingPage = () => {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const { toast } = useToast();
  
  const [deliveryOption, setDeliveryOption] = useState<'self' | 'gift'>('self');
  const [giftMessage, setGiftMessage] = useState('');
  const { formatPrice, convertPrice } = useCurrency();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

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
  
  // Calculate midnight delivery fee
  const midnightDeliveryFee = 100.00; // ₹100
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
    setShowSavedAddresses(false);
    
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
    
    // Validate based on delivery option
    if (deliveryOption === 'self') {
      if (!formData.firstName || !formData.lastName || !formData.address || 
          !formData.city || !formData.state || !formData.zipCode || 
          !formData.phone) {
        toast({
          title: "Missing information",
          description: "Please fill out all required fields",
          variant: "destructive"
        });
        return;
      }
    } else {
      // For gift option, validate both sender and receiver
      if (!formData.firstName || !formData.lastName || !formData.phone ||
          !formData.receiverFirstName || !formData.receiverLastName || !formData.receiverAddress ||
          !formData.receiverCity || !formData.receiverState || !formData.receiverZipCode ||
          !formData.receiverPhone) {
        toast({
          title: "Missing information",
          description: "Please fill out all required fields for both sender and recipient",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Store shipping info in localStorage for the payment page
    const shippingData = {
      ...formData,
      timeSlot: selectedTimeSlot,
      deliveryOption,
      giftMessage: deliveryOption === 'gift' ? giftMessage : '',
      selectedDate,
      deliveryFee: hasMidnightFee ? midnightDeliveryFee : 0
    };

    try {
      console.log('Saving shipping data:', shippingData); // Debug log
      localStorage.setItem('shippingInfo', JSON.stringify(shippingData));
      
      // Save shipping information if checkbox is checked
      if (formData.saveInfo) {
        const savedAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        // Get user from local storage if available
        const userString = localStorage.getItem('user');
        let userId = undefined;
        
        if (userString) {
          try {
            const user = JSON.parse(userString);
            userId = user.id;
          } catch (e) {
            console.error('Error parsing user from localStorage', e);
          }
        }
        
        const newAddress = {
          ...formData,
          deliveryOption,
          giftMessage: deliveryOption === 'gift' ? giftMessage : '',
          id: Date.now().toString(),
          ...(userId && { userId }) // Add userId if available
        };
        
        // Check if this address already exists
        const existingIndex = savedAddresses.findIndex((addr: any) => 
          addr.deliveryOption === deliveryOption &&
          addr.firstName === formData.firstName &&
          addr.lastName === formData.lastName &&
          addr.address === formData.address &&
          addr.city === formData.city &&
          addr.state === formData.state &&
          addr.zipCode === formData.zipCode
        );

        if (existingIndex === -1) {
          savedAddresses.push(newAddress);
          localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
          toast({
            title: "Success",
            description: "Shipping information saved for future use.",
          });
        }
      }
      
      // Navigate to payment
      navigate('/checkout/payment');
    } catch (error: any) {
      console.error('Error saving shipping info:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save shipping information",
        variant: "destructive",
      });
    }
  };
  
  // Add a function to delete a saved address
  const handleDeleteAddress = (addressId: string) => {
    try {
      // Get saved addresses from localStorage
      const savedAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
      
      // Filter out the address to delete
      const updatedAddresses = savedAddresses.filter((addr: any) => addr.id !== addressId);
      
      // Save back to localStorage
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      
      // Update state
      setSavedAddresses(updatedAddresses);
      
      toast({
        title: "Address deleted",
        description: "The saved address has been removed",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete the address",
        variant: "destructive",
      });
    }
  };

  // Handler for time slot selection
  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
    // Update shipping method based on time slot
    if (slotId === 'midnight') {
      setShippingMethod('midnight');
    } else {
      setShippingMethod('standard');
    }
  };

  // Add a function to navigate to profile page
  const navigateToProfile = () => {
    navigate('/profile');
  };

  // If cart is empty, redirect to cart page
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartItemCount={items.length} />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
           {/* Alert for Delivery Info */}
           <Alert className="mb-8 border-yellow-400 bg-yellow-50 text-yellow-800">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Currently, we only deliver to Hyderabad, Telangana. We're working on expanding our delivery network soon!
            </AlertDescription>
          </Alert>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Checkout</h1>

            {/* Checkout Steps */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  <Check size={14} />
                </div>
                <span className="ml-2 font-medium">Cart</span>
              </div>
              
              <div className="h-px w-8 bg-primary" />
              
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  <Truck size={14} />
                </div>
                <span className="ml-2 font-medium">Shipping</span>
              </div>
              
              <div className="h-px w-8 bg-muted" />
              
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm">
                  3
                </div>
                <span className="ml-2 text-muted-foreground">Payment</span>
              </div>
              
              <div className="h-px w-8 bg-muted" />
              
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm">
                  4
                </div>
                <span className="ml-2 text-muted-foreground">Confirmation</span>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardContent className="p-6">
                    {/* Notification about saved addresses - replace with link to profile */}
                    {savedAddresses.length > 0 && (
                      <Alert className="mb-6 border-primary/20 bg-primary/5">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertDescription className="flex justify-between items-center">
                          <span>You have {savedAddresses.length} saved address{savedAddresses.length > 1 ? 'es' : ''}.</span>
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setShowSavedAddresses(true)}
                          >
                            Use Saved Address
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Saved Addresses Dialog */}
                    {showSavedAddresses && (
                      <Dialog open={showSavedAddresses} onOpenChange={setShowSavedAddresses}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Select a Saved Address</DialogTitle>
                            <DialogDescription>
                              Choose from your saved addresses to use for this order.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-80 overflow-y-auto space-y-4 py-4">
                            {savedAddresses.map((address: any) => (
                              <Card key={address.id} className="cursor-pointer hover:border-primary" onClick={() => {
                                handleSavedAddressSelect(address);
                                setShowSavedAddresses(false);
                              }}>
                                <CardContent className="p-4">
                                  <div className="flex flex-col">
                                    <div className="font-medium">
                                      {address.firstName} {address.lastName}
                                      {address.deliveryOption === 'gift' && ` → ${address.receiverFirstName} ${address.receiverLastName}`}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
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
                                    <div className="text-xs text-primary mt-1">
                                      {address.deliveryOption === 'gift' ? 'Gift' : 'Self Delivery'}
                                      {address.isDefault && ' • Default'}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowSavedAddresses(false)}>
                              Cancel
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {/* Delivery Options */}
                    <div className="mb-6">
                      <Tabs defaultValue="self" onValueChange={(value) => setDeliveryOption(value as 'self' | 'gift')}>
                        <TabsList className="grid grid-cols-2 mb-4">
                          <TabsTrigger value="self">Delivery for myself</TabsTrigger>
                          <TabsTrigger value="gift">Send as a gift</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="self">
                          <p className="text-sm text-muted-foreground mb-4">
                            Enter your shipping details below.
                          </p>
                        </TabsContent>
                        
                        <TabsContent value="gift">
                          <p className="text-sm text-muted-foreground mb-4">
                            Send this order as a gift to someone else. You'll need to provide both your information and the recipient's.
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    {/* Sender Information */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <User size={18} className="text-primary" />
                        <h2 className="text-lg font-medium">
                          {deliveryOption === 'self' ? 'Your Information' : 'Sender Information'}
                        </h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                              First Name *
                            </label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                              Last Name *
                            </label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1">
                              Phone *
                            </label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                              Email (optional)
                            </label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        {deliveryOption === 'self' && (
                          <>
                            <div>
                              <label htmlFor="address" className="block text-sm font-medium mb-1">
                                Address *
                              </label>
                              <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="apartment" className="block text-sm font-medium mb-1">
                                Apartment, suite, etc. (optional)
                              </label>
                              <Input
                                id="apartment"
                                name="apartment"
                                value={formData.apartment}
                                onChange={handleInputChange}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label htmlFor="city" className="block text-sm font-medium mb-1">
                                  City *
                                </label>
                                <Input
                                  id="city"
                                  name="city"
                                  value={formData.city} disabled
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="state" className="block text-sm font-medium mb-1">
                                  State/Province *
                                </label>
                                <Input
                                  id="state"
                                  name="state"
                                  value={formData.state} disabled
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                                  Zip/Postal Code *
                                </label>
                                <Input
                                  id="zipCode"
                                  name="zipCode"
                                  value={formData.zipCode}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                                Delivery Notes (optional)
                              </label>
                              <Textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Add any special instructions or notes for delivery"
                                className="resize-none"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Recipient Information (for gift option) */}
                    {deliveryOption === 'gift' && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin size={18} className="text-primary" />
                          <h2 className="text-lg font-medium">Recipient Information</h2>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="receiverFirstName" className="block text-sm font-medium mb-1">
                                First Name *
                              </label>
                              <Input
                                id="receiverFirstName"
                                name="receiverFirstName"
                                value={formData.receiverFirstName}
                                onChange={handleInputChange}
                                required={deliveryOption === 'gift'}
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="receiverLastName" className="block text-sm font-medium mb-1">
                                Last Name *
                              </label>
                              <Input
                                id="receiverLastName"
                                name="receiverLastName"
                                value={formData.receiverLastName}
                                onChange={handleInputChange}
                                required={deliveryOption === 'gift'}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="receiverAddress" className="block text-sm font-medium mb-1">
                              Address *
                            </label>
                            <Input
                              id="receiverAddress"
                              name="receiverAddress"
                              value={formData.receiverAddress}
                              onChange={handleInputChange}
                              required={deliveryOption === 'gift'}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="receiverApartment" className="block text-sm font-medium mb-1">
                              Apartment, suite, etc. (optional)
                            </label>
                            <Input
                              id="receiverApartment"
                              name="receiverApartment"
                              value={formData.receiverApartment}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label htmlFor="receiverCity" className="block text-sm font-medium mb-1">
                                City *
                              </label>
                              <Input
                                id="receiverCity"
                                name="receiverCity"
                                value={formData.receiverCity}disabled
                                onChange={handleInputChange}
                                required={deliveryOption === 'gift'}
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="receiverState" className="block text-sm font-medium mb-1">
                                State/Province *
                              </label>
                              <Input
                                id="receiverState"
                                name="receiverState"
                                value={formData.receiverState}disabled
                                onChange={handleInputChange}
                                required={deliveryOption === 'gift'}
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="receiverZipCode" className="block text-sm font-medium mb-1">
                                Zip/Postal Code *
                              </label>
                              <Input
                                id="receiverZipCode"
                                name="receiverZipCode"
                                value={formData.receiverZipCode}
                                onChange={handleInputChange}
                                required={deliveryOption === 'gift'}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="receiverPhone" className="block text-sm font-medium mb-1">
                                Phone *
                              </label>
                              <Input
                                id="receiverPhone"
                                name="receiverPhone"
                                type="tel"
                                value={formData.receiverPhone}
                                onChange={handleInputChange}
                                required={deliveryOption === 'gift'}
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="receiverEmail" className="block text-sm font-medium mb-1">
                                Email (optional)
                              </label>
                              <Input
                                id="receiverEmail"
                                name="receiverEmail"
                                type="email"
                                value={formData.receiverEmail}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          
                          {/* Gift Message Card */}
                          <MessageCard 
                            message={giftMessage}
                            onChange={setGiftMessage}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Time Slot Selector */}
                    <div className="mt-6">
                      <TimeSlotSelector
                        selectedSlot={selectedTimeSlot}
                        onSelectSlot={handleTimeSlotSelect}
                        onSelectDate={setSelectedDate}
                        selectedDate={selectedDate}
                      />
                    </div>
                    
                    {/* Save Information Checkbox */}
                    <div className="mt-6 flex items-center space-x-2">
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
                  </CardContent>
                  
                  <CardFooter className="px-6 py-4 flex justify-between items-center border-t">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => navigate('/cart')}
                    >
                      Back to Cart
                    </Button>
                    
                    <Button type="submit" className="gap-2">
                      Continue to Payment
                      <ArrowRight size={16} />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            <div className="md:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                  
                 {/* Display items */}
<div className="space-y-4 max-h-80 overflow-y-auto mb-4">
  {items.map((item) => {
    const imageUrl = item.image?.startsWith("/")
                      ? item.image
      : item.image;

    return (
      <div key={item.id} className="flex items-center gap-3">
        <div className="h-16 w-16 bg-secondary/20 rounded-md relative overflow-hidden flex-shrink-0">
          <img 
            src={imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 right-0 h-5 w-5 bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center rounded-full -mt-1 -mr-1">
            {item.quantity}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{item.title}</h4>
          <div className="text-muted-foreground text-xs">
            {formatPrice(convertPrice(item.price))} × {item.quantity}
          </div>
        </div>
        <div className="text-sm font-medium">
          {formatPrice(convertPrice(item.price * item.quantity))}
        </div>
      </div>
    );
  })}
</div>

                  
                  {/* Order totals */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(convertPrice(subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>
                        {hasMidnightFee ? formatPrice(convertPrice(midnightDeliveryFee)) : 'Free'}
                      </span>                    
                    </div>
                    {appliedPromoCode && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promo code ({appliedPromoCode.code})</span>
                        <span>-{formatPrice(convertPrice(appliedPromoCode.discount))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t mt-2">
                      <span>Total</span>
                      <span>
                        {formatPrice(convertPrice(orderTotal))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutShippingPage;