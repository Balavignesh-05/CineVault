'use client';

import React from 'react';
import { StarRating } from '@/components/rating/StarRating';
import { cn } from '@/lib/utils';

export interface RatingStarsProps {
  /** Value on a 0-10 scale (e.g. from TMDB vote_average) */
  value?: number;
  onChange?: (ratingInTen: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingStars({
  value = 0,
  onChange,
  readonly = true,
  size = 'md',
  className,
}: RatingStarsProps) {
  // Convert 0-10 scale to 0-5 stars
  const fiveScaleValue = value ? value / 2 : 0;

  const handleChange = (newFiveScale: number) => {
    if (onChange) {
      onChange(newFiveScale * 2);
    }
  };

  return (
    <div className={cn('inline-flex items-center', className)}>
      <StarRating
        value={fiveScaleValue}
        onChange={onChange ? handleChange : undefined}
        readOnly={readonly}
        size={size}
        showLabel={false}
        allowHalf={true}
      />
    </div>
  );
}
