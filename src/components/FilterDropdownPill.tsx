import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownPillProps {
  label: string;
  icon?: React.ReactNode;
  options: FilterOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const FilterDropdownPill: React.FC<FilterDropdownPillProps> = ({
  label,
  icon,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Get selected option label
  const selectedLabel = selectedValue
    ? options.find(opt => opt.value === selectedValue)?.label
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if clicked on pill button
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      
      // Check if clicked on pill wrapper (relative container)
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      
      // Check if clicked on portal dropdown
      if (portalRef.current && portalRef.current.contains(target)) {
        return;
      }
      
      // Close on any other click
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block flex-shrink-0 z-auto', className)} ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Filter Pill Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
          'bg-white border border-gray-300 text-gray-700 transition-all duration-200',
          'hover:border-primary hover:text-primary hover:shadow-sm',
          'active:scale-95',
          selectedValue && 'border-primary bg-gradient-to-r from-primary/10 to-pink-600/10 text-primary',
          isOpen && 'border-primary shadow-md'
        )}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1 text-left">
          {selectedLabel ? (
            <>
              <span className="text-xs text-gray-500">{label}</span>
              <div className="text-sm font-medium">{selectedLabel}</div>
            </>
          ) : (
            label
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'flex-shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu - Using React Portal to escape clipping parents */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 md:hidden"
            onClick={() => setIsOpen(false)}
            style={{ zIndex: 9998 }}
          />
          
          {/* Desktop Dropdown - Rendered via Portal */}
          {typeof window !== 'undefined' && createPortal(
            <div
              ref={portalRef}
              className={cn(
                'fixed bg-white rounded-lg shadow-2xl',
                'border border-gray-200 min-w-max',
                'hidden md:block',
                'animate-in fade-in slide-in-from-top-2 duration-200'
              )}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 99999,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-150',
                    'hover:bg-gray-50 active:bg-gray-100',
                    selectedValue === option.value && 'bg-primary/10 text-primary font-semibold'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {selectedValue === option.value && (
                      <span className="text-primary text-lg">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>,
            document.body
          )}

          {/* Mobile Bottom Sheet Dropdown */}
          <div
            className={cn(
              'fixed bottom-0 left-0 right-0 md:hidden',
              'bg-white rounded-t-2xl shadow-2xl',
              'animate-in slide-in-from-bottom-4 duration-300',
              'max-h-[60vh] overflow-y-auto'
            )}
            style={{ zIndex: 99999 }}
          >
            {/* Mobile Header */}
            <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800">{label}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Mobile Options */}
            <div className="px-4 py-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-4 py-3 mb-2 rounded-lg text-left font-medium transition-all duration-150',
                    'active:scale-95 active:bg-primary/20',
                    selectedValue === option.value
                      ? 'bg-gradient-to-r from-primary to-pink-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {selectedValue === option.value && (
                      <span className="text-xl">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Mobile Footer Spacing */}
            <div className="h-4" />
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdownPill;
