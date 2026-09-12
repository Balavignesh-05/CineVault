'use client';

import React from 'react';
import { Film, Clock, Star, Trophy, BarChart3, Heart } from 'lucide-react';

export function CineStatsWidget() {
  const stats = {
    totalFilms: 248,
    hoursWatched: 512,
    favoriteDirector: 'Christopher Nolan',
    averageRating: 4.2,
    ratingDistribution: [
      { stars: '5★', count: 42, percentage: 35 },
      { stars: '4★', count: 98, percentage: 55 },
      { stars: '3★', count: 34, percentage: 20 },
      { stars: '2★', count: 12, percentage: 8 },
      { stars: '1★', count: 2, percentage: 2 },
    ],
  };

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border-subtle space-y-6 shadow-xl text-white">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <BarChart3 className="text-primary" size={20} /> Your Cinema Stats & Diary
        </h3>
        <span className="text-xs font-mono text-primary font-bold">2026 Summary</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-xl bg-background border border-border-subtle space-y-1">
          <Film size={18} className="text-primary mx-auto" />
          <div className="text-2xl font-bold font-mono">{stats.totalFilms}</div>
          <div className="text-[11px] text-text-muted uppercase font-mono">Films Logged</div>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border-subtle space-y-1">
          <Clock size={18} className="text-[#40bcf4] mx-auto" />
          <div className="text-2xl font-bold font-mono">{stats.hoursWatched}h</div>
          <div className="text-[11px] text-text-muted uppercase font-mono">Hours Watched</div>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border-subtle space-y-1">
          <Star size={18} className="text-accent-amber mx-auto" fill="currentColor" />
          <div className="text-2xl font-bold font-mono">{stats.averageRating}★</div>
          <div className="text-[11px] text-text-muted uppercase font-mono">Avg Rating</div>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border-subtle space-y-1">
          <Trophy size={18} className="text-accent-amber mx-auto" />
          <div className="text-sm font-bold truncate text-white pt-1">{stats.favoriteDirector}</div>
          <div className="text-[11px] text-text-muted uppercase font-mono">Top Director</div>
        </div>
      </div>

      {/* Ratings Distribution Histogram */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-mono text-text-secondary flex justify-between">
          <span>Star Rating Histogram</span>
          <span className="text-primary">5-Star Scale</span>
        </div>
        <div className="space-y-1.5">
          {stats.ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs font-mono">
              <span className="w-8 text-accent-amber font-bold">{item.stars}</span>
              <div className="flex-1 h-3 rounded-full bg-background overflow-hidden border border-border-subtle">
                <div
                  className="h-full bg-gradient-to-r from-[#00e054] to-[#40bcf4] rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-text-muted">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
