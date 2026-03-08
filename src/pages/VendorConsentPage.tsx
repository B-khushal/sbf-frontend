import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Store, User, Mail, Phone, MapPin, Eraser, Check } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

const VendorConsentPage: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const sigCanvas = useRef<SignatureCanvas>(null);

    const [loading, setLoading] = useState(false);
    const [consentAccepted, setConsentAccepted] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        businessName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        website: '',
        instagram: '',
        businessDescription: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const clearSignature = () => {
        sigCanvas.current?.clear();
    };

    const validateForm = () => {
        if (!formData.fullName || !formData.businessName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
            toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'destructive' });
            return false;
        }
        if (!consentAccepted) {
            toast({ title: 'Consent Required', description: 'You must agree to the terms and conditions.', variant: 'destructive' });
            return false;
        }
        if (sigCanvas.current?.isEmpty()) {
            toast({ title: 'Signature Required', description: 'Please provide your digital signature.', variant: 'destructive' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const signatureImage = sigCanvas.current?.getCanvas().toDataURL('image/png');

            const payload = {
                vendorDetails: formData,
                consentAccepted,
                signatureImage
            };

            console.log('📤 Submitting vendor application:');
            console.log('  - vendorDetails:', JSON.stringify(formData, null, 2));
            console.log('  - consentAccepted:', consentAccepted);
            console.log('  - signatureImage length:', signatureImage?.length || 0);
            console.log('  - payload size:', JSON.stringify(payload).length, 'bytes');

            const response = await api.post('/vendors/apply', payload);

            console.log('✅ Application submitted successfully:', response.data);

            toast({
                title: 'Application Submitted',
                description: response.data.message || 'Your application has been received successfully!',
            });

            navigate('/');
        } catch (error: any) {
            console.error('❌ Error submitting vendor application:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                fullError: error
            });
            
            // Log more details about the error
            if (error.response?.data) {
                console.error('Server error details:', error.response.data);
            }
            
            // Get the error message
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
            
            // Special handling for duplicate store name
            if (errorMessage.includes('Store name already exists')) {
                toast({
                    title: '⚠️ Business Name Already Taken',
                    description: `"${formData.businessName}" is already registered. Please choose a unique business name.`,
                    variant: 'destructive',
                    duration: 6000,
                });
            } else {
                toast({
                    title: 'Submission Failed',
                    description: errorMessage,
                    variant: 'destructive',
                    duration: 6000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bloom-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Store className="h-10 w-10 text-primary" />
                        <h1 className="text-4xl font-bold text-gray-900">Vendor Application & Consent</h1>
                    </div>
                    <p className="text-lg text-gray-600">Join Spring Blossoms Florist and start selling your beautiful products.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Agreement Section */}
                    <Card className="mb-8">
                        <CardHeader className="bg-white border-b">
                            <CardTitle className="text-2xl text-primary">Vendor Consent Agreement</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-gray-50">
                            <div className="h-64 overflow-y-auto pr-4 space-y-4 text-sm text-gray-700 bg-white p-4 border rounded-md">
                                <h3 className="font-bold text-base">Vendor Agreement & Terms of Partnership</h3>
                                <p>Welcome to Spring Blossoms Florist. By joining our platform, you agree to the following conditions to ensure a premium experience for all our customers.</p>

                                <h4 className="font-semibold text-gray-900">1. Payment & Commission Terms</h4>
                                <p>Vendors will receive payments for completed orders minus the agreed platform commission rate. Payments are processed according to the monthly schedule. All listed prices must include applicable local taxes.</p>

                                <h4 className="font-semibold text-gray-900">2. Delivery & Quality Standards</h4>
                                <p>All floral arrangements and gifts must be delivered fresh, exactly as depicted in the product images, and within the agreed timeframes. Substandard products or frequent delays may result in account penalties.</p>

                                <h4 className="font-semibold text-gray-900">3. Account Suspension Terms</h4>
                                <p>Spring Blossoms Florist reserves the right to suspend or terminate vendor accounts without prior notice if we detect fraudulent activity, consistent negative reviews, or severe violations of our quality standards.</p>

                                <h4 className="font-semibold text-gray-900">4. Privacy Policy</h4>
                                <p>Vendor business data will be securely stored and only used for order fulfillment and promotional purposes within the Spring Blossoms Florist platform. Vendors must not share or misuse customer personal data for independent marketing.</p>
                            </div>

                            <div className="flex items-center space-x-2 mt-6">
                                <Checkbox
                                    id="consent"
                                    checked={consentAccepted}
                                    onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                                />
                                <Label htmlFor="consent" className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    I have read and agree to all the terms and conditions of the vendor agreement.
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Section */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="pl-10" placeholder="John Doe" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} className="pl-10" placeholder="Doe's Flowers" required />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Must be unique - no other vendor can use this name</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="pl-10" placeholder="contact@doeflowers.com" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="pl-10" placeholder="+91 9876543210" required />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="address" name="address" value={formData.address} onChange={handleInputChange} className="pl-10" placeholder="123 Flower Street" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">ZIP Code <span className="text-red-500">*</span></Label>
                                    <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="400001" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website (Optional)</Label>
                                    <Input id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="instagram">Instagram Handle (Optional)</Label>
                                    <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="@doeflowers" />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="businessDescription">Business Description</Label>
                                    <Textarea id="businessDescription" name="businessDescription" value={formData.businessDescription} onChange={handleInputChange} placeholder="Tell us a little about your floristry business..." rows={3} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Signature Section */}
                    <Card className="mb-8 border-primary">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="text-xl">Digital Signature</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-600 mb-4">Please sign inside the box below to authorize your application and accept the agreement.</p>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white max-w-lg mx-auto mb-4" style={{ touchAction: 'none' }}>
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    penColor="#0f172a"
                                    canvasProps={{
                                        className: "signature-canvas w-full h-40 object-contain",
                                        style: { cursor: 'crosshair', minHeight: '160px' }
                                    }}
                                />
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button type="button" variant="outline" onClick={clearSignature} className="flex items-center gap-2">
                                    <Eraser className="h-4 w-4" /> Clear Signature
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" className="w-full md:w-auto text-lg px-8 py-6" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Submitting Application...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5" /> Submit Vendor Application
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorConsentPage;
