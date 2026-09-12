import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tv, Film, ArrowLeft, AlertCircle } from 'lucide-react';
import { discoverMovies, normalizeMovieCard, getProviderDetailsById } from '@/lib/tmdb/client';
import { getProviderInfo } from '@/lib/tmdb/providers';
import { MediaCard } from '@/components/media/MediaCard';

interface Props {
  params: Promise<{ providerId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function StreamingPage({ params }: Props) {
  const { providerId } = await params;
  const numId = Number(providerId);

  // 1. Resolve Provider details from TMDB dynamically
  const tmdbProvider = await getProviderDetailsById(providerId).catch(() => null);
  const staticProvider = getProviderInfo(providerId);

  const providerName = tmdbProvider?.provider_name || staticProvider.name;
  const logoPath = tmdbProvider?.logo_path || staticProvider.logoPath;
  const description = staticProvider.description || `Discover top-rated movies and series available to stream on ${providerName}.`;

  let movies: any[] = [];
  let errorMsg: string | null = null;

  try {
    // 2. Fetch movies for this provider from TMDB
    let res = await discoverMovies({
      with_watch_providers: String(providerId),
      watch_region: 'US',
      sort_by: 'popularity.desc',
    }).catch(() => ({ results: [] }));

    // Fall back to no region filter if US returns empty (e.g. global/regional providers)
    if (!res.results || res.results.length === 0) {
      res = await discoverMovies({
        with_watch_providers: String(providerId),
        sort_by: 'popularity.desc',
      }).catch(() => ({ results: [] }));
    }

    movies = (res.results || []).map(normalizeMovieCard);
  } catch (err: any) {
    errorMsg = err?.message || 'Failed to fetch movies from TMDB for this streaming provider.';
  }

  return (
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8 pb-20">
      <div className="container mx-auto px-4 max-w-7xl space-y-6">
        
        {/* Back link */}
        <Link
          href="/discovery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Discover
        </Link>

        {/* Provider Header Banner */}
        <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative">
              {logoPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${logoPath}`}
                  alt={providerName}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Tv className="w-7 h-7 text-primary" />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {providerName}
              </h1>
              <p className="text-xs md:text-sm text-text-muted max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-elevated border border-border-subtle text-xs font-semibold text-text-secondary whitespace-nowrap">
            {movies.length > 0 ? `${movies.length} Movies Available` : 'Streaming Catalog'}
          </div>
        </div>

        {/* Error State */}
        {errorMsg ? (
          <div className="p-8 rounded-2xl bg-surface border border-border-subtle text-center space-y-3 my-8">
            <AlertCircle className="w-10 h-10 text-error mx-auto opacity-80" />
            <h2 className="text-lg font-bold text-white">Unable to load catalog</h2>
            <p className="text-xs text-text-muted max-w-md mx-auto">{errorMsg}</p>
            <Link
              href="/discovery"
              className="inline-block px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary-hover transition-colors mt-2"
            >
              Return to Discovery
            </Link>
          </div>
        ) : movies.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-2xl bg-surface border border-border-subtle text-center space-y-3 my-8">
            <Film className="w-12 h-12 text-text-muted opacity-30 mx-auto" />
            <h2 className="text-lg font-bold text-white">No movies found</h2>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              No movies currently listed for {providerName} in this region. Explore other streaming services or genres on CineVault.
            </p>
            <Link
              href="/discovery"
              className="inline-block px-4 py-2 rounded-xl bg-surface border border-border-subtle text-xs font-semibold text-text-secondary hover:text-white hover:border-primary transition-all mt-2"
            >
              Browse Other Services
            </Link>
          </div>
        ) : (
          /* Movies Grid */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Movies on {providerName}</h2>
              <span className="text-xs text-text-muted">Sorted by popularity</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {movies.map((movie) => (
                <MediaCard key={movie.id} media={movie} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
