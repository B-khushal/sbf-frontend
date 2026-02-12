import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getVendorSettings, updateVendorSettings, VendorSettingsData } from '@/services/vendorService';
import { useForm, Controller } from 'react-hook-form';

const VendorSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, reset } = useForm<VendorSettingsData>();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await getVendorSettings();
        reset(settings); // Populate form with fetched data
      } catch (error) {
        toast({
          title: 'Error fetching settings',
          description: 'Could not load your settings. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [reset, toast]);

  const onSubmit = async (data: VendorSettingsData) => {
    try {
        setIsSubmitting(true);
        await updateVendorSettings(data);
        toast({
            title: 'Settings Updated',
            description: 'Your store and payout information has been successfully updated.',
        });
    } catch (error) {
        toast({
            title: 'Update Failed',
            description: 'Could not save your settings. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (loading) {
      return <div className="p-6">Loading settings...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Store Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Store Profile</CardTitle>
                <CardDescription>Update your public store information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Controller
                        name="storeName"
                        control={control}
                        render={({ field }) => <Input id="storeName" {...field} />}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="storeDescription">Store Description</Label>
                    <Controller
                        name="storeDescription"
                        control={control}
                        render={({ field }) => <Textarea id="storeDescription" {...field} />}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How we can reach you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Controller
                        name="contactInfo.email"
                        control={control}
                        render={({ field }) => <Input id="contactEmail" type="email" {...field} />}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Controller
                        name="contactInfo.phone"
                        control={control}
                        render={({ field }) => <Input id="contactPhone" {...field} />}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Payout Information</CardTitle>
                <CardDescription>Details for receiving your earnings. Ensure this is accurate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="bankAccountHolder">Account Holder Name</Label>
                     <Controller
                        name="payoutInfo.bankAccountHolder"
                        control={control}
                        render={({ field }) => <Input id="bankAccountHolder" {...field} />}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                     <Controller
                        name="payoutInfo.bankAccountNumber"
                        control={control}
                        render={({ field }) => <Input id="bankAccountNumber" {...field} />}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bankIfsc">IFSC Code</Label>
                     <Controller
                        name="payoutInfo.bankIfsc"
                        control={control}
                        render={({ field }) => <Input id="bankIfsc" {...field} />}
                    />
                </div>
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorSettings; 