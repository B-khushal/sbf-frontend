import React, { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  MapPinned,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { SERVICEABLE_PINCODES } from '@/components/ui/PinCodeInput';
import { checkPincodeServiceability, type PincodeServiceability } from '@/services/orderService';
import {
  type AddressInput,
  type AddressType,
  isValidIndianMobile,
  normalizeIndianMobile,
} from '@/services/addressService';
import type { SavedAddress } from '@/services/authService';

export interface AddressFormProps {
  initialAddress?: Partial<SavedAddress> | null;
  defaultFullName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  submitLabel?: string;
  showSetDefaultCheckbox?: boolean;
  isFirstAddress?: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: AddressInput) => Promise<void> | void;
  onCancel?: () => void;
  onOpenMapPicker?: () => void;
  mapPinnedLabel?: string | null;
  onClearMapPin?: () => void;
  autoFocusFirstField?: boolean;
  title?: string;
  subtitle?: string;
  isGiftMode?: boolean;
  headerAction?: React.ReactNode;
}

type FieldErrors = Partial<Record<
  'fullName' | 'phone' | 'alternatePhone' | 'houseNo' | 'street' | 'landmark' | 'city' | 'state' | 'pincode',
  string
>>;

const ADDRESS_TYPES: Array<{ value: AddressType; label: string; icon: React.ReactNode }> = [
  { value: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { value: 'work', label: 'Work', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <MapPin className="h-4 w-4" /> },
];

const inputBaseClass =
  'h-11 sm:h-12 rounded-xl border-[#E5DDD5] bg-white text-[#1E1B18] placeholder:text-[#9A9086] text-[15px] shadow-[0_1px_2px_rgba(30,27,24,0.03)] transition-colors focus-visible:border-[#BE185D] focus-visible:ring-2 focus-visible:ring-[#BE185D]/15';

export const AddressForm: React.FC<AddressFormProps> = ({
  initialAddress,
  defaultFullName = '',
  defaultPhone = '',
  defaultEmail = '',
  submitLabel = 'SAVE ADDRESS & CONTINUE',
  showSetDefaultCheckbox = false,
  isFirstAddress = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
  onOpenMapPicker,
  mapPinnedLabel,
  onClearMapPin,
  autoFocusFirstField = false,
  title,
  subtitle,
  isGiftMode = false,
  headerAction,
}) => {
  const fullNameRef = useRef<HTMLInputElement>(null);

  const buildInitialState = () => {
    const derivedName =
      initialAddress?.fullName ||
      `${initialAddress?.firstName || ''} ${initialAddress?.lastName || ''}`.trim() ||
      defaultFullName ||
      '';
    const derivedPin = String(initialAddress?.pincode || initialAddress?.zipCode || '')
      .replace(/\D/g, '')
      .slice(0, 6);
    return {
      fullName: derivedName,
      phone: normalizeIndianMobile(initialAddress?.phone || defaultPhone || ''),
      alternatePhone: normalizeIndianMobile(initialAddress?.alternatePhone || ''),
      email: initialAddress?.email || defaultEmail || '',
      houseNo: initialAddress?.houseNo || '',
      apartment: initialAddress?.apartment || '',
      street: initialAddress?.street || initialAddress?.address || initialAddress?.formattedAddress || '',
      landmark: initialAddress?.landmark || '',
      city: initialAddress?.city || 'Hyderabad',
      state: initialAddress?.state || 'Telangana',
      pincode: derivedPin,
      deliveryInstructions:
        initialAddress?.deliveryInstructions ||
        initialAddress?.deliverySpecialInstructions ||
        initialAddress?.notes ||
        '',
      type: (initialAddress?.type as AddressType) || 'home',
      isDefault: isFirstAddress ? true : Boolean(initialAddress?.isDefault),
      latitude: initialAddress?.latitude ?? null,
      longitude: initialAddress?.longitude ?? null,
      formattedAddress: initialAddress?.formattedAddress || '',
    };
  };

  const [values, setValues] = useState(buildInitialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pinCheckLoading, setPinCheckLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState<PincodeServiceability | null>(null);

  useEffect(() => {
    setValues(buildInitialState());
    setErrors({});
  }, [initialAddress?.id, initialAddress?.formattedAddress, initialAddress?.pincode]);

  useEffect(() => {
    if (autoFocusFirstField) {
      const t = window.setTimeout(() => fullNameRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
  }, [autoFocusFirstField]);

  // Verify pincode serviceability whenever a 6-digit PIN is entered
  useEffect(() => {
    const pin = values.pincode.replace(/\D/g, '');
    if (pin.length !== 6) {
      setPinStatus(null);
      return;
    }

    let cancelled = false;
    const verify = async () => {
      setPinCheckLoading(true);
      // Fast local check first so UX feels instant
      const localMatch = SERVICEABLE_PINCODES.find((p) => p.code === pin);
      if (localMatch) {
        setValues((prev) => ({
          ...prev,
          city: localMatch.city,
          state: localMatch.state,
        }));
      }

      try {
        const res = await checkPincodeServiceability(pin);
        if (!cancelled) {
          setPinStatus(res);
          if (res.serviceable) {
            setValues((prev) => ({
              ...prev,
              city: res.city || prev.city || 'Hyderabad',
              state: res.state || prev.state || 'Telangana',
            }));
            setErrors((prev) => ({ ...prev, pincode: undefined }));
          } else {
            setErrors((prev) => ({
              ...prev,
              pincode: res.message || `PIN code ${pin} is outside our Hyderabad & Secunderabad delivery area.`,
            }));
          }
        }
      } catch {
        // Fallback to canonical local list if backend serviceability check is offline
        if (!cancelled) {
          if (localMatch) {
            setPinStatus({
              serviceable: true,
              pincode: pin,
              area: localMatch.area,
              city: localMatch.city,
              state: localMatch.state,
              estimatedDelivery: 'Same-day & scheduled delivery available',
            });
            setErrors((prev) => ({ ...prev, pincode: undefined }));
          } else {
            setPinStatus({
              serviceable: false,
              pincode: pin,
              message: `Sorry, PIN code ${pin} is currently outside our Hyderabad & Secunderabad delivery zone.`,
            });
            setErrors((prev) => ({
              ...prev,
              pincode: `PIN code ${pin} is outside our Hyderabad & Secunderabad delivery area.`,
            }));
          }
        }
      } finally {
        if (!cancelled) setPinCheckLoading(false);
      }
    };

    const timer = window.setTimeout(verify, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [values.pincode]);

  const setField = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateAll = (): boolean => {
    const nextErrors: FieldErrors = {};

    if (!values.fullName.trim() || values.fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter the recipient’s full name.';
    }
    if (!isValidIndianMobile(values.phone)) {
      nextErrors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';
    }
    if (values.alternatePhone.trim() && !isValidIndianMobile(values.alternatePhone)) {
      nextErrors.alternatePhone = 'Enter a valid 10-digit Indian mobile number or leave blank.';
    }
    if (!values.houseNo.trim()) {
      nextErrors.houseNo = 'Please enter House / Flat / Building number.';
    }
    if (!values.street.trim() || values.street.trim().length < 3) {
      nextErrors.street = 'Please enter Street / Road / Area.';
    }
    if (!values.landmark.trim()) {
      nextErrors.landmark = 'Please enter a nearby landmark for smooth delivery.';
    }
    if (!values.city.trim()) {
      nextErrors.city = 'City is required.';
    }
    if (!values.state.trim()) {
      nextErrors.state = 'State is required.';
    }
    const cleanPin = values.pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      nextErrors.pincode = 'Please enter a valid 6-digit PIN code.';
    } else {
      const localServiceable = SERVICEABLE_PINCODES.some((p) => p.code === cleanPin);
      if (pinStatus ? !pinStatus.serviceable : !localServiceable) {
        nextErrors.pincode =
          pinStatus?.message ||
          `PIN code ${cleanPin} is currently outside our Hyderabad & Secunderabad delivery area.`;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstErrorField = Object.keys(nextErrors)[0];
      const el = document.getElementById(`addr-field-${firstErrorField}`);
      if (el) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const fullName = values.fullName.trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const cleanPin = values.pincode.replace(/\D/g, '').slice(0, 6);

    await onSubmit({
      fullName,
      firstName: parts[0] || fullName,
      lastName: parts.slice(1).join(' ') || '',
      phone: normalizeIndianMobile(values.phone),
      alternatePhone: values.alternatePhone.trim()
        ? normalizeIndianMobile(values.alternatePhone)
        : '',
      email: values.email.trim(),
      houseNo: values.houseNo.trim(),
      apartment: values.apartment.trim(),
      street: values.street.trim(),
      address: values.street.trim(),
      landmark: values.landmark.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: cleanPin,
      zipCode: cleanPin,
      country: 'India',
      type: values.type,
      deliveryOption: isGiftMode ? 'gift' : 'self',
      deliveryInstructions: values.deliveryInstructions.trim(),
      notes: values.deliveryInstructions.trim(),
      isDefault: isGiftMode ? false : isFirstAddress ? true : values.isDefault,
      latitude: values.latitude,
      longitude: values.longitude,
      formattedAddress:
        values.formattedAddress ||
        [
          values.houseNo.trim(),
          values.apartment.trim(),
          values.street.trim(),
          values.landmark.trim() ? `Near ${values.landmark.trim()}` : '',
          values.city.trim(),
          `${values.state.trim()} – ${cleanPin}`,
        ]
          .filter(Boolean)
          .join(', '),
    });
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
      {(title || subtitle || headerAction) && (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
          <div className="space-y-1">
            {title && (
              <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-semibold text-[#1E1B18]">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs sm:text-sm text-[#6F665E]">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Optional Mappls GPS Pin Shortcut */}
      {onOpenMapPicker && (
        <div className="rounded-2xl border border-[#EDE5DD] bg-[#FAF8F5] p-3.5 sm:p-4">
          {mapPinnedLabel ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDF3EE] text-[#3F6349]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#3F6349]">
                    Map Location Pinned
                  </p>
                  <p className="text-xs sm:text-sm text-[#4A423B] line-clamp-2">{mapPinnedLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenMapPicker}
                  className="h-8 rounded-lg border-[#E2B8C6] bg-white text-xs font-medium text-[#BE185D] hover:bg-[#FFF7F9]"
                >
                  Adjust Pin
                </Button>
                {onClearMapPin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClearMapPin}
                    className="h-8 rounded-lg text-xs text-[#7A7168] hover:text-[#1E1B18]"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF0F5] text-[#BE185D]">
                  <MapPinned className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1E1B18]">Use Map to Auto-Fill Location</p>
                  <p className="text-xs text-[#7A7168]">
                    Pin your exact doorstep on Mappls for faster flower delivery
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onOpenMapPicker}
                className="h-9 rounded-xl border-[#E2B8C6] bg-white px-4 text-xs font-semibold text-[#BE185D] hover:bg-[#FFF7F9] w-full sm:w-auto shrink-0"
              >
                Pin on Map
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Address Type Selector */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6F665E]">
          Address Type <span className="text-[#BE185D]">*</span>
        </span>
        <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Address Type">
          {ADDRESS_TYPES.map((opt) => {
            const active = values.type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setField('type', opt.value)}
                className={cn(
                  'flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all',
                  active
                    ? 'border-[#BE185D] bg-[#FFF7F9] text-[#9D174D] shadow-[0_2px_8px_rgba(190,24,93,0.10)]'
                    : 'border-[#E5DDD5] bg-white text-[#5D544C] hover:border-[#D6C9BC] hover:bg-[#FAF8F5]'
                )}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="addr-field-fullName" className="block text-xs font-semibold text-[#3C342E]">
            {isGiftMode ? "Receiver's Full Name" : 'Full Name'}{' '}
            <span className="text-[#BE185D]">*</span>
          </label>
          <Input
            ref={fullNameRef}
            id="addr-field-fullName"
            name="fullName"
            autoComplete={isGiftMode ? 'off' : 'name'}
            placeholder={isGiftMode ? "e.g. Priya Reddy (person receiving the gift)" : 'e.g. Ananya Sharma'}
            value={values.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            className={cn(inputBaseClass, errors.fullName && 'border-rose-500 focus-visible:ring-rose-500/20')}
          />
          {errors.fullName && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="addr-field-phone" className="block text-xs font-semibold text-[#3C342E]">
            {isGiftMode ? "Receiver's Mobile Number" : 'Mobile Number'}{' '}
            <span className="text-[#BE185D]">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3.5 text-sm font-medium text-[#7A7168]">
              +91
            </span>
            <Input
              id="addr-field-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete={isGiftMode ? 'off' : 'tel-national'}
              maxLength={10}
              placeholder={isGiftMode ? "Receiver's 10-digit mobile" : '9876543210'}
              value={values.phone}
              onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              aria-invalid={Boolean(errors.phone)}
              className={cn(
                inputBaseClass,
                'pl-12',
                errors.phone && 'border-rose-500 focus-visible:ring-rose-500/20'
              )}
            />
          </div>
          {errors.phone && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="addr-field-alternatePhone" className="block text-xs font-semibold text-[#3C342E]">
            {isGiftMode ? "Receiver's Alternate Mobile" : 'Alternate Mobile Number'}{' '}
            <span className="font-normal text-[#8E847A]">(optional)</span>
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3.5 text-sm font-medium text-[#7A7168]">
              +91
            </span>
            <Input
              id="addr-field-alternatePhone"
              name="alternatePhone"
              type="tel"
              inputMode="tel"
              maxLength={10}
              placeholder="Alternate contact"
              value={values.alternatePhone}
              onChange={(e) => setField('alternatePhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              aria-invalid={Boolean(errors.alternatePhone)}
              className={cn(
                inputBaseClass,
                'pl-12',
                errors.alternatePhone && 'border-rose-500 focus-visible:ring-rose-500/20'
              )}
            />
          </div>
          {errors.alternatePhone && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.alternatePhone}
            </p>
          )}
        </div>
      </div>

      {/* Building & Street Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        <div className="space-y-1.5">
          <label htmlFor="addr-field-houseNo" className="block text-xs font-semibold text-[#3C342E]">
            House / Flat / Building Number <span className="text-[#BE185D]">*</span>
          </label>
          <Input
            id="addr-field-houseNo"
            name="houseNo"
            autoComplete="address-line1"
            placeholder="e.g. Flat 402, Plot 18"
            value={values.houseNo}
            onChange={(e) => setField('houseNo', e.target.value)}
            aria-invalid={Boolean(errors.houseNo)}
            className={cn(inputBaseClass, errors.houseNo && 'border-rose-500 focus-visible:ring-rose-500/20')}
          />
          {errors.houseNo && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.houseNo}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="addr-field-apartment" className="block text-xs font-semibold text-[#3C342E]">
            Apartment / Building Name <span className="font-normal text-[#8E847A]">(optional)</span>
          </label>
          <Input
            id="addr-field-apartment"
            name="apartment"
            autoComplete="address-line2"
            placeholder="e.g. Pearl Residency, Block B"
            value={values.apartment}
            onChange={(e) => setField('apartment', e.target.value)}
            className={inputBaseClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="addr-field-street" className="block text-xs font-semibold text-[#3C342E]">
            Street / Road / Area <span className="text-[#BE185D]">*</span>
          </label>
          <Input
            id="addr-field-street"
            name="street"
            autoComplete="street-address"
            placeholder="e.g. Road No. 12, Banjara Hills"
            value={values.street}
            onChange={(e) => setField('street', e.target.value)}
            aria-invalid={Boolean(errors.street)}
            className={cn(inputBaseClass, errors.street && 'border-rose-500 focus-visible:ring-rose-500/20')}
          />
          {errors.street && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.street}
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="addr-field-landmark" className="block text-xs font-semibold text-[#3C342E]">
            Landmark <span className="text-[#BE185D]">*</span>
          </label>
          <Input
            id="addr-field-landmark"
            name="landmark"
            placeholder="e.g. Near Care Hospital / Opposite Metro Pillar 42"
            value={values.landmark}
            onChange={(e) => setField('landmark', e.target.value)}
            aria-invalid={Boolean(errors.landmark)}
            className={cn(inputBaseClass, errors.landmark && 'border-rose-500 focus-visible:ring-rose-500/20')}
          />
          {errors.landmark && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.landmark}
            </p>
          )}
        </div>
      </div>

      {/* PIN Code, City, State */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="space-y-1.5">
          <label htmlFor="addr-field-pincode" className="block text-xs font-semibold text-[#3C342E]">
            PIN Code <span className="text-[#BE185D]">*</span>
          </label>
          <div className="relative">
            <Input
              id="addr-field-pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="postal-code"
              maxLength={6}
              placeholder="e.g. 500034"
              value={values.pincode}
              onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              aria-invalid={Boolean(errors.pincode)}
              className={cn(
                inputBaseClass,
                'pr-9',
                errors.pincode && 'border-rose-500 focus-visible:ring-rose-500/20',
                pinStatus?.serviceable && 'border-[#6A9977] focus-visible:border-[#3F6349]'
              )}
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              {pinCheckLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#9A9086]" />
              ) : pinStatus?.serviceable ? (
                <CheckCircle2 className="h-4 w-4 text-[#3F6349]" />
              ) : null}
            </div>
          </div>
          {errors.pincode && (
            <p className="text-xs font-medium text-rose-600 flex items-start gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{errors.pincode}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="addr-field-city" className="block text-xs font-semibold text-[#3C342E]">
            City <span className="text-[#BE185D]">*</span>
          </label>
          <Input
            id="addr-field-city"
            name="city"
            autoComplete="address-level2"
            placeholder="Hyderabad"
            value={values.city}
            onChange={(e) => setField('city', e.target.value)}
            aria-invalid={Boolean(errors.city)}
            className={cn(inputBaseClass, errors.city && 'border-rose-500')}
          />
          {errors.city && <p className="text-xs font-medium text-rose-600">{errors.city}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="addr-field-state" className="block text-xs font-semibold text-[#3C342E]">
            State <span className="text-[#BE185D]">*</span>
          </label>
          <Input
            id="addr-field-state"
            name="state"
            autoComplete="address-level1"
            placeholder="Telangana"
            value={values.state}
            onChange={(e) => setField('state', e.target.value)}
            aria-invalid={Boolean(errors.state)}
            className={cn(inputBaseClass, errors.state && 'border-rose-500')}
          />
          {errors.state && <p className="text-xs font-medium text-rose-600">{errors.state}</p>}
        </div>
      </div>

      {/* Live Serviceability Feedback Banner */}
      {pinStatus?.serviceable && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#CBE0D0] bg-[#F2F8F3] px-3.5 py-2.5 text-xs text-[#2E573A]">
          <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-[#3F6349]" />
          <div>
            <p className="font-semibold">
              Delivering to {pinStatus.area || values.city} ({pinStatus.pincode})
            </p>
            {pinStatus.estimatedDelivery && (
              <p className="text-[#3F6349]/90 mt-0.5">{pinStatus.estimatedDelivery}</p>
            )}
          </div>
        </div>
      )}

      {/* Delivery Instructions */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="addr-field-deliveryInstructions"
            className="block text-xs font-semibold text-[#3C342E]"
          >
            Delivery Instructions <span className="font-normal text-[#8E847A]">(optional)</span>
          </label>
          <span className="text-[11px] tabular-nums text-[#8E847A]">
            {values.deliveryInstructions.length}/250
          </span>
        </div>
        <Textarea
          id="addr-field-deliveryInstructions"
          name="deliveryInstructions"
          maxLength={250}
          rows={2}
          placeholder="e.g. Ring bell gently, call before arriving, leave with security desk..."
          value={values.deliveryInstructions}
          onChange={(e) => setField('deliveryInstructions', e.target.value.slice(0, 250))}
          className="min-h-[76px] rounded-xl border-[#E5DDD5] bg-white text-sm text-[#1E1B18] placeholder:text-[#9A9086] resize-none focus-visible:border-[#BE185D] focus-visible:ring-2 focus-visible:ring-[#BE185D]/15"
        />
      </div>

      {/* Optional Default Checkbox */}
      {showSetDefaultCheckbox && !isFirstAddress && (
        <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-[#EDE5DD] bg-[#FAF8F5] px-3.5 py-3">
          <Checkbox
            checked={values.isDefault}
            onCheckedChange={(checked) => setField('isDefault', Boolean(checked))}
            className="data-[state=checked]:bg-[#BE185D] data-[state=checked]:border-[#BE185D]"
          />
          <span className="text-sm font-medium text-[#3C342E]">
            Set as my default delivery address
          </span>
        </label>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 rounded-xl border-[#E5DDD5] bg-white px-5 text-sm font-semibold text-[#4A423B] hover:bg-[#FAF8F5]"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 sm:flex-initial sm:min-w-[230px] rounded-xl bg-[#BE185D] px-6 text-sm font-semibold tracking-wide text-white shadow-[0_6px_18px_-6px_rgba(190,24,93,0.45)] transition-all hover:bg-[#9D174D] active:scale-[0.99]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Address...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
