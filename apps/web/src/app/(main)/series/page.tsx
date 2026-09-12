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
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Tv className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black text-white">Popular Series</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {cards.map((series) => (
            <MediaCard key={series.id} media={series} />
          ))}
          {cards.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-muted">
              No series found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
