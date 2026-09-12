import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PersonLoading() {
  return (
    <div className="min-h-screen bg-background py-6 md:py-8 pb-20">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">
        {/* Back Link Skeleton */}
        <Skeleton className="h-4 w-32 rounded bg-white/10" />

        {/* Profile Header Skeleton */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Skeleton className="w-44 sm:w-52 md:w-64 aspect-[2/3] shrink-0 rounded-2xl bg-white/10 mx-auto md:mx-0" />

          <div className="flex-1 space-y-4 w-full">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
              <Skeleton className="h-10 w-72 bg-white/10 rounded" />
            </div>

            <div className="flex flex-wrap gap-4 border-y border-border-subtle py-3">
              <Skeleton className="h-4 w-36 rounded bg-white/5" />
              <Skeleton className="h-4 w-40 rounded bg-white/5" />
              <Skeleton className="h-4 w-32 rounded bg-white/5" />
            </div>

            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-24 bg-white/10 rounded" />
              <Skeleton className="h-4 w-full bg-white/5 rounded" />
              <Skeleton className="h-4 w-full bg-white/5 rounded" />
              <Skeleton className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
          </div>
        </div>

        {/* Filmography Grid Skeleton */}
        <div className="space-y-4 pt-6">
          <Skeleton className="h-6 w-48 bg-white/10 rounded" />
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
