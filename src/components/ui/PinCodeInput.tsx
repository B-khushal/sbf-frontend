import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Loader2, MapPin, Search } from 'lucide-react';
import { Input } from './input';
import { Alert, AlertDescription } from './alert';
import { cn } from '@/lib/utils';

type ServiceablePinCode = {
  code: string;
  area: string;
  city: string;
  state: string;
};

const DEFAULT_CITY = 'Hyderabad';
const DEFAULT_STATE = 'Telangana';

// Complete list of serviceable PIN codes based on provided data.
const SERVICEABLE_PINCODES: ServiceablePinCode[] = [
  { code: '500001', area: 'Gandhi Bhavan / GPO / Moazzampura, etc.', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500002', area: 'Moghalpura', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500003', area: 'Begumpet Policelines / Secunderabad HO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500004', area: 'Bazarghat / Khairatabiad HQ', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500005', area: 'CRP Camp / Masab Tank BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500006', area: 'Karwan Sahu / Mangalhat SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500007', area: 'Adminstrative Buildings / IICT', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500008', area: 'Golconda / Hyder Shah Kote', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500009', area: 'Manovikasnagar / Napier Lines SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500010', area: 'Bolaram SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500011', area: 'Bowenpally SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500012', area: 'Begumbazar SO / Osmania Gen. Hospital', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500013', area: 'Amberpet SO / Seminary BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500015', area: 'Jagannandas / EME Records BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500016', area: 'Begumpet SO / Prakashnamnagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500017', area: 'Lallaguda / Lallagpt SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500018', area: 'Sanath Nagar / Erragadda SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500019', area: 'Lingampalli SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500022', area: 'Central Secretariat SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500023', area: 'Yakutpura SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500024', area: 'Chandanagar / Sahifa SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500025', area: 'Himmatnagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500026', area: 'Mehrunagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500027', area: 'Barkatpura SO / Nimboliadda SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500028', area: 'Humayunnagar / Shantinagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500029', area: 'Himayathnagar / Ramakrishna Mutt SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500030', area: 'Rajendranagar SO / Kamatpur BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500031', area: 'Ibrahim Bagh Lines SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500033', area: 'Jubilee Hills SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500034', area: 'Banjara Hills SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500035', area: 'Saroornagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500036', area: 'Malakpet Colony SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500037', area: 'Ramneeddinagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500038', area: 'Sanjeev Reddy Nagar SO / Vengal Rao Nagar', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500039', area: 'Bodupal SO / Peerzadiguda BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500040', area: 'Moulsali SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500041', area: 'Raj Bhavan SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500042', area: 'Ferozguda SO / New Bowenpally', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500043', area: 'Osmangunj / Sitarambagh / Chudi Bazar', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500044', area: 'Ambernagar / Vidyanagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500045', area: 'Yousufguda SO / AGS Staff Quarters', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500046', area: 'University of Hyderabad (HCU) / Gachibowli', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500047', area: 'Malakpet SO / Moosarambagh', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500048', area: 'Attapur SO / Hyderguda SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500049', area: 'Miyapur SO / Hafeezpet / Huda Colony', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500050', area: 'Chandanagar SO / Beeramguda / Lingampally', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500052', area: 'Hasannagar / SVPMTA SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500053', area: 'Falaknuma / Uppuguda SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500054', area: 'HMT Township SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500055', area: 'IDA Jeedimetla SO / Kutbullapur BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500056', area: 'Neredmet SO / Ramakrishna Puram SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500057', area: 'Vijay Nagar Colony SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500058', area: 'Kanchanbagh SO / Badangpet BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500059', area: 'Saidabad SO / Colony', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500060', area: 'Dilsukhnagar Colony / P&T Colony', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500061', area: 'Sitaphalmandi SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500062', area: 'ECIL / Dr A S Rao Nagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500063', area: 'LIC Division SO / New MLA Quarters', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500064', area: 'Bahadurpura SO / Hussainsalam', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500065', area: 'Shahalinanda SO / Fatehdarwaza', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500066', area: 'High Court SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500067', area: 'Suchitra Junction SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500068', area: 'GSI Bandlaguda SO / Mansorabad', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500069', area: 'R.C. Imar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500070', area: 'Vanasthalipuram SO / Vaidehinagar', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500071', area: 'Rail Nilayam SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500072', area: 'Kukatpally SO / Vivekananddnagar', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500073', area: 'Srinagar Colony SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500074', area: 'LB Nagar SO / Rangareddy District Court', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500076', area: 'I.E. Nacharam SO / Snehapuri Colony', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500077', area: 'Kattedan I.E. SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500079', area: 'Jillellaguda BO / Karmanghat BO / Vaishalinagar SO / Hasthinapuram SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500080', area: 'Gandhinagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500081', area: 'Cyberabad SO / Madhapur BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500082', area: 'I.M. Colony / Somajiguda SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500083', area: 'Nagaram SO (K.V. Rangareddy)', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500084', area: 'Kothaguda SO / Kondapur BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500085', area: 'JNTU Kukatpally SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500086', area: 'Don Bosco Nagar SO (Rajendranagar)', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500087', area: 'JJ Nagar Colony SO / Allembylines SO (Jawahar Nagar area)', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500089', area: 'Manikonda SO (also covers Manchirevula BO & Narsingi BO)', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500090', area: 'Nizampet SO / Miyapur BO / Mallampet BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500091', area: 'Hydersnhakote SO (serving Hydershakote, Kapla Nagar Colony, AV Enclave, etc.) and AP Police Academy', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500092', area: 'Boduppal SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500093', area: 'Vikasnagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500094', area: 'Sainikpuri SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500095', area: 'Putlibowli SO and SBI SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500096', area: 'Film Nagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500097', area: 'Meerpet SO and Gayathrinagar SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500098', area: 'Medipalli SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500100', area: 'Kompally SO, Doolapalli BO, Pochampally BO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500102', area: 'Rama Krishnapuram SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500103', area: 'saket, Sainlakpuri', city: DEFAULT_CITY, state: DEFAULT_STATE },
  { code: '500104', area: 'Chitrapuri Colony SO', city: DEFAULT_CITY, state: DEFAULT_STATE },
];

let pincodeCache: ServiceablePinCode[] | null = null;
let pincodeCachePromise: Promise<ServiceablePinCode[]> | null = null;

const loadServiceablePincodes = async () => {
  if (pincodeCache) {
    return pincodeCache;
  }

  if (!pincodeCachePromise) {
    pincodeCachePromise = new Promise<ServiceablePinCode[]>((resolve) => {
      window.setTimeout(() => {
        pincodeCache = SERVICEABLE_PINCODES;
        resolve(SERVICEABLE_PINCODES);
      }, 250);
    });
  }

  return pincodeCachePromise;
};

const normalizePinCodeQuery = (rawValue: string) => rawValue.replace(/\D/g, '').slice(0, 6);

const filterPincodes = (options: ServiceablePinCode[], rawQuery: string) => {
  const query = normalizePinCodeQuery(rawQuery);

  if (!query) {
    return options.slice(0, 12);
  }

  return options
    .filter((option) => option.code.startsWith(query))
    .slice(0, 12);
};

export interface PinCodeSelection {
  code: string;
  area: string;
  city: string;
  state: string;
}

interface PinCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  onSelectPinCode?: (selection: PinCodeSelection | null) => void;
}

const PinCodeInput: React.FC<PinCodeInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter PIN code',
  required = false,
  className,
  inputClassName,
  disabled = false,
  onValidationChange,
  onSelectPinCode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<ServiceablePinCode[]>([]);
  const [selectedOption, setSelectedOption] = useState<ServiceablePinCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [errorMessage, setErrorMessage] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties | null>(null);

  const hasError = Boolean(errorMessage);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    handleMediaChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }

    mediaQuery.addListener(handleMediaChange);
    return () => mediaQuery.removeListener(handleMediaChange);
  }, []);

  useEffect(() => {
    const exactMatch = SERVICEABLE_PINCODES.find((option) => option.code === value) || null;
    setSelectedOption(exactMatch);
    setQuery(normalizePinCodeQuery(value));

    if (!value) {
      setErrorMessage('');
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const options = await loadServiceablePincodes();
        setResults(filterPincodes(options, query));
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen || isMobile) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        validatePendingValue();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, isMobile, query]);

  useEffect(() => {
    if (!isOpen || isMobile) {
      setDropdownStyle(null);
      return;
    }

    const updateDropdownPosition = () => {
      const inputElement = desktopInputRef.current;
      if (!inputElement) {
        return;
      }

      const rect = inputElement.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };

    updateDropdownPosition();

    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (isOpen && isMobile) {
      const timeoutId = window.setTimeout(() => {
        mobileSearchRef.current?.focus();
      }, 100);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen, isMobile]);

  const selectedAreaLabel = useMemo(() => {
    if (!selectedOption) {
      return '';
    }

    return `${selectedOption.area}, ${selectedOption.city}, ${selectedOption.state}`;
  }, [selectedOption]);

  const applySelection = (option: ServiceablePinCode) => {
    setSelectedOption(option);
    setQuery(option.code);
    setIsOpen(false);
    setErrorMessage('');
    onChange(option.code);
    onSelectPinCode?.(option);
    onValidationChange?.(true);
  };

  const invalidateSelection = (message: string) => {
    setSelectedOption(null);
    setErrorMessage(message);
    onChange('');
    onSelectPinCode?.(null);
    onValidationChange?.(false, message);
  };

  const validatePendingValue = () => {
    const normalizedQuery = normalizePinCodeQuery(query);

    if (!normalizedQuery) {
      setErrorMessage('');
      onChange('');
      onSelectPinCode?.(null);
      onValidationChange?.(!required);
      return;
    }

    const exactMatch = SERVICEABLE_PINCODES.find((option) => option.code === normalizedQuery);
    if (exactMatch) {
      applySelection(exactMatch);
      return;
    }

    const narrowedResults = filterPincodes(SERVICEABLE_PINCODES, normalizedQuery);
    if (narrowedResults.length === 1 && normalizedQuery.length >= 3) {
      applySelection(narrowedResults[0]);
      return;
    }

    invalidateSelection('Select a valid Hyderabad PIN code from the list to continue.');
  };

  const handleQueryChange = (nextValue: string) => {
    setQuery(normalizePinCodeQuery(nextValue));
    setIsOpen(true);
    setErrorMessage('');

    if (selectedOption) {
      setSelectedOption(null);
      onChange('');
      onSelectPinCode?.(null);
    }
  };

  const handleDesktopInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleQueryChange(event.target.value);
  };

  const handleDesktopInputFocus = () => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
  };

  const handleMobileTrigger = () => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      validatePendingValue();
    }
  };

  const renderLoadingState = () => (
    <div className="space-y-2 p-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-full rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );

  const renderOptions = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center text-sm text-slate-500">
          <Search className="mb-2 h-5 w-5 text-slate-400" />
          <p className="font-medium text-slate-700">No results found</p>
          <p className="mt-1">Try a different Hyderabad PIN code.</p>
        </div>
      );
    }

    return (
      <div className="max-h-72 overflow-y-auto p-2">
        {results.map((option) => {
          const isSelected = option.code === selectedOption?.code;

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => applySelection(option)}
              className={cn(
                'flex w-full items-start justify-between rounded-xl px-3 py-3 text-left transition-colors',
                isSelected ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-wide">{option.code}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {option.city}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-600">{option.area}</div>
                <div className="mt-1 text-xs text-slate-500">{option.state}</div>
              </div>
              {isSelected && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={desktopInputRef}
          type="text"
          value={isMobile ? (selectedOption?.code || query) : query}
          readOnly={isMobile}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          onClick={handleMobileTrigger}
          onFocus={handleDesktopInputFocus}
          onChange={handleDesktopInputChange}
          onBlur={() => {
            if (!isMobile) {
              window.setTimeout(() => validatePendingValue(), 120);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            'h-12 rounded-xl border-slate-300 pr-12 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500',
            hasError && 'border-red-500 focus-visible:ring-red-500',
            inputClassName
          )}
        />
        <button
          type="button"
          onClick={handleMobileTrigger}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500"
          aria-label="Open pincode search"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {selectedAreaLabel && (
        <div className="mt-2 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="leading-5">{selectedAreaLabel}</span>
        </div>
      )}

      {hasError && (
        <Alert className="mt-2 border-red-200 bg-red-50">
          <AlertDescription className="text-sm text-red-700">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {isOpen && !isMobile && dropdownStyle && createPortal(
        <div
          style={dropdownStyle}
          className="max-h-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="border-b border-slate-100 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Search by PIN code
          </div>
          {renderOptions()}
        </div>,
        document.body
      )}

      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/45 sm:hidden"
          onClick={() => {
            setIsOpen(false);
            validatePendingValue();
          }}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200" />
            <div className="space-y-4 px-4 pb-5 pt-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Choose delivery pincode</h3>
                <p className="mt-1 text-sm text-slate-500">Type a Hyderabad PIN code to find your delivery area.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  ref={mobileSearchRef}
                  type="text"
                  value={query}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter PIN code"
                  className="h-12 rounded-xl border-slate-300 pl-11 text-base"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {renderOptions()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PinCodeInput);
