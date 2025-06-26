import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from './alert';

// Complete list of serviceable PIN codes based on provided data
const SERVICEABLE_PINCODES = [
  { code: '500001', area: 'Gandhi Bhavan / GPO / Moazzampura, etc.' },
  { code: '500002', area: 'Moghalpura' },
  { code: '500003', area: 'Begumpet Policelines / Secunderabad HO' },
  { code: '500004', area: 'Bazarghat / Khairatabiad HQ' },
  { code: '500005', area: 'CRP Camp / Masab Tank BO' },
  { code: '500006', area: 'Karwan Sahu / Mangalhat SO' },
  { code: '500007', area: 'Adminstrative Buildings / IICT' },
  { code: '500008', area: 'Golconda / Hyder Shah Kote' },
  { code: '500009', area: 'Manovikasnagar / Napier Lines SO' },
  { code: '500010', area: 'Bolaram SO' },
  { code: '500011', area: 'Bowenpally SO' },
  { code: '500012', area: 'Begumbazar SO / Osmania Gen. Hospital' },
  { code: '500013', area: 'Amberpet SO / Seminary BO' },
  { code: '500015', area: 'Jagannandas / EME Records BO' },
  { code: '500016', area: 'Begumpet SO / Prakashnamnagar SO' },
  { code: '500017', area: 'Lallaguda / Lallagpt SO' },
  { code: '500018', area: 'Sanath Nagar / Erragadda SO' },
  { code: '500019', area: 'Lingampalli SO' },
  { code: '500022', area: 'Central Secretariat SO' },
  { code: '500023', area: 'Yakutpura SO' },
  { code: '500024', area: 'Chandanagar / Sahifa SO' },
  { code: '500025', area: 'Himmatnagar SO' },
  { code: '500026', area: 'Mehrunagar SO' },
  { code: '500027', area: 'Barkatpura SO / Nimboliadda SO' },
  { code: '500028', area: 'Humayunnagar / Shantinagar SO' },
  { code: '500029', area: 'Himayathnagar / Ramakrishna Mutt SO' },
  { code: '500030', area: 'Rajendranagar SO / Kamatpur BO' },
  { code: '500031', area: 'Ibrahim Bagh Lines SO' },
  { code: '500033', area: 'Jubilee Hills SO' },
  { code: '500034', area: 'Banjara Hills SO' },
  { code: '500035', area: 'Saroornagar SO' },
  { code: '500036', area: 'Malakpet Colony SO' },
  { code: '500037', area: 'Ramneeddinagar SO' },
  { code: '500038', area: 'Sanjeev Reddy Nagar SO / Vengal Rao Nagar' },
  { code: '500039', area: 'Bodupal SO / Peerzadiguda BO' },
  { code: '500040', area: 'Moulsali SO' },
  { code: '500041', area: 'Raj Bhavan SO' },
  { code: '500042', area: 'Ferozguda SO / New Bowenpally' },
  { code: '500043', area: 'Osmangunj / Sitarambagh / Chudi Bazar' },
  { code: '500044', area: 'Ambernagar / Vidyanagar SO' },
  { code: '500045', area: 'Yousufguda SO / AGS Staff Quarters' },
  { code: '500046', area: 'University of Hyderabad (HCU) / Gachibowli' },
  { code: '500047', area: 'Malakpet SO / Moosarambagh' },
  { code: '500048', area: 'Attapur SO / Hyderguda SO' },
  { code: '500049', area: 'Miyapur SO / Hafeezpet / Huda Colony' },
  { code: '500050', area: 'Chandanagar SO / Beeramguda / Lingampally' },
  { code: '500052', area: 'Hasannagar / SVPMTA SO' },
  { code: '500053', area: 'Falaknuma / Uppuguda SO' },
  { code: '500054', area: 'HMT Township SO' },
  { code: '500055', area: 'IDA Jeedimetla SO / Kutbullapur BO' },
  { code: '500056', area: 'Neredmet SO / Ramakrishna Puram SO' },
  { code: '500057', area: 'Vijay Nagar Colony SO' },
  { code: '500058', area: 'Kanchanbagh SO / Badangpet BO' },
  { code: '500059', area: 'Saidabad SO / Colony' },
  { code: '500060', area: 'Dilsukhnagar Colony / P&T Colony' },
  { code: '500061', area: 'Sitaphalmandi SO' },
  { code: '500062', area: 'ECIL / Dr A S Rao Nagar SO' },
  { code: '500063', area: 'LIC Division SO / New MLA Quarters' },
  { code: '500064', area: 'Bahadurpura SO / Hussainsalam' },
  { code: '500065', area: 'Shahalinanda SO / Fatehdarwaza' },
  { code: '500066', area: 'High Court SO' },
  { code: '500067', area: 'Suchitra Junction SO' },
  { code: '500068', area: 'GSI Bandlaguda SO / Mansorabad' },
  { code: '500069', area: 'R.C. Imar SO' },
  { code: '500070', area: 'Vanasthalipuram SO / Vaidehinagar' },
  { code: '500071', area: 'Rail Nilayam SO' },
  { code: '500072', area: 'Kukatpally SO / Vivekananddnagar' },
  { code: '500073', area: 'Srinagar Colony SO' },
  { code: '500074', area: 'LB Nagar SO / Rangareddy District Court' },
  { code: '500076', area: 'I.E. Nacharam SO / Snehapuri Colony' },
  { code: '500077', area: 'Kattedan I.E. SO' },
  { code: '500079', area: 'Jillellaguda BO / Karmanghat BO / Vaishalinagar SO / Hasthinapuram SO' },
  { code: '500080', area: 'Gandhinagar SO' },
  { code: '500081', area: 'Cyberabad SO / Madhapur BO' },
  { code: '500082', area: 'I.M. Colony / Somajiguda SO' },
  { code: '500083', area: 'Nagaram SO (K.V. Rangareddy)' },
  { code: '500084', area: 'Kothaguda SO / Kondapur BO' },
  { code: '500085', area: 'JNTU Kukatpally SO' },
  { code: '500086', area: 'Don Bosco Nagar SO (Rajendranagar)' },
  { code: '500087', area: 'JJ Nagar Colony SO / Allembylines SO (Jawahar Nagar area)' },
  { code: '500089', area: 'Manikonda SO (also covers Manchirevula BO & Narsingi BO)' },
  { code: '500090', area: 'Nizampet SO / Miyapur BO / Mallampet BO' },
  { code: '500091', area: 'Hydersnhakote SO (serving Hydershakote, Kapla Nagar Colony, AV Enclave, etc.) and AP Police Academy' },
  { code: '500092', area: 'Boduppal SO' },
  { code: '500093', area: 'Vikasnagar SO' },
  { code: '500094', area: 'Sainikpuri SO' },
  { code: '500095', area: 'Putlibowli SO and SBI SO' },
  { code: '500096', area: 'Film Nagar SO' },
  { code: '500097', area: 'Meerpet SO and Gayathrinagar SO' },
  { code: '500098', area: 'Medipalli SO' },
  { code: '500100', area: 'Kompally SO, Doolapalli BO, Pochampally BO' },
  { code: '500102', area: 'Rama Krishnapuram SO' },
  { code: '500103', area: 'saket, Sainlakpuri' },
  { code: '500104', area: 'Chitrapuri Colony SO' }
];

interface PinCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean, message?: string) => void;
}

const PinCodeInput: React.FC<PinCodeInputProps> = ({
  value,
  onChange,
  placeholder = "Enter PIN code",
  required = false,
  className,
  onValidationChange
}) => {
  const [open, setOpen] = useState(false);
  const [filteredCodes, setFilteredCodes] = useState<typeof SERVICEABLE_PINCODES>([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter PIN codes based on input
  useEffect(() => {
    if (value) {
      const filtered = SERVICEABLE_PINCODES.filter(pincode =>
        pincode.code.startsWith(value) || 
        pincode.area.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCodes(filtered);
      
      // Check if the entered value is valid
      const exactMatch = SERVICEABLE_PINCODES.find(pincode => pincode.code === value);
      
      if (value.length >= 6) {
        if (!exactMatch) {
          setShowError(true);
          setErrorMessage("Sorry, we don't deliver to this PIN code yet. We currently only serve specific areas in Hyderabad.");
          onValidationChange?.(false, "Invalid PIN code for delivery");
        } else {
          setShowError(false);
          setErrorMessage('');
          onValidationChange?.(true);
        }
      } else {
        setShowError(false);
        setErrorMessage('');
        onValidationChange?.(true);
      }
    } else {
      setFilteredCodes([]);
      setShowError(false);
      setErrorMessage('');
      onValidationChange?.(true);
    }
  }, [value, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (inputValue.length <= 6) {
      onChange(inputValue);
      if (inputValue.length > 0 && filteredCodes.length > 0) {
        setOpen(true);
      }
    }
  };

  const handlePinCodeSelect = (pincode: string) => {
    onChange(pincode);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open && value.length > 0 && filteredCodes.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              required={required}
              className={cn(
                "w-full",
                showError && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              onFocus={() => {
                if (value.length > 0 && filteredCodes.length > 0) {
                  setOpen(true);
                }
              }}
            />
            {value.length > 0 && filteredCodes.length > 0 && (
              <ChevronsUpDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              {filteredCodes.length === 0 ? (
                <CommandEmpty>No PIN codes found</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredCodes.slice(0, 10).map((pincode) => (
                    <CommandItem
                      key={pincode.code}
                      value={pincode.code}
                      onSelect={() => handlePinCodeSelect(pincode.code)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === pincode.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{pincode.code}</span>
                        <span className="text-sm text-gray-500">{pincode.area}</span>
                      </div>
                    </CommandItem>
                  ))}
                  {filteredCodes.length > 10 && (
                    <div className="px-2 py-1 text-xs text-gray-500">
                      +{filteredCodes.length - 10} more results...
                    </div>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {showError && (
        <Alert className="mt-2 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700 text-sm">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PinCodeInput; 