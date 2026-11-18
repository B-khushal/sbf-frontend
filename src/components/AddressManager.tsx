import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  type AddressInput,
  createAddress,
  deleteAddress,
  getAddressDisplayName,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/services/addressService';
import type { SavedAddress } from '@/services/authService';
import { AddressForm } from '@/components/checkout/AddressForm';
import { cn } from '@/lib/utils';

const AddressManager: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  const loadAddresses = async () => {
    if (!user?.id) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const list = await getAddresses();
      setAddresses(list);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        variant: 'destructive',
        title: 'Unable to load addresses',
        description: 'Please refresh the page to try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user?.id]);

  const handleSave = async (input: AddressInput) => {
    setIsSubmitting(true);
    try {
      if (editingAddress) {
        const res = await updateAddress(editingAddress.id, input);
        setAddresses(res.addresses);
        toast({
          title: 'Address updated',
          description: 'Your delivery address has been saved.',
        });
      } else {
        const res = await createAddress(input);
        setAddresses(res.addresses);
        toast({
          title: 'Address added',
          description: 'Your new delivery address is ready for checkout.',
        });
      }
      setEditingAddress(null);
      setShowForm(false);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({
        variant: 'destructive',
        title: 'Could not save address',
        description: msg || 'Please check the fields and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      const next = await deleteAddress(id);
      setAddresses(next);
      toast({
        title: 'Address removed',
        description: 'The address has been deleted from your account.',
      });
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: msg || 'Please try again.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setBusyId(id);
    try {
      const next = await setDefaultAddress(id);
      setAddresses(next);
      toast({
        title: 'Default address updated',
        description: 'This address will be pre-selected on your next checkout.',
      });
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: msg || 'Please try again.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const renderTypeBadge = (type?: string) => {
    const normalized = String(type || 'home').toLowerCase();
    const Icon = normalized === 'work' ? Briefcase : normalized === 'other' ? MapPin : Home;
    const label = normalized === 'work' ? 'Work' : normalized === 'other' ? 'Other' : 'Home';
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#E7DFD7] bg-[#FAF8F5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6F665E]">
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((idx) => (
          <div
            key={idx}
            className="h-44 animate-pulse rounded-2xl border border-[#EDE5DD] bg-[#FAF8F5] p-5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-semibold text-[#1E1B18]">
            Saved Delivery Addresses
          </h3>
          <p className="text-xs sm:text-sm text-[#7A7168]">
            Manage your addresses for faster one-tap checkout across Hyderabad & Secunderabad.
          </p>
        </div>

        {!showForm && (
          <Button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
            className="h-10 rounded-xl bg-[#BE185D] px-4 text-xs sm:text-sm font-semibold text-white hover:bg-[#9D174D] w-full sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#EDE5DD] bg-[#FAF8F5] p-4 sm:p-6">
          <AddressForm
            initialAddress={editingAddress}
            defaultFullName={user?.name || ''}
            defaultPhone={user?.phone || ''}
            defaultEmail={user?.email || ''}
            isFirstAddress={addresses.length === 0}
            showSetDefaultCheckbox={addresses.length > 0}
            submitLabel={editingAddress ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
            isSubmitting={isSubmitting}
            onSubmit={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
            title={editingAddress ? 'Edit Address' : 'Add a New Delivery Address'}
            autoFocusFirstField
          />
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-[#DFD5CA] bg-[#FAF8F5] px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F5] text-[#BE185D]">
            <MapPin className="h-6 w-6" />
          </div>
          <h4 className="text-base font-semibold text-[#1E1B18]">No saved addresses yet</h4>
          <p className="mx-auto mt-1 max-w-sm text-xs sm:text-sm text-[#7A7168]">
            Save your Home or Work address once and we’ll pre-fill it automatically on every checkout.
          </p>
          <Button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
            className="mt-5 h-11 rounded-xl bg-[#BE185D] px-5 text-sm font-semibold text-white hover:bg-[#9D174D]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => {
            const isBusy = busyId === address.id;
            const line1 = [address.houseNo, address.apartment].filter(Boolean).join(', ');
            const street = address.street || address.address || address.formattedAddress || '';
            const line2 = [street, address.landmark ? `Near ${address.landmark}` : '']
              .filter(Boolean)
              .join(', ');
            const pin = address.pincode || address.zipCode || '';

            return (
              <div
                key={address.id}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(30,27,24,0.03)] transition-all',
                  address.isDefault ? 'border-[#E2B8C6] ring-1 ring-[#BE185D]/10' : 'border-[#EDE5DD]'
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="text-sm sm:text-base font-semibold text-[#1E1B18]">
                        {getAddressDisplayName(address)}
                      </h4>
                      {renderTypeBadge(address.type)}
                      {address.isDefault && (
                        <span className="rounded-full bg-[#EDF3EE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#355A40]">
                          Default
                        </span>
                      )}
                    </div>
                    {isBusy && <Loader2 className="h-4 w-4 animate-spin text-[#BE185D]" />}
                  </div>

                  <div className="text-xs sm:text-sm text-[#5D544C] space-y-0.5 break-words">
                    {line1 && <p>{line1}</p>}
                    {line2 && <p>{line2}</p>}
                    <p className="font-medium text-[#3C342E]">
                      {address.city || 'Hyderabad'}, {address.state || 'Telangana'}
                      {pin ? ` – ${pin}` : ''}
                    </p>
                  </div>

                  {address.phone && (
                    <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-[#2E2824]">
                      <Phone className="h-3.5 w-3.5 text-[#BE185D]" />
                      +91 {address.phone}
                      {address.alternatePhone && (
                        <span className="font-normal text-[#7A7168]">
                          {' '}
                          • Alt: +91 {address.alternatePhone}
                        </span>
                      )}
                    </p>
                  )}

                  {address.deliveryInstructions && (
                    <p className="text-xs italic text-[#7A7168]">
                      Note: {address.deliveryInstructions}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#F3ECE5] pt-3">
                  {!address.isDefault && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleSetDefault(address.id)}
                      className="h-8 rounded-lg border-[#CBE0D0] bg-[#F2F8F3] px-3 text-xs font-semibold text-[#2E573A] hover:bg-[#E4F0E7]"
                    >
                      <Star className="mr-1 h-3 w-3" />
                      Set Default
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => {
                      setEditingAddress(address);
                      setShowForm(true);
                    }}
                    className="h-8 rounded-lg px-2.5 text-xs font-medium text-[#4A423B] hover:bg-[#FAF8F5]"
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleDelete(address.id)}
                    className="ml-auto h-8 rounded-lg px-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
