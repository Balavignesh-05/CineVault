'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface MovieRatingsCardProps {
  voteAverage: number;
  voteCount: number;
  popularity?: number;
}

function formatFans(num: number): string {
  if (!num) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toString();
}

export function MovieRatingsCard({
  voteAverage = 0,
  voteCount = 0,
  popularity = 0,
}: MovieRatingsCardProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Convert 10-point scale to 5-star scale
  const averageFive = voteAverage > 0 ? (voteAverage / 2).toFixed(1) : '—';
  const numericFive = voteAverage > 0 ? voteAverage / 2 : 0;

  // Generate simulated realistic distribution centered around the average
  const avgRound = Math.round(voteAverage);
  const totalVotes = Math.max(voteCount, 100);

  const bars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => {
    const diff = Math.abs(rating - avgRound);
    // Gaussian-like falloff
    const rawWeight = Math.max(3, 100 - diff * 22 + (rating >= 7 ? 8 : 0));
    return {
      step: rating,
      stars: (rating / 2).toFixed(rating % 2 === 0 ? 0 : 1),
      weight: Math.min(100, Math.round(rawWeight)),
    };
  });

  const maxWeight = Math.max(...bars.map((b) => b.weight));
  const fansCount = Math.max(Math.round(voteCount * 0.18), Math.round(popularity * 4));

  const activeBarData = hoveredBar
    ? bars.find((b) => b.step === hoveredBar)
    : null;

  return (
    <div className="bg-[#131A22] border border-[#273442] rounded-2xl p-5 space-y-3.5 shadow-xl text-[#F4F3EC]">
      {/* Header */}
      <div className="flex items-center justify-between text-[11px] font-black tracking-[0.14em] uppercase border-b border-[#273442]/60 pb-2">
        <span className="text-[#9AA8B7]">Ratings</span>
        {fansCount > 0 && (
          <span className="text-[#35D6A0] font-bold">
            {formatFans(fansCount)} Fans
          </span>
        )}
      </div>

      {/* Tooltip / Active bar indicator */}
      <div className="h-4 flex items-center justify-between text-[11px]">
        {activeBarData ? (
          <span className="text-[#35D6A0] font-semibold">
            {Math.round((activeBarData.weight / maxWeight) * (totalVotes / 10)).toLocaleString()} ratings for {activeBarData.stars} ★
          </span>
        ) : (
          <span className="text-[#9AA8B7] text-[10px]">
            {voteCount > 0 ? `${voteCount.toLocaleString()} total community ratings` : 'Community score'}
          </span>
        )}
      </div>

      {/* Histogram bars */}
      <div 
        className="flex items-end gap-1.5 h-16 pt-1 px-1"
        onMouseLeave={() => setHoveredBar(null)}
        role="img"
        aria-label="Rating distribution histogram"
      >
        {bars.map(({ step, weight }) => {
          const heightPercent = Math.max(10, Math.round((weight / maxWeight) * 100));
          const isHovered = hoveredBar === step;
          return (
            <div
              key={step}
              onMouseEnter={() => setHoveredBar(step)}
              className="flex-1 h-full flex items-end group cursor-pointer"
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-sm transition-all duration-150 ${
                  isHovered
                    ? 'bg-[#35D6A0] shadow-[0_0_8px_rgba(53,214,160,0.5)]'
                    : 'bg-[#273442] group-hover:bg-[#3B4D61]'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Footer: Average rating + Stars */}
      <div className="flex items-center justify-between pt-1 border-t border-[#273442]/60">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {averageFive}
          </span>
          <span className="text-xs text-[#9AA8B7]">/ 5</span>
        </div>

        {/* 5-star preview */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => {
            const fillPct = Math.max(0, Math.min(1, numericFive - (s - 1)));
            return (
              <div key={s} className="relative w-3.5 h-3.5">
                <Star size={14} className="text-[#273442] fill-transparent" />
                {fillPct > 0 && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${fillPct * 100}%` }}
                  >
                    <Star size={14} className="text-[#35D6A0] fill-[#35D6A0]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
