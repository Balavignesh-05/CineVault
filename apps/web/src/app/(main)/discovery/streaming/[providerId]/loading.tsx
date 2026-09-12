import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StreamingLoading() {
  return (
    <div className="min-h-screen bg-background py-6 md:py-8 pb-20">
      <div className="container mx-auto px-4 max-w-7xl space-y-6">
        {/* Back Link Skeleton */}
        <Skeleton className="h-4 w-32 rounded bg-white/10" />

        {/* Provider Banner Skeleton */}
        <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 bg-white/10 rounded" />
              <Skeleton className="h-4 w-72 bg-white/5 rounded" />
            </div>
          </div>
          <Skeleton className="h-7 w-36 rounded-full bg-white/10" />
        </div>

        {/* Grid Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 bg-white/10 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
