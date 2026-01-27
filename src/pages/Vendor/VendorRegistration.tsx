import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Check } from 'lucide-react';
import { registerVendor, VendorRegistrationData } from '@/services/vendorService';

const VendorRegistration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VendorRegistrationData>({
    storeName: '',
    storeDescription: '',
    storeAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    businessInfo: {
      registrationNumber: '',
      taxId: '',
      businessType: 'individual'
    },
    bankDetails: {
      accountNumber: '',
      routingNumber: '',
      accountHolderName: '',
      bankName: '',
      upiId: ''
    }
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Store Information',
      description: 'Basic details about your store'
    },
    {
      title: 'Address & Contact',
      description: 'Where to find and contact you'
    },
    {
      title: 'Business Details',
      description: 'Legal and business information'
    },
    {
      title: 'Payment Details',
      description: 'How you want to receive payments'
    }
  ];

  const handleInputChange = (section: keyof VendorRegistrationData, field: string, value: string) => {
    setFormData(prev => {
      if (field === '') {
        // Handle top-level fields
        return {
          ...prev,
          [section]: value
        };
      } else {
        // Handle nested fields
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      const response = await registerVendor(formData);
      toast({
        title: "Registration Successful!",
        description: response.message || "Your vendor application has been submitted. You'll receive an email once approved.",
      });
      navigate('/vendor/dashboard');
    } catch (error: any) {
      console.error('Vendor registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.storeName || typeof formData.storeName !== 'string' || !formData.storeName.trim()) {
          toast({
            title: "Store Name Required",
            description: "Please enter your store name",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.storeDescription || typeof formData.storeDescription !== 'string' || !formData.storeDescription.trim()) {
          toast({
            title: "Store Description Required",
            description: "Please enter a description for your store",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 1:
        if (!formData.storeAddress?.street || typeof formData.storeAddress.street !== 'string' || !formData.storeAddress.street.trim()) {
          toast({
            title: "Street Address Required",
            description: "Please enter your street address",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.storeAddress?.city || typeof formData.storeAddress.city !== 'string' || !formData.storeAddress.city.trim()) {
          toast({
            title: "City Required",
            description: "Please enter your city",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.storeAddress?.state || typeof formData.storeAddress.state !== 'string' || !formData.storeAddress.state.trim()) {
          toast({
            title: "State Required",
            description: "Please enter your state",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.storeAddress?.zipCode || typeof formData.storeAddress.zipCode !== 'string' || !formData.storeAddress.zipCode.trim()) {
          toast({
            title: "ZIP Code Required",
            description: "Please enter your ZIP code",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.contactInfo?.phone || typeof formData.contactInfo.phone !== 'string' || !formData.contactInfo.phone.trim()) {
          toast({
            title: "Phone Number Required",
            description: "Please enter your phone number",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.contactInfo?.email || typeof formData.contactInfo.email !== 'string' || !formData.contactInfo.email.trim() || !formData.contactInfo.email.includes('@')) {
          toast({
            title: "Valid Email Required",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 2:
        if (!formData.businessInfo?.businessType) {
          toast({
            title: "Business Type Required",
            description: "Please select your business type",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 3:
        if (!formData.bankDetails?.accountHolderName || typeof formData.bankDetails.accountHolderName !== 'string' || !formData.bankDetails.accountHolderName.trim()) {
          toast({
            title: "Account Holder Name Required",
            description: "Please enter the account holder name",
            variant: "destructive",
          });
          return false;
        }
        if ((!formData.bankDetails?.accountNumber || !formData.bankDetails.accountNumber.trim()) && 
            (!formData.bankDetails?.upiId || !formData.bankDetails.upiId.trim())) {
          toast({
            title: "Payment Details Required",
            description: "Please enter either bank account details or UPI ID",
            variant: "destructive",
          });
          return false;
        }
        return true;

      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', '', e.target.value)}
                placeholder="Enter your store name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store Description *</Label>
              <Textarea
                id="storeDescription"
                value={formData.storeDescription}
                onChange={(e) => handleInputChange('storeDescription', '', e.target.value)}
                placeholder="Describe what your store sells and what makes it special"
                rows={4}
                required
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Store Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.storeAddress.street}
                    onChange={(e) => handleInputChange('storeAddress', 'street', e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.storeAddress.city}
                    onChange={(e) => handleInputChange('storeAddress', 'city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.storeAddress.state}
                    onChange={(e) => handleInputChange('storeAddress', 'state', e.target.value)}
                    placeholder="State"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.storeAddress.zipCode}
                    onChange={(e) => handleInputChange('storeAddress', 'zipCode', e.target.value)}
                    placeholder="ZIP Code"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                    placeholder="store@example.com"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.contactInfo.website}
                    onChange={(e) => handleInputChange('contactInfo', 'website', e.target.value)}
                    placeholder="https://yourstore.com"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select
                value={formData.businessInfo.businessType}
                onValueChange={(value: any) => handleInputChange('businessInfo', 'businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="llc">Limited Liability Company</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Business Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.businessInfo.registrationNumber}
                onChange={(e) => handleInputChange('businessInfo', 'registrationNumber', e.target.value)}
                placeholder="Enter registration number (if applicable)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / GST Number</Label>
              <Input
                id="taxId"
                value={formData.businessInfo.taxId}
                onChange={(e) => handleInputChange('businessInfo', 'taxId', e.target.value)}
                placeholder="Enter GST number (if applicable)"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={(e) => handleInputChange('bankDetails', 'accountHolderName', e.target.value)}
                placeholder="Full name as per bank account"
                required
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Bank Details (Choose one method)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Bank Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => handleInputChange('bankDetails', 'accountNumber', e.target.value)}
                    placeholder="Account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">IFSC Code</Label>
                  <Input
                    id="routingNumber"
                    value={formData.bankDetails.routingNumber}
                    onChange={(e) => handleInputChange('bankDetails', 'routingNumber', e.target.value)}
                    placeholder="IFSC code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => handleInputChange('bankDetails', 'bankName', e.target.value)}
                    placeholder="Bank name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID (Alternative)</Label>
                  <Input
                    id="upiId"
                    value={formData.bankDetails.upiId}
                    onChange={(e) => handleInputChange('bankDetails', 'upiId', e.target.value)}
                    placeholder="your-upi@bank"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Become a Vendor</h1>
          </div>
          <p className="text-gray-600">Join our marketplace and start selling your products</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${index <= currentStep 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-gray-300 text-gray-500'}`}>
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-2 
                    ${index < currentStep ? 'bg-primary' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep + 1} of {steps.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={currentStep === steps.length - 1 ? handleSubmit : undefined}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>

                {currentStep === steps.length - 1 ? (
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Your application will be reviewed by our team</li>
              <li>• You'll receive an email within 2-3 business days</li>
              <li>• Once approved, you can start adding products and selling</li>
              <li>• Our team will help you get started with best practices</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorRegistration; 