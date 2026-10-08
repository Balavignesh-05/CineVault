import React from 'react';
import { getTrendingTv, getTvTopRated, normalizeSeriesCard } from '@/lib/tmdb/client';
import type { TMDBTvSeries } from '@/lib/tmdb/types';
import { MediaCard } from '@/components/media/MediaCard';
import { Tv } from 'lucide-react';

export const revalidate = 3600;

export default async function SeriesCatalogPage() {
  const trending = await getTrendingTv('week').catch(() => ({ results: [] as TMDBTvSeries[] }));
  const topRated = await getTvTopRated().catch(() => ({ results: [] as TMDBTvSeries[] }));

  // Deduplicate and combine
  const seenIds = new Set<number>();
  const allSeries = [...(trending.results || []), ...(topRated.results || [])].filter(s => {
    if (seenIds.has(s.id)) return false;
    seenIds.add(s.id);
    return true;
  }) as TMDBTvSeries[];

  const cards = allSeries.map(normalizeSeriesCard);

  return (
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <div className="flex items-center gap-3 mb-6 border-b border-white/[0.08] pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Tv className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Popular TV Shows</h1>
            <p className="text-xs text-text-muted mt-0.5">Top trending and highest rated television series</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5">
          {cards.map((series) => (
            <MediaCard key={series.id} media={series} />
          ))}
          {cards.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-surface/50 border border-white/[0.06]">
              <div className="w-14 h-14 rounded-full bg-surface border border-white/10 flex items-center justify-center text-text-muted mb-4 shadow-inner">
                <Tv size={26} className="opacity-60" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">No TV Shows Found</h3>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                We couldn&apos;t load television series right now. Please check back shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
