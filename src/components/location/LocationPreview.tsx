import React from 'react';
import { MapPin, Home, Landmark, Mail, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapplsLocation } from '@/types/location';

interface LocationPreviewProps {
  location: MapplsLocation;
  onChangeLocation?: () => void;
  className?: string;
}

export const LocationPreview: React.FC<LocationPreviewProps> = ({
  location,
  onChangeLocation,
  className,
}) => {
  const apiKey = import.meta.env.VITE_MAPPLS_API_KEY;
  
  // Construct Mappls Static Map URL
  // Parameters: center (lat,lng), zoom, size, markers (icon lat,lng)
  const staticMapUrl = apiKey
    ? `https://apis.mappls.com/advancedmaps/v1/${apiKey}/staticmap?center=${location.latitude},${location.longitude}&zoom=16&size=600x300&markers=color:red|label:D|${location.latitude},${location.longitude}`
    : null;

  return (
    <Card className={`overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-md rounded-2xl ${className}`}>
      {/* Static Map Image */}
      <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800/80">
        {staticMapUrl ? (
          <img
            src={staticMapUrl}
            alt="Delivery Location Map Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error and show fallback icon
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
            <MapPin className="h-10 w-10 text-emerald-500/80 animate-pulse" />
            <span className="text-xs font-semibold">Precise Location Target Active</span>
          </div>
        )}
        
        {/* Floating Change Location Button */}
        {onChangeLocation && (
          <Button
            type="button"
            onClick={onChangeLocation}
            variant="secondary"
            size="sm"
            className="absolute bottom-3 right-3 flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold border border-white/20 bg-white/90 hover:bg-white text-slate-800 shadow-md transition-all active:scale-95 z-10"
          >
            <Edit3 className="h-3 w-3" /> Change
          </Button>
        )}
      </div>

      <CardContent className="p-4 space-y-3.5">
        {/* Header Indicator */}
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <MapPin className="h-5 w-5 shrink-0 fill-emerald-600/10" />
          <h4 className="text-sm font-bold tracking-wide uppercase">📍 Delivery Location Details</h4>
        </div>

        {/* Address Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {/* Formatted Address (full span) */}
          <div className="md:col-span-2 flex items-start gap-2.5">
            <MapPin className="h-4.5 w-4.5 mt-0.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <div className="text-slate-700 dark:text-slate-305 font-medium leading-relaxed">
              {location.formattedAddress}
            </div>
          </div>

          {/* House / Flat Number */}
          <div className="flex items-center gap-2.5">
            <Home className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <div className="text-slate-600 dark:text-slate-400 font-medium">
              <span className="font-semibold text-slate-800 dark:text-slate-200">House:</span>{' '}
              {location.houseNo || 'N/A'}
              {location.apartment && `, ${location.apartment}`}
              {location.floor && ` (Floor: ${location.floor})`}
            </div>
          </div>

          {/* Pin Code */}
          <div className="flex items-center gap-2.5">
            <Mail className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <div className="text-slate-600 dark:text-slate-400 font-medium">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Pin Code:</span>{' '}
              {location.pincode}
            </div>
          </div>

          {/* Landmark */}
          {location.landmark && (
            <div className="md:col-span-2 flex items-center gap-2.5">
              <Landmark className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Landmark:</span>{' '}
                {location.landmark}
              </div>
            </div>
          )}
        </div>

        {/* Special Instructions Indicator */}
        {location.deliveryInstructions && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Special Instructions</span>
            <p className="text-xs text-slate-600 dark:text-slate-450 italic mt-0.5">
              "{location.deliveryInstructions}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationPreview;
