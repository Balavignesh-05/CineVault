'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  isLoading?: boolean;
  id?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search films, people, members…',
  autoFocus = false,
  className,
  isLoading = false,
  id = 'search-bar-input',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    if (onClear) onClear();
    else onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit) onSubmit(value.trim());
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
      setIsFocused(false);
    }
  };

  return (
    <div
      className={cn(
        'relative group w-full transition-all duration-200 rounded-xl',
        isFocused
          ? 'ring-2 ring-[#35D6A0] border-[#35D6A0] shadow-[0_0_20px_rgba(53,214,160,0.15)]'
          : 'border border-[#273442] hover:border-[#3B4D61]',
        className
      )}
    >
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
        <Search
          className={cn(
            'w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200',
            isFocused ? 'text-[#35D6A0]' : 'text-[#6B7D90]'
          )}
        />
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
        className="w-full pl-10 sm:pl-12 pr-16 sm:pr-20 py-2.5 sm:py-3 text-sm sm:text-base bg-[#131A22] text-[#F4F3EC] placeholder:text-[#6B7D90] rounded-xl outline-none transition-colors border-none"
        autoComplete="off"
        spellCheck="false"
      />

      {/* Right Controls */}
      <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center gap-1.5 sm:gap-2">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <Loader2 className="w-4 h-4 animate-spin text-[#35D6A0]" />
            </motion.div>
          )}

          {!isLoading && value && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#9AA8B7] hover:text-[#F4F3EC] hover:bg-[#1A2430] rounded-full"
                onClick={handleClear}
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          )}

          {!value && !isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden sm:flex items-center justify-center px-1.5 py-0.5 bg-[#1A2430] border border-[#273442] rounded text-[10px] text-[#6B7D90] font-mono font-medium pointer-events-none"
            >
              ⌘K
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
