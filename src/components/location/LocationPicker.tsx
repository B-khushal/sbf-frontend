import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { reverseGeocode } from '@/services/mappls.service';
import { MapplsLocation } from '@/types/location';
import SearchBox from './SearchBox';
import CurrentLocationButton from './CurrentLocationButton';
import MapView from './MapView';
import AddressForm from './AddressForm';

interface LocationPickerProps {
  initialLocation?: Partial<MapplsLocation>;
  onConfirm: (location: MapplsLocation) => void;
  onCancel?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onConfirm,
  onCancel,
}) => {
  const { toast } = useToast();
  const { getCurrentLocation, loading: geoLoading } = useCurrentLocation();

  // Hyderabad defaults
  const [lat, setLat] = useState<number>(initialLocation?.latitude || 17.3912);
  const [lng, setLng] = useState<number>(initialLocation?.longitude || 78.4326);
  const [formattedAddress, setFormattedAddress] = useState<string>(initialLocation?.formattedAddress || '');
  
  // Choose tab/flow: 'select' (choose pick mode) or 'map' (interactive map picker)
  const [pickerState, setPickerState] = useState<'select' | 'map'>(
    initialLocation?.formattedAddress ? 'map' : 'select'
  );

  // Address form fields
  const [addressDetails, setAddressDetails] = useState({
    recipientName: initialLocation?.recipientName || '',
    phone: initialLocation?.phone || '',
    houseNo: initialLocation?.houseNo || '',
    apartment: initialLocation?.apartment || '',
    floor: initialLocation?.floor || '',
    landmark: initialLocation?.landmark || '',
    deliveryInstructions: initialLocation?.deliveryInstructions || '',
  });

  const [pincode, setPincode] = useState(initialLocation?.pincode || '');
  const [city, setCity] = useState(initialLocation?.city || 'Hyderabad');
  const [state, setState] = useState(initialLocation?.state || 'Telangana');
  const [country, setCountry] = useState(initialLocation?.country || 'India');

  // Perform reverse geocoding on coordinates
  const triggerReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const addr = await reverseGeocode(latitude, longitude);
      setFormattedAddress(addr.formattedAddress);
      setPincode(addr.pincode);
      setCity(addr.city);
      setState(addr.state);
      setCountry(addr.country);
      
      // Merge values into form fields if they are empty
      setAddressDetails((prev) => ({
        ...prev,
        landmark: prev.landmark || addr.landmark || '',
        houseNo: prev.houseNo || addr.houseNo || '',
        apartment: prev.apartment || addr.apartment || '',
      }));

      toast({
        title: 'Address Located',
        description: 'Delivery details have been updated.',
      });
    } catch (error: any) {
      console.error('Reverse geocode error:', error);
      toast({
        title: 'Location Detail Error',
        description: 'Could not fetch detailed address components. Please enter manually.',
        variant: 'destructive',
      });
    }
  };

  // Browser Geolocation Click
  const handleCurrentLocationClick = async () => {
    try {
      const coords = await getCurrentLocation();
      setLat(coords.latitude);
      setLng(coords.longitude);
      setPickerState('map');
      await triggerReverseGeocode(coords.latitude, coords.longitude);
    } catch (err: any) {
      toast({
        title: 'Geolocation Error',
        description: err.message || 'Unable to retrieve your current location.',
        variant: 'destructive',
      });
    }
  };

  // Autocomplete Select Click
  const handleSearchSelect = async (latitude: number, longitude: number, text: string) => {
    setLat(latitude);
    setLng(longitude);
    setFormattedAddress(text);
    setPickerState('map');
    await triggerReverseGeocode(latitude, longitude);
  };

  // Interactive Map Marker Dragged Handler
  const handleMarkerDrag = async (latitude: number, longitude: number) => {
    setLat(latitude);
    setLng(longitude);
    await triggerReverseGeocode(latitude, longitude);
  };

  // Address fields updates
  const handleFormChange = (name: keyof typeof addressDetails, value: string) => {
    setAddressDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Save location button click
  const handleConfirmClick = () => {
    if (!lat || !lng) {
      toast({
        title: 'Missing coordinates',
        description: 'Please select a delivery location on the map.',
        variant: 'destructive',
      });
      return;
    }

    if (!formattedAddress) {
      toast({
        title: 'Missing Address',
        description: 'Please select a valid address before confirming.',
        variant: 'destructive',
      });
      return;
    }

    if (!addressDetails.recipientName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Recipient Name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!addressDetails.phone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Phone Number is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!addressDetails.houseNo.trim()) {
      toast({
        title: 'Validation Error',
        description: 'House / Flat Number is required.',
        variant: 'destructive',
      });
      return;
    }

    const finalLocation: MapplsLocation = {
      latitude: lat,
      longitude: lng,
      formattedAddress,
      city,
      state,
      country,
      pincode,
      ...addressDetails,
    };

    onConfirm(finalLocation);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {pickerState === 'select' ? (
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden p-6 sm:p-8 animate-in fade-in duration-300">
          <div className="text-center max-w-lg mx-auto space-y-3 mb-8">
            <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100/50">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-['Playfair_Display'] text-slate-900 dark:text-white">
              Choose Delivery Location Method
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pinpoint your exact delivery address for SBFlorist's custom florist network in Hyderabad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {/* Geolocation option */}
            <button
              type="button"
              onClick={handleCurrentLocationClick}
              disabled={geoLoading}
              className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 rounded-2xl transition-all duration-300 group hover:shadow-md disabled:opacity-85"
            >
              <Navigation className="h-7 w-7 text-emerald-500 fill-emerald-500/10 mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {geoLoading ? 'Locating...' : 'Use Current Location'}
              </span>
              <span className="text-xs text-slate-450 dark:text-slate-500 text-center mt-2">
                Allow browser GPS location access
              </span>
            </button>

            {/* Address search option */}
            <div className="flex flex-col p-6 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 rounded-2xl md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  Search Address
                </span>
              </div>
              
              <SearchBox onLocationSelect={handleSearchSelect} className="mb-2" />
              <span className="text-xs text-slate-450 dark:text-slate-500">
                Type your area, building name or street info
              </span>
            </div>
          </div>

          {/* Map Direct Pick */}
          <div className="text-center mt-8 border-t border-slate-100 dark:border-slate-850 pt-6">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Or directly select a location using the map.{' '}
              <button
                type="button"
                onClick={() => setPickerState('map')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Open Interactive Map
              </button>
            </span>
          </div>
        </Card>
      ) : (
        <Card className="border border-slate-200/80 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden animate-in fade-in duration-300">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPickerState('select')}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to options
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Interactive Map Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Map Column */}
            <div className="lg:col-span-7 h-[320px] lg:h-[520px] relative">
              <MapView
                latitude={lat}
                longitude={lng}
                onMarkerDragEnd={handleMarkerDrag}
                className="rounded-none border-0 h-full w-full"
              />
              {/* Floating search box on top of the map */}
              <div className="absolute top-4 left-4 right-4 max-w-sm">
                <SearchBox onLocationSelect={handleSearchSelect} placeholder="Search map location..." />
              </div>
              {/* Floating Geolocation Button on bottom of map */}
              <div className="absolute bottom-4 right-4">
                <CurrentLocationButton
                  onClick={handleCurrentLocationClick}
                  isLoading={geoLoading}
                  className="shadow-lg h-10 py-1"
                />
              </div>
            </div>

            {/* Address fields Column */}
            <div className="lg:col-span-5 p-5 lg:p-6 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-850 flex flex-col h-[520px] overflow-y-auto">
              <div className="space-y-4 flex-1">
                {/* Formatted Address Display */}
                {formattedAddress ? (
                  <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Pinned Address</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                      {formattedAddress}
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-2 items-start text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">No Location Pinned</span>
                      Please drag the marker or search for an address.
                    </div>
                  </div>
                )}

                {/* Subdetails form fields */}
                <AddressForm
                  formData={addressDetails}
                  onChange={handleFormChange}
                />
              </div>

              {/* Sticky confirm location button */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-4 bg-white/95 dark:bg-slate-900/95 sticky bottom-0">
                <div className="flex gap-3">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="flex-1 rounded-xl h-11 border-slate-300 dark:border-slate-800 text-sm font-semibold active:scale-95"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleConfirmClick}
                    className="flex-[2] rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/10 transition-all active:scale-95"
                  >
                    Confirm Location
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LocationPicker;
