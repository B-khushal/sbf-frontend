import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue?: (val: string) => void;
  shortcutHint?: string;
  containerClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onChangeValue,
  shortcutHint = '⌘K',
  containerClassName,
  className,
  placeholder = 'Search...',
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (onChangeValue) {
      onChangeValue('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={cn(
        'sbf-neumo-input relative flex items-center w-full max-w-md h-10 px-3.5 transition-all duration-200 group',
        containerClassName
      )}
    >
      <Search className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors shrink-0 mr-2.5" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange?.(e);
          onChangeValue?.(e.target.value);
        }}
        placeholder={placeholder}
        className={cn(
          'w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium',
          className
        )}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors shrink-0 ml-1"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : shortcutHint ? (
        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 bg-slate-200/50 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/40 shrink-0 ml-1">
          {shortcutHint}
        </span>
      ) : null}
    </div>
  );
};

export default SearchInput;
