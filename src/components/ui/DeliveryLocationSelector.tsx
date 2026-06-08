import React, { useState, useEffect } from 'react';
import { MapPin, Search, X, Check, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SERVICEABLE_PINCODES, ServiceablePinCode } from './PinCodeInput';
import { toast } from 'sonner';

interface DeliveryLocationSelectorProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

const POPULAR_AREAS = [
  { name: 'Mehdipatnam', pincode: '500028' },
  { name: 'Banjara Hills', pincode: '500034' },
  { name: 'Jubilee Hills', pincode: '500033' },
  { name: 'Gachibowli', pincode: '500046' },
  { name: 'Secunderabad', pincode: '500003' },
  { name: 'Madhapur', pincode: '500081' },
  { name: 'Kondapur', pincode: '500084' },
  { name: 'Begumpet', pincode: '500016' },
];

export const DeliveryLocationSelector: React.FC<DeliveryLocationSelectorProps> = ({
  variant = 'desktop',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<ServiceablePinCode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load initial location from localStorage and sync cross-component updates
  useEffect(() => {
    const loadSaved = () => {
      const saved = localStorage.getItem('sbf_delivery_location');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ServiceablePinCode;
          setSelectedLocation(parsed);
          setPincode(parsed.code);
        } catch (e) {
          console.error('Error parsing saved delivery location:', e);
        }
      }
    };

    loadSaved();

    const handleLocationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ServiceablePinCode>;
      if (customEvent.detail) {
        setSelectedLocation(customEvent.detail);
        setPincode(customEvent.detail.code);
      }
    };

    window.addEventListener('sbf-location-updated', handleLocationUpdate);
    return () => {
      window.removeEventListener('sbf-location-updated', handleLocationUpdate);
    };
  }, []);

  const handlePincodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const cleanPincode = pincode.replace(/\D/g, '').slice(0, 6);
    const match = SERVICEABLE_PINCODES.find((item) => item.code === cleanPincode);
    
    if (match) {
      saveLocation(match);
      toast.success(`Delivery location set to ${match.area}, Hyderabad`);
      setIsOpen(false);
    } else {
      toast.error('Sorry, we do not deliver to this pincode. We currently only deliver in Hyderabad.');
    }
  };

  const selectArea = (code: string) => {
    const match = SERVICEABLE_PINCODES.find((item) => item.code === code);
    if (match) {
      saveLocation(match);
      toast.success(`Delivery location set to ${match.area}, Hyderabad`);
      setIsOpen(false);
    }
  };

  const saveLocation = (location: ServiceablePinCode) => {
    setSelectedLocation(location);
    setPincode(location.code);
    localStorage.setItem('sbf_delivery_location', JSON.stringify(location));
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent('sbf-location-updated', { detail: location }));
  };

  const filteredPincodes = searchQuery
    ? SERVICEABLE_PINCODES.filter(
        (item) =>
          item.code.includes(searchQuery) ||
          item.area.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const displayText = selectedLocation 
    ? `${selectedLocation.area.split('/')[0].split(',')[0].trim()} (${selectedLocation.code})`
    : 'Deliver To ?';

  if (variant === 'mobile') {
    return (
      <>
        <div 
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between bg-sky-50/70 border border-sky-100/50 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-sky-100/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🇮🇳</span>
            <span className="text-xs font-semibold text-sky-900 tracking-wide uppercase">
              {selectedLocation ? 'Deliver to:' : 'Deliver To ?'}
            </span>
            <span className="text-xs font-medium text-sky-800 truncate max-w-[180px]">
              {selectedLocation ? displayText : 'Select Pincode'}
            </span>
          </div>
          <Edit2 size={13} className="text-sky-500" />
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl overflow-hidden p-6 gap-0">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <MapPin className="text-primary w-5 h-5" />
                Select Delivery Location
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <form onSubmit={handlePincodeSubmit} className="relative">
                <Input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="pr-20 rounded-xl h-12 border-gray-200 focus:border-primary text-base"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  className="absolute right-1.5 top-1.5 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95"
                >
                  Apply
                </Button>
              </form>

              {/* Quick Search Areas */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Hyderabad Areas</span>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search area (e.g. Banjara Hills)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl h-10 border-gray-200 text-sm"
                  />
                </div>
                {searchQuery && filteredPincodes.length > 0 && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white divide-y divide-gray-50">
                    {filteredPincodes.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => selectArea(item.code)}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-primary/5 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{item.code}</p>
                          <p className="text-gray-500 truncate">{item.area}</p>
                        </div>
                        <Check size={14} className="text-primary opacity-0 hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Areas */}
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2.5">Popular Areas</span>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_AREAS.map((area) => (
                    <button
                      key={area.pincode}
                      onClick={() => selectArea(area.pincode)}
                      className={`px-3 py-2 text-xs font-medium border rounded-xl transition-all duration-200 text-left flex items-center justify-between ${
                        selectedLocation?.code === area.pincode
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="truncate">{area.name}</span>
                      <span className="text-[10px] text-gray-400">{area.pincode}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop layout
  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-sky-50/50 to-pink-50/30 border border-[#f3d7e2]/30 hover:border-primary/30 rounded-xl cursor-pointer hover:shadow-sm transition-all duration-300 group whitespace-nowrap"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">🇮🇳</span>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Deliver To</span>
          <span className="text-[12px] font-semibold text-gray-800 max-w-[120px] truncate">
            {selectedLocation ? displayText : 'Select Pincode'}
          </span>
        </div>
        <Edit2 size={10} className="text-gray-400 group-hover:text-primary transition-colors ml-1" />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-2xl overflow-hidden p-6 gap-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-primary w-5 h-5" />
              Select Delivery Location
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <form onSubmit={handlePincodeSubmit} className="relative">
              <Input
                type="text"
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pr-20 rounded-xl h-12 border-gray-200 focus:border-primary text-base"
              />
              <Button 
                type="submit" 
                size="sm"
                className="absolute right-1.5 top-1.5 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95"
              >
                Apply
              </Button>
            </form>

            {/* Area Search */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Hyderabad Areas</span>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search area (e.g. Banjara Hills)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl h-10 border-gray-200 text-sm"
                />
              </div>
              {searchQuery && (
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white divide-y divide-gray-50 max-h-40 overflow-y-auto">
                  {filteredPincodes.length > 0 ? (
                    filteredPincodes.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => selectArea(item.code)}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-primary/5 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{item.code}</p>
                          <p className="text-gray-500 truncate">{item.area}</p>
                        </div>
                        <Check size={14} className="text-primary" />
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-gray-400 text-center">No areas matched. Try another keyword.</div>
                  )}
                </div>
              )}
            </div>

            {/* Popular Areas */}
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2.5">Popular Areas</span>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_AREAS.map((area) => (
                  <button
                    key={area.pincode}
                    onClick={() => selectArea(area.pincode)}
                    className={`px-3 py-2 text-xs font-medium border rounded-xl transition-all duration-200 text-left flex items-center justify-between ${
                      selectedLocation?.code === area.pincode
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate">{area.name}</span>
                    <span className="text-[10px] text-gray-400">{area.pincode}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
