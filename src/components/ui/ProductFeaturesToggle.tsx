import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type ProductFeaturesToggleProps = {
  isNewArrival: boolean;
  isFeatured: boolean;
  hidden?: boolean;
  onNewArrivalChange: (value: boolean) => void;
  onFeaturedChange: (value: boolean) => void;
  onHiddenChange?: (value: boolean) => void;
};

export const ProductFeaturesToggle: React.FC<ProductFeaturesToggleProps> = ({
  isNewArrival,
  isFeatured,
  hidden = false,
  onNewArrivalChange,
  onFeaturedChange,
  onHiddenChange,
}) => {
  console.log('ProductFeaturesToggle rendered with:', { isNewArrival, isFeatured, hidden });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="isNewArrival"
          checked={Boolean(isNewArrival)}
          onCheckedChange={(checked) => {
            console.log('New Arrival Toggle Changed:', checked);
            onNewArrivalChange(checked);
          }}
        />
        <Label htmlFor="isNewArrival">Enable New Arrival</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isFeatured"
          checked={Boolean(isFeatured)}
          onCheckedChange={(checked) => {
            console.log('Featured Toggle Changed:', checked);
            onFeaturedChange(checked);
          }}
        />
        <Label htmlFor="isFeatured">Enable Featured Product</Label>
      </div>

      {onHiddenChange && (
        <div className="flex items-center space-x-2">
          <Switch
            id="hidden"
            checked={Boolean(hidden)}
            onCheckedChange={(checked) => {
              console.log('Hidden Toggle Changed:', checked);
              onHiddenChange(checked);
            }}
          />
          <Label htmlFor="hidden">Hide Product</Label>
        </div>
      )}
    </div>
  );
};

export default ProductFeaturesToggle; 