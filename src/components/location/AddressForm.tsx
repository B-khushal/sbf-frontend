import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AddressFormData {
  recipientName: string;
  phone: string;
  houseNo: string;
  apartment: string;
  floor: string;
  landmark: string;
  deliveryInstructions: string;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (name: keyof AddressFormData, value: string) => void;
  className?: string;
  deliveryOption?: 'self' | 'gift';
}

export const AddressForm: React.FC<AddressFormProps> = ({
  formData,
  onChange,
  className,
  deliveryOption,
}) => {
  const inputClass = 'h-11 rounded-xl border-slate-200 dark:border-slate-800 text-sm shadow-sm bg-white/50 dark:bg-slate-900/50 focus-visible:ring-2 focus-visible:ring-emerald-500';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof AddressFormData, value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Recipient details are collected on the main shipping form, so they are not shown in this sub-form */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* House / Flat Number */}
        <div className="space-y-1.5 md:col-span-1">
          <label htmlFor="houseNo" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            House / Flat Number *
          </label>
          <Input
            id="houseNo"
            name="houseNo"
            value={formData.houseNo}
            onChange={handleInputChange}
            required
            placeholder="Flat 101, House #4"
            className={inputClass}
          />
        </div>

        {/* Apartment / Building */}
        <div className="space-y-1.5 md:col-span-1">
          <label htmlFor="apartment" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Apartment / Building
          </label>
          <Input
            id="apartment"
            name="apartment"
            value={formData.apartment}
            onChange={handleInputChange}
            placeholder="Greenwood Residency (optional)"
            className={inputClass}
          />
        </div>

        {/* Floor */}
        <div className="space-y-1.5 md:col-span-1">
          <label htmlFor="floor" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Floor
          </label>
          <Input
            id="floor"
            name="floor"
            value={formData.floor}
            onChange={handleInputChange}
            placeholder="e.g., 2nd Floor (optional)"
            className={inputClass}
          />
        </div>
      </div>

      {/* Landmark */}
      <div className="space-y-1.5">
        <label htmlFor="landmark" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Landmark
        </label>
        <Input
          id="landmark"
          name="landmark"
          value={formData.landmark}
          onChange={handleInputChange}
          placeholder="e.g., Near Metro Station, Beside SBI Bank"
          className={inputClass}
        />
      </div>

      {/* Delivery Instructions */}
      <div className="space-y-1.5">
        <label htmlFor="deliveryInstructions" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Delivery Instructions
        </label>
        <Textarea
          id="deliveryInstructions"
          name="deliveryInstructions"
          value={formData.deliveryInstructions}
          onChange={handleInputChange}
          placeholder="Ring bell twice, leave with guard, call on arrival, etc."
          rows={3}
          className="rounded-xl border-slate-200 dark:border-slate-800 text-sm shadow-sm bg-white/50 dark:bg-slate-900/50 focus-visible:ring-2 focus-visible:ring-emerald-500 resize-none"
        />
      </div>
    </div>
  );
};

export default AddressForm;
