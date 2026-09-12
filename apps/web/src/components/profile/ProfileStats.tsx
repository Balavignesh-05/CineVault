'use client';

import React from 'react';
import { UserStats } from '@cinevault/shared-types';

interface ProfileStatsProps {
  stats: UserStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    { label: 'Films', value: stats.moviesWatched },
    { label: 'Reviews', value: stats.reviewsWritten },
    { label: 'Collections', value: stats.collectionsCreated },
    { label: 'Following', value: stats.followingCount },
    { label: 'Followers', value: stats.followersCount },
  ];

  return (
    <div className="flex justify-between items-center bg-bg-surface border-y md:border md:rounded-lg border-border-subtle overflow-x-auto scrollbar-hide py-4 px-2 md:px-6 divide-x divide-border-subtle">
      {statItems.map((stat, i) => (
        <div key={i} className="flex flex-col items-center flex-1 px-4 min-w-[80px]">
          <span className="text-2xl font-bold text-text-primary mb-1">{stat.value}</span>
          <span className="text-xs text-text-muted uppercase tracking-wider">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
