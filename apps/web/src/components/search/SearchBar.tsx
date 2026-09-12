'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search for movies...',
  autoFocus = false,
  className,
  isLoading = false,
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

  return (
    <motion.div 
      className={cn("relative group w-full", className)}
      initial={false}
      animate={{ 
        boxShadow: isFocused ? '0 0 0 2px var(--color-accent-primary)' : '0 0 0 1px #3D3D55',
      }}
      transition={{ duration: 0.2 }}
      style={{ borderRadius: '0.75rem' }}
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className={cn(
          "w-5 h-5 transition-colors duration-200", 
          isFocused ? "text-[var(--color-accent-primary)]" : "text-muted-foreground"
        )} />
      </div>
      
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-12 pr-12 py-6 text-lg bg-[var(--color-bg-surface)] border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl"
      />
      
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className="w-5 h-5 animate-spin text-[var(--color-accent-primary)]" />
            </motion.div>
          )}
          
          {!isLoading && value && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-[var(--color-bg-elevated)] rounded-full"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            </motion.div>
          )}
          
          {!value && !isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden sm:flex items-center justify-center px-2 py-1 bg-[var(--color-bg-elevated)] border border-[#3D3D55] rounded text-xs text-muted-foreground font-medium pointer-events-none"
            >
              ⌘K
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
