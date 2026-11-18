import React from 'react';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Gift,
  Home,
  MapPin,
  Pencil,
  Phone,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SavedAddress } from '@/services/authService';
import type { PincodeServiceability } from '@/services/orderService';
import { getAddressDisplayName } from '@/services/addressService';

export interface SavedAddressCardProps {
  address: SavedAddress;
  serviceability?: PincodeServiceability | null;
  checkingServiceability?: boolean;
  onChangeAddress: () => void;
  onAddNewAddress: () => void;
  onEditCurrent?: () => void;
  isGiftRecipient?: boolean;
  className?: string;
}

const getAddressTypeMeta = (type?: string) => {
  const normalized = String(type || 'home').toLowerCase();
  if (normalized === 'work') {
    return { label: 'Work', Icon: Briefcase };
  }
  if (normalized === 'other') {
    return { label: 'Other', Icon: MapPin };
  }
  return { label: 'Home', Icon: Home };
};

export const SavedAddressCard: React.FC<SavedAddressCardProps> = ({
  address,
  serviceability,
  checkingServiceability = false,
  onChangeAddress,
  onAddNewAddress,
  onEditCurrent,
  isGiftRecipient = false,
  className,
}) => {
  const { label: typeLabel, Icon: TypeIcon } = getAddressTypeMeta(address.type);
  const displayName = getAddressDisplayName(address);
  const line1 = [address.houseNo, address.apartment].filter(Boolean).join(', ');
  const streetPart = address.street || address.address || address.formattedAddress || '';
  const line2 = [streetPart, address.landmark ? `Near ${address.landmark}` : '']
    .filter(Boolean)
    .join(', ');
  const pin = address.pincode || address.zipCode || '';
  const line3 = `${address.city || 'Hyderabad'}, ${address.state || 'Telangana'}${pin ? ` – ${pin}` : ''}`;

  const isUnserviceable = serviceability !== undefined && serviceability !== null && !serviceability.serviceable;

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,27,24,0.04)] transition-colors',
        isUnserviceable ? 'border-rose-300 bg-rose-50/30' : 'border-[#EDE5DD]',
        className
      )}
    >
      {/* Top Eyebrow Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F3ECE5]">
        <span className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]',
          isGiftRecipient ? 'text-[#BE185D]' : 'text-[#8A8076]'
        )}>
          {isGiftRecipient && <Gift className="h-3.5 w-3.5" />}
          {isGiftRecipient ? 'Gift Delivering To (Receiver)' : 'Delivering To'}
        </span>

        {checkingServiceability ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-[11px] font-medium text-[#7A7168] border border-[#EDE5DD]">
            Checking PIN...
          </span>
        ) : isUnserviceable ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            <AlertTriangle className="h-3 w-3" />
            Not Serviceable
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF3EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#2E573A] border border-[#CBE0D0]">
            <CheckCircle2 className="h-3 w-3 text-[#3F6349]" />
            Serviceable{serviceability?.area ? ` • ${serviceability.city || 'Hyderabad'}` : ''}
          </span>
        )}
      </div>

      {/* Main Address Content */}
      <div className="mt-3.5 flex items-start gap-3 sm:gap-3.5">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0F5] text-[#BE185D] border border-[#F8D4E0]">
          {isGiftRecipient ? <Gift className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-[#1E1B18] flex items-center gap-1.5">
              <span>{isGiftRecipient ? `Gift for ${displayName}` : `Delivering to ${typeLabel}`}</span>
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF8F5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6F665E] border border-[#E7DFD7]">
              <TypeIcon className="h-2.5 w-2.5" />
              {typeLabel}
            </span>
            {!isGiftRecipient && address.isDefault && (
              <span className="rounded-full bg-[#EDF3EE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#355A40]">
                Default
              </span>
            )}
          </div>

          {!isGiftRecipient && <p className="text-sm font-semibold text-[#2E2824]">{displayName}</p>}

          <div className="text-xs sm:text-sm leading-relaxed text-[#5D544C] space-y-0.5 break-words">
            {line1 && <p>{line1}</p>}
            {line2 && <p>{line2}</p>}
            <p className="font-medium text-[#3C342E]">{line3}</p>
          </div>

          {(address.phone || address.alternatePhone) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs sm:text-sm text-[#5D544C]">
              {address.phone && (
                <span className="inline-flex items-center gap-1.5 font-medium text-[#2E2824]">
                  <Phone className="h-3.5 w-3.5 text-[#BE185D]" />
                  +91 {address.phone}
                </span>
              )}
              {address.alternatePhone && (
                <span className="text-xs text-[#7A7168]">
                  Alt: +91 {address.alternatePhone}
                </span>
              )}
            </div>
          )}

          {address.deliveryInstructions && (
            <p className="pt-1 text-xs text-[#7A7168] italic">
              Note: {address.deliveryInstructions}
            </p>
          )}
        </div>
      </div>

      {/* Delivery Estimate / Unserviceable Alert */}
      {isUnserviceable ? (
        <div className="mt-3.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {serviceability?.message ||
              `PIN code ${pin} is outside our delivery area. Please change or edit your delivery address to continue.`}
          </span>
        </div>
      ) : serviceability?.estimatedDelivery ? (
        <div className="mt-3.5 rounded-xl border border-[#E2EDE4] bg-[#F6FAF7] px-3.5 py-2 text-xs font-medium text-[#355A40]">
          {serviceability.estimatedDelivery}
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[#F3ECE5]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onChangeAddress}
          className="h-9 flex-1 sm:flex-initial rounded-xl border-[#E2B8C6] bg-[#FFF7F9] px-4 text-xs sm:text-sm font-semibold text-[#BE185D] hover:bg-[#FFEBF1] hover:text-[#9D174D]"
        >
          {isGiftRecipient ? 'Pick Saved Address' : 'Change Address'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddNewAddress}
          className="h-9 flex-1 sm:flex-initial rounded-xl border-[#E5DDD5] bg-white px-4 text-xs sm:text-sm font-semibold text-[#3C342E] hover:bg-[#FAF8F5]"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {isGiftRecipient ? 'Enter Different Receiver' : 'Add New Address'}
        </Button>

        {onEditCurrent && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditCurrent}
            className="h-9 rounded-xl px-3 text-xs font-medium text-[#7A7168] hover:bg-[#FAF8F5] hover:text-[#1E1B18]"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            {isGiftRecipient ? 'Edit Receiver' : 'Edit'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SavedAddressCard;
