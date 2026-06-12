import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Check, Edit2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SERVICEABLE_PINCODES, ServiceablePinCode } from './PinCodeInput';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DeliveryLocationSelectorProps {
  variant?: 'desktop' | 'mobile' | 'navbar';
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
  variant = 'navbar',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<ServiceablePinCode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on click outside (for desktop popover)
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, isMobile]);

  // Load saved location & restored session pincode
  useEffect(() => {
    const loadSaved = () => {
      const saved = localStorage.getItem('sbf_delivery_location');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ServiceablePinCode;
          setSelectedLocation(parsed);
          
          // Pre-fill with session pincode if present, else use saved pincode
          const sessionPincode = sessionStorage.getItem('sbf_entered_pincode');
          setPincode(sessionPincode !== null ? sessionPincode : parsed.code);
        } catch (e) {
          console.error('Error parsing saved delivery location:', e);
        }
      } else {
        const sessionPincode = sessionStorage.getItem('sbf_entered_pincode');
        if (sessionPincode) setPincode(sessionPincode);
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

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(cleanVal);
    sessionStorage.setItem('sbf_entered_pincode', cleanVal);
  };

  const handlePincodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);

    setTimeout(() => {
      const cleanPincode = pincode.replace(/\D/g, '').slice(0, 6);
      const match = SERVICEABLE_PINCODES.find((item) => item.code === cleanPincode);

      setIsSearching(false);
      if (match) {
        saveLocation(match);
        toast.success(`Delivery location set to ${match.area}, Hyderabad`);
        setIsOpen(false);
      } else {
        toast.error('Sorry, we do not deliver to this pincode. We currently only deliver in Hyderabad.');
      }
    }, 400);
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
    sessionStorage.setItem('sbf_entered_pincode', location.code);
    localStorage.setItem('sbf_delivery_location', JSON.stringify(location));
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
    : 'Select Pincode';

  // Shared inner content for popover / bottom sheet
  const renderInnerContent = () => (
    <div className="space-y-4">
      {/* Title section in popup */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-805 dark:text-slate-200 flex items-center gap-1.5">
          <MapPin size={16} className="text-primary" />
          Select Delivery Location
        </h3>
        {isMobile && (
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-650"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Pincode input form */}
      <form onSubmit={handlePincodeSubmit} className="relative">
        <Input
          type="text"
          placeholder="Enter 6-digit Pincode"
          value={pincode}
          onChange={handlePincodeChange}
          className="pr-20 rounded-xl h-11 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-primary text-sm bg-white dark:bg-slate-900"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={pincode.length < 6 || isSearching}
          className="absolute right-1 top-1 h-9 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs px-3 flex items-center gap-1"
        >
          {isSearching ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
        </Button>
      </form>

      {/* Search Area */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Search Hyderabad Areas</span>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search area (e.g. Banjara Hills)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl h-9 border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {searchQuery && (
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-850 max-h-36 overflow-y-auto mt-1 no-scrollbar animate-fade-in">
            {filteredPincodes.length > 0 ? (
              filteredPincodes.map((item) => {
                const isSelected = selectedLocation?.code === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => selectArea(item.code)}
                    className={cn(
                      "w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors",
                      isSelected ? "bg-primary/5 text-primary" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.code}</p>
                      <p className="text-slate-400 dark:text-slate-500 truncate text-[10px]">{item.area}</p>
                    </div>
                    <Check size={12} className={cn("text-primary shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                  </button>
                );
              })
            ) : (
              <div className="px-3.5 py-3 text-xs text-slate-400 text-center">No areas matched. Try another keyword.</div>
            )}
          </div>
        )}
      </div>

      {/* Popular Areas */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Popular Areas</span>
        <div className="grid grid-cols-2 gap-2">
          {POPULAR_AREAS.map((area) => {
            const isSelected = selectedLocation?.code === area.pincode;
            return (
              <button
                key={area.pincode}
                type="button"
                onClick={() => selectArea(area.pincode)}
                className={cn(
                  "px-2.5 py-2 text-[11px] font-medium border rounded-xl transition-all duration-200 text-left flex items-center justify-between",
                  isSelected
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-650 dark:text-slate-350 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300"
                )}
              >
                <span className="truncate pr-1">{area.name}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0">{area.pincode}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Trigger Button */}
      {variant === 'mobile' ? (
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-sky-50/70 dark:bg-sky-950/20 border border-sky-100/50 dark:border-sky-900/40 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-sky-100/40 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🇮🇳</span>
            <span className="text-xs font-semibold text-sky-900 dark:text-sky-300 tracking-wide uppercase">
              {selectedLocation ? 'Deliver to:' : 'Deliver To ?'}
            </span>
            <span className="text-xs font-medium text-sky-850 dark:text-sky-200 truncate max-w-[180px]">
              {selectedLocation ? displayText : 'Select Pincode'}
            </span>
          </div>
          <Edit2 size={13} className="text-sky-500" />
        </div>
      ) : (
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-sky-50/50 to-pink-50/30 border border-[#f3d7e2]/30 hover:border-primary/30 rounded-xl cursor-pointer hover:shadow-sm transition-all duration-300 group whitespace-nowrap select-none"
        >
          <span className="text-base group-hover:scale-110 transition-transform hidden sm:inline">🇮🇳</span>
          <MapPin size={14} className="text-primary group-hover:scale-110 transition-transform sm:hidden" />
          <div className="flex flex-col text-left">
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Deliver To</span>
            <span className="text-[11px] sm:text-[12px] font-semibold text-gray-800 dark:text-slate-200 max-w-[80px] sm:max-w-[120px] truncate">
              {selectedLocation ? displayText : 'Select Pincode'}
            </span>
          </div>
          <Edit2 size={10} className="text-gray-450 group-hover:text-primary transition-colors ml-1 hidden sm:block" />
        </div>
      )}

      {/* Popover/Drawer */}
      <AnimatePresence>
        {isOpen && (
          isMobile ? (
            <>
              {/* Bottom Sheet Drawer for Mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-slate-950 z-[9999]"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 230 }}
                className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-slate-950 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)] z-[10000] pb-8 pt-4 px-5 flex flex-col overflow-y-auto no-scrollbar"
              >
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4 shrink-0" />
                {renderInnerContent()}
              </motion.div>
            </>
          ) : (
            /* Absolute Dropdown for Desktop/Tablet */
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-slate-950 border border-slate-150/70 dark:border-slate-850 rounded-2xl shadow-xl z-dropdown p-4 space-y-4 animate-fade-in"
              style={{ originX: 0, originY: 0 }}
            >
              {renderInnerContent()}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};
