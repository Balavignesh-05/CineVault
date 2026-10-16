'use client';

import React, { useState, useId } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StarRatingProps {
  /** Current rating value (0 to 5) */
  value: number;
  /** Callback when rating changes */
  onChange?: (rating: number) => void;
  /** Read-only display mode */
  readOnly?: boolean;
  /** Allow half-star increments (0.5, 1.0, 1.5, ... 5.0) */
  allowHalf?: boolean;
  /** Visual size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show rating text next to the stars (e.g. "4.5" or "Not rated") */
  showLabel?: boolean;
  /** Optional custom class name for the wrapper */
  className?: string;
  /** Accessible label prefix */
  ariaLabel?: string;
}

const SIZES = {
  sm: {
    star: 'w-4 h-4',
    box: 'w-5 h-5',
    text: 'text-xs',
    gap: 'gap-1',
  },
  md: {
    star: 'w-5 h-5 sm:w-6 sm:h-6',
    box: 'w-6 h-6 sm:w-7 sm:h-7',
    text: 'text-xs sm:text-sm',
    gap: 'gap-1 sm:gap-1.5',
  },
  lg: {
    star: 'w-7 h-7 sm:w-8 sm:h-8',
    box: 'w-8 h-8 sm:w-9 sm:h-9',
    text: 'text-sm sm:text-base',
    gap: 'gap-1.5 sm:gap-2',
  },
};

export function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  allowHalf = true,
  size = 'md',
  showLabel = true,
  className,
  ariaLabel = 'Rating',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const baseId = useId();

  // Active value is either hover state or the committed value
  const activeRating = hoverRating !== null ? hoverRating : value;
  const config = SIZES[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
    if (readOnly || !onChange) return;
    if (!allowHalf) {
      setHoverRating(starIndex);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    setHoverRating(isLeftHalf ? starIndex - 0.5 : starIndex);
  };

  const handleClick = (starIndex: number, isLeftHalf: boolean) => {
    if (readOnly || !onChange) return;
    const nextRating = allowHalf && isLeftHalf ? starIndex - 0.5 : starIndex;
    // Clicking the current rating toggles it off (clears)
    if (nextRating === value) {
      onChange(0);
    } else {
      onChange(nextRating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (readOnly || !onChange) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(5, (value || 0) + (allowHalf ? 0.5 : 1));
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(0, (value || 0) - (allowHalf ? 0.5 : 1));
      onChange(prev);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(starIndex, false);
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center flex-nowrap shrink-0 select-none',
        config.gap,
        className
      )}
      role="radiogroup"
      aria-label={ariaLabel}
      onMouseLeave={() => !readOnly && setHoverRating(null)}
    >
      <div className={cn('flex items-center flex-nowrap shrink-0', config.gap)}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = activeRating >= starIndex;
          const isHalf = !isFull && activeRating >= starIndex - 0.5;
          const isEmpty = !isFull && !isHalf;

          return (
            <button
              key={starIndex}
              type="button"
              id={`${baseId}-star-${starIndex}`}
              disabled={readOnly}
              aria-label={`${starIndex} of 5 stars`}
              aria-checked={value === starIndex || value === starIndex - 0.5}
              role={readOnly ? undefined : 'radio'}
              tabIndex={readOnly ? -1 : 0}
              onMouseMove={(e) => handleMouseMove(e, starIndex)}
              onClick={(e) => {
                if (allowHalf) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isLeft = e.clientX - rect.left < rect.width / 2;
                  handleClick(starIndex, isLeft);
                } else {
                  handleClick(starIndex, false);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, starIndex)}
              className={cn(
                'relative flex items-center justify-center p-0 m-0 shrink-0 border-0 bg-transparent rounded-sm transition-transform focus:outline-none focus-visible:ring-1 focus-visible:ring-[#35D6A0]',
                config.box,
                !readOnly && 'cursor-pointer hover:scale-110 active:scale-95'
              )}
            >
              {/* Base empty star */}
              <Star
                className={cn(
                  config.star,
                  'transition-colors shrink-0 stroke-[1.75]',
                  isEmpty
                    ? 'text-[#273442] fill-transparent stroke-[#3B4D61]'
                    : 'text-[#35D6A0] stroke-[#35D6A0]'
                )}
              />

              {/* Half-star clipped overlay */}
              {isHalf && (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                >
                  <Star
                    className={cn(
                      config.star,
                      'shrink-0 stroke-[1.75] fill-[#35D6A0] text-[#35D6A0] stroke-[#35D6A0]'
                    )}
                  />
                </div>
              )}

              {/* Full star overlay */}
              {isFull && (
                <Star
                  className={cn(
                    'absolute inset-0 m-auto pointer-events-none shrink-0 stroke-[1.75] fill-[#35D6A0] text-[#35D6A0] stroke-[#35D6A0]',
                    config.star
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span
          className={cn(
            'font-bold tabular-nums min-w-[3.5rem] tracking-tight ml-1 text-left shrink-0',
            config.text,
            activeRating > 0 ? 'text-[#35D6A0]' : 'text-[#9AA8B7]'
          )}
        >
          {activeRating > 0 ? `${activeRating.toFixed(1)} ★` : 'Not rated'}
        </span>
      )}
    </div>
  );
}
