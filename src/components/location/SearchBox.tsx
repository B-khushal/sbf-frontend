import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchAddress, getPlaceDetails } from '@/services/mappls.service';
import { AutocompleteSuggestion } from '@/types/location';
import { cn } from '@/lib/utils';

interface SearchBoxProps {
  onLocationSelect: (lat: number, lng: number, addressText: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onLocationSelect,
  placeholder = 'Search delivery address...',
  className,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search logic
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchAddress(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching autocomplete:', error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = async (suggestion: AutocompleteSuggestion) => {
    setQuery(suggestion.placeName);
    setShowDropdown(false);
    setSuggestions([]);
    setLoading(true);

    try {
      // Resolve eLoc coordinates using getPlaceDetails
      const coords = await getPlaceDetails(suggestion.eLoc);
      onLocationSelect(coords.latitude, coords.longitude, suggestion.placeAddress || suggestion.placeName);
    } catch (error) {
      console.error('Error resolving eLoc details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full z-[1000]", className)} ref={dropdownRef}>
      <div className="relative flex items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all duration-300">
        <Search className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-12 border-0 bg-transparent rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
        {loading && (
          <div className="absolute right-12">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          </div>
        )}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {showDropdown && (query.trim().length >= 3 || suggestions.length > 0) && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/80 dark:border-slate-850/80 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {loading && suggestions.length === 0 ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center animate-pulse">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="p-2 space-y-0.5" role="listbox">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl cursor-pointer select-none transition-all duration-150",
                    index === activeIndex
                      ? "bg-slate-100/80 dark:bg-slate-800/85 text-emerald-600 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-850/50"
                  )}
                >
                  <MapPin className="h-5 w-5 mt-0.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm line-clamp-1">{suggestion.placeName}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                      {suggestion.placeAddress}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            query.trim().length >= 3 && !loading && (
              <div className="p-6 text-center text-sm text-slate-450 dark:text-slate-500">
                No matching addresses found.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
