import React, { useState } from 'react';
import {
  Briefcase,
  Check,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SavedAddress } from '@/services/authService';
import {
  type AddressInput,
  getAddressDisplayName,
} from '@/services/addressService';
import { AddressForm } from './AddressForm';

export interface AddressSelectorDrawerProps {
  open: boolean;
  initialMode?: 'list' | 'add' | 'edit';
  editingAddress?: SavedAddress | null;
  addresses: SavedAddress[];
  selectedAddressId: string | null;
  defaultFullName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  onOpenChange: (open: boolean) => void;
  onSelectForOrder: (address: SavedAddress) => void;
  onCreateAddress: (input: AddressInput) => Promise<SavedAddress | null>;
  onUpdateAddress: (id: string, input: AddressInput) => Promise<SavedAddress | null>;
  onDeleteAddress: (id: string) => Promise<void>;
  onSetDefaultAddress: (id: string) => Promise<void>;
  onOpenMapPicker?: () => void;
  mapPinnedLabel?: string | null;
  onClearMapPin?: () => void;
  mapDraftOverride?: Partial<SavedAddress> | null;
}

export const AddressSelectorDrawer: React.FC<AddressSelectorDrawerProps> = ({
  open,
  initialMode = 'list',
  editingAddress = null,
  addresses,
  selectedAddressId,
  defaultFullName,
  defaultPhone,
  defaultEmail,
  onOpenChange,
  onSelectForOrder,
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onOpenMapPicker,
  mapPinnedLabel,
  onClearMapPin,
  mapDraftOverride,
}) => {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>(initialMode);
  const [activeEdit, setActiveEdit] = useState<SavedAddress | null>(editingAddress);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setMode(initialMode);
      setActiveEdit(editingAddress);
    }
  }, [open, initialMode, editingAddress]);

  const handleCreate = async (input: AddressInput) => {
    setIsSaving(true);
    try {
      const created = await onCreateAddress(input);
      if (created) {
        onSelectForOrder(created);
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (input: AddressInput) => {
    if (!activeEdit) return;
    setIsSaving(true);
    try {
      const updated = await onUpdateAddress(activeEdit.id, input);
      if (updated) {
        if (selectedAddressId === updated.id) {
          onSelectForOrder(updated);
        }
        setMode('list');
        setActiveEdit(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await onDeleteAddress(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setBusyId(id);
    try {
      await onSetDefaultAddress(id);
    } finally {
      setBusyId(null);
    }
  };

  const getTypeIcon = (type?: string) => {
    if (type === 'work') return <Briefcase className="h-3.5 w-3.5" />;
    if (type === 'other') return <MapPin className="h-3.5 w-3.5" />;
    return <Home className="h-3.5 w-3.5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-3xl border border-[#EDE5DD] bg-[#FAF8F5] p-0 shadow-2xl">
        <DialogHeader className="sticky top-0 z-10 border-b border-[#EDE5DD] bg-white/95 px-5 py-4 backdrop-blur-md text-left">
          <DialogTitle className="font-['Playfair_Display'] text-lg sm:text-xl font-semibold text-[#1E1B18]">
            {mode === 'add'
              ? 'Add New Delivery Address'
              : mode === 'edit'
              ? 'Edit Delivery Address'
              : 'Select Delivery Address'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#7A7168]">
            {mode === 'list'
              ? 'Choose an address for this order. Selecting a different address will not change your saved default.'
              : 'We deliver fresh flowers and gifts across Hyderabad & Secunderabad.'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          {mode === 'add' ? (
            <AddressForm
              initialAddress={mapDraftOverride}
              defaultFullName={defaultFullName}
              defaultPhone={defaultPhone}
              defaultEmail={defaultEmail}
              isFirstAddress={addresses.length === 0}
              showSetDefaultCheckbox={addresses.length > 0}
              submitLabel="SAVE & DELIVER HERE"
              isSubmitting={isSaving}
              onSubmit={handleCreate}
              onCancel={addresses.length > 0 ? () => setMode('list') : () => onOpenChange(false)}
              onOpenMapPicker={onOpenMapPicker}
              mapPinnedLabel={mapPinnedLabel}
              onClearMapPin={onClearMapPin}
              autoFocusFirstField
            />
          ) : mode === 'edit' && activeEdit ? (
            <AddressForm
              initialAddress={{ ...activeEdit, ...(mapDraftOverride || {}) }}
              defaultFullName={defaultFullName}
              defaultPhone={defaultPhone}
              defaultEmail={defaultEmail}
              showSetDefaultCheckbox={!activeEdit.isDefault}
              submitLabel="UPDATE ADDRESS"
              isSubmitting={isSaving}
              onSubmit={handleUpdate}
              onCancel={() => {
                setMode('list');
                setActiveEdit(null);
              }}
              onOpenMapPicker={onOpenMapPicker}
              mapPinnedLabel={mapPinnedLabel}
              onClearMapPin={onClearMapPin}
              autoFocusFirstField
            />
          ) : (
            <div className="space-y-3.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveEdit(null);
                  setMode('add');
                }}
                className="h-12 w-full justify-center gap-2 rounded-2xl border-dashed border-[#E2B8C6] bg-[#FFF7F9] text-sm font-semibold text-[#BE185D] hover:bg-[#FFEBF1]"
              >
                <Plus className="h-4 w-4" />
                Add New Address
              </Button>

              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-[#EDE5DD] bg-white p-8 text-center">
                  <MapPin className="mx-auto mb-3 h-10 w-10 text-[#C9BEB2]" />
                  <p className="text-sm font-semibold text-[#1E1B18]">No saved addresses yet</p>
                  <p className="mt-1 text-xs text-[#7A7168]">
                    Add your first delivery address to speed up future orders.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    const isBusy = busyId === addr.id;
                    const typeLabel = addr.type
                      ? addr.type.charAt(0).toUpperCase() + addr.type.slice(1)
                      : 'Home';
                    const line1 = [addr.houseNo, addr.apartment].filter(Boolean).join(', ');
                    const street = addr.street || addr.address || addr.formattedAddress || '';
                    const line2 = [street, addr.landmark ? `Near ${addr.landmark}` : '']
                      .filter(Boolean)
                      .join(', ');
                    const pin = addr.pincode || addr.zipCode || '';

                    return (
                      <div
                        key={addr.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onSelectForOrder(addr);
                          onOpenChange(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectForOrder(addr);
                            onOpenChange(false);
                          }
                        }}
                        className={cn(
                          'rounded-2xl border bg-white p-4 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D]',
                          isSelected
                            ? 'border-[#BE185D] ring-2 ring-[#BE185D]/15 bg-[#FFFDFD]'
                            : 'border-[#EDE5DD] hover:border-[#D9C9BC]'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={cn(
                                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                isSelected
                                  ? 'border-[#BE185D] bg-[#BE185D] text-white'
                                  : 'border-[#CFC5BA] bg-white'
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-sm font-semibold text-[#1E1B18]">
                                  {getAddressDisplayName(addr)}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF8F5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6F665E] border border-[#E7DFD7]">
                                  {getTypeIcon(addr.type)}
                                  {typeLabel}
                                </span>
                                {addr.isDefault && (
                                  <span className="rounded-full bg-[#EDF3EE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#355A40]">
                                    Default
                                  </span>
                                )}
                              </div>
                              {line1 && <p className="text-xs sm:text-sm text-[#5D544C]">{line1}</p>}
                              {line2 && <p className="text-xs sm:text-sm text-[#5D544C]">{line2}</p>}
                              <p className="text-xs sm:text-sm font-medium text-[#3C342E]">
                                {addr.city || 'Hyderabad'}, {addr.state || 'Telangana'}
                                {pin ? ` – ${pin}` : ''}
                              </p>
                              {addr.phone && (
                                <p className="flex items-center gap-1.5 text-xs text-[#6F665E]">
                                  <Phone className="h-3 w-3 text-[#BE185D]" />
                                  +91 {addr.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {isBusy && <Loader2 className="h-4 w-4 animate-spin text-[#BE185D] shrink-0" />}
                        </div>

                        <div
                          className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#F3ECE5] pt-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              onSelectForOrder(addr);
                              onOpenChange(false);
                            }}
                            className={cn(
                              'h-8 rounded-lg px-3.5 text-xs font-semibold',
                              isSelected
                                ? 'bg-[#BE185D] text-white hover:bg-[#9D174D]'
                                : 'bg-[#FFF7F9] text-[#BE185D] border border-[#E2B8C6] hover:bg-[#FFEBF1]'
                            )}
                          >
                            {isSelected ? 'Selected for Order' : 'Deliver Here'}
                          </Button>

                          {!addr.isDefault && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleSetDefault(addr.id)}
                              className="h-8 rounded-lg px-2.5 text-xs font-medium text-[#3F6349] hover:bg-[#EDF3EE]"
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
                              setActiveEdit(addr);
                              setMode('edit');
                            }}
                            className="h-8 rounded-lg px-2.5 text-xs font-medium text-[#5D544C] hover:bg-[#FAF8F5]"
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleDelete(addr.id)}
                            className="ml-auto h-8 rounded-lg px-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSelectorDrawer;
