import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { MapPin, Edit, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import PinCodeInput from '@/components/ui/PinCodeInput';
import { getUserProfile, updateUserProfile, SavedAddress } from '@/services/authService';

type Address = SavedAddress;

const AddressManager: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [isPinCodeValid, setIsPinCodeValid] = useState(true);
  const [formData, setFormData] = useState<Partial<Address>>({
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
    deliveryOption: 'self'
  });

  useEffect(() => {
    loadAddresses();
  }, [user]);

  useEffect(() => {
    if (currentAddress) {
      setFormData({
        ...currentAddress
      });
    } else {
      setFormData({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        address: '',
        apartment: '',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '',
        phone: '',
        email: user?.email || '',
        notes: '',
        deliveryOption: 'self'
      });
    }
  }, [currentAddress, user]);

  const loadAddresses = async () => {
    if (!user?.id) {
      setAddresses([]);
      return;
    }

    try {
      const profile = await getUserProfile();
      setAddresses(profile.addresses || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your saved addresses"
      });
    }
  };

  const persistAddresses = async (updatedAddresses: Address[], successTitle: string, successDescription: string) => {
    const updatedProfile = await updateUserProfile({ addresses: updatedAddresses });
    setAddresses(updatedProfile.addresses || updatedAddresses);

    toast({
      title: successTitle,
      description: successDescription,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleZipCodeChange = (value: string) => {
    setFormData(prev => ({ ...prev, zipCode: value }));
  };

  const handlePinCodeValidation = (isValid: boolean) => {
    setIsPinCodeValid(isValid);
  };

  const handleSaveAddress = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to save addresses"
      });
      return;
    }

    if (!isPinCodeValid) {
      toast({
        variant: "destructive",
        title: "Invalid PIN Code",
        description: "Please enter a valid PIN code for delivery"
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city 
        || !formData.state || !formData.zipCode || !formData.phone) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill all required fields"
      });
      return;
    }

    try {
      const normalizedAddress: Address = {
        id: currentAddress?.id || Date.now().toString(),
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        address: formData.address || '',
        apartment: formData.apartment || '',
        city: formData.city || '',
        state: formData.state || '',
        zipCode: formData.zipCode || '',
        phone: formData.phone || '',
        email: formData.email || '',
        notes: formData.notes || '',
        deliveryOption: formData.deliveryOption || 'self',
        isDefault: currentAddress?.isDefault || false,
        giftMessage: formData.giftMessage || '',
        receiverFirstName: formData.receiverFirstName || '',
        receiverLastName: formData.receiverLastName || '',
        receiverEmail: formData.receiverEmail || '',
        receiverPhone: formData.receiverPhone || '',
        receiverAddress: formData.receiverAddress || '',
        receiverApartment: formData.receiverApartment || '',
        receiverCity: formData.receiverCity || '',
        receiverState: formData.receiverState || '',
        receiverZipCode: formData.receiverZipCode || '',
      };
      
      if (currentAddress) {
        const updatedAddresses = addresses.map((addr: Address) =>
          addr.id === currentAddress.id ? normalizedAddress : addr
        );

        await persistAddresses(
          updatedAddresses,
          "Address Updated",
          "Your address has been updated successfully"
        );
      } else {
        const updatedAddresses = [
          ...addresses,
          {
            ...normalizedAddress,
            isDefault: addresses.length === 0,
          },
        ];

        await persistAddresses(
          updatedAddresses,
          "Address Saved",
          "Your address has been saved successfully"
        );
      }
      
      // Reset form and refresh addresses
      setCurrentAddress(null);
      setShowAddressForm(false);
      
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save address. Please try again."
      });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const updatedAddresses = addresses.filter((addr: Address) => addr.id !== id);
      await persistAddresses(
        updatedAddresses,
        "Address Deleted",
        "The address has been deleted successfully"
      );
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete address. Please try again."
      });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const updatedAddresses = addresses.map((addr: Address) => ({
        ...addr,
        isDefault: addr.id === id
      }));

      await persistAddresses(
        updatedAddresses,
        "Default Address Set",
        "Your default address has been updated"
      );
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set default address. Please try again."
      });
    }
  };

  const handleEditAddress = (address: Address) => {
    setCurrentAddress(address);
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setCurrentAddress(null);
  };

  const renderAddressFormFields = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input 
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input 
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input 
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apartment">Apartment/Suite (Optional)</Label>
        <Input 
          id="apartment"
          name="apartment"
          value={formData.apartment || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input 
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={handleInputChange}
            required
            disabled
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input 
            id="state"
            name="state"
            value={formData.state || ''}
            onChange={handleInputChange}
            required
            disabled
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip Code *</Label>
          <PinCodeInput
            value={formData.zipCode || ''}
            onChange={handleZipCodeChange}
            placeholder="Enter PIN code"
            required
            onValidationChange={handlePinCodeValidation}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input 
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Delivery Notes (Optional)</Label>
        <Input 
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderAddressDropdownPanel = () => (
    <div className="rounded-2xl border border-sky-100 bg-white shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => {
          if (showAddressForm) {
            closeAddressForm();
          } else {
            setCurrentAddress(null);
            setShowAddressForm(true);
          }
        }}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left border-b border-sky-100"
      >
        <div>
          <h4 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-pink-500">
            {currentAddress ? 'Edit Address' : 'Add New Address'}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {currentAddress ? 'Update your address information.' : 'Add a new delivery address to your account.'}
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-sky-500 transition-transform duration-200 ${showAddressForm ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${showAddressForm ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 sm:px-5">
          {renderAddressFormFields()}

          <div className="flex flex-col sm:flex-row gap-2 border-t border-sky-100 pt-4 pb-5">
            <Button variant="outline" onClick={closeAddressForm} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} className="w-full sm:w-auto">
              {currentAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Saved Addresses</h3>
          <p className="text-muted-foreground mb-4">You don't have any saved addresses yet.</p>
          <Button
            onClick={() => {
              setCurrentAddress(null);
              setShowAddressForm(true);
            }}
          >
            Add New Address
          </Button>
          <div className="mt-6 text-left">{renderAddressDropdownPanel()}</div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Addresses</h3>
            <Button 
              onClick={() => {
                setCurrentAddress(null);
                setShowAddressForm(true);
              }}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" /> Add New Address
            </Button>
          </div>

          {renderAddressDropdownPanel()}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(address => (
              <Card key={address.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {address.firstName} {address.lastName}
                        </h4>
                        {address.isDefault && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                        {address.deliveryOption === 'gift' && (
                          <Badge variant="secondary" className="text-xs">Gift Address</Badge>
                        )}
                      </div>
                      <p className="text-sm">{address.address}</p>
                      {address.apartment && <p className="text-sm">{address.apartment}</p>}
                      <p className="text-sm">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-sm">{address.phone}</p>
                      
                      {address.deliveryOption === 'gift' && (
                        <div className="mt-2 pt-2 border-t border-dashed">
                          <p className="text-sm font-medium">Recipient:</p>
                          <p className="text-sm">
                            {address.receiverFirstName} {address.receiverLastName}
                          </p>
                          <p className="text-sm">{address.receiverAddress}</p>
                          {address.receiverApartment && <p className="text-sm">{address.receiverApartment}</p>}
                          <p className="text-sm">
                            {address.receiverCity}, {address.receiverState} {address.receiverZipCode}
                          </p>
                          <p className="text-sm">{address.receiverPhone}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {!address.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleSetDefaultAddress(address.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AddressManager; 