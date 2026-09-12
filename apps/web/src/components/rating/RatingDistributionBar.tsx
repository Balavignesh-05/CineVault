'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RatingDistribution {
  rating: number;
  count: number;
}

interface RatingDistributionBarProps {
  distribution: RatingDistribution[];
  totalCount: number;
}

export function RatingDistributionBar({ distribution, totalCount }: RatingDistributionBarProps) {
  // Simplify to 5 bars for 1 to 5 stars
  const bars = [1, 2, 3, 4, 5].map(star => {
    const count = distribution.filter(d => Math.ceil(d.rating) === star).reduce((acc, curr) => acc + curr.count, 0);
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
    return { star, count, percentage };
  }).reverse(); // Show 5 stars at top

  return (
    <div className="flex flex-col gap-1 w-full max-w-sm">
      <TooltipProvider>
        {bars.map((bar) => (
          <div key={bar.star} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-4 text-right">{bar.star}</span>
            <span className="text-accent-amber">★</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-accent-amber"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{bar.count} ratings ({bar.percentage.toFixed(1)}%)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </TooltipProvider>
    </div>
  );
}
