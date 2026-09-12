import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft, AlertCircle, Film } from 'lucide-react';
import { discoverMovies, normalizeMovieCard } from '@/lib/tmdb/client';
import { MediaCard } from '@/components/media/MediaCard';

export const revalidate = 3600;

interface Props {
  params: Promise<{ decade: string }>;
}

export default async function DecadePage({ params }: Props) {
  const { decade } = await params;
  const year = Number(decade) || 2020;

  let movies: any[] = [];
  let errorMsg: string | null = null;

  try {
    const data = await discoverMovies({
      'primary_release_date.gte': `${year}-01-01`,
      'primary_release_date.lte': `${year + 9}-12-31`,
      sort_by: 'vote_average.desc',
      'vote_count.gte': 100,
    });
    movies = (data.results || []).map(normalizeMovieCard);
  } catch (err: any) {
    errorMsg = err?.message || 'Failed to fetch movies for this decade.';
  }

  return (
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8 pb-20">
      <div className="container mx-auto px-4 max-w-7xl space-y-6">
        
        <Link
          href="/discovery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Discover
        </Link>

        <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" /> {year}s Cinema
            </h1>
            <p className="text-xs md:text-sm text-text-muted">
              Discover top-rated movies released between {year} and {year + 9}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-elevated border border-border-subtle text-xs font-semibold text-text-secondary whitespace-nowrap">
            {movies.length} Movies
          </span>
        </div>

        {errorMsg ? (
          <div className="p-8 rounded-2xl bg-surface border border-border-subtle text-center space-y-3 my-8">
            <AlertCircle className="w-10 h-10 text-error mx-auto opacity-80" />
            <h2 className="text-lg font-bold text-white">Unable to load decade catalog</h2>
            <p className="text-xs text-text-muted">{errorMsg}</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="p-12 rounded-2xl bg-surface border border-border-subtle text-center space-y-3 my-8">
            <Film className="w-10 h-10 text-text-muted opacity-30 mx-auto" />
            <h2 className="text-lg font-bold text-white">No movies found</h2>
            <p className="text-xs text-text-muted">No movies found for the {year}s decade.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {movies.map((movie) => (
              <MediaCard key={movie.id} media={movie} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
