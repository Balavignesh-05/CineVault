import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTvDetails, normalizeSeriesDetails } from '@/lib/tmdb/client';
import { CastSection } from '@/components/movie/CastSection';
import { CrewSection } from '@/components/movie/CrewSection';
import { SeriesDetailsSection } from '@/components/series/SeriesDetailsSection';
import { WatchProvidersSection } from '@/components/movie/WatchProvidersSection';
import { ReviewsSection } from '@/components/movie/ReviewsSection';
import { SeriesActions } from '@/components/series/SeriesActions';
import { AlertCircle, ArrowLeft, Star, Tv, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SeriesDetailPage({ params }: Props) {
  const { id } = await params;
  const seriesId = Number(id);

  if (isNaN(seriesId)) {
    return (
      <div className="min-h-screen bg-background py-16 text-center text-text-muted">
        Invalid series ID.
      </div>
    );
  }

  let rawSeries: any = null;
  try {
    rawSeries = await getTvDetails(seriesId);
  } catch (err) {
    rawSeries = null;
  }

  if (!rawSeries) {
    return (
      <div className="min-h-screen bg-background py-16 text-white text-center">
        <div className="container mx-auto px-4 max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-error mx-auto opacity-80" />
          <h1 className="text-2xl font-bold">Series Not Found</h1>
          <p className="text-xs text-text-muted">
            We could not find the requested TV series details on TMDB.
          </p>
          <Link
            href="/series"
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft size={14} /> Back to TV Shows
          </Link>
        </div>
      </div>
    );
  }

  const series = normalizeSeriesDetails(rawSeries);
  const backdropUrl = series.backdropPath ? `https://image.tmdb.org/t/p/w1280${series.backdropPath}` : null;
  const posterUrl = series.posterPath ? `https://image.tmdb.org/t/p/w500${series.posterPath}` : null;

  const rawCast = rawSeries.credits?.cast || [];
  const rawCrew = rawSeries.credits?.crew || [];
  const watchProviders = rawSeries['watch/providers']?.results || {};

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      {/* Hero Backdrop */}
      <div className="relative h-[55vh] min-h-[400px] w-full bg-surface overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={series.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-40 relative z-10 space-y-12">
        {/* Main Header Info */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border-subtle bg-surface aspect-[2/3] relative">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={series.title}
                fill
                sizes="(max-width: 768px) 192px, 256px"
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted p-4 text-center">
                No Poster Available
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex-1 pt-4 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {series.title}
              </h1>
              {series.tagline && (
                <p className="text-sm md:text-base text-accent-amber italic mt-1 font-medium">
                  &ldquo;{series.tagline}&rdquo;
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {series.firstAirDate && (
                <span className="px-3 py-1 bg-surface border border-border-subtle text-white font-semibold text-xs rounded-full">
                  {series.firstAirDate.substring(0, 4)}
                </span>
              )}
              {series.numberOfSeasons && (
                <span className="px-3 py-1 bg-surface border border-border-subtle text-text-secondary text-xs rounded-full">
                  {series.numberOfSeasons} {series.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
                </span>
              )}
              {series.genres.map((g) => (
                <span key={g.id} className="px-3 py-1 bg-surface border border-border-subtle text-text-secondary text-xs rounded-full">
                  {g.name}
                </span>
              ))}
              {series.voteAverage > 0 && (
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-full flex items-center gap-1">
                  <Star size={12} className="fill-primary" /> {series.voteAverage.toFixed(1)}
                </span>
              )}
            </div>

            {series.overview && (
              <p className="text-sm md:text-base leading-relaxed text-text-muted max-w-3xl">
                {series.overview}
              </p>
            )}
          </div>
          
          {/* Actions Column */}
          <div className="w-full md:w-auto shrink-0 md:pl-8 pt-4 md:pt-0">
            <SeriesActions
              seriesId={series.id}
              seriesTitle={series.title}
              posterPath={series.posterPath}
              firstAirYear={series.firstAirDate ? parseInt(series.firstAirDate.substring(0, 4)) : undefined}
            />
          </div>
        </div>

        {/* Cast Section */}
        {rawCast.length > 0 && (
          <CastSection cast={rawCast} director={null} />
        )}

        {/* Crew Section */}
        {rawCrew.length > 0 && (
          <CrewSection crew={rawCrew} />
        )}

        {/* Seasons Section */}
        {series.seasons.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Tv className="text-primary" size={22} /> Seasons
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {series.seasons.map((season) => (
                <Link
                  key={season.id}
                  href={`/series/${seriesId}/season/${season.season_number}`}
                  className="group block relative aspect-[2/3] rounded-xl overflow-hidden bg-surface ring-1 ring-border-subtle hover:ring-primary/50 transition-all"
                >
                  {season.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${season.poster_path}`}
                      alt={season.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted p-4 text-center text-xs">
                      {season.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3">
                    <h3 className="font-bold text-white text-xs truncate">{season.name}</h3>
                    <p className="text-text-muted text-[10px]">{season.episode_count} Episodes</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Watch Providers Section */}
        {Object.keys(watchProviders).length > 0 && (
          <WatchProvidersSection providers={watchProviders} movieTitle={series.title} />
        )}

        {/* Series Details Breakdown */}
        <SeriesDetailsSection series={series} />

        {/* Reviews Section */}
        <ReviewsSection 
          tmdbId={series.id} 
          title={series.title} 
          posterPath={series.posterPath} 
          mediaType="tv" 
        />
      </div>
    </div>
  );
}
